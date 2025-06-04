import { useState, useEffect, useRef } from "react";
import socket from "@/lib/socket-client";

// 시간 포맷 (ex. 15:12 → 오후 3:12)
function formatTime(ts) {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h < 12 ? "오전" : "오후";
  const h12 = h % 12 || 12;
  return `${ampm} ${h12}:${m}`;
}

export default function ChatBox({ matchId, myName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [partnerJoined, setPartnerJoined] = useState(false);
  const [systemMsg, setSystemMsg] = useState("상대방을 기다리는 중...");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // socket null 방어
  if (!socket) return <div>채팅 서버 연결 중...</div>;

  // 스크롤 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 입장/메시지 수신
  useEffect(() => {
    if (!matchId) return;

    socket.emit("joinRoom", { matchId });

    function onChatHistory(msgs = []) {
      setMessages(msgs);
      // 서버에서 메시지 넘길 때, partnerJoined도 같이 넘겨도 좋음!
    }
    function onReceiveMsg(msg) {
      setMessages(prev => [...prev, msg]);
    }
    function onPartnerJoin() {
      setPartnerJoined(true);
      setSystemMsg("상대방이 입장했습니다!");
      // 입력창 포커스
      setTimeout(() => {
        setSystemMsg("");
        inputRef.current?.focus();
      }, 1000);
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

  // 메시지 전송 (IME 조합 중 Enter 방지)
  const handleSend = () => {
    if (!input.trim()) return;
    const msg = {
      matchId,
      sender: myName,
      text: input,
      time: Date.now(),
    };
    socket.emit("sendMessage", msg);
    setInput("");
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
            <span style={{
              fontSize: 11,
              color: "#b6a1d6",
              marginLeft: 8
            }}>{msg.time && formatTime(msg.time)}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          style={{
            flex: 1, border: "1px solid #ececec", borderRadius: 8, fontSize: 15,
            padding: "7px 11px"
          }}
          placeholder="메시지 입력"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) handleSend();
          }}
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