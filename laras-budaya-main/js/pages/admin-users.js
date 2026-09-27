/* =========================================================
   LARAS BUDAYA — Admin Master Data User Page Logic
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  if (!adminGuard()) return;

  renderAdminShell('Master User');

  const topbar = document.getElementById('topbar');
  if (topbar) {
    topbar.innerHTML = adminTopbar('Master Data User', 'Kelola akun customer, status blokir, dan informasi pengguna.');
  }

  let searchQuery = '';
  let statusFilter = 'all';

  function renderApp() {
    const appSlot = document.getElementById('users-app');
    if (!appSlot) return;

    const allUsers = LB.users();
    const allOrders = LB.orders();

    // Calculate stats
    const totalUsers = allUsers.length;
    let activeUsers = 0;
    let blockedUsers = 0;

    allUsers.forEach(u => {
      const lock = LB.getLoginLock(u.email);
      if (u.blocked || lock.isLocked) {
        blockedUsers++;
      } else {
        activeUsers++;
      }
    });

    // Filter users
    const filteredUsers = allUsers.filter(u => {
      const lock = LB.getLoginLock(u.email);
      const isBlocked = !!(u.blocked || lock.isLocked);

      // Status filter
      if (statusFilter === 'active' && isBlocked) return false;
      if (statusFilter === 'blocked' && !isBlocked) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (u.nama || '').toLowerCase().includes(q);
        const matchEmail = (u.email || '').toLowerCase().includes(q);
        const matchWA = (u.whatsapp || '').toLowerCase().includes(q);
        const matchAddr = (u.alamat || '').toLowerCase().includes(q);
        const matchId = (u.id || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchWA && !matchAddr && !matchId) return false;
      }

      return true;
    });

    appSlot.innerHTML = `
      <!-- STATS SUMMARY -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:24px;">
        <div class="card" style="padding:18px; border-left:4px solid var(--clr-gold);">
          <div style="font-size:12.5px; color:var(--clr-text-soft);">Total Customer</div>
          <div style="font-size:24px; font-weight:700; margin-top:4px;">${totalUsers}</div>
        </div>
        <div class="card" style="padding:18px; border-left:4px solid #10b981;">
          <div style="font-size:12.5px; color:var(--clr-text-soft);">Akun Aktif</div>
          <div style="font-size:24px; font-weight:700; color:#10b981; margin-top:4px;">${activeUsers}</div>
        </div>
        <div class="card" style="padding:18px; border-left:4px solid var(--clr-danger);">
          <div style="font-size:12.5px; color:var(--clr-text-soft);">Terblokir / Locked</div>
          <div style="font-size:24px; font-weight:700; color:var(--clr-danger); margin-top:4px;">${blockedUsers}</div>
        </div>
      </div>

      <!-- FILTER & ACTION BAR -->
      <div class="card" style="padding:16px; margin-bottom:20px; display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between;">
        <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center; flex:1; min-width:280px;">
          <div style="position:relative; flex:1; min-width:200px;">
            <input type="text" id="user-search" placeholder="Cari nama, email, WA, atau alamat..." value="${escapeHtml(searchQuery)}" style="width:100%; padding:9px 12px 9px 34px; border-radius:6px; border:1px solid var(--clr-border); font-size:13.5px;">
            <span style="position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--clr-text-soft); pointer-events:none;">${ICONS.search}</span>
          </div>
          <select id="user-status-filter" style="padding:9px 12px; border-radius:6px; border:1px solid var(--clr-border); font-size:13.5px; background:var(--clr-card);">
            <option value="all" ${statusFilter==='all'?'selected':''}>Semua Status</option>
            <option value="active" ${statusFilter==='active'?'selected':''}>Aktif</option>
            <option value="blocked" ${statusFilter==='blocked'?'selected':''}>Terblokir</option>
          </select>
        </div>
        <button class="btn btn-primary" id="btn-add-user" style="display:flex; align-items:center; gap:6px;">${ICONS.plus} Tambah User Baru</button>
      </div>

      <!-- USER DATA TABLE -->
      <div class="card" style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:13.5px; text-align:left;">
          <thead>
            <tr style="border-bottom:1px solid var(--clr-border); color:var(--clr-text-soft); font-size:12.5px;">
              <th style="padding:12px 16px;">Pengguna</th>
              <th style="padding:12px 16px;">Kontak</th>
              <th style="padding:12px 16px;">Alamat</th>
              <th style="padding:12px 16px;">Pesanan</th>
              <th style="padding:12px 16px;">Status</th>
              <th style="padding:12px 16px; text-align:right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${filteredUsers.length === 0 ? `
              <tr>
                <td colspan="6" style="padding:32px; text-align:center; color:var(--clr-text-soft);">Tidak ada data user yang sesuai.</td>
              </tr>
            ` : filteredUsers.map(u => {
              const lock = LB.getLoginLock(u.email);
              const isLockedByFailed = lock.isLocked;
              const isBlockedByAdmin = !!u.blocked;
              const isBlocked = isBlockedByAdmin || isLockedByFailed;

              const userOrders = allOrders.filter(o => o.userId === u.id || o.customer?.email === u.email);
              const totalSpend = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);

              const initial = (u.nama || 'U').charAt(0).toUpperCase();

              let statusBadge = `<span class="badge" style="background:#ecfdf5; color:#047857; font-weight:600; padding:4px 10px; border-radius:12px; font-size:12px;">Aktif</span>`;
              if (isBlockedByAdmin) {
                statusBadge = `<span class="badge" style="background:#fef2f2; color:#b91c1c; font-weight:600; padding:4px 10px; border-radius:12px; font-size:12px;">Diblokir Admin</span>`;
              } else if (isLockedByFailed) {
                const remSec = Math.ceil((lock.lockUntil - Date.now()) / 1000);
                const mins = Math.floor(remSec / 60);
                const secs = remSec % 60;
                const timeText = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                statusBadge = `<span class="badge" style="background:#fffbeb; color:#b45309; font-weight:600; padding:4px 10px; border-radius:12px; font-size:12px;" title="Terkunci 3x salah login (${timeText})">Locked (3x Salah)</span>`;
              }

              return `
                <tr style="border-bottom:1px solid var(--clr-border);">
                  <td style="padding:14px 16px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                      <div style="width:36px; height:36px; border-radius:50%; background:var(--clr-gold); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:14px; flex-shrink:0;">
                        ${initial}
                      </div>
                      <div>
                        <div style="font-weight:600;">${escapeHtml(u.nama || '-')}</div>
                        <div style="font-size:11.5px; color:var(--clr-text-soft);">ID: ${u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style="padding:14px 16px;">
                    <div style="font-weight:500;">${escapeHtml(u.email || '-')}</div>
                    <div style="font-size:12px; color:var(--clr-text-soft);">${escapeHtml(u.whatsapp || '-')}</div>
                  </td>
                  <td style="padding:14px 16px; max-width:220px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(u.alamat || '-')}">
                    ${escapeHtml(u.alamat || '-')}
                  </td>
                  <td style="padding:14px 16px;">
                    <div style="font-weight:600;">${userOrders.length} Pesanan</div>
                    <div style="font-size:12px; color:var(--clr-brown);">${LB.rupiah(totalSpend)}</div>
                  </td>
                  <td style="padding:14px 16px;">
                    ${statusBadge}
                  </td>
                  <td style="padding:14px 16px; text-align:right;">
                    <div style="display:flex; gap:6px; justify-content:flex-end; flex-wrap:wrap;">
                      <button class="btn btn-sm btn-outline btn-detail-user" data-id="${u.id}" title="Lihat Detail">${ICONS.search}</button>
                      <button class="btn btn-sm btn-outline btn-edit-user" data-id="${u.id}" title="Edit User">${ICONS.edit}</button>
                      ${isBlocked ? `
                        <button class="btn btn-sm btn-unblock-user" data-id="${u.id}" data-email="${u.email}" style="background:#10b981; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:12px;" title="Buka Blokir / Reset Password Failure">Buka Blokir</button>
                      ` : `
                        <button class="btn btn-sm btn-block-user" data-id="${u.id}" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:12px;" title="Blokir User">Blokir</button>
                      `}
                      <button class="btn btn-sm btn-delete-user" data-id="${u.id}" style="color:var(--clr-danger); border-color:var(--clr-danger);" title="Hapus User">${ICONS.trash}</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Event Listeners
    document.getElementById('user-search').addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderApp();
    });

    document.getElementById('user-status-filter').addEventListener('change', (e) => {
      statusFilter = e.target.value;
      renderApp();
    });

    document.getElementById('btn-add-user').addEventListener('click', () => openUserModal());

    document.querySelectorAll('.btn-detail-user').forEach(btn => {
      btn.addEventListener('click', () => openDetailModal(btn.dataset.id));
    });

    document.querySelectorAll('.btn-edit-user').forEach(btn => {
      btn.addEventListener('click', () => {
        const u = LB.userById(btn.dataset.id);
        if (u) openUserModal(u);
      });
    });

    document.querySelectorAll('.btn-block-user').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const u = LB.userById(id);
        if (confirm(`Apakah Anda yakin ingin memblokir user ${u ? u.nama : id}?`)) {
          LB.blockUser(id);
          toast('User berhasil diblokir.', 'success');
          renderApp();
        }
      });
    });

    document.querySelectorAll('.btn-unblock-user').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const email = btn.dataset.email;
        LB.unblockUser(id);
        if (email) LB.clearLoginAttempts(email);
        toast('Blokir user / percobaan salah login berhasil dibuka!', 'success');
        renderApp();
      });
    });

    document.querySelectorAll('.btn-delete-user').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const u = LB.userById(id);
        if (confirm(`Hapus user "${u ? u.nama : id}" secara permanen?`)) {
          LB.deleteUser(id);
          toast('User berhasil dihapus.', 'success');
          renderApp();
        }
      });
    });
  }

  // Open User Add / Edit Modal
  function openUserModal(userObj = null) {
    const isEdit = !!userObj;
    const modalBox = document.getElementById('modal-box');
    const modalOverlay = document.getElementById('modal');
    if (!modalBox || !modalOverlay) return;

    modalBox.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; border-bottom:1px solid var(--clr-border); padding-bottom:12px;">
        <h3 style="margin:0; font-size:18px;">${isEdit ? 'Edit Data Customer' : 'Tambah Customer Baru'}</h3>
        <button id="close-user-modal" style="background:none; border:none; font-size:20px; cursor:pointer; color:var(--clr-text-soft);">&times;</button>
      </div>
      <form id="modal-user-form" novalidate>
        <div class="field">
          <label>Nama Lengkap</label>
          <input type="text" name="nama" value="${escapeHtml(userObj ? userObj.nama : '')}" placeholder="Nama Lengkap" required>
          <div class="error-msg"></div>
        </div>
        <div class="field">
          <label>Email</label>
          <input type="email" name="email" value="${escapeHtml(userObj ? userObj.email : '')}" placeholder="email@contoh.com" required ${isEdit ? 'readonly style="background:var(--clr-bg-soft);"' : ''}>
          <div class="error-msg"></div>
        </div>
        <div class="field">
          <label>Nomor WhatsApp</label>
          <input type="text" name="whatsapp" value="${escapeHtml(userObj ? userObj.whatsapp : '')}" placeholder="081234567890" required>
          <div class="error-msg"></div>
        </div>
        <div class="field">
          <label>Alamat</label>
          <textarea name="alamat" rows="2" placeholder="Alamat lengkap" required>${escapeHtml(userObj ? userObj.alamat : '')}</textarea>
          <div class="error-msg"></div>
        </div>
        <div class="field">
          <label>Password ${isEdit ? '<span style="font-weight:400; font-size:12px; color:var(--clr-text-soft);">(kosongkan jika tidak diubah)</span>' : ''}</label>
          <input type="password" name="password" placeholder="${isEdit ? '••••••••' : 'Password'}" ${isEdit ? '' : 'required'}>
          <div class="error-msg"></div>
        </div>
        <div class="field">
          <label>Status Akun</label>
          <select name="status" style="width:100%; padding:9px 12px; border-radius:6px; border:1px solid var(--clr-border); background:var(--clr-card);">
            <option value="active" ${userObj && !userObj.blocked ? 'selected' : ''}>Aktif (Bisa Login)</option>
            <option value="blocked" ${userObj && userObj.blocked ? 'selected' : ''}>Terblokir (Tidak Bisa Login)</option>
          </select>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:22px;">
          <button type="button" class="btn btn-outline" id="btn-cancel-user-modal">Batal</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Simpan Perubahan' : 'Tambah Customer'}</button>
        </div>
      </form>
    `;

    modalOverlay.style.display = 'flex';

    const form = document.getElementById('modal-user-form');
    const closeBtn = document.getElementById('close-user-modal');
    const cancelBtn = document.getElementById('btn-cancel-user-modal');

    function closeModal() {
      modalOverlay.style.display = 'none';
      modalBox.innerHTML = '';
    }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const f = e.target;
      const namaVal = f.nama.value.trim();
      const emailVal = f.email.value.trim();
      const waVal = f.whatsapp.value.trim();
      const alamatVal = f.alamat.value.trim();
      const passVal = f.password.value;
      const statusVal = f.status.value;

      // Helper inline validation inside modal
      function setErr(el, msg) {
        const field = el.closest('.field');
        if (field) {
          field.classList.add('invalid');
          const errDiv = field.querySelector('.error-msg');
          if (errDiv) errDiv.textContent = msg;
        }
      }

      function clearErr(el) {
        const field = el.closest('.field');
        if (field) {
          field.classList.remove('invalid');
          const errDiv = field.querySelector('.error-msg');
          if (errDiv) errDiv.textContent = '';
        }
      }

      clearErr(f.nama);
      clearErr(f.email);
      clearErr(f.whatsapp);
      clearErr(f.alamat);
      clearErr(f.password);

      if (!namaVal || namaVal.length < 3) {
        setErr(f.nama, 'Nama lengkap minimal 3 karakter.');
        isValid = false;
      }
      if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        setErr(f.email, 'Format email tidak valid.');
        isValid = false;
      }
      if (!isEdit) {
        if (LB.users().some(u => u.email.toLowerCase() === emailVal.toLowerCase())) {
          setErr(f.email, 'Email ini sudah terdaftar.');
          isValid = false;
        }
      }
      const digits = waVal.replace(/[^0-9]/g, '');
      if (!waVal || digits.length < 10 || digits.length > 15) {
        setErr(f.whatsapp, 'Nomor WA harus 10-15 digit angka.');
        isValid = false;
      }
      if (!alamatVal || alamatVal.length < 8) {
        setErr(f.alamat, 'Alamat minimal 8 karakter.');
        isValid = false;
      }
      if (!isEdit && (!passVal || passVal.length < 6)) {
        setErr(f.password, 'Password minimal 6 karakter.');
        isValid = false;
      } else if (isEdit && passVal && passVal.length < 6) {
        setErr(f.password, 'Password minimal 6 karakter.');
        isValid = false;
      }

      if (!isValid) return;

      if (isEdit) {
        const patch = {
          nama: namaVal,
          whatsapp: waVal,
          alamat: alamatVal,
          blocked: statusVal === 'blocked'
        };
        if (passVal) patch.password = passVal;
        LB.updateUser(userObj.id, patch);
        if (statusVal === 'active') {
          LB.clearLoginAttempts(emailVal);
        }
        toast('Data customer berhasil diperbarui.', 'success');
      } else {
        LB.register({
          nama: namaVal,
          email: emailVal,
          whatsapp: waVal,
          alamat: alamatVal,
          password: passVal,
          foto: '',
          blocked: statusVal === 'blocked'
        });
        toast('Customer baru berhasil ditambahkan.', 'success');
      }

      closeModal();
      renderApp();
    });
  }

  // Open Detail User Modal
  function openDetailModal(userId) {
    const u = LB.userById(userId);
    if (!u) return;

    const modalBox = document.getElementById('modal-box');
    const modalOverlay = document.getElementById('modal');
    if (!modalBox || !modalOverlay) return;

    const lock = LB.getLoginLock(u.email);
    const userOrders = LB.orders().filter(o => o.userId === u.id || o.customer?.email === u.email);
    const totalSpend = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    modalBox.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; border-bottom:1px solid var(--clr-border); padding-bottom:12px;">
        <h3 style="margin:0; font-size:18px;">Detail Customer</h3>
        <button id="close-user-detail" style="background:none; border:none; font-size:20px; cursor:pointer; color:var(--clr-text-soft);">&times;</button>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
        <div style="background:var(--clr-bg-soft); padding:14px; border-radius:8px;">
          <div style="font-size:12px; color:var(--clr-text-soft);">Nama Lengkap</div>
          <div style="font-weight:600; font-size:15px; margin-top:2px;">${escapeHtml(u.nama)}</div>
          <div style="font-size:12px; color:var(--clr-text-soft); margin-top:10px;">Email</div>
          <div style="font-weight:500;">${escapeHtml(u.email)}</div>
          <div style="font-size:12px; color:var(--clr-text-soft); margin-top:10px;">WhatsApp</div>
          <div style="font-weight:500;">${escapeHtml(u.whatsapp)}</div>
        </div>
        <div style="background:var(--clr-bg-soft); padding:14px; border-radius:8px;">
          <div style="font-size:12px; color:var(--clr-text-soft);">ID Pengguna</div>
          <div style="font-weight:600; font-size:13px; font-family:monospace; margin-top:2px;">${u.id}</div>
          <div style="font-size:12px; color:var(--clr-text-soft); margin-top:10px;">Status Akun</div>
          <div style="margin-top:4px;">
            ${u.blocked ? '<span style="color:var(--clr-danger); font-weight:600;">Terblokir oleh Admin</span>' : lock.isLocked ? '<span style="color:#b45309; font-weight:600;">Locked (3x Salah Login)</span>' : '<span style="color:#10b981; font-weight:600;">Aktif Normal</span>'}
          </div>
          <div style="font-size:12px; color:var(--clr-text-soft); margin-top:10px;">Total Transaksi</div>
          <div style="font-weight:700; color:var(--clr-brown);">${userOrders.length} Pesanan (${LB.rupiah(totalSpend)})</div>
        </div>
      </div>

      <div style="margin-bottom:16px;">
        <div style="font-size:12.5px; font-weight:600; color:var(--clr-text-soft); margin-bottom:4px;">Alamat Pengiriman:</div>
        <div style="background:var(--clr-bg-soft); padding:10px 14px; border-radius:6px; font-size:13px;">${escapeHtml(u.alamat)}</div>
      </div>

      <div style="margin-bottom:20px;">
        <div style="font-size:13px; font-weight:600; margin-bottom:8px;">Riwayat Pesanan Terbaru:</div>
        ${userOrders.length === 0 ? `
          <div style="font-size:12.5px; color:var(--clr-text-soft); font-style:italic;">Belum ada riwayat pesanan.</div>
        ` : `
          <div style="max-height:160px; overflow-y:auto; border:1px solid var(--clr-border); border-radius:6px;">
            <table style="width:100%; border-collapse:collapse; font-size:12.5px;">
              <thead>
                <tr style="background:var(--clr-bg-soft); border-bottom:1px solid var(--clr-border);">
                  <th style="padding:8px 12px; text-align:left;">Invoice</th>
                  <th style="padding:8px 12px; text-align:left;">Status</th>
                  <th style="padding:8px 12px; text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${userOrders.map(o => `
                  <tr style="border-bottom:1px solid var(--clr-border);">
                    <td style="padding:8px 12px; font-family:monospace;">${o.invoiceNo}</td>
                    <td style="padding:8px 12px;"><span class="badge" style="font-size:11px;">${o.status}</span></td>
                    <td style="padding:8px 12px; text-align:right; font-weight:600;">${LB.rupiah(o.total || 0)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <div style="display:flex; justify-content:flex-end;">
        <button class="btn btn-outline" id="btn-close-detail">Tutup</button>
      </div>
    `;

    modalOverlay.style.display = 'flex';
    document.getElementById('close-user-detail').addEventListener('click', () => { modalOverlay.style.display = 'none'; });
    document.getElementById('btn-close-detail').addEventListener('click', () => { modalOverlay.style.display = 'none'; });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial Render
  renderApp();
});
