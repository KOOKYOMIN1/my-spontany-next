// /pages/_app.js
import { SessionProvider } from "next-auth/react";
import Header from "../components/Header";
import "../styles/globals.css";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session} key={session?.user?.email || "no-user"}>
      <Header />
      <div style={{ paddingTop: 72, minHeight: "100vh" }}>
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
}