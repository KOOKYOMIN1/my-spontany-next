import { signIn } from "next-auth/react";
import styled from "styled-components";

const Backdrop = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Modal = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 20px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LoginButton = styled.button`
  background: #eee;
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
`;

export default function LoginModal({ onClose }) {
  return (
    <Backdrop onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <h2>로그인 방법 선택</h2>
        <LoginButton onClick={() => signIn("google")}>Google로 로그인</LoginButton>
        <LoginButton onClick={() => signIn("github")}>GitHub로 로그인</LoginButton>
        <LoginButton onClick={() => signIn("naver")}>Naver로 로그인</LoginButton>
        <LoginButton onClick={() => signIn("kakao")}>Kakao로 로그인</LoginButton>
        <LoginButton onClick={onClose}>닫기</LoginButton>
      </Modal>
    </Backdrop>
  );
}