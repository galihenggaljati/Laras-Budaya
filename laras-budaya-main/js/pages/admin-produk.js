/* =========================================================
   LARAS BUDAYA — Admin Products, Categories, & Stock Management
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  if(!adminGuard()) return;

  renderAdminShell('Produk & Stok');
  const topbar = document.getElementById('topbar');
  if(topbar) topbar.innerHTML = adminTopbar('Kelola Produk', 'Tambah, ubah, dan pantau seluruh katalog produk Laras Budaya.');

  const modal = document.getElementById('modal');
  const modalBox = document.getElementById('modal-box');
  function closeModal(){ if(modal) modal.classList.remove('open'); if(modalBox) modalBox.innerHTML=''; }
  if(modal) modal.addEventListener('click', (e) => { if(e.target===modal) closeModal(); });

  /* ---------------- Tabs ---------------- */
  document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active');
    ['produk','kategori','stok'].forEach(t => {
      const tabEl = document.getElementById('tab-'+t);
      if(tabEl) tabEl.style.display = t===b.dataset.tab?'block':'none';
    });
    if(b.dataset.tab==='kategori') renderKategori();
    if(b.dataset.tab==='stok') renderStok();
  }));

  /* ---------------- Produk CRUD ---------------- */
  function renderProduk(){
    const products = LB.products();
    const tabProd = document.getElementById('tab-produk');
    if(!tabProd) return;
    tabProd.innerHTML = `
    <div class="admin-panel">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
        <input type="text" id="search-produk" placeholder="Cari produk..." style="padding:9px 14px; border-radius:99px; border:1.5px solid var(--clr-border); min-width:220px;">
        <button class="btn btn-primary btn-sm" id="btn-add-produk">+ Tambah Produk</button>
      </div>
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead><tr><th></th><th>Nama</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Badge</th><th>Aksi</th></tr></thead>
          <tbody id="produk-tbody"></tbody>
        </table>
      </div>
    </div>`;

    function fillTable(list){
      const tbody = document.getElementById('produk-tbody');
      if(!tbody) return;
      tbody.innerHTML = list.map(p => `
        <tr>
          <td><img src="${p.foto[0]}" class="table-thumb"></td>
          <td>${p.nama}</td>
          <td>${LB.categoryById(p.kategori)?.nama||'-'}</td>
          <td>${LB.rupiah(p.harga)}</td>
          <td>${p.stok===0?'<span class="stock-warn">Habis</span>':p.stok}</td>
          <td>${(p.badge||[]).map(b=>`<span class="badge ${badgeClass(b)}" style="margin-right:3px;">${badgeLabel(b)}</span>`).join('')}</td>
          <td><button class="icon-btn" data-edit="${p.id}" title="Edit">${ICONS.edit}</button><button class="icon-btn" data-del="${p.id}" title="Hapus">${ICONS.trash}</button></td>
        </tr>`).join('') || `<tr><td colspan="7" style="text-align:center; color:var(--clr-text-soft); padding:24px;">Tidak ada produk ditemukan.</td></tr>`;
    }
    fillTable(products);

    const searchInput = document.getElementById('search-produk');
    if(searchInput){
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        fillTable(products.filter(p => p.nama.toLowerCase().includes(q)));
      });
    }

    const addBtn = document.getElementById('btn-add-produk');
    if(addBtn) addBtn.addEventListener('click', () => openProdukModal());

    const tbody = document.getElementById('produk-tbody');
    if(tbody){
      tbody.addEventListener('click', (e) => {
        const ed = e.target.closest('[data-edit]'); if(ed){ openProdukModal(LB.productById(ed.dataset.edit)); return; }
        const del = e.target.closest('[data-del]');
        if(del){
          if(confirm('Hapus produk ini?')){
            LB.saveProducts(LB.products().filter(p => p.id !== del.dataset.del));
            LB.addActivity('Admin menghapus produk dari katalog.');
            toast('Produk dihapus','success'); renderProduk();
          }
        }
      });
    }
  }

  function processImageFile(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => callback(e.target.result);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function openProdukModal(existing){
    if(!modal || !modalBox) return;
    const categories = LB.categories();
    
    let fotoList = existing ? [...existing.foto] : [''];
    let warnaList = existing ? [...existing.warna] : [];
    let ukuranList = existing ? [...existing.ukuran] : [];
    let modelList = existing ? [...existing.model] : [];

    function renderFotoList() {
      const container = document.getElementById('list-foto');
      if(!container) return;
      container.innerHTML = fotoList.map((item, idx) => `
        <div style="display:flex; gap:8px; margin-bottom:8px; align-items:center;" data-idx="${idx}">
          ${item ? `<img src="${item}" style="width:40px; height:40px; border-radius:6px; object-fit:cover; border:1.5px solid var(--clr-border); flex-shrink:0;">` : `<div style="width:40px; height:40px; border-radius:6px; background:var(--clr-cream); display:flex; align-items:center; justify-content:center; font-size:16px; color:var(--clr-text-soft); border:1.5px dashed var(--clr-border); flex-shrink:0;">🖼️</div>`}
          <input type="text" class="dynamic-input foto-url-input" value="${item.startsWith('data:') ? '[File Gambar Uploaded]' : item}" data-idx="${idx}" placeholder="URL Foto (https://...) atau klik Upload" style="flex:1; padding:8px 12px; border-radius:6px; border:1.5px solid var(--clr-border);">
          <label class="btn btn-outline btn-sm" style="padding:6px 10px; font-size:12px; cursor:pointer; display:inline-flex; align-items:center; gap:4px; margin:0; flex-shrink:0;" title="Upload File Gambar">
            📁 Upload
            <input type="file" class="foto-file-input" accept="image/*" style="display:none;" data-idx="${idx}">
          </label>
          <button type="button" class="icon-btn remove-foto-btn" style="color:var(--clr-danger); flex-shrink:0; cursor:pointer;" title="Hapus foto">${ICONS.trash}</button>
        </div>
      `).join('') || `<div style="font-size:12px; color:var(--clr-text-soft); margin-bottom:8px;">Belum ada foto. Klik Upload atau Tambah.</div>`;
    }

    function renderDynamicList(containerId, items, placeholder) {
      const container = document.getElementById(containerId);
      if(!container) return;
      container.innerHTML = items.map((item, idx) => `
        <div style="display:flex; gap:8px; margin-bottom:8px; align-items:center;">
          <input type="text" class="dynamic-input" value="${item}" placeholder="${placeholder}" style="flex:1; padding:8px 12px; border-radius:6px; border:1.5px solid var(--clr-border);">
          <button type="button" class="icon-btn remove-dynamic-btn" style="color:var(--clr-danger); flex-shrink:0; cursor:pointer;">${ICONS.trash}</button>
        </div>
      `).join('') || `<div style="font-size:12px; color:var(--clr-text-soft); margin-bottom:8px;">Belum ada item. Klik tambah.</div>`;
    }

    function updateLists() {
      renderFotoList();
      renderDynamicList('list-warna', warnaList, 'Contoh: Hitam');
      renderDynamicList('list-ukuran', ukuranList, 'Contoh: XL');
      renderDynamicList('list-model', modelList, 'Contoh: Jogja');
    }

    modalBox.innerHTML = `
      <button class="modal-close" id="mclose">✕</button>
      <h3 style="font-family:var(--font-display); font-size:22px; margin-bottom:16px;">${existing?'Edit Produk':'Tambah Produk'}</h3>
      <form id="produk-form" style="max-height: 70vh; overflow-y: auto; padding-right: 8px;">
        <div class="field"><label>Nama Produk</label><input type="text" name="nama" value="${existing?.nama||''}" required></div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
          <div class="field"><label>Kategori</label><select name="kategori">${categories.map(c=>`<option value="${c.id}" ${existing?.kategori===c.id?'selected':''}>${c.nama}</option>`).join('')}</select></div>
          <div class="field"><label>Stok</label><input type="number" name="stok" min="0" value="${existing?.stok??0}"></div>
          <div class="field"><label>Harga</label><input type="number" name="harga" min="0" value="${existing?.harga||0}"></div>
          <div class="field"><label>Harga Asli (coret)</label><input type="number" name="hargaAsli" min="0" value="${existing?.hargaAsli||0}"></div>
        </div>
        <div class="field"><label>Deskripsi</label><textarea name="deskripsi" rows="3">${existing?.deskripsi||''}</textarea></div>
        
        <div class="field" style="margin-bottom:18px;">
          <label>Foto Produk</label>
          <div id="list-foto"></div>
          <div style="display:flex; gap:8px; margin-top:6px; flex-wrap:wrap;">
            <label class="btn btn-primary btn-sm" style="padding:6px 12px; font-size:12px; cursor:pointer; display:inline-flex; align-items:center; gap:4px; margin:0;">
              📁 Upload File Gambar
              <input type="file" id="btn-upload-file-foto" accept="image/*" multiple style="display:none;">
            </label>
            <button type="button" class="btn btn-outline btn-sm" id="btn-add-foto" style="padding:6px 12px; font-size:12px;">+ Tambah URL Foto</button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin-bottom:18px;">
          <div class="field">
            <label>Warna</label>
            <div id="list-warna"></div>
            <button type="button" class="btn btn-outline btn-sm" id="btn-add-warna" style="margin-top:6px; padding:6px 12px; font-size:12px;">+ Tambah</button>
          </div>
          <div class="field">
            <label>Ukuran</label>
            <div id="list-ukuran"></div>
            <button type="button" class="btn btn-outline btn-sm" id="btn-add-ukuran" style="margin-top:6px; padding:6px 12px; font-size:12px;">+ Tambah</button>
          </div>
          <div class="field">
            <label>Model / Tipe</label>
            <div id="list-model"></div>
            <button type="button" class="btn btn-outline btn-sm" id="btn-add-model" style="margin-top:6px; padding:6px 12px; font-size:12px;">+ Tambah</button>
          </div>
        </div>

        <div class="field"><label>Badge</label>
          <label class="filter-option"><input type="checkbox" value="best" ${existing?.badge?.includes('best')?'checked':''}> Best Seller</label>
          <label class="filter-option"><input type="checkbox" value="promo" ${existing?.badge?.includes('promo')?'checked':''}> Promo</label>
          <label class="filter-option"><input type="checkbox" value="new" ${existing?.badge?.includes('new')?'checked':''}> New Arrival</label>
        </div>
        <button class="btn btn-primary btn-block" type="submit" style="margin-top:16px;">${existing?'Simpan Perubahan':'Tambah Produk'}</button>
      </form>`;
    
    modal.classList.add('open');
    const mCloseBtn = document.getElementById('mclose');
    if(mCloseBtn) mCloseBtn.addEventListener('click', closeModal);

    updateLists();

    // Add listeners
    const addFoto = document.getElementById('btn-add-foto');
    const addWarna = document.getElementById('btn-add-warna');
    const addUkuran = document.getElementById('btn-add-ukuran');
    const addModel = document.getElementById('btn-add-model');

    if(addFoto) addFoto.addEventListener('click', () => { fotoList.push(''); updateLists(); });
    if(addWarna) addWarna.addEventListener('click', () => { warnaList.push(''); updateLists(); });
    if(addUkuran) addUkuran.addEventListener('click', () => { ukuranList.push(''); updateLists(); });
    if(addModel) addModel.addEventListener('click', () => { modelList.push(''); updateLists(); });

    const listFotoContainer = document.getElementById('list-foto');
    if(listFotoContainer) {
      listFotoContainer.addEventListener('input', (e) => {
        const input = e.target.closest('.foto-url-input');
        if(!input) return;
        const idx = Number(input.dataset.idx);
        if(!isNaN(idx)) {
          if(!input.value.startsWith('[File')) {
            fotoList[idx] = input.value;
          }
          const row = input.closest('div');
          const img = row ? row.querySelector('img') : null;
          if(img && input.value && !input.value.startsWith('[File')) {
            img.src = input.value;
          }
        }
      });

      listFotoContainer.addEventListener('change', (e) => {
        const fileInput = e.target.closest('.foto-file-input');
        if(!fileInput || !fileInput.files || !fileInput.files[0]) return;
        const idx = Number(fileInput.dataset.idx);
        processImageFile(fileInput.files[0], (dataUrl) => {
          fotoList[idx] = dataUrl;
          renderFotoList();
        });
      });

      listFotoContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.remove-foto-btn');
        if(!btn) return;
        const row = btn.closest('div');
        const idx = Number(row.dataset.idx);
        if(!isNaN(idx)) {
          fotoList.splice(idx, 1);
          renderFotoList();
        }
      });
    }

    const bulkUploadBtn = document.getElementById('btn-upload-file-foto');
    if(bulkUploadBtn) {
      bulkUploadBtn.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        if(files.length === 0) return;
        let readCount = 0;
        files.forEach(file => {
          processImageFile(file, (dataUrl) => {
            if(fotoList.length === 1 && fotoList[0] === '') {
              fotoList[0] = dataUrl;
            } else {
              fotoList.push(dataUrl);
            }
            readCount++;
            if(readCount === files.length) {
              renderFotoList();
            }
          });
        });
      });
    }

    const bindListEvents = (containerId, list) => {
      const container = document.getElementById(containerId);
      if(!container) return;
      container.addEventListener('input', (e) => {
        const input = e.target.closest('input'); if(!input) return;
        const row = input.closest('div');
        const index = [...container.children].indexOf(row);
        if(index > -1) list[index] = input.value;
      });
      container.addEventListener('click', (e) => {
        const btn = e.target.closest('.remove-dynamic-btn'); if(!btn) return;
        const row = btn.closest('div');
        const index = [...container.children].indexOf(row);
        if(index > -1) { list.splice(index, 1); updateLists(); }
      });
    };

    bindListEvents('list-warna', warnaList);
    bindListEvents('list-ukuran', ukuranList);
    bindListEvents('list-model', modelList);

    const prodForm = document.getElementById('produk-form');
    if(prodForm){
      prodForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = e.target;
        const badges = [...f.querySelectorAll('input[type=checkbox]:checked')].map(c=>c.value);
        
        const finalFotos = fotoList.map(s=>s.trim()).filter(Boolean);
        const finalWarnas = warnaList.map(s=>s.trim()).filter(Boolean);
        const finalUkurans = ukuranList.map(s=>s.trim()).filter(Boolean);
        const finalModels = modelList.map(s=>s.trim()).filter(Boolean);

        const data = {
          nama:f.nama.value.trim(), kategori:f.kategori.value, stok:Number(f.stok.value),
          harga:Number(f.harga.value), hargaAsli:Number(f.hargaAsli.value)||Number(f.harga.value),
          deskripsi:f.deskripsi.value.trim(), 
          foto: finalFotos.length ? finalFotos : ['https://images.unsplash.com/photo-1618886614638-80e3c103d31a?auto=format&fit=crop&w=600&q=70'],
          warna: finalWarnas, ukuran: finalUkurans, model: finalModels, badge:badges,
          spesifikasi: existing?.spesifikasi || {}, rating: existing?.rating||0, jumlahReview: existing?.jumlahReview||0, terjual: existing?.terjual||0,
        };
        
        const products = LB.products();
        if(existing){
          const idx = products.findIndex(p=>p.id===existing.id);
          products[idx] = {...products[idx], ...data};
          LB.addActivity(`Admin mengubah data produk "${data.nama}".`);
        } else {
          products.push({id: LB.uid('p'), ...data});
          LB.addActivity(`Admin menambahkan produk baru "${data.nama}".`);
        }
        LB.saveProducts(products);
        toast('Produk berhasil disimpan','success');
        closeModal(); renderProduk();
      });
    }
  }

  /* ---------------- Kategori CRUD ---------------- */
  function renderKategori(){
    const categories = LB.categories();
    const tabKat = document.getElementById('tab-kategori');
    if(!tabKat) return;
    tabKat.innerHTML = `
    <div class="admin-panel">
      <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
        <h3 style="margin:0;">Daftar Kategori</h3>
        <button class="btn btn-primary btn-sm" id="btn-add-kat">+ Tambah Kategori</button>
      </div>
      <table class="data-table">
        <thead><tr><th>Icon</th><th>Nama Kategori</th><th>Jumlah Produk</th><th>Aksi</th></tr></thead>
        <tbody>
          ${categories.map(c => `<tr>
            <td><span style="display:inline-flex; width:22px; height:22px; color:var(--clr-brown);">${categoryIcon(c)}</span></td><td>${c.nama}</td>
            <td>${LB.products().filter(p=>p.kategori===c.id).length}</td>
            <td><button class="icon-btn" data-edit-kat="${c.id}" title="Edit">${ICONS.edit}</button><button class="icon-btn" data-del-kat="${c.id}" title="Hapus">${ICONS.trash}</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
    const addKatBtn = document.getElementById('btn-add-kat');
    if(addKatBtn) addKatBtn.addEventListener('click', () => openKatModal());

    document.querySelectorAll('[data-edit-kat]').forEach(b => b.addEventListener('click', () => openKatModal(LB.categoryById(b.dataset.editKat))));
    document.querySelectorAll('[data-del-kat]').forEach(b => b.addEventListener('click', () => {
      if(LB.products().some(p=>p.kategori===b.dataset.delKat)){ toast('Tidak bisa menghapus kategori yang masih memiliki produk','error'); return; }
      if(confirm('Hapus kategori ini?')){ LB.saveCategories(LB.categories().filter(c=>c.id!==b.dataset.delKat)); toast('Kategori dihapus','success'); renderKategori(); }
    }));
  }

  function openKatModal(existing){
    if(!modal || !modalBox) return;
    modalBox.innerHTML = `
      <button class="modal-close" id="mclose">✕</button>
      <h3 style="font-family:var(--font-display); font-size:22px; margin-bottom:16px;">${existing?'Edit Kategori':'Tambah Kategori'}</h3>
      <form id="kat-form">
        <div class="field"><label>Nama Kategori</label><input type="text" name="nama" value="${existing?.nama||''}" required></div>
        <div class="field"><label>Icon (emoji)</label><input type="text" name="icon" value="${existing?.icon||'🧵'}"></div>
        <button class="btn btn-primary btn-block" type="submit">Simpan</button>
      </form>`;
    modal.classList.add('open');
    const mCloseBtn = document.getElementById('mclose');
    if(mCloseBtn) mCloseBtn.addEventListener('click', closeModal);

    const katForm = document.getElementById('kat-form');
    if(katForm){
      katForm.addEventListener('submit', (e) => {
        e.preventDefault(); const f = e.target;
        const categories = LB.categories();
        if(existing){ const idx = categories.findIndex(c=>c.id===existing.id); categories[idx] = {...existing, nama:f.nama.value.trim(), icon:f.icon.value.trim()}; }
        else{ categories.push({id: LB.uid('cat'), nama:f.nama.value.trim(), icon:f.icon.value.trim()||'🧵'}); }
        LB.saveCategories(categories);
        LB.addActivity(`Admin menyimpan kategori "${f.nama.value.trim()}".`);
        toast('Kategori disimpan','success'); closeModal(); renderKategori();
      });
    }
  }

  /* ---------------- Stok Management ---------------- */
  function renderStok(){
    const products = LB.products();
    const tabStok = document.getElementById('tab-stok');
    if(!tabStok) return;
    tabStok.innerHTML = `
    <div class="admin-panel">
      <h3>Kelola Stok</h3>
      <table class="data-table">
        <thead><tr><th>Produk</th><th>Stok Saat Ini</th><th>Update Stok</th><th>Status</th></tr></thead>
        <tbody id="stok-tbody"></tbody>
      </table>
    </div>`;
    const tbody = document.getElementById('stok-tbody');
    if(!tbody) return;
    tbody.innerHTML = products.map(p => `
      <tr data-id="${p.id}">
        <td style="display:flex; align-items:center; gap:8px;"><img src="${p.foto[0]}" class="table-thumb">${p.nama}</td>
        <td>${p.stok}</td>
        <td><div style="display:flex; gap:6px;"><input type="number" min="0" value="${p.stok}" style="width:80px; padding:6px 8px; border-radius:6px; border:1.5px solid var(--clr-border);" class="stok-input"><button class="btn btn-outline btn-sm" data-save-stok="${p.id}">Simpan</button></div></td>
        <td>${p.stok===0?'<span class="stock-warn">Stok Habis</span>':p.stok<=5?'<span class="stock-warn">Hampir Habis</span>':'<span style="color:var(--clr-success)">Tersedia</span>'}</td>
      </tr>`).join('');

    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-save-stok]'); if(!btn) return;
      const input = btn.closest('tr').querySelector('.stok-input');
      const products = LB.products();
      const p = products.find(p=>p.id===btn.dataset.saveStok);
      if(p && input){
        p.stok = Number(input.value);
        LB.saveProducts(products);
        LB.addActivity(`Admin memperbarui stok produk "${p.nama}" menjadi ${p.stok}.`);
        toast('Stok berhasil diperbarui','success'); renderStok();
      }
    });
  }

  renderProduk();
});
