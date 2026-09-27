/* =========================================================
   LARAS BUDAYA — Admin Shared UI
   Sidebar, auth guard, small admin-only helpers.
   ========================================================= */

function adminGuard(){
  if(!LB.isAdminLoggedIn()){
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function renderAdminShell(active){
  const slot = document.getElementById('admin-shell-slot');
  if(!slot) return;
  const menu = [
    ['admin-dashboard.html',ICONS.chart,'Dashboard'],
    ['admin-produk.html',ICONS.boxStack,'Produk & Stok'],
    ['admin-pesanan.html',ICONS.package,'Pesanan'],
    ['admin-users.html',ICONS.users,'Master User'],
    ['admin-chat.html',ICONS.chat,'Chat'],
    ['admin-review.html',ICONS.star,'Review'],
    ['admin-promo.html',ICONS.megaphone,'Promo & Banner'],
  ];
  slot.innerHTML = `
  <div class="admin-sidebar">
    <div class="brand"><span class="mark" style="width:30px;height:30px;font-size:12px;">LB</span> Laras Admin</div>
    ${menu.map(([href,icn,label]) => `<a href="${href}" class="${active===label?'active':''}">${icn} ${label}</a>`).join('')}
    <a href="#" id="admin-logout-link">${ICONS.logout} Logout</a>
  </div>`;
  document.getElementById('admin-logout-link').addEventListener('click', (e) => {
    e.preventDefault();
    LB.adminLogout();
    window.location.href = 'login.html';
  });
}

function adminTopbar(title, subtitle){
  setTimeout(() => {
    const btn = document.getElementById('dark-toggle-btn');
    if(btn) {
      btn.addEventListener('click', () => {
        const next = LB.theme() === 'dark' ? 'light' : 'dark';
        LB.setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        btn.innerHTML = next === 'dark' ? ICONS.sun : ICONS.moon;
      });
    }
  }, 10);

  return `<div class="admin-topbar" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--clr-border); padding-bottom:14px; margin-bottom:20px;">
    <div><h1 class="section-title" style="font-size:26px; margin:0; line-height:1.2;">${title}</h1>${subtitle?`<p style="color:var(--clr-text-soft); font-size:13.5px; margin-top:4px;">${subtitle}</p>`:''}</div>
    <button class="nav-icon-btn" id="dark-toggle-btn" title="Mode gelap" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--clr-border); display: flex; align-items: center; justify-content: center; cursor:pointer;">${LB.theme() === 'dark' ? ICONS.sun : ICONS.moon}</button>
  </div>`;
}
