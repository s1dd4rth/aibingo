---
# Copy‑to‑Clipboard Standard

**Purpose**: Provide a consistent UX for copy actions and manage copied state.

**Pattern**:
1. Component exposes a `handleCopy` function that
   * writes text to the clipboard via `navigator.clipboard.writeText`.
   * sets a `copied` state flag to `true`.
   * resets the flag after a short delay (e.g., 2 s).
2. Render a button that
   * shows a *Copy* icon and text when not copied.
   * shows a *Check* icon and “Copied” text while `copied` is true.
3. Button is optional; some components may only expose the copy function.

**Example** (ColabSetup):
```tsx
const [copied, setCopied] = useState(false);
const handleCopy = async () => {
  await navigator.clipboard.writeText(setupCommand);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};
```

**Best Practices**:
- Use `setTimeout` to clear the copied state.
- Avoid storing the copied string – only the flag is needed.
- Provide visual feedback (icon + text) for the copy state.
- If the component is used in multiple places, expose the copy logic as a reusable hook.
---
