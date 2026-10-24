# 🌴 Huecas Manabas – MantaCampus

<p align="center">
  <strong>Descubre Manta. Comparte experiencias. Conecta con tu comunidad.</strong>
</p>

<p align="center">
  Plataforma web social para descubrir lugares, compartir reseñas y conectar con la comunidad universitaria y local de Manta, Manabí, Ecuador.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/React_Router-CA4245?logo=reactrouter&logoColor=white" alt="React Router" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white" alt="CSS3" />
</p>

---

## 📖 Descripción

**Huecas Manabas – MantaCampus** es una aplicación web desarrollada con React, TypeScript y Vite. Su objetivo es facilitar el descubrimiento de lugares gastronómicos, turísticos y recreativos de Manta, además de ofrecer funciones sociales para compartir experiencias con la comunidad.

El frontend incluye módulos para autenticación, perfiles, publicaciones y reseñas, mensajería, notificaciones, administración y moderación. La aplicación está organizada por capas para separar la presentación, las reglas de negocio y el acceso a los datos.

> **Estado actual:** el frontend continúa en desarrollo. Algunas funciones utilizan `localStorage` o datos locales de prueba. El backend y la persistencia centralizada en una base de datos todavía deben completarse y verificarse. La existencia de `src/data/supabase.ts` no significa, por sí sola, que Supabase esté conectado o que todos los módulos lo utilicen.

## 🎯 Objetivos

- Promover el descubrimiento de huecas manabas, restaurantes y lugares turísticos.
- Facilitar el intercambio de recomendaciones y experiencias.
- Ofrecer interfaces para publicaciones, comentarios y reseñas.
- Organizar la navegación según los roles de usuario.
- Incorporar herramientas de administración y moderación.
- Mantener una interfaz adaptable a computadoras, tabletas y móviles.
- Facilitar el mantenimiento y la futura integración con un backend y una base de datos.

## ✨ Funcionalidades del frontend

### 🏠 Inicio y exploración
- Feed social y tarjetas de lugares.
- Navegación por categorías.
- Secciones para comida típica, entretenimiento, playas, naturaleza, lugares históricos y actividades locales.
- Referencias a lugares como Playa Murciélago, Mall del Pacífico, Tarqui, ULEAM, Centro de Manta y San Mateo.

### ⭐ Publicaciones, comentarios y reseñas
- Componentes de presentación para publicaciones y lugares.
- Interfaces para comentarios y reseñas.
- Elementos para consultar y compartir experiencias.
- La persistencia y sincronización de estas interacciones dependen de la implementación de cada módulo.

### 🔐 Registro, inicio y recuperación de contraseña
- Páginas de registro e inicio de sesión.
- Validaciones de formularios y reglas para los datos de registro.
- Indicador visual de fortaleza de contraseña mediante `PasswordStrengthMeter.tsx`.
- Flujos de recuperación y restablecimiento de contraseña.
- Contexto de autenticación en `AuthContext.tsx`.

**Importante:** mientras se utilicen mecanismos locales, estos flujos son una implementación de frontend y no equivalen a autenticación segura en un servidor. La recuperación real debe utilizar un servicio de autenticación, tokens seguros y un mecanismo de envío de correo. No se deben almacenar contraseñas en texto plano ni confiar en validaciones exclusivamente del navegador.

### 👤 Perfil y comunidad
- Visualización del perfil.
- Edición del nombre y gestión de la foto de perfil.
- Publicaciones, estadísticas y secciones de comunidad.
- Componentes y hooks para seguir usuarios.

### 🛡️ Administración
El frontend contiene páginas y componentes para organizar:
- Vista general del panel.
- Gestión de usuarios y roles.
- Actividad administrativa.
- Reportes.
- Sanciones y herramientas relacionadas.

La disponibilidad real de cada acción debe verificarse en el código y en las rutas registradas. Las acciones sensibles deben autorizarse en el backend cuando se implemente.

### 🧑‍⚖️ Moderación
- Página de moderación y layout para el rol moderador.
- Estilos específicos para el módulo.
- Organización de la interfaz para revisar contenido y ejecutar las acciones que estén implementadas.

### 💬 Chat y notificaciones
- Componentes para conversaciones, mensajes y composición de mensajes.
- Vista previa de archivos adjuntos y contenido multimedia.
- Presentación de enlaces.
- Componente desplegable de notificaciones.

La entrega de mensajes, las notificaciones entre usuarios y la sincronización entre dispositivos requieren almacenamiento y servicios compartidos; no deben considerarse funciones remotas completas hasta verificar su integración.

### 📱 Diseño adaptable
Los estilos están separados por módulos: autenticación, inicio, perfil, chat, administración, moderación y componentes de interfaz reutilizables.

