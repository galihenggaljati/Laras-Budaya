/* =========================================================
   LARAS BUDAYA — Checkout Page Logic
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();

  const user = LB.currentUser();
  const items = LB.cart().filter(i => i.selected);
  const root = document.getElementById('checkout-root');
  if(!root) return;

  if(!user){
    root.innerHTML = loginCtaHTML('Kamu perlu masuk ke akun untuk melanjutkan checkout.', 'checkout.html');
  } else if(!items.length){
    root.innerHTML = emptyStateHTML('Tidak ada produk untuk checkout', 'Pilih produk di keranjang terlebih dahulu.', 'keranjang.html', 'Kembali ke Keranjang');
  } else {
    const voucherCode = localStorage.getItem('lb_checkout_voucher') || '';
    const voucher = LB.voucherByCode(voucherCode);
    const subtotal = items.reduce((s,i) => { const p = LB.productById(i.productId); return s + (p?p.harga*i.qty:0); }, 0);
    const ongkir = 15000;
    const diskon = (voucher && subtotal >= voucher.minPurchase) ? (voucher.type==='percent'? subtotal*voucher.value/100 : voucher.value) : 0;
    const total = Math.max(0, subtotal + ongkir - diskon);

    root.innerHTML = `
    <div class="checkout-layout">
      <div>
        <div class="admin-panel">
          <h3>Data Pengiriman</h3>
          <form id="checkout-form" novalidate>
            <div class="field" id="f-nama"><label>Nama Lengkap</label><input type="text" name="nama" value="${user.nama}"><div class="error-msg">Nama wajib diisi.</div></div>
            <div class="field" id="f-wa"><label>Nomor WhatsApp</label><input type="text" name="whatsapp" value="${user.whatsapp}" placeholder="08xxxxxxxxxx"><div class="error-msg">Nomor hanya boleh berisi angka.</div></div>
            <div class="field" id="f-email"><label>Email</label><input type="email" name="email" value="${user.email}"><div class="error-msg">Format email tidak valid.</div></div>
            <div class="field" id="f-alamat"><label>Alamat Lengkap</label><textarea name="alamat" rows="3">${user.alamat}</textarea><div class="error-msg">Alamat wajib diisi.</div></div>
            <div class="field"><label>Catatan (opsional)</label><textarea name="catatan" rows="2" placeholder="Contoh: titip di satpam, dst."></textarea></div>
          </form>
        </div>
        <div class="admin-panel">
          <h3>Metode Pembayaran</h3>
          <div class="payment-option selected" data-pay="COD"><input type="radio" name="pay" checked> <div><b>COD (Bayar di Tempat)</b><div style="font-size:12px;color:var(--clr-text-soft);">Bayar tunai saat pesanan diterima kurir</div></div></div>
          <div class="payment-option" data-pay="Transfer"><input type="radio" name="pay"> <div><b>Transfer Bank</b><div style="font-size:12px;color:var(--clr-text-soft);">Transfer manual ke rekening Laras Budaya</div></div></div>
        </div>
      </div>
      <div class="summary-box">
        <h3 style="font-family:var(--font-display); font-size:20px; margin-bottom:14px;">Ringkasan Pesanan</h3>
        ${items.map(i => { const p = LB.productById(i.productId); return `<div class="summary-row"><span>${p ? p.nama : ''} x${i.qty}</span><span>${LB.rupiah((p ? p.harga : 0)*i.qty)}</span></div>`; }).join('')}
        <div class="summary-row"><span>Subtotal</span><span>${LB.rupiah(subtotal)}</span></div>
        <div class="summary-row"><span>Ongkir</span><span>${LB.rupiah(ongkir)}</span></div>
        ${diskon>0?`<div class="summary-row"><span>Voucher ${voucher ? voucher.code : ''}</span><span>- ${LB.rupiah(diskon)}</span></div>`:''}
        <div class="summary-row total"><span>Total Bayar</span><span>${LB.rupiah(total)}</span></div>
        <button class="btn btn-primary btn-block" id="submit-order" style="margin-top:16px;">Buat Pesanan</button>
      </div>
    </div>`;

    let payMethod = 'COD';
    document.querySelectorAll('.payment-option').forEach(el => el.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(o => { o.classList.remove('selected'); o.querySelector('input').checked=false; });
      el.classList.add('selected'); el.querySelector('input').checked = true; payMethod = el.dataset.pay;
    }));

    function validate(){
      const form = document.getElementById('checkout-form');
      if(!form) return null;
      const nama = form.nama.value.trim();
      const wa = form.whatsapp.value.trim();
      const email = form.email.value.trim();
      const alamat = form.alamat.value.trim();
      let ok = true;
      const setInvalid = (id, invalid) => { const elem = document.getElementById(id); if(elem) elem.classList.toggle('invalid', invalid); };
      setInvalid('f-nama', !nama); if(!nama) ok=false;
      const waValid = /^[0-9]{8,15}$/.test(wa);
      setInvalid('f-wa', !waValid); if(!waValid) ok=false;
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      setInvalid('f-email', !emailValid); if(!emailValid) ok=false;
      setInvalid('f-alamat', !alamat); if(!alamat) ok=false;
      if(!items.length){ toast('Keranjang tidak boleh kosong','error'); ok=false; }
      const stockIssue = items.some(i => { const p = LB.productById(i.productId); return !p || p.stok < i.qty; });
      if(stockIssue){ toast('Stok salah satu produk tidak mencukupi','error'); ok=false; }
      return ok ? {nama,whatsapp:wa,email,alamat,catatan:form.catatan.value.trim()} : null;
    }

    const subOrder = document.getElementById('submit-order');
    if(subOrder){
      subOrder.addEventListener('click', () => {
        const data = validate();
        if(!data) { toast('Mohon lengkapi data dengan benar','error'); return; }
        const order = LB.createOrder({
          userId: user.id,
          customer: data,
          items: items.map(i => ({productId:i.productId, qty:i.qty, warna:i.warna, ukuran:i.ukuran, model:i.model, harga: LB.productById(i.productId).harga, nama: LB.productById(i.productId).nama})),
          subtotal, ongkir, diskon, voucher: voucher?voucher.code:'', total, payment: payMethod,
        });
        LB.saveCart(LB.cart().filter(i => !i.selected));
        localStorage.removeItem('lb_checkout_voucher');
        window.location.href = 'invoice.html?id=' + order.id;
      });
    }
  }
});
