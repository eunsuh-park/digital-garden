import { useEffect, useRef, useState } from "react";
import "./Select.css";

/**
 * @param {{
 *   options?: Array<{ label: string, value: string, disabled?: boolean }>,
 *   value?: string,
 *   defaultValue?: string,
 *   onChange?: (nextValue: string) => void,
 *   placeholder?: string,
 *   size?: "l" | "m" | "s",
 *   disabled?: boolean,
 *   visualState?: "default" | "hover" | "active" | "selected",
 *   variant?: "box" | "list",
 *   className?: string
 * }} props
 */
export function Select({
  options = [],
  value,
  defaultValue = "",
  onChange,
  placeholder = "플레이스홀더",
  size = "l",
  disabled = false,
  visualState = "default",
  variant = "box",
  className = "",
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selectedValue = isControlled ? value : internalValue;
  const selectedOption = options.find((option) => option.value === selectedValue);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (event) => {
      if (!rootRef.current || rootRef.current.contains(event.target)) return;
      setOpen(false);
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = (nextValue) => {
    if (!isControlled) setInternalValue(nextValue);
    onChange?.(nextValue);
    setOpen(false);
  };

  const showSelectedStyle = Boolean(selectedOption) || visualState === "selected";
  const stateClass = disabled ? "disabled" : open ? "active" : visualState;

  return (
    <div className={["select", `select--${size}`, `select--${variant}`, className].filter(Boolean).join(" ")} ref={rootRef}>
      <button
        type="button"
        className={`select__control select__control--${stateClass}`}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`select__text ${showSelectedStyle ? "select__text--value" : ""}`}>
          {selectedOption?.label || placeholder}
        </span>
        <span className={`select__arrow ${open ? "select__arrow--open" : ""}`} aria-hidden="true" />
      </button>

      {open ? (
        <div className="select__menu" role="listbox">
          {options.map((option) => {
            const selected = option.value === selectedValue;
            return (
              <button
                key={option.value}
                type="button"
                className={[
                  "select__item",
                  selected ? "select__item--selected" : "",
                  option.disabled ? "select__item--disabled" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => !option.disabled && handleSelect(option.value)}
                disabled={option.disabled}
                role="option"
                aria-selected={selected}
              >
                <span>{option.label}</span>
                {selected ? <span className="select__item-check">✓</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default Select;
