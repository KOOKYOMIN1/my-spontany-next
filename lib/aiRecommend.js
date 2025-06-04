// /lib/aiRecommend.js
export async function getAIRecommendations({ departure, budget, mood }) {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ departure, budget, mood }),
    });
    if (!res.ok) throw new Error("추천 실패");
    // 서버에서 { data: [{...}, ...] } 형태로 내려줘야 함 (예시)
    return await res.json();
  } catch (e) {
    // 프론트에서 alert 띄울지, fallback 쓸지 결정
    return { data: [], error: e.message || "AI 추천 에러" };
  }
}