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
  <img src="https://img.shields.io/badge/Frontend-Web-orange" alt="Frontend" />
</p>

---

## 📖 Descripción

**Huecas Manabas – MantaCampus** es una aplicación web desarrollada con React y TypeScript que ofrece una experiencia social para explorar la gastronomía, los sitios turísticos y las actividades de Manta.

El frontend proporciona una interfaz para descubrir lugares, consultar publicaciones, compartir opiniones e interactuar con otros usuarios. También incorpora interfaces específicas para la administración de cuentas y la moderación del contenido.

La aplicación se organiza en componentes, páginas, rutas, servicios y repositorios, facilitando el mantenimiento y la evolución de sus funcionalidades.

## 🎯 Objetivos

- Promover el descubrimiento de huecas manabas, restaurantes y lugares turísticos.
- Facilitar el intercambio de recomendaciones y experiencias.
- Ofrecer una interfaz social para publicaciones, comentarios y reseñas.
- Organizar la navegación y las funcionalidades mediante roles de usuario.
- Proporcionar una experiencia adaptable a computadoras y dispositivos móviles.
- Mantener una estructura frontend preparada para consumir servicios externos.

---

## ✨ Funcionalidades

### 🏠 1. Inicio y feed social

- Visualización de publicaciones sobre lugares y experiencias.
- Tarjetas para presentar información de los lugares.
- Navegación por categorías.
- Interacciones sociales mediante los módulos disponibles.
- Acceso a las secciones principales de la aplicación.

### 🍔 2. Categorías de lugares

La interfaz contempla categorías para explorar diferentes experiencias en Manta:

- Comida típica y huecas manabas.
- Cines y entretenimiento.
- Naturaleza y playas.
- Lugares históricos.
- Deportes extremos.
- Actividades y experiencias locales.

### 🗺️ 3. Exploración de ubicaciones

El frontend contempla la visualización y consulta de lugares destacados de Manta, como:

- Playa Murciélago.
- Mall del Pacífico.
- Tarqui.
- Universidad Laica Eloy Alfaro de Manabí (ULEAM).
- Centro de Manta.
- San Mateo.

Los puntos y enlaces disponibles permiten consultar las ubicaciones mediante servicios de mapas externos.

### ⭐ 4. Comentarios y reseñas

- Interfaces para consultar y registrar comentarios.
- Experiencias de visita.
- Calificaciones mediante estrellas, según el módulo.
- Visualización de opiniones de la comunidad.
- Acceso a las herramientas de moderación disponibles.

### 🔐 5. Autenticación y formularios

- Pantalla de inicio de sesión.
- Registro de usuarios.
- Validación de formularios.
- Validaciones de correo y contraseña.
- Recuperación de contraseña mediante el flujo implementado.
- Navegación entre los formularios de autenticación.
- Gestión de la sesión desde el frontend.

La autenticación definitiva, la recuperación segura de credenciales y la autorización de operaciones sensibles deben respaldarse en los servicios correspondientes; no basta con validar datos en la interfaz.

### 👤 6. Perfil de usuario

- Acceso a la sección de perfil.
- Presentación de información del usuario autenticado.
- Navegación protegida según el rol.
- Integración con los componentes de la sesión.

### 🛡️ 7. Panel administrativo

El frontend incorpora una interfaz administrativa con secciones para:

- Consultar y gestionar usuarios.
- Gestionar roles.
- Consultar actividad administrativa.
- Acceder a reportes.
- Aplicar y levantar sanciones desde el módulo de usuarios.
- Registrar motivos de sanción.
- Aplicar suspensiones temporales, según la implementación disponible.

Las operaciones y los datos que dependen de un servicio remoto deben estar conectados y validados por el backend.

### 🧑‍⚖️ 8. Moderación

La interfaz de moderación está orientada a la revisión del contenido comunitario.

Contempla las herramientas implementadas para:

- Consultar reseñas pendientes.
- Aprobar contenido.
- Eliminar reseñas.
- Navegar por las opciones disponibles para el moderador.

### 🔔 9. Notificaciones

La aplicación contempla componentes para presentar notificaciones relacionadas con la actividad comunitaria y las interacciones de los usuarios.

Las funciones disponibles y su persistencia dependen de la implementación del módulo correspondiente.

### 💬 10. Chat

El frontend incorpora un componente de mensajería flotante asociado a la sesión del usuario.

La persistencia de mensajes, su entrega entre usuarios y la sincronización entre dispositivos dependen del servicio de comunicación que utilice la aplicación.

### 📱 11. Diseño adaptable

Los estilos personalizados permiten adaptar los componentes a diferentes tamaños de pantalla, incluidos:

- Encabezado y navegación.
- Feed y tarjetas.
- Formularios de autenticación.
- Ventanas modales.
- Paneles administrativos.
- Botones, menús y áreas de interacción.

---

## 🧰 Tecnologías del frontend

| Tecnología | Propósito |
|---|---|
| React | Construcción de interfaces mediante componentes. |
| TypeScript | Tipado estático y organización del código. |
| Vite | Desarrollo local y compilación. |
| React Router DOM | Definición de rutas y navegación. |
| CSS3 | Diseño visual y adaptación a pantallas. |
| Lucide React | Iconos de la interfaz. |
| React Hooks | Gestión de estado y efectos en componentes. |
| localStorage | Almacenamiento local utilizado por algunos módulos. |

---

## 🏗️ Arquitectura del frontend

