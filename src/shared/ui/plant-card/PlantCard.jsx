import { useState } from "react";
import "./PlantCard.css";

const speciesIcon = { 꽃: "✿", 나무: "⌇", 풀: "∿" };
const colorDot = {
  노랑: "#F5C842", 빨강: "#D94F4F", 보라: "#9B72CF",
  분홍: "#E8889A", 하양: "#E8E4DC", "짙은 녹색": "#2D5016",
  연두: "#8BC34A", 초록: "#3E7B27",
};
const statusConfig = {
  확인됨: { label: "확인됨", color: "#3E7B27", bg: "#EAF2E3" },
  "관리 필요": { label: "관리 필요", color: "#C47E1A", bg: "#FDF3E0" },
  "식재 예정": { label: "식재 예정", color: "#7A7A7A", bg: "#F0EFEB" },
  미확인: { label: "미확인", color: "#999", bg: "#F5F4F0" },
};

const SAMPLE_PLANTS = [
  {
    Name: "장미나무",
    Species: "나무",
    Status: "관리 필요",
    Location: ["앞뜰", "우체통 근처"],
    Color: "빨강",
    "Bloom Season": "May – Jun",
    "Pruning Season": "Feb – Mar",
    "Fertilizing Season": "Apr – May",
    Quantity: "3",
    Notes: "겨울 동해 피해 확인 필요",
  },
  {
    Name: "붓꽃",
    Species: "꽃",
    Status: "확인됨",
    Location: ["뒷뜰"],
    Color: "보라",
    "Bloom Season": "May",
    "Pruning Season": "Oct",
    "Fertilizing Season": "Mar – Apr",
    Quantity: "12",
    Notes: "",
  },
  {
    Name: "회양목",
    Species: "나무",
    Status: "확인됨",
    Location: ["앞뜰", "비닐하우스 근처"],
    Color: "짙은 녹색",
    "Bloom Season": "–",
    "Pruning Season": "Jun – Jul",
    "Fertilizing Season": "Apr",
    Quantity: "8",
    Notes: "생울타리 형태 유지 중",
  },
];

const SeasonBadge = ({ label, value }) =>
  value ? (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 9, letterSpacing: "0.08em", color: "#A89880", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
        {label}
      </span>
      <span style={{ fontSize: 12, color: "#5C4A32", fontFamily: "'DM Mono', monospace" }}>{value}</span>
    </div>
  ) : null;

