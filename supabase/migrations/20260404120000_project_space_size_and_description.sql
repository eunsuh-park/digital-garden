-- 프로젝트 공간 넓이: 사용자용 한글 UI에 대응하는 영문 값
-- 기존 s/m/l → narrow/medium/wide 로 이관 후 CHECK 교체
UPDATE public.projects
SET space_size = CASE space_size
  WHEN 's' THEN 'narrow'
  WHEN 'm' THEN 'medium'
  WHEN 'l' THEN 'wide'
  ELSE space_size
END
WHERE space_size IN ('s', 'm', 'l');

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_space_size_check;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_space_size_check CHECK (
    space_size IS NULL OR space_size IN ('narrow', 'medium', 'wide', 'very_wide')
  );

-- 공간 설명 (선택, 최대 200자 — 앱에서도 검증)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS space_description text;

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_space_description_len_check;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_space_description_len_check CHECK (
    space_description IS NULL OR char_length(space_description) <= 200
  );
