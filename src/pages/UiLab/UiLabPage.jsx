import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "@/shared/ui/badge/Badge";
import DatePicker from "@/shared/ui/date-picker/DatePicker";
import Select from "@/shared/ui/select/Select";
import TextField from "@/shared/ui/text-field/TextField";
import TextButton from "@/shared/ui/text-button/TextButton";
import IconButton from "@/shared/ui/icon-button/IconButton";
import Checkbox from "@/shared/ui/checkbox/Checkbox";
import RadioButton, { RadioGroup } from "@/shared/ui/radio-button/RadioButton";
import ToggleButton from "@/shared/ui/toggle-button/ToggleButton";
import ButtonTab, { ButtonTabGroup } from "@/shared/ui/button-tab/ButtonTab";
import Tooltip from "@/shared/ui/tooltip/Tooltip";
import ActionPopover from "@/shared/ui/action-popover/ActionPopover";
import Container from "@/shared/ui/container/Container";
import Dialog from "@/shared/ui/dialog/Dialog";
import Divider from "@/shared/ui/divider/Divider";
import SectionHeading from "@/shared/ui/section-heading/SectionHeading";
import "./UiLabPage.css";

const BADGE_SIZES = ["m", "l"];
const BADGE_TONES = ["brand", "neutral", "success", "warning", "danger"];
const BADGE_EMPHASES = ["solid", "soft"];
const DATE_PICKER_SIZES = ["l", "m", "s"];
const DATE_PICKER_STATES = ["default", "hover", "active", "selected"];
const DATE_PICKER_TYPES = ["calendar", "wheel"];
const SELECT_SIZES = ["l", "m", "s"];
const SELECT_STATES = ["default", "hover", "active", "selected"];
const SELECT_VARIANTS = ["box", "list"];
const TEXT_FIELD_TYPES = ["short", "long"];
const TEXT_FIELD_VARIANTS = ["text-field", "search-bar", "suffix", "x-mark", "stepper", "text-area", "search-with-icon"];
const TEXT_FIELD_SIZES = ["l", "m", "s"];
const TEXT_FIELD_STATES = ["default", "hover", "active", "valid-feedback", "invalid-feedback"];
const TEXT_BUTTON_STYLES = ["primary", "secondary", "tertiary", "danger", "symentic"];
const TEXT_BUTTON_STATES = ["able", "hover", "focus", "fasble"];
const TEXT_BUTTON_SIZES = ["l", "m", "s", "xs"];
const ICON_BUTTON_STYLES = ["nobg", "filled", "destructive"];
const ICON_BUTTON_STATES = ["default", "hover", "pressed", "disabled"];
const CHECKBOX_SIZES = ["l", "m", "s"];
const CHECKBOX_STATES = ["default", "hover", "focus", "active"];
const RADIO_SIZES = ["l", "m", "s"];
const RADIO_STATES = ["default", "hover", "focus", "active"];
const TOGGLE_SIZES = ["l", "m", "s"];
const BUTTON_TAB_SIZES = ["l", "m"];
const BUTTON_TAB_STATES = ["default", "hover", "active"];
const TOOLTIP_PLACEMENTS = ["top", "right", "bottom", "left"];
const TOOLTIP_TONES = ["dark", "light"];
const TOOLTIP_TRIGGERS = ["hover", "click"];
const ACTION_POPOVER_PLACEMENTS = ["top", "right", "bottom", "left"];
const ACTION_POPOVER_ALIGNS = ["left", "center", "right"];
const ACTION_POPOVER_TRIGGERS = ["hover", "click"];
const SELECT_OPTIONS = [
  { label: "선택 옵션 1", value: "opt-1" },
  { label: "선택 옵션 2", value: "opt-2" },
  { label: "선택 옵션 3", value: "opt-3" },
  { label: "선택 옵션 4", value: "opt-4" },
];
const RADIO_OPTIONS = [
  { label: "옵션 1", value: "opt-1" },
  { label: "옵션 2", value: "opt-2" },
  { label: "옵션 3", value: "opt-3" },
];
const BUTTON_TAB_ITEMS = [
  { label: "탭 1", value: "tab-1" },
  { label: "탭 2", value: "tab-2" },
  { label: "탭 3", value: "tab-3" },
];

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
  const [badgeTone, setBadgeTone] = useState("brand");
  const [badgeEmphasis, setBadgeEmphasis] = useState("solid");
  const [badgeCount, setBadgeCount] = useState("99+");
  const [badgeMaxCount, setBadgeMaxCount] = useState(99);

  const [datePickerSize, setDatePickerSize] = useState("l");
  const [datePickerState, setDatePickerState] = useState("default");
  const [datePickerType, setDatePickerType] = useState("calendar");
  const [datePickerDisabled, setDatePickerDisabled] = useState(false);
  const [dateValue, setDateValue] = useState(new Date(2024, 0, 10));
  const [dateInputRaw, setDateInputRaw] = useState("2024/01/10");
  const [selectSize, setSelectSize] = useState("l");
  const [selectState, setSelectState] = useState("default");
  const [selectVariant, setSelectVariant] = useState("box");
  const [selectDisabled, setSelectDisabled] = useState(false);
  const [selectValue, setSelectValue] = useState("opt-1");
  const [textFieldType, setTextFieldType] = useState("short");
  const [textFieldVariant, setTextFieldVariant] = useState("text-field");
  const [textFieldSize, setTextFieldSize] = useState("l");
  const [textFieldState, setTextFieldState] = useState("default");
  const [textFieldDisabled, setTextFieldDisabled] = useState(false);
  const [textFieldRequired, setTextFieldRequired] = useState(false);
  const [textFieldHelpButton, setTextFieldHelpButton] = useState(false);
  const [textFieldShowHelper, setTextFieldShowHelper] = useState(true);
  const [textFieldClearable, setTextFieldClearable] = useState(false);
  const [textFieldCounter, setTextFieldCounter] = useState(false);
  const [textFieldSearchButton, setTextFieldSearchButton] = useState(false);
  const [textFieldStepper, setTextFieldStepper] = useState(false);
  const [textFieldValue, setTextFieldValue] = useState("");
  const [textButtonStyle, setTextButtonStyle] = useState("primary");
  const [textButtonState, setTextButtonState] = useState("able");
  const [textButtonSize, setTextButtonSize] = useState("l");
  const [textButtonIcon, setTextButtonIcon] = useState(true);
  const [textButtonDisabled, setTextButtonDisabled] = useState(false);
  const [textButtonLabel, setTextButtonLabel] = useState("버튼 이름");
  const [iconButtonStyle, setIconButtonStyle] = useState("nobg");
  const [iconButtonState, setIconButtonState] = useState("default");
  const [iconButtonShowLabel, setIconButtonShowLabel] = useState(false);
  const [iconButtonLabelPlacement, setIconButtonLabelPlacement] = useState("inline");
  const [iconButtonDisabled, setIconButtonDisabled] = useState(false);
  const [iconButtonLabel, setIconButtonLabel] = useState("아이콘");
  const [checkboxSize, setCheckboxSize] = useState("m");
  const [checkboxState, setCheckboxState] = useState("default");
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [checkboxIndeterminate, setCheckboxIndeterminate] = useState(false);
  const [checkboxLocked, setCheckboxLocked] = useState(false);
  const [checkboxShowLabel, setCheckboxShowLabel] = useState(true);
  const [checkboxLabel, setCheckboxLabel] = useState("옵션 1");
  const [radioSize, setRadioSize] = useState("m");
  const [radioState, setRadioState] = useState("default");
  const [radioChecked, setRadioChecked] = useState(false);
  const [radioLocked, setRadioLocked] = useState(false);
  const [radioShowLabel, setRadioShowLabel] = useState(true);
  const [radioLabel, setRadioLabel] = useState("옵션 1");
  const [radioGroupValue, setRadioGroupValue] = useState("opt-1");
  const [toggleSize, setToggleSize] = useState("l");
  const [toggleChecked, setToggleChecked] = useState(true);
  const [toggleDisabled, setToggleDisabled] = useState(false);
  const [buttonTabSize, setButtonTabSize] = useState("l");
  const [buttonTabStatus, setButtonTabStatus] = useState("default");
  const [buttonTabDisabled, setButtonTabDisabled] = useState(false);
  const [buttonTabLabel, setButtonTabLabel] = useState("탭");
  const [buttonTabGroupValue, setButtonTabGroupValue] = useState("tab-1");
  const [tooltipPlacement, setTooltipPlacement] = useState("top");
  const [tooltipTone, setTooltipTone] = useState("dark");
  const [tooltipTrigger, setTooltipTrigger] = useState("hover");
  const [tooltipArrow, setTooltipArrow] = useState(true);
  const [tooltipMessage, setTooltipMessage] = useState("입력 예시입니다.");
  const [actionPopoverPlacement, setActionPopoverPlacement] = useState("bottom");
  const [actionPopoverAlign, setActionPopoverAlign] = useState("center");
  const [actionPopoverTrigger, setActionPopoverTrigger] = useState("click");
  const [actionPopoverOpen, setActionPopoverOpen] = useState(true);
  const [actionPopoverClose, setActionPopoverClose] = useState(true);
  const [actionPopoverFooter, setActionPopoverFooter] = useState(true);
  const [actionPopoverBodyMaxHeight, setActionPopoverBodyMaxHeight] = useState(96);
  const [actionPopoverMessage, setActionPopoverMessage] = useState(
    "이곳에 필요한 설명이나 정보를 입력합니다."
  );

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
        <div className="ui-lab__header-top">
          <div>
            <h1>UI Components Lab</h1>
            <p>현재까지 만든 UI 컴포넌트만 모아서 props와 인터랙션을 검증하는 페이지입니다.</p>
          </div>
          <Link to="/token-lab" className="ui-lab__token-link">
            Token Lab 이동
          </Link>
        </div>
      </header>

      <section className="ui-lab__section">
        <div className="ui-lab__section-title">
          <h2>Foundation</h2>
          <span>shared/ui/container, shared/ui/dialog</span>
        </div>

        <p className="ui-lab__section-description">
          로그인 폼 톤을 재사용 가능한 기본 레이어로 분리한 조합 예시입니다.
        </p>

        <div className="ui-lab__preview-card">
          <Container centered className="ui-lab__foundation-stage">
            <Dialog
              label="Digital Garden"
              title="로그인"
              maxWidth={380}
              footer={
                <>
                  <span className="ui-lab__foundation-meta">아이디/비밀번호를 새로 설정할까요?</span>
                  <TextButton label="계정 재설정" styleType="tertiary" size="xs" />
                </>
              }
            >
              <div className="ui-lab__foundation-body">
                <TextField
                  label="아이디"
                  inputId="ui-lab-foundation-username"
                  inputType="text"
                  inputName="username"
                  placeholder="my-id"
                  size="m"
                  showHelperText={false}
                />
                <TextField
                  label="비밀번호"
                  inputId="ui-lab-foundation-password"
                  inputType="password"
                  inputName="password"
                  placeholder="••••••••"
                  size="m"
                  showHelperText={false}
                />
                <TextButton label="로그인" styleType="primary" size="m" className="ui-lab__foundation-submit" />
              </div>
            </Dialog>
          </Container>
        </div>
      </section>

      <section className="ui-lab__section">
        <div className="ui-lab__section-title">
          <h2>SectionHeading</h2>
          <span>shared/ui/section-heading</span>
        </div>

        <div className="ui-lab__preview-card ui-lab__preview-card--column">
          <SectionHeading
            label="Garden Zone"
            title="토마토 구역 작업"
            description="이번 주 물주기, 가지치기, 지지대 점검 작업을 우선순위 순서로 진행합니다."
            action={<TextButton label="전체 보기" styleType="secondary" size="xs" />}
          />
          <SectionHeading title="간결 모드 헤더" description="설명과 타이틀만 보여주는 compact 스타일입니다." compact />
        </div>
      </section>

      <section className="ui-lab__section">
        <div className="ui-lab__section-title">
          <h2>Divider</h2>
          <span>shared/ui/divider</span>
        </div>

        <div className="ui-lab__preview-card ui-lab__preview-card--column">
          <Divider />
          <Divider label="or" />
          <Divider label="Section" align="left" />
          <Divider label="Step 2" align="right" dashed />
          <div className="ui-lab__divider-inline">
            <span>이전</span>
            <Divider orientation="vertical" />
            <span>다음</span>
          </div>
        </div>
      </section>

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
            Tone
            <select value={badgeTone} onChange={(e) => setBadgeTone(e.target.value)}>
              {BADGE_TONES.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </label>
          <label>
            Emphasis
            <select value={badgeEmphasis} onChange={(e) => setBadgeEmphasis(e.target.value)}>
              {BADGE_EMPHASES.map((emphasis) => (
                <option key={emphasis} value={emphasis}>
                  {emphasis}
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
          <Badge
            size={badgeSize}
            tone={badgeTone}
            emphasis={badgeEmphasis}
            count={normalizedBadgeCount}
            maxCount={badgeMaxCount}
          />
        </div>

        <div className="ui-lab__variant-row">
          <Badge size="m" tone="brand" emphasis="solid" count={null} />
          <Badge size="m" tone="brand" emphasis="solid" count={1} />
          <Badge size="m" tone="success" emphasis="soft" count="9+" />
          <Badge size="m" tone="danger" emphasis="solid" count="99+" />
          <Badge size="l" tone="neutral" emphasis="soft" count={null} />
          <Badge size="l" tone="neutral" emphasis="solid" count={1} />
          <Badge size="l" tone="warning" emphasis="soft" count="9+" />
          <Badge size="l" tone="danger" emphasis="soft" count="99+" />
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

      <section className="ui-lab__section">
        <div className="ui-lab__section-title">
          <h2>Select</h2>
          <span>shared/ui/select</span>
        </div>

        <div className="ui-lab__controls">
          <label>
            Size
            <select value={selectSize} onChange={(e) => setSelectSize(e.target.value)}>
              {SELECT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <label>
            State
            <select value={selectState} onChange={(e) => setSelectState(e.target.value)}>
              {SELECT_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label>
            Variant
            <select value={selectVariant} onChange={(e) => setSelectVariant(e.target.value)}>
              {SELECT_VARIANTS.map((variant) => (
                <option key={variant} value={variant}>
                  {variant}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-lab__checkbox-label">
            <input type="checkbox" checked={selectDisabled} onChange={(e) => setSelectDisabled(e.target.checked)} />
            Disabled
          </label>
        </div>

        <div className="ui-lab__controls">
          <label>
            Value
            <select value={selectValue} onChange={(e) => setSelectValue(e.target.value)}>
              {SELECT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="ui-lab__preview-card">
          <Select
            options={SELECT_OPTIONS}
            value={selectValue}
            onChange={setSelectValue}
            size={selectSize}
            visualState={selectState}
            variant={selectVariant}
            disabled={selectDisabled}
          />
        </div>

        <div className="ui-lab__variant-grid">
          <Select options={SELECT_OPTIONS} size="l" placeholder="플레이스홀더" />
          <Select options={SELECT_OPTIONS} size="m" placeholder="플레이스홀더" />
          <Select options={SELECT_OPTIONS} size="s" placeholder="플레이스홀더" />
          <Select options={SELECT_OPTIONS} size="l" value="opt-1" visualState="selected" />
          <Select options={SELECT_OPTIONS} size="m" value="opt-1" visualState="selected" />
          <Select options={SELECT_OPTIONS} size="s" value="opt-1" visualState="selected" />
          <Select options={SELECT_OPTIONS} size="l" disabled />
          <Select options={SELECT_OPTIONS} size="m" disabled />
          <Select options={SELECT_OPTIONS} size="s" disabled />
        </div>
      </section>

      <section className="ui-lab__section">
        <div className="ui-lab__section-title">
          <h2>TextField</h2>
          <span>shared/ui/text-field</span>
        </div>

        <div className="ui-lab__controls">
          <label>
            Variant
            <select value={textFieldVariant} onChange={(e) => setTextFieldVariant(e.target.value)}>
              {TEXT_FIELD_VARIANTS.map((variant) => (
                <option key={variant} value={variant}>
                  {variant}
                </option>
              ))}
            </select>
          </label>
          <label>
            Type
            <select value={textFieldType} onChange={(e) => setTextFieldType(e.target.value)}>
              {TEXT_FIELD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            Size
            <select value={textFieldSize} onChange={(e) => setTextFieldSize(e.target.value)}>
              {TEXT_FIELD_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <label>
            State
            <select value={textFieldState} onChange={(e) => setTextFieldState(e.target.value)}>
              {TEXT_FIELD_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-lab__checkbox-label">
            <input
              type="checkbox"
              checked={textFieldDisabled}
              onChange={(e) => setTextFieldDisabled(e.target.checked)}
            />
            Disabled
          </label>
          <label className="ui-lab__checkbox-label">
            <input
              type="checkbox"
              checked={textFieldRequired}
              onChange={(e) => setTextFieldRequired(e.target.checked)}
            />
            Required
          </label>
          <label className="ui-lab__checkbox-label">
            <input
              type="checkbox"
              checked={textFieldHelpButton}
              onChange={(e) => setTextFieldHelpButton(e.target.checked)}
            />
            Help Button
          </label>
          <label className="ui-lab__checkbox-label">
            <input
              type="checkbox"
              checked={textFieldShowHelper}
              onChange={(e) => setTextFieldShowHelper(e.target.checked)}
            />
            Helper Text
          </label>
          <label className="ui-lab__checkbox-label">
            <input
              type="checkbox"
              checked={textFieldClearable}
              onChange={(e) => setTextFieldClearable(e.target.checked)}
            />
            Clear
          </label>
          <label className="ui-lab__checkbox-label">
            <input
              type="checkbox"
              checked={textFieldCounter}
              onChange={(e) => setTextFieldCounter(e.target.checked)}
            />
            Counter
          </label>
          <label className="ui-lab__checkbox-label">
            <input
              type="checkbox"
              checked={textFieldSearchButton}
              onChange={(e) => setTextFieldSearchButton(e.target.checked)}
            />
            Search Btn
          </label>
          <label className="ui-lab__checkbox-label">
            <input
              type="checkbox"
              checked={textFieldStepper}
              onChange={(e) => setTextFieldStepper(e.target.checked)}
            />
            Stepper
          </label>
        </div>

        <div className="ui-lab__controls">
          <label>
            Value
            <input value={textFieldValue} onChange={(e) => setTextFieldValue(e.target.value)} placeholder="텍스트 입력" />
          </label>
        </div>

        <div className="ui-lab__preview-card ui-lab__preview-card--column">
          <TextField
            type={textFieldType}
            size={textFieldSize}
            state={textFieldState}
            disabled={textFieldDisabled}
            required={textFieldRequired}
            showHelpButton={textFieldHelpButton}
            showHelperText={textFieldShowHelper}
            clearable={textFieldClearable}
            showCounter={textFieldCounter}
            showSearchButton={textFieldSearchButton}
            maxLength={10}
            variant={textFieldStepper ? "stepper" : textFieldVariant}
            value={textFieldValue}
            onChange={setTextFieldValue}
          />
        </div>

        <div className="ui-lab__variant-grid">
          <TextField variant="search-bar" type="short" size="l" state="default" />
          <TextField variant="text-field" type="short" size="m" state="default" />
          <TextField variant="suffix" type="short" size="s" state="default" suffixText="Suffix" />
          <TextField variant="x-mark" type="short" size="l" state="active" value="입력값" />
          <TextField variant="stepper" type="short" size="m" state="default" value="1" />
          <TextField variant="text-area" type="long" size="s" state="hover" />
          <TextField variant="text-area" type="long" size="l" state="default" showCounter maxLength={10} value="안녕" />
          <TextField variant="search-with-icon" type="short" size="m" state="default" clearable value="입력중..." />
          <TextField variant="search-bar" type="short" size="s" disabled />
        </div>
      </section>

      <section className="ui-lab__section">
        <div className="ui-lab__section-title">
          <h2>TextButton</h2>
          <span>shared/ui/text-button</span>
        </div>

        <div className="ui-lab__controls">
          <label>
            Style
            <select value={textButtonStyle} onChange={(e) => setTextButtonStyle(e.target.value)}>
              {TEXT_BUTTON_STYLES.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </label>
          <label>
            State
            <select value={textButtonState} onChange={(e) => setTextButtonState(e.target.value)}>
              {TEXT_BUTTON_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label>
            Size
            <select value={textButtonSize} onChange={(e) => setTextButtonSize(e.target.value)}>
              {TEXT_BUTTON_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-lab__checkbox-label">
            <input type="checkbox" checked={textButtonIcon} onChange={(e) => setTextButtonIcon(e.target.checked)} />
            Icon
          </label>
          <label className="ui-lab__checkbox-label">
            <input
              type="checkbox"
              checked={textButtonDisabled}
              onChange={(e) => setTextButtonDisabled(e.target.checked)}
            />
            Disabled
          </label>
        </div>

        <div className="ui-lab__controls">
          <label>
            Label
            <input value={textButtonLabel} onChange={(e) => setTextButtonLabel(e.target.value)} placeholder="버튼 이름" />
          </label>
        </div>

        <div className="ui-lab__preview-card">
          <TextButton
            label={textButtonLabel || "버튼 이름"}
            styleType={textButtonStyle}
            state={textButtonState}
            size={textButtonSize}
            icon={textButtonIcon}
            disabled={textButtonDisabled}
          />
        </div>

        <div className="ui-lab__variant-grid ui-lab__variant-grid--button">
          <TextButton label="버튼 이름" styleType="primary" size="l" state="able" icon />
          <TextButton label="버튼 이름" styleType="secondary" size="l" state="able" icon />
          <TextButton label="버튼 이름" styleType="tertiary" size="l" state="able" icon />
          <TextButton label="버튼 이름" styleType="danger" size="l" state="able" icon />
          <TextButton label="버튼 이름" styleType="symentic" size="l" state="able" icon />

          <TextButton label="버튼 이름" styleType="primary" size="m" state="hover" icon />
          <TextButton label="버튼 이름" styleType="secondary" size="m" state="hover" icon />
          <TextButton label="버튼 이름" styleType="tertiary" size="m" state="focus" icon />
          <TextButton label="버튼 이름" styleType="danger" size="m" state="focus" icon />
          <TextButton label="버튼 이름" styleType="symentic" size="m" state="focus" icon />

          <TextButton label="버튼 이름" styleType="primary" size="s" state="able" />
          <TextButton label="버튼 이름" styleType="secondary" size="s" state="able" />
          <TextButton label="버튼 이름" styleType="tertiary" size="s" state="able" />
          <TextButton label="버튼 이름" styleType="danger" size="s" state="able" />
          <TextButton label="버튼 이름" styleType="symentic" size="s" state="able" />

          <TextButton label="버튼 이름" styleType="primary" size="xs" state="fasble" icon />
          <TextButton label="버튼 이름" styleType="secondary" size="xs" state="fasble" icon />
          <TextButton label="버튼 이름" styleType="tertiary" size="xs" state="fasble" icon />
          <TextButton label="버튼 이름" styleType="danger" size="xs" state="fasble" icon />
          <TextButton label="버튼 이름" styleType="symentic" size="xs" state="fasble" icon />
        </div>
      </section>

      <section className="ui-lab__section">
        <div className="ui-lab__section-title">
          <h2>IconButton</h2>
          <span>shared/ui/icon-button</span>
        </div>

        <div className="ui-lab__controls">
          <label>
            Style
            <select value={iconButtonStyle} onChange={(e) => setIconButtonStyle(e.target.value)}>
              {ICON_BUTTON_STYLES.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </label>
          <label>
            State
            <select value={iconButtonState} onChange={(e) => setIconButtonState(e.target.value)}>
              {ICON_BUTTON_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-lab__checkbox-label">
            <input
              type="checkbox"
              checked={iconButtonShowLabel}
              onChange={(e) => setIconButtonShowLabel(e.target.checked)}
            />
            Label
          </label>
          <label>
            Label Placement
            <select value={iconButtonLabelPlacement} onChange={(e) => setIconButtonLabelPlacement(e.target.value)}>
              <option value="inline">inline</option>
              <option value="stacked">stacked</option>
            </select>
          </label>
          <label className="ui-lab__checkbox-label">
            <input
              type="checkbox"
              checked={iconButtonDisabled}
              onChange={(e) => setIconButtonDisabled(e.target.checked)}
            />
            Disabled
          </label>
        </div>

        <div className="ui-lab__controls">
          <label>
            Label Text
            <input value={iconButtonLabel} onChange={(e) => setIconButtonLabel(e.target.value)} placeholder="아이콘" />
          </label>
        </div>

        <div className="ui-lab__preview-card">
          <IconButton
            styleType={iconButtonStyle}
            state={iconButtonState}
            showLabel={iconButtonShowLabel}
            labelPlacement={iconButtonLabelPlacement}
            label={iconButtonLabel || "아이콘"}
            disabled={iconButtonDisabled}
          />
        </div>

        <div className="ui-lab__variant-grid ui-lab__variant-grid--icon">
          <IconButton styleType="nobg" state="default" />
          <IconButton styleType="nobg" state="default" showLabel label="아이콘" />
          <IconButton styleType="nobg" state="default" showLabel labelPlacement="stacked" label="아이콘" />
          <IconButton styleType="nobg" state="hover" />
          <IconButton styleType="nobg" state="hover" showLabel label="아이콘" />
          <IconButton styleType="nobg" state="hover" showLabel labelPlacement="stacked" label="아이콘" />
          <IconButton styleType="nobg" state="pressed" />
          <IconButton styleType="nobg" state="pressed" showLabel label="아이콘" />
          <IconButton styleType="nobg" state="pressed" showLabel labelPlacement="stacked" label="아이콘" />
          <IconButton styleType="nobg" state="disabled" />
          <IconButton styleType="nobg" state="disabled" showLabel label="아이콘" />
          <IconButton styleType="nobg" state="disabled" showLabel labelPlacement="stacked" label="아이콘" />

          <IconButton styleType="filled" state="default" />
          <IconButton styleType="filled" state="default" showLabel label="아이콘" />
          <IconButton styleType="filled" state="default" showLabel labelPlacement="stacked" label="아이콘" />
          <IconButton styleType="filled" state="hover" />
          <IconButton styleType="filled" state="hover" showLabel label="아이콘" />
          <IconButton styleType="filled" state="hover" showLabel labelPlacement="stacked" label="아이콘" />
          <IconButton styleType="filled" state="pressed" />
          <IconButton styleType="filled" state="pressed" showLabel label="아이콘" />
          <IconButton styleType="filled" state="pressed" showLabel labelPlacement="stacked" label="아이콘" />
          <IconButton styleType="filled" state="disabled" />
          <IconButton styleType="filled" state="disabled" showLabel label="아이콘" />
          <IconButton styleType="filled" state="disabled" showLabel labelPlacement="stacked" label="아이콘" />

          <IconButton styleType="destructive" state="default" />
          <IconButton styleType="destructive" state="default" showLabel label="아이콘" />
          <IconButton styleType="destructive" state="default" showLabel labelPlacement="stacked" label="아이콘" />
          <IconButton styleType="destructive" state="hover" />
          <IconButton styleType="destructive" state="hover" showLabel label="아이콘" />
          <IconButton styleType="destructive" state="hover" showLabel labelPlacement="stacked" label="아이콘" />
          <IconButton styleType="destructive" state="pressed" />
          <IconButton styleType="destructive" state="pressed" showLabel label="아이콘" />
          <IconButton styleType="destructive" state="pressed" showLabel labelPlacement="stacked" label="아이콘" />
          <IconButton styleType="destructive" state="disabled" />
          <IconButton styleType="destructive" state="disabled" showLabel label="아이콘" />
          <IconButton styleType="destructive" state="disabled" showLabel labelPlacement="stacked" label="아이콘" />
        </div>
      </section>

      <section className="ui-lab__section">
        <div className="ui-lab__section-title">
          <h2>Checkbox</h2>
          <span>shared/ui/checkbox</span>
        </div>

        <div className="ui-lab__controls">
          <label>
            Size
            <select value={checkboxSize} onChange={(e) => setCheckboxSize(e.target.value)}>
              {CHECKBOX_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <label>
            State
            <select value={checkboxState} onChange={(e) => setCheckboxState(e.target.value)}>
              {CHECKBOX_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-lab__checkbox-label">
            <input
              type="checkbox"
              checked={checkboxChecked}
              onChange={(e) => setCheckboxChecked(e.target.checked)}
            />
            Checked
          </label>
          <label className="ui-lab__checkbox-label">
            <input
              type="checkbox"
              checked={checkboxIndeterminate}
              onChange={(e) => setCheckboxIndeterminate(e.target.checked)}
            />
            Indeterminate
          </label>
          <label className="ui-lab__checkbox-label">
            <input type="checkbox" checked={checkboxLocked} onChange={(e) => setCheckboxLocked(e.target.checked)} />
            Lock
          </label>
          <label className="ui-lab__checkbox-label">
            <input
              type="checkbox"
              checked={checkboxShowLabel}
              onChange={(e) => setCheckboxShowLabel(e.target.checked)}
            />
            Label
          </label>
        </div>

        <div className="ui-lab__controls">
          <label>
            Label Text
            <input value={checkboxLabel} onChange={(e) => setCheckboxLabel(e.target.value)} placeholder="옵션 1" />
          </label>
        </div>

        <div className="ui-lab__preview-card">
          <Checkbox
            size={checkboxSize}
            state={checkboxState}
            checked={checkboxChecked}
            indeterminate={checkboxIndeterminate}
            locked={checkboxLocked}
            showLabel={checkboxShowLabel}
            label={checkboxLabel || "옵션 1"}
            onChange={setCheckboxChecked}
          />
        </div>

        <div className="ui-lab__variant-grid ui-lab__variant-grid--checkbox">
          <Checkbox size="l" state="default" showLabel={false} />
          <Checkbox size="m" state="default" showLabel={false} />
          <Checkbox size="s" state="default" showLabel={false} />
          <Checkbox size="l" state="hover" showLabel />
          <Checkbox size="m" state="hover" showLabel />
          <Checkbox size="s" state="hover" showLabel />
          <Checkbox size="l" state="focus" showLabel />
          <Checkbox size="m" state="focus" showLabel />
          <Checkbox size="s" state="focus" showLabel />
          <Checkbox size="l" state="active" checked showLabel />
          <Checkbox size="m" state="active" checked showLabel />
          <Checkbox size="s" state="active" checked showLabel />
          <Checkbox size="l" state="active" indeterminate showLabel />
          <Checkbox size="m" state="active" indeterminate showLabel />
          <Checkbox size="s" state="active" indeterminate showLabel />
          <Checkbox size="l" locked showLabel />
          <Checkbox size="m" locked showLabel />
          <Checkbox size="s" locked showLabel />
          <Checkbox size="l" locked checked showLabel />
          <Checkbox size="m" locked checked showLabel />
          <Checkbox size="s" locked checked showLabel />
        </div>
      </section>

      <section className="ui-lab__section">
        <div className="ui-lab__section-title">
          <h2>RadioButton</h2>
          <span>shared/ui/radio-button</span>
        </div>

        <div className="ui-lab__controls">
          <label>
            Size
            <select value={radioSize} onChange={(e) => setRadioSize(e.target.value)}>
              {RADIO_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <label>
            State
            <select value={radioState} onChange={(e) => setRadioState(e.target.value)}>
              {RADIO_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-lab__checkbox-label">
            <input type="checkbox" checked={radioChecked} onChange={(e) => setRadioChecked(e.target.checked)} />
            Checked
          </label>
          <label className="ui-lab__checkbox-label">
            <input type="checkbox" checked={radioLocked} onChange={(e) => setRadioLocked(e.target.checked)} />
            Lock
          </label>
          <label className="ui-lab__checkbox-label">
            <input type="checkbox" checked={radioShowLabel} onChange={(e) => setRadioShowLabel(e.target.checked)} />
            Label
          </label>
        </div>

        <div className="ui-lab__controls">
          <label>
            Label Text
            <input value={radioLabel} onChange={(e) => setRadioLabel(e.target.value)} placeholder="옵션 1" />
          </label>
        </div>

        <div className="ui-lab__preview-card ui-lab__preview-card--column">
          <RadioButton
            size={radioSize}
            state={radioState}
            checked={radioChecked}
            locked={radioLocked}
            showLabel={radioShowLabel}
            label={radioLabel || "옵션 1"}
            onChange={setRadioChecked}
          />
          <div className="ui-lab__radio-group">
            <RadioGroup
              options={RADIO_OPTIONS}
              value={radioGroupValue}
              onChange={setRadioGroupValue}
              size={radioSize}
              state={radioState}
              locked={radioLocked}
            />
          </div>
        </div>

        <div className="ui-lab__variant-grid ui-lab__variant-grid--checkbox">
          <RadioButton size="l" state="default" showLabel={false} />
          <RadioButton size="m" state="default" showLabel={false} />
          <RadioButton size="s" state="default" showLabel={false} />
          <RadioButton size="l" state="hover" showLabel />
          <RadioButton size="m" state="hover" showLabel />
          <RadioButton size="s" state="hover" showLabel />
          <RadioButton size="l" state="focus" showLabel />
          <RadioButton size="m" state="focus" showLabel />
          <RadioButton size="s" state="focus" showLabel />
          <RadioButton size="l" state="active" checked showLabel />
          <RadioButton size="m" state="active" checked showLabel />
          <RadioButton size="s" state="active" checked showLabel />
          <RadioButton size="l" locked showLabel />
          <RadioButton size="m" locked showLabel />
          <RadioButton size="s" locked showLabel />
          <RadioButton size="l" locked checked showLabel />
          <RadioButton size="m" locked checked showLabel />
          <RadioButton size="s" locked checked showLabel />
        </div>
      </section>

      <section className="ui-lab__section">
        <div className="ui-lab__section-title">
          <h2>ToggleButton</h2>
          <span>shared/ui/toggle-button</span>
        </div>

        <div className="ui-lab__controls">
          <label>
            Size
            <select value={toggleSize} onChange={(e) => setToggleSize(e.target.value)}>
              {TOGGLE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-lab__checkbox-label">
            <input type="checkbox" checked={toggleChecked} onChange={(e) => setToggleChecked(e.target.checked)} />
            Checked
          </label>
          <label className="ui-lab__checkbox-label">
            <input type="checkbox" checked={toggleDisabled} onChange={(e) => setToggleDisabled(e.target.checked)} />
            Disabled
          </label>
        </div>

        <div className="ui-lab__preview-card">
          <ToggleButton size={toggleSize} checked={toggleChecked} disabled={toggleDisabled} onChange={setToggleChecked} />
        </div>

        <div className="ui-lab__variant-grid ui-lab__variant-grid--toggle">
          <ToggleButton size="l" checked={false} />
          <ToggleButton size="l" checked={false} disabled />
          <ToggleButton size="l" checked />
          <ToggleButton size="m" checked={false} />
          <ToggleButton size="m" checked={false} disabled />
          <ToggleButton size="m" checked />
          <ToggleButton size="s" checked={false} />
          <ToggleButton size="s" checked={false} disabled />
          <ToggleButton size="s" checked />
        </div>
      </section>

      <section className="ui-lab__section">
        <div className="ui-lab__section-title">
          <h2>ButtonTab</h2>
          <span>shared/ui/button-tab</span>
        </div>

        <div className="ui-lab__controls">
          <label>
            Size
            <select value={buttonTabSize} onChange={(e) => setButtonTabSize(e.target.value)}>
              {BUTTON_TAB_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={buttonTabStatus} onChange={(e) => setButtonTabStatus(e.target.value)}>
              {BUTTON_TAB_STATES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-lab__checkbox-label">
            <input
              type="checkbox"
              checked={buttonTabDisabled}
              onChange={(e) => setButtonTabDisabled(e.target.checked)}
            />
            Disabled
          </label>
        </div>

        <div className="ui-lab__controls">
          <label>
            Label
            <input value={buttonTabLabel} onChange={(e) => setButtonTabLabel(e.target.value)} placeholder="탭" />
          </label>
        </div>

        <div className="ui-lab__preview-card ui-lab__preview-card--column">
          <ButtonTab
            label={buttonTabLabel || "탭"}
            size={buttonTabSize}
            status={buttonTabStatus}
            disabled={buttonTabDisabled}
          />
          <ButtonTabGroup
            items={BUTTON_TAB_ITEMS}
            value={buttonTabGroupValue}
            onChange={setButtonTabGroupValue}
            size={buttonTabSize}
          />
        </div>

        <div className="ui-lab__variant-grid ui-lab__variant-grid--button-tab">
          <ButtonTab label="탭" size="l" status="default" />
          <ButtonTab label="탭" size="m" status="default" />
          <ButtonTab label="탭" size="l" status="hover" />
          <ButtonTab label="탭" size="m" status="hover" />
          <ButtonTab label="탭" size="l" status="active" />
          <ButtonTab label="탭" size="m" status="active" />
        </div>
      </section>

      <section className="ui-lab__section">
        <div className="ui-lab__section-title">
          <h2>Tooltip</h2>
          <span>shared/ui/tooltip</span>
        </div>

        <div className="ui-lab__controls">
          <label>
            Placement
            <select value={tooltipPlacement} onChange={(e) => setTooltipPlacement(e.target.value)}>
              {TOOLTIP_PLACEMENTS.map((placement) => (
                <option key={placement} value={placement}>
                  {placement}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tone
            <select value={tooltipTone} onChange={(e) => setTooltipTone(e.target.value)}>
              {TOOLTIP_TONES.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </label>
          <label>
            Trigger
            <select value={tooltipTrigger} onChange={(e) => setTooltipTrigger(e.target.value)}>
              {TOOLTIP_TRIGGERS.map((trigger) => (
                <option key={trigger} value={trigger}>
                  {trigger}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-lab__checkbox-label">
            <input type="checkbox" checked={tooltipArrow} onChange={(e) => setTooltipArrow(e.target.checked)} />
            Arrow
          </label>
        </div>

        <div className="ui-lab__controls">
          <label>
            Message
            <input value={tooltipMessage} onChange={(e) => setTooltipMessage(e.target.value)} placeholder="입력 예시입니다." />
          </label>
        </div>

        <div className="ui-lab__preview-card">
          <Tooltip
            content={tooltipMessage || "입력 예시입니다."}
            placement={tooltipPlacement}
            tone={tooltipTone}
            trigger={tooltipTrigger}
            showArrow={tooltipArrow}
            defaultOpen={tooltipTrigger === "click"}
          >
            <button type="button" className="ui-lab__demo-trigger">
              Tooltip Trigger
            </button>
          </Tooltip>
        </div>

        <div className="ui-lab__variant-grid ui-lab__variant-grid--tooltip">
          <Tooltip content="입력 예시입니다." placement="top" tone="dark" open>
            <button type="button" className="ui-lab__demo-trigger">
              top dark
            </button>
          </Tooltip>
          <Tooltip content="입력 예시입니다." placement="top" tone="light" open>
            <button type="button" className="ui-lab__demo-trigger">
              top light
            </button>
          </Tooltip>
          <Tooltip content="입력 예시입니다." placement="right" tone="dark" open>
            <button type="button" className="ui-lab__demo-trigger">
              right dark
            </button>
          </Tooltip>
          <Tooltip content="입력 예시입니다." placement="right" tone="light" open>
            <button type="button" className="ui-lab__demo-trigger">
              right light
            </button>
          </Tooltip>
          <Tooltip content="입력 예시입니다." placement="bottom" tone="dark" open>
            <button type="button" className="ui-lab__demo-trigger">
              bottom dark
            </button>
          </Tooltip>
          <Tooltip content="입력 예시입니다." placement="bottom" tone="light" open>
            <button type="button" className="ui-lab__demo-trigger">
              bottom light
            </button>
          </Tooltip>
          <Tooltip content="입력 예시입니다." placement="left" tone="dark" open>
            <button type="button" className="ui-lab__demo-trigger">
              left dark
            </button>
          </Tooltip>
          <Tooltip content="입력 예시입니다." placement="left" tone="light" open>
            <button type="button" className="ui-lab__demo-trigger">
              left light
            </button>
          </Tooltip>
        </div>
      </section>

      <section className="ui-lab__section">
        <div className="ui-lab__section-title">
          <h2>ActionPopover</h2>
          <span>shared/ui/action-popover (기존 Popover와 별개)</span>
        </div>

        <div className="ui-lab__controls">
          <label>
            Placement
            <select value={actionPopoverPlacement} onChange={(e) => setActionPopoverPlacement(e.target.value)}>
              {ACTION_POPOVER_PLACEMENTS.map((placement) => (
                <option key={placement} value={placement}>
                  {placement}
                </option>
              ))}
            </select>
          </label>
          <label>
            Align
            <select value={actionPopoverAlign} onChange={(e) => setActionPopoverAlign(e.target.value)}>
              {ACTION_POPOVER_ALIGNS.map((align) => (
                <option key={align} value={align}>
                  {align}
                </option>
              ))}
            </select>
          </label>
          <label>
            Trigger
            <select value={actionPopoverTrigger} onChange={(e) => setActionPopoverTrigger(e.target.value)}>
              {ACTION_POPOVER_TRIGGERS.map((trigger) => (
                <option key={trigger} value={trigger}>
                  {trigger}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-lab__checkbox-label">
            <input
              type="checkbox"
              checked={actionPopoverOpen}
              onChange={(e) => setActionPopoverOpen(e.target.checked)}
            />
            Open
          </label>
          <label className="ui-lab__checkbox-label">
            <input
              type="checkbox"
              checked={actionPopoverClose}
              onChange={(e) => setActionPopoverClose(e.target.checked)}
            />
            Close X
          </label>
          <label className="ui-lab__checkbox-label">
            <input
              type="checkbox"
              checked={actionPopoverFooter}
              onChange={(e) => setActionPopoverFooter(e.target.checked)}
            />
            Footer
          </label>
        </div>

        <div className="ui-lab__controls">
          <label>
            Body Max Height
            <input
              type="number"
              min={48}
              max={240}
              value={actionPopoverBodyMaxHeight}
              onChange={(e) => setActionPopoverBodyMaxHeight(Number.parseInt(e.target.value || "96", 10))}
            />
          </label>
          <label>
            Message
            <input
              value={actionPopoverMessage}
              onChange={(e) => setActionPopoverMessage(e.target.value)}
              placeholder="팝오버 설명"
            />
          </label>
        </div>

        <div className="ui-lab__preview-card">
          <ActionPopover
            title="팝오버 타이틀"
            subtitle="전체보기"
            content={actionPopoverMessage}
            placement={actionPopoverPlacement}
            align={actionPopoverAlign}
            trigger={actionPopoverTrigger}
            open={actionPopoverOpen}
            showClose={actionPopoverClose}
            showFooter={actionPopoverFooter}
            bodyMaxHeight={actionPopoverBodyMaxHeight}
          >
            <button type="button" className="ui-lab__demo-trigger">
              Popover Trigger
            </button>
          </ActionPopover>
        </div>

        <div className="ui-lab__variant-grid ui-lab__variant-grid--action-popover">
          <ActionPopover title="HEADER" content="Text" placement="top" align="center" open>
            <button type="button" className="ui-lab__demo-trigger">Top</button>
          </ActionPopover>
          <ActionPopover title="HEADER" content="Text" placement="left" align="center" open>
            <button type="button" className="ui-lab__demo-trigger">Left</button>
          </ActionPopover>
          <ActionPopover title="HEADER" content="Text" placement="right" align="center" open>
            <button type="button" className="ui-lab__demo-trigger">Right</button>
          </ActionPopover>
          <ActionPopover title="HEADER" content="Text" placement="bottom" align="center" open>
            <button type="button" className="ui-lab__demo-trigger">Bottom</button>
          </ActionPopover>
        </div>
      </section>
    </div>
  );
}