export function PlantCard({ plant, onOpenDetail }) {
  const [flipped, setFlipped] = useState(false);
  const status = statusConfig[plant.Status] || statusConfig["미확인"];
  const dot = colorDot[plant.Color];

  const toggleOrOpen = () => {
    if (onOpenDetail) onOpenDetail();
    else setFlipped((f) => !f);
  };

  return (
    <div
      className={`plant-card ${onOpenDetail ? "plant-card--interactive" : ""}`}
      onClick={toggleOrOpen}
      onKeyDown={
        onOpenDetail
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenDetail();
              }
            }
          : undefined
      }
      role={onOpenDetail ? "button" : undefined}
      tabIndex={onOpenDetail ? 0 : undefined}
      style={{
        cursor: "pointer",
        perspective: 1000,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* FRONT */}
        <div
          className="plant-card__face"
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: 0,
            background: "#FDFAF5",
            border: "1px solid #E8E0D0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 2px 12px rgba(90,65,40,0.07)",
          }}
        >
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="plant-card__species-icon" aria-hidden>
              {speciesIcon[plant.Species] || "○"}
            </div>
            <div
              style={{
                fontSize: 11,
                padding: "3px 9px",
                borderRadius: 20,
                background: status.bg,
                color: status.color,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: "0.04em",
              }}
            >
              {status.label}
            </div>
          </div>

          {/* Name */}
          <div>
            <div className="plant-card__name">{plant.Name}</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: 11,
                  color: "#8A7260",
                  background: "#F0EBE0",
                  padding: "2px 8px",
                  borderRadius: 10,
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {plant.Species}
              </span>
              {plant.Category && (
                <span
                  style={{
                    fontSize: 11,
                    color: "#5C4A32",
                    background: "#EDE8DE",
                    padding: "2px 8px",
                    borderRadius: 10,
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {plant.Category}
                </span>
              )}
              {plant.SpeciesRaw && (
                <span style={{ fontSize: 11, color: "#8A7260", fontFamily: "'DM Mono', monospace" }}>
                  종: {plant.SpeciesRaw}
                </span>
              )}
              {dot && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#8A7260" }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: dot,
                      border: "1px solid rgba(0,0,0,0.08)",
                      display: "inline-block",
                    }}
                  />
                  {plant.Color}
                </span>
              )}
            </div>
            {plant["Bloom Season"] && (
              <div style={{ marginTop: 6 }}>
                <span
                  style={{
                    fontSize: 11,
                    color: "#8A7260",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  개화시기 {plant["Bloom Season"]}
                </span>
              </div>
            )}
          </div>

          {/* Location */}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {(plant.Location || []).map((loc) => (
              <span
                key={loc}
                style={{
                  fontSize: 11,
                  padding: "3px 9px",
                  borderRadius: 8,
                  background: "#EDE8DE",
                  color: "#5C4A32",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                📍 {loc}
              </span>
            ))}
          </div>

          {/* Bottom */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #EDE8DE",
              paddingTop: 12,
            }}
          >
            <span style={{ fontSize: 11, color: "#A89880", fontFamily: "'DM Mono', monospace" }}>
              수량 {plant.Quantity || "–"}
            </span>
            <span style={{ fontSize: 10, color: "#C8B090", fontFamily: "'DM Mono', monospace" }}>
              tap for seasons →
            </span>
          </div>
        </div>

        {/* BACK */}
        <div
          className="plant-card__face"
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: 0,
            background: "#2C1F0E",
            border: "1px solid #3D2D18",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 2px 12px rgba(90,65,40,0.15)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 14,
                color: "#C8A870",
                fontFamily: "'Noto Serif KR', serif",
                fontWeight: 600,
                marginBottom: 12,
                letterSpacing: "0.04em",
              }}
            >
              {plant.Name} — 시즌 정보
            </div>
            {(plant.Category || plant.SpeciesRaw) && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 14,
                  fontSize: 11,
                  color: "#8A7260",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {plant.Category && <span>카테고리: {plant.Category}</span>}
                {plant.SpeciesRaw && <span>종: {plant.SpeciesRaw}</span>}
              </div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px 24px",
              }}
            >
              <SeasonBadge label="개화시기" value={plant["Bloom Season"]} />
              <SeasonBadge label="전정" value={plant["Pruning Season"]} />
              <SeasonBadge label="비료" value={plant["Fertilizing Season"]} />
            </div>
          </div>

          {plant.Notes ? (
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: 10,
                padding: "10px 14px",
              }}
            >
              <div style={{ fontSize: 9, color: "#8A7260", letterSpacing: "0.08em", marginBottom: 5, fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>
                Notes
              </div>
              <div style={{ fontSize: 12, color: "#D4C4A8", lineHeight: 1.6, fontFamily: "'Noto Serif KR', serif" }}>
                {plant.Notes}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#5C4A32", fontFamily: "'DM Mono', monospace" }}>메모 없음</div>
          )}

          <div style={{ fontSize: 10, color: "#5C4A32", fontFamily: "'DM Mono', monospace", textAlign: "right" }}>
            ← tap to flip
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlantCard;

export function PlantCardDemo() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          background: "#F5F0E8",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          gap: 32,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#A89880", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", marginBottom: 8 }}>
            양주 정원 · Plants
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#2C1F0E", fontFamily: "'Noto Serif KR', serif" }}>
            식물 카드
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {SAMPLE_PLANTS.map((p) => (
            <PlantCard key={p.Name} plant={p} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#C8B090", fontFamily: "'DM Mono', monospace" }}>
          카드를 탭하면 시즌 정보가 보여요
        </div>
      </div>
    </>
  );
}
