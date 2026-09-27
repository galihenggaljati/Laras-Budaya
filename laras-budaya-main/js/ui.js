/* =========================================================
   LARAS BUDAYA — Shared UI Layer
   Navbar, footer, toast, product cards, review modals, auth guard helpers.
   Requires icons.js and data.js to be loaded first.
   ========================================================= */

/* ---------------- Toast Notification ---------------- */
function toast(msg, type='default'){
  let c = document.getElementById('toast-container');
  if(!c){ c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c); }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `${type==='success'? ICONS.check : ''}<span>${msg}</span>`;
  c.appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 260);
  }, 2800);
}

/* ---------------- Navbar ---------------- */
function renderNavbar(active){
  const slot = document.getElementById('navbar-slot');
  if(!slot) return;
  const user = LB.currentUser();
  const cartCount = LB.cartCount();
  const wishCount = user ? LB.wishlistFor(user.id).length : 0;
  const unread = user ? LB.unreadNotifCount(user.id) : 0;

  const links = [
    ['index.html','Home'], ['produk.html','Produk'], ['tentang.html','Tentang']
  ];

  slot.innerHTML = `
  <nav class="navbar" id="navbar">
    <div class="container nav-inner">
      <a href="index.html" class="nav-logo"><span class="mark">LB</span> <span class="logo-text">Laras Budaya</span></a>
      <div class="nav-links">
        ${links.map(([href,label]) => `<a href="${href}" class="${active===label?'active':''}">${label}</a>`).join('')}
      </div>
      <div class="nav-search">
        <span class="icn">${ICONS.search}</span>
        <input type="text" id="nav-search-input" placeholder="Cari kain lurik, kebaya, blangkon...">
        <div class="nav-search-suggest" id="nav-search-suggest"></div>
      </div>
      <div class="nav-icons">
        <button class="nav-icon-btn" id="dark-toggle-btn" title="Mode gelap">${ICONS.moon}</button>
        <div style="position:relative;">
          <button class="nav-icon-btn" id="notif-btn">${ICONS.bell}${unread?`<span class="count">${unread}</span>`:''}</button>
          <div class="dropdown-panel" id="notif-panel"></div>
        </div>
        <a href="chat.html" class="nav-icon-btn" title="Chat">${ICONS.chat}</a>
        <a href="wishlist.html" class="nav-icon-btn">${ICONS.heart}${wishCount?`<span class="count">${wishCount}</span>`:''}</a>
        <a href="keranjang.html" class="nav-icon-btn">${ICONS.cart}${cartCount?`<span class="count">${cartCount}</span>`:''}</a>
        <a href="profile.html" class="nav-icon-btn">${ICONS.user}</a>
        <button class="nav-icon-btn nav-toggle" id="mobile-menu-btn">${ICONS.menu}</button>
      </div>
    </div>
  </nav>
  <div class="mobile-drawer" id="mobile-drawer">
    <div class="backdrop"></div>
    <div class="panel">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <strong>Menu</strong>
        <button id="mobile-drawer-close">${ICONS.close}</button>
      </div>
      <div style="margin-bottom: 20px;">
        <form action="produk.html" method="GET" style="position:relative;">
          <span style="position:absolute; left:14px; top:50%; transform:translateY(-50%); opacity:.55; display:flex; align-items:center; justify-content:center;">${ICONS.search}</span>
          <input type="text" name="cari" placeholder="Cari produk..." style="width:100%; padding:10px 14px 10px 38px; border-radius:99px; border:1.5px solid var(--clr-border); background:var(--clr-bg); font-size:13.5px;">
        </form>
      </div>
      ${links.map(([href,label]) => `<a href="${href}">${label}</a>`).join('')}
      <a href="wishlist.html">Wishlist</a>
      <a href="keranjang.html">Keranjang</a>
      <a href="chat.html">Chat</a>
      <a href="pesanan.html">Pesanan Saya</a>
      <a href="profile.html">Profile</a>
    </div>
  </div>`;

  wireNavbarEvents(user);
}

