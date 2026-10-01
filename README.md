# 🌴 Huecas Manabas – MantaCampus

Plataforma web tipo red social enfocada en estudiantes de Manta (ULEAM), donde pueden descubrir, recomendar y comentar sobre lugares como:

- 🍔 Comida
- 🎬 Cines
- 🏖️ Lugares turísticos
- ⚡ Actividades y experiencias

Incluye sistema de usuarios, roles (admin/moderador), notificaciones y panel de administración.

---

# ⚛️ React + TypeScript + Vite

Este proyecto está construido con **Vite + React + TypeScript**, usando HMR (Hot Module Replacement) y configuración moderna de desarrollo.

---

## 🚀 Tecnologías utilizadas

- ⚛️ React 18+
- ⚡ Vite
- 🟦 TypeScript
- 🎨 CSS personalizado (tema Manta 🌊)
- 💾 LocalStorage (mock backend)
- 🎯 React Router DOM
- 🎭 Lucide Icons

---

## 📦 Plugins oficiales disponibles

- https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react
- https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react-swc
- https://oxc.rs
- https://swc.rs

---

## ⚡ React Compiler (opcional)

https://react.dev/learn/react-compiler/installation

---

## 📁 Estructura del proyecto

```text
src/
│
├── assets/
├── business/
│   └── types/
│
├── data/
│   ├── repositories/
│   └── supabase.ts
│
├── presentation/
│   ├── components/
│   ├── pages/
│   └── routes/
│
├── styles/
├── App.tsx
└── main.tsx
```

---

## 🔐 Autenticación

- Login / Registro
- Persistencia con `localStorage`

```js
localStorage.getItem("user")
localStorage.setItem("app_users", initialUsers)
```

---

## 👥 Roles del sistema

| Rol          | Permisos                       |
| ------------ | ------------------------------ |
| 👤 user      | Ver lugares, comentar, guardar |
| 🛠 moderator | Moderar contenido              |
| 🛡 admin     | Gestión total                  |

---

## 🧭 Rutas principales

- `/` → Home (requiere login)
- `/login` → Iniciar sesión
- `/register` → Registro
- `/admin/users` → Gestión de usuarios
- `/moderacion` → Panel de moderación
- `/perfil` → Perfil de usuario

---

## 🧠 Funcionalidades

### 🏠 Home

- Lista de lugares
- Filtros por categoría
- Búsqueda
- Likes ❤️
- Guardar 📌

### 🗺 Sidebar

- Lugares guardados
- Tendencias
- Mapa de Manta

### ⭐ Reviews

- Crear lugares
- Calificación por estrellas
- Tags: WiFi, pet friendly, etc.

### 💬 Comentarios

- Opiniones de usuarios
- Preguntas y respuestas

### 🔔 Notificaciones

- Dropdown interactivo
- Filtro leídas/no leídas
- Marcar como leídas

### 🛠 Admin Panel

- Gestión de usuarios
- Moderación de contenido
- Estadísticas mock

---

## 🎨 Diseño UI

- Café: `#A75F37`
- Café oscuro: `#8C4B27`
- Azul costa: `#2C6E91`
- Azul claro: `#99D6FF`

---

## ⚙️ Instalación

```bash
git clone <tu-repo>
cd proyecto-arquitectura
npm install
npm run dev
```

---

## 🏗 Build producción

```bash
npm run build
```

---

## 🧪 Linting (Oxlint)

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

---

## ⚠️ Notas importantes

- No usa backend real (solo localStorage)
- Listo para integrar Supabase o una API
- Los datos se reinician al limpiar el navegador

---

## 👨‍💻 Autor

Proyecto académico – ULEAM
Ingeniería en Software