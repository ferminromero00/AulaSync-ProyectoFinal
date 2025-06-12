# AulaSync - Plataforma de Gestión Educativa 🎓

<div align="center">

  ![React](https://img.shields.io/badge/React-18.x-blue)
  ![Symfony](https://img.shields.io/badge/Symfony-6.x-black)
  ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4)
  ![Estado](https://img.shields.io/badge/estado-en%20desarrollo-yellow)
</div>

## 📑 Índice

- [Descripción](#-descripción)
- [Características Principales](#-características-principales)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Arquitectura](#-arquitectura)
- [Características de la Interfaz](#-características-de-la-interfaz)
- [Seguridad](#-seguridad)
- [Estructura del Proyecto](#-estructura-del-proyecto)

## 📋 Descripción

AulaSync es una plataforma educativa moderna que facilita la interacción entre profesores y alumnos. Diseñada para proporcionar una experiencia fluida y eficiente en la gestión de clases, tareas y evaluaciones.

## ✨ Características Principales

### Para Profesores 👨‍🏫

- **Gestión de Clases**
  - Creación y administración de clases
  - Generación de códigos de invitación
  - Exportación de informes en PDF y CSV
  - Seguimiento de estudiantes

- **Sistema de Tareas**
  - Creación y asignación de tareas
  - Calificación de entregas
  - Estadísticas de progreso
  - Comentarios y retroalimentación

### Para Alumnos 👨‍🎓

- **Gestión Personal**
  - Unirse a clases mediante códigos
  - Vista organizada de tareas pendientes
  - Sistema de entrega de trabajos
  - Seguimiento de calificaciones

- **Organización**
  - Categorización de tareas (pendientes, entregadas, calificadas)
  - Notificaciones importantes
  - Calendario de entregas

## 🛠️ Tecnologías

- **Frontend**
  - React
  - TailwindCSS
  - Lucide Icons
  - React Router
  - React Hot Toast

- **Backend**
  - Symfony 7.2
  - API REST
  - JWT Authentication
  - MySQL

## 🚀 Instalación

### Frontend (React)

```bash
cd AulaSync-React
npm install
npm run dev
```

### Backend (Symfony)

```bash
cd AulaSyncSymfony
composer install
symfony server:start
```

## 🌐 Arquitectura

El proyecto sigue una arquitectura moderna basada en:

- Frontend SPA con React
- API REST con Symfony
- Autenticación JWT
- Diseño Responsive
- Principios SOLID

## 📱 Características de la Interfaz

- Diseño moderno y minimalista
- Interfaz responsive
- Animaciones suaves
- Feedback visual intuitivo
- Modo claro/oscuro
- Navegación fluida

## 🔒 Seguridad

- Autenticación JWT
- Roles de usuario
- Protección CSRF
- Validación de datos
- Encriptación de contraseñas

## 📦 Estructura del Proyecto

```
AulaSync/
├── 🟦 AulaSync-React/        # Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── public/
│
└── ⚫ AulaSyncSymfony/       # Backend
    ├── src/
    │   ├── Controller/
    │   ├── Entity/
    │   └── Repository/
    └── config/
```