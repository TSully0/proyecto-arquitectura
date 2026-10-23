# 🌴 Huecas Manabas – MantaCampus

<p align="center">
  <strong>Descubre Manta. Comparte experiencias. Conecta con tu comunidad.</strong>
</p>

<p align="center">
  Plataforma web social para descubrir lugares, compartir reseñas y conectar con la comunidad universitaria de Manta, Ecuador.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/React_Router-CA4245?logo=reactrouter&logoColor=white" alt="React Router" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/Frontend-Web-orange" alt="Frontend" />
</p>

---

## 📖 Descripción

**Huecas Manabas – MantaCampus** es una aplicación web desarrollada con React, TypeScript y Vite, orientada al descubrimiento de lugares gastronómicos, turísticos y recreativos de Manta, Manabí, Ecuador.

La plataforma busca conectar a la comunidad universitaria y local mediante una experiencia social en la que los usuarios pueden explorar lugares, consultar publicaciones, compartir reseñas y acceder a distintas funcionalidades comunitarias.

El frontend incorpora módulos de autenticación, perfiles de usuario, mensajería, notificaciones, moderación de contenido y administración de cuentas.

La arquitectura organiza el código en capas de presentación, negocio y datos, separando las interfaces visuales, las reglas de negocio y los mecanismos de acceso a la información.

**Tipo de proyecto:** aplicación web frontend.

## 🎯 Objetivos

- Promover el descubrimiento de huecas manabas, restaurantes y lugares turísticos.
- Facilitar el intercambio de recomendaciones y experiencias.
- Proporcionar funcionalidades sociales para publicaciones, comentarios y reseñas.
- Gestionar la navegación de acuerdo con los roles de usuario.
- Incorporar herramientas de administración y moderación.
- Ofrecer una interfaz adaptable a computadoras, tabletas y dispositivos móviles.
- Mantener una arquitectura modular que facilite el mantenimiento y la integración con servicios externos.

---

## ✨ Funcionalidades

### 🏠 1. Inicio y feed social

- Visualización de publicaciones sobre lugares y experiencias.
- Presentación de lugares mediante tarjetas informativas.
- Navegación por categorías.
- Acceso a las secciones principales de la aplicación.
- Interacción con los componentes sociales disponibles.

### 🍔 2. Exploración por categorías

La aplicación contempla categorías relacionadas con las experiencias que ofrece Manta:

- Comida típica y huecas manabas.
- Cines y entretenimiento.
- Naturaleza y playas.
- Lugares históricos.
- Deportes extremos.
- Actividades y experiencias locales.

### 🗺️ 3. Lugares y ubicaciones

La plataforma está orientada a descubrir sitios destacados de Manta y sus alrededores, entre ellos:

- Playa Murciélago.
- Mall del Pacífico.
- Tarqui.
- Universidad Laica Eloy Alfaro de Manabí (ULEAM).
- Centro de Manta.
- San Mateo.

La consulta de ubicaciones y la apertura de mapas dependen de los enlaces y las integraciones disponibles en cada módulo.

### ⭐ 4. Comentarios y reseñas

- Interfaces para consultar y registrar comentarios.
- Presentación de opiniones y experiencias de visita.
- Calificaciones mediante estrellas, según el módulo.
- Componentes para revisar el contenido comunitario.
- Acceso a las herramientas de moderación disponibles.

### 🔐 5. Autenticación y gestión de cuentas

El proyecto dispone de páginas y componentes para gestionar los flujos de acceso:

- Inicio de sesión.
- Registro de usuarios.
- Validación de formularios.
- Validación de correo electrónico y contraseñas.
- Recuperación de contraseña.
- Restablecimiento de contraseña.
- Navegación entre formularios de autenticación.
- Gestión del estado de autenticación mediante `AuthContext.tsx`.

La implementación de los formularios y la gestión de sesión del frontend no sustituyen un sistema de autenticación seguro en el servidor. La recuperación de credenciales y las operaciones sensibles deben validarse mediante un servicio de autenticación adecuado.

### 👤 6. Perfil de usuario

- Consulta de la información del perfil.
- Edición del nombre mediante componentes específicos.
- Gestión de fotografías de perfil.
- Visualización de publicaciones y estadísticas disponibles.
- Listados y secciones relacionados con la comunidad.
- Funciones para seguir usuarios.
- Acceso condicionado por las reglas de navegación implementadas.

### 🛡️ 7. Panel administrativo

El módulo administrativo está organizado en páginas y componentes especializados para facilitar la gestión de la plataforma.

