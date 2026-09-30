// ==========================================
// CONSTANTS & CONFIG
// ==========================================
const GOOGLE_SHEET_ID = '1x6m_pQ_UUPMGUE5iGraaurOivSDmsJ7CKCr42rNWlBc';
const USER_SPREADSHEET_ID = GOOGLE_SHEET_ID;
const SPREADSHEET_ID = GOOGLE_SHEET_ID;

const STORAGE_KEYS = {
  PROFILE: 'teknisi_profile_data',
  SAVED_LOGIN: 'teknisi_saved_login',
  SESSION: 'teknisi_current_session',
  THEME: 'teknisi_app_theme',
  SHEETS_CACHE: 'google_sheets_cache',
  PIPO_CACHE: 'pipo_sheets_cache',
  FINISH_HISTORY: 'teknisi_finish_history',
  FINISH_SHEET_CACHE: 'finish_sheet_cache',
  LAST_TAB: 'teknisi_last_active_tab'
};

let state = {
  isLoggedIn: false,
  isAdmin: false,
  activeTab: 'tab-menu',
  theme: 'dark', // 'dark' | 'light'
  modalAction: null,
  profile: {
    id: '',
    nama: '',
    nik: '',
    psw: '',
    usePsw: true
  },
  finishHistory: [],
  isReloading: false,
  // Google Sheets Data State
  tagihanSearchQuery: '',
  sheetsData: {
    lastUpdateTimestamp: 'Memuat data....',
    pendingTimestamp: 'Memuat data....',
    performaTimestamp: 'Memuat data....',
    partKembaliTimestamp: 'Memuat data....',
    tagihanTimestamp: 'Memuat data....',
    lastSyncTime: null,
    pendingCases: [],
    insentifRows: [],
    rata2Rows: [],
    outputHariIni: [],
    notifications: [],
    partBelumKembali: [],
    tagihanRows: []
  },
  sheetsPollTimer: null,
  isFetchingSheets: false,
  pendingSearchQuery: '',
  partKembaliSearchQuery: '',
  // PIPO Part Pengganti State
  pipoData: [],
  isFetchingPipo: false,
  pipoSearchQuery: '',
  pipoLimit: 40
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const DOM = {
  appRoot: document.getElementById('app-root'),
  
  // Screens
  screenLogin: document.getElementById('screen-login'),
  screenApp: document.getElementById('screen-app'),
  
  // Login Form Elements
  formLogin: document.getElementById('form-login'),
  loginUsername: document.getElementById('login-username'),
  loginPassword: document.getElementById('login-password'),
  btnLoginPswToggle: document.getElementById('btn-login-psw-toggle'),
  loginPswEye: document.getElementById('login-psw-eye'),
  rememberMe: document.getElementById('remember-me'),
  btnDoLogin: document.getElementById('btn-do-login'),
  
  // App Navigation & Tabs
  appNav: document.getElementById('app-nav'),
  navItems: document.querySelectorAll('.nav-item'),
  tabContents: document.querySelectorAll('.tab-content'),
  
  // App Header & Sheet Update Bar
  headerNama: document.getElementById('header-nama'),
  headerNik: document.getElementById('header-nik'),
  headerPswStatus: document.getElementById('header-psw-status'),
  headerPswText: document.getElementById('header-psw-text'),
  headerBtnMissing: document.getElementById('header-btn-missing'),
  headerBtnProfile: document.getElementById('header-btn-profile'),
  headerNotifBtn: document.getElementById('header-notif-btn'),
  headerBellBadge: document.getElementById('header-bell-badge'),
  sheetUpdateBar: document.getElementById('sheet-update-bar'),
  syncIcon: document.getElementById('sync-icon'),
  sheetZ2Timestamp: document.getElementById('sheet-z2-timestamp'),
  syncStatusBadge: document.getElementById('sync-status-badge'),
  
  // Menu Hub Mode Selector
  btnSelectModeTeknisi: document.getElementById('btn-select-mode-teknisi'),
  btnSelectModePipo: document.getElementById('btn-select-mode-pipo'),
  btnSelectModeFinish: document.getElementById('btn-select-mode-finish'),

  // Part Pengganti (PIPO) Controls
  inputSearchPipo: document.getElementById('input-search-pipo'),
  btnClearSearchPipo: document.getElementById('btn-clear-search-pipo'),
  pipoCount: document.getElementById('pipo-count'),
  pipoListContainer: document.getElementById('pipo-list-container'),

  // Finish Harian Controls (Google Form Fields)
  formFinishHarian: document.getElementById('form-finish-harian'),
  finishNama: document.getElementById('finish-nama'),
  finishTgl: document.getElementById('finish-tgl'),
  finishCaseOutdoor: document.getElementById('finish-case-outdoor'),
  finishFinishOutdoor: document.getElementById('finish-finish-outdoor'),
  finishFinishIndoor: document.getElementById('finish-finish-indoor'),
  finishWipComp: document.getElementById('finish-wip-comp'),
  finishWipTech: document.getElementById('finish-wip-tech'),
  finishBatal: document.getElementById('finish-batal'),
  finishAntar: document.getElementById('finish-antar'),
  finishNoVisit: document.getElementById('finish-no-visit'),
  finishKet: document.getElementById('finish-ket'),
  btnSubmitFinish: document.getElementById('btn-submit-finish'),
  finishHistoryList: document.getElementById('finish-history-list'),
  btnOpenMissingModal: document.getElementById('btn-open-missing-modal'),
  modalMissingFinish: document.getElementById('modal-missing-finish'),
  btnCloseMissingModal: document.getElementById('btn-close-missing-modal'),
  btnDismissMissingModal: document.getElementById('btn-dismiss-missing-modal'),
  btnRefreshMissing: document.getElementById('btn-refresh-missing'),
  syncIconMissing: document.getElementById('sync-icon-missing'),
  missingFinishSummary: document.getElementById('missing-finish-summary'),
  missingFinishList: document.getElementById('missing-finish-list'),
  btnFinishPageForm: document.getElementById('btn-finish-page-form'),
  btnFinishPageAll: document.getElementById('btn-finish-page-all'),
  finishPageForm: document.getElementById('finish-page-form'),
  finishPageAll: document.getElementById('finish-page-all'),
  btnRefreshFinishAll: document.getElementById('btn-refresh-finish-all'),
  syncIconFinishAll: document.getElementById('sync-icon-finish-all'),
  finishAllFilterDate: document.getElementById('finish-all-filter-date'),
  btnClearFinishFilterDate: document.getElementById('btn-clear-finish-filter-date'),
  finishAllFilterTech: document.getElementById('finish-all-filter-tech'),
  finishAllTechFilterWrapper: document.getElementById('finish-all-tech-filter-wrapper'),
  finishAllSummary: document.getElementById('finish-all-summary'),
  finishAllList: document.getElementById('finish-all-list'),

  // Navigation Badges
  navPendingBadge: document.getElementById('nav-pending-badge'),
  navNotifBadge: document.getElementById('nav-notif-badge'),

  // Sheets View Containers & Controls
  btnRefreshPending: document.getElementById('btn-refresh-pending'),
  inputSearchPending: document.getElementById('input-search-pending'),
  btnClearSearchPending: document.getElementById('btn-clear-search-pending'),
  pendingTechCount: document.getElementById('pending-tech-count'),
  pendingListContainer: document.getElementById('pending-list-container'),
  
  btnRefreshPerforma: document.getElementById('btn-refresh-performa'),
  performaContentContainer: document.getElementById('performa-content-container'),
  
  btnRefreshNotif: document.getElementById('btn-refresh-notif'),
  notifTechCount: document.getElementById('notif-tech-count'),
  notifListContainer: document.getElementById('notif-list-container'),
  
  // Part Bekas Controls
  inputSearchPartKembali: document.getElementById('input-search-part-kembali'),
  btnClearSearchPartKembali: document.getElementById('btn-clear-search-part-kembali'),
  partKembaliCount: document.getElementById('part-kembali-count'),
  partKembaliTotalQty: document.getElementById('part-kembali-total-qty'),
  partKembaliListContainer: document.getElementById('part-kembali-list-container'),

  // Tagihan Controls
  tagihanUpdateTimestamp: document.getElementById('tagihan-update-timestamp'),
  tagihanCount: document.getElementById('tagihan-count'),
  tagihanTotalJumlah: document.getElementById('tagihan-total-jumlah'),
  inputSearchTagihan: document.getElementById('input-search-tagihan'),
  btnClearSearchTagihan: document.getElementById('btn-clear-search-tagihan'),
  tagihanListContainer: document.getElementById('tagihan-list-container'),
  
  // Dedicated Profile Display
  profDispNama: document.getElementById('prof-disp-nama'),
  profDispNik: document.getElementById('prof-disp-nik'),
  btnLogout: document.getElementById('btn-logout'),
  
  // Theme Buttons
  btnThemeDark: document.getElementById('btn-theme-dark'),
  btnThemeLight: document.getElementById('btn-theme-light'),

  // Profile Form
  profileNama: document.getElementById('profile-nama'),
  profileNik: document.getElementById('profile-nik'),
  profilePsw: document.getElementById('profile-psw'),
  profileArea: document.getElementById('profile-area'),
  profilePswToggle: document.getElementById('profile-psw-toggle'),
  btnSaveProfile: document.getElementById('btn-save-profile'),
  btnTogglePswVisibility: document.getElementById('btn-toggle-psw-visibility'),
  pswEyeIcon: document.getElementById('psw-eye-icon'),
  btnClearAppCache: document.getElementById('btn-clear-app-cache'),
  
  // Toast
  toastContainer: document.getElementById('toast-container'),

  // Confirmation Modal Elements
  modalConfirm: document.getElementById('modal-confirm'),
  modalConfirmTitle: document.getElementById('modal-confirm-title'),
  modalConfirmMsg: document.getElementById('modal-confirm-msg'),
  modalConfirmOkText: document.getElementById('modal-confirm-ok-text'),
  btnConfirmCancel: document.getElementById('btn-confirm-cancel'),
  btnConfirmOk: document.getElementById('btn-confirm-ok'),
  btnModalClose: document.getElementById('btn-modal-close'),

  // PIPO & Extra Navigation Elements
  pipoDefaultHeader: document.getElementById('pipo-default-header'),
  btnRefreshPipo: document.getElementById('btn-refresh-pipo'),
  btnSelectModePartKembali: document.getElementById('btn-select-mode-part-kembali'),
  btnSelectModeTagihan: document.getElementById('btn-select-mode-tagihan'),
  pipoSearchInput: document.getElementById('input-search-pipo'),
  pipoSearchClear: document.getElementById('btn-clear-search-pipo')
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  loadStoredData();
  applyTheme(state.theme);
  setupEventListeners();
  checkLoginSession();
});

function loadStoredData() {
  // Load Theme
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  if (savedTheme) state.theme = savedTheme;

  // Load Saved Login Credentials
  const savedLogin = localStorage.getItem(STORAGE_KEYS.SAVED_LOGIN);
  if (savedLogin) {
    try {
      const parsed = JSON.parse(savedLogin);
      DOM.loginUsername.value = parsed.username || '';
      DOM.loginPassword.value = parsed.password || '';
      DOM.rememberMe.checked = !!parsed.remember;
    } catch (e) {}
  }

  // Load Profile Data
  const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (storedProfile) {
    try { state.profile = JSON.parse(storedProfile); } catch (e) {}
  }

  // Load Finish Harian History
  const storedFinishHistory = localStorage.getItem(STORAGE_KEYS.FINISH_HISTORY);
  if (storedFinishHistory) {
    try { state.finishHistory = JSON.parse(storedFinishHistory); } catch (e) {}
  }
}

function applyTheme(themeName) {
  state.theme = themeName;
  localStorage.setItem(STORAGE_KEYS.THEME, themeName);

  document.documentElement.setAttribute('data-theme', themeName);
  document.body.setAttribute('data-theme', themeName);
  DOM.appRoot.setAttribute('data-theme', themeName);

  if (DOM.btnThemeDark && DOM.btnThemeLight) {
    DOM.btnThemeDark.classList.toggle('active', themeName === 'dark');
    DOM.btnThemeLight.classList.toggle('active', themeName === 'light');
  }
}

function checkLoginSession() {
  const session = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (session) {
    try {
      const parsed = JSON.parse(session);
      if (parsed.isLoggedIn && parsed.nik) {
        state.isLoggedIn = true;
        state.isAdmin = (parsed.nik.toUpperCase() === 'ADMIN' || !!parsed.isAdmin);
        if (state.isAdmin) {
          state.profile = {
            id: 'admin-id',
            nik: 'ADMIN',
            nama: 'Administrator',
            psw: '000',
            usePsw: true
          };
          updateUIFromState();
        } else {
          const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
          if (storedProfile) {
            try {
              const parsedProfile = JSON.parse(storedProfile);
              if (parsedProfile && parsedProfile.nama) {
                state.profile = parsedProfile;
              }
            } catch (e) {}
          }
          updateUIFromState();
        }
        showAppScreen();
        return;
      }
    } catch (e) {}
  }

  showLoginScreen();
}

function showLoginScreen() {
  state.isLoggedIn = false;
  state.isAdmin = false;
  state.sheetsData = {
    lastUpdateTimestamp: '',
    pendingTimestamp: '',
    performaTimestamp: '',
    partKembaliTimestamp: '',
    tagihanTimestamp: '',
    lastSyncTime: 0,
    pendingCases: [],
    insentifRows: [],
    rata2Rows: [{ rata_rata: '0.0', selisih_unit: '0' }],
    outputHariIni: [],
    notifications: [],
    partBelumKembali: [],
    tagihanRows: []
  };
  document.documentElement.classList.remove('is-logged-in');
  document.documentElement.classList.remove('is-admin');
  if (DOM.screenLogin) DOM.screenLogin.classList.add('active');
  if (DOM.screenApp) DOM.screenApp.classList.remove('active');
  stopSheetsPolling();
}

function showAppScreen() {
  document.documentElement.classList.add('is-logged-in');
  document.documentElement.classList.toggle('is-admin', !!state.isAdmin);
  if (DOM.screenLogin) DOM.screenLogin.classList.remove('active');
  if (DOM.screenApp) DOM.screenApp.classList.add('active');

  const hashTab = window.location.hash ? window.location.hash.replace('#', '') : '';
  const savedTab = localStorage.getItem(STORAGE_KEYS.LAST_TAB);

  const validTabs = ['tab-menu', 'tab-pending', 'tab-performa', 'tab-notif', 'tab-part-kembali', 'tab-tagihan', 'tab-pipo', 'tab-finish', 'tab-finish-all', 'tab-profile'];
  let initialTab = 'tab-menu';

  if (hashTab && validTabs.includes(hashTab)) {
    initialTab = hashTab;
  } else if (savedTab && validTabs.includes(savedTab)) {
    initialTab = savedTab;
  }

  try {
    history.replaceState({ tab: initialTab }, '', '#' + initialTab);
  } catch (e) {}

  switchTab(initialTab, false);
  updateUIFromState();
  
  // Load PIPO Cache & Start Data Polling / Fetching
  loadSheetsCache();
  startSheetsPolling();
  syncUserProfileAreaFromSheet();
  loadPipoCache();
  fetchPipoData();
}

