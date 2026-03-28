import "./ButtonTab.css";
import { useState } from "react";

/**
 * @param {{
 *   label?: string,
 *   size?: "l" | "m",
 *   status?: "default" | "hover" | "active",
 *   active?: boolean,
 *   disabled?: boolean,
 *   onClick?: () => void,
 *   className?: string
 * }} props
 */
export function ButtonTab({
  label = "탭",
  size = "l",
  status = "default",
  active = false,
  disabled = false,
  onClick,
  className = "",
}) {
  const isActive = active || status === "active";
  return (
    <button
      type="button"
      className={[
        "button-tab",
        `button-tab--${size}`,
        status === "hover" ? "button-tab--hover" : "",
        isActive ? "button-tab--active" : "",
        disabled ? "button-tab--disabled" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled}
      onClick={onClick}
      aria-pressed={isActive}
    >
      {label}
    </button>
  );
}

/**
 * @param {{
 *   items: Array<{label: string, value: string, disabled?: boolean}>,
 *   value?: string,
 *   defaultValue?: string,
 *   onChange?: (nextValue: string) => void,
 *   size?: "l" | "m",
 *   className?: string
 * }} props
 */
export function ButtonTabGroup({
  items,
  value,
  defaultValue = "",
  onChange,
  size = "l",
  className = "",
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? value : internalValue;
  return (
    <div className={["button-tab-group", className].filter(Boolean).join(" ")} role="tablist">
      {items.map((item) => (
        <ButtonTab
          key={item.value}
          label={item.label}
          size={size}
          active={currentValue === item.value}
          disabled={item.disabled}
          onClick={() => {
            if (!isControlled) setInternalValue(item.value);
            onChange?.(item.value);
          }}
        />
      ))}
    </div>
  );
}

export default ButtonTab;
