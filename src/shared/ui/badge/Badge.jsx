import "./Badge.css";

/**
 * @param {{
 *   count?: number | string | null,
 *   size?: "m" | "l",
 *   maxCount?: number,
 *   className?: string,
 *   ariaLabel?: string
 * }} props
 */
export function Badge({
  count = null,
  size = "m",
  maxCount = 99,
  className = "",
  ariaLabel = "알림 배지",
}) {
  const hasCount = count !== null && count !== undefined && count !== "";
  const numericCount = typeof count === "number" ? count : Number.parseInt(String(count), 10);
  const displayCount =
    hasCount && Number.isFinite(numericCount) && numericCount > maxCount
      ? `${maxCount}+`
      : hasCount
        ? String(count)
        : "";

  const lengthClass = !hasCount
    ? "badge--none"
    : displayCount.length <= 1
      ? "badge--single"
      : displayCount.length === 2
        ? "badge--double"
        : "badge--triple";

  const classes = ["badge", `badge--size-${size}`, lengthClass, className].filter(Boolean).join(" ");

  return (
    <span className={classes} aria-label={ariaLabel}>
      {displayCount}
    </span>
  );
}

export default Badge;
