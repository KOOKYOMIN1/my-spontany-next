// pages/api/match.js
import { connectToDatabase } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email } = req.body;
  const { db } = await connectToDatabase();

  // 1. 내가 매칭 대기 or 매칭된 방이 있으면 그 방으로!
  let myRoom = await db.collection("matches").findOne({
    $or: [{ user1: email }, { user2: email }],
    matched: false,
  });
  if (myRoom) {
    return res.status(200).json({
      matchId: myRoom._id.toString(),
      matched: !!myRoom.user2, // user2가 채워졌을 때만 matched!
    });
  }

  // 2. 대기중 방(user2가 null) 있으면 바로 내가 user2로!
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

  // 3. 방이 없다면 새로 생성
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