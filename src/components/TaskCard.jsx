import { useState } from "react";
import "./TaskCard.css";

/** 카드·섹션별 표시 상한 — UI 일관성 및 레이아웃 폭주 방지 */
export const TASK_CARD_LIMITS = {
  /** 카드 전체 최대 높이(px), 넘으면 카드 내부 스크롤 */
  maxHeightPx: 400,
  titleMaxLines: 2,
  /** 대상 식물 칩 최대 개수 */
  targetPlantsMax: 4,
  /** 선행·후속 작업 칩 최대 개수 */
  listChipsMax: 3,
  notesMaxLines: 4,
};

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

function ListChips({ items, prefix, maxItems = TASK_CARD_LIMITS.listChipsMax }) {
  if (!items || items.length === 0) return null;
  const shown = items.slice(0, maxItems);
  const rest = items.length - shown.length;
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingLeft: 8, alignItems: "center" }}>
      {shown.map((t, i) => (
        <span
          key={`${prefix}-${i}-${t}`}
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
      {rest > 0 ? (
        <span
          className="task-card__overflow-count"
          title={items.slice(maxItems).join(", ")}
          aria-label={`외 ${rest}건`}
        >
          +{rest}
        </span>
      ) : null}
    </div>
  );
}

/** 상세 패널 등 — 칩 탭 시 다른 상세로 이동 */
function NavListChips({ items, prefix, maxItems = TASK_CARD_LIMITS.listChipsMax }) {
  if (!items || items.length === 0) return null;
  const shown = items.slice(0, maxItems);
  const rest = items.length - shown.length;
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingLeft: 8, alignItems: "center" }}>
      {shown.map((item, i) => (
        <button
          key={`${prefix}-${i}-${item.label}`}
          type="button"
          className="task-card__chip-btn"
          onClick={(e) => {
            e.stopPropagation();
            item.onNavigate();
          }}
        >
          {item.label}
        </button>
      ))}
      {rest > 0 ? (
        <span className="task-card__overflow-count" aria-label={`외 ${rest}건`}>
          +{rest}
        </span>
      ) : null}
    </div>
  );
}

/**
 * @param {{
 *   task: object,
 *   onOpenDetail?: () => void,
 *   unconstrained?: boolean,
 *   locationLink?: { label: string, onNavigate: () => void },
 *   plantLinks?: Array<{ label: string, onNavigate: () => void }>,
 *   taskLinkGroups?: { prerequisites?: Array<{ label: string, onNavigate: () => void }>, followups?: Array<{ label: string, onNavigate: () => void }> },
 * }} props
 */
