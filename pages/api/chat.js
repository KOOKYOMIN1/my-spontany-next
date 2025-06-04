// pages/api/chat.js
import { connectToDatabase } from "@/lib/db";

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();

    if (req.method === "GET") {
      const { matchId } = req.query;
      if (!matchId) return res.status(400).json({ error: "matchId 필요" });
      const messages =
        (await db
          .collection("messages")
          .find({ matchId })
          .sort({ createdAt: 1 })
          .toArray()) || [];
      return res.status(200).json({ messages });
    }

    if (req.method === "POST") {
      const { matchId, user, text } = req.body;
      if (!matchId || !user || !text) return res.status(400).json({ error: "필드 누락" });
      if (typeof text !== "string" || text.trim().length < 1 || text.length > 500)
        return res.status(400).json({ error: "메시지 길이 오류" });

      const message = {
        matchId,
        user,
        text: text.trim(),
        createdAt: new Date()
      };
      await db.collection("messages").insertOne(message);
      return res.status(200).json({ ok: true });
    }

    res.status(405).end();
  } catch (err) {
    console.error("chat api err:", err);
    res.status(500).json({ error: "서버 오류" });
  }
}