// /pages/api/generate-theme.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { mood, departure, budget } = req.body;
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
            content: `
아래 조건에 따라 감성 여행 테마 한 문장(theme)과,
이미지 검색에 쓸 영문 키워드(imageKeyword)를 JSON 형태로 반환해줘.

감정: ${mood}
출발지: ${departure}
예산: ${budget}
반드시 아래 JSON 형태로만 응답해:
{
  "theme": "설레는 봄날, 벚꽃길을 산책하며 기분전환 해보세요!",
  "imageKeyword": "cherry blossom spring park"
}
            `.trim()
          }
        ],
        temperature: 0.77
      });

      let theme = "여행을 시작할 시간이에요!";
      let imageKeyword = "travel nature";

      const content = completion.choices?.[0]?.message?.content || "";
      try {
        const json = JSON.parse(content.match(/\{[\s\S]*?\}/)?.[0]);
        theme = json.theme || theme;
        imageKeyword = json.imageKeyword || imageKeyword;
      } catch (e) {
        // fallback
      }
      return res.status(200).json({ theme, imageKeyword });
    } catch (err) {
      return res.status(200).json({ theme: "여행을 시작할 시간이에요!", imageKeyword: "travel nature" });
    }
  } else {
    // GPT 미사용시 fallback
    return res.status(200).json({
      theme: "여행을 시작할 시간이에요!",
      imageKeyword: "spring cherry blossom"
    });
  }
}