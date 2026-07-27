import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { hasDatabase, prisma } from "@/lib/db";
import type { Level, Role } from "@/lib/types";

/**
 * Data access layer.
 *
 * When DATABASE_URL is configured every call goes to Postgres through Prisma.
 * Otherwise a JSON file store under .data/ is used so the whole app (including
 * registration, login and progress sync) works out of the box in development.
 */

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  image?: string | null;
  emailVerified: string | null;
  level: Level;
  createdAt: string;
}

export interface StoredToken {
  token: string;
  email: string;
  type: "email-verification" | "password-reset";
  expires: string;
}

export interface StoredGroup {
  id: string;
  name: string;
  description: string;
  level: Level;
  visibility: "public" | "private";
  code: string;
  createdAt: string;
  members: { userId: string; name: string; role: Role; xp: number; streak: number; level: Level }[];
  challenge?: { title: string; goal: number; unit: string; endsAt: string; progress: number };
}

export interface StoredPost {
  id: string;
  userId: string;
  author: string;
  groupId?: string;
  category: string;
  title: string;
  body: string;
  level?: Level;
  createdAt: string;
  comments: { id: string; author: string; body: string; createdAt: string }[];
}

interface FileDb {
  users: StoredUser[];
  tokens: StoredToken[];
  snapshots: Record<string, { state: unknown; updatedAt: string }>;
  groups: StoredGroup[];
  posts: StoredPost[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

const emptyDb: FileDb = { users: [], tokens: [], snapshots: {}, groups: [], posts: [] };

async function readDb(): Promise<FileDb> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return { ...emptyDb, ...(JSON.parse(raw) as FileDb) };
  } catch {
    return { ...emptyDb };
  }
}

async function writeDb(db: FileDb) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

export function createId() {
  return crypto.randomUUID();
}

export function createToken() {
  return crypto.randomBytes(24).toString("hex");
}

/* --------------------------------- users -------------------------------- */

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const needle = email.trim().toLowerCase();
  if (hasDatabase && prisma) {
    const user = await prisma.user.findUnique({
      where: { email: needle },
      include: { profile: true },
    });
    if (!user) return null;
    return {
      id: user.id,
      name: user.name ?? "",
      email: user.email,
      passwordHash: user.passwordHash ?? "",
      role: user.role as Role,
      image: user.image,
      emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
      level: (user.profile?.currentLevel ?? "A1") as Level,
      createdAt: user.createdAt.toISOString(),
    };
  }
  const db = await readDb();
  return db.users.find((user) => user.email === needle) ?? null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  if (hasDatabase && prisma) {
    const user = await prisma.user.findUnique({ where: { id }, include: { profile: true } });
    if (!user) return null;
    return {
      id: user.id,
      name: user.name ?? "",
      email: user.email,
      passwordHash: user.passwordHash ?? "",
      role: user.role as Role,
      image: user.image,
      emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
      level: (user.profile?.currentLevel ?? "A1") as Level,
      createdAt: user.createdAt.toISOString(),
    };
  }
  const db = await readDb();
  return db.users.find((user) => user.id === id) ?? null;
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  level?: Level;
  role?: Role;
}): Promise<StoredUser> {
  const email = input.email.trim().toLowerCase();

  if (hasDatabase && prisma) {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email,
        passwordHash: input.passwordHash,
        role: (input.role ?? "STUDENT") as never,
        profile: { create: { currentLevel: (input.level ?? "A1") as never } },
      },
    });
    return {
      id: user.id,
      name: user.name ?? input.name,
      email: user.email,
      passwordHash: input.passwordHash,
      role: (input.role ?? "STUDENT") as Role,
      emailVerified: null,
      level: input.level ?? "A1",
      createdAt: user.createdAt.toISOString(),
    };
  }

  const db = await readDb();
  const user: StoredUser = {
    id: createId(),
    name: input.name,
    email,
    passwordHash: input.passwordHash,
    role: input.role ?? "STUDENT",
    emailVerified: null,
    level: input.level ?? "A1",
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  await writeDb(db);
  return user;
}

export async function updateUser(id: string, patch: Partial<Omit<StoredUser, "id">>) {
  if (hasDatabase && prisma) {
    await prisma.user.update({
      where: { id },
      data: {
        name: patch.name,
        image: patch.image ?? undefined,
        passwordHash: patch.passwordHash,
        emailVerified: patch.emailVerified ? new Date(patch.emailVerified) : undefined,
        ...(patch.level
          ? {
              profile: {
                upsert: {
                  create: { currentLevel: patch.level as never },
                  update: { currentLevel: patch.level as never },
                },
              },
            }
          : {}),
      },
    });
    return;
  }
  const db = await readDb();
  const index = db.users.findIndex((user) => user.id === id);
  if (index === -1) return;
  db.users[index] = { ...db.users[index], ...patch };
  await writeDb(db);
}

