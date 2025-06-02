import { connectToDatabase } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "이메일 필요" });

  const { db } = await connectToDatabase();
  const match = await db.collection("matches").findOne({
    active: true,
    $or: [{ user1: email }, { user2: email }]
  });
  res.status(200).json({ match });
}