function updateUIFromState() {
  // Update Header & Dedicated Profile Page
  if (DOM.headerNama) DOM.headerNama.textContent = state.profile.nama || 'Teknisi (Belum Diset)';
  if (DOM.headerNik) DOM.headerNik.innerHTML = `<i data-lucide="id-card"></i> NIK: ${state.profile.nik || '-'}`;

  if (DOM.headerPswText && DOM.headerPswStatus) {
    DOM.headerPswText.textContent = `PSW: ${state.profile.usePsw ? 'ON' : 'OFF'}`;
    DOM.headerPswStatus.classList.toggle('off', !state.profile.usePsw);
  }

  if (DOM.profDispNama) DOM.profDispNama.textContent = state.profile.nama || 'Teknisi Anonim';
  if (DOM.profDispNik) DOM.profDispNik.textContent = `NIK: ${state.profile.nik || '-'}`;

  // Update Profile Form Fields (Read-Only)
  if (DOM.profileArea) {
    DOM.profileArea.value = state.profile.area || 'JABAR';
    DOM.profileArea.readOnly = true;
  }
  if (DOM.profileNama) {
    DOM.profileNama.value = state.profile.nama || '';
    DOM.profileNama.readOnly = true;
  }
  if (DOM.profileNik) {
    DOM.profileNik.value = state.profile.nik || '';
    DOM.profileNik.readOnly = true;
  }
  if (DOM.profilePsw) {
    DOM.profilePsw.value = state.profile.psw || '';
    DOM.profilePsw.readOnly = true;
  }
  if (DOM.profilePswToggle) {
    DOM.profilePswToggle.checked = !!state.profile.usePsw;
    DOM.profilePswToggle.disabled = true;
  }

  document.documentElement.classList.toggle('is-admin', !!state.isAdmin);
  lucide.createIcons();
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
  // Theme Buttons
  if (DOM.btnThemeDark) DOM.btnThemeDark.addEventListener('click', () => applyTheme('dark'));
  if (DOM.btnThemeLight) DOM.btnThemeLight.addEventListener('click', () => applyTheme('light'));

  // Login Password Eye Toggle
  if (DOM.btnLoginPswToggle) {
    DOM.btnLoginPswToggle.addEventListener('click', () => {
      const isPsw = DOM.loginPassword.type === 'password';
      DOM.loginPassword.type = isPsw ? 'text' : 'password';
    });
  }

  // Login Submit & Enter Key Listeners
  if (DOM.btnDoLogin) DOM.btnDoLogin.addEventListener('click', handleLogin);
  if (DOM.formLogin) {
    DOM.formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLogin();
    });
  }
  if (DOM.loginUsername) {
    DOM.loginUsername.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLogin();
      }
    });
  }
  if (DOM.loginPassword) {
    DOM.loginPassword.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLogin();
      }
    });
  }

  // Logout Button
  if (DOM.btnLogout) DOM.btnLogout.addEventListener('click', handleLogout);

  if (DOM.btnSelectModeTeknisi) {
    DOM.btnSelectModeTeknisi.addEventListener('click', () => {
      requestTabSwitch('tab-pending');
    });
  }
  if (DOM.btnSelectModePipo) {
    DOM.btnSelectModePipo.addEventListener('click', () => {
      requestTabSwitch('tab-pipo');
    });
  }
  if (DOM.btnSelectModeFinish) {
    DOM.btnSelectModeFinish.addEventListener('click', () => {
      requestTabSwitch('tab-finish');
    });
  }
  if (DOM.btnSelectModePartKembali) {
    DOM.btnSelectModePartKembali.addEventListener('click', () => {
      requestTabSwitch('tab-part-kembali');
    });
  }
  if (DOM.btnSelectModeTagihan) {
    DOM.btnSelectModeTagihan.addEventListener('click', () => {
      requestTabSwitch('tab-tagihan');
    });
  }
  if (DOM.btnSubmitFinish) {
    DOM.btnSubmitFinish.addEventListener('click', openFinishConfirmModal);
  }
  if (DOM.headerBtnMissing) DOM.headerBtnMissing.addEventListener('click', () => openMissingModal(false));
  if (DOM.btnOpenMissingModal) DOM.btnOpenMissingModal.addEventListener('click', () => openMissingModal(false));
  if (DOM.btnCloseMissingModal) DOM.btnCloseMissingModal.addEventListener('click', closeMissingModal);
  if (DOM.btnDismissMissingModal) DOM.btnDismissMissingModal.addEventListener('click', () => closeMissingModal());
  if (DOM.btnRefreshMissing) {
    DOM.btnRefreshMissing.addEventListener('click', async () => {
      const syncIcon = document.getElementById('sync-icon-missing') || DOM.syncIconMissing;
      if (syncIcon) syncIcon.classList.add('spinning');
      if (DOM.btnRefreshMissing) DOM.btnRefreshMissing.disabled = true;
      try {
        await openMissingModal(false, true);
      } finally {
        const activeIcon = document.getElementById('sync-icon-missing') || DOM.syncIconMissing;
        if (activeIcon) activeIcon.classList.remove('spinning');
        if (DOM.btnRefreshMissing) DOM.btnRefreshMissing.disabled = false;
      }
    });
  }

  if (DOM.btnFinishPageForm) {
    DOM.btnFinishPageForm.addEventListener('click', () => {
      if (DOM.btnFinishPageForm) DOM.btnFinishPageForm.classList.add('active');
      if (DOM.btnFinishPageAll) DOM.btnFinishPageAll.classList.remove('active');
      if (DOM.finishPageForm) DOM.finishPageForm.style.display = 'block';
      if (DOM.finishPageAll) DOM.finishPageAll.style.display = 'none';
    });
  }

  if (DOM.btnFinishPageAll) {
    DOM.btnFinishPageAll.addEventListener('click', async () => {
      if (DOM.btnFinishPageAll) DOM.btnFinishPageAll.classList.add('active');
      if (DOM.btnFinishPageForm) DOM.btnFinishPageForm.classList.remove('active');
      if (DOM.finishPageAll) DOM.finishPageAll.style.display = 'block';
      if (DOM.finishPageForm) DOM.finishPageForm.style.display = 'none';
      
      if (DOM.syncIconFinishAll) DOM.syncIconFinishAll.classList.add('spinning');
      try {
        const { parsedAllRows } = await fetchFinishSheetData();
        renderFinishAllDataTab(parsedAllRows);
      } catch(e) {} finally {
        if (DOM.syncIconFinishAll) DOM.syncIconFinishAll.classList.remove('spinning');
      }
    });
  }

  if (DOM.btnRefreshFinishAll) {
    DOM.btnRefreshFinishAll.addEventListener('click', async () => {
      if (DOM.syncIconFinishAll) DOM.syncIconFinishAll.classList.add('spinning');
      showToast('🔄 Memperbarui data finish dari Google Sheet...', 'info');
      try {
        const { parsedAllRows } = await fetchFinishSheetData();
        renderFinishAllDataTab(parsedAllRows);
      } catch(e) {} finally {
        if (DOM.syncIconFinishAll) DOM.syncIconFinishAll.classList.remove('spinning');
      }
    });
  }

  if (DOM.finishAllFilterDate) {
    DOM.finishAllFilterDate.addEventListener('change', () => {
      renderFinishAllDataTab();
    });
  }

  if (DOM.btnClearFinishFilterDate) {
    DOM.btnClearFinishFilterDate.addEventListener('click', () => {
      if (DOM.finishAllFilterDate) {
        DOM.finishAllFilterDate.value = '';
        DOM.finishAllFilterDate.type = 'text';
      }
      if (DOM.finishAllFilterTech) DOM.finishAllFilterTech.value = '';
      renderFinishAllDataTab();
    });
  }

  if (DOM.finishNama) {
    DOM.finishNama.addEventListener('change', () => {
      if (DOM.modalMissingFinish && DOM.modalMissingFinish.classList.contains('active')) {
        openMissingModal(true);
      }
    });
  }

  // PIPO Search & Refresh Listeners
  if (DOM.btnRefreshPipo) {
    DOM.btnRefreshPipo.addEventListener('click', () => {
      showToast('🔄 Memperbarui data Part Pengganti (PIPO)...', 'info');
      fetchPipoData();
    });
  }

  if (DOM.inputSearchPipo) {
    let pipoTimer = null;
    DOM.inputSearchPipo.addEventListener('input', (e) => {
      const val = e.target.value;
      if (DOM.btnClearSearchPipo) {
        DOM.btnClearSearchPipo.style.display = val ? 'block' : 'none';
      }
      if (pipoTimer) clearTimeout(pipoTimer);
      pipoTimer = setTimeout(() => {
        state.pipoSearchQuery = val;
        state.pipoLimit = 40;
        renderPipoTab();
      }, 100);
    });
  }

  if (DOM.btnClearSearchPipo) {
    DOM.btnClearSearchPipo.addEventListener('click', () => {
      state.pipoSearchQuery = '';
      if (DOM.inputSearchPipo) DOM.inputSearchPipo.value = '';
      DOM.btnClearSearchPipo.style.display = 'none';
      renderPipoTab();
    });
  }

  // Navigation Tabs & Header Bell
  DOM.navItems.forEach(item => {
    item.addEventListener('click', () => {
      requestTabSwitch(item.getAttribute('data-target'));
    });
  });

  if (DOM.headerNotifBtn) {
    DOM.headerNotifBtn.addEventListener('click', () => {
      requestTabSwitch('tab-notif');
    });
  }

  // Refresh & Search Listeners
  if (DOM.sheetUpdateBar) {
    DOM.sheetUpdateBar.style.cursor = 'pointer';
    DOM.sheetUpdateBar.title = 'Klik untuk refresh data aplikasi';
    DOM.sheetUpdateBar.addEventListener('click', () => {
      showToast('🔄 Memperbarui data...', 'info');
      fetchGoogleSheetsData();
    });
  }

  if (DOM.btnRefreshPending) DOM.btnRefreshPending.addEventListener('click', () => fetchGoogleSheetsData());
  if (DOM.btnRefreshPerforma) DOM.btnRefreshPerforma.addEventListener('click', () => fetchGoogleSheetsData());
  if (DOM.btnRefreshNotif) DOM.btnRefreshNotif.addEventListener('click', () => fetchGoogleSheetsData());

  if (DOM.inputSearchPending) {
    DOM.inputSearchPending.addEventListener('input', (e) => {
      state.pendingSearchQuery = e.target.value;
      if (DOM.btnClearSearchPending) {
        DOM.btnClearSearchPending.style.display = e.target.value ? 'block' : 'none';
      }
      renderPendingTab();
    });
  }

  if (DOM.btnClearSearchPending) {
    DOM.btnClearSearchPending.addEventListener('click', () => {
      state.pendingSearchQuery = '';
      if (DOM.inputSearchPending) DOM.inputSearchPending.value = '';
      DOM.btnClearSearchPending.style.display = 'none';
      renderPendingTab();
    });
  }

  if (DOM.inputSearchPartKembali) {
    DOM.inputSearchPartKembali.addEventListener('input', (e) => {
      state.partKembaliSearchQuery = e.target.value;
      if (DOM.btnClearSearchPartKembali) {
        DOM.btnClearSearchPartKembali.style.display = e.target.value ? 'block' : 'none';
      }
      renderPartKembaliTab();
    });
  }

  if (DOM.btnClearSearchPartKembali) {
    DOM.btnClearSearchPartKembali.addEventListener('click', () => {
      state.partKembaliSearchQuery = '';
      if (DOM.inputSearchPartKembali) DOM.inputSearchPartKembali.value = '';
      DOM.btnClearSearchPartKembali.style.display = 'none';
      renderPartKembaliTab();
    });
  }

  if (DOM.inputSearchTagihan) {
    DOM.inputSearchTagihan.addEventListener('input', (e) => {
      state.tagihanSearchQuery = e.target.value;
      if (DOM.btnClearSearchTagihan) {
        DOM.btnClearSearchTagihan.style.display = e.target.value ? 'block' : 'none';
      }
      renderTagihanTab();
    });
  }

  if (DOM.btnClearSearchTagihan) {
    DOM.btnClearSearchTagihan.addEventListener('click', () => {
      state.tagihanSearchQuery = '';
      if (DOM.inputSearchTagihan) DOM.inputSearchTagihan.value = '';
      DOM.btnClearSearchTagihan.style.display = 'none';
      renderTagihanTab();
    });
  }

  // Modal Confirm buttons
  if (DOM.btnModalClose) DOM.btnModalClose.addEventListener('click', closeSubmitConfirmModal);
  if (DOM.btnConfirmCancel) DOM.btnConfirmCancel.addEventListener('click', closeSubmitConfirmModal);
  if (DOM.btnConfirmOk) DOM.btnConfirmOk.addEventListener('click', handleConfirmModalOk);

  // Header Action Buttons (Profile)
  if (DOM.headerBtnProfile) {
    DOM.headerBtnProfile.addEventListener('click', () => switchTab('tab-profile'));
  }

  // Password Visibility Toggle in Profile
  if (DOM.btnTogglePswVisibility) {
    DOM.btnTogglePswVisibility.addEventListener('click', () => {
      if (DOM.profilePsw) {
        const isPsw = DOM.profilePsw.type === 'password';
        DOM.profilePsw.type = isPsw ? 'text' : 'password';
      }
    });
  }

  // Clear App Cache Button
  if (DOM.btnClearAppCache) {
    DOM.btnClearAppCache.addEventListener('click', handleClearAppCache);
  }

  let lastBackPressTime = 0;

  // Android & Hardware Back Button Navigation Handler
  window.addEventListener('popstate', (e) => {
    if (!state.isLoggedIn) return;

    // Close active modals first if open
    if (DOM.modalMissingFinish && DOM.modalMissingFinish.classList.contains('active')) {
      closeMissingModal(false);
      return;
    }
    if (DOM.modalConfirm && DOM.modalConfirm.classList.contains('active')) {
      closeSubmitConfirmModal();
      try { history.pushState({ tab: state.activeTab }, '', '#' + state.activeTab); } catch (err) {}
      return;
    }

    // Intercept Back when at Main Menu (tab-menu)
    if (state.activeTab === 'tab-menu') {
      const now = Date.now();
      if (now - lastBackPressTime < 2000) {
        return;
      }

      lastBackPressTime = now;
      try { history.pushState({ tab: 'tab-menu' }, '', '#tab-menu'); } catch (err) {}
      showToast('Tekan sekali lagi untuk keluar', 'warning');
      return;
    }

    let targetTab = (e.state && e.state.tab) ? e.state.tab : 'tab-menu';
    switchTab(targetTab, false);
  });
}

