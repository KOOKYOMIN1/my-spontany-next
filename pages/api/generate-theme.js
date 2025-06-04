export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { mood, departure, budget } = req.body;

  // GPT 연동 여부 플래그(운영/개발 구분)
  const useGPT = !!process.env.OPENAI_API_KEY;

  if (useGPT) {
    try {
      const { OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `아래 조건에 따라 감성적인 여행 테마 문장을 한 문장으로 만들어줘.
감정: ${mood}
출발지: ${departure}
예산: ${budget}
- 감성적이고 여행을 떠나고 싶게 만드는 문장으로 작성
            `
          }
        ],
        temperature: 0.7
      });

      const theme = completion.choices?.[0]?.message?.content?.trim() || "여행을 떠나고 싶은 감성 문장을 생성하지 못했습니다.";
      return res.status(200).json({ theme });
    } catch (err) {
      // GPT 연동 실패 시 fallback
      console.error("[GPT Error]", err);
      return res.status(200).json({
        theme: `${mood} 여행의 설렘을 담아 추천하는 감성 테마 문장입니다!`
      });
    }
  } else {
    // 실제 GPT 미사용(로컬 등)일 때 임시 문장
    return res.status(200).json({
      theme: `${mood} 여행의 설렘을 담아 추천하는 감성 테마 문장입니다!`
    });
  }
}