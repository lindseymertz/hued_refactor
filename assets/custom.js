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