Entre sus funcionalidades se contemplan:

- Vista general del panel administrativo.
- Gestión y consulta de usuarios.
- Administración de roles.
- Consulta de actividad administrativa.
- Visualización de reportes.
- Aplicación y levantamiento de sanciones.
- Registro de motivos de sanción.
- Gestión de suspensiones, según la implementación disponible.

Las acciones administrativas deben contar con controles de autorización en el backend cuando se integren servicios remotos.

### 🧑‍⚖️ 8. Moderación de contenido

La página `ModerationPage.tsx` está destinada a las funciones de moderación comunitaria.

El módulo contempla la organización de herramientas para:

- Revisar contenido comunitario.
- Gestionar reseñas y publicaciones según los permisos disponibles.
- Consultar elementos que requieren revisión.
- Aplicar las acciones de moderación implementadas.

La disponibilidad de cada operación depende de la lógica presente en el módulo y de la conexión con el sistema de datos.

### 🔔 9. Notificaciones

El proyecto incluye `NotificationsDropdown.tsx`, un componente de presentación de notificaciones.

La generación de eventos, la persistencia de las notificaciones y su sincronización dependen de la lógica y los servicios conectados.

### 💬 10. Chat y mensajería

La aplicación incorpora un conjunto de componentes para la experiencia de mensajería:

- Ventana de chat.
- Encabezado de conversación.
- Visualización de mensajes.
- Compositor de mensajes.
- Vista previa de archivos adjuntos.
- Visualización de contenido multimedia.
- Detección y presentación de enlaces.
- Widget de mensajería.

La entrega de mensajes entre usuarios, su persistencia y la sincronización entre dispositivos requieren un mecanismo de almacenamiento y comunicación compartido.

### 📱 11. Diseño adaptable

Las hojas de estilo están organizadas por módulos para facilitar el mantenimiento visual de la aplicación.

Se contemplan estilos específicos para:

- Autenticación y registro.
- Inicio y feed social.
- Perfil de usuario.
- Chat y mensajería.
- Administración.
- Moderación.
- Componentes visuales reutilizables.
- Avatares y pie de página.

---

## 🧰 Tecnologías utilizadas

| Tecnología | Propósito |
|---|---|
| React | Construcción de interfaces mediante componentes. |
| TypeScript | Tipado estático y organización del código. |
| Vite | Servidor de desarrollo y compilación para producción. |
| React Router DOM | Gestión de rutas y navegación. |
| CSS3 | Diseño, estilos y adaptación a diferentes pantallas. |
| Lucide React | Iconografía de la interfaz. |
| React Hooks | Gestión de estado, efectos y ciclo de vida de los componentes. |
| Context API | Compartición del estado de autenticación mediante `AuthContext.tsx`. |
| localStorage | Persistencia local utilizada por determinados módulos. |
| Supabase | Preparación para servicios externos mediante `data/supabase.ts`; la integración efectiva depende de cada módulo. |

> Las tecnologías enumeradas describen la estructura y las herramientas previstas o utilizadas en el frontend. La presencia de un archivo de configuración no implica que todos los servicios estén conectados y funcionando.

---

## 🏗️ Arquitectura del frontend

El proyecto utiliza una organización por capas para separar la presentación, la lógica de negocio y el acceso a los datos.

### 📂 Estructura del proyecto

La siguiente estructura refleja los archivos y directorios identificados en el proyecto:

