/* =========================================================
   LARAS BUDAYA — Shared Application Entry
   Global widgets initialization & theme handler.
   Requires icons.js, seed-data.js, data.js, and ui.js to be loaded first.
   ========================================================= */

function initCommonWidgets(){
  let btt = document.getElementById('back-to-top');
  if(!btt){
    btt = document.createElement('button');
    btt.id = 'back-to-top'; btt.innerHTML = typeof ICONS !== 'undefined' ? ICONS.up : '↑'; btt.setAttribute('aria-label','Kembali ke atas');
    document.body.appendChild(btt);
  }
  window.addEventListener('scroll', () => btt.classList.toggle('show', window.scrollY > 400));
  btt.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

  const loader = document.getElementById('page-loader');
  if(loader){
    window.addEventListener('load', () => setTimeout(() => loader.classList.add('hide'), 300));
    setTimeout(() => loader.classList.add('hide'), 900);
  }

  // Apply theme immediately
  if(typeof LB !== 'undefined'){
    document.documentElement.setAttribute('data-theme', LB.theme());
  }
}

document.addEventListener('DOMContentLoaded', initCommonWidgets);