// ==========================================
// UNIFORM MODAL POPUP CONFIRMATION FLOW (YA / TIDAK)
// ==========================================
function openLogoutConfirmModal() {
  state.modalAction = 'logout';

  if (DOM.modalConfirmTitle) DOM.modalConfirmTitle.innerHTML = `<i data-lucide="log-out"></i> Konfirmasi Keluar`;
  if (DOM.modalConfirmMsg) DOM.modalConfirmMsg.textContent = 'Apakah Anda Yakin Ingin Keluar Akun?';
  if (DOM.modalConfirmOkText) DOM.modalConfirmOkText.textContent = 'Ya, Keluar';
  if (DOM.modalConfirm) DOM.modalConfirm.classList.add('active');
  if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

function openClearCacheConfirmModal() {
  state.modalAction = 'clearCache';

  if (DOM.modalConfirmTitle) DOM.modalConfirmTitle.innerHTML = `<i data-lucide="trash-2"></i> Konfirmasi Hapus Cache`;
  if (DOM.modalConfirmMsg) DOM.modalConfirmMsg.textContent = 'Apakah Anda Yakin Ingin Menghapus Seluruh Cache Data Aplikasi? Halaman akan dimuat ulang.';
  if (DOM.modalConfirmOkText) DOM.modalConfirmOkText.textContent = 'Ya, Hapus Cache';
  if (DOM.modalConfirm) DOM.modalConfirm.classList.add('active');
  if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

function closeSubmitConfirmModal() {
  if (DOM.modalConfirm) DOM.modalConfirm.classList.remove('active');
}

async function handleConfirmModalOk() {
  const currentAction = state.modalAction;
  closeSubmitConfirmModal();

  if (currentAction === 'submitFinish') {
    await handleSubmitFinish();
  } else if (currentAction === 'logout') {
    performLogout();
  } else if (currentAction === 'clearCache') {
    executeClearAppCache();
  }
}

function handleClearAppCache() {
  openClearCacheConfirmModal();
}

async function executeClearAppCache() {
  try {
    showToast('🧹 Membersihkan cache data...', 'info');

    localStorage.removeItem(STORAGE_KEYS.SHEETS_CACHE);
    localStorage.removeItem(STORAGE_KEYS.PIPO_CACHE);
    localStorage.removeItem(STORAGE_KEYS.FINISH_SHEET_CACHE);

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    showToast('✅ Cache berhasil dibersihkan! Memuat ulang...', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 700);
  } catch (err) {
    console.error('Clear cache error:', err);
    showToast('Memuat ulang aplikasi...', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 700);
  }
}

function cleanNumberString(val) {
  if (val === undefined || val === null) return '';
  let str = String(val).trim();
  if (str.endsWith('.0')) {
    str = str.slice(0, -2);
  }
  return str;
}

// ==========================================
// GOOGLE SHEET USER AUTHENTICATION & LOGIN HANDLER
// ==========================================
async function fetchGoogleSheetsUsers() {
  try {
    const table = await fetchGVizSheetCustom(USER_SPREADSHEET_ID, 'user');
    const rows = extractMatrixFromGViz(table);
    const users = [];

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length < 3) continue;

      const nik = cleanNumberString(row[0]);
      const nama = (row[1] || '').trim();
      const psw = cleanNumberString(row[2]);
      const area = (row[3] || '').trim(); // Column D: SITE / AREA

      if (nik.toUpperCase() === 'NIK' && psw.toUpperCase() === 'PSW') continue;

      if (nama || nik) {
        users.push({
          nik: nik || nama,
          nama: nama || nik,
          psw: psw,
          area: area || 'JABAR'
        });
      }
    }
    return users;
  } catch (err) {
    console.error('Error fetching users from Google Sheet:', err);
    return [];
  }
}

async function syncUserProfileAreaFromSheet() {
  if (!state.isLoggedIn || !state.profile) return;
  if (state.profile.nik && state.profile.nik.toUpperCase() === 'ADMIN') {
    state.profile.area = 'JABAR';
    if (DOM.profileArea) DOM.profileArea.value = 'JABAR';
    return;
  }
  try {
    const usersList = await fetchGoogleSheetsUsers();
    if (!usersList || usersList.length === 0) return;
    const targetNik = cleanNumberString(state.profile.nik).toUpperCase();
    const targetNama = (state.profile.nama || '').trim().toUpperCase();

    const matchedUser = usersList.find(u => {
      const uNik = cleanNumberString(u.nik).toUpperCase();
      const uNama = (u.nama || '').trim().toUpperCase();
      return (targetNik && uNik === targetNik) || (targetNama && matchTechName(uNama, targetNama, targetNik));
    });

    if (matchedUser && matchedUser.area) {
      state.profile.area = matchedUser.area;
      if (DOM.profileArea) DOM.profileArea.value = matchedUser.area;
      saveProfileSilently();
    }
  } catch (e) {
    console.warn('Error syncUserProfileAreaFromSheet:', e);
  }
}

async function handleLogin() {
  const username = cleanNumberString(DOM.loginUsername.value);
  const password = cleanNumberString(DOM.loginPassword.value);
  const remember = DOM.rememberMe.checked;

  if (!username) {
    showToast('Harap masukkan Username / NIK / Nama!', 'error');
    DOM.loginUsername.focus();
    return;
  }
  if (!password) {
    showToast('Harap masukkan Password!', 'error');
    DOM.loginPassword.focus();
    return;
  }

  DOM.btnDoLogin.disabled = true;
  DOM.btnDoLogin.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Memeriksa Akun...`;
  lucide.createIcons();

  try {
    let authenticatedUser = null;
    const uUpper = username.toUpperCase();

    // Default fallback for Admin
    if (uUpper === 'ADMIN' && password === '000') {
      authenticatedUser = {
        nik: 'ADMIN',
        nama: 'Administrator',
        psw: '000',
        area: 'JABAR',
        isAdmin: true
      };
    } else {
      // Fetch user list from Google Sheet tab 'user'
      const usersList = await fetchGoogleSheetsUsers();
      const matchedUser = usersList.find(u => {
        const nikClean = cleanNumberString(u.nik).toUpperCase();
        const namaClean = (u.nama || '').trim().toUpperCase();
        const pswClean = cleanNumberString(u.psw);

        const matchIdentifier = (nikClean && nikClean === uUpper) || 
                                (namaClean && namaClean === uUpper);
        const matchPsw = pswClean === password;
        return matchIdentifier && matchPsw;
      });

      if (!matchedUser) {
        throw new Error('NIK/Nama atau Password tidak cocok!');
      }

      authenticatedUser = {
        nik: matchedUser.nik,
        nama: matchedUser.nama,
        psw: matchedUser.psw,
        area: matchedUser.area || 'JABAR',
        isAdmin: (matchedUser.nik.toUpperCase() === 'ADMIN')
      };
    }

    if (remember) {
      localStorage.setItem(STORAGE_KEYS.SAVED_LOGIN, JSON.stringify({
        username: username,
        password: password,
        remember: true
      }));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SAVED_LOGIN);
    }

    state.isAdmin = !!authenticatedUser.isAdmin;
    state.profile.id = authenticatedUser.nik;
    state.profile.nik = authenticatedUser.nik;
    state.profile.nama = authenticatedUser.nama;
    state.profile.psw = authenticatedUser.psw;
    state.profile.area = authenticatedUser.area || 'JABAR';
    state.profile.usePsw = true;

    saveProfileSilently();

    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({
      isLoggedIn: true,
      nik: authenticatedUser.nik,
      nama: authenticatedUser.nama,
      isAdmin: state.isAdmin,
      loginAt: new Date().toISOString()
    }));

    localStorage.setItem(STORAGE_KEYS.LAST_TAB, 'tab-menu');
    document.documentElement.setAttribute('data-active-tab', 'tab-menu');
    try { history.replaceState({ tab: 'tab-menu' }, '', '#tab-menu'); } catch (e) {}

    state.isLoggedIn = true;
    showAppScreen();
    showToast(`Login Berhasil! Selamat Datang, ${state.profile.nama}`, 'success');

  } catch (err) {
    showToast(`Gagal Login: ${err.message}`, 'error');
  } finally {
    DOM.btnDoLogin.disabled = false;
    DOM.btnDoLogin.innerHTML = `<i data-lucide="log-in"></i> <span>MASUK APLIKASI</span>`;
    lucide.createIcons();
  }
}

function handleLogout() {
  openLogoutConfirmModal();
}

function performLogout() {
  document.documentElement.classList.remove('is-logged-in');
  document.documentElement.classList.remove('is-admin');
  document.documentElement.removeAttribute('data-active-tab');
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  localStorage.removeItem(STORAGE_KEYS.LAST_TAB);
  showLoginScreen();
  showToast('Anda telah keluar dari akun.', 'info');
}

function saveProfileSilently() {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(state.profile));
}

function updateModeNavVisibility(targetTabId) {
  // Determine active mode
  if (targetTabId === 'tab-menu') {
    state.currentMode = 'menu';
  } else if (targetTabId === 'tab-pending' || targetTabId === 'tab-performa' || targetTabId === 'tab-notif' || targetTabId === 'tab-part-kembali' || targetTabId === 'tab-tagihan') {
    state.currentMode = 'teknisi';
  } else if (targetTabId === 'tab-pipo') {
    state.currentMode = 'pipo';
  } else if (targetTabId === 'tab-finish' || targetTabId === 'tab-finish-all') {
    state.currentMode = 'finish';
  } else if (targetTabId === 'tab-profile') {
    if (!state.currentMode || state.currentMode === 'menu') {
      state.currentMode = 'teknisi';
    }
  }

  if (state.currentMode) {
    try {
      localStorage.setItem('teknisi_last_active_mode', state.currentMode);
      document.documentElement.setAttribute('data-current-mode', state.currentMode);
    } catch(e) {}
  }

  // 1. Header LIHAT DATA Button (#header-btn-missing)
  // Show ONLY on Form Input Finish page (tab-finish). Hide on all other pages.
  if (DOM.headerBtnMissing) {
    DOM.headerBtnMissing.classList.toggle('hidden', targetTabId !== 'tab-finish');
  }

  // 2. Header Bell Notification Button (#header-notif-btn)
  // Show ONLY when in teknisi mode (Pending / Performa / Notif), hide in menu hub!
  if (DOM.headerNotifBtn) {
    DOM.headerNotifBtn.classList.toggle('hidden', state.currentMode !== 'teknisi');
  }

  // 3. On tab-menu (Menu Utama Hub), hide bottom navbar & sheet update bar completely!
  if (targetTabId === 'tab-menu') {
    if (DOM.appNav) DOM.appNav.classList.add('hidden');
    if (DOM.sheetUpdateBar) DOM.sheetUpdateBar.classList.add('hidden');
    return;
  }

  // 4. On sub-pages, show bottom navbar
  if (DOM.appNav) DOM.appNav.classList.remove('hidden');

  // Show sheet update bar only when in teknisi mode
  if (DOM.sheetUpdateBar) {
    DOM.sheetUpdateBar.classList.toggle('hidden', state.currentMode !== 'teknisi');
  }

  // Filter individual navbar items according to active mode
  DOM.navItems.forEach(item => {
    const mode = item.getAttribute('data-mode');

    if (mode === 'all') {
      item.classList.remove('hidden');
    } else if (mode === state.currentMode) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
}

function switchTab(targetTabId, pushState = true) {
  if (state.activeTab === targetTabId) return;

  if (pushState) {
    try {
      history.pushState({ tab: targetTabId }, '', '#' + targetTabId);
    } catch (e) {}
  }
  state.activeTab = targetTabId;
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_TAB, targetTabId);
    document.documentElement.setAttribute('data-active-tab', targetTabId);
  } catch (e) {}

  updateModeNavVisibility(targetTabId);

  DOM.navItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-target') === targetTabId);
  });

  const activeSectionId = (targetTabId === 'tab-finish-all') ? 'tab-finish' : targetTabId;
  DOM.tabContents.forEach(content => {
    content.classList.toggle('active', content.id === activeSectionId);
  });

  if (targetTabId !== 'tab-finish-all') {
    if (DOM.finishAllFilterDate) DOM.finishAllFilterDate.value = '';
    if (DOM.finishAllFilterTech) DOM.finishAllFilterTech.value = '';
    if (DOM.btnClearFinishFilterDate) DOM.btnClearFinishFilterDate.style.display = 'none';
  }

  if (targetTabId === 'tab-pipo') {
    state.pipoSearchQuery = '';
    state.pipoLimit = 40;
    if (DOM.inputSearchPipo) DOM.inputSearchPipo.value = '';
    if (DOM.btnClearSearchPipo) DOM.btnClearSearchPipo.style.display = 'none';
    renderPipoTab();
  }
  if (targetTabId === 'tab-finish-all') {
    if (DOM.btnFinishPageAll) DOM.btnFinishPageAll.classList.add('active');
    if (DOM.btnFinishPageForm) DOM.btnFinishPageForm.classList.remove('active');
    if (DOM.finishPageAll) DOM.finishPageAll.style.display = 'flex';
    if (DOM.finishPageForm) DOM.finishPageForm.style.display = 'none';

    if (DOM.syncIconFinishAll) DOM.syncIconFinishAll.classList.add('spinning');
    fetchFinishSheetData().then(({ parsedAllRows }) => {
      renderFinishAllDataTab(parsedAllRows);
    }).catch(e => {}).finally(() => {
      if (DOM.syncIconFinishAll) DOM.syncIconFinishAll.classList.remove('spinning');
    });
  } else if (targetTabId === 'tab-finish') {
    prepareFinishForm();
    renderFinishHistory();

    if (DOM.btnFinishPageForm) DOM.btnFinishPageForm.classList.add('active');
    if (DOM.btnFinishPageAll) DOM.btnFinishPageAll.classList.remove('active');
    if (DOM.finishPageForm) DOM.finishPageForm.style.display = 'block';
    if (DOM.finishPageAll) DOM.finishPageAll.style.display = 'none';
  }

  renderSheetUpdateInfo();
  lucide.createIcons();
}

function requestTabSwitch(targetTabId) {
  if (state.activeTab === targetTabId) return;
  switchTab(targetTabId, true);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ==========================================
// TOAST SYSTEM
// ==========================================
function showToast(message, type = 'info', duration = 600) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle-2';
  if (type === 'error') iconName = 'alert-circle';

  toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${escapeHtml(message)}</span>`;
  DOM.toastContainer.appendChild(toast);

  lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-6px)';
    toast.style.transition = 'all 0.15s ease';
    setTimeout(() => toast.remove(), 150);
  }, duration);
}

// ==========================================
// GOOGLE SHEETS LIVE DATA INTEGRATION & CACHE MODULE
// ==========================================
const GOOGLE_SHEET_ID_PIPO = '1cFbwWRRxD6vj7XNFLzmxF_Mma9TP3qvsdMSEYIDg47M';

window.copyTextToClipboard = function(text, label = 'Kode Part') {
  if (!text || text === '-') return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`📋 ${label} (${text}) berhasil disalin!`, 'success');
    }).catch(() => {
      fallbackCopyText(text, label);
    });
  } else {
    fallbackCopyText(text, label);
  }
};

function fallbackCopyText(text, label) {
  try {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
    showToast(`📋 ${label} (${text}) berhasil disalin!`, 'success');
  } catch (e) {
    showToast(`Gagal menyalin: ${text}`, 'error');
  }
}

