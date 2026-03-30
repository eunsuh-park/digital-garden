import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import closeLine from "@iconify-icons/mingcute/close-line";
import user3Line from "@iconify-icons/mingcute/user-3-line";
import mapLine from "@iconify-icons/mingcute/map-line";
import eye2Line from "@iconify-icons/mingcute/eye-2-line";
import task2Line from "@iconify-icons/mingcute/task-2-line";
import notificationLine from "@iconify-icons/mingcute/notification-line";
import settings3Line from "@iconify-icons/mingcute/settings-3-line";
import Container from "@/shared/ui/container/Container";
import Divider from "@/shared/ui/divider/Divider";
import SectionHeading from "@/shared/ui/section-heading/SectionHeading";
import SettingsNavItem from "@/shared/ui/settings-nav-item/SettingsNavItem";
import TextField from "@/shared/ui/text-field/TextField";
import TextButton from "@/shared/ui/text-button/TextButton";
import ToggleButton from "@/shared/ui/toggle-button/ToggleButton";
import Select from "@/shared/ui/select/Select";
import { ButtonTabGroup } from "@/shared/ui/button-tab/ButtonTab";
import { RadioGroup } from "@/shared/ui/radio-button/RadioButton";
import Checkbox from "@/shared/ui/checkbox/Checkbox";
import "./SettingsModal.css";

const NAV_ITEMS = [
  { label: "계정 / 사용자", value: "account", icon: user3Line },
  { label: "정원 기본 설정", value: "garden", icon: mapLine },
  { label: "화면 / 인터페이스", value: "interface", icon: eye2Line },
  { label: "작업 / 일지 설정", value: "task", icon: task2Line },
  { label: "알림", value: "notify", icon: notificationLine },
  { label: "기타", value: "etc", icon: settings3Line },
];

const VIEW_BASE_OPTIONS = [
  { label: "도로 기준", value: "road" },
  { label: "집 기준", value: "home" },
];

const FILTER_OPTIONS = [
  { label: "전체 섹션", value: "all" },
  { label: "할 일 중심", value: "task" },
  { label: "식물 중심", value: "plant" },
];

const MAP_STYLE_OPTIONS = [
  { label: "일러스트", value: "illustration" },
  { label: "위성", value: "satellite" },
  { label: "혼합", value: "hybrid" },
];

const DENSITY_OPTIONS = [
  { label: "Compact", value: "compact" },
  { label: "Cozy", value: "cozy" },
];

const TASK_STATUS_OPTIONS = [
  { label: "예정", value: "planned" },
  { label: "진행중", value: "doing" },
  { label: "완료", value: "done" },
];

const JOURNAL_GROUP_OPTIONS = [
  { label: "방문 단위", value: "visit" },
  { label: "날짜 단위", value: "date" },
];

const LANGUAGE_OPTIONS = [
  { label: "한국어", value: "ko" },
  { label: "English", value: "en" },
  { label: "자동 감지", value: "auto" },
];

const EMAIL_PUSH_OPTIONS = [
  { id: "email", label: "이메일" },
  { id: "push", label: "푸시" },
];

function SettingRow({ title, description = "", children, multiline = false, danger = false }) {
  return (
    <div className={`settings-modal__setting-row ${multiline ? "settings-modal__setting-row--multiline" : ""} ${danger ? "settings-modal__setting-row--danger" : ""}`}>
      <div className="settings-modal__setting-main">
        <h4>{title}</h4>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="settings-modal__setting-control">{children}</div>
    </div>
  );
}

