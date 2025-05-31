import axios from "axios";
import { useState } from "react";

export default function MatchButton({ email, origin, mood, style, onMatchSuccess }) {
  const [status, setStatus] = useState("");

  const handleMatch = async () => {
    if (!origin || !mood || !style) {
      setStatus("❗ 모든 항목을 작성해주세요");
      return;
    }

    setStatus("🔍 매칭 시도 중...");

    await axios.post("/api/match", { email, origin, mood, style });

    const interval = setInterval(async () => {
      const res = await axios.get("/api/check-match", { params: { email } });
      if (res.data.matched) {
        clearInterval(interval);
        setStatus("✅ 매칭 성공! 채팅방이 열렸습니다.");
        onMatchSuccess(res.data);
      } else {
        setStatus("⏳ 상대가 준비 중입니다. 잠시만 기다려 주세요.");
      }
    }, 3000);
  };

  return (
    <div>
      <button onClick={handleMatch} className="bg-yellow-400 px-6 py-2 rounded-full font-bold">
        랜덤 매칭하기
      </button>
      <div className="mt-2 text-sm">{status}</div>
    </div>
  );
}