async function fetchGVizSheetCustom(sheetId, sheetName) {
  try {
    return await new Promise((resolve, reject) => {
      const callbackName = 'gviz_cb_' + Math.floor(Math.random() * 1000000);
      const timeout = setTimeout(() => {
        if (window[callbackName]) delete window[callbackName];
        const el = document.getElementById(callbackName);
        if (el) el.remove();
        reject(new Error(`Timeout fetching sheet ${sheetName}`));
      }, 10000);

      window[callbackName] = function(response) {
        clearTimeout(timeout);
        delete window[callbackName];
        const el = document.getElementById(callbackName);
        if (el) el.remove();
        if (response && response.table) {
          resolve(response.table);
        } else {
          reject(new Error(`Response table invalid for sheet ${sheetName}`));
        }
      };

      const script = document.createElement('script');
      script.id = callbackName;
      script.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=responseHandler:${callbackName}&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
      script.onerror = function(err) {
        clearTimeout(timeout);
        if (window[callbackName]) delete window[callbackName];
        script.remove();
        reject(err);
      };
      document.body.appendChild(script);
    });
  } catch (jsonpErr) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
    const res = await fetch(url);
    const text = await res.text();
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
    if (!jsonMatch) throw new Error(`Format respon Google Sheet ${sheetName} tidak valid`);
    const parsed = JSON.parse(jsonMatch[1]);
    return parsed.table;
  }
}

function loadPipoCache() {
  const cached = localStorage.getItem(STORAGE_KEYS.PIPO_CACHE);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        state.pipoData = parsed.map(item => {
          if (Array.isArray(item)) {
            return {
              typeOff: item[0] || '',
              partOff: item[1] || '',
              namaOff: item[2] || '',
              typeIn: item[3] || '',
              partIn: item[4] || '',
              namaIn: item[5] || '',
              teknisi: item[6] || '',
              hasilCek: item[7] || 'BISA MENGGANTIKAN'
            };
          }
          return item;
        });
        renderPipoTab();
      }
    } catch (e) {
      console.warn('Gagal parse cache PIPO:', e);
    }
  }
}

function savePipoCache() {
  if (!state.pipoData || state.pipoData.length === 0) return;

  try {
    // Compress objects into compact 2D tuple matrix (saves >75% LocalStorage quota space)
    const compactMatrix = state.pipoData.map(item => [
      item.typeOff || '',
      item.partOff || '',
      item.namaOff || '',
      item.typeIn || '',
      item.partIn || '',
      item.namaIn || '',
      item.teknisi || '',
      item.hasilCek || ''
    ]);

    localStorage.setItem(STORAGE_KEYS.PIPO_CACHE, JSON.stringify(compactMatrix));
  } catch (e) {
    console.warn('Quota LocalStorage penuh, membersihkan cache lama...', e);
    try {
      localStorage.removeItem('google_sheets_cache');
      const compactMatrix = state.pipoData.slice(0, 1000).map(item => [
        item.typeOff || '',
        item.partOff || '',
        item.namaOff || '',
        item.typeIn || '',
        item.partIn || '',
        item.namaIn || '',
        item.teknisi || '',
        item.hasilCek || ''
      ]);
      localStorage.setItem(STORAGE_KEYS.PIPO_CACHE, JSON.stringify(compactMatrix));
    } catch (err2) {
      // Silent fallback: app runs seamlessly using in-memory state
    }
  }
}

async function fetchPipoData() {
  if (state.isFetchingPipo) return;
  state.isFetchingPipo = true;

  try {
    const tablePipo = await fetchGVizSheetCustom(GOOGLE_SHEET_ID_PIPO, 'PIPO');
    const rows = extractMatrixFromGViz(tablePipo);

    const pipoItems = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length < 5) continue;

      const typeOff = row[0] || '';
      const partOff = row[1] || '';
      const namaOff = row[2] || '';
      const typeIn = row[3] || '';
      const partIn = row[4] || '';
      const namaIn = row[5] || '';
      const teknisi = row[6] || '';
      const hasilCek = row[7] || 'BISA MENGGANTIKAN';

      if (partOff || partIn) {
        pipoItems.push({
          typeOff,
          partOff,
          namaOff,
          typeIn,
          partIn,
          namaIn,
          teknisi,
          hasilCek
        });
      }
    }

    state.pipoData = pipoItems;
    savePipoCache();
    renderPipoTab();

  } catch (err) {
    console.warn('Gagal fetch data PIPO Sheet:', err);
    if (DOM.pipoListContainer) {
      // If cache exists, keep using cached data
      if (state.pipoData && state.pipoData.length > 0) {
        renderPipoTab();
      } else {
        DOM.pipoListContainer.innerHTML = `
          <div class="empty-state-sm text-danger">
            <i data-lucide="alert-circle"></i>
            <p>Gagal memuat data PIPO: ${escapeHtml(err.message)}</p>
          </div>`;
        lucide.createIcons();
      }
    }
  } finally {
    state.isFetchingPipo = false;
  }
}

function renderPipoTab() {
  if (!DOM.pipoListContainer) return;
  if (!DOM.pipoDefaultHeader) {
    DOM.pipoDefaultHeader = document.getElementById('pipo-default-header');
  }

  const list = state.pipoData || [];
  const searchQ = (state.pipoSearchQuery || '').trim().toUpperCase();

  // ==========================================================
  // MODE 1: TAMPILAN DATA DEFAULT (TANPA PENCARIAN)
  // Simpel perbaris: Kolom B (Kiri) ⇄ Kolom E (Kanan) - No Gudang SAJA
  // ==========================================================
  if (!searchQ) {
    if (DOM.pipoDefaultHeader) DOM.pipoDefaultHeader.style.display = 'grid';

    if (DOM.pipoCount) {
      DOM.pipoCount.textContent = `${list.length} Data`;
    }

    if (list.length === 0) {
      DOM.pipoListContainer.innerHTML = `
        <div class="empty-state-sm">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);margin-bottom:6px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <p>Belum ada data part pengganti.</p>
        </div>`;
      return;
    }

    const maxLimit = state.pipoLimit || 50;
    const visibleList = list.slice(0, maxLimit);

    let html = visibleList.map((item) => {
      const b = (item.partOff || '-').trim();
      const e = (item.partIn || '-').trim();
      const targetQuery = b !== '-' ? b : e;
      return `
        <div class="pipo-simple-row" onclick="fillPipoSearch('${escapeHtml(targetQuery)}')">
          <div class="pipo-col-left">${escapeHtml(b)}</div>
          <div class="pipo-col-mid"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--warning);"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></div>
          <div class="pipo-col-right">${escapeHtml(e)}</div>
        </div>
      `;
    }).join('');

    if (list.length > maxLimit) {
      html += `
        <div class="my-3" style="padding: 6px 0 16px 0;">
          <button type="button" class="btn-load-more-pipo" onclick="window.loadMorePipoItems()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
            Tampilkan Lebih Banyak (${visibleList.length} dari ${list.length} Data)
          </button>
        </div>`;
    }

    DOM.pipoListContainer.innerHTML = html;
    return;
  }

  // ==========================================================
  // MODE 2: TAMPILAN HASIL PENCARIAN (DETAIL KATA KUNCI)
  // Sederhana tapi detail: No Gudang, Deskripsi, Type (A/D)
  // ==========================================================
  if (DOM.pipoDefaultHeader) DOM.pipoDefaultHeader.style.display = 'none';

  const uniqueReplacementsMap = new Map();

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const partOff = (item.partOff || '').trim();
    const partOffUpper = partOff.toUpperCase();
    const namaOff = item.namaOff || '';
    const typeOff = item.typeOff || '';

    const partIn = (item.partIn || '').trim();
    const partInUpper = partIn.toUpperCase();
    const namaIn = item.namaIn || '';
    const typeIn = item.typeIn || '';

    if (!partOff && !partIn) continue;

    const matchOff = partOffUpper.includes(searchQ) || (namaOff && namaOff.toUpperCase().includes(searchQ)) || (typeOff && typeOff.toUpperCase().includes(searchQ));
    const matchIn = partInUpper.includes(searchQ) || (namaIn && namaIn.toUpperCase().includes(searchQ)) || (typeIn && typeIn.toUpperCase().includes(searchQ));

    // Direction A: Searched part matches PLUG OFF -> Replacement is PLUG IN
    if (matchOff && partIn) {
      if (!uniqueReplacementsMap.has(partInUpper)) {
        uniqueReplacementsMap.set(partInUpper, {
          partNo: partIn,
          namaPart: namaIn,
          type: typeIn || typeOff
        });
      }
    }

    // Direction B: Searched part matches PLUG IN -> Replacement is PLUG OFF
    if (matchIn && partOff) {
      if (!uniqueReplacementsMap.has(partOffUpper)) {
        uniqueReplacementsMap.set(partOffUpper, {
          partNo: partOff,
          namaPart: namaOff,
          type: typeOff
        });
      }
    }
  }

  const replacementsArray = Array.from(uniqueReplacementsMap.values());

  if (DOM.pipoCount) {
    DOM.pipoCount.textContent = `${replacementsArray.length} Data`;
  }

  if (replacementsArray.length === 0) {
    DOM.pipoListContainer.innerHTML = `
      <div class="empty-state-sm">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);margin-bottom:6px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        <p>Part pengganti tidak ditemukan untuk "${escapeHtml(state.pipoSearchQuery)}".</p>
      </div>`;
    return;
  }

  const maxLimit = state.pipoLimit || 60;
  const visibleReplacements = replacementsArray.slice(0, maxLimit);

  let html = visibleReplacements.map(rep => `
    <div class="pipo-card">
      <div class="pipo-sub-part-no">${escapeHtml(rep.partNo || '-')}</div>
      ${rep.namaPart ? `<div class="pipo-sub-part-desc">${escapeHtml(rep.namaPart)}</div>` : ''}
      ${rep.type ? `<div class="pipo-sub-type-badge">Type: ${escapeHtml(rep.type)}</div>` : ''}
    </div>
  `).join('');

  if (replacementsArray.length > maxLimit) {
    html += `
      <div class="my-3" style="padding: 6px 0 16px 0;">
        <button type="button" class="btn-load-more-pipo" onclick="window.loadMorePipoItems()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
          Tampilkan Lebih Banyak (${visibleReplacements.length} dari ${replacementsArray.length} Part)
        </button>
      </div>`;
  }

  DOM.pipoListContainer.innerHTML = html;
}

const GOOGLE_FORM_FINISH_URL = '';
const APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyg2nMUkFC9GPYPrwqP2hzYuuU7_l4wNSC3_mfAJgOtjmD-piOWRludX_tzmYbTiIaX-Q/exec';


const VALID_FORM_TECHNICIANS = [
  'Amin Prayogo',
  'Redi Takwa',
  'Zulfi Fajriansyah',
  'Mursyid Alfiansyah',
  'M.Ilman',
  'SID Kenu ngudi Raharjo',
  'Irfan Taufan',
  'Roni Surya Nugraha'
];

function prepareFinishForm() {
  if (DOM.finishTgl) {
    if (!DOM.finishTgl.value) {
      const today = new Date().toISOString().split('T')[0];
      DOM.finishTgl.type = 'date';
      DOM.finishTgl.value = today;
    } else {
      DOM.finishTgl.type = 'date';
    }
  }

  // Clear numeric inputs so they are empty by default (no 0)
  if (DOM.finishCaseOutdoor) DOM.finishCaseOutdoor.value = '';
  if (DOM.finishFinishOutdoor) DOM.finishFinishOutdoor.value = '';
  if (DOM.finishFinishIndoor) DOM.finishFinishIndoor.value = '';
  if (DOM.finishWipComp) DOM.finishWipComp.value = '';
  if (DOM.finishWipTech) DOM.finishWipTech.value = '';
  if (DOM.finishBatal) DOM.finishBatal.value = '';
  if (DOM.finishAntar) DOM.finishAntar.value = '';
  if (DOM.finishNoVisit) DOM.finishNoVisit.value = '';
  if (DOM.finishKet) DOM.finishKet.value = '';

  if (DOM.finishNama) {
    const rawList = [...VALID_FORM_TECHNICIANS];
    if (state.adminUsers && state.adminUsers.length > 0) {
      state.adminUsers.forEach(u => {
        if (u.nama && u.nama.trim()) rawList.push(u.nama.trim());
      });
    }

    // Deduplicate case-insensitively
    const seen = new Set();
    const choices = [];
    rawList.forEach(name => {
      const normalized = name.trim().toLowerCase();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        choices.push(name.trim());
      }
    });

    const currentSelected = DOM.finishNama.value;
    DOM.finishNama.innerHTML = choices.map(t =>
      `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`
    ).join('');

    const loggedInName = state.profile ? state.profile.nama : (state.user ? state.user.nama : '');

    if (state.isAdmin) {
      DOM.finishNama.disabled = false;
      if (currentSelected && choices.includes(currentSelected)) {
        DOM.finishNama.value = currentSelected;
      }
    } else {
      DOM.finishNama.disabled = true;
      let match = choices.find(
        t => t.toLowerCase().trim() === loggedInName.toLowerCase().trim()
      );
      if (!match) {
        match = choices.find(
          t => t.toLowerCase().includes(loggedInName.toLowerCase().trim()) || loggedInName.toLowerCase().includes(t.toLowerCase().trim())
        );
      }
      if (match) {
        DOM.finishNama.value = match;
      } else if (loggedInName) {
        const normLoggedIn = loggedInName.trim().toLowerCase();
        if (!seen.has(normLoggedIn)) {
          const opt = document.createElement('option');
          opt.value = loggedInName.trim();
          opt.textContent = loggedInName.trim();
          DOM.finishNama.appendChild(opt);
        }
        DOM.finishNama.value = loggedInName.trim();
      }
    }
  }
}

