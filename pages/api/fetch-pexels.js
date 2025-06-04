export default async function handler(req, res) {
  const { query, mood } = req.query;
  try {
    const apiRes = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5`,
      {
        headers: { Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY },
      }
    );
    const data = await apiRes.json();
    // 랜덤 이미지 pick
    const photos = data.photos || [];
    const pick = photos.length
      ? photos[Math.floor(Math.random() * photos.length)]
      : null;
    // **imgUrl 키로 반환**
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ imgUrl: pick?.src?.large2x || null });
  } catch {
    res.status(200).json({ imgUrl: null });
  }
}