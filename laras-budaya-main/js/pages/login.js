/* =========================================================
   LARAS BUDAYA — Unified Login & Registration Page Logic
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  if (LB.isAdminLoggedIn()) {
    window.location.href = 'admin-dashboard.html';
    return;
  }
  if (LB.isLoggedIn()) {
    window.location.href = 'profile.html';
    return;
  }

  // Auth Tabs (Masuk vs Daftar Akun)
  const authTabBtns = document.querySelectorAll('#auth-tabs .tab-btn');
  authTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      authTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const subL = document.getElementById('sub-login');
      const subR = document.getElementById('sub-register');
      const isLogin = btn.dataset.sub === 'login';
      if (subL) subL.style.display = isLogin ? 'block' : 'none';
      if (subR) subR.style.display = isLogin ? 'none' : 'block';
    });
  });

  function goAfterLogin(fallback) {
    const redirect = localStorage.getItem('lb_redirect_after_login');
    localStorage.removeItem('lb_redirect_after_login');
    window.location.href = redirect || fallback;
  }

  // Field validation helpers
  function setFieldError(inputEl, message) {
    if (!inputEl) return;
    const fieldDiv = inputEl.closest('.field');
    if (!fieldDiv) return;
    let errDiv = fieldDiv.querySelector('.error-msg');
    if (!errDiv) {
      errDiv = document.createElement('div');
      errDiv.className = 'error-msg';
      fieldDiv.appendChild(errDiv);
    }
    errDiv.textContent = message;
    fieldDiv.classList.add('invalid');
  }

  function clearFieldError(inputEl) {
    if (!inputEl) return;
    const fieldDiv = inputEl.closest('.field');
    if (!fieldDiv) return;
    fieldDiv.classList.remove('invalid');
    const errDiv = fieldDiv.querySelector('.error-msg');
    if (errDiv) errDiv.textContent = '';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Real-time clearing of error states when user types
  document.querySelectorAll('#login-form input, #register-form input, #register-form textarea').forEach(input => {
    input.addEventListener('input', () => clearFieldError(input));
  });

  // Login Form Submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const emailInput = loginForm.email;
      const passInput = loginForm.password;

      const emailVal = emailInput.value.trim();
      const passVal = passInput.value;

      clearFieldError(emailInput);
      clearFieldError(passInput);

      // Validate Email
      if (!emailVal) {
        setFieldError(emailInput, 'Email tidak boleh kosong.');
        isValid = false;
      } else if (!isValidEmail(emailVal) && emailVal.toLowerCase() !== 'admin') {
        setFieldError(emailInput, 'Format email tidak valid (contoh: user@example.com).');
        isValid = false;
      }

      // Validate Password
      if (!passVal) {
        setFieldError(passInput, 'Password tidak boleh kosong.');
        isValid = false;
      } else if (passVal.length < 6) {
        setFieldError(passInput, 'Password minimal 6 karakter.');
        isValid = false;
      }

      if (!isValid) {
        toast('Mohon periksa kembali formulir login.', 'error');
        return;
      }

      // Check if email is locked due to 3 failed attempts
      const lockInfo = LB.getLoginLock(emailVal);
      if (lockInfo.isLocked) {
        const remainingSec = Math.ceil((lockInfo.lockUntil - Date.now()) / 1000);
        const mins = Math.floor(remainingSec / 60);
        const secs = remainingSec % 60;
        const timeText = mins > 0 ? `${mins} menit ${secs} detik` : `${secs} detik`;

        const lockMsg = `Akun/Email ini diblokir sementara selama 3 menit karena 3x salah login. Sisa waktu: ${timeText}.`;
        setFieldError(emailInput, lockMsg);
        toast(`Login diblokir sementara. Coba lagi dalam ${timeText}.`, 'error');
        return;
      }

      // 1. Check if Admin credentials match
      if (LB.adminLogin(emailVal, passVal)) {
        LB.clearLoginAttempts(emailVal);
        toast('Berhasil masuk sebagai Admin', 'success');
        setTimeout(() => {
          const redirect = localStorage.getItem('lb_redirect_after_login');
          localStorage.removeItem('lb_redirect_after_login');
          if (redirect && redirect.startsWith('admin-')) {
            window.location.href = redirect;
          } else {
            window.location.href = 'admin-dashboard.html';
          }
        }, 350);
        return;
      }

      // 2. Check Customer credentials
      const res = LB.login(emailVal, passVal);
      if (res && res.error === 'blocked_by_admin') {
        const msg = 'Akun Anda telah diblokir oleh Admin Toko. Silakan hubungi Support.';
        setFieldError(emailInput, msg);
        toast(msg, 'error');
        return;
      }

      if (res && res.user) {
        toast('Berhasil masuk, selamat datang ' + res.user.nama, 'success');
        setTimeout(() => goAfterLogin('profile.html'), 350);
      } else {
        // Record failed attempt
        const fail = LB.recordFailedLogin(emailVal);
        if (fail.isLocked) {
          const lockMsg = 'Anda telah 3x salah memasukkan password. Akun diblokir sementara selama 3 menit.';
          setFieldError(emailInput, lockMsg);
          setFieldError(passInput, lockMsg);
          toast('Akun diblokir sementara selama 3 menit karena 3x salah login.', 'error');
        } else {
          const remMsg = `Email atau password salah. (Percobaan ke-${fail.attempts} dari 3. Sisa: ${fail.remainingAttempts}x)`;
          setFieldError(emailInput, remMsg);
          setFieldError(passInput, remMsg);
          toast(`Email atau password salah. Sisa percobaan: ${fail.remainingAttempts}x`, 'error');
        }
      }
    });
  }

  // Register Form Submission
  const regForm = document.getElementById('register-form');
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const namaInput = regForm.nama;
      const emailInput = regForm.email;
      const waInput = regForm.whatsapp;
      const alamatInput = regForm.alamat;
      const passInput = regForm.password;

      const namaVal = namaInput.value.trim();
      const emailVal = emailInput.value.trim();
      const waVal = waInput.value.trim();
      const alamatVal = alamatInput.value.trim();
      const passVal = passInput.value;

      clearFieldError(namaInput);
      clearFieldError(emailInput);
      clearFieldError(waInput);
      clearFieldError(alamatInput);
      clearFieldError(passInput);

      // Validate Nama
      if (!namaVal) {
        setFieldError(namaInput, 'Nama lengkap tidak boleh kosong.');
        isValid = false;
      } else if (namaVal.length < 3) {
        setFieldError(namaInput, 'Nama lengkap minimal 3 karakter.');
        isValid = false;
      } else if (!/^[a-zA-Z\s'.]+$/.test(namaVal)) {
        setFieldError(namaInput, 'Nama lengkap hanya boleh berisi huruf dan spasi.');
        isValid = false;
      }

      // Validate Email
      if (!emailVal) {
        setFieldError(emailInput, 'Email tidak boleh kosong.');
        isValid = false;
      } else if (!isValidEmail(emailVal)) {
        setFieldError(emailInput, 'Format email tidak valid (contoh: user@example.com).');
        isValid = false;
      } else {
        // Check existing email
        const users = LB.get(LB.KEYS.users, []);
        if (users.some(u => u.email.toLowerCase() === emailVal.toLowerCase())) {
          setFieldError(emailInput, 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.');
          isValid = false;
        }
      }

      // Validate WhatsApp
      const waDigits = waVal.replace(/[^0-9]/g, '');
      if (!waVal) {
        setFieldError(waInput, 'Nomor WhatsApp tidak boleh kosong.');
        isValid = false;
      } else if (waDigits.length < 10 || waDigits.length > 15) {
        setFieldError(waInput, 'Nomor WhatsApp harus berupa angka 10-15 digit.');
        isValid = false;
      }

      // Validate Alamat
      if (!alamatVal) {
        setFieldError(alamatInput, 'Alamat tidak boleh kosong.');
        isValid = false;
      } else if (alamatVal.length < 8) {
        setFieldError(alamatInput, 'Alamat minimal 8 karakter agar lengkap.');
        isValid = false;
      }

      // Validate Password
      if (!passVal) {
        setFieldError(passInput, 'Password tidak boleh kosong.');
        isValid = false;
      } else if (passVal.length < 6) {
        setFieldError(passInput, 'Password minimal 6 karakter.');
        isValid = false;
      }

      if (!isValid) {
        toast('Mohon perbaiki kesalahan pada formulir pendaftaran.', 'error');
        return;
      }

      // Execute Registration
      const res = LB.register({
        nama: namaVal,
        email: emailVal,
        whatsapp: waVal,
        alamat: alamatVal,
        password: passVal,
        foto: ''
      });

      if (res.error) {
        setFieldError(emailInput, res.error);
        toast(res.error, 'error');
      } else {
        toast('Akun berhasil dibuat! Selamat datang.', 'success');
        setTimeout(() => goAfterLogin('profile.html'), 350);
      }
    });
  }
});
