import { connectToDatabase } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { email, origin, mood, style } = req.body;

    // 필수 값 체크
    if (!email || !origin || !mood || !style) {
      return res.status(400).json({ error: "필수 필드 누락됨" });
    }

    const { db } = await connectToDatabase();

    // ✅ 이미 매칭 대기 중인 문서가 있다면 새로 만들지 않고 그대로 반환
    const alreadyInMatch = await db.collection("matches").findOne({
      $or: [{ user1: email }, { user2: email }],
      matched: false,
    });

    if (alreadyInMatch) {
      console.log("⚠️ 이미 매칭 대기 중:", email);
      return res.status(200).json({ joined: true, matchId: alreadyInMatch._id });
    }

    // ✅ 상대 대기 중인 유저 찾기 (본인이 아니고, 작성란이 다 채워진 경우만)
    const existingMatch = await db.collection("matches").findOne({
      user2: null,
      matched: { $ne: true },
      user1: { $ne: email },
      "user1Data.origin": { $type: "string", $ne: "" },
      "user1Data.mood": { $type: "string", $ne: "" },
      "user1Data.style": { $type: "string", $ne: "" },
    });

    if (existingMatch) {
      await db.collection("matches").updateOne(
        { _id: existingMatch._id },
        {
          $set: {
            user2: email,
            user2Data: { origin, mood, style },
            matched: true,
            matchedAt: new Date(),
            user2Confirmed: true,
          },
        }
      );
      console.log("✅ user2Confirmed 저장됨:", email);
      return res.status(200).json({ joined: true, matchId: existingMatch._id });
    }

    // ✅ 매칭 실패 → 나 혼자 대기열 등록
    const result = await db.collection("matches").insertOne({
      user1: email,
      user1Data: { origin, mood, style },
      user2: null,
      user2Data: null,
      matched: false,
      createdAt: new Date(),
    });

    console.log("🕒 새로운 매칭 대기열 생성됨:", email);
    return res.status(200).json({ joined: true, matchId: result.insertedId });
  } catch (error) {
    console.error("🔥 매칭 중 에러:", error);
    return res.status(500).json({ error: "서버 내부 오류 발생" });
  }
}