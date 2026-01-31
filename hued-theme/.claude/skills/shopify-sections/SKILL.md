# Shopify Section Patterns for Hued Theme

## When to Use This Skill
- Creating new homepage sections
- Modifying existing section settings/blocks
- Adding customizer options to sections
- Understanding section scope and data access
- Debugging "section not appearing" issues

## Section Anatomy

Every section file has three parts:

```liquid
{% comment %} 1. LIQUID LOGIC & DATA PREP {% endcomment %}
{% assign my_var = section.settings.some_setting %}

{% comment %} 2. HTML MARKUP {% endcomment %}
<section class="my-section" id="section-{{ section.id }}">
  <div class="my-section__content">
    {{ my_var }}
  </div>
</section>

{% comment %} 3. SCHEMA (must be at root level, outside any tags) {% endcomment %}
{% schema %}
{
  "name": "My Section",
  "settings": [],
  "blocks": [],
  "presets": []
}
{% endschema %}
```

## Critical Scope Rules

### Sections Have PRIVATE Scope
```liquid
{% comment %} In templates/index.json or theme.liquid: {% endcomment %}
{% assign global_var = "hello" %}

{% comment %} In sections/my-section.liquid: {% endcomment %}
{{ global_var }}  → Outputs NOTHING! Variables don't pass to sections.
```

### What Sections CAN Access
```liquid
{% comment %} Global Shopify objects (always available) {% endcomment %}
{{ shop.name }}
{{ cart.item_count }}
{{ customer.email }}
{{ collection.title }}  {# if on collection page #}
{{ product.title }}      {# if on product page #}

{% comment %} Section-specific data {% endcomment %}
{{ section.id }}                    {# unique identifier #}
{{ section.settings.my_setting }}   {# settings from schema #}
{{ section.blocks }}                {# block array #}

{% comment %} Request data {% endcomment %}
{{ request.design_mode }}  {# true if in theme editor #}
{{ template.name }}        {# 'collection', 'product', etc. #}
```

### Snippets Inherit Scope + Explicit Params
```liquid
{% comment %} In section: {% endcomment %}
{% render 'product-card', 
   product: product,
   show_vendor: section.settings.show_vendor,
   image_size: 'medium' %}

{% comment %} In snippets/product-card.liquid: {% endcomment %}
{{ product.title }}      {# works — passed explicitly #}
{{ show_vendor }}        {# works — passed explicitly #}
{{ section.settings }}   {# DOES NOT WORK — section not in scope #}
```

## Schema Reference

### Basic Settings Types

```json
{
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Welcome"
    },
    {
      "type": "richtext",
      "id": "description",
      "label": "Description"
    },
    {
      "type": "image_picker",
      "id": "image",
      "label": "Background Image"
    },
    {
      "type": "url",
      "id": "link",
      "label": "Link"
    },
    {
      "type": "checkbox",
      "id": "show_title",
      "label": "Show title",
      "default": true
    },
    {
      "type": "range",
      "id": "opacity",
      "min": 0,
      "max": 100,
      "step": 10,
      "unit": "%",
      "label": "Overlay opacity",
      "default": 50
    },
    {
      "type": "select",
      "id": "alignment",
      "label": "Text alignment",
      "options": [
        { "value": "left", "label": "Left" },
        { "value": "center", "label": "Center" },
        { "value": "right", "label": "Right" }
      ],
      "default": "center"
    },
    {
      "type": "color",
      "id": "text_color",
      "label": "Text color",
      "default": "#ffffff"
    },
    {
      "type": "collection",
      "id": "collection",
      "label": "Collection"
    },
    {
      "type": "product",
      "id": "product",
      "label": "Product"
    }
  ]
}
```

### Blocks (Repeatable Content)

```json
{
  "blocks": [
    {
      "type": "slide",
      "name": "Slide",
      "limit": 6,
      "settings": [
        {
          "type": "image_picker",
          "id": "image",
          "label": "Image"
        },
        {
          "type": "text",
          "id": "caption",
          "label": "Caption"
        }
      ]
    },
    {
      "type": "button",
      "name": "Button",
      "limit": 2,
      "settings": [
        {
          "type": "text",
          "id": "text",
          "label": "Button text"
        },
        {
          "type": "url",
          "id": "link",
          "label": "Button link"
        }
      ]
    }
  ]
}
```

### Presets (REQUIRED for "Add section")

```json
{
  "presets": [
    {
      "name": "Hero Banner",
      "blocks": [
        { "type": "button" }
      ]
    }
  ]
}
```

**Without `presets`, the section won't appear in the "Add section" menu!**

## Rendering Blocks

