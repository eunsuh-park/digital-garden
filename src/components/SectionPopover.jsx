import './SectionPopover.css';

/**
 * 섹션 팝오버 - hover 시 섹션 정보, 금주 할 일, 식물 수 요약
 * CP-08, FN-04
 */
export default function SectionPopover({ section, tasks, position, onOpenDrawer }) {
  if (!section) return null;

  return (
    <div
      className="section-popover"
      style={{ left: position.x, top: position.y }}
      role="tooltip"
    >
      <div className="section-popover__header">
        <span
          className="section-popover__color"
          style={{ background: section.color_token }}
        />
        <strong>{section.name}</strong>
      </div>
      <ul className="section-popover__list">
        <li>금주 할 일 {tasks.length}건</li>
        <li>식물 {section.plantCount}종</li>
      </ul>
      <button
        type="button"
        className="section-popover__btn"
        onClick={onOpenDrawer}
      >
        상세 보기
      </button>
    </div>
  );
}
