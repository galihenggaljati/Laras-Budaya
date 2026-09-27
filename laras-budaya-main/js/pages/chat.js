/* =========================================================
   LARAS BUDAYA — Customer Chat Page Logic
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('Chat');
  renderFooter();

  const user = LB.currentUser();
  const root = document.getElementById('chat-root');
  if(!root) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('produk');

  if(!user){
    root.innerHTML = loginCtaHTML('Kamu perlu masuk ke akun untuk menghubungi penjual.', 'chat.html');
  } else {
    const chat = LB.chatForUser(user.id, productId);
    const product = chat.productId ? LB.productById(chat.productId) : (productId ? LB.productById(productId) : null);

    root.innerHTML = `
    <div class="chat-layout">
      <div class="chat-list">
        <div class="chat-list-item active" id="chat-item-admin">
          <div class="chat-avatar">LB<span class="online-dot"></span></div>
          <div>
            <b style="font-size:13.5px;">Admin Laras Budaya</b>
            <div style="font-size:12px; color:var(--clr-text-soft); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">${chat.messages.length? chat.messages[chat.messages.length-1].text : 'Mulai percakapan...'}</div>
          </div>
        </div>
      </div>
      <div class="chat-window">
        <div class="chat-window-head">
          <button class="chat-back-mobile" id="chat-back-btn" title="Kembali ke daftar chat">←</button>
          <div class="chat-avatar" style="width:38px;height:38px;">LB<span class="online-dot"></span></div>
          <div>
            <b style="font-size:14px;">Admin Laras Budaya</b>
            <div style="font-size:11.5px; color:var(--clr-success);">● Online</div>
          </div>
          ${product? `<a href="detail.html?id=${product.id}" style="margin-left:auto; font-size:12.5px; display:flex; align-items:center; gap:8px; background:var(--clr-cream); padding:6px 10px; border-radius:10px;"><img src="${product.foto[0]}" style="width:28px;height:28px;border-radius:6px;object-fit:cover;">${product.nama.slice(0,24)}...</a>` : ''}
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input-row">
          <input type="text" id="chat-input" placeholder="Tulis pesan...">
          <button class="btn btn-primary" id="chat-send">Kirim</button>
        </div>
      </div>
    </div>`;

    function renderMessages(){
      const c = LB.chatForUser(user.id);
      const box = document.getElementById('chat-messages');
      if(!box) return;
      box.innerHTML = c.messages.length ? c.messages.map(m => `
        <div class="chat-bubble ${m.from==='user'?'mine':'theirs'}">${m.text}<span class="chat-time">${new Date(m.time).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</span></div>
      `).join('') : `<div style="text-align:center; color:var(--clr-text-soft); font-size:13px; margin:auto;">Mulai percakapan dengan penjual mengenai produk favoritmu.</div>`;
      box.scrollTop = box.scrollHeight;
    }
    renderMessages();

    function send(){
      const input = document.getElementById('chat-input');
      if(!input) return;
      const text = input.value.trim();
      if(!text) return;
      LB.sendMessage(user.id, 'user', text);
      input.value = '';
      renderMessages();
    }

    const sendBtn = document.getElementById('chat-send');
    const inputBtn = document.getElementById('chat-input');
    if(sendBtn) sendBtn.addEventListener('click', send);
    if(inputBtn) inputBtn.addEventListener('keydown', (e) => { if(e.key==='Enter') send(); });

    const chatLayout = document.querySelector('.chat-layout');
    const chatItem = document.getElementById('chat-item-admin');
    const backBtn = document.getElementById('chat-back-btn');
    if(chatItem && chatLayout){
      chatItem.addEventListener('click', () => chatLayout.classList.add('chat-active-mobile'));
    }
    if(backBtn && chatLayout){
      backBtn.addEventListener('click', () => chatLayout.classList.remove('chat-active-mobile'));
    }
    if(window.innerWidth <= 760 && chatLayout && productId){
      chatLayout.classList.add('chat-active-mobile');
    }

    // Live sync
    let lastCount = LB.chatForUser(user.id).messages.length;
    setInterval(() => {
      const current = LB.chatForUser(user.id).messages.length;
      if(current !== lastCount){ lastCount = current; renderMessages(); renderNavbar('Chat'); }
    }, 1500);
    window.addEventListener('storage', (e) => {
      if(e.key === LB.KEYS.chats){ renderMessages(); }
    });
  }
});
