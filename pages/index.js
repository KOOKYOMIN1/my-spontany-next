import styled, { css } from "styled-components";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useRef } from "react";
import { FaLock, FaBan } from "react-icons/fa";

// 감정별 배경 이미지
const MOOD_BG_MAP = {
  기본: "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80",
  기분전환: "https://images.unsplash.com/photo-1747372236557-6a201063ab35?auto=format&fit=crop&w=1600&q=80",
  힐링: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  설렘: "/sakura.jpg", // public/sakura.jpg
};

const BgFade = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  transition: opacity 0.7s;
  background: ${({ bg }) => `url('${bg}') no-repeat center/cover`};
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  pointer-events: none;
`;

const HeaderContainer = styled.header`
  width: 100vw;
  min-width: 350px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 0 0 2vw;
  position: fixed;
  top: 0; left: 0;
  z-index: 200;
  background: #fff;
  border-bottom: 1px solid #f2f2f2;
`;

const Logo = styled.div`
  font-size: 1.55rem;
  font-weight: 700;
  color: #222;
  user-select: none;
  cursor: pointer;
  letter-spacing: -0.01em;
`;

const HeaderBtn = styled.button`
  background: #fff;
  color: #ff914d;
  border: 2px solid #ff914d;
  border-radius: 2rem;
  padding: 0.53rem 2.1rem;
  font-size: 1.10rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.14s, color 0.13s, border 0.13s;
  position: fixed;
  right: 2vw;
  top: 12px;
  z-index: 201;
  box-shadow: none;
  &:hover {
    background: #ff914d;
    color: #fff;
    border-color: #ff914d;
  }
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
  max-width: 430px;
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 2px 16px #c7b9b91c;
  padding: 3.2rem 2rem 3.2rem 2rem;
  text-align: center;
  position: relative;
  box-sizing: border-box;
`;

const Title = styled.h2`
  font-size: 1.28rem;
  font-weight: 700;
  color: #222;
  letter-spacing: -0.02em;
  margin-bottom: 1.6rem;
`;

const MoodBtns = styled.div`
  display: flex;
  gap: 14px;
  margin-bottom: 1.5rem;
