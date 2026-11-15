/* ============================================================
   MIRDECORE — USER WEBSITE
   Hash routes:
     #/                     Home
     #/shop?cat=&sort=&q=   Shop / category / search
     #/product/{id}         Product page
     #/checkout             Cart checkout
     #/checkout?buy={id}&qty=n   Buy Now (single product)
     #/order/{orderId}      Order placed
     #/account              Profile + delivery address + my orders
     #/wishlist             Wishlist
   ============================================================ */

import { DEMO } from "./demo-data.js?v=4";
import { loadRemote, saveOrder } from "./firebase.js?v=2";

/* ==================== ICONS ==================== */
const sv = (d) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICONS = {
  search: sv('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  heart: sv('<path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.6 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/>'),
  user: sv('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'),
  bag: sv('<path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
  home: sv('<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>'),
  grid: sv('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'),
  close: sv('<path d="M6 6l12 12M18 6 6 18"/>'),
  chev: sv('<path d="m6 9 6 6 6-6"/>'),
  arrow: sv('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  check: sv('<path d="m5 12.5 4.5 4.5L19 7"/>'),
  truck: sv('<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>'),
  shield: sv('<path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6L12 3z"/><path d="m9 12 2 2 4-4"/>'),
  gift: sv('<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8S10.5 3.5 8 4.5 9.5 8 12 8zm0 0s1.5-4.5 4-3.5S14.5 8 12 8z"/>'),
  gem: sv('<path d="M6 3h12l3 6-9 12L3 9l3-6z"/><path d="M3 9h18M9 3l3 6 3-6M12 21 9 9M12 21l3-12"/>'),
  phone: sv('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
  pin: sv('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  box: sv('<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>'),
  cash: sv('<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>'),
  edit: sv('<path d="M4 20h4L19 9l-4-4L4 16v4z"/>'),
  whatsapp:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
};
const ic = (n) => `<i data-icon="${n}">${ICONS[n] || ""}</i>`;
function hydrateIcons(root = document) {
  root.querySelectorAll("i[data-icon]").forEach((el) => {
    if (!el.firstChild) el.innerHTML = ICONS[el.dataset.icon] || "";
  });
}

/* ==================== HELPERS ==================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'><rect width='400' height='500' fill='#F3EBDD'/><text x='200' y='280' text-anchor='middle' font-family='Georgia' font-size='72' fill='#D4B26A'>M</text></svg>"
  );
window.__imgErr = (el) => { el.onerror = null; el.src = PLACEHOLDER; };
function safeUrl(u) {
  u = String(u || "").trim();
  if (/^https?:\/\//i.test(u) || /^data:image\//i.test(u)) return u;
  if (/^[\w\-./]+$/.test(u) && !u.includes(":")) return u; // relative path
  return "";
}
const imgSrc = (u) => safeUrl(u) || PLACEHOLDER;
const imgTag = (u, alt = "", extra = "") =>
  `<img src="${esc(imgSrc(u))}" alt="${esc(alt)}" decoding="async" onerror="__imgErr(this)" ${extra || 'loading="lazy"'}>`;
const money = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");
const safeLink = (u) => {
  u = String(u || "").trim();
  return u.startsWith("#") || /^https?:\/\//i.test(u) ? u : "#/shop";
};
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

const LS = {
  get(k, d) {
    try { const v = localStorage.getItem("md_" + k); return v ? JSON.parse(v) : d; } catch { return d; }
  },
  set(k, v) {
    try { localStorage.setItem("md_" + k, JSON.stringify(v)); } catch {}
  },
};

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
];

/* ==================== STATE ==================== */
const state = {
  settings: { ...DEMO.settings },
  banners: [],
  categories: [],
  products: [],
  byId: new Map(),
  catById: new Map(),
  demo: true,
  cart: LS.get("cart", []), // [{id, qty}]
  wish: LS.get("wish", []), // [id]
  profile: LS.get("profile", null),
  orders: LS.get("orders", []),
};

function toArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === "object") return Object.values(v).filter(Boolean);
  return String(v).split(/\n|\|/).map((s) => s.trim()).filter(Boolean);
}

function applyData(remote) {
  const r = remote || { settings: {}, banners: [], categories: [], products: [] };
  const has = r.has || { banners: r.banners.length > 0, categories: r.categories.length > 0, products: r.products.length > 0 };
  state.demo = !has.products;
  state.settings = { ...DEMO.settings, ...r.settings };
  state.settings.announcements = toArray(state.settings.announcements);
  if (!state.settings.announcements.length) state.settings.announcements = DEMO.settings.announcements;
  state.banners = (has.banners ? r.banners : DEMO.banners).filter((b) => b.image);
  if (!state.banners.length) state.banners = DEMO.banners; // hero kabhi khaali na rahe
  state.products = has.products ? r.products : DEMO.products;

  if (has.categories) state.categories = r.categories;
  else if (state.demo) state.categories = DEMO.categories;
  else {
    // Categories nahi bani to products se bana lo
    const seen = new Map();
    state.products.forEach((p) => {
      if (p.category && !seen.has(p.category))
        seen.set(p.category, { id: p.category, name: p.category, image: p.images[0] });
    });
    state.categories = [...seen.values()];
  }
  state.byId = new Map(state.products.map((p) => [String(p.id), p]));
  state.catById = new Map(state.categories.map((c) => [String(c.id), c]));
  // cart / wishlist me se hate hue products saaf karo
  state.cart = state.cart.filter((l) => state.byId.has(String(l.id)));
  state.wish = state.wish.filter((id) => state.byId.has(String(id)));
}

const catName = (p) => state.catById.get(String(p.category))?.name || p.category || "";
const inCat = (p, cat) => {
  const c = state.catById.get(String(cat));
  return String(p.category) === String(cat) || (c && String(p.category) === String(c.name));
};
const disc = (p) => (p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0);
const isOut = (p) => p.stock !== null && p.stock !== undefined && Number(p.stock) <= 0;
const maxQty = (p) => (p.stock !== null && p.stock !== undefined && Number(p.stock) > 0 ? Math.min(Number(p.stock), 50) : 50);

function waNumber() {
  let d = String(state.settings.whatsapp || "").replace(/\D/g, "");
  if (d.length === 10) d = "91" + d;
  return d;
}
const waLink = (text) => `https://wa.me/${waNumber()}${text ? "?text=" + encodeURIComponent(text) : ""}`;

/* ==================== TOAST ==================== */
let toastTimer;
function toast(msg, icon = "check") {
  const t = $("#toast");
  t.innerHTML = `${ic(icon)}<span>${esc(msg)}</span>`;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ==================== CART & WISHLIST ==================== */
function saveCart() { LS.set("cart", state.cart); updateBadges(); }
function cartLines() {
  return state.cart
    .map((l) => ({ ...l, p: state.byId.get(String(l.id)) }))
    .filter((l) => l.p);
}
function totals(lines) {
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const fsa = Number(state.settings.freeShippingAbove) || 0;
  const charge = Number(state.settings.shippingCharge) || 0;
  const shipping = subtotal === 0 || (fsa > 0 && subtotal >= fsa) ? 0 : charge;
  return { subtotal, shipping, total: subtotal + shipping, count };
}

function addToCart(id, qty = 1, srcImg) {
  const p = state.byId.get(String(id));
  if (!p) return;
  if (isOut(p)) return toast("Sorry, this item is sold out", "close");
  const line = state.cart.find((l) => String(l.id) === String(id));
  if (line) line.qty = Math.min(line.qty + qty, maxQty(p));
  else state.cart.push({ id: String(id), qty: Math.min(qty, maxQty(p)) });
  saveCart();
  renderCart();
  fly(srcImg);
  toast(`${p.title} added to cart`, "bag");
}
function setQty(id, qty) {
  const line = state.cart.find((l) => String(l.id) === String(id));
  if (!line) return;
  const p = state.byId.get(String(id));
  line.qty = Math.max(1, Math.min(qty, p ? maxQty(p) : 50));
  saveCart();
  renderCart();
}
function removeFromCart(id) {
  state.cart = state.cart.filter((l) => String(l.id) !== String(id));
  saveCart();
  renderCart();
}
function toggleWish(id, btn) {
  id = String(id);
  const on = !state.wish.includes(id);
  state.wish = on ? [...state.wish, id] : state.wish.filter((x) => x !== id);
  LS.set("wish", state.wish);
  $$(`[data-wish="${CSS.escape(id)}"]`).forEach((b) => {
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on);
  });
  if (btn) { btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop"); }
  updateBadges();
  toast(on ? "Saved to wishlist" : "Removed from wishlist", "heart");
  if (!on && currentView === "wishlist") render();
}

function updateBadges(bump) {
  const c = state.cart.reduce((s, l) => s + l.qty, 0);
  const w = state.wish.length;
  $$('[data-count="cart"]').forEach((b) => {
    b.textContent = c;
    b.classList.toggle("show", c > 0);
    if (bump) { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
  });
  $$('[data-count="wish"]').forEach((b) => { b.textContent = w; b.classList.toggle("show", w > 0); });
}

/** Product image ko cart icon tak udaata hai */
function fly(srcImg) {
  if (!srcImg || reduced) return updateBadges(true);
  const targets = $$(".cart-target").filter((el) => el.offsetParent !== null);
  const target = targets[targets.length - 1];
  if (!target) return updateBadges(true);
  const a = srcImg.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  if (!a.width) return updateBadges(true);
  const c = document.createElement("img");
  c.src = srcImg.currentSrc || srcImg.src;
  c.className = "fly";
  Object.assign(c.style, { left: a.left + "px", top: a.top + "px", width: a.width + "px", height: a.height + "px" });
  document.body.appendChild(c);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const anim = c.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) scale(0.5)`, opacity: 0.95, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.06)`, opacity: 0.4 },
    ],
    { duration: 900, easing: "cubic-bezier(.55,0,.3,1)" }
  );
  anim.onfinish = () => { c.remove(); updateBadges(true); };
}

/* ==================== CART DRAWER ==================== */
function renderCart() {
  const lines = cartLines();
  const t = totals(lines);
  const body = $("#cartBody");
  const foot = $("#cartFoot");
  if (!lines.length) {
    body.innerHTML = `<div class="empty">${ic("bag")}<h3>Your cart is empty</h3><p>Discover pieces you'll love living with.</p><a class="btn btn-dark" href="#/shop" data-close-cart>Start Shopping</a></div>`;
    foot.innerHTML = "";
    foot.style.display = "none";
    hydrateIcons(body);
    return;
  }
  foot.style.display = "";
  body.innerHTML = lines
    .map(
      (l) => `<div class="citem">
        <a href="#/product/${encodeURIComponent(l.p.id)}">${imgTag(l.p.images[0], l.p.title)}</a>
        <div>
          <a class="citem-title" href="#/product/${encodeURIComponent(l.p.id)}">${esc(l.p.title)}</a>
          <div class="price"><b>${money(l.p.price)}</b>${l.p.mrp > l.p.price ? `<s>${money(l.p.mrp)}</s>` : ""}</div>
          <div class="citem-meta">
            <div class="qty sm"><button type="button" data-qty="${esc(l.p.id)}" data-d="-1" aria-label="Decrease">−</button><span>${l.qty}</span><button type="button" data-qty="${esc(l.p.id)}" data-d="1" aria-label="Increase">+</button></div>
            <b>${money(l.p.price * l.qty)}</b>
          </div>
          <button type="button" class="citem-remove" data-remove="${esc(l.p.id)}">Remove</button>
        </div>
      </div>`
    )
    .join("");
  const fsa = Number(state.settings.freeShippingAbove) || 0;
  let meter = "";
  if (fsa > 0) {
    const left = Math.max(0, fsa - t.subtotal);
    const pct = Math.min(100, (t.subtotal / fsa) * 100);
    meter = `<div class="ship-meter">${left > 0 ? `Add <b>${money(left)}</b> more for <b>FREE shipping</b>` : `🎉 You've unlocked <b>FREE shipping</b>`}<div class="bar"><span style="width:${pct}%"></span></div></div>`;
  }
  foot.innerHTML = `${meter}
    <div class="sum-row"><span>Subtotal (${t.count} item${t.count > 1 ? "s" : ""})</span><b>${money(t.subtotal)}</b></div>
    <div class="sum-row"><span>Shipping</span>${t.shipping ? `<b>${money(t.shipping)}</b>` : `<span class="free">FREE</span>`}</div>
    <div class="sum-row total"><span>Total</span><span>${money(t.total)}</span></div>
    <a class="btn btn-gold btn-block" href="#/checkout" style="margin-top:14px">Checkout ${ic("arrow")}</a>`;
  hydrateIcons(body);
  hydrateIcons(foot);
}
function openCart() {
  renderCart();
  document.body.classList.add("cart-open");
  $("#cartDrawer").setAttribute("aria-hidden", "false");
}
function closeCart() {
  document.body.classList.remove("cart-open");
  $("#cartDrawer").setAttribute("aria-hidden", "true");
}

/* ==================== SEARCH ==================== */
function searchProducts(term) {
  const t = term.trim().toLowerCase();
  if (!t) return [];
  const words = t.split(/\s+/);
  return state.products.filter((p) => {
    const hay = [p.title, catName(p), p.description, ...(p.highlights || [])].join(" ").toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}
function renderSearch() {
  const term = $("#searchInput").value;
  const box = $("#searchResults");
  if (!term.trim()) {
    box.innerHTML = `<p class="sr-hint">Popular: ${state.categories
      .slice(0, 5)
      .map((c) => `<a href="#/shop?cat=${encodeURIComponent(c.id)}">${esc(c.name)}</a>`)
      .join(" · ")}</p>`;
    return;
  }
  const res = searchProducts(term);
  box.innerHTML = res.length
    ? res
        .slice(0, 8)
        .map(
          (p) => `<a class="sr-item" href="#/product/${encodeURIComponent(p.id)}">${imgTag(p.images[0], p.title)}<div><div class="t">${esc(p.title)}</div><small>${esc(catName(p))}</small></div><b>${money(p.price)}</b></a>`
        )
        .join("") +
      (res.length > 8 ? `<p class="sr-hint"><a href="#/shop?q=${encodeURIComponent(term)}">See all ${res.length} results</a></p>` : "")
    : `<p class="sr-hint">No products found for “${esc(term)}”.</p>`;
}
function openSearch() {
  document.body.classList.add("search-open");
  $("#searchOverlay").setAttribute("aria-hidden", "false");
  renderSearch();
  setTimeout(() => $("#searchInput").focus(), 60);
}
function closeSearch() {
  document.body.classList.remove("search-open");
  $("#searchOverlay").setAttribute("aria-hidden", "true");
}

/* ==================== SHARED TEMPLATES ==================== */
function priceHtml(p) {
  const d = disc(p);
  return `<div class="price"><b>${money(p.price)}</b>${d > 0 ? `<s>${money(p.mrp)}</s><span class="off">${d}% off</span>` : ""}</div>`;
}
function productCard(p, i = 0) {
  const d = disc(p);
  const out = isOut(p);
  const on = state.wish.includes(String(p.id));
  const href = `#/product/${encodeURIComponent(p.id)}`;
  const badges = [];
  if (out) badges.push('<span class="tag tag-out">Sold out</span>');
  if (d >= 5) badges.push(`<span class="tag tag-sale">−${d}%</span>`);
  if (p.bestSeller) badges.push('<span class="tag tag-gold">Bestseller</span>');
  else if (p.newArrival) badges.push('<span class="tag">New</span>');
  return `<article class="pcard reveal" style="--d:${(i % 4) * 0.08}s">
    <div class="pcard-frame">
      <a class="pcard-media" href="${href}" aria-label="${esc(p.title)}">
        ${imgTag(p.images[0], p.title)}
        ${p.images[1] ? imgTag(p.images[1], "", 'loading="lazy" class="alt"') : ""}
        <div class="pcard-badges">${badges.slice(0, 2).join("")}</div>
      </a>
      <button type="button" class="wish-btn ${on ? "on" : ""}" data-wish="${esc(p.id)}" aria-label="Save to wishlist" aria-pressed="${on}">${ic("heart")}</button>
    </div>
    <div class="pcard-body">
      <span class="pcard-cat">${esc(catName(p))}</span>
      <a class="pcard-title" href="${href}">${esc(p.title)}</a>
      ${priceHtml(p)}
      <button type="button" class="pcard-add" data-add="${esc(p.id)}" ${out ? "disabled" : ""}>${ic("bag")}<span>${out ? "Sold out" : "Add to Cart"}</span></button>
    </div>
  </article>`;
}
const emptyState = (icon, title, text, btn = `<a class="btn btn-dark" href="#/shop">Explore the Collection</a>`) =>
  `<div class="container"><div class="empty">${ic(icon)}<h3>${title}</h3><p>${text}</p>${btn}</div></div>`;

function pick(fn, n) {
  const a = state.products.filter(fn);
  return (a.length >= 2 ? a : state.products).slice(0, n);
}
const byNewest = (a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0);

/* ==================== VIEW: HOME ==================== */
function viewHome() {
  const s = state.settings;
  const B = state.banners;
  const featured = pick((p) => p.featured, 8);
  let newest = state.products.filter((p) => p.newArrival).sort(byNewest);
  if (newest.length < 3) newest = [...state.products].sort(byNewest);
  newest = newest.slice(0, 10);
  const best = pick((p) => p.bestSeller, 4);
  const edImg = B[1]?.image || B[0]?.image;
  const strip = [...s.announcements, "Handpicked Luxury", "Timeless Design", "Made for Indian Homes"];

  return `
  <section class="hero" id="hero">
    <div class="hero-track">
    ${B.map(
      (b, i) => `<div class="hero-slide ${i === 0 ? "active" : ""}">
        <div class="container hero-grid">
          <div class="hero-content">
            <span class="hero-tag">${esc(b.tag || s.storeName || "Mir Decor")}</span>
            <${i === 0 ? "h1" : "h2"} class="hero-title">${esc(b.title || s.tagline)}</${i === 0 ? "h1" : "h2"}>
            <p>${esc(b.subtitle || "")}</p>
            <div class="hero-cta">
              <a class="btn btn-gold" href="${esc(safeLink(b.buttonLink))}">${esc(b.buttonText || "Shop Now")} ${ic("arrow")}</a>
            </div>
          </div>
          <div class="hero-arch"><div class="arch-frame">${imgTag(b.image, "", i === 0 ? 'fetchpriority="high"' : 'loading="eager"')}</div></div>
        </div>
      </div>`
    ).join("")}
    </div>
    ${B.length > 1 ? `<div class="hero-dots"><div class="container">
      ${B.map((_, i) => `<button type="button" class="hero-dot ${i === 0 ? "active" : ""}" data-slide="${i}" aria-label="Slide ${i + 1}"><span></span></button>`).join("")}
      <span class="hero-count" id="heroCount">01 / ${String(B.length).padStart(2, "0")}</span>
    </div></div>` : ""}
  </section>

  <div class="strip" aria-hidden="true"><div class="strip-track">
    ${[...strip, ...strip].map((t) => `<span>${esc(t)}</span>`).join("")}
  </div></div>

  <section class="section">
    <div class="container">
      <div class="section-head center reveal">
        <span class="eyebrow">Shop by Category</span>
        <h2 class="section-title">Find your <em>signature</em> style</h2>
      </div>
      <div class="cat-row">
        ${state.categories
          .map(
            (c, i) => `<a class="cat-card reveal" style="--d:${(i % 6) * 0.07}s" href="#/shop?cat=${encodeURIComponent(c.id)}">
              <div class="cat-img">${imgTag(c.image, c.name)}</div>
              <div class="cat-name">${esc(c.name)}</div>
            </a>`
          )
          .join("")}
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="container">
      <div class="section-head reveal">
        <div><span class="eyebrow">Curated for you</span><h2 class="section-title">The <em>Signature</em> Collection</h2></div>
        <a class="link-arrow" href="#/shop">View all ${ic("arrow")}</a>
      </div>
      <div class="grid">${featured.map(productCard).join("")}</div>
    </div>
  </section>

  <section class="editorial reveal-zoom" id="editorial">
    <div class="editorial-img">${imgTag(edImg, "Mir Decor interior")}</div>
    <div class="editorial-text">
      <span class="eyebrow">The Mir Decor Promise</span>
      <h2>Crafted for <em>royal</em> living, made for real homes.</h2>
      <p>Every piece is chosen for its craft, its character and the way it makes a room feel. Luxury should feel personal — not out of reach.</p>
      <ul class="editorial-list">
        <li>${ic("gem")} Handpicked, quality-checked pieces</li>
        <li>${ic("box")} Packed with care, delivered across India</li>
        <li>${ic("whatsapp")} Personal help on WhatsApp, before and after you buy</li>
      </ul>
      <div><a class="btn btn-gold" href="#/shop">Shop the Collection ${ic("arrow")}</a></div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head reveal">
        <div><span class="eyebrow">Just landed</span><h2 class="section-title">New <em>Arrivals</em></h2></div>
        <a class="link-arrow" href="#/shop?sort=new">See all ${ic("arrow")}</a>
      </div>
      <div class="scroller">${newest.map(productCard).join("")}</div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="container">
      <div class="section-head reveal">
        <div><span class="eyebrow">Most loved</span><h2 class="section-title">Our <em>Bestsellers</em></h2></div>
        <a class="link-arrow" href="#/shop?sort=best">Shop bestsellers ${ic("arrow")}</a>
      </div>
      <div class="grid">${best.map(productCard).join("")}</div>
    </div>
  </section>

  <section class="promise">
    <div class="promise-item reveal">${ic("gem")}<h4>Handpicked Quality</h4><p>Every piece is checked before it leaves us.</p></div>
    <div class="promise-item reveal" style="--d:.08s">${ic("box")}<h4>Secure Packing</h4><p>Fragile items packed with extra care.</p></div>
    <div class="promise-item reveal" style="--d:.16s">${ic("truck")}<h4>Pan-India Delivery</h4><p>${Number(s.freeShippingAbove) > 0 ? `Free shipping above ${money(s.freeShippingAbove)}.` : "Delivered to your doorstep."}</p></div>
    <div class="promise-item reveal" style="--d:.24s">${ic("whatsapp")}<h4>WhatsApp Support</h4><p>Real people, quick replies.</p></div>
  </section>

  <section class="section">
    <div class="container">
      <div class="wa-band reveal">
        <div>
          <span class="eyebrow">Need help choosing?</span>
          <h2>Talk to us on WhatsApp — we'll style it with you.</h2>
          <p style="margin-top:10px">Share your space, your colours, your budget. We'll suggest pieces that fit.</p>
        </div>
        <a class="btn btn-wa" href="${esc(waLink("Hi Mir Decor! I need help choosing décor for my home."))}" target="_blank" rel="noopener">${ic("whatsapp")} Chat with us</a>
      </div>
    </div>
  </section>`;
}

let heroTimer = null;
function initHero() {
  const slides = $$(".hero-slide");
  const dots = $$(".hero-dot");
  const count = $("#heroCount");
  if (slides.length < 2) return;
  const MS = 6000;
  $("#hero").style.setProperty("--hero-ms", MS + "ms");
  let i = 0;
  const go = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("active", k === i));
    dots.forEach((d) => d.classList.remove("active"));
    void dots[i]?.offsetWidth;
    dots[i]?.classList.add("active");
    if (count) count.textContent = `${String(i + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  };
  const start = () => { clearInterval(heroTimer); heroTimer = setInterval(() => go(i + 1), MS); };
  dots.forEach((d) => d.addEventListener("click", () => { go(Number(d.dataset.slide)); start(); }));
  let x0 = null;
  const hero = $("#hero");
  hero.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) { go(i + (dx < 0 ? 1 : -1)); start(); }
    x0 = null;
  });
  start();
}

/* ==================== VIEW: SHOP ==================== */
const shopState = { cat: "", sort: "featured", term: "" };
const SORTS = [
  ["featured", "Featured"],
  ["new", "Newest first"],
  ["best", "Bestsellers"],
  ["price-asc", "Price: Low to High"],
  ["price-desc", "Price: High to Low"],
  ["discount", "Biggest discount"],
];
function filteredProducts() {
  let list = shopState.term ? searchProducts(shopState.term) : [...state.products];
  if (shopState.cat) list = list.filter((p) => inCat(p, shopState.cat));
  const flag = (k) => (a, b) => (b[k] ? 1 : 0) - (a[k] ? 1 : 0);
  switch (shopState.sort) {
    case "new": list.sort(byNewest); break;
    case "best": list.sort(flag("bestSeller")); break;
    case "price-asc": list.sort((a, b) => a.price - b.price); break;
    case "price-desc": list.sort((a, b) => b.price - a.price); break;
    case "discount": list.sort((a, b) => disc(b) - disc(a)); break;
    default: list.sort(flag("featured"));
  }
  // Sold out sabse neeche
  list.sort((a, b) => (isOut(a) ? 1 : 0) - (isOut(b) ? 1 : 0));
  return list;
}
function shopGridHtml() {
  const list = filteredProducts();
  return list.length
    ? `<div class="grid">${list.map(productCard).join("")}</div>`
    : `<div class="empty">${ic("search")}<h3>Nothing found</h3><p>Try a different word or category.</p><a class="btn btn-line" href="#/shop">Clear filters</a></div>`;
}
function viewShop(q) {
  shopState.cat = q.get("cat") || "";
  shopState.sort = q.get("sort") || "featured";
  shopState.term = q.get("q") || "";
  const cat = state.catById.get(shopState.cat);
  const title = cat ? cat.name : shopState.sort === "new" ? "New Arrivals" : shopState.sort === "best" ? "Bestsellers" : shopState.term ? "Search Results" : "The Collection";
  return `
  <section class="page-hero">
    <div class="container">
      <div class="crumbs"><a href="#/">Home</a> / Shop${cat ? ` / ${esc(cat.name)}` : ""}</div>
      <h1>${esc(title)}</h1>
      <p>Luxury décor, handpicked for beautiful homes.</p>
    </div>
  </section>
  <div class="container" style="padding-bottom:60px">
    <div class="chips" role="list">
      <a role="listitem" class="chip ${!shopState.cat ? "active" : ""}" href="#/shop${shopState.sort !== "featured" ? `?sort=${shopState.sort}` : ""}">All</a>
      ${state.categories.map((c) => `<a role="listitem" class="chip ${shopState.cat === String(c.id) ? "active" : ""}" href="#/shop?cat=${encodeURIComponent(c.id)}">${esc(c.name)}</a>`).join("")}
    </div>
    <div class="toolbar">
      <label class="shop-search">${ic("search")}<span class="sr-only">Search products</span>
        <input class="input" id="shopSearch" type="search" placeholder="Search in collection…" value="${esc(shopState.term)}">
      </label>
      <span class="count" id="shopCount"></span>
      <label><span class="sr-only">Sort by</span>
        <select class="select" id="shopSort">${SORTS.map(([v, l]) => `<option value="${v}" ${v === shopState.sort ? "selected" : ""}>${l}</option>`).join("")}</select>
      </label>
    </div>
    <div id="shopGrid">${shopGridHtml()}</div>
  </div>`;
}
function updateShop() {
  const grid = $("#shopGrid");
  if (!grid) return;
  grid.innerHTML = shopGridHtml();
  hydrateIcons(grid);
  observeReveal(grid);
  const n = filteredProducts().length;
  $("#shopCount").textContent = `${n} product${n === 1 ? "" : "s"}`;
  const p = new URLSearchParams();
  if (shopState.cat) p.set("cat", shopState.cat);
  if (shopState.sort !== "featured") p.set("sort", shopState.sort);
  if (shopState.term) p.set("q", shopState.term);
  const qs = p.toString();
  history.replaceState(null, "", "#/shop" + (qs ? "?" + qs : ""));
}
function initShop() {
  const n = filteredProducts().length;
  $("#shopCount").textContent = `${n} product${n === 1 ? "" : "s"}`;
  let t;
  $("#shopSearch").addEventListener("input", (e) => {
    clearTimeout(t);
    t = setTimeout(() => { shopState.term = e.target.value.trim(); updateShop(); }, 180);
  });
  $("#shopSort").addEventListener("change", (e) => { shopState.sort = e.target.value; updateShop(); });
}

/* ==================== VIEW: PRODUCT ==================== */
let pdpQty = 1;
function viewProduct(id) {
  const p = state.byId.get(String(id));
  if (!p) return emptyState("search", "Product not found", "This product may have been removed or is no longer available.");
  pdpQty = 1;
  const d = disc(p);
  const out = isOut(p);
  const low = !out && p.stock !== null && p.stock !== undefined && Number(p.stock) <= 5;
  const on = state.wish.includes(String(p.id));
  const imgs = p.images.length ? p.images : [""];
  const related = state.products.filter((x) => x.id !== p.id && inCat(x, p.category)).slice(0, 4);
  const more = related.length < 4 ? state.products.filter((x) => x.id !== p.id && !related.includes(x)).slice(0, 4 - related.length) : [];
  const desc = String(p.description || "").split(/\n+/).filter(Boolean);
  const s = state.settings;
  const shareText = `${p.title} — ${money(p.price)} at Mir Decor\n${location.href}`;
  const cat = state.catById.get(String(p.category));

  return `
  <div class="container">
    <div class="pdp">
      <div class="gallery reveal-zoom">
        <div class="gallery-track" id="galleryTrack">
          ${imgs.map((u, i) => imgTag(u, `${p.title} ${i + 1}`, i === 0 ? 'fetchpriority="high"' : 'loading="lazy"')).join("")}
        </div>
        <button type="button" class="wish-btn ${on ? "on" : ""}" data-wish="${esc(p.id)}" aria-label="Save to wishlist" aria-pressed="${on}">${ic("heart")}</button>
        ${imgs.length > 1 ? `<div class="gallery-thumbs">${imgs.map((u, i) => `<button type="button" class="${i === 0 ? "active" : ""}" data-thumb="${i}" aria-label="Image ${i + 1}">${imgTag(u, "")}</button>`).join("")}</div>` : ""}
      </div>

      <div class="pdp-info">
        <div class="crumbs reveal"><a href="#/">Home</a> / <a href="#/shop">Shop</a>${cat ? ` / <a href="#/shop?cat=${encodeURIComponent(cat.id)}">${esc(cat.name)}</a>` : ""}</div>
        <h1 class="reveal">${esc(p.title)}</h1>
        <div class="pdp-price reveal"><b>${money(p.price)}</b>${d > 0 ? `<s>${money(p.mrp)}</s><span class="off">Save ${d}%</span>` : ""}</div>
        <p class="tax-note reveal">Inclusive of all taxes</p>
        <span class="stock reveal ${out ? "out" : low ? "low" : ""}">${out ? "Currently sold out" : low ? `Only ${Number(p.stock)} left — order soon` : "In stock, ready to ship"}</span>

        ${p.highlights.length ? `<ul class="highlights reveal">${p.highlights.map((h) => `<li>${ic("check")} ${esc(h)}</li>`).join("")}</ul>` : ""}

        <div class="pdp-actions reveal" id="pdpActions">
          <div class="qty" aria-label="Quantity">
            <button type="button" data-pqty="-1" aria-label="Decrease">−</button><span id="pdpQty">1</span><button type="button" data-pqty="1" aria-label="Increase">+</button>
          </div>
          <button type="button" class="btn btn-dark" data-add="${esc(p.id)}" data-useqty ${out ? "disabled" : ""}>${ic("bag")} Add to Cart</button>
          <button type="button" class="btn btn-gold" data-buy="${esc(p.id)}" ${out ? "disabled" : ""}>${ic("whatsapp")} Buy Now</button>
        </div>

        <div class="perks reveal">
          <div>${ic("truck")}<span>${Number(s.freeShippingAbove) > 0 ? `Free shipping above ${money(s.freeShippingAbove)}` : "Pan-India delivery"}</span></div>
          <div>${ic("box")}<span>Secure, careful packing</span></div>
          <div>${ic("whatsapp")}<span>Order help on WhatsApp</span></div>
        </div>

        ${desc.length ? `<div class="desc reveal"><h3>Description</h3>${desc.map((t) => `<p>${esc(t)}</p>`).join("")}</div>` : ""}

        <a class="share-link reveal" href="${esc("https://wa.me/?text=" + encodeURIComponent(shareText))}" target="_blank" rel="noopener">${ic("whatsapp")} Share with family on WhatsApp</a>
      </div>
    </div>

    ${related.length + more.length ? `<section class="section" style="padding-top:30px">
      <div class="section-head reveal"><div><span class="eyebrow">You may also like</span><h2 class="section-title">Pairs <em>beautifully</em> with</h2></div></div>
      <div class="grid">${[...related, ...more].map(productCard).join("")}</div>
    </section>` : ""}
  </div>

  <div class="sticky-buy" id="stickyBuy">
    <div class="sb-price"><b>${money(p.price)}</b>${d > 0 ? `<s>${money(p.mrp)}</s>` : ""}</div>
    <button type="button" class="btn btn-line" data-add="${esc(p.id)}" data-useqty ${out ? "disabled" : ""}>Add</button>
    <button type="button" class="btn btn-gold" data-buy="${esc(p.id)}" ${out ? "disabled" : ""}>Buy Now</button>
  </div>`;
}
function initProduct() {
  const track = $("#galleryTrack");
  const thumbs = $$("[data-thumb]");
  if (track && thumbs.length) {
    track.addEventListener("scroll", () => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      thumbs.forEach((t, k) => t.classList.toggle("active", k === i));
    }, { passive: true });
  }
  const actions = $("#pdpActions");
  const bar = $("#stickyBuy");
  if (actions && bar && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(([e]) => {
      bar.classList.toggle("show", !e.isIntersecting && e.boundingClientRect.top < 0);
    });
    io.observe(actions);
    cleanups.push(() => io.disconnect());
  }
}

/* ==================== PROFILE FORM ==================== */
function field(name, label, opts = {}) {
  const v = opts.value ?? "";
  const req = opts.req ? "<span>*</span>" : "";
  const common = `id="f_${name}" name="${name}" ${opts.req ? "required" : ""} ${opts.auto ? `autocomplete="${opts.auto}"` : ""}`;
  let input;
  if (opts.type === "textarea") input = `<textarea class="input" ${common} rows="3" placeholder="${esc(opts.ph || "")}">${esc(v)}</textarea>`;
  else if (opts.type === "state")
    input = `<select class="select" ${common}><option value="">Select state</option>${INDIAN_STATES.map((s) => `<option ${s === v ? "selected" : ""}>${s}</option>`).join("")}</select>`;
  else
    input = `<input class="input" ${common} type="${opts.type || "text"}" value="${esc(v)}" placeholder="${esc(opts.ph || "")}" ${opts.mode ? `inputmode="${opts.mode}"` : ""} ${opts.max ? `maxlength="${opts.max}"` : ""}>`;
  return `<div class="field ${opts.half ? "half" : ""}" data-field="${name}"><label for="f_${name}">${label} ${req}</label>${input}<span class="err"></span></div>`;
}
function profileFields(pr = {}) {
  return `<div class="form-grid">
    ${field("name", "Full name", { req: true, value: pr.name, auto: "name", ph: "e.g. Aamir Saifi" })}
    ${field("phone", "Mobile number", { req: true, half: true, value: pr.phone, type: "tel", mode: "numeric", max: 14, auto: "tel", ph: "10-digit mobile" })}
    ${field("email", "Email (optional)", { half: true, value: pr.email, type: "email", auto: "email", ph: "you@example.com" })}
    ${field("address", "House no., building, street, area", { req: true, value: pr.address, type: "textarea", auto: "street-address" })}
    ${field("landmark", "Landmark (optional)", { value: pr.landmark, ph: "Near…" })}
    ${field("city", "City", { req: true, half: true, value: pr.city, auto: "address-level2" })}
    ${field("pincode", "Pincode", { req: true, half: true, value: pr.pincode, mode: "numeric", max: 6, auto: "postal-code" })}
    ${field("state", "State", { req: true, value: pr.state || "Uttar Pradesh", type: "state", auto: "address-level1" })}
  </div>`;
}
function readProfile(form) {
  const g = (n) => (form.elements[n]?.value || "").trim();
  const data = {
    name: g("name"), phone: g("phone").replace(/\D/g, "").slice(-10), email: g("email"),
    address: g("address"), landmark: g("landmark"), city: g("city"), state: g("state"), pincode: g("pincode"),
  };
  const errors = {};
  if (data.name.length < 2) errors.name = "Please enter your full name";
  if (!/^[6-9]\d{9}$/.test(data.phone)) errors.phone = "Enter a valid 10-digit mobile number";
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Enter a valid email";
  if (data.address.length < 8) errors.address = "Please enter your complete address";
  if (data.city.length < 2) errors.city = "Enter your city";
  if (!/^[1-9]\d{5}$/.test(data.pincode)) errors.pincode = "Enter a valid 6-digit pincode";
  if (!data.state) errors.state = "Select your state";
  $$("[data-field]", form).forEach((f) => {
    const e = errors[f.dataset.field];
    f.classList.toggle("invalid", !!e);
    $(".err", f).textContent = e || "";
  });
  const first = Object.keys(errors)[0];
  if (first) form.elements[first]?.focus();
  return { data, ok: !first };
}
function saveProfile(data) {
  state.profile = data;
  LS.set("profile", data);
}

/* ==================== VIEW: CHECKOUT ==================== */
let checkoutCtx = { lines: [], mode: "cart" };
function viewCheckout(q) {
  const buyId = q.get("buy");
  let lines;
  if (buyId) {
    const p = state.byId.get(String(buyId));
    const qty = Math.max(1, Math.min(parseInt(q.get("qty"), 10) || 1, p ? maxQty(p) : 1));
    lines = p && !isOut(p) ? [{ id: String(p.id), qty, p }] : [];
    checkoutCtx = { lines, mode: "buynow" };
  } else {
    lines = cartLines();
    checkoutCtx = { lines, mode: "cart" };
  }
  if (!lines.length) return emptyState("bag", "Nothing to checkout", "Your cart is empty. Add something beautiful first.");
  const t = totals(lines);
  return `
  <section class="page-hero"><div class="container">
    <div class="crumbs"><a href="#/">Home</a> / Checkout</div>
    <h1>Checkout</h1>
    <p>Confirm your delivery details — your order will be sent to us on WhatsApp.</p>
  </div></section>
  <div class="container">
    <div class="checkout">
      <form class="card reveal" id="checkoutForm" novalidate>
        <h2>Delivery Address</h2>
        <p class="card-sub">${state.profile ? "We've filled in your saved details. Edit if anything has changed." : "Saved on this device for faster checkout next time."}</p>
        ${profileFields(state.profile || {})}
      </form>

      <aside class="card summary reveal" style="--d:.1s">
        <h2>Order Summary</h2>
        <p class="card-sub">${t.count} item${t.count > 1 ? "s" : ""}${checkoutCtx.mode === "buynow" ? " · Buy Now" : ""}</p>
        ${lines.map((l) => `<div class="sum-item">${imgTag(l.p.images[0], l.p.title)}<div><div class="t">${esc(l.p.title)}</div><small>Qty ${l.qty} × ${money(l.p.price)}</small></div><b>${money(l.p.price * l.qty)}</b></div>`).join("")}
        <div style="margin-top:12px">
          <div class="sum-row"><span>Subtotal</span><b>${money(t.subtotal)}</b></div>
          <div class="sum-row"><span>Shipping</span>${t.shipping ? `<b>${money(t.shipping)}</b>` : `<span class="free">FREE</span>`}</div>
          <div class="sum-row total"><span>Total</span><span>${money(t.total)}</span></div>
        </div>
        <div class="pay-note">${ic("cash")}<span><b>Prepaid orders only — Cash on Delivery is not available.</b> Tap the button to send your order &amp; address on WhatsApp. Press <b>Send</b> and we'll share UPI / bank payment details to confirm it.</span></div>
        <button type="submit" form="checkoutForm" class="btn btn-wa btn-block">${ic("whatsapp")} Place Order on WhatsApp</button>
      </aside>
    </div>
  </div>`;
}

function makeOrderId() {
  const d = new Date();
  const ymd = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MD${ymd}-${rnd}`;
}
function orderMessage(o) {
  const c = o.customer;
  const lines = [
    `*🛍️ New Order — ${state.settings.storeName || "Mir Decor"}*`,
    `Order ID: *${o.id}*`,
    `Date: ${o.dateText}`,
    "",
    "*Items:*",
    ...o.items.map((it, i) => `${i + 1}. ${it.title}\n    Qty ${it.qty} × ${money(it.price)} = ${money(it.lineTotal)}`),
    "",
    `Subtotal: ${money(o.subtotal)}`,
    `Shipping: ${o.shipping ? money(o.shipping) : "FREE"}`,
    `*Total: ${money(o.total)}*`,
    "",
    "*Deliver to:*",
    c.name,
    `📞 ${c.phone}`,
    ...(c.email ? [`✉️ ${c.email}`] : []),
    c.address,
    ...(c.landmark ? [`Landmark: ${c.landmark}`] : []),
    `${c.city}, ${c.state} - ${c.pincode}`,
    "",
    "Payment: Prepaid (UPI / Bank transfer) — please share payment details to confirm my order. 🙏",
  ];
  return lines.join("\n");
}
function placeOrder(form) {
  const { data, ok } = readProfile(form);
  if (!ok) return toast("Please complete your delivery details", "close");
  saveProfile(data);
  const lines = checkoutCtx.lines;
  const t = totals(lines);
  const now = new Date();
  const order = {
    id: makeOrderId(),
    createdAt: now.getTime(),
    dateText: now.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }),
    status: "new",
    channel: "whatsapp",
    mode: checkoutCtx.mode,
    items: lines.map((l) => ({
      id: String(l.p.id), title: l.p.title, price: l.p.price, mrp: l.p.mrp || 0, qty: l.qty,
      image: l.p.images[0] || "", lineTotal: l.p.price * l.qty,
    })),
    subtotal: t.subtotal,
    shipping: t.shipping,
    total: t.total,
    customer: data,
  };
  const url = waLink(orderMessage(order));
  // WhatsApp turant kholo (popup blocker se bachne ke liye click ke andar hi)
  const win = window.open(url, "_blank");
  if (win) try { win.opener = null; } catch {}
  order.waOpened = !!win;

  state.orders = [order, ...state.orders].slice(0, 50);
  LS.set("orders", state.orders);
  saveOrder(order).catch((e) => console.warn("Order Firebase me save nahi hua (WhatsApp par chala gaya):", e));
  if (checkoutCtx.mode === "cart") { state.cart = []; saveCart(); renderCart(); }
  location.hash = `#/order/${order.id}${win ? "" : "?open=1"}`;
}

