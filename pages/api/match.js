import { connectToDatabase } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, name, origin, mood, style } = req.body;

  if (!email || !name || !origin || !mood || !style) {
    return res.status(400).json({ error: "모든 필드를 입력해주세요." });
  }

  const { db } = await connectToDatabase();

  // 기존 대기중인 유저 찾기 (본인 제외)
  const existing = await db.collection("matches").findOne({
    user2: null,
    user1: { $ne: email },
  });

  if (existing) {
    // 기존 대기자와 매칭
    await db.collection("matches").updateOne(
      { _id: existing._id },
      {
        $set: {
          user2: email,
          user2Data: { origin, mood, style },
        },
      }
    );

    return res.status(200).json({
      matched: true,
      match: {
        user1: existing.user1,
        user2: email,
        user1Data: existing.user1Data,
        user2Data: { origin, mood, style },
      },
      matchId: existing._id.toString(),
    });
  } else {
    // 새로운 대기열 등록
    const newMatch = await db.collection("matches").insertOne({
      user1: email,
      user2: null,
      user1Data: { origin, mood, style },
      user2Data: null,
    });

    return res.status(200).json({
      matched: false,
      match: {
        user1: email,
        user2: null,
        user1Data: { origin, mood, style },
      },
      matchId: newMatch.insertedId.toString(),
    });
  }
}