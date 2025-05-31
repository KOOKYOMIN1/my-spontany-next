import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SessionCheck() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log("세션 상태:", status);
    console.log("세션 정보:", session);
  }, [session, status]);

  return (
    <div style={{ padding: 20 }}>
      <h1>세션 체크</h1>
      {status === "loading" && <p>로딩 중...</p>}
      {status === "authenticated" ? (
        <div>
          <p>✅ 로그인됨</p>
          <p>이름: {session.user.name}</p>
          <p>이메일: {session.user.email}</p>
        </div>
      ) : (
        <p>❌ 로그인되지 않음</p>
      )}
    </div>
  );
}