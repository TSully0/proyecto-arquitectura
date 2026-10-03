# 🌴 Huecas Manabas – MantaCampus

Plataforma web tipo red social enfocada en estudiantes de Manta (ULEAM), donde los usuarios pueden descubrir, recomendar y comentar lugares como:

* 🍔 Comida típica y huecas
* 🎬 Cines
* 🏖️ Lugares turísticos
* ⚡ Actividades y experiencias en Manta

Incluye sistema de usuarios, roles (admin / moderador / estudiante), notificaciones, mapa interactivo y panel de administración.

---

## 🚀 Tecnologías utilizadas

### Frontend

* ⚛️ React + TypeScript
* ⚡ Vite
* 🎨 CSS personalizado (UI tipo red social)
* 🎯 Lucide Icons
* 🌍 React Router DOM
* 🧠 Estado con React Hooks (`useState`, `useEffect`)

### Backend

* 🟢 NestJS
* 🟡 TypeScript
* 🧪 Vitest (testing)
* 📦 Node.js

---

## 📁 Estructura del proyecto

```
proyecto-arquitectura/
│
├── frontend (React + Vite)
│   ├── src/
│   │   ├── presentation/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── routes/
│   │   ├── business/
│   │   │   └── types/
│   │   ├── data/
│   │   ├── styles/
│   │   └── main.tsx
│   │
│   └── vite.config.ts
│
├── nestjs (Backend API)
│   ├── src/
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── test/
│
└── README.md
```

---

## 🎯 Funcionalidades principales

### 👤 Sistema de usuarios

* Registro y login
* Recuperación de contraseña (código de verificación y nueva contraseña)
* Roles:
  * `admin`
  * `moderator`
  * `user`
* Rutas protegidas según el rol
* Persistencia con `localStorage` (frontend)

### 🏠 Feed tipo red social

* Publicaciones de lugares en Manta
* Likes ❤️
* Comentarios 💬
* Compartir 🔗
* Guardar 📌
* Filtro por categorías:
  * Inicio
  * Comida
  * Cines
  * Naturaleza
  * Lugares históricos
  * Deportes extremos

### 🗺️ Mapa interactivo

* Ubicaciones destacadas de Manta:
  * Playa Murciélago
  * Mall del Pacífico
  * Tarqui
  * ULEAM
  * Centro de Manta
  * San Mateo
* Cada pin abre Google Maps

### 💬 Sistema de comentarios avanzado

* Comentario normal
* Modal de comentario con:
  * ¿Visitaste el lugar?
  * Calificación por estrellas ⭐
  * Comentarios comunitarios

### 🧑‍💼 Paneles por rol

**Admin**

* Gestión de usuarios
* Gestión de roles
* Acceso al panel general

**Moderador**

* Panel de moderación de reseñas (aprobar / eliminar)
* Acceso rápido a Home y cierre de sesión

### 🔔 Notificaciones

* Notificaciones tipo:
  * Reviews
  * Promociones
  * Actividad de comunidad
* Marcar como leídas

---

## 🧩 Componentes principales (Frontend)

* `Header` → barra superior con búsqueda, usuario y notificaciones
* `Sidebar` → mapa + navegación
* `FacebookFeed` → publicaciones tipo red social
* `PlaceCard` → tarjetas de lugares
* `CommentModal` → comentarios avanzados
* `ReviewModal` → creación de lugares
* `AdminPanelModal` → panel admin/moderador
* `NotificationsDropdown` → sistema de notificaciones
* `CategoryNav` → navegación por categorías
* `Footer` → redes sociales

---

## 🧠 Backend (NestJS)

### Estructura básica

* `AppModule`
* `AppController`
* `AppService`

### Endpoint principal

```ts
GET /
```

Respuesta:

```
Hello World!
```

### Testing

* Configurado con **Vitest**
* Prueba básica del controller incluida

---

## ⚙️ Cómo ejecutar el proyecto

### 🔵 Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

### 🟢 Backend (NestJS)

```bash
cd nestjs
npm install
npm run start:dev
```

---

## 🌐 Mejoras futuras

* Base de datos (PostgreSQL o MongoDB)
* Autenticación JWT
* API real para usuarios y posts
* Subida de imágenes
* Sistema de reportes real
* Chat entre usuarios

---

## 📌 Estado del proyecto

- ✅ Frontend completo con UI tipo red social
- ✅ Sistema de roles básico
- ✅ Feed funcional con posts simulados
- ✅ Comentarios, likes y guardado
- ✅ Mapa interactivo de Manta
- ✅ Recuperación de contraseña (simulada)
- ✅ Backend NestJS inicial funcionando
- ⏳ Base de datos pendiente
- ⏳ API real pendiente

---

## 👨‍💻 Autor

Proyecto académico – ULEAM
Desarrollo de Software / Arquitectura de Software
Manta – Ecuador 🇪🇨
