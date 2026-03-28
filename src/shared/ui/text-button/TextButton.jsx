import "./TextButton.css";

/**
 * @param {{
 *   label?: string,
 *   styleType?: "primary" | "secondary" | "tertiary" | "symentic" | "semantic",
 *   state?: "able" | "hover" | "focus" | "fasble",
 *   size?: "l" | "m" | "s" | "xs",
 *   icon?: boolean,
 *   disabled?: boolean,
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
    <button type="button" className={classes} disabled={disabledState} onClick={onClick}>
      {icon ? <span className="text-button__icon" aria-hidden="true">✓</span> : null}
      <span>{label}</span>
    </button>
  );
}

export default TextButton;
