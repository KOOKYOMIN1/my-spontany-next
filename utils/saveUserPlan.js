import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// ✅ entryId를 타임스탬프 기반으로 수동 생성하여 저장
export const saveUserPlan = async (userId, planData) => {
  const entryId = `${Math.floor(Date.now() / 1000)}`;
  const ref = doc(db, "plans", userId, "entries", entryId);
  await setDoc(ref, planData);
  return entryId; // Plan.jsx에서 공유 링크 생성용으로 사용
};