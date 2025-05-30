import { connectToDatabase } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId, departure, budget } = req.body;

  if (!userId || !departure || !budget) {
    return res.status(400).json({ error: "필수 항목 누락" });
  }

  const { db } = await connectToDatabase();
  const queue = db.collection("matchingQueue");

  const existing = await queue.findOne({ status: "waiting" });

  if (existing) {
    await queue.deleteOne({ _id: existing._id });

    const match = {
      user1: existing.userId,
      user2: userId,
      departure,
      budget,
      timestamp: new Date(),
    };

    await db.collection("matches").insertOne(match);
    return res.status(200).json({ matched: true, match });
  } else {
    await queue.insertOne({
      userId,
      departure,
      budget,
      status: "waiting",
      timestamp: new Date(),
    });
    return res.status(200).json({ matched: false });
  }
}