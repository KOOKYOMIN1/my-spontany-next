
import { collection, getDocs, query, orderBy, doc } from "firebase/firestore";
import { db } from "../firebase";

export const getUserPlans = async (uid) => {
  try {
    const plansRef = collection(doc(db, "plans", uid), "entries"); // ✅ subcollection 기준
    const q = query(plansRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("❌ 유저 플랜 가져오기 실패:", error);
    return [];
  }
};