El proyecto organiza sus responsabilidades mediante capas de presentación, negocio y datos.

```text
proyecto-arquitectura/
│
├── src/
│   ├── presentation/
│   │   ├── components/
│   │   │   └── chat/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── auth/
│   │   └── routes/
│   │
│   ├── business/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── data/
│   │   └── repositories/
│   │
│   ├── styles/
│   │   └── auth/
│   │
│   ├── assets/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

*La estructura es una representación general del frontend. Los archivos y directorios concretos pueden variar conforme evoluciona el proyecto.*

### Responsabilidad de las capas

- **Presentation:** páginas, componentes, formularios y elementos visuales.
- **Business:** tipos, servicios y reglas de negocio del frontend.
- **Data:** repositorios y mecanismos de acceso a los datos.
- **Styles:** estilos generales y específicos de cada módulo.
- **Routes:** navegación y restricciones de acceso por rol.
- **Assets:** imágenes y recursos visuales.

Esta organización ayuda a separar responsabilidades y facilita la incorporación de nuevas funcionalidades.

---

## 🧭 Rutas de navegación

Las rutas principales contempladas en el frontend son:

| Ruta | Descripción | Acceso previsto |
|---|---|---|
| `/` | Inicio y feed social | Usuario autenticado |
| `/login` | Inicio de sesión | Público |
| `/register` | Registro | Público |
| `/forgot-password` | Recuperación de contraseña | Público |
| `/reset-password` | Restablecimiento de contraseña | Público |
| `/perfil` | Perfil del usuario | Usuario y moderador |
| `/moderacion` | Panel de moderación | Moderador |
| `/admin` | Panel administrativo | Administrador |
| `/admin/users` | Gestión de usuarios | Administrador |
| `/admin/roles` | Gestión de roles | Administrador |
| `/admin/activity` | Actividad administrativa | Administrador |
| `/admin/reports` | Reportes | Administrador |

Las restricciones de navegación implementadas en React mejoran la experiencia de uso, pero la autorización real de las operaciones protegidas también debe comprobarse en el servidor.

---

## 🔑 Roles de usuario

### Administrador — `admin`

Acceso a las secciones administrativas disponibles para gestionar usuarios, roles y operaciones de administración.

### Moderador — `moderator`

Acceso al panel de moderación para revisar y gestionar el contenido comunitario autorizado.

### Usuario — `user`

Acceso a la experiencia social, las publicaciones y las funciones comunitarias habilitadas para su cuenta.

---

## ⚙️ Instalación y ejecución

### Requisitos

- Node.js.
- npm.
- Git, para clonar el repositorio.
- Visual Studio Code u otro editor compatible.

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd proyecto-arquitectura
```

Sustituye `<URL_DEL_REPOSITORIO>` por la URL real del repositorio.

### 2. Instalar dependencias

Desde el directorio que contiene el `package.json` del frontend:

```bash
npm install
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Vite mostrará la dirección local en la terminal. Habitualmente:

```text
http://localhost:5173
```

### 4. Generar la compilación de producción

```bash
npm run build
```

En la configuración actual del proyecto, este comando ejecuta la comprobación de TypeScript y la compilación de Vite.

### 5. Visualizar la compilación

```bash
npm run preview
```

Este comando inicia un servidor local para revisar el resultado compilado.

---

## 🧪 Validación del frontend

Se recomienda comprobar los siguientes escenarios durante el desarrollo:

- Registro con datos válidos e inválidos.
- Validaciones de correo y contraseña.
- Inicio y cierre de sesión.
- Navegación según el rol.
- Restricciones de las rutas administrativas.
- Gestión de usuarios y sanciones.
- Acciones de moderación.
- Formularios y ventanas modales.
- Diseño adaptable a dispositivos móviles.
- Compilación correcta mediante `npm run build`.

Las pruebas automatizadas deben ejecutarse con el comando configurado en el `package.json`.

---

## 🚧 Estado del frontend

MantaCampus se encuentra en desarrollo incremental. Las interfaces y los módulos se incorporan y validan progresivamente.

| Área | Estado general |
|---|---|
| React y TypeScript | Implementados |
| Vite y compilación | Configurados |
| Navegación con React Router | Implementada |
| Formularios de autenticación | Implementación frontend |
| Feed y categorías | Según los módulos disponibles |
| Comentarios y reseñas | Según los módulos disponibles |
| Perfil de usuario | Implementado en el frontend |
| Panel administrativo | Implementado en el frontend |
| Moderación | Implementada en el frontend |
| Sanciones de usuarios | Lógica frontend con almacenamiento local |
| Chat y notificaciones | Componentes frontend disponibles |
| Integración con servicios externos | Depende de cada módulo |
| Sincronización de sanciones entre navegadores | Requiere estado compartido y validación del servicio |

Los estados de esta tabla describen el frontend y no certifican por sí solos la integración completa con los servicios remotos.

---

## 🛣️ Mejoras previstas para el frontend

- Centralizar el consumo de la API mediante servicios y repositorios.
- Mejorar el manejo de errores y los estados de carga.
- Mantener sincronizada la sesión con el estado de la cuenta.
- Adaptar los formularios a las respuestas reales del servidor.
- Mejorar la accesibilidad y la navegación con teclado.
- Ampliar las pruebas de componentes y rutas.
- Optimizar la carga de imágenes y recursos.
- Continuar mejorando la experiencia móvil.
- Mantener una presentación visual coherente entre los módulos.

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