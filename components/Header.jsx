import React, { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

// 글로벌 폰트 (생략 가능)
const GlobalFonts = createGlobalStyle`
  body { font-family: "Pretendard", "Montserrat", sans-serif; }
`;

// --- 스타일 정의 ---
const HeaderWrap = styled.header`
  width: 100vw; min-height: 64px;
  background: linear-gradient(90deg, #fbc2eb 0%, #a6c1ee 100%);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 2.2rem; box-shadow: 0 2px 16px #e5d6f733;
  position: fixed; top: 0; left: 0; right: 0; z-index: 10000; box-sizing: border-box;
  @media (max-width: 600px) { padding: 0 0.7rem; min-height: 52px; }
`;

const Logo = styled(Link)`
  font-size: 2.1rem; font-weight: 900; letter-spacing: -0.03em;
  color: #7b2ff2; text-decoration: none;
  background: linear-gradient(90deg, #7b2ff2 10%, #f357a8 90%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
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
`;

const Nickname = styled.span`
  font-weight: 700;
  font-size: 1.08em;
  color: #865ad6;
  margin-right: 12px;
  @media (max-width: 600px) { margin-right: 7px; font-size: 0.97em; }
`;

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
  const [toastMsg, setToastMsg] = useState("");

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 1700);
  }

  return (
    <>
      <GlobalFonts />
      {toastMsg && <Toast>{toastMsg}</Toast>}
      <HeaderWrap>
        <Logo href="/">Spontany</Logo>
        <Nav>
          <LoginBtn>
            {session && (
              <Nickname>
                {session.user?.name ? `${session.user.name}님` : ""}
              </Nickname>
            )}
            {session ? (
              <AuthBtn tabIndex={0} aria-label="로그아웃" onClick={() => signOut()}>로그아웃</AuthBtn>
            ) : (
              <AuthBtn tabIndex={0} aria-label="로그인" onClick={() => signIn()}>로그인</AuthBtn>
            )}
          </LoginBtn>
        </Nav>
      </HeaderWrap>
    </>
  );
}