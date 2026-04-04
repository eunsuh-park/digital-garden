/**
 * supabase/manual_apply_project_wizard.sql 을 링크된 원격 프로젝트에 실행합니다.
 *
 * .env.local:
 *   SUPABASE_ACCESS_TOKEN — Account > Access Tokens 의 `sbp_...` (anon key 아님)
 *   SUPABASE_PROJECT_REF — 프로젝트 Reference ID
 *
 * 사용: node scripts/apply-wizard-schema.mjs
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const sqlFile = join(root, 'supabase', 'manual_apply_project_wizard.sql');

dotenv.config({ path: join(root, '.env.local') });
dotenv.config({ path: join(root, '.env') });

const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const ref = process.env.SUPABASE_PROJECT_REF?.trim();

if (!token) {
  console.error('SUPABASE_ACCESS_TOKEN 이 .env.local 에 없습니다.');
  process.exit(1);
}
if (!token.startsWith('sbp_')) {
  console.error(
    'SUPABASE_ACCESS_TOKEN 은 sbp_ 로 시작하는 Personal Access Token 이어야 합니다. (anon key 아님)'
  );
  process.exit(1);
}
if (!ref) {
  console.error('SUPABASE_PROJECT_REF 가 .env.local 에 없습니다.');
  process.exit(1);
}
if (!existsSync(sqlFile)) {
  console.error('파일 없음:', sqlFile);
  process.exit(1);
}

const env = { ...process.env, SUPABASE_ACCESS_TOKEN: token };

function sh(cmd) {
  execSync(cmd, { cwd: root, env, stdio: 'inherit', shell: true });
}

try {
  sh(`npx -y supabase@latest link --project-ref ${ref} --yes`);
  sh(`npx -y supabase@latest db query --linked -f supabase/manual_apply_project_wizard.sql --agent=no`);
  console.log('적용 완료.');
} catch {
  process.exit(1);
}
