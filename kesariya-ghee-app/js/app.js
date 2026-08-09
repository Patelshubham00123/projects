/* ==========================================================================
   KESARIYA FARM - A2 VEDIC GHEE APP ENGINE & STATE MANAGEMENT
   ========================================================================== */

// Product Variants Data Definition
const VARIANTS = {
  '100ml': {
    name: '100 ML (Sample Jar)',
    price: 279,
    comparePrice: 350,
    img: 'https://kesariyafarm.com/cdn/shop/files/Front_100_ml.png?v=1771943053&width=1445',
    freeShipping: false
  },
  '250ml': {
    name: '250 ML Glass Jar',
    price: 499,
    comparePrice: 625,
    img: 'https://kesariyafarm.com/cdn/shop/files/Front_Spoon_1000_ml.png?v=1771942989&width=1445',
    freeShipping: false
  },
  '500ml': {
    name: '500 ML Glass Jar',
    price: 899,
    comparePrice: 1125,
    img: 'https://kesariyafarm.com/cdn/shop/files/ghee_1000ml_6.1.png?v=1771940051&width=1445',
    freeShipping: true
  },
  '1000ml': {
    name: '1000 ML (1 Liter Glass Jar)',
    price: 1699,
    comparePrice: 2125,
    img: 'https://kesariyafarm.com/cdn/shop/files/ghee_1000ml_6.1.png?v=1771940051&width=1445',
    freeShipping: true
  },
  '1000ml-pack2': {
    name: '1000 ML (Pack of 2)',
    price: 3199,
    comparePrice: 4250,
    img: 'https://kesariyafarm.com/cdn/shop/files/1000ml_Pack_of_2.png?v=1771943053&width=1445',
    freeShipping: true
  },
  '1000ml-pack4': {
    name: '1000 ML (Pack of 4)',
    price: 6199,
    comparePrice: 8500,
    img: 'https://kesariyafarm.com/cdn/shop/files/1000ml_Pack_of_4.png?v=1771943053&width=1445',
    freeShipping: true
  },
  '1000ml-pack6': {
    name: '1000 ML (Pack of 6)',
    price: 8999,
    comparePrice: 12750,
    img: 'https://kesariyafarm.com/cdn/shop/files/1000ml_Pack_of_6.png?v=1771943053&width=1445',
    freeShipping: true
  }
};

// Global App State
let state = {
  selectedVariantKey: '1000ml',
  quantity: 1,
  cart: JSON.parse(localStorage.getItem('kesariya_cart')) || [],
  appliedDiscount: 0, // percentage e.g. 10
  discountCode: '',
  ratingInput: 5
};

// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', () => {
  initGallery();
  initVariants();
  initQuantityControls();
  initCartDrawer();
  initCheckout();
  initFaq();
  initModals();
  initReviews();
  initBilonaStepper();
  updateCartUI();
});

