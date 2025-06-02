import { useEffect, useRef, useState } from "react";
import socket from "../lib/socket";
import axios from "axios";

export default function ChatBox({ matchId, user, onExit }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [partnerLeft, setPartnerLeft] = useState(false);
  const endRef = useRef();

  // 나가기 핸들러
  const handleExit = async () => {
    await axios.post("/api/close-match", { matchId });
    socket.emit("leave", { matchId, email: user.email });
    if (onExit) onExit();
  };

  // 메시지 불러오기
  useEffect(() => {
    async function loadMessages() {
      const res = await axios.get("/api/chat", { params: { matchId } });
      setMessages(res.data.messages || []);
    }
    if (matchId) loadMessages();
  }, [matchId]);

  // 소켓 연결
  useEffect(() => {
    if (!socket) return;
    socket.emit("join", { matchId, email: user.email });

    const onMessage = (msg) => setMessages((prev) => [...prev, msg]);
    const onPartnerLeft = () => {
      setMessages((prev) => [
        ...prev,
        { system: true, text: "상대가 채팅방을 나갔어요." }
      ]);
      setPartnerLeft(true);
      // 3초 뒤 자동 메인 복귀
      setTimeout(() => {
        if (onExit) onExit();
      }, 3000);
    };

    socket.on("message", onMessage);
    socket.on("partner-left", onPartnerLeft);

    return () => {
      socket.emit("leave", { matchId, email: user.email });
      socket.off("message", onMessage);
      socket.off("partner-left", onPartnerLeft);
    };
  }, [matchId, user.email, onExit]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 메시지 전송
  const send = async () => {
    if (!input || !socket || partnerLeft) return;
    await axios.post("/api/chat", {
      matchId,
      user: user.name,
      text: input,
    });
    socket.emit("message", {
      matchId,
      user: user.name,
      text: input,
      time: new Date(),
    });
    setInput("");
  };

  return (
    <div style={{
      border: "1px solid #eee",
      borderRadius: "20px",
      background: "rgba(255,255,255,0.95)",
      width: 500,
      margin: "60px auto",
      padding: 32,
      boxShadow: "0 4px 32px rgba(0,0,0,0.1)",
      position: "relative"
    }}>
      <button
        onClick={handleExit}
        style={{
          position: "absolute",
          top: 16,
          right: 24,
          background: "#f25767",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "4px 16px",
          fontWeight: 700,
          fontSize: 15,
          cursor: "pointer",
          boxShadow: "0 1px 2px rgba(0,0,0,0.06)"
        }}>
        채팅방 나가기
      </button>
      <div style={{
        height: 240,
        overflowY: "auto",
        background: "#f7fafd",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12
      }}>
        {messages.map((msg, i) =>
          msg.system ? (
            <div key={i} style={{
              textAlign: "center",
              color: "#f25767",
              fontSize: 15,
              margin: "10px 0"
            }}>{msg.text}</div>
          ) : (
            <div key={i} style={{ margin: "8px 0" }}>
              <span style={{ fontWeight: "bold", color: "#30a" }}>{msg.user}</span>
              <span style={{ marginLeft: 8 }}>{msg.text}</span>
            </div>
          )
        )}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex" }}>
        <input
          disabled={partnerLeft}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          style={{
            flex: 1,
            borderRadius: 8,
            border: "1px solid #ccc",
            padding: "8px 12px",
            marginRight: 8
          }}
        />
        <button
          onClick={send}
          disabled={partnerLeft}
          style={{
            background: "#6e47fa",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "8px 20px",
            fontWeight: "bold"
          }}
        >
          보내기
        </button>
      </div>
    </div>
  );
}