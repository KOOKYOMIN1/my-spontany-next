// /lib/aiRecommend.js
export async function getAIRecommendations({ departure, budget, mood }) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ departure, budget, mood }),
  });
  if (!res.ok) throw new Error("추천 실패");
  return await res.json();
}