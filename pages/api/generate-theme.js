export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { mood, departure, budget } = req.body;

  // 필수값 없으면 기본 메시지
  if (!mood || !departure || !budget) {
    return res.status(200).json({ theme: "설렘 여행의 설렘을 담아 추천하는 감성 테마 문장입니다!" });
  }

  // GPT 프롬프트 템플릿
  const systemPrompt = `
너는 여행 감성 카피라이터야. 입력받은 감정, 출발지, 예산을 고려해서, 
1문장(짧고 명확!)으로 오늘의 여행 추천 메시지를 감성적으로 만들어줘.
반드시 "감정"과 "출발지"에 어울리는 느낌이 드러나게, 한글로, 이모지 없이, 1문장만!
예) "설렘 가득한 오늘, 인천에서 떠나는 여행을 추천해드릴게요!"
`;

  // 쿨타임/캐시 없이 바로 프록시
  try {
    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `감정: ${mood}, 출발지: ${departure}, 예산: ${budget}원`
          }
        ],
        max_tokens: 50,
        temperature: 0.7,
        top_p: 0.9,
      })
    });
    const data = await completion.json();
    const text = data.choices?.[0]?.message?.content?.trim() || "여행을 시작할 시간이에요!";
    return res.status(200).json({ theme: text });
  } catch (e) {
    return res.status(200).json({ theme: "여행을 시작할 시간이에요!" });
  }
}