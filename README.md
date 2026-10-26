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

> **Estado actual:** el proyecto usa **Supabase** como base de datos para los lugares, las reseñas, los favoritos y el seguimiento de usuarios. Las cuentas, la sesión, los roles, las sanciones, el historial de moderación, las notas internas, el chat y la actividad administrativa todavía se guardan en `localStorage` (consulta [Persistencia de datos](#-persistencia-de-datos)). Migrar esas partes a Supabase Auth y a tablas compartidas es el siguiente paso del proyecto.

## 🎯 Objetivos

- Promover el descubrimiento de huecas manabas, restaurantes y lugares turísticos.
- Facilitar el intercambio de recomendaciones y experiencias.
- Ofrecer interfaces para publicaciones, comentarios y reseñas.
- Organizar la navegación según los roles de usuario.
- Incorporar herramientas de administración y moderación con trazabilidad de las acciones.
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
- Registro con validación de nombre (3–30 caracteres), correo y contraseña (8–64 caracteres). La lógica de creación de la cuenta está en `registerAccount.ts`.
- Solo se aceptan correos de Gmail, Hotmail, Outlook y Email.com.
- Indicador de fortaleza de contraseña (`PasswordStrengthMeter.tsx`) y servicio `passwordStrength.ts`.
- Protección contra fuerza bruta en el login (`loginGuard.ts`): 5 intentos fallidos consecutivos bloquean el acceso durante 1 minuto, por cuenta y por navegador.
- Avisos claros en el login para cuentas sancionadas o recién liberadas (consulta [Sistema de sanciones](#️-sistema-de-sanciones)).
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
- **Resumen:** tarjetas con las estadísticas del sistema. La tarjeta «Baneados o suspendidos» es un enlace que abre **Usuarios** ya filtrado por sancionados. Incluye también la tarjeta **Últimas acciones** con los movimientos recientes de moderación (`RecentModerationCard`).
- **Usuarios:** ver todos los usuarios con buscador, filtro por rol y filtro por estado (activos, sancionados, suspendidos, baneados), con contadores. Permite **banear** (permanente), **suspender** (temporal), revertir ambas sanciones y abrir las **notas internas** de cada usuario.
- **Roles:** cambio de rol entre `user` y `moderator` con botones de color (verde para subir, rojo para bajar). Incluye buscador por nombre o correo y botones **Todos / Moderadores / Usuarios**. Los administradores no son editables.
- **Actividad:** ranking de los usuarios más activos y acciones de moderación por moderador.
- **Historial:** registro de cada baneo, suspensión y levantamiento de sanción (consulta [Historial de moderación](#-historial-de-moderación)).
- **Informes:** descarga de informes del sistema.
- Al sancionar a una cuenta con sesión abierta, se le avisa en pantalla con el detalle de la sanción y la sesión se cierra automáticamente (`accountStatus.ts`, `AccountBlockToast.tsx`).

### 🧑‍⚖️ Moderación (`/moderacion`)
- Panel propio con menú lateral (`ModeratorLayout`): **Reseñas**, **Usuarios**, **Historial** y **Volver al Home**.
- **Panel de moderación:** cola de reseñas con filtros (todas, pendientes, aprobadas), aprobar y eliminar. Actualmente trabaja con datos de ejemplo; todavía no está conectada a las reseñas reales de Supabase.
- **Usuarios** (`/moderacion/usuarios`): reutiliza la pantalla del administrador en modo moderador. El moderador **solo ve usuarios con rol `user`** y **solo puede suspender**; no puede banear ni desbanear. También puede usar las notas internas.
- **Historial** (`/moderacion/historial`): la misma pantalla de historial que ve el administrador.
- Una nota informativa sobre los permisos del moderador se puede cerrar y no vuelve a aparecer (`moderator_note_dismissed`).

### ⏱️ Sistema de sanciones
Las sanciones se configuran en `SanctionModal.tsx`:

| Tipo | Quién puede aplicarla | Duración |
|---|---|---|
| Baneo | Administrador | Permanente |
| Suspensión | Administrador y moderador | 1–59 minutos, 1–23 horas o 1–28 días |

- Cada sanción exige un motivo, con categorías predefinidas: *Spam, Contenido sensible, Contenido ilegal, Contenido inapropiado, Publicación improbable, Tema no relacionado* y *Otro*.
- Una suspensión se guarda como fecha de vencimiento (`suspendedUntil`) y termina sola; al vencer, la cuenta vuelve a poder iniciar sesión.
- Al intentar iniciar sesión, el usuario sancionado ve un aviso con el motivo y la duración. En una suspensión aparece una **cuenta regresiva** (horas : minutos : segundos); en un baneo, el aviso de bloqueo permanente (`SanctionNotices.tsx`).
- Cuando un administrador o un moderador **quita una sanción**, se pide un motivo **opcional** (`LiftSanctionModal`). El usuario recibe un aviso verde de una sola vez la próxima vez que entra, que indica quién levantó la sanción. Si la suspensión termina sola, también se muestra el aviso de «Suspensión finalizada».
- El estado de las cuentas se comparte entre pestañas del mismo navegador mediante eventos de `localStorage`.

### 🕘 Historial de moderación
- Cada baneo, desbaneo, suspensión y suspensión quitada queda registrado con **quién lo hizo, su rol, a quién, cuándo y por qué** (`logModeration` en `activity.ts`). Está preparado para registrar también la eliminación y la restauración de reseñas.
- Disponible para administradores (`/admin/history`) y moderadores (`/moderacion/historial`).
- Búsqueda por persona o motivo, filtro por tipo de acción y **filtro por fecha**: todas, hoy, últimos 7 días, últimos 30 días, un día concreto o un mes concreto.
- Muestra cuántas acciones se ven del total y permite **descargar el resultado filtrado en CSV**.
- «Borrar actividad» en el panel de administración limpia los datos de ejemplo del ranking, pero **conserva el historial de moderación**.

### 📝 Notas internas por usuario
- Admin y moderadores pueden dejar notas sobre un usuario desde su tarjeta (botón **📝 Notas**, con la cantidad de notas). **El usuario nunca las ve.**
- Cada nota se crea con una **etiqueta rápida** (Advertido por chat, Reincidente, Lenguaje ofensivo, Spam, Cuenta sospechosa, Revisar en 7 días u Otro) y un detalle opcional. Con **Otro** el texto es obligatorio.
- Cada nota guarda autor, rol y fecha. Cada persona puede borrar sus propias notas y el administrador puede borrar cualquiera.
- La lógica está en `userNotes.ts`; al migrar a Supabase solo habrá que cambiar el cuerpo de esas funciones.

### 💬 Chat y notificaciones
- Widget flotante de mensajería (`MessengerWidget`) disponible para `user` y `moderator`; el administrador no lo usa.
- Conversaciones, composición de mensajes (máx. 500 caracteres), adjuntos, vista previa de imágenes y archivos, y enlaces automáticos (`LinkifiedText`).
- Menú desplegable de notificaciones (`NotificationsDropdown`).
- Los mensajes se guardan en `localStorage`, por lo que **no se sincronizan entre dispositivos ni entre usuarios en equipos distintos**.

### ⚡ Rendimiento
- Las páginas de administración y de moderación se cargan **bajo demanda** con `React.lazy` y `Suspense` (`PageLoader.tsx`). Un usuario normal no descarga el código ni los estilos de los paneles.
- Los archivos largos de código y de CSS están divididos en partes de menos de unas 700 líneas para facilitar el mantenimiento.

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
| `localStorage` / `sessionStorage` | Cuentas, sesión, sanciones, historial, notas, chat, actividad y avisos temporales. |
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
    │   │   ├── accountStatus.ts       # Avisos y estado de cuentas sancionadas
    │   │   ├── imageTools.ts
    │   │   ├── loginGuard.ts
    │   │   ├── loginHelpers.ts        # Apoyo del login (cuenta regresiva, bloqueos)
    │   │   ├── nameChange.ts
    │   │   ├── passwordStrength.ts
    │   │   ├── registerAccount.ts     # Creación de la cuenta al registrarse
    │   │   ├── registerValidation.ts
    │   │   └── userNotes.ts           # Notas internas del equipo
    │   └── types/
    │       ├── follow.ts
    │       ├── place.ts
    │       ├── profile.ts
    │       └── user.ts
    ├── data/
    │   ├── supabase.ts
    │   ├── api/
    │   └── repositories/
    │       ├── activity.ts            # Actividad, ranking e historial de moderación
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
    │   │   │   ├── LiftSanctionModal.tsx
    │   │   │   ├── PageHeader.tsx
    │   │   │   ├── RankingTable.tsx
    │   │   │   ├── RecentModerationCard.tsx
    │   │   │   ├── ReportSheet.tsx
    │   │   │   ├── SanctionModal.tsx
    │   │   │   ├── StatCard.tsx
    │   │   │   ├── user-types.ts
    │   │   │   ├── UserCard.tsx
    │   │   │   ├── UserNotesModal.tsx
    │   │   │   └── UsersFilters.tsx
    │   │   ├── auth/
    │   │   │   ├── PasswordStrengthMeter.tsx
    │   │   │   ├── RegisterAccountFields.tsx
    │   │   │   ├── RegisterActions.tsx
    │   │   │   ├── RegisterProgress.tsx
    │   │   │   ├── RegisterSecurityFields.tsx
    │   │   │   ├── RegisterTerms.tsx
    │   │   │   └── SanctionNotices.tsx   # Avisos de baneo, suspensión y levantamiento
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
    │   │       ├── PageLoader.tsx        # Indicador de carga de las páginas lazy
    │   │       ├── toast-context.ts
    │   │       ├── ToastProvider.tsx
    │   │       └── UserAvatar.tsx
    │   ├── hooks/
    │   │   ├── useFollows.ts
    │   │   ├── useManagedUsers.ts        # Usuarios con sanciones (admin y moderador)
    │   │   ├── useMyProfile.ts
    │   │   └── useProfilePhoto.ts
    │   ├── layouts/
    │   ├── pages/
    │   │   ├── HomePage.tsx
    │   │   ├── MyProfilePage.tsx
    │   │   ├── admin/
    │   │   │   ├── AdminActivityPage.tsx
    │   │   │   ├── AdminHistoryPage.tsx
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
    │       ├── AccountBlockToast.tsx     # Aviso en pantalla al ser sancionado
    │       ├── AppRouter.tsx
    │       ├── index.ts
    │       └── RoleRoute.tsx
    └── styles/
        ├── admin/
        │   ├── admin-dashboard.css
        │   ├── admin-history.css
        │   ├── admin-modal.css
        │   ├── admin-users.css            # Índice: importa las partes siguientes
        │   ├── admin-users-extras.css
        │   ├── admin-users-list.css
        │   ├── admin-users-responsive.css
        │   └── admin-users-sanction.css
        ├── auth/        (auth-register.css, auth.css)
        ├── chat/
        │   ├── chat.css                   # Índice: importa las partes siguientes
        │   ├── chat-attachments.css
        │   ├── chat-conversation.css
        │   ├── chat-responsive.css
        │   └── chat-widget.css
        ├── home/        (home.css)
        ├── moderation/  (moderation-panel.css, moderation.css)
        ├── profile/     (profile.css)
        └── ui/          (avatar.css, footer.css, ui.css)
```

### Responsabilidad de las capas

- **`presentation/`:** páginas, componentes, formularios, layouts, contexto de sesión y navegación. Las páginas (`pages/`) contienen solo pantallas; la lógica va en `business/` y en `hooks/`.
- **`business/`:** tipos, validaciones y reglas de negocio (contraseñas, registro, sanciones, notas, cambio de nombre, bloqueo de login).
- **`data/`:** cliente de Supabase y repositorios de acceso a datos.
- **`hooks/`:** lógica reutilizable de React.
- **`styles/`:** hojas de estilo globales y por módulo. Los archivos grandes tienen un archivo índice que importa sus partes.
- **`assets/`:** imágenes y otros recursos gráficos.

`AppRouter.tsx` define la navegación y `RoleRoute.tsx` aplica las restricciones por rol en el frontend. Estas restricciones mejoran el flujo de la interfaz, pero no reemplazan la autorización del servidor.

## 👥 Roles

| Rol | Valor | Acceso |
|---|---|---|
| Administrador | `admin` | Panel `/admin`: resumen, usuarios, roles, actividad, historial e informes; puede banear, suspender y escribir notas. No usa el inicio ni el perfil ni el chat. |
| Moderador | `moderator` | Panel `/moderacion`: reseñas, usuarios (solo `user`, solo suspender), historial y notas. También tiene inicio, perfil y chat. |
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
| `/moderacion/historial` | `moderator` | `AdminHistoryPage` |
| `/admin` | `admin` | `AdminOverviewPage` |
| `/admin/users` | `admin` | `AdminUsersPage` (acepta `?estado=sancionados`, `suspendidos`, `baneados` o `activos`) |
| `/admin/roles` | `admin` | `AdminRolesPage` |
| `/admin/activity` | `admin` | `AdminActivityPage` |
| `/admin/history` | `admin` | `AdminHistoryPage` |
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
| Sesión, roles y sanciones (con avisos de levantamiento) | `localStorage` (`user`, `app_users`) |
| Intentos de login | `localStorage` (`login_attempts`) |
| Chat y mensajes | `localStorage` (`app_messages`) |
| Actividad, ranking e **historial de moderación** | `localStorage` (`app_activity`) |
| **Notas internas** de usuarios | `localStorage` (`app_user_notes`) |
| Foto de perfil y fecha del último cambio de nombre | `localStorage` |
| Nota de permisos del moderador cerrada | `localStorage` (`moderator_note_dismissed`) |
| Avisos temporales de la interfaz | `sessionStorage` |

Mientras las cuentas, los roles, las sanciones, el historial y las notas vivan en `localStorage`, solo son efectivos en el navegador donde se crearon: **un baneo, una suspensión o una nota hecha por un administrador no afectan a otros equipos**. Los datos guardados en el navegador tampoco son una fuente confiable de autorización, porque pueden editarse desde las herramientas del navegador.

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
- Redirección por rol y acceso a `/admin` y `/moderacion`; que un usuario normal que entra a `/admin` sea redirigido al inicio.
- Sanciones: baneo (solo admin), suspensión en minutos, horas y días, y reversión con y sin motivo.
- Avisos del login: cuenta regresiva de la suspensión, baneo permanente y aviso verde de sanción levantada.
- Que el moderador vea solo usuarios con rol `user` y no pueda banear.
- Cierre automático de sesión y aviso en pantalla al sancionar una cuenta activa.
- Historial: que cada sanción aparezca, los filtros por acción y por fecha (hoy, día y mes) y la descarga del CSV.
- Que «Borrar actividad» no elimine el historial de moderación.
- Notas internas: crear con etiqueta, crear con «Otro», borrar las propias y que el moderador no pueda borrar las de otros.
- Roles: buscador y filtros Todos / Moderadores / Usuarios, y subir o bajar de rol.
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
| Organización por capas | Implementada; archivos largos separados y paneles con carga diferida. |
| Supabase: lugares, reseñas, favoritos, seguimiento | Conectado y en uso. |
| Registro de cuentas | Local, con sincronización a Supabase. |
| Autenticación y contraseñas | Local (`btoa`); pendiente migrar a Supabase Auth. |
| Recuperación de contraseña | Código generado en el navegador; falta envío real por correo. |
| Roles y sanciones (baneo y suspensión) | Funcionan en el navegador, con avisos en el login; falta persistirlos en Supabase. |
| Historial de moderación | Funciona en el navegador, con filtros y CSV; falta persistirlo en Supabase. |
| Notas internas por usuario | Funcionan en el navegador; falta persistirlas en Supabase. |
| Panel de moderación de reseñas | Interfaz lista con datos de ejemplo; falta conectarla a `reviews`. |
| Chat y notificaciones | Locales; sin entrega entre dispositivos. |
| Actividad e informes de administración | Basados en `localStorage`; el ranking solo tiene datos reales de moderación hasta que el Home registre la actividad. |
| Políticas RLS | Abiertas (desarrollo); deben restringirse. |
| Pruebas automatizadas | Pendiente. |

### Mejoras previstas

1. Migrar la autenticación a **Supabase Auth** (hash de contraseñas, sesiones y recuperación por correo).
2. Mover cuentas, roles, sanciones, historial y notas a tablas de Supabase para que apliquen en todos los dispositivos.
3. Conectar el panel de moderación a las reseñas reales: borrado lógico de reseñas con registro en el historial y restauración (acciones `review_delete` y `review_restore`, ya previstas en el historial).
4. Registrar en el historial los cambios de rol (subir o bajar a moderador).
5. Registrar la actividad real de los usuarios (publicaciones, comentarios, «me gusta» y seguimientos) con `logActivity` desde el Home, para que el ranking use datos reales.
6. Restringir las políticas RLS según el usuario autenticado y su rol.
7. Mover la URL y la clave de Supabase a variables de entorno.
8. Migrar mensajes, notificaciones y actividad a servicios compartidos (por ejemplo, Supabase Realtime).
9. Añadir pruebas automatizadas (por ejemplo con Vitest para el registro, el login y las sanciones) y mejorar el manejo de errores.
10. Optimizar la carga de imágenes y la accesibilidad, y dividir los archivos más grandes del Home (`FacebookFeed.tsx` y `home.css`).

## 👨‍💻 Información académica

- **Proyecto:** Huecas Manabas – MantaCampus
- **Institución:** Universidad Laica Eloy Alfaro de Manabí (ULEAM)
- **Área:** Desarrollo de Software / Arquitectura de Software
- **Ubicación:** Manta, Manabí, Ecuador 🇪🇨

---

<p align="center">
  <strong>🌴 MantaCampus — Conectando a la comunidad con lo mejor de Manta.</strong>
</p>