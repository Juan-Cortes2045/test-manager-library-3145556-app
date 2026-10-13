import { useEffect, useState } from 'react';
import { api } from './api.js';

const today = () => new Date().toISOString().slice(0, 10);

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try { onLogin(await api('/auth/login', { method: 'POST', body: { username, password } })); }
    catch (err) { setError(err.message); }
  };
  return (
    <form className="card narrow" onSubmit={submit}>
      <h1>Manager Library</h1>
      <label>Usuario<input value={username} onChange={(e) => setUsername(e.target.value)} required /></label>
      <label>Clave<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
      {error && <p className="error">{error}</p>}
      <button>Iniciar sesión</button>
    </form>
  );
}

function Catalog({ token }) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(null);
  const load = async () => setPage(await api(`/books?size=20&q=${encodeURIComponent(q)}`, { token }));
  useEffect(() => { load(); }, []);
  return (
    <section>
      <h2>Catálogo</h2>
      <form className="row" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <input placeholder="Título o autor" value={q} onChange={(e) => setQ(e.target.value)} /><button>Buscar</button>
      </form>
      {page && <p className="muted">{page.total} resultados</p>}
      <table><thead><tr><th>Título</th><th>Autor</th><th>Categoría</th><th>Disponibles</th><th>Id</th></tr></thead>
        <tbody>{page?.items.map((b) => (
          <tr key={b.id}><td>{b.title}</td><td>{b.author}</td><td>{b.category.name}</td><td>{b.available_copies}/{b.total_copies}</td><td className="id">{b.id}</td></tr>
        ))}</tbody></table>
    </section>
  );
}

function Members({ token }) {
  const [page, setPage] = useState(null);
  const [form, setForm] = useState({ full_name: '', document_number: '' });
  const [msg, setMsg] = useState('');
  const load = async () => setPage(await api('/members?size=50', { token }));
  useEffect(() => { load(); }, []);
  const create = async (e) => {
    e.preventDefault();
    try { await api('/members', { method: 'POST', token, body: form }); setMsg('Socio creado.'); load(); }
    catch (err) { setMsg(err.message); }
  };
  return (
    <section>
      <h2>Socios</h2>
      <form className="row" onSubmit={create}>
        <input placeholder="Nombre" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        <input placeholder="Documento" value={form.document_number} onChange={(e) => setForm({ ...form, document_number: e.target.value })} required />
        <button>Crear</button>
      </form>
      {msg && <p className="muted">{msg}</p>}
      <table><thead><tr><th>Nombre</th><th>Documento</th><th>Id</th></tr></thead>
        <tbody>{page?.items.map((m) => <tr key={m.id}><td>{m.full_name}</td><td>{m.document_number}</td><td className="id">{m.id}</td></tr>)}</tbody></table>
    </section>
  );
}

function Loans({ token }) {
  const [memberId, setMemberId] = useState('');
  const [bookIds, setBookIds] = useState('');
  const [msg, setMsg] = useState('');
  const [loans, setLoans] = useState(null);
  const load = async () => setLoans(await api('/loans?size=20', { token }));
  useEffect(() => { load(); }, []);
  const lend = async (e) => {
    e.preventDefault();
    const items = bookIds.split(/[\s,]+/).filter(Boolean).map((book_id) => ({ book_id }));
    try { const loan = await api('/loans', { method: 'POST', token, body: { member_id: memberId, items } }); setMsg(`Préstamo registrado (${loan.status}).`); load(); }
    catch (err) { setMsg(err.message); }
  };
  const giveBack = async (loanId, itemId) => {
    try { await api(`/loans/${loanId}/items/${itemId}/return`, { method: 'POST', token }); setMsg('Devolución registrada.'); load(); }
    catch (err) { setMsg(err.message); }
  };
  return (
    <section>
      <h2>Prestar y devolver</h2>
      <form className="row" onSubmit={lend}>
        <input placeholder="Id del socio" value={memberId} onChange={(e) => setMemberId(e.target.value)} required />
        <input placeholder="Ids de libros (1 a 3, separados por coma)" value={bookIds} onChange={(e) => setBookIds(e.target.value)} required />
        <button>Prestar</button>
      </form>
      {msg && <p className="muted">{msg}</p>}
      <table><thead><tr><th>Fecha</th><th>Estado</th><th>Libro</th><th>Vence</th><th></th></tr></thead>
        <tbody>{loans?.items.flatMap((l) => l.items.map((i) => (
          <tr key={i.id}><td>{l.loaned_at.slice(0, 10)}</td><td>{l.status}</td><td>{i.book_title}</td><td>{i.due_at.slice(0, 10)}</td>
            <td>{i.returned_at ? 'Devuelto' : <button onClick={() => giveBack(l.id, i.id)}>Devolver</button>}</td></tr>
        )))}</tbody></table>
    </section>
  );
}

function Overdue({ token }) {
  const [rows, setRows] = useState(null);
  useEffect(() => { api('/loans/overdue', { token }).then((d) => setRows(d.items)); }, []);
  return (
    <section>
      <h2>Vencidos</h2>
      {rows?.length === 0 && <p className="muted">No hay libros vencidos.</p>}
      <table><thead><tr><th>Libro</th><th>Socio</th><th>Vencía</th><th>Días de retraso</th></tr></thead>
        <tbody>{rows?.map((r) => <tr key={r.item_id}><td>{r.book_title}</td><td>{r.member_name}</td><td>{r.due_at.slice(0, 10)}</td><td>{r.days_late}</td></tr>)}</tbody></table>
    </section>
  );
}

function Report({ token }) {
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState('');
  const load = async (e) => {
    e?.preventDefault();
    try { setData(await api(`/reports/most-borrowed?from=${from}&to=${to}`, { token })); setMsg(''); }
    catch (err) { setMsg(err.message); }
  };
  return (
    <section>
      <h2>Más prestados</h2>
      <form className="row" onSubmit={load}>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button>Consultar</button>
      </form>
      {msg && <p className="error">{msg}</p>}
      <table><thead><tr><th>Libro</th><th>Categoría</th><th>Veces</th></tr></thead>
        <tbody>{data?.rows.map((r) => <tr key={r.book_id + r.book_title + r.category_name}><td>{r.book_title}</td><td>{r.category_name}</td><td>{r.times_borrowed}</td></tr>)}</tbody></table>
    </section>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState('catalog');
  if (!session) return <main className="wrap"><Login onLogin={setSession} /></main>;
  const token = session.access_token;
  const tabs = [['catalog', 'Catálogo'], ['members', 'Socios'], ['loans', 'Préstamos'], ['overdue', 'Vencidos'],
    ...(session.role === 'admin' ? [['report', 'Reporte']] : [])];
  return (
    <main className="wrap">
      <nav>{tabs.map(([id, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}
        <span className="muted">Rol: {session.role}</span><button onClick={() => setSession(null)}>Salir</button></nav>
      {tab === 'catalog' && <Catalog token={token} />}
      {tab === 'members' && <Members token={token} />}
      {tab === 'loans' && <Loans token={token} />}
      {tab === 'overdue' && <Overdue token={token} />}
      {tab === 'report' && <Report token={token} />}
    </main>
  );
}
