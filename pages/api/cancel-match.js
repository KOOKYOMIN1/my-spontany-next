import { connectToDatabase } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId 없음" });

  const { db } = await connectToDatabase();
  await db.collection("matchingQueue").deleteOne({ userId });

  return res.status(200).json({ canceled: true });
}