import styled, { css } from "styled-components";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useRef } from "react";
import { FaLock, FaBan } from "react-icons/fa";
import ChatBox from "@/components/ChatBox"; // 반드시 추가

const MOOD_BG_MAP = {
  기본: "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80",
  기분전환: "https://images.unsplash.com/photo-1747372236557-6a201063ab35?auto=format&fit=crop&w=1600&q=80",
  힐링: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  설렘: "/sakura.jpg",
};

const BgFade = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  transition: opacity 0.7s;
  background: ${({ $bg }) => `url('${$bg}') no-repeat center/cover`};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: none;
`;

const CenterWrap = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const FormBox = styled.div`
  width: 100%;
  max-width: 440px;
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 2px 16px #c7b9b91c;
  padding: 2.6rem 1.7rem 1.6rem 1.7rem;
  text-align: center;
  position: relative;
  box-sizing: border-box;
  z-index: 5;
`;

const Title = styled.h2`
  font-size: 1.28rem;
  font-weight: 700;
  color: #222;
  letter-spacing: -0.02em;
  margin-bottom: 0.7rem;
`;

const SubTitle = styled.div`
  font-size: 1.01rem;
  color: #ab7fc5;
  margin-bottom: 1.45rem;
  font-weight: 500;
`;

const MoodBtns = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 1.2rem;
`;

const MoodBtn = styled.button`
  flex: 1 1 0;
  border: 2px solid #eee;
  background: #f8f8f8;
  color: #777;
  font-size: 1.08rem;
  font-weight: 600;
  border-radius: 0.92rem;
  padding: 0.94rem 0;
  cursor: pointer;
  transition: border 0.13s, background 0.13s, color 0.13s;
  ${({ $active }) =>
    $active &&
    css`
      border: 2.3px solid #fc575e;
      background: #fff4f0;
      color: #fc575e;
      font-weight: 700;
    `}
  &:hover {
    border: 2.3px solid #fca86c;
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
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 0.8rem;
  width: 100%;
`;

const Label = styled.label`
  margin: 0 0 0.18rem 0.05rem;
  text-align: left;
  font-size: 1.04rem;
  font-weight: 600;
  color: #333;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 0.4em;
`;

const PremiumLabel = styled.span`
  display: inline-flex;
  align-items: center;
  background: #ffeac2;
  color: #ca9600;
  border-radius: 0.7rem;
  font-size: 0.90rem;
  font-weight: 600;
  padding: 0.07em 0.6em;
  margin-left: 0.4em;
  svg {
    margin-right: 4px;
    font-size: 0.98em;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.84rem 1rem;
  font-size: 1.06rem;
  border: 1.5px solid #ececec;
  border-radius: 0.85rem;
  color: #222;
  background: #f9f9f9;
  box-sizing: border-box;
  margin-bottom: 0;
  transition: border 0.13s;
  &:focus {
    outline: none;
    border-color: #fc575e;
    background: #fff9f8;
  }
  &:disabled {
    background: #f2f2f2;
    color: #bbb;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.84rem 1rem;
  font-size: 1.06rem;
  border: 1.5px solid #ececec;
  border-radius: 0.85rem;
  color: ${({ disabled }) => (disabled ? "#bbb" : "#222")};
  background: ${({ disabled }) => (disabled ? "#f2f2f2" : "#f9f9f9")};
  box-sizing: border-box;
  margin-bottom: 0.1rem;
  transition: border 0.13s;
  &:focus {
    outline: none;
    border-color: #fc575e;
    background: #fff9f8;
  }
`;

const TagInput = styled.input`
  width: 100%;
  padding: 0.7rem 1rem;
  font-size: 1rem;
  border: 1.5px dashed #e0b5ea;
  border-radius: 0.85rem;
  color: #7449aa;
  background: #faf5fd;
  box-sizing: border-box;
  margin-bottom: 0.18rem;
  &:focus {
    outline: none;
    border-color: #fc575e;
    background: #fff9f8;
  }
  &:disabled {
    background: #f2f2f2;
    color: #bbb;
    cursor: not-allowed;
  }
`;

