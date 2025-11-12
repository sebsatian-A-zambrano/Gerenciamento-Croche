import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), ".data");
const ITEMS_FILE = path.join(DATA_DIR, "croche-items.json");

interface CrocheItem {
  id: number;
  userId: string;
  name: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

// Asegurar que el directorio existe
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Leer todos los items
export function getCrocheItems(userId: string): CrocheItem[] {
  ensureDataDir();
  try {
    if (!fs.existsSync(ITEMS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(ITEMS_FILE, "utf-8");
    const items = JSON.parse(data);
    // Filtrar items por usuario
    return items.filter((item: any) => item.userId === userId);
  } catch (error) {
    console.error("Error reading items:", error);
    return [];
  }
}

// Crear un nuevo item
export function createCrocheItem(userId: string, item: { name: string; quantity: number; price: number }): CrocheItem {
  ensureDataDir();
  const items = getAllItemsRaw();
  
  const newItem: CrocheItem = {
    id: Math.max(0, ...items.map(i => i.id || 0)) + 1,
    userId,
    name: item.name,
    quantity: item.quantity,
    price: Math.round(item.price * 100), // en centavos
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  items.push(newItem);
  fs.writeFileSync(ITEMS_FILE, JSON.stringify(items, null, 2));
  
  return newItem;
}

// Actualizar un item
export function updateCrocheItem(id: number, userId: string, item: { name?: string; quantity?: number; price?: number }): CrocheItem | null {
  ensureDataDir();
  const items = getAllItemsRaw();
  
  const itemIndex = items.findIndex(i => i.id === id && i.userId === userId);
  if (itemIndex === -1) {
    return null;
  }
  
  const updateData: any = {
    ...items[itemIndex],
    updatedAt: new Date().toISOString(),
  };
  
  if (item.name !== undefined) updateData.name = item.name;
  if (item.quantity !== undefined) updateData.quantity = item.quantity;
  if (item.price !== undefined) updateData.price = Math.round(item.price * 100);
  
  items[itemIndex] = updateData;
  
  fs.writeFileSync(ITEMS_FILE, JSON.stringify(items, null, 2));
  
  return items[itemIndex];
}

// Eliminar un item
export function deleteCrocheItem(id: number, userId: string): boolean {
  ensureDataDir();
  const items = getAllItemsRaw();
  
  const itemIndex = items.findIndex(i => i.id === id && i.userId === userId);
  if (itemIndex === -1) {
    return false;
  }
  
  items.splice(itemIndex, 1);
  fs.writeFileSync(ITEMS_FILE, JSON.stringify(items, null, 2));
  
  return true;
}

// Función auxiliar para leer todos los items sin filtrar por usuario
function getAllItemsRaw(): CrocheItem[] {
  ensureDataDir();
  try {
    if (!fs.existsSync(ITEMS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(ITEMS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading items:", error);
    return [];
  }
}

// Funciones de usuario (no necesarias para JSON, pero las dejamos para compatibilidad)
export async function getDb() {
  return null;
}

export async function upsertUser() {
  // No necesario para JSON
}

export async function getUser() {
  return undefined;
}
