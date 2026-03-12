import { useState } from "react";

/** Tasks 테이블 Task_Type 값 → 프론트 한글 라벨 + 아이콘/색상 */
const taskTypeConfig = {
  Pruning:      { icon: "✂", label: "전정",   color: "#4A90C4", bg: "#E8F2FA" },
  Fertilizing:  { icon: "⬡", label: "비료",   color: "#B8860B", bg: "#FDF6DC" },
  Propagation:  { icon: "⊕", label: "번식",   color: "#3E7B27", bg: "#EAF2E3" },
  Watering:     { icon: "◎", label: "물주기", color: "#1E90A8", bg: "#E3F4F8" },
  Transplanting:{ icon: "⟳", label: "이식",   color: "#8B5E3C", bg: "#F5EDE4" },
  Observation:  { icon: "◉", label: "관찰",   color: "#7A7A7A", bg: "#F0EFEB" },
  Cleaning:     { icon: "▣", label: "청소",   color: "#C0392B", bg: "#FDEDED" },
  Decorating:   { icon: "◈", label: "꾸미기", color: "#8E44AD", bg: "#F4E8FA" },
  Construction: { icon: "⌖", label: "시공",   color: "#E67E22", bg: "#FEF0E4" },
};

const statusConfig = {
  "시작 전":  { color: "#999",    bg: "#F5F4F0", dot: "#CCC" },
  "식재 예정":{ color: "#7A7A7A", bg: "#F0EFEB", dot: "#AAA" },
  "관리 필요":{ color: "#C47E1A", bg: "#FDF3E0", dot: "#F0A500" },
  "진행 중":  { color: "#2980B9", bg: "#E8F4FB", dot: "#3498DB" },
  "중단":     { color: "#C0392B", bg: "#FDEDED", dot: "#E74C3C" },
  "취소":     { color: "#999",    bg: "#F5F4F0", dot: "#CCC" },
  "완료":     { color: "#27AE60", bg: "#EAF7EF", dot: "#2ECC71" },
};

/** Difficulty: Easy | Medium | Hard (Tasks 테이블 Difficulty 필드와 동일) */
const difficultyConfig = {
  Easy:   { label: "Easy",   bars: 1, color: "#3E7B27" },
  Medium: { label: "Medium", bars: 2, color: "#C47E1A" },
  Hard:   { label: "Hard",   bars: 3, color: "#C0392B" },
};

function normalizeDifficulty(value) {
  if (value === "Easy" || value === "Medium" || value === "Hard") return value;
  return "Easy";
}

const SAMPLE_TASKS = [
  {
    Title: "온실 화분 정리하기",
    Task_Type: "Cleaning",
    Status: "시작 전",
    Difficulty: "Medium",
    Scheduled_Date: "2026-03-15",
    Estimated_Duration: "3h",
    Target_Plant: ["장미나무", "쥐똥나무"],
    Notes: "죽은 화분 솎아내기, 흙 교체",
  },
  {
    Title: "장미 비료주기",
    Task_Type: "Fertilizing",
    Status: "진행 중",
    Difficulty: "Easy",
    Scheduled_Date: "2026-03-10",
    Estimated_Duration: "1h",
    Target_Plant: ["장미나무"],
    Notes: "",
  },
  {
    Title: "온습도계 두세개 사두기",
    Task_Type: "Construction",
    Status: "완료",
    Difficulty: "Easy",
    Scheduled_Date: "2026-03-06",
    Estimated_Duration: "–",
    Target_Plant: [],
    Notes: "온실 내 3곳 배치",
  },
];

function DifficultyBar({ difficulty }) {
  const d = difficultyConfig[difficulty];
  if (!d) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ display: "flex", gap: 3 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 5,
              height: 12,
              borderRadius: 2,
              background: i <= d.bars ? d.color : "#E8E4DC",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 10, color: d.color, fontFamily: "'DM Mono', monospace" }}>
        {d.label}
      </span>
    </div>
  );
}

