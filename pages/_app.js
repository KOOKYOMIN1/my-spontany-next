// /pages/_app.js
import { SessionProvider } from "next-auth/react";
import Header from "@/components/Header";
// 전역 스타일이 있다면 아래 import 유지, 없다면 삭제
import GlobalStyle from "@/styles/GlobalStyle";

import "../styles/globals.css";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session} key={session?.user?.email || "no-user"}>
      <>
        {/* 전역 스타일(필요할 때) */}
        <GlobalStyle />
        <Header />
        <div
          style={{
            paddingTop: "max(72px, env(safe-area-inset-top, 0px))",
            minHeight: "100vh",
          }}
        >
          <Component {...pageProps} />
        </div>
      </>
    </SessionProvider>
  );
}