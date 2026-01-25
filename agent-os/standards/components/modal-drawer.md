---
# Modal / Drawer Standard

**Purpose**: Provide a consistent modal/drawer implementation using `framer-motion` and `AnimatePresence`.

**Pattern**:
1. Use `AnimatePresence` to wrap the modal content.
2. Render a full‑screen backdrop that closes on click.
3. Use `motion.div` with `layoutId` for shared‑element transitions.
4. Keep the modal open/close state in the parent component.
5. Ensure accessibility: focus trapping, `aria-modal`, and `role="dialog"`.

**Example** (DetailDrawer):
```tsx
<AnimatePresence>
  <motion.div
    layoutId={\`card-${component.id}\`}
    className="relative ..."
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 20 }}
  >
    {/* modal content */}
  </motion.div>
</AnimatePresence>
```

**Best Practices**:
- Separate backdrop and content for easier styling.
- Avoid re‑creating the same motion variants in every modal.
- Keep the `layoutId` unique to the component instance.
- Provide a close button with an accessible label.
- Use a hook to manage open/close state if the modal is reused.
---