```liquid
{% for block in section.blocks %}
  {% case block.type %}
    {% when 'slide' %}
      <div class="slide" {{ block.shopify_attributes }}>
        {% if block.settings.image %}
          {{ block.settings.image | image_url: width: 1200 | image_tag }}
        {% endif %}
        <p>{{ block.settings.caption }}</p>
      </div>
    
    {% when 'button' %}
      <a href="{{ block.settings.link }}" class="button" {{ block.shopify_attributes }}>
        {{ block.settings.text }}
      </a>
  {% endcase %}
{% endfor %}
```

**Always include `{{ block.shopify_attributes }}`** — this enables click-to-edit in the theme editor.

## Safe Setting Access

```liquid
{% comment %} Check before using (prevents nil errors) {% endcomment %}
{% if section.settings.heading != blank %}
  <h2>{{ section.settings.heading }}</h2>
{% endif %}

{% comment %} Or use default filter {% endcomment %}
<h2>{{ section.settings.heading | default: 'Default Title' }}</h2>

{% comment %} For images (check object existence) {% endcomment %}
{% if section.settings.image %}
  {{ section.settings.image | image_url: width: 800 | image_tag: class: 'hero-image' }}
{% endif %}

{% comment %} For colors {% endcomment %}
{% if section.settings.text_color != blank %}
  style="color: {{ section.settings.text_color }};"
{% endif %}
```

## Creating a New Section (Step-by-Step)

### 1. Create the section file
`sections/index-my-section.liquid`

```liquid
{% comment %}
  Section: My Custom Section
  Purpose: Brief description
{% endcomment %}

{{ 'section-my-section.css' | asset_url | stylesheet_tag }}

<section class="my-section" id="shopify-section-{{ section.id }}">
  <div class="my-section__container page-width">
    {% if section.settings.heading != blank %}
      <h2 class="my-section__heading">{{ section.settings.heading }}</h2>
    {% endif %}
    
    <div class="my-section__content">
      {% for block in section.blocks %}
        <div class="my-section__item" {{ block.shopify_attributes }}>
          {{ block.settings.text }}
        </div>
      {% endfor %}
    </div>
  </div>
</section>

{% schema %}
{
  "name": "My Section",
  "tag": "section",
  "class": "my-section-wrapper",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Section Title"
    }
  ],
  "blocks": [
    {
      "type": "item",
      "name": "Item",
      "settings": [
        {
          "type": "text",
          "id": "text",
          "label": "Text"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "My Section",
      "blocks": [
        { "type": "item" },
        { "type": "item" }
      ]
    }
  ]
}
{% endschema %}
```

### 2. Add CSS (in custom.css or new file)

```css
/* In assets/custom.css */

/* ===========================================
   MY SECTION
   Date: YYYY-MM-DD
   =========================================== */

.my-section {
  padding: 60px 0;
}

.my-section__container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 var(--page-gutter);
}

.my-section__heading {
  text-align: center;
  margin-bottom: 40px;
}

.my-section__content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

@media (max-width: 768px) {
  .my-section__container {
    padding: 0 var(--page-gutter-mobile);
  }
  
  .my-section__content {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ===========================================
   END MY SECTION
   =========================================== */
```

### 3. Add to homepage (templates/index.json)

The section will appear in "Add section" menu due to `presets`. Or manually add:

```json
{
  "sections": {
    "my-section-id": {
      "type": "index-my-section",
      "settings": {
        "heading": "Featured Items"
      }
    }
  },
  "order": [
    "existing-section",
    "my-section-id",
    "another-section"
  ]
}
```

## Hued Theme Existing Sections

Reference these for patterns:

| Section | File | Purpose |
|---------|------|---------|
| Hero | `index-image-with-text-overlay.liquid` | Full-width hero with text |
| Category Cards | `index-category-cards.liquid` | Shop by category grid |
| Featured Collection | `index-featured-collection.liquid` | Product grid |
| Newsletter | `index-newsletter.liquid` | Email signup |
| Rich Text | `index-rich-text.liquid` | Text content block |
| Features | `index-features.liquid` | Feature grid/cards |

## Debugging Sections

### Section not in "Add section" menu?
- Check for `presets` array in schema
- Validate JSON syntax at jsonlint.com
- Check file is in `sections/` folder with `.liquid` extension

### Settings not saving?
- Schema JSON syntax error (missing comma, extra comma)
- Setting `id` mismatch between schema and Liquid reference
- Check browser console for errors

### Block content not rendering?
```liquid
{% comment %} Debug: output block data {% endcomment %}
<pre style="display:none;">{{ section.blocks | json }}</pre>

{% comment %} Check block count {% endcomment %}
{% if section.blocks.size > 0 %}
  {% for block in section.blocks %}
    {{ block.type }}: {{ block.settings | json }}
  {% endfor %}
{% else %}
  <p>No blocks configured</p>
{% endif %}
```

### Section styles not applying?
1. Check CSS file is linked in section:
   ```liquid
   {{ 'section-name.css' | asset_url | stylesheet_tag }}
   ```
2. Or add styles to `custom.css` (loads globally)
3. Check class names match between Liquid and CSS
