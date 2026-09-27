/* =========================================================
   LARAS BUDAYA — Admin Orders Management Page Logic
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  if(!adminGuard()) return;

  renderAdminShell('Pesanan');
  const topbar = document.getElementById('topbar');
  if(topbar) topbar.innerHTML = adminTopbar('Kelola Pesanan', 'Perbarui status pesanan, tambahkan kurir & resi, atau batalkan pesanan.');

  const filterStatus = document.getElementById('filter-status');
  if(filterStatus){
    const statuses = [...LB.STATUS_FLOW, 'Dibatalkan'];
    filterStatus.innerHTML += statuses.map(s=>`<option value="${s}">${s}</option>`).join('');
  }

  const modal = document.getElementById('modal');
  const modalBox = document.getElementById('modal-box');
  function closeModal(){ if(modal) modal.classList.remove('open'); if(modalBox) { modalBox.className = 'modal-box'; modalBox.innerHTML = ''; } }
  if(modal) modal.addEventListener('click', (e) => { if(e.target===modal) closeModal(); });

  function statusClass(s){ return s==='Selesai'?'status-done':s==='Dibatalkan'?'status-cancel':s==='Menunggu Konfirmasi'?'status-pending':'status-progress'; }

  function render(){
    const searchOrder = document.getElementById('search-order');
    const filterSt = document.getElementById('filter-status');
    const tbody = document.getElementById('order-tbody');
    if(!tbody) return;

    const q = searchOrder ? searchOrder.value.toLowerCase() : '';
    const st = filterSt ? filterSt.value : '';
    let list = LB.orders();
    if(q) list = list.filter(o => o.invoiceNo.toLowerCase().includes(q) || o.customer.nama.toLowerCase().includes(q));
    if(st) list = list.filter(o => o.status === st);
    tbody.innerHTML = list.length ? list.map(o => `
      <tr>
        <td><b>${o.invoiceNo}</b></td>
        <td>${o.customer.nama}</td>
        <td>${new Date(o.createdAt).toLocaleDateString('id-ID')}</td>
        <td>${LB.rupiah(o.total)}</td>
        <td><span class="status-pill ${statusClass(o.status)}">${o.status}</span></td>
        <td><button class="btn btn-outline btn-sm" data-manage="${o.id}">Kelola</button></td>
      </tr>`).join('') : `<tr><td colspan="6" style="text-align:center; color:var(--clr-text-soft); padding:24px;">Tidak ada pesanan ditemukan.</td></tr>`;
  }

  const searchOrder = document.getElementById('search-order');
  if(searchOrder) searchOrder.addEventListener('input', render);
  if(filterStatus) filterStatus.addEventListener('change', render);

  const tbody = document.getElementById('order-tbody');
  if(tbody){
    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-manage]'); if(!btn) return;
      openManageModal(LB.orderById(btn.dataset.manage));
    });
  }

  function openManageModal(o){
    if(!o || !modal || !modalBox) return;
    const nextIdx = LB.ADMIN_STATUS_FLOW.indexOf(o.status);
    const nextStatus = nextIdx > -1 ? LB.ADMIN_STATUS_FLOW[nextIdx+1] : null;
    const waitingCustomer = o.status === 'Pesanan Diterima';
    
    modalBox.className = 'modal-box wide';
    modalBox.innerHTML = `
      <button class="modal-close" id="mclose">✕</button>
      <h3 style="font-family:var(--font-display); font-size:22px; margin-bottom:18px;">Detail & Kelola Pesanan</h3>
      
      <div class="order-manage-grid">
        <!-- KIRI: INFORMASI PESANAN -->
        <div>
          <div style="border: 1px solid var(--clr-border); border-radius: var(--radius-md); padding: 16px; margin-bottom: 18px; background: var(--clr-bg);">
            <h4 style="font-size:14px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;"><b>Informasi Customer</b> <span style="font-size:11.5px; color:var(--clr-text-soft);">${o.invoiceNo}</span></h4>
            <p style="font-size:13px; margin-bottom:4px;"><b>Nama:</b> ${o.customer.nama}</p>
            <p style="font-size:13px; margin-bottom:4px;"><b>WhatsApp:</b> ${o.customer.whatsapp}</p>
            <p style="font-size:13px; margin-bottom:4px;"><b>Email:</b> ${o.customer.email}</p>
            <p style="font-size:13px; margin-bottom:4px;"><b>Alamat:</b> ${o.customer.alamat}</p>
            ${o.customer.catatan ? `<p style="font-size:13px; color:var(--clr-danger); margin-top:6px;"><b>Catatan:</b> "${o.customer.catatan}"</p>` : ''}
          </div>

          <div style="border: 1px solid var(--clr-border); border-radius: var(--radius-md); padding: 16px; background: var(--clr-bg);">
            <h4 style="font-size:14px; margin-bottom:12px;"><b>Daftar Produk (${o.items.length})</b></h4>
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${o.items.map(item => {
                const p = LB.productById(item.productId);
                return `
                  <div style="display:flex; gap:10px; align-items:center;">
                    <img src="${p?.foto[0] || 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?auto=format&fit=crop&w=600&q=70'}" style="width:46px; height:46px; border-radius:6px; object-fit:cover; flex-shrink:0;">
                    <div style="flex:1; min-width:0; font-size:12.5px;">
                      <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${item.nama}">${item.nama}</div>
                      <div style="font-size:11px; color:var(--clr-text-soft);">
                        ${item.warna ? `Warna: ${item.warna} ` : ''}
                        ${item.ukuran ? `| Ukuran: ${item.ukuran} ` : ''}
                        ${item.model ? `| Tipe: ${item.model} ` : ''}
                      </div>
                    </div>
                    <div style="text-align:right; font-size:13px; flex-shrink:0;">
                      <b>${item.qty}x</b><br>
                      <span style="color:var(--clr-text-soft); font-size:11.5px;">${LB.rupiah(item.harga)}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            <hr style="border:none; border-top:1px solid var(--clr-border); margin:12px 0;">
            <div style="font-size:12.5px; color:var(--clr-text-soft); display:flex; flex-direction:column; gap:4px;">
              <div style="display:flex; justify-content:space-between;"><span>Subtotal:</span><span>${LB.rupiah(o.subtotal)}</span></div>
              <div style="display:flex; justify-content:space-between;"><span>Ongkir:</span><span>${LB.rupiah(o.ongkir)}</span></div>
              ${o.diskon ? `<div style="display:flex; justify-content:space-between; color:var(--clr-danger);"><span>Diskon (${o.voucher}):</span><span>-${LB.rupiah(o.diskon)}</span></div>` : ''}
              <div style="display:flex; justify-content:space-between; font-size:14px; color:var(--clr-text); font-weight:700; margin-top:4px;"><span>Total Bayar:</span><span>${LB.rupiah(o.total)}</span></div>
            </div>
          </div>
        </div>

        <!-- KANAN: UPDATE STATUS & KURIR -->
        <div>
          <div class="field" style="margin-bottom:12px;"><label>Status Saat Ini</label><div style="font-size:14px; margin-top:4px;"><span class="status-pill ${statusClass(o.status)}">${o.status}</span></div></div>
          <div class="field"><label>Metode Pembayaran</label><div style="font-size:13px; font-weight:600; margin-top:2px;">${o.payment || 'COD'}</div></div>
          <div class="field"><label>Kurir Pengiriman</label><input type="text" id="m-kurir" value="${o.courier||''}" placeholder="Contoh: JNE, J&T, Gojek"></div>
          <div class="field"><label>Nomor Resi</label><input type="text" id="m-resi" value="${o.resi||''}" placeholder="Nomor resi pengiriman"></div>
          
          ${waitingCustomer ? `<div style="background:var(--clr-cream); border-radius:var(--radius-md); padding:10px 12px; font-size:12px; color:var(--clr-text-soft); margin-bottom:14px;">⏳ Menunggu customer mengonfirmasi barang diterima di web (status otomatis "Selesai" setelah dikonfirmasi).</div>` : ''}
          
          <div style="display:flex; flex-direction:column; gap:10px; margin-top:20px;">
            ${nextStatus && o.status!=='Dibatalkan' ? `<button class="btn btn-primary btn-block" id="m-next">Ubah Status ke "${nextStatus}"</button>`:''}
            <button class="btn btn-outline btn-block" id="m-save">Simpan Info Kurir / Resi</button>
            ${o.status!=='Dibatalkan' && o.status!=='Selesai' ? `<button class="btn btn-danger btn-block" id="m-cancel" style="margin-top:10px;">Batalkan Pesanan</button>`:''}
          </div>
        </div>
      </div>`;

    modal.classList.add('open');
    const mCloseBtn = document.getElementById('mclose');
    if(mCloseBtn) mCloseBtn.addEventListener('click', closeModal);
    
    const mSaveBtn = document.getElementById('m-save');
    if(mSaveBtn){
      mSaveBtn.addEventListener('click', () => {
        const list = LB.orders(); const ord = list.find(x=>x.id===o.id);
        if(ord){
          ord.courier = document.getElementById('m-kurir').value.trim();
          ord.resi = document.getElementById('m-resi').value.trim();
          LB.saveOrders(list);
          toast('Info kurir & resi disimpan','success'); closeModal(); render();
        }
      });
    }
    
    const mNextBtn = document.getElementById('m-next');
    if(mNextBtn){
      mNextBtn.addEventListener('click', () => {
        LB.updateOrderStatus(o.id, nextStatus, {courier: document.getElementById('m-kurir').value.trim(), resi: document.getElementById('m-resi').value.trim()});
        toast(`Status diubah ke "${nextStatus}"`,'success'); closeModal(); render();
      });
    }
    
    const mCancelBtn = document.getElementById('m-cancel');
    if(mCancelBtn){
      mCancelBtn.addEventListener('click', () => {
        const reason = prompt('Alasan pembatalan pesanan:', 'Stok tidak tersedia');
        if(reason===null) return;
        LB.cancelOrder(o.id, reason);
        toast('Pesanan dibatalkan','success'); closeModal(); render();
      });
    }
  }

  render();
});
