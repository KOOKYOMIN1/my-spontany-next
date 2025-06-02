// pages/api/close-match.js
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { matchId } = req.body;
  if (!matchId) return res.status(400).json({ error: "matchId 필요" });
  const { db } = await connectToDatabase();
  await db.collection("matches").deleteOne({ _id: new ObjectId(matchId) });
  await db.collection("messages").deleteMany({ matchId });
  res.status(200).json({ ok: true });
}