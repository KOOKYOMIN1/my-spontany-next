// /pages/result.js
import styled from "styled-components";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaShareAlt, FaRedo, FaArrowLeft, FaClock, FaSave, FaHistory } from "react-icons/fa";

const MOOD_BG_MAP = {
  설렘: "/sakura.jpg",
  힐링: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  기분전환: "https://images.unsplash.com/photo-1747372236557-6a201063ab35?auto=format&fit=crop&w=1600&q=80",
  기본: "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80",
};
const MOOD_COLOR_MAP = {
  설렘: "#fc575e",
  힐링: "#25a4fc",
  기분전환: "#fca86c",
  기본: "#7b2ff2",
};

async function fetchPexelsImage(keyword, mood) {
  try {
    const res = await fetch(
      `/api/fetch-pexels?query=${encodeURIComponent(keyword)}&mood=${encodeURIComponent(mood)}`,
      { method: "GET" }
    );
    const data = await res.json();
    console.log("Pexels 이미지:", data.imgUrl);
    return data.imgUrl || MOOD_BG_MAP[mood] || MOOD_BG_MAP["기본"];
  } catch {
    return MOOD_BG_MAP[mood] || MOOD_BG_MAP["기본"];
  }
}

export default function Result() {
  const router = useRouter();
  const { mood: queryMood = "기본", departure = "", budget = "" } = router.query;

  const [mood, setMood] = useState(queryMood);
  const [loading, setLoading] = useState(true);

  const [itinerary, setItinerary] = useState([]);
  const [itLoading, setItLoading] = useState(true);

  // 🎯 [변경] 카드에 쓸 메인 사진만 동적 imgUrl
  const [imgUrl, setImgUrl] = useState(MOOD_BG_MAP[mood] || MOOD_BG_MAP["기본"]);

  const [toast, setToast] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  const [themeMsg, setThemeMsg] = useState("여행을 시작할 시간이에요!");

  useEffect(() => {
    if (typeof window !== "undefined" && showHistory) {
      const list = JSON.parse(localStorage.getItem("spontanyHistory") || "[]");
      setHistoryList(list);
    }
  }, [showHistory]);

  // 🎯 [변경] 배경은 무조건 MOOD_BG_MAP, 카드 사진만 fetchPexelsImage로 동적 처리
  useEffect(() => {
    async function fetchThemeAndImg() {
      setLoading(true);
      try {
        const res = await fetch("/api/generate-theme", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood, departure, budget })
        });
        const data = await res.json();
        setThemeMsg(data.theme || "여행을 시작할 시간이에요!");

        if (data.imageKeyword) {
          const img = await fetchPexelsImage(data.imageKeyword, mood);
          setImgUrl(img);
        } else {
          setImgUrl(MOOD_BG_MAP[mood] || MOOD_BG_MAP["기본"]);
        }
      } catch {
        setThemeMsg("여행을 시작할 시간이에요!");
        setImgUrl(MOOD_BG_MAP[mood] || MOOD_BG_MAP["기본"]);
      }
      setLoading(false);
    }
    fetchThemeAndImg();
  }, [mood, departure, budget]);

  useEffect(() => {
    async function fetchItinerary() {
      setItLoading(true);
      try {
        const res = await fetch("/api/generate-itinerary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood, departure, budget })
        });
        const data = await res.json();
        let itineraryArr = [];
        if (Array.isArray(data.itinerary)) {
          itineraryArr = data.itinerary;
        } else if (typeof data.itinerary === "string") {
          try {
            itineraryArr = JSON.parse(data.itinerary);
          } catch {
            itineraryArr = [];
          }
        } else if (data.itinerary && typeof data.itinerary === "object") {
          itineraryArr = [data.itinerary];
        }
        setItinerary(itineraryArr);
      } catch {
        setItinerary([]);
      }
      setItLoading(false);
    }
    fetchItinerary();
  }, [mood, departure, budget]);

  useEffect(() => {
    if (mood) {
      localStorage.setItem("spontanyMood", mood);
    }
  }, [mood]);

  useEffect(() => {
    const storedMood = localStorage.getItem("spontanyMood");
    if (storedMood) setMood(storedMood);
  }, []);

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: "Spontany 여행 추천",
        text: "나만의 감성 여행 추천!",
        url: window.location.href
      }).then(() => {
        setToast("공유 완료!");
        setTimeout(() => setToast(""), 1400);
      }).catch(() => {
        setToast("공유 취소됨");
        setTimeout(() => setToast(""), 1400);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setToast("URL이 복사되었습니다!");
      setTimeout(() => setToast(""), 1400);
    }
  }

  function handleBack() {
    router.push("/");
  }

  function handleRefresh() {
    router.reload();
  }

  function handleSave() {
    if (typeof window === "undefined") return;
    const prev = JSON.parse(localStorage.getItem("spontanyHistory") || "[]");
    const newEntry = {
      date: new Date().toISOString(),
      mood, departure, budget, themeMsg, itinerary, imgUrl
    };
    localStorage.setItem("spontanyHistory", JSON.stringify([newEntry, ...prev].slice(0, 30)));
    setToast("여행 기록이 저장되었습니다!");
    setTimeout(() => setToast(""), 1500);
  }

  function openHistory() {
    setShowHistory(true);
  }
  function closeHistory() {
    setShowHistory(false);
  }

  return (
    <ResultBg $bg={MOOD_BG_MAP[mood] || MOOD_BG_MAP["기본"]}>
      <BgBlur />
      <ResultCard>
        <BackBtn onClick={handleBack} aria-label="처음으로">
          <FaArrowLeft />
        </BackBtn>
        <ImgWrap>
          <CityImg src={imgUrl} alt="추천 여행지" />
        </ImgWrap>
        <MoodBadge $color={MOOD_COLOR_MAP[mood] || MOOD_COLOR_MAP["기본"]}>
          {mood} 여행
        </MoodBadge>
        <ThemeMsg>
          {loading ? <LoadingBar /> : themeMsg}
        </ThemeMsg>
        <DetailList>
          <DetailItem>
            <span>출발지</span>
            <b>{departure || "미입력"}</b>
          </DetailItem>
          <DetailItem>
            <span>예산</span>
            <b>{budget ? `${budget}원` : "미입력"}</b>
          </DetailItem>
        </DetailList>
        <BtnRow>
          <ActionBtn onClick={handleShare}><FaShareAlt /> 공유하기</ActionBtn>
          <ActionBtn onClick={handleSave}><FaSave /> 결과 저장</ActionBtn>
          <ActionBtn onClick={openHistory}><FaHistory /> 내 여행</ActionBtn>
          <ActionBtn onClick={handleRefresh}><FaRedo /> 다시 추천</ActionBtn>
        </BtnRow>
        <SectionTitle>
          <FaClock style={{ color: "#fca86c", marginRight: 8 }} />
          감성 일정표
        </SectionTitle>
        <ItineraryWrap>
          {itLoading ? (
            <LoadingBar style={{ margin: "2em auto" }} />
          ) : itinerary.length === 0 ? (
            <NoItineraryMsg>일정 데이터를 불러오지 못했습니다.</NoItineraryMsg>
          ) : (
            <ul>
              {itinerary.map((item, idx) => (
                <ItineraryItem key={idx}>
                  <div className="time">{item.time || `${idx + 1}일차`}</div>
                  <div className="desc">{item.desc}</div>
                </ItineraryItem>
              ))}
            </ul>
          )}
        </ItineraryWrap>
        {toast && <ToastMsg>{toast}</ToastMsg>}

        {showHistory && (
          <HistoryModal>
            <HistoryBg onClick={closeHistory} />
            <HistoryContent>
              <h3>내 여행 기록</h3>
              {historyList.length === 0 && <div style={{ color: "#bbb", margin: "1.3em 0" }}>저장된 기록이 없습니다.</div>}
              <ul>
                {historyList.map((h, i) => (
                  <li key={i} style={{
                    marginBottom: 20,
                    background: "#faf5fd",
                    borderRadius: 13,
                    boxShadow: "0 2px 8px #d1c1ee18",
                    padding: "1em 1.2em"
                  }}>
                    <div style={{ fontWeight: 700, color: "#7b2ff2" }}>
                      {new Date(h.date).toLocaleDateString()} {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ color: "#865ad6", fontWeight: 800, margin: "0.3em 0 0.4em 0" }}>{h.themeMsg}</div>
                    <div style={{ fontSize: 15, color: "#ae96d9" }}>{h.departure} / {h.budget} / {h.mood}</div>
                    <ul style={{ margin: "0.7em 0 0.1em 0", padding: 0, listStyle: "none" }}>
                      {h.itinerary?.map?.((item, idx2) => (
                        <li key={idx2} style={{ color: "#7b2ff2", fontWeight: 600, marginBottom: 4 }}>
                          <span style={{ color: "#b6a1d6" }}>{item.time || `${idx2 + 1}일차`} : </span>
                          {item.desc}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              <CloseHistoryBtn onClick={closeHistory}>닫기</CloseHistoryBtn>
            </HistoryContent>
          </HistoryModal>
        )}
      </ResultCard>
    </ResultBg>
  );
}

// --- 스타일드 컴포넌트 ---
const ResultBg = styled.div`
  min-height: 100vh; width: 100vw;
  background: url('${props => props.$bg}') center/cover no-repeat;
  display: flex; align-items: center; justify-content: center;
  position: relative;
  @media (max-width: 600px) { align-items: flex-start; }
`;

const BgBlur = styled.div`
  position: fixed; left:0; top:0; width:100vw; height:100vh; z-index:0;
  background: rgba(255,255,255,0.28);
  backdrop-filter: blur(2.5px) brightness(0.97);
`;

const ResultCard = styled.div`
  z-index: 1; min-width: 350px; max-width: 400px; width: 90vw;
  background: rgba(255,255,255,0.96);
  border-radius: 1.7rem; box-shadow: 0 6px 42px #8e88e130;
  padding: 2.2rem 1.4rem 2.1rem 1.4rem;
  margin: 4vw auto;
  position: relative; display: flex; flex-direction: column; align-items: center;
  @media (max-width: 600px) {
    min-width: unset; width: 98vw; padding: 1.3rem 0.6rem 1.3rem 0.6rem;
    border-radius: 1.1rem;
  }
`;

const ImgWrap = styled.div`
  width: 88%; margin: 0 auto 1.05rem auto;
  border-radius: 1.3rem;
  box-shadow: 0 4px 18px #d1c1ee33;
  overflow: hidden;
  aspect-ratio: 4/2.3;
  background: #eae7f5;
`;
const CityImg = styled.img`
  width: 100%; height: 100%; object-fit: cover; display: block;
`;

const MoodBadge = styled.div`
  margin-top: 0.8em;
  background: ${({ $color }) => $color || "#7b2ff2"};
  color: #fff;
  font-size: 1.13em; font-weight: 800;
  border-radius: 1.3em; padding: 0.28em 1.2em; letter-spacing: 0.02em;
  box-shadow: 0 2px 8px #fc575e24;
`;

const ThemeMsg = styled.div`
  margin-top: 1.6em; margin-bottom: 1.25em;
  font-size: 1.19em; font-weight: 900; letter-spacing: -0.01em;
  color: #865ad6; text-align: center;
  line-height: 1.6;
  min-height: 2.4em;
  background: linear-gradient(90deg,#fbc2eb11 0%,#a6c1ee22 100%);
  border-radius: 0.9em;
  padding: 1.03em 0.8em;
  box-shadow: 0 1px 9px #d1c1ee14;
  @media (max-width: 600px) { font-size: 1.05em; }
`;

const DetailList = styled.ul`
  width: 100%; display: flex; justify-content: space-between;
  margin: 1.05em 0 1.27em 0; padding: 0;
  list-style: none;
`;
const DetailItem = styled.li`
  display: flex; flex-direction: column; align-items: center;
  span { color: #b6a1d6; font-size: 0.99em; font-weight: 700; }
  b { color: #7b2ff2; font-size: 1.12em; font-weight: 800; margin-top: 0.18em; }
`;

const BtnRow = styled.div`
  display: flex; gap: 1em; margin-top: 1.1em;
  width: 100%; justify-content: center;
  @media (max-width: 600px) { flex-direction: column; gap: 0.7em; }
`;

const ActionBtn = styled.button`
  flex: 1 1 0;
  background: linear-gradient(90deg,#fc575e 0%,#a6c1ee 100%);
  color: #fff; font-weight: 900; border: none;
  border-radius: 1.1em; font-size: 1.07em; padding: 0.91em 0;
  box-shadow: 0 2px 12px #fc575e22;
  display: flex; align-items: center; justify-content: center; gap: 0.6em;
  cursor: pointer; transition: filter 0.13s, background 0.13s;
  &:hover { filter: brightness(1.11); }
  &:active { filter: brightness(0.94); }
`;

const ToastMsg = styled.div`
  position: fixed; top: 34px; left: 50%; transform: translateX(-50%);
  background: #fff6f7; color: #fc575e;
  font-weight: 900; font-size: 1.06em; border-radius: 1em;
  padding: 1em 2.1em; box-shadow: 0 2px 12px #fc575e18;
  z-index: 9999;
  animation: fadeInUp 0.22s;
  @keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(20px) scale(0.95); }
    100% { opacity: 1; transform: none; }
  }
`;

const BackBtn = styled.button`
  position: absolute; left: 1.25em; top: 1.17em;
  background: none; border: none; color: #b6a1d6;
  font-size: 1.19em; cursor: pointer; z-index: 2;
  &:hover { color: #7b2ff2; }
  @media (max-width: 600px) { left: 0.75em; top: 0.8em; }
`;

const SectionTitle = styled.div`
  font-size: 1.13em;
  font-weight: 800;
  color: #7b2ff2;
  margin: 2.1em 0 0.6em 0;
  display: flex; align-items: center;
`;

const ItineraryWrap = styled.div`
  width: 100%;
  background: #f9f7fd;
  border-radius: 1.1em;
  padding: 1.15em 1.2em;
  box-shadow: 0 2px 10px #e0d7fa13;
  margin-bottom: 1.6em;
  min-height: 92px;
  ul { padding: 0; margin: 0; }
`;

const ItineraryItem = styled.li`
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.74em;
  .time {
    color: #fc575e;
    font-weight: 900;
    width: 72px;
    flex-shrink: 0;
    text-align: right;
    margin-right: 1em;
  }
  .desc {
    color: #7b2ff2;
    font-weight: 700;
    word-break: keep-all;
  }
`;

const NoItineraryMsg = styled.div`
  color: #b6a1d6;
  font-weight: 700;
  padding: 2.2em 0;
  text-align: center;
`;

const HistoryModal = styled.div`
  position: fixed; left: 0; top: 0; right: 0; bottom: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
`;

const HistoryBg = styled.div`
  position: absolute; left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(110,80,180,0.09);
`;

const HistoryContent = styled.div`
  background: #fff; border-radius: 1.2em; padding: 2.3em 1.8em 1.4em 1.8em;
  max-width: 480px; width: 97vw; max-height: 75vh; overflow-y: auto;
  box-shadow: 0 6px 28px #c7b9b922;
  position: relative; z-index: 1;
  h3 {
    color: #7b2ff2; font-weight: 900; margin-bottom: 1.25em; font-size: 1.17em;
    text-align: center;
  }
`;

const CloseHistoryBtn = styled.button`
  margin: 1.7em auto 0 auto; display: block;
  background: linear-gradient(90deg,#fc575e,#a6c1ee);
  color: #fff; font-weight: 800; border: none;
  border-radius: 0.9em; font-size: 1em; padding: 0.68em 2.1em;
  box-shadow: 0 2px 10px #fc575e22;
  cursor: pointer; transition: filter 0.12s;
  &:hover { filter: brightness(1.07); }
`;

function LoadingBar(props) {
  return (
    <span style={{
      display: "inline-block",
      background: "linear-gradient(90deg,#fbc2eb 0%,#a6c1ee 100%)",
      borderRadius: 9, width: 82, height: 14, ...props?.style
    }}></span>
  );
}