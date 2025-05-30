// ✅ styled-components 통합 + 버튼 반씩 정렬된 index.js (Home 페이지 전체 통합본)
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import ChatBox from "../components/ChatBox";
import MatchButton from "@/components/MatchButton";
import styled from "styled-components";
import axios from "axios";

const Container = styled.div`
  min-height: 100vh;
  background-image: url("https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80");
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 1rem;
`;

const Card = styled.div`
  width: 1200px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  border-radius: 2rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  border: 1px solid #e5e7eb;
  margin-bottom: 2.5rem;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  text-align: center;
  color: #1f2937;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  outline: none;
  &:focus {
    box-shadow: 0 0 0 2px #facc15;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  outline: none;
  &:focus {
    box-shadow: 0 0 0 2px #facc15;
  }
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  background-color: ${(props) => props.color || "#facc15"};
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: ${(props) => props.hover || "#eab308"};
  }
`;

const SubText = styled.p`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  text-align: center;
  color: #4b5563;
`;

export default function Home() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [origin, setOrigin] = useState("");
  const [departure, setDeparture] = useState("");
  const [budget, setBudget] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [mood, setMood] = useState("");
  const [style, setStyle] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [matchUser, setMatchUser] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchStatusMessage, setMatchStatusMessage] = useState("");

  const today = new Date();

  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const saved = JSON.parse(localStorage.getItem("matchStatus") || '{}');
    if (saved[todayKey]) setMatchCount(saved[todayKey]);
    const premiumStatus = localStorage.getItem("isPremium");
    if (premiumStatus === "true") setIsPremium(true);
    const savedUser = localStorage.getItem("matchUser");
    if (savedUser) setMatchUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (matchUser) {
      localStorage.setItem("matchUser", JSON.stringify(matchUser));
    } else {
      localStorage.removeItem("matchUser");
    }
  }, [matchUser]);

  const saveMatch = () => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const saved = JSON.parse(localStorage.getItem("matchStatus") || '{}');
    saved[todayKey] = (saved[todayKey] || 0) + 1;
    localStorage.setItem("matchStatus", JSON.stringify(saved));
    setMatchCount(saved[todayKey]);
  };

  const handleBudgetChange = (e) => {
    const input = e.target.value.replace(/,/g, "").replace(/[^0-9]/g, "");
    const formatted = input ? parseInt(input).toLocaleString() : "";
    setBudget(formatted);
  };

  const handleRandomMatch = async () => {
    if (!userId) return signIn();
    if (!origin || !departure || !budget || !startDate || !endDate || !mood || !style) {
      return alert("모든 항목을 작성해주세요");
    }
    setIsMatching(true);
    setMatchStatusMessage(`매칭 중입니다...`);
    try {
      const response = await axios.post("/api/match", {
        userId,
        origin,
        departure,
        budget: budget.replaceAll(",", ""),
        mood,
        style,
        startDate,
        endDate,
      });
      if (response.data.matched) {
        setMatchUser({ uid: response.data.partnerId, matchId: response.data.matchId });
        saveMatch();
        setIsMatching(false);
        setMatchStatusMessage("");
        alert("🎉 매칭이 성사되었습니다!");
      } else {
        setMatchStatusMessage("현재 매칭 대기 중인 유저가 없습니다");
      }
    } catch (err) {
      console.error("❌ 매칭 오류:", err);
      setMatchStatusMessage("서버 오류 발생");
    }
  };

  const handleCancelMatch = async () => {
    if (!userId) return;
    try {
      await axios.post("/api/cancel-match", { userId });
    } catch (err) {
      console.error("❌ 매칭 취소 오류:", err);
    }
    setIsMatching(false);
    setMatchStatusMessage("");
  };

  const handlePremiumPayment = async () => {
    try {
      const response = await fetch("/api/create-toss-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amount: 3900,
          orderName: "Spontany 프리미엄 이용권",
        }),
      });
      const { paymentUrl } = await response.json();
      window.location.href = paymentUrl;
    } catch (err) {
      alert("결제 요청 중 오류가 발생했습니다.");
      console.error("❌ 결제 요청 실패:", err);
    }
  };

  return (
    <Container>
      <Card>
        <Title>랜덤 동행 감성 여행 만들기</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Input type="text" placeholder="출발지" value={origin} onChange={(e) => setOrigin(e.target.value)} />
          <Select value={departure} onChange={(e) => setDeparture(e.target.value)}>
            <option value="">도착지 유형 선택</option>
            <option value="국내">국내</option>
            <option value="해외">해외</option>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Input type="text" placeholder="예산 (₩)" value={budget} onChange={handleBudgetChange} />
          <div className="w-full">
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              minDate={today}
              locale={ko}
              dateFormat="yyyy년 MM월 dd일"
              placeholderText="여행 날짜 선택"
              className="w-full px-4 py-3 text-sm border border-gray-200 bg-gray-50 rounded-xl text-center focus:ring-2 focus:ring-yellow-300 focus:outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
        </div>
        <ButtonGrid>
          <div>
            <Button onClick={handleRandomMatch} disabled={isMatching} color={isMatching ? "#d1d5db" : "#facc15"} hover={isMatching ? "#d1d5db" : "#eab308"}>
              {isMatching ? "매칭 중..." : "랜덤 매칭하기"}
            </Button>
            <SubText>{isMatching ? matchStatusMessage : "하루 2회 매칭 제한"}</SubText>
            {isMatching && (
              <Button onClick={handleCancelMatch} color="#ef4444" hover="#dc2626" style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
                매칭 취소하기
              </Button>
            )}
          </div>
          <div>
            <Button onClick={handlePremiumPayment} color="#9333ea" hover="#7e22ce">
              프리미엄 결제하기
            </Button>
            <SubText>프리미엄 유저들과 매칭 가능<br />무제한 매칭<br />고급 필터 제공</SubText>
          </div>
        </ButtonGrid>
        {!isPremium && <SubText style={{ fontSize: "0.75rem" }}>무료 유저는 하루 2회까지 여행 매칭이 가능해요.</SubText>}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-10 text-center">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">[테스트용] 자동 매칭 버튼</h2>
            <MatchButton userId="gold123" departure="서울" budget={100000} />
          </div>
        )}
      </Card>
      {matchUser && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-xl shadow-xl p-4 z-40">
          <h2 className="text-lg font-semibold mb-2">매칭된 유저와 채팅</h2>
          <ChatBox matchId={matchUser.matchId} />
        </div>
      )}
    </Container>
  );
}