`;

const MoodBtn = styled.button`
  flex: 1 1 0;
  border: 2px solid #eee;
  background: #f8f8f8;
  color: #777;
  font-size: 1.12rem;
  font-weight: 600;
  border-radius: 0.92rem;
  padding: 1.08rem 0;
  cursor: pointer;
  transition: border 0.13s, background 0.13s, color 0.13s;
  ${({ active }) =>
    active &&
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
  margin-bottom: 1rem;
  width: 100%;
`;

const Label = styled.label`
  margin: 0 0 0.28rem 0.1rem;
  text-align: left;
  font-size: 1.08rem;
  font-weight: 600;
  color: #333;
  letter-spacing: -0.01em;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem;
  font-size: 1.1rem;
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

const PrimaryBtn = styled.button`
  width: 100%;
  background: ${({ active }) =>
    active
      ? "linear-gradient(90deg, #ffb16c, #fc575e)"
      : "#eee"};
  color: ${({ active }) => (active ? "white" : "#bbb")};
  border: none;
  border-radius: 0.95rem;
  font-size: 1.21rem;
  font-weight: 700;
  padding: 1.24rem 0;
  margin: 1.3rem 0 0.5rem 0;
  cursor: ${({ active }) => (active ? "pointer" : "not-allowed")};
  transition: background 0.15s, color 0.11s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: ${({ active }) =>
    active
      ? "0 1.5px 12px #fc575e19"
      : "none"};
  &:hover {
    background: ${({ active }) =>
      active
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
  background: #e6e6e6 !important;
  color: #858585 !important;
  margin-top: 0.55rem;
  border: 1.6px solid #e2e2e2;
  svg {
    margin-right: 8px;
    font-size: 1.13em;
    vertical-align: middle;
  }
`;

const Notice = styled.div`
  color: #fa5757;
  font-size: 1.07rem;
  margin-top: 0.55rem;
  font-weight: 600;
  min-height: 1.4em;
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

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const isPremium = false;
  const [mood, setMood] = useState("");
  const [origin, setOrigin] = useState("");
  const [budget, setBudget] = useState("");
  const [notice, setNotice] = useState("");
  const noticeTimeout = useRef();
  const [bgMood, setBgMood] = useState("기본");

  const handleBudgetChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) {
      setBudget("");
      return;
    }
    setBudget(parseInt(val, 10).toLocaleString());
  };

  const handleLoginPopup = () => {
    const width = 430;
    const height = 520;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(
      "/api/auth/signin",
      "SpontanyLogin",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

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

  return (
    <>
      {Object.entries(MOOD_BG_MAP).map(([key, url]) => (
        <BgFade key={key} bg={url} visible={bgMood === key} />
      ))}
      <HeaderContainer>
        <Logo onClick={() => router.push("/")}>Spontany</Logo>
      </HeaderContainer>
      {!session && <HeaderBtn onClick={handleLoginPopup}>로그인</HeaderBtn>}
      {session && <HeaderBtn onClick={() => signOut()}>로그아웃</HeaderBtn>}
      <CenterWrap>
        <FormBox>
          <Title>
            오늘의 감정을 선택하고
            <br />
            여행지 추천을 받아보세요
          </Title>
          <MoodBtns>
            <MoodBtn
              onClick={session ? () => handleMoodClick("설렘") : undefined}
              disabled={!session}
              active={mood === "설렘"}
            >
              설렘
            </MoodBtn>
            <MoodBtn
              onClick={session ? () => handleMoodClick("힐링") : undefined}
              disabled={!session}
              active={mood === "힐링"}
            >
              힐링
            </MoodBtn>
            <MoodBtn
              onClick={session ? () => handleMoodClick("기분전환") : undefined}
              disabled={!session}
              active={mood === "기분전환"}
            >
              기분전환
            </MoodBtn>
          </MoodBtns>
          <InputGroup>
            <Label htmlFor="origin">출발지</Label>
            <Input
              id="origin"
              type="text"
              placeholder=""
              value={origin}
              onChange={session ? (e) => setOrigin(e.target.value) : undefined}
              disabled={!session}
              onClick={!session ? showLoginNotice : undefined}
            />
          </InputGroup>
          <InputGroup>
            <Label htmlFor="budget">예산</Label>
            <Input
              id="budget"
              type="text"
              placeholder="예: 10,000"
              value={budget}
              onChange={session ? handleBudgetChange : undefined}
              inputMode="numeric"
              maxLength={11}
              disabled={!session}
              onClick={!session ? showLoginNotice : undefined}
            />
          </InputGroup>
          <PrimaryBtn
            onClick={() => {
              if (!session) return;
              if (!mood || !origin || !budget) return showInputNotice();
              alert("여행지 추천 기능!");
            }}
            disabled={!session}
            active={session}
          >
            여행지 추천 받기
          </PrimaryBtn>
          {isPremium ? (
            <PrimaryBtn
              onClick={() => alert("랜덤 매칭!")}
              active={true}
            >
              랜덤 매칭하기
            </PrimaryBtn>
          ) : (
            <DisabledBtn>
              <FaBan style={{ marginRight: 8, fontSize: "1.12em" }} />
              랜덤 매칭하기
            </DisabledBtn>
          )}
          <PremiumBtn onClick={() => alert("프리미엄으로 전환")}>
            <FaLock />
            프리미엄으로 전환하고 매칭 시작하기
          </PremiumBtn>
          <Notice>{notice}</Notice>
          {!session && <Overlay onClick={handleOverlayClick} />}
        </FormBox>
      </CenterWrap>
    </>
  );
}