# CLAUDE.md — Hued Theme Development Guide

## Project Context

You are modifying a Shopify theme for **Hued Bracelets** to emulate the look/feel of **Pura Vida Bracelets**. This is incremental styling work—not a rebuild.

**Target Reference:** https://puravidabracelets.com

## Pura Vida Design Patterns to Implement

### Header/Navigation
- Dual announcement bars (promo + shipping threshold)
- Horizontal mega-menu navigation with:
  - Featured promotional images (2-3 per dropdown)
  - Multi-column link lists (Category | Most Gifted | Collections)
  - "New" and sale badges on menu items
  - "Shop All" CTAs
- Left-aligned or centered logo (Pura Vida uses left)
- Clean utility nav (Account, Rewards, Help)

### Homepage Sections
1. **Hero:** Single large lifestyle banner (not grid collage), full-width, minimal text overlay
2. **Shop by Category:** Horizontal row of circular/rounded category cards (8 items)
3. **Tabbed Product Carousel:** "Styles You'll Love" with collection filter tabs + "View All" link
4. **Additional featured collections**

### Product Cards
- Hover: swap to alternate/lifestyle image
- Inline variant swatches (colored pills for Gold/Silver/Rose Gold)
- Badges: "New" (teal/green), "Customizable" (purple), "X% off" (red)
- Clean price display ("$20" not "$20.00")
- Quick-add functionality

### Visual Language
- White backgrounds, generous whitespace
- Warm lifestyle photography
- Rounded buttons/UI elements
- Sans-serif typography
- Seasonal accent colors (adapt to current campaign)

## Theme Structure

```
hued-theme/
├── assets/           # CSS, JS, images
├── config/           # Theme settings (JSON)
├── layout/           # Base templates (theme.liquid)
├── locales/          # Translations
├── sections/         # Modular page sections
├── snippets/         # Reusable partials
└── templates/        # Page templates (JSON-based)
```

## Key Files by Task

### Header/Navigation
- `sections/header.liquid` — Main header markup & settings schema
- `snippets/navigation.liquid` — Nav menu rendering
- `snippets/navigation-mobile.liquid` — Mobile nav
- `assets/section-header.min.css` — Header styles (minified, avoid editing)
- `assets/custom.css` — Add overrides here

### Homepage
- `templates/index.json` — Section order and settings
- `sections/index-slideshow.liquid` — Slideshow/banner hero
- `sections/index-image-with-text-overlay.liquid` — Current hero section
- `sections/index-featured-collection.liquid` — Product grids
- `sections/index-collection-list.liquid` — Collection cards

### Styling
- `assets/custom.css` — **PRIMARY EDIT TARGET** for CSS changes
- `snippets/css-variables.liquid` — CSS custom properties definitions
- `assets/theme.min.css` — Core styles (avoid direct edits)

### Product Cards
- `snippets/product-item.liquid` — Product card markup
- `snippets/product-item--collection.liquid` — Collection page variant
- `snippets/product-badges.liquid` — Sale/new badges

## Coding Conventions

### CSS Changes

**Always add to `custom.css`** with clear section comments:

```css
/* ===========================================
   HEADER REDESIGN - Left Logo Layout
   Date: YYYY-MM-DD
   =========================================== */

.header {
  /* your overrides */
}
```

### Liquid Changes

When modifying `.liquid` files:

1. **Preserve existing settings schema** at bottom of section files
2. **Add new settings** rather than removing old ones (backward compatibility)
3. **Use conditional logic** for new features:

```liquid
{% if section.settings.new_feature_enabled %}
  <!-- new markup -->
{% else %}
  <!-- original markup -->
{% endif %}
```

4. **Comment your additions:**

```liquid
{% comment %} HUED REDESIGN: Added mega-menu support {% endcomment %}
```

### Settings Schema Pattern

Section settings live at bottom of `.liquid` files:

```liquid
{% schema %}
{
  "name": "Section Name",
  "settings": [
    {
      "type": "checkbox",
      "id": "new_setting",
      "label": "Enable new feature",
      "default": false
    }
  ]
}
{% endschema %}
```

