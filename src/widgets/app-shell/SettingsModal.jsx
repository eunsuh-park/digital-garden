import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import closeLine from "@iconify-icons/mingcute/close-line";
import settings3Line from "@iconify-icons/mingcute/settings-3-line";
import notificationLine from "@iconify-icons/mingcute/notification-line";
import safeAlertLine from "@iconify-icons/mingcute/safe-alert-line";
import timeLine from "@iconify-icons/mingcute/time-line";
import { ButtonTabGroup } from "@/shared/ui/button-tab/ButtonTab";
import Checkbox from "@/shared/ui/checkbox/Checkbox";
import Container from "@/shared/ui/container/Container";
import DatePicker from "@/shared/ui/date-picker/DatePicker";
import Dialog from "@/shared/ui/dialog/Dialog";
import Divider from "@/shared/ui/divider/Divider";
import IconButton from "@/shared/ui/icon-button/IconButton";
import RadioButton, { RadioGroup } from "@/shared/ui/radio-button/RadioButton";
import SectionHeading from "@/shared/ui/section-heading/SectionHeading";
import Select from "@/shared/ui/select/Select";
import TextButton from "@/shared/ui/text-button/TextButton";
import TextField from "@/shared/ui/text-field/TextField";
import ToggleButton from "@/shared/ui/toggle-button/ToggleButton";
import ActionPopover from "@/shared/ui/action-popover/ActionPopover";
import SettingsNavItem from "@/shared/ui/settings-nav-item/SettingsNavItem";
import "./SettingsModal.css";

const NAV_ITEMS = [
  { label: "일반", value: "general", icon: settings3Line },
  { label: "알림", value: "notify", icon: notificationLine },
  { label: "개인 맞춤", value: "personal", icon: timeLine },
  { label: "보안", value: "security", icon: safeAlertLine },
];

const VIEW_OPTIONS = [
  { label: "도로 기준", value: "road" },
  { label: "위성 기준", value: "satellite" },
  { label: "혼합형", value: "hybrid" },
];

const COLOR_OPTIONS = [
  { label: "세이지 그린", value: "sage" },
  { label: "모스 그린", value: "moss" },
  { label: "브라운 베이지", value: "beige" },
];

const LANGUAGE_OPTIONS = [
  { label: "자동 감지", value: "auto" },
  { label: "한국어", value: "ko" },
  { label: "English", value: "en" },
];

const VOICE_OPTIONS = [
  { label: "Breeze", value: "breeze" },
  { label: "Clair", value: "clair" },
  { label: "Nova", value: "nova" },
];

const REMINDER_OPTIONS = [
  { label: "매일 오전", value: "daily-am" },
  { label: "주 3회", value: "three-times" },
  { label: "필요할 때만", value: "manual" },
];

const THEME_OPTIONS = [
  { label: "라이트", value: "light" },
  { label: "시스템", value: "system" },
  { label: "다크", value: "dark" },
];

const RADIO_STYLE_OPTIONS = [
  { label: "미니멀", value: "minimal" },
  { label: "기본", value: "default" },
  { label: "강조", value: "accent" },
];