```text
proyecto-arquitectura/
│
├── src/
│   │
│   ├── assets/
│   │   ├── manta-bg.jpg
│   │   ├── uleam.png
│   │   ├── uleam-alter.png
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   ├── business/
│   │   ├── services/
│   │   │   ├── accountStatus.ts
│   │   │   ├── imageTools.ts
│   │   │   ├── loginGuard.ts
│   │   │   ├── nameChange.ts
│   │   │   └── registerValidation.ts
│   │   │
│   │   └── types/
│   │       ├── follow.ts
│   │       ├── place.ts
│   │       ├── profile.ts
│   │       └── user.ts
│   │
│   ├── data/
│   │   ├── api/
│   │   ├── repositories/
│   │   │   ├── activity.ts
│   │   │   ├── follow.ts
│   │   │   ├── followStore.ts
│   │   │   ├── messages.ts
│   │   │   ├── places.ts
│   │   │   ├── profile.ts
│   │   │   ├── profilePhoto.ts
│   │   │   └── users.ts
│   │   └── supabase.ts
│   │
│   ├── presentation/
│   │   ├── auth/
│   │   │   └── AuthContext.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── admin-utils.ts
│   │   │   │   ├── FilterTabs.tsx
│   │   │   │   ├── PageHeader.tsx
│   │   │   │   ├── RankingTable.tsx
│   │   │   │   ├── ReportSheet.tsx
│   │   │   │   ├── SanctionModal.tsx
│   │   │   │   ├── StatCard.tsx
│   │   │   │   └── UserCard.tsx
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── RegisterAccountFields.tsx
│   │   │   │   ├── RegisterActions.tsx
│   │   │   │   ├── RegisterProgress.tsx
│   │   │   │   ├── RegisterSecurityFields.tsx
│   │   │   │   └── RegisterTerms.tsx
│   │   │   │
│   │   │   ├── chat/
│   │   │   │   ├── ChatAttachmentPreview.tsx
│   │   │   │   ├── ChatBox.tsx
│   │   │   │   ├── ChatComposer.tsx
│   │   │   │   ├── ChatHeader.tsx
│   │   │   │   ├── ChatMediaViewer.tsx
│   │   │   │   ├── ChatMessages.tsx
│   │   │   │   ├── LinkifiedText.tsx
│   │   │   │   └── MessengerWidget.tsx
│   │   │   │
│   │   │   ├── home/
│   │   │   │   ├── AdminPanelModal.tsx
│   │   │   │   ├── BrandLogo.tsx
│   │   │   │   ├── CategoryNav.tsx
│   │   │   │   ├── CommentModal.tsx
│   │   │   │   ├── FacebookFeed.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── NotificationsDropdown.tsx
│   │   │   │   ├── PlaceCard.tsx
│   │   │   │   ├── ReviewModal.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   │
│   │   │   ├── profile/
│   │   │   │   ├── CommunityList.tsx
│   │   │   │   ├── CommunitySection.tsx
│   │   │   │   ├── EditNameModal.tsx
│   │   │   │   ├── FollowButton.tsx
│   │   │   │   ├── PostGrid.tsx
│   │   │   │   ├── ProfileAbout.tsx
│   │   │   │   ├── ProfileHeader.tsx
│   │   │   │   ├── ProfilePhotoModal.tsx
│   │   │   │   ├── ProfilePosts.tsx
│   │   │   │   ├── ProfileStats.tsx
│   │   │   ├──   ProfileTypes.ts
│   │   │   └──   index.ts
│   │   │   │
│   │   └──   ui/
│   │       ├── Avatar.tsx
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── toast-context.ts
│   │       ├── ToastProvider.tsx
│   │       └── UserAvatar.tsx
│   │
│   ├── hooks/
│   │   ├── useFollows.ts
│   │   ├── useMyProfile.ts
│   │   └── useProfilePhoto.ts
│   │
│   ├── layouts/
│   │
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ModerationPage.tsx
│   │   ├── MyProfilePage.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminActivityPage.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── AdminOverviewPage.tsx
│   │   │   ├── AdminReportsPage.tsx
│   │   │   ├── AdminRolesPage.tsx
│   │   │   ├── AdminSections.tsx
│   │   │   └── AdminUsersPage.tsx
│   │   │
│   │   └── auth/
│   │       ├── ForgotPasswordPage.tsx
│   │       ├── LoginPage.tsx
│   │       ├── RegisterPage.tsx
│   │       └── ResetPasswordPage.tsx
│   │
│   ├── routes/
│   │   ├── AppRouter.tsx
│   │   ├── index.ts
│   │   └── RoleRoute.tsx
│   │
│   ├── styles/
│   │   ├── admin/
│   │   │   ├── admin-dashboard.css
│   │   │   ├── admin-modal.css
│   │   │   └── admin-users.css
│   │   ├── auth/
│   │   │   ├── auth-register.css
│   │   │   └── auth.css
│   │   ├── chat/
│   │   │   └── chat.css
│   │   ├── home/
│   │   │   └── home.css
│   │   ├── moderation/
│   │   │   └── moderation.css
│   │   ├── profile/
│   │   │   └── profile.css
│   │   └── ui/
│   │       ├── avatar.css
│   │       ├── footer.css
│   │       └── ui.css
│   │
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

> **Nota:** la estructura se basa en el listado de archivos proporcionado durante el desarrollo. Conviene verificar los nombres y la ubicación exactos antes de actualizarla si se reorganizan carpetas. Los directorios vacíos, como `presentation/layouts/` y `data/api/`, se mantienen porque forman parte de la estructura actual.

### 🧩 Responsabilidades de las capas

**Presentation**

Contiene las páginas, los componentes visuales, los formularios, los elementos reutilizables y las interfaces de usuario.

**Business**

Agrupa los tipos y servicios que contienen reglas de negocio, validaciones y operaciones auxiliares, como la gestión del estado de una cuenta y la validación del registro.

**Data**

Contiene los repositorios que gestionan el acceso y la persistencia de la información, además del archivo de configuración de Supabase.

**Hooks**

Centraliza lógica reutilizable de React relacionada con perfiles, seguimientos y fotografías de usuario.

**Routes**

Define la navegación de la aplicación y las reglas de acceso a las rutas mediante los componentes de enrutamiento.

**Styles**

Organiza las hojas de estilo globales y específicas de cada módulo para reducir el acoplamiento entre las interfaces.

**Assets**

Almacena imágenes y recursos gráficos utilizados por la aplicación.

### 🔐 Gestión de autenticación y rutas

`AuthContext.tsx` centraliza el contexto de autenticación para que los componentes que lo consumen puedan acceder al estado de sesión compartido.

`AppRouter.tsx` organiza las rutas y conecta las páginas con el sistema de navegación.

`RoleRoute.tsx` permite aplicar restricciones de acceso según las reglas de roles definidas en el frontend.

Esta separación ayuda a evitar que cada página implemente por separado toda la lógica de sesión y navegación.

**Importante:** la protección de rutas en React es un control de interfaz, no una barrera de seguridad suficiente. El backend debe validar la identidad, los permisos y cada operación protegida.

### 🛡️ Organización del módulo administrativo

El módulo administrativo se encuentra en `presentation/pages/admin/` y utiliza componentes reutilizables de `presentation/components/admin/`.

Entre sus responsabilidades están la visualización de estadísticas, la gestión de usuarios, los roles, los reportes y la actividad administrativa.

`AdminLayout.tsx` proporciona la estructura visual del área administrativa. Por su parte, `presentation/layouts/` permanece disponible para futuros layouts compartidos entre páginas.

---

## 🧭 Rutas de navegación

Las páginas existentes permiten organizar los siguientes flujos. La disponibilidad efectiva de cada URL debe comprobarse en `src/presentation/routes/AppRouter.tsx`.

| Ruta prevista | Descripción | Acceso previsto |
|---|---|---|
| `/` | Inicio y feed social | Usuario autenticado |
| `/login` | Inicio de sesión | Público |
| `/register` | Registro de usuarios | Público |
| `/forgot-password` | Recuperación de contraseña | Público |
| `/reset-password` | Restablecimiento de contraseña | Público |
| `/perfil` | Perfil de usuario | Según las reglas implementadas |
| `/moderacion` | Panel de moderación | Moderador autorizado |
| `/admin` | Panel administrativo | Administrador |
| `/admin/users` | Gestión de usuarios | Administrador |
| `/admin/roles` | Gestión de roles | Administrador |
| `/admin/activity` | Actividad administrativa | Administrador |
| `/admin/reports` | Reportes | Administrador |

> Las rutas de esta tabla representan el esquema de navegación previsto para el proyecto. Que exista una página o un componente no garantiza que su URL esté registrada actualmente ni que todas sus acciones estén conectadas a un backend.

---

## 👥 Roles de usuario

La aplicación contempla tres roles principales:

### Administrador — `admin`

Orientado a la administración de usuarios, roles, reportes y otras funciones administrativas autorizadas.

### Moderador — `moderator`

Orientado a la revisión y gestión del contenido comunitario, dentro de los permisos asignados.

### Usuario — `user`

Orientado a la exploración de lugares, la participación en la comunidad y las funciones sociales habilitadas.

Los roles y permisos deben comprobarse tanto en la navegación del frontend como en el servidor cuando se integren operaciones protegidas.

---

## ⚙️ Instalación y ejecución

### Requisitos previos

- Node.js en una versión compatible con las dependencias del proyecto.
- npm.
- Git, si se va a clonar el repositorio.
- Visual Studio Code u otro editor compatible.

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd proyecto-arquitectura
```