## Brand Colors

```css
:root {
  --color-primary: #27bdbe;      /* Hued Teal */
  --color-text: #303030;
  --color-background: #ffffff;
  --color-background-alt: #fafafa;
}
```

## Common Patterns

### Adding a New Homepage Section

1. Create `sections/index-new-section.liquid`
2. Add to `templates/index.json` in desired position
3. Include CSS in `custom.css` or create `assets/section-new-section.css`

### Overriding Minified Styles

Don't edit `.min.css` files. Override in `custom.css`:

```css
/* Override section-header.min.css */
.header {
  /* more specific selector or !important as last resort */
}
```

### Responsive Breakpoints

Theme uses these breakpoints (based on inspection):

```css
@media (max-width: 768px) { /* tablet/mobile */ }
@media (max-width: 600px) { /* mobile */ }
@media (min-width: 769px) { /* desktop */ }
```

## Testing Checklist

Before considering a change complete:

- [ ] Desktop Chrome/Safari render correctly
- [ ] Mobile responsive (375px, 768px widths)
- [ ] No Liquid syntax errors (check Shopify preview)
- [ ] Existing functionality preserved
- [ ] Theme editor settings still work

## File Request Protocol

When starting a task, request these files:

**For header/mega-menu work:**
- `sections/header.liquid`
- `sections/announcement-bar.liquid`
- `snippets/navigation.liquid`
- `snippets/navigation-mobile.liquid`
- `assets/section-header.min.css` (reference only)
- `assets/custom.css`
- `config/settings_schema.json` (for new settings)

**For homepage hero:**
- `templates/index.json`
- `sections/index-slideshow.liquid` (preferred for single banner)
- `sections/index-image-with-text-overlay.liquid` (current)
- `assets/section-slideshow.min.css`
- `assets/custom.css`

**For "Shop by Category" section:**
- `templates/index.json`
- `sections/index-collection-list.liquid` (or create new)
- `snippets/index-collection-grid.liquid`
- `assets/custom.css`

**For tabbed product carousel:**
- `sections/index-featured-collection.liquid`
- `snippets/product-item.liquid`
- `assets/custom.css`

**For product cards:**
- `snippets/product-item.liquid`
- `snippets/product-item--collection.liquid`
- `snippets/product-badges.liquid`
- `snippets/product-swatch.liquid`
- `assets/custom.css`

**For footer:**
- `sections/footer.liquid`
- `assets/section-footer.min.css`
- `assets/custom.css`

## Implementation Priority

Suggested order for maximum visual impact:

1. **Header + Announcement Bars** — Most visible, sets tone
2. **Homepage Hero** — Immediate visual upgrade from grid to single banner
3. **Shop by Category Section** — Key Pura Vida pattern
4. **Product Cards** — Hover effects, badges, swatches
5. **Footer** — Lower priority, cleanup
6. **Collection Pages** — Apply product card changes
7. **Product Page** — Match overall aesthetic

## Output Format

When generating code changes, provide:

1. **File path** (relative to theme root)
2. **Change type:** Full replacement / Append / Specific edit
3. **The code** with clear comments
4. **Settings changes** if any (for JSON files)

Example:

```
📁 assets/custom.css
📝 APPEND to end of file

/* =========================================== 
   HEADER - Left-aligned logo
   =========================================== */
.header--logo-center {
  /* override centered layout */
  display: flex;
  justify-content: flex-start;
}
```

## Don'ts

- ❌ Don't edit `.min.css` files directly
- ❌ Don't remove existing settings schema options
- ❌ Don't delete backup files (e.g., `*-hulkapps-backup.liquid`)
- ❌ Don't hardcode text—use translations or settings
- ❌ Don't break mobile nav functionality

## Do's

- ✅ Add comprehensive CSS comments
- ✅ Use CSS custom properties for colors
- ✅ Test mobile layouts
- ✅ Preserve Liquid variable scope
- ✅ Keep changes reversible via settings when possible
