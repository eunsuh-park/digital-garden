import "./Container.css";

/**
 * @param {{
 *   children: import("react").ReactNode,
 *   className?: string,
 *   viewport?: boolean,
 *   centered?: boolean
 * }} props
 */
export function Container({ children, className = "", viewport = false, centered = false }) {
  const classes = [
    "ui-container",
    viewport ? "ui-container--viewport" : "",
    centered ? "ui-container--centered" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}

export default Container;