export function TaskCard({ task, onOpenDetail, unconstrained = false, locationLink, plantLinks, taskLinkGroups }) {
  const [hovered, setHovered] = useState(false);
  const type = taskTypeConfig[task.Task_Type] || { icon: "○", label: task.Task_Type, color: "#999", bg: "#F5F4F0" };
  const status = statusConfig[task.Status] || statusConfig["시작 전"];
  const isComplete = task.Status === "완료";

  const dateStr = task.Scheduled_Date
    ? new Date(task.Scheduled_Date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
    : "–";

  const targetPlants = task.Target_Plant || [];
  const targetShown = targetPlants.slice(0, TASK_CARD_LIMITS.targetPlantsMax);
  const targetRest = targetPlants.length - targetShown.length;

  return (
    <div
      className={`task-card ${onOpenDetail ? "task-card--interactive" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpenDetail ? () => onOpenDetail() : undefined}
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
        background: isComplete ? "#F8F7F2" : "#FDFAF5",
        border: `1px solid ${hovered ? "#C8B090" : "#E8E0D0"}`,
        boxShadow: hovered
          ? "0 8px 24px rgba(90,65,40,0.12)"
          : "0 2px 12px rgba(90,65,40,0.06)",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        cursor: onOpenDetail ? "pointer" : "default",
        opacity: isComplete ? 0.75 : 1,
        position: "relative",
        maxHeight: unconstrained ? undefined : TASK_CARD_LIMITS.maxHeightPx,
        overflowY: unconstrained ? undefined : "auto",
        overflowX: "hidden",
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
        className="task-card__title task-card__title--clamped"
        style={{
          color: isComplete ? "#8A7A6A" : "#2C1F0E",
          textDecoration: isComplete ? "line-through" : "none",
          WebkitLineClamp: TASK_CARD_LIMITS.titleMaxLines,
        }}
        title={task.Title}
      >
        {task.Title}
      </div>

      {/* Meta row: 일정/소요시간 */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingLeft: 8 }}>
        <MetaItem icon="🗓" label="예정" value={dateStr} />
        <MetaItem icon="⏱" label="소요" value={task.Estimated_Duration} />
      </div>

      {locationLink ? (
        <div style={{ paddingLeft: 8 }}>
          <button
            type="button"
            className="task-card__location-link"
            onClick={(e) => {
              e.stopPropagation();
              locationLink.onNavigate();
            }}
          >
            📍 {locationLink.label}
          </button>
        </div>
      ) : null}

      {/* Target plants */}
      {plantLinks && plantLinks.length > 0 ? (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", paddingLeft: 8, alignItems: "center" }}>
          {plantLinks.slice(0, TASK_CARD_LIMITS.targetPlantsMax).map((item, i) => (
            <button
              key={`plant-nav-${i}-${item.label}`}
              type="button"
              className="task-card__plant-chip-btn"
              onClick={(e) => {
                e.stopPropagation();
                item.onNavigate();
              }}
            >
              🌿 {item.label}
            </button>
          ))}
          {plantLinks.length > TASK_CARD_LIMITS.targetPlantsMax ? (
            <span className="task-card__overflow-count" aria-label={`외 식물 ${plantLinks.length - TASK_CARD_LIMITS.targetPlantsMax}건`}>
              +{plantLinks.length - TASK_CARD_LIMITS.targetPlantsMax}
            </span>
          ) : null}
        </div>
      ) : targetPlants.length > 0 ? (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", paddingLeft: 8, alignItems: "center" }}>
          {targetShown.map((p, i) => (
            <span
              key={`plant-${i}-${p}`}
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
          {targetRest > 0 ? (
            <span
              className="task-card__overflow-count"
              title={targetPlants.slice(TASK_CARD_LIMITS.targetPlantsMax).join(", ")}
              aria-label={`외 식물 ${targetRest}건`}
            >
              +{targetRest}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* 선행/후속 작업 */}
      {taskLinkGroups?.prerequisites && taskLinkGroups.prerequisites.length > 0 ? (
        <>
          <div style={{ paddingLeft: 8, fontSize: 11, color: "#A89880", fontFamily: "'DM Mono', monospace" }}>선행 작업</div>
          <NavListChips prefix="pre" items={taskLinkGroups.prerequisites} />
        </>
      ) : task.Prerequisites && task.Prerequisites.length > 0 ? (
        <>
          <div style={{ paddingLeft: 8, fontSize: 11, color: "#A89880", fontFamily: "'DM Mono', monospace" }}>선행 작업</div>
          <ListChips prefix="pre" items={task.Prerequisites} />
        </>
      ) : null}
      {taskLinkGroups?.followups && taskLinkGroups.followups.length > 0 ? (
        <>
          <div style={{ paddingLeft: 8, fontSize: 11, color: "#A89880", fontFamily: "'DM Mono', monospace" }}>후속 작업</div>
          <NavListChips prefix="post" items={taskLinkGroups.followups} />
        </>
      ) : task.Followups && task.Followups.length > 0 ? (
        <>
          <div style={{ paddingLeft: 8, fontSize: 11, color: "#A89880", fontFamily: "'DM Mono', monospace" }}>후속 작업</div>
          <ListChips prefix="post" items={task.Followups} />
        </>
      ) : null}

      {/* Notes: Tasks 테이블 Notes 필드 — 설명/메모 */}
      {task.Notes ? (
        <div style={{ paddingLeft: 8 }}>
          <div
            className="task-card__notes"
            style={{ WebkitLineClamp: TASK_CARD_LIMITS.notesMaxLines }}
            title={task.Notes}
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
