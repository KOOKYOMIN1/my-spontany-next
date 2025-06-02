export default function RecommendationCard({ data, mini }) {
  if (!data) return null;
  return (
    <div
      style={{
        width: mini ? "160px" : "100%",
        maxWidth: mini ? "45vw" : "100%", // 미니카드가 너무 넓게 커지는 것 방지
        background: mini ? "#fcfcfc" : "#f7f7fa",
        borderRadius: 16,
        padding: mini ? 10 : 26,
        boxShadow: mini ? "0 2px 6px #eee" : "0 4px 18px rgba(0,0,0,0.06)",
        marginBottom: mini ? 0 : 20,
        boxSizing: "border-box",
        flex: "1 1 160px", // flex-grow, flex-shrink, flex-basis(카드가 작아질 수 있게)
      }}
    >
      <img
        src={data.img}
        alt={data.name}
        style={{
          width: "100%",
          height: mini ? 100 : 240,
          objectFit: "cover",
          borderRadius: 12,
          marginBottom: 12,
          display: "block",
        }}
      />
      <div style={{ fontWeight: "bold", fontSize: mini ? 16 : 20, marginBottom: 5 }}>{data.name}</div>
      <div style={{ color: "#e07b4f", fontWeight: 500, marginBottom: 7 }}>{data.oneLine}</div>
      <div style={{ color: "#6d6d6d", fontSize: 14, marginBottom: 5 }}>{data.desc}</div>
      {data.itinerary && !mini && (
        <div style={{ fontSize: 14, marginTop: 8 }}>
          <b>AI 추천 일정:</b> {data.itinerary}
        </div>
      )}
    </div>
  );
}