function openFinishConfirmModal() {
  const tglVal = DOM.finishTgl ? DOM.finishTgl.value : '';
  if (!tglVal) {
    showToast('⚠️ Mohon pilih tanggal laporan!', 'warning');
    if (DOM.finishTgl) DOM.finishTgl.focus();
    return;
  }

  state.modalAction = 'submitFinish';
  if (DOM.modalConfirmTitle) DOM.modalConfirmTitle.innerHTML = `<i data-lucide="clipboard-check"></i> Konfirmasi Kirim Finish Harian`;
  if (DOM.modalConfirmMsg) DOM.modalConfirmMsg.textContent = 'Apakah data yang Anda masukkan sudah benar?';
  if (DOM.modalConfirmOkText) DOM.modalConfirmOkText.textContent = 'Ya, Kirim Laporan';
  if (DOM.modalConfirm) DOM.modalConfirm.classList.add('active');
  if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

const INDONESIAN_HOLIDAYS_2026 = [
  '2026-01-01', '2026-01-16', '2026-02-17', '2026-03-19', '2026-03-20',
  '2026-03-21', '2026-04-03', '2026-04-05', '2026-05-01', '2026-05-14',
  '2026-05-27', '2026-05-31', '2026-06-01', '2026-06-16', '2026-08-17',
  '2026-08-25', '2026-12-25'
];

function isNationalHolidayOrSunday(d) {
  if (d.getDay() === 0) return true; // Sunday
  const isoStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return INDONESIAN_HOLIDAYS_2026.includes(isoStr);
}

function formatDateIndoFull(d) {
  const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${DAYS_ID[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

function normalizeDateString(str) {
  if (!str) return '';
  str = String(str).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const dmyMatch = str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  const ymdMatch = str.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return str;
}

async function fetchFinishSheetData() {
  const filledDatesSet = new Set();
  const parsedAllRows = [];
  const targetTechName = DOM.finishNama ? DOM.finishNama.value : (state.profile ? state.profile.nama : '');

  const FINISH_SPREADSHEET_ID = GOOGLE_SHEET_ID;

  let rows = [];
  try {
    const table = await fetchGVizSheetCustom(FINISH_SPREADSHEET_ID, 'FINISH');
    rows = extractMatrixFromGViz(table);
  } catch (e1) {
    try {
      const table = await fetchGVizSheetCustom(FINISH_SPREADSHEET_ID, 'finish');
      rows = extractMatrixFromGViz(table);
    } catch (e2) {
      try {
        const table = await fetchGVizSheetCustom(FINISH_SPREADSHEET_ID, 'FINISH HARIAN');
        rows = extractMatrixFromGViz(table);
      } catch (e3) {
        console.warn('Gagal fetch sheet finish response:', e3);
      }
    }
  }

  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  if (rows && rows.length > 0) {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 4) continue;

      const rowNama = String(row[2] || row[1] || '').trim();
      const rowTglRaw = String(row[3] || row[2] || '').trim();

      if (rowNama.toUpperCase() === 'NAMA TEKNISI' || rowNama.toUpperCase() === 'NAMA') continue;

      if (rowNama && rowTglRaw) {
        const normTgl = normalizeDateString(rowTglRaw);
        if (normTgl && /^\d{4}-\d{2}-\d{2}$/.test(normTgl)) {
          // Check if record belongs to current month & year
          if (normTgl.startsWith(currentYearMonth)) {
            const entryObj = {
              id: row[0] || i,
              timestampCreated: String(row[1] || '').trim(),
              nama: rowNama,
              tglLaporan: normTgl,
              tglRaw: rowTglRaw,
              caseOutdoor: parseInt(row[4] || 0, 10) || 0,
              finishOutdoor: parseInt(row[5] || 0, 10) || 0,
              finishIndoor: parseInt(row[6] || 0, 10) || 0,
              wipComp: parseInt(row[7] || 0, 10) || 0,
              wipTech: parseInt(row[8] || 0, 10) || 0,
              batal: parseInt(row[9] || 0, 10) || 0,
              antar: parseInt(row[10] || 0, 10) || 0,
              noVisit: parseInt(row[11] || 0, 10) || 0,
              ket: String(row[12] || '').trim(),
              bulan: String(row[13] || '').trim()
            };

            // Filter according to user role / logged in user
            if (state.isAdmin || matchTechName(rowNama, targetTechName, state.profile ? state.profile.nik : '')) {
              parsedAllRows.push(entryObj);
            }

            if (targetTechName && isSameTechnicianName(rowNama, targetTechName)) {
              filledDatesSet.add(normTgl);
            }
          }
        }
      }
    }
  }

  // Incorporate local submissions in state.finishHistory
  if (state.finishHistory && state.finishHistory.length > 0) {
    for (const localEntry of state.finishHistory) {
      if (localEntry.tglLaporan && localEntry.tglLaporan.startsWith(currentYearMonth)) {
        if (!parsedAllRows.some(r => r.tglLaporan === localEntry.tglLaporan && isSameTechnicianName(r.nama, localEntry.nama))) {
          parsedAllRows.push(localEntry);
        }
        if (targetTechName && isSameTechnicianName(localEntry.nama, targetTechName)) {
          filledDatesSet.add(localEntry.tglLaporan);
        }
      }
    }
  }

  // Sort parsedAllRows by tglLaporan descending
  parsedAllRows.sort((a, b) => b.tglLaporan.localeCompare(a.tglLaporan));
  state.finishParsedAllRows = parsedAllRows;

  // Save finish cache to localStorage
  try {
    const nikKey = (state.profile && state.profile.nik) ? String(state.profile.nik).trim() : 'guest';
    const cacheKey = STORAGE_KEYS.FINISH_SHEET_CACHE + '_' + nikKey;
    localStorage.setItem(cacheKey, JSON.stringify({
      parsedAllRows,
      filledDates: Array.from(filledDatesSet),
      timestamp: Date.now()
    }));
  } catch (e) {}

  return { filledDatesSet, parsedAllRows };
}

function loadFinishSheetCache() {
  try {
    const nikKey = (state.profile && state.profile.nik) ? String(state.profile.nik).trim() : 'guest';
    const cacheKey = STORAGE_KEYS.FINISH_SHEET_CACHE + '_' + nikKey;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.parsedAllRows) {
        state.finishParsedAllRows = parsed.parsedAllRows;
        return {
          filledDatesSet: new Set(parsed.filledDates || []),
          parsedAllRows: parsed.parsedAllRows
        };
      }
    }
  } catch (e) {}
  return { filledDatesSet: new Set(), parsedAllRows: [] };
}

function renderFinishAllDataTab(parsedRows = null) {
  if (!DOM.finishPageAll) return;
  const rows = parsedRows || state.finishParsedAllRows || [];

  const dateFilter = DOM.finishAllFilterDate ? DOM.finishAllFilterDate.value : '';
  const techFilter = DOM.finishAllFilterTech ? DOM.finishAllFilterTech.value.trim().toUpperCase() : '';

  if (DOM.finishAllTechFilterWrapper) {
    DOM.finishAllTechFilterWrapper.style.display = state.isAdmin ? 'flex' : 'none';
  }

  if (DOM.btnClearFinishFilterDate) {
    DOM.btnClearFinishFilterDate.style.display = (dateFilter || techFilter) ? 'inline-flex' : 'none';
  }

  // Filter rows
  const filtered = rows.filter(item => {
    if (dateFilter && item.tglLaporan !== dateFilter) return false;
    if (techFilter && !item.nama.toUpperCase().includes(techFilter)) return false;
    return true;
  });

  let totalOutdoorFinish = 0;
  let totalIndoorFinish = 0;
  let totalWipComp = 0;
  let totalWipTech = 0;
  let totalBatal = 0;

  filtered.forEach(r => {
    totalOutdoorFinish += r.finishOutdoor;
    totalIndoorFinish += r.finishIndoor;
    totalWipComp += r.wipComp;
    totalWipTech += r.wipTech;
    totalBatal += r.batal;
  });

  const now = new Date();
  const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const monthLabel = `${MONTHS_ID[now.getMonth()]} ${now.getFullYear()}`;

  if (DOM.finishAllSummary) {
    DOM.finishAllSummary.innerHTML = `
      <div style="background:var(--card-bg-light); border-left:3px solid var(--primary); padding:8px 10px; border-radius:6px; margin-bottom:8px;">
        <div class="flex-between align-center">
          <strong style="color:var(--text-color); font-size:12px;">📊 Total Laporan Bulan Ini (${monthLabel})</strong>
          <span class="badge" style="background:var(--primary-light); color:var(--primary); font-size:11px; font-weight:700;">${filtered.length} Entry</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:4px; margin-top:6px; text-align:center; font-size:10px;">
          <div style="background:var(--bg-input); padding:4px; border-radius:4px;"><span style="color:var(--text-muted); font-size:9px;">OUTDOOR</span><br/><strong style="color:var(--success);">${totalOutdoorFinish}</strong></div>
          <div style="background:var(--bg-input); padding:4px; border-radius:4px;"><span style="color:var(--text-muted); font-size:9px;">INDOOR</span><br/><strong style="color:var(--primary);">${totalIndoorFinish}</strong></div>
          <div style="background:var(--bg-input); padding:4px; border-radius:4px;"><span style="color:var(--text-muted); font-size:9px;">WIP COMP</span><br/><strong style="color:var(--warning);">${totalWipComp}</strong></div>
          <div style="background:var(--bg-input); padding:4px; border-radius:4px;"><span style="color:var(--text-muted); font-size:9px;">WIP TECH</span><br/><strong style="color:var(--secondary);">${totalWipTech}</strong></div>
          <div style="background:var(--bg-input); padding:4px; border-radius:4px;"><span style="color:var(--text-muted); font-size:9px;">BATAL</span><br/><strong style="color:var(--danger);">${totalBatal}</strong></div>
        </div>
      </div>`;
  }

  if (DOM.finishAllList) {
    if (filtered.length === 0) {
      DOM.finishAllList.innerHTML = `
        <div style="text-align:center; padding:20px 10px; color:var(--text-muted);">
          <i data-lucide="inbox" style="width:36px; height:36px; margin-bottom:6px;"></i>
          <p style="font-weight:700; font-size:12px; margin:0;">Tidak Ada Data Laporan</p>
          <span style="font-size:10.5px;">${dateFilter ? `Tidak ada laporan pada tanggal ${dateFilter}` : 'Belum ada laporan terdaftar untuk bulan ini.'}</span>
        </div>`;
    } else {
      DOM.finishAllList.innerHTML = filtered.map(item => {
        const parts = item.tglLaporan.split('-');
        const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const formattedDate = formatDateIndoFull(dateObj);

        return `
          <div class="finish-data-card">
            <div class="finish-data-header">
              <div class="finish-data-tgl">
                <i data-lucide="calendar" style="width:14px; height:14px; color:var(--primary);"></i>
                ${escapeHtml(formattedDate)}
              </div>
              <span class="finish-data-tech">${escapeHtml(item.nama)}</span>
            </div>
            <div class="finish-stats-grid">
              <div class="finish-stat-box"><label>Outdoor (Fin/Tgs)</label><strong>${item.finishOutdoor} / ${item.caseOutdoor}</strong></div>
              <div class="finish-stat-box"><label>Indoor Finish</label><strong style="color:var(--primary);">${item.finishIndoor}</strong></div>
              <div class="finish-stat-box"><label>WIP COMP</label><strong style="color:var(--warning);">${item.wipComp}</strong></div>
              <div class="finish-stat-box"><label>WIP TECH</label><strong style="color:var(--secondary);">${item.wipTech}</strong></div>
              <div class="finish-stat-box"><label>Batal</label><strong style="color:var(--danger);">${item.batal}</strong></div>
              <div class="finish-stat-box"><label>Antar / No Visit</label><strong>${item.antar} / ${item.noVisit}</strong></div>
            </div>
            ${item.ket ? `<div style="margin-top:6px; font-size:10.5px; color:var(--text-muted); background:var(--bg-input); padding:4px 8px; border-radius:4px;"><i data-lucide="message-square" style="width:11px; height:11px; vertical-align:middle; margin-right:3px;"></i>${escapeHtml(item.ket)}</div>` : ''}
            ${item.timestampCreated ? `<div style="margin-top:4px; font-size:9.5px; color:var(--text-muted); text-align:right;">Input: ${escapeHtml(item.timestampCreated)}</div>` : ''}
          </div>`;
      }).join('');
    }
  }

  lucide.createIcons();
}

async function openMissingModal(isAutoRefresh = false, isManualRefresh = false) {
  if (!DOM.modalMissingFinish) return;

  // Automatically set active page to Form Input Finish
  switchTab('tab-finish');
  if (DOM.finishPageForm) DOM.finishPageForm.style.display = 'block';
  if (DOM.finishPageAll) DOM.finishPageAll.style.display = 'none';

  DOM.modalMissingFinish.classList.add('active');

  if (!isAutoRefresh && !isManualRefresh) {
    try {
      history.pushState({ modal: 'missing_finish', tab: state.activeTab }, '', '#lihat-data');
    } catch (e) {}
  }

  const iconEl = document.getElementById('sync-icon-missing') || DOM.syncIconMissing;
  if (iconEl) iconEl.classList.add('spinning');

  // Show bottom loading spinner ONLY when opening for the first time (not auto-refresh & not manual refresh button click)
  if (!isAutoRefresh && !isManualRefresh && DOM.missingFinishSummary) {
    DOM.missingFinishSummary.innerHTML = `
      <div style="text-align:center; padding:14px; color:var(--text-muted);">
        <i data-lucide="loader-2" class="spin-lg"></i>
        <p style="margin-top:6px; font-size:12px; font-weight:600;">Memuat data...</p>
      </div>`;
    lucide.createIcons();
  }

  try {
    const { filledDatesSet, parsedAllRows } = await fetchFinishSheetData();
    renderMissingDatesList(filledDatesSet);
    renderFinishAllDataTab(parsedAllRows);
  } catch (err) {
    console.warn('Error openMissingModal:', err);
  } finally {
    const activeIconEl = document.getElementById('sync-icon-missing') || DOM.syncIconMissing;
    if (activeIconEl) activeIconEl.classList.remove('spinning');
  }

  startMissingAutoRefresh();
}

function startMissingAutoRefresh() {
  stopMissingAutoRefresh();
  state.missingModalTimer = setInterval(() => {
    if (DOM.modalMissingFinish && DOM.modalMissingFinish.classList.contains('active')) {
      openMissingModal(true);
    } else {
      stopMissingAutoRefresh();
    }
  }, 10000); // Auto refresh every 10 seconds
}

function stopMissingAutoRefresh() {
  if (state.missingModalTimer) {
    clearInterval(state.missingModalTimer);
    state.missingModalTimer = null;
  }
}

function renderMissingDatesList(filledDatesSet) {
  const targetTechName = DOM.finishNama ? DOM.finishNama.value : (state.profile ? state.profile.nama : '');
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();

  const missingDates = [];
  let totalWorkingDays = 0;
  let filledCount = 0;

  for (let day = 1; day <= todayDate; day++) {
    const d = new Date(year, month, day);
    if (!isNationalHolidayOrSunday(d)) {
      totalWorkingDays++;
      const isoStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (filledDatesSet.has(isoStr)) {
        filledCount++;
      } else {
        missingDates.push({ dateStr: isoStr, dateObj: d });
      }
    }
  }

  const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const monthLabel = `${MONTHS_ID[month]} ${year}`;

  if (DOM.missingFinishSummary) {
    DOM.missingFinishSummary.innerHTML = `
      <div style="background:var(--card-bg-light); border-left:3px solid var(--primary); padding:8px 10px; border-radius:6px; margin-bottom:8px;">
        <strong style="color:var(--text-color);">${escapeHtml(targetTechName || 'Teknisi')}</strong> &bull; Periode: <strong>${monthLabel}</strong> (s/d Hari Ini)<br/>
        <span>Total Hari Kerja: <strong>${totalWorkingDays} hari</strong> | Terisi: <strong style="color:var(--success);">${filledCount}</strong> | Belum Isi: <strong style="color:var(--danger);">${missingDates.length}</strong></span>
      </div>`;
  }

  if (DOM.missingFinishList) {
    if (missingDates.length === 0) {
      DOM.missingFinishList.innerHTML = `
        <div style="text-align:center; padding:20px 10px; color:var(--success);">
          <i data-lucide="check-circle-2" style="width:40px; height:40px; margin-bottom:6px;"></i>
          <p style="font-weight:700; font-size:13px; margin:0;">Luar Biasa! Semua Laporan Terisi</p>
          <span style="font-size:11px; color:var(--text-muted);">Tidak ada tanggal kerja yang terlewat bulan ini.</span>
        </div>`;
    } else {
      DOM.missingFinishList.innerHTML = missingDates.map(item => `
        <div class="missing-date-card flex-between align-center" onclick="selectMissingDate('${item.dateStr}')" style="background:var(--card-bg-light); padding:10px 12px; border-radius:8px; border:1px solid var(--border-color); cursor:pointer; transition:all 0.2s ease;">
          <div>
            <div style="font-weight:700; font-size:13px; color:var(--text-color);">${escapeHtml(formatDateIndoFull(item.dateObj))}</div>
            <div style="font-size:10.5px; color:var(--danger); margin-top:1px;"><i data-lucide="alert-circle" style="width:11px; height:11px; vertical-align:middle; margin-right:2px;"></i>Belum ada laporan finish harian</div>
          </div>
          <button type="button" class="btn btn-primary btn-xs" style="font-weight:600; padding:4px 8px; font-size:11px;">
            Pilih Tanggal <i data-lucide="arrow-right" style="width:12px; height:12px;"></i>
          </button>
        </div>
      `).join('');
    }
  }

  lucide.createIcons();
}

