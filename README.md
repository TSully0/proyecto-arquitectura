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

> **Estado actual:** el proyecto usa **Supabase** como base de datos para los lugares, las reseñas, los favoritos, las **fotos de perfil**, el **seguimiento entre usuarios**, las **cuentas de usuario** (registro, inicio de sesión, contraseña, nombre y rol, sobre la tabla `users`) y toda la parte de **administración y moderación**: **sanciones** (baneos y suspensiones), **historial de moderación**, **notas internas** y **actividad**. Por eso un baneo, una suspensión o una nota hecha desde un navegador vale en cualquier otro navegador o equipo, y una cuenta sancionada con la sesión abierta se desconecta sola. El **chat** también está en Supabase (mensajes y adjuntos en tiempo real entre navegadores). La sesión y algunos avisos de la interfaz todavía se guardan en `localStorage` (consulta [Persistencia de datos](#-persistencia-de-datos)). El panel de moderación de **reseñas** sigue con datos de ejemplo. Migrar la autenticación a Supabase Auth es el siguiente paso del proyecto.

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
- Feed social con reseñas, comentarios y lugares (`FacebookFeed`).
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

#### Registro en 3 pasos
El registro (`RegisterPage.tsx`) se hace en tres pasos, con un indicador de progreso (`RegisterProgress.tsx`, «Paso X de 3»):

| Paso | Nombre | Qué se hace |
|---|---|---|
| 1 | **Cuenta** | Nombre de usuario y correo. Se validan el formato y que ninguno exista ya en la tabla `users` de Supabase. |
| 2 | **Seguridad** | Contraseña, confirmación y aceptación de los **términos y condiciones y la política de privacidad** (`RegisterTerms.tsx`). Al pulsar «Continuar» se valida la contraseña y se genera el código de verificación. **Todavía no se crea la cuenta.** |
| 3 | **Verificar correo** | Código de 6 dígitos (`OtpInput`) con temporizador de reenvío de 5 minutos (`useResendTimer`). Solo cuando el código coincide se crea la cuenta. |

- La cuenta se crea **al final**, cuando ya están todos los datos y el correo está verificado, así no quedan cuentas a medias si el usuario abandona el proceso.
- Si el usuario retrocede desde el paso 3, el código anterior se invalida y se genera uno nuevo al continuar. Al reenviar el código, las casillas se limpian.
- Si al crear la cuenta Supabase responde que el correo o el nombre ya existen, el registro vuelve al paso 1.
- El paso 3 está separado en el componente `RegisterVerifyStep.tsx`, y el botón secundario «Atrás» usa la clase `register-back-btn` (`auth-register.css`).

#### Reglas del registro
- Las pantallas de login, registro y recuperación comparten el mismo fondo y tarjeta mediante `AuthLayout.tsx` (`presentation/layouts/`).
- Validación de nombre (3–30 caracteres), correo y contraseña (8–64 caracteres). La lógica de apoyo está en `registerAccount.ts`.
- Solo se aceptan correos de Gmail, Hotmail, Outlook y Email.com.
- **El registro usa Supabase como fuente de verdad:** el paso 1 comprueba en la tabla `users` que el correo y el nombre no existan (aunque el navegador tenga datos viejos en `localStorage`), y la cuenta se crea primero en Supabase (`registerUserInSupabase`). Solo si eso funciona se guarda la copia local, con el `id` real de la base de datos. Si Supabase no responde, la cuenta no se crea y se muestra un error.

#### Inicio de sesión
- **El inicio de sesión consulta primero Supabase** (`loginWithSupabase`): si la cuenta existe en la tabla `users`, solo vale la contraseña guardada allí, aunque ese navegador tenga una copia local con otra clave. Si la cuenta no existe en Supabase (o no hay conexión), se usa la copia local como respaldo. Se puede entrar con el correo o con el nombre de usuario.
- Al iniciar sesión correctamente se actualiza la copia local con los datos de Supabase (una sola entrada por correo). Las **sanciones se leen siempre de Supabase** (tabla `user_sanctions`) y pisan cualquier copia local: un baneo o una suspensión puesta desde otro navegador bloquea el acceso igual.
- Indicador de fortaleza de contraseña (`PasswordStrengthMeter.tsx`) y servicio `passwordStrength.ts`.
- Protección contra fuerza bruta en el login (`loginGuard.ts`): 5 intentos fallidos consecutivos bloquean el acceso durante 1 minuto, por cuenta y por navegador.
- Avisos claros en el login para cuentas sancionadas o recién liberadas (consulta [Sistema de sanciones](#️-sistema-de-sanciones)).

#### Recuperación de contraseña
`ForgotPasswordPage.tsx` tiene tres etapas, y después pasa a la pantalla de restablecimiento (`ResetPasswordPage.tsx`):

1. **Correo:** el usuario escribe su correo y se comprueba en Supabase que esté registrado.
2. **Código:** se introduce el código de 6 dígitos con `OtpInput`; el reenvío está controlado por `useResendTimer` (cuenta regresiva de 5 minutos).
3. **Verificado:** si el código coincide, se permite continuar a «Cambiar contraseña». La nueva contraseña se guarda en la columna `passwordHash` de `users` (y en la copia local, si existe).

#### Componentes reutilizables del código de verificación
- **`OtpInput.tsx`:** seis casillas individuales, solo números, avance automático, retroceso con Backspace, navegación con flechas y pegado de un código completo. Lo usan el registro y la recuperación de contraseña.
- **`useResendTimer.ts`:** hook con la cuenta regresiva (por defecto `05:00`): `startTimer`, `clearTimer`, `isActive` y `formattedTime`.

#### Sesión
- Contexto de sesión en `AuthContext.tsx` (única fuente de verdad de la sesión). Al abrir la app y al volver a la pestaña, sincroniza el nombre de la sesión con Supabase. Ya no decide los bloqueos: de eso se encarga `accountStatus.ts`, que consulta la base de datos.

> ⚠️ **Limitaciones de seguridad actuales.** Las contraseñas se almacenan codificadas con `btoa` (Base64), que **no es un hash ni cifrado**, y la tabla `users` es legible con la clave pública, por lo que cualquiera con acceso puede verlas. Los códigos de verificación del **registro** y de la **recuperación de contraseña** se generan en el navegador y se muestran en la consola; **no se envían por correo** y cualquiera puede leerlos. Estos flujos sirven para desarrollo y demostración, no como autenticación segura. Para producción debe usarse **Supabase Auth** (o un backend propio) con hash de contraseñas, tokens y envío real de correos.

### 👤 Perfil y comunidad
- **Mi perfil** (`/perfil`): foto, nombre, estadísticas y mis publicaciones (reseñas y comentarios reales de Supabase).
- Los contadores **Seguidores** y **Siguiendo** se pueden pulsar para ver la lista de personas, y la sección **Comunidad** muestra 5 personas con un botón **Ver más**.
- **Perfil público de otras personas** (`/usuario/:id`, `PublicProfilePage`): foto, nombre, correo, rol, fecha de registro, contadores de publicaciones, seguidores y seguidos, y sus reseñas reales. Desde ahí se puede **seguir**, **aceptar o rechazar** su solicitud si ella te la envió, y abrir el chat con el botón **Mensaje**. Solo lee de `users` los datos que muestra (nunca la contraseña). Si el id es el propio, redirige a `/perfil`; si la cuenta no existe o es de un administrador, muestra «Usuario no encontrado».
- **Cómo se llega a un perfil:** tocando el nombre o la foto del autor en las reseñas y comentarios del inicio (`AuthorLink` en `FacebookFeed`), o con el **buscador de personas** del header (`UserSearch`, busca por nombre o por correo desde 2 letras, sin administradores). El botón muestra un punto rojo y un aviso cuando alguien te envió una solicitud de seguimiento.
- Cambio de nombre con validación de formato y una espera de 7 días entre cambios (`nameChange.ts`). El nombre se guarda en Supabase (`users.fullName`), comprobando antes que no lo use otra cuenta, y también se actualiza en las reseñas ya publicadas si las políticas de la tabla `reviews` lo permiten. La fecha del último cambio sigue guardándose en `localStorage`.
- Los demás navegadores con la sesión abierta toman el nombre nuevo al volver a la pestaña (`AuthContext.tsx`), y el login acepta el nombre nuevo y rechaza el anterior.
- Foto de perfil con recorte y compresión de imagen (`imageTools.ts`, `ProfilePhotoModal`). Se sube a Supabase Storage (bucket `profile-photos`) y su URL se guarda en la tabla `profile_photos`, así que otras personas la ven en tu perfil.
- **Seguimiento de usuarios en Supabase** (tabla `follows`, `follow.ts`, hook `useFollows`): el botón Seguir envía una solicitud (`pending`); la otra persona la **acepta o rechaza** desde la sección «Solicitudes de seguimiento» de su perfil (`FollowRequests`) o desde el perfil de quien la envió. Mientras está pendiente se puede cancelar, y una relación aceptada se puede dejar de seguir. Los contadores de seguidores y seguidos cuentan solo las relaciones aceptadas. Se actualiza solo (Realtime, cada 10 s y al volver a la pestaña), así que la solicitud llega a la otra cuenta desde otro navegador o equipo.
- **Comunidad** (`CommunityList`): lista de usuarios reales de Supabase (sin administradores ni uno mismo) con su foto, el botón Seguir y el botón Mensaje, y el nombre enlaza a su perfil.

### 🛡️ Administración (`/admin`)
- **Resumen:** tarjetas con las estadísticas del sistema. La tarjeta «Baneados o suspendidos» es un enlace que abre **Usuarios** ya filtrado por sancionados. Incluye también la tarjeta **Últimas acciones** con los movimientos recientes de moderación (`RecentModerationCard`). Todas las cifras salen de Supabase.
- **Usuarios:** ver todos los usuarios con buscador, filtro por rol y filtro por estado (activos, sancionados, suspendidos, baneados), con contadores. Permite **banear** (permanente), **suspender** (temporal), revertir ambas sanciones y abrir las **notas internas** de cada usuario. La lista sale de Supabase y se actualiza sola (tiempo real, cada 15 s y al volver a la pestaña). Cada acción se guarda primero en la base de datos y, si falla, se muestra el error.
- **Roles:** la lista de usuarios sale de la tabla `users` de Supabase y el cambio de rol entre `user` y `moderator` se guarda en la columna `role` (`MODERATOR` / `STUDENT`). Si la base de datos no confirma el cambio, se muestra un error y la pantalla no se modifica. Los botones son de color (verde para subir, rojo para bajar) y muestran «Guardando...» mientras trabajan. Los administradores no son editables. Incluye:
  - Buscador por nombre o correo.
  - **Filtros por rol:** Todos, Administradores, Moderadores y Usuarios.
  - **Orden:** Nombre A-Z, Nombre Z-A, Más antiguos primero y Más recientes primero. El orden por antigüedad usa la fecha de creación de la cuenta (`createdAt`).
  - El usuario afectado ve su rol nuevo la próxima vez que inicia sesión.
- **Actividad:** ranking de los usuarios más activos y acciones de moderación por moderador, leídos de Supabase (`user_activity` y `moderation_log`). Muestra las columnas Reseñas, Likes, Favoritos, Moderadas, **Seguidores**, **Siguiendo** y Total, con filtros por rol. Seguidores y Siguiendo salen de la tabla `follows` (solo relaciones aceptadas) y **suman al Total**: cada seguidor y cada persona seguida cuenta 1 punto. en pantallas anchas la tabla cabe sin desplazarse y en el celular o en ventanas estrechas (menos de 1100 px) cada persona se muestra como una tarjeta. Las reseñas, likes y favoritos (tipos `review`, `like` y `favorite`) salen de `user_activity`, cargada desde las tablas originales con su fecha real, y las moderadas suman solas desde `moderation_log` (no se duplican en `user_activity`). La pantalla ya no tiene botones de datos de ejemplo ni de borrado: empieza vacía y se llena con la actividad real. Registrar automáticamente las actividades nuevas desde el Home sigue pendiente.
- **Historial:** registro de cada baneo, suspensión y levantamiento de sanción (consulta [Historial de moderación](#-historial-de-moderación)).
- **Informes:** descarga en CSV del listado de usuarios reales y de la actividad (con las columnas Posición, Nombre, Correo, Rol, Reseñas, Likes, Favoritos, Moderadas, Seguidores, Siguiendo y Total), y del informe general en PDF (con un Top 5 por **Puntos**: el mismo total del ranking de Actividad). El botón «Imprimir / Guardar PDF» abre el diálogo de impresión del navegador: hay que elegir «Guardar como PDF» y la carpeta donde guardarlo.
- Al sancionar a una cuenta con sesión abierta, se le avisa en pantalla con el detalle de la sanción y la sesión se cierra automáticamente en cuestión de segundos, aunque el administrador esté en otro navegador o equipo (`accountStatus.ts`, `AccountBlockToast.tsx`).

### 🧑‍⚖️ Moderación (`/moderacion`)
- Panel propio con menú lateral (`layouts/ModeratorLayout`): **Reseñas**, **Usuarios**, **Historial** y **Volver al Home**.
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
- **Jerarquía:** el administrador puede banear y suspender a moderadores y usuarios (no a otros administradores); el moderador solo puede suspender a usuarios con rol `user`; el usuario no puede sancionar a nadie.
- Una suspensión se guarda en Supabase como fecha de vencimiento (`suspendedUntil`) y termina sola; al vencer, la cuenta vuelve a poder iniciar sesión.
- Al intentar iniciar sesión, el usuario sancionado ve un aviso con el motivo y la duración. En una suspensión aparece una **cuenta regresiva** (horas : minutos : segundos); en un baneo, el aviso de bloqueo permanente (`SanctionNotices.tsx`).
- Cuando un administrador o un moderador **quita una sanción**, se pide un motivo **opcional** (`LiftSanctionModal`). El usuario recibe un aviso verde de una sola vez la próxima vez que entra, que indica quién levantó la sanción. Si la suspensión termina sola, también se muestra el aviso de «Suspensión finalizada». El aviso se guarda en la base de datos (`liftedNotice`) y se borra después de mostrarse una vez. Si el usuario tiene abierta la pantalla de login, la tarjeta de la sanción pasa sola al aviso verde.
- **Cierre inmediato de la sesión:** `accountStatus.ts` vigila la cuenta con la sesión abierta. Comprueba la base de datos al abrir la página, escucha Supabase Realtime sobre `user_sanctions` y, como respaldo, consulta cada 5 segundos y al volver a la pestaña. Si la cuenta está baneada o suspendida, se cierra la sesión y se muestra el aviso con el detalle. No cierra la sesión si la consulta falla y ignora las cuentas locales que no existen en Supabase.

### 🕘 Historial de moderación
- Cada baneo, desbaneo, suspensión y suspensión quitada queda registrado en Supabase (tabla `moderation_log`, que solo permite leer y agregar) con **quién lo hizo, su rol, a quién, cuándo y por qué** (`logModeration` en `activity.ts`). Está preparado para registrar también la eliminación y la restauración de reseñas.
- Disponible para administradores (`/admin/history`) y moderadores (`/moderacion/historial`).
- Búsqueda por persona o motivo, filtro por tipo de acción y **filtro por fecha**: todas, hoy, últimos 7 días, últimos 30 días, un día concreto o un mes concreto.
- Muestra cuántas acciones se ven del total y permite **descargar el resultado filtrado en CSV**.

### 📝 Notas internas por usuario
- Admin y moderadores pueden dejar notas sobre un usuario desde su tarjeta (botón **📝 Notas**, con la cantidad de notas). **El usuario nunca las ve.**
- Cada nota se crea con una **etiqueta rápida** (Advertido por chat, Reincidente, Lenguaje ofensivo, Spam, Cuenta sospechosa, Revisar en 7 días u Otro) y un detalle opcional. Con **Otro** el texto es obligatorio.
- Cada nota guarda autor, rol y fecha. Cada persona puede borrar sus propias notas y el administrador puede borrar cualquiera. Las notas viven en la tabla `user_notes`: las ven todos los administradores y moderadores desde cualquier navegador. Se cargan al abrirlas y el contador se actualiza con la lista.
- La lógica está en `userNotes.ts` y guarda todo en Supabase.

### 💬 Chat y notificaciones
- Widget flotante de mensajería (`MessengerWidget`) disponible para `user` y `moderator`; el administrador no lo usa. Los mensajes se guardan en Supabase (tabla `messages`, adjuntos en el bucket `chat-files`, script `supabase_chat_migration.sql`) y llegan en **tiempo real** entre navegadores, con contador de **no leídos**. **Eliminar chat** es solo para quien lo elimina (la otra persona conserva todo y, si le escriben, el chat vuelve con los mensajes nuevos), y cada mensaje se puede eliminar **para mí** o **para todos** (tabla `chat_state` y columna `deleted_for`, script `supabase_chat_delete_migration.sql`). El botón **Mensaje** de un perfil lo abre con esa persona (`openChat.ts`).
- Conversaciones, composición de mensajes (máx. 500 caracteres), adjuntos, vista previa de imágenes y archivos, y enlaces automáticos (`LinkifiedText`).
- Adjuntos del chat: fotos (hasta 8 MB, se reducen antes de subir), vídeos (hasta 2 MB) y documentos PDF, Word, Excel, TXT o CSV (hasta 1 MB). Se suben al bucket `chat-files` y en el mensaje solo se guarda su URL.
- La lista de chats separa **Chats** (conversaciones con mensajes visibles; «tú» siempre primero, para notas propias) y **Otras personas** (para empezar un chat nuevo). El menú de notificaciones (`NotificationsDropdown`) todavía es local.

### ⚡ Rendimiento
- Las páginas de administración y de moderación se cargan **bajo demanda** con `React.lazy` y `Suspense` (`PageLoader.tsx`). Un usuario normal no descarga el código ni los estilos de los paneles.
- Los archivos largos de código y de CSS están divididos en partes de menos de unas 700 líneas para facilitar el mantenimiento.
- La lógica de la verificación por código está separada de las páginas (`OtpInput`, `useResendTimer`, `RegisterVerifyStep`), de modo que `ForgotPasswordPage.tsx` y `RegisterPage.tsx` no concentran toda la interfaz en un solo componente.

### 🌗 Modo claro y oscuro
- Botón de **luna/sol** (`ThemeToggle`) en la cabecera y, flotando arriba a la derecha, en login, registro y recuperación de contraseña.
- El modo se guarda en `localStorage` (`hm-theme`); si no hay elección, se usa el del sistema (`prefers-color-scheme`). Un pequeño script en `index.html` lo aplica antes de pintar la página para evitar parpadeos.
- El modo vive en `<html data-theme="light|dark">`. Las variables de color de cada modo están en `src/styles/theme.css`; los demás CSS usan esas variables (`--surface`, `--line`, `--t-main`, `--text-main`, etc.) en lugar de colores fijos.
- Cada modo tiene sus propias imágenes: **claro** → `manta-dia.jpg` y `uleam-claro.png`; **oscuro** → `manta-noche.jpg` y `uleam-oscuro.png`. El Footer también cambia (crema en claro, oscuro en modo oscuro).

### 📱 Diseño adaptable
Estilos separados por módulo: autenticación, inicio, perfil, chat, administración, moderación y componentes de interfaz reutilizables.

## 🧰 Tecnologías

| Tecnología | Uso |
|---|---|
| React 19 | Construcción de interfaces mediante componentes. |
| TypeScript | Tipado estático del código. |
| Vite | Servidor de desarrollo y compilación. |
| React Router DOM 7 | Navegación y rutas protegidas por rol. |
| Supabase (`@supabase/supabase-js`) | Base de datos PostgreSQL para cuentas, lugares, reseñas, favoritos, seguimientos, mensajes del chat, sanciones, historial, notas y actividad; Storage para fotos y adjuntos; y Realtime para avisar de los cambios. |
| CSS | Estilos y diseño adaptable. |
| Lucide React y React Icons | Iconografía. |
| React Hooks y Context API | Estado y lógica reutilizable de la interfaz. |
| `localStorage` / `sessionStorage` | Copia local de las cuentas, sesión, foto de perfil y avisos temporales. |
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
├── supabase_sanctions_migration.sql # Sanciones, historial, notas, actividad, RLS y Realtime
├── supabase_profile_photos_migration.sql # Tabla profile_photos (fotos de perfil en Storage)
├── supabase_follows_migration.sql   # Tabla follows (seguidores), RLS y Realtime
├── supabase_chat_migration.sql      # Tabla messages, bucket chat-files, RLS y Realtime
├── supabase_chat_delete_migration.sql # Eliminar para mí: columna deleted_for y tabla chat_state
└── src/
    ├── App.tsx
    ├── App.css
    ├── index.css
    ├── main.tsx
    ├── assets/
    │   ├── manta-dia.jpg                 # Fondo de autenticación (modo claro)
    │   ├── manta-noche.jpg               # Fondo de autenticación (modo oscuro)
    │   ├── react.svg
    │   ├── uleam-claro.png               # Logo ULEAM a color (modo claro)
    │   ├── uleam-oscuro.png              # Logo ULEAM blanco (modo oscuro)
    │   └── vite.svg
    ├── business/
    │   ├── services/
    │   │   ├── accountStatus.ts       # Vigila la cuenta con la sesión abierta (Realtime + consulta periódica)
    │   │   ├── imageTools.ts
    │   │   ├── loginGuard.ts
    │   │   ├── loginHelpers.ts        # Apoyo del login (cuenta regresiva, bloqueos)
    │   │   ├── nameChange.ts          # Cambio de nombre (Supabase + espera de 7 días)
    │   │   ├── passwordStrength.ts
    │   │   ├── registerAccount.ts     # Apoyo del registro (copia local, validaciones)
    │   │   ├── registerValidation.ts
    │   │   └── userNotes.ts           # Notas internas del equipo (Supabase)
    │   └── types/
    │       ├── follow.ts
    │       ├── place.ts
    │       ├── profile.ts
    │       └── user.ts
    ├── data/
    │   ├── supabase.ts
    │   ├── api/
    │   └── repositories/
    │       ├── activity.ts            # Actividad, ranking e historial de moderación (Supabase)
    │       ├── follow.ts              # Seguidores y solicitudes contra Supabase (tabla follows)
    │       ├── messages.ts
    │       ├── places.ts
    │       ├── profile.ts
    │       ├── profilePhoto.ts
    │       ├── publicProfile.ts       # Perfil público (datos mínimos) y búsqueda de personas
    │       ├── sanctions.ts           # Baneos y suspensiones (tabla user_sanctions) y su tiempo real
    │       └── users.ts               # Cuentas contra Supabase: login, registro, contraseña, nombre, roles y fecha de creación (createdAt)
    ├── presentation/
    │   ├── auth/
    │   │   └── AuthContext.tsx        # Sesión y sincronización del nombre con Supabase
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
    │   │   │   ├── OtpInput.tsx              # Seis casillas para el código de verificación
    │   │   │   ├── PasswordStrengthMeter.tsx
    │   │   │   ├── RegisterAccountFields.tsx # Registro, paso 1: cuenta
    │   │   │   ├── RegisterProgress.tsx      # Indicador «Paso X de 3»
    │   │   │   ├── RegisterSecurityFields.tsx # Registro, paso 2: seguridad
    │   │   │   ├── RegisterTerms.tsx         # Términos y condiciones y política de privacidad
    │   │   │   ├── RegisterVerifyStep.tsx    # Registro, paso 3: verificar correo
    │   │   │   └── SanctionNotices.tsx       # Avisos de baneo, suspensión y levantamiento
    │   │   ├── chat/
    │   │   │   ├── openChat.ts           # Abre el chat con una persona desde cualquier pantalla
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
    │   │   │   ├── ReviewModal.tsx
    │   │   │   ├── Sidebar.tsx
    │   │   │   └── UserSearch.tsx        # Buscador de personas del header
    │   │   ├── profile/
    │   │   │   ├── CommunityList.tsx
    │   │   │   ├── CommunitySection.tsx
    │   │   │   ├── EditNameModal.tsx
    │   │   │   ├── FollowButton.tsx
    │   │   │   ├── FollowRequests.tsx    # Solicitudes de seguimiento recibidas (aceptar / rechazar)
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
    │   │       ├── ThemeToggle.tsx       # Botón de modo claro/oscuro
    │   │       ├── toast-context.ts
    │   │       ├── ToastProvider.tsx
    │   │       └── UserAvatar.tsx
    │   ├── hooks/
    │   │   ├── useTheme.ts               # Modo claro/oscuro (localStorage + preferencia del sistema)
    │   │   ├── useFollows.ts             # Seguidores, seguidos y solicitudes (Supabase + Realtime)
    │   │   ├── useManagedUsers.ts        # Usuarios con sanciones desde Supabase (Realtime + refresco)
    │   │   ├── useProfilePhoto.ts
    │   │   └── useResendTimer.ts         # Cuenta regresiva (05:00) para reenviar el código
    │   ├── layouts/
    │   │   ├── AdminLayout.tsx          # Menú lateral y contenedor del panel de administración
    │   │   ├── AuthLayout.tsx           # Fondo y tarjeta compartidos por login, registro y recuperación
    │   │   └── ModeratorLayout.tsx      # Menú lateral y contenedor del panel de moderación
    │   ├── pages/
    │   │   ├── HomePage.tsx
    │   │   ├── admin/
    │   │   │   ├── AdminActivityPage.tsx
    │   │   │   ├── AdminHistoryPage.tsx
    │   │   │   ├── AdminOverviewPage.tsx
    │   │   │   ├── AdminReportsPage.tsx
    │   │   │   ├── AdminRolesPage.tsx    # Lista, filtra, ordena y cambia roles contra Supabase
    │   │   │   ├── AdminSections.tsx
    │   │   │   └── AdminUsersPage.tsx
    │   │   ├── profile/
    │   │   │   ├── MyProfilePage.tsx      # Mi perfil (/perfil)
    │   │   │   └── PublicProfilePage.tsx  # Perfil de otra persona (/usuario/:id)
    │   │   ├── auth/
    │   │   │   ├── ForgotPasswordPage.tsx # Recuperación en 3 etapas con OTP
    │   │   │   ├── LoginPage.tsx
    │   │   │   ├── RegisterPage.tsx       # Registro en 3 pasos con verificación OTP
    │   │   │   └── ResetPasswordPage.tsx
    │   │   └── moderation/
    │   │       ├── ModerationPage.tsx
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
        ├── auth/
        │   ├── auth.css                   # Login, recuperación, casillas OTP, temporizador y mensajes
        │   └── auth-register.css          # Registro (incluye el botón secundario «Atrás»)
        ├── chat/
        │   ├── chat.css                   # Índice: importa las partes siguientes
        │   ├── chat-attachments.css
        │   ├── chat-conversation.css
        │   ├── chat-responsive.css
        │   └── chat-widget.css
        ├── home/        (home.css)
        ├── moderation/  (moderation-panel.css, moderation.css)
        ├── profile/     (profile.css, public-profile.css)
        ├── theme.css                      # Variables de color de los modos claro y oscuro y botón de tema
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

> En la base de datos, los roles se almacenan como `STUDENT`, `MODERATOR` y `ADMIN`; la aplicación los traduce a `user`, `moderator` y `admin`. Para crear un administrador hay que cambiarlo directamente en Supabase, por ejemplo: `update public.users set "role" = 'ADMIN' where email = 'correo@hotmail.com';` (desde `/admin/roles` solo se puede subir a moderador y bajar a usuario).

## 🧭 Rutas

Definidas en `src/presentation/routes/AppRouter.tsx`:

| Ruta | Acceso | Página |
|---|---|---|
| `/` | Sesión iniciada (el admin se redirige a `/admin`) | `HomePage` |
| `/login` | Pública | `LoginPage` |
| `/register` | Pública | `RegisterPage` (3 pasos) |
| `/forgot-password` | Pública | `ForgotPasswordPage` |
| `/reset-password` | Pública | `ResetPasswordPage` |
| `/perfil` | `user`, `moderator` | `MyProfilePage` |
| `/usuario/:id` | `user`, `moderator` | `PublicProfilePage` (perfil de otra persona) |
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
4. Ejecuta **una sola vez** `supabase_sanctions_migration.sql`: crea `user_sanctions`, `moderation_log`, `user_notes` y `user_activity`, sus políticas RLS, el permiso de actualizar `users` y activa Realtime para `user_sanctions` y `moderation_log`. Es seguro repetirlo. Sin este script, las sanciones, el historial, las notas y la actividad no funcionan.
5. Ejecuta **una sola vez** `supabase_profile_photos_migration.sql` (tabla `profile_photos`) y comprueba que exista el bucket público `profile-photos` en Storage. Sin eso las fotos de perfil no se guardan.
5b. Ejecuta `supabase_follows_migration.sql`: crea (o ajusta) la tabla `follows` con una sola relación por pareja, borrado en cascada con `users`, RLS abierta para desarrollo y Realtime. Es seguro repetirlo. Sin este script, Seguir, las solicitudes y los contadores no funcionan.
5c. Ejecuta `supabase_chat_migration.sql`: crea la tabla `messages`, el bucket público `chat-files` para los adjuntos, las políticas RLS abiertas para desarrollo y Realtime. Es seguro repetirlo. Sin este script el chat no funciona.
5d. Ejecuta `supabase_chat_delete_migration.sql` (después del anterior): añade la columna `deleted_for` a `messages` y crea la tabla `chat_state`, necesarias para «Eliminar para mí» y «Eliminar chat». Es seguro repetirlo.
6. Comprueba que la tabla `users` tenga políticas RLS de **lectura, inserción y actualización** para el rol `anon`. Sin ellas, el login, el registro, el cambio de contraseña, el cambio de nombre y la gestión de roles fallan sin mostrar un error claro (Supabase rechaza la operación en silencio). Para desarrollo:

```sql
create policy "lectura temporal para pruebas" on public.users for select to anon using (true);
create policy "registro anon" on public.users for insert to anon with check (true);
create policy "actualizar users (prueba)" on public.users for update to anon using (true) with check (true);

-- Opcional: para que el nombre nuevo también se refleje en las reseñas ya publicadas
create policy "actualizar reviews (prueba)" on public.reviews for update to anon using (true) with check (true);
```

7. Comprueba que la tabla `users` tenga la columna `"createdAt"` (fecha de creación de la cuenta). La pantalla **Roles** la consulta para ordenar por antigüedad; si no existe, la lista de usuarios no se carga.

### Tablas

| Tabla | Uso en la aplicación |
|---|---|
| `users` | Fuente de verdad de las cuentas: `email` (único), `passwordHash` (Base64), `fullName`, `role` (`ADMIN` / `MODERATOR` / `STUDENT`), `isActive` y `createdAt` (fecha de registro, usada para ordenar en Roles). Se usa en login, registro, recuperación de contraseña, cambio de nombre y gestión de roles. |
| `categories` | Categorías de lugares. |
| `places` | Lugares y sus calificaciones. |
| `reviews` | Reseñas y comentarios (`rating` puede ser `NULL`). |
| `user_favorites` | Lugares favoritos por usuario. |
| `place_likes` | «Me gusta» en lugares. |
| `follows` | Solicitudes y relaciones de seguimiento: `follower_id` sigue a `following_id`, con `status` `pending` o `accepted`. Una sola fila por pareja y se borra sola si se borra el usuario. |
| `messages` | Mensajes del chat: emisor, receptor, texto (máx. 500), URL de imagen o archivo adjunto, fecha, `read_at` (leído) y `deleted_for` (quiénes lo eliminaron solo para sí). Los adjuntos viven en el bucket `chat-files`. |
| `chat_state` | «Eliminar chat» solo para mí: desde `cleared_at` cada persona ve la conversación; la otra conserva todo. Una fila por pareja (usuario, otra persona). |
| `profile_photos` | URL y ruta en Storage de la foto de perfil de cada usuario. |
| `user_sanctions` | Baneo (`banned`) o suspensión (`suspendedUntil`) de cada usuario, con motivo, categoría y el aviso de levantamiento. Va aparte de `users` para poder activar Realtime sin exponer `passwordHash`. |
| `moderation_log` | Historial de moderación: acción, quién la hizo, a quién, motivo y duración. Solo se puede leer y agregar. |
| `user_notes` | Notas internas del equipo sobre un usuario. |
| `user_activity` | Actividad para el ranking: una fila por acción (`review`, `like` o `favorite`) con el usuario y la fecha. Las acciones de moderación no se guardan aquí, se cuentan desde `moderation_log`. |

> ⚠️ **Seguridad de la base de datos.** Las políticas RLS actuales usan `USING (true)` / `WITH CHECK (true)`, es decir, permiten lectura y escritura abiertas con la clave pública. Esto es útil para desarrollo, pero antes de publicar el proyecto deben restringirse (por ejemplo, con Supabase Auth y políticas basadas en `auth.uid()`). En particular, hoy cualquiera con la clave pública puede leer `passwordHash` y modificar el `role` de cualquier usuario. Además, la clave y la URL de Supabase están escritas directamente en `supabase.ts`: se recomienda moverlas a variables de entorno (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`). La clave pública (*publishable/anon*) está pensada para el navegador, pero nunca se debe incluir la clave `service_role`. Lo mismo vale para las tablas nuevas (`user_sanctions`, `moderation_log`, `user_notes`, `user_activity`, `follows`, `messages` y `chat_state`): cualquiera con la clave pública podría leerlas o modificarlas, así que un baneo no es una protección real hasta que se use Supabase Auth con políticas por rol.

## 💾 Persistencia de datos

| Datos | Dónde se guardan |
|---|---|
| Lugares, reseñas y comentarios | **Supabase** |
| Favoritos | **Supabase** |
| Seguimiento de usuarios y solicitudes | **Supabase** (`follows`) |
| Cuentas: registro, contraseña, nombre, rol y fecha de creación | **Supabase** (tabla `users`), con una copia local en `localStorage` (`app_users`) como respaldo |
| Código de verificación (registro y recuperación) | Solo en la memoria del componente, mientras la página está abierta; se muestra en la consola y no se guarda en ningún almacenamiento |
| Correo de la recuperación en curso | `localStorage` (`reset_email`) |
| Sesión iniciada | `localStorage` (`user`) |
| Sanciones (con avisos de levantamiento) | **Supabase** (`user_sanctions`) |
| Intentos de login | `localStorage` (`login_attempts`) |
| Chat: mensajes, adjuntos y chats eliminados | **Supabase** (`messages`, `chat_state` y Storage `chat-files`) |
| Actividad y ranking | **Supabase** (`user_activity`) |
| **Historial de moderación** | **Supabase** (`moderation_log`) |
| **Notas internas** de usuarios | **Supabase** (`user_notes`) |
| Foto de perfil | **Supabase** (Storage `profile-photos` y tabla `profile_photos`) |
| Fecha del último cambio de nombre | `localStorage` |
| Nota de permisos del moderador cerrada | `localStorage` (`moderator_note_dismissed`) |
| Avisos temporales de la interfaz | `sessionStorage` |

Las cuentas, la contraseña, el nombre, el rol, las sanciones, el historial, las notas y la actividad se comparten entre navegadores y equipos porque la base de datos manda: un baneo, una suspensión o una nota hecha por un administrador se aplica en todos lados. Solo la espera de 7 días del nombre y la sesión siguen en `localStorage` y valen únicamente en ese navegador. Los datos guardados en el navegador tampoco son una fuente confiable de autorización, porque pueden editarse desde las herramientas del navegador.

Dos detalles de la sesión: un usuario con la sesión abierta no ve un cambio de **rol** hasta que cierra sesión y vuelve a entrar (el **nombre** sí se actualiza solo al volver a la pestaña), y si cambia su contraseña desde otro navegador, la sesión ya abierta sigue válida hasta que se cierre. Además, las listas del panel (usuarios, notas, actividad) se refrescan por Realtime, cada 15 segundos y al volver a la pestaña, así que un cambio hecho en otro navegador puede tardar unos segundos en verse.

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

Ejecuta `tsc -b` y luego `vite build`. Debe finalizar sin errores antes de considerar validada la compilación. Un `import` sin usar o un tipo incorrecto rompe la compilación.

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

El proyecto incluye `vercel.json` con una regla de reescritura que envía todas las rutas a `index.html`, necesaria para que React Router funcione al recargar la página en rutas como `/perfil` o `/admin`. Las peticiones de reseñas pasan por `/api`, que `vercel.json` redirige al backend alojado en Render; en desarrollo local esa ruta necesita un proxy o la variable `VITE_API_URL`, porque el navegador bloquea (CORS) las llamadas directas al backend desde `localhost`.

## 🧪 Pruebas recomendadas

Antes de dar por terminado un cambio, comprobar:

- **Modo claro y oscuro:** el botón de luna/sol cambia el modo en login, registro y dentro de la app; el modo se mantiene al recargar y al cerrar sesión; en claro el login usa `manta-dia.jpg` y el Footer el logo a color, y en oscuro `manta-noche.jpg` y el logo blanco; ningún texto queda ilegible (Home, perfil, chat, administración y moderación).
- Registro con datos válidos e inválidos (nombre, dominio de correo, contraseña).
- **Registro en 3 pasos:**
  - El indicador muestra «Paso 1 de 3», «Paso 2 de 3» y «Paso 3 de 3», y la barra avanza.
  - Con un correo o nombre ya registrado, el paso 1 no avanza.
  - En el paso 2, una contraseña débil, distinta de la confirmación o sin aceptar los términos no deja continuar.
  - Al llegar al paso 3 se genera un código y aparece en la consola; con un código incorrecto no se crea la cuenta.
  - Con el código correcto se crea la cuenta (visible en Supabase) y se vuelve al login.
  - Al retroceder desde el paso 3, el código anterior deja de ser válido.
  - El temporizador de 05:00 corre y el botón «Reenviar código» aparece al terminar; al reenviar se limpian las casillas.
  - Las casillas del código aceptan solo números, avanzan solas, permiten Backspace, flechas y pegar un código completo.
- **Registro entre navegadores:** crear una cuenta en un navegador y comprobar que otro la detecta como ya registrada y permite iniciar sesión con ella.
- **Cuenta creada directamente en Supabase (SQL):** debe poder iniciar sesión en la app (la contraseña va en Base64: `encode('clave'::bytea, 'base64')`).
- Indicador de fortaleza de contraseña.
- Inicio y cierre de sesión, y bloqueo tras 5 intentos fallidos.
- Recuperación de contraseña: correo no registrado, código incorrecto, código correcto y restablecimiento; después, que la clave vieja ya no entre en ningún navegador y la nueva sí.
- Cambio de nombre desde el perfil: debe verse en Supabase, en el otro navegador al volver a la pestaña y en el login (el nombre anterior debe dejar de funcionar).
- Redirección por rol y acceso a `/admin` y `/moderacion`; que un usuario normal que entra a `/admin` sea redirigido al inicio.
- Sanciones: baneo (solo admin), suspensión en minutos, horas y días, y reversión con y sin motivo.
- Avisos del login: cuenta regresiva de la suspensión, baneo permanente y aviso verde de sanción levantada.
- Que el moderador vea solo usuarios con rol `user` y no pueda banear.
- Cierre automático de sesión y aviso en pantalla al sancionar una cuenta activa, probado con dos navegadores distintos (el administrador en uno y el usuario en otro).
- Quitar una suspensión a mano: el usuario ve el aviso verde una sola vez, también con la pantalla de login ya abierta.
- Historial: que cada sanción aparezca, los filtros por acción y por fecha (hoy, día y mes) y la descarga del CSV.
- Notas internas: crear con etiqueta, crear con «Otro», borrar las propias, que el moderador no pueda borrar las de otros y que una nota hecha en un navegador aparezca en el otro.
- Informes: el CSV y el PDF traen los mismos usuarios que Supabase.
- Actividad: el ranking coincide con `user_activity` y `moderation_log`; Seguidores y Siguiendo coinciden con los contadores del perfil de cada persona y suman al Total; las columnas del CSV son las del ranking; la tabla no se desplaza de lado en computadora y se ve como tarjetas en el celular.
- Layouts: login, registro y recuperación se ven igual (`AuthLayout`) y los paneles de administración y moderación cargan con su menú lateral.
- Roles: la lista debe coincidir con la tabla `users`; buscador; filtros Todos / Administradores / Moderadores / Usuarios; orden por nombre A-Z, Z-A, más antiguos y más recientes; al subir o bajar de rol, la columna `role` de Supabase debe cambiar y el usuario debe entrar con el rol nuevo.
- Lugares, reseñas, comentarios sin calificación y favoritos contra Supabase.
- **Perfil público:** buscar a alguien con el botón de personas del header y abrir su perfil; tocar el nombre o la foto del autor en una reseña; entrar a tu propio id (debe llevar a `/perfil`); abrir `/usuario/12345` (debe decir «Usuario no encontrado»); comprobar que no se ve el correo de nadie ni aparecen administradores.
- **Seguimiento (con dos cuentas en dos navegadores):** la cuenta A sigue a B y queda «Pendiente»; B ve el punto rojo en el botón de personas y la solicitud en su perfil; B la acepta y a ambos les cambian los contadores (A: Siguiendo +1, B: Seguidores +1); A deja de seguir y los contadores bajan; rechazar y cancelar una solicitud pendiente.
- Comunidad y buscador: aparecen las cuentas reales de Supabase, y el buscador encuentra por nombre y por correo.
- Perfil, cambio de nombre y foto.
- **Chat (con dos cuentas en dos navegadores):** un mensaje enviado por A llega a B sin recargar y aparece el contador rojo de no leídos; foto y documento pequeño; **Eliminar para todos** en un mensaje propio lo borra en las dos cuentas; **Eliminar para mí** solo en la propia; **Eliminar chat** lo saca de la lista de quien lo elimina pero la otra persona lo conserva, y si esta escribe, el chat reaparece solo con los mensajes nuevos.
- **Listas de seguidores:** al pulsar Seguidores o Siguiendo (en tu perfil y en el de otra persona) se abre la lista con foto, nombre y rol, y cada persona enlaza a su perfil. **Comunidad** muestra 5 personas y «Ver más» las despliega.
- Notificaciones.
- Diseño en pantallas pequeñas.
- Manejo de errores y estados de carga.
- Resultado de `npm run build`.

## 🚧 Estado actual y próximos pasos

| Área | Estado |
|---|---|
| React, TypeScript y Vite | Configurados. |
| Organización por capas | Implementada; archivos largos separados y paneles con carga diferida. |
| Supabase: lugares, reseñas, favoritos y fotos de perfil | Conectado y en uso. |
| Perfil público y buscador de personas | Hechos (`/usuario/:id` y botón del header), con contadores, Seguir, aceptar solicitudes y botón Mensaje. |
| Seguimiento de usuarios | En Supabase (`follows`) con solicitudes, aceptar o rechazar, Realtime y contadores reales. |
| Registro de cuentas | En 3 pasos (cuenta, seguridad y verificación del correo); se guarda en Supabase (`users`) solo tras verificar el código. El código se genera en el navegador (falta el envío real por correo). |
| Inicio de sesión | Consulta primero Supabase; contraseñas en Base64 (pendiente migrar a Supabase Auth). |
| Recuperación de contraseña | En 3 etapas con `OtpInput` y `useResendTimer`; actualiza Supabase. El código se genera en el navegador y falta el envío real por correo. |
| Cambio de nombre | En Supabase y en las reseñas; la espera de 7 días sigue en `localStorage`. |
| Gestión de roles (`user` / `moderator`) | En Supabase (`users.role`), con filtros por rol y orden por nombre o antigüedad (`createdAt`). Una sesión ya abierta toma el rol nuevo al volver a iniciar sesión. |
| Sanciones (baneo y suspensión) | En Supabase (`user_sanctions`), con Realtime, avisos en el login y cierre inmediato de la sesión abierta. |
| Historial de moderación | En Supabase (`moderation_log`), con filtros y CSV. |
| Notas internas por usuario | En Supabase (`user_notes`). |
| Panel de moderación de reseñas | Interfaz lista con datos de ejemplo; falta conectarla a `reviews`. |
| Modo claro y oscuro | Hecho: botón de tema, memoria del modo, fondos y logos por modo, y colores del proyecto en variables (`theme.css`). |
| Chat | En Supabase (`messages`, `chat_state`, bucket `chat-files`) con Realtime, no leídos, adjuntos y eliminar chat/mensajes solo para mí. |
| Notificaciones | Locales; sin entrega entre dispositivos. |
| Actividad e informes de administración | En Supabase (`user_activity`, `moderation_log` y `follows`); el ranking incluye Seguidores y Siguiendo, y se adapta al celular; informes en CSV y PDF. El ranking muestra datos reales (reseñas, likes y favoritos cargados desde las tablas originales, más la moderación); las acciones nuevas del Home aún no se registran solas. |
| Políticas RLS | Abiertas (desarrollo); deben restringirse. |
| Pruebas automatizadas | Pendiente. |

### Mejoras previstas

1. Chat: confirmación de lectura visible (✓✓), indicador «escribiendo…» y limitar quién puede escribir (por ejemplo, solo seguidores aceptados).
2. Migrar la autenticación a **Supabase Auth** (hash de contraseñas, sesiones y envío real del código de verificación por correo, tanto en el registro como en la recuperación de contraseña).
3. Mover la espera de 7 días del nombre a Supabase para que valga en todos los dispositivos.
4. Conectar el panel de moderación a las reseñas reales: borrado lógico de reseñas con registro en el historial y restauración (acciones `review_delete` y `review_restore`, ya previstas en el historial).
5. Registrar en el historial los cambios de rol (subir o bajar a moderador).
6. Actualizar el rol de las sesiones abiertas sin cerrar sesión (hoy `AuthContext` solo sincroniza el nombre).
7. Registrar automáticamente la actividad nueva (reseñas, «me gusta» y favoritos) con `logActivity` desde el Home, o con una vista en Supabase que la calcule desde las tablas originales.
8. Restringir las políticas RLS según el usuario autenticado y su rol.
9. Mover la URL y la clave de Supabase a variables de entorno.
10. Migrar las notificaciones a un servicio compartido (por ejemplo, Supabase Realtime) y, junto con RLS, restringir el chat para que solo los dos participantes lean sus mensajes.
11. Añadir pruebas automatizadas (por ejemplo con Vitest para el registro, el login y las sanciones) y mejorar el manejo de errores.
12. Optimizar la carga de imágenes y la accesibilidad, y dividir los archivos más grandes del Home (`FacebookFeed.tsx` y `home.css`).
13. Hacer que el código de verificación caduque (hoy el temporizador solo controla cuándo se puede reenviar, no la validez del código).

## 👨‍💻 Información académica

- **Proyecto:** Huecas Manabas – MantaCampus
- **Institución:** Universidad Laica Eloy Alfaro de Manabí (ULEAM)
- **Área:** Desarrollo de Software / Arquitectura de Software
- **Ubicación:** Manta, Manabí, Ecuador 🇪🇨

---

<p align="center">
  <strong>🌴 MantaCampus — Conectando a la comunidad con lo mejor de Manta.</strong>
</p>