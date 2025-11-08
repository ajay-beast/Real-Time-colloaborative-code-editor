# 🚀 Real-Time Collaborative Code Editor (Angular + Spring Boot)

A **real-time, room-based collaborative code editor** that enables multiple users to edit code simultaneously with **Operational Transformation (OT)**, powered by **Monaco Editor** and **WebSocket/STOMP**.  
Late joiners receive authoritative snapshots, while edits are **durably persisted** with a debounced flush mechanism.  
The application features **JWT authentication**, **secure CORS**, and **cross-tab session synchronization** for a seamless user experience.

---

## 🧩 Overview

This project combines **Angular** and **Spring Boot** to deliver a scalable, low-latency collaborative coding environment that ensures **data consistency, security, and durability**.

**Key highlights:**
- Real-time multi-user collaboration with **OT-based conflict resolution**
- **Rich editing experience** using Monaco Editor (VS Code engine)
- **Snapshot-based synchronization** for late joiners
- **Optimized database writes** using debounced persistence
- **JWT-secured REST and WebSocket communication**

---

## ⚙️ Features

### 🕐 Real-Time Collaboration
- Concurrent editing with **Operational Transformation (OT)**
- Per-file revision tracking to ensure consistent state across users

### 🧠 Monaco Editor Integration
- Intelligent code editing with **syntax highlighting**, **word wrap**, and **auto-formatting**
- Dynamic **model swapping** for smooth file transitions without editor teardown

### 📁 Rooms & Files
- Room-scoped file tree with **create/delete/open/switch** operations
- Efficient file management while maintaining isolated collaborative sessions

### 🔄 Authoritative Snapshots
- Late joiners instantly receive **latest content and revision metadata**
- Prevents drift, race conditions, and merge inconsistencies

### 💾 Debounced Persistence
- **1.5 s idle window** before database flush
- Minimizes DB load while ensuring durability and crash recovery

### 🔐 Authentication & Security
- **JWT-based signup/signin** with BCrypt password hashing
- Stateless **Spring Security** and **CORS-aware API design**
- JWT propagation via **STOMP connect headers** for secure WebSocket sessions

### 🧭 Cross-Tab Session Sync
- User-scoped **login/logout broadcast** for consistent multi-tab state management

---

## 🏗️ Architecture

### Frontend
- **Angular**
- **Monaco Editor**
- **RxJS**
- **Auth Guards + HTTP Interceptors**
- **STOMP client** for WebSocket communication

### Backend
- **Spring Boot**
- **Spring Security**
- **WebSocket/STOMP**
- **JPA/Hibernate**
- **JWT Authentication**
- **BCrypt** password hashing

### Data
- **MySQL / PostgreSQL** (configurable)

### Design Patterns
- **Operational Transformation (OT)** with per-file revision tracking  
- **Snapshot seeding** for late joiners  
- **Debounced persistence** for optimized database interaction  

---

## 🧰 Tech Stack

| Layer | Technologies |
|:------|:--------------|
| **Frontend** | Angular, RxJS, Monaco Editor |
| **Backend** | Spring Boot, Spring Security, JPA, WebSocket/STOMP |
| **Security** | JWT, BCrypt, CORS |
| **Database** | MySQL / PostgreSQL |

---