function wireNavbarEvents(user){
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if(window.scrollY > 10) nav.classList.add('is-scrolled'); else nav.classList.remove('is-scrolled');
  });

  // dark mode
  const darkBtn = document.getElementById('dark-toggle-btn');
  const applyTheme = (t) => {
    document.documentElement.setAttribute('data-theme', t);
    if(darkBtn) darkBtn.innerHTML = t === 'dark' ? ICONS.sun : ICONS.moon;
  };
  applyTheme(LB.theme());
  if(darkBtn){
    darkBtn.addEventListener('click', () => {
      const next = LB.theme() === 'dark' ? 'light' : 'dark';
      LB.setTheme(next); applyTheme(next);
    });
  }

  // mobile drawer
  const drawer = document.getElementById('mobile-drawer');
  if(drawer){
    document.getElementById('mobile-menu-btn').addEventListener('click', () => drawer.classList.add('open'));
    document.getElementById('mobile-drawer-close').addEventListener('click', () => drawer.classList.remove('open'));
    drawer.querySelector('.backdrop').addEventListener('click', () => drawer.classList.remove('open'));
  }

  // search + suggestions
  const input = document.getElementById('nav-search-input');
  const suggestBox = document.getElementById('nav-search-suggest');
  if(input && suggestBox){
    function renderSuggestions(term){
      const products = LB.products();
      const history = LB.searchHistory();
      let html = '';
      if(!term){
        if(history.length){
          html += `<div class="sugg-head">Riwayat Pencarian</div>`;
          html += history.map(h => `<div class="sugg-item" data-term="${h}">🕐 ${h}</div>`).join('');
        }
      } else {
        const matches = products.filter(p => p.nama.toLowerCase().includes(term.toLowerCase())).slice(0,6);
        html += `<div class="sugg-head">Saran Produk</div>`;
        html += matches.length ? matches.map(p => `<div class="sugg-item" data-goto="${p.id}">${ICONS.search} ${p.nama}</div>`).join('') : `<div class="sugg-item" style="color:var(--clr-text-soft)">Tidak ada saran</div>`;
      }
      suggestBox.innerHTML = html;
      suggestBox.classList.toggle('open', true);
    }
    input.addEventListener('focus', () => renderSuggestions(input.value.trim()));
    input.addEventListener('input', () => renderSuggestions(input.value.trim()));
    input.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' && input.value.trim()){
        LB.pushSearchHistory(input.value.trim());
        window.location.href = 'produk.html?cari=' + encodeURIComponent(input.value.trim());
      }
    });
    suggestBox.addEventListener('click', (e) => {
      const item = e.target.closest('.sugg-item');
      if(!item) return;
      if(item.dataset.goto){ window.location.href = 'detail.html?id=' + item.dataset.goto; }
      else if(item.dataset.term){ input.value = item.dataset.term; LB.pushSearchHistory(item.dataset.term); window.location.href = 'produk.html?cari=' + encodeURIComponent(item.dataset.term); }
    });
    document.addEventListener('click', (e) => {
      if(!e.target.closest('.nav-search')) suggestBox.classList.remove('open');
    });
  }

  // notifications
  const notifBtn = document.getElementById('notif-btn');
  const notifPanel = document.getElementById('notif-panel');
  if(notifBtn && notifPanel){
    function renderNotifPanel(){
      if(!user){ notifPanel.innerHTML = `<div class="empty-state" style="padding:30px 16px;"><p>Masuk untuk melihat notifikasi.</p></div>`; return; }
      const list = LB.notifications(user.id);
      const notifIcon = (t) => t==='order'?ICONS.package:t==='chat'?ICONS.chat:t==='voucher'?ICONS.tag:t==='review'?ICONS.star:ICONS.bell;
      notifPanel.innerHTML = `<div class="dropdown-head">Notifikasi</div>` + (list.length ? list.slice(0,10).map(n => `
        <div class="notif-item ${n.read?'':'unread'}">
          <div class="notif-icn">${notifIcon(n.type)}</div>
          <div><div>${n.text}</div><span style="font-size:11px;color:var(--clr-text-soft)">${timeAgo(n.createdAt)}</span></div>
        </div>`).join('') : `<div class="empty-state" style="padding:30px 16px;"><p>Belum ada notifikasi.</p></div>`);
    }
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      renderNotifPanel();
      notifPanel.classList.toggle('open');
      if(user){ LB.markAllNotifRead(user.id); setTimeout(() => { const c = notifBtn.querySelector('.count'); if(c) c.remove(); }, 400); }
    });
    document.addEventListener('click', (e) => { if(!e.target.closest('#notif-btn') && !e.target.closest('#notif-panel')) notifPanel.classList.remove('open'); });
  }
}

