import React, { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

// 글로벌 폰트 및 버튼 애니메이션
const GlobalFonts = createGlobalStyle`
  @font-face {
    font-family: 'Spontany';
    src: url('/fonts/Spontany.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  body { font-family: "Spontany", "Pretendard", "Montserrat", sans-serif; }
`;

// --- 스타일 정의 ---
const HeaderWrap = styled.header`
  width: 100vw; min-height: 64px;
  background: linear-gradient(90deg, #fbc2eb 0%, #a6c1ee 100%);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 2.2rem;
  box-shadow: 0 2px 16px #e5d6f733;
  position: fixed; top: 0; left: 0; right: 0; z-index: 10000;
  box-sizing: border-box;
  @media (max-width: 600px) { padding: 0 0.7rem; min-height: 52px; }
`;

const Logo = styled(Link)`
  display: flex; align-items: center;
  font-family: "Spontany", "Montserrat", "Pretendard", sans-serif;
  font-size: 2.1rem; font-weight: 900; letter-spacing: -0.03em;
  color: #7b2ff2; text-decoration: none;
  background: linear-gradient(90deg, #7b2ff2 10%, #f357a8 90%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text; text-fill-color: transparent;
  filter: drop-shadow(0 2px 12px #fbc2eb55);
  transition: color 0.18s;
  &:hover {
    color: #fc575e; -webkit-text-fill-color: #fc575e; text-fill-color: #fc575e; background: none;
  }
`;

const Nav = styled.nav`
  display: flex; align-items: center; gap: 1.2rem;
`;

const LoginBtn = styled.div`
  margin-left: auto; display: flex; align-items: center;
`;

const AuthBtn = styled.button`
  background: #7b2ff2;
  color: #fff;
  border: none;
  border-radius: 0.7rem;
  padding: 0.7em 1.4em;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, transform .13s;
  will-change: transform;
  box-shadow: 0 2px 10px #c7b9b922;
  &:hover, &:focus {
    background: #fc575e;
    transform: scale(1.045);
    filter: brightness(1.08);
  }
  &:active { background: #fc575e; transform: scale(0.98); }
  @media (max-width: 600px) {
    padding: 0.63em 1.1em; font-size: 0.94rem;
    min-width: 86px;
  }
`;

const GoogleBtn = styled(AuthBtn)`
  background: #fff; color: #222; border: 1.5px solid #eee;
  &:hover { background: #f5f5f5; }
`;
const NaverBtn = styled(AuthBtn)`
  background: #03c75a; color: #fff;
  &:hover { background: #02b152; }
`;
const KakaoBtn = styled(AuthBtn)`
  background: #fee500; color: #3c1e1e; border: 1.5px solid #f7e600;
  &:hover { background: #ffe45c; }
`;

const ModalBackdrop = styled.div`
  position: fixed; z-index: 20000; left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.32); display: flex; align-items: center; justify-content: center;
`;

const ModalBox = styled.div`
  background: #fff;
  border-radius: 1.2rem;
  padding: 2.2rem 2.2rem 1.5rem 2.2rem;
  box-shadow: 0 6px 32px #0002;
  min-width: 320px; max-width: 94vw;
  text-align: center; position: relative;
`;

const ModalClose = styled.button`
  position: absolute; top: 18px; right: 28px;
  background: none; border: none; font-size: 1.7rem; color: #bbb; cursor: pointer;
  &:hover { color: #fc575e; }
`;

// 토스트 메시지 스타일
const Toast = styled.div`
  position: fixed; top: 22px; left: 50%; transform: translateX(-50%);
  background: #fff6f7; color: #fc575e;
  border-radius: 1em; padding: 1em 2em; font-weight: 900;
  box-shadow: 0 4px 16px #fc575e22; font-size: 1.07em; z-index: 39999;
  animation: fadeInUp 0.25s;
  @keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(40px) scale(0.97); }
    100% { opacity: 1; transform: none; }
  }
`;
// --- 컴포넌트 ---
export default function Header() {
  const { data: session } = useSession();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // SNS 로그인 실패 핸들링 (ex. 팝업 닫음, 취소 등)
  async function handleLogin(provider) {
    try {
      const res = await signIn(provider, { redirect: false });
      if (res?.error) showToast("SNS 로그인에 실패했어요. 다시 시도해 주세요");
    } catch (e) {
      showToast("SNS 로그인에 실패했어요. 다시 시도해 주세요");
    }
  }
  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 1700);
  }

  // 모달 닫기: esc 지원, 클릭 차단
  function closeModal() { setShowLoginModal(false); }

  return (
    <>
      <GlobalFonts />
      {toastMsg && <Toast>{toastMsg}</Toast>}
      <HeaderWrap>
        <Logo href="/">Spontany</Logo>
        <Nav>
          <LoginBtn>
            {session ? (
              <AuthBtn tabIndex={0} aria-label="로그아웃" onClick={() => signOut()}>로그아웃</AuthBtn>
            ) : (
              <AuthBtn tabIndex={0} aria-label="로그인" onClick={() => setShowLoginModal(true)}>로그인</AuthBtn>
            )}
          </LoginBtn>
        </Nav>
        {showLoginModal && (
          <ModalBackdrop onClick={closeModal}>
            <ModalBox onClick={(e) => e.stopPropagation()}>
              <ModalClose onClick={closeModal} aria-label="닫기">&times;</ModalClose>
              <div style={{
                fontWeight: 700, fontSize: "1.2rem", color: "#7b2ff2", marginBottom: 16,
              }}>로그인</div>
              <GoogleBtn onClick={() => handleLogin("google")}>
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                  alt="Google" width={22} height={22} style={{ background: "#fff", borderRadius: "50%" }} />
                구글로 로그인
              </GoogleBtn>
              <NaverBtn onClick={() => handleLogin("naver")}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2e/Naver_Logotype.svg"
                  alt="Naver" width={22} height={22} style={{ background: "#fff", borderRadius: "50%" }} />
                네이버로 로그인
              </NaverBtn>
              <KakaoBtn onClick={() => handleLogin("kakao")}>
                <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/kakao.svg"
                  alt="Kakao" width={22} height={22} style={{ background: "#fee500", borderRadius: "50%" }} />
                카카오로 로그인
              </KakaoBtn>
            </ModalBox>
          </ModalBackdrop>
        )}
      </HeaderWrap>
    </>
  );
}