export default function SettingsModal({ open, onClose }) {
  const [activeNav, setActiveNav] = useState("general");
  const [activeTheme, setActiveTheme] = useState("system");
  const [mapView, setMapView] = useState("road");
  const [accentColor, setAccentColor] = useState("sage");
  const [language, setLanguage] = useState("auto");
  const [voice, setVoice] = useState("breeze");
  const [reminderType, setReminderType] = useState("daily-am");
  const [mapVisualStyle, setMapVisualStyle] = useState("default");
  const [memo, setMemo] = useState("정원 방문 전 장갑/가위 확인");
  const [visitedOnly, setVisitedOnly] = useState(true);
  const [highlightOn, setHighlightOn] = useState(true);
  const [checklistOn, setChecklistOn] = useState(true);
  const [recommendationOn, setRecommendationOn] = useState(false);
  const [summaryPushOn, setSummaryPushOn] = useState(true);
  const [dateValue, setDateValue] = useState(new Date());

  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeydown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="settings-modal-root" role="presentation">
      <div className="settings-modal-root__backdrop" onClick={onClose} aria-hidden />
      <section className="settings-modal" role="dialog" aria-modal="true" aria-label="나우가든 설정" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="settings-modal__close" onClick={onClose} aria-label="설정창 닫기">
          <Icon icon={closeLine} width={20} height={20} />
        </button>

        <aside className="settings-modal__sidebar">
          <SectionHeading label="NowGarden" title="설정" description="환경을 취향에 맞게 조정하세요." compact />
          <div className="settings-modal__sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <SettingsNavItem
                key={item.value}
                label={item.label}
                icon={<Icon icon={item.icon} width={18} height={18} />}
                active={activeNav === item.value}
                onClick={() => setActiveNav(item.value)}
              />
            ))}
          </div>
        </aside>

        <Container className="settings-modal__content-shell">
          <div className="settings-modal__content">
            <SectionHeading title="일반" description="임시 프로토타입 화면입니다. 실제 저장 기능은 아직 연결하지 않았습니다." />

            <Dialog
              label="추천"
              title="정원을 더 안전하게 관리해보세요"
              description="가족 구성원이나 협업자 권한을 나눠두면 실수 없이 관리할 수 있어요."
              maxWidth="100%"
              hoverable={false}
              footer={
                <>
                  <TextButton label="공유 설정 보기" styleType="secondary" size="xs" />
                  <IconButton styleType="nobg" state="default" showLabel label="즐겨찾기" />
                </>
              }
            >
              <div className="settings-modal__promo-content">
                <RadioButton size="s" checked showLabel label="권한 분리 추천" />
                <span>프로젝트별로 편집 가능 범위를 분리해 두는 옵션입니다.</span>
              </div>
            </Dialog>

            <Divider />

            <div className="settings-modal__grid">
              <div className="settings-modal__item">
                <h4>기본 보기</h4>
                <Select options={VIEW_OPTIONS} value={mapView} onChange={setMapView} size="m" />
              </div>

              <div className="settings-modal__item">
                <h4>강조 컬러</h4>
                <Select options={COLOR_OPTIONS} value={accentColor} onChange={setAccentColor} size="m" />
              </div>

              <div className="settings-modal__item">
                <h4>언어</h4>
                <Select options={LANGUAGE_OPTIONS} value={language} onChange={setLanguage} size="m" />
              </div>

              <div className="settings-modal__item">
                <h4>기본 지도 스타일</h4>
                <RadioGroup options={RADIO_STYLE_OPTIONS} value={mapVisualStyle} onChange={setMapVisualStyle} size="s" />
              </div>
            </div>

            <Divider />

            <div className="settings-modal__row">
              <div>
                <h4>섹션 하이라이트</h4>
                <p>할 일이나 일지 진입 시 해당 영역을 강조 표시합니다.</p>
              </div>
              <ToggleButton size="m" checked={highlightOn} onChange={setHighlightOn} ariaLabel="섹션 하이라이트 토글" />
            </div>

            <div className="settings-modal__row">
              <div>
                <h4>방문 전 체크리스트</h4>
                <p>방문 전에 필요한 준비 항목을 자동으로 묶어 보여줍니다.</p>
              </div>
              <ToggleButton size="m" checked={checklistOn} onChange={setChecklistOn} ariaLabel="체크리스트 토글" />
            </div>

            <div className="settings-modal__row">
              <div>
                <h4>작업 추천 표시</h4>
                <p>시즌과 식물 상태에 따라 추천 작업을 먼저 노출합니다.</p>
              </div>
              <ToggleButton size="m" checked={recommendationOn} onChange={setRecommendationOn} ariaLabel="작업 추천 토글" />
            </div>

            <Divider />

            <div className="settings-modal__grid">
              <div className="settings-modal__item">
                <h4>안내 음성</h4>
                <Select options={VOICE_OPTIONS} value={voice} onChange={setVoice} size="m" />
              </div>
              <div className="settings-modal__item">
                <h4>알림 주기</h4>
                <Select options={REMINDER_OPTIONS} value={reminderType} onChange={setReminderType} size="m" />
              </div>
              <div className="settings-modal__item">
                <h4>리마인드 시작일</h4>
                <DatePicker value={dateValue} onChange={setDateValue} size="m" />
              </div>
              <div className="settings-modal__item">
                <h4>메모</h4>
                <TextField
                  variant="text-area"
                  type="long"
                  size="s"
                  label="간단 메모"
                  value={memo}
                  onChange={setMemo}
                  showCounter
                  maxLength={60}
                />
              </div>
            </div>

            <Divider />

            <div className="settings-modal__checks">
              <Checkbox size="s" checked={visitedOnly} onChange={setVisitedOnly} label="방문 예정 항목만 보기" />
              <Checkbox size="s" checked={summaryPushOn} onChange={setSummaryPushOn} label="오늘의 요약 알림 받기" />
              <Checkbox size="s" defaultChecked label="계절 변화 안내 받기" />
            </div>

            <Divider />

            <div className="settings-modal__footer">
              <ButtonTabGroup items={THEME_OPTIONS} value={activeTheme} onChange={setActiveTheme} size="m" />
              <div className="settings-modal__footer-actions">
                <TextButton label="취소" styleType="tertiary" size="s" onClick={onClose} />
                <ActionPopover
                  title="초기화 옵션"
                  subtitle="위험 작업"
                  content="정원 레이아웃, 필터, 임시 보기 설정을 초기화하는 기능 자리입니다."
                  placement="top"
                  align="right"
                  trigger="click"
                  showFooter={false}
                  bodyMaxHeight={140}
                >
                  <TextButton label="초기화 옵션 보기" styleType="danger" size="s" />
                </ActionPopover>
                <TextButton label="임시 저장" styleType="primary" size="s" />
              </div>
            </div>

            <div className="settings-modal__icons">
              <Icon icon={settings3Line} width={16} height={16} />
              <span>일반 설정</span>
              <Icon icon={notificationLine} width={16} height={16} />
              <span>알림</span>
              <Icon icon={safeAlertLine} width={16} height={16} />
              <span>보안</span>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
