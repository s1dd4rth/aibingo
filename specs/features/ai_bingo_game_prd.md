# Product Spec: AI Workshop Bingo Game

## User Story
As a **student in an AI workshop**, I want to **play a Bingo-style learning game** where I unlock and learn AI components one by one, so that **I can understand the full AI stack from basics to future concepts in an engaging, hands-on way.**

As a **facilitator**, I want a **structured interface** to guide students through the 20 distinct AI components, ensuring they complete coding tasks for each before moving on.

## Acceptance Criteria
- [ ] **Game Board UI:** A flexible layout displaying the AI components.
    - Components are categorized by: Basics, Combos, Production, Future.
- [ ] **Interactive Mechanics:**
    - Clicking a locked/next component opens a details view.
    - Details view contains: Description, Learning Content (placeholder), and a "Start Codelab" action.
- [ ] **Progression System:**
    - Users start with the "Basics" or the first item in the sequence.
    - Completing a Codelab task marks the cell as "Stamped" / "Completed".
    - Visual feedback for completion (Bingo card stamp effect).
- [ ] **Content Support:**
    - Must support the following 20 specific components and ability to add more components later.
        1. Prompting (Basics/Actions)
        2. Embeddings (Basics/Memory)
        3. Chains (Basics/Blueprint)
        4. Rules & Regex (Basics/Safety)
        5. LLMs (Basics/Brains)
        6. Function Calling (Combos/Actions)
        7. Vector DB (Combos/Memory)
        8. RAG (Combos/Blueprint)
        9. Guardrails (Combos/Safety)
        10. Multimodal (Combos/Brains)
        11. Agents (Production/Actions)
        12. Fine-tuning (Production/Memory)
        13. Frameworks (Production/Blueprint)
        14. Red Teaming (Production/Safety)
        15. Small Models (Production/Brains)
        16. Multi-Agent (Future/Actions)
        17. Synthetic Data (Future/Memory)
        18. Flow Engineering (Future/Blueprint)
        19. Interpretability (Future/Safety)
        20. Thinking Models (Future/Brains)
- [ ] **Win Condition:**
    - Visual celebration when completing a row, column, or the entire board.

## Out of Scope
- Real-time multiplayer synchronization (each student has their own board).
- Persistent user accounts/Login (Game state can be on railway based for the 2-hour workshop).
- A simple passcode to join the game. We will upload the email and a assigned passcode to participant, that would be the entry to the game. This would give a quest like feel to the game. 
- Complex backend, minimal client-side app preferred for workshop ease.
- Once they complete the bingo learning quest they will be given a badge . This badge would be a simple image that they can download and share on social media. 

## Technical constraints
- Web Application (React/Next.js preferred).
- Responsive design.
- "Premium" aesthetic as per general guidelines (Minimal, Clean, Modern, Premium, Game-like, Fun).
- Use animation and effects to gamilfy the interactions and make it dramatic and fun. 
