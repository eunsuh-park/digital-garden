import { useState } from "react";
import { Icon } from "@iconify/react";
import searchLine from "@iconify-icons/mingcute/search-line";
import closeLine from "@iconify-icons/mingcute/close-line";
import arrowUpLine from "@iconify-icons/mingcute/arrow-up-line";
import arrowDownLine from "@iconify-icons/mingcute/arrow-down-line";
import checkLine from "@iconify-icons/mingcute/check-line";
import "./TextField.css";

/**
 * @param {{
 *   type?: "short" | "long",
 *   variant?: "text-field" | "search-bar" | "suffix" | "x-mark" | "stepper" | "text-area" | "search-with-icon",
 *   size?: "l" | "m" | "s",
 *   state?: "default" | "hover" | "active" | "valid-feedback" | "invalid-feedback",
 *   label?: string,
 *   required?: boolean,
 *   showHelpButton?: boolean,
 *   helpButtonLabel?: string,
 *   placeholder?: string,
 *   helperText?: string,
 *   showHelperText?: boolean,
 *   suffixText?: string,
 *   clearable?: boolean,
 *   showCounter?: boolean,
 *   maxLength?: number,
 *   showSearchButton?: boolean,
 *   searchButtonLabel?: string,
 *   step?: number,
 *   value?: string,
 *   defaultValue?: string,
 *   inputType?: string,
 *   inputId?: string,
 *   inputName?: string,
 *   autoComplete?: string,
 *   disabled?: boolean,
 *   onChange?: (nextValue: string) => void,
 *   className?: string
 * }} props
 */
export function TextField({
  type = "short",
  variant = "text-field",
  size = "l",
  state = "default",
  label = "라벨 (옵션)",
  required = false,
  showHelpButton = false,
  helpButtonLabel = "도움말",
  placeholder = "내용을 입력하세요.",
  helperText = "캡션이나 설명",
  showHelperText = true,
  suffixText = "Suffix",
  clearable = false,
  showCounter = false,
  maxLength,
  showSearchButton = false,
  searchButtonLabel = "Search",
  step = 1,
  value,
  defaultValue = "",
  inputType = "text",
  inputId,
  inputName,
  autoComplete,
  disabled = false,
  onChange,
  className = "",
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const currentValue = isControlled ? value : internalValue;
  const normalizedVariant = variant === "text-area" || type === "long" ? "text-area" : variant;

  const visualState = disabled ? "disabled" : isFocused ? "active" : state;
  const showFeedback = visualState === "valid-feedback" || visualState === "invalid-feedback";

  const handleValueChange = (event) => {
    const nextValue = event.target.value;
    if (!isControlled) setInternalValue(nextValue);
    onChange?.(nextValue);
  };

  const ControlTag = type === "long" ? "textarea" : "input";
  const isTextArea = normalizedVariant === "text-area";
  const controlTag = isTextArea ? "textarea" : "input";
  const controlProps =
    isTextArea
      ? { rows: 4 }
      : {
          type: inputType,
        };
  const valueLength = String(currentValue ?? "").length;

  const setValue = (nextValue) => {
    if (!isControlled) setInternalValue(nextValue);
    onChange?.(nextValue);
  };

  const clearValue = () => setValue("");

  const increaseStepper = () => {
    const numeric = Number.parseInt(String(currentValue || "0"), 10);
    const next = Number.isFinite(numeric) ? String(numeric + step) : String(step);
    setValue(next);
  };

  const decreaseStepper = () => {
    const numeric = Number.parseInt(String(currentValue || "0"), 10);
    const next = Number.isFinite(numeric) ? String(numeric - step) : "0";
    setValue(next);
  };

  return (
    <div
      className={[
        "text-field",
        `text-field--${size}`,
        `text-field--variant-${normalizedVariant}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="text-field__label-row">
        <span className="text-field__label">
          {label}
          {required ? <span className="text-field__required">*</span> : null}
        </span>
        {showHelpButton ? (
          <button type="button" className="text-field__help-button" aria-label={helpButtonLabel} title={helpButtonLabel}>
            ?
          </button>
        ) : null}
      </div>

      <div className={["text-field__input-shell", `text-field__input-shell--${visualState}`].join(" ")}>
        {normalizedVariant === "search-with-icon" ? (
          <span className="text-field__left-icon">
            <Icon icon={searchLine} />
          </span>
        ) : null}
        {normalizedVariant === "search-bar" ? (
          <span className="text-field__left-icon">
            <Icon icon={searchLine} />
          </span>
        ) : null}
        {(() => {
          const DynamicControl = controlTag;
          return (
            <DynamicControl
              {...controlProps}
              id={inputId}
              name={inputName}
              autoComplete={autoComplete}
              className={["text-field__control", `text-field__control--${isTextArea ? "long" : "short"}`, `text-field__control--${visualState}`].join(" ")}
              placeholder={placeholder}
              value={currentValue}
              maxLength={maxLength}
              onChange={handleValueChange}
              disabled={disabled}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          );
        })()}
        {normalizedVariant === "suffix" ? <span className="text-field__suffix">{suffixText}</span> : null}
        {(normalizedVariant === "x-mark" || clearable) && String(currentValue || "").length > 0 ? (
          <button type="button" className="text-field__icon-btn" onClick={clearValue} disabled={disabled} aria-label="지우기">
            <Icon icon={closeLine} />
          </button>
        ) : null}
        {showSearchButton ? (
          <button type="button" className="text-field__search-btn" disabled={disabled}>
            {searchButtonLabel}
          </button>
        ) : null}
        {normalizedVariant === "stepper" ? (
          <span className="text-field__stepper">
            <button type="button" onClick={increaseStepper} disabled={disabled} aria-label="증가">
              <Icon icon={arrowUpLine} />
            </button>
            <button type="button" onClick={decreaseStepper} disabled={disabled} aria-label="감소">
              <Icon icon={arrowDownLine} />
            </button>
          </span>
        ) : null}
        {showCounter ? (
          <span className="text-field__counter">
            {String(valueLength).padStart(2, "0")}/{String(maxLength || 0).padStart(2, "0")}
          </span>
        ) : null}
      </div>

      {showFeedback ? (
        <span className={`text-field__feedback text-field__feedback--${visualState}`}>
          <span className="text-field__feedback-dot" aria-hidden="true">
            <Icon icon={visualState === "valid-feedback" ? checkLine : closeLine} />
          </span>
          {visualState === "valid-feedback" ? "유효한 피드백" : "유효하지 않은 피드백"}
        </span>
      ) : showHelperText ? (
        <span className="text-field__help-text">{helperText}</span>
      ) : null}
    </div>
  );
}

export default TextField;