const TagDesc = styled.div`
  color: #b597d6;
  font-size: 0.90rem;
  margin-bottom: 0.5rem;
  text-align: left;
`;

const PrimaryBtn = styled.button`
  width: 100%;
  background: ${({ $active }) =>
    $active
      ? "linear-gradient(90deg, #ffb16c, #fc575e)"
      : "#eee"};
  color: ${({ $active }) => ($active ? "white" : "#bbb")};
  border: none;
  border-radius: 0.95rem;
  font-size: 1.16rem;
  font-weight: 700;
  padding: 1.08rem 0;
  margin: 1.1rem 0 0.4rem 0;
  cursor: ${({ $active }) => ($active ? "pointer" : "not-allowed")};
  transition: background 0.15s, color 0.11s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  box-shadow: ${({ $active }) =>
    $active
      ? "0 1.5px 12px #fc575e19"
      : "none"};
  &:hover {
    background: ${({ $active }) =>
      $active
        ? "linear-gradient(90deg, #fc575e, #ffb16c)"
        : "#eee"};
  }
`;

const DisabledBtn = styled(PrimaryBtn)`
  background: #eee !important;
  color: #bbb !important;
  cursor: not-allowed;
  &:hover {
    background: #eee !important;
  }
`;

const PremiumBtn = styled(PrimaryBtn)`
  background: #f2eaf8 !important;
  color: #865ad6 !important;
  margin-top: 0.47rem;
  border: 1.5px solid #f2eaf8;
  svg {
    margin-right: 8px;
    font-size: 1.13em;
    vertical-align: middle;
  }
`;

const Notice = styled.div`
  color: #fa5757;
  font-size: 1.03rem;
  margin-top: 0.40rem;
  font-weight: 600;
  min-height: 1.2em;
  letter-spacing: -0.01em;
  text-align: center;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100%; height: 100%;
  z-index: 10;
  cursor: not-allowed;
`;

const EmotionMsg = styled.div`
  margin-top: 1.8rem;
  font-size: 1.07rem;
  color: #a790d7;
  background: rgba(249,244,255,0.53);
  padding: 9px 0 7px 0;
  border-radius: 1rem;
  font-weight: 500;
  box-shadow: 0 2px 10px #dbd1e315;
  min-height: 1.4em;
`;

const ResponsiveWrap = styled.div`
  @media (max-width: 600px) {
    ${FormBox} {
      max-width: 98vw;
      padding: 1.2rem 0.7rem 1.1rem 0.7rem;
    }
    ${Title} {
      font-size: 1.01rem;
      margin-bottom: 0.45rem;
    }
    ${Input}, ${Select}, ${TagInput} {
      font-size: 0.97rem;
      padding: 0.67rem 0.7rem;
    }
    ${PrimaryBtn}, ${PremiumBtn}, ${DisabledBtn} {
      font-size: 1.05rem;
      padding: 0.7rem 0;
    }
    ${EmotionMsg} {
      font-size: 0.93rem;
      margin-top: 1.0rem;
    }
  }
`;

