// 예시 (OpenAI API나 직접 GPT 호출 방식에 맞게 구현)
// POST { mood, departure, budget }
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { mood, departure, budget } = req.body;

  // GPT 연동 플래그(환경변수로 자동 분기)
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
            content: `아래 조건에 따라 하루 여행 일정표를 만들어줘.
감정: ${mood}
출발지: ${departure}
예산: ${budget}
- 시간대별로 5~7개 항목, 각 항목은 { "time": 시간, "desc": 설명 } 형태의 JSON 배열만 반환
- desc는 감성적이고 구체적으로 작성
            `
          }
        ],
        temperature: 0.7
      });

      // GPT가 배열(JSON)로 응답하도록 프롬프트 설계
      let itinerary = [];
      const content = completion.choices?.[0]?.message?.content || "";
      try {
        // JSON 파싱 시 불필요한 텍스트 방지
        itinerary = JSON.parse(
          content.replace(/^[\s\S]*?(\[.*\])[\s\S]*$/m, "$1")
        );
      } catch {
        itinerary = [
          { time: "10:00", desc: `${departure || "출발지"}에서 출발, ${mood} 가득 여행 시작!` },
          { time: "12:00", desc: "도착 후 지역 명소 산책" },
          { time: "14:00", desc: "현지 인기 맛집에서 점심" },
          { time: "16:00", desc: "핫플레이스 카페 타임" },
          { time: "18:00", desc: "노을 명소에서 사진 남기기" },
          { time: "20:00", desc: "저녁 식사 및 자유시간" }
        ];
      }
      return res.status(200).json({ itinerary });
    } catch (err) {
      // GPT 연동 실패 시 fallback
      console.error("[GPT Error]", err);
      return res.status(200).json({
        itinerary: [
          { time: "10:00", desc: `${departure || "출발지"}에서 출발, ${mood} 가득 여행 시작!` },
          { time: "12:00", desc: "도착 후 지역 명소 산책" },
          { time: "14:00", desc: "현지 인기 맛집에서 점심" },
          { time: "16:00", desc: "핫플레이스 카페 타임" },
          { time: "18:00", desc: "노을 명소에서 사진 남기기" },
          { time: "20:00", desc: "저녁 식사 및 자유시간" }
        ]
      });
    }
  } else {
    // GPT 미사용(로컬)시 임시 일정
    return res.status(200).json({
      itinerary: [
        { time: "10:00", desc: `${departure || "출발지"}에서 출발, ${mood} 가득 여행 시작!` },
        { time: "12:00", desc: "도착 후 지역 명소 산책" },
        { time: "14:00", desc: "현지 인기 맛집에서 점심" },
        { time: "16:00", desc: "핫플레이스 카페 타임" },
        { time: "18:00", desc: "노을 명소에서 사진 남기기" },
        { time: "20:00", desc: "저녁 식사 및 자유시간" }
      ]
    });
  }
}

// 실제 GPT 연결 예시 (OpenAI 공식 라이브러리 사용 시)
/*
import { OpenAI } from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [{
    role: "user",
    content: `아래 조건에 따라 하루 여행 일정표를 만들어줘.
    감정: ${mood}
    출발지: ${departure}
    예산: ${budget}
    - 시간대별로 5~7개 항목, 각 항목은 { time, desc } 형태의 배열로 반환
    - desc는 감성적이고 구체적으로 작성
    `
  }],
  temperature: 0.7
});
const itinerary = JSON.parse(completion.choices[0].message.content);
*/