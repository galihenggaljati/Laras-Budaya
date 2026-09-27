/* =========================================================
   LARAS BUDAYA — Admin Chat Management Page Logic
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  if(!adminGuard()) return;

  renderAdminShell('Chat');
  const topbar = document.getElementById('topbar');
  if(topbar) topbar.innerHTML = adminTopbar('Kelola Chat', 'Balas pesan customer secara langsung, seperti WhatsApp.');

  let activeUserId = null;

  function renderList(){
    const chats = LB.chats();
    const list = document.getElementById('chat-list');
    if(!list) return;
    list.innerHTML = chats.length ? chats.map(c => {
      const user = LB.get(LB.KEYS.users, []).find(u=>u.id===c.userId);
      const unread = c.messages.filter(m=>m.from==='user' && !m.read).length;
      const last = c.messages[c.messages.length-1];
      if(!activeUserId) activeUserId = c.userId;
      return `<div class="chat-list-item ${activeUserId===c.userId?'active':''}" data-user="${c.userId}">
        <div class="chat-avatar">${user?.nama?.[0]||'?'}<span class="online-dot"></span></div>
        <div style="flex:1; min-width:0;">
          <div style="display:flex; justify-content:space-between;"><b style="font-size:13.5px;">${user?.nama||'Customer'}</b>${unread?`<span class="badge badge-promo" style="padding:2px 7px;">${unread}</span>`:''}</div>
          <div style="font-size:12px; color:var(--clr-text-soft); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${last?last.text:'Belum ada pesan'}</div>
        </div>
      </div>`;
    }).join('') : `<div style="padding:20px; font-size:13px; color:var(--clr-text-soft);">Belum ada chat dari customer.</div>`;

    document.querySelectorAll('[data-user]').forEach(el => el.addEventListener('click', () => {
      activeUserId = el.dataset.user; renderList(); renderWindow();
    }));
  }

  function renderWindow(){
    const win = document.getElementById('chat-window');
    if(!win) return;
    if(!activeUserId){ win.innerHTML = `<div class="empty-state" style="margin:auto;"><p>Pilih customer untuk mulai membalas.</p></div>`; return; }
    const chat = LB.chats().find(c=>c.userId===activeUserId);
    if(!chat){ win.innerHTML = `<div class="empty-state" style="margin:auto;"><p>Pilih customer untuk mulai membalas.</p></div>`; return; }
    const user = LB.get(LB.KEYS.users, []).find(u=>u.id===activeUserId);
    // mark as read
    chat.messages.forEach(m => { if(m.from==='user') m.read = true; });
    LB.saveChats(LB.chats().map(c => c.userId===activeUserId ? chat : c));

    win.innerHTML = `
    <div class="chat-window-head"><div class="chat-avatar" style="width:38px;height:38px;">${user?.nama?.[0]||'?'}</div><b>${user?.nama||'Customer'}</b></div>
    <div class="chat-messages" id="msgs"></div>
    <div class="chat-input-row"><input type="text" id="admin-chat-input" placeholder="Balas pesan..."><button class="btn btn-primary" id="admin-chat-send">Kirim</button></div>`;

    const box = document.getElementById('msgs');
    if(box){
      box.innerHTML = chat.messages.map(m => `<div class="chat-bubble ${m.from==='admin'?'mine':'theirs'}">${m.text}<span class="chat-time">${new Date(m.time).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</span></div>`).join('');
      box.scrollTop = box.scrollHeight;
    }

    function send(){
      const input = document.getElementById('admin-chat-input');
      if(!input) return;
      const text = input.value.trim(); if(!text) return;
      LB.sendMessage(activeUserId, 'admin', text);
      input.value = ''; renderWindow(); renderList();
    }

    const sendBtn = document.getElementById('admin-chat-send');
    const inputBtn = document.getElementById('admin-chat-input');
    if(sendBtn) sendBtn.addEventListener('click', send);
    if(inputBtn) inputBtn.addEventListener('keydown', (e) => { if(e.key==='Enter') send(); });
  }

  renderList();
  renderWindow();

  // Live sync
  let lastSnapshot = JSON.stringify(LB.chats().map(c => ({u:c.userId, n:c.messages.length})));
  setInterval(() => {
    const snap = JSON.stringify(LB.chats().map(c => ({u:c.userId, n:c.messages.length})));
    if(snap !== lastSnapshot){
      lastSnapshot = snap;
      renderList();
      if(document.activeElement?.id !== 'admin-chat-input') renderWindow();
    }
  }, 1500);
  window.addEventListener('storage', (e) => { if(e.key === LB.KEYS.chats){ renderList(); renderWindow(); } });
});
