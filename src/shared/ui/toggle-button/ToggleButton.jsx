import { useState } from "react";
import "./ToggleButton.css";

/**
 * @param {{
 *   checked?: boolean,
 *   defaultChecked?: boolean,
 *   disabled?: boolean,
 *   size?: "l" | "m" | "s",
 *   onChange?: (nextChecked: boolean) => void,
 *   ariaLabel?: string,
 *   className?: string
 * }} props
 */
export function ToggleButton({
  checked,
  defaultChecked = false,
  disabled = false,
  size = "l",
  onChange,
  ariaLabel = "토글 버튼",
  className = "",
}) {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const [focusVisible, setFocusVisible] = useState(false);
  const isChecked = isControlled ? checked : internalChecked;

  const handleToggle = () => {
    if (disabled) return;
    const next = !isChecked;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-label={ariaLabel}
      aria-checked={isChecked}
      disabled={disabled}
      onClick={handleToggle}
      onFocus={() => setFocusVisible(true)}
      onBlur={() => setFocusVisible(false)}
      className={[
        "toggle-button",
        `toggle-button--${size}`,
        isChecked ? "toggle-button--checked" : "",
        disabled ? "toggle-button--disabled" : "",
        focusVisible ? "toggle-button--focus-visible" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="toggle-button__knob" />
    </button>
  );
}

export default ToggleButton;
