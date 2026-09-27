/* =========================================================
   LARAS BUDAYA — Admin Dashboard Page Logic
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  if(!adminGuard()) return;

  renderAdminShell('Dashboard');
  const topbar = document.getElementById('topbar');
  if(topbar) topbar.innerHTML = adminTopbar('Dashboard', 'Ringkasan performa toko Laras Budaya hari ini.');

  const orders = LB.orders();
  const products = LB.products();
  const users = LB.get(LB.KEYS.users, []);
  const chats = LB.chats();
  const reviews = LB.reviews();
  const vouchers = LB.vouchers();

  const revenue = orders.filter(o => o.status !== 'Dibatalkan').reduce((s,o)=>s+o.total,0);
  const unreadChats = chats.reduce((s,c)=> s + c.messages.filter(m=>m.from==='user' && !m.read).length, 0);

  const stats = [
    ['Total Produk', products.length, ICONS.boxStack],
    ['Total Customer', users.length, ICONS.users],
    ['Total Pesanan', orders.length, ICONS.package],
    ['Pendapatan', LB.rupiah(revenue), ICONS.wallet],
    ['Chat Baru', unreadChats, ICONS.chat],
    ['Review Baru', reviews.length, ICONS.star],
    ['Voucher Aktif', vouchers.filter(v=>v.active).length, ICONS.tag],
  ];

  const statGrid = document.getElementById('stat-grid');
  if(statGrid){
    statGrid.innerHTML = stats.map(([lbl,val,icn]) => `
      <div class="stat-card"><div class="lbl" style="display:flex; align-items:center; gap:6px;">${icn} ${lbl}</div><div class="val">${val}</div></div>`).join('');
  }

  // sales chart - last 7 days
  const days = [...Array(7)].map((_,i) => { const d = new Date(); d.setDate(d.getDate()-(6-i)); return d; });
  const dailyTotals = days.map(d => {
    const key = d.toDateString();
    return orders.filter(o => o.status!=='Dibatalkan' && new Date(o.createdAt).toDateString()===key).reduce((s,o)=>s+o.total,0);
  });
  const maxTotal = Math.max(...dailyTotals, 1);
  const salesChart = document.getElementById('sales-chart');
  if(salesChart){
    salesChart.innerHTML = days.map((d,i) => `
      <div class="bar-col">
        <div class="bar" style="height:${Math.max(4, dailyTotals[i]/maxTotal*150)}px;" title="${LB.rupiah(dailyTotals[i])}"></div>
        <div class="bar-lbl">${d.toLocaleDateString('id-ID',{weekday:'short'})}</div>
      </div>`).join('');
  }

  const top = [...products].sort((a,b)=>b.terjual-a.terjual).slice(0,5);
  const topProd = document.getElementById('top-products');
  if(topProd){
    topProd.innerHTML = top.map(p => `
      <div style="display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid var(--clr-border);">
        <img src="${p.foto[0]}" class="table-thumb">
        <div style="flex:1;">
          <div style="font-size:13px; font-weight:600;">${p.nama}</div>
          <div class="progress-bar" style="margin-top:4px;"><span style="width:${top[0].terjual?Math.round(p.terjual/top[0].terjual*100):0}%"></span></div>
        </div>
        <b style="font-size:12.5px;">${p.terjual}</b>
      </div>`).join('');
  }

  const log = LB.activity();
  const actLog = document.getElementById('activity-log');
  if(actLog){
    actLog.innerHTML = log.length ? log.slice(0,15).map(a => `
      <div class="activity-log-item"><div class="dot"></div><div>${a.text}<div style="font-size:11px; color:var(--clr-text-soft);">${timeAgo(a.time)}</div></div></div>`).join('') : '<p style="font-size:13px;color:var(--clr-text-soft);">Belum ada aktivitas.</p>';
  }
});
