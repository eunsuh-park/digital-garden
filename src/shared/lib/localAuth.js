const CREDENTIALS_KEY = 'digital-garden.auth.credentials.v1';
const SESSION_KEY = 'digital-garden.auth.session.v1';
const HASH_ITERATIONS = 120000;

function toBase64(bytes) {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary);
}

function fromBase64(base64) {
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function getEncoder() {
  return new TextEncoder();
}

function randomSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toBase64(bytes);
}

async function derivePasswordHash(password, saltBase64) {
  const encoder = getEncoder();
  const passwordBytes = encoder.encode(password);
  const saltBytes = fromBase64(saltBase64);
  const keyMaterial = await crypto.subtle.importKey('raw', passwordBytes, 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: saltBytes,
      iterations: HASH_ITERATIONS,
    },
    keyMaterial,
    256
  );

  return toBase64(new Uint8Array(bits));
}

function readCredentialsRecord() {
  const raw = localStorage.getItem(CREDENTIALS_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.username || !parsed.salt || !parsed.passwordHash) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(username) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      username,
      loggedInAt: Date.now(),
    })
  );
}

export function hasStoredCredentials() {
  return Boolean(readCredentialsRecord());
}

export function getSessionUser() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.username) return null;
    return parsed.username;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export async function setupCredentials(username, password) {
  const salt = randomSalt();
  const passwordHash = await derivePasswordHash(password, salt);
  const record = {
    username,
    salt,
    passwordHash,
    updatedAt: Date.now(),
  };
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(record));
  writeSession(username);
}

export async function verifyAndLogin(username, password) {
  const record = readCredentialsRecord();
  if (!record) {
    return { ok: false, reason: 'missing_credentials' };
  }
  if (record.username !== username) {
    return { ok: false, reason: 'invalid_credentials' };
  }

  const candidateHash = await derivePasswordHash(password, record.salt);
  if (candidateHash !== record.passwordHash) {
    return { ok: false, reason: 'invalid_credentials' };
  }

  writeSession(username);
  return { ok: true };
}
