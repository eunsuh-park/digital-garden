import { useMemo, useState } from "react";
import Badge from "@/shared/ui/badge/Badge";
import DatePicker from "@/shared/ui/date-picker/DatePicker";
import "./UiLabPage.css";

const BADGE_SIZES = ["m", "l"];
const DATE_PICKER_SIZES = ["l", "m", "s"];
const DATE_PICKER_STATES = ["default", "hover", "active", "selected"];
const DATE_PICKER_TYPES = ["calendar", "wheel"];

function parseDateInput(raw) {
  const value = raw.trim();
  if (!value) return null;
  const normalized = value.replaceAll(".", "/").replaceAll("-", "/");
  const [yearRaw, monthRaw, dayRaw] = normalized.split("/");
  const year = Number.parseInt(yearRaw, 10);
  const month = Number.parseInt(monthRaw, 10);
  const day = Number.parseInt(dayRaw, 10);
  if (!year || !month || !day) return null;
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toInputDate(value) {
  if (!value) return "";
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

export default function UiLabPage() {
  const [badgeSize, setBadgeSize] = useState("l");
  const [badgeCount, setBadgeCount] = useState("99+");
  const [badgeMaxCount, setBadgeMaxCount] = useState(99);

  const [datePickerSize, setDatePickerSize] = useState("l");
  const [datePickerState, setDatePickerState] = useState("default");
  const [datePickerType, setDatePickerType] = useState("calendar");
  const [datePickerDisabled, setDatePickerDisabled] = useState(false);
  const [dateValue, setDateValue] = useState(new Date(2024, 0, 10));
  const [dateInputRaw, setDateInputRaw] = useState("2024/01/10");

  const normalizedBadgeCount = useMemo(() => {
    const trimmed = badgeCount.trim();
    if (!trimmed) return null;
    const maybeNumber = Number.parseInt(trimmed, 10);
    return Number.isFinite(maybeNumber) && String(maybeNumber) === trimmed ? maybeNumber : trimmed;
  }, [badgeCount]);

  const applyManualDate = () => {
    const next = parseDateInput(dateInputRaw);
    if (next) setDateValue(next);
  };

  return (
    <div className="ui-lab">
      <header className="ui-lab__header">
        <h1>UI Components Lab</h1>
        <p>현재까지 만든 UI 컴포넌트만 모아서 props와 인터랙션을 검증하는 페이지입니다.</p>
      </header>

      <section className="ui-lab__section">
        <div className="ui-lab__section-title">
          <h2>Badge</h2>
          <span>shared/ui/badge</span>
        </div>

        <div className="ui-lab__controls">
          <label>
            Size
            <select value={badgeSize} onChange={(e) => setBadgeSize(e.target.value)}>
              {BADGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <label>
            Count
            <input value={badgeCount} onChange={(e) => setBadgeCount(e.target.value)} placeholder="예: 1, 9+, 99+" />
          </label>
          <label>
            MaxCount
            <input
              type="number"
              min={1}
              value={badgeMaxCount}
              onChange={(e) => setBadgeMaxCount(Number.parseInt(e.target.value || "99", 10))}
            />
          </label>
        </div>

        <div className="ui-lab__preview-card">
          <Badge size={badgeSize} count={normalizedBadgeCount} maxCount={badgeMaxCount} />
        </div>

        <div className="ui-lab__variant-row">
          <Badge size="m" count={null} />
          <Badge size="m" count={1} />
          <Badge size="m" count="9+" />
          <Badge size="m" count="99+" />
          <Badge size="l" count={null} />
          <Badge size="l" count={1} />
          <Badge size="l" count="9+" />
          <Badge size="l" count="99+" />
        </div>
      </section>

      <section className="ui-lab__section">
        <div className="ui-lab__section-title">
          <h2>DatePicker</h2>
          <span>shared/ui/date-picker</span>
        </div>

        <div className="ui-lab__controls">
          <label>
            Size
            <select value={datePickerSize} onChange={(e) => setDatePickerSize(e.target.value)}>
              {DATE_PICKER_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <label>
            State
            <select value={datePickerState} onChange={(e) => setDatePickerState(e.target.value)}>
              {DATE_PICKER_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label>
            Picker
            <select value={datePickerType} onChange={(e) => setDatePickerType(e.target.value)}>
              {DATE_PICKER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-lab__checkbox-label">
            <input
              type="checkbox"
              checked={datePickerDisabled}
              onChange={(e) => setDatePickerDisabled(e.target.checked)}
            />
            Disabled
          </label>
        </div>

        <div className="ui-lab__controls">
          <label>
            Value
            <input
              value={dateInputRaw}
              onChange={(e) => setDateInputRaw(e.target.value)}
              placeholder="YYYY/MM/DD"
            />
          </label>
          <button type="button" onClick={applyManualDate}>
            값 적용
          </button>
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              setDateValue(today);
              setDateInputRaw(toInputDate(today));
            }}
          >
            오늘
          </button>
        </div>

        <div className="ui-lab__preview-card">
          <DatePicker
            value={dateValue}
            onChange={(nextDate) => {
              setDateValue(nextDate);
              setDateInputRaw(toInputDate(nextDate));
            }}
            size={datePickerSize}
            visualState={datePickerState}
            pickerType={datePickerType}
            disabled={datePickerDisabled}
          />
        </div>

        <div className="ui-lab__variant-row">
          <DatePicker size="l" defaultValue="2024/01/10" visualState="default" />
          <DatePicker size="m" defaultValue="2024/01/10" visualState="hover" />
          <DatePicker size="s" defaultValue="2024/01/10" visualState="selected" />
          <DatePicker size="l" defaultValue="2024/01/10" disabled />
        </div>
      </section>
    </div>
  );
}
