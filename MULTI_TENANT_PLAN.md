# Multi-Tenant Architecture Plan

## Objective
Transition the existing Next.js + Supabase inventory management application from a single-tenant architecture to a **multi-tenant SaaS architecture**. 

## Selected Architecture model
**Shared Database, Shared Schema (Option 3)**
- A single database and schema will house all tenant data.
- Tenants (organizations) will be logically separated using an `organization_id` column.
- Security and data isolation will be enforced strictly via Supabase Row Level Security (RLS).

## Core Implementation Steps

### 1. Database Schema Overhaul
- **New Tables:**
  - `organizations` (id, name, created_at)
  - `user_organizations` (user_id, organization_id, role [owner, admin, member])
- **Modifications:**
  - Add `organization_id` (foreign key) to all domain-specific tables (e.g., `inventory`, `activity_logs`, `categories`).
  - Drop the direct `user_id` dependency from domain tables where data is now owned by the organization rather than the individual user.

### 2. Security & RLS Policy Updates
- Update existing RLS policies on all operational tables to check the `organization_id`.
- **Target Implementation:** Utilize Supabase *Custom JWT claims* to inject the user's active `organization_id` at login. This ensures RLS runs quickly (e.g., `organization_id = (auth.jwt() ->> 'org_id')::uuid`) rather than performing expensive `IN (SELECT...)` joins on every query.

### 3. Authentication & Onboarding Flow
- Replace the simple user signup with a transaction (via Supabase RPC/Postgres Function). 
- When a new workspace is created, the RPC must seamlessly: 
  1. Create the Auth Profile.
  2. Create the `organization`.
  3. Insert the user into `user_organizations` as an 'owner'.
- Implement an invite-system for existing workspaces.

### 4. Application Frontend (Next.js)
- **State Management:** Implement an `OrganizationProvider` (React Context) to store and manage the currently active organization globally.
- **Routing:** Ensure middleware explicitly requires an active organization context for dashboard routes.
- **Data Fetching:** Update Supabase client calls to restrict `.select()` / `.insert()` statements to the active `organization_id`. 
- **UI Components:** Build an organization switcher dropdown allowing users who belong to multiple organizations to switch context.

## Current Status
- **Phase:** Planning / Pre-Implementation.
- **Next Immediate Goal:** Define the exact SQL migrations required to create `organizations`, `user_organizations`, and the Supabase RPC function for onboarding.