export async function countUsers() {
  if (hasDatabase && prisma) return prisma.user.count();
  const db = await readDb();
  return db.users.length;
}

export async function listUsers(limit = 100) {
  if (hasDatabase && prisma) {
    const users = await prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { profile: true },
    });
    return users.map((user) => ({
      id: user.id,
      name: user.name ?? "",
      email: user.email,
      role: user.role as Role,
      level: (user.profile?.currentLevel ?? "A1") as Level,
      xp: user.profile?.xp ?? 0,
      createdAt: user.createdAt.toISOString(),
    }));
  }
  const db = await readDb();
  return db.users.slice(0, limit).map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    level: user.level,
    xp: 0,
    createdAt: user.createdAt,
  }));
}

/* -------------------------------- tokens -------------------------------- */

export async function saveToken(input: Omit<StoredToken, "token"> & { token?: string }) {
  const token = input.token ?? createToken();
  const record: StoredToken = { ...input, token };

  if (hasDatabase && prisma) {
    await prisma.verificationToken.create({
      data: {
        email: record.email,
        token,
        type: record.type,
        expires: new Date(record.expires),
      },
    });
    return record;
  }
  const db = await readDb();
  db.tokens = db.tokens.filter((item) => !(item.email === record.email && item.type === record.type));
  db.tokens.push(record);
  await writeDb(db);
  return record;
}

export async function consumeToken(token: string, type: StoredToken["type"]) {
  if (hasDatabase && prisma) {
    const record = await prisma.verificationToken.findUnique({ where: { token } });
    if (!record || record.type !== type || record.expires < new Date()) return null;
    await prisma.verificationToken.delete({ where: { token } });
    return { token, email: record.email, type, expires: record.expires.toISOString() } as StoredToken;
  }
  const db = await readDb();
  const record = db.tokens.find((item) => item.token === token && item.type === type);
  if (!record) return null;
  if (new Date(record.expires) < new Date()) return null;
  db.tokens = db.tokens.filter((item) => item.token !== token);
  await writeDb(db);
  return record;
}

/* ------------------------------- snapshots ------------------------------ */

/** Stores the client learner state so progress can be restored on any device. */
export async function saveSnapshot(userId: string, state: unknown) {
  if (hasDatabase && prisma) {
    await prisma.profile.upsert({
      where: { userId },
      create: { userId, motivation: JSON.stringify(state).slice(0, 1) },
      update: {},
    });
    // The full snapshot lives in a note-like record to keep the schema simple.
    await prisma.note.upsert({
      where: { id: `snapshot-${userId}` },
      create: {
        id: `snapshot-${userId}`,
        userId,
        title: "__snapshot__",
        folder: "__system__",
        content: JSON.stringify(state),
        tags: ["snapshot"],
      },
      update: { content: JSON.stringify(state) },
    });
    return;
  }
  const db = await readDb();
  db.snapshots[userId] = { state, updatedAt: new Date().toISOString() };
  await writeDb(db);
}

export async function loadSnapshot(userId: string) {
  if (hasDatabase && prisma) {
    const record = await prisma.note.findUnique({ where: { id: `snapshot-${userId}` } });
    if (!record) return null;
    try {
      return JSON.parse(record.content) as unknown;
    } catch {
      return null;
    }
  }
  const db = await readDb();
  return db.snapshots[userId]?.state ?? null;
}

/* -------------------------------- groups -------------------------------- */

export async function listGroups(): Promise<StoredGroup[]> {
  if (hasDatabase && prisma) {
    const groups = await prisma.studyGroup.findMany({
      include: { members: { include: { user: { include: { profile: true } } } }, challenges: true },
      orderBy: { createdAt: "desc" },
    });
    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description ?? "",
      level: group.level as Level,
      visibility: group.visibility as "public" | "private",
      code: group.code,
      createdAt: group.createdAt.toISOString(),
      members: group.members.map((member) => ({
        userId: member.userId,
        name: member.user.name ?? "",
        role: member.role as Role,
        xp: member.user.profile?.xp ?? 0,
        streak: member.user.profile?.streak ?? 0,
        level: (member.user.profile?.currentLevel ?? "A1") as Level,
      })),
      challenge: group.challenges[0]
        ? {
            title: group.challenges[0].title,
            goal: group.challenges[0].goal,
            unit: group.challenges[0].unit,
            endsAt: group.challenges[0].endsAt.toISOString(),
            progress: group.challenges[0].progress,
          }
        : undefined,
    }));
  }
  const db = await readDb();
  return db.groups;
}

