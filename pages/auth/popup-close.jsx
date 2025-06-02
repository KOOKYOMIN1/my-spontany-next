// /pages/auth/popup-close.jsx
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function PopupClose() {
  const { status } = useSession();

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.opener &&
      window.name === "SpontanyLogin" &&
      status === "authenticated"
    ) {
      try {
        window.opener.location.reload();
      } catch (e) {}
      setTimeout(() => window.close(), 400);
    }
  }, [status]);

  // 아무것도 안 보여줌
  return null;
}