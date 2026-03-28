import "./IconButton.css";
import { Icon } from "@iconify/react";
import bag3Line from "@iconify-icons/mingcute/bag-3-line";

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
      <Icon icon={bag3Line} className="icon-button__icon" aria-hidden="true" />
      {showLabel ? <span className="icon-button__label">{label}</span> : null}
    </button>
  );
}

export default IconButton;
