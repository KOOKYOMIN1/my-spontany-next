import styled, { css, createGlobalStyle } from "styled-components";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { FaLock, FaBan } from "react-icons/fa";
import ChatBox from "@/components/ChatBox";
import useIsPremium from "@/hooks/useIsPremium";
import { useChatModal } from "@/contexts/ChatModalContext";
import socket from "../lib/socket-client";

// 전역 애니메이션 스타일 추가 (styled-components 사용 시)
const GlobalStyle = createGlobalStyle`
  @keyframes popEffect {
    0% { transform: scale(0.97); opacity: 0.85; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

// ----- 트렌디한 스타일 컴포넌트 -----
const MOOD_BG_MAP = {
  기본: "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80",
  기분전환: "https://images.unsplash.com/photo-1747372236557-6a201063ab35?auto=format&fit=crop&w=1600&q=80",
  힐링: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  설렘: "/sakura.jpg",
};

// 3-1. 감정별 컬러맵 추가
const MOOD_COLOR_MAP = {
  설렘: "#fc575e",
  힐링: "#25a4fc",
  기분전환: "#fca86c",
  기본: "#7b2ff2"
};

const BgFade = styled.div`
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1;
  transition: opacity 0.7s;
  background: ${({ $bg }) => `url('${$bg}') no-repeat center/cover`};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: none;
  filter: brightness(0.97) blur(1.5px);
`;

const CenterWrap = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  /* background: rgba(255,255,255,0.55); */
  /* backdrop-filter: blur(2.5px); */
`;

const FormBox = styled.div`
  width: 100%; max-width: 440px; background: rgba(255,255,255,0.93); border-radius: 1.5rem;
  box-shadow: 0 4px 32px #c7b9b933; padding: 2.8rem 2rem 2rem 2rem;
  text-align: center; position: relative; box-sizing: border-box; z-index: 5;
  border: 1.5px solid #f3e8ff;
`;

const Title = styled.h2`
  font-size: 1.35rem; font-weight: 900; color: #7b2ff2; letter-spacing: -0.02em; margin-bottom: 0.7rem;
  background: linear-gradient(90deg, #fbc2eb 0%, #a6c1ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SubTitle = styled.div`
  font-size: 1.07rem; color: #ab7fc5; margin-bottom: 1.45rem; font-weight: 600;
`;

const MoodBtns = styled.div`
  display: flex; gap: 14px; margin-bottom: 1.3rem;
`;

const MoodBtn = styled.button`
  flex: 1 1 0; border: 2.5px solid #eee; background: #f8f8f8; color: #7b2ff2; font-size: 1.13rem;
  font-weight: 700; border-radius: 1.1rem; padding: 1.05rem 0; cursor: pointer;
  transition: border 0.13s, background 0.13s, color 0.13s, box-shadow 0.13s;
  ${({ $active }) =>
    $active &&
    css`
      border: 2.5px solid #fc575e;
      background: linear-gradient(90deg, #fbc2eb 0%, #a6c1ee 100%);
      color: #fc575e;
      box-shadow: 0 2px 12px #fbc2eb55;
    `}
  &:hover {
    border: 2.5px solid #fca86c;
    background: #ffecd5;
    color: #fc575e;
  }
  &:disabled {
    cursor: not-allowed;
    background: #f2f2f2;
    color: #ccc;
    border: 2px solid #f0f0f0;
  }
`;

const InputGroup = styled.div`
  display: flex; flex-direction: column; align-items: stretch; margin-bottom: 1.05rem; width: 100%;
`;

const Label = styled.label`
  margin: 0 0 0.18rem 0.05rem; text-align: left; font-size: 1.08rem; font-weight: 700; color: #7b2ff2;
  letter-spacing: -0.01em; display: flex; align-items: center; gap: 0.4em;
`;

const PremiumLabel = styled.span`
  display: inline-flex; align-items: center; background: #ffeac2; color: #ca9600; border-radius: 0.7rem;
  font-size: 0.93rem; font-weight: 700; padding: 0.07em 0.6em; margin-left: 0.4em;
  svg { margin-right: 4px; font-size: 0.98em; }
