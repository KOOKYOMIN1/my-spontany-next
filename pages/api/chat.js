// /pages/api/chat.js
import { connectToDatabase } from "@/lib/db";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const chat = db.collection("chatMessages");

  if (req.method === "POST") {
    const { matchId, sender, text } = req.body;
    if (!matchId || !sender || !text) {
      return res.status(400).json({ error: "필드 누락" });
    }

    await chat.insertOne({
      matchId,
      sender,
      text,
      timestamp: new Date(),
    });

    return res.status(200).json({ success: true });
  }

  if (req.method === "GET") {
    const { matchId } = req.query;
    if (!matchId) return res.status(400).json({ error: "matchId 없음" });

    const messages = await chat
      .find({ matchId })
      .sort({ timestamp: 1 })
      .toArray();

    return res.status(200).json({ messages });
  }

  return res.status(405).end();
}