/* ==================== VIEW: ORDER PLACED ==================== */
function viewOrderDone(id, q) {
  const o = state.orders.find((x) => x.id === id);
  if (!o) return emptyState("box", "Order not found", "We couldn't find this order on this device.");
  return `<div class="container"><div class="success">
    <svg class="success-check" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45"/><path d="M30 52 l14 14 l27 -30"/></svg>
    <span class="eyebrow">Thank you, ${esc(o.customer.name.split(" ")[0])}</span>
    <h1>Your order is ready to send</h1>
    <span class="order-id">${esc(o.id)}</span>
    <p>We've opened WhatsApp with your order and delivery address. <b>Please press Send in WhatsApp</b> — we'll share payment details (UPI / bank transfer) and confirm your order. Cash on Delivery is not available.</p>
    <div class="btn-row">
      <button type="button" class="btn btn-wa" data-resend="${esc(o.id)}">${ic("whatsapp")} ${q.get("open") ? "Send Order on WhatsApp" : "Open WhatsApp Again"}</button>
      <a class="btn btn-line" href="#/shop">Continue Shopping</a>
    </div>
    <div class="card" style="width:min(520px,100%);text-align:left;margin-top:10px">
      ${o.items.map((it) => `<div class="sum-item">${imgTag(it.image, it.title)}<div><div class="t">${esc(it.title)}</div><small>Qty ${it.qty} × ${money(it.price)}</small></div><b>${money(it.lineTotal)}</b></div>`).join("")}
      <div class="sum-row total"><span>Total</span><span>${money(o.total)}</span></div>
      <div class="addr-card" style="margin-top:14px"><b>${esc(o.customer.name)}</b> · ${esc(o.customer.phone)}<br>${esc(o.customer.address)}${o.customer.landmark ? `, ${esc(o.customer.landmark)}` : ""}<br>${esc(o.customer.city)}, ${esc(o.customer.state)} - ${esc(o.customer.pincode)}</div>
    </div>
  </div></div>`;
}

