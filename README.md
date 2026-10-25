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
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white" alt="CSS3" />
</p>

---

## 📖 Descripción

**Huecas Manabas – MantaCampus** es una aplicación web desarrollada con React, TypeScript y Vite. Su objetivo es facilitar el descubrimiento de lugares gastronómicos, turísticos y recreativos de Manta, además de ofrecer funciones sociales para compartir experiencias con la comunidad.

La aplicación incluye módulos de autenticación, perfiles, lugares y reseñas, favoritos, seguimiento de usuarios, mensajería, notificaciones, administración y moderación. El código está organizado por capas para separar la presentación, las reglas de negocio y el acceso a los datos.

> **Estado actual:** el proyecto usa **Supabase** como base de datos para los lugares, las reseñas, los favoritos y el seguimiento de usuarios. Las cuentas, la sesión, los roles, las sanciones, el chat y la actividad administrativa todavía se guardan en `localStorage` (consulta [Persistencia de datos](#-persistencia-de-datos)). Migrar esas partes a Supabase Auth y a tablas compartidas es el siguiente paso del proyecto.

## 🎯 Objetivos

- Promover el descubrimiento de huecas manabas, restaurantes y lugares turísticos.
- Facilitar el intercambio de recomendaciones y experiencias.
- Ofrecer interfaces para publicaciones, comentarios y reseñas.
- Organizar la navegación según los roles de usuario.
- Incorporar herramientas de administración y moderación.
- Mantener una interfaz adaptable a computadoras, tabletas y móviles.
- Facilitar el mantenimiento y la migración progresiva a un backend centralizado.

## ✨ Funcionalidades

### 🏠 Inicio y exploración
- Feed social y tarjetas de lugares (`FacebookFeed`, `PlaceCard`).
- Navegación por categorías (`CategoryNav`).
- Lugares cargados desde Supabase (tabla `places`) con datos locales de respaldo (`initialPlaces`) si la consulta no responde.
- Posibilidad de añadir nuevos lugares desde la página de inicio.
- Secciones para comida típica, entretenimiento, playas, naturaleza, lugares históricos y actividades locales.

### ⭐ Reseñas, comentarios y favoritos
- Reseñas guardadas en Supabase (tabla `reviews`) con calificación de 1 a 5 estrellas.
- Comentarios o preguntas **sin calificación** (opción «No lo he visitado aún»): se guardan con `rating = NULL`. Requiere ejecutar `supabase_reviews_migration.sql`.
- Favoritos por usuario (tabla `user_favorites`).
- Modales de reseña y comentario (`ReviewModal`, `CommentModal`).

### 🔐 Registro, inicio de sesión y recuperación de contraseña
- Registro con validación de nombre (3–30 caracteres), correo y contraseña (8–64 caracteres).
- Solo se aceptan correos de Gmail, Hotmail, Outlook y Email.com.
- Indicador de fortaleza de contraseña (`PasswordStrengthMeter.tsx`) y servicio `passwordStrength.ts`.
- Protección contra fuerza bruta en el login (`loginGuard.ts`): 5 intentos fallidos consecutivos bloquean el acceso durante 1 minuto, por cuenta y por navegador.
- Mensajes específicos cuando la cuenta está baneada o suspendida, con el motivo registrado.
- Recuperación de contraseña en dos pasos: código de verificación de 6 dígitos y pantalla de restablecimiento.
- Al registrarse, la cuenta se guarda en `localStorage` y se intenta sincronizar con la tabla `users` de Supabase; si falla, la cuenta local se conserva.
- Contexto de sesión en `AuthContext.tsx` (única fuente de verdad de la sesión).

> ⚠️ **Limitaciones de seguridad actuales.** Las contraseñas se almacenan codificadas con `btoa` (Base64), que **no es un hash ni cifrado**. El código de recuperación se genera en el navegador y se muestra en la consola; no se envía por correo. Estos flujos sirven para desarrollo y demostración, no como autenticación segura. Para producción debe usarse **Supabase Auth** (o un backend propio) con hash de contraseñas, tokens y envío real de correos.

### 👤 Perfil y comunidad
- Visualización del perfil, estadísticas y publicaciones.
- Cambio de nombre con validación de formato y una espera de 7 días entre cambios (`nameChange.ts`).
- Foto de perfil con recorte y compresión de imagen (`imageTools.ts`, `ProfilePhotoModal`); se guarda localmente como imagen pequeña.
- Seguimiento de usuarios con estado `pending`/aceptado (tabla `follows` de Supabase, `FollowButton`, `useFollows`).
- Secciones de comunidad (`CommunitySection`, `CommunityList`).

### 🛡️ Administración (`/admin`)
- **Resumen**, **Actividad** e **Informes** del sistema.
- **Usuarios**: ver todos los usuarios, filtrar por rol, **banear** (permanente) y **suspender** (temporal), y revertir ambas sanciones.
- **Roles**: cambio de rol entre `user`, `moderator` y `admin`.
- Al sancionar a una cuenta con sesión abierta, esta se cierra automáticamente y se muestra el motivo en el login (`accountStatus.ts`).

### 🧑‍⚖️ Moderación (`/moderacion`)
- Panel propio con menú lateral (`ModeratorLayout`).
- **Panel de moderación**: cola de reseñas con filtros (todas, pendientes, aprobadas), aprobar y eliminar. Actualmente trabaja con datos de ejemplo; todavía no está conectada a las reseñas reales de Supabase.
- **Usuarios** (`/moderacion/usuarios`): reutiliza la pantalla del administrador en modo moderador. El moderador **solo ve usuarios con rol `user`** y **solo puede suspender**; no puede banear ni desbanear.

### ⏱️ Sistema de sanciones
Las sanciones se configuran en `SanctionModal.tsx`:

| Tipo | Quién puede aplicarla | Duración |
|---|---|---|
| Baneo | Administrador | Permanente |
| Suspensión | Administrador y moderador | 1–59 minutos, 1–23 horas o 1–28 días |

- Cada sanción exige un motivo, con categorías predefinidas: *Spam, Contenido sensible, Contenido ilegal, Contenido inapropiado, Publicación improbable, Tema no relacionado* y *Otro*.
- Una suspensión se guarda como fecha de vencimiento (`suspendedUntil`) y termina sola; al vencer, la cuenta vuelve a poder iniciar sesión.
- El estado de las cuentas se comparte entre pestañas del mismo navegador mediante eventos de `localStorage`.

### 💬 Chat y notificaciones
- Widget flotante de mensajería (`MessengerWidget`) disponible para `user` y `moderator`; el administrador no lo usa.
- Conversaciones, composición de mensajes (máx. 500 caracteres), adjuntos, vista previa de imágenes y archivos, y enlaces automáticos (`LinkifiedText`).
- Menú desplegable de notificaciones (`NotificationsDropdown`).
- Los mensajes se guardan en `localStorage`, por lo que **no se sincronizan entre dispositivos ni entre usuarios en equipos distintos**.

### 📱 Diseño adaptable
Estilos separados por módulo: autenticación, inicio, perfil, chat, administración, moderación y componentes de interfaz reutilizables.

## 🧰 Tecnologías

| Tecnología | Uso |
|---|---|
| React 19 | Construcción de interfaces mediante componentes. |
| TypeScript | Tipado estático del código. |
| Vite | Servidor de desarrollo y compilación. |
| React Router DOM 7 | Navegación y rutas protegidas por rol. |
| Supabase (`@supabase/supabase-js`) | Base de datos PostgreSQL para lugares, reseñas, favoritos, seguimientos y espejo de usuarios. |
| CSS | Estilos y diseño adaptable. |
| Lucide React y React Icons | Iconografía. |
| React Hooks y Context API | Estado y lógica reutilizable de la interfaz. |
| `localStorage` / `sessionStorage` | Cuentas, sesión, sanciones, chat, actividad y avisos temporales. |
| oxlint | Análisis estático del código (`npm run lint`). |
| Vercel | Despliegue; `vercel.json` redirige todas las rutas a `index.html` para la SPA. |

## 🏗️ Arquitectura y estructura

El código se organiza en capas y módulos:

```text
├── index.html
├── package.json
├── vite.config.ts
├── vercel.json
├── supabase_schema.sql              # Esquema, políticas RLS y datos semilla
├── supabase_reviews_migration.sql   # Permite reseñas sin calificación
└── src/
    ├── App.tsx
    ├── App.css
    ├── index.css
    ├── main.tsx
    ├── assets/
    │   ├── manta-bg.jpg
    │   ├── react.svg
    │   ├── uleam-alter.png
    │   ├── uleam.png
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
    │   ├── supabase.ts
    │   ├── api/
    │   └── repositories/
    │       ├── activity.ts
    │       ├── follow.ts
    │       ├── followStore.ts
    │       ├── messages.ts
    │       ├── places.ts
    │       ├── profile.ts
    │       ├── profilePhoto.ts
    │       └── users.ts
    ├── presentation/
    │   ├── auth/
    │   │   └── AuthContext.tsx
    │   ├── components/
    │   │   ├── admin/
    │   │   │   ├── admin-utils.ts
    │   │   │   ├── FilterTabs.tsx
    │   │   │   ├── PageHeader.tsx
    │   │   │   ├── RankingTable.tsx
    │   │   │   ├── ReportSheet.tsx
    │   │   │   ├── SanctionModal.tsx
    │   │   │   ├── StatCard.tsx
    │   │   │   └── UserCard.tsx
    │   │   ├── auth/
    │   │   │   ├── PasswordStrengthMeter.tsx
    │   │   │   ├── RegisterAccountFields.tsx
    │   │   │   ├── RegisterActions.tsx
    │   │   │   ├── RegisterProgress.tsx
    │   │   │   ├── RegisterSecurityFields.tsx
    │   │   │   └── RegisterTerms.tsx
    │   │   ├── chat/
    │   │   │   ├── ChatAttachmentPreview.tsx
    │   │   │   ├── ChatBox.tsx
    │   │   │   ├── ChatComposer.tsx
    │   │   │   ├── ChatHeader.tsx
    │   │   │   ├── ChatMediaViewer.tsx
    │   │   │   ├── ChatMessages.tsx
    │   │   │   ├── LinkifiedText.tsx
    │   │   │   └── MessengerWidget.tsx
    │   │   ├── home/
    │   │   │   ├── BrandLogo.tsx
    │   │   │   ├── CategoryNav.tsx
    │   │   │   ├── CommentModal.tsx
    │   │   │   ├── FacebookFeed.tsx
    │   │   │   ├── Footer.tsx
    │   │   │   ├── Header.tsx
    │   │   │   ├── NotificationsDropdown.tsx
    │   │   │   ├── PlaceCard.tsx
    │   │   │   ├── ReviewModal.tsx
    │   │   │   └── Sidebar.tsx
    │   │   ├── profile/
    │   │   │   ├── CommunityList.tsx
    │   │   │   ├── CommunitySection.tsx
    │   │   │   ├── EditNameModal.tsx
    │   │   │   ├── FollowButton.tsx
    │   │   │   ├── index.ts
    │   │   │   ├── PostGrid.tsx
    │   │   │   ├── ProfileAbout.tsx
    │   │   │   ├── ProfileHeader.tsx
    │   │   │   ├── ProfilePhotoModal.tsx
    │   │   │   ├── ProfilePosts.tsx
    │   │   │   ├── ProfileStats.tsx
    │   │   │   └── ProfileTypes.ts
    │   │   └── ui/
    │   │       ├── Avatar.tsx
    │   │       ├── Button.tsx
    │   │       ├── Modal.tsx
    │   │       ├── toast-context.ts
    │   │       ├── ToastProvider.tsx
    │   │       └── UserAvatar.tsx
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
    │   │       ├── ModeratorLayout.tsx
    │   │       └── ModeratorUsersPage.tsx
    │   └── routes/
    │       ├── AppRouter.tsx
    │       ├── index.ts
    │       └── RoleRoute.tsx
    └── styles/
        ├── admin/       (admin-dashboard.css, admin-modal.css, admin-users.css)
        ├── auth/        (auth-register.css, auth.css)
        ├── chat/        (chat.css)
        ├── home/        (home.css)
        ├── moderation/  (moderation-panel.css, moderation.css)
        ├── profile/     (profile.css)
        └── ui/          (avatar.css, footer.css, ui.css)
```

### Responsabilidad de las capas

- **`presentation/`:** páginas, componentes, formularios, layouts, contexto de sesión y navegación.
- **`business/`:** tipos, validaciones y reglas de negocio (contraseñas, registro, sanciones, cambio de nombre, bloqueo de login).
- **`data/`:** cliente de Supabase y repositorios de acceso a datos.
- **`hooks/`:** lógica reutilizable de React.
- **`styles/`:** hojas de estilo globales y por módulo.
- **`assets/`:** imágenes y otros recursos gráficos.

`AppRouter.tsx` define la navegación y `RoleRoute.tsx` aplica las restricciones por rol en el frontend. Estas restricciones mejoran el flujo de la interfaz, pero no reemplazan la autorización del servidor.

## 👥 Roles

| Rol | Valor | Acceso |
|---|---|---|
| Administrador | `admin` | Panel `/admin`: usuarios, roles, actividad e informes; puede banear y suspender. No usa el inicio ni el perfil ni el chat. |
| Moderador | `moderator` | Panel `/moderacion`; puede suspender usuarios con rol `user`. También tiene inicio, perfil y chat. |
| Usuario | `user` | Inicio, perfil, lugares, reseñas, favoritos, seguimiento y chat. |

Al iniciar sesión, cada rol llega a su página principal: `admin` → `/admin`, `moderator` → `/moderacion`, `user` → `/`.

> En la base de datos, los roles se almacenan como `STUDENT`, `MODERATOR` y `ADMIN`; la aplicación los traduce a `user`, `moderator` y `admin`.

## 🧭 Rutas

Definidas en `src/presentation/routes/AppRouter.tsx`:

| Ruta | Acceso | Página |
|---|---|---|
| `/` | Sesión iniciada (el admin se redirige a `/admin`) | `HomePage` |
| `/login` | Pública | `LoginPage` |
| `/register` | Pública | `RegisterPage` |
| `/forgot-password` | Pública | `ForgotPasswordPage` |
| `/reset-password` | Pública | `ResetPasswordPage` |
| `/perfil` | `user`, `moderator` | `MyProfilePage` |
| `/moderacion` | `moderator` | `ModerationPage` |
| `/moderacion/usuarios` | `moderator` | `ModeratorUsersPage` |
| `/admin` | `admin` | `AdminOverviewPage` |
| `/admin/users` | `admin` | `AdminUsersPage` |
| `/admin/roles` | `admin` | `AdminRolesPage` |
| `/admin/activity` | `admin` | `AdminActivityPage` |
| `/admin/reports` | `admin` | `AdminReportsPage` |
| `*` | — | Redirige a la página principal del rol, o a `/login` si no hay sesión. |

## 🗄️ Base de datos (Supabase)

La conexión se configura en `src/data/supabase.ts` mediante `@supabase/supabase-js`. Las tablas se crean con los scripts SQL de la raíz del proyecto.

### Configuración inicial

1. Abre tu proyecto en Supabase → **SQL Editor**.
2. Ejecuta `supabase_schema.sql` (tablas, políticas RLS y datos semilla).
3. Ejecuta **una sola vez** `supabase_reviews_migration.sql` (permite comentarios sin calificación).
4. Verifica que exista la tabla `follows`, usada por el seguimiento de usuarios (`follower_id`, `following_id`, `status`, `created_at`). No está incluida en `supabase_schema.sql`; si no existe en tu proyecto, créala para que el seguimiento funcione.

### Tablas

| Tabla | Uso en la aplicación |
|---|---|
| `users` | Espejo de las cuentas registradas (`email`, `fullName`, `role`, `isActive`). |
| `categories` | Categorías de lugares. |
| `places` | Lugares y sus calificaciones. |
| `reviews` | Reseñas y comentarios (`rating` puede ser `NULL`). |
| `user_favorites` | Lugares favoritos por usuario. |
| `place_likes` | «Me gusta» en lugares. |
| `follows` | Solicitudes y relaciones de seguimiento. |

> ⚠️ **Seguridad de la base de datos.** Las políticas RLS actuales de `supabase_schema.sql` usan `USING (true)` / `WITH CHECK (true)`, es decir, permiten lectura y escritura abiertas con la clave pública. Esto es útil para desarrollo, pero antes de publicar el proyecto deben restringirse (por ejemplo, con Supabase Auth y políticas basadas en `auth.uid()`). Además, la clave y la URL de Supabase están escritas directamente en `supabase.ts`: se recomienda moverlas a variables de entorno (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`). La clave pública (*publishable/anon*) está pensada para el navegador, pero nunca se debe incluir la clave `service_role`.

## 💾 Persistencia de datos

| Datos | Dónde se guardan |
|---|---|
| Lugares, reseñas y comentarios | **Supabase** |
| Favoritos | **Supabase** |
| Seguimiento de usuarios | **Supabase** (con `followStore.ts` como almacén local complementario) |
| Registro de cuentas | `localStorage` (`app_users`) y sincronización a `users` en Supabase |
| Sesión, roles y sanciones | `localStorage` |
| Intentos de login | `localStorage` |
| Chat y mensajes | `localStorage` (`app_messages`) |
| Actividad e informes de administración | `localStorage` (`app_activity`) |
| Foto de perfil y fecha del último cambio de nombre | `localStorage` |
| Avisos temporales de la interfaz | `sessionStorage` |

Mientras las cuentas, los roles y las sanciones vivan en `localStorage`, solo son efectivos en el navegador donde se crearon: **un baneo o una suspensión aplicados por un administrador no afectan a otros equipos**. Los roles guardados en el navegador tampoco son una fuente confiable de autorización.

## ⚙️ Instalación y ejecución

### Requisitos
- Node.js compatible con las dependencias del proyecto (Vite 8 y TypeScript 6).
- npm.
- Git (opcional, para clonar el repositorio).
- Un proyecto de Supabase con los scripts SQL ejecutados.
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

### 4. Compilar

```bash
npm run build
```

Ejecuta `tsc -b` y luego `vite build`. Debe finalizar sin errores antes de considerar validada la compilación.

### 5. Previsualizar la compilación

```bash
npm run preview
```

### 6. Analizar el código (opcional)

```bash
npm run lint
```

### Scripts disponibles

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Comprobación de tipos y compilación de producción. |
| `npm run preview` | Sirve la compilación localmente. |
| `npm run lint` | Ejecuta oxlint. |

## 🚀 Despliegue

El proyecto incluye `vercel.json` con una regla de reescritura que envía todas las rutas a `index.html`, necesaria para que React Router funcione al recargar la página en rutas como `/perfil` o `/admin`.

## 🧪 Pruebas recomendadas

Antes de dar por terminado un cambio, comprobar:

- Registro con datos válidos e inválidos (nombre, dominio de correo, contraseña).
- Indicador de fortaleza de contraseña.
- Inicio y cierre de sesión, y bloqueo tras 5 intentos fallidos.
- Recuperación y restablecimiento de contraseña.
- Redirección por rol y acceso a `/admin` y `/moderacion`.
- Sanciones: baneo (solo admin), suspensión en minutos, horas y días, y reversión.
- Que el moderador vea solo usuarios con rol `user` y no pueda banear.
- Cierre automático de sesión al sancionar una cuenta activa.
- Lugares, reseñas, comentarios sin calificación y favoritos contra Supabase.
- Seguimiento de usuarios.
- Perfil, cambio de nombre y foto.
- Chat y notificaciones.
- Diseño en pantallas pequeñas.
- Manejo de errores y estados de carga.
- Resultado de `npm run build`.

## 🚧 Estado actual y próximos pasos

| Área | Estado |
|---|---|
| React, TypeScript y Vite | Configurados. |
| Organización por capas | Implementada. |
| Supabase: lugares, reseñas, favoritos, seguimiento | Conectado y en uso. |
| Registro de cuentas | Local, con sincronización a Supabase. |
| Autenticación y contraseñas | Local (`btoa`); pendiente migrar a Supabase Auth. |
| Recuperación de contraseña | Código generado en el navegador; falta envío real por correo. |
| Roles y sanciones (baneo y suspensión) | Funcionan en el navegador; falta persistirlos en Supabase. |
| Panel de moderación de reseñas | Interfaz lista con datos de ejemplo; falta conectarla a `reviews`. |
| Chat y notificaciones | Locales; sin entrega entre dispositivos. |
| Actividad e informes de administración | Basados en `localStorage`. |
| Políticas RLS | Abiertas (desarrollo); deben restringirse. |
| Pruebas automatizadas | Pendiente. |

### Mejoras previstas

1. Migrar la autenticación a **Supabase Auth** (hash de contraseñas, sesiones y recuperación por correo).
2. Mover cuentas, roles y sanciones a tablas de Supabase para que apliquen en todos los dispositivos.
3. Conectar el panel de moderación a las reseñas reales (aprobar y eliminar) y registrar las acciones de moderación.
4. Restringir las políticas RLS según el usuario autenticado y su rol.
5. Mover la URL y la clave de Supabase a variables de entorno.
6. Migrar mensajes, notificaciones y actividad a servicios compartidos (por ejemplo, Supabase Realtime).
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