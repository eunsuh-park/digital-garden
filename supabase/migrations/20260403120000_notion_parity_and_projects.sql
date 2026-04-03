-- Digital Garden: Notion(Location / Plant / Task) 스키마 대응 테이블
-- 기존 public.projects(id bigint) 유지 · 유저당 최대 3개 프로젝트 트리거
-- public.maps / zones / zone_shapes 는 맵 빌더 스텁 — 본 마이그레이션에서 변경 없음

-- ---------------------------------------------------------------------------
-- 공통: updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- projects: 자동 PK (비어 있으면 nextval), 위저드 컬럼, updated_at, 최대 3개 제한
-- ---------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS projects_id_seq;

SELECT setval(
  'projects_id_seq',
  COALESCE((SELECT MAX(id) FROM public.projects), 0)
);

ALTER TABLE public.projects
  ALTER COLUMN id SET DEFAULT nextval('projects_id_seq');

ALTER SEQUENCE projects_id_seq OWNED BY public.projects.id;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS space_size text,
  ADD COLUMN IF NOT EXISTS purpose text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_space_size_check;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_space_size_check CHECK (
    space_size IS NULL OR space_size IN ('s', 'm', 'l')
  );

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.enforce_max_three_projects_per_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.owner_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF (
    SELECT COUNT(*)::int
    FROM public.projects
    WHERE owner_id = NEW.owner_id
  ) >= 3 THEN
    RAISE EXCEPTION 'Maximum of 3 projects per user'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_projects_max_three ON public.projects;
CREATE TRIGGER trg_projects_max_three
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_max_three_projects_per_owner();

-- RLS: projects에 정책이 없으면 앱에서 접근 불가 — 소유자 기준 정책 추가
DROP POLICY IF EXISTS projects_is_owner_select ON public.projects;
DROP POLICY IF EXISTS projects_is_owner_insert ON public.projects;
DROP POLICY IF EXISTS projects_is_owner_update ON public.projects;
DROP POLICY IF EXISTS projects_is_owner_delete ON public.projects;

CREATE POLICY projects_is_owner_select ON public.projects
  FOR SELECT TO authenticated
  USING (owner_id = (SELECT auth.uid()));

CREATE POLICY projects_is_owner_insert ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY projects_is_owner_update ON public.projects
  FOR UPDATE TO authenticated
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY projects_is_owner_delete ON public.projects
  FOR DELETE TO authenticated
  USING (owner_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- locations — Notion: Name, Color, Description, Svg_Id
-- ---------------------------------------------------------------------------
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id bigint NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT '초록',
  svg_id text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX locations_project_id_idx ON public.locations (project_id);

CREATE TRIGGER trg_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- plants
-- ---------------------------------------------------------------------------
CREATE TABLE public.plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id bigint NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  location_id uuid REFERENCES public.locations (id) ON DELETE SET NULL,
  name text NOT NULL,
  species text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planted',
  bloom_season text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  quantity numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX plants_project_id_idx ON public.plants (project_id);
CREATE INDEX plants_location_id_idx ON public.plants (location_id);

CREATE OR REPLACE FUNCTION public.enforce_plant_location_same_project()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.location_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.locations l
      WHERE l.id = NEW.location_id
        AND l.project_id = NEW.project_id
    ) THEN
      RAISE EXCEPTION 'plant.location_id must belong to the same project';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_plants_location_project
  BEFORE INSERT OR UPDATE ON public.plants
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_plant_location_same_project();

CREATE TRIGGER trg_plants_updated_at
  BEFORE UPDATE ON public.plants
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id bigint NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT '시작 전',
  notes text NOT NULL DEFAULT '',
  task_type text NOT NULL DEFAULT 'Observation',
  difficulty text NOT NULL DEFAULT 'Easy',
  estimated_duration text NOT NULL DEFAULT '',
  scheduled_date date,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tasks_difficulty_check CHECK (
    difficulty IN ('Easy', 'Medium', 'Hard')
  ),
  CONSTRAINT tasks_task_type_check CHECK (
    task_type IN (
      'Pruning',
      'Fertilizing',
      'Propagation',
      'Watering',
      'Transplanting',
      'Observation',
      'Cleaning',
      'Decorating',
      'Construction'
    )
  )
);

CREATE INDEX tasks_project_id_idx ON public.tasks (project_id);

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.task_target_locations (
  task_id uuid NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES public.locations (id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, location_id)
);

CREATE INDEX task_target_locations_location_id_idx ON public.task_target_locations (location_id);