/* ==================== VIEW: ACCOUNT ==================== */
function viewAccount() {
  const pr = state.profile;
  return `
  <section class="page-hero"><div class="container">
    <div class="crumbs"><a href="#/">Home</a> / My Account</div>
    <h1>${pr ? `Hello, ${esc(pr.name.split(" ")[0])}` : "My Account"}</h1>
    <p>Your delivery details are saved on this device for one-tap ordering.</p>
  </div></section>
  <div class="container">
    <div class="account-grid">
      <form class="card reveal" id="accountForm" novalidate>
        <h2>Profile &amp; Delivery Address</h2>
        <p class="card-sub">Used automatically when you tap Buy Now.</p>
        ${profileFields(pr || {})}
        <button type="submit" class="btn btn-dark btn-block" style="margin-top:18px">${ic("check")} Save Details</button>
      </form>
      <div class="card reveal" style="--d:.1s">
        <h2>My Orders</h2>
        <p class="card-sub">Orders placed from this device.</p>
        ${state.orders.length
          ? `<div class="orders-list">${state.orders.map((o) => `<div class="order-row"><div><b>${esc(o.id)}</b><small>${esc(o.dateText)} · ${o.items.reduce((s, i) => s + i.qty, 0)} item(s)</small></div><div style="display:flex;gap:10px;align-items:center"><b>${money(o.total)}</b><button type="button" class="btn btn-wa" style="height:40px;padding:0 14px" data-resend="${esc(o.id)}" aria-label="Send ${esc(o.id)} on WhatsApp">${ic("whatsapp")}</button></div></div>`).join("")}</div>`
          : `<div class="empty" style="padding:30px 0">${ic("box")}<p>No orders yet.</p><a class="btn btn-line" href="#/shop">Start Shopping</a></div>`}
      </div>
    </div>
  </div>`;
}

