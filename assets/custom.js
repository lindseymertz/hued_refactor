jQuery(document).ready(function($) {
  $('.product-item-variant-swatch-wrap [data-product-swatch-input]').on('change', function(radioElement) {
    var $this = $(this),
        value = $this.val(),
        swatchWrap = $this.parents('.product-item-variant-swatch-wrap').find('.product-select-variant');

    const options = $this.parents('.product-swatches').find('.form-field__swatch-options');
    let current_option = '';
    if (options) {
      options.each(function () {
        if (current_option === '') {
          current_option = $(this).find('[data-product-swatch-input]:checked').val();
        } else {
          current_option = current_option + ' / ' + $(this).find('[data-product-swatch-input]:checked').val();
        }
      });
    }

    swatchWrap.find('option').each(function() {
      if ( $(this).text() == value ) {
        if ( ! $(this).prop('disabled') ) {
          swatchWrap.val($(this).attr('value'));
          swatchWrap.next('button').text('Add to Cart').removeClass('disabled');
        } else {
          swatchWrap.next('button').text('Sold Out').addClass('disabled');
        }
      }
      console.log('current = ', current_option);
      console.log('selected = ', $(this).text());
      if ($(this).text() == current_option) {
        $(this).parents('.product-item__wrapper').find('[data-selected-variant]').val($(this).attr('value'));
      }
    });
  });

  $('[data-item-add-to-cart]').on('click', function() {
    var $this = $(this);

    if ( $this.hasClass('disabled') ) return;

    $this.addClass('loading');
    const variantID = $this.parents('.product-item-variant-swatch-wrap').find('[data-selected-variant]').val();

    $.ajax({ // Add items to Cart
      type: 'POST',
      url: '/cart/add.js',
      data: {
        items: [{
          id: variantID,
          quantity: 1,
        }]
      },
      dataType: 'json',
      success: function() {
        window.fetch('/cart.js')
        .then(response => response.json())
        .then(data => {
          window.wetheme.drawer._toggleRightDrawer('cart', true, { cart: data });
          $('[data-header-cart-count]').text(data.item_count);
        });
        $this.removeClass('loading');
      }
    });
  });
});

/* ===========================================
   QUICK ADD MODAL - JavaScript
   Date: 2026-01-18
   =========================================== */

(function() {
  const modal = document.querySelector('[data-quick-add-modal]');
  const overlay = document.querySelector('[data-quick-add-overlay]');
  const closeBtn = document.querySelector('[data-quick-add-close]');
  const mainImage = document.querySelector('[data-quick-add-main-image]');
  const titleEl = document.querySelector('[data-quick-add-title]');
  const priceEl = document.querySelector('[data-quick-add-price]');
  const optionsEl = document.querySelector('[data-quick-add-options]');
  const submitBtn = document.querySelector('[data-quick-add-submit]');
  const viewLink = document.querySelector('[data-quick-add-link]');
  const prevBtn = document.querySelector('[data-quick-add-prev]');
  const nextBtn = document.querySelector('[data-quick-add-next]');

  let currentProduct = null;
  let currentImages = [];
  let currentImageIndex = 0;
  let selectedVariant = null;

  // Open modal
  document.addEventListener('click', function(e) {
    const trigger = e.target.closest('[data-quick-add-trigger]');
    if (!trigger) return;

    e.preventDefault();
    e.stopPropagation();

    const productUrl = trigger.dataset.productUrl;
    if (productUrl) {
      fetchProduct(productUrl);
    }
  });

  // Close modal
  function closeModal() {
    modal.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    currentProduct = null;
    selectedVariant = null;
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  // Fetch product data
  async function fetchProduct(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      currentProduct = data.product;
      renderModal(currentProduct);
      openModal();
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  }

  function openModal() {
    modal.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  // Render modal content
  function renderModal(product) {
    // Title and price
    titleEl.textContent = product.title;
    priceEl.textContent = formatMoney(product.variants[0].price);

    // Images
    currentImages = product.images || [];
    currentImageIndex = 0;
    updateImage();

    // Product link
    viewLink.href = '/products/' + product.handle;

    // Options (Size)
    renderOptions(product);

    // Reset submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'ADD TO CART';
  }

  // Render size options
  function renderOptions(product) {
    optionsEl.innerHTML = '';

    const sizeOption = product.options.find(opt =>
      opt.name.toLowerCase() === 'size'
    );

    if (!sizeOption) {
      // No size option - check if single variant available
      if (product.variants.length === 1 && product.variants[0].available) {
        selectedVariant = product.variants[0];
        submitBtn.disabled = false;
      } else if (product.variants.length === 1) {
        submitBtn.textContent = 'SOLD OUT';
        submitBtn.disabled = true;
      }
      return;
    }

    const sizeIndex = product.options.findIndex(opt =>
      opt.name.toLowerCase() === 'size'
    );

    const label = document.createElement('span');
    label.className = 'quick-add-modal__option-label';
    label.textContent = 'Size:';
    optionsEl.appendChild(label);

    const grid = document.createElement('div');
    grid.className = 'quick-add-modal__size-grid';

    sizeOption.values.forEach(size => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quick-add-modal__size-btn';
      btn.textContent = size;
      btn.dataset.size = size;

      // Check availability
      const variant = product.variants.find(v => {
        const optionKey = 'option' + (sizeIndex + 1);
        return v[optionKey] === size;
      });

      if (!variant || !variant.available) {
        btn.disabled = true;
      }

      btn.addEventListener('click', function() {
        selectSize(this, size, sizeIndex, product);
      });

      grid.appendChild(btn);
    });

    optionsEl.appendChild(grid);
  }

  function selectSize(btn, size, sizeIndex, product) {
    // Remove previous selection
    document.querySelectorAll('.quick-add-modal__size-btn').forEach(b => {
      b.classList.remove('is-selected');
    });

    btn.classList.add('is-selected');

    // Find variant
    const optionKey = 'option' + (sizeIndex + 1);
    selectedVariant = product.variants.find(v => v[optionKey] === size);

    if (selectedVariant && selectedVariant.available) {
      submitBtn.disabled = false;
      priceEl.textContent = formatMoney(selectedVariant.price);
    }
  }

  // Image navigation
  function updateImage() {
    if (currentImages.length === 0) {
      mainImage.src = '';
      mainImage.alt = '';
      return;
    }

    mainImage.src = currentImages[currentImageIndex].src;
    mainImage.alt = currentImages[currentImageIndex].alt || '';

    prevBtn.disabled = currentImageIndex === 0;
    nextBtn.disabled = currentImageIndex === currentImages.length - 1;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      if (currentImageIndex > 0) {
        currentImageIndex--;
        updateImage();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      if (currentImageIndex < currentImages.length - 1) {
        currentImageIndex++;
        updateImage();
      }
    });
  }

  // Add to cart
  if (submitBtn) {
    submitBtn.addEventListener('click', async function() {
      if (!selectedVariant) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'ADDING...';

      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: selectedVariant.id,
            quantity: 1
          })
        });

        if (response.ok) {
          submitBtn.textContent = 'ADDED!';

          // Update cart count if element exists
          const cartCount = document.querySelector('.header-cart-count');
          if (cartCount) {
            const currentCount = parseInt(cartCount.textContent) || 0;
            cartCount.textContent = currentCount + 1;
          }

          // Trigger cart drawer if available
          if (typeof theme !== 'undefined' && theme.cart && theme.cart.refresh) {
            theme.cart.refresh();
          }

          setTimeout(() => {
            closeModal();
          }, 1000);
        } else {
          throw new Error('Failed to add to cart');
        }
      } catch (error) {
        console.error('Add to cart error:', error);
        submitBtn.textContent = 'ERROR - TRY AGAIN';
        submitBtn.disabled = false;
      }
    });
  }

  // Format money helper
  function formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2).replace(/\.00$/, '');
  }

})();

