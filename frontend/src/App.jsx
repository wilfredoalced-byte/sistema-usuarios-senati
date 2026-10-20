import { useEffect, useState } from 'react';
import './App.css';
const API = '/api/usuarios';
export default function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  async function cargar() {
    try {
      const respuesta = await fetch(API);
      if (!respuesta.ok) throw new Error('No se pudo cargar usuarios');
      setUsuarios(await respuesta.json());
    } catch (error) {
      setMensaje('No se puede conectar con el backend. ' + error.message);
    }
  }
  useEffect(() => { cargar(); }, []);
  function limpiar() {
    setNombre('');
    setCorreo('');
    setEditando(null);
  }
  async function guardar(evento) {
    evento.preventDefault();
    setMensaje('');
    if (!nombre.trim() || !correo.trim()) {
      setMensaje('Completa nombre y correo');
      return;
    }
    setCargando(true);
    try {
      const url = editando === null ? API : `${API}/${editando}`;
      const respuesta = await fetch(url, {
        method: editando === null ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim(), correo: correo.trim() }),
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || 'Error al guardar');
      limpiar();
      setMensaje('Usuario guardado correctamente');
      await cargar();
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  }
  function editar(usuario) {
    setEditando(usuario.id);
    setNombre(usuario.nombre);
    setCorreo(usuario.correo);
    setMensaje('Editando usuario #' + usuario.id);
  }
  async function eliminar(id) {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      const respuesta = await fetch(`${API}/${id}`, { method: 'DELETE' });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || 'Error al eliminar');
      setMensaje('Usuario eliminado');
      await cargar();
    } catch (error) {
      setMensaje(error.message);
    }
  }
  return (
    <main className="contenedor">
      <header>
        <span className="etiqueta">SENATI · Proyecto Full Stack</span>
        <h1>Sistema de Gestión de Usuarios</h1>
        <p>React + Node.js + Express + SQLite</p>
      </header>
      <section className="panel">
        <h2>{editando === null ? 'Registrar usuario' : 'Editar usuario'}</h2>
        <form onSubmit={guardar}>
          <label>Nombre completo
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="Ej. Ana Pérez" required />
          </label>
          <label>Correo electrónico
            <input type="email" value={correo}
              onChange={e => setCorreo(e.target.value)}
              placeholder="ana@example.com" required />
          </label>
          <div className="acciones">
            <button disabled={cargando} type="submit">
              {cargando ? 'Guardando...' : editando === null ? 'Registrar' : 'Guardar cambios'}
            </button>
            {editando !== null && (
              <button type="button" className="secundario" onClick={limpiar}>
                Cancelar
              </button>
            )}
          </div>
        </form>
        {mensaje && <p role="status" className="mensaje">{mensaje}</p>}
      </section>
      <section className="panel">
        <div className="cabecera-tabla">
          <h2>Usuarios registrados ({usuarios.length})</h2>
          <button type="button" className="secundario" onClick={cargar}>Actualizar</button>
        </div>
        <div className="tabla-scroll">
          <table>
            <thead><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Acciones</th></tr></thead>
            <tbody>
              {usuarios.map(usuario => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.correo}</td>
                  <td>
                    <button type="button" className="secundario"
                      onClick={() => editar(usuario)}>Editar</button>{' '}
                    <button type="button" className="peligro"
                      onClick={() => eliminar(usuario.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr><td colSpan="4">No hay usuarios registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
