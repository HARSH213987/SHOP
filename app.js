/* =========================================================================
   AUTO VEO — app.js
   Handles: product catalog, cart (add/remove/qty/total), mock auth/session,
   toasts, and category filtering.

   IMPORTANT — READ BEFORE DEPLOYING:
   - Cart state lives in memory (a JS variable) for this demo, so it resets
     on page reload. To persist a real cart, connect ADD_TO_CART / cart
     mutations below to a backend (e.g. save to a database keyed by user
     or session, or use your own server + localStorage on a real domain —
     browser storage is disabled inside Claude.ai artifacts specifically).
   - Login here is a MOCK auth flow: email/password is accepted with only
     basic validation, and "Sign in with Google" simulates a Google account
     without contacting Google at all. Neither one checks real credentials.
     To ship REAL Gmail login you need:
       1. A registered app in Google Cloud Console (OAuth 2.0 Client ID)
       2. A real domain (Google OAuth will not authorize localhost-only
          or sandboxed preview domains for production use)
       3. A backend endpoint that exchanges Google's auth code for a
          verified identity (Google Identity Services / OAuth2 flow)
     Search "Google Identity Services web sign-in" for the real integration
     guide once you have a backend and domain ready.
   - Checkout below is UI-only. To take real payment, integrate a gateway
     such as Razorpay or Stripe from your backend — never process card
     details directly in front-end JS.
   ========================================================================= */

