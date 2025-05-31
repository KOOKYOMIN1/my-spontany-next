// /pages/api/messages.js
import { connectToDatabase } from "@/lib/db";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "GET") {
    const { matchId } = req.query;
    if (!matchId) return res.status(400).json({ error: "matchId 누락됨" });

    const messages = await db
      .collection("messages")
      .find({ matchId })
      .sort({ createdAt: 1 })
      .toArray();

    return res.status(200).json(messages);
  }

  if (req.method === "POST") {
    const { matchId, sender, text } = req.body;
    if (!matchId || !sender || !text) {
      return res.status(400).json({ error: "필드 누락됨" });
    }

    await db.collection("messages").insertOne({
      matchId,
      sender,
      text,
      createdAt: new Date(),
    });

    return res.status(200).json({ success: true });
  }

  res.status(405).end(); // method not allowed
}