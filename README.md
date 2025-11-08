Title: 
Real‑Time Collaborative Code Editor (Angular + Spring Boot)

Overview: 
A real‑time, room‑based code editor that supports multi‑user concurrent editing with Operational Transformation (OT), Monaco Editor, and WebSocket/STOMP. Late joiners receive an authoritative snapshot, and edits are durably persisted with a debounced flush to the database. The app features JWT authentication, secure CORS, and user‑scoped cross‑tab session sync.

Features : 

Real‑time collaboration: Multi‑user concurrent editing with OT and per‑file revision tracking.

Monaco Editor: Rich code editing with language detection, word wrap, formatting, and model swapping.

Room & files: Room‑scoped file tree, create/delete files, open/switch files without editor teardown.

Authoritative snapshots: Late joiners get content + revision to prevent drift and race conditions.

Debounced persistence: 1.5 s idle window reduces DB writes while ensuring durability.

JWT auth: Signup/signin with BCrypt hashing, stateless Spring Security, security‑aware CORS.

WebSocket security: JWT propagated via STOMP connect headers; server validates principals on join.

Cross‑tab session sync: User‑scoped login/logout broadcast to keep multiple tabs consistent.

Architecture

Frontend: Angular, Monaco Editor, RxJS, Auth Guard + HTTP Interceptor, STOMP client.

Backend: Spring Boot, Spring Security, WebSocket/STOMP, JPA/Hibernate, JWT, BCrypt.

Data: MySQL/Postgres (configurable).

Patterns: OT with per‑file revision, snapshot seeding, debounced persistence. 
