# Hued Bracelets Shopify Theme — Development Guide

## Project Context

You are modifying a Shopify theme for **Hued Bracelets** to emulate the look/feel of **Pura Vida Bracelets**. This is incremental styling work—not a rebuild.

**Target Reference:** https://puravidabracelets.com
**Working Directory:** `~/Desktop/Development/projects-active/hued/hued-theme/`

## Stack
- **Theme:** Custom theme (pre-OS 2.0 with JSON templates hybrid)
- **CSS:** Custom properties via `css-variables.liquid`, overrides in `custom.css`
- **JS:** jQuery 3.1.1 + vanilla JS, lazy-loaded via custom optimizer
- **Target aesthetic:** Pura Vida Bracelets (puravidabracelets.com)

---

## Critical Architecture Rules

### CSS Loading Order (determines specificity wins)
1. `css-variables.liquid` — CSS custom properties (`:root` vars)
2. Template-specific CSS (e.g., `theme-collection.min.css`)
3. **`custom.css`** ← ALL OVERRIDES GO HERE (loaded last, line 43 of theme.liquid)

### File Hierarchy
```
theme.liquid (wrapper)
  └── {{ content_for_layout }} renders JSON template
        └── JSON template references sections by "type"
              └── Sections render snippets via {% render %}
```

### Scope Rules
- **Sections have PRIVATE scope** — variables from templates don't pass to sections
- **Snippets inherit parent scope** + receive explicit parameters via `{% render 'name', var: value %}`
- Section settings accessed via `section.settings.setting_id`

---

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

## File Locations

| Purpose | File | Notes |
|---------|------|-------|
| CSS overrides | `assets/custom.css` | ~5000 lines, well-commented sections |
| CSS variables | `snippets/css-variables.liquid` | All `--var-name` definitions |
| Homepage order | `templates/index.json` | Section ordering and settings |
| Header | `sections/header.liquid` | Already has HUED REDESIGN comments |
| Product cards | `snippets/product-item.liquid` | Includes swatch/quick-add logic |
| Product badges | `snippets/product-badges.liquid` | Sale/new/etc badges |

## Key Files by Task

**Header/Navigation:**
- `sections/header.liquid` — Main header markup & settings schema
- `snippets/navigation.liquid` — Nav menu rendering
- `snippets/navigation-mobile.liquid` — Mobile nav
- `assets/section-header.min.css` — Header styles (minified, reference only)
- `assets/custom.css` — Add overrides here

**Homepage:**
- `templates/index.json` — Section order and settings
- `sections/index-slideshow.liquid` — Slideshow/banner hero
- `sections/index-image-with-text-overlay.liquid` — Current hero section
- `sections/index-featured-collection.liquid` — Product grids
- `sections/index-collection-list.liquid` — Collection cards

**Product Cards:**
- `snippets/product-item.liquid` — Product card markup
- `snippets/product-item--collection.liquid` — Collection page variant
- `snippets/product-badges.liquid` — Sale/new badges
- `snippets/product-swatch.liquid` — Variant swatches

**Footer:**
- `sections/footer.liquid`
- `assets/section-footer.min.css`
- `assets/custom.css`

**Styling:**
- `assets/custom.css` — **PRIMARY EDIT TARGET**
- `snippets/css-variables.liquid` — CSS custom properties definitions
- `assets/theme.min.css` — Core styles (avoid direct edits)

---

## Pura Vida Design Patterns to Implement

### Header/Navigation
- Dual announcement bars (promo + shipping threshold)
- Horizontal mega-menu navigation with featured images, multi-column links, badges
- Left-aligned or centered logo
- Clean utility nav (Account, Rewards, Help)

### Homepage Sections
1. **Hero:** Single large lifestyle banner, full-width, minimal text overlay
2. **Shop by Category:** Horizontal row of circular/rounded category cards
3. **Tabbed Product Carousel:** Collection filter tabs + "View All" link
4. **Additional featured collections**

### Product Cards
- Hover: swap to alternate/lifestyle image
- Inline variant swatches (colored pills)
- Badges: "New" (teal), "Customizable" (purple), "X% off" (red)
- Clean price display ("$20" not "$20.00")
- Quick-add functionality

