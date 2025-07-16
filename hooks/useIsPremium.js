import { useState, useEffect } from "react";

/**
 * 프리미엄 여부를 localStorage에 저장/반영하는 커스텀 훅
 * SSR/CSR/초기화/클린업까지 모두 안전하게 처리
 */
export default function useIsPremium() {
  const [isPremium, setIsPremium] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsPremium(localStorage.getItem("spontanyIsPremium") === "true");
    }
  }, []);

  // setter도 항상 localStorage와 동기화
  const setPremium = (val) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("spontanyIsPremium", val ? "true" : "false");
    }
    setIsPremium(val);
  };

  return [isPremium, setPremium];
}