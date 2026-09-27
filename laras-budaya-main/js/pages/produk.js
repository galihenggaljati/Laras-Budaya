/* =========================================================
   LARAS BUDAYA — Product Catalog Page Logic
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('Produk');
  renderFooter();

  const params = new URLSearchParams(window.location.search);
  let state = {
    cari: params.get('cari') || '',
    kategori: params.get('kategori') ? [params.get('kategori')] : [],
    badge: params.get('badge') || null,
    harga: 'all', ratingMin: 0, warna: [], ukuran: [], onlyStock: false,
    sort: params.get('sort') || 'terbaru',
    view: 'grid', page: 1, perPage: 8,
  };

  if(params.get('cari')){
    const i = document.getElementById('nav-search-input');
    if(i) i.value = state.cari;
  }

  const allProducts = LB.products();
  const categories = LB.categories();
  const allColors = [...new Set(allProducts.flatMap(p => p.warna||[]))];
  const allSizes = [...new Set(allProducts.flatMap(p => p.ukuran||[]))];
  const colorHex = {'Coklat':'#8B5E3C','Hitam':'#2A2320','Navy':'#2C3654','Coklat Tua':'#5C3A20','Merah-Emas':'#B3452D','Hijau-Emas':'#4F7A4A','Ungu-Emas':'#6B4C7A','Hijau Sage':'#8CA07A','Dusty Pink':'#D9A6A0','Krem':'#EFE3C8','Putih Gading':'#F7F1E1','Emas':'#C89B3C','Perak':'#C9C9C9','Abu-Abu':'#9B9384','Marun':'#6B1F2A','Olive':'#6E7A4F'};

  const fKat = document.getElementById('f-kategori');
  if(fKat){
    fKat.innerHTML = categories.map(c => `
      <label class="filter-option"><input type="checkbox" value="${c.id}" class="cb-kategori" ${state.kategori.includes(c.id)?'checked':''}> <span style="display:inline-flex; width:16px; height:16px;">${categoryIcon(c)}</span> ${c.nama}</label>`).join('');
  }

  if(window.location.hash === '#kategori-filter'){
    setTimeout(() => {
      const drawer = document.getElementById('filter-drawer');
      if (drawer) drawer.classList.add('open');
      const el = document.getElementById('kategori-filter');
      if (el) {
        el.scrollIntoView({behavior:'smooth', block:'start'});
        el.style.transition = 'box-shadow .4s ease';
        el.style.boxShadow = '0 0 0 3px var(--clr-gold)';
        setTimeout(() => el.style.boxShadow = '', 1600);
      }
    }, 300);
  }

  const fWarna = document.getElementById('f-warna');
  if(fWarna) fWarna.innerHTML = allColors.map(c => `<div class="color-swatch" data-color="${c}" style="background:${colorHex[c]||'#ccc'}" title="${c}"></div>`).join('');

  const fUkuran = document.getElementById('f-ukuran');
  if(fUkuran) fUkuran.innerHTML = allSizes.map(s => `<span class="variant-opt" data-size="${s}" style="padding:5px 12px; font-size:12px;">${s}</span>`).join('');

  function applyFilters(){
    let list = [...allProducts];
    if(state.cari){ list = list.filter(p => p.nama.toLowerCase().includes(state.cari.toLowerCase())); }
    if(state.kategori.length){ list = list.filter(p => state.kategori.includes(p.kategori)); }
    if(state.badge){ list = list.filter(p => (p.badge||[]).includes(state.badge)); }
    if(state.harga !== 'all'){ const [min,max] = state.harga.split('-').map(Number); list = list.filter(p => p.harga >= min && p.harga <= max); }
    if(state.ratingMin > 0){ list = list.filter(p => p.rating >= state.ratingMin); }
    if(state.warna.length){ list = list.filter(p => (p.warna||[]).some(w => state.warna.includes(w))); }
    if(state.ukuran.length){ list = list.filter(p => (p.ukuran||[]).some(u => state.ukuran.includes(u))); }
    if(state.onlyStock){ list = list.filter(p => p.stok > 0); }

    switch(state.sort){
      case 'terlaris': list.sort((a,b)=> b.terjual-a.terjual); break;
      case 'rating': list.sort((a,b)=> b.rating-a.rating); break;
      case 'termurah': list.sort((a,b)=> a.harga-b.harga); break;
      case 'termahal': list.sort((a,b)=> b.harga-a.harga); break;
      case 'az': list.sort((a,b)=> a.nama.localeCompare(b.nama)); break;
      default: list.sort((a,b)=> b.id.localeCompare(a.id));
    }
    return list;
  }

  function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / state.perPage);
    const wrap = document.getElementById('pagination-wrap');
    if (!wrap) return;
    if (totalPages <= 1) {
      wrap.innerHTML = '';
      return;
    }
    
    let html = `<button class="btn btn-outline btn-sm" id="prev-page-btn" ${state.page === 1 ? 'disabled' : ''}>Sebelumnya</button>`;
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="btn btn-sm ${state.page === i ? 'btn-primary' : 'btn-outline'}" data-page="${i}">${i}</button>`;
    }
    html += `<button class="btn btn-outline btn-sm" id="next-page-btn" ${state.page === totalPages ? 'disabled' : ''}>Selanjutnya</button>`;
    
    wrap.innerHTML = html;
  }

  function render(){
    const filtered = applyFilters();
    const totalItems = filtered.length;
    const start = (state.page - 1) * state.perPage;
    const end = start + state.perPage;
    const shown = filtered.slice(start, end);
    
    const grid = document.getElementById('product-grid');
    if(!grid) return;
    grid.classList.toggle('list-view', state.view==='list');
    
    const resCount = document.getElementById('result-count');
    if(resCount){
      if (totalItems === 0) {
        resCount.textContent = `Menampilkan 0 produk`;
      } else {
        resCount.textContent = `Menampilkan ${start + 1}-${Math.min(end, totalItems)} dari ${totalItems} produk`;
      }
    }
    
    grid.innerHTML = filtered.length ? shown.map(p => productCardHTML(p, {list: state.view==='list'})).join('') : emptyStateHTML('Produk tidak ditemukan', 'Coba ubah kata kunci atau filter pencarian kamu.', 'produk.html', 'Reset Pencarian');
    wireProductGridEvents(grid);
    renderPagination(totalItems);
  }

  const sortSel = document.getElementById('sort-select');
  if(sortSel){
    sortSel.value = state.sort;
    sortSel.addEventListener('change', e => { state.sort = e.target.value; state.page=1; render(); });
  }

  const vGrid = document.getElementById('view-grid');
  const vList = document.getElementById('view-list');
  if(vGrid) vGrid.addEventListener('click', () => { state.view='grid'; vGrid.classList.add('active'); if(vList) vList.classList.remove('active'); render(); });
  if(vList) vList.addEventListener('click', () => { state.view='list'; vList.classList.add('active'); if(vGrid) vGrid.classList.remove('active'); render(); });

  const pagWrap = document.getElementById('pagination-wrap');
  if(pagWrap){
    pagWrap.addEventListener('click', (e) => {
      const prevBtn = e.target.closest('#prev-page-btn');
      const nextBtn = e.target.closest('#next-page-btn');
      const numBtn = e.target.closest('[data-page]');
      
      if (prevBtn && state.page > 1) {
        state.page--;
        render();
        window.scrollTo({top: 0, behavior: 'smooth'});
      } else if (nextBtn) {
        const totalPages = Math.ceil(applyFilters().length / state.perPage);
        if (state.page < totalPages) {
          state.page++;
          render();
          window.scrollTo({top: 0, behavior: 'smooth'});
        }
      } else if (numBtn) {
        state.page = Number(numBtn.dataset.page);
        render();
        window.scrollTo({top: 0, behavior: 'smooth'});
      }
    });
  }

  document.querySelectorAll('.cb-kategori').forEach(cb => cb.addEventListener('change', () => {
    state.kategori = [...document.querySelectorAll('.cb-kategori:checked')].map(c => c.value);
    state.page = 1; render();
  }));
  document.querySelectorAll('input[name="harga"]').forEach(r => r.addEventListener('change', () => { state.harga = r.value; state.page=1; render(); }));
  document.querySelectorAll('input[name="rating"]').forEach(r => r.addEventListener('change', () => { state.ratingMin = Number(r.value); state.page=1; render(); }));
  
  const fStok = document.getElementById('f-stok');
  if(fStok) fStok.addEventListener('change', (e) => { state.onlyStock = e.target.checked; state.page=1; render(); });

  if(fWarna){
    fWarna.addEventListener('click', (e) => {
      const sw = e.target.closest('.color-swatch'); if(!sw) return;
      sw.classList.toggle('selected');
      state.warna = [...document.querySelectorAll('.color-swatch.selected')].map(s => s.dataset.color);
      state.page = 1; render();
    });
  }

  if(fUkuran){
    fUkuran.addEventListener('click', (e) => {
      const op = e.target.closest('.variant-opt'); if(!op) return;
      op.classList.toggle('selected');
      state.ukuran = [...document.querySelectorAll('#f-ukuran .variant-opt.selected')].map(s => s.dataset.size);
      state.page = 1; render();
    });
  }

  const resetBtn = document.getElementById('reset-filter');
  if(resetBtn) resetBtn.addEventListener('click', () => { window.location.href = 'produk.html'; });

  const filterDrawer = document.getElementById('filter-drawer');
  const btnOpenFilter = document.getElementById('btn-open-filter');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const filterBackdrop = document.getElementById('filter-drawer-backdrop');
  const btnApplyFilter = document.getElementById('btn-apply-filter');

  if(btnOpenFilter && filterDrawer) btnOpenFilter.addEventListener('click', () => filterDrawer.classList.add('open'));
  if(btnCloseDrawer && filterDrawer) btnCloseDrawer.addEventListener('click', () => filterDrawer.classList.remove('open'));
  if(filterBackdrop && filterDrawer) filterBackdrop.addEventListener('click', () => filterDrawer.classList.remove('open'));
  if(btnApplyFilter && filterDrawer) btnApplyFilter.addEventListener('click', () => filterDrawer.classList.remove('open'));

  render();
});
