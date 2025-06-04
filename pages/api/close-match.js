// pages/api/close-match.js
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).end();
    const { matchId } = req.body;
    if (!matchId) return res.status(400).json({ error: "matchId 필요" });

    const { db } = await connectToDatabase();

    // 안전하게 ObjectId 변환 (catch)
    let _id;
    try {
      _id = new ObjectId(matchId);
    } catch {
      return res.status(400).json({ error: "유효하지 않은 matchId" });
    }

    await db.collection("matches").deleteOne({ _id });
    await db.collection("messages").deleteMany({ matchId });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("/api/close-match 에러:", err);
    res.status(500).json({ error: "서버 오류" });
  }
}