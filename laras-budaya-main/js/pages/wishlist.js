/* =========================================================
   LARAS BUDAYA — Customer Wishlist Page Logic
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('Wishlist');
  renderFooter();

  function renderWishlist(){
    const user = LB.currentUser();
    const grid = document.getElementById('wishlist-grid');
    if(!grid) return;
    if(!user){ grid.innerHTML = loginCtaHTML('Simpan produk favoritmu setelah masuk ke akun.', 'wishlist.html'); return; }
    const ids = LB.wishlistFor(user.id);
    const products = ids.map(id => LB.productById(id)).filter(Boolean);
    if(!products.length){ grid.innerHTML = emptyStateHTML('Wishlist masih kosong', 'Yuk jelajahi produk dan simpan yang kamu suka di sini.', 'produk.html', 'Jelajahi Produk'); return; }
    grid.innerHTML = products.map(p => `
      <div class="product-card fade-up">
        <a href="detail.html?id=${p.id}" class="product-thumb"><img src="${p.foto[0]}" alt="${p.nama}"></a>
        <button class="wishlist-btn active" data-remove="${p.id}">${ICONS.heartFill}</button>
        <div class="product-info">
          <a href="detail.html?id=${p.id}"><div class="product-name">${p.nama}</div></a>
          <div class="product-rating">${starString(p.rating)} <span>${p.rating.toFixed(1)}</span></div>
          <div class="product-price"><span class="price-now">${LB.rupiah(p.harga)}</span></div>
          <div class="product-actions">
            <button class="btn btn-outline btn-sm" data-tocart="${p.id}" ${p.stok===0?'disabled':''}>Pindah ke Keranjang</button>
          </div>
        </div>
      </div>`).join('');

    grid.addEventListener('click', (e) => {
      const rm = e.target.closest('[data-remove]');
      if(rm){ LB.removeWishlist(user.id, rm.dataset.remove); toast('Dihapus dari wishlist','success'); renderNavbar('Wishlist'); renderWishlist(); return; }
      const tc = e.target.closest('[data-tocart]');
      if(tc){
        const p = LB.productById(tc.dataset.tocart);
        if(p){
          LB.addToCart(p.id, 1, {warna:(p.warna||[])[0], ukuran:(p.ukuran||[])[0], model:(p.model||[])[0]});
          LB.removeWishlist(user.id, p.id);
          toast('Dipindahkan ke keranjang','success');
          renderNavbar('Wishlist'); renderWishlist();
        }
      }
    });
  }
  renderWishlist();
});
