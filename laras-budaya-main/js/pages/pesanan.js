/* =========================================================
   LARAS BUDAYA — Customer Orders History Logic
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();

  const user = LB.currentUser();
  const root = document.getElementById('root');

  function statusClass(s){
    return s==='Selesai'?'status-done':s==='Dibatalkan'?'status-cancel':s==='Menunggu Konfirmasi'?'status-pending':'status-progress';
  }

  function renderList(){
    if(!root) return;
    if(!user){ root.innerHTML = loginCtaHTML('Riwayat pesananmu akan tampil di sini setelah masuk.', 'pesanan.html'); return; }
    const list = LB.orders().filter(o => o.userId === user.id);
    if(!list.length){ root.innerHTML = emptyStateHTML('Belum ada pesanan', 'Semua transaksimu akan muncul di sini.', 'produk.html', 'Mulai Belanja'); return; }
    root.innerHTML = list.map(o => `
      <div class="order-card" data-id="${o.id}">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <b>${o.invoiceNo}</b>
            <div style="font-size:12px; color:var(--clr-text-soft);">${new Date(o.createdAt).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})} · ${o.items.length} produk</div>
          </div>
          <span class="status-pill ${statusClass(o.status)}">${o.status}</span>
        </div>
        <div style="display:flex; gap:8px; margin-top:12px; overflow-x:auto;">
          ${o.items.map(i => { const p = LB.productById(i.productId); return p?`<img src="${p.foto[0]}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;">`:''; }).join('')}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
          <b style="color:var(--clr-brown);">${LB.rupiah(o.total)}</b>
          <span class="section-link">Lihat Detail →</span>
        </div>
      </div>`).join('');
  }
  renderList();

  const modal = document.getElementById('detail-modal');
  if(root && modal){
    root.addEventListener('click', (e) => {
      const card = e.target.closest('.order-card'); if(!card) return;
      const o = LB.orderById(card.dataset.id);
      if(!o) return;
      const allSteps = ['Pesanan Dibuat', ...LB.STATUS_FLOW];
      const curIdx = allSteps.indexOf(o.status === 'Dibatalkan' ? 'Menunggu Konfirmasi' : o.status);
      const modalContent = document.getElementById('modal-content');
      if(modalContent){
        modalContent.innerHTML = `
          <h3 style="font-family:var(--font-display); font-size:22px; margin-bottom:4px;">${o.invoiceNo}</h3>
          <p style="font-size:12.5px; color:var(--clr-text-soft); margin-bottom:16px;">${new Date(o.createdAt).toLocaleString('id-ID')}</p>
          <div class="timeline">
            ${o.status === 'Dibatalkan' ? `
              <div class="timeline-step done"><h6>Pesanan Dibuat</h6><span>${new Date(o.timeline[0].time).toLocaleString('id-ID')}</span></div>
              <div class="timeline-step cancel current"><h6>Dibatalkan</h6><span>${o.cancelReason||'Pesanan dibatalkan'}</span></div>
            ` : allSteps.map((s,i) => `
              <div class="timeline-step ${i<curIdx?'done':i===curIdx?'current':''}">
                <h6>${s}</h6>
                <span>${(o.timeline.find(t=>t.status===s)? new Date(o.timeline.find(t=>t.status===s).time).toLocaleString('id-ID') : (i<=curIdx? '' : 'Menunggu'))}</span>
              </div>`).join('')}
          </div>
          <div style="border-top:1px solid var(--clr-border); padding-top:14px; margin-top:8px;">
            ${o.items.map(i => `<div class="summary-row"><span>${i.nama} x${i.qty}</span><span>${LB.rupiah(i.harga*i.qty)}</span></div>`).join('')}
            <div class="summary-row total"><span>Total</span><span>${LB.rupiah(o.total)}</span></div>
          </div>
          ${o.status === 'Pesanan Diterima' ? `
            <div style="background:var(--clr-cream); border-radius:var(--radius-md); padding:14px 16px; margin-top:14px; font-size:13px;">
              Sudah menerima barang dengan baik? Konfirmasi supaya pesanan bisa selesai dan kamu bisa memberi ulasan.
            </div>
            <button class="btn btn-primary btn-block" id="confirm-received-btn" style="margin-top:10px;">Konfirmasi Barang Diterima</button>
          ` : ''}
          ${o.status === 'Selesai' ? `<button class="btn btn-outline btn-block" id="review-now-btn" style="margin-top:14px;">Beri Ulasan Produk</button>` : ''}
          <div style="text-align:right; margin-top:14px;">
            <a href="invoice.html?id=${o.id}" class="btn btn-outline btn-sm">Lihat Invoice</a>
          </div>`;
      }
      modal.classList.add('open');

      const btnConfirm = document.getElementById('confirm-received-btn');
      if(btnConfirm){
        btnConfirm.addEventListener('click', () => {
          if(!confirm('Konfirmasi bahwa pesanan sudah diterima dengan baik?')) return;
          LB.confirmOrderReceived(o.id);
          toast('Terima kasih! Pesanan dikonfirmasi selesai.', 'success');
          renderNavbar();
          modal.classList.remove('open');
          renderList();
        });
      }

      const btnRev = document.getElementById('review-now-btn');
      if(btnRev){
        btnRev.addEventListener('click', () => {
          modal.classList.remove('open');
          const unreviewed = o.items.find(i => !LB.reviews().some(r => r.userId===user.id && r.productId===i.productId));
          if(unreviewed) openReviewModal(unreviewed.productId, () => {});
          else toast('Semua produk di pesanan ini sudah kamu ulas','success');
        });
      }
    });
  }

  const closeModal = document.getElementById('close-modal');
  if(closeModal && modal) closeModal.addEventListener('click', () => modal.classList.remove('open'));
  if(modal) modal.addEventListener('click', (e) => { if(e.target === modal) modal.classList.remove('open'); });
});
