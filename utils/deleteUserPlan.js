import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 특정 사용자의 여행 계획(entry)을 Firestore에서 삭제합니다.
 * @param {string} uid - 현재 로그인한 사용자 UID
 * @param {string} entryId - 삭제할 여행 entry의 문서 ID
 */
export const deleteUserPlan = async (uid, entryId) => {
  try {
    const entryRef = doc(db, 'plans', uid, 'entries', entryId);
    await deleteDoc(entryRef);
    console.log('✅ 삭제 성공:', entryId);
  } catch (error) {
    console.error('❌ 삭제 실패:', error.message || error);
    throw error;
  }
};