export async function createGroup(input: {
  name: string;
  description: string;
  level: Level;
  visibility: "public" | "private";
  owner: { userId: string; name: string; level: Level };
}): Promise<StoredGroup> {
  const code = crypto.randomBytes(3).toString("hex").toUpperCase();

  if (hasDatabase && prisma) {
    const group = await prisma.studyGroup.create({
      data: {
        name: input.name,
        description: input.description,
        level: input.level as never,
        visibility: input.visibility,
        code,
        members: { create: { userId: input.owner.userId, role: "TEACHER" as never } },
      },
    });
    return {
      id: group.id,
      name: group.name,
      description: group.description ?? "",
      level: input.level,
      visibility: input.visibility,
      code,
      createdAt: group.createdAt.toISOString(),
      members: [{ userId: input.owner.userId, name: input.owner.name, role: "TEACHER", xp: 0, streak: 0, level: input.owner.level }],
    };
  }

  const db = await readDb();
  const group: StoredGroup = {
    id: createId(),
    name: input.name,
    description: input.description,
    level: input.level,
    visibility: input.visibility,
    code,
    createdAt: new Date().toISOString(),
    members: [{ userId: input.owner.userId, name: input.owner.name, role: "TEACHER", xp: 0, streak: 0, level: input.owner.level }],
  };
  db.groups.unshift(group);
  await writeDb(db);
  return group;
}

export async function joinGroup(code: string, member: { userId: string; name: string; level: Level }) {
  if (hasDatabase && prisma) {
    const group = await prisma.studyGroup.findUnique({ where: { code: code.toUpperCase() } });
    if (!group) return null;
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: group.id, userId: member.userId } },
      create: { groupId: group.id, userId: member.userId },
      update: {},
    });
    return group.id;
  }
  const db = await readDb();
  const group = db.groups.find((item) => item.code === code.toUpperCase());
  if (!group) return null;
  if (!group.members.some((item) => item.userId === member.userId)) {
    group.members.push({ ...member, role: "STUDENT", xp: 0, streak: 0 });
  }
  await writeDb(db);
  return group.id;
}

/* --------------------------------- posts -------------------------------- */

export async function listPosts(category?: string): Promise<StoredPost[]> {
  if (hasDatabase && prisma) {
    const posts = await prisma.post.findMany({
      where: category ? { category } : undefined,
      include: { user: true, comments: { include: { user: true } } },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      take: 50,
    });
    return posts.map((post) => ({
      id: post.id,
      userId: post.userId,
      author: post.user.name ?? "Anonym",
      groupId: post.groupId ?? undefined,
      category: post.category,
      title: post.title,
      body: post.body,
      level: (post.level ?? undefined) as Level | undefined,
      createdAt: post.createdAt.toISOString(),
      comments: post.comments.map((comment) => ({
        id: comment.id,
        author: comment.user.name ?? "Anonym",
        body: comment.body,
        createdAt: comment.createdAt.toISOString(),
      })),
    }));
  }
  const db = await readDb();
  return category ? db.posts.filter((post) => post.category === category) : db.posts;
}

export async function createPost(input: {
  userId: string;
  author: string;
  category: string;
  title: string;
  body: string;
  level?: Level;
}): Promise<StoredPost> {
  if (hasDatabase && prisma) {
    const post = await prisma.post.create({
      data: {
        userId: input.userId,
        category: input.category,
        title: input.title,
        body: input.body,
        level: (input.level ?? null) as never,
      },
    });
    return { ...input, id: post.id, createdAt: post.createdAt.toISOString(), comments: [] };
  }
  const db = await readDb();
  const post: StoredPost = {
    ...input,
    id: createId(),
    createdAt: new Date().toISOString(),
    comments: [],
  };
  db.posts.unshift(post);
  await writeDb(db);
  return post;
}

export async function addComment(postId: string, input: { userId: string; author: string; body: string }) {
  if (hasDatabase && prisma) {
    await prisma.comment.create({ data: { postId, userId: input.userId, body: input.body } });
    return true;
  }
  const db = await readDb();
  const post = db.posts.find((item) => item.id === postId);
  if (!post) return false;
  post.comments.push({
    id: createId(),
    author: input.author,
    body: input.body,
    createdAt: new Date().toISOString(),
  });
  await writeDb(db);
  return true;
}
