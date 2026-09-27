/* =========================================================
   LARAS BUDAYA — Admin Vouchers & Banners Management
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  if(!adminGuard()) return;

  renderAdminShell('Promo & Banner');
  const topbar = document.getElementById('topbar');
  if(topbar) topbar.innerHTML = adminTopbar('Promo & Banner', 'Kelola voucher diskon dan banner halaman utama.');

  const modal = document.getElementById('modal');
  const modalBox = document.getElementById('modal-box');
  function closeModal(){ if(modal) modal.classList.remove('open'); }
  if(modal) modal.addEventListener('click', (e) => { if(e.target===modal) closeModal(); });

  document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active');
    ['voucher','banner'].forEach(t => {
      const tabEl = document.getElementById('tab-'+t);
      if(tabEl) tabEl.style.display = t===b.dataset.tab?'block':'none';
    });
  }));

  /* ---------------- Voucher ---------------- */
  function renderVoucher(){
    const vouchers = LB.vouchers();
    const tabV = document.getElementById('tab-voucher');
    if(!tabV) return;
    tabV.innerHTML = `
    <div class="admin-panel">
      <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
        <h3 style="margin:0;">Daftar Voucher</h3>
        <button class="btn btn-primary btn-sm" id="btn-add-voucher">+ Buat Voucher</button>
      </div>
      <table class="data-table">
        <thead><tr><th>Kode</th><th>Tipe</th><th>Nilai</th><th>Min. Belanja</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody>
          ${vouchers.map(v => `<tr>
            <td><b>${v.code}</b></td><td>${v.type==='percent'?'Persentase':'Potongan Tetap'}</td>
            <td>${v.type==='percent'?v.value+'%':LB.rupiah(v.value)}</td><td>${LB.rupiah(v.minPurchase)}</td>
            <td>${v.active?'<span style="color:var(--clr-success)">Aktif</span>':'<span style="color:var(--clr-text-soft)">Nonaktif</span>'}</td>
            <td>
              <button class="icon-btn" data-toggle="${v.code}" title="${v.active?'Nonaktifkan':'Aktifkan'}">${v.active?ICONS.pause:ICONS.play}</button>
              <button class="icon-btn" data-edit-v="${v.code}" title="Edit">${ICONS.edit}</button>
              <button class="icon-btn" data-del-v="${v.code}" title="Hapus">${ICONS.trash}</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

    const addVBtn = document.getElementById('btn-add-voucher');
    if(addVBtn) addVBtn.addEventListener('click', () => openVoucherModal());

    document.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', () => {
      const list = LB.vouchers(); const v = list.find(x=>x.code===b.dataset.toggle); if(v){ v.active = !v.active; LB.saveVouchers(list); }
      toast(v?.active?'Voucher diaktifkan':'Voucher dinonaktifkan','success'); renderVoucher();
    }));
    document.querySelectorAll('[data-edit-v]').forEach(b => b.addEventListener('click', () => openVoucherModal(LB.voucherByCode(b.dataset.editV))));
    document.querySelectorAll('[data-del-v]').forEach(b => b.addEventListener('click', () => {
      if(confirm('Hapus voucher ini?')){ LB.saveVouchers(LB.vouchers().filter(v=>v.code!==b.dataset.delV)); toast('Voucher dihapus','success'); renderVoucher(); }
    }));
  }

  function openVoucherModal(existing){
    if(!modal || !modalBox) return;
    modalBox.innerHTML = `
      <button class="modal-close" id="mclose">✕</button>
      <h3 style="font-family:var(--font-display); font-size:20px; margin-bottom:16px;">${existing?'Edit Voucher':'Buat Voucher'}</h3>
      <form id="v-form">
        <div class="field"><label>Kode Voucher</label><input type="text" name="code" value="${existing?.code||''}" style="text-transform:uppercase;" ${existing?'readonly':''} required></div>
        <div class="field"><label>Tipe</label><select name="type"><option value="percent" ${existing?.type==='percent'?'selected':''}>Persentase (%)</option><option value="fixed" ${existing?.type==='fixed'?'selected':''}>Potongan Tetap (Rp)</option></select></div>
        <div class="field"><label>Nilai</label><input type="number" name="value" value="${existing?.value||0}" required></div>
        <div class="field"><label>Minimal Belanja (Rp)</label><input type="number" name="minPurchase" value="${existing?.minPurchase||0}"></div>
        <button class="btn btn-primary btn-block" type="submit">Simpan Voucher</button>
      </form>`;
    modal.classList.add('open');
    const mCloseBtn = document.getElementById('mclose');
    if(mCloseBtn) mCloseBtn.addEventListener('click', closeModal);

    const vForm = document.getElementById('v-form');
    if(vForm){
      vForm.addEventListener('submit', (e) => {
        e.preventDefault(); const f = e.target;
        const vouchers = LB.vouchers();
        const code = f.code.value.trim().toUpperCase();
        if(existing){ const idx = vouchers.findIndex(v=>v.code===existing.code); vouchers[idx] = {...existing, type:f.type.value, value:Number(f.value.value), minPurchase:Number(f.minPurchase.value)}; }
        else{
          if(vouchers.some(v=>v.code===code)){ toast('Kode voucher sudah ada','error'); return; }
          vouchers.push({code, type:f.type.value, value:Number(f.value.value), minPurchase:Number(f.minPurchase.value), active:true});
        }
        LB.saveVouchers(vouchers);
        LB.addActivity(`Admin menyimpan voucher "${code}".`);
        toast('Voucher berhasil disimpan','success'); closeModal(); renderVoucher();
      });
    }
  }

  /* ---------------- Banner ---------------- */
  function renderBanner(){
    const banners = LB.banners();
    const tabB = document.getElementById('tab-banner');
    if(!tabB) return;
    tabB.innerHTML = `
    <div class="admin-panel">
      <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
        <h3 style="margin:0;">Banner Homepage</h3>
        <button class="btn btn-primary btn-sm" id="btn-add-banner">+ Tambah Banner</button>
      </div>
      <div class="admin-grid-2">
        ${banners.map(b => `<div class="card-surface" style="padding:14px;">
          <img src="${b.image}" style="width:100%; height:140px; object-fit:cover; border-radius:10px; margin-bottom:10px;">
          <b style="font-size:13.5px;">${b.title}</b>
          <p style="font-size:12px; color:var(--clr-text-soft); margin:4px 0 10px;">${b.subtitle}</p>
          <button class="btn btn-outline btn-sm" data-del-banner="${b.id}">Hapus Banner</button>
        </div>`).join('') || `<p style="color:var(--clr-text-soft); font-size:13px;">Belum ada banner.</p>`}
      </div>
    </div>`;

    const addBBtn = document.getElementById('btn-add-banner');
    if(addBBtn) addBBtn.addEventListener('click', () => openBannerModal());

    document.querySelectorAll('[data-del-banner]').forEach(b => b.addEventListener('click', () => {
      LB.saveBanners(LB.banners().filter(x=>x.id!==b.dataset.delBanner)); toast('Banner dihapus','success'); renderBanner();
    }));
  }

  function openBannerModal(){
    if(!modal || !modalBox) return;
    modalBox.innerHTML = `
      <button class="modal-close" id="mclose">✕</button>
      <h3 style="font-family:var(--font-display); font-size:20px; margin-bottom:16px;">Tambah Banner</h3>
      <form id="b-form">
        <div class="field"><label>Judul</label><input type="text" name="title" required></div>
        <div class="field"><label>Subjudul</label><input type="text" name="subtitle"></div>
        <div class="field"><label>URL Gambar</label><input type="text" name="image" placeholder="https://..." required></div>
        <button class="btn btn-primary btn-block" type="submit">Simpan Banner</button>
      </form>`;
    modal.classList.add('open');
    const mCloseBtn = document.getElementById('mclose');
    if(mCloseBtn) mCloseBtn.addEventListener('click', closeModal);

    const bForm = document.getElementById('b-form');
    if(bForm){
      bForm.addEventListener('submit', (e) => {
        e.preventDefault(); const f = e.target;
        const banners = LB.banners();
        banners.push({id: LB.uid('bn'), title:f.title.value.trim(), subtitle:f.subtitle.value.trim(), image:f.image.value.trim(), link:''});
        LB.saveBanners(banners);
        LB.addActivity('Admin menambahkan banner baru di homepage.');
        toast('Banner ditambahkan','success'); closeModal(); renderBanner();
      });
    }
  }

  renderVoucher();
  renderBanner();
});
