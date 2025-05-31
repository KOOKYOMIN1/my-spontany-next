// ✅ index.js (채팅방 자동 열림 버그 수정 포함)
import { useState, useEffect, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import styled from "styled-components";
import axios from "axios";

const Container = styled.div`
  min-height: 100vh;
  background: url("https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80") no-repeat center/cover;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Card = styled.div`
  width: 700px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 2rem;
  padding: 2rem;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 1rem;
  margin-bottom: 1rem;
  font-size: 1rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 1rem;
  margin-bottom: 1rem;
  font-size: 1rem;
`;

const Button = styled.button`
  width: 100%;
  background: #facc15;
  border: none;
  border-radius: 1rem;
  padding: 1rem;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    background: #eab308;
  }
`;

const AuthBox = styled.div`
  text-align: right;
  margin-bottom: 1rem;
`;

const ChatBox = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 1rem;
  background: white;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const MessageList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
  text-align: left;
`;

const MessageInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 1rem;
  font-size: 1rem;
`;

const StatusText = styled.p`
  margin-top: 1rem;
  font-weight: bold;
  color: #4b5563;
`;

export default function Home() {
  const { data: session } = useSession();
  const [origin, setOrigin] = useState("");
  const [mood, setMood] = useState("");
  const [style, setStyle] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const messageEndRef = useRef(null);

 const handleSubmit = async () => {
  if (!session) {
    console.log("❌ 로그인 안 된 상태입니다");
    return signIn();
  }

  if (!origin || !mood || !style) {
    alert("모든 항목을 입력해주세요.");
    return;
  }

  console.log("🚀 handleSubmit 실행됨"); // ✅ 여기가 안 보이면 버튼 연결 문제

  setStatus("🔄 매칭 중입니다...");
  setIsWaiting(true);

    try {
      await axios.post("/api/match", {
        email: session.user.email,
        origin,
        mood,
        style,
      });

      setStatus("⏳ 대기열에 등록되었습니다. 상대를 기다리는 중...");
    } catch (err) {
      setStatus("❌ 매칭 실패. 다시 시도해주세요.");
      setIsWaiting(false);
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    const newMsg = { sender: session.user.name, text: message };

    try {
      await axios.post("/api/messages", {
        matchId: matchResult.matchId,
        sender: newMsg.sender,
        text: newMsg.text,
      });
      setMessage("");
    } catch (err) {
      console.error("메시지 전송 실패:", err);
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
  if (!isWaiting || chatOpen || !session?.user?.email) return;

  const userEmail = session.user.email;

  const interval = setInterval(async () => {
    try {
      const res = await axios.get(`/api/check-match?email=${encodeURIComponent(userEmail)}`);

      console.log("🧪 check-match 응답:", res.data);

      if (
        isWaiting &&
        res.data.matched &&
        res.data.matchId &&
        res.data.partnerName &&
        res.data.origin &&
        res.data.mood &&
        res.data.style
      ) {
        setChatOpen(true);
        setMatchResult({
          matchId: res.data.matchId,
          partnerName: res.data.partnerName,
        });
        setStatus("✅ 매칭 성공! 채팅방이 열렸습니다.");
        setIsWaiting(false);
      }
    } catch (err) {
      console.error("❌ check-match 호출 에러:", err);
    }
  }, 5000);

  return () => clearInterval(interval);
}, [isWaiting, session?.user?.email, chatOpen]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (chatOpen && matchResult?.matchId) {
        try {
          const res = await axios.get(`/api/messages?matchId=${matchResult.matchId}`);
          if (res.data && Array.isArray(res.data)) {
            setMessages(res.data);
          }
        } catch (err) {
          console.error("채팅 메시지 가져오기 실패:", err);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [chatOpen, matchResult?.matchId]);

  return (
    <Container>
      <Card>
        <AuthBox>
          {session ? (
            <div>
              👤 {session.user.name}
              <button onClick={() => signOut()} style={{ marginLeft: "1rem", color: "#ef4444" }}>로그아웃</button>
            </div>
          ) : (
            <button onClick={() => signIn()} style={{ color: "#2563eb", fontWeight: "bold" }}>로그인</button>
          )}
        </AuthBox>

        <Title>랜덤 동행 감성 여행 만들기</Title>

        <Input
          type="text"
          placeholder="출발지를 입력하세요"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />

        <Select value={mood} onChange={(e) => setMood(e.target.value)}>
          <option value="">감정을 선택하세요</option>
          <option value="설렘">설렘</option>
          <option value="힐링">힐링</option>
          <option value="기분전환">기분전환</option>
        </Select>

        <Select value={style} onChange={(e) => setStyle(e.target.value)}>
          <option value="">여행 스타일 선택</option>
          <option value="즉흥형">즉흥형</option>
          <option value="계획형">계획형</option>
        </Select>

        <Button onClick={handleSubmit}>랜덤 매칭하기</Button>
        {status && <StatusText>{status}</StatusText>}
      </Card>

      {chatOpen && (
        <ChatBox>
          <h3>🎉 매칭 완료! 채팅방이 열렸습니다.</h3>
          <p>상대방: <strong>{matchResult?.partnerName || '상대방'}</strong></p>
          <MessageList>
            {messages.map((msg, idx) => (
              <div key={idx}><strong>{msg.sender}:</strong> {msg.text}</div>
            ))}
            <div ref={messageEndRef} />
          </MessageList>
          <MessageInput
            type="text"
            value={message}
            placeholder="메시지를 입력하세요"
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
        </ChatBox>
      )}
    </Container>
  );
}