(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // PRODUCT CATALOG (single source of truth for hero ticket + product grid)
  // ---------------------------------------------------------------------
  const PRODUCTS = [
    { id: "acc-seat-cover",   name: "Universal Seat Cover Set",     cat: "acc",  catLabel: "ACCESSORIES", price: 1499, icon: "seat" },
    { id: "bike-helmet",      name: "ISI Full-Face Helmet",         cat: "bike", catLabel: "BIKE GARAGE", price: 2299, icon: "helmet" },
    { id: "toy-car-64",       name: "1:64 Die-Cast Model Car",      cat: "toy",  catLabel: "TOY GARAGE",  price: 399,  icon: "toycar" },
    { id: "acc-mats",         name: "All-Weather Floor Mats",       cat: "acc",  catLabel: "ACCESSORIES", price: 1199, icon: "mats" },
    { id: "bike-chain-kit",   name: "Chain Lube & Clean Kit",       cat: "bike", catLabel: "BIKE GARAGE", price: 349,  icon: "chain" },
    { id: "toy-bike-18",      name: "1:18 Die-Cast Superbike",      cat: "toy",  catLabel: "TOY GARAGE",  price: 899,  icon: "toybike" },
    { id: "acc-phone-mount",  name: "Magnetic Car Phone Mount",     cat: "acc",  catLabel: "ACCESSORIES", price: 599,  icon: "mount" },
    { id: "bike-gloves",      name: "Riding Gloves (All-Season)",   cat: "bike", catLabel: "BIKE GARAGE", price: 749,  icon: "gloves" },
    { id: "toy-truck-24",     name: "1:24 Die-Cast Pickup Truck",   cat: "toy",  catLabel: "TOY GARAGE",  price: 649,  icon: "toytruck" },
  ];

  const ICONS = {
    seat:     '<svg viewBox="0 0 24 24" fill="none"><path d="M4 15v4M20 15v4M3 11l1.6-5.4A2 2 0 016.5 4h11a2 2 0 011.9 1.6L21 11M3 11h18v5a1 1 0 01-1 1H4a1 1 0 01-1-1v-5z" stroke="currentColor" stroke-width="1.4"/><circle cx="7" cy="14" r="1.2" fill="currentColor"/><circle cx="17" cy="14" r="1.2" fill="currentColor"/></svg>',
    helmet:   '<svg viewBox="0 0 24 24" fill="none"><path d="M4 13a8 8 0 0116 0M4 13v3a2 2 0 002 2h1M20 13v3a2 2 0 01-2 2h-1M4 13a4 4 0 018 0h0a4 4 0 018 0" stroke="currentColor" stroke-width="1.4"/></svg>',
    toycar:   '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="9" width="16" height="6" rx="1.4" stroke="currentColor" stroke-width="1.4"/><path d="M7 9V7a2 2 0 012-2h6a2 2 0 012 2v2" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="15" r="1.5" stroke="currentColor" stroke-width="1.3"/><circle cx="16" cy="15" r="1.5" stroke="currentColor" stroke-width="1.3"/></svg>',
    mats:     '<svg viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 6l1 13a1 1 0 001 1h12a1 1 0 001-1L20 6M9 10v6M15 10v6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    chain:    '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3v4M6 6l2.5 2.5M18 6l-2.5 2.5M4 14h16M4 14a4 4 0 018 0h0a4 4 0 018 0M4 14v2a1 1 0 001 1h1M20 14v2a1 1 0 01-1 1h-1" stroke="currentColor" stroke-width="1.4"/></svg>',
    toybike:  '<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="5" rx="1.2" stroke="currentColor" stroke-width="1.4"/><path d="M7 11V9a1 1 0 011-1h8a1 1 0 011 1v2" stroke="currentColor" stroke-width="1.4"/><circle cx="8.5" cy="16" r="1.3" stroke="currentColor" stroke-width="1.2"/><circle cx="15.5" cy="16" r="1.3" stroke="currentColor" stroke-width="1.2"/></svg>',
    mount:    '<svg viewBox="0 0 24 24" fill="none"><rect x="7" y="3" width="10" height="16" rx="1.6" stroke="currentColor" stroke-width="1.4"/><path d="M9 20h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    gloves:   '<svg viewBox="0 0 24 24" fill="none"><path d="M7 11V6a1.5 1.5 0 013 0v4M10 10V5a1.5 1.5 0 013 0v5M13 10V6a1.5 1.5 0 013 0v6M6 12v4a5 5 0 005 5h1a5 5 0 005-5v-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    toytruck: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 15V9a1 1 0 011-1h8v7M12 8h4l3 3v4" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="7" cy="16" r="1.7" stroke="currentColor" stroke-width="1.3"/><circle cx="17" cy="16" r="1.7" stroke="currentColor" stroke-width="1.3"/></svg>',
  };

  function tagClass(cat){ return cat === "acc" ? "tag-acc" : cat === "bike" ? "tag-bike" : "tag-toy"; }
  function money(n){ return "₹" + n.toLocaleString("en-IN"); }

  // ---------------------------------------------------------------------
  // STATE (in-memory only — see note above)
  // ---------------------------------------------------------------------
  let cart = {};      // { productId: qty }
  let session = null; // { name, email, provider }

  // ---------------------------------------------------------------------
  // RENDER: product grid
  // ---------------------------------------------------------------------
  function renderProducts(filter) {
    const grid = document.getElementById("prodGrid");
    if (!grid) return;
    const list = filter && filter !== "all" ? PRODUCTS.filter(p => p.cat === filter) : PRODUCTS;
    grid.innerHTML = list.map(p => `
      <div class="prod-card" data-id="${p.id}">
        <div class="prod-media">${ICONS[p.icon]}</div>
        <div class="prod-content">
          <span class="prod-tag ${tagClass(p.cat)}">${p.catLabel}</span>
          <div class="prod-name">${p.name}</div>
          <div class="prod-row">
            <span class="prod-price mono">${money(p.price)}</span>
            <button class="add-btn" data-add="${p.id}">Add</button>
          </div>
        </div>
      </div>
    `).join("");

    grid.querySelectorAll("[data-add]").forEach(btn => {
      btn.addEventListener("click", () => {
        addToCart(btn.getAttribute("data-add"));
        btn.textContent = "Added ✓";
        btn.classList.add("added");
        setTimeout(() => { btn.textContent = "Add"; btn.classList.remove("added"); }, 1200);
      });
    });
  }

  function setupFilters() {
    const chips = document.querySelectorAll(".filter-chip");
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        chips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        renderProducts(chip.getAttribute("data-filter"));
      });
    });
  }

  // ---------------------------------------------------------------------
  // CART LOGIC
  // ---------------------------------------------------------------------
  function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    renderCart();
    showToast(`${productById(id).name} added to cart`);
  }
  function changeQty(id, delta) {
    if (!cart[id]) return;
    cart[id] += delta;
    if (cart[id] <= 0) delete cart[id];
    renderCart();
  }
  function removeFromCart(id) {
    delete cart[id];
    renderCart();
  }
  function productById(id) { return PRODUCTS.find(p => p.id === id); }
  function cartCount() { return Object.values(cart).reduce((a, b) => a + b, 0); }
  function cartSubtotal() {
    return Object.entries(cart).reduce((sum, [id, qty]) => sum + productById(id).price * qty, 0);
  }

  function renderCart() {
    const countEls = document.querySelectorAll(".cart-count");
    const n = cartCount();
    countEls.forEach(el => { el.textContent = n; el.style.display = n > 0 ? "flex" : "none"; });

    const body = document.getElementById("drawerBody");
    const foot = document.getElementById("drawerFoot");
    if (!body) return;

    const ids = Object.keys(cart);
    if (ids.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none"><path d="M3 4h2l2.4 12.4A2 2 0 009.4 18h7.2a2 2 0 002-1.6L20 8H6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="21" r="1.4" fill="currentColor"/><circle cx="17" cy="21" r="1.4" fill="currentColor"/></svg>
          <div>Your cart is empty.</div>
        </div>`;
      if (foot) foot.style.display = "none";
      return;
    }
    if (foot) foot.style.display = "block";

    body.innerHTML = ids.map(id => {
      const p = productById(id);
      const qty = cart[id];
      return `
        <div class="cart-item" data-id="${id}">
          <div class="cart-item-media">${ICONS[p.icon]}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${p.name}</div>
            <div class="cart-item-tag mono">${p.catLabel}</div>
            <div class="cart-item-controls">
              <button class="qty-btn" data-dec="${id}">−</button>
              <span class="qty-val mono">${qty}</span>
              <button class="qty-btn" data-inc="${id}">+</button>
              <button class="cart-item-remove" data-remove="${id}">Remove</button>
            </div>
          </div>
          <div class="cart-item-price mono">${money(p.price * qty)}</div>
        </div>`;
    }).join("");

    body.querySelectorAll("[data-inc]").forEach(b => b.addEventListener("click", () => changeQty(b.getAttribute("data-inc"), 1)));
    body.querySelectorAll("[data-dec]").forEach(b => b.addEventListener("click", () => changeQty(b.getAttribute("data-dec"), -1)));
    body.querySelectorAll("[data-remove]").forEach(b => b.addEventListener("click", () => removeFromCart(b.getAttribute("data-remove"))));

    const subtotal = cartSubtotal();
    const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79;
    const total = subtotal + shipping;
    const subEl = document.getElementById("cartSubtotal");
    const shipEl = document.getElementById("cartShipping");
    const totEl = document.getElementById("cartTotal");
    if (subEl) subEl.textContent = money(subtotal);
    if (shipEl) shipEl.textContent = shipping === 0 ? "Free" : money(shipping);
    if (totEl) totEl.textContent = money(total);
  }

  function openDrawer() {
    document.getElementById("cartOverlay").classList.add("open");
    document.getElementById("cartDrawer").classList.add("open");
  }
  function closeDrawer() {
    document.getElementById("cartOverlay").classList.remove("open");
    document.getElementById("cartDrawer").classList.remove("open");
  }

  // ---------------------------------------------------------------------
  // TOAST
  // ---------------------------------------------------------------------
  let toastTimer;
  function showToast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.querySelector(".toast-msg").textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  // ---------------------------------------------------------------------
  // MOCK AUTH
  // ---------------------------------------------------------------------
  function openAuthModal() { document.getElementById("authOverlay").classList.add("open"); }
  function closeAuthModal() { document.getElementById("authOverlay").classList.remove("open"); }

  function setSession(newSession) {
    session = newSession;
    renderAuthUI();
    closeAuthModal();
    showToast(`Signed in as ${session.name}`);
  }
  function signOut() {
    session = null;
    renderAuthUI();
    showToast("Signed out");
  }
  function renderAuthUI() {
    const slot = document.getElementById("authSlot");
    if (!slot) return;
    if (session) {
      const initial = session.name.trim().charAt(0).toUpperCase();
      slot.innerHTML = `
        <button class="user-chip" id="userChipBtn">
          <span class="user-avatar">${initial}</span>
          <span class="user-name">${session.name.split(" ")[0]}</span>
        </button>`;
      document.getElementById("userChipBtn").addEventListener("click", () => {
        if (confirm("Sign out of Auto Veo?")) signOut();
      });
    } else {
      slot.innerHTML = `<button class="btn btn-outline btn-sm" id="loginBtn">Login</button>`;
      document.getElementById("loginBtn").addEventListener("click", openAuthModal);
    }
  }

  function validateEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function setupAuthForm() {
    const form = document.getElementById("authForm");
    const err = document.getElementById("authError");
    const googleBtn = document.getElementById("googleSignIn");
    const modeToggle = document.getElementById("authModeToggle");
    const title = document.getElementById("authTitle");
    const submitBtn = document.getElementById("authSubmit");
    const nameGroup = document.getElementById("nameGroup");
    let mode = "signin"; // or "signup"

    modeToggle.addEventListener("click", () => {
      mode = mode === "signin" ? "signup" : "signin";
      title.textContent = mode === "signin" ? "Log in to Auto Veo" : "Create your account";
      submitBtn.textContent = mode === "signin" ? "Log In" : "Sign Up";
      nameGroup.style.display = mode === "signup" ? "block" : "none";
      modeToggle.parentElement.querySelector(".switch-text").textContent =
        mode === "signin" ? "New to Auto Veo?" : "Already have an account?";
      modeToggle.textContent = mode === "signin" ? "Create an account" : "Log in";
      err.classList.remove("show");
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("authEmail").value.trim();
      const pass = document.getElementById("authPassword").value;
      const name = document.getElementById("authName").value.trim();

      if (!validateEmail(email)) {
        err.textContent = "Enter a valid email address.";
        err.classList.add("show");
        return;
      }
      if (pass.length < 6) {
        err.textContent = "Password must be at least 6 characters.";
        err.classList.add("show");
        return;
      }
      if (mode === "signup" && !name) {
        err.textContent = "Enter your name to create an account.";
        err.classList.add("show");
        return;
      }
      err.classList.remove("show");
      // MOCK: no real backend validates this — see app.js header note.
      setSession({ name: mode === "signup" ? name : email.split("@")[0], email, provider: "email" });
      form.reset();
    });

    googleBtn.addEventListener("click", () => {
      // MOCK Google sign-in — does not contact Google. See app.js header note
      // for what a real "Sign in with Google" integration requires.
      setSession({ name: "Rohan Sharma", email: "rohan.sharma@gmail.com", provider: "google" });
    });
  }

  // ---------------------------------------------------------------------
  // NEWSLETTER (mock submit)
  // ---------------------------------------------------------------------
  function setupNewsletter() {
    const form = document.getElementById("nlForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = document.getElementById("nlMsg");
      msg.classList.add("show");
      form.reset();
      setTimeout(() => msg.classList.remove("show"), 4000);
    });
  }

  // ---------------------------------------------------------------------
  // CHECKOUT (mock)
  // ---------------------------------------------------------------------
  function setupCheckout() {
    const btn = document.getElementById("checkoutBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (cartCount() === 0) return;
      if (!session) {
        closeDrawer();
        openAuthModal();
        showToast("Log in to check out");
        return;
      }
      // MOCK: no real payment is processed — see app.js header note.
      showToast("Order placed! (demo — no real payment taken)");
      cart = {};
      renderCart();
      closeDrawer();
    });
  }

  // ---------------------------------------------------------------------
  // INIT
  // ---------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    renderProducts("all");
    setupFilters();
    renderCart();
    renderAuthUI();
    setupNewsletter();
    setupCheckout();

    const cartBtn = document.getElementById("cartBtn");
    if (cartBtn) cartBtn.addEventListener("click", openDrawer);
    const closeBtn = document.getElementById("drawerCloseBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    const overlay = document.getElementById("cartOverlay");
    if (overlay) overlay.addEventListener("click", closeDrawer);

    if (document.getElementById("authForm")) setupAuthForm();
    const authOverlay = document.getElementById("authOverlay");
    if (authOverlay) authOverlay.addEventListener("click", (e) => { if (e.target === authOverlay) closeAuthModal(); });
    const authCloseBtn = document.getElementById("authCloseBtn");
    if (authCloseBtn) authCloseBtn.addEventListener("click", closeAuthModal);

    // category card "shop now" buttons scroll to products + apply filter
    document.querySelectorAll("[data-scroll-filter]").forEach(el => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const f = el.getAttribute("data-scroll-filter");
        document.getElementById("products").scrollIntoView({ behavior: "smooth" });
        setTimeout(() => {
          const chip = document.querySelector(`.filter-chip[data-filter="${f}"]`);
          if (chip) chip.click();
        }, 400);
      });
    });
  });
})();
