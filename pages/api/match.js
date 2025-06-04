// pages/api/match.js
import { connectToDatabase } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "이메일 누락" });

  const { db } = await connectToDatabase();

  // 1. 내가 이미 대기 중이거나 매칭된 방이 있으면 그 방 리턴
  let myRoom = await db.collection("matches").findOne({
    $or: [{ user1: email }, { user2: email }],
    matched: false,
  });
  if (myRoom) {
    return res.status(200).json({
      matchId: myRoom._id.toString(),
      matched: !!myRoom.user2,
    });
  }

  // 2. 누군가 대기 중인 방(user2: null)에 내가 들어갈 수 있으면 매칭!
  let waitRoom = await db.collection("matches").findOne({
    user2: null,
    matched: false,
    user1: { $ne: email },
  });

  if (waitRoom) {
    await db.collection("matches").updateOne(
      { _id: waitRoom._id },
      { $set: { user2: email, matched: true } }
    );
    return res.status(200).json({
      matchId: waitRoom._id.toString(),
      matched: true,
    });
  }

  // 3. 대기중 방도 없다면 새로운 방 생성(내가 user1)
  const result = await db.collection("matches").insertOne({
    user1: email,
    user2: null,
    matched: false,
    createdAt: new Date(),
  });

  return res.status(200).json({
    matchId: result.insertedId.toString(),
    matched: false,
  });
}