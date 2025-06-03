import { useState, useEffect, useRef } from "react";
import socket from "@/lib/socket-client";

export default function ChatBox({ matchId, myName }) {
  if (!socket) return <div>채팅 서버 연결 중...</div>;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [partnerJoined, setPartnerJoined] = useState(false);
  const [systemMsg, setSystemMsg] = useState("상대방을 기다리는 중...");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!matchId) return;
    console.log(`[ChatBox mount] matchId: ${matchId}`);

    socket.emit("joinRoom", { matchId });

    function onChatHistory(msgs) {
      setMessages(msgs || []);
    }
    function onReceiveMsg(msg) {
      setMessages(prev => [...prev, msg]);
    }
    function onPartnerJoin() {
      setPartnerJoined(true);
      setSystemMsg("상대방이 입장했습니다!");
      setTimeout(() => setSystemMsg(""), 1200);
    }
    function onPartnerLeft() {
      setPartnerJoined(false);
      setSystemMsg("상대방이 퇴장했습니다. 기다리는 중...");
    }

    socket.on("chatHistory", onChatHistory);
    socket.on("receiveMessage", onReceiveMsg);
    socket.on("partner-joined", onPartnerJoin);
    socket.on("partner-left", onPartnerLeft);

    setPartnerJoined(false);
    setSystemMsg("상대방을 기다리는 중...");

    return () => {
      socket.emit("leaveRoom", { matchId });
      socket.off("chatHistory", onChatHistory);
      socket.off("receiveMessage", onReceiveMsg);
      socket.off("partner-joined", onPartnerJoin);
      socket.off("partner-left", onPartnerLeft);
    };
  }, [matchId]);

  // 메시지 전송 (직접 상태 추가 X)
  const handleSend = () => {
    if (!input.trim()) return;
    const msg = {
      matchId,
      sender: myName,
      text: input,
      time: Date.now(),
    };
    socket.emit("sendMessage", msg); // 서버 emit만!
    setInput(""); // 입력란만 비움
  };

  return (
    <div style={{
      width: 360, minHeight: 280, background: "#fff",
      borderRadius: 16, boxShadow: "0 2px 16px #3332",
      padding: 20, margin: "0 auto",
      display: "flex", flexDirection: "column"
    }}>
      <div style={{
        fontSize: 15, color: "#a078dd", marginBottom: 10, minHeight: 28
      }}>
        {systemMsg}
      </div>
      <div style={{
        flex: 1,
        overflowY: "auto",
        border: "1.5px solid #f0e8fa",
        borderRadius: 8,
        padding: 10,
        background: "#faf7fe",
        marginBottom: 10,
        minHeight: 180,
        maxHeight: 260
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            textAlign: msg.sender === myName ? "right" : "left",
            margin: "4px 0"
          }}>
            <span style={{
              color: msg.sender === myName ? "#fd6585" : "#6546c2",
              fontWeight: 600,
              fontSize: 13
            }}>{msg.sender === myName ? "나" : "상대"}</span>
            <span style={{ marginLeft: 8, fontSize: 15 }}>{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          style={{
            flex: 1, border: "1px solid #ececec", borderRadius: 8, fontSize: 15,
            padding: "7px 11px"
          }}
          placeholder="메시지 입력"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          disabled={!partnerJoined}
        />
        <button
          style={{
            background: "linear-gradient(90deg,#ffb16c,#fc575e)",
            color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, padding: "0 18px"
          }}
          onClick={handleSend}
          disabled={!input.trim() || !partnerJoined}
        >전송</button>
      </div>
      {!partnerJoined && (
        <div style={{
          marginTop: 6,
          color: "#fd6585",
          fontSize: 14,
          textAlign: "center",
          fontWeight: 600,
          letterSpacing: "-0.01em"
        }}>
          상대방이 입장해야 채팅 입력이 가능합니다
        </div>
      )}
    </div>
  );
}