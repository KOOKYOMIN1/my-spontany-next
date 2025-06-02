// pages/api/match.js
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, mood, origin, style } = req.body;
  const { db } = await connectToDatabase();

  // 1. 내가 user1/user2로 이미 들어간 대기중 방이 있으면 재입장 방지
  let myPending = await db.collection("matches").findOne({
    $or: [{ user1: email }, { user2: email }],
    matched: false,
  });
  if (myPending) {
    return res.status(200).json({
      matchId: myPending._id.toString(),
      matched: !!myPending.matched,
    });
  }

  // 2. 다른 사람이 만든 대기중 방에 들어가기
  let match = await db.collection("matches").findOne({
    user2: null,
    matched: false,
    user1: { $ne: email },
  });

  if (match) {
    await db.collection("matches").updateOne(
      { _id: match._id },
      { $set: { user2: email, matched: true } }
    );
    return res.status(200).json({
      matchId: match._id.toString(),
      matched: true,
    });
  }

  // 3. 없으면 새 방 생성 (내가 user1)
  const result = await db.collection("matches").insertOne({
    user1: email,
    user2: null,
    matched: false,
    mood, origin, style,
    createdAt: new Date(),
  });
  return res.status(200).json({
    matchId: result.insertedId.toString(),
    matched: false,
  });
}