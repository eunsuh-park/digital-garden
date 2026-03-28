import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import closeLine from "@iconify-icons/mingcute/close-line";
import "./ActionPopover.css";

/**
 * @param {{
 *   title?: string,
 *   subtitle?: string,
 *   content?: string,
 *   primaryLabel?: string,
 *   secondaryLabel?: string,
 *   placement?: "top" | "right" | "bottom" | "left",
 *   align?: "left" | "center" | "right",
 *   trigger?: "hover" | "click",
 *   open?: boolean,
 *   defaultOpen?: boolean,
 *   showClose?: boolean,
 *   showFooter?: boolean,
 *   bodyMaxHeight?: number,
 *   onPrimary?: () => void,
 *   onSecondary?: () => void,
 *   onClose?: () => void,
 *   children: import("react").ReactNode,
 *   className?: string
 * }} props
 */
export function ActionPopover({
  title = "팝오버 타이틀",
  subtitle = "전체보기",
  content = "이곳에 필요한 설명이나 정보를 입력합니다.",
  primaryLabel = "버튼 이름",
  secondaryLabel = "버튼 이름",
  placement = "bottom",
  align = "center",
  trigger = "click",
  open,
  defaultOpen = false,
  showClose = true,
  showFooter = true,
  bodyMaxHeight = 120,
  onPrimary,
  onSecondary,
  onClose,
  children,
  className = "",
}) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const rootRef = useRef(null);
  const isOpen = isControlled ? open : internalOpen;

  useEffect(() => {
    if (!isOpen || trigger !== "click") return undefined;
    const onOutside = (event) => {
      if (!rootRef.current || rootRef.current.contains(event.target)) return;
      if (!isControlled) setInternalOpen(false);
      onClose?.();
    };
    window.addEventListener("mousedown", onOutside);
    return () => window.removeEventListener("mousedown", onOutside);
  }, [isOpen, trigger, isControlled, onClose]);

  const openPopover = () => {
    if (trigger === "hover" && !isControlled) setInternalOpen(true);
  };
  const closePopover = () => {
    if (trigger === "hover" && !isControlled) setInternalOpen(false);
  };
  const togglePopover = () => {
    if (trigger === "click" && !isControlled) setInternalOpen((prev) => !prev);
  };

  const handleClose = () => {
    if (!isControlled) setInternalOpen(false);
    onClose?.();
  };

  return (
    <span
      className={["action-popover", className].filter(Boolean).join(" ")}
      ref={rootRef}
      onMouseEnter={openPopover}
      onMouseLeave={closePopover}
    >
      <span className="action-popover__trigger" onClick={togglePopover}>
        {children}
      </span>

      {isOpen ? (
        <span
          className={[
            "action-popover__panel",
            `action-popover__panel--${placement}`,
            `action-popover__panel--align-${align}`,
          ].join(" ")}
          role="dialog"
          aria-label={title}
        >
          <span className="action-popover__header">
            <span className="action-popover__title-group">
              <strong>{title}</strong>
              {subtitle ? <em>{subtitle}</em> : null}
            </span>
            {showClose ? (
              <button type="button" className="action-popover__close" onClick={handleClose} aria-label="닫기">
                <Icon icon={closeLine} />
              </button>
            ) : null}
          </span>

          <span className="action-popover__body" style={{ maxHeight: `${bodyMaxHeight}px` }}>
            {content}
          </span>

          {showFooter ? (
            <span className="action-popover__footer">
              <button type="button" onClick={onSecondary}>
                {secondaryLabel}
              </button>
              <button type="button" onClick={onPrimary}>
                {primaryLabel}
              </button>
            </span>
          ) : null}

          <span className="action-popover__arrow" aria-hidden="true" />
        </span>
      ) : null}
    </span>
  );
}

export default ActionPopover;
