import { useState } from "react";
import { Icon } from "@iconify/react";
import checkLine from "@iconify-icons/mingcute/check-line";
import minusLine from "@iconify-icons/mingcute/minus-line";
import "./Checkbox.css";

/**
 * @param {{
 *   size?: "l" | "m" | "s",
 *   checked?: boolean,
 *   defaultChecked?: boolean,
 *   indeterminate?: boolean,
 *   locked?: boolean,
 *   showLabel?: boolean,
 *   label?: string,
 *   state?: "default" | "hover" | "focus" | "active",
 *   onChange?: (nextChecked: boolean) => void,
 *   className?: string
 * }} props
 */
export function Checkbox({
  size = "m",
  checked,
  defaultChecked = false,
  indeterminate = false,
  locked = false,
  showLabel = true,
  label = "옵션 1",
  state = "default",
  onChange,
  className = "",
}) {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = isControlled ? checked : internalChecked;
  const isOn = indeterminate || isChecked;

  const handleToggle = () => {
    if (locked) return;
    const nextChecked = !isChecked;
    if (!isControlled) setInternalChecked(nextChecked);
    onChange?.(nextChecked);
  };

  return (
    <label className={["checkbox", `checkbox--${size}`, locked ? "checkbox--locked" : "", className].filter(Boolean).join(" ")}>
      <button
        type="button"
        className={[
          "checkbox__control",
          isOn ? "checkbox__control--on" : "checkbox__control--off",
          state !== "default" ? `checkbox__control--${state}` : "",
          locked ? "checkbox__control--locked" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={handleToggle}
        disabled={locked}
        aria-pressed={isChecked}
        aria-label={label}
      >
        {indeterminate ? (
          <span className="checkbox__icon">
            <Icon icon={minusLine} />
          </span>
        ) : null}
        {!indeterminate && isChecked ? (
          <span className="checkbox__icon">
            <Icon icon={checkLine} />
          </span>
        ) : null}
      </button>
      {showLabel ? <span className="checkbox__label">{label}</span> : null}
    </label>
  );
}

export default Checkbox;
