# Hued Bracelets Shopify Theme

## Stack
- **Theme:** Custom theme (pre-OS 2.0 with JSON templates hybrid)
- **CSS:** Custom properties via `css-variables.liquid`, overrides in `custom.css`
- **JS:** jQuery 3.1.1 + vanilla JS, lazy-loaded via custom optimizer
- **Target aesthetic:** Pura Vida Bracelets (puravidabracelets.com)

## Critical Architecture Rules

### CSS Loading Order (this determines specificity wins)
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

### Scope Rules (memorize these)
- **Sections have PRIVATE scope** — variables from templates don't pass to sections
- **Snippets inherit parent scope** + receive explicit parameters via `{% render 'name', var: value %}`
- Section settings accessed via `section.settings.setting_id`

## File Locations

| Purpose | File | Notes |
|---------|------|-------|
| CSS overrides | `assets/custom.css` | ~1800 lines, well-commented sections |
| CSS variables | `snippets/css-variables.liquid` | All `--var-name` definitions |
| Homepage order | `templates/index.json` | Section ordering and settings |
| Header | `sections/header.liquid` | Already has HUED REDESIGN comments |
| Product cards | `snippets/product-item.liquid` | Includes swatch/quick-add logic |
| Product badges | `snippets/product-badges.liquid` | Sale/new/etc badges |

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

## Breakpoints (from theme inspection)

```css
@media (max-width: 768px) { /* Tablet/mobile */ }
@media (max-width: 600px) { /* Mobile only */ }
@media (min-width: 769px) { /* Desktop */ }
```

## Development Workflow

```bash
# Start dev server (from hued-theme directory)
shopify theme dev --store=huedbracelets --theme=155690074364

# Push to development theme
shopify theme push --theme=155690074364

# Check for Liquid errors
shopify theme check
```

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
- Product swatch reveal on hover (lines 15-139)
- SSW rewards/wishlist styling (lines 150-170)
- Accordion components (lines 188-230)
- Cart terms section (lines 232-250)
- Footer tapbar positioning (lines 252-282)
- **HEADER REDESIGN** (lines 289-600+) — Pura Vida style layout
- **FILTER/SORT DRAWER** (lines 1300-1708)
- **COLLECTION HERO BANNER** (lines 1710-1840)

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

## Testing Checklist

Before committing any change:
- [ ] Hard refresh browser (Cmd+Shift+R) — custom.css is cached aggressively
- [ ] Test at 375px width (mobile)
- [ ] Test at 768px width (tablet)
- [ ] Test at 1440px width (desktop)
- [ ] Check browser console for Liquid errors
- [ ] Verify theme customizer settings still work

## Do Not

- ❌ Edit `settings_data.json` directly (Shopify overwrites it)
- ❌ Edit any `.min.css` file
- ❌ Delete `*-hulkapps-backup.liquid` files
- ❌ Remove existing schema settings (breaks saved configurations)
- ❌ Hardcode colors — use CSS variables

## For Complex Tasks

See detailed patterns in:
- `.claude/skills/shopify-css/SKILL.md` — CSS specificity, hover effects, responsive patterns
- `.claude/skills/shopify-sections/SKILL.md` — Section creation, schema patterns, blocks
- `docs/liquid-debugging.md` — Troubleshooting when changes don't appear