function timeAgo(iso){
  const diff = (Date.now() - new Date(iso).getTime())/1000;
  if(diff < 60) return 'Baru saja';
  if(diff < 3600) return Math.floor(diff/60) + ' menit lalu';
  if(diff < 86400) return Math.floor(diff/3600) + ' jam lalu';
  return Math.floor(diff/86400) + ' hari lalu';
}

/* ---------------- Footer ---------------- */
function renderFooter(){
  const slot = document.getElementById('footer-slot');
  if(!slot) return;
  slot.innerHTML = `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <h4>Laras Budaya</h4>
        <p style="max-width:320px;">Marketplace busana dan aksesoris tradisional Indonesia — kain lurik, blangkon, sampur tari, beskap, hingga kebaya, dirawat oleh perajin lokal untuk melestarikan warisan budaya.</p>
        <div class="footer-social">
          <a href="#" aria-label="Instagram">IG</a>
          <a href="#" aria-label="TikTok">TT</a>
          <a href="#" aria-label="WhatsApp">WA</a>
        </div>
      </div>
      <div>
        <h4>Belanja</h4>
        <a href="produk.html">Semua Produk</a><br>
        <a href="produk.html?badge=best">Best Seller</a><br>
        <a href="produk.html?badge=promo">Sedang Promo</a><br>
        <a href="wishlist.html">Wishlist Saya</a>
      </div>
      <div>
        <h4>Akun</h4>
        <a href="login.html">Masuk / Daftar Akun</a><br>
        <a href="profile.html">Profil Saya</a><br>
        <a href="pesanan.html">Pesanan Saya</a><br>
        <a href="chat.html">Chat Penjual</a>
      </div>
      <div>
        <h4>Kunjungi Kami</h4>
        <p>Jl. Kebudayaan No. 8, Surakarta, Jawa Tengah</p>
        <div class="footer-map">
          <iframe src="https://maps.google.com/maps?q=Surakarta&z=13&output=embed" width="100%" height="110" style="border:0;" loading="lazy"></iframe>
        </div>
        <form class="footer-newsletter" onsubmit="event.preventDefault(); toast('Terima kasih, kamu sudah berlangganan newsletter kami!','success'); this.reset();">
          <input type="email" placeholder="Email kamu" required>
          <button type="submit">Kirim</button>
        </form>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© 2026 Laras Budaya. Proyek UAS Pemrograman Web 1.</span>
      <span>Dibuat dengan ♥ untuk pelestarian budaya Indonesia.</span>
    </div>
  </footer>`;
}

