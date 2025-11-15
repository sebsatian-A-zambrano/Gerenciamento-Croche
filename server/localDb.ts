import fs from "fs";
import path from "path";

interface LocalCrocheItem {
  id: number;
  userId: string;
  name: string;
  quantity: number;
  price: number; // stored in centavos
  createdAt?: string;
  updatedAt?: string;
}

const CROCHE_ITEMS_FILE = path.resolve(process.cwd(), "croche_items.json");
let nextId = 1;

function loadCrocheItems(): LocalCrocheItem[] {
  try {
    if (!fs.existsSync(CROCHE_ITEMS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(CROCHE_ITEMS_FILE, "utf-8");
    const items: LocalCrocheItem[] = JSON.parse(data);
    // Update nextId based on existing items
    const maxId = Math.max(...items.map(item => item.id), 0);
    nextId = maxId + 1;
    return items;
  } catch (error) {
    console.error("[LocalDB] Error loading croche items:", error);
    return [];
  }
}

function saveCrocheItems(items: LocalCrocheItem[]): void {
  try {
    fs.writeFileSync(CROCHE_ITEMS_FILE, JSON.stringify(items, null, 2));
  } catch (error) {
    console.error("[LocalDB] Error saving croche items:", error);
  }
}

export function getLocalCrocheItems(userId: string): LocalCrocheItem[] {
  const items = loadCrocheItems();
  return items.filter(item => item.userId === userId);
}

export function createLocalCrocheItem(
  userId: string,
  item: Omit<LocalCrocheItem, "id" | "userId" | "createdAt" | "updatedAt">
): LocalCrocheItem {
  const items = loadCrocheItems();
  const newItem: LocalCrocheItem = {
    id: nextId++,
    userId,
    ...item,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  items.push(newItem);
  saveCrocheItems(items);
  console.log("[LocalDB] Created croche item:", newItem.id, "for user:", userId);
  return newItem;
}

export function updateLocalCrocheItem(
  id: number,
  userId: string,
  updates: Partial<Omit<LocalCrocheItem, "id" | "userId" | "createdAt">>
): LocalCrocheItem | null {
  const items = loadCrocheItems();
  const index = items.findIndex(item => item.id === id && item.userId === userId);
  
  if (index === -1) {
    return null;
  }
  
  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveCrocheItems(items);
  console.log("[LocalDB] Updated croche item:", id, "for user:", userId);
  return items[index];
}

export function deleteLocalCrocheItem(id: number, userId: string): boolean {
  const items = loadCrocheItems();
  const index = items.findIndex(item => item.id === id && item.userId === userId);
  
  if (index === -1) {
    return false;
  }
  
  items.splice(index, 1);
  saveCrocheItems(items);
  console.log("[LocalDB] Deleted croche item:", id, "for user:", userId);
  return true;
}