function MetaItem({ icon, label, value }) {
  if (!value || value === "–") return null;
  return (
    <span style={{ fontSize: 11, color: "#A89880", fontFamily: "'DM Mono', monospace", display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span aria-hidden>{icon}</span>
      <span style={{ color: "#5C4A32" }}>{label}</span>
      <span style={{ color: "#A89880" }}>{value}</span>
    </span>
  );
}

function ListChips({ items, prefix }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingLeft: 8 }}>
      {items.map((t) => (
        <span
          key={`${prefix}-${t}`}
          style={{
            fontSize: 11,
            padding: "2px 8px",
            borderRadius: 999,
            background: "#F0EBE0",
            color: "#5C4A32",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

export function TaskCard({ task }) {
  const [hovered, setHovered] = useState(false);
  const type = taskTypeConfig[task.Task_Type] || { icon: "○", label: task.Task_Type, color: "#999", bg: "#F5F4F0" };
  const status = statusConfig[task.Status] || statusConfig["시작 전"];
  const isComplete = task.Status === "완료";

  const dateStr = task.Scheduled_Date
    ? new Date(task.Scheduled_Date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
    : "–";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 280,
        borderRadius: 16,
        background: isComplete ? "#F8F7F2" : "#FDFAF5",
        border: `1px solid ${hovered ? "#C8B090" : "#E8E0D0"}`,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: hovered
          ? "0 8px 24px rgba(90,65,40,0.12)"
          : "0 2px 12px rgba(90,65,40,0.06)",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        cursor: "default",
        opacity: isComplete ? 0.75 : 1,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accent stripe */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 4,
          height: "100%",
          background: type.color,
          borderRadius: "16px 0 0 16px",
          opacity: 0.7,
        }}
      />

      {/* Row 1: type badge + status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingLeft: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "4px 10px",
            borderRadius: 20,
            background: type.bg,
          }}
        >
          <span style={{ fontSize: 14, color: type.color }}>{type.icon}</span>
          <span style={{ fontSize: 11, color: type.color, fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em" }}>
            {type.label}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: status.dot,
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: status.color,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {task.Status}
          </span>
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          paddingLeft: 8,
          fontSize: 17,
          fontWeight: 700,
          color: isComplete ? "#8A7A6A" : "#2C1F0E",
          fontFamily: "'Noto Serif KR', serif",
          lineHeight: 1.3,
          textDecoration: isComplete ? "line-through" : "none",
        }}
      >
        {task.Title}
      </div>

      {/* Meta row: 일정/소요시간 */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingLeft: 8 }}>
        <MetaItem icon="🗓" label="예정" value={dateStr} />
        <MetaItem icon="⏱" label="소요" value={task.Estimated_Duration} />
      </div>

      {/* Target plants */}
      {task.Target_Plant && task.Target_Plant.length > 0 && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", paddingLeft: 8 }}>
          {task.Target_Plant.map((p) => (
            <span
              key={p}
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 8,
                background: "#EDE8DE",
                color: "#5C4A32",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              🌿 {p}
            </span>
          ))}
        </div>
      )}

      {/* 선행/후속 작업 */}
      {task.Prerequisites && task.Prerequisites.length > 0 && (
        <>
          <div style={{ paddingLeft: 8, fontSize: 11, color: "#A89880", fontFamily: "'DM Mono', monospace" }}>선행 작업</div>
          <ListChips prefix="pre" items={task.Prerequisites} />
        </>
      )}
      {task.Followups && task.Followups.length > 0 && (
        <>
          <div style={{ paddingLeft: 8, fontSize: 11, color: "#A89880", fontFamily: "'DM Mono', monospace" }}>후속 작업</div>
          <ListChips prefix="post" items={task.Followups} />
        </>
      )}

      {/* Notes: Tasks 테이블 Notes 필드 — 설명/메모 */}
      {task.Notes ? (
        <div style={{ paddingLeft: 8 }}>
          <div
            style={{
              fontSize: 13,
              color: "#5C4A32",
              lineHeight: 1.55,
              fontFamily: "'Noto Serif KR', serif",
              borderLeft: "3px solid #E8E0D0",
              paddingLeft: 10,
              paddingTop: 6,
              paddingBottom: 6,
              background: "rgba(232, 224, 208, 0.2)",
              borderRadius: "0 8px 8px 0",
            }}
          >
            {task.Notes}
          </div>
        </div>
      ) : null}

      {/* Bottom row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #EDE8DE",
          paddingTop: 12,
          paddingLeft: 8,
        }}
      >
        <DifficultyBar difficulty={normalizeDifficulty(task.Difficulty)} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* 상단 메타로 이동 */}
        </div>
      </div>
    </div>
  );
}

export default TaskCard;

export function TaskCardDemo() {
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
            양주 정원 · Tasks
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#2C1F0E", fontFamily: "'Noto Serif KR', serif" }}>
            작업 카드
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {SAMPLE_TASKS.map((t) => (
            <TaskCard key={t.Title} task={t} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#C8B090", fontFamily: "'DM Mono', monospace" }}>
          카드에 마우스를 올려보세요
        </div>
      </div>
    </>
  );
}
