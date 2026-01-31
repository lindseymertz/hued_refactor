/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
// core version + navigation, pagination modules:
class complementaryProducts extends HTMLElement {
  constructor() {
    super();

    this.parentEl = this.closest('[data-aid="complementary-products-block"]');
  }

  connectedCallback() {
    fetch(this.dataset.url)
      .then((response) => response.text())
      .then((text) => {
        const html = document.createElement('div');
        html.innerHTML = text;
        const recommendations = html.querySelector('complementary-products');
        if (recommendations && recommendations.innerHTML.trim().length) {
          if (this.parentEl) this.parentEl.classList.remove('hidden');
          this.innerHTML = recommendations.innerHTML;

          //Initialize swiper
          const swiper = new Swiper('.comp_products_swiper', {
            // Optional parameters
            slidesPerView: 1,
            spaceBetween: 10,
            direction: 'horizontal',
            effect: 'slide',
            loop: false,
            pagination: {
              el: '.swiper-pagination',
              type: 'fraction'
            },
            navigation: {
              nextEl: '.swiper-controls .thumbs-direction-nav--next',
              prevEl: '.swiper-controls .thumbs-direction-nav--prev',
            },
            breakpoints: {
              // when window width is >= 0px
              0: {
                allowTouchMove: true,
              },
              // when window width is >= 769px
              769: {
                allowTouchMove: false,
              }
            }
            
          });
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }
}

customElements.define('complementary-products', complementaryProducts);

/******/ })()
;