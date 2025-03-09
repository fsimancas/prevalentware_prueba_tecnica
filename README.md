# Sistema de Gestión de Ingresos y Egresos

Este proyecto es una aplicación web para la gestión de ingresos y egresos, con roles de administrador y usuario.

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm o yarn
- Base de datos PostgreSQL

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/fsimancas/prueba_tecnica_prevalent
cd nombre-del-proyecto
```

2. Instalar dependencias:
```bash
npm install
# o
yarn install
```

3. Configurar variables de entorno:
   - Crear archivo `.env` en la raíz del proyecto
   - Copiar el contenido de `.env.example`
   - Actualizar las variables con tus configuraciones

4. Ejecutar migraciones de la base de datos:
```bash
npx prisma migrate dev
```

5. Iniciar el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:3000`

## Credenciales de Acceso

### Administrador
- Email: admin@gmail.com
- Contraseña: 123456

### Usuario Regular
- Email: user@gmail.com
- Contraseña: 123456

## Funcionalidades

- **Panel de Control**: Vista general de estadísticas y movimientos recientes
- **Gestión de Usuarios** (solo administrador):
  - Crear, ver y gestionar usuarios
  - Asignar roles
- **Gestión de Movimientos**:
  - Registrar ingresos y egresos
  - Filtrar por fecha, monto y concepto
  - Paginación de resultados (8 por página)
- **Reportes y Estadísticas**:
  - Gráficos de movimientos mensuales
  - Totales de ingresos y egresos
  - Balance general

## Tecnologías Utilizadas

- Next.js 14
- TypeScript
- Prisma ORM
- PostgreSQL
- TailwindCSS
- NextAuth.js
- Chart.js

## Estructura del Proyecto

```
/
├── app/                # Rutas y páginas de Next.js
├── components/         # Componentes reutilizables
├── lib/               # Utilidades y configuraciones
├── prisma/            # Esquema y migraciones de la base de datos
└── public/            # Archivos estáticos
```
