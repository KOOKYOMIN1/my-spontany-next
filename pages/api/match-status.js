// pages/api/match-status.js
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const { matchId } = req.query;
  if (!matchId) return res.status(400).json({ error: "matchId 필요" });
  const { db } = await connectToDatabase();
  const match = await db.collection("matches").findOne({ _id: new ObjectId(matchId) });
  if (!match) {
    return res.status(200).json({ exists: false });
  }
  res.status(200).json({
    exists: true,
    matched: !!match.matched,
    user1: match.user1,
    user2: match.user2,
  });
}