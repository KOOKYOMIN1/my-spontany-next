// ✅ index.js (양방향 채팅 메시지 반영 + 매칭 체크 + 작성란 입력 조건 반영 완성본)
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
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
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
    if (!session) return signIn();
    if (!origin || !mood || !style) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    setStatus("🔄 매칭 중입니다...");
    setIsWaiting(true);

    try {
      const res = await axios.post("/api/match", {
        email: session.user.email,
        name: session.user.name,
        origin,
        mood,
        style,
      });
      setMatchResult(res.data);
      if (
        res.data.matched &&
        res.data.match?.user1 &&
        res.data.match?.user2 &&
        res.data.match.origin &&
        res.data.match.mood &&
        res.data.match.style
      ) {
        setChatOpen(true);
        setIsWaiting(false);
        setStatus("✅ 매칭 성공! 채팅방이 열렸습니다.");
      } else {
        setStatus("⏳ 대기열에 등록되었습니다. 상대를 기다리는 중...");
      }
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
      await axios.post("/api/chat", {
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

  const interval = setInterval(async () => {
    try {
      const res = await axios.get(`/api/check-match?email=${session.user.email}`);
      
      // 🛡️ 이전 매칭 정보라도 내가 handleSubmit()을 눌렀을 때만 반응하도록
      if (
        isWaiting &&
        res.data.matched &&
        res.data.matchId &&
        res.data.origin &&
        res.data.mood &&
        res.data.style
      ) {
        setChatOpen(true);
        setMatchResult({ matchId: res.data.matchId, partnerName: res.data.partnerName });
        setStatus("✅ 매칭 성공! 채팅방이 열렸습니다.");
        setIsWaiting(false);
      }
    } catch (err) {
      console.error("매칭 체크 실패:", err);
    }
  }, 5000);

  return () => clearInterval(interval);
}, [isWaiting, session?.user?.email, chatOpen]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (chatOpen && matchResult?.matchId) {
        try {
          const res = await axios.get(`/api/chat?matchId=${matchResult.matchId}`);
          if (res.data && Array.isArray(res.data.messages)) {
            setMessages(res.data.messages);
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
