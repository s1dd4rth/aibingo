---
# Status Handling Standard

**Purpose**: Ensure consistent UI/UX for components that can be locked, unlocked, or completed.

**Pattern**:
1. Component receives a `status: 'locked' | 'unlocked' | 'completed'` prop.
2. Conditional rendering:
   - `disabled` attribute set when status is `'locked'`.
   - Visual styling uses distinct class names (e.g., opacity, border color).
3. No hard‑coded status logic inside the component; status calculation occurs in parent.

**Example** (BingoCard):
```tsx
<BingoCard status={status} onClick={!isLocked ? onClick : undefined} disabled={isLocked} />
```

**Best Practices**:
- Keep status determination out of the component.
- Use a utility like `cn` for conditional classes.
- Include an `aria‑disabled` attribute when disabling.

**Exceptions**: None. All interactive components that represent progress should use this pattern.
---