/* ==================== VIEW: WISHLIST ==================== */
function viewWishlist() {
  const items = state.wish.map((id) => state.byId.get(String(id))).filter(Boolean);
  return `
  <section class="page-hero"><div class="container">
    <div class="crumbs"><a href="#/">Home</a> / Wishlist</div>
    <h1>Your Wishlist</h1>
    <p>${items.length ? `${items.length} saved piece${items.length > 1 ? "s" : ""}` : "Save the pieces you love."}</p>
  </div></section>
  ${items.length
    ? `<div class="container" style="padding-bottom:60px"><div class="grid" style="margin-top:20px">${items.map(productCard).join("")}</div></div>`
    : emptyState("heart", "Your wishlist is empty", "Tap the heart on any product to save it here.")}`;
}

/* ==================== CHROME: NAV, FOOTER, ANNOUNCEMENT ==================== */
function renderChrome() {
  const s = state.settings;
  const ann = s.announcements;
  $("#announceTrack").innerHTML = [...ann, ...ann, ...ann, ...ann].map((t) => `<span>${esc(t)}</span>`).join("");
  $("#navCats").innerHTML = state.categories
    .map((c) => `<a href="#/shop?cat=${encodeURIComponent(c.id)}">${imgTag(c.image, "")}<span>${esc(c.name)}</span></a>`)
    .join("");
  $("#waFloat").href = waLink("Hi Mir Decor! I'd like to know more about your products.");
  const tel = String(s.phone || "").replace(/[^\d+]/g, "");
  $("#footer").innerHTML = `<div class="container">
    <div class="footer-grid">
      <div>
        <a href="#/" class="logo logo-lg"><img class="logo-img" src="images/logo-160.png" alt="Mir Decor logo" width="72" height="72" loading="lazy"><span class="logo-text">MIR <em>DECOR</em></span></a>
        <p>Genuine handcrafted metalwork, straight from the artisans of Aligarh — shelves, planters &amp; décor items for beautiful homes.</p>
        <p class="footer-note">🔒 Prepaid orders only · Cash on Delivery not available</p>
      </div>
      <div>
        <h4>Shop</h4>
        <ul>
          <li><a href="#/shop">All Products</a></li>
          <li><a href="#/shop?sort=new">New Arrivals</a></li>
          <li><a href="#/shop?sort=best">Bestsellers</a></li>
          ${state.categories.slice(0, 4).map((c) => `<li><a href="#/shop?cat=${encodeURIComponent(c.id)}">${esc(c.name)}</a></li>`).join("")}
        </ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="about.html">About Us &amp; Our Mission</a></li>
          <li><a href="support.html">Customer Support</a></li>
          <li><a href="privacy-policy.html">Privacy Policy</a></li>
          <li><a href="terms.html">Terms &amp; Conditions</a></li>
          <li><a href="#/account">My Account &amp; Orders</a></li>
        </ul>
      </div>
      <div>
        <h4>Support</h4>
        <ul>
          ${s.phone ? `<li>${ic("phone")}<a href="tel:${esc(tel)}">Support: ${esc(s.phone)}</a></li>` : ""}
          <li>${ic("whatsapp")}<a href="${esc(waLink("Hi Mir Decor! I need help with my order."))}" target="_blank" rel="noopener">Chat on WhatsApp</a></li>
          ${s.address ? `<li>${ic("pin")}<span>${esc(s.address)}</span></li>` : ""}
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} Mir Decor · All rights reserved</span>
      <span class="dev-credit">Developed by <a href="mailto:support@bulandtech.in?subject=Mir%20Decor%20Website%20Support" title="Email support@bulandtech.in">Bulandtech</a></span>
    </div>
  </div>`;
  hydrateIcons($("#footer"));
  hydrateIcons($("#navCats"));
  updateBadges();
}

