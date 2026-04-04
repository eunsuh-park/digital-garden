-- ---------------------------------------------------------------------------
-- 새 프로젝트 위저드 / 프로젝트 저장 400 방지용 스키마 보강 (수동 실행)
-- 적용: Supabase 대시보드 > SQL Editor 에서 전체 실행
-- 내용: migrations/20260403200000 + 20260404120000 와 동일 (이미 적용된 항목은 idempotent)
-- ---------------------------------------------------------------------------

-- INSERT 시 owner_id가 비어 있으면 현재 로그인 사용자로 채움 (RLS WITH CHECK 통과)
CREATE OR REPLACE FUNCTION public.projects_set_default_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.owner_id IS NULL AND auth.uid() IS NOT NULL THEN
    NEW.owner_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_projects_default_owner ON public.projects;
CREATE TRIGGER trg_projects_default_owner
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.projects_set_default_owner();

-- 이전 마이그레이션 없이 테이블만 있는 경우 대비
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS space_size text;

-- 프로젝트 공간 넓이: s/m/l → narrow/medium/wide 로 이관 후 CHECK 교체
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

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS space_description text;

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_space_description_len_check;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_space_description_len_check CHECK (
    space_description IS NULL OR char_length(space_description) <= 200
  );
