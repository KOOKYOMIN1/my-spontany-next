import { useState } from "react";
import axios from "axios";

function MatchButton({ userId, departure, budget }) {
  const [status, setStatus] = useState("");

  const handleMatch = async () => {
    setStatus("🔍 매칭 시도 중...");
    try {
      const res = await axios.post("/api/match", {
        userId,
        departure,
        budget: Number(budget),
      });

      if (res.data.matched) {
        setStatus(`🎉 매칭 성공! 상대: ${res.data.match.user2}`);
      } else {
        setStatus("⏳ 대기열에 등록됨. 상대를 기다리는 중...");
      }
    } catch (error) {
      console.error("❌ 매칭 오류:", error);
      setStatus("❌ 오류 발생");
    }
  };

  const handleCancel = async () => {
    try {
      await axios.post("/api/cancel-match", { userId });
      setStatus("🚫 매칭 취소됨");
    } catch (error) {
      console.error("❌ 취소 오류:", error);
      setStatus("❌ 취소 실패");
    }
  };

  return (
    <div className="space-y-2">
      <button onClick={handleMatch} className="bg-blue-500 text-white px-4 py-2 rounded">
        매칭 시작
      </button>
      <button onClick={handleCancel} className="bg-gray-400 text-white px-4 py-2 rounded">
        매칭 취소
      </button>
      <p className="text-sm mt-2">{status}</p>
    </div>
  );
}

export default MatchButton;