/* =========================================================
   LARAS BUDAYA — Admin Reviews Management Page Logic
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  if(!adminGuard()) return;

  renderAdminShell('Review');
  const topbar = document.getElementById('topbar');
  if(topbar) topbar.innerHTML = adminTopbar('Kelola Review', 'Pantau ulasan pembeli dan hapus review yang tidak pantas.');

  function render(){
    const searchInput = document.getElementById('search-review');
    const tbody = document.getElementById('review-tbody');
    if(!tbody) return;

    const q = searchInput ? searchInput.value.toLowerCase() : '';
    let list = LB.reviews();
    if(q) list = list.filter(r => (LB.productById(r.productId)?.nama||'').toLowerCase().includes(q) || r.comment.toLowerCase().includes(q));
    tbody.innerHTML = list.length ? list.map(r => `
      <tr>
        <td>${LB.productById(r.productId)?.nama||'-'}</td>
        <td>${r.userName||'-'}</td>
        <td class="stars">${starString(r.rating)}</td>
        <td style="max-width:280px;">${r.comment}</td>
        <td>${new Date(r.createdAt).toLocaleDateString('id-ID')}</td>
        <td><button class="icon-btn" data-del="${r.id}" title="Hapus">${ICONS.trash}</button></td>
      </tr>`).join('') : `<tr><td colspan="6" style="text-align:center; color:var(--clr-text-soft); padding:24px;">Belum ada review.</td></tr>`;
  }

  const searchInput = document.getElementById('search-review');
  if(searchInput) searchInput.addEventListener('input', render);

  const tbody = document.getElementById('review-tbody');
  if(tbody){
    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-del]'); if(!btn) return;
      if(!confirm('Hapus review ini? Aksi ini tidak bisa dibatalkan.')) return;
      const rv = LB.reviews().find(r=>r.id===btn.dataset.del);
      LB.saveReviews(LB.reviews().filter(r=>r.id!==btn.dataset.del));
      // recompute product rating
      if(rv){
        const stats = LB.productRatingStats(rv.productId);
        const products = LB.products(); const p = products.find(x=>x.id===rv.productId);
        if(p){ p.rating = stats.avg; p.jumlahReview = stats.count; LB.saveProducts(products); }
      }
      LB.addActivity('Admin menghapus review yang tidak pantas.');
      toast('Review dihapus','success'); render();
    });
  }

  render();
});
