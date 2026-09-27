/* =========================================================
   LARAS BUDAYA — Shopping Cart Page Logic
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('Keranjang');
  renderFooter();

  let appliedVoucher = null;

  function render(){
    const items = LB.cart();
    const root = document.getElementById('cart-root');
    if(!root) return;

    if(!items.length){
      root.innerHTML = emptyStateHTML('Keranjang kamu masih kosong', 'Yuk mulai belanja busana tradisional favoritmu.', 'produk.html', 'Mulai Belanja');
      return;
    }
    const allSelected = items.every(i => i.selected);
    const selectedItems = items.filter(i => i.selected);
    const subtotal = selectedItems.reduce((s,i) => { const p = LB.productById(i.productId); return s + (p? p.harga*i.qty : 0); }, 0);
    const ongkir = selectedItems.length ? 15000 : 0;
    let diskon = 0;
    if(appliedVoucher && subtotal >= appliedVoucher.minPurchase){
      diskon = appliedVoucher.type === 'percent' ? subtotal*appliedVoucher.value/100 : appliedVoucher.value;
    }
    const total = Math.max(0, subtotal + ongkir - diskon);

    root.innerHTML = `
    <div class="cart-layout">
      <div class="card-surface" style="padding:20px;">
        <label class="filter-option" style="margin-bottom:10px;">
          <input type="checkbox" id="select-all" ${allSelected?'checked':''}> Pilih Semua (${items.length} produk)
          <button class="btn btn-ghost btn-sm" id="delete-selected" style="margin-left:auto;">Hapus Terpilih</button>
        </label>
        <div id="cart-items"></div>
      </div>
      <div class="summary-box">
        <h3 style="font-family:var(--font-display); font-size:20px; margin-bottom:14px;">Ringkasan Belanja</h3>
        <div class="voucher-input">
          <input type="text" id="voucher-code" placeholder="Kode Voucher" value="${appliedVoucher?appliedVoucher.code:''}">
          <button class="btn btn-outline btn-sm" id="apply-voucher">Pakai</button>
        </div>
        <div id="voucher-msg" style="font-size:12px; margin-bottom:8px;"></div>
        <div class="summary-row"><span>Subtotal (${selectedItems.reduce((s,i)=>s+i.qty,0)} barang)</span><span>${LB.rupiah(subtotal)}</span></div>
        <div class="summary-row"><span>Estimasi Ongkir</span><span>${LB.rupiah(ongkir)}</span></div>
        ${diskon>0? `<div class="summary-row"><span>Diskon Voucher</span><span>- ${LB.rupiah(diskon)}</span></div>`:''}
        <div class="summary-row total"><span>Total</span><span>${LB.rupiah(total)}</span></div>
        <button class="btn btn-primary btn-block" id="checkout-btn" style="margin-top:16px;" ${!selectedItems.length?'disabled':''}>Checkout (${selectedItems.length})</button>
      </div>
    </div>`;

    const cItems = document.getElementById('cart-items');
    if(cItems){
      cItems.innerHTML = items.map(i => {
        const p = LB.productById(i.productId);
        if(!p) return '';
        return `
        <div class="cart-item" data-line="${i.lineId}">
          <input type="checkbox" class="cb-item" ${i.selected?'checked':''}>
          <img src="${p.foto[0]}" alt="${p.nama}">
          <div>
            <a href="detail.html?id=${p.id}" class="cart-item-name">${p.nama}</a>
            <div class="cart-item-meta">${[i.warna,i.ukuran,i.model].filter(Boolean).join(' · ')}</div>
            <div class="cart-item-meta" style="margin-top:4px; font-weight:600; color:var(--clr-brown);">${LB.rupiah(p.harga)}</div>
            <div class="qty-stepper" style="margin-top:8px; transform:scale(.9); transform-origin:left;">
              <button class="qty-minus">−</button>
              <input type="text" value="${i.qty}" readonly>
              <button class="qty-plus">+</button>
            </div>
          </div>
          <button class="icon-btn" title="Hapus" data-remove>${ICONS.close}</button>
        </div>`;
      }).join('');
    }

    // events
    const selectAll = document.getElementById('select-all');
    if(selectAll){
      selectAll.addEventListener('change', (e) => {
        const c = LB.cart(); c.forEach(i => i.selected = e.target.checked); LB.saveCart(c); render();
      });
    }

    const delSelected = document.getElementById('delete-selected');
    if(delSelected){
      delSelected.addEventListener('click', () => {
        let c = LB.cart().filter(i => !i.selected); LB.saveCart(c); toast('Produk terpilih dihapus','success'); render(); renderNavbar('Keranjang');
      });
    }

    if(cItems){
      cItems.addEventListener('click', (e) => {
        const row = e.target.closest('.cart-item'); if(!row) return;
        const lineId = row.dataset.line;
        const c = LB.cart();
        const item = c.find(i => i.lineId === lineId);
        if(e.target.closest('.qty-plus')){ item.qty++; LB.saveCart(c); render(); renderNavbar('Keranjang'); }
        else if(e.target.closest('.qty-minus')){ if(item.qty>1){ item.qty--; LB.saveCart(c); render(); renderNavbar('Keranjang'); } }
        else if(e.target.closest('[data-remove]')){ LB.saveCart(c.filter(i => i.lineId !== lineId)); toast('Produk dihapus dari keranjang','success'); render(); renderNavbar('Keranjang'); }
      });
    }

    document.querySelectorAll('.cb-item').forEach((cb,idx) => cb.addEventListener('change', (e) => {
      const c = LB.cart(); c[idx].selected = e.target.checked; LB.saveCart(c); render();
    }));

    const btnVoucher = document.getElementById('apply-voucher');
    if(btnVoucher){
      btnVoucher.addEventListener('click', () => {
        const codeInput = document.getElementById('voucher-code');
        const code = codeInput ? codeInput.value.trim() : '';
        const v = LB.voucherByCode(code);
        const msg = document.getElementById('voucher-msg');
        if(!v){ if(msg){ msg.style.color='var(--clr-danger)'; msg.textContent = 'Kode voucher tidak valid atau sudah tidak aktif.'; } appliedVoucher=null; }
        else if(subtotal < v.minPurchase){ if(msg){ msg.style.color='var(--clr-danger)'; msg.textContent = `Minimal belanja ${LB.rupiah(v.minPurchase)} untuk voucher ini.`; } appliedVoucher=null; }
        else { appliedVoucher = v; if(msg){ msg.style.color='var(--clr-success)'; msg.textContent = `Voucher ${v.code} berhasil digunakan!`; } toast('Voucher berhasil dipakai','success'); }
        render();
      });
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if(checkoutBtn){
      checkoutBtn.addEventListener('click', () => {
        if(!requireLogin('Silakan masuk untuk melanjutkan checkout', 'checkout.html')) { window.location.href='login.html'; return; }
        localStorage.setItem('lb_checkout_voucher', appliedVoucher? appliedVoucher.code : '');
        window.location.href = 'checkout.html';
      });
    }
  }

  render();
});
