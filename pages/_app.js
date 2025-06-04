// /pages/_app.js
import { SessionProvider } from "next-auth/react";
import Header from "@/components/Header";
import GlobalStyle from "@/styles/GlobalStyle";
import "../styles/globals.css";
import { ChatModalProvider } from "@/contexts/ChatModalContext";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session} key={session?.user?.email || "no-user"}>
      <ChatModalProvider>
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
      </ChatModalProvider>
    </SessionProvider>
  );
}