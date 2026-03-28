import { useState } from "react";
import "./Tooltip.css";

/**
 * @param {{
 *   content?: string,
 *   placement?: "top" | "right" | "bottom" | "left",
 *   tone?: "dark" | "light",
 *   trigger?: "hover" | "click",
 *   open?: boolean,
 *   defaultOpen?: boolean,
 *   showArrow?: boolean,
 *   children: import("react").ReactNode,
 *   className?: string
 * }} props
 */
export function Tooltip({
  content = "입력 예시입니다.",
  placement = "top",
  tone = "dark",
  trigger = "hover",
  open,
  defaultOpen = false,
  showArrow = true,
  children,
  className = "",
}) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : internalOpen;

  const show = () => {
    if (trigger === "hover" && !isControlled) setInternalOpen(true);
  };
  const hide = () => {
    if (trigger === "hover" && !isControlled) setInternalOpen(false);
  };
  const toggle = () => {
    if (trigger === "click" && !isControlled) setInternalOpen((prev) => !prev);
  };

  return (
    <span className={["tooltip", className].filter(Boolean).join(" ")} onMouseEnter={show} onMouseLeave={hide}>
      <span onClick={toggle}>{children}</span>
      {isOpen ? (
        <span className={["tooltip__bubble", `tooltip__bubble--${placement}`, `tooltip__bubble--${tone}`].join(" ")}>
          {content}
          {showArrow ? <span className="tooltip__arrow" aria-hidden="true" /> : null}
        </span>
      ) : null}
    </span>
  );
}

export default Tooltip;