CREATE TABLE public.task_target_plants (
  task_id uuid NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  plant_id uuid NOT NULL REFERENCES public.plants (id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, plant_id)
);

CREATE INDEX task_target_plants_plant_id_idx ON public.task_target_plants (plant_id);

CREATE OR REPLACE FUNCTION public.enforce_task_target_location_same_project()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.tasks t
    JOIN public.locations l ON l.id = NEW.location_id AND l.project_id = t.project_id
    WHERE t.id = NEW.task_id
  ) THEN
    RAISE EXCEPTION 'task_target_locations: location must belong to the same project as the task';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_task_target_locations_same_project
  BEFORE INSERT OR UPDATE ON public.task_target_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_task_target_location_same_project();

CREATE OR REPLACE FUNCTION public.enforce_task_target_plant_same_project()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.tasks t
    JOIN public.plants pl ON pl.id = NEW.plant_id AND pl.project_id = t.project_id
    WHERE t.id = NEW.task_id
  ) THEN
    RAISE EXCEPTION 'task_target_plants: plant must belong to the same project as the task';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_task_target_plants_same_project
  BEFORE INSERT OR UPDATE ON public.task_target_plants
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_task_target_plant_same_project();

CREATE TABLE public.task_prerequisites (
  task_id uuid NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  prerequisite_task_id uuid NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, prerequisite_task_id),
  CONSTRAINT task_prerequisites_no_self CHECK (task_id <> prerequisite_task_id)
);

CREATE INDEX task_prerequisites_prereq_idx ON public.task_prerequisites (prerequisite_task_id);

CREATE TABLE public.task_followups (
  task_id uuid NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  followup_task_id uuid NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, followup_task_id),
  CONSTRAINT task_followups_no_self CHECK (task_id <> followup_task_id)
);

CREATE INDEX task_followups_followup_idx ON public.task_followups (followup_task_id);

CREATE OR REPLACE FUNCTION public.enforce_task_prerequisite_same_project()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.tasks t1
    JOIN public.tasks t2 ON t1.project_id = t2.project_id
    WHERE t1.id = NEW.task_id
      AND t2.id = NEW.prerequisite_task_id
  ) THEN
    RAISE EXCEPTION 'task_prerequisites: both tasks must belong to the same project';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_task_prerequisites_same_project
  BEFORE INSERT OR UPDATE ON public.task_prerequisites
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_task_prerequisite_same_project();

CREATE OR REPLACE FUNCTION public.enforce_task_followup_same_project()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.tasks t1
    JOIN public.tasks t2 ON t1.project_id = t2.project_id
    WHERE t1.id = NEW.task_id
      AND t2.id = NEW.followup_task_id
  ) THEN
    RAISE EXCEPTION 'task_followups: both tasks must belong to the same project';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_task_followups_same_project
  BEFORE INSERT OR UPDATE ON public.task_followups
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_task_followup_same_project();

-- ---------------------------------------------------------------------------
-- RLS (신규 테이블)
-- ---------------------------------------------------------------------------
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_target_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_target_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY locations_by_project ON public.locations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = locations.project_id AND p.owner_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = locations.project_id AND p.owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY plants_by_project ON public.plants
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = plants.project_id AND p.owner_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = plants.project_id AND p.owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY tasks_by_project ON public.tasks
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = tasks.project_id AND p.owner_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = tasks.project_id AND p.owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY task_target_locations_by_task ON public.task_target_locations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON p.id = t.project_id
      WHERE t.id = task_target_locations.task_id AND p.owner_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON p.id = t.project_id
      WHERE t.id = task_target_locations.task_id AND p.owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY task_target_plants_by_task ON public.task_target_plants
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON p.id = t.project_id
      WHERE t.id = task_target_plants.task_id AND p.owner_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON p.id = t.project_id
      WHERE t.id = task_target_plants.task_id AND p.owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY task_prerequisites_by_task ON public.task_prerequisites
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON p.id = t.project_id
      WHERE t.id = task_prerequisites.task_id AND p.owner_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON p.id = t.project_id
      WHERE t.id = task_prerequisites.task_id AND p.owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY task_followups_by_task ON public.task_followups
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON p.id = t.project_id
      WHERE t.id = task_followups.task_id AND p.owner_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON p.id = t.project_id
      WHERE t.id = task_followups.task_id AND p.owner_id = (SELECT auth.uid())
    )
  );
