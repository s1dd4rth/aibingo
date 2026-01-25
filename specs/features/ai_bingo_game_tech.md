# Technical Design Doc: AI Workshop Bingo Game

## Data Model (Schema)

We will use **PostgreSQL** (hosted on Railway) with **Prisma ORM**.

```prisma
// schema.prisma

model Participant {
  id        String   @id @default(cuid())
  email     String   @unique
  passcode  String   // Simple plaintext passcode for the workshop (or hashed if desired, but low security needs)
  name      String?
  
  // Progress Tracking
  // Storing unlocked component IDs as a simple JSON array for flexibility 
  // or we could use a related table if we want strict constraints. 
  // Given "ability to add more components later", a flexible string list is robust.
  unlockedComponentIds String[] // e.g. ["prompting", "embeddings"]
  
  isCompleted Boolean @default(false)
  joinedAt    DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// We will keep the Component definitions in a code-based config (JSON/TS) 
// to avoid complex CMS requirements for a 2-hour workshop.
// Extending components means adding to the JSON config and redeploying.
```

## API Contract

We will use **Next.js Server Actions** for seamless client-server interaction.

### 1. Authentication
- **Action**: `login(email: string, passcode: string)`
- **Response**: `{ success: true, participant: Participant }` or throws Error.
- **Logic**: Verify email and passcode match DB records. Set a secure httpOnly cookie (session).

### 2. Game State
- **Action**: `getGameState()`
- **Response**: 
  ```typescript
  {
    participant: Participant,
    config: {
      components: ComponentDef[] // The static list of all components
    }
  }
  ```

### 3. Progression
- **Action**: `completeComponent(componentId: string)`
- **Response**: `{ success: true, newUnlockedIds: string[], isBingo: boolean }`
- **Logic**: 
    - Add `componentId` to `participant.unlockedComponentIds`.
    - Check if this triggers a "Bingo" (row/col) or full completion.
    - If full completion, update `isCompleted = true`.

### 4. Badge
- **Action**: `generateBadge()`
- **Response**: Signed URL or Base64 string of the generated image.
- **Logic**: Server-side image generation (using `satori` or similar) overlaying user name on a template.

## Component Hierarchy (Frontend)

The file structure will follow standard Next.js App Router.

- `src/app/`
    - `page.tsx`: Login Screen (Quest Entry).
    - `game/`
        - `page.tsx`: The Bingo Board.
        - `layout.tsx`: Handles session check.
        - `components/`
            - `BingoGrid.tsx`: The main responsive grid.
            - `BingoCard.tsx`: Individual component cell (Locked/Unlocked/Completed states).
            - `ComponentDrawer.tsx`: The slide-out or modal details view for a component.
            - `QuestBadge.tsx`: The winning badge component.
    - `api/` (Optional, mostly using Server Actions).

## Safety & Security
- **Authentication**: Simple Passcode + Email. Not high security, but sufficient for a workshop.
- **Validation**: Zod schemas for all inputs.
- **State**: Server-side validation of progression (cannot "unlock" future components without verified steps, although for a workshop we might trust the client "Start Codelab" trigger, or verify a secret code from the codelab completion). 
    - *Decision*: Trust the client "Complete" button for this iteration to reduce friction/complexity, unless "Codeword" verification is requested.

## Aesthetics & UX Plan
- **Theme**: "Premium Quest". Dark background, glowing accents.
- **Animations**: `framer-motion`.
    - Card flip or "Stamp" animation on completion.
    - Particle explosion on Bingo.
    - Smooth layout transitions for grid.

## UI/UX "Impeccable" Requirements
(Addressing Audit Checklist)
- **Loading States**: 
    - Dashboard will show a `GridSkeleton` (pulse effect) while fetching user state.
    - Login button: Shows spinner and is `disabled` during submission.
- **Error Handling**: 
    - Login: Inline error message "Invalid Passcode" (no generic alerts).
    - Network: Retry button if "Complete Codelab" fails.
- **Empty States**: 
    - If no components convert to the config, show a "Maintenance Mode" friendly screen (though unlikely with static config).
- **Accessibility**:
    - Grid Navigation: Arrow key support to move between bingo cells.
    - Contrast: Ensure Dark Mode text meets WCAG AA.
    - Labels: All inputs (Passcode) have associated `htmlFor` labels.