Sustituye `<URL_DEL_REPOSITORIO>` por la URL real del repositorio.

### 2. Instalar dependencias

Ejecuta el siguiente comando en el directorio donde se encuentra `package.json`:

```bash
npm install
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Vite mostrará en la terminal la dirección local para abrir la aplicación. Habitualmente es:

`http://localhost:5173`

### 4. Generar la compilación de producción

```bash
npm run build
```

En la configuración actual, este comando ejecuta la comprobación de TypeScript mediante `tsc -b` y después genera la compilación de producción con Vite.

### 5. Previsualizar la compilación

```bash
npm run preview
```

Este comando permite revisar localmente el resultado de la compilación.

---

## 🧪 Validación y pruebas

Durante el desarrollo se recomienda comprobar los siguientes escenarios:

- Registro con información válida e inválida.
- Validación de correo y contraseña.
- Inicio y cierre de sesión.
- Persistencia y recuperación del estado de autenticación.
- Navegación entre páginas públicas y privadas.
- Acceso a rutas según los roles.
- Restricciones del área administrativa.
- Gestión de usuarios, roles y sanciones.
- Acciones de moderación.
- Edición del perfil y gestión de fotografías.
- Envío y visualización de mensajes.
- Visualización de notificaciones.
- Comportamiento adaptable en dispositivos móviles.
- Manejo de errores y estados de carga.
- Compilación de producción con `npm run build`.

