// components/PremiumModal.js
import styled from "styled-components";
import { useRouter } from "next/router";

const Backdrop = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(50,30,20,0.23);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalBox = styled.div`
  background: #fff;
  padding: 2.4rem 2.2rem 1.7rem 2.2rem;
  border-radius: 1.25rem;
  box-shadow: 0 8px 40px #dbb89b24;
  max-width: 350px;
  width: 96vw;
  text-align: center;
  animation: pop 0.22s cubic-bezier(.7,.4,.5,1.25);
  @keyframes pop {
    from { transform: scale(0.88); opacity: 0.6; }
    to   { transform: scale(1); opacity: 1; }
  }
`;

const Title = styled.div`
  font-weight: 800;
  font-size: 1.32rem;
  color: #ff914d;
  margin-bottom: 0.4em;
`;

const Desc = styled.div`
  font-size: 1.07rem;
  color: #674300;
  margin-bottom: 1.6em;
  line-height: 1.6;
`;

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const Button = styled.button`
  background: ${({ primary }) =>
    primary
      ? "linear-gradient(90deg,#fc575e,#ffb16c)"
      : "#e6e6e6"};
  color: ${({ primary }) => (primary ? "#fff" : "#555")};
  font-weight: 700;
  border: none;
  border-radius: 0.7em;
  padding: 0.85em 1.35em;
  font-size: 1.07rem;
  cursor: pointer;
  transition: background 0.13s, color 0.13s;
  &:hover {
    background: ${({ primary }) =>
      primary
        ? "linear-gradient(90deg,#ffb16c,#fc575e)"
        : "#dedede"};
  }
`;

export default function PremiumModal({ onClose }) {
  const router = useRouter();
  return (
    <Backdrop onClick={onClose}>
      <ModalBox onClick={e => e.stopPropagation()}>
        <Title>프리미엄 서비스 안내</Title>
        <Desc>
          이 기능은 <b>프리미엄 회원</b>에게만 제공됩니다.<br />
          지금 프리미엄으로 업그레이드하고<br />
          <b>AI 맞춤 일정·실시간 동행 매칭</b> 등 다양한 혜택을 경험하세요!
        </Desc>
        <BtnRow>
          <Button primary onClick={() => { onClose(); router.push("/premium"); }}>
            프리미엄으로 업그레이드
          </Button>
          <Button onClick={onClose}>닫기</Button>
        </BtnRow>
      </ModalBox>
    </Backdrop>
  );
}