`;

const Input = styled.input`
  width: 100%; padding: 0.92rem 1.1rem; font-size: 1.09rem; border: 1.7px solid #ececec;
  border-radius: 0.95rem; color: #222; background: #f9f9f9; box-sizing: border-box; margin-bottom: 0;
  transition: border 0.13s;
  &:focus {
    outline: none;
    border-color: #fc575e;
    background: #fff9f8;
  }
  &:disabled {
    background: #f2f2f2; color: #bbb; cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%; padding: 0.92rem 1.1rem; font-size: 1.09rem; border: 1.7px solid #ececec;
  border-radius: 0.95rem; color: ${({ disabled }) => (disabled ? "#bbb" : "#222")};
  background: ${({ disabled }) => (disabled ? "#f2f2f2" : "#f9f9f9")}; box-sizing: border-box; margin-bottom: 0.1rem;
  transition: border 0.13s;
  &:focus {
    outline: none;
    border-color: #fc575e;
    background: #fff9f8;
  }
`;

const TagInput = styled.input`
  width: 100%; padding: 0.8rem 1.1rem; font-size: 1.03rem; border: 1.7px dashed #e0b5ea; border-radius: 0.95rem;
  color: #7449aa; background: #faf5fd; box-sizing: border-box; margin-bottom: 0.18rem;
  &:focus {
    outline: none;
    border-color: #fc575e;
    background: #fff9f8;
  }
  &:disabled {
    background: #f2f2f2; color: #bbb; cursor: not-allowed;
  }
`;

const TagDesc = styled.div`
  color: #b597d6; font-size: 0.93rem; margin-bottom: 0.5rem; text-align: left;
`;

const PrimaryBtn = styled.button`
  width: 100%; background: ${({ $active }) => $active ? "linear-gradient(90deg, #ffb16c, #fc575e)" : "#eee"};
  color: ${({ $active }) => ($active ? "white" : "#bbb")}; border: none; border-radius: 1.1rem;
  font-size: 1.18rem; font-weight: 800; padding: 1.13rem 0; margin: 1.2rem 0 0.5rem 0;
  cursor: ${({ $active }) => ($active ? "pointer" : "not-allowed")};
  transition: background 0.15s, color 0.11s; display: flex; align-items: center; justify-content: center; gap: 9px;
  box-shadow: ${({ $active }) => $active ? "0 2px 14px #fc575e19" : "none"};
  &:hover {
    background: ${({ $active }) => $active ? "linear-gradient(90deg, #fc575e, #ffb16c)" : "#eee"};
  }
`;

const DisabledBtn = styled(PrimaryBtn)`
  background: #eee !important; color: #bbb !important; cursor: not-allowed;
  &:hover { background: #eee !important; }
`;

const PremiumBtn = styled(PrimaryBtn)`
  background: ${({ $active }) =>
    $active
      ? "#f2eaf8 !important"
      : "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%) !important"};
  color: ${({ $active }) => ($active ? "#865ad6 !important" : "#fff !important")};
  margin-top: 0.6rem;
  border: 1.7px solid #e0d7fa;
  svg { margin-right: 8px; font-size: 1.13em; vertical-align: middle; }
  box-shadow: ${({ $active }) => $active ? "none" : "0 4px 18px #6a11cb44"};
  transition: background 0.2s, color 0.2s, opacity 0.2s;
  cursor: ${({ $active }) => ($active ? "not-allowed" : "pointer")};
  &:hover {
    background: ${({ $active }) =>
      $active
        ? "#f2eaf8 !important"
        : "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%) !important"};
    filter: ${({ $active }) => ($active ? "none" : "brightness(1.08)")};
  }
`;

const Notice = styled.div`
  color: #fa5757; font-size: 1.07rem; margin-top: 0.45rem; font-weight: 700; min-height: 1.2em; letter-spacing: -0.01em; text-align: center;
`;

const Overlay = styled.div`
  position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; z-index: 10; cursor: not-allowed;
`;

const EmotionMsg = styled.div`
  margin-top: 2.1rem; font-size: 1.13rem; color: #7b2ff2; background: rgba(249,244,255,0.63);
  padding: 13px 0 11px 0; border-radius: 1.2rem; font-weight: 700; box-shadow: 0 2px 14px #dbd1e325; min-height: 1.5em;
`;

const ResponsiveWrap = styled.div`
  @media (max-width: 600px) {
    ${FormBox} {
      max-width: 98vw; padding: 1.2rem 0.7rem 1.1rem 0.7rem;
    }
    ${Title} {
      font-size: 1.07rem; margin-bottom: 0.45rem;
    }
    ${Input}, ${Select}, ${TagInput} {
      font-size: 0.99rem; padding: 0.7rem 0.7rem;
    }
    ${PrimaryBtn}, ${PremiumBtn}, ${DisabledBtn} {
      font-size: 1.07rem; padding: 0.8rem 0;
    }
    ${EmotionMsg} {
      font-size: 0.97rem; margin-top: 1.1rem;
    }
  }
`;
// ----- 스타일 끝 -----

function isValidOrigin(origin) {
  if (typeof origin !== "string") return false;
  return origin.replace(/\s/g, "").length >= 2;
}

export default function Home() {
  // 1. 모든 훅 선언
  const [isClient, setIsClient] = useState(false);
  const { data: session, status } = useSession({ required: true });
  const isLoggedIn = !!session;
  const router = useRouter();
  const { chatOpen, setChatOpen } = useChatModal();

  const [matchId, setMatchId] = useState("");
  const [showPremiumFields, setShowPremiumFields] = useState(false);
  const [isPremium, setIsPremium] = useIsPremium();
  const [mood, setMood] = useState("");
  const [origin, setOrigin] = useState("");
  const [budget, setBudget] = useState("");
  const [companionCount, setCompanionCount] = useState("");
  const [companionGender, setCompanionGender] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [notice, setNotice] = useState("");
  const [bgMood, setBgMood] = useState("기본");
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [matchStatus, setMatchStatus] = useState(""); // "", "waiting" 등

  const noticeTimeout = useRef();

  // 2. 모든 useEffect 포함!
  useEffect(() => { setIsClient(true); }, []);
  useEffect(() => {
    if (!socket) return;

    function onMatched({ matchId }) {
      console.log("onMatched 실행!", matchId);
      setMatchId(matchId);
      setChatOpen(true);
      setIsLoading(false);
      setMatchStatus("");
    }
    socket.on("matched", onMatched);
    return () => {
      socket.off("matched", onMatched);
    };
  }, [socket, setChatOpen]);

  useEffect(() => {
    console.log("matchId:", matchId, "chatOpen:", chatOpen, "matchStatus:", matchStatus);
  }, [matchId, chatOpen, matchStatus]);

  // 3. 조건부 리턴 (이 아래로 훅 선언 X)
  if (!isClient) return null;

  // 4. 함수, 이벤트, 렌더링 등 나머지 코드
  // ----- 헬퍼 함수 및 로직 -----
  function isMatching() {
    return matchStatus === "waiting";
  }

  // 입력/버튼/채팅모달 비활성화 조건
  const allDisabled = isMatching() || isLoading;

  const handleMoodClick = (newMood) => {
    if (isMatching() || isLoading) return;
    setMood(newMood);
    setBgMood(newMood);
  };

  const handleOriginChange = (e) => {
    if (!session || isMatching() || isLoading) return;
    setOrigin(e.target.value.replace(/[0-9]/g, ""));
  };

  const handleBudgetChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    setBudget(val ? parseInt(val, 10).toLocaleString() : "");
  };

  const handleLogin = async () => {
    try {
      const res = await signIn("google", { redirect: false });
      if (res?.error) showToast("SNS 로그인에 실패했어요. 다시 시도해 주세요");
    } catch {
      showToast("SNS 로그인에 실패했어요. 다시 시도해 주세요");
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 1700);
  };

  const showInputNotice = () => {
    if (noticeTimeout.current) clearTimeout(noticeTimeout.current);
    setNotice("작성란을 입력해주세요");
    noticeTimeout.current = setTimeout(() => setNotice(""), 1500);
  };

  const EMOTION_MSG = {
    설렘: "설렘 가득한 오늘, 새로운 여행을 추천해드릴게요!",
    힐링: "마음이 지친 날엔, 편안한 여행지로 안내해드릴게요.",
    기분전환: "답답한 일상엔, 기분전환이 필요하죠!",
    기본: "지금 내 기분에 딱 맞는 여행지를 찾아보세요.",
  };

  // ------ 매칭 관련 ------
  const handleRecommend = async () => {
    if (!session || isMatching() || isLoading) return;
    if (!mood || !origin || !budget) return showInputNotice();
    setIsLoading(true);
    if (!isValidOrigin(origin)) {
      setNotice("출발지는 2글자 이상 입력해주세요");
      if (noticeTimeout.current) clearTimeout(noticeTimeout.current);
      noticeTimeout.current = setTimeout(() => setNotice(""), 1500);
      setIsLoading(false);
      return;
    }
    await router.push({
      pathname: "/result",
      query: { departure: origin, budget, mood },
    });
    setIsLoading(false);
  };

  const handleRandomMatch = () => {
    if (!session || isMatching() || isLoading) return;
    if (!mood || !origin || !budget) return showInputNotice();
    setIsLoading(true);
    setMatchStatus("waiting");
    socket.emit("joinMatchQueue", {
      userId: session.user.email,
      mood, origin, budget, companionCount, companionGender, ageRange,
    });
  };

  const handleCancelMatchWait = () => {
    if (!isMatching()) return;
    socket.emit("cancelMatchWait");
  };

  const disabledStyle = {
    cursor: "not-allowed",
    background: "#f2f2f2",
    color: "#bbb",
  };

  const handlePremiumOpen = () => {
    setShowPremiumFields((prev) => !prev);
  };

  return (
    <>
      <GlobalStyle />
      {/* 토스트 컴포넌트는 페이지 최상단에 위치 */}
      {toastMsg && <Toast>{toastMsg}</Toast>}
      <ResponsiveWrap>
        {Object.entries(MOOD_BG_MAP).map(([key, url]) => (
          <BgFade key={key} $bg={url} $visible={bgMood === key} />
        ))}
        <CenterWrap>
          <FormBox>
            {/* 3-2. Title/SubTitle 컬러 동기화 */}
            <Title style={{
              color: MOOD_COLOR_MAP[mood || "기본"],
              background: "none",
              WebkitTextFillColor: "unset",
              WebkitBackgroundClip: "unset"
            }}>
              오늘의 감정을 선택하고<br />
              여행지 추천을 받아보세요
            </Title>
            <SubTitle style={{ color: MOOD_COLOR_MAP[mood || "기본"] }}>
              프리미엄이면 동행/취향까지 내맘대로! <b>무료 추천은 로그인만 하면 OK</b>
            </SubTitle>
            <MoodBtns>
              <MoodBtn
                tabIndex={0}
                aria-label="설렘 감정 선택"
                onClick={session && !allDisabled ? () => handleMoodClick("설렘") : undefined}
                $active={mood === "설렘"}
                disabled={!session || allDisabled}
                style={{
                  ...((!session || allDisabled) ? disabledStyle : {}),
                  borderColor: mood === "설렘" ? MOOD_COLOR_MAP["설렘"] : undefined,
                  color: mood === "설렘" ? MOOD_COLOR_MAP["설렘"] : undefined,
                  animation: mood === "설렘" ? "popEffect 0.22s" : undefined,
                }}
              >
                설렘
              </MoodBtn>
              <MoodBtn
                tabIndex={0}
                aria-label="힐링 감정 선택"
                onClick={session && !allDisabled ? () => handleMoodClick("힐링") : undefined}
                $active={mood === "힐링"}
                disabled={!session || allDisabled}
                style={{
                  ...((!session || allDisabled) ? disabledStyle : {}),
                  borderColor: mood === "힐링" ? MOOD_COLOR_MAP["힐링"] : undefined,
                  color: mood === "힐링" ? MOOD_COLOR_MAP["힐링"] : undefined,
                  animation: mood === "힐링" ? "popEffect 0.22s" : undefined,
                }}
              >
                힐링
              </MoodBtn>
              <MoodBtn
                tabIndex={0}
                aria-label="기분전환 감정 선택"
                onClick={session && !allDisabled ? () => handleMoodClick("기분전환") : undefined}
                $active={mood === "기분전환"}
                disabled={!session || allDisabled}
                style={{
                  ...((!session || allDisabled) ? disabledStyle : {}),
                  borderColor: mood === "기분전환" ? MOOD_COLOR_MAP["기분전환"] : undefined,
                  color: mood === "기분전환" ? MOOD_COLOR_MAP["기분전환"] : undefined,
                  animation: mood === "기분전환" ? "popEffect 0.22s" : undefined,
                }}
              >
                기분전환
              </MoodBtn>
            </MoodBtns>

            <InputGroup>
              <Label htmlFor="origin">출발지</Label>
              <Input
                id="origin"
                type="text"
                placeholder="예: 서울, 부산, 제주"
                value={origin}
                onChange={session && !allDisabled ? handleOriginChange : undefined}
                disabled={!session || allDisabled}
                style={!session || allDisabled ? disabledStyle : undefined}
                readOnly={!session || allDisabled}
                tabIndex={0}
                aria-label="출발지 입력"
              />
            </InputGroup>
            <InputGroup>
              <Label htmlFor="budget">예산</Label>
              <Input
                id="budget"
                type="text"
                placeholder="예산 금액 (원)"
                value={budget}
                onChange={session && !allDisabled ? handleBudgetChange : undefined}
                inputMode="numeric"
                maxLength={11}
                disabled={!session || allDisabled}
                style={!session || allDisabled ? disabledStyle : undefined}
                readOnly={!session || allDisabled}
                tabIndex={0}
                aria-label="예산 입력"
              />
            </InputGroup>

            {/* 프리미엄 혜택 안내 */}
            <Notice style={{ color: "#fc575e", marginBottom: "1.1rem" }}>
              동행/취향/스타일 옵션은 프리미엄에서만 사용 가능합니다.
            </Notice>

            {/* 프리미엄 옵션 폼 */}
            {showPremiumFields && (
              <div style={{
                animation: "fadeDown 0.28s",
                borderRadius: "1.1rem",
                background: "#f9f7fd",
                margin: "0 0 1.2rem 0",
                padding: "1.2rem 0.7rem 0.7rem 0.7rem",
                boxShadow: "0 2px 12px #b59ee833",
                border: "1.5px solid #efebf8"
              }}>
                {/* 동행 인원수 */}
                <InputGroup>
                  <Label>
                    동행 인원수
                    <PremiumLabel><FaLock />프리미엄</PremiumLabel>
                  </Label>
                  <Select
                    value={companionCount}
                    onChange={isLoggedIn && isPremium && !allDisabled ? (e) => setCompanionCount(e.target.value) : undefined}
                    disabled={!isPremium || !isLoggedIn || allDisabled}
                    style={!isPremium || !isLoggedIn || allDisabled ? disabledStyle : undefined}
                    onClick={!isPremium ? handlePremiumOpen : undefined}
                  >
                    <option value="">선택</option>
                    <option value="1">1명</option>
                    <option value="2">2명</option>
                    <option value="3">3명</option>
                    <option value="4">4명 이상</option>
                  </Select>
                </InputGroup>
                {/* 동행 성별 */}
                <InputGroup>
                  <Label>
                    동행 성별
                    <PremiumLabel><FaLock />프리미엄</PremiumLabel>
                  </Label>
                  <Select
                    value={companionGender}
                    onChange={e => setCompanionGender(e.target.value)}
                    disabled={!isPremium || !isLoggedIn || allDisabled}
                    style={!isPremium || !isLoggedIn || allDisabled ? disabledStyle : undefined}
                    onClick={!isPremium ? handlePremiumOpen : undefined}
                  >
                    <option value="">선택</option>
                    <option value="any">상관없음</option>
                    <option value="female">여성</option>
                    <option value="male">남성</option>
                  </Select>
                </InputGroup>
                {/* 동행 나이대 */}
                <InputGroup>
                  <Label>
                    동행 나이대
                    <PremiumLabel><FaLock />프리미엄</PremiumLabel>
                  </Label>
                  <Select
                    value={ageRange}
                    onChange={e => setAgeRange(e.target.value)}
                    disabled={!isPremium || !isLoggedIn || allDisabled}
                    style={!isPremium || !isLoggedIn || allDisabled ? disabledStyle : undefined}
                    onClick={!isPremium ? handlePremiumOpen : undefined}
                  >
                    <option value="">선택</option>
                    <option value="20대">20대</option>
                    <option value="30대">30대</option>
                    <option value="40대">40대</option>
                    <option value="50대+">50대 이상</option>
                  </Select>
                </InputGroup>
              </div>
            )}

            {/* 프리미엄 안내/유도 팝업 */}
            {showPremiumPopup && (
              <LoginOverlay onClick={() => setShowPremiumPopup(false)}>
                <LoginNoticeMsg onClick={e => e.stopPropagation()}>
                  <span style={{ fontSize: "1.25em", display: "block", marginBottom: 8 }}>
                    프리미엄 옵션은 무료로 이용 가능합니다!
                  </span>
                  <span style={{ fontSize: "1.05em", color: "#8a5fd2", fontWeight: 500 }}>
                    아래 프리미엄 무료 이용 버튼을 눌러<br />프리미엄 옵션을 활성화하세요.
                  </span>
                  <PrimaryBtn
                    $active={isLoggedIn}
                    style={{ marginTop: 18 }}
                    onClick={handleSetPremium}
                    disabled={!isLoggedIn}
                  >
                    프리미엄 무료 이용하기
                  </PrimaryBtn>
                </LoginNoticeMsg>
              </LoginOverlay>
            )}

            <PrimaryBtn
              tabIndex={0}
              aria-label="여행지 추천 받기"
              onClick={session && !allDisabled ? handleRecommend : undefined}
              disabled={!session || allDisabled}
              $active={!!session && !allDisabled}
              style={
                !session || allDisabled
                  ? { ...disabledStyle, background: "#eee" }
                  : undefined
              }
            >
              {isLoading ? "로딩 중..." : "여행지 추천 받기"}
            </PrimaryBtn>

            <ButtonGroup>
              <PrimaryBtn
                tabIndex={0}
                aria-label={isMatching() ? "매칭 취소하기" : "랜덤 매칭하기"}
                onClick={
                  isLoggedIn && isPremium
                    ? () => {
                        if (isMatching()) {
                          handleCancelMatchWait();
                        } else {
                          if (!mood || !origin || !budget) {
                            showInputNotice();
                            return;
                          }
                          handleRandomMatch();
                        }
                      }
                    : undefined
                }
                disabled={
                  !isLoggedIn ||
                  !isPremium ||
                  !mood ||
                  !origin ||
                  !budget ||
                  allDisabled
                }
                $active={isLoggedIn && isPremium && mood && origin && budget && !allDisabled}
                style={
                  !isLoggedIn || !isPremium || !mood || !origin || !budget || allDisabled
                    ? { ...disabledStyle, background: "#eee" }
                    : undefined
                }
              >
                {isMatching()
                  ? "매칭 취소하기"
                  : "랜덤 매칭하기"}
              </PrimaryBtn>

              {isMatching() && (
                <MatchNotice>
                  상대방을 찾는 중입니다... <br />잠시만 기다려주세요!
                </MatchNotice>
              )}

              <PrimaryBtn
                tabIndex={0}
                aria-label="프리미엄 옵션 보기"
                type="button"
                $active={isLoggedIn && isPremium && !allDisabled}
                disabled={!isLoggedIn || !isPremium || allDisabled}
                onClick={isLoggedIn && isPremium && !allDisabled ? handlePremiumOpen : undefined}
                style={{
                  ...((!isLoggedIn || !isPremium || allDisabled) && { background: "#eee", color: "#bbb", cursor: "not-allowed" }),
                  marginBottom: showPremiumFields ? "0.8rem" : "1.8rem"
                }}
              >
                {showPremiumFields ? "프리미엄 옵션 닫기" : "프리미엄 옵션 보기"}
              </PrimaryBtn>
            </ButtonGroup>

            {/* 프리미엄 무료 이용가능 버튼 (비프리미엄 때만) */}
            {!isPremium && (
              <PremiumBtn
                tabIndex={0}
                aria-label="프리미엄 무료 이용가능"
                onClick={isLoggedIn && !allDisabled ? handleSetPremium : undefined}
                disabled={!isLoggedIn || allDisabled}
                style={{
                  background: "#7b2ff2",
                  color: "#fff",
                  cursor: !isLoggedIn || allDisabled ? "not-allowed" : "pointer"
                }}
              >
                <span style={{ marginRight: 8 }}>🔒</span> 프리미엄 무료 이용가능 !
              </PremiumBtn>
            )}

            <Notice aria-live="polite">{notice}</Notice>
            <EmotionMsg style={{ color: MOOD_COLOR_MAP[mood || "기본"] }} aria-live="polite">
              {EMOTION_MSG[mood || "기본"]}
            </EmotionMsg>

            {!isLoggedIn && (
              <LoginOverlay>
                <LoginNoticeMsg>
                  <div style={{ fontSize: 38, marginBottom: 12 }}>🌏</div>
                  <span style={{ fontWeight: 800, fontSize: "1.22em", color: "#7b2ff2" }}>
                    로그인이 필요해요!
                  </span>
                  <div style={{ margin: "13px 0 0 0", fontWeight: 600, color: "#ab7fc5" }}>
                    회원가입 없이 <b style={{ color: "#fc575e" }}>간편 로그인</b>으로<br />
                    오늘의 여행지 추천을 받아보세요!
                  </div>
                  <div style={{
                    marginBottom: 8,
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <span style={{
                      background: "#fff",
                      color: "#7b2ff2",
                      borderRadius: "0.7em",
                      padding: "0.16em 0.9em",
                      fontWeight: 700,
                      fontSize: "0.93em",
                      boxShadow: "0 2px 8px #d1c1ee22"
                    }}>
                      SNS(네이버·카카오·구글) 간편 로그인 지원
                    </span>
                  </div>
                  <LoginButton onClick={handleLogin}>
                    간편 로그인 시작하기
                  </LoginButton>
                  <div style={{ marginTop: 18, fontSize: "0.97em", color: "#9c92b6", fontWeight: 500 }}>
                    감정/출발지/예산 입력은 로그인 후 바로 가능해요
                  </div>
                  <div style={{ marginTop: 16, fontSize: "0.91em", color: "#b2a8c7" }}>
                    Spontany에서 즉흥여행을 시작하세요!
                  </div>
                </LoginNoticeMsg>
              </LoginOverlay>
            )}
          </FormBox>
          {/* 채팅 팝업 버튼 */}
          {isClient && matchId && session !== null && !chatOpen && !allDisabled && (
            <button
              onClick={() => setChatOpen(true)}
              style={{
                position: "fixed",
                right: 28,
                bottom: 32,
                zIndex: 1999,
                background: "linear-gradient(90deg, #7b2ff2 0%, #f357a8 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 58,
                height: 58,
                boxShadow: "0 4px 18px #a18cd144",
                fontSize: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              aria-label="채팅 열기"
            >
              <FaLock />
            </button>
          )}
          {/* 채팅 팝업 */}
          {isClient && matchId && session !== null && chatOpen && (
            <ChatPopupBackdrop onClick={() => setChatOpen(false)}>
              <ChatPopupWrap onClick={e => e.stopPropagation()}>
                <ChatPopupHeader>
                  <span>
                    <FaLock /> 동행 채팅방
                  </span>
                  <ChatPopupClose onClick={() => setChatOpen(false)} aria-label="채팅 닫기">&times;</ChatPopupClose>
                </ChatPopupHeader>
                <ChatDivider />
                <ChatBox matchId={matchId} myName={session?.user?.name || "me"} />
              </ChatPopupWrap>
            </ChatPopupBackdrop>
          )}
        </CenterWrap>
      </ResponsiveWrap>
    </>
  );
}

// 팝업 ChatBox 스타일
const ChatPopupBackdrop = styled.div`
  position: fixed;
  z-index: 2000;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(60, 40, 100, 0.13);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
`;

const ChatPopupWrap = styled.div`
  position: fixed;
  right: 2vw;
  bottom: 3vh;
  z-index: 2100;
  width: 400px;
  max-width: 95vw;
  background: rgba(255,255,255,0.97);
  border-radius: 1.3rem 1.3rem 1.1rem 1.1rem;
  box-shadow: 0 8px 32px #a18cd144;
  border: 1.5px solid #e0d7fa;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  animation: popupOpen 0.23s cubic-bezier(.4,1.6,.5,1) both;

  @media (max-width: 600px) {
    right: 0;
    left: 0;
    bottom: 0;
    top: auto;
    width: 100vw;
    min-height: 62vh;
    max-height: 90vh;
    border-radius: 1.1rem 1.1rem 0 0;
    margin: 0;
  }
  @keyframes popupOpen {
    0% { transform: translateY(60px) scale(0.97); opacity: 0; }
    100% { transform: none; opacity: 1; }
`;

const ChatPopupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem 0.5rem 1.2rem;
  font-size: 1.13rem;
  font-weight: 800;
  color: #7b2ff2;
  letter-spacing: -0.01em;
  svg { color: #fc575e; font-size: 1.2em; margin-right: 0.5em; }
`;

const ChatPopupClose = styled.button`
  background: none;
  border: none;
  color: #bbb;
  font-size: 1.5em;
  cursor: pointer;
  transition: color 0.13s;
  margin-left: 0.5em;
  &:hover { color: #fc575e; }
`;

const ChatDivider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, #fbc2eb33 0%, #a6c1ee33 100%);
  margin: 0.2rem 0 0.7rem 0;
`;

const LoginOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100%; height: 100%;
  background: rgba(255,255,255,0.82);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
`;

const LoginNoticeMsg = styled.div`
  background: linear-gradient(90deg, #fbc2eb 0%, #a6c1ee 100%);
  color: #7b2ff2;
  font-size: 1.22rem;
  font-weight: 900;
  padding: 2.2rem 2.3rem;
  border-radius: 1.2rem;
  box-shadow: 0 4px 24px #c7b9b933;
  border: 2px solid #e0d7fa;
  text-align: center;
  letter-spacing: -0.01em;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 600px) {
    padding: 1.1rem 0.6rem;
    font-size: 1.05rem;
    min-width: unset;
    border-radius: 1em;
  }
`;

// LoginButton은 이미 모바일 대응 CSS가 적용되어 있습니다.
// 반응형에서 버튼이 한 줄에 안 들어가면 글자 줄이기(예시)
const LoginButton = styled.button`
  margin-top: 18px;
  padding: 1em 2.1em;
  font-weight: 900;
  background: linear-gradient(90deg,#fc575e,#a6c1ee);
  border: none;
  border-radius: 0.95em;
  color: #fff;
  font-size: 1.09em;
  cursor: pointer;
  box-shadow: 0 2px 16px #c7b9b955;
  transition: filter .13s, transform .11s, background .13s;
  &:hover {
    filter: brightness(1.13);
    transform: scale(1.04);
    background: linear-gradient(90deg,#a6c1ee,#fc575e);
  }
  &:active {
    filter: brightness(0.93);
    transform: scale(0.98);
  }
  @media (max-width: 600px) {
    font-size: 0.97em;
    padding: 0.92em 1.1em;
    white-space: normal;
    word-break: keep-all;
  }
`;

const Toast = styled.div`
  position: fixed;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff6f7;
  color: #fc575e;
  border-radius: 1em;
  padding: 1em 2em;
  font-weight: 900;
  box-shadow: 0 4px 16px #fc575e22;
  font-size: 1.07em;
  z-index: 3999;
  animation: fadeInUp 0.25s;
  @keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(40px) scale(0.97); }
    100% { opacity: 1; transform: none; }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem; /* 버튼 간 간격 */
  margin: 2.1rem 0 1.2rem 0;
  align-items: stretch;
`;

const MatchNotice = styled(Notice)`
  color: #7b2ff2;
  background: linear-gradient(90deg, #fbc2eb22 0%, #a6c1ee22 100%);
  margin: 1.1rem 0 0.7rem 0;
  font-size: 1.13rem;
  font-weight: 900;
  border-radius: 1.1em;
  padding: 1.1em 0.7em;
  box-shadow: 0 2px 12px #b59ee822;
  letter-spacing: -0.01em;
  min-height: 2.2em;
  text-align: center;
`;