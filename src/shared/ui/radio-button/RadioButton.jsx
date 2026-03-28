import { useState } from "react";
import "./RadioButton.css";

/**
 * @param {{
 *   size?: "l" | "m" | "s",
 *   checked?: boolean,
 *   defaultChecked?: boolean,
 *   locked?: boolean,
 *   state?: "default" | "hover" | "focus" | "active",
 *   showLabel?: boolean,
 *   label?: string,
 *   name?: string,
 *   value?: string,
 *   onChange?: (nextChecked: boolean) => void,
 *   className?: string
 * }} props
 */
export function RadioButton({
  size = "m",
  checked,
  defaultChecked = false,
  locked = false,
  state = "default",
  showLabel = true,
  label = "옵션 1",
  name,
  value,
  onChange,
  className = "",
}) {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = isControlled ? checked : internalChecked;

  const handleSelect = () => {
    if (locked || isChecked) return;
    if (!isControlled) setInternalChecked(true);
    onChange?.(true);
  };

  return (
    <label className={["radio-button", `radio-button--${size}`, locked ? "radio-button--locked" : "", className].filter(Boolean).join(" ")}>
      <button
        type="button"
        className={["radio-button__control", state !== "default" ? `radio-button__control--${state}` : ""].filter(Boolean).join(" ")}
        onClick={handleSelect}
        disabled={locked}
        role="radio"
        aria-checked={isChecked}
        aria-label={label}
        name={name}
        value={value}
      >
        {isChecked ? <span className="radio-button__dot" /> : null}
      </button>
      {showLabel ? <span className="radio-button__label">{label}</span> : null}
    </label>
  );
}

/**
 * @param {{
 *   options: Array<{ label: string, value: string, locked?: boolean }>,
 *   value?: string,
 *   defaultValue?: string,
 *   onChange?: (nextValue: string) => void,
 *   size?: "l" | "m" | "s",
 *   state?: "default" | "hover" | "focus" | "active",
 *   locked?: boolean,
 *   className?: string
 * }} props
 */
export function RadioGroup({
  options,
  value,
  defaultValue = "",
  onChange,
  size = "m",
  state = "default",
  locked = false,
  className = "",
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = isControlled ? value : internalValue;

  const pick = (nextValue) => {
    if (!isControlled) setInternalValue(nextValue);
    onChange?.(nextValue);
  };

  return (
    <div className={className} role="radiogroup">
      {options.map((option) => (
        <RadioButton
          key={option.value}
          size={size}
          state={state}
          label={option.label}
          checked={selectedValue === option.value}
          locked={locked || option.locked}
          onChange={() => pick(option.value)}
        />
      ))}
    </div>
  );
}

export default RadioButton;
