/* ============================================================
   NutriLife Coaching - Payment Integration Module
   Handles Stripe, PayPal, and other payment processors

   PRODUCTION SETUP:
   1. Replace STRIPE_PUBLIC_KEY with your live key from Stripe Dashboard
   2. Replace PAYPAL_CLIENT_ID with your live ID from PayPal Developer Portal
   3. Backend should process actual payments and return success
   ============================================================ */

/* ============================================================
   CONFIGURATION & CONSTANTS
   ============================================================ */

// IMPORTANT: Replace these with your LIVE keys in production
const STRIPE_PUBLIC_KEY = 'pk_test_51234567890abcdefghijklmnop'; // pk_live_... for production
const PAYPAL_CLIENT_ID = 'Ar-ExNzVkUj6j_oQR8CZqLyZT7tQKT2DY-Cw0qnSYlXj8Hx3J8Z9K'; // Live ID for production
const API_ENDPOINT = '/api/payment'; // Your backend payment endpoint

// Product catalog with pricing
const PRODUCTS = {
  ebook_diabetes: {
    id: 'ebook_diabetes',
    name: 'The Diabetic Kitchen',
    price: 29,
    currency: 'USD',
    category: 'ebook',
    description: 'Complete guide to diabetes-friendly nutrition'
  },
  ebook_hypertension: {
    id: 'ebook_hypertension',
    name: 'Heart Strong Cookbook',
    price: 29,
    currency: 'USD',
    category: 'ebook',
    description: 'Recipes and strategies for healthy blood pressure'
  },
  ebook_kidney: {
    id: 'ebook_kidney',
    name: 'Kidney Comfort Cookbook',
    price: 29,
    currency: 'USD',
    category: 'ebook',
    description: 'Kidney-friendly recipes and meal planning'
  },
  ebook_heart: {
    id: 'ebook_heart',
    name: 'Heart & Soul Cookbook',
    price: 29,
    currency: 'USD',
    category: 'ebook',
    description: 'Heart-healthy nutrition for life'
  },
  ebook_gut: {
    id: 'ebook_gut',
    name: 'Gut Harmony Cookbook',
    price: 29,
    currency: 'USD',
    category: 'ebook',
    description: 'Restore and maintain digestive health'
  },
  ebook_cancer: {
    id: 'ebook_cancer',
    name: 'Nourish & Thrive',
    price: 29,
    currency: 'USD',
    category: 'ebook',
    description: 'Nutrition support during cancer treatment'
  },
  ebook_bundle: {
    id: 'ebook_bundle',
    name: 'Complete Healing Library',
    price: 99,
    currency: 'USD',
    category: 'ebook',
    savings: 75,
    description: 'All 6 cookbooks in one bundle'
  },
  masterclass_recording: {
    id: 'masterclass_recording',
    name: 'Healing Kitchen Masterclass - Recording',
    price: 97,
    currency: 'USD',
    category: 'masterclass',
    description: 'On-demand access to recorded masterclass'
  },
  masterclass_live: {
    id: 'masterclass_live',
    name: 'Healing Kitchen Masterclass - Live + Recording',
    price: 197,
    currency: 'USD',
    category: 'masterclass',
    description: 'Live session plus lifetime recording access'
  },
  masterclass_vip: {
    id: 'masterclass_vip',
    name: 'Healing Kitchen Masterclass - VIP',
    price: 297,
    currency: 'USD',
    category: 'masterclass',
    description: 'Live + recording + 1-on-1 consultation'
  },
  coaching_starter: {
    id: 'coaching_starter',
    name: 'Coaching Starter Package',
    price: 197,
    currency: 'USD',
    category: 'coaching',
    description: 'Initial assessment and 2 coaching sessions'
  },
  coaching_transform: {
    id: 'coaching_transform',
    name: 'Transform Coaching (Monthly)',
    price: 497,
    currency: 'USD',
    category: 'coaching',
    recurring: true,
    description: 'Monthly coaching with meal planning'
  },
  coaching_complete: {
    id: 'coaching_complete',
    name: 'Complete Healing 3-Month Program',
    price: 997,
    currency: 'USD',
    category: 'coaching',
    description: 'Intensive 3-month personalized program'
  },
  course_basic: {
    id: 'course_basic',
    name: 'NutriLife Academy - Basic',
    price: 297,
    currency: 'USD',
    category: 'course',
    description: 'Foundation modules with lifetime access'
  },
  course_pro: {
    id: 'course_pro',
    name: 'NutriLife Academy - Pro',
    price: 397,
    currency: 'USD',
    category: 'course',
    description: 'Advanced modules + community access'
  },
  course_annual: {
    id: 'course_annual',
    name: 'NutriLife Academy - Annual',
    price: 197,
    currency: 'USD',
    category: 'course',
    recurring: true,
    description: 'Annual subscription to all courses'
  },
  group_program: {
    id: 'group_program',
    name: '12-Week Group Transformation',
    price: 397,
    currency: 'USD',
    category: 'group',
    description: 'Cohort-based group coaching program'
  },
  group_early_bird: {
    id: 'group_early_bird',
    name: '12-Week Group - Early Bird',
    price: 297,
    currency: 'USD',
    category: 'group',
    savings: 100,
    description: 'Early bird discount (limited time)'
  }
};