/* ---------------- Product Card ---------------- */
function badgeLabel(b){
  return {best:'Best Seller', promo:'Promo', new:'New Arrival', terlaris:'Terlaris'}[b] || b;
}
function badgeClass(b){
  return {best:'badge-best', promo:'badge-promo', new:'badge-new', terlaris:'badge-top'}[b] || 'badge-best';
}
function productCardHTML(p, opts={}){
  const user = LB.currentUser();
  const wished = user && LB.wishlistFor(user.id).includes(p.id);
  const isList = opts.list;
  const cat = LB.categoryById(p.kategori);
  return `
  <div class="product-card ${isList?'list-card':''} fade-up" data-id="${p.id}">
    <a href="detail.html?id=${p.id}" class="product-thumb">
      <img src="${p.foto[0]}" alt="${p.nama}" loading="lazy">
      <div class="product-badges">${(p.badge||[]).map(b => `<span class="badge ${badgeClass(b)}">${badgeLabel(b)}</span>`).join('')}</div>
    </a>
    <button class="wishlist-btn ${wished?'active':''}" data-wish="${p.id}" title="Wishlist">${wished?ICONS.heartFill:ICONS.heart}</button>
    <div class="product-info">
      <a href="detail.html?id=${p.id}">
        <div class="product-cat">${cat?cat.nama:''}</div>
        <div class="product-name">${p.nama}</div>
      </a>
      <div class="product-rating">${starString(p.rating)} <span>${p.rating.toFixed(1)} (${p.jumlahReview})</span></div>
      <div class="product-price">
        <span class="price-now">${LB.rupiah(p.harga)}</span>
        ${p.hargaAsli > p.harga ? `<span class="price-old">${LB.rupiah(p.hargaAsli)}</span>` : ''}
      </div>
      ${p.stok === 0 ? `<span class="stock-warn">Stok Habis</span>` : (p.stok<=5?`<span class="stock-warn">Sisa ${p.stok} stok</span>`:'')}
      <div class="product-actions">
        <button class="btn btn-outline btn-sm" data-quickcart="${p.id}" ${p.stok===0?'disabled':''}>+ Keranjang</button>
        <a href="detail.html?id=${p.id}" class="btn btn-primary btn-sm">Lihat</a>
      </div>
    </div>
  </div>`;
}

function wireProductGridEvents(container){
  container.addEventListener('click', (e) => {
    const wishBtn = e.target.closest('[data-wish]');
    if(wishBtn){
      if(!requireLogin('Silakan masuk untuk menyimpan wishlist', window.location.pathname + window.location.search)) return;
      const user = LB.currentUser();
      const added = LB.toggleWishlist(user.id, wishBtn.dataset.wish);
      wishBtn.classList.toggle('active', added);
      wishBtn.innerHTML = added ? ICONS.heartFill : ICONS.heart;
      toast(added ? 'Ditambahkan ke wishlist' : 'Dihapus dari wishlist', 'success');
      renderNavbar(document.body.dataset.active);
      return;
    }
    const quickBtn = e.target.closest('[data-quickcart]');
    if(quickBtn){
      const p = LB.productById(quickBtn.dataset.quickcart);
      LB.addToCart(p.id, 1, {warna:(p.warna||[])[0], ukuran:(p.ukuran||[])[0], model:(p.model||[])[0]});
      toast(`${p.nama} ditambahkan ke keranjang`, 'success');
      renderNavbar(document.body.dataset.active);
    }
  });
}

/* ---------------- Empty state helper ---------------- */
function emptyStateHTML(title, desc, ctaHref, ctaLabel){
  return `<div class="empty-state">
    ${ICONS.box}
    <h3>${title}</h3>
    <p>${desc}</p>
    ${ctaHref ? `<a href="${ctaHref}" class="btn btn-primary" style="margin-top:16px;">${ctaLabel}</a>` : ''}
  </div>`;
}

/* ---------------- Badge count helpers ---------------- */
function activeOrderCount(userId){
  return LB.orders().filter(o => o.userId===userId && o.status!=='Selesai' && o.status!=='Dibatalkan').length;
}
function pendingReviewItems(userId){
  const completedOrders = LB.orders().filter(o => o.userId===userId && o.status==='Selesai');
  const myReviews = LB.reviews().filter(r => r.userId === userId);
  const reviewedProductIds = new Set(myReviews.map(r=>r.productId));
  const pending = [];
  const seen = new Set();
  completedOrders.forEach(o => o.items.forEach(i => {
    if(!reviewedProductIds.has(i.productId) && !seen.has(i.productId)){ seen.add(i.productId); pending.push({order:o, item:i}); }
  }));
  return pending;
}

