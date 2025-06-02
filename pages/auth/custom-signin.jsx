import { getProviders, signIn } from "next-auth/react";
import styled from "styled-components";

const Bg = styled.div`
  min-height: 100vh;
  background: rgba(255,255,255,0.96);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  background: white;
  border-radius: 2rem;
  box-shadow: 0 0 20px #fc575e11;
  padding: 2.2rem 2.3rem 2rem 2.3rem;
  min-width: 340px;
  text-align: center;
`;

const Logo = styled.div`
  font-family: inherit;
  font-size: 2.1rem;
  font-weight: 700;
  color: #222;
  letter-spacing: 0.02em;
  margin-bottom: 0.9rem;
  user-select: none;
`;

const Title = styled.div`
  font-size: 1.17rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 2.1rem;
`;

const ProviderBtn = styled.button`
  width: 100%;
  margin: 0.44rem 0 0.44rem 0;
  border: none;
  border-radius: 1.3rem;
  font-size: 1.1rem;
  font-weight: 600;
  background: ${({ color }) =>
    color === "google"
      ? "linear-gradient(90deg, #f7b42c, #fc575e)"
      : color === "naver"
      ? "linear-gradient(90deg, #1ec800 75%, #20e664 100%)"
      : color === "kakao"
      ? "linear-gradient(90deg, #fee500 80%, #ffe663 100%)"
      : "#eee"};
  color: ${({ color }) =>
    color === "naver"
      ? "#fff"
      : color === "kakao"
      ? "#3b1e01"
      : "white"};
  padding: 0.88rem 0;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px #fc575e14;
  cursor: pointer;
  transition: background 0.19s, transform 0.12s;
  &:hover {
    opacity: 0.91;
    transform: scale(1.04);
  }
`;

export async function getServerSideProps(context) {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}

export default function CustomSignIn({ providers }) {
  const providerMeta = {
    google: { name: "Google" },
    naver: { name: "Naver" },
    kakao: { name: "Kakao" },
  };

  return (
    <Bg>
      <Card>
        <Logo>Spontany</Logo>
        <Title>더 감성적인 여행을 위한<br />간편 로그인</Title>
        {Object.values(providers).map((provider) => {
          if (!providerMeta[provider.id]) return null;
          return (
            <ProviderBtn
              key={provider.name}
              color={provider.id}
              // 👇👇 팝업 로그인 후 무조건 /auth/popup-close로 이동
              onClick={() => signIn(provider.id, { callbackUrl: "/auth/popup-close" })}
            >
              {providerMeta[provider.id].name}로 로그인
            </ProviderBtn>
          );
        })}
      </Card>
    </Bg>
  );
}