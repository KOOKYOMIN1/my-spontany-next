import { connectToDatabase } from "@/lib/db";

export default async function handler(req, res) {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "이메일이 필요합니다" });

  try {
    const { db } = await connectToDatabase();

    const match = await db.collection("matches").findOne({
      matched: true,
      $or: [{ user1: email }, { user2: email }],
    });

    if (!match) {
      console.log("🟡 매칭 없음");
      return res.status(200).json({ matched: false });
    }

    const isUser1 = match.user1 === email;
    const partnerEmail = isUser1 ? match.user2 : match.user1;

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

    // ❗추가된 조건
    if (!partnerEmail || !bothReady || (match.user2 && !match.user2Confirmed)) {
      console.log("🟥 조건 불충족: matched but not bothReady or user2Confirmed");
      return res.status(200).json({ matched: false });
    }

    const partner = await db.collection("users").findOne({ email: partnerEmail });

    return res.status(200).json({
      matched: true,
      matchId: match._id?.toString?.() || "",
      origin: isUser1 ? match.user1Data.origin : match.user2Data.origin,
      mood: isUser1 ? match.user1Data.mood : match.user2Data.mood,
      style: isUser1 ? match.user1Data.style : match.user2Data.style,
      partnerName: partner?.name || "상대방",
    });
  } catch (error) {
    console.error("🔥 check-match 내부 에러:", error);
    return res.status(500).json({ error: "서버 내부 오류 발생" });
  }
}