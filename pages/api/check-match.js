import { connectToDatabase } from "@/lib/db";

export default async function handler(req, res) {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "이메일이 필요합니다" });

  const { db } = await connectToDatabase();

  // 나와 관련된 매치 찾기
  const match = await db.collection("matches").findOne({
    $or: [{ user1: email }, { user2: email }],
  });

  if (!match) return res.status(200).json({ matched: false });

  const isUser1 = match.user1 === email;
  const isUser2 = match.user2 === email;
  const partnerEmail = isUser1 ? match.user2 : match.user1;

  // 👇 각 사용자 데이터가 존재하는지 확인
  const user1Ready = !!(
    match.user1 &&
    match.user1Data?.origin &&
    match.user1Data?.mood &&
    match.user1Data?.style
  );

  const user2Ready = !!(
    match.user2 &&
    match.user2Data?.origin &&
    match.user2Data?.mood &&
    match.user2Data?.style
  );

  const bothReady = user1Ready && user2Ready;

  if (!partnerEmail || !bothReady) {
    return res.status(200).json({ matched: false });
  }

  // 👤 상대 이름 조회
  const partner = await db.collection("users").findOne({ email: partnerEmail });

  return res.status(200).json({
    matched: true,
    matchId: match._id.toString(),
    origin: isUser1 ? match.user1Data.origin : match.user2Data.origin,
    mood: isUser1 ? match.user1Data.mood : match.user2Data.mood,
    style: isUser1 ? match.user1Data.style : match.user2Data.style,
    partnerName: partner?.name || "상대방",
  });
}