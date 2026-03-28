import "./TextButton.css";
import { Icon } from "@iconify/react";
import checkLine from "@iconify-icons/mingcute/check-line";

/**
 * @param {{
 *   label?: string,
 *   styleType?: "primary" | "secondary" | "tertiary" | "symentic" | "semantic",
 *   state?: "able" | "hover" | "focus" | "fasble",
 *   size?: "l" | "m" | "s" | "xs",
 *   icon?: boolean,
 *   disabled?: boolean,
 *   htmlType?: "button" | "submit" | "reset",
 *   onClick?: () => void,
 *   className?: string
 * }} props
 */
export function TextButton({
  label = "버튼 이름",
  styleType = "primary",
  state = "able",
  size = "l",
  icon = false,
  disabled = false,
  htmlType = "button",
  onClick,
  className = "",
}) {
  const disabledState = disabled || state === "fasble";
  const stateClass = disabledState ? "fasble" : state;
  const classes = [
    "text-button",
    `text-button--${size}`,
    `text-button--${styleType}`,
    stateClass === "able" ? "" : `text-button--${stateClass}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={htmlType} className={classes} disabled={disabledState} onClick={onClick}>
      {icon ? (
        <span className="text-button__icon" aria-hidden="true">
          <Icon icon={checkLine} />
        </span>
      ) : null}
      <span>{label}</span>
    </button>
  );
}

export default TextButton;
