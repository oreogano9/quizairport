import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import postgres from "postgres";
import { cookies } from "next/headers";
import { createInitialCards } from "@/lib/storage";

const SESSION_COOKIE = "patentequiz_session";
const SESSION_DAYS = 30;

export interface AuthUser {
  id: number;
  username: string;
}

export interface PersistedQuizState {
  cards: ReturnType<typeof createInitialCards>;
  hidden: string[];
}

type SqlClient = ReturnType<typeof postgres>;

declare global {
  var __patentequiz_sql__: SqlClient | undefined;
  var __patentequiz_bootstrap__: Promise<void> | undefined;
}

function getDatabaseUrl(): string | null {
  return process.env.DATABASE_URL ?? null;
}

export function isAuthConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}

function getSql(): SqlClient {
  if (!getDatabaseUrl()) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!global.__patentequiz_sql__) {
    global.__patentequiz_sql__ = postgres(getDatabaseUrl()!, {
      prepare: false,
    });
  }

  return global.__patentequiz_sql__;
}

function getInitialState(): PersistedQuizState {
  return {
    cards: createInitialCards(),
    hidden: [],
  };
}

export async function ensureAuthTables(): Promise<void> {
  if (!isAuthConfigured()) return;
  if (!global.__patentequiz_bootstrap__) {
    global.__patentequiz_bootstrap__ = (async () => {
      const sql = getSql();

      await sql`
        create table if not exists users (
          id serial primary key,
          username text unique not null,
          pin_hash text not null,
          created_at timestamptz not null default now()
        )
      `;

      await sql`
        create table if not exists sessions (
          token text primary key,
          user_id integer not null references users(id) on delete cascade,
          expires_at timestamptz not null,
          created_at timestamptz not null default now()
        )
      `;

      await sql`
        create table if not exists quiz_state (
          user_id integer primary key references users(id) on delete cascade,
          cards jsonb not null,
          hidden jsonb not null,
          updated_at timestamptz not null default now()
        )
      `;

      const existing = await sql<{ id: number }[]>`
        select id from users where username = 'admin' limit 1
      `;

      if (existing.length === 0) {
        const pinHash = await bcrypt.hash("1234", 10);
        const inserted = await sql<{ id: number }[]>`
          insert into users (username, pin_hash)
          values ('admin', ${pinHash})
          returning id
        `;

        const initialState = getInitialState();
        await sql`
          insert into quiz_state (user_id, cards, hidden)
          values (${inserted[0].id}, ${JSON.stringify(initialState.cards)}::jsonb, ${JSON.stringify(initialState.hidden)}::jsonb)
        `;
      }
    })();
  }

  await global.__patentequiz_bootstrap__;
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function validateCredentials(username: string, pin: string): string | null {
  const normalized = normalizeUsername(username);
  if (!/^[a-z0-9_-]{3,24}$/.test(normalized)) {
    return "Username: 3-24 caratteri, solo lettere minuscole, numeri, _ o -.";
  }
  if (!/^\d{4}$/.test(pin)) {
    return "PIN: inserisci esattamente 4 cifre.";
  }
  return null;
}

async function createSession(userId: number): Promise<string> {
  const sql = getSql();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await sql`
    insert into sessions (token, user_id, expires_at)
    values (${token}, ${userId}, ${expiresAt.toISOString()})
  `;

  return token;
}

async function getCurrentToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function registerUser(username: string, pin: string): Promise<AuthUser> {
  await ensureAuthTables();
  const sql = getSql();
  const normalized = normalizeUsername(username);
  const pinHash = await bcrypt.hash(pin, 10);
  const created = await sql<{ id: number; username: string }[]>`
    insert into users (username, pin_hash)
    values (${normalized}, ${pinHash})
    returning id, username
  `;

  const initialState = getInitialState();
  await sql`
    insert into quiz_state (user_id, cards, hidden)
    values (${created[0].id}, ${JSON.stringify(initialState.cards)}::jsonb, ${JSON.stringify(initialState.hidden)}::jsonb)
  `;

  const token = await createSession(created[0].id);
  await setSessionCookie(token);

  return created[0];
}

export async function loginUser(username: string, pin: string): Promise<AuthUser | null> {
  await ensureAuthTables();
  const sql = getSql();
  const normalized = normalizeUsername(username);
  const found = await sql<{ id: number; username: string; pin_hash: string }[]>`
    select id, username, pin_hash
    from users
    where username = ${normalized}
    limit 1
  `;

  if (found.length === 0) return null;
  const ok = await bcrypt.compare(pin, found[0].pin_hash);
  if (!ok) return null;

  const token = await createSession(found[0].id);
  await setSessionCookie(token);

  return {
    id: found[0].id,
    username: found[0].username,
  };
}

export async function logoutCurrentUser(): Promise<void> {
  if (!isAuthConfigured()) return;
  await ensureAuthTables();
  const sql = getSql();
  const token = await getCurrentToken();
  if (token) {
    await sql`delete from sessions where token = ${token}`;
  }
  await clearSessionCookie();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isAuthConfigured()) return null;
  await ensureAuthTables();
  const sql = getSql();
  const token = await getCurrentToken();
  if (!token) return null;

  const rows = await sql<{ id: number; username: string }[]>`
    select u.id, u.username
    from sessions s
    join users u on u.id = s.user_id
    where s.token = ${token}
      and s.expires_at > now()
    limit 1
  `;

  if (rows.length === 0) {
    await clearSessionCookie();
    return null;
  }

  return rows[0];
}

export async function getQuizStateForUser(userId: number): Promise<PersistedQuizState> {
  await ensureAuthTables();
  const sql = getSql();
  const rows = await sql<{ cards: PersistedQuizState["cards"]; hidden: string[] }[]>`
    select cards, hidden
    from quiz_state
    where user_id = ${userId}
    limit 1
  `;

  if (rows.length === 0) {
    const initialState = getInitialState();
    await sql`
      insert into quiz_state (user_id, cards, hidden)
      values (${userId}, ${JSON.stringify(initialState.cards)}::jsonb, ${JSON.stringify(initialState.hidden)}::jsonb)
    `;
    return initialState;
  }

  return rows[0];
}

export async function saveQuizStateForUser(
  userId: number,
  state: PersistedQuizState
): Promise<void> {
  await ensureAuthTables();
  const sql = getSql();

  await sql`
    insert into quiz_state (user_id, cards, hidden, updated_at)
    values (${userId}, ${JSON.stringify(state.cards)}::jsonb, ${JSON.stringify(state.hidden)}::jsonb, now())
    on conflict (user_id)
    do update set
      cards = excluded.cards,
      hidden = excluded.hidden,
      updated_at = now()
  `;
}