function isValidOrigin(origin) {
  if (typeof origin !== "string") return false;
  const cleaned = origin.replace(/\s/g, "");
  return cleaned.length >= 2;
}

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const [isPremium, setIsPremium] = useState(false);
  const [mood, setMood] = useState("");
  const [origin, setOrigin] = useState("");
  const [budget, setBudget] = useState("");
  const [companionCount, setCompanionCount] = useState("");
  const [companionGender, setCompanionGender] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [tags, setTags] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [notice, setNotice] = useState("");
  const noticeTimeout = useRef();
  const [bgMood, setBgMood] = useState("기본");
  const [matchId, setMatchId] = useState(""); // matchId 상태

  const handleBudgetChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) {
      setBudget("");
      return;
    }
    setBudget(parseInt(val, 10).toLocaleString());
  };

  const handleOriginChange = session
    ? (e) => {
        const onlyText = e.target.value.replace(/[0-9]/g, "");
        setOrigin(onlyText);
      }
    : undefined;

  const showLoginNotice = () => {
    if (noticeTimeout.current) clearTimeout(noticeTimeout.current);
    setNotice("로그인 후 이용 가능합니다");
    noticeTimeout.current = setTimeout(() => setNotice(""), 1500);
  };

  const showInputNotice = () => {
    if (noticeTimeout.current) clearTimeout(noticeTimeout.current);
    setNotice("작성란을 입력해주세요");
    noticeTimeout.current = setTimeout(() => setNotice(""), 1500);
  };

  const handleOverlayClick = (e) => {
    e.stopPropagation();
    showLoginNotice();
  };

  const recommendActive = !!(session && mood && origin && budget);

   const handleMoodClick = (newMood) => {
    setMood(newMood);
    setBgMood(newMood);
  };

  const EMOTION_MSG = {
    설렘: "설렘 가득한 오늘, 새로운 여행을 추천해드릴게요!",
    힐링: "마음이 지친 날엔, 편안한 여행지로 안내해드릴게요.",
    기분전환: "답답한 일상엔, 기분전환이 필요하죠!",
    기본: "지금 내 기분에 딱 맞는 여행지를 찾아보세요.",
  };

     return (
    <ResponsiveWrap>
  {/* 배경 */}
  {Object.entries(MOOD_BG_MAP).map(([key, url]) => (
    <BgFade key={key} $bg={url} $visible={bgMood === key} />
  ))}
  <CenterWrap>
    <FormBox>
      <Title>
        오늘의 감정을 선택하고<br />
        여행지 추천을 받아보세요
      </Title>
      <SubTitle>
        프리미엄이면 동행/취향까지 내맘대로! <b>무료 추천은 로그인만 하면 OK</b>
      </SubTitle>
      <MoodBtns>
        <MoodBtn
          onClick={session ? () => handleMoodClick("설렘") : undefined}
          disabled={!session}
          $active={mood === "설렘"}
        >
          설렘
        </MoodBtn>
        <MoodBtn
          onClick={session ? () => handleMoodClick("힐링") : undefined}
          disabled={!session}
          $active={mood === "힐링"}
        >
          힐링
        </MoodBtn>
        <MoodBtn
          onClick={session ? () => handleMoodClick("기분전환") : undefined}
          disabled={!session}
          $active={mood === "기분전환"}
        >
          기분전환
        </MoodBtn>
      </MoodBtns>
      {/* 기본 필터 */}
      <InputGroup>
        <Label htmlFor="origin">출발지</Label>
        <Input
          id="origin"
          type="text"
          placeholder="예: 서울, 부산, 제주"
          value={origin}
          onChange={handleOriginChange}
          disabled={!session}
          onClick={!session ? showLoginNotice : undefined}
          pattern="^[^0-9]*$"
          inputMode="text"
          autoComplete="off"
        />
      </InputGroup>
      <InputGroup>
        <Label htmlFor="budget">예산</Label>
        <Input
          id="budget"
          type="text"
          placeholder="예산 금액 (원)"
          value={budget}
          onChange={session ? handleBudgetChange : undefined}
          inputMode="numeric"
          maxLength={11}
          disabled={!session}
          onClick={!session ? showLoginNotice : undefined}
        />
      </InputGroup>
      {/* --- 프리미엄 전용 필터 --- */}
      <InputGroup>
        <Label>
          동행 인원수
          <PremiumLabel><FaLock />프리미엄</PremiumLabel>
        </Label>
        <Select
          value={companionCount}
          onChange={e => setCompanionCount(e.target.value)}
          disabled={!isPremium}
        >
          <option value="">선택</option>
          <option value="1">1명</option>
          <option value="2">2명</option>
          <option value="3">3명</option>
          <option value="4">4명 이상</option>
        </Select>
      </InputGroup>
      <InputGroup>
        <Label>
          동행 성별
          <PremiumLabel><FaLock />프리미엄</PremiumLabel>
        </Label>
        <Select
          value={companionGender}
          onChange={e => setCompanionGender(e.target.value)}
          disabled={!isPremium}
        >
          <option value="">선택</option>
          <option value="any">상관없음</option>
          <option value="female">여성</option>
          <option value="male">남성</option>
        </Select>
      </InputGroup>
      <InputGroup>
        <Label>
          동행 나이대
          <PremiumLabel><FaLock />프리미엄</PremiumLabel>
        </Label>
        <Select
          value={ageRange}
          onChange={e => setAgeRange(e.target.value)}
          disabled={!isPremium}
        >
          <option value="">선택</option>
          <option value="20대">20대</option>
          <option value="30대">30대</option>
          <option value="40대">40대</option>
          <option value="50대+">50대 이상</option>
        </Select>
      </InputGroup>
      <InputGroup>
        <Label>
          취향 태그
          <PremiumLabel><FaLock />프리미엄</PremiumLabel>
        </Label>
        <TagInput
          type="text"
          placeholder="#힐링, #액티비티, #먹방"
          value={tags}
          onChange={e => setTags(e.target.value)}
          disabled={!isPremium}
          maxLength={30}
        />
        <TagDesc>콤마 또는 #으로 구분 (예: #음악, #조용한, #먹방)</TagDesc>
      </InputGroup>
      <InputGroup>
        <Label>
          여행 스타일
          <PremiumLabel><FaLock />프리미엄</PremiumLabel>
        </Label>
        <Select
          value={travelStyle}
          onChange={e => setTravelStyle(e.target.value)}
          disabled={!isPremium}
        >
          <option value="">선택</option>
          <option value="자유여행">자유여행</option>
          <option value="패키지">패키지</option>
          <option value="즉흥여행">즉흥여행</option>
          <option value="힐링">힐링</option>
          <option value="액티비티">액티비티</option>
        </Select>
      </InputGroup>
      {/* --- 프리미엄 전용 필터 끝 --- */}
      <PrimaryBtn
        onClick={() => {
          if (!session) return;
          if (!mood || !origin || !budget) return showInputNotice();
          if (!isValidOrigin(origin)) {
            setNotice("출발지는 2글자 이상 입력해주세요");
            if (noticeTimeout.current) clearTimeout(noticeTimeout.current);
            noticeTimeout.current = setTimeout(() => setNotice(""), 1500);
            return;
          }
          router.push({
            pathname: "/result",
            query: { departure: origin, budget, mood },
          });
        }}
        disabled={!session}
        $active={session}
      >
        여행지 추천 받기
      </PrimaryBtn>

      {/* ✅ 실전 매칭 연동: 버튼 클릭 시 matchId 받아서 세팅 */}
      {isPremium ? (
        <PrimaryBtn
          onClick={async () => {
            if (!session) return;
            const res = await fetch("/api/match", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: session.user.email,
                mood,
                origin,
                style: travelStyle,
              }),
            });
            const data = await res.json();
            if (data.matchId) setMatchId(data.matchId);
            else alert("매칭 실패");
          }}
          $active={true}
        >
          랜덤 매칭하기
        </PrimaryBtn>
      ) : (
        <DisabledBtn>
          <FaBan style={{ marginRight: 8, fontSize: "1.12em" }} />
          랜덤 매칭하기
        </DisabledBtn>
      )}

      <PremiumBtn
        onClick={() => setIsPremium(true)}
        style={{ opacity: isPremium ? 0.6 : 1, pointerEvents: isPremium ? "none" : "auto" }}
      >
        <FaLock />
        프리미엄으로 전환하고 매칭 시작하기
      </PremiumBtn>
      <Notice>{notice}</Notice>
      <EmotionMsg>
        {EMOTION_MSG[mood || "기본"]}
      </EmotionMsg>
      {!session && <Overlay onClick={handleOverlayClick} />}
    </FormBox>
    {/* 채팅방 */}
    {matchId && (
      <div style={{ marginTop: 36, width: 400, maxWidth: "90vw" }}>
        <ChatBox matchId={matchId} myName={session?.user?.name || "me"} />
      </div>
    )}
  </CenterWrap>
</ResponsiveWrap>
  );
}