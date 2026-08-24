# Eedoo Platform Architecture

Eedoo is a modular personal productivity platform where an AI assistant acts as an intelligent control layer across independent applications.

## High-Level Architecture

```text
                         EeDOO PLATFORM
                              │
                 ┌────────────┴────────────┐
                 │                         │
             EeDOO AI                  EeDOO APPS
                 │                         │
                 │              ┌──────────┼──────────┐
                 │              │          │          │
                 │           Money       Tasks      Notes
                 │
                 │                    Reminders
                 │
                 └────── Intelligent Control Layer
```

## Architectural Principles

1. **Separation of Concerns**: 
   - Frontend: UI, state, presentation.
   - Backend: Business logic, database, AI orchestration.
2. **Feature Isolation**: Applications (Money, Tasks, Notes) are conceptually and structurally isolated.
3. **Symmetry**: Anything Edoo AI can do must be possible manually through the UI via the same underlying services.
4. **No Direct DB for AI**: The AI interacts with features by selecting explicit tools which then call backend services. It never executes arbitrary SQL.

## AI Flow

```text
User Message -> Edoo AI -> Intent Recognition -> Tool Selection -> Validation -> Backend Service -> Database
```

## Core Entities (Future)

Entities will be strictly user-scoped:
- `User` -> `Transactions`, `People`, `Tasks`, `Reminders`, `Notes`, `Conversations`

## API Design

Endpoints follow the `/api/v1/*` format. Future modules:
- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/money`
- `/api/v1/tasks`
- `/api/v1/reminders`
- `/api/v1/notes`
- `/api/v1/chat`
