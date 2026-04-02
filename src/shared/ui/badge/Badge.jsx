import "./Badge.css";

/**
 * @param {{
 *   content?: number | string | null,
 *   count?: number | string | null,
 *   size?: "m" | "l",
 *   tone?: "brand" | "neutral" | "success" | "warning" | "danger",
 *   emphasis?: "solid" | "soft",
 *   showZero?: boolean,
 *   maxCount?: number,
 *   className?: string,
 *   ariaLabel?: string
 * }} props
 */
export function Badge({
  content = undefined,
  count = null,
  size = "m",
  tone = "brand",
  emphasis = "solid",
  showZero = false,
  maxCount = 99,
  className = "",
  ariaLabel = "알림 배지",
}) {
  const rawValue = content ?? count;
  const hasValue =
    rawValue !== null &&
    rawValue !== undefined &&
    rawValue !== "" &&
    (showZero || String(rawValue) !== "0");
  const numericCount = typeof rawValue === "number" ? rawValue : Number.parseInt(String(rawValue), 10);
  const shouldClamp = content === undefined && hasValue && Number.isFinite(numericCount);
  const displayCount = shouldClamp && numericCount > maxCount ? `${maxCount}+` : hasValue ? String(rawValue) : "";

  const lengthClass = !hasValue
    ? "badge--none"
    : displayCount.length <= 1
      ? "badge--single"
      : displayCount.length === 2
        ? "badge--double"
        : "badge--triple";

  const classes = [
    "badge",
    `badge--size-${size}`,
    `badge--tone-${tone}`,
    `badge--emphasis-${emphasis}`,
    lengthClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} aria-label={ariaLabel}>
      {displayCount}
    </span>
  );
}

export default Badge;