/* -------------------------------------------------------------------------- */
/* 1. GALLERY & ZOOM                                                          */
/* -------------------------------------------------------------------------- */
function initGallery() {
  const mainImg = document.getElementById('mainProductImg');
  const thumbs = document.querySelectorAll('.thumb-item');
  const zoomBtn = document.getElementById('zoomImgBtn');
  const zoomModal = document.getElementById('imageZoomModal');
  const zoomedImg = document.getElementById('zoomedImg');
  const closeZoomBtn = document.getElementById('closeZoomBtn');

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const newSrc = thumb.getAttribute('data-img');
      if (mainImg) mainImg.src = newSrc;
    });
  });

  if (zoomBtn) {
    zoomBtn.addEventListener('click', () => {
      zoomedImg.src = mainImg.src;
      zoomModal.classList.add('active');
    });
  }

  if (closeZoomBtn) {
    closeZoomBtn.addEventListener('click', () => {
      zoomModal.classList.remove('active');
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 2. VARIANT SELECTION ENGINE                                                */
/* -------------------------------------------------------------------------- */
function initVariants() {
  const pills = document.querySelectorAll('.variant-pill');
  const displayPrice = document.getElementById('displayPrice');
  const displayComparePrice = document.getElementById('displayComparePrice');
  const displaySavings = document.getElementById('displaySavings');
  const selectedVariantText = document.getElementById('selectedVariantText');
  const sbbPrice = document.getElementById('sbbPrice');
  const mainImg = document.getElementById('mainProductImg');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const key = pill.getAttribute('data-size');
      state.selectedVariantKey = key;
      const data = VARIANTS[key];

      if (data) {
        // Update display text
        if (selectedVariantText) selectedVariantText.innerText = data.name;
        if (displayPrice) displayPrice.innerText = `₹${data.price.toLocaleString('en-IN')}.00`;
        if (sbbPrice) sbbPrice.innerText = `₹${data.price.toLocaleString('en-IN')}.00`;

        if (displayComparePrice) {
          displayComparePrice.innerText = `₹${data.comparePrice.toLocaleString('en-IN')}.00`;
        }

        const savings = data.comparePrice - data.price;
        const discountPercent = Math.round((savings / data.comparePrice) * 100);
        if (displaySavings) {
          displaySavings.innerText = `Save ₹${savings.toLocaleString('en-IN')} (${discountPercent}% OFF)`;
        }

        // Swap main image if variant image exists
        if (mainImg && data.img) {
          mainImg.src = data.img;
        }
      }
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 3. QUANTITY SELECTOR                                                       */
/* -------------------------------------------------------------------------- */
function initQuantityControls() {
  const minus = document.getElementById('qtyMinus');
  const plus = document.getElementById('qtyPlus');
  const input = document.getElementById('qtyInput');

  if (minus && plus && input) {
    minus.addEventListener('click', () => {
      let val = parseInt(input.value) || 1;
      if (val > 1) {
        val--;
        input.value = val;
        state.quantity = val;
      }
    });

    plus.addEventListener('click', () => {
      let val = parseInt(input.value) || 1;
      if (val < 10) {
        val++;
        input.value = val;
        state.quantity = val;
      }
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 4. CART & SLIDING DRAWER ENGINE                                           */
/* -------------------------------------------------------------------------- */
function initCartDrawer() {
  const cartBtn = document.getElementById('cartBtn');
  const sbbBuyBtn = document.getElementById('sbbBuyBtn');
  const addToCartBtn = document.getElementById('addToCartBtn');
  const buyNowBtn = document.getElementById('buyNowBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer = document.getElementById('cartDrawer');
  const continueShopBtn = document.getElementById('continueShopBtn');
  const applyCouponBtn = document.getElementById('applyCouponBtn');
  const drawerCheckoutBtn = document.getElementById('drawerCheckoutBtn');

  // Toggle Cart Drawer
  const openCart = () => {
    cartOverlay.classList.add('active');
    cartDrawer.classList.add('active');
  };

  const closeCart = () => {
    cartOverlay.classList.remove('active');
    cartDrawer.classList.remove('active');
  };

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  if (continueShopBtn) continueShopBtn.addEventListener('click', closeCart);

  // Add to Cart Action
  const handleAddToCart = () => {
    const variantData = VARIANTS[state.selectedVariantKey];
    if (!variantData) return;

    const existingIndex = state.cart.findIndex(item => item.key === state.selectedVariantKey);
    if (existingIndex > -1) {
      state.cart[existingIndex].qty += state.quantity;
    } else {
      state.cart.push({
        key: state.selectedVariantKey,
        name: variantData.name,
        price: variantData.price,
        img: variantData.img,
        qty: state.quantity
      });
    }

    saveCart();
    updateCartUI();
    showToast(`Added ${state.quantity} × ${variantData.name} to Cart! 🛒`, 'success');
    openCart();
  };

  if (addToCartBtn) addToCartBtn.addEventListener('click', handleAddToCart);
  if (sbbBuyBtn) sbbBuyBtn.addEventListener('click', handleAddToCart);

  // Buy Now Action
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => {
      handleAddToCart();
      closeCart();
      openCheckoutModal();
    });
  }

  // Coupon Application
  if (applyCouponBtn) {
    applyCouponBtn.addEventListener('click', () => {
      const codeInput = document.getElementById('couponInput');
      const msg = document.getElementById('couponMsg');
      const code = codeInput ? codeInput.value.trim().toUpperCase() : '';

      if (code === 'VEDIC10' || code === 'BILONA10') {
        state.appliedDiscount = 10;
        state.discountCode = code;
        if (msg) {
          msg.style.color = '#2E7D32';
          msg.innerText = `🎉 Coupon '${code}' Applied! 10% Discount Added.`;
        }
        showToast('10% Coupon Discount Applied!', 'success');
      } else if (code === '') {
        state.appliedDiscount = 0;
        state.discountCode = '';
        if (msg) msg.innerText = '';
      } else {
        if (msg) {
          msg.style.color = '#D9381E';
          msg.innerText = '❌ Invalid Coupon Code. Try VEDIC10 for 10% OFF.';
        }
      }
      updateCartTotals();
    });
  }

  // Checkout trigger from drawer
  if (drawerCheckoutBtn) {
    drawerCheckoutBtn.addEventListener('click', () => {
      if (state.cart.length === 0) {
        showToast('Your cart is empty!', 'warning');
        return;
      }
      closeCart();
      openCheckoutModal();
    });
  }
}

function saveCart() {
  localStorage.setItem('kesariya_cart', JSON.stringify(state.cart));
}

function updateCartUI() {
  const cartCountEl = document.getElementById('cartCount');
  const drawerCartCountEl = document.getElementById('drawerCartCount');
  const emptyCartState = document.getElementById('emptyCartState');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartFooter = document.getElementById('cartFooter');

  const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);

  if (cartCountEl) cartCountEl.innerText = totalItems;
  if (drawerCartCountEl) drawerCartCountEl.innerText = totalItems;

  if (totalItems === 0) {
    if (emptyCartState) emptyCartState.style.display = 'flex';
    if (cartItemsList) cartItemsList.innerHTML = '';
    if (cartFooter) cartFooter.style.display = 'none';
  } else {
    if (emptyCartState) emptyCartState.style.display = 'none';
    if (cartFooter) cartFooter.style.display = 'block';

    // Render cart items
    if (cartItemsList) {
      cartItemsList.innerHTML = state.cart.map((item, idx) => `
        <div class="cart-item-card">
          <img src="${item.img}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-details">
            <div class="cart-item-title">A2 Vedic Ghee</div>
            <div class="cart-item-variant">${item.name}</div>
            <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}.00</div>
            <div class="cart-item-actions">
              <div class="mini-qty-box">
                <button class="mini-qty-btn" onclick="updateCartQty(${idx}, -1)">-</button>
                <span style="padding: 0 8px; font-weight: 700; font-size: 0.85rem;">${item.qty}</span>
                <button class="mini-qty-btn" onclick="updateCartQty(${idx}, 1)">+</button>
              </div>
              <button class="cart-item-remove" onclick="removeCartItem(${idx})">Remove</button>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  updateCartTotals();
}

window.updateCartQty = function(idx, change) {
  if (state.cart[idx]) {
    state.cart[idx].qty += change;
    if (state.cart[idx].qty <= 0) {
      state.cart.splice(idx, 1);
    }
    saveCart();
    updateCartUI();
  }
};

window.removeCartItem = function(idx) {
  if (state.cart[idx]) {
    state.cart.splice(idx, 1);
    saveCart();
    updateCartUI();
    showToast('Item removed from cart', 'info');
  }
};

function updateCartTotals() {
  const subtotalPriceEl = document.getElementById('subtotalPrice');
  const discountRowEl = document.getElementById('discountRow');
  const discountPriceEl = document.getElementById('discountPrice');
  const finalTotalPriceEl = document.getElementById('finalTotalPrice');
  const fsText = document.getElementById('fsText');
  const fsFill = document.getElementById('fsFill');

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmount = Math.round((subtotal * state.appliedDiscount) / 100);
  const finalTotal = subtotal - discountAmount;

  if (subtotalPriceEl) subtotalPriceEl.innerText = `₹${subtotal.toLocaleString('en-IN')}.00`;
  
  if (state.appliedDiscount > 0) {
    if (discountRowEl) discountRowEl.style.display = 'flex';
    if (discountPriceEl) discountPriceEl.innerText = `-₹${discountAmount.toLocaleString('en-IN')}.00`;
  } else {
    if (discountRowEl) discountRowEl.style.display = 'none';
  }

  if (finalTotalPriceEl) finalTotalPriceEl.innerText = `₹${finalTotal.toLocaleString('en-IN')}.00`;

  // Free shipping progress bar (Goal ₹699)
  const freeShipThreshold = 699;
  if (subtotal >= freeShipThreshold || subtotal === 0) {
    if (fsText) fsText.innerHTML = '🎉 You have unlocked <strong>FREE SHIPPING!</strong>';
    if (fsFill) fsFill.style.width = '100%';
  } else {
    const diff = freeShipThreshold - subtotal;
    const percent = Math.min(100, Math.round((subtotal / freeShipThreshold) * 100));
    if (fsText) fsText.innerHTML = `Add <strong>₹${diff.toLocaleString('en-IN')}</strong> more to get <strong>FREE SHIPPING</strong>!`;
    if (fsFill) fsFill.style.width = `${percent}%`;
  }
}

/* -------------------------------------------------------------------------- */
/* 5. EXPRESS CHECKOUT MODAL                                                  */
/* -------------------------------------------------------------------------- */
function initCheckout() {
  const checkoutModal = document.getElementById('checkoutModal');
  const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
  const nextToStep2 = document.getElementById('nextToStep2');
  const backToStep1 = document.getElementById('backToStep1');
  const step1Content = document.getElementById('step1Content');
  const step2Content = document.getElementById('step2Content');
  const cStep1 = document.getElementById('cStep1');
  const cStep2 = document.getElementById('cStep2');

  window.openCheckoutModal = () => {
    checkoutModal.classList.add('active');
    step1Content.style.display = 'block';
    step2Content.style.display = 'none';
    cStep1.classList.add('active');
    cStep2.classList.remove('active');
  };

  if (closeCheckoutBtn) {
    closeCheckoutBtn.addEventListener('click', () => {
      checkoutModal.classList.remove('active');
    });
  }

  if (nextToStep2) {
    nextToStep2.addEventListener('click', () => {
      const name = document.getElementById('custName').value.trim();
      const phone = document.getElementById('custPhone').value.trim();
      const address = document.getElementById('custAddress').value.trim();
      const city = document.getElementById('custCity').value.trim();
      const pincode = document.getElementById('custPincode').value.trim();

      if (!name || !phone || !address || !city || !pincode) {
        showToast('Please fill out all required shipping fields!', 'warning');
        return;
      }

      step1Content.style.display = 'none';
      step2Content.style.display = 'block';
      cStep1.classList.remove('active');
      cStep2.classList.add('active');

      renderCheckoutSummary();
    });
  }

  if (backToStep1) {
    backToStep1.addEventListener('click', () => {
      step1Content.style.display = 'block';
      step2Content.style.display = 'none';
      cStep1.classList.add('active');
      cStep2.classList.remove('active');
    });
  }
}

function renderCheckoutSummary() {
  const summaryEl = document.getElementById('checkoutSummaryItems');
  const totalEl = document.getElementById('checkoutFinalTotal');

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmount = Math.round((subtotal * state.appliedDiscount) / 100);
  const finalTotal = subtotal - discountAmount;

  if (summaryEl) {
    summaryEl.innerHTML = state.cart.map(item => `
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
        <span>${item.qty} × ${item.name}</span>
        <strong>₹${(item.price * item.qty).toLocaleString('en-IN')}.00</strong>
      </div>
    `).join('');
  }

  if (totalEl) totalEl.innerText = `₹${finalTotal.toLocaleString('en-IN')}.00`;
}

window.handlePlaceOrder = function(e) {
  e.preventDefault();

  const checkoutModal = document.getElementById('checkoutModal');
  const trackingModal = document.getElementById('trackingModal');
  const trackingOrderId = document.getElementById('trackingOrderId');

  const randomId = `#KF-${Math.floor(10000 + Math.random() * 90000)}`;

  // Clear cart
  state.cart = [];
  saveCart();
  updateCartUI();

  if (checkoutModal) checkoutModal.classList.remove('active');
  if (trackingOrderId) trackingOrderId.innerText = randomId;
  if (trackingModal) trackingModal.classList.add('active');

  showToast(`Order ${randomId} Confirmed Successfully! 🎉`, 'success');
};

/* -------------------------------------------------------------------------- */
/* 6. FAQ ACCORDION                                                           */
/* -------------------------------------------------------------------------- */
function initFaq() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      items.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 7. MODALS (LAB CERTIFICATE, ORDER TRACKING)                                */
/* -------------------------------------------------------------------------- */
function initModals() {
  const labModal = document.getElementById('labModal');
  const openLabReportBtn = document.getElementById('openLabReportBtn');
  const openCertModalBtn = document.getElementById('openCertModalBtn');
  const closeLabBtn = document.getElementById('closeLabBtn');

  const trackingModal = document.getElementById('trackingModal');
  const trackOrderBtn = document.getElementById('trackOrderBtn');
  const trackFooterLink = document.getElementById('trackFooterLink');
  const closeTrackingBtn = document.getElementById('closeTrackingBtn');
  const closeTrackModalDone = document.getElementById('closeTrackModalDone');

  const openLab = () => labModal.classList.add('active');
  const closeLab = () => labModal.classList.remove('active');

  if (openLabReportBtn) openLabReportBtn.addEventListener('click', openLab);
  if (openCertModalBtn) openCertModalBtn.addEventListener('click', openLab);
  if (closeLabBtn) closeLabBtn.addEventListener('click', closeLab);

  const openTracking = () => trackingModal.classList.add('active');
  const closeTracking = () => trackingModal.classList.remove('active');

  if (trackOrderBtn) trackOrderBtn.addEventListener('click', openTracking);
  if (trackFooterLink) trackFooterLink.addEventListener('click', (e) => {
    e.preventDefault();
    openTracking();
  });
  if (closeTrackingBtn) closeTrackingBtn.addEventListener('click', closeTracking);
  if (closeTrackModalDone) closeTrackModalDone.addEventListener('click', closeTracking);
}

/* -------------------------------------------------------------------------- */
/* 8. REVIEWS & WRITE A REVIEW                                                */
/* -------------------------------------------------------------------------- */
function initReviews() {
  const writeReviewBtn = document.getElementById('writeReviewBtn');
  const writeReviewModal = document.getElementById('writeReviewModal');
  const closeReviewModalBtn = document.getElementById('closeReviewModalBtn');
  const starInputRow = document.getElementById('starInputRow');
  const reviewTabs = document.querySelectorAll('.review-tab');
  const reviewCards = document.querySelectorAll('.review-card');

  if (writeReviewBtn) {
    writeReviewBtn.addEventListener('click', () => {
      writeReviewModal.classList.add('active');
    });
  }

  if (closeReviewModalBtn) {
    closeReviewModalBtn.addEventListener('click', () => {
      writeReviewModal.classList.remove('active');
    });
  }

  // Star selector input
  if (starInputRow) {
    const stars = starInputRow.querySelectorAll('.star-selectable');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const val = parseInt(star.getAttribute('data-val'));
        state.ratingInput = val;
        stars.forEach((s, idx) => {
          if (idx < val) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });
      });
    });
  }

  // Filter tabs
  reviewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      reviewTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter');

      reviewCards.forEach(card => {
        if (filter === 'all') {
          card.style.display = 'flex';
        } else if (filter === '5star') {
          card.style.display = card.getAttribute('data-rating') === '5' ? 'flex' : 'none';
        } else if (filter === 'verified') {
          card.style.display = card.getAttribute('data-verified') === 'true' ? 'flex' : 'none';
        } else if (filter === 'photo') {
          card.style.display = card.getAttribute('data-photo') === 'true' ? 'flex' : 'none';
        }
      });
    });
  });
}

window.handleReviewSubmit = function(e) {
  e.preventDefault();

  const name = document.getElementById('revAuthor').value.trim();
  const title = document.getElementById('revTitle').value.trim();
  const body = document.getElementById('revBody').value.trim();
  const container = document.getElementById('reviewsContainer');
  const writeReviewModal = document.getElementById('writeReviewModal');

  if (!name || !title || !body) return;

  const starsStr = '★'.repeat(state.ratingInput) + '☆'.repeat(5 - state.ratingInput);

  const newCard = document.createElement('div');
  newCard.className = 'review-card';
  newCard.setAttribute('data-rating', state.ratingInput);
  newCard.setAttribute('data-verified', 'true');
  newCard.setAttribute('data-photo', 'false');

  newCard.innerHTML = `
    <div class="rc-header">
      <div class="rc-stars">${starsStr}</div>
      <span class="rc-date">Just Now</span>
    </div>
    <h4 class="rc-title">${title}</h4>
    <p class="rc-body">${body}</p>
    <div class="rc-author">
      <strong>${name}</strong>
      <span class="v-badge">✓ Verified Buyer</span>
    </div>
  `;

  if (container) container.prepend(newCard);
  if (writeReviewModal) writeReviewModal.classList.remove('active');

  // Reset form
  document.getElementById('newReviewForm').reset();
  showToast('Thank you! Your review has been published.', 'success');
};

/* -------------------------------------------------------------------------- */
/* 9. BILONA PROCESS STEPPER                                                  */
/* -------------------------------------------------------------------------- */
function initBilonaStepper() {
  const stepCards = document.querySelectorAll('.bilona-step-card');
  stepCards.forEach(card => {
    card.addEventListener('click', () => {
      stepCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const stepNum = card.getAttribute('data-step');
      const stepTitle = card.querySelector('h3').innerText;
      showToast(`Exploring Step ${stepNum}: ${stepTitle}`, 'info');
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 10. TOAST NOTIFICATION ENGINE                                              */
/* -------------------------------------------------------------------------- */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

window.copyCode = function(code) {
  navigator.clipboard.writeText(code);
  showToast(`Promo Code '${code}' copied to clipboard!`, 'success');
};
