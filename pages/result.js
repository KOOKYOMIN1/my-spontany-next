// /pages/result.js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled from "styled-components";
import RecommendationCard from "../components/RecommendationCard";
import { getAIRecommendations } from "../lib/aiRecommend";
import Header from "../components/Header";
import PremiumModal from "../components/PremiumModal";

const MOOD_BG_MAP = {
  기본: "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80",
  기분전환: "https://images.unsplash.com/photo-1747372236557-6a201063ab35?auto=format&fit=crop&w=1600&q=80",
  힐링: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  설렘: "/sakura.jpg",
};

const BgFade = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  z-index: -1;
  background: ${({ $bg }) => `url('${$bg}') no-repeat center/cover`};
  transition: opacity 0.7s;
  opacity: 1;
  pointer-events: none;
`;

export default function Result() {
  const router = useRouter();
  const { departure, budget, mood } = router.query;

  const [loading, setLoading] = useState(true);
  const [recommend, setRecommend] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    if (!departure || !budget || !mood) return;
    setLoading(true);
    getAIRecommendations({ departure, budget, mood })
      .then((res) => {
        setRecommend(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [departure, budget, mood]);

  if (!departure || !budget || !mood) {
    return (
      <>
        <Header />
        <div style={{ padding: 64, textAlign: "center" }}>
          잘못된 접근입니다. <br />
          <button
            onClick={() => router.push("/")}
            style={{
              marginTop: 16,
              padding: "10px 28px",
              borderRadius: 8,
              background: "#eee",
              border: 0,
              fontWeight: 500,
            }}
          >
            홈으로
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <BgFade $bg={MOOD_BG_MAP[mood] || MOOD_BG_MAP["기본"]} />
      <Header />
      <div
        style={{
          minHeight: "100vh",
          background: "transparent",
          paddingTop: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 700,
            background: "rgba(255, 255, 255, 0.95)", // 투명도 적용된 배경색으로 변경
            borderRadius: 24,
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            padding: 36,
            marginTop: 50,
            marginBottom: 36,
            boxSizing: "border-box",
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#ff6a3d",
                }}
              >
                AI가 당신에게 어울리는 여행지를 추천 중입니다...
              </span>
              <div style={{ marginTop: 28 }}>
                <img
                  src="https://media.giphy.com/media/y1ZBcOGOOtlpC/giphy.gif"
                  width={60}
                  alt="로딩"
                />
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  fontSize: 23,
                  fontWeight: "bold",
                  marginBottom: 22,
                  textAlign: "center",
                  color: "#333",
                }}
              >
                {recommend?.message}
              </div>
              <div
                style={{ cursor: "pointer" }}
                onClick={() => setShowPremiumModal(true)}
              >
                <RecommendationCard data={recommend?.main} />
              </div>
              <div
                style={{
                  marginTop: 32,
                  display: "flex",
                  gap: 18,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {recommend?.others?.map((place, i) => (
                  <div
                    key={i}
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPremiumModal(true)}
                  >
                    <RecommendationCard data={place} mini />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 34 }}>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(window.location.href)
                  }
                  style={{
                    background: "#e8e8e8",
                    padding: "10px 22px",
                    borderRadius: 8,
                    border: 0,
                  }}
                >
                  링크 공유하기
                </button>
                <button
                  style={{
                    background: "#ffefc3",
                    padding: "10px 22px",
                    borderRadius: 8,
                    border: 0,
                    color: "#b98c38",
                    fontWeight: 600,
                  }}
                >
                  여행지 저장하기
                </button>
              </div>
              <div
                style={{
                  marginTop: 40,
                  background: "#fce8e3",
                  color: "#c16b4c",
                  padding: 16,
                  borderRadius: 10,
                  textAlign: "center",
                  fontWeight: 500,
                }}
              >
                동행 매칭, 맞춤 일정 등은 <b>프리미엄</b>에서 이용할 수 있습니다.
                <br />
                <button
                  style={{
                    background: "#ff9a3c",
                    color: "#fff",
                    padding: "10px 28px",
                    borderRadius: 8,
                    marginTop: 10,
                    border: 0,
                    fontWeight: 500,
                  }}
                  onClick={() => router.push("/premium")}
                >
                  프리미엄으로 업그레이드
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {showPremiumModal && (
        <PremiumModal onClose={() => setShowPremiumModal(false)} />
      )}
    </>
  );
}