/* ---------------- Review modal ---------------- */
function starPickerHTML(initial){
  return `<div class="star-picker" id="rv-stars" style="display:flex; gap:6px; font-size:0;">
    ${[1,2,3,4,5].map(n => `<span data-star="${n}" style="cursor:pointer; font-size:28px; line-height:1; color:${n<=initial?'var(--clr-gold-dark)':'var(--clr-line)'};">★</span>`).join('')}
  </div>`;
}
function wireStarPicker(container, onChange){
  const stars = [...container.querySelectorAll('[data-star]')];
  function paint(val){ stars.forEach(s => { s.style.color = Number(s.dataset.star) <= val ? 'var(--clr-gold-dark)' : 'var(--clr-line)'; }); }
  stars.forEach(s => {
    s.addEventListener('mouseenter', () => paint(Number(s.dataset.star)));
    s.addEventListener('click', () => { onChange(Number(s.dataset.star)); paint(Number(s.dataset.star)); container.dataset.value = s.dataset.star; });
  });
  container.addEventListener('mouseleave', () => paint(Number(container.dataset.value || 5)));
}

function openReviewModal(productId, onDone){
  const user = LB.currentUser();
  if(!user){ toast('Silakan masuk untuk memberi ulasan'); return; }
  const p = LB.productById(productId);
  if(!p) return;
  let rating = 5;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.innerHTML = `
  <div class="modal-box">
    <button class="modal-close" id="rv-close">✕</button>
    <h3 style="font-family:var(--font-display); font-size:20px; margin-bottom:14px;">Ulasan untuk ${p.nama}</h3>
    <div class="field"><label>Rating</label>${starPickerHTML(rating)}</div>
    <div class="field"><label>Komentar</label><textarea id="rv-comment" rows="4" placeholder="Bagaimana pengalamanmu dengan produk ini?"></textarea></div>
    <button class="btn btn-primary btn-block" id="rv-submit">Kirim Ulasan</button>
  </div>`;
  document.body.appendChild(overlay);
  wireStarPicker(overlay.querySelector('#rv-stars'), (val) => { rating = val; });
  overlay.querySelector('#rv-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if(e.target===overlay) overlay.remove(); });
  overlay.querySelector('#rv-submit').addEventListener('click', () => {
    const comment = overlay.querySelector('#rv-comment').value.trim();
    if(!comment){ toast('Mohon tulis komentar ulasan','error'); return; }
    LB.addReview({productId, userId:user.id, userName:user.nama, rating, comment, photo:'', verified:true});
    const prods = LB.products();
    const prod = prods.find(x=>x.id===productId);
    const stats = LB.productRatingStats(productId);
    if(prod){ prod.rating = stats.avg; prod.jumlahReview = stats.count; LB.saveProducts(prods); }
    toast('Ulasan berhasil dikirim, terima kasih!','success');
    overlay.remove();
    if(onDone) onDone();
  });
}

/* ---------------- Auth guard helpers ---------------- */
function requireLogin(redirectMsg, returnPath){
  if(!LB.isLoggedIn()){
    toast(redirectMsg || 'Silakan masuk terlebih dahulu');
    localStorage.setItem('lb_redirect_after_login', returnPath || window.location.pathname.split('/').pop());
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    return false;
  }
  return true;
}
function loginCtaHTML(message, returnPath){
  return `<div class="empty-state">
    ${ICONS.users}
    <h3>Masuk untuk Melanjutkan</h3>
    <p>${message || 'Kamu perlu masuk ke akun untuk mengakses halaman ini.'}</p>
    <button class="btn btn-primary" style="margin-top:16px;" onclick="localStorage.setItem('lb_redirect_after_login','${returnPath || window.location.pathname.split('/').pop()}'); window.location.href='login.html';">Masuk / Daftar Akun</button>
  </div>`;
}