### Visual Language
- White backgrounds, generous whitespace
- Warm lifestyle photography
- Rounded buttons/UI elements
- Sans-serif typography
- Seasonal accent colors

---

## Existing CSS Variables (use these, don't hardcode)

```css
/* Colors */
--link-color: #27bdbe;          /* Primary teal */
--body-color: #303030;          /* Text */
--background-color: #ffffff;    /* Background */
--border-color: [from settings]
--button-background: [from settings]
--sale-color: [calculated]

/* Typography */
--primary-font: [from settings]
--secondary-font: [from settings]
--body-size: [from settings]px
--heading-size: [from settings]

/* Layout (CUSTOM - added for redesign) */
--page-gutter: 164px;           /* Desktop content alignment */
--page-gutter-mobile: 20px;     /* Mobile content alignment */

/* Navigation */
--navigation-font-size: [from settings]px
--navigation-letter-spacing: [from settings]px
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

## Breakpoints

```css
@media (max-width: 768px) { /* Tablet/mobile */ }
@media (max-width: 600px) { /* Mobile only */ }
@media (min-width: 769px) { /* Desktop */ }
```

---

## Development Workflow

```bash
# Start dev server (from hued-theme directory)
shopify theme dev --store=huedbracelets --theme=155690074364

# Push to development theme
shopify theme push --theme=155690074364

# Check for Liquid errors
shopify theme check
```

**Preview URL:** `https://huedbracelets.com/?preview_theme_id=155690074364`

---

## CSS Override Protocol

1. **Never edit `.min.css` files** — they're bundled and will be overwritten
2. **Add to `custom.css`** with section header comments:
```css
/* ===========================================
   COMPONENT NAME - Brief description
   Date: YYYY-MM-DD
   =========================================== */
```
3. **Use existing class specificity patterns:**
```css
/* Safe override (2 classes) */
.shopify-section .target-element { }

/* Section-scoped (strongest) */
.header--redesign .header-logo { }
```
4. **Avoid `!important`** except for third-party app overrides (SSW wishlist, rewards)

## Existing Customizations in custom.css

The file is organized into these sections (check before adding duplicates):
- Product swatch reveal on hover
- SSW rewards/wishlist styling
- Accordion components
- Cart terms section
- Footer tapbar positioning
- **HEADER REDESIGN** — Pura Vida style layout
- **FILTER/SORT DRAWER**
- **COLLECTION HERO BANNER**

---

## Liquid Conventions

```liquid
{% comment %} HUED REDESIGN: Description of change {% endcomment %}
```

When adding new section settings, preserve existing schema and append:
```liquid
{% schema %}
{
  "settings": [
    // ... existing settings ...
    {
      "type": "checkbox",
      "id": "new_feature",
      "label": "Enable new feature",
      "default": false
    }
  ]
}
{% endschema %}
```

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

---

## Testing Checklist

Before committing any change:
- [ ] Hard refresh browser (Cmd+Shift+R) — custom.css is cached aggressively
- [ ] Test at 375px width (mobile)
- [ ] Test at 768px width (tablet)
- [ ] Test at 1440px width (desktop)
- [ ] Check browser console for Liquid errors
- [ ] Verify theme customizer settings still work

---

## Do Not

- ❌ Edit `.min.css` files directly
- ❌ Edit `settings_data.json` directly (Shopify overwrites it)
- ❌ Remove existing settings schema options (breaks saved configurations)
- ❌ Delete `*-hulkapps-backup.liquid` files
- ❌ Hardcode colors — use CSS variables
- ❌ Break mobile nav functionality

## Do

- ✅ Add comprehensive CSS comments
- ✅ Use CSS custom properties for colors
- ✅ Test mobile layouts
- ✅ Preserve Liquid variable scope
- ✅ Keep changes reversible via settings when possible

---

## For Complex Tasks

See detailed patterns in:
- `.claude/skills/shopify-css/SKILL.md` — CSS specificity, hover effects, responsive patterns
- `.claude/skills/shopify-sections/SKILL.md` — Section creation, schema patterns, blocks
- `docs/liquid-debugging.md` — Troubleshooting when changes don't appear