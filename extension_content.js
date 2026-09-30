// =========================================================================
// CHROME EXTENSION CONTENT SCRIPT - ARTEMIS AUTO PROCESSOR
// Mendukung Mode STAFPART (Standar) & HODS (Auto-Login Max 5x + Auto SKM)
// =========================================================================

const SUPABASE_URL = "https://piqtjrmkvrdnfzimwvyk.supabase.co";
const SUPABASE_KEY = "sb_publishable_JUbW6i8EybZSAouF94vRaA_K0dIrkZe";
const TABLE_NAME = "transaksi_part";

// Flag pencegah eksekusi ganda bersamaan
let isProcessingQueue = false;

// Inisialisasi Watcher / Listener Antrian Supabase
(function initExtensionWatcher() {
  console.log("🚀 [ARTEMIS EXTENSION] Engine Aktif & Memulai Monitoring Antrian Supabase...");
  // Polling antrian pending setiap 3 detik
  setInterval(checkPendingQueue, 3000);
})();

let globalTransferProcessMode = 'STAFPART';

async function fetchAppSettingsFromSupabase() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/app_settings?setting_key=eq.transfer_process_mode`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0 && data[0].setting_value) {
        globalTransferProcessMode = data[0].setting_value.trim().toUpperCase();
      }
    }
  } catch (e) {}
}

// =========================================================================
// 1. PENGECEKAN ANTRIAN PENDING DARI SUPABASE
// =========================================================================
async function checkPendingQueue() {
  if (isProcessingQueue) return;

  try {
    await fetchAppSettingsFromSupabase();

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?status=eq.pending&order=created_at.asc&limit=1`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const data = await response.json();
    if (data && data.length > 0) {
      isProcessingQueue = true;
      const record = data[0];
      const activeMode = (record.process_mode || globalTransferProcessMode || 'STAFPART').toUpperCase();
      console.log(`[EXTENSION] Menemukan Transaksi Pending ID: ${record.id} | Mode: ${activeMode}`);
      
      // Update status ke 'processing'
      await updateSupabaseStatus(record.id, 'processing');
      
      // Eksekusi percabangan berdasarkan mode (STAFPART vs HODS)
      await processTransactionMode(record);
    }
  } catch (err) {
    console.error("[EXTENSION ERROR] Gagal mengecek antrian Supabase:", err);
  } finally {
    isProcessingQueue = false;
  }
}

// =========================================================================
// 2. PERCABANGAN LOGIKA UTAMA (STAFPART vs HODS)
// =========================================================================
async function processTransactionMode(record) {
  const modeProses = (record.process_mode || globalTransferProcessMode || 'STAFPART').toUpperCase();

  try {
    if (modeProses === 'HODS') {
      console.log("⚡ [MODE HODS] Memulai alur HODS (Auto-Login 5x Retry & Auto-SKM)...");
      
      const username = '02002102'; // Paten NIK HODS
      const password = 'Tas1kmalaya'; // Paten Password HODS

      // Step A: Jalankan Auto-Login 5x Retry
      const isLoginOk = await handleAutoLoginHODS(username, password, 5);

      if (!isLoginOk) {
        console.error("❌ [MODE HODS] Auto-Login GAGAL setelah 5 kali percobaan! Menghentikan transaksi.");
        await updateSupabaseStatus(record.id, 'failed', 'Auto-stop: Gagal login 5x (sesi lain aktif)');
        return;
      }

      // Step B: Jalankan Eksekusi HODS (Auto SKM tanpa dropdown)
      await executeHODSFlow(record);

    } else {
      // MODE STAFPART: Menjalankan Alur Standar Eksisting
      console.log("⚙️ [MODE STAFPART] Memulai alur pengerjaan standar (Tanpa Auto-Login)...");
      await executeStafpartFlow(record);
    }

    // Tandai transaksi sukses selesai
    await updateSupabaseStatus(record.id, 'completed');
    console.log(`✅ [EXTENSION SUCCESS] Transaksi ID ${record.id} Selesai Diproses!`);

  } catch (err) {
    console.error(`❌ [EXTENSION CRITICAL ERROR] Gagal memproses transaksi ID ${record.id}:`, err);
    await updateSupabaseStatus(record.id, 'failed', err.message || 'Error eksekusi extension');
  }
}