/* State management */
const PaymentState = {
  currentProduct: null,
  customerEmail: null,
  customerName: null,
  selectedPaymentMethod: 'stripe', // 'stripe' or 'paypal'
  affiliateRef: null,
  isProcessing: false,

  init() {
    this.captureAffiliateRef();
  },

  captureAffiliateRef() {
    const params = new URLSearchParams(window.location.search);
    this.affiliateRef = params.get('ref');
    if (this.affiliateRef) {
      sessionStorage.setItem('nutrilife_affiliate_ref', this.affiliateRef);
    }
  }
};

/* ============================================================
   STRIPE INTEGRATION (Mock/Demo Mode)
   ============================================================ */

const StripePayment = {
  stripeInstance: null,
  elementsInstance: null,

  /**
   * Initialize Stripe with public key
   * In production, this will create a real Stripe instance
   */
  init(publicKey = STRIPE_PUBLIC_KEY) {
    console.log('[Stripe] Initializing with public key:', publicKey);

    // In production, you would initialize real Stripe:
    // this.stripeInstance = Stripe(publicKey);
    // this.elementsInstance = this.stripeInstance.elements();

    // For demo/test mode, we create a mock instance
    this.stripeInstance = {
      _testMode: true,
      createPaymentMethod: this.createPaymentMethod.bind(this),
      confirmCardPayment: this.confirmCardPayment.bind(this)
    };

    return this.stripeInstance;
  },

  /**
   * Open Stripe checkout modal
   */
  openCheckout(product) {
    console.log('[Stripe] Opening checkout for:', product.name);

    if (!product) {
      console.error('[Stripe] No product provided');
      return;
    }

    PaymentState.currentProduct = product;
    PaymentState.selectedPaymentMethod = 'stripe';
    this.showCheckoutModal(product);
  },

  /**
   * Display the Stripe-styled checkout modal
   */
  showCheckoutModal(product) {
    const modal = this.createCheckoutModal(product);
    document.body.appendChild(modal);

    // Trigger modal animation
    setTimeout(() => {
      modal.querySelector('.payment-modal-overlay').classList.add('active');
    }, 10);

    // Attach event listeners
    this.attachModalEvents(modal, product);
  },

  /**
   * Create the checkout modal HTML
   */
  createCheckoutModal(product) {
    const container = document.createElement('div');
    container.className = 'payment-modal-overlay';
    container.id = 'stripe-checkout-modal';

    const savings = product.savings ? `$${product.savings}` : '';
    const savingsHtml = product.savings ? `<span class="savings-badge">Save ${savings}</span>` : '';

    container.innerHTML = `
      <div class="payment-modal">
        <button class="modal-close" aria-label="Close payment modal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="modal-header">
          <h2>Complete Your Purchase</h2>
          <p class="text-muted">Secure payment powered by Stripe</p>
        </div>

        <div class="modal-body">
          <!-- Order Summary -->
          <div class="order-summary">
            <div class="summary-item">
              <span>${product.name}</span>
              <strong>$${product.price.toFixed(2)}</strong>
            </div>
            ${product.savings ? `<div class="summary-item savings">${savingsHtml}<strong class="text-success">-$${product.savings.toFixed(2)}</strong></div>` : ''}
            <div class="summary-divider"></div>
            <div class="summary-total">
              <span>Total</span>
              <strong>$${product.price.toFixed(2)} USD</strong>
            </div>
          </div>

          <div class="test-mode-notice">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span><strong>Test Mode:</strong> Use 4242 4242 4242 4242 to test</span>
          </div>

          <!-- Payment Method Selection -->
          <div class="payment-method-tabs">
            <button class="tab-button active" data-method="card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                <line x1="2" y1="8" x2="22" y2="8"></line>
              </svg>
              Credit Card
            </button>
            <button class="tab-button" data-method="paypal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              PayPal
            </button>
          </div>

          <!-- Card Payment Form -->
          <form id="stripe-form" class="payment-form">
            <div class="form-group">
              <label for="card-name">Full Name *</label>
              <input type="text" id="card-name" name="name" required placeholder="John Doe"
                class="form-control">
            </div>

            <div class="form-group">
              <label for="card-email">Email Address *</label>
              <input type="email" id="card-email" name="email" required placeholder="john@example.com"
                class="form-control">
            </div>

            <div class="form-group">
              <label for="card-number">Card Number *</label>
              <div class="card-input-wrapper">
                <input type="text" id="card-number" name="cardNumber"
                  placeholder="4242 4242 4242 4242" maxlength="19" required class="form-control">
                <span class="card-type-icon">
                  <svg width="32" height="20" viewBox="0 0 32 20" fill="currentColor">
                    <rect x="1" y="1" width="30" height="18" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
                  </svg>
                </span>
              </div>
              <small class="text-muted">Your card is processed securely</small>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="card-expiry">Expiry Date *</label>
                <input type="text" id="card-expiry" name="expiry" placeholder="MM/YY"
                  maxlength="5" required class="form-control">
              </div>
              <div class="form-group">
                <label for="card-cvc">CVC *</label>
                <input type="text" id="card-cvc" name="cvc" placeholder="123"
                  maxlength="4" required class="form-control">
              </div>
            </div>

            <div class="form-group">
              <label for="card-country">Country *</label>
              <select id="card-country" name="country" required class="form-control">
                <option value="">Select Country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="form-group checkbox-group">
              <input type="checkbox" id="save-card" name="saveCard">
              <label for="save-card">Save this card for future purchases</label>
            </div>

            <button type="submit" class="btn btn-primary btn-submit" id="submit-card-payment">
              <span>Pay $${product.price.toFixed(2)}</span>
              <svg class="spinner" width="20" height="20" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5"></circle>
              </svg>
            </button>

            <p class="security-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
              Protected by SSL encryption. Your data is safe.
            </p>
          </form>

          <!-- PayPal Form (Hidden by default) -->
          <div id="paypal-form" class="payment-form hidden">
            <p class="text-center text-muted">Redirecting to PayPal...</p>
            <button type="button" class="btn btn-paypal" id="paypal-pay-button">
              Pay with PayPal
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <p class="text-muted text-small">
            By clicking "Pay", you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    `;

    return container;
  },

  /**
   * Attach event listeners to modal
   */
  attachModalEvents(modal, product) {
    // Close button
    modal.querySelector('.modal-close').addEventListener('click', () => {
      this.closeModal(modal);
    });

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal(modal);
      }
    });

    // Payment method tabs
    modal.querySelectorAll('.tab-button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const method = e.currentTarget.dataset.method;
        this.switchPaymentMethod(modal, method);
      });
    });

    // Card number formatting
    const cardNumberInput = modal.querySelector('#card-number');
    if (cardNumberInput) {
      cardNumberInput.addEventListener('input', (e) => {
        e.target.value = this.formatCardNumber(e.target.value);
      });
    }

    // Expiry date formatting
    const expiryInput = modal.querySelector('#card-expiry');
    if (expiryInput) {
      expiryInput.addEventListener('input', (e) => {
        e.target.value = this.formatExpiry(e.target.value);
      });
    }

    // CVC input (numbers only)
    const cvcInput = modal.querySelector('#card-cvc');
    if (cvcInput) {
      cvcInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
      });
    }

    // Form submission
    const form = modal.querySelector('#stripe-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.processCardPayment(form, product, modal);
      });
    }

    // PayPal button
    const paypalBtn = modal.querySelector('#paypal-pay-button');
    if (paypalBtn) {
      paypalBtn.addEventListener('click', () => {
        this.switchToPayPal(product, modal);
      });
    }
  },

  /**
   * Switch between payment methods
   */
  switchPaymentMethod(modal, method) {
    // Update tab styles
    modal.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    modal.querySelector(`[data-method="${method}"]`).classList.add('active');

    // Toggle form visibility
    const stripeForm = modal.querySelector('#stripe-form');
    const paypalForm = modal.querySelector('#paypal-form');

    if (method === 'paypal') {
      stripeForm.classList.add('hidden');
      paypalForm.classList.remove('hidden');
    } else {
      stripeForm.classList.remove('hidden');
      paypalForm.classList.add('hidden');
    }
  },

  /**
   * Format card number with spaces
   */
  formatCardNumber(value) {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  },

  /**
   * Format expiry date (MM/YY)
   */
  formatExpiry(value) {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  },

  /**
   * Process card payment (demo mode)
   */
  processCardPayment(form, product, modal) {
    if (PaymentState.isProcessing) return;
    PaymentState.isProcessing = true;

    const submitBtn = form.querySelector('#submit-card-payment');
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    // Validate form
    if (!form.checkValidity()) {
      form.reportValidity();
      PaymentState.isProcessing = false;
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      return;
    }

    const formData = new FormData(form);
    const customerData = {
      name: formData.get('name'),
      email: formData.get('email'),
      productId: product.id,
      amount: product.price,
      currency: product.currency,
      cardLastFour: formData.get('cardNumber').slice(-4),
      method: 'card'
    };

    PaymentState.customerName = customerData.name;
    PaymentState.customerEmail = customerData.email;

    // Simulate payment processing (replace with real API call in production)
    console.log('[Stripe] Processing payment:', customerData);

    setTimeout(() => {
      this.closeModal(modal);
      this.showSuccessModal(product, customerData.email, customerData.name);
      PaymentState.isProcessing = false;
    }, 1500);
  },

  /**
   * Show success modal after payment
   */
  showSuccessModal(product, email, name) {
    const orderNumber = 'ORD-' + Date.now().toString().slice(-8);

    const modal = document.createElement('div');
    modal.className = 'payment-modal-overlay';
    modal.id = 'payment-success-modal';

    const downloadInstructions = product.category === 'ebook' ? `
      <div class="success-section">
        <h3>Your Purchase Includes:</h3>
        <ul class="download-list">
          <li>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Instant access to ${product.name}
          </li>
          <li>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Download PDF to your device
          </li>
          <li>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Lifetime access (no expiration)
          </li>
          <li>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Free updates included
          </li>
        </ul>
        <a href="#" class="btn btn-primary" style="margin-top: 1rem;">Download Now</a>
      </div>
    ` : `
      <div class="success-section">
        <h3>Next Steps:</h3>
        <p>Check your email at <strong>${email}</strong> for:</p>
        <ul class="download-list">
          <li>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Login credentials for your account
          </li>
          <li>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Access to your course/coaching materials
          </li>
          <li>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Scheduling information (if applicable)
          </li>
          <li>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Support contact details
          </li>
        </ul>
      </div>
    `;

    modal.innerHTML = `
      <div class="payment-modal success-modal">
        <div class="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h2>Payment Successful!</h2>
        <p class="order-number">Order #${orderNumber}</p>

        <div class="success-details">
          <div class="detail-row">
            <span>Product:</span>
            <strong>${product.name}</strong>
          </div>
          <div class="detail-row">
            <span>Amount:</span>
            <strong>$${product.price.toFixed(2)} USD</strong>
          </div>
          <div class="detail-row">
            <span>Customer Email:</span>
            <strong>${email}</strong>
          </div>
        </div>

        ${downloadInstructions}

        <div class="success-cta">
          <button class="btn btn-primary" onclick="location.reload()">
            Back to Home
          </button>
          <a href="mailto:${email}" class="btn btn-outline">
            View Email
          </a>
        </div>

        <p class="text-muted text-small">
          Receipt has been sent to ${email}. Keep it for your records.
        </p>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => {
      modal.querySelector('.payment-modal-overlay').classList.add('active');
    }, 10);
  },

  /**
   * Close modal
   */
  closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.remove();
    }, 300);
  },

  /**
   * Switch to PayPal payment
   */
  switchToPayPal(product, modal) {
    // This would redirect to PayPal or open PayPal modal
    console.log('[Stripe->PayPal] Switching payment method for:', product.name);
    this.closeModal(modal);
    PayPalPayment.openCheckout(product);
  },

  // Mock functions for demo mode
  createPaymentMethod(data) {
    return Promise.resolve({ paymentMethod: { id: 'pm_test_' + Date.now() } });
  },

  confirmCardPayment(clientSecret, data) {
    return Promise.resolve({ paymentIntent: { status: 'succeeded' } });
  }
};

/* ============================================================
   PAYPAL INTEGRATION (Mock/Demo Mode)
   ============================================================ */

const PayPalPayment = {
  paypalInstance: null,

  /**
   * Initialize PayPal with client ID
   */
  init(clientId = PAYPAL_CLIENT_ID) {
    console.log('[PayPal] Initializing with client ID');

    // In production, load PayPal SDK:
    // const script = document.createElement('script');
    // script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
    // document.head.appendChild(script);

    this.paypalInstance = { _testMode: true };
    return this.paypalInstance;
  },

  /**
   * Open PayPal checkout
   */
  openCheckout(product) {
    console.log('[PayPal] Opening checkout for:', product.name);

    if (!product) {
      console.error('[PayPal] No product provided');
      return;
    }

    PaymentState.currentProduct = product;
    PaymentState.selectedPaymentMethod = 'paypal';
    this.showCheckoutModal(product);
  },

  /**
   * Display PayPal checkout modal
   */
  showCheckoutModal(product) {
    const modal = this.createCheckoutModal(product);
    document.body.appendChild(modal);

    setTimeout(() => {
      modal.querySelector('.payment-modal-overlay').classList.add('active');
    }, 10);

    this.attachModalEvents(modal, product);
  },

  /**
   * Create PayPal checkout modal
   */
  createCheckoutModal(product) {
    const container = document.createElement('div');
    container.className = 'payment-modal-overlay';
    container.id = 'paypal-checkout-modal';

    container.innerHTML = `
      <div class="payment-modal">
        <button class="modal-close" aria-label="Close payment modal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="modal-header">
          <h2>PayPal Checkout</h2>
          <p class="text-muted">Fast, secure payment with PayPal</p>
        </div>

        <div class="modal-body">
          <div class="order-summary">
            <div class="summary-item">
              <span>${product.name}</span>
              <strong>$${product.price.toFixed(2)}</strong>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-total">
              <span>Total</span>
              <strong>$${product.price.toFixed(2)} USD</strong>
            </div>
          </div>

          <div class="test-mode-notice">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span><strong>Test Mode:</strong> No actual charges will occur</span>
          </div>

          <form id="paypal-form" class="payment-form">
            <div class="form-group">
              <label for="paypal-email">PayPal Email *</label>
              <input type="email" id="paypal-email" name="email" required
                placeholder="your@email.com" class="form-control">
            </div>

            <button type="submit" class="btn btn-paypal btn-submit" id="paypal-submit">
              <span>Continue to PayPal</span>
              <svg class="spinner" width="20" height="20" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5"></circle>
              </svg>
            </button>

            <p class="security-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
              PayPal protects your account with encryption and fraud detection.
            </p>
          </form>
        </div>

        <div class="modal-footer">
          <p class="text-muted text-small">
            By continuing, you agree to PayPal's User Agreement and Privacy Statement
          </p>
        </div>
      </div>
    `;

    return container;
  },

  /**
   * Attach event listeners
   */
  attachModalEvents(modal, product) {
    modal.querySelector('.modal-close').addEventListener('click', () => {
      this.closeModal(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal(modal);
      }
    });

    const form = modal.querySelector('#paypal-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.processPayPalPayment(form, product, modal);
    });
  },

  /**
   * Process PayPal payment (demo)
   */
  processPayPalPayment(form, product, modal) {
    if (PaymentState.isProcessing) return;
    PaymentState.isProcessing = true;

    const submitBtn = form.querySelector('#paypal-submit');
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    const email = form.querySelector('#paypal-email').value;
    PaymentState.customerEmail = email;

    console.log('[PayPal] Processing payment for:', email);

    // Simulate PayPal API call
    setTimeout(() => {
      this.closeModal(modal);
      StripePayment.showSuccessModal(product, email, 'PayPal Customer');
      PaymentState.isProcessing = false;
    }, 1500);
  },

  /**
   * Close modal
   */
  closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
};

/* ============================================================
   PAYMENT BUTTON INITIALIZATION
   ============================================================ */

/**
 * Initialize all payment buttons on the page
 * Looks for [data-product] attributes and attaches handlers
 */
function initPaymentButtons() {
  console.log('[Payment] Initializing payment buttons');

  const buttons = document.querySelectorAll('[data-product]');
  buttons.forEach(button => {
    const productId = button.dataset.product;
    const product = PRODUCTS[productId];

    if (!product) {
      console.warn('[Payment] Product not found:', productId);
      return;
    }

    button.addEventListener('click', (e) => {
      e.preventDefault();
      showEmailCaptureModal(product);
    });
  });

  console.log('[Payment] Initialized', buttons.length, 'payment buttons');
}

/**
 * Show email capture modal before checkout
 * Collects email for lead generation
 */
function showEmailCaptureModal(product) {
  const modal = document.createElement('div');
  modal.className = 'payment-modal-overlay';
  modal.id = 'email-capture-modal';

  modal.innerHTML = `
    <div class="payment-modal">
      <button class="modal-close" aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="modal-header">
        <h2>Almost there!</h2>
        <p class="text-muted">Let's get you set up</p>
      </div>

      <div class="modal-body">
        <form id="email-capture-form" class="payment-form">
          <div class="form-group">
            <label for="capture-name">First Name *</label>
            <input type="text" id="capture-name" name="name" required
              placeholder="John" class="form-control">
          </div>

          <div class="form-group">
            <label for="capture-email">Email Address *</label>
            <input type="email" id="capture-email" name="email" required
              placeholder="john@example.com" class="form-control">
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%;">
            Continue to Payment
          </button>
        </form>

        <p class="text-muted text-small" style="margin-top: 1rem; text-align: center;">
          We'll send your purchase confirmation and resources here.
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => {
    modal.querySelector('.payment-modal-overlay').classList.add('active');
  }, 10);

  // Close button
  modal.querySelector('.modal-close').addEventListener('click', () => {
    closePaymentModal(modal);
  });

  // Form submission
  const form = modal.querySelector('#email-capture-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('#capture-name').value;
    const email = form.querySelector('#capture-email').value;

    PaymentState.customerName = name;
    PaymentState.customerEmail = email;

    closePaymentModal(modal);
    StripePayment.openCheckout(product);
  });
}

