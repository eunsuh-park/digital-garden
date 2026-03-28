import { useEffect, useMemo, useRef, useState } from "react";
import "./DatePicker.css";

const WEEK_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const str = String(value).trim();
  if (!str) return null;
  const normalized = str.replaceAll(".", "/").replaceAll("-", "/");
  const [yearRaw, monthRaw, dayRaw] = normalized.split("/");
  const year = Number.parseInt(yearRaw, 10);
  const month = Number.parseInt(monthRaw, 10);
  const day = Number.parseInt(dayRaw, 10);
  if (!year || !month || !day) return null;
  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatDate(date) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

function buildCalendarMatrix(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = 0; i < 42; i += 1) {
    const dayNumber = i - startWeekday + 1;
    if (dayNumber <= 0) {
      cells.push({
        value: new Date(year, month - 1, prevMonthLastDate + dayNumber),
        outOfMonth: true,
      });
      continue;
    }

    if (dayNumber > lastDate) {
      cells.push({
        value: new Date(year, month + 1, dayNumber - lastDate),
        outOfMonth: true,
      });
      continue;
    }

    cells.push({
      value: new Date(year, month, dayNumber),
      outOfMonth: false,
    });
  }

  return cells;
}

function isSameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="date-picker__calendar-icon">
      <path d="M7 2.75a.75.75 0 0 1 .75.75V5h8.5V3.5a.75.75 0 0 1 1.5 0V5h1A2.25 2.25 0 0 1 21 7.25v12.5A2.25 2.25 0 0 1 18.75 22h-13.5A2.25 2.25 0 0 1 3 19.75V7.25A2.25 2.25 0 0 1 5.25 5h1V3.5A.75.75 0 0 1 7 2.75Zm11.75 8H5.25v9a.75.75 0 0 0 .75.75h12a.75.75 0 0 0 .75-.75v-9Zm-12.5-4.25h12a.75.75 0 0 1 .75.75v2h-13.5v-2a.75.75 0 0 1 .75-.75Z" />
    </svg>
  );
}

/**
 * @param {{
 *   value?: Date | string | null,
 *   defaultValue?: Date | string | null,
 *   onChange?: (nextDate: Date) => void,
 *   size?: "l" | "m" | "s",
 *   disabled?: boolean,
 *   visualState?: "default" | "hover" | "active" | "selected",
 *   placeholder?: string,
 *   pickerType?: "calendar" | "wheel",
 *   className?: string
 * }} props
 */
export function DatePicker({
  value,
  defaultValue = null,
  onChange,
  size = "l",
  disabled = false,
  visualState = "default",
  placeholder = "YYYY/MM/DD",
  pickerType = "calendar",
  className = "",
}) {
  const isControlled = value !== undefined;
  const [internalDate, setInternalDate] = useState(toDate(defaultValue));
  const selectedDate = isControlled ? toDate(value) : internalDate;
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(selectedDate || new Date());
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleOutsideClick = (event) => {
      if (!rootRef.current || rootRef.current.contains(event.target)) return;
      setOpen(false);
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [selectedDate]);

  const displayValue = formatDate(selectedDate);
  const calendarCells = useMemo(() => buildCalendarMatrix(viewDate), [viewDate]);
  const inputState = disabled ? "disabled" : visualState;
  const rootClasses = ["date-picker", `date-picker--${size}`, className].filter(Boolean).join(" ");

  const applyDate = (nextDate) => {
    if (!isControlled) setInternalDate(nextDate);
    onChange?.(nextDate);
    setOpen(false);
  };

  const pickQuickDate = (days) => {
    const next = new Date();
    next.setDate(next.getDate() + days);
    applyDate(next);
  };

  const wheelYear = viewDate.getFullYear();
  const wheelMonth = viewDate.getMonth() + 1;
  const wheelDay = viewDate.getDate();

  return (
    <div className={rootClasses} ref={rootRef}>
      <button
        type="button"
        className={`date-picker__field date-picker__field--${inputState}`}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={`date-picker__text ${displayValue ? "date-picker__text--value" : ""}`}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon />
      </button>

      {open ? (
        <div className="date-picker__panel" role="dialog" aria-label="날짜 선택">
          {pickerType === "wheel" ? (
            <div className="date-picker__wheel">
              <div className="date-picker__wheel-column">
                <button type="button" onClick={() => setViewDate(new Date(wheelYear - 1, wheelMonth - 1, wheelDay))}>
                  ^
                </button>
                <span>{wheelYear}</span>
                <button type="button" onClick={() => setViewDate(new Date(wheelYear + 1, wheelMonth - 1, wheelDay))}>
                  v
                </button>
              </div>
              <div className="date-picker__wheel-column">
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(wheelYear, Math.max(0, wheelMonth - 2), wheelDay))}
                >
                  ^
                </button>
                <span>{wheelMonth}</span>
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(wheelYear, Math.min(11, wheelMonth), wheelDay))}
                >
                  v
                </button>
              </div>
              <div className="date-picker__wheel-column">
                <button type="button" onClick={() => setViewDate(new Date(wheelYear, wheelMonth - 1, wheelDay - 1))}>
                  ^
                </button>
                <span>{wheelDay}</span>
                <button type="button" onClick={() => setViewDate(new Date(wheelYear, wheelMonth - 1, wheelDay + 1))}>
                  v
                </button>
              </div>
              <button type="button" className="date-picker__wheel-confirm" onClick={() => applyDate(viewDate)}>
                선택
              </button>
            </div>
          ) : (
            <>
              <div className="date-picker__quick-actions">
                <button type="button" onClick={() => pickQuickDate(0)}>
                  오늘
                </button>
                <button type="button" onClick={() => pickQuickDate(1)}>
                  내일
                </button>
              </div>
              <div className="date-picker__month-header">
                <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}>
                  &lt;
                </button>
                <strong>
                  {viewDate.getFullYear()}.{viewDate.getMonth() + 1}
                </strong>
                <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}>
                  &gt;
                </button>
              </div>
              <div className="date-picker__week-row">
                {WEEK_LABELS.map((label, idx) => (
                  <span key={label + idx} className={idx === 0 ? "date-picker__sun" : ""}>
                    {label}
                  </span>
                ))}
              </div>
              <div className="date-picker__grid">
                {calendarCells.map((cell) => {
                  const selected = isSameDay(cell.value, selectedDate);
                  return (
                    <button
                      key={cell.value.toISOString()}
                      type="button"
                      className={[
                        "date-picker__cell",
                        cell.outOfMonth ? "date-picker__cell--muted" : "",
                        selected ? "date-picker__cell--selected" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => applyDate(cell.value)}
                    >
                      {cell.value.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default DatePicker;