// =========================================================================
// 3. FUNGSI AUTO-LOGIN RETRY MAX 5X DENGAN AUTO REFRESH WEB & SESI GANDA
// =========================================================================
async function handleAutoLoginHODS(username, password, maxAttempts = 5) {
  if (!window.location.href.includes('/login') && !document.querySelector('#email, input[name="email"]')) {
    console.log('[LOGIN HODS] Mengarahkan ke https://artemis.local/login...');
    window.location.href = "https://artemis.local/login";
    await sleep(2500);
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[LOGIN HODS] Percobaan login ke-${attempt} dari ${maxAttempts}...`);

    try {
      // A. Cek apakah halaman sudah dalam keadaan ter-login
      const isAlreadyLoggedIn = !!document.getElementById('dropdownMenuButton') || 
                                !!document.querySelector('a[onclick*="create-transfer"], a[href*="create-transfer"], a[onclick*="transfer"]') || 
                                (!document.querySelector('#email, input[name="email"]') && window.location.href.includes('artemis.local') && !window.location.href.includes('login'));

      if (isAlreadyLoggedIn) {
        console.log('[LOGIN HODS] Sesi aktif terdeteksi. Berhasil masuk tanpa perlu login ulang.');
        if (!window.location.href.includes('/goods-transactions')) {
          console.log('[LOGIN HODS] Mengarahkan ke https://artemis.local/aftersales/inventory/goods-transactions...');
          window.location.href = "https://artemis.local/aftersales/inventory/goods-transactions";
          await sleep(2500);
        } else {
          await sleep(1000);
        }
        return true;
      }

      // B. Hanya jika percobaan ulang (ke-2 dst.) DAN belum login -> REFRESH web
      if (attempt > 1) {
        console.log(`[LOGIN HODS] Mengisikan ulang URL & REFRESH web untuk percobaan ke-${attempt}...`);
        window.location.href = "https://artemis.local/aftersales/inventory/goods-transactions";
        await sleep(3000); // Tunggu refresh halaman selesai
      }

      // C1. Isi Username / Email
      const emailInput = await waitForElement('#email, input[name="email"]', 3000);
      if (emailInput) {
        emailInput.focus();
        emailInput.value = username;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('[LOGIN HODS 1/4] Username diisi. Menunggu 1.5 detik...');
        await sleep(1500);
      }

      // C2. Isi Password
      const passwordInput = await waitForElement('#password, input[name="password"]', 3000);
      if (passwordInput) {
        passwordInput.focus();
        passwordInput.value = password;
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('[LOGIN HODS 2/4] Password diisi. Menunggu 1.5 detik...');
        await sleep(1500);
      }

      // C3. Mengklik tombol Sign In
      const signInBtn = await waitForElement('button[name="sign_in_btn"], input[name="sign_in_btn"], button.btn-signin', 3000);
      if (signInBtn) {
        console.log('[LOGIN HODS 3/4] Mengklik tombol Sign In...');
        signInBtn.click();
        await sleep(2500);
      }

      // D. Cek Pop-up Konflik Sesi Lain ("yes_btn") untuk Ambil Alih Akun
      const yesBtn = document.querySelector('button[name="yes_btn"], input[name="yes_btn"], #yes_btn, button.btn-yes');
      if (yesBtn) {
        console.log('[LOGIN HODS 4/4] Pop-up konflik sesi lain terdeteksi! Mengklik "yes_btn"...');
        yesBtn.click();
        await sleep(2000);
      }

      // E. Verifikasi Keberhasilan Login
      const isLoggedIn = !!document.getElementById('dropdownMenuButton') || 
                         !!document.querySelector('a[onclick*="create-transfer"], a[href*="create-transfer"], a[onclick*="transfer"]') || 
                         (!document.querySelector('#email, input[name="email"]') && window.location.href.includes('artemis.local') && !window.location.href.includes('login'));
      if (isLoggedIn) {
        console.log(`🚀 [LOGIN HODS SUCCESS] Berhasil Login! Mengarahkan ke Goods Transactions...`);
        if (!window.location.href.includes('/goods-transactions')) {
          window.location.href = "https://artemis.local/aftersales/inventory/goods-transactions";
          await sleep(2500);
        } else {
          await sleep(1500);
        }
        return true;
      } else {
        console.warn(`⚠️ [LOGIN HODS WARNING] Percobaan ke-${attempt} belum berhasil. Menyiapkan retry...`);
      }

    } catch (err) {
      console.error(`⚠️ [LOGIN HODS ERROR] Kendala percobaan ke-${attempt}:`, err);
    }

    await sleep(2000);
  }

  // Jika 5 kali percobaan gagal -> Kembalikan false (Trigger Auto-Stop)
  return false;
}

// =========================================================================
// 4. ALUR EKSEKUSI MODE HODS (OTOMATIS SKM TANPA DROPDOWN)
// =========================================================================
async function executeHODSFlow(record) {
  console.log('[HODS FLOW] 1. Membuka menu Transaksi Baru...');
  const dropBtn = await waitForElement('#dropdownMenuButton');
  if (dropBtn) dropBtn.click();
  await sleep(1000);

  let createBtn = document.querySelector("a[onclick*='create-transfer'], a[href*='create-transfer'], a[onclick*='transfer'], a[href*='transfer']");
  if (!createBtn) {
    const links = Array.from(document.querySelectorAll('.dropdown-menu a, .dropdown-item, a'));
    createBtn = links.find(a => a.textContent && a.textContent.toUpperCase().includes('TRANSFER') && a.offsetParent !== null);
  }
  if (createBtn) createBtn.click();
  await sleep(1000);

  const noBtn = await waitForElement('#no');
  if (noBtn) noBtn.click();
  await sleep(1000);

  // 2. OTOMATIS PILIH TRANSACTION CODE TFL
  console.log('[HODS FLOW] 2. Memilih Transaction Code TFL...');
  const codeChooser = await waitForElement('#chooserTransactionCode');
  if (codeChooser) codeChooser.click();
  await sleep(1500);

  // Trigger TFL Selection via Modal
  triggerScriptFunction("artChooserOk");
  await sleep(1000);

  // 3. PILIH RECEIPT LOCATION FROM (#artSelect19739)
  console.log('[HODS FLOW] 3. Memilih Receipt Location From...');
  const locChooser = await waitForElement('#chooserbtnReceiptLocationFrom');
  if (locChooser) locChooser.click();
  await sleep(1000);

  const locOpt = await waitForElement('#artSelect19739');
  if (locOpt) locOpt.click();
  triggerScriptFunction("artChooserOk");
  await sleep(1000);

  // 4. REMARKS & SAVE
  console.log('[HODS FLOW] 4. Mengisi Remarks & Simpan...');
  const remarksTextarea = await waitForElement('#remarks');
  if (remarksTextarea) {
    remarksTextarea.value = record.no_gudang || 'MUTASI STOK AUTOMATED';
    remarksTextarea.dispatchEvent(new Event('blur', { bubbles: true }));
    remarksTextarea.dispatchEvent(new Event('change', { bubbles: true }));
    await sleep(1000);
  }

  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) saveBtn.click();
  await sleep(1500);

  const confirmBtn = await waitForElement('#artConfirmationBtnOk');
  if (confirmBtn) confirmBtn.click();
  await sleep(2000);

  // 5. INPUT DATA SCANNING
  console.log(`[HODS FLOW] 5. Melakukan Scan Part Number: ${record.no_gudang}`);
  const qrButton = document.querySelector('#add_user_scan_btn');
  if (qrButton) {
    qrButton.click();
    await sleep(1500);
  }

  const inputScan = await waitForElement('#input-scan');
  if (inputScan) {
    inputScan.focus();
    inputScan.value = record.no_gudang;
    inputScan.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Enter Event
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true });
    inputScan.dispatchEvent(enterEvent);
    await sleep(1500);
  }
}

// =========================================================================
// 5. ALUR EKSEKUSI MODE STAFPART (STANDAR SAAT INI)
// =========================================================================
async function executeStafpartFlow(record) {
  // Alur standar saat ini (Pilih dropdown manual / sesuai alur lama)
  console.log('[STAFPART FLOW] Memproses transaksi alur standar...');
}

// =========================================================================
// 6. HELPER UTILITY FUNCTIONS
// =========================================================================
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForElement(selector, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearInterval(timer);
        resolve(el);
      } else if (Date.now() - startTime >= timeoutMs) {
        clearInterval(timer);
        resolve(null);
      }
    }, 250);
  });
}

function triggerScriptFunction(fnName) {
  const script = document.createElement('script');
  script.textContent = `if (typeof window.${fnName} === 'function') window.${fnName}();`;
  document.body.appendChild(script);
  script.remove();
}

async function updateSupabaseStatus(recordId, status, notes = null) {
  try {
    const payload = { status: status, updated_at: new Date().toISOString() };
    if (notes) payload.notes = notes;

    await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}?id=eq.${recordId}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.error('[SUPABASE UPDATE ERROR]', e);
  }
}
