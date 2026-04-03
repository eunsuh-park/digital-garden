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
