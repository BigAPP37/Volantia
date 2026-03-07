# Volantia - Control Horario Pro

App progresiva (PWA) para conductores profesionales de transporte en España. Permite registrar jornadas, calcular nóminas con dietas/pernoctas/nocturnidad, y exportar informes PDF.

## Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: Supabase (Auth + PostgreSQL + RLS)
- **Deploy**: Vercel
- **PWA**: vite-plugin-pwa con Workbox

## Desarrollo local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase

# 3. Arrancar dev server
npm run dev
```

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave anon/pública de Supabase |

## Deploy en Vercel

1. Importa el repositorio en [vercel.com](https://vercel.com)
2. Framework preset: **Vite**
3. Añade las variables de entorno en Project Settings → Environment Variables
4. Deploy automático en cada push a `main`

## Estructura del proyecto

```
src/
├── components/     # Componentes UI (dashboard, layout, settings...)
├── hooks/          # Custom hooks (auth, entries, settings, theme...)
├── integrations/   # Supabase client y tipos
├── lib/            # Lógica de negocio (cálculos nómina, utilidades)
├── pages/          # Páginas de la app
└── types/          # TypeScript interfaces
```

## Funcionalidades

- Registro de jornadas con horarios, dietas, pernoctas, nocturnidad, km
- Cálculo automático de nómina neta (IRPF, SS, MEI, desempleo)
- Calendario visual con resumen por día
- Tarifas personalizables (nacionales/internacionales)
- Templates de rutas frecuentes
- Exportación PDF
- Modo invitado (localStorage) + modo autenticado (Supabase)
- PWA instalable
- Tema claro/oscuro

