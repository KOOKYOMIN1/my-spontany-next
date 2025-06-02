import styled from "styled-components";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";

const HeaderContainer = styled.header`
  width: 100vw;
  min-width: 1200px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 2.8vw 0 3vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  background: rgba(255,255,255,0.85);
  box-shadow: 0 1px 10px rgba(0,0,0,0.04);
  backdrop-filter: blur(7px);
`;

const Logo = styled.div`
  font-family: inherit;
  font-size: 2.3rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 0.5rem;
  user-select: none;
  letter-spacing: 0.02em;
  cursor: pointer;
`;

const RightBox = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-left: auto;
`;

const Button = styled.button`
  background: linear-gradient(90deg, #f7b42c, #fc575e);
  color: white;
  border: none;
  border-radius: 1.2rem;
  padding: 0.53rem 1.6rem;
  font-size: 1.08rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 8px rgba(252, 87, 94, 0.07);
  transition: background 0.18s, transform 0.13s;
  margin-right: 4vw;
  &:hover {
    background: linear-gradient(90deg, #fc575e, #f7b42c);
    transform: translateY(-2px) scale(1.04);
  }
`;

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  // 로그인 팝업(진짜 새창) 열기
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

  return (
    <HeaderContainer>
      <Logo onClick={() => router.push("/")}>
        Spontany
      </Logo>
      <RightBox>
        {!session && <Button onClick={handleLoginPopup}>로그인</Button>}
        {session && <Button onClick={() => signOut()}>로그아웃</Button>}
      </RightBox>
    </HeaderContainer>
  );
}