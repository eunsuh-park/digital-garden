import "./SettingsNavItem.css";

/**
 * @param {{
 *   icon?: import("react").ReactNode,
 *   label: string,
 *   active?: boolean,
 *   onClick?: () => void,
 *   className?: string
 * }} props
 */
export function SettingsNavItem({ icon = null, label, active = false, onClick, className = "" }) {
  const classes = ["settings-nav-item", active ? "settings-nav-item--active" : "", className].filter(Boolean).join(" ");

  return (
    <button type="button" className={classes} onClick={onClick} aria-pressed={active}>
      <span className="settings-nav-item__icon" aria-hidden>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

export default SettingsNavItem;