function closeMissingModal(triggerHistoryBack = true) {
  stopMissingAutoRefresh();
  if (DOM.modalMissingFinish) {
    const wasActive = DOM.modalMissingFinish.classList.contains('active');
    DOM.modalMissingFinish.classList.remove('active');
    if (wasActive && triggerHistoryBack && history.state && history.state.modal === 'missing_finish') {
      try { history.back(); } catch (e) {}
    }
  }
}

window.selectMissingDate = function(dateStr) {
  if (DOM.finishTgl) {
    DOM.finishTgl.type = 'date';
    DOM.finishTgl.value = dateStr;
  }
  closeMissingModal();

  switchTab('tab-finish');
  if (DOM.finishPageForm) DOM.finishPageForm.style.display = 'block';
  if (DOM.finishPageAll) DOM.finishPageAll.style.display = 'none';

  showToast(`📅 Tanggal ${dateStr} dipilih untuk diisi!`, 'info');
};

function playBeepSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {}
}

async function handleSubmitFinish() {
  const namaTeknisi = DOM.finishNama ? DOM.finishNama.value.trim() : (state.profile ? state.profile.nama : '');
  const tglVal = DOM.finishTgl ? DOM.finishTgl.value : '';
  const caseOutdoor = (DOM.finishCaseOutdoor && DOM.finishCaseOutdoor.value.trim() !== '') ? DOM.finishCaseOutdoor.value.trim() : '0';
  const finishOutdoor = (DOM.finishFinishOutdoor && DOM.finishFinishOutdoor.value.trim() !== '') ? DOM.finishFinishOutdoor.value.trim() : '0';
  const finishIndoor = (DOM.finishFinishIndoor && DOM.finishFinishIndoor.value.trim() !== '') ? DOM.finishFinishIndoor.value.trim() : '0';
  const wipComp = (DOM.finishWipComp && DOM.finishWipComp.value.trim() !== '') ? DOM.finishWipComp.value.trim() : '0';
  const wipTech = (DOM.finishWipTech && DOM.finishWipTech.value.trim() !== '') ? DOM.finishWipTech.value.trim() : '0';
  const caseBatal = (DOM.finishBatal && DOM.finishBatal.value.trim() !== '') ? DOM.finishBatal.value.trim() : '0';
  const pengembalian = (DOM.finishAntar && DOM.finishAntar.value.trim() !== '') ? DOM.finishAntar.value.trim() : '0';
  const noVisit = (DOM.finishNoVisit && DOM.finishNoVisit.value.trim() !== '') ? DOM.finishNoVisit.value.trim() : '0';
  const ket = (DOM.finishKet && DOM.finishKet.value.trim() !== '') ? DOM.finishKet.value.trim() : '-';

  if (!tglVal) {
    showToast('⚠️ Mohon pilih tanggal laporan!', 'warning');
    if (DOM.finishTgl) DOM.finishTgl.focus();
    return;
  }

  const newEntry = {
    id: Date.now(),
    timestampCreated: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    nama: namaTeknisi || 'Teknisi',
    tglLaporan: tglVal,
    tglRaw: tglVal,
    caseOutdoor: parseInt(caseOutdoor, 10) || 0,
    finishOutdoor: parseInt(finishOutdoor, 10) || 0,
    finishIndoor: parseInt(finishIndoor, 10) || 0,
    wipComp: parseInt(wipComp, 10) || 0,
    wipTech: parseInt(wipTech, 10) || 0,
    batal: parseInt(caseBatal, 10) || 0,
    antar: parseInt(pengembalian, 10) || 0,
    noVisit: parseInt(noVisit, 10) || 0,
    ket: ket
  };

  if (!state.finishHistory) state.finishHistory = [];
  const existingIdx = state.finishHistory.findIndex(item => item.tglLaporan === tglVal && isSameTechnicianName(item.nama, namaTeknisi));
  if (existingIdx !== -1) {
    state.finishHistory[existingIdx] = newEntry;
  } else {
    state.finishHistory.unshift(newEntry);
  }

  try {
    localStorage.setItem(STORAGE_KEYS.FINISH_HISTORY, JSON.stringify(state.finishHistory));
  } catch (e) {}

  // Send to Google Apps Script Web App if URL is provided
  if (APPS_SCRIPT_WEB_APP_URL && APPS_SCRIPT_WEB_APP_URL.trim() !== '') {
    try {
      fetch(APPS_SCRIPT_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'appendFinish',
          timestampCreated: newEntry.timestampCreated,
          nama: newEntry.nama,
          tglLaporan: newEntry.tglLaporan,
          caseOutdoor: newEntry.caseOutdoor,
          finishOutdoor: newEntry.finishOutdoor,
          finishIndoor: newEntry.finishIndoor,
          wipComp: newEntry.wipComp,
          wipTech: newEntry.wipTech,
          batal: newEntry.batal,
          antar: newEntry.antar,
          noVisit: newEntry.noVisit,
          ket: newEntry.ket
        })
      }).catch(err => console.warn('Apps Script submit warning:', err));
    } catch (e) {}
  }

  prepareFinishForm();
  renderFinishHistory();

  fetchFinishSheetData().then(({ filledDatesSet, parsedAllRows }) => {
    renderMissingDatesList(filledDatesSet);
    renderFinishAllDataTab(parsedAllRows);
  }).catch(() => {});

  showToast('✅ Finish Harian berhasil disimpan!', 'success');
  playBeepSound();
}

function renderFinishHistory() {
  if (!DOM.finishHistoryList) return;
  const list = state.finishHistory || [];

  if (list.length === 0) {
    DOM.finishHistoryList.innerHTML = `
      <div class="empty-state-sm">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);margin-bottom:6px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="15" y2="13"></line></svg>
        <p>Belum ada riwayat finish harian yang di-submit.</p>
      </div>`;
    return;
  }

  DOM.finishHistoryList.innerHTML = list.map(item => `
    <div class="finish-history-card">
      <div class="flex-between align-center mb-1">
        <span style="font-size:11px; font-weight:600; color:var(--primary);">${escapeHtml(item.nama)}</span>
        <span style="font-size:10px; color:var(--text-muted);">${escapeHtml(item.timestamp)}</span>
      </div>
      <div style="font-weight:700; font-size:13px; color:var(--text-color);">Tanggal: ${escapeHtml(item.tgl)}</div>
      <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">
        Finish In: ${escapeHtml(item.finishIndoor)} | Finish Out: ${escapeHtml(item.finishOutdoor)} | WIP Comp: ${escapeHtml(item.wipComp)} | Batal: ${escapeHtml(item.batal)}
      </div>
      ${item.ket ? `<div style="font-size:11px; color:var(--text-muted); font-style:italic; margin-top:2px;">Ket: ${escapeHtml(item.ket)}</div>` : ''}
    </div>
  `).join('');
}

window.loadMorePipoItems = function() {
  const currentLimit = state.pipoLimit || 50;
  state.pipoLimit = currentLimit + 50;
  renderPipoTab();
};

window.fillPipoSearch = function(partNo) {
  if (!DOM.pipoSearchInput) return;
  DOM.pipoSearchInput.value = partNo;
  state.pipoSearchQuery = partNo;
  if (DOM.pipoSearchClear) DOM.pipoSearchClear.style.display = 'block';
  renderPipoTab();
};

function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function cleanNameString(str) {
  if (!str) return '';
  return String(str)
    .toUpperCase()
    .replace(/[\u00A0\u200B]/g, ' ')
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isSameTechnicianName(sheetNama, targetNama) {
  if (!sheetNama || !targetNama) return false;
  const sUpper = String(sheetNama).trim().toUpperCase();
  const tUpper = String(targetNama).trim().toUpperCase();
  if (!sUpper || !tUpper) return false;
  if (sUpper === 'ADMIN' || tUpper === 'ADMIN') return false;
  if (sUpper === tUpper) return true;
  if (sUpper.includes(tUpper) || tUpper.includes(sUpper)) return true;
  const sWords = cleanNameString(sheetNama).split(' ').filter(w => w.length >= 2);
  const tWords = cleanNameString(targetNama).split(' ').filter(w => w.length >= 2);
  for (let tw of tWords) {
    for (let sw of sWords) {
      if (sw === tw) return true;
    }
  }
  return false;
}

function matchTechName(sheetName, userName, userNik = '') {
  const uUpper = (userName || '').toUpperCase().trim();
  const nUpper = (userNik || '').toUpperCase().trim();

  // If filter is empty ("") or user is admin (and not filtering for a specific technician name)
  if (!uUpper && !nUpper) return true;
  if (uUpper === 'ADMIN' || nUpper === 'ADMIN') return true;
  if (state.isAdmin && (uUpper === (state.profile.nama || '').toUpperCase().trim() || uUpper === (state.profile.nik || '').toUpperCase().trim())) return true;

  if (!sheetName) return false;

  const sClean = cleanNameString(sheetName);
  const uClean = cleanNameString(userName);
  const nClean = cleanNameString(userNik);

  if (!sClean) return false;

  // 1. Direct match with NIK if available in sheet cell
  if (nClean && nClean.length >= 3 && (sClean === nClean || sClean.includes(nClean))) {
    return true;
  }

  if (!uClean) return false;

  // 2. Direct equality or substring match
  if (sClean === uClean || sClean.includes(uClean) || uClean.includes(sClean)) {
    return true;
  }

  // 3. Token Word Match (Require exact word token equality to prevent false positives like MAULIDANI matching DANI)
  const sWords = sClean.split(' ').filter(w => w.length >= 2);
  const uWords = uClean.split(' ').filter(w => w.length >= 2);

  if (sWords.length === 0 || uWords.length === 0) return false;

  for (let uWord of uWords) {
    if (uWord.length < 2) continue;
    for (let sWord of sWords) {
      if (sWord.length < 2) continue;

      // Exact word match
      if (sWord === uWord) {
        return true;
      }
    }
  }

  // 4. Full string similarity
  const dist = levenshteinDistance(sClean, uClean);
  const maxL = Math.max(sClean.length, uClean.length);
  return ((maxL - dist) / maxL) >= 0.6;
}

function getBestMatchedItem(items, targetNama, targetNik = '') {
  if (!items || items.length === 0) return {};
  const uClean = cleanNameString(targetNama);
  const nClean = cleanNumberString(targetNik);
  const uWords = new Set(uClean.split(' ').filter(w => w.length >= 2));

  let bestItem = null;
  let bestScore = -1;

  for (let item of items) {
    if (!item || !item.nama) continue;
    const sClean = cleanNameString(item.nama);
    const sWords = new Set(sClean.split(' ').filter(w => w.length >= 2));
    let score = 0;

    if (nClean && nClean.length >= 3 && sClean.includes(nClean)) score += 100;
    if (sClean === uClean) score += 50;
    else if (sClean.startsWith(uClean) || uClean.startsWith(sClean)) score += 30;
    else if (sClean.includes(uClean) || uClean.includes(sClean)) score += 20;

    let matchCount = 0;
    for (let uw of uWords) {
      if (sWords.has(uw)) matchCount++;
    }
    score += matchCount * 5;

    if (score > bestScore && score > 0) {
      bestScore = score;
      bestItem = item;
    }
  }

  return bestItem || items[0] || {};
}

function getSheetsCacheKey() {
  const nik = (state.profile && state.profile.nik) ? String(state.profile.nik).trim() : 'guest';
  return STORAGE_KEYS.SHEETS_CACHE + '_' + nik;
}

function loadSheetsCache() {
  const key = getSheetsCacheKey();
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      state.sheetsData = {
        ...state.sheetsData,
        ...parsed
      };
      renderAllSheetsViews();
    } catch (e) {
      console.warn('Gagal parse cache Google Sheets:', e);
    }
  }
  loadFinishSheetCache();
}

function saveSheetsCache() {
  try {
    const key = getSheetsCacheKey();
    localStorage.setItem(key, JSON.stringify(state.sheetsData));
  } catch (e) {
    console.warn('Gagal simpan cache Google Sheets:', e);
  }
}

async function fetchGVizSheet(sheetName, range = 'A1:Z1000', noHeaders = false) {
  // Use JSONP dynamic script injection to bypass CORS policy restrictions completely
  return new Promise((resolve, reject) => {
    const callbackName = 'gviz_cb_' + Math.floor(Math.random() * 1000000);

    const cleanup = () => {
      // Retain a dummy function so late responses do not throw Uncaught ReferenceError
      window[callbackName] = function() {};
      const el = document.getElementById(callbackName);
      if (el) el.remove();
      // Safely delete window[callbackName] after a 60-second grace period
      setTimeout(() => {
        try { delete window[callbackName]; } catch (e) {}
      }, 60000);
    };

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`Timeout fetching sheet ${sheetName}`));
    }, 25000);

    window[callbackName] = function(response) {
      clearTimeout(timeout);
      cleanup();
      if (response && response.table) {
        resolve(response.table);
      } else {
        reject(new Error(`Response table invalid for sheet ${sheetName}`));
      }
    };

    const script = document.createElement('script');
    script.id = callbackName;
    const headersParam = noHeaders ? '&headers=0' : '';
    script.src = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=responseHandler:${callbackName}&sheet=${encodeURIComponent(sheetName)}&range=${encodeURIComponent(range)}${headersParam}&t=${Date.now()}`;
    script.onerror = function(err) {
      clearTimeout(timeout);
      cleanup();
      reject(new Error(`Script load error for sheet ${sheetName}`));
    };
    document.body.appendChild(script);
  });
}

function extractMatrixFromGViz(table) {
  if (!table || !table.rows) return [];
  return table.rows.map(row => {
    if (!row || !row.c) return [];
    return row.c.map(cell => {
      if (!cell) return '';
      if (cell.f !== undefined && cell.f !== null) return String(cell.f).trim();
      if (cell.v !== undefined && cell.v !== null) return String(cell.v).trim();
      return '';
    });
  });
}

function parseCSVToMatrix(csvText) {
  if (!csvText) return [];
  const lines = csvText.split(/\r?\n/);
  return lines.map(line => {
    const row = [];
    let insideQuote = false;
    let currentCell = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuote && line[i + 1] === '"') {
          currentCell += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    row.push(currentCell.trim());
    return row;
  });
}

async function fetchSheetMatrix(sheetName, range = '') {
  const spreadsheetId = GOOGLE_SHEET_ID;

  // Strategy 0: If running on file:// protocol, directly use JSONP to prevent browser console CORS origin:null errors
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    try {
      const table = await fetchGVizSheet(sheetName, range);
      return extractMatrixFromGViz(table);
    } catch (e) {
      return [];
    }
  }

  // Strategy 1: Direct CORS-enabled CSV fetch (for http/https origins)
  try {
    const rangeParam = range ? `&range=${encodeURIComponent(range)}` : '';
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}${rangeParam}&t=${Date.now()}`;
    const resp = await fetch(csvUrl, { mode: 'cors', headers: { 'Accept': 'text/csv' } });
    if (resp.ok) {
      const csvText = await resp.text();
      const matrix = parseCSVToMatrix(csvText);
      if (matrix && matrix.length > 0) {
        return matrix;
      }
    }
  } catch (e) {
    // Silent fallback to JSONP script injection
  }

  // Strategy 2: JSONP Script Injection Fallback
  try {
    const table = await fetchGVizSheet(sheetName, range);
    return extractMatrixFromGViz(table);
  } catch (e) {
    return [];
  }
}

