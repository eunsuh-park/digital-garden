import { useState } from "react";
import { Icon } from "@iconify/react";
import task2Line from "@iconify-icons/mingcute/task-2-line";
import leaf3Fill from "@iconify-icons/mingcute/leaf-3-fill";
import mapLine from "@iconify-icons/mingcute/map-line";
import bookmarkFill from "@iconify-icons/mingcute/bookmark-fill";
import addLine from "@iconify-icons/mingcute/add-line";
import "./TaskCard.css";

/** 카드·섹션별 표시 상한 */
export const TASK_CARD_LIMITS = {
  titleMaxLines: 2,
};

/** Tasks 테이블 Task_Type 값 → 프론트 한글 라벨 + 아이콘/색상 */
const taskTypeConfig = {
  Pruning: { icon: leaf3Fill, label: "전정", color: "#4A90C4", bg: "#E8F2FA" },
  Fertilizing: { icon: bookmarkFill, label: "비료", color: "#B8860B", bg: "#FDF6DC" },
  Propagation: { icon: addLine, label: "번식", color: "#3E7B27", bg: "#EAF2E3" },
  Watering: { icon: mapLine, label: "물주기", color: "#1E90A8", bg: "#E3F4F8" },
  Transplanting: { icon: task2Line, label: "이식", color: "#8B5E3C", bg: "#F5EDE4" },
  Observation: { icon: bookmarkFill, label: "관찰", color: "#7A7A7A", bg: "#F0EFEB" },
  Cleaning: { icon: task2Line, label: "청소", color: "#C0392B", bg: "#FDEDED" },
  Decorating: { icon: leaf3Fill, label: "꾸미기", color: "#8E44AD", bg: "#F4E8FA" },
  Construction: { icon: task2Line, label: "시공", color: "#E67E22", bg: "#FEF0E4" },
};

const statusConfig = {
  "시작 전": { color: "#999", bg: "#F5F4F0", dot: "#CCC" },
  "진행 중": { color: "#2980B9", bg: "#E8F4FB", dot: "#3498DB" },
  // 노션 원문이 공백 없을 수 있음
  진행중: { color: "#2980B9", bg: "#E8F4FB", dot: "#3498DB" },
  완료: { color: "#27AE60", bg: "#EAF7EF", dot: "#2ECC71" },
};

const statusStyleFallback = { color: "#666", bg: "#F0EEEA", dot: "#AAA" };

const SAMPLE_TASKS = [
  {
    Title: "온실 화분 정리하기",
    Task_Type: "Cleaning",
    Status: "시작 전",
    Scheduled_Date: "2026-03-15",
  },
  {
    Title: "장미 비료주기",
    Task_Type: "Fertilizing",
    Status: "진행 중",
    Scheduled_Date: "2026-03-10",
  },
];

/**
 * @param {{
 *   task: object,
 *   onOpenDetail?: () => void,
 *   onToggleComplete?: () => void,
 *   completingToggle?: boolean,
 *   overdue?: boolean,
 * }} props
 */
export function TaskCard({
  task,
  onOpenDetail,
  onToggleComplete,
  completingToggle = false,
  overdue = false,
}) {
  const [hovered, setHovered] = useState(false);
  const type = taskTypeConfig[task.Task_Type] || { icon: task2Line, label: task.Task_Type, color: "#999", bg: "#F5F4F0" };
  const statusLabel = task.Status || "시작 전";
  const status = statusConfig[statusLabel] || statusStyleFallback;
  const isComplete = statusLabel === "완료";
  const showCompleteToggle = Boolean(onToggleComplete) && !isComplete;

  const dateStr = task.Scheduled_Date
    ? new Date(task.Scheduled_Date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
    : "–";

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
        boxShadow: hovered ? "0 6px 18px rgba(90,65,40,0.1)" : "0 2px 12px rgba(90,65,40,0.06)",
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        cursor: onOpenDetail ? "pointer" : "default",
        opacity: isComplete ? 0.75 : 1,
        position: "relative",
      }}
    >
      {overdue && !isComplete ? (
        <span className="task-card__overdue-badge" aria-label="예정일 지남">
          지연
        </span>
      ) : null}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 4,
          height: "100%",
          background: type.color,
          borderRadius: "0",
          opacity: 0.7,
        }}
      />

      <div className="task-card__row-main">
        {showCompleteToggle ? (
          <label
            className="task-card__complete-label"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              className="task-card__complete-input"
              disabled={completingToggle}
              onChange={() => onToggleComplete?.()}
              aria-label="완료로 표시"
            />
          </label>
        ) : null}

        <div className="task-card__main-col">
          <div className="task-card__row-type-status">
            <span
              className="task-card__type-pill"
              style={{ background: type.bg, color: type.color }}
            >
              <Icon icon={type.icon} width={13} height={13} aria-hidden />
              <span>{type.label}</span>
            </span>
            <span className="task-card__status-pill" style={{ color: status.color, background: status.bg }}>
              <span className="task-card__status-dot" style={{ background: status.dot }} aria-hidden />
              {task.Status}
            </span>
          </div>

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

          <div className="task-card__row-meta">
            <span className="task-card__meta-date">
              <Icon icon={task2Line} width={13} height={13} aria-hidden /> {dateStr}
            </span>
          </div>
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
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {SAMPLE_TASKS.map((t) => (
            <TaskCard key={t.Title} task={t} />
          ))}
        </div>
      </div>
    </>
  );
}
