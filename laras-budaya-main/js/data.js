/* =========================================================
   LARAS BUDAYA — Data Layer
   Single source of truth for all LocalStorage-backed data.
   Every page includes this file before its own script.
   ========================================================= */

const LB = (() => {

  // Sync helper for file:// protocol (window.name fallback)
  if(window.location.protocol === 'file:'){
    let state = {};
    try {
      if(window.name && window.name.startsWith('{')){
        state = JSON.parse(window.name);
      }
    } catch(e) {}

    // Populate localStorage from window.name
    Object.keys(state).forEach(key => {
      localStorage.setItem(key, state[key]);
    });

    // Override setItem/removeItem to keep window.name in sync
    const originalSet = localStorage.setItem;
    localStorage.setItem = function(key, value){
      originalSet.apply(this, arguments);
      if(key.startsWith('lb_')){
        try {
          let cur = {};
          if(window.name && window.name.startsWith('{')){ cur = JSON.parse(window.name); }
          cur[key] = value;
          window.name = JSON.stringify(cur);
        } catch(e){}
      }
    };

    const originalRemove = localStorage.removeItem;
    localStorage.removeItem = function(key){
      originalRemove.apply(this, arguments);
      if(key.startsWith('lb_')){
        try {
          let cur = {};
          if(window.name && window.name.startsWith('{')){ cur = JSON.parse(window.name); }
          delete cur[key];
          window.name = JSON.stringify(cur);
        } catch(e){}
      }
    };
  }

  const KEYS = {
    products: 'lb_products', categories: 'lb_categories', users: 'lb_users',
    session: 'lb_session', adminSession: 'lb_admin_session', wishlist: 'lb_wishlist',
    cart: 'lb_cart', orders: 'lb_orders', reviews: 'lb_reviews', chats: 'lb_chats',
    notifications: 'lb_notifications', vouchers: 'lb_vouchers', activity: 'lb_activity',
    banners: 'lb_banners', theme: 'lb_theme', recentlyViewed: 'lb_recently_viewed',
    searchHistory: 'lb_search_history', seeded: 'lb_seeded_v2', loginAttempts: 'lb_login_attempts'
  };

  function get(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){ return fallback; }
  }
  function set(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
  function uid(prefix){ return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
  function nowISO(){ return new Date().toISOString(); }
  function rupiah(n){ return 'Rp' + Math.round(n).toLocaleString('id-ID'); }

  /* ---------------- Seed data ---------------- */
  function seed(force = false){
    if(force){
      Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    }
    if(get(KEYS.seeded, false)) return;

    set(KEYS.categories, typeof SEED_CATEGORIES !== 'undefined' ? SEED_CATEGORIES : []);
    set(KEYS.products, typeof SEED_PRODUCTS !== 'undefined' ? SEED_PRODUCTS : []);
    set(KEYS.users, typeof SEED_USERS !== 'undefined' ? SEED_USERS : []);
    set(KEYS.session, null);
    set(KEYS.wishlist, {'u-demo':['p003','p011']});
    set(KEYS.cart, []);
    set(KEYS.orders, []);
    set(KEYS.reviews, typeof SEED_REVIEWS !== 'undefined' ? SEED_REVIEWS : []);
    set(KEYS.chats, typeof SEED_CHATS !== 'undefined' ? SEED_CHATS : []);
    set(KEYS.notifications, typeof SEED_NOTIFICATIONS !== 'undefined' ? SEED_NOTIFICATIONS : []);
    set(KEYS.vouchers, typeof SEED_VOUCHERS !== 'undefined' ? SEED_VOUCHERS : []);
    set(KEYS.activity, [
      {id:uid('log'), text:'Sistem Laras Budaya diinisialisasi dengan data katalog awal.', time:nowISO()}
    ]);
    set(KEYS.banners, typeof SEED_BANNERS !== 'undefined' ? SEED_BANNERS : []);
    set(KEYS.theme, 'light');
    set(KEYS.recentlyViewed, []);
    set(KEYS.searchHistory, []);
    set(KEYS.seeded, true);
  }

  /* ---------------- Generic collection helpers ---------------- */
  const products = () => get(KEYS.products, []);
  const saveProducts = (v) => set(KEYS.products, v);
  const categories = () => get(KEYS.categories, []);
  const saveCategories = (v) => set(KEYS.categories, v);

  function productById(id){ return products().find(p => p.id === id); }
  function categoryById(id){ return categories().find(c => c.id === id); }

  const users = () => get(KEYS.users, []);
  const saveUsers = (v) => set(KEYS.users, v);
  function userById(id){ return users().find(u => u.id === id); }
  function userByEmail(email){
    if(!email) return null;
    return users().find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  function currentUser(){
    const id = get(KEYS.session, null);
    if(!id) return null;
    return users().find(u => u.id === id) || null;
  }
  function isLoggedIn(){ return !!currentUser(); }

  function login(email, password){
    const cleanEmail = (email||'').trim().toLowerCase();
    const u = users().find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
    if(u){
      if(u.blocked){
        return { error: 'blocked_by_admin', user: u };
      }
      set(KEYS.session, u.id);
      clearLoginAttempts(email);
      return { user: u };
    }
    return null;
  }
  function logout(){ set(KEYS.session, null); }
  function register(data){
    const list = users();
    if(list.some(u => u.email.toLowerCase() === (data.email||'').trim().toLowerCase())) return {error:'Email sudah terdaftar'};
    const newUser = {id: uid('u'), createdAt: nowISO(), blocked: false, ...data};
    list.push(newUser);
    saveUsers(list);
    set(KEYS.session, newUser.id);
    addActivity(`User baru mendaftar: ${newUser.nama} (${newUser.email}).`);
    return {user:newUser};
  }
  function updateUser(id, patch){
    const list = users();
    const idx = list.findIndex(u => u.id === id);
    if(idx > -1){ list[idx] = {...list[idx], ...patch}; saveUsers(list); }
  }
  function deleteUser(id){
    const u = userById(id);
    let list = users().filter(x => x.id !== id);
    saveUsers(list);
    if(u) addActivity(`Admin menghapus user ${u.nama} (${u.email}).`);
  }
  function blockUser(id){
    const list = users();
    const u = list.find(x => x.id === id);
    if(u){
      u.blocked = true;
      saveUsers(list);
      addActivity(`Admin memblokir user ${u.nama} (${u.email}).`);
    }
  }
  function unblockUser(idOrEmail){
    const list = users();
    const clean = (idOrEmail || '').trim().toLowerCase();
    const u = list.find(x => x.id === idOrEmail || x.email.toLowerCase() === clean);
    if(u){
      u.blocked = false;
      saveUsers(list);
      clearLoginAttempts(u.email);
      addActivity(`Admin membuka blokir user ${u.nama} (${u.email}).`);
    } else {
      clearLoginAttempts(idOrEmail);
    }
  }

  /* Login Lock & Failed Attempt Tracking */
  function getLoginLock(email){
    if(!email) return { attempts: 0, lockUntil: 0, isLocked: false };
    const all = get(KEYS.loginAttempts, {});
    const clean = email.trim().toLowerCase();
    const item = all[clean] || { attempts: 0, lockUntil: 0 };
    if(item.lockUntil && Date.now() > item.lockUntil){
      item.attempts = 0;
      item.lockUntil = 0;
      all[clean] = item;
      set(KEYS.loginAttempts, all);
    }
    const isLocked = !!(item.lockUntil && Date.now() <= item.lockUntil);
    return { attempts: item.attempts || 0, lockUntil: item.lockUntil || 0, isLocked };
  }

  function recordFailedLogin(email){
    if(!email) return { attempts: 1, lockUntil: 0, isLocked: false, remainingAttempts: 2 };
    const all = get(KEYS.loginAttempts, {});
    const clean = email.trim().toLowerCase();
    const item = all[clean] || { attempts: 0, lockUntil: 0 };

    if(item.lockUntil && Date.now() < item.lockUntil){
      return { attempts: item.attempts, lockUntil: item.lockUntil, isLocked: true, remainingAttempts: 0 };
    }

    item.attempts = (item.attempts || 0) + 1;
    let isLocked = false;
    if(item.attempts >= 3){
      item.lockUntil = Date.now() + 3 * 60 * 1000; // Block for 3 minutes
      isLocked = true;
    }
    all[clean] = item;
    set(KEYS.loginAttempts, all);
    return { attempts: item.attempts, lockUntil: item.lockUntil, isLocked, remainingAttempts: Math.max(0, 3 - item.attempts) };
  }

  function clearLoginAttempts(email){
    if(!email) return;
    const all = get(KEYS.loginAttempts, {});
    const clean = email.trim().toLowerCase();
    if(all[clean]){
      delete all[clean];
      set(KEYS.loginAttempts, all);
    }
  }

  /* Wishlist keyed by userId */
  function wishlistFor(userId){
    const all = get(KEYS.wishlist, {});
    return all[userId] || [];
  }
  function toggleWishlist(userId, productId){
    const all = get(KEYS.wishlist, {});
    const list = all[userId] || [];
    const idx = list.indexOf(productId);
    let added;
    if(idx > -1){ list.splice(idx,1); added = false; } else { list.push(productId); added = true; }
    all[userId] = list;
    set(KEYS.wishlist, all);
    return added;
  }
  function removeWishlist(userId, productId){
    const all = get(KEYS.wishlist, {});
    all[userId] = (all[userId] || []).filter(id => id !== productId);
    set(KEYS.wishlist, all);
  }

  /* Cart: flat array, each line has its own id to allow variant duplicates */
  function cart(){ return get(KEYS.cart, []); }
  function saveCart(v){ set(KEYS.cart, v); }
  function addToCart(productId, qty, variant){
    const c = cart();
    const existing = c.find(i => i.productId === productId &&
      i.warna === variant.warna && i.ukuran === variant.ukuran && i.model === variant.model);
    if(existing){ existing.qty += qty; }
    else{ c.push({lineId: uid('line'), productId, qty, warna:variant.warna||'', ukuran:variant.ukuran||'', model:variant.model||'', selected:true}); }
    saveCart(c);
  }
  function cartCount(){ return cart().reduce((s,i) => s + i.qty, 0); }

  /* Orders */
  function orders(){ return get(KEYS.orders, []); }
  function saveOrders(v){ set(KEYS.orders, v); }
  function orderById(id){ return orders().find(o => o.id === id); }
  const STATUS_FLOW = ['Menunggu Konfirmasi','Dikonfirmasi','Sedang Dikemas','Diserahkan ke Kurir','Dalam Pengiriman','Pesanan Diterima','Selesai'];
  const ADMIN_STATUS_FLOW = STATUS_FLOW.slice(0, -1); // admin can advance up to "Pesanan Diterima"; "Selesai" is customer-confirmed only

  function createOrder(data){
    const o = {
      id: uid('ord'),
      invoiceNo: 'INV/' + new Date().getFullYear() + '/' + Math.floor(100000 + Math.random()*899999),
      status: 'Menunggu Konfirmasi',
      timeline: [{status:'Pesanan Dibuat', time: nowISO()}, {status:'Menunggu Konfirmasi', time: nowISO()}],
      createdAt: nowISO(),
      courier:'', resi:'',
      ...data
    };
    const list = orders(); list.unshift(o); saveOrders(list);

    // decrement stock
    const prods = products();
    o.items.forEach(item => {
      const p = prods.find(p => p.id === item.productId);
      if(p){ p.stok = Math.max(0, p.stok - item.qty); p.terjual = (p.terjual||0) + item.qty; }
    });
    saveProducts(prods);

    addNotification(o.userId, `Pesanan ${o.invoiceNo} berhasil dibuat dan menunggu konfirmasi.`, 'order');
    addActivity(`Customer ${data.customer.nama} membuat pesanan ${o.invoiceNo}.`);
    return o;
  }
  function updateOrderStatus(orderId, status, extra={}){
    const list = orders();
    const o = list.find(o => o.id === orderId);
    if(!o) return;
    o.status = status;
    Object.assign(o, extra);
    o.timeline.push({status, time: nowISO()});
    saveOrders(list);
    addNotification(o.userId, `Status pesanan ${o.invoiceNo} diperbarui menjadi "${status}".`, 'order');
    addActivity(`Admin mengubah status pesanan ${o.invoiceNo} menjadi "${status}".`);
  }
  function confirmOrderReceived(orderId){
    const list = orders();
    const o = list.find(o => o.id === orderId);
    if(!o || o.status !== 'Pesanan Diterima') return null;
    o.status = 'Selesai';
    o.timeline.push({status:'Selesai', time: nowISO()});
    saveOrders(list);
    addNotification(o.userId, `Terima kasih! Pesanan ${o.invoiceNo} dikonfirmasi selesai. Yuk beri ulasan produknya.`, 'order');
    addActivity(`Customer mengonfirmasi pesanan ${o.invoiceNo} diterima — status otomatis menjadi Selesai.`);
    return o;
  }
  function cancelOrder(orderId, reason){
    updateOrderStatus(orderId, 'Dibatalkan', {cancelReason: reason||''});
  }

  /* Reviews */
  function reviews(){ return get(KEYS.reviews, []); }
  function saveReviews(v){ set(KEYS.reviews, v); }
  function reviewsFor(productId){ return reviews().filter(r => r.productId === productId); }
  function addReview(data){
    const list = reviews();
    const r = {id: uid('rv'), createdAt: nowISO(), verified:true, ...data};
    list.unshift(r);
    saveReviews(list);
    addNotification(data.userId, 'Review kamu berhasil dikirim, terima kasih!', 'review');
    addActivity(`Customer memberikan review untuk produk.`);
    return r;
  }
  function productRatingStats(productId){
    const list = reviewsFor(productId);
    const count = list.length;
    const avg = count ? (list.reduce((s,r) => s + r.rating, 0) / count) : 0;
    const dist = [5,4,3,2,1].map(star => ({star, count: list.filter(r => r.rating === star).length}));
    return {avg, count, dist};
  }

  /* Chats */
  function chats(){ return get(KEYS.chats, []); }
  function saveChats(v){ set(KEYS.chats, v); }
  function chatForUser(userId, productId){
    const list = chats();
    let c = list.find(c => c.userId === userId);
    if(!c){ c = {id: uid('chat'), userId, productId: productId||'', messages:[]}; list.push(c); saveChats(list); }
    return c;
  }
  function sendMessage(userId, from, text){
    const list = chats();
    let c = list.find(c => c.userId === userId);
    if(!c){ c = {id: uid('chat'), userId, productId:'', messages:[]}; list.push(c); }
    c.messages.push({from, text, time: nowISO(), read: from==='admin'? false : true});
    saveChats(list);
    if(from === 'user'){ addActivity('Customer mengirim pesan chat baru.'); }
    else{ addNotification(userId, 'Ada balasan baru dari Admin Laras Budaya.', 'chat'); }
  }

  /* Notifications */
  function notifications(userId){ return get(KEYS.notifications, []).filter(n => n.userId === userId).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)); }
  function addNotification(userId, text, type){
    const list = get(KEYS.notifications, []);
    list.unshift({id: uid('nt'), userId, text, type, read:false, createdAt: nowISO()});
    set(KEYS.notifications, list);
  }
  function markAllNotifRead(userId){
    const list = get(KEYS.notifications, []);
    list.forEach(n => { if(n.userId === userId) n.read = true; });
    set(KEYS.notifications, list);
  }
  function unreadNotifCount(userId){ return notifications(userId).filter(n => !n.read).length; }

  /* Vouchers */
  function vouchers(){ return get(KEYS.vouchers, []); }
  function saveVouchers(v){ set(KEYS.vouchers, v); }
  function voucherByCode(code){ return vouchers().find(v => v.code.toLowerCase() === (code||'').toLowerCase() && v.active); }

  /* Activity log (admin) */
  function activity(){ return get(KEYS.activity, []); }
  function addActivity(text){
    const list = get(KEYS.activity, []);
    list.unshift({id: uid('log'), text, time: nowISO()});
    set(KEYS.activity, list.slice(0,200));
  }

  /* Banners */
  function banners(){ return get(KEYS.banners, []); }
  function saveBanners(v){ set(KEYS.banners, v); }

  /* Recently viewed */
  function recentlyViewed(){ return get(KEYS.recentlyViewed, []); }
  function pushRecentlyViewed(productId){
    let list = get(KEYS.recentlyViewed, []).filter(id => id !== productId);
    list.unshift(productId);
    set(KEYS.recentlyViewed, list.slice(0,10));
  }

  /* Search history */
  function searchHistory(){ return get(KEYS.searchHistory, []); }
  function pushSearchHistory(term){
    if(!term.trim()) return;
    let list = get(KEYS.searchHistory, []).filter(t => t.toLowerCase() !== term.toLowerCase());
    list.unshift(term);
    set(KEYS.searchHistory, list.slice(0,8));
  }

  /* Theme */
  function theme(){ return get(KEYS.theme, 'light'); }
  function setTheme(t){ set(KEYS.theme, t); }

  /* Admin auth (demo credentials, editable via localStorage if needed) */
  function adminLogin(usernameOrEmail, password){
    const clean = (usernameOrEmail || '').trim().toLowerCase();
    const isAdminUser = ['admin', 'admin@larasbudaya.com', 'admin@example.com'].includes(clean);
    if(isAdminUser && password === 'admin123'){ set(KEYS.adminSession, true); return true; }
    return false;
  }
  function adminLogout(){ set(KEYS.adminSession, false); }
  function isAdminLoggedIn(){ return get(KEYS.adminSession, false) === true; }

  return {
    KEYS, get, set, uid, nowISO, rupiah, seed,
    products, saveProducts, categories, saveCategories, productById, categoryById,
    users, saveUsers, userById, userByEmail, currentUser, isLoggedIn, login, logout, register, updateUser, deleteUser, blockUser, unblockUser,
    getLoginLock, recordFailedLogin, clearLoginAttempts,
    wishlistFor, toggleWishlist, removeWishlist,
    cart, saveCart, addToCart, cartCount,
    orders, saveOrders, orderById, STATUS_FLOW, ADMIN_STATUS_FLOW, createOrder, updateOrderStatus, confirmOrderReceived, cancelOrder,
    reviews, addReview, reviewsFor, productRatingStats,
    chats, saveChats, chatForUser, sendMessage,
    notifications, addNotification, markAllNotifRead, unreadNotifCount,
    vouchers, saveVouchers, voucherByCode,
    activity, addActivity,
    banners, saveBanners,
    recentlyViewed, pushRecentlyViewed,
    searchHistory, pushSearchHistory,
    theme, setTheme,
    adminLogin, adminLogout, isAdminLoggedIn,
  };
})();

if(!localStorage.getItem('lb_reset_v6')){
  LB.seed(true);
  localStorage.setItem('lb_reset_v6', 'true');
} else {
  LB.seed();
}
