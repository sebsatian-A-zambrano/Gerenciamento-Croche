import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, crocheItems, InsertCrocheItem, CrocheItem } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.


// Croche items queries
export async function getCrocheItems(userId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get croche items: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(crocheItems)
      .where(eq(crocheItems.userId, userId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get croche items:", error);
    return [];
  }
}

export async function createCrocheItem(
  userId: string,
  item: Omit<InsertCrocheItem, "userId">
): Promise<CrocheItem | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create croche item: database not available");
    return null;
  }

  try {
    const priceInCentavos = Math.round(item.price! * 100);
    const result = await db.insert(crocheItems).values({
      ...item,
      userId,
      price: priceInCentavos,
    });

    const created = await db
      .select()
      .from(crocheItems)
      .where(eq(crocheItems.id, result[0].insertId as number))
      .limit(1);

    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create croche item:", error);
    return null;
  }
}

export async function updateCrocheItem(
  id: number,
  userId: string,
  item: Partial<Omit<InsertCrocheItem, "userId">>
): Promise<CrocheItem | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update croche item: database not available");
    return null;
  }

  try {
    const updateData: Record<string, unknown> = {};

    if (item.name !== undefined) updateData.name = item.name;
    if (item.quantity !== undefined) updateData.quantity = item.quantity;
    if (item.price !== undefined) updateData.price = Math.round(item.price * 100);

    await db
      .update(crocheItems)
      .set(updateData)
      .where(eq(crocheItems.id, id));

    const updated = await db
      .select()
      .from(crocheItems)
      .where(eq(crocheItems.id, id))
      .limit(1);

    return updated.length > 0 ? updated[0] : null;
  } catch (error) {
    console.error("[Database] Failed to update croche item:", error);
    return null;
  }
}

export async function deleteCrocheItem(id: number, userId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete croche item: database not available");
    return false;
  }

  try {
    await db
      .delete(crocheItems)
      .where(eq(crocheItems.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete croche item:", error);
    return false;
  }
}