async function fetchGoogleSheetsData() {
  if (!state.isLoggedIn || state.isFetchingSheets) return;
  state.isFetchingSheets = true;

  if (DOM.syncIcon) DOM.syncIcon.classList.add('spinning');

  try {
    const rowsData = await fetchSheetMatrix('DATA');
    const rowsNotif = await fetchSheetMatrix('NOTIF').catch(() => []);

    const techName = state.profile.nama || '';
    const techNik = state.profile.nik || '';

    syncUserProfileAreaFromSheet();

    // 0. Direct Cell Extraction for BC3 (Row 3/idx 2), BC4 (Row 4/idx 3), BC5 (Row 5/idx 4), BC6 (Row 6/idx 5)
    function extractRawBC(rowIdx) {
      if (rowsData && rowsData.length > rowIdx && rowsData[rowIdx] && rowsData[rowIdx][54] !== undefined && rowsData[rowIdx][54] !== null) {
        const val = String(rowsData[rowIdx][54]).trim();
        if (val) return val;
      }
      return '';
    }

    let pendingTimestamp = extractRawBC(2);     // BC3 (Pending)
    let performaTimestamp = extractRawBC(3);    // BC4 (Performa)
    let partKembaliTimestamp = extractRawBC(4); // BC5 (Part Bekas)
    let tagihanTimestamp = extractRawBC(5) || extractRawBC(1); // BC6 / BC2 (Tagihan)

    if (!pendingTimestamp) pendingTimestamp = 'Update Tanggal ' + new Date().toLocaleDateString('id-ID');
    if (!performaTimestamp) performaTimestamp = pendingTimestamp;
    if (!partKembaliTimestamp) partKembaliTimestamp = pendingTimestamp;
    if (!tagihanTimestamp) tagihanTimestamp = pendingTimestamp;

    // 1. Pending Cases (Sheet DATA, Row 3+, Col 53 to 65 / BB to BN)
    const pendingCases = [];

    for (let r = 2; r < rowsData.length; r++) {
      const row = rowsData[r];
      if (!row || row.length < 63) continue;

      const rowTech = (row[62] || '').trim();  // BK: NAMA TEKNISI
      const noCase = (row[64] || '').trim();   // BM: NO CASE
      const tglCase = (row[65] || '').trim();  // BN: TGL CASE
      const kategori = (row[55] || '').trim(); // BD: KATEGORI (WIP COMP, WIP, WIP TECH, NEW)
      const unitType = (row[66] || row[58] || '').trim(); // BO: TYPE (Model/Type)
      const snVal = (row[67] || row[63] || '').trim();    // BP: SN (Serial Number)
      const noSclVal = (row[68] || '').trim(); // BQ: NO SCL
      const area = (row[63] || '').trim();     // BL: AREA (BDG)

      // Skip header row
      if (rowTech.toUpperCase().includes('NAMA TEKNISI') || noCase.toUpperCase().includes('NO CASE')) continue;

      if ((noCase || kategori || noSclVal) && rowTech && matchTechName(rowTech, techName, techNik)) {
        pendingCases.push({
          tgl: tglCase || '-',
          no_case: noCase || '-',
          no_scl: noSclVal || '-', // BQ: NO SCL
          type: unitType || '-',   // BO: TYPE
          sn: snVal || '-',        // BP: SN
          seri: snVal || area || '-',
          layanan: unitType || 'SERVICE',
          status: kategori || 'PENDING',  // BD: KATEGORI
          teknisi: rowTech,               // BK: NAMA TEKNISI
          ket_part: kategori,             // BD: KATEGORI
          usia: ''
        });
      }
    }

    if (!pendingTimestamp) pendingTimestamp = 'Update Tanggal ' + new Date().toLocaleDateString('id-ID');

    // 2. Part Bekas / Part Belum Kembali (Sheet DATA, Row 3+, Col 40 to 45 / AO to AT)
    const partBelumKembali = [];
    for (let r = 2; r < rowsData.length; r++) {
      const row = rowsData[r];
      if (!row || row.length < 46) continue;
      const noReservasi = (row[40] || '').trim(); // AO: Nomor Reservasi
      const partNo = (row[41] || '').trim();      // AP: Part Number
      const qtyVal = (row[42] || '').trim();      // AQ: Qty
      const techNameRow = (row[45] || '').trim(); // AT: Teknisi Perbaikan

      if (noReservasi.toUpperCase().includes('NOMOR RESERVASI') || partNo.toUpperCase().includes('COLUMN')) continue;

      if ((partNo || noReservasi) && techNameRow && matchTechName(techNameRow, techName, techNik)) {
        partBelumKembali.push({
          noGudang: partNo || noReservasi,
          qty: qtyVal || '1',
          teknisi: techNameRow,
          noReservasi: (noReservasi && noReservasi.toUpperCase() !== 'NONE') ? noReservasi : ''
        });
      }
    }

    // 3. Tagihan (Sheet DATA, Row 3+, Col 46 to 52 / AU to BA)
    const tagihanRows = [];
    for (let r = 2; r < rowsData.length; r++) {
      const row = rowsData[r];
      if (!row || row.length < 51) continue;
      const tglVal = (row[46] || '').trim();      // AU: Tanggal
      const noInvoice = (row[47] || '').trim();   // AV: No. Svc Call / No. SO / No Invoice
      const techNameRow = (row[48] || '').trim(); // AW: Nama Teknisi
      const jumlahVal = (row[49] || '').trim();   // AX: Nominal / Jumlah
      const namaKonsumenAY = (row[50] || '').trim();// AY: Nama Customer
      const namaKonsumenBA = (row[52] || '').trim();// BA: Nama Customer dari Kolom BA (Col Index 52)
      const marketVal = (row[51] || '').trim();   // AZ: Market

      if (noInvoice.toUpperCase().includes('NO. SVC') || noInvoice.toUpperCase().includes('COLUMN')) continue;

      let namaCustomer = (namaKonsumenBA && namaKonsumenBA !== 'B') ? namaKonsumenBA : namaKonsumenAY;
      if (!namaCustomer) namaCustomer = '-';

      if ((noInvoice || jumlahVal) && techNameRow && matchTechName(techNameRow, techName, techNik)) {
        tagihanRows.push({
          noInvoice: noInvoice || 'INV-' + r,
          teknisi: techNameRow,
          jumlah: jumlahVal || '0',
          namaKonsumen: namaCustomer,
          market: marketVal || ''
        });
      }
    }

    // 4. Performa / Output (Sheet DATA, Row 2+, Col 1 to 6 for unit counts, H3 to AL3 for daily output)
    const insentifRows = [];
    const outputHariIni = [];

    // Dynamically match Today's Date column (Cols H to AL / index 7 to 37)
    const todayDay = new Date().getDate();
    let todayColIdx = -1;

    if (rowsData && rowsData.length > 1) {
      for (let c = 7; c < Math.min(38, rowsData[1].length); c++) {
        const val = (rowsData[1][c] || '').trim();
        if (val === String(todayDay)) {
          todayColIdx = c;
          break;
        }
      }
    }
    if (todayColIdx === -1) {
      todayColIdx = 6 + todayDay; // Fallback: Day 1 = Col 7 (H), Day 30 = Col 36 (AK)
    }

    for (let r = 1; r < rowsData.length; r++) {
      const row = rowsData[r];
      if (!row || row.length < 6) continue;
      const techNameRow = (row[1] || '').trim(); // Col B: NAMA TEKNISI
      if (!techNameRow || techNameRow.toUpperCase() === 'NAMA TEKNISI') continue;

      if (matchTechName(techNameRow, techName, techNik)) {
        const indoorCount = parseInt(row[2] || '0', 10) || 0;
        const outdoorCount = parseInt(row[3] || '0', 10) || 0;
        const acCount = parseInt(row[4] || '0', 10) || 0;
        const evCount = parseInt(row[5] || '0', 10) || 0;

        // Output Hari Ini fetched specifically from Today's Date Column (H3=1 to AL3=31)
        const todayOutputVal = (row[todayColIdx] !== undefined && row[todayColIdx] !== null) ? String(row[todayColIdx]).trim() : '0';

        insentifRows.push({
          nama: techNameRow,
          indoor: indoorCount.toString(),
          outdoor: outdoorCount.toString(),
          ac: acCount.toString(),
          ev: evCount.toString(),
          total_output: (indoorCount + outdoorCount + acCount + evCount).toString()
        });

        outputHariIni.push({
          nama: techNameRow,
          total_output: todayOutputVal || '0'
        });
      }
    }

    // 5. Notifications (Sheet NOTIF, Cols A-J)
    const notifications = [];
    for (let r = 0; r < rowsNotif.length; r++) {
      const row = rowsNotif[r];
      if (!row || row.length === 0) continue;
      const rowTech = row[6] || row[7] || '';
      if (rowTech && matchTechName(rowTech, techName, techNik)) {
        notifications.push({
          no_scl: row[0] || '',
          type: row[1] || '',
          seri: row[2] || '',
          layanan: row[3] || '',
          stok_in: row[4] || '',
          status: row[5] || '',
          teknisi: rowTech || '',
          ket_part: row[7] || '',
          usia: row[8] || '',
          notes: row[9] || ''
        });
      }
    }

    // Update state & single source of truth cache
    state.sheetsData = {
      lastUpdateTimestamp: pendingTimestamp,
      pendingTimestamp,
      performaTimestamp,
      partKembaliTimestamp,
      tagihanTimestamp,
      lastSyncTime: Date.now(),
      pendingCases,
      insentifRows,
      rata2Rows: [{ rata_rata: '0.0', selisih_unit: '0' }],
      outputHariIni,
      notifications,
      partBelumKembali,
      tagihanRows
    };

    saveSheetsCache();
    renderAllSheetsViews();

    // Auto-sync Finish Sheet Data & update views live
    fetchFinishSheetData().then(({ filledDatesSet, parsedAllRows }) => {
      if (DOM.modalMissingFinish && DOM.modalMissingFinish.classList.contains('active')) {
        renderMissingDatesList(filledDatesSet);
      }
      if (DOM.finishPageAll && DOM.finishPageAll.style.display !== 'none') {
        renderFinishAllDataTab(parsedAllRows);
      }
    }).catch(e => console.warn('Sync finish sheet error:', e));

  } catch (err) {
    console.warn('Polling Google Sheets gagal (menggunakan cache):', err);
  } finally {
    state.isFetchingSheets = false;
    if (DOM.syncIcon) DOM.syncIcon.classList.remove('spinning');
  }
}

function startSheetsPolling() {
  stopSheetsPolling();
  fetchGoogleSheetsData();
  state.sheetsPollTimer = setInterval(fetchGoogleSheetsData, 10000);
}

function stopSheetsPolling() {
  if (state.sheetsPollTimer) {
    clearInterval(state.sheetsPollTimer);
    state.sheetsPollTimer = null;
  }
}

function renderAllSheetsViews() {
  renderSheetUpdateInfo();
  renderPendingTab();
  renderPerformaTab();
  renderNotifTab();
  renderPartKembaliTab();
  renderTagihanTab();
  updateBadges();
}

function renderSheetUpdateInfo() {
  const baseTs = (typeof window !== 'undefined' && window.__INIT_SHEET_TS__) ? window.__INIT_SHEET_TS__ : '';
  const pendingTs = state.sheetsData.pendingTimestamp || state.sheetsData.lastUpdateTimestamp || baseTs || 'Memuat data....';
  const performaTs = state.sheetsData.performaTimestamp || pendingTs;
  const partKembaliTs = state.sheetsData.partKembaliTimestamp || pendingTs;
  const tagihanTs = state.sheetsData.tagihanTimestamp || pendingTs;

  let activeTs = pendingTs;
  if (state.activeTab === 'tab-performa') activeTs = performaTs;
  else if (state.activeTab === 'tab-part-kembali') activeTs = partKembaliTs;
  else if (state.activeTab === 'tab-tagihan') activeTs = tagihanTs;

  if (DOM.sheetZ2Timestamp) {
    DOM.sheetZ2Timestamp.textContent = activeTs;
  }
}

function updateBadges() {
  const notifCount = state.sheetsData.notifications ? state.sheetsData.notifications.length : 0;
  const pendingCount = state.sheetsData.pendingCases ? state.sheetsData.pendingCases.length : 0;

  if (DOM.headerBellBadge) {
    DOM.headerBellBadge.textContent = notifCount;
    DOM.headerBellBadge.classList.toggle('hidden', notifCount === 0);
  }
  if (DOM.navNotifBadge) {
    DOM.navNotifBadge.textContent = notifCount;
    DOM.navNotifBadge.classList.toggle('hidden', notifCount === 0);
  }
  if (DOM.navPendingBadge) {
    DOM.navPendingBadge.textContent = pendingCount;
    DOM.navPendingBadge.classList.toggle('hidden', pendingCount === 0);
  }

  if (DOM.pendingTechCount) DOM.pendingTechCount.textContent = `${pendingCount} Case`;
  if (DOM.notifTechCount) DOM.notifTechCount.textContent = `${notifCount} Notif`;
}