Si el proyecto incorpora pruebas automatizadas, deben ejecutarse mediante el script correspondiente definido en `package.json`.

### Última compilación comprobada

En la salida compartida durante el desarrollo, `npm run build` terminó correctamente.

| Elemento | Resultado |
|---|---:|
| Herramienta de compilación | Vite 8.3.0 |
| Módulos transformados | 2030 |
| CSS generado | 99.06 kB |
| JavaScript generado | 630.73 kB |
| Resultado | Compilación exitosa |

Estos valores corresponden a la compilación reportada y pueden cambiar con futuras modificaciones.

El archivo JavaScript generado tiene un tamaño considerable, por lo que conviene evaluar la carga diferida de páginas y la división del código en módulos cuando se optimice el rendimiento.

---

## 🚧 Estado actual del proyecto

MantaCampus se encuentra en desarrollo incremental. El estado de cada funcionalidad depende de su implementación específica y de las integraciones disponibles.

| Área | Estado documentado |
|---|---|
| React y TypeScript | Configurados |
| Vite y compilación | Configurados; última compilación compartida exitosa |
| Organización por capas | Implementada en la estructura del frontend |
| Contexto de autenticación | Existe `AuthContext.tsx` |
| Enrutamiento | Existe `AppRouter.tsx` |
| Protección por roles | Existe `RoleRoute.tsx` |
| Formularios de autenticación | Páginas y componentes disponibles |
| Feed y categorías | Componentes disponibles |
| Perfil de usuario | Página, hooks y componentes disponibles |
| Administración | Páginas y componentes disponibles |
| Moderación | Página y estilos disponibles |
| Chat | Componentes y repositorio de mensajes disponibles |
| Notificaciones | Componente de interfaz disponible |
| Persistencia de datos | Repositorios implementados; el mecanismo varía según el módulo |
| Integración con Supabase | Existe `data/supabase.ts`; debe verificarse la conexión efectiva |
| Backend y autorización segura | Requieren validación según las integraciones implementadas |

La presencia de componentes, páginas o repositorios no garantiza por sí sola que todas las funcionalidades estén terminadas, que los datos se compartan entre usuarios o que exista persistencia remota.

---

## 🛣️ Mejoras previstas

- Centralizar el consumo de servicios externos mediante una capa de API.
- Completar la integración entre los repositorios y el backend.
- Consolidar la gestión de sesión y los estados de autenticación.
- Validar permisos y operaciones sensibles en el servidor.
- Mejorar el manejo de errores, las notificaciones y los estados de carga.
- Incorporar pruebas automatizadas para componentes, rutas y flujos de usuario.
- Mejorar la accesibilidad y la navegación con teclado.
- Optimizar la carga de imágenes y dividir el código para reducir el JavaScript inicial.
- Revisar la persistencia y sincronización de mensajes, notificaciones y sanciones.
- Mantener una presentación visual coherente entre inicio, perfil, administración y moderación.
- Ampliar las pruebas en diferentes tamaños de pantalla.

---

## 👨‍💻 Información académica

**Proyecto:** Huecas Manabas – MantaCampus  
**Institución:** Universidad Laica Eloy Alfaro de Manabí (ULEAM)  
**Área:** Desarrollo de Software / Arquitectura de Software  
**Ubicación:** Manta, Manabí, Ecuador 🇪🇨

---

<p align="center">
  <strong>🌴 MantaCampus — Conectando a la comunidad con lo mejor de Manta.</strong>
</p>