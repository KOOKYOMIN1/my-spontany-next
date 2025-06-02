export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { departure, budget, mood } = req.body;

  try {
    // 1. OpenAI API 호출
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "너는 감성적인 여행 플래너다." },
          { role: "user", content: `
너는 여행 추천 컨시어지야.
아래 조건에 맞춰 한국 여행지를 추천해줘.

- 출발지: ${departure}
- 여행 예산: ${budget}원
- 감정: ${mood}

[결과 형식 예시]
{
  "message": "오늘 ${departure}에서 ${budget}원으로 떠나는 ${mood} 여행! AI가 이런 곳을 추천해요.",
  "main": {
    "name": "제주도",
    "oneLine": "푸른 바다와 자유로움이 있는 섬",
    "desc": "제주 바다에서 힐링하고, 감성 카페에서 여유를 즐기세요.",
    "itinerary": "제주공항 도착 → 협재 해변 → 감귤밭 카페 → 성산 일출봉"
  },
  "others": [
    {
      "name": "강릉",
      "oneLine": "잔잔한 동해의 도시",
      "desc": "카페거리, 바다 산책로에서 진정한 힐링"
    },
    {
      "name": "부산 해운대",
      "oneLine": "뜨거운 에너지와 설렘",
      "desc": "활기찬 해변과 밤산책, 맛집 투어"
    }
  ]
}

실제 JSON만 응답해.
          `}
        ],
        max_tokens: 700,
        temperature: 0.85,
      }),
    });

    const openaiData = await openaiRes.json();
    let content = "";
    let result = {};
    try {
      content = openaiData.choices[0].message.content.trim();

      // 코드블록 마크다운 제거
      const cleaned = content
        .replace(/^```json/i, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();

      result = JSON.parse(cleaned);
    } catch (err) {
      console.error("OpenAI 응답 파싱 실패:", content, err);
      return res.status(500).json({ error: "AI 추천 파싱 실패" });
    }

    // 한글 → 영어 여행지명 매핑 (확장 가능)
    const engMap = {
  "속초": "Sokcho",
  "여수": "Yeosu",
  "춘천": "Chuncheon",
  "강릉": "Gangneung",
  "제주도": "Jeju",
  "부산": "Busan",
  "부산 해운대": "Haeundae Beach",
  "서울": "Seoul",
  "서울 홍대": "Hongdae Seoul",
  "홍대": "Hongdae Seoul",
  "인천": "Incheon",
  "파주": "Paju",
  "파주 출판도시": "Paju",
  "남이섬": "Nami Island",
  "양평": "Yangpyeong",
  "양평 두물머리": "Yangpyeong",
  "인천 차이나타운": "Incheon Chinatown",
  "경주": "Gyeongju",
  "광주": "Gwangju",
  "전주": "Jeonju",
  "울산": "Ulsan",
  "대구": "Daegu",
  "대전": "Daejeon",
  "포항": "Pohang",
  "수원": "Suwon",
  "수원 화성": "Hwaseong Fortress Suwon",
  "남양주": "Namyangju",
  "남양주 다산생태공원": "Namyangju",
  "의왕": "Uiwang",
  "의왕 레솔레파크": "의왕 레솔레파크",
  "화성": "Hwaseong Fortress",
  "인천 송도 센트럴파크": "Incheon Songdo Central Park",
  "송도 센트럴파크": "Incheon Songdo Central Park",
  "센트럴파크": "Incheon Songdo Central Park",
  "인천 월미도": "Wolmido Island, Incheon",
  "월미도": "Wolmido Island, Incheon",
  "인천 대공원": "Incheon Grand Park",
  "강화도": "Ganghwa Island, Incheon",
  "인천 소래포구": "Sorae Port, Incheon",
  "대부도": "Incheon Daebu Island",
  "영종도": "Yeongjong Island, Incheon",
  "청라 호수공원": "Incheon Cheongna Lake Park",
  "가평": "Gapyeong",
  // 계속 확장 가능!
};

    async function getPexelsImg(keyword) {
  // 한글 검색
  let url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=8`;
  let res = await fetch(url, {
    headers: { Authorization: process.env.PEXELS_API_KEY },
  });
  let data = await res.json();
  if (data.photos && data.photos.length > 0) {
    // 관련성 높은 대표사진은 첫 번째
    if (data.photos.length < 4) {
      return data.photos[0].src.landscape || data.photos[0].src.original;
    } else {
      const idx = Math.floor(Math.random() * data.photos.length);
      return data.photos[idx].src.landscape || data.photos[idx].src.original;
    }
  }
  // engMap 영어 검색
  // (동일하게 반복)
  if (engMap[keyword]) {
    url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(engMap[keyword])}&per_page=8`;
    res = await fetch(url, {
      headers: { Authorization: process.env.PEXELS_API_KEY },
    });
    data = await res.json();
    if (data.photos && data.photos.length > 0) {
      if (data.photos.length < 4) {
        return data.photos[0].src.landscape || data.photos[0].src.original;
      } else {
        const idx = Math.floor(Math.random() * data.photos.length);
        return data.photos[idx].src.landscape || data.photos[idx].src.original;
      }
    }
  }
  return null;
}

    // main 여행지 이미지
    if (result.main && !result.main.img && result.main.name) {
      result.main.img =
        (await getPexelsImg(result.main.name)) ||
        "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=800&q=80";
    }

    // others도 이미지 추가 (병렬)
    if (result.others && Array.isArray(result.others)) {
      await Promise.all(
        result.others.map(async (other) => {
          if (!other.img && other.name) {
            other.img =
              (await getPexelsImg(other.name)) ||
              "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80";
          }
        })
      );
    }

    res.status(200).json(result);

  } catch (err) {
    console.error("여행 추천 생성 오류:", err);
    res.status(500).json({ error: "여행 추천 생성 중 에러" });
  }
}