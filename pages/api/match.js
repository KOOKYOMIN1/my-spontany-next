import { connectToDatabase } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, name, origin, mood, style } = req.body;

  if (!email || !name || !origin || !mood || !style) {
    return res.status(400).json({ error: "모든 필드를 입력해주세요." });
  }

  const { db } = await connectToDatabase();

  // 🎯 랜덤한 대기자 중 나와 다른 유저 찾기
  const candidates = await db.collection("matches")
    .find({
      user2: null,
      user1: { $ne: email },
      user1Data: { $exists: true },
    })
    .toArray();

  const randomTarget = candidates.length > 0
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : null;

  if (randomTarget) {
    await db.collection("matches").updateOne(
      { _id: randomTarget._id },
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
        user1: randomTarget.user1,
        user2: email,
        user1Data: randomTarget.user1Data,
        user2Data: { origin, mood, style },
      },
      matchId: randomTarget._id.toString(),
    });
  }

  // 대기열에 내가 등록
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