export default function SettingsModal({ open, onClose }) {
  const [activeNav, setActiveNav] = useState("account");
  const [viewBase, setViewBase] = useState("road");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [mapStyle, setMapStyle] = useState("illustration");
  const [density, setDensity] = useState("cozy");
  const [taskStatus, setTaskStatus] = useState("planned");
  const [journalGrouping, setJournalGrouping] = useState("visit");
  const [language, setLanguage] = useState("ko");
  const [darkModeOn, setDarkModeOn] = useState(false);
  const [animationOn, setAnimationOn] = useState(true);
  const [taskRecommendOn, setTaskRecommendOn] = useState(true);
  const [checklistNotifyOn, setChecklistNotifyOn] = useState(true);
  const [plantPeriodNotifyOn, setPlantPeriodNotifyOn] = useState(true);
  const [channels, setChannels] = useState({ email: true, push: true });

  const activeNavLabel = useMemo(
    () => NAV_ITEMS.find((item) => item.value === activeNav)?.label ?? "설정",
    [activeNav]
  );

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

  const renderContent = () => {
    switch (activeNav) {
      case "account":
        return (
          <>
            <SettingRow title="이름 / 닉네임">
              <TextField size="s" label="" placeholder="이름 또는 닉네임" showHelperText={false} />
            </SettingRow>
            <Divider />
            <SettingRow title="이메일">
              <TextField size="s" label="" placeholder="you@example.com" showHelperText={false} />
            </SettingRow>
            <Divider />
            <SettingRow title="프로필 이미지" description="추후 업로드/크롭 기능과 연동될 자리입니다.">
              <TextButton label="아바타 업로드" styleType="secondary" size="s" />
            </SettingRow>
            <Divider />
            <SettingRow title="로그아웃">
              <TextButton label="로그아웃" styleType="tertiary" size="s" />
            </SettingRow>
          </>
        );
      case "garden":
        return (
          <>
            <SettingRow title="정원 이름">
              <TextField size="s" label="" placeholder="나의 정원" showHelperText={false} />
            </SettingRow>
            <Divider />
            <SettingRow title="기본 뷰 기준">
              <ButtonTabGroup items={VIEW_BASE_OPTIONS} value={viewBase} onChange={setViewBase} size="m" />
            </SettingRow>
            <Divider />
            <SettingRow title="기본 섹션 필터 상태">
              <Select options={FILTER_OPTIONS} value={sectionFilter} onChange={setSectionFilter} size="m" />
            </SettingRow>
            <Divider />
            <SettingRow title="지도 스타일">
              <RadioGroup options={MAP_STYLE_OPTIONS} value={mapStyle} onChange={setMapStyle} size="s" />
            </SettingRow>
          </>
        );
      case "interface":
        return (
          <>
            <SettingRow title="다크 / 라이트 모드">
              <ToggleButton size="m" checked={darkModeOn} onChange={setDarkModeOn} ariaLabel="다크 모드 토글" />
            </SettingRow>
            <Divider />
            <SettingRow title="애니메이션 사용 여부">
              <ToggleButton size="m" checked={animationOn} onChange={setAnimationOn} ariaLabel="애니메이션 토글" />
            </SettingRow>
            <Divider />
            <SettingRow title="UI 밀도">
              <ButtonTabGroup items={DENSITY_OPTIONS} value={density} onChange={setDensity} size="m" />
            </SettingRow>
          </>
        );
      case "task":
        return (
          <>
            <SettingRow title="기본 작업 상태">
              <Select options={TASK_STATUS_OPTIONS} value={taskStatus} onChange={setTaskStatus} size="m" />
            </SettingRow>
            <Divider />
            <SettingRow title="작업 추천 표시 여부">
              <ToggleButton size="m" checked={taskRecommendOn} onChange={setTaskRecommendOn} ariaLabel="작업 추천 표시 토글" />
            </SettingRow>
            <Divider />
            <SettingRow title="일지 자동 묶기 방식">
              <Select options={JOURNAL_GROUP_OPTIONS} value={journalGrouping} onChange={setJournalGrouping} size="m" />
            </SettingRow>
          </>
        );
      case "notify":
        return (
          <>
            <SettingRow title="방문 전 체크리스트 알림">
              <ToggleButton size="m" checked={checklistNotifyOn} onChange={setChecklistNotifyOn} ariaLabel="체크리스트 알림 토글" />
            </SettingRow>
            <Divider />
            <SettingRow title="식물 관리 시기 알림">
              <ToggleButton size="m" checked={plantPeriodNotifyOn} onChange={setPlantPeriodNotifyOn} ariaLabel="식물 알림 토글" />
            </SettingRow>
            <Divider />
            <SettingRow title="이메일 / 푸시 여부" multiline>
              <div className="settings-modal__checkbox-group">
                {EMAIL_PUSH_OPTIONS.map((option) => (
                  <Checkbox
                    key={option.id}
                    size="s"
                    label={option.label}
                    checked={channels[option.id]}
                    onChange={(checked) => setChannels((prev) => ({ ...prev, [option.id]: checked }))}
                  />
                ))}
              </div>
            </SettingRow>
          </>
        );
      case "etc":
      default:
        return (
          <>
            <SettingRow title="언어">
              <Select options={LANGUAGE_OPTIONS} value={language} onChange={setLanguage} size="m" />
            </SettingRow>
            <Divider />
            <SettingRow title="도움말">
              <TextButton label="도움말 열기" styleType="tertiary" size="s" />
            </SettingRow>
            <Divider />
            <SettingRow title="피드백 보내기">
              <TextButton label="피드백 전송" styleType="primary" size="s" />
            </SettingRow>
          </>
        );
    }
  };

  return (
    <div className="settings-modal-root" role="presentation">
      <div className="settings-modal-root__backdrop" onClick={onClose} aria-hidden />
      <section className="settings-modal" role="dialog" aria-modal="true" aria-label="나우가든 설정" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="settings-modal__close" onClick={onClose} aria-label="설정창 닫기">
          <Icon icon={closeLine} width={20} height={20} />
        </button>

        <aside className="settings-modal__sidebar">
          <SectionHeading label="NowGarden" title="설정" description="항목을 선택해 상세 설정을 확인하세요." compact />
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
            <div className="settings-modal__content-body">
              <SectionHeading title={activeNavLabel} description="v0.1 임시 구조입니다. 기능 연결은 이후 단계에서 진행합니다." />
              {renderContent()}
            </div>
            <div className="settings-modal__footer-actions">
              <TextButton label="취소" styleType="tertiary" size="s" onClick={onClose} />
              <TextButton label="임시 저장" styleType="primary" size="s" />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