function renderPendingTab() {
  if (!DOM.pendingListContainer) return;
  const cases = state.sheetsData.pendingCases || [];
  const searchQ = (state.pendingSearchQuery || '').trim().toUpperCase();

  const filtered = cases.filter(item => {
    if (!searchQ) return true;
    return (
      (item.no_case && item.no_case.toUpperCase().includes(searchQ)) ||
      (item.no_scl && item.no_scl.toUpperCase().includes(searchQ)) ||
      (item.type && item.type.toUpperCase().includes(searchQ)) ||
      (item.sn && item.sn.toUpperCase().includes(searchQ)) ||
      (item.status && item.status.toUpperCase().includes(searchQ)) ||
      (item.ket_part && item.ket_part.toUpperCase().includes(searchQ))
    );
  });

  if (filtered.length === 0) {
    DOM.pendingListContainer.innerHTML = `
      <div class="empty-state-sm">
        <i data-lucide="check-circle-2" class="text-success" style="width:32px;height:32px;"></i>
        <p>${searchQ ? 'Tidak ada case pending yang cocok dengan pencarian.' : 'Tidak ada case pending untuk Anda saat ini.'}</p>
      </div>`;
    lucide.createIcons();
    return;
  }

  DOM.pendingListContainer.innerHTML = filtered.map(item => {
    const statusLower = (item.status || '').toLowerCase();
    let statusClass = 'printed';
    if (statusLower.includes('wip comp') || statusLower.includes('selesai')) statusClass = 'wip-comp';
    else if (statusLower.includes('wip')) statusClass = 'wip';

    return `
      <div class="pending-card" style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:10px 12px; margin-bottom:8px; display:flex; flex-direction:column; gap:6px;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
          <div style="font-size:11px; font-weight:700; color:var(--text-main); display:flex; align-items:center; gap:6px; word-break:break-all;">
            <i data-lucide="file-text" style="width:14px; height:14px; color:var(--primary); flex-shrink:0;"></i>
            <span>${escapeHtml(item.no_case || item.no_scl || '-')}</span>
          </div>
          <span class="pending-status-badge ${statusClass}" style="flex-shrink:0; font-size:10.5px; padding:3px 8px; font-weight:700;">
            ${escapeHtml(item.status || 'PENDING')}
          </span>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px 8px; font-size:10.5px; color:var(--text-main); border-top:1px dashed var(--border-color); padding-top:6px;">
          <div style="display:flex; align-items:center; gap:4px;">
            <i data-lucide="calendar" style="width:12px; height:12px; color:var(--primary); flex-shrink:0;"></i>
            <span>${escapeHtml(item.tgl || '-')}</span>
          </div>
          <div style="display:flex; align-items:center; gap:4px;">
            <i data-lucide="cpu" style="width:12px; height:12px; color:var(--info, #3b82f6); flex-shrink:0;"></i>
            <span>${escapeHtml(item.type || '-')}</span>
          </div>
          <div style="display:flex; align-items:center; gap:4px;">
            <i data-lucide="barcode" style="width:12px; height:12px; color:var(--warning); flex-shrink:0;"></i>
            <span style="word-break:break-all;">${escapeHtml(item.sn || item.seri || '-')}</span>
          </div>
          <div style="display:flex; align-items:center; gap:4px;">
            <i data-lucide="hash" style="width:12px; height:12px; color:var(--success, #10b981); flex-shrink:0;"></i>
            <span style="word-break:break-all;">${escapeHtml(item.no_scl || '-')}</span>
          </div>
        </div>
      </div>`;
  }).join('');

  lucide.createIcons();
}

function formatRupiah(val) {
  if (val === undefined || val === null || val === '') return 'Rp 0';
  let str = String(val).trim();
  if (!str || str === '0' || str === '-') return 'Rp 0';

  if (/^rp/i.test(str)) {
    return str.replace(/^rp\s*/i, 'Rp ');
  }

  if (/^\d{1,3}(\.\d{3})+$/.test(str)) {
    return 'Rp ' + str;
  }
  if (/^\d{1,3}(\.\d{3})+,\d+$/.test(str)) {
    return 'Rp ' + str;
  }

  let normalizedStr = str;
  if (str.includes(',') && !str.includes('.')) {
    normalizedStr = str.replace(',', '.');
  } else if (str.includes('.') && str.includes(',')) {
    normalizedStr = str.replace(/\./g, '').replace(',', '.');
  }

  let parsed = parseFloat(normalizedStr);
  if (isNaN(parsed) || parsed === 0) {
    return 'Rp 0';
  }

  let formatted = parsed.toLocaleString('id-ID', {
    maximumFractionDigits: 2
  });

  return 'Rp ' + formatted;
}

function renderPerformaTab() {
  if (!DOM.performaContentContainer) return;
  const currentNama = state.profile.nama || '';
  const currentNik = state.profile.nik || '';

  const insentifList = state.sheetsData.insentifRows || [];
  const insentif = getBestMatchedItem(insentifList, currentNama, currentNik);

  const outputList = state.sheetsData.outputHariIni || [];
  const outputObj = getBestMatchedItem(outputList, currentNama, currentNik);

  const indoorCount = parseInt(insentif.indoor || '0', 10) || 0;
  const outdoorCount = parseInt(insentif.outdoor || '0', 10) || 0;
  const acCount = parseInt(insentif.ac || '0', 10) || 0;
  const evTotal = (parseInt(insentif.ev || '0', 10) || 0) +
                  (parseInt(insentif.ev1 || '0', 10) || 0) +
                  (parseInt(insentif.ev2 || '0', 10) || 0) +
                  (parseInt(insentif.ev3 || '0', 10) || 0);

  const totalUnitCount = indoorCount + outdoorCount + acCount + evTotal;

  // Calculate working days from day 1 of current month to today (excluding Sundays & national holidays)
  const nowPerf = new Date();
  const yearPerf = nowPerf.getFullYear();
  const monthPerf = nowPerf.getMonth();
  const todayPerf = nowPerf.getDate();

  let workingDaysCount = 0;
  for (let day = 1; day <= todayPerf; day++) {
    const d = new Date(yearPerf, monthPerf, day);
    if (!isNationalHolidayOrSunday(d)) {
      workingDaysCount++;
    }
  }

  const calculatedRataRata = workingDaysCount > 0 ? (totalUnitCount / workingDaysCount).toFixed(1) : '0.0';
  const selisih160 = Math.abs(totalUnitCount - 160);
  const selisih107 = Math.abs(totalUnitCount - 107);
  const calculatedSelisih = `${selisih160} / ${selisih107}`;

  DOM.performaContentContainer.innerHTML = `
    <!-- Hero Performance Overview -->
    <div class="performa-hero-card">
      <div class="performa-hero-title">
        <i data-lucide="user"></i> ${state.profile.nama || 'Teknisi'}
      </div>
      <div class="performa-hero-grid">
        <div class="performa-hero-item">
          <div class="performa-hero-value">${formatRupiah(insentif.insentif)}</div>
          <div class="performa-hero-label">Insentif</div>
        </div>
        <div class="performa-hero-item">
          <div class="performa-hero-value" style="color:var(--secondary);">${outputObj.total_output || '0'}</div>
          <div class="performa-hero-label">Output Hari Ini</div>
        </div>
      </div>
    </div>

    <!-- Rating & Selisih Stats -->
    <div class="performa-sub-title">
      <i data-lucide="award"></i> Evaluasi & Rata-Rata Unit
    </div>
    <div class="performa-stat-grid">
      <div class="performa-stat-box">
        <div class="stat-val" style="color:var(--warning);">${calculatedRataRata}</div>
        <div class="stat-lbl">Rata-Rata</div>
      </div>
      <div class="performa-stat-box">
        <div class="stat-val" style="color:var(--secondary); font-size:13px; font-weight:800;">${calculatedSelisih}</div>
        <div class="stat-lbl">Selisih</div>
      </div>
      <div class="performa-stat-box">
        <div class="stat-val">${totalUnitCount}</div>
        <div class="stat-lbl">Total Unit</div>
      </div>
    </div>

    <!-- Category Detail Units Breakdown (EV, AC, INDOOR, OUTDOOR) -->
    <div class="performa-sub-title">
      <i data-lucide="layers"></i> Rincian Pengerjaan Unit
    </div>
    <div class="performa-stat-grid">
      <div class="performa-stat-box">
        <div class="stat-val" style="color:var(--primary);">${evTotal}</div>
        <div class="stat-lbl">EV</div>
      </div>
      <div class="performa-stat-box">
        <div class="stat-val" style="color:var(--secondary);">${insentif.ac || '0'}</div>
        <div class="stat-lbl">AC</div>
      </div>
      <div class="performa-stat-box">
        <div class="stat-val" style="color:var(--info, #3b82f6);">${insentif.indoor || '0'}</div>
        <div class="stat-lbl">INDOOR</div>
      </div>
      <div class="performa-stat-box">
        <div class="stat-val" style="color:var(--warning);">${insentif.outdoor || '0'}</div>
        <div class="stat-lbl">OUTDOOR</div>
      </div>
    </div>`;

  lucide.createIcons();
}

function renderNotifTab() {
  if (!DOM.notifListContainer) return;
  const list = state.sheetsData.notifications || [];

  if (list.length === 0) {
    DOM.notifListContainer.innerHTML = `
      <div class="empty-state-sm">
        <i data-lucide="bell-off" style="width:32px;height:32px;color:var(--text-muted);"></i>
        <p>Tidak ada notifikasi baru untuk Anda.</p>
      </div>`;
    lucide.createIcons();
    return;
  }

  DOM.notifListContainer.innerHTML = list.map(item => `
    <div class="notif-card">
      <div class="notif-card-header">
        <span class="notif-scl">${item.no_scl || 'INFORMASI'}</span>
        <span class="notif-status">${item.status || 'INFO'}</span>
      </div>
      <div class="notif-detail">
        <strong>${item.type || ''}</strong> ${item.seri ? ' - ' + item.seri : ''}
      </div>
      ${item.ket_part ? `<div style="font-size:10px;color:var(--warning);font-weight:600;"><i data-lucide="info" style="width:11px;height:11px;display:inline;"></i> ${item.ket_part}</div>` : ''}
    </div>`).join('');

  lucide.createIcons();
}

function renderPartKembaliTab() {
  if (!DOM.partKembaliListContainer) return;
  const list = state.sheetsData.partBelumKembali || [];
  const searchQ = (state.partKembaliSearchQuery || '').trim().toUpperCase();

  const filtered = list.filter(item => {
    if (!searchQ) return true;
    return (
      (item.noGudang || '').toUpperCase().includes(searchQ) ||
      (item.noReservasi || '').toUpperCase().includes(searchQ)
    );
  });

  const totalQty = filtered.reduce((acc, item) => {
    const q = parseFloat(item.qty) || 1;
    return acc + q;
  }, 0);

  if (DOM.partKembaliTotalQty) {
    DOM.partKembaliTotalQty.textContent = `${totalQty} Pcs`;
  }
  if (DOM.partKembaliCount) {
    DOM.partKembaliCount.textContent = `${filtered.length} Item`;
  }

  if (filtered.length === 0) {
    DOM.partKembaliListContainer.innerHTML = `
      <div class="empty-state-sm" style="padding: 24px 10px;">
        <i data-lucide="package-open" style="width:36px; height:36px; color:var(--text-muted);"></i>
        <p style="font-weight:600; color:var(--text-muted); margin-top:4px;">${searchQ ? 'Tidak ada part yang cocok dengan pencarian.' : 'Tidak ada Part Bekas untuk Anda.'}</p>
        <span style="font-size:10.5px; color:var(--text-dark);">Semua part bekas telah diproses.</span>
      </div>`;
    lucide.createIcons();
    return;
  }

  DOM.partKembaliListContainer.innerHTML = filtered.map(item => `
    <div class="card-item-part-kembali" style="background:var(--bg-input); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:10px 12px; display:flex; flex-direction:column; gap:4px;">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
        <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;">
          <div style="width:30px; height:30px; border-radius:var(--radius-sm); background:var(--primary-light); color:var(--primary); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <i data-lucide="package" style="width:15px; height:15px;"></i>
          </div>
          <div style="flex:1; min-width:0;">
            <div style="font-size:13px; font-weight:800; color:var(--text-main); word-break:break-all;">${escapeHtml(item.noGudang)}</div>
          </div>
        </div>
        <div style="flex-shrink:0;">
          <span style="font-size:11.5px; font-weight:800; color:var(--primary); background:rgba(16, 185, 129, 0.15); padding:3px 8px; border-radius:var(--radius-sm); border:1px solid rgba(16, 185, 129, 0.3); display:inline-block;">
            Qty: ${escapeHtml(item.qty)}
          </span>
        </div>
      </div>
      ${item.noReservasi ? `
      <div style="font-size:10.5px; color:var(--primary); font-weight:700; word-break:break-all; padding-left:40px; margin-top:1px;">
        <i data-lucide="bookmark" style="width:10.5px;height:10.5px;display:inline;"></i> ${escapeHtml(item.noReservasi)}
      </div>` : ''}
    </div>
  `).join('');

  lucide.createIcons();
}

function renderTagihanTab() {
  if (!DOM.tagihanListContainer) return;
  const list = state.sheetsData.tagihanRows || [];
  const searchQ = (state.tagihanSearchQuery || '').trim().toUpperCase();

  const filtered = list.filter(item => {
    if (!searchQ) return true;
    return (
      (item.noInvoice || '').toUpperCase().includes(searchQ) ||
      (item.namaKonsumen || '').toUpperCase().includes(searchQ) ||
      (item.jumlah || '').toString().includes(searchQ)
    );
  });

  const totalJumlah = filtered.reduce((acc, item) => {
    let cleanVal = String(item.jumlah).replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleanVal) || 0;
    return acc + parsed;
  }, 0);

  if (DOM.tagihanTotalJumlah) {
    DOM.tagihanTotalJumlah.textContent = formatRupiah(totalJumlah);
  }
  if (DOM.tagihanCount) {
    DOM.tagihanCount.textContent = `${filtered.length} Invoice`;
  }

  if (filtered.length === 0) {
    DOM.tagihanListContainer.innerHTML = `
      <div class="empty-state-sm" style="padding: 24px 10px;">
        <i data-lucide="receipt" style="width:36px; height:36px; color:var(--text-muted);"></i>
        <p style="font-weight:600; color:var(--text-muted); margin-top:4px;">${searchQ ? 'Tidak ada tagihan yang cocok dengan pencarian.' : 'Tidak ada Tagihan untuk Anda.'}</p>
        <span style="font-size:10.5px; color:var(--text-dark);">Semua invoice tagihan telah diproses.</span>
      </div>`;
    lucide.createIcons();
    return;
  }

  DOM.tagihanListContainer.innerHTML = filtered.map(item => `
    <div class="card-item-tagihan" style="background:var(--bg-input); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:10px 12px; display:flex; align-items:center; justify-content:space-between; gap:10px;">
      <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;">
        <div style="width:34px; height:34px; border-radius:var(--radius-sm); background:rgba(245, 158, 11, 0.15); color:var(--warning); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
          <i data-lucide="file-text" style="width:18px; height:18px;"></i>
        </div>
        <div style="flex:1; min-width:0;">
          <div style="font-size:10.5px; font-weight:700; color:var(--text-main); word-break:break-all;">${escapeHtml(item.noInvoice)}</div>
          <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">
            <i data-lucide="user" style="width:10px; height:10px; display:inline;"></i> Konsumen: <strong style="color:var(--text-main); font-weight:600;">${escapeHtml(item.namaKonsumen)}</strong>
          </div>
        </div>
      </div>
      <div style="display:flex; align-items:center; flex-shrink:0;">
        <span style="font-size:12px; font-weight:800; color:var(--warning); background:rgba(245, 158, 11, 0.15); padding:5px 10px; border-radius:var(--radius-sm); border:1px solid rgba(245, 158, 11, 0.3);">
          ${formatRupiah(item.jumlah)}
        </span>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}
