import express from 'express';
import path from 'path';
import fs from 'fs';

export function registerCrocheRoutes(app: express.Express) {
  const DATA_PATH = path.resolve(process.cwd(), 'croche_items.json');

  function readData() {
    try {
      const raw = fs.readFileSync(DATA_PATH, 'utf8');
      return JSON.parse(raw);
    } catch (err: any) {
      console.error('[FS] Error leyendo', DATA_PATH, err?.message || err);
      if (err && err.stack) console.error(err.stack);
      return [];
    }
  }

  function writeData(data: any) {
    try {
      fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    } catch (err: any) {
      console.error('[FS] Error escribiendo', DATA_PATH, err?.message || err);
      if (err && err.stack) console.error(err.stack);
      throw err;
    }
  }

  app.get('/api/croche', (req, res) => {
    try {
      const items = readData();
      res.json(items);
    } catch (err: any) {
      console.error('[API] Error GET /api/croche:', err);
      res.status(500).json({ error: 'Error al leer datos', details: err?.message || String(err) });
    }
  });

  app.post('/api/croche', (req, res) => {
    try {
      console.log('[API] POST /api/croche body:', req.body);
      const items = readData();
      const newItem = {
        id: Date.now(),
        name: String(req.body.name),
        quantity: Number(req.body.quantity),
        price: Number(req.body.price)
      };
      items.push(newItem);
      writeData(items);
      console.log('[API] Nuevo material creado:', newItem);
      res.status(201).json(newItem);
    } catch (err: any) {
      console.error('[API] Error POST /api/croche:', err);
      if (err && err.stack) console.error(err.stack);
      res.status(500).json({ error: 'Error al guardar material', details: err?.message || String(err), stack: err?.stack });
    }
  });

  app.put('/api/croche', (req, res) => {
    try {
      const items = readData();
      const { id, ...rest } = req.body;
      const idx = items.findIndex((i: any) => i.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Material no encontrado' });
      items[idx] = { ...items[idx], ...rest };
      writeData(items);
      console.log('[API] Material actualizado:', items[idx]);
      res.json(items[idx]);
    } catch (err: any) {
      console.error('[API] Error PUT /api/croche:', err);
      res.status(500).json({ error: 'Error al actualizar material', details: err?.message || String(err) });
    }
  });

  app.delete('/api/croche', (req, res) => {
    try {
      const items = readData();
      const { id } = req.body;
      const filtered = items.filter((i: any) => i.id !== id);
      writeData(filtered);
      console.log('[API] Material eliminado:', id);
      res.json({ ok: true });
    } catch (err: any) {
      console.error('[API] Error DELETE /api/croche:', err);
      res.status(500).json({ error: 'Error al eliminar material', details: err?.message || String(err) });
    }
  });
}

export default registerCrocheRoutes;
