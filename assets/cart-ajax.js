(function () {
  function formatMoney(cents) {
    var value = Number(cents || 0) / 100;
    return 'Rs.' + value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  function cartItemHtml(item) {
    var imageUrl = item.image
      ? item.image + (item.image.indexOf('?') > -1 ? '&' : '?') + 'width=180'
      : '';
    var image = item.image
      ? '<img src="' + imageUrl + '" alt="' + escapeHtml(item.product_title) + '" loading="lazy">'
      : '';
    var variant = item.variant_title && item.variant_title !== 'Default Title'
      ? '<span>' + escapeHtml(item.variant_title) + '</span>'
      : '';

    return [
      '<div class="cart-drawer__item">',
        '<a class="cart-drawer__media" href="' + item.url + '">' + image + '</a>',
        '<div class="cart-drawer__item-info">',
          '<a href="' + item.url + '"><strong>' + escapeHtml(item.product_title) + '</strong></a>',
          variant,
          '<span>' + formatMoney(item.final_line_price) + '</span>',
          '<input class="quantity-input" type="number" name="updates[]" min="0" value="' + item.quantity + '" aria-label="Quantity for ' + escapeHtml(item.product_title) + '">',
        '</div>',
      '</div>'
    ].join('');
  }

  function updateCartDrawer(cart) {
    var count = document.querySelector('[data-cart-count-text]');
    var empty = document.querySelector('[data-cart-empty]');
    var form = document.querySelector('[data-cart-form]');
    var items = document.querySelector('[data-cart-items]');
    var total = document.querySelector('[data-cart-total]');

    if (count) {
      count.textContent = cart.item_count > 0 ? 'Cart (' + cart.item_count + ')' : 'Cart';
    }

    if (empty && form) {
      empty.classList.toggle('is-hidden', cart.item_count > 0);
      form.classList.toggle('is-hidden', cart.item_count === 0);
    }

    if (items) {
      items.innerHTML = cart.items.map(cartItemHtml).join('');
    }

    if (total) {
      total.textContent = formatMoney(cart.total_price);
    }
  }

  function openCartDrawer() {
    var toggle = document.getElementById('HeaderCartToggle');
    if (toggle) toggle.checked = true;
  }

  function setButtonLoading(button, loading) {
    if (!button) return;
    button.disabled = loading;
    button.classList.toggle('is-loading', loading);
  }

  document.addEventListener('submit', function (event) {
    var form = event.target.closest('.product-card__cart-form');
    if (!form) return;

    event.preventDefault();
    var button = form.querySelector('button[type="submit"]');
    setButtonLoading(button, true);

    fetch('/cart/add.js', {
      method: 'POST',
      body: new FormData(form),
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Add to cart failed');
        return fetch('/cart.js', { headers: { 'Accept': 'application/json' } });
      })
      .then(function (response) {
        return response.json();
      })
      .then(function (cart) {
        updateCartDrawer(cart);
        openCartDrawer();
      })
      .catch(function () {
        form.submit();
      })
      .finally(function () {
        setButtonLoading(button, false);
      });
  });
})();
