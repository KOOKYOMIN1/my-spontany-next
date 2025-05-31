import { connectToDatabase } from "@/lib/db";

export default async function handler(req, res) {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "이메일이 필요합니다" });

  const { db } = await connectToDatabase();

  const match = await db.collection("matches").findOne({
    $or: [{ user1: email }, { user2: email }],
  });

  if (!match) return res.status(200).json({ matched: false });

  const isUser1 = match.user1 === email;
  const isUser2 = match.user2 === email;
  const partnerEmail = isUser1 ? match.user2 : match.user1;

  // ⚠️ 둘 다 작성란을 완료했는지 확인
  const user1Ready = !!(match.user1 && match.user1Data?.origin && match.user1Data?.mood && match.user1Data?.style);
const user2Ready = !!(match.user2 && match.user2Data?.origin && match.user2Data?.mood && match.user2Data?.style);

const bothReady = user1Ready && user2Ready;

  if (!partnerEmail || !bothReady)
    return res.status(200).json({ matched: false });

  const partner = await db.collection("users").findOne({ email: partnerEmail });

  return res.status(200).json({
    matched: true,
    matchId: match._id.toString(),
    origin: match.origin,
    mood: match.mood,
    style: match.style,
    partnerName: partner?.name || "상대방",
  });
}