/* ===========================================
   END QUICK ADD MODAL JS
   =========================================== */

/* ===========================================
   FILTER/SORT DRAWER - JavaScript
   Date: 2026-01-18
   =========================================== */

(function() {
  const filterDrawer = document.querySelector('[data-filter-drawer]');
  const filterOverlay = document.querySelector('[data-filter-overlay]');
  const filterClose = document.querySelector('[data-filter-close]');
  const filterApply = document.querySelector('[data-filter-apply]');
  const filterTrigger = document.querySelector('[data-filter-trigger]');

  if (!filterDrawer) return;

  // Collect filter state
  let filterState = {
    sort_by: null,
    filters: []
  };

  // Open drawer
  function openFilterDrawer() {
    filterDrawer.classList.add('is-open');
    filterOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    filterDrawer.setAttribute('aria-hidden', 'false');
  }

  // Close drawer
  function closeFilterDrawer() {
    filterDrawer.classList.remove('is-open');
    filterOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
    filterDrawer.setAttribute('aria-hidden', 'true');
  }

  // Trigger button
  if (filterTrigger) {
    filterTrigger.addEventListener('click', openFilterDrawer);
  }

  // Also support old button if present
  const oldTrigger = document.querySelector('[data-drawer-open-btn]');
  if (oldTrigger) {
    oldTrigger.addEventListener('click', function(e) {
      e.preventDefault();
      openFilterDrawer();
    });
  }

  // Close button
  if (filterClose) {
    filterClose.addEventListener('click', closeFilterDrawer);
  }

  // Overlay click
  if (filterOverlay) {
    filterOverlay.addEventListener('click', closeFilterDrawer);
  }

  // Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && filterDrawer.classList.contains('is-open')) {
      closeFilterDrawer();
    }
  });

  // Apply button - build URL and navigate
  if (filterApply) {
    filterApply.addEventListener('click', function() {
      const params = new URLSearchParams();

      // Get sort value
      const sortInput = filterDrawer.querySelector('input[name="sort_by"]:checked');
      if (sortInput && sortInput.value) {
        params.set('sort_by', sortInput.value);
      }

      // Get filter values
      const filterInputs = filterDrawer.querySelectorAll('[data-filter-input]:checked');
      filterInputs.forEach(function(input) {
        params.append(input.name, input.value);
      });

      // Build URL
      const currentPath = window.location.pathname;
      const queryString = params.toString();
      const newUrl = queryString ? currentPath + '?' + queryString : currentPath;

      // Navigate
      window.location.href = newUrl;
    });
  }

  // Update product count dynamically (optional enhancement)
  function updateProductCount() {
    const countEl = document.querySelector('[data-filter-count]');
    if (!countEl) return;

    // Count checked filters
    const checkedFilters = filterDrawer.querySelectorAll('[data-filter-input]:checked').length;

    if (checkedFilters > 0) {
      countEl.textContent = checkedFilters + ' filter(s) selected';
    } else {
      // Reset to original count
      const originalCount = countEl.dataset.originalCount || countEl.textContent;
      countEl.textContent = originalCount;
    }
  }

  // Store original count
  const countEl = document.querySelector('[data-filter-count]');
  if (countEl) {
    countEl.dataset.originalCount = countEl.textContent;
  }

  // Listen for filter changes
  const allFilterInputs = filterDrawer.querySelectorAll('[data-filter-input]');
  allFilterInputs.forEach(function(input) {
    input.addEventListener('change', updateProductCount);
  });

})();

/* ===========================================
   END FILTER/SORT DRAWER JS
   =========================================== */