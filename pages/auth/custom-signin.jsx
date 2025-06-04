import React from "react";
import styled, { keyframes } from "styled-components";
import { signIn } from "next-auth/react";

const fadeIn = keyframes`
  0% { opacity: 0; transform: scale(0.97);}
  100% { opacity: 1; transform: scale(1);}
`;

const ModalBackdrop = styled.div`
  position: fixed;
  z-index: 20000;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 12, 60, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.19s;
`;

const ModalBox = styled.div`
  background: #fff;
  border-radius: 1.2rem;
  padding: 2.2rem 2.2rem 1.5rem 2.2rem;
  box-shadow: 0 6px 32px #7b2ff211;
  min-width: 320px;
  max-width: 94vw;
  text-align: center;
  position: relative;
  animation: ${fadeIn} 0.22s;
  @media (max-width: 600px) {
    padding: 1.2rem 0.7rem 1.1rem 0.7rem;
    min-width: unset;
    border-radius: 1em;
  }
`;

const ModalClose = styled.button`
  position: absolute;
  top: 18px;
  right: 28px;
  background: none;
  border: none;
  font-size: 1.7rem;
  color: #bbb;
  cursor: pointer;
  &:hover {
    color: #fc575e;
  }
`;

const AuthBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.7em;
  justify-content: center;
  border: none;
  border-radius: 0.7rem;
  padding: 0.7em 1.4em;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 0.7rem;
  transition: background 0.15s, transform 0.1s;
  &:active {
    transform: scale(0.96);
    filter: brightness(0.96);
  }
`;

const GoogleBtn = styled(AuthBtn)`
  background: #fff;
  color: #222;
  border: 1.5px solid #eee;
  &:hover {
    background: #f5f5f5;
  }
`;

const NaverBtn = styled(AuthBtn)`
  background: #03c75a;
  color: #fff;
  &:hover {
    background: #02b152;
  }
`;

const KakaoBtn = styled(AuthBtn)`
  background: #fee500;
  color: #3c1e1e;
  border: 1.5px solid #f7e600;
  &:hover {
    background: #ffe45c;
  }
`;

export default function CustomSignIn() {
  const handleClose = () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/";
  };

  return (
    <ModalBackdrop>
      <ModalBox>
        <ModalClose onClick={handleClose} aria-label="닫기">
          &times;
        </ModalClose>
        <div
          style={{
            fontWeight: 700,
            fontSize: "1.25rem",
            color: "#7b2ff2",
            marginBottom: 16,
          }}
        >
          SNS 간편 로그인
        </div>
        <GoogleBtn onClick={() => signIn("google")}>
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
            alt="Google"
            width={22}
            height={22}
            style={{
              background: "#fff",
              borderRadius: "50%",
            }}
          />
          구글로 로그인
        </GoogleBtn>
        <NaverBtn onClick={() => signIn("naver")}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/2/2e/Naver_Logotype.svg"
            alt="Naver"
            width={22}
            height={22}
            style={{
              background: "#fff",
              borderRadius: "50%",
            }}
          />
          네이버로 로그인
        </NaverBtn>
        <KakaoBtn onClick={() => signIn("kakao")}>
          <img
            src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/kakao.svg"
            alt="Kakao"
            width={22}
            height={22}
            style={{
              background: "#fee500",
              borderRadius: "50%",
            }}
          />
          카카오로 로그인
        </KakaoBtn>
        <div
          style={{
            marginTop: 15,
            fontSize: "0.97em",
            color: "#9c92b6",
            fontWeight: 500,
          }}
        >
          회원가입 없이 SNS로 바로 이용 가능!
        </div>
      </ModalBox>
    </ModalBackdrop>
  );
}