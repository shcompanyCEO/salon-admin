# Beauty-Tech Core Skills

This document defines the core coding and design standards for the project. These rules must be applied to all future development in `apps/admin`, `apps/web`, and shared packages.

## 1. 핵심 아키텍처 원칙 (Core Architecture Principles)

### Pure Logic

- **Rule**: All business logic must reside in `@repo/api-core`. All data types must reside in `@repo/supabase`.
- **Goal**: Centralize logic and types to ensure consistency and reusability.

### DI First (Dependency Injection)

- **Rule**: All server-side logic (e.g., Service functions) must receive necessary dependencies (e.g., `supabaseClient`) as arguments.
- **Goal**: Decouple logic from infrastructure, facilitating testing and context switching.
- **Example**:

  ```typescript
  // Right
  export const getSalonMenus = async (client: SupabaseClient, salonId: string) => { ... }

  // Wrong
  import { supabase } from '@/lib/supabase';
  export const getSalonMenus = async (salonId: string) => { ... }
  ```

### Mirroring Structure

- **Rule**: `apps/admin` and `apps/web` must maintain identical folder structures and API endpoint conventions.
- **Goal**: Ensure symmetry between the two applications to reduce cognitive load and simplify maintenance.

## 2. 용어 및 리소스 명명 규칙 (Resource Naming & Terminology)

### Menus vs. Services

- **Menus**: refers to the **business items** sold by the salon (e.g., Hair cut, Gel Nail, Massage).
- **Services**: refers to the **technical layer** (backend business logic) that processes and validates data.

### Implementation Rules

- **UI Components & API URLs**: MUST use `menus`.
  - Example URL: `/api/salons/:id/menus`
  - Example Component Folder: `features/salon-menus`
- **Logic Files & Classes**: MUST use `services`.
  - Example File: `SalonServicesService.ts`
  - Example Class: `SalonMenuService` (if referring to the logic class handling menus)

> **Note**: This rule applies without exception to both `admin` and `web`. Ideally, even if services are split later, each app should function independently while adhering to this convention.
