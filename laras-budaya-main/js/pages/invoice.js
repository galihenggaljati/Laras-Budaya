/* =========================================================
   LARAS BUDAYA — Invoice Page Logic
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();

  const params = new URLSearchParams(window.location.search);
  const order = LB.orderById(params.get('id'));
  const root = document.getElementById('invoice-root');
  if(!root) return;

  if(!order){
    root.innerHTML = emptyStateHTML('Invoice tidak ditemukan', 'Pesanan yang kamu cari tidak tersedia.', 'pesanan.html', 'Lihat Pesanan Saya');
  } else {
    const statusClass = order.status==='Selesai'?'status-done':order.status==='Dibatalkan'?'status-cancel':order.status==='Menunggu Konfirmasi'?'status-pending':'status-progress';
    root.innerHTML = `
    <div class="invoice-box">
      <div class="invoice-head">
        <div>
          <div style="font-family:var(--font-display); font-size:24px; font-weight:700;">Laras Budaya</div>
          <div style="font-size:12px; color:var(--clr-text-soft);">Jl. Kebudayaan No. 8, Surakarta, Jawa Tengah</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:700;">${order.invoiceNo}</div>
          <div style="font-size:12px; color:var(--clr-text-soft);">${new Date(order.createdAt).toLocaleString('id-ID')}</div>
          <span class="status-pill ${statusClass}">${order.status}</span>
        </div>
      </div>
      <div class="responsive-grid-2" style="margin-bottom:22px; font-size:13.5px;">
        <div>
          <div style="color:var(--clr-text-soft); font-size:11.5px; text-transform:uppercase; margin-bottom:4px;">Ditujukan Kepada</div>
          <b>${order.customer.nama}</b><br>${order.customer.whatsapp}<br>${order.customer.email}<br>${order.customer.alamat}
        </div>
        <div>
          <div style="color:var(--clr-text-soft); font-size:11.5px; text-transform:uppercase; margin-bottom:4px;">Detail Pembayaran</div>
          Metode: <b>${order.payment}</b><br>
          ${order.courier? `Kurir: <b>${order.courier}</b><br>`:''}
          ${order.resi? `No. Resi: <b>${order.resi}</b><br>`:''}
          ${order.customer.catatan? `Catatan: ${order.customer.catatan}`:''}
        </div>
      </div>
      <div class="table-responsive">
        <table class="invoice-table">
          <thead><tr><th>Produk</th><th>Varian</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr></thead>
          <tbody>
            ${order.items.map(i => `<tr><td>${i.nama}</td><td>${[i.warna,i.ukuran,i.model].filter(Boolean).join(', ')}</td><td>${i.qty}</td><td>${LB.rupiah(i.harga)}</td><td>${LB.rupiah(i.harga*i.qty)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div style="max-width:280px; margin-left:auto; margin-top:18px;">
        <div class="summary-row"><span>Subtotal</span><span>${LB.rupiah(order.subtotal)}</span></div>
        <div class="summary-row"><span>Ongkir</span><span>${LB.rupiah(order.ongkir)}</span></div>
        ${order.diskon>0?`<div class="summary-row"><span>Diskon (${order.voucher})</span><span>- ${LB.rupiah(order.diskon)}</span></div>`:''}
        <div class="summary-row total"><span>Total</span><span>${LB.rupiah(order.total)}</span></div>
      </div>
      <div style="text-align:center; margin-top:32px;" class="no-print">
        <button class="btn btn-primary" onclick="window.print()">🖨️ Cetak Invoice</button>
        <a href="pesanan.html" class="btn btn-outline">Lihat Semua Pesanan</a>
      </div>
    </div>`;
  }
});
