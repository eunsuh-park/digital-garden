import "./SectionHeading.css";

/**
 * @param {{
 *   title: string,
 *   description?: string,
 *   label?: string,
 *   action?: import("react").ReactNode,
 *   compact?: boolean,
 *   className?: string
 * }} props
 */
export function SectionHeading({ title, description = "", label = "", action = null, compact = false, className = "" }) {
  const classes = ["section-heading", compact ? "section-heading--compact" : "", className].filter(Boolean).join(" ");

  return (
    <header className={classes}>
      <div className="section-heading__content">
        {label ? <span className="section-heading__label">{label}</span> : null}
        <h3 className="section-heading__title">{title}</h3>
        {description ? <p className="section-heading__description">{description}</p> : null}
      </div>
      {action ? <div className="section-heading__action">{action}</div> : null}
    </header>
  );
}

export default SectionHeading;
