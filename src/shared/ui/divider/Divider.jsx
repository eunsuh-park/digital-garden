import "./Divider.css";

/**
 * @param {{
 *   orientation?: "horizontal" | "vertical",
 *   label?: string,
 *   align?: "left" | "center" | "right",
 *   tone?: "default" | "muted",
 *   dashed?: boolean,
 *   className?: string
 * }} props
 */
export function Divider({
  orientation = "horizontal",
  label = "",
  align = "center",
  tone = "default",
  dashed = false,
  className = "",
}) {
  const classes = [
    "divider",
    `divider--${orientation}`,
    `divider--${align}`,
    `divider--tone-${tone}`,
    dashed ? "divider--dashed" : "",
    label ? "divider--with-label" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (orientation === "vertical") {
    return <span className={classes} role="separator" aria-orientation="vertical" />;
  }

  return (
    <div className={classes} role="separator" aria-orientation="horizontal">
      {label ? <span className="divider__label">{label}</span> : null}
    </div>
  );
}

export default Divider;