## 🧰 Tecnologías

| Tecnología | Uso |
|---|---|
| React | Construcción de interfaces mediante componentes. |
| TypeScript | Tipado estático del código. |
| Vite | Servidor de desarrollo y compilación. |
| React Router DOM | Navegación y definición de rutas. |
| CSS | Estilos y diseño adaptable. |
| Lucide React | Iconografía, donde se utiliza. |
| React Hooks y Context API | Estado y lógica reutilizable de la interfaz. |
| `localStorage` | Persistencia local temporal utilizada por algunos módulos. |
| Supabase | Hay un archivo de configuración (`src/data/supabase.ts`); la conexión efectiva debe comprobarse. |

## 🏗️ Arquitectura y estructura

El código se organiza en capas y módulos. La siguiente estructura se basa en el árbol de archivos compartido durante el desarrollo; puede cambiar conforme avance el proyecto.

```text
src/
├── assets/
│   ├── manta-bg.jpg
│   ├── uleam.png
│   ├── uleam-alter.png
│   ├── react.svg
│   └── vite.svg
├── business/
│   ├── services/
│   │   ├── accountStatus.ts
│   │   ├── imageTools.ts
│   │   ├── loginGuard.ts
│   │   ├── nameChange.ts
│   │   ├── passwordStrength.ts
│   │   └── registerValidation.ts
│   └── types/
│       ├── follow.ts
│       ├── place.ts
│       ├── profile.ts
│       └── user.ts
├── data/
│   ├── api/
│   ├── repositories/
│   │   ├── activity.ts
│   │   ├── follow.ts
│   │   ├── followStore.ts
│   │   ├── messages.ts
│   │   ├── places.ts
│   │   ├── profile.ts
│   │   ├── profilePhoto.ts
│   │   └── users.ts
│   └── supabase.ts
├── presentation/
│   ├── auth/
│   │   └── AuthContext.tsx
│   ├── components/
│   │   ├── admin/
│   │   ├── auth/
│   │   │   ├── PasswordStrengthMeter.tsx
│   │   │   ├── RegisterAccountFields.tsx
│   │   │   ├── RegisterActions.tsx
│   │   │   ├── RegisterProgress.tsx
│   │   │   ├── RegisterSecurityFields.tsx
│   │   │   └── RegisterTerms.tsx
│   │   ├── chat/
│   │   ├── home/
│   │   ├── profile/
│   │   └── ui/
│   ├── hooks/
│   │   ├── useFollows.ts
│   │   ├── useMyProfile.ts
│   │   └── useProfilePhoto.ts
│   ├── layouts/
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── MyProfilePage.tsx
│   │   ├── admin/
│   │   │   ├── AdminActivityPage.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── AdminOverviewPage.tsx
│   │   │   ├── AdminReportsPage.tsx
│   │   │   ├── AdminRolesPage.tsx
│   │   │   ├── AdminSections.tsx
│   │   │   └── AdminUsersPage.tsx
│   │   ├── auth/
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   └── moderation/
│   │       ├── ModerationPage.tsx
│   │       └── ModeratorLayout.tsx
│   └── routes/
│       ├── AppRouter.tsx
│       ├── index.ts
│       └── RoleRoute.tsx
├── styles/
│   ├── admin/
│   │   ├── admin-dashboard.css
│   │   ├── admin-modal.css
│   │   └── admin-users.css
│   ├── auth/
│   │   ├── auth-register.css
│   │   └── auth.css
│   ├── chat/
│   │   └── chat.css
│   ├── home/
│   │   └── home.css
│   ├── moderation/
│   │   ├── moderation-panel.css
│   │   └── moderation.css
│   ├── profile/
│   │   └── profile.css
│   └── ui/
│       ├── avatar.css
│       ├── footer.css
│       └── ui.css
├── App.css
├── App.tsx
├── index.css
└── main.tsx
```

### Responsabilidad de las capas

- **`presentation/`:** páginas, componentes, formularios, layouts y navegación.
- **`business/`:** tipos, validaciones y reglas de negocio.
- **`data/`:** repositorios y preparación del acceso a fuentes de datos.
- **`hooks/`:** lógica reutilizable de React.
- **`styles/`:** hojas de estilo globales y por módulo.
- **`assets/`:** imágenes y otros recursos gráficos.

`AppRouter.tsx` define la navegación y `RoleRoute.tsx` permite aplicar restricciones de acceso desde el frontend. Estas restricciones mejoran el flujo de la interfaz, pero no reemplazan la autorización del servidor.

## 👥 Roles previstos

- **Administrador (`admin`):** gestión administrativa, usuarios, roles y reportes, según las funciones habilitadas.
- **Moderador (`moderator`):** revisión y moderación de contenido, según sus permisos.
- **Usuario (`user`):** exploración de lugares y participación en las funciones comunitarias disponibles.

