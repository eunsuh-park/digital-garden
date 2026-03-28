import "./IconButton.css";

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-button__icon" aria-hidden="true">
      <path
        d="M8.25 9V7.75a3.75 3.75 0 1 1 7.5 0V9h2a.75.75 0 0 1 .75.75v9.5a1.75 1.75 0 0 1-1.75 1.75h-9.5a1.75 1.75 0 0 1-1.75-1.75v-9.5A.75.75 0 0 1 6.25 9h2Zm1.5 0h4.5V7.75a2.25 2.25 0 1 0-4.5 0V9Zm-2.75 1.5v8.75a.25.25 0 0 0 .25.25h9.5a.25.25 0 0 0 .25-.25V10.5H17v1a.75.75 0 0 1-1.5 0v-1h-7v1a.75.75 0 0 1-1.5 0v-1H7Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * @param {{
 *   styleType?: "nobg" | "filled" | "destructive",
 *   state?: "default" | "hover" | "pressed" | "disabled",
 *   showLabel?: boolean,
 *   label?: string,
 *   disabled?: boolean,
 *   onClick?: () => void,
 *   className?: string
 * }} props
 */
export function IconButton({
  styleType = "nobg",
  state = "default",
  showLabel = false,
  label = "아이콘",
  disabled = false,
  onClick,
  className = "",
}) {
  const isDisabled = disabled || state === "disabled";
  const classes = [
    "icon-button",
    `icon-button--${styleType}`,
    state !== "default" ? `icon-button--${state}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={classes} disabled={isDisabled} onClick={onClick} aria-label={showLabel ? label : "아이콘 버튼"}>
      <BagIcon />
      {showLabel ? <span className="icon-button__label">{label}</span> : null}
    </button>
  );
}

export default IconButton;
