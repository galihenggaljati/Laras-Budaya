/* =========================================================
   LARAS BUDAYA — Customer Profile & Account Page Logic
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();

  const root = document.getElementById('root');
  if(!root) return;

  function renderAuth(){
    root.innerHTML = `<div style="max-width:420px; margin:0 auto;">${loginCtaHTML('Masuk atau daftar akun untuk melihat profil, pesanan, wishlist, dan mengirim ulasan.', 'profile.html')}</div>`;
  }

  function renderProfile(){
    const user = LB.currentUser();
    if(!user){ renderAuth(); return; }
    const orderBadge = activeOrderCount(user.id);
    const reviewBadge = pendingReviewItems(user.id).length;
    root.innerHTML = `
    <div class="profile-layout">
      <div class="profile-side">
        <div class="profile-avatar">${user.nama[0]}</div>
        <h3 style="font-size:16px;">${user.nama}</h3>
        <p style="font-size:12.5px; color:var(--clr-text-soft); margin-bottom:16px;">${user.email}</p>
        <div class="profile-menu">
          <a class="tab-link active" data-tab="info">${ICONS.users} Info Akun</a>
          <a href="pesanan.html">${ICONS.package} Pesanan Saya ${orderBadge? `<span class="menu-badge">${orderBadge}</span>`:''}</a>
          <a href="wishlist.html">${ICONS.heart} Wishlist</a>
          <a class="tab-link" data-tab="pending">${ICONS.star} Menunggu Ulasan ${reviewBadge? `<span class="menu-badge">${reviewBadge}</span>`:''}</a>
          <a class="tab-link" data-tab="myreview">${ICONS.note} Ulasan Saya</a>
          <a href="#" id="logout-link">${ICONS.logout} Logout</a>
        </div>
      </div>
      <div id="profile-content"></div>
    </div>`;

    function renderInfo(){
      const content = document.getElementById('profile-content');
      if(!content) return;
      content.innerHTML = `
      <div class="admin-panel">
        <h3>Info Akun</h3>
        <form id="info-form">
          <div class="field"><label>Nama Lengkap</label><input type="text" name="nama" value="${user.nama}"></div>
          <div class="field"><label>Email</label><input type="email" name="email" value="${user.email}"></div>
          <div class="field"><label>Nomor WhatsApp</label><input type="text" name="whatsapp" value="${user.whatsapp}"></div>
          <div class="field"><label>Alamat</label><textarea name="alamat" rows="3">${user.alamat}</textarea></div>
          <button class="btn btn-primary" type="submit">Simpan Perubahan</button>
        </form>
      </div>`;
      const form = document.getElementById('info-form');
      if(form){
        form.addEventListener('submit', (e) => {
          e.preventDefault(); const f = e.target;
          LB.updateUser(user.id, {nama:f.nama.value.trim(), email:f.email.value.trim(), whatsapp:f.whatsapp.value.trim(), alamat:f.alamat.value.trim()});
          toast('Profil berhasil diperbarui', 'success'); renderNavbar(); renderProfile();
        });
      }
    }

    function renderPending(){
      const pending = pendingReviewItems(user.id);
      const content = document.getElementById('profile-content');
      if(!content) return;
      content.innerHTML = `
      <div class="admin-panel">
        <h3>Menunggu Ulasan</h3>
        ${pending.length ? pending.map(({item}) => `
          <div style="display:flex; gap:12px; align-items:center; padding:12px 0; border-bottom:1px solid var(--clr-border);">
            <img src="${LB.productById(item.productId)?.foto[0]}" style="width:52px;height:52px;border-radius:8px;object-fit:cover;">
            <div style="flex:1;"><b style="font-size:13.5px;">${item.nama}</b></div>
            <button class="btn btn-outline btn-sm" data-review="${item.productId}">Beri Ulasan</button>
          </div>`).join('') : `<p style="font-size:13px; color:var(--clr-text-soft);">Tidak ada produk yang menunggu ulasan saat ini.</p>`}
      </div>`;
      content.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-review]'); if(!btn) return;
        openReviewModal(btn.dataset.review, () => { renderProfile(); });
      });
    }

    function renderMyReview(){
      const myReviews = LB.reviews().filter(r => r.userId === user.id);
      const content = document.getElementById('profile-content');
      if(!content) return;
      content.innerHTML = `
      <div class="admin-panel">
        <h3>Ulasan Saya</h3>
        ${myReviews.length ? myReviews.map(r => `
          <div class="review-item">
            <b style="font-size:13.5px;">${LB.productById(r.productId)?.nama||'Produk'}</b>
            <div class="stars">${starString(r.rating)}</div>
            <p style="font-size:13px; color:var(--clr-text-soft);">${r.comment}</p>
          </div>`).join('') : emptyStateHTML('Belum ada ulasan', 'Ulasan yang kamu berikan akan tampil di sini.')}
      </div>`;
    }

    renderInfo();
    document.querySelectorAll('.tab-link').forEach(t => t.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.tab-link').forEach(x=>x.classList.remove('active')); t.classList.add('active');
      if(t.dataset.tab==='info') renderInfo();
      else if(t.dataset.tab==='pending') renderPending();
      else renderMyReview();
    }));

    const logoutBtn = document.getElementById('logout-link');
    if(logoutBtn){
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        LB.logout(); toast('Berhasil keluar','success'); renderNavbar(); renderProfile();
      });
    }
  }

  renderProfile();
});
