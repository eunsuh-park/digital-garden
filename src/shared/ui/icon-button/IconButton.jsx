import "./IconButton.css";
import { Icon } from "@iconify/react";
import bookmarkFill from "@iconify-icons/mingcute/bookmark-fill";

/**
 * @param {{
 *   styleType?: "nobg" | "filled" | "destructive",
 *   state?: "default" | "hover" | "pressed" | "disabled",
 *   showLabel?: boolean,
 *   labelPlacement?: "inline" | "stacked",
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
  labelPlacement = "inline",
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
    showLabel ? `icon-button--label-${labelPlacement}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={classes} disabled={isDisabled} onClick={onClick} aria-label={showLabel ? label : "아이콘 버튼"}>
      <Icon icon={bookmarkFill} className="icon-button__icon" aria-hidden="true" />
      {showLabel ? <span className="icon-button__label">{label}</span> : null}
    </button>
  );
}

export default IconButton;
