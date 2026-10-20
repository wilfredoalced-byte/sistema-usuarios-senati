
const express = require('express');
const db = require('./database');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor SENATI funcionando' });
});

app.get('/api/usuarios', (req, res) => {
  db.all('SELECT * FROM usuarios ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/usuarios', (req, res) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const correo = typeof body.correo === 'string'
    ? body.correo.trim().toLowerCase()
    : '';

  if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return res.status(400).json({
      error: 'Nombre y correo válido son obligatorios'
    });
  }

  db.run(
    'INSERT INTO usuarios (nombre, correo) VALUES (?, ?)',
    [nombre, correo],
    function (err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(409).json({ error: 'Correo ya registrado' });
        }
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({ id: this.lastID, nombre, correo });
    }
  );
});

app.put('/api/usuarios/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const correo = typeof body.correo === 'string'
    ? body.correo.trim().toLowerCase()
    : '';

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    !nombre ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
  ) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  db.run(
    'UPDATE usuarios SET nombre = ?, correo = ? WHERE id = ?',
    [nombre, correo, id],
    function (err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(409).json({ error: 'Correo ya registrado' });
        }
        return res.status(500).json({ error: err.message });
      }
      if (!this.changes) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ id, nombre, correo });
    }
  );
});

app.delete('/api/usuarios/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  db.run('DELETE FROM usuarios WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (!this.changes) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Usuario eliminado' });
  });
});

app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});
