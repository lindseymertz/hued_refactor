# Shopify CSS Override Patterns for Hued Theme

## When to Use This Skill
- Adding or modifying CSS styles
- Fixing specificity/override issues
- Implementing hover effects, transitions, animations
- Responsive design adjustments
- Debugging "CSS not applying" problems

## CSS Cascade in This Theme

**Load order (determines which styles win):**
1. `css-variables.liquid` → `:root` custom properties
2. Template CSS (`theme-index.min.css`, `theme-collection.min.css`, etc.)
3. `custom.css` ← **YOUR CHANGES GO HERE** (always wins due to load order)

Since `custom.css` loads last, you often don't need high specificity — but when overriding component styles that have multi-class selectors, match or exceed their specificity.

## Specificity Cheatsheet

```css
/* Specificity: 0-1-0 — Usually insufficient for overrides */
.button { }

/* Specificity: 0-2-0 — Safe override level */
.product-item .button { }

/* Specificity: 0-3-0 — Strong override */
.header--redesign .header-tools .button { }

/* Class + attribute — Very specific */
.product-item[data-aos="fade-up"] { }

/* AVOID: !important trap (only for third-party apps) */
.ssw-reward-btn { background: #27bdbe !important; }
```

## Hued Theme CSS Variables

Always use these instead of hardcoding values:

```css
/* Primary brand colors */
color: var(--link-color);              /* Teal #27bdbe */
color: var(--body-color);              /* Dark text #303030 */
background: var(--background-color);   /* White */

/* Opacity variants (pre-calculated) */
color: var(--link-color-opacity-50);
background: var(--body-color-opacity-10);

/* Typography */
font-family: var(--primary-font);
font-family: var(--secondary-font);     /* Headings */
font-size: var(--body-size);

/* Layout */
padding-left: var(--page-gutter);       /* 164px desktop alignment */
padding-left: var(--page-gutter-mobile); /* 20px mobile */

/* Buttons */
background: var(--button-background);
color: var(--button-color);

/* Badges */
background: var(--sale-background);
background: var(--new-product-background);
```

## Common Override Patterns

### Override Header Elements
```css
/* Header already has .header--redesign modifier */
.header--redesign .header-logo { }
.header--redesign .header-tools { }
.header--redesign .header-navigation-inline { }
```

### Override Product Cards
```css
/* Product grid items */
.product-item { }
.product-item__wrapper { }
.product-item__image-wrapper { }
.product-item-details { }
.product--item-title { }
.product-item-price { }

/* Swatch reveal (already styled in custom.css ~line 15) */
.product-item-variant-swatch-wrap { }
.product-item:hover .product-item-variant-swatch-wrap { }
```

### Override Collection Pages
```css
/* Collection hero (already in custom.css ~line 1710) */
.collection-hero { }
.collection-hero__content { }
.collection-hero__title { }

/* Filter drawer (already in custom.css ~line 1300) */
.filter-drawer { }
.filter-drawer__content { }
```

## Image Hover Swap Pattern

The theme already has `show_second_image_on_hover` setting. To style:

```css
/* Primary image */
.product-item-image img {
  transition: opacity 0.4s ease;
}

/* Secondary image (rendered by image.liquid snippet) */
.product-item-image .image-secondary {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.product-item:hover .image-secondary {
  opacity: 1;
}

.product-item:hover .image-primary {
  opacity: 0;
}
```

## Responsive Patterns

```css
/* Mobile-first base (no media query) */
.my-element {
  padding: var(--page-gutter-mobile);
}

/* Tablet and up */
@media (min-width: 769px) {
  .my-element {
    padding: var(--page-gutter);
  }
}

/* Mobile only (use sparingly) */
@media (max-width: 768px) {
  .my-element {
    /* mobile overrides */
  }
}

/* Small mobile */
@media (max-width: 600px) {
  .my-element {
    /* small screen tweaks */
  }
}
```

## Animation Patterns

```css
/* Fade in */
.element {
  opacity: 0;
  transition: opacity 0.3s ease;
}
.element.is-visible {
  opacity: 1;
}

/* Slide up (theme uses AOS library) */
[data-aos="fade-up"] {
  transform: translateY(20px);
  opacity: 0;
  transition: transform 0.6s ease, opacity 0.6s ease;
}
[data-aos="fade-up"].aos-animate {
  transform: translateY(0);
  opacity: 1;
}

/* Disable AOS on mobile (already in custom.css line 135) */
@media (max-width: 600px) {
  html.js [data-aos^=fade][data-aos^=fade] {
    opacity: 1 !important;
    transform: translateZ(0) !important;
  }
}
```

## Drawer/Modal Patterns

```css
/* Overlay */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 999;
}
.drawer-overlay.is-active {
  opacity: 1;
  visibility: visible;
}

/* Slide-in drawer */
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 90vw;
  height: 100%;
  background: #fff;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
}
.drawer.is-open {
  transform: translateX(0);
}
```

## Debugging CSS Issues

### Change not appearing?
1. **Hard refresh** — Cmd+Shift+R (custom.css is cached)
2. **Check file** — Verify editing `assets/custom.css`, not a backup
3. **Check syntax** — Missing semicolon or brace breaks subsequent rules
4. **Check specificity** — Inspect element, see which rule wins

### Inspect specificity in DevTools:
1. Right-click element → Inspect
2. Look at Styles panel
3. Crossed-out rules = overridden
4. Hover rule to see specificity score

### Cache-busting during dev:
Add version param in theme.liquid (temporary, remove for production):
```liquid
{{ 'custom.css' | asset_url | append: '?v=' | append: 'now' | date: '%s' | stylesheet_tag }}
```

## Common Mistakes

❌ **Editing wrong file**
```css
/* DON'T edit section-header.min.css */
/* DO add to custom.css */
```

❌ **Insufficient specificity**
```css
/* Won't work — too generic */
.button { color: red; }

/* Will work — matches or exceeds original */
.product-item .button { color: red; }
```

❌ **Forgetting mobile**
```css
/* Desktop-only change will break mobile */
.element { width: 400px; }

/* Better */
.element {
  width: 100%;
  max-width: 400px;
}
```

❌ **Hardcoding colors**
```css
/* Don't */
color: #27bdbe;

/* Do */
color: var(--link-color);
```

## Section Header Template

Always add this comment block when creating new CSS sections:

```css
/* ===========================================
   SECTION NAME - Brief description
   Date: YYYY-MM-DD
   =========================================== */

.my-new-styles {
  /* styles */
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .my-new-styles {
    /* mobile styles */
  }
}

/* ===========================================
   END SECTION NAME
   =========================================== */
```