/* ==================== REVEAL ON SCROLL ==================== */
const io = "IntersectionObserver" in window
  ? new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    )
  : null;
function observeReveal(root = document) {
  $$(".reveal:not(.in), .reveal-zoom:not(.in)", root).forEach((el) => (io ? io.observe(el) : el.classList.add("in")));
}

/* ==================== ROUTER ==================== */
let currentView = "";
let cleanups = [];
function parseHash() {
  const h = location.hash.replace(/^#/, "") || "/";
  const [path, qs] = h.split("?");
  return { parts: path.split("/").filter(Boolean), q: new URLSearchParams(qs || "") };
}
const TITLES = { home: "", shop: "Shop", product: "", checkout: "Checkout", order: "Order Placed", account: "My Account", wishlist: "Wishlist" };

function render() {
  clearInterval(heroTimer);
  cleanups.forEach((f) => f());
  cleanups = [];
  closeCart();
  closeSearch();
  const { parts, q } = parseHash();
  const view = parts[0] || "home";
  currentView = view;
  let html;
  switch (view) {
    case "home": html = viewHome(); break;
    case "shop": html = viewShop(q); break;
    case "product": html = viewProduct(decodeURIComponent(parts[1] || "")); break;
    case "checkout": html = viewCheckout(q); break;
    case "order": html = viewOrderDone(decodeURIComponent(parts[1] || ""), q); break;
    case "account": html = viewAccount(); break;
    case "wishlist": html = viewWishlist(); break;
    default: html = emptyState("search", "Page not found", "The page you're looking for doesn't exist.");
  }
  document.body.classList.toggle("is-home", view === "home");
  document.body.classList.toggle("on-product", view === "product");
  const seo = $("#seoBlock");
  if (seo) seo.hidden = view !== "home";
  const app = $("#app");
  app.innerHTML = `<div class="page">${html}</div>`;
  hydrateIcons(app);
  window.scrollTo(0, 0);
  onScroll();

  const navKey = view === "shop" ? (q.get("sort") === "new" ? "new" : q.get("sort") === "best" ? "best" : "shop") : view;
  $$("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === navKey));

  const p = view === "product" ? state.byId.get(decodeURIComponent(parts[1] || "")) : null;
  const t = p ? p.title : TITLES[view];
  document.title = t ? `${t} | Mir Decor` : "Mir Decor – Handcrafted Metal Shelves, Planters & Décor, Aligarh";

  if (view === "home") initHero();
  if (view === "shop") initShop();
  if (view === "product") initProduct();
  observeReveal(app);
}

/* ==================== GLOBAL EVENTS ==================== */
function onScroll() {
  $("#siteHeader").classList.toggle("scrolled", window.scrollY > 30);
}

function bindGlobal() {
  window.addEventListener("hashchange", render);
  window.addEventListener("scroll", onScroll, { passive: true });

  document.addEventListener("click", (e) => {
    const t = e.target.closest("button, a");
    if (!t) return;

    if (t.matches("[data-add]")) {
      e.preventDefault();
      const id = t.dataset.add;
      const qty = t.hasAttribute("data-useqty") ? pdpQty : 1;
      const src = t.closest(".pcard")?.querySelector(".pcard-media img") || $("#galleryTrack img");
      addToCart(id, qty, src);
      if (t.classList.contains("pcard-add")) {
        const label = $("span", t);
        t.classList.add("done");
        label.textContent = "Added ✓";
        setTimeout(() => { t.classList.remove("done"); label.textContent = "Add to Cart"; }, 1600);
      }
      return;
    }
    if (t.matches("[data-wish]")) { e.preventDefault(); toggleWish(t.dataset.wish, t); return; }
    if (t.matches("[data-buy]")) {
      location.hash = `#/checkout?buy=${encodeURIComponent(t.dataset.buy)}&qty=${pdpQty}`;
      return;
    }
    if (t.matches("[data-pqty]")) {
      const p = state.byId.get(parseHash().parts[1] ? decodeURIComponent(parseHash().parts[1]) : "");
      pdpQty = Math.max(1, Math.min(pdpQty + Number(t.dataset.pqty), p ? maxQty(p) : 50));
      $("#pdpQty").textContent = pdpQty;
      return;
    }
    if (t.matches("[data-thumb]")) {
      const track = $("#galleryTrack");
      track.scrollTo({ left: Number(t.dataset.thumb) * track.clientWidth, behavior: reduced ? "auto" : "smooth" });
      return;
    }
    if (t.matches("[data-qty]")) {
      const line = state.cart.find((l) => String(l.id) === t.dataset.qty);
      if (line) setQty(line.id, line.qty + Number(t.dataset.d));
      return;
    }
    if (t.matches("[data-remove]")) { removeFromCart(t.dataset.remove); return; }
    if (t.matches("[data-resend]")) {
      const o = state.orders.find((x) => x.id === t.dataset.resend);
      if (o) window.open(waLink(orderMessage(o)), "_blank", "noopener");
      return;
    }
    if (t.matches("[data-close-cart]")) { closeCart(); return; }
    if (t.id === "cartOpen" || t.id === "cartOpenMobile") { openCart(); return; }
    if (t.id === "cartClose") { closeCart(); return; }
    if (t.id === "searchOpen") { openSearch(); return; }
    if (t.id === "searchClose") { closeSearch(); return; }
    // Link par click jo same route par le jaaye — drawers band karo
    if (t.tagName === "A" && t.getAttribute("href") === location.hash) { closeCart(); closeSearch(); }
  });

  $("#cartBackdrop").addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeCart(); closeSearch(); }
  });

  $("#searchInput").addEventListener("input", renderSearch);
  $("#searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.value.trim()) location.hash = `#/shop?q=${encodeURIComponent(e.target.value.trim())}`;
  });

  document.addEventListener("submit", (e) => {
    const form = e.target;
    if (form.id === "checkoutForm") { e.preventDefault(); placeOrder(form); }
    if (form.id === "accountForm") {
      e.preventDefault();
      const { data, ok } = readProfile(form);
      if (!ok) return toast("Please fix the highlighted fields", "close");
      saveProfile(data);
      toast("Details saved", "check");
      render();
    }
  });
  // Typing karte waqt error hata do
  document.addEventListener("input", (e) => {
    const f = e.target.closest?.(".field.invalid");
    if (f) { f.classList.remove("invalid"); $(".err", f).textContent = ""; }
  });
}

/* ==================== BOOT ==================== */
function hideSplash() {
  document.body.classList.remove("is-loading");
  document.body.classList.add("splash-done");
  setTimeout(() => $("#splash")?.remove(), 1000);
}

async function boot() {
  const t0 = performance.now();
  hydrateIcons();
  bindGlobal();

  const cached = LS.get("cache", null);
  if (cached && cached.products) {
    // Pichla data turant dikhao, background me fresh data lao
    applyData(cached);
    renderChrome();
    render();
    loadRemote(8000).then((r) => {
      if (!r) return;
      const changed = JSON.stringify(r) !== JSON.stringify(cached);
      LS.set("cache", r);
      if (changed) {
        applyData(r);
        renderChrome();
        if (!["checkout", "account"].includes(currentView)) render();
      }
    });
  } else {
    const r = await loadRemote(4500);
    if (r) LS.set("cache", r);
    applyData(r);
    renderChrome();
    render();
  }

  const minSplash = 3600; // Aligarh wali line aaram se padhi ja sake
  setTimeout(hideSplash, Math.max(0, minSplash - (performance.now() - t0)));
}

boot();
