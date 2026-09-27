/* =========================================================
   LARAS BUDAYA — Product Detail Page Logic
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  const product = LB.productById(productId);

  const root = document.getElementById('detail-root');
  if(!root) return;

  if(!product){
    root.innerHTML = emptyStateHTML('Produk tidak ditemukan', 'Produk yang kamu cari mungkin sudah tidak tersedia.', 'produk.html', 'Kembali ke Produk');
    return;
  }

  LB.pushRecentlyViewed(product.id);
  const cat = LB.categoryById(product.kategori);
  const bc = document.getElementById('breadcrumb');
  if(bc) bc.innerHTML = `<a href="index.html">Home</a> / <a href="produk.html">Produk</a> / <a href="produk.html?kategori=${cat.id}">${cat.nama}</a> / <span>${product.nama}</span>`;
  document.title = product.nama + ' — Laras Budaya';

  const stats = LB.productRatingStats(product.id);
  const user = LB.currentUser();
  const wished = user && LB.wishlistFor(user.id).includes(product.id);

  let selected = {warna:(product.warna||[])[0]||'', ukuran:(product.ukuran||[])[0]||'', model:(product.model||[])[0]||''};

  const faqs = [
    {q:'Apakah bisa custom ukuran?', a:'Untuk sebagian produk seperti beskap dan kebaya, kami menyediakan opsi ukuran custom. Silakan hubungi Chat Penjual untuk konsultasi ukuran.'},
    {q:'Berapa lama estimasi pengiriman?', a:'Estimasi pengiriman 2-5 hari kerja tergantung lokasi tujuan, dihitung setelah pesanan dikonfirmasi oleh admin.'},
    {q:'Apakah produk bisa retur jika tidak sesuai?', a:'Retur dapat diajukan maksimal 2x24 jam setelah barang diterima melalui Chat Penjual dengan menyertakan foto/video unboxing.'},
  ];

  root.innerHTML = `
  <div class="detail-layout">
    <div>
      <div class="gallery-main" id="gallery-main"><img src="${product.foto[0]}" id="gallery-img" alt="${product.nama}"></div>
      <div class="gallery-thumbs" id="gallery-thumbs">
        ${product.foto.map((f,i) => `<img src="${f}" class="${i===0?'active':''}" data-src="${f}">`).join('')}
      </div>
    </div>
    <div>
      <div class="product-cat" style="font-size:12px;">${cat?cat.nama:''}</div>
      <h1 class="detail-title">${product.nama}</h1>
      <div class="product-rating">${starString(product.rating)} <span>${product.rating.toFixed(1)} · ${product.jumlahReview} Review · Terjual ${product.terjual}</span></div>
      <div class="detail-price-row">
        <span class="now">${LB.rupiah(product.harga)}</span>
        ${product.hargaAsli>product.harga? `<span class="price-old" style="font-size:15px;">${LB.rupiah(product.hargaAsli)}</span><span class="discount-tag">-${Math.round((1-product.harga/product.hargaAsli)*100)}%</span>`:''}
      </div>
      <p style="color:var(--clr-text-soft); font-size:13.5px; line-height:1.8;">${product.deskripsi}</p>

      ${(product.warna||[]).length ? `<div class="variant-row"><h5>Warna: <b id="lbl-warna">${selected.warna}</b></h5><div id="opt-warna">
        ${product.warna.map(w => `<span class="variant-opt ${w===selected.warna?'selected':''}" data-type="warna" data-val="${w}">${w}</span>`).join('')}
      </div></div>` : ''}
      ${(product.ukuran||[]).length ? `<div class="variant-row"><h5>Ukuran: <b id="lbl-ukuran">${selected.ukuran}</b></h5><div id="opt-ukuran">
        ${product.ukuran.map(u => `<span class="variant-opt ${u===selected.ukuran?'selected':''}" data-type="ukuran" data-val="${u}">${u}</span>`).join('')}
      </div></div>` : ''}
      ${(product.model||[]).length > 1 ? `<div class="variant-row"><h5>Model: <b id="lbl-model">${selected.model}</b></h5><div id="opt-model">
        ${product.model.map(m => `<span class="variant-opt ${m===selected.model?'selected':''}" data-type="model" data-val="${m}">${m}</span>`).join('')}
      </div></div>` : ''}

      <div class="variant-row">
        <h5>Jumlah (Stok: ${product.stok})</h5>
        <div class="qty-stepper">
          <button id="qty-minus">−</button>
          <input type="text" id="qty-input" value="1" readonly>
          <button id="qty-plus">+</button>
        </div>
      </div>

      <div class="detail-actions">
        <button class="btn btn-outline" id="btn-wishlist">${wished?ICONS.heartFill:ICONS.heart} ${wished?'Di Wishlist':'Wishlist'}</button>
        <button class="btn btn-primary" id="btn-addcart" ${product.stok===0?'disabled':''}>${ICONS.cart} Tambah Keranjang</button>
        <a href="chat.html?produk=${product.id}" class="btn btn-outline">${ICONS.chat} Chat Penjual</a>
        <button class="btn btn-ghost" id="btn-share">↗ Bagikan</button>
      </div>

      <div class="detail-meta">
        <span style="display:flex; align-items:center; gap:6px;"><span style="width:15px;height:15px;display:inline-flex;">${ICONS.package}</span> Estimasi pengiriman: 2 - 5 hari kerja setelah dikonfirmasi</span>
        <span style="display:flex; align-items:center; gap:6px;"><span style="width:15px;height:15px;display:inline-flex;">${ICONS.tag}</span> Dijual oleh: Perajin ${cat?cat.nama:''} — ${product.spesifikasi.Asal||'Indonesia'}</span>
      </div>

      <div style="margin-top:26px;">
        <div class="accordion-item open">
          <div class="accordion-head">Spesifikasi <span class="chev">⌄</span></div>
          <div class="accordion-body">
            ${Object.entries(product.spesifikasi).map(([k,v]) => `<div style="display:flex; justify-content:space-between; padding:4px 0;"><span>${k}</span><b style="color:var(--clr-text)">${v}</b></div>`).join('')}
          </div>
        </div>
        ${faqs.map(f => `<div class="accordion-item"><div class="accordion-head">${f.q} <span class="chev">⌄</span></div><div class="accordion-body">${f.a}</div></div>`).join('')}
      </div>
    </div>
  </div>

  <div class="section" style="padding-bottom:0;">
    <div class="section-head"><h2 class="section-title" style="font-size:26px;">Ulasan Pembeli</h2></div>
    <div class="rating-summary">
      <div style="text-align:center;">
        <div class="rating-big">${stats.avg.toFixed(1)}</div>
        <div class="stars">${starString(stats.avg)}</div>
        <div style="font-size:12px; color:var(--clr-text-soft);">${stats.count} Review</div>
      </div>
      <div class="rating-bars">
        ${stats.dist.map(d => `<div class="rating-bar-row"><span>${d.star}★</span><div class="rating-bar-track"><div class="rating-bar-fill" style="width:${stats.count?Math.round(d.count/stats.count*100):0}%"></div></div><span>${d.count}</span></div>`).join('')}
      </div>
    </div>
    <div id="review-list"></div>
  </div>`;

  function renderReviews(){
    const list = LB.reviewsFor(product.id);
    const revList = document.getElementById('review-list');
    if(revList){
      revList.innerHTML = list.length ? list.map(r => `
        <div class="review-item">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <b style="font-size:13.5px;">${r.userName||'Pembeli'}</b>
              ${r.verified? `<span class="verified"> ${ICONS.check} Pembelian Terverifikasi</span>`:''}
            </div>
            <span style="font-size:11.5px; color:var(--clr-text-soft);">${timeAgo(r.createdAt)}</span>
          </div>
          <div class="stars" style="margin:4px 0;">${starString(r.rating)}</div>
          <p style="font-size:13.5px; color:var(--clr-text-soft);">${r.comment}</p>
          ${r.photo? `<div class="review-photos"><img src="${r.photo}"></div>`:''}
        </div>`).join('') : emptyStateHTML('Belum ada ulasan', 'Jadilah yang pertama memberi ulasan setelah pesananmu selesai.');
    }
  }
  renderReviews();

  // gallery
  const galleryMain = document.getElementById('gallery-main');
  const galleryImg = document.getElementById('gallery-img');
  const galleryThumbs = document.getElementById('gallery-thumbs');

  if(galleryThumbs && galleryImg){
    galleryThumbs.addEventListener('click', (e) => {
      const img = e.target.closest('img'); if(!img) return;
      galleryImg.src = img.dataset.src;
      document.querySelectorAll('#gallery-thumbs img').forEach(t => t.classList.remove('active'));
      img.classList.add('active');
    });
  }
  if(galleryMain) galleryMain.addEventListener('click', () => galleryMain.classList.toggle('zoomed'));

  // variants & accordion
  root.addEventListener('click', (e) => {
    const opt = e.target.closest('.variant-opt');
    if(opt && opt.dataset.type){
      selected[opt.dataset.type] = opt.dataset.val;
      document.querySelectorAll(`.variant-opt[data-type="${opt.dataset.type}"]`).forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const lbl = document.getElementById('lbl-'+opt.dataset.type); if(lbl) lbl.textContent = opt.dataset.val;
      return;
    }
    const acc = e.target.closest('.accordion-head');
    if(acc){ acc.parentElement.classList.toggle('open'); return; }
  });

  // qty
  let qty = 1;
  const qPlus = document.getElementById('qty-plus');
  const qMinus = document.getElementById('qty-minus');
  const qInput = document.getElementById('qty-input');
  if(qPlus && qInput) qPlus.addEventListener('click', () => { if(qty < product.stok) qty++; qInput.value = qty; });
  if(qMinus && qInput) qMinus.addEventListener('click', () => { if(qty > 1) qty--; qInput.value = qty; });

  // wishlist
  const btnWish = document.getElementById('btn-wishlist');
  if(btnWish){
    btnWish.addEventListener('click', function(){
      const u = LB.currentUser();
      if(!u){ toast('Silakan masuk untuk menyimpan wishlist'); return; }
      const added = LB.toggleWishlist(u.id, product.id);
      this.innerHTML = added? `${ICONS.heartFill} Di Wishlist` : `${ICONS.heart} Wishlist`;
      toast(added?'Ditambahkan ke wishlist':'Dihapus dari wishlist','success');
      renderNavbar();
    });
  }

  // add to cart
  const btnCart = document.getElementById('btn-addcart');
  if(btnCart){
    btnCart.addEventListener('click', () => {
      LB.addToCart(product.id, qty, selected);
      toast(`${qty}x ${product.nama} ditambahkan ke keranjang`, 'success');
      renderNavbar();
    });
  }

  const btnShare = document.getElementById('btn-share');
  if(btnShare){
    btnShare.addEventListener('click', () => {
      navigator.clipboard?.writeText(window.location.href);
      toast('Tautan produk disalin ke clipboard', 'success');
    });
  }

  // similar products
  const similar = LB.products().filter(p => p.kategori === product.kategori && p.id !== product.id).slice(0,4);
  const gridSimilar = document.getElementById('grid-similar');
  if(gridSimilar){
    gridSimilar.innerHTML = similar.length ? similar.map(p => productCardHTML(p)).join('') : emptyStateHTML('Belum ada produk serupa','');
    wireProductGridEvents(gridSimilar);
  }

  // recently viewed
  const recentIds = LB.recentlyViewed().filter(id => id !== product.id).slice(0,4);
  const secRecent = document.getElementById('recent-section');
  const gridRecent = document.getElementById('grid-recent');
  if(recentIds.length && secRecent && gridRecent){
    secRecent.style.display = 'block';
    gridRecent.innerHTML = recentIds.map(id => LB.productById(id)).filter(Boolean).map(p => productCardHTML(p)).join('');
    wireProductGridEvents(gridRecent);
  }
});
