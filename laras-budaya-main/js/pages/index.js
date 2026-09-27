/* =========================================================
   LARAS BUDAYA — Home Page Logic
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('Home');
  renderFooter();

  const b1 = document.getElementById('badge-icn-1');
  const b2 = document.getElementById('badge-icn-2');
  if(b1) b1.innerHTML = ICONS.thread;
  if(b2) b2.innerHTML = ICONS.star;

  const categories = LB.categories();
  const products = LB.products();
  const sliderContainer = document.getElementById('category-sliders');

  if(sliderContainer){
    let sliderHTML = '';
    categories.forEach(cat => {
      const catProducts = products.filter(p => p.kategori === cat.id);
      if(catProducts.length === 0) return;
      
      const displayProducts = catProducts.slice(0, 8);
      
      sliderHTML += `
      <div class="container section" style="padding-top: 40px; padding-bottom: 20px;">
        <div class="section-head">
          <div><div class="eyebrow">Kategori Pilihan</div><h2 class="section-title">${cat.nama}</h2></div>
          <a href="produk.html?kategori=${cat.id}" class="section-link">Lihat Semua →</a>
        </div>
        <div class="product-slider-container">
          ${displayProducts.map(p => productCardHTML(p)).join('')}
        </div>
      </div>`;
    });

    sliderContainer.innerHTML = sliderHTML;
    wireProductGridEvents(sliderContainer);
  }

  const testiGrid = document.getElementById('testi-grid');
  if(testiGrid){
    const testimonials = [
      {nama:'Ratri Anindya', peran:'Guru Seni Tari', teks:'Sampur yang saya beli untuk murid-murid sangat rapi dan warnanya awet, sudah dipakai berkali-kali untuk pentas sekolah.'},
      {nama:'Budi Santoso', peran:'Pengantin Adat Jawa', teks:'Beskap yang dipesan pas di badan dan bahannya premium, banyak tamu yang bertanya beli di mana.'},
      {nama:'Wulan Kartika', peran:'Pemilik Sanggar Tari', teks:'Belanja aksesoris tari jadi lebih mudah, semua kebutuhan sanggar bisa dipesan dalam satu tempat.'},
    ];
    testiGrid.innerHTML = testimonials.map(t => `
      <div class="testi-card fade-up">
        <div class="testi-head">
          <div class="testi-avatar">${t.nama[0]}</div>
          <div><strong style="font-size:14px;">${t.nama}</strong><div style="font-size:12px;color:var(--clr-text-soft);">${t.peran}</div></div>
        </div>
        <div class="stars">★★★★★</div>
        <p style="font-size:13.5px; color:var(--clr-text-soft); margin-top:8px; line-height:1.7;">"${t.teks}"</p>
      </div>`).join('');
  }
});