Los roles guardados en el navegador no son una fuente confiable de autorización. El backend debe comprobar la identidad y los permisos de cada operación protegida.

## 🧭 Rutas

Las rutas exactas deben confirmarse en `src/presentation/routes/AppRouter.tsx`. El proyecto contiene páginas para los siguientes flujos:

| Página o flujo | Archivo relacionado |
|---|---|
| Inicio | `presentation/pages/HomePage.tsx` |
| Inicio de sesión | `presentation/pages/auth/LoginPage.tsx` |
| Registro | `presentation/pages/auth/RegisterPage.tsx` |
| Recuperación de contraseña | `presentation/pages/auth/ForgotPasswordPage.tsx` |
| Restablecimiento de contraseña | `presentation/pages/auth/ResetPasswordPage.tsx` |
| Perfil | `presentation/pages/MyProfilePage.tsx` |
| Administración | `presentation/pages/admin/` |
| Moderación | `presentation/pages/moderation/` |

La existencia de una página no garantiza que una URL concreta esté registrada ni que todas sus operaciones estén conectadas a servicios remotos.

## ⚙️ Instalación y ejecución

### Requisitos
- Node.js compatible con las dependencias del proyecto.
- npm.
- Git (opcional, para clonar el repositorio).
- Un editor como Visual Studio Code.

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd proyecto-arquitectura
```

Reemplaza `<URL_DEL_REPOSITORIO>` por la dirección real del repositorio.

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre la dirección local que muestre Vite en la terminal (normalmente `http://localhost:5173`).

### 4. Comprobar y compilar

```bash
npm run build
```

Según la configuración compartida del proyecto, este comando ejecuta `tsc -b` y luego `vite build`. Debe finalizar correctamente antes de considerar validada la compilación.

### 5. Previsualizar la compilación

```bash
npm run preview
```

## 🧪 Pruebas recomendadas

Antes de dar por terminado un cambio, comprobar:

- Registro con datos válidos e inválidos.
- Validación de correo y contraseña.
- Indicador de fortaleza de contraseña.
- Inicio y cierre de sesión.
- Recuperación y restablecimiento de contraseña.
- Navegación entre páginas públicas y privadas.
- Acceso a las áreas de administración y moderación según el rol.
- Gestión de usuarios, roles y sanciones.
- Perfil, fotografías y seguimiento de usuarios.
- Publicaciones, comentarios y reseñas.
- Chat y notificaciones.
- Diseño en pantallas pequeñas.
- Manejo de errores y estados de carga.
- Resultado de `npm run build`.

No se incluye aquí un resultado de compilación actual: ejecuta el comando después de tus últimos cambios para verificar el estado real del proyecto.

## 🚧 Estado actual y próximos pasos

| Área | Estado que puede afirmarse a partir de la estructura compartida |
|---|---|
| React, TypeScript y Vite | Configurados en el proyecto. |
| Organización por capas | Estructura de carpetas implementada. |
| Autenticación y formularios | Existen páginas, componentes y contexto; la seguridad depende de la implementación. |
| Fortaleza de contraseña | Existe servicio y componente visual. |
| Administración y moderación | Existen páginas, componentes y estilos; se deben probar las acciones y rutas. |
| Persistencia local | Algunos módulos utilizan `localStorage` o repositorios locales. |
| Supabase | Existe `src/data/supabase.ts`; falta confirmar la conexión efectiva y su uso por los módulos. |
| Backend y base de datos centralizada | Pendiente de completar y verificar. |
| Autorización segura en el servidor | Necesaria para proteger operaciones sensibles. |

### Mejoras previstas

1. Verificar el estado de compilación y corregir errores.
2. Definir el modelo de datos y la estrategia de autenticación.
3. Conectar los repositorios a Supabase o al backend que se elija.
4. Migrar progresivamente la persistencia desde `localStorage` hacia servicios compartidos.
5. Implementar recuperación de contraseña mediante un flujo seguro.
6. Validar roles y permisos en el servidor.
7. Añadir pruebas automatizadas y mejorar el manejo de errores.
8. Optimizar carga de imágenes, accesibilidad y división del código.

## 👨‍💻 Información académica

- **Proyecto:** Huecas Manabas – MantaCampus
- **Institución:** Universidad Laica Eloy Alfaro de Manabí (ULEAM)
- **Área:** Desarrollo de Software / Arquitectura de Software
- **Ubicación:** Manta, Manabí, Ecuador 🇪🇨

---

<p align="center">
  <strong>🌴 MantaCampus — Conectando a la comunidad con lo mejor de Manta.</strong>
</p>
