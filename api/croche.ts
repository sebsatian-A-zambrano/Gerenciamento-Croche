import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), '/croche_items.json');

function readData() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeData(data: any) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const items = readData();
    res.status(200).json(items);
  } else if (req.method === 'POST') {
    const items = readData();
    const newItem = { id: Date.now(), ...req.body };
    items.push(newItem);
    writeData(items);
    res.status(201).json(newItem);
  } else if (req.method === 'PUT') {
    const items = readData();
    const { id, ...rest } = req.body;
    const idx = items.findIndex((i: any) => i.id === id);
    if (idx === -1) return res.status(404).end();
    items[idx] = { ...items[idx], ...rest };
    writeData(items);
    res.status(200).json(items[idx]);
  } else if (req.method === 'DELETE') {
    const items = readData();
    const { id } = req.body;
    const filtered = items.filter((i: any) => i.id !== id);
    writeData(filtered);
    res.status(200).json({ ok: true });
  } else {
    res.status(405).end();
  }
}
