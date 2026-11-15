/* ============================================================
   FIREBASE — data load (products, banners, categories, settings)
   aur orders save karna.

   Realtime Database structure (admin panel isi me likhega):
     /settings            { storeName, whatsapp, phone, address,
                            freeShippingAbove, shippingCharge,
                            announcements: [..], instagram }
     /banners/{id}        { image, tag, title, subtitle,
                            buttonText, buttonLink, order, active }
     /categories/{id}     { name, image, order, active }
     /products/{id}       { title, category, price, mrp, stock,
                            images: [url, ...], highlights: [..],
                            description, featured, newArrival,
                            bestSeller, active, createdAt }
     /orders/{orderId}    (website likhti hai jab order hota hai)
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-database.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDFXg8h_Ni3gkMQRW4boCjjKFjOX7ipzLU",
  authDomain: "mirdecore.firebaseapp.com",
  databaseURL: "https://mirdecore-default-rtdb.firebaseio.com",
  projectId: "mirdecore",
  storageBucket: "mirdecore.firebasestorage.app",
  messagingSenderId: "121344602435",
  appId: "1:121344602435:web:0965b69bd2af0cd6cdbff6",
  measurementId: "G-NGE3R4Z03Y",
};

let app = null;
let db = null;
try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (e) {
  console.warn("Firebase init failed", e);
}

// Analytics — load hone me fail ho to website par koi asar nahi
if (app) {
  import("https://www.gstatic.com/firebasejs/13.3.0/firebase-analytics.js")
    .then(({ getAnalytics, isSupported }) => isSupported().then((ok) => ok && getAnalytics(app)))
    .catch(() => {});
}

const withTimeout = (p, ms) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

/** {id: {...}} ya [...] ko list me badalta hai, inactive hata deta hai, order se sort karta hai */
function toList(val) {
  if (!val) return [];
  const entries = Array.isArray(val)
    ? val.map((v, i) => [String(i), v])
    : Object.entries(val);
  return entries
    .filter(([, v]) => v && typeof v === "object" && v.active !== false)
    .map(([id, v]) => ({ ...v, id: v.id || id }))
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

function normaliseProduct(p) {
  let images = p.images;
  if (images && !Array.isArray(images)) images = Object.values(images);
  if (!images || !images.length) images = p.image ? [p.image] : [];
  let highlights = p.highlights;
  if (highlights && !Array.isArray(highlights)) highlights = Object.values(highlights);
  return {
    ...p,
    price: Number(p.price) || 0,
    mrp: Number(p.mrp) || 0,
    stock: p.stock === undefined || p.stock === "" ? null : Number(p.stock),
    images: images.filter(Boolean),
    highlights: (highlights || []).filter(Boolean),
  };
}

/** Firebase se store ka data. Fail ho to null. */
export async function loadRemote(timeoutMs = 4500) {
  if (!db) return null;
  try {
    const paths = ["settings", "banners", "categories", "products"];
    const snaps = await withTimeout(Promise.all(paths.map((p) => get(ref(db, p)))), timeoutMs);
    const [settings, banners, categories, products] = snaps.map((s) => s.val());
    const has = (v) => !!v && typeof v === "object" && Object.keys(v).length > 0;
    return {
      // Admin ne kuch bhi add kiya hai (chahe hidden ho) to demo data nahi dikhega
      has: { banners: has(banners), categories: has(categories), products: has(products) },
      settings: settings && typeof settings === "object" ? settings : {},
      banners: toList(banners),
      categories: toList(categories),
      products: toList(products).map(normaliseProduct),
    };
  } catch (e) {
    console.warn("Firebase data load failed — demo data use ho raha hai.", e);
    return null;
  }
}

/** Order Firebase me save karta hai (admin panel me dikhega). */
export async function saveOrder(order) {
  if (!db) throw new Error("no db");
  await withTimeout(set(ref(db, "orders/" + order.id), order), 8000);
}
