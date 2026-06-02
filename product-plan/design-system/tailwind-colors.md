# Tailwind Color Configuration

## Color Choices

- **Primary:** `blue` — Used for buttons, links, key accents, CTA buttons
- **Secondary:** `amber` — Used for tags, highlights, comparison section elements
- **Neutral:** `slate` — Used for backgrounds, text, borders

## Usage Examples

Primary CTA button: `bg-blue-500/80 hover:bg-blue-500/90 backdrop-blur-md border border-white/20 rounded-full shadow-[0_4px_16px_rgba(59,130,246,0.25)]`
Secondary badge: `bg-amber-500/15 border border-amber-400/20 text-amber-300`
Neutral text: `text-slate-600 dark:text-slate-400`
Glass card: `bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl`

## Glassmorphism Pattern

Structural containers use:
- `backdrop-blur-xl` or `backdrop-blur-2xl`
- `bg-white/N` where N is 5-70 depending on depth
- `border border-white/10` or `border-white/20`
- Colored shadows matching the section tint (blue, emerald, amber)

## Neumorphism Pattern

Interactive pills use:
- Inactive: `shadow-[3px_3px_8px_rgba(0,0,0,0.06),-2px_-2px_6px_rgba(255,255,255,0.9)]`
- Active: `shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08),inset_-1px_-1px_3px_rgba(255,255,255,0.6)]`
- `rounded-full` shape
