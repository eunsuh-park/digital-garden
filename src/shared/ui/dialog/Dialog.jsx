import "./Dialog.css";

/**
 * @param {{
 *   children: import("react").ReactNode,
 *   label?: string,
 *   title?: string,
 *   description?: string,
 *   footer?: import("react").ReactNode,
 *   className?: string,
 *   bodyClassName?: string,
 *   maxWidth?: string | number,
 *   hoverable?: boolean,
 *   showAccent?: boolean
 * }} props
 */
export function Dialog({
  children,
  label = "",
  title = "",
  description = "",
  footer = null,
  className = "",
  bodyClassName = "",
  maxWidth = 380,
  hoverable = true,
  showAccent = true,
}) {
  const classes = ["ui-dialog", hoverable ? "ui-dialog--hoverable" : "", className].filter(Boolean).join(" ");
  const bodyClasses = ["ui-dialog__body", bodyClassName].filter(Boolean).join(" ");

  return (
    <section className={classes} style={{ maxWidth }} role="dialog" aria-label={title || "dialog"}>
      {showAccent ? <span className="ui-dialog__accent" aria-hidden /> : null}
      <div className="ui-dialog__inner">
        {label || title || description ? (
          <header className="ui-dialog__header">
            {label ? <span className="ui-dialog__label">{label}</span> : null}
            {title ? <h2 className="ui-dialog__title">{title}</h2> : null}
            {description ? <p className="ui-dialog__description">{description}</p> : null}
          </header>
        ) : null}
        <div className={bodyClasses}>{children}</div>
        {footer ? <footer className="ui-dialog__footer">{footer}</footer> : null}
      </div>
    </section>
  );
}

export default Dialog;
