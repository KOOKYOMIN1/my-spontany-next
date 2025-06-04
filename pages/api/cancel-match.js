import { connectToDatabase } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId 없음" });

  const { db } = await connectToDatabase();

  // 혹시 userId가 숫자 타입 등으로 올 수 있으니, string 강제화
  const userIdStr = String(userId);

  const { deletedCount } = await db
    .collection("matchingQueue")
    .deleteOne({ userId: userIdStr });

  return res.status(200).json({ canceled: true, deleted: deletedCount });
}