/**
 * Close payment modal helper
 */
function closePaymentModal(modal) {
  modal.classList.remove('active');
  setTimeout(() => {
    modal.remove();
  }, 300);
}

/* ============================================================
   PAGE STYLES (Injected)
   ============================================================ */

function injectPaymentStyles() {
  if (document.getElementById('nutrilife-payment-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'nutrilife-payment-styles';
  styles.textContent = `
    /* Modal Overlay */
    .payment-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .payment-modal-overlay.active {
      opacity: 1;
    }

    /* Modal Container */
    .payment-modal {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      animation: modalSlideIn 0.3s ease;
    }

    @keyframes modalSlideIn {
      from {
        transform: translateY(30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #999;
      border-radius: 6px;
      transition: all 0.2s;
      z-index: 1001;
    }

    .modal-close:hover {
      background: #f0f0f0;
      color: #333;
    }

    .modal-header {
      padding: 2rem 2rem 1rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .modal-header h2 {
      margin: 0 0 0.5rem;
      color: #1B4332;
      font-size: 1.5rem;
    }

    .modal-header p {
      margin: 0;
      color: #999;
      font-size: 0.95rem;
    }

    .modal-body {
      padding: 2rem;
    }

    .modal-footer {
      padding: 1rem 2rem;
      border-top: 1px solid #f0f0f0;
      background: #f9f9f9;
      border-radius: 0 0 16px 16px;
    }

    .text-muted {
      color: #999;
    }

    .text-small {
      font-size: 0.85rem;
    }

    .text-center {
      text-align: center;
    }

    .text-success {
      color: #52B788;
    }

    /* Order Summary */
    .order-summary {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      font-size: 0.95rem;
    }

    .summary-item.savings {
      color: #52B788;
    }

    .summary-divider {
      height: 1px;
      background: #ddd;
      margin: 1rem 0;
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      font-size: 1.1rem;
      font-weight: 700;
      color: #1B4332;
    }

    /* Test Mode Notice */
    .test-mode-notice {
      background: #FFF3CD;
      border-left: 4px solid #F77F00;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.95rem;
      color: #333;
    }

    .test-mode-notice svg {
      flex-shrink: 0;
      color: #F77F00;
    }

    /* Payment Method Tabs */
    .payment-method-tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .tab-button {
      flex: 1;
      padding: 0.75rem;
      border: 2px solid #ddd;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: #666;
      font-weight: 600;
    }

    .tab-button:hover {
      border-color: #2D6A4F;
      color: #2D6A4F;
    }

    .tab-button.active {
      background: #2D6A4F;
      border-color: #2D6A4F;
      color: white;
    }

    /* Form Styles */
    .payment-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .payment-form.hidden {
      display: none;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .form-control {
      padding: 0.75rem;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      transition: all 0.2s;
      font-family: inherit;
    }

    .form-control:focus {
      outline: none;
      border-color: #2D6A4F;
      box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.1);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .card-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .card-type-icon {
      position: absolute;
      right: 0.75rem;
      color: #ddd;
    }

    .form-control {
      padding-right: 3rem;
    }

    .checkbox-group {
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
      margin: 0.5rem 0;
    }

    .checkbox-group input {
      width: auto;
      margin: 0;
    }

    .checkbox-group label {
      margin: 0;
      font-weight: 400;
    }

    /* Button Styles */
    .btn {
      padding: 0.875rem 1.75rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      position: relative;
    }

    .btn-primary {
      background: linear-gradient(135deg, #2D6A4F, #1B4332);
      color: white;
      box-shadow: 0 4px 12px rgba(45, 106, 79, 0.2);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(45, 106, 79, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-paypal {
      background: linear-gradient(135deg, #0070BA, #003087);
      color: white;
      box-shadow: 0 4px 12px rgba(0, 112, 186, 0.2);
    }

    .btn-paypal:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 112, 186, 0.3);
    }

    .btn-outline {
      background: white;
      color: #2D6A4F;
      border: 2px solid #2D6A4F;
    }

    .btn-outline:hover {
      background: #f9f9f9;
    }

    .btn-submit {
      width: 100%;
    }

    .btn.loading .spinner {
      display: inline-block;
      animation: spin 1s linear infinite;
      margin-left: 0.5rem;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Security Notice */
    .security-notice {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #999;
      margin-top: 1rem;
      text-align: center;
      justify-content: center;
    }

    .security-notice svg {
      color: #52B788;
    }

    /* Success Modal */
    .success-modal {
      text-align: center;
    }

    .success-icon {
      width: 80px;
      height: 80px;
      background: #52B788;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      color: white;
      animation: scaleIn 0.5s ease;
    }

    @keyframes scaleIn {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .success-modal h2 {
      color: #1B4332;
      margin: 0 0 0.5rem;
    }

    .order-number {
      color: #999;
      font-size: 0.95rem;
      margin-bottom: 1.5rem;
    }

    .success-details {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 1.5rem 0;
      text-align: left;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #eee;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-row span {
      color: #999;
    }

    .detail-row strong {
      color: #1B4332;
    }

    .success-section {
      text-align: left;
      margin: 1.5rem 0;
      padding: 1rem;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .success-section h3 {
      margin-top: 0;
      color: #1B4332;
    }

    .download-list {
      list-style: none;
      padding: 0;
      margin: 1rem 0;
    }

    .download-list li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
      color: #666;
    }

    .download-list svg {
      color: #52B788;
      flex-shrink: 0;
    }

    .success-cta {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .success-cta .btn {
      flex: 1;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .payment-modal {
        width: 95%;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .success-cta {
        flex-direction: column;
      }
    }
  `;

  document.head.appendChild(styles);
}

/* ============================================================
   INITIALIZATION
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Payment Module] Initializing NutriLife payment system');

  PaymentState.init();
  StripePayment.init(STRIPE_PUBLIC_KEY);
  PayPalPayment.init(PAYPAL_CLIENT_ID);
  injectPaymentStyles();
  initPaymentButtons();

  console.log('[Payment Module] Initialization complete');
});

/* Export functions for external use */
window.PaymentSystem = {
  PRODUCTS,
  PaymentState,
  StripePayment,
  PayPalPayment,
  initPaymentButtons,
  showEmailCaptureModal,
  closePaymentModal
};
