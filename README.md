# Hotel Management System

<div align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-black?style=for-the-badge&logo=spring-boot" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/MySQL-white?style=for-the-badge&logo=mysql&logoColor=blue" alt="MySQL" />
  <img src="https://img.shields.io/badge/JHipster-394CE5?style=for-the-badge&logo=jhipster&logoColor=white" alt="JHipster" />
</div>

<br />

A comprehensive, enterprise-grade Hotel Management System built to handle operations for Grand Hotel Sri Lanka. This application provides robust management of rooms, bookings, user access, and system auditing, leveraging a modern monolithic architecture with a Spring Boot backend and a React frontend.

---

## ✦ Core Features

### 1. Room & Inventory Management

- **Centralized Directory:** Manage all hotel rooms, including pricing, availability status, and room types.
- **Media Integration:** Support for high-quality room images and dynamic galleries.
- **Real-time Availability:** Status updates instantly reflect throughout the system to prevent double-booking.

### 2. Booking Engine

- **Seamless Reservations:** Streamlined booking flow for both staff and guests.
- **Automated Notifications:** Automated email dispatch upon booking confirmation or modifications.
- **Lifecycle Tracking:** Track a booking from creation to check-in, check-out, and cancellation.

### 3. Security & Access Control

- **OAuth2 Single Sign-On:** Secure authentication via Google SSO.
- **Role-Based Access Control (RBAC):** Distinct authority levels (`ROLE_ADMIN`, `ROLE_RECEPTIONIST`, `ROLE_USER`) ensuring least-privilege access.
- **Dynamic Role Synchronization:** Roles are actively synced between the identity provider and the internal database upon authentication.

### 4. Comprehensive Auditing

- **System Logs:** Monitor all user logins, authentication attempts, and session activity.
- **Entity Audit Trail:** Track every `CREATE`, `UPDATE`, and `DELETE` action across critical entities (Bookings, Rooms).
- **Administrative Dashboard:** Secure backend interface for administrators to review operational history and system metrics.

---

## ✦ Technology Stack

**Backend**

- **Java 17+**
- **Spring Boot 3.x** (Web, Security, Data JPA)
- **Liquibase** (Database version control and migrations)
- **Maven** (Dependency management and build automation)

**Frontend**

- **React 18+** with Functional Components & Hooks
- **TypeScript** (Strict typing and enhanced developer experience)
- **Bootstrap 5** & **Sass** (Responsive, modern UI components)
- **Axios** (HTTP client for API communication)

**Database & Infrastructure**

- **MySQL 8+** (Primary relational database)
- **OAuth2 / OIDC** (Identity management)

---

## ✦ Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Java 17+](https://adoptium.net/)
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- [MySQL](https://www.mysql.com/) server running locally on port `3306`

### Database Setup

1. Open your MySQL client.
2. Create a database named `hotelManagementSystem`:
   ```sql
   CREATE DATABASE IF NOT EXISTS hotelManagementSystem DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

_(Note: Spring Boot will automatically apply Liquibase schemas upon startup.)_

---

## ✦ Running the Application

### 1. Start the Backend (Spring Boot)

The backend serves both the API and acts as the OAuth2 client.
Open a terminal in the root directory and run:

**Windows:**

```cmd
.\mvnw.cmd spring-boot:run
```

**macOS/Linux:**

```bash
./mvnw spring-boot:run
```

_The server will start on `http://localhost:8080`._

### 2. Start the Frontend (Webpack Dev Server)

To enable live-reloading for the React frontend, open a separate terminal in the root directory and run:

```bash
npm install
npm run start
```

_The development server will start on `http://localhost:9000` and will proxy API requests to port `8080`._

---

## ✦ System Overview

This project was initially generated using [JHipster](https://www.jhipster.tech/), providing a robust foundation for enterprise applications. It adheres to standard layered architecture:

- **`src/main/java/.../web/rest`**: REST Controllers handling HTTP requests and security boundaries.
- **`src/main/java/.../service`**: Business logic and transaction management.
- **`src/main/java/.../repository`**: Spring Data JPA interfaces for database interaction.
- **`src/main/java/.../domain`**: JPA Entities mapping directly to MySQL tables.
- **`src/main/webapp/app`**: React application root, containing modules, routes, and shared components.

---
