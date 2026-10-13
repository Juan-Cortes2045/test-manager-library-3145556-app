# test-manager-library-3145556-app

> **Prueba técnica · Ficha ADSO 3145556** — entrega: martes 13 de octubre de 2026, 17:00 (hora Colombia).

Frontend de *Manager Library* en **React 18 + Vite 5** (T-22). Consume la API de `test-manager-library-3145556-api`
según `api-contract.md`.

## Pantallas

| Pantalla | Qué hace | Rol |
|---|---|---|
| Inicio de sesión | `POST /auth/login`; guarda el token en memoria (no en el navegador) | público |
| Catálogo | Búsqueda por título o autor con total de resultados | admin, librarian |
| Socios | Lista y alta de socios | admin, librarian |
| Préstamos | Prestar (1 a 3 libros) y devolver línea a línea | admin, librarian |
| Vencidos | Líneas vencidas con días de retraso | admin, librarian |
| Reporte | Más prestados por rango de fechas | solo admin |

Los mensajes de error que muestra son los `message` en español del cuerpo de error único de la API.

## Uso

```bash
cp .env.example .env          # VITE_API_URL=http://localhost:8000/api/v1
npm ci && npm run dev         # http://localhost:5173
```

O desde `infra`: `docker compose --profile app up --build`.

## Estado

`npm run build` compila sin errores. El recorrido manual de punta a punta (login → prestar → devolver → reporte) que pide T-22
está pendiente de hacerse en el navegador.
