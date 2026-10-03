// ==========================================
// CONSTANTS & CONFIG
// ==========================================
const GOOGLE_SHEET_ID = '1x6m_pQ_UUPMGUE5iGraaurOivSDmsJ7CKCr42rNWlBc';
const USER_SPREADSHEET_ID = GOOGLE_SHEET_ID;
const SPREADSHEET_ID = GOOGLE_SHEET_ID;
const SITE_CODES = ['BDG', 'BDU', 'CRB', 'SKB', 'SBN', 'TSM'];

const STORAGE_KEYS = {
  PROFILE: 'teknisi_profile_data',
  SAVED_LOGIN: 'teknisi_saved_login',
  SESSION: 'teknisi_current_session',
  THEME: 'teknisi_app_theme',
  SHEETS_CACHE: 'google_sheets_cache',
  PIPO_CACHE: 'pipo_sheets_cache',
  FINISH_HISTORY: 'teknisi_finish_history',
  FINISH_SHEET_CACHE: 'finish_sheet_cache',
  LAST_TAB: 'teknisi_last_active_tab',
  FONTE_TOKEN: 'teknisi_fonte_token'
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
    tagihanRows: [],
    pdsRows: []
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
  btnSelectModePds: document.getElementById('btn-select-mode-pds'),

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
  btnDownloadFinishExcel: document.getElementById('btn-download-finish-excel'),
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
  navPartBadge: document.getElementById('nav-part-badge'),
  navTagihanBadge: document.getElementById('nav-tagihan-badge'),

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
  pipoSearchClear: document.getElementById('btn-clear-search-pipo'),

  // Fonte & WhatsApp Elements
  profileFonteToken: document.getElementById('profile-fonte-token'),
  btnSaveFonteToken: document.getElementById('btn-save-fonte-token'),
  cardFonteForm: document.getElementById('card-fonte-form'),
  modalSendWa: document.getElementById('modal-send-wa'),
  btnCloseWaModal: document.getElementById('btn-close-wa-modal'),
  waSelectTech: document.getElementById('wa-select-tech'),
  waTargetPhone: document.getElementById('wa-target-phone'),
  waMessagePreview: document.getElementById('wa-message-preview'),
  btnWaDirectOpen: document.getElementById('btn-wa-direct-open'),
  btnWaFonnteSend: document.getElementById('btn-wa-fonnte-send'),
  btnWaBatchSend: document.getElementById('btn-wa-batch-send'),
  waModalSiteBadge: document.getElementById('wa-modal-site-badge'),
  waModalSiteTitle: document.getElementById('wa-modal-site-title'),
  btnOpenWaPending: document.getElementById('btn-open-wa-pending'),
  btnOpenWaPart: document.getElementById('btn-open-wa-part'),
  btnOpenWaTagihan: document.getElementById('btn-open-wa-tagihan'),

  // WA Status Select Modal Elements
  modalWaStatusSelect: document.getElementById('modal-wa-status-select'),
  btnCloseWaStatusModal: document.getElementById('btn-close-wa-status-modal'),
  btnCancelWaStatus: document.getElementById('btn-cancel-wa-status'),
  btnConfirmWaStatusSend: document.getElementById('btn-confirm-wa-status-send'),
  waStatusModalCheckAll: document.getElementById('wa-status-modal-check-all'),
  waStatusModalChecklist: document.getElementById('wa-status-modal-checklist'),

  // WA Tagihan Select Modal Elements
  modalWaTagihanSelect: document.getElementById('modal-wa-tagihan-select'),
  btnCancelWaTagihan: document.getElementById('btn-cancel-wa-tagihan'),
  btnConfirmWaTagihanSend: document.getElementById('btn-confirm-wa-tagihan-send'),
  waTagihanModalCheckAll: document.getElementById('wa-tagihan-modal-check-all'),
  waTagihanModalChecklist: document.getElementById('wa-tagihan-modal-checklist'),

  // Pencapaian PDS Elements
  pdsContentContainer: document.getElementById('pds-content-container'),
  btnRefreshPds: document.getElementById('btn-refresh-pds'),
  syncIconPds: document.getElementById('sync-icon-pds'),
  pdsSiteCount: document.getElementById('pds-site-count'),

  // Finishan Harian Recap (Tgl 1-31) Elements
  btnOpenFinishRecap: document.getElementById('btn-open-finish-recap'),
  btnBackToPerforma: document.getElementById('btn-back-to-performa'),
  btnRefreshFinishRecap: document.getElementById('btn-refresh-finish-recap'),
  syncIconFinishRecap: document.getElementById('sync-icon-finish-recap'),
  finishRecapContentContainer: document.getElementById('finish-recap-content-container')
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
        state.isAdmin = !!parsed.isAdmin;

        const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
        if (storedProfile) {
          try {
            const parsedProfile = JSON.parse(storedProfile);
            if (parsedProfile && parsedProfile.nik) {
              state.profile = parsedProfile;
            }
          } catch (e) {}
        }

        if (!state.profile || !state.profile.nik) {
          const nikUp = parsed.nik.toUpperCase().trim();
          const isSiteCode = SITE_CODES.includes(nikUp);
          state.profile = {
            id: parsed.nik,
            nik: parsed.nik,
            nama: parsed.nama || (nikUp === 'ADMIN' ? 'Administrator' : (isSiteCode ? `Admin ${parsed.nik}` : parsed.nama || parsed.nik)),
            psw: parsed.nik,
            area: isSiteCode ? nikUp : 'JABAR',
            usePsw: true
          };
        }

        updateUIFromState();
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

  const validTabs = ['tab-menu', 'tab-pending', 'tab-performa', 'tab-finish-recap', 'tab-notif', 'tab-part-kembali', 'tab-tagihan', 'tab-pipo', 'tab-finish', 'tab-finish-all', 'tab-profile', 'tab-pencapaian-pds'];
  let initialTab = 'tab-menu';

  if (hashTab && validTabs.includes(hashTab)) {
    initialTab = hashTab;
  } else if (savedTab && validTabs.includes(savedTab)) {
    initialTab = (savedTab === 'tab-finish-recap') ? 'tab-performa' : savedTab;
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
  fetchFinishSheetData().catch(() => {});
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

  if (DOM.profileFonteToken) {
    DOM.profileFonteToken.value = localStorage.getItem(STORAGE_KEYS.FONTE_TOKEN) || '';
  }

  const { isAdminOrSiteAdmin } = getAdminOrSiteAdminStatus();
  if (DOM.cardFonteForm) {
    DOM.cardFonteForm.style.display = isAdminOrSiteAdmin ? 'block' : 'none';
  }
  if (DOM.btnOpenWaPending) {
    DOM.btnOpenWaPending.style.display = isAdminOrSiteAdmin ? 'inline-flex' : 'none';
  }
  if (DOM.btnOpenWaPart) {
    DOM.btnOpenWaPart.style.display = isAdminOrSiteAdmin ? 'inline-flex' : 'none';
  }
  if (DOM.btnOpenWaTagihan) {
    DOM.btnOpenWaTagihan.style.display = isAdminOrSiteAdmin ? 'inline-flex' : 'none';
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

  // Fonte & WA Listeners
  if (DOM.btnSaveFonteToken) {
    DOM.btnSaveFonteToken.addEventListener('click', () => {
      if (!DOM.profileFonteToken) return;
      const token = DOM.profileFonteToken.value.trim();
      localStorage.setItem(STORAGE_KEYS.FONTE_TOKEN, token);
      showToast('✅ Token Fonnte WhatsApp API berhasil disimpan!', 'success');
    });
  }
  if (DOM.btnCloseWaModal) DOM.btnCloseWaModal.addEventListener('click', closeWaModal);
  if (DOM.waSelectTech) DOM.waSelectTech.addEventListener('change', updateWaModalFields);
  if (DOM.btnWaDirectOpen) DOM.btnWaDirectOpen.addEventListener('click', handleWaDirectOpen);
  if (DOM.btnWaFonnteSend) DOM.btnWaFonnteSend.addEventListener('click', handleWaFonnteSend);
  if (DOM.btnWaBatchSend) DOM.btnWaBatchSend.addEventListener('click', handleWaBatchSend);

  // WA Status Select Modal Event Listeners
  if (DOM.btnCloseWaStatusModal) DOM.btnCloseWaStatusModal.addEventListener('click', closeWaStatusSelectModal);
  if (DOM.btnCancelWaStatus) DOM.btnCancelWaStatus.addEventListener('click', closeWaStatusSelectModal);
  if (DOM.btnConfirmWaStatusSend) DOM.btnConfirmWaStatusSend.addEventListener('click', handleConfirmWaStatusSend);

  // WA Tagihan Select Modal Event Listeners
  if (DOM.btnCancelWaTagihan) DOM.btnCancelWaTagihan.addEventListener('click', closeWaTagihanSelectModal);
  if (DOM.btnConfirmWaTagihanSend) DOM.btnConfirmWaTagihanSend.addEventListener('click', handleConfirmWaTagihanSend);

  if (DOM.btnOpenWaPending) DOM.btnOpenWaPending.addEventListener('click', () => openWaStatusSelectModal());
  if (DOM.btnOpenWaPart) DOM.btnOpenWaPart.addEventListener('click', () => openSendWaConfirmModal());
  if (DOM.btnOpenWaTagihan) DOM.btnOpenWaTagihan.addEventListener('click', () => openWaTagihanSelectModal());

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
  if (DOM.btnSelectModePds) {
    DOM.btnSelectModePds.addEventListener('click', () => {
      requestTabSwitch('tab-pencapaian-pds');
    });
  }
  if (DOM.btnRefreshPds) {
    DOM.btnRefreshPds.addEventListener('click', () => {
      const syncIcon = document.getElementById('sync-icon-pds') || DOM.syncIconPds;
      if (syncIcon) syncIcon.classList.add('spinning');
      showToast('🔄 Memperbarui data Pencapaian PDS...', 'info');
      fetchGoogleSheetsData().finally(() => {
        if (syncIcon) syncIcon.classList.remove('spinning');
      });
    });
  }
  if (DOM.btnOpenFinishRecap) {
    DOM.btnOpenFinishRecap.addEventListener('click', () => {
      requestTabSwitch('tab-finish-recap');
    });
  }
  if (DOM.btnBackToPerforma) {
    DOM.btnBackToPerforma.addEventListener('click', () => {
      requestTabSwitch('tab-performa');
    });
  }
  if (DOM.btnRefreshFinishRecap) {
    DOM.btnRefreshFinishRecap.addEventListener('click', async () => {
      let syncIcon = document.getElementById('sync-icon-finish-recap') || DOM.syncIconFinishRecap;
      if (syncIcon) syncIcon.classList.add('spinning');
      showToast('🔄 Memperbarui data finish harian...', 'info');
      try {
        await Promise.all([
          fetchGoogleSheetsData(),
          fetchFinishSheetData()
        ]);
        renderFinishRecapTab();
      } catch (e) {
        console.warn('Error refresh finish recap:', e);
      } finally {
        syncIcon = document.getElementById('sync-icon-finish-recap') || DOM.syncIconFinishRecap;
        if (syncIcon) syncIcon.classList.remove('spinning');
      }
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

  if (DOM.btnDownloadFinishExcel) {
    DOM.btnDownloadFinishExcel.addEventListener('click', downloadFinishExcel);
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

  // Header Action Button (Simpan / Install App ke Desktop / Layar HP)
  initInstallAppEvents();

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

  // Auto-Save Draft Listener for Form Finish Harian
  const formFinish = document.getElementById('form-finish-harian');
  if (formFinish) {
    formFinish.addEventListener('input', saveFinishFormDraft);
    formFinish.addEventListener('change', saveFinishFormDraft);
  }

// ==========================================
// PWA INSTALL / SIMPAN KE LAYAR UTAMA (DIRECT NATIVE INSTALL PROMPT)
// ==========================================
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  console.log('⚡ PWA Install Prompt captured!');
});

// Dynamic Manifest & Service Worker Registration (Avoid CORS warning when opened via file://)
if (window.location.protocol !== 'file:') {
  const manifestLink = document.createElement('link');
  manifestLink.rel = 'manifest';
  manifestLink.href = 'manifest.json';
  document.head.appendChild(manifestLink);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW reg error:', err));
  }
}

function initInstallAppEvents() {
  const btnInstall = document.getElementById('header-btn-install');
  const modalGuide = document.getElementById('modal-install-guide');
  const btnCloseModal = document.getElementById('btn-close-install-modal');
  const btnPwaDirectInstall = document.getElementById('btn-pwa-direct-install');

  // Klik tombol Instal APK di Header (HP) -> Langsung trigger PWA prompt jika tersedia, atau buka Modal HP jika belum
  if (btnInstall) {
    btnInstall.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        try {
          deferredInstallPrompt.prompt();
          const { outcome } = await deferredInstallPrompt.userChoice;
          if (outcome === 'accepted') {
            showToast('✅ Aplikasi berhasil dipasang di Layar Utama HP!', 'success');
            deferredInstallPrompt = null;
            return;
          }
        } catch (err) {
          console.warn('Install prompt error:', err);
        }
      }

      // Jika direct prompt belum siap (misal Safari iOS / belum trigger), buka Popup Panduan HP
      if (modalGuide) {
        modalGuide.classList.add('active');
        if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
        try { history.pushState({ modalOpen: true, tab: state.activeTab }, '', '#' + state.activeTab); } catch (e) {}
      }
    });
  }

  // Klik tombol "INSTAL APLIKASI DI HP SEKARANG" di dalam Popup
  if (btnPwaDirectInstall) {
    btnPwaDirectInstall.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        try {
          deferredInstallPrompt.prompt();
          const { outcome } = await deferredInstallPrompt.userChoice;
          if (outcome === 'accepted') {
            showToast('✅ Aplikasi berhasil dipasang di Layar Utama HP!', 'success');
            deferredInstallPrompt = null;
            if (modalGuide) modalGuide.classList.remove('active');
          }
        } catch (err) {
          console.warn('Install prompt error:', err);
        }
      } else {
        showToast('📲 Silakan ikuti petunjuk menu Titik 3 Chrome / Share Safari di bawah ini.', 'info');
      }
    });
  }

  if (btnCloseModal && modalGuide) {
    btnCloseModal.addEventListener('click', () => {
      modalGuide.classList.remove('active');
    });
  }
}

  let lastBackPressTime = 0;

  // Android & Hardware Back Button Navigation Handler (Close Modals on Back)
  window.addEventListener('popstate', (e) => {
    // 1. TAMPILKAN POPUP MODAL SAAT DIBUKA: BILA TEKAN TOMBOL BACK (HP/BROWSER) -> TUTUP POPUP TERLEBIH DAHULU!
    const activeModals = document.querySelectorAll('.modal-overlay.active');
    if (activeModals.length > 0) {
      activeModals.forEach(modal => modal.classList.remove('active'));
      try { history.pushState({ tab: state.activeTab }, '', '#' + state.activeTab); } catch (err) {}
      return;
    }

    if (!state.isLoggedIn) return;

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

    // Hierarchical Back Navigation (tab-finish-recap -> tab-performa -> tab-menu)
    if (state.activeTab === 'tab-finish-recap') {
      switchTab('tab-performa', false);
      return;
    }

    let targetTab = (e.state && e.state.tab) ? e.state.tab : 'tab-menu';
    switchTab(targetTab, false);
  });

  // Tombol Escape di Keyboard PC -> Tutup semua popup modal yang aktif
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModals = document.querySelectorAll('.modal-overlay.active');
      if (activeModals.length > 0) {
        activeModals.forEach(modal => modal.classList.remove('active'));
      }
    }
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
  } else if (currentAction === 'sendWaBatch') {
    await executeSendWaBatch();
  }
}

function handleClearAppCache() {
  openClearCacheConfirmModal();
}

async function executeClearAppCache() {
  try {
    showToast('🧹 Membersihkan cache data...', 'info');

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('google_sheets_cache') || key.startsWith(STORAGE_KEYS.SHEETS_CACHE))) {
        localStorage.removeItem(key);
      }
    }
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
    state.userAreaMap = {};
    if (!state.userPhoneMap) state.userPhoneMap = {};

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length < 3) continue;

      const nik = cleanNumberString(row[0]);
      const nama = (row[1] || '').trim();
      const psw = cleanNumberString(row[2]);
      const area = (row[3] || '').trim().toUpperCase(); // Column D: SITE / AREA
      const phone = cleanNumberString(row[4]); // Column E: No WA / HP Teknisi

      if (nik.toUpperCase() === 'NIK' && psw.toUpperCase() === 'PSW') continue;

      if (nama || nik) {
        users.push({
          nik: nik || nama,
          nama: nama || nik,
          psw: psw,
          area: area || 'JABAR',
          phone: phone || ''
        });
        if (nama) {
          state.userAreaMap[cleanNameString(nama)] = area || 'JABAR';
          if (phone) state.userPhoneMap[cleanNameString(nama)] = phone;
        }
        if (nik) {
          state.userAreaMap[cleanNameString(nik)] = area || 'JABAR';
          if (phone) state.userPhoneMap[cleanNumberString(nik)] = phone;
        }
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
  const nikUpper = (state.profile.nik || '').toUpperCase().trim();
  if (nikUpper === 'ADMIN' || SITE_CODES.includes(nikUpper)) {
    if (DOM.profileArea && SITE_CODES.includes(nikUpper)) DOM.profileArea.value = nikUpper;
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
    const uUpper = username.toUpperCase().trim();

    // 1. Global Admin Fallback
    if (uUpper === 'ADMIN' && password === '000') {
      authenticatedUser = {
        nik: 'ADMIN',
        nama: 'Administrator',
        psw: '000',
        area: 'JABAR',
        isAdmin: true,
        isSiteAdmin: false
      };
    } else if (SITE_CODES.includes(uUpper) && (password === '000' || password === uUpper)) {
      // 2. Direct Site Admin Fallback (e.g. Username BDG, Password 000 or BDG)
      authenticatedUser = {
        nik: uUpper,
        nama: 'Admin ' + uUpper,
        psw: password,
        area: uUpper,
        isAdmin: true,
        isSiteAdmin: true
      };
    } else {
      // 3. Fetch user list from Google Sheet tab 'user'
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

      const matchedNikUpper = cleanNumberString(matchedUser.nik).toUpperCase().trim();
      const uUpperClean = uUpper.toUpperCase().trim();

      // ONLY set isSiteAdmin if NIK itself (or login username) is one of SITE_CODES!
      const isSiteAdmin = SITE_CODES.includes(matchedNikUpper) || SITE_CODES.includes(uUpperClean);
      const isGlobalAdmin = matchedNikUpper === 'ADMIN' || uUpperClean === 'ADMIN';
      const isAdminUser = isGlobalAdmin || isSiteAdmin;

      authenticatedUser = {
        nik: matchedUser.nik,
        nama: matchedUser.nama,
        psw: matchedUser.psw,
        area: isSiteAdmin ? (SITE_CODES.includes(matchedNikUpper) ? matchedNikUpper : uUpperClean) : (matchedUser.area || 'JABAR'),
        isAdmin: isAdminUser,
        isSiteAdmin: isSiteAdmin
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
    clearAllRenderedViewsAndData();
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

function clearAllRenderedViewsAndData() {
  state.sheetsData = {
    lastUpdateTimestamp: 'Memuat data....',
    pendingTimestamp: 'Memuat data....',
    performaTimestamp: 'Memuat data....',
    partKembaliTimestamp: 'Memuat data....',
    tagihanTimestamp: 'Memuat data....',
    lastSyncTime: 0,
    pendingCases: [],
    insentifRows: [],
    rata2Rows: [{ rata_rata: '0.0', selisih_unit: '0' }],
    outputHariIni: [],
    notifications: [],
    partBelumKembali: [],
    tagihanRows: [],
    pdsRows: []
  };
  state.finishParsedAllRows = [];
  state.finishHistory = [];
  state.rawRowsData = [];

  const loaderHtml = `
    <div class="empty-state-sm">
      <i data-lucide="loader-2" class="spin-lg"></i>
      <p>Memuat data terbaru...</p>
    </div>
  `;

  if (DOM.pendingListContainer) DOM.pendingListContainer.innerHTML = loaderHtml;
  if (DOM.performaContentContainer) DOM.performaContentContainer.innerHTML = loaderHtml;
  if (DOM.finishRecapContentContainer) DOM.finishRecapContentContainer.innerHTML = loaderHtml;
  if (DOM.partKembaliListContainer) DOM.partKembaliListContainer.innerHTML = loaderHtml;
  if (DOM.tagihanListContainer) DOM.tagihanListContainer.innerHTML = loaderHtml;
  if (DOM.notifListContainer) DOM.notifListContainer.innerHTML = loaderHtml;
  if (DOM.pdsContentContainer) DOM.pdsContentContainer.innerHTML = loaderHtml;
  if (DOM.finishAllList) DOM.finishAllList.innerHTML = '';

  if (DOM.sheetZ2Timestamp) DOM.sheetZ2Timestamp.textContent = 'Memuat data....';
  if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

async function performLogout() {
  try {
    // 1. Completely clear all localStorage & sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // 2. Completely delete all CacheStorage instances (PWA / HTTP Cache)
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
  } catch (e) {
    console.warn('Gagal menghapus cache saat logout:', e);
  }

  // 3. Clear all DOM views & reset runtime state completely
  clearAllRenderedViewsAndData();
  state.isLoggedIn = false;
  state.isAdmin = false;
  state.isSiteAdmin = false;
  state.profile = { id: '', nama: '', nik: '', psw: '', usePsw: true };
  state.pipoData = [];
  state.userAreaMap = {};
  state.userPhoneMap = {};

  // 4. Reset input values on login screen
  if (DOM.loginUsername) DOM.loginUsername.value = '';
  if (DOM.loginPassword) DOM.loginPassword.value = '';
  if (DOM.rememberMe) DOM.rememberMe.checked = false;

  stopSheetsPolling();
  document.documentElement.classList.remove('is-logged-in');
  document.documentElement.classList.remove('is-admin');
  document.documentElement.removeAttribute('data-active-tab');
  document.documentElement.removeAttribute('data-current-mode');

  showLoginScreen();
  showToast('✅ Anda telah keluar. Seluruh cache & penyimpanan lokal telah dihapus!', 'info');
}

function saveProfileSilently() {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(state.profile));
}

function updateModeNavVisibility(targetTabId) {
  // Determine active mode
  if (targetTabId === 'tab-menu') {
    state.currentMode = 'menu';
  } else if (targetTabId === 'tab-pending' || targetTabId === 'tab-performa' || targetTabId === 'tab-finish-recap' || targetTabId === 'tab-notif' || targetTabId === 'tab-part-kembali' || targetTabId === 'tab-tagihan') {
    state.currentMode = 'teknisi';
  } else if (targetTabId === 'tab-pipo') {
    state.currentMode = 'pipo';
  } else if (targetTabId === 'tab-pencapaian-pds') {
    state.currentMode = 'pds';
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

  // 1b. Header Instal APK Button (#header-btn-install)
  // Show ONLY on Menu Utama Hub (tab-menu). Hide on all sub-pages.
  const btnInstallEl = document.getElementById('header-btn-install');
  if (btnInstallEl) {
    btnInstallEl.style.display = (targetTabId === 'tab-menu') ? 'inline-flex' : 'none';
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

  // Show sheet update bar on sub-pages (Pending, Performa, Part, Tagihan, PDS, etc.)
  if (DOM.sheetUpdateBar) {
    const showBar = state.currentMode === 'teknisi' || state.currentMode === 'pds' || targetTabId === 'tab-pencapaian-pds';
    DOM.sheetUpdateBar.classList.toggle('hidden', !showBar);
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
  } else if (targetTabId === 'tab-finish-recap') {
    renderFinishRecapTab();
    fetchFinishSheetData().then(() => {
      renderFinishRecapTab();
    }).catch(e => {});
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
  return new Promise((resolve, reject) => {
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
var APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwaDyJgzNp7OfhMWDORfGdwyuMVjgamTULd_ulfsw16xWsGXCo2mKA12-5TPY_PagcA1A/exec';


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

function saveFinishFormDraft() {
  if (!DOM.finishTgl) return;
  const draft = {
    finishTgl: DOM.finishTgl ? DOM.finishTgl.value : '',
    caseOutdoor: DOM.finishCaseOutdoor ? DOM.finishCaseOutdoor.value : '',
    finishOutdoor: DOM.finishFinishOutdoor ? DOM.finishFinishOutdoor.value : '',
    finishIndoor: DOM.finishFinishIndoor ? DOM.finishFinishIndoor.value : '',
    wipComp: DOM.finishWipComp ? DOM.finishWipComp.value : '',
    wipTech: DOM.finishWipTech ? DOM.finishWipTech.value : '',
    batal: DOM.finishBatal ? DOM.finishBatal.value : '',
    antar: DOM.finishAntar ? DOM.finishAntar.value : '',
    noVisit: DOM.finishNoVisit ? DOM.finishNoVisit.value : '',
    ket: DOM.finishKet ? DOM.finishKet.value : ''
  };
  try {
    localStorage.setItem('teknisi_finish_form_draft', JSON.stringify(draft));
  } catch (e) {}
}

function prepareFinishForm(isReset = false) {
  if (isReset) {
    try { localStorage.removeItem('teknisi_finish_form_draft'); } catch(e) {}
  }

  let draft = null;
  if (!isReset) {
    try {
      const rawDraft = localStorage.getItem('teknisi_finish_form_draft');
      if (rawDraft) draft = JSON.parse(rawDraft);
    } catch(e) {}
  }

  if (DOM.finishTgl) {
    DOM.finishTgl.type = 'date';
    if (draft && draft.finishTgl) {
      DOM.finishTgl.value = draft.finishTgl;
    } else if (!DOM.finishTgl.value) {
      const today = new Date().toISOString().split('T')[0];
      DOM.finishTgl.value = today;
    }
  }

  if (isReset) {
    if (DOM.finishCaseOutdoor) DOM.finishCaseOutdoor.value = '';
    if (DOM.finishFinishOutdoor) DOM.finishFinishOutdoor.value = '';
    if (DOM.finishFinishIndoor) DOM.finishFinishIndoor.value = '';
    if (DOM.finishWipComp) DOM.finishWipComp.value = '';
    if (DOM.finishWipTech) DOM.finishWipTech.value = '';
    if (DOM.finishBatal) DOM.finishBatal.value = '';
    if (DOM.finishAntar) DOM.finishAntar.value = '';
    if (DOM.finishNoVisit) DOM.finishNoVisit.value = '';
    if (DOM.finishKet) DOM.finishKet.value = '';
  } else if (draft) {
    if (DOM.finishCaseOutdoor && draft.caseOutdoor !== undefined) DOM.finishCaseOutdoor.value = draft.caseOutdoor;
    if (DOM.finishFinishOutdoor && draft.finishOutdoor !== undefined) DOM.finishFinishOutdoor.value = draft.finishOutdoor;
    if (DOM.finishFinishIndoor && draft.finishIndoor !== undefined) DOM.finishFinishIndoor.value = draft.finishIndoor;
    if (DOM.finishWipComp && draft.wipComp !== undefined) DOM.finishWipComp.value = draft.wipComp;
    if (DOM.finishWipTech && draft.wipTech !== undefined) DOM.finishWipTech.value = draft.wipTech;
    if (DOM.finishBatal && draft.batal !== undefined) DOM.finishBatal.value = draft.batal;
    if (DOM.finishAntar && draft.antar !== undefined) DOM.finishAntar.value = draft.antar;
    if (DOM.finishNoVisit && draft.noVisit !== undefined) DOM.finishNoVisit.value = draft.noVisit;
    if (DOM.finishKet && draft.ket !== undefined) DOM.finishKet.value = draft.ket;
  }

  if (DOM.finishNama) {
    const nikUpper = (state.profile ? state.profile.nik || '' : '').toUpperCase().trim();
    const isGlobalAdmin = nikUpper === 'ADMIN';
    const isSiteAdmin = SITE_CODES.includes(nikUpper);
    const loggedInName = state.profile ? (state.profile.nama || '').trim() : '';

    if (!isGlobalAdmin && !isSiteAdmin) {
      // 1. Normal Technician Login (login NIK) -> ONLY 1 option: the logged in user
      const techName = loggedInName || 'Teknisi';
      DOM.finishNama.innerHTML = `<option value="${escapeHtml(techName)}">${escapeHtml(techName)}</option>`;
      DOM.finishNama.value = techName;
      DOM.finishNama.disabled = true;
    } else {
      // 2. Admin / Site Admin Login -> List all technicians matching site role
      const rawList = [...VALID_FORM_TECHNICIANS];
      if (state.adminUsers && state.adminUsers.length > 0) {
        state.adminUsers.forEach(u => {
          if (u.nama && u.nama.trim()) rawList.push(u.nama.trim());
        });
      }
      if (state.userAreaMap) {
        Object.keys(state.userAreaMap).forEach(k => {
          if (k && k.trim()) rawList.push(k.trim());
        });
      }
      if (state.sheetsData && state.sheetsData.insentifRows) {
        state.sheetsData.insentifRows.forEach(item => {
          if (item && item.nama && item.nama.trim()) rawList.push(item.nama.trim());
        });
      }
      if (state.sheetsData && state.sheetsData.pendingCases) {
        state.sheetsData.pendingCases.forEach(item => {
          if (item && item.teknisi && item.teknisi.trim()) rawList.push(item.teknisi.trim());
        });
      }
      if (state.finishParsedAllRows) {
        state.finishParsedAllRows.forEach(item => {
          if (item && item.nama && item.nama.trim()) rawList.push(item.nama.trim());
        });
      }

      // Deduplicate case-insensitively while keeping clean casing
      const seen = new Set();
      let choices = [];
      rawList.forEach(name => {
        if (!name || name.toUpperCase() === 'NAMA TEKNISI' || name.toUpperCase() === 'TEKNISI') return;
        const normalized = name.trim().toLowerCase();
        if (!seen.has(normalized)) {
          seen.add(normalized);
          choices.push(name.trim());
        }
      });

      // Filter options to ONLY technicians matching site role for Site Admin
      if (isSiteAdmin && !isGlobalAdmin) {
        const filteredChoices = choices.filter(name => isMatchForCurrentRole(name));
        if (filteredChoices.length > 0) {
          choices = filteredChoices;
        }
      }

      const currentSelected = DOM.finishNama.value;
      DOM.finishNama.innerHTML = choices.map(t =>
        `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`
      ).join('');

      DOM.finishNama.disabled = false;
      if (currentSelected && choices.includes(currentSelected)) {
        DOM.finishNama.value = currentSelected;
      } else if (choices.length > 0) {
        DOM.finishNama.value = choices[0];
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
            if (isMatchForCurrentRole(rowNama)) {
              parsedAllRows.push(entryObj);
            }

            if (isMatchForCurrentRole(rowNama)) {
              filledDatesSet.add(normTgl);
            }
          }
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

function downloadFinishExcel() {
  const currentNik = state.profile ? (state.profile.nik || '').toUpperCase().trim() : '';
  const userAreaUpper = (state.profile ? (state.profile.area || '') : '').toUpperCase().trim();
  const isSiteAdmin = SITE_CODES.includes(currentNik) || (state.isAdmin && SITE_CODES.includes(userAreaUpper)) || !!state.isSiteAdmin;
  const isGlobalAdmin = currentNik === 'ADMIN';
  const isAdminOrSiteAdmin = isGlobalAdmin || isSiteAdmin || state.isAdmin;

  if (!isAdminOrSiteAdmin) {
    showToast('⚠️ Akses unduh Excel hanya untuk Admin / Site Admin!', 'warning');
    return;
  }

  const rows = state.finishParsedAllRows || [];
  const siteCode = SITE_CODES.includes(currentNik) ? currentNik : userAreaUpper;

  // Filter rows for current site admin's site (or all for global admin)
  const siteRows = rows.filter(item => {
    if (!item || !item.nama) return false;
    if (isGlobalAdmin) return true;
    return isMatchForCurrentRole(item.nama);
  });

  if (siteRows.length === 0) {
    showToast('⚠️ Tidak ada data finish untuk diunduh.', 'warning');
    return;
  }

  const headers = [
    'Tanggal Laporan',
    'Nama Teknisi',
    'Case Outdoor',
    'Finish Outdoor',
    'Finish Indoor',
    'WIP COMP',
    'WIP TECH',
    'Batal',
    'Pengembalian (Antar)',
    'Tidak Terkunjungi',
    'Keterangan'
  ];

  const csvLines = [];
  csvLines.push('sep=;'); // Tell MS Excel explicitly to split columns by semicolon
  csvLines.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(';'));

  siteRows.forEach(item => {
    const row = [
      item.tglLaporan || '',
      item.nama || '',
      item.caseOutdoor || 0,
      item.finishOutdoor || 0,
      item.finishIndoor || 0,
      item.wipComp || 0,
      item.wipTech || 0,
      item.batal || 0,
      item.antar || 0,
      item.noVisit || 0,
      item.ket || '-'
    ];
    csvLines.push(row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'));
  });

  const csvContent = '\uFEFF' + csvLines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const fileName = `Finish_Harian_${siteCode || 'ALL'}_${dateStr}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast(`📥 Berhasil mengunduh ${siteRows.length} data Finish Harian per kolom (${fileName})`, 'success');
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

  const currentNik = state.profile ? (state.profile.nik || '').toUpperCase().trim() : '';
  const userAreaUpper = (state.profile ? (state.profile.area || '') : '').toUpperCase().trim();
  const isSiteAdmin = SITE_CODES.includes(currentNik) || (state.isAdmin && SITE_CODES.includes(userAreaUpper)) || !!state.isSiteAdmin;
  const isGlobalAdmin = currentNik === 'ADMIN';
  const isAdminOrSiteAdmin = isGlobalAdmin || isSiteAdmin || state.isAdmin;

  if (DOM.btnDownloadFinishExcel) {
    DOM.btnDownloadFinishExcel.style.display = isAdminOrSiteAdmin ? 'inline-flex' : 'none';
  }

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
              <div class="finish-stat-box"><label>Outdoor (Unit/Tgs)</label><strong>${item.finishOutdoor} / ${item.caseOutdoor}</strong></div>
              <div class="finish-stat-box"><label>Indoor Unit</label><strong style="color:var(--primary);">${item.finishIndoor}</strong></div>
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
  }, 5000); // Auto refresh every 5 seconds
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

  prepareFinishForm(true);
  renderFinishHistory();

  fetchFinishSheetData().then(({ filledDatesSet, parsedAllRows }) => {
    renderMissingDatesList(filledDatesSet);
    renderFinishAllDataTab(parsedAllRows);
    renderFinishHistory();
  }).catch(() => {});

  showToast('✅ Finish Harian berhasil disimpan!', 'success');
  playBeepSound();
}

function renderFinishHistory() {
  if (!DOM.finishHistoryList) return;
  const list = state.finishParsedAllRows || [];
  const targetTechName = state.profile ? state.profile.nama : '';

  const filtered = list.filter(item => state.isAdmin || matchTechName(item.nama, targetTechName, state.profile ? state.profile.nik : ''));

  if (filtered.length === 0) {
    DOM.finishHistoryList.innerHTML = `
      <div class="empty-state-sm">
        <i data-lucide="clipboard" style="width:32px; height:32px; color:var(--text-muted); margin-bottom:6px;"></i>
        <p>Belum ada riwayat finish harian di Google Sheet.</p>
      </div>`;
    lucide.createIcons();
    return;
  }

  DOM.finishHistoryList.innerHTML = filtered.map(item => `
    <div class="finish-history-card">
      <div class="flex-between align-center mb-1">
        <span style="font-size:11px; font-weight:600; color:var(--primary);">${escapeHtml(item.nama)}</span>
        <span style="font-size:10px; color:var(--text-muted);">${escapeHtml(item.timestampCreated || item.tglLaporan)}</span>
      </div>
      <div style="font-weight:700; font-size:13px; color:var(--text-color);">Tanggal: ${escapeHtml(item.tglLaporan)}</div>
      <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">
        Finish In: ${escapeHtml(item.finishIndoor)} | Finish Out: ${escapeHtml(item.finishOutdoor)} | WIP Comp: ${escapeHtml(item.wipComp)} | Batal: ${escapeHtml(item.batal)}
      </div>
      ${item.ket ? `<div style="font-size:11px; color:var(--text-muted); font-style:italic; margin-top:2px;">Ket: ${escapeHtml(item.ket)}</div>` : ''}
    </div>
  `).join('');

  lucide.createIcons();
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
  const sClean = cleanNameString(sheetNama);
  const tClean = cleanNameString(targetNama);
  if (!sClean || !tClean) return false;
  if (sClean === 'ADMIN' || tClean === 'ADMIN') return false;
  if (sClean === tClean) return true;

  const sWords = sClean.split(' ').filter(w => w.length >= 2);
  const tWords = tClean.split(' ').filter(w => w.length >= 2);

  if (sWords.length === 0 || tWords.length === 0) return false;

  // Presisi Ketat: Jika target nama memiliki >= 2 kata, wajib cocok SEMUA kata
  if (tWords.length >= 2) {
    return tWords.every(tw => sWords.includes(tw));
  }
  // Jika 1 kata saja, wajib cocok persis dengan salah satu kata tunggal (dan panjang kata >= 3)
  return sWords.length === 1 && tWords.length === 1 && sWords[0] === tWords[0];
}

function getTechnicianRegisteredArea(techName) {
  if (!techName || !state.userAreaMap) return null;
  const cTech = cleanNameString(techName);
  if (!cTech) return null;

  // 1. Direct key match
  if (state.userAreaMap[cTech]) {
    return state.userAreaMap[cTech];
  }

  // 2. Exact name matching against keys in userAreaMap
  for (const [key, area] of Object.entries(state.userAreaMap)) {
    if (key.length >= 3 && matchTechName(cTech, key)) {
      return area;
    }
  }

  return null;
}

function isMatchForCurrentRole(techName, rowArea = '') {
  if (!state.isLoggedIn || !state.profile) return false;

  const nikUpper = (state.profile.nik || '').toUpperCase().trim();
  const userAreaUpper = (state.profile.area || '').toUpperCase().trim();

  // 1. Global Admin (ADMIN / 000) sees EVERYTHING across all sites
  if (nikUpper === 'ADMIN') return true;

  // 2. Site Admin ONLY if NIK equals one of SITE_CODES (BDG, BDU, CRB, SKB, SBN, TSM)
  const isSiteAdmin = SITE_CODES.includes(nikUpper) || !!state.isSiteAdmin;
  if (isSiteAdmin) {
    const siteCode = SITE_CODES.includes(nikUpper) ? nikUpper : userAreaUpper;

    const registeredArea = getTechnicianRegisteredArea(techName);
    if (registeredArea) {
      return registeredArea.toUpperCase().trim() === siteCode;
    }
    if (rowArea && rowArea.toUpperCase().trim() === siteCode) return true;
    if (techName && cleanNameString(techName) === siteCode.toLowerCase()) return true;

    return false;
  }

  // 3. Normal Technician (Login using regular NIK / Username): sees ONLY their own data
  return matchTechName(techName, state.profile.nama, state.profile.nik);
}

function matchTechName(sheetName, userName, userNik = '') {
  const uUpper = (userName || '').toUpperCase().trim();
  const nUpper = (userNik || '').toUpperCase().trim();

  // Jika tidak ada kriteria filter yang diisi atau admin global
  if (!uUpper && !nUpper) return true;
  if (uUpper === 'ADMIN' || nUpper === 'ADMIN') return true;

  if (!sheetName) return false;

  const sClean = cleanNameString(sheetName);
  const uClean = cleanNameString(userName);
  const nClean = cleanNumberString(userNik);

  if (!sClean) return false;

  // 1. Prioritas NIK: Match persis NIK jika cell memuat NIK
  if (nClean && nClean.length >= 3 && (sClean === nClean || sClean.includes(nClean))) {
    return true;
  }

  if (!uClean) return false;

  // 2. Pencocokan Persis (Exact Clean Match)
  if (sClean === uClean) {
    return true;
  }

  // 3. Pencocokan Kata Ketat (Strict All-Word Coverage):
  // Menghindari "BUDI SANTOSO" salah cocok dengan "BUDI SETIAWAN"
  const sWords = sClean.split(' ').filter(w => w.length >= 2);
  const uWords = uClean.split(' ').filter(w => w.length >= 2);

  if (sWords.length === 0 || uWords.length === 0) return false;

  // Jika nama user memuat >= 2 kata, WAJIB semua kata ada di nama sheet
  if (uWords.length >= 2) {
    const allWordsMatch = uWords.every(uWord => sWords.includes(uWord));
    if (allWordsMatch) return true;
  }

  // Jika nama user hanya 1 kata, harus cocok persis dengan kata dalam sheet (jika sheet juga 1 kata)
  if (uWords.length === 1 && sWords.length === 1 && sWords[0] === uWords[0]) {
    return true;
  }

  // Substring match hanya untuk nama panjang (>=6 huruf) di mana sClean diawali/diakhiri uClean
  if (uClean.length >= 6 && (sClean.startsWith(uClean) || sClean.endsWith(uClean))) {
    return true;
  }

  return false;
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
    if (sClean === uClean) score += 80;
    else if (sClean.startsWith(uClean) || uClean.startsWith(sClean)) score += 40;

    let matchCount = 0;
    for (let uw of uWords) {
      if (sWords.has(uw)) matchCount++;
    }

    // Skor ketat: Hanya berikan poin penuh jika cocok SEMUA kata
    if (uWords.size >= 2 && matchCount === uWords.size) {
      score += 50;
    } else if (uWords.size === 1 && matchCount === 1 && sWords.size === 1) {
      score += 30;
    } else if (uWords.size >= 2 && matchCount < uWords.size) {
      // Penalti jika hanya cocok sebagian kata agar tidak salah orang
      score -= 50;
    }

    if (score > bestScore && score > 0) {
      bestScore = score;
      bestItem = item;
    }
  }

  return (bestScore > 0 && bestItem) ? bestItem : {};
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
      const currentNik = (state.profile && state.profile.nik) ? String(state.profile.nik).trim() : '';
      if (parsed && parsed.cacheNik && currentNik && parsed.cacheNik !== currentNik) {
        return; // Skip cache from a different NIK session
      }
      state.sheetsData = {
        ...state.sheetsData,
        ...parsed
      };
      renderAllSheetsViews();
      return;
    } catch (e) {
      console.warn('Gagal parse cache Google Sheets:', e);
    }
  }
  loadFinishSheetCache();
}

function saveSheetsCache() {
  try {
    const key = getSheetsCacheKey();
    const currentNik = (state.profile && state.profile.nik) ? String(state.profile.nik).trim() : '';
    localStorage.setItem(key, JSON.stringify({
      ...state.sheetsData,
      cacheNik: currentNik
    }));
  } catch (e) {
    console.warn('Gagal simpan cache Google Sheets:', e);
  }
}

async function fetchGVizSheet(sheetName, range = 'A1:BZ2000', noHeaders = false) {
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
    const rangeParam = range ? `&range=${encodeURIComponent(range)}` : '&range=A1%3ABZ2000';
    script.src = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=responseHandler:${callbackName}${rangeParam}${headersParam}&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
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
  // Strategy 1: Apps Script Web App API (Returns 100% evaluated live data including PDS formulas)
  if (typeof APPS_SCRIPT_WEB_APP_URL !== 'undefined' && APPS_SCRIPT_WEB_APP_URL && APPS_SCRIPT_WEB_APP_URL.trim() !== '') {
    try {
      const resp = await fetch(APPS_SCRIPT_WEB_APP_URL);
      if (resp && resp.ok) {
        const json = await resp.json();
        if (json && json.status === 'success') {
          if (sheetName.toUpperCase() === 'DATA' && json.data && Array.isArray(json.data) && json.data.length > 0) {
            return json.data;
          }
          if (sheetName.toUpperCase() === 'NOTIF' && json.notif && Array.isArray(json.notif) && json.notif.length > 0) {
            return json.notif;
          }
        }
      }
    } catch (e) {}
  }

  // Strategy 2: JSONP Script Injection Fallback
  try {
    const table = await fetchGVizSheet(sheetName, range || 'A1:BZ2000');
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
    const rowsData = await fetchSheetMatrix('DATA', 'A1:BZ2000');
    const rowsNotif = await fetchSheetMatrix('NOTIF').catch(() => []);

    const techName = state.profile.nama || '';
    const techNik = state.profile.nik || '';

    syncUserProfileAreaFromSheet();

    // 0. Direct Cell Extraction for Timestamps from Col AY (Index 50)
    const defaultTs = 'Update Tanggal ' + new Date().toLocaleDateString('id-ID');

    let pendingTimestamp = (rowsData && rowsData.length > 1 && rowsData[1] && rowsData[1][50]) ? String(rowsData[1][50]).trim() : '';
    if (!pendingTimestamp) pendingTimestamp = defaultTs;

    let performaTimestamp = (rowsData && rowsData.length > 2 && rowsData[2] && rowsData[2][50]) ? String(rowsData[2][50]).trim() : '';
    if (!performaTimestamp) performaTimestamp = pendingTimestamp || defaultTs;

    let partKembaliTimestamp = (rowsData && rowsData.length > 3 && rowsData[3] && rowsData[3][50]) ? String(rowsData[3][50]).trim() : '';
    if (!partKembaliTimestamp) partKembaliTimestamp = pendingTimestamp || defaultTs;

    let tagihanTimestamp = (rowsData && rowsData.length > 4 && rowsData[4] && rowsData[4][50]) ? String(rowsData[4][50]).trim() : '';
    if (!tagihanTimestamp) tagihanTimestamp = pendingTimestamp || defaultTs;

    // 1. Pending Cases (Sheet DATA, Row 1+, Col AZ to BH / Col Index 51 to 59)
    const pendingCases = [];

    for (let r = 1; r < rowsData.length; r++) {
      const row = rowsData[r];
      if (!row || row.length < 52) continue;

      const statusVal = (row[51] || '').trim();  // AZ: STATUS (Col Index 51)
      const usiaVal = (row[52] || '').trim();    // BA: REF / USIA (Col Index 52)
      const rowTech = (row[53] || '').trim();    // BB: TEKNISI (Col Index 53)
      const area = (row[54] || '').trim();       // BC: SITE (Col Index 54)
      const noCase = (row[55] || '').trim();     // BD: NO CASE (Col Index 55)
      const tglCase = (row[56] || '').trim();    // BE: TGL CASE (Col Index 56)
      const unitType = (row[57] || '').trim();   // BF: TYPE (Col Index 57)
      const snVal = (row[58] || '').trim();      // BG: SERI (Col Index 58)
      const sclVal = (row[59] || '').trim();     // BH: SCL (Col Index 59)

      // Skip header row
      if (statusVal.toUpperCase() === 'STATUS' || noCase.toUpperCase() === 'NO CASE') continue;

      if ((noCase || statusVal) && isMatchForCurrentRole(rowTech, area)) {
        pendingCases.push({
          tgl: (tglCase && tglCase !== '0' && tglCase !== 'False') ? tglCase : '-',
          no_case: (noCase && noCase !== '0') ? noCase : '-',
          type: (unitType && unitType !== '0') ? unitType : '-',     // BF: TYPE
          sn: (snVal && snVal !== '0') ? snVal : '-',                // BG: SERI
          seri: (snVal && snVal !== '0') ? snVal : '-',              // BG: SERI
          scl: (sclVal && sclVal !== '0') ? sclVal : '-',            // BH: SCL
          no_scl: (sclVal && sclVal !== '0') ? sclVal : '-',         // BH: SCL
          site: (area && area !== '0') ? area : '-',                 // BC: SITE
          status: (statusVal && statusVal !== '0') ? statusVal : 'PENDING', // AZ: STATUS
          teknisi: rowTech || '-',                                   // BB: TEKNISI
          ket_part: statusVal,                                       // AZ: STATUS
          usia: (usiaVal && usiaVal !== '0') ? cleanNumberString(usiaVal) : '' // BA: REF/USIA
        });
      }
    }

    // 2. Part Bekas / Part Belum Kembali (Sheet DATA, Row 1+, Col AM to AS / Col Index 38 to 44)
    const partBelumKembali = [];
    for (let r = 1; r < rowsData.length; r++) {
      const row = rowsData[r];
      if (!row || row.length < 45) continue;
      const siteAM = (row[38] || '').trim();      // AM: SITE (Col Index 38)
      const noReservasi = (row[39] || '').trim(); // AN: NO RSV (Col Index 39)
      const partNo = (row[40] || '').trim();      // AO: PART NUMBER (Col Index 40)
      const qtyVal = (row[41] || '').trim();      // AP: QTY BELUM KEMBALI (Col Index 41)
      const tglVal = (row[43] || '').trim();      // AR: TANGGAL (Col Index 43)
      const techNameRow = (row[44] || '').trim(); // AS: TEKNISI (Col Index 44)

      if (noReservasi.toUpperCase() === 'NO RSV' || partNo.toUpperCase() === 'PART' || techNameRow.toUpperCase() === 'TEKNISI') continue;

      if ((partNo || noReservasi) && techNameRow && isMatchForCurrentRole(techNameRow, siteAM)) {
        partBelumKembali.push({
          noGudang: partNo || noReservasi,
          qty: qtyVal || '1',
          tgl: (tglVal && tglVal !== '0' && tglVal !== 'False' && tglVal !== 'True') ? tglVal : '',
          teknisi: techNameRow,
          noReservasi: (noReservasi && noReservasi.toUpperCase() !== 'NONE') ? noReservasi : ''
        });
      }
    }

    // 3. Tagihan (Sheet DATA, Row 1+, Col AT to AX / Col Index 45 to 49)
    const tagihanRows = [];
    for (let r = 1; r < rowsData.length; r++) {
      const row = rowsData[r];
      if (!row || row.length < 50) continue;
      const siteAT = (row[45] || '').trim();      // AT: SITE / AREA (Col Index 45)
      const noInvoice = (row[46] || '').trim();   // AU: NO INVOICE (Col Index 46)
      const valAV = (row[47] || '').trim();       // AV: TEKNISI / ITEM (Col Index 47)
      const valAW = (row[48] || '').trim();       // AW: TEKNISI / NOMINAL (Col Index 48)
      const namaCustomer = (row[49] || '').trim();// AX: NAMA CUSTOMER (Col Index 49)

      if (noInvoice.toUpperCase() === 'NO INVOICE' || valAV.toUpperCase() === 'TEKNISI' || valAW.toUpperCase() === 'TEKNISI') continue;

      let techNameRow = valAW;
      let jumlahVal = valAV;

      const awIsNumber = /^[0-9.,]+$/.test(valAW);
      const avIsNumber = /^[0-9.,]+$/.test(valAV);

      if (awIsNumber) {
        jumlahVal = valAW;
        techNameRow = valAV || valAW;
      } else if (avIsNumber) {
        jumlahVal = valAV;
        techNameRow = valAW || valAV;
      }

      if ((noInvoice || jumlahVal) && techNameRow && isMatchForCurrentRole(techNameRow, siteAT)) {
        tagihanRows.push({
          noInvoice: noInvoice || 'INV-' + r,
          teknisi: techNameRow,
          jumlah: jumlahVal || '0',
          namaKonsumen: namaCustomer || '-',
          site: siteAT || '-'
        });
      }
    }

    // 4. Performa / Output (Sheet DATA, Row 1+, Col A to F for totals, G to AK for daily output)
    const insentifRows = [];
    const outputHariIni = [];

    const todayDay = new Date().getDate();
    let todayColIdx = -1;

    if (rowsData && rowsData.length > 0) {
      for (let c = 6; c <= 36; c++) {
        if (rowsData[0] && rowsData[0][c]) {
          const val = String(rowsData[0][c]).trim();
          if (val === String(todayDay) || val === String(todayDay) + '.0') {
            todayColIdx = c;
            break;
          }
        }
      }
    }
    if (todayColIdx === -1) {
      todayColIdx = 5 + todayDay;
    }

    for (let r = 1; r < rowsData.length; r++) {
      const row = rowsData[r];
      if (!row || row.length < 6) continue;
      const techNameRow = (row[0] || '').trim();
      if (!techNameRow || techNameRow.toUpperCase() === 'NAMA TEKNISI') continue;

      const indoorCount = parseInt(row[1] || '0', 10) || 0;
      const outdoorCount = parseInt(row[2] || '0', 10) || 0;
      const acCount = parseInt(row[3] || '0', 10) || 0;
      const evCount = parseInt(row[4] || '0', 10) || 0;

      const todayOutputVal = (row[todayColIdx] !== undefined && row[todayColIdx] !== null) ? String(row[todayColIdx]).trim() : '0';

      insentifRows.push({
        nama: techNameRow,
        indoor: indoorCount.toString(),
        outdoor: outdoorCount.toString(),
        ac: acCount.toString(),
        ev: evCount.toString(),
        insentif: row[5] || '0',
        total_output: (indoorCount + outdoorCount + acCount + evCount).toString()
      });

      outputHariIni.push({
        nama: techNameRow,
        total_output: todayOutputVal || '0'
      });
    }

    // 5. Notifications (Sheet NOTIF, Cols A-J)
    const notifications = [];
    for (let r = 0; r < rowsNotif.length; r++) {
      const row = rowsNotif[r];
      if (!row || row.length === 0) continue;
      const rowTech = row[6] || row[7] || '';
      if (rowTech && isMatchForCurrentRole(rowTech)) {
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

    // 6. Pencapaian PDS (Sheet DATA, Column AL / Index 37 or scan row)
    const pdsRows = [];
    if (rowsData && rowsData.length > 0) {
      for (let r = 0; r < rowsData.length; r++) {
        const row = rowsData[r];
        if (!row || row.length === 0) continue;

        let colIdx = 37;
        let cellVal = (row[colIdx] !== undefined && row[colIdx] !== null) ? String(row[colIdx]).trim() : '';

        if (!cellVal.toUpperCase().startsWith('LOAD ')) {
          for (let c = 0; c < row.length; c++) {
            const v = String(row[c] || '').trim();
            if (v.toUpperCase().startsWith('LOAD ')) {
              colIdx = c;
              cellVal = v;
              break;
            }
          }
        }

        if (cellVal.toUpperCase().startsWith('LOAD ')) {
          let siteName = cellVal.replace(/^LOAD\s+/i, '').trim();
          siteName = siteName.replace(/[\s,]+dkk.*$/i, '').trim();

          const loadValRaw = (rowsData[r + 1] && rowsData[r + 1][colIdx] !== undefined) ? String(rowsData[r + 1][colIdx]).trim() : '0';
          const pendingValRaw = (rowsData[r + 2] && rowsData[r + 2][colIdx] !== undefined) ? String(rowsData[r + 2][colIdx]).trim() : '0';
          const pctValRaw = (rowsData[r + 3] && rowsData[r + 3][colIdx] !== undefined) ? String(rowsData[r + 3][colIdx]).trim() : '0%';

          const loadNum = parseInt(loadValRaw.replace(/[^0-9]/g, ''), 10) || 0;
          const pendingNum = parseInt(pendingValRaw.replace(/[^0-9]/g, ''), 10) || 0;

          let pctDisplay = pctValRaw;
          if (!pctDisplay || pctDisplay.includes('#DIV/0!') || pctDisplay === 'NaN' || pctDisplay === '0') {
            if (loadNum > 0) {
              const calcPct = ((pendingNum / loadNum) * 100).toFixed(1);
              pctDisplay = calcPct.endsWith('.0') ? Math.round(calcPct) + '%' : calcPct + '%';
            } else {
              pctDisplay = '0%';
            }
          }

          let pctNum = parseFloat(pctDisplay.replace('%', '').trim()) || 0;
          if (isNaN(pctNum)) pctNum = 0;

          pdsRows.push({
            site: siteName || 'SITE',
            load: loadNum,
            loadRaw: loadValRaw || '0',
            pending: pendingNum,
            pendingRaw: pendingValRaw || '0',
            pctPending: pctDisplay,
            pctNum: pctNum
          });
        }
      }
    }

    // Update state & single source of truth cache
    state.rawRowsData = rowsData;
    state.sheetsData = {
      rawRowsData: rowsData,
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
      tagihanRows,
      pdsRows
    };

    saveSheetsCache();
    renderAllSheetsViews();

    // Auto-sync Finish Sheet Data & update views live
    fetchFinishSheetData().then(({ filledDatesSet, parsedAllRows }) => {
      renderFinishRecapTab();
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
  fetchPipoData();
  state.sheetsPollTimer = setInterval(() => {
    fetchGoogleSheetsData();
    fetchPipoData();
  }, 5000); // Ambil data otomatis dari Google Sheet setiap 5 detik
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
  renderPdsTab();
  renderFinishRecapTab();
  prepareFinishForm();
  updateBadges();
}

function renderSheetUpdateInfo() {
  const baseTs = (typeof window !== 'undefined' && window.__INIT_SHEET_TS__) ? window.__INIT_SHEET_TS__ : '';
  const pendingTs = state.sheetsData.pendingTimestamp || state.sheetsData.lastUpdateTimestamp || baseTs || 'Memuat data....';
  const performaTs = state.sheetsData.performaTimestamp || pendingTs;
  const partKembaliTs = state.sheetsData.partKembaliTimestamp || pendingTs;
  const tagihanTs = state.sheetsData.tagihanTimestamp || pendingTs;
  const pdsTs = state.sheetsData.pdsTimestamp || performaTs || pendingTs;

  let activeTs = pendingTs;
  if (state.activeTab === 'tab-performa') activeTs = performaTs;
  else if (state.activeTab === 'tab-part-kembali') activeTs = partKembaliTs;
  else if (state.activeTab === 'tab-tagihan') activeTs = tagihanTs;
  else if (state.activeTab === 'tab-pencapaian-pds') activeTs = pdsTs;

  let displayTs = activeTs;
  if (displayTs && !displayTs.toLowerCase().includes('update')) {
    displayTs = 'Update ' + displayTs;
  }

  if (DOM.sheetZ2Timestamp) {
    DOM.sheetZ2Timestamp.textContent = displayTs;
  }
}

function updateBadges() {
  const notifCount = state.sheetsData.notifications ? state.sheetsData.notifications.length : 0;
  const pendingCount = state.sheetsData.pendingCases ? state.sheetsData.pendingCases.length : 0;
  const partCount = state.sheetsData.partBelumKembali ? state.sheetsData.partBelumKembali.length : 0;
  const tagihanCount = state.sheetsData.tagihanRows ? state.sheetsData.tagihanRows.length : 0;

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
  if (DOM.navPartBadge) {
    DOM.navPartBadge.textContent = partCount;
    DOM.navPartBadge.classList.toggle('hidden', partCount === 0);
  }
  if (DOM.navTagihanBadge) {
    DOM.navTagihanBadge.textContent = tagihanCount;
    DOM.navTagihanBadge.classList.toggle('hidden', tagihanCount === 0);
  }

  if (DOM.pendingTechCount) DOM.pendingTechCount.textContent = `${pendingCount} Case`;
  if (DOM.notifTechCount) DOM.notifTechCount.textContent = `${notifCount} Notif`;
  if (DOM.partKembaliCount) DOM.partKembaliCount.textContent = `${partCount} Item`;
  if (DOM.tagihanCount) DOM.tagihanCount.textContent = `${tagihanCount} Invoice`;
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
          <div style="font-size:10px; font-weight:600; color:var(--text-main); display:flex; align-items:center; gap:5px; word-break:break-all;">
            <i data-lucide="file-text" title="No Case" style="width:13px; height:13px; color:var(--primary); flex-shrink:0;"></i>
            <span>${escapeHtml(item.no_case || '-')}</span>
          </div>
          <span class="pending-status-badge ${statusClass}" style="flex-shrink:0; font-size:10px; padding:2px 7px; font-weight:700;">
            ${escapeHtml(item.status || 'PENDING')}
          </span>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px 8px; font-size:10px; color:var(--text-main); border-top:1px dashed var(--border-color); padding-top:6px;">
          <div style="display:flex; align-items:center; gap:4px;" title="Tanggal (BE)">
            <i data-lucide="calendar" style="width:12px; height:12px; color:var(--primary); flex-shrink:0;"></i>
            <span>${escapeHtml(item.tgl || '-')}</span>
          </div>
          <div style="display:flex; align-items:center; gap:4px;" title="Type Unit (BF)">
            <i data-lucide="cpu" style="width:12px; height:12px; color:var(--info, #3b82f6); flex-shrink:0;"></i>
            <span style="word-break:break-all;">${escapeHtml(item.type || '-')}</span>
          </div>
          <div style="display:flex; align-items:center; gap:4px;" title="No Seri (BG)">
            <i data-lucide="barcode" style="width:12px; height:12px; color:var(--warning); flex-shrink:0;"></i>
            <span style="word-break:break-all;">${escapeHtml(item.sn || item.seri || '-')}</span>
          </div>
          <div style="display:flex; align-items:center; gap:4px;" title="SCL (BH)">
            <i data-lucide="layers" style="width:11px; height:11px; color:var(--warning); flex-shrink:0;"></i>
            <span style="word-break:break-all;">${escapeHtml(item.scl || item.no_scl || '-')}</span>
          </div>
          <div style="display:flex; align-items:center; gap:4px;" title="Site (BC)">
            <i data-lucide="map-pin" style="width:12px; height:12px; color:var(--primary); flex-shrink:0;"></i>
            <span>${escapeHtml(item.site || '-')}</span>
          </div>
          <div style="display:flex; align-items:center; gap:4px;" title="Teknisi (BB)">
            <i data-lucide="user" style="width:12px; height:12px; color:var(--text-muted); flex-shrink:0;"></i>
            <span style="word-break:break-all;">${escapeHtml(item.teknisi || '-')}</span>
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

function parseRupiahToNumber(val) {
  if (val === undefined || val === null) return 0;
  let str = String(val).trim();
  if (!str || str === '-' || str === '0') return 0;
  str = str.replace(/^rp\s*/i, '').trim();
  if (/^\d{1,3}(\.\d{3})+$/.test(str)) {
    str = str.replace(/\./g, '');
  } else if (/^\d{1,3}(\.\d{3})+,\d+$/.test(str)) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',') && !str.includes('.')) {
    str = str.replace(',', '.');
  }
  let num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function renderPerformaTab() {
  if (!DOM.performaContentContainer) return;
  const currentNama = state.profile ? (state.profile.nama || '') : '';
  const currentNik = state.profile ? (state.profile.nik || '') : '';
  const nikUpper = currentNik.toUpperCase().trim();
  const isGlobalAdmin = nikUpper === 'ADMIN';
  const isSiteAdmin = SITE_CODES.includes(nikUpper);
  const isAdminOrSiteAdmin = isGlobalAdmin || isSiteAdmin;

  const insentifList = state.sheetsData.insentifRows || [];
  const outputList = state.sheetsData.outputHariIni || [];

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

  let displayName = state.profile.nama || 'Teknisi';
  let displayInsentif = 'Rp 0';
  let displayOutputHariIni = '0';
  let indoorCount = 0;
  let outdoorCount = 0;
  let acCount = 0;
  let evTotal = 0;
  let techBreakdown = [];
  let activeTechCount = 1;

  if (isAdminOrSiteAdmin && insentifList.length > 0) {
    // ==========================================================
    // AGGREGATED QUANTITIES FOR ADMIN / SITE ADMIN
    // ==========================================================
    let totalInsentifSum = 0;
    let totalOutputTodaySum = 0;

    const activeInsentifList = insentifList.filter(item => {
      if (!item || !item.nama) return false;
      if (isGlobalAdmin) return true;
      return isMatchForCurrentRole(item.nama);
    });

    activeTechCount = activeInsentifList.length > 0 ? activeInsentifList.length : 1;

    if (isGlobalAdmin) {
      displayName = 'Performa All Site (JABAR)';
    } else if (isSiteAdmin) {
      const siteCode = SITE_CODES.includes(nikUpper) ? nikUpper : userAreaUpper;
      displayName = `Performa Site ${siteCode} (${activeTechCount} Teknisi)`;
    }

    const outputMap = {};
    outputList.forEach(item => {
      if (item && item.nama) {
        outputMap[cleanNameString(item.nama)] = parseInt(item.total_output || '0', 10) || 0;
      }
    });

    techBreakdown = activeInsentifList.map(item => {
      const inVal = parseInt(item.indoor || '0', 10) || 0;
      const outVal = parseInt(item.outdoor || '0', 10) || 0;
      const acVal = parseInt(item.ac || '0', 10) || 0;
      const evVal = (parseInt(item.ev || '0', 10) || 0) +
                    (parseInt(item.ev1 || '0', 10) || 0) +
                    (parseInt(item.ev2 || '0', 10) || 0) +
                    (parseInt(item.ev3 || '0', 10) || 0);
      const totalUnit = inVal + outVal + acVal + evVal;

      const insentifNum = parseRupiahToNumber(item.insentif);
      const cName = cleanNameString(item.nama);
      const todayOut = outputMap[cName] !== undefined ? outputMap[cName] : (parseInt(item.today_output || '0', 10) || 0);

      totalInsentifSum += insentifNum;
      totalOutputTodaySum += todayOut;
      indoorCount += inVal;
      outdoorCount += outVal;
      acCount += acVal;
      evTotal += evVal;

      return {
        nama: item.nama,
        insentif: insentifNum,
        todayOutput: todayOut,
        totalUnit
      };
    });

    displayInsentif = formatRupiah(totalInsentifSum);
    displayOutputHariIni = String(totalOutputTodaySum);

  } else {
    // ==========================================================
    // SINGLE TECHNICIAN QUANTITIES (NORMAL NIK LOGIN)
    // ==========================================================
    const insentif = getBestMatchedItem(insentifList, currentNama, currentNik);
    const outputObj = getBestMatchedItem(outputList, currentNama, currentNik);

    indoorCount = parseInt(insentif.indoor || '0', 10) || 0;
    outdoorCount = parseInt(insentif.outdoor || '0', 10) || 0;
    acCount = parseInt(insentif.ac || '0', 10) || 0;
    evTotal = (parseInt(insentif.ev || '0', 10) || 0) +
              (parseInt(insentif.ev1 || '0', 10) || 0) +
              (parseInt(insentif.ev2 || '0', 10) || 0) +
              (parseInt(insentif.ev3 || '0', 10) || 0);

    displayInsentif = formatRupiah(insentif.insentif);
    displayOutputHariIni = outputObj.total_output || '0';
    activeTechCount = 1;
  }

  const totalUnitCount = indoorCount + outdoorCount + acCount + evTotal;
  const calculatedRataRata = workingDaysCount > 0 ? (totalUnitCount / workingDaysCount).toFixed(1) : '0.0';

  const target160 = 160 * activeTechCount;
  const target107 = 107 * activeTechCount;

  const diff160 = totalUnitCount - target160;
  const diff107 = totalUnitCount - target107;

  const formatDiff = (d) => (d > 0 ? `+${d}` : `${d}`);
  const calculatedSelisih = `${formatDiff(diff160)} / ${formatDiff(diff107)}`;

  DOM.performaContentContainer.innerHTML = `
    <!-- Hero Performance Overview -->
    <div class="performa-hero-card">
      <div class="performa-hero-title">
        <i data-lucide="user"></i> ${escapeHtml(displayName)}
      </div>
      <div class="performa-hero-grid">
        <div class="performa-hero-item">
          <div class="performa-hero-value">${displayInsentif}</div>
          <div class="performa-hero-label">Insentif</div>
        </div>
        <div class="performa-hero-item">
          <div class="performa-hero-value" style="color:var(--secondary);">${escapeHtml(displayOutputHariIni)}</div>
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
        <div class="stat-val" style="color:var(--secondary);">${acCount}</div>
        <div class="stat-lbl">AC</div>
      </div>
      <div class="performa-stat-box">
        <div class="stat-val" style="color:var(--info, #3b82f6);">${indoorCount}</div>
        <div class="stat-lbl">INDOOR</div>
      </div>
      <div class="performa-stat-box">
        <div class="stat-val" style="color:var(--warning);">${outdoorCount}</div>
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
        <div style="flex-shrink:0; margin-left:auto; text-align:right;">
          <span style="font-size:11.5px; font-weight:800; color:var(--primary); background:rgba(16, 185, 129, 0.15); padding:3px 8px; border-radius:var(--radius-sm); border:1px solid rgba(16, 185, 129, 0.3); display:inline-block;">
            Qty: ${escapeHtml(item.qty)}
          </span>
        </div>
      </div>
      <div style="font-size:10px; color:var(--text-muted); margin-top:2px; display:flex; flex-wrap:wrap; gap:8px; align-items:center; padding-left:40px;">
        ${item.teknisi ? `<span><i data-lucide="user" title="Teknisi" style="width:10px; height:10px; display:inline;"></i> <strong style="color:var(--text-main); font-weight:600;">${escapeHtml(item.teknisi)}</strong></span>` : ''}
        ${item.tgl ? `<span><i data-lucide="calendar" title="Tanggal" style="width:10px; height:10px; display:inline;"></i> <strong style="color:var(--text-main); font-weight:600;">${escapeHtml(item.tgl)}</strong></span>` : ''}
      </div>
      ${item.noReservasi ? `
      <div style="font-size:10.5px; color:var(--primary); font-weight:700; word-break:break-all; padding-left:40px; margin-top:1px;">
        <i data-lucide="bookmark" title="No Reservasi" style="width:10.5px;height:10.5px;display:inline;"></i> ${escapeHtml(item.noReservasi)}
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
      (item.teknisi || '').toUpperCase().includes(searchQ) ||
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
          <div style="font-size:10px; color:var(--text-muted); margin-top:2px; display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            <span><i data-lucide="wrench" title="Teknisi" style="width:10px; height:10px; display:inline;"></i> <strong style="color:var(--text-main); font-weight:600;">${escapeHtml(item.teknisi)}</strong></span>
            <span><i data-lucide="user" title="Konsumen" style="width:10px; height:10px; display:inline;"></i> <strong style="color:var(--text-main); font-weight:600;">${escapeHtml(item.namaKonsumen)}</strong></span>
            ${item.site && item.site !== '-' ? `<span style="background:var(--primary-light); color:var(--primary); padding:1px 5px; border-radius:4px; font-weight:700; font-size:9.5px;"><i data-lucide="map-pin" title="Site" style="width:9px; height:9px; display:inline;"></i> ${escapeHtml(item.site)}</span>` : ''}
          </div>
        </div>
      </div>
      <div style="display:flex; align-items:center; flex-shrink:0;">
        <span style="font-size:10px; font-weight:800; color:var(--warning); background:rgba(245, 158, 11, 0.15); padding:3px 7px; border-radius:var(--radius-sm); border:1px solid rgba(245, 158, 11, 0.3);">
          ${formatRupiah(item.jumlah)}
        </span>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

// ==========================================
// WHATSAPP & FONTE API INTEGRATION MODULE
// ==========================================

function getAdminOrSiteAdminStatus() {
  const currentNik = state.profile ? (state.profile.nik || '').toUpperCase().trim() : '';
  const isGlobalAdmin = currentNik === 'ADMIN';
  const isSiteAdmin = SITE_CODES.includes(currentNik);
  return { isGlobalAdmin, isSiteAdmin, isAdminOrSiteAdmin: isGlobalAdmin || isSiteAdmin };
}

function isTechnicianMatch(sheetTech, targetTech) {
  if (!sheetTech || !targetTech) return false;
  const sUpper = String(sheetTech).toUpperCase().trim();
  const tUpper = String(targetTech).toUpperCase().trim();
  if (sUpper === tUpper) return true;

  const sClean = cleanNameString(sheetTech);
  const tClean = cleanNameString(targetTech);
  if (!sClean || !tClean) return false;
  if (sClean === tClean) return true;

  const sWords = sClean.split(' ').filter(w => w.length >= 2);
  const tWords = tClean.split(' ').filter(w => w.length >= 2);

  if (sWords.length >= 2 && tWords.length >= 2) {
    let matchCount = 0;
    for (let tw of tWords) {
      if (sWords.includes(tw)) matchCount++;
    }
    const minRequired = Math.min(sWords.length, tWords.length, 2);
    if (matchCount >= minRequired) return true;
  }

  if (sWords.length === 1 && tWords.length >= 1) {
    if (tWords.includes(sWords[0])) return true;
  }
  if (tWords.length === 1 && sWords.length >= 1) {
    if (sWords.includes(tWords[0])) return true;
  }

  return false;
}

function getSelectedWaPendingStatuses() {
  const checklistEl = document.getElementById('wa-status-checklist');
  if (!checklistEl) return null;
  const checkedCbs = checklistEl.querySelectorAll('.wa-status-item-cb:checked');
  return Array.from(checkedCbs).map(cb => cb.value.toUpperCase().trim());
}

function getTagihanCategory(namaKonsumen) {
  const upper = (namaKonsumen || '').toUpperCase().trim();
  if (upper.includes('GONUSA')) {
    return 'PT. GONUSA PRIMA DISTRIBUSI';
  }
  if (upper.includes('SUMBER CIPTA') || upper.includes('MULTINIAGA')) {
    return 'SUMBER CIPTA MULTINIAGA';
  }
  if (upper.includes('HARTONO') || upper.includes('POLYTRON')) {
    return 'PT. HARTONO ISTANA TEKNOLOGI';
  }
  return 'DIRECT KONSUMEN';
}

const TAGIHAN_CATEGORIES = [
  'PT. GONUSA PRIMA DISTRIBUSI',
  'SUMBER CIPTA MULTINIAGA',
  'PT. HARTONO ISTANA TEKNOLOGI',
  'DIRECT KONSUMEN'
];

function buildTechnicianWaMessage(targetTechName, contextTab = '', selectedStatuses = null) {
  if (!targetTechName) return null;
  const activeTab = contextTab || state.activeTab || 'tab-pending';

  const allTechPending = (state.sheetsData.pendingCases || []).filter(item => isTechnicianMatch(item.teknisi, targetTechName));
  const activeSelectedStatuses = selectedStatuses !== null ? selectedStatuses : (state.selectedWaPendingStatuses || null);

  let pendingCases = allTechPending;
  if (activeSelectedStatuses !== null && Array.isArray(activeSelectedStatuses) && activeSelectedStatuses.length > 0) {
    pendingCases = allTechPending.filter(item => {
      const st = (item.status || 'PENDING').toUpperCase().trim();
      return activeSelectedStatuses.includes(st);
    });
  }

  const allTechTagihan = (state.sheetsData.tagihanRows || []).filter(item => isTechnicianMatch(item.teknisi, targetTechName));
  let tagihanRows = allTechTagihan;
  const activeSelectedTagihanCats = state.selectedWaTagihanCategories || null;
  if (activeSelectedTagihanCats !== null && Array.isArray(activeSelectedTagihanCats) && activeSelectedTagihanCats.length > 0) {
    tagihanRows = allTechTagihan.filter(item => {
      const cat = getTagihanCategory(item.namaKonsumen).toUpperCase().trim();
      return activeSelectedTagihanCats.includes(cat);
    });
  }

  const partBelumKembali = (state.sheetsData.partBelumKembali || []).filter(item => isTechnicianMatch(item.teknisi, targetTechName));

  if (activeTab === 'tab-tagihan') {
    if (tagihanRows.length === 0) return null;
  } else if (activeTab === 'tab-part-kembali') {
    if (partBelumKembali.length === 0) return null;
  } else if (activeTab === 'tab-pending') {
    if (pendingCases.length === 0) return null;
  } else {
    if (pendingCases.length === 0 && tagihanRows.length === 0 && partBelumKembali.length === 0) return null;
  }

  let msg = `Halo *${targetTechName}*,\n\n`;

  if (activeTab === 'tab-tagihan') {
    msg += `Berikut rincian *TAGIHAN INVOICE* Anda (${tagihanRows.length} Invoice):\n`;
    tagihanRows.forEach((item, idx) => {
      msg += `${idx + 1}. Inv: *${item.noInvoice || '-'}* | Cust: ${item.namaKonsumen || '-'} | Nominal: ${formatRupiah(item.jumlah)}\n`;
    });
  } else if (activeTab === 'tab-part-kembali') {
    msg += `Berikut rincian *PART BEKAS / BELUM KEMBALI* Anda (${partBelumKembali.length} Item):\n`;
    partBelumKembali.forEach((item, idx) => {
      msg += `${idx + 1}. Part: *${item.noGudang || '-'}* | Qty: ${item.qty || '1'} | RSV: ${item.noReservasi || '-'}\n`;
    });
  } else if (activeTab === 'tab-pending') {
    msg += `Berikut rincian *CASE PENDING* Anda (${pendingCases.length} Case):\n`;
    pendingCases.forEach((item, idx) => {
      msg += `${idx + 1}. Case: *${item.no_case || '-'}* | Type: ${item.type || '-'} | Seri: ${item.seri || '-'} | SCL: ${item.scl || '-'} | Status: ${item.status || '-'}\n`;
    });
  } else {
    msg += `Berikut ringkasan tugas & tagihan Anda:\n`;
    if (pendingCases.length > 0) {
      msg += `\n📋 *CASE PENDING* (${pendingCases.length} Case):\n`;
      pendingCases.forEach((item, idx) => {
        msg += `${idx + 1}. Case: *${item.no_case || '-'}* | Type: ${item.type || '-'} | Seri: ${item.seri || '-'} | Status: ${item.status || '-'}\n`;
      });
    }
    if (tagihanRows.length > 0) {
      msg += `\n💰 *TAGIHAN INVOICE* (${tagihanRows.length} Invoice):\n`;
      tagihanRows.forEach((item, idx) => {
        msg += `${idx + 1}. Inv: *${item.noInvoice || '-'}* | Cust: ${item.namaKonsumen || '-'} | Nominal: ${formatRupiah(item.jumlah)}\n`;
      });
    }
    if (partBelumKembali.length > 0) {
      msg += `\n📦 *PART BELUM KEMBALI* (${partBelumKembali.length} Item):\n`;
      partBelumKembali.forEach((item, idx) => {
        msg += `${idx + 1}. Part: *${item.noGudang || '-'}* | Qty: ${item.qty || '1'}\n`;
      });
    }
  }

  msg += `\nMohon untuk segera ditindaklanjuti. Terima kasih! 🙏`;
  return msg;
}

function isTechInSite(tName, targetSite) {
  if (!targetSite || targetSite === 'JABAR' || targetSite === 'ADMIN') return true;
  const targetUpper = targetSite.toUpperCase().trim();

  // 1. Registered Area in User Sheet
  const regArea = getTechnicianRegisteredArea(tName);
  if (regArea && regArea.toUpperCase().trim() === targetUpper) return true;

  // 2. Pending cases
  const pCase = (state.sheetsData.pendingCases || []).find(i => isTechnicianMatch(i.teknisi, tName));
  if (pCase && (pCase.site || pCase.area) && String(pCase.site || pCase.area).toUpperCase().trim() === targetUpper) return true;

  // 3. Tagihan rows
  const tRow = (state.sheetsData.tagihanRows || []).find(i => isTechnicianMatch(i.teknisi, tName));
  if (tRow && (tRow.site || tRow.area) && String(tRow.site || tRow.area).toUpperCase().trim() === targetUpper) return true;

  // 4. Part bekas
  const pRow = (state.sheetsData.partBelumKembali || []).find(i => isTechnicianMatch(i.teknisi, tName));
  if (pRow && (pRow.site || pRow.area) && String(pRow.site || pRow.area).toUpperCase().trim() === targetUpper) return true;

  return false;
}

function openSendWaConfirmModal() {
  const { isAdminOrSiteAdmin } = getAdminOrSiteAdminStatus();
  if (!isAdminOrSiteAdmin) {
    showToast('⚠️ Akses Kirim WA hanya untuk Admin / Site Admin!', 'warning');
    return;
  }

  const token = localStorage.getItem(STORAGE_KEYS.FONTE_TOKEN) || '';
  if (!token) {
    showToast('⚠️ Token Fonnte belum diset. Silakan masukkan token Fonnte pada Pengaturan Akun Profil Anda.', 'warning');
    switchTab('tab-profile');
    if (DOM.cardFonteForm) {
      DOM.cardFonteForm.style.display = 'block';
      DOM.cardFonteForm.scrollIntoView({ behavior: 'smooth' });
    }
    return;
  }

  const currentNik = state.profile ? (state.profile.nik || '').toUpperCase().trim() : '';
  const currentArea = state.profile ? (state.profile.area || '').toUpperCase().trim() : '';
  const isGlobalAdmin = currentNik === 'ADMIN';
  const userSite = SITE_CODES.includes(currentNik) ? currentNik : (SITE_CODES.includes(currentArea) ? currentArea : '');

  const activeTab = state.activeTab || 'tab-pending';
  let menuLabel = 'Case Pending';

  // Collect technician names ONLY for technicians who have data IN THIS SPECIFIC ACTIVE TAB
  const activeTechSet = new Set();

  if (activeTab === 'tab-tagihan') {
    menuLabel = 'Tagihan Invoice';
    (state.sheetsData.tagihanRows || []).forEach(i => { if (i.teknisi && i.teknisi !== '-') activeTechSet.add(i.teknisi); });
  } else if (activeTab === 'tab-part-kembali') {
    menuLabel = 'Part Bekas';
    (state.sheetsData.partBelumKembali || []).forEach(i => { if (i.teknisi && i.teknisi !== '-') activeTechSet.add(i.teknisi); });
  } else {
    menuLabel = 'Case Pending';
    (state.sheetsData.pendingCases || []).forEach(i => { if (i.teknisi && i.teknisi !== '-') activeTechSet.add(i.teknisi); });
  }

  const techList = Array.from(activeTechSet).sort();

  // Filter technicians matching userSite (e.g. TSM, BDG, BDU, etc.)
  let siteTechList = techList;
  if (!isGlobalAdmin && userSite && userSite !== 'JABAR') {
    siteTechList = techList.filter(tName => isTechInSite(tName, userSite));
  }

  // Ensure each tech in siteTechList really has active items (>0) in THIS tab (matching active filters)
  siteTechList = siteTechList.filter(tName => {
    const msg = buildTechnicianWaMessage(tName, activeTab);
    return msg !== null && msg !== '';
  });

  if (siteTechList.length === 0) {
    showToast(`⚠️ Tidak ada data ${menuLabel} yang memenuhi kriteria filter untuk dikirim via WA.`, 'info');
    return;
  }

  state.targetSiteWaTechs = siteTechList;
  state.targetSiteName = (!isGlobalAdmin && userSite && userSite !== 'JABAR') ? userSite : 'ALL';
  state.targetWaContextTab = activeTab;
  state.modalAction = 'sendWaBatch';

  if (DOM.modalConfirmTitle) DOM.modalConfirmTitle.innerHTML = `<i data-lucide="message-square"></i> Konfirmasi Kirim WA ${menuLabel}`;
  if (DOM.modalConfirmMsg) DOM.modalConfirmMsg.textContent = `Apakah Anda Yakin Ingin Mengirimkan Pesan WhatsApp ${menuLabel}?`;
  if (DOM.modalConfirmOkText) DOM.modalConfirmOkText.textContent = 'Ya, Kirim WA Sekarang';
  if (DOM.modalConfirm) DOM.modalConfirm.classList.add('active');
  if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}
window.openSendWaConfirmModal = openSendWaConfirmModal;

async function executeSendWaBatch() {
  const token = localStorage.getItem(STORAGE_KEYS.FONTE_TOKEN) || '';
  if (!token) {
    showToast('⚠️ Token Fonnte belum diset. Silakan masukkan token Fonnte pada Pengaturan Akun Profil Anda.', 'warning');
    return;
  }

  const techList = state.targetSiteWaTechs || [];
  const contextTab = state.targetWaContextTab || state.activeTab || 'tab-pending';

  if (techList.length === 0) {
    showToast('⚠️ Tidak ada teknisi yang memiliki data pada menu ini!', 'warning');
    return;
  }

  if (!state.userPhoneMap || Object.keys(state.userPhoneMap).length === 0) {
    try {
      await fetchGoogleSheetsUsers();
    } catch(e) {}
  }

  showToast(`🚀 Memulai pengiriman WhatsApp ke ${techList.length} teknisi Site ${state.targetSiteName || ''}...`, 'info');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < techList.length; i++) {
    const techName = techList[i];

    const msg = buildTechnicianWaMessage(techName, contextTab);
    if (!msg) {
      showToast(`ℹ️ [${i + 1}/${techList.length}] ${techName}: Tidak ada data untuk dikirim, dilewati.`, 'info');
      continue;
    }

    let phone = '';
    if (state.userPhoneMap) {
      for (let k in state.userPhoneMap) {
        if (isTechnicianMatch(k, techName) && state.userPhoneMap[k]) {
          phone = state.userPhoneMap[k];
          break;
        }
      }
    }

    if (!phone) {
      const matchedPending = (state.sheetsData.pendingCases || []).find(item => isTechnicianMatch(item.teknisi, techName));
      if (matchedPending && /^08|^628/.test(matchedPending.teknisi)) phone = matchedPending.teknisi;
    }

    if (!phone) {
      showToast(`⚠️ [${i + 1}/${techList.length}] ${techName}: Nomor HP/WA tidak ditemukan di Sheet user (Kolom E)`, 'warning');
      failCount++;
      continue;
    }

    let cleanPhone = cleanNumberString(phone);
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);

    try {
      const formData = new FormData();
      formData.append('target', cleanPhone);
      formData.append('message', msg);
      formData.append('countryCode', '62');

      const resp = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: { 'Authorization': token.trim() },
        body: formData
      });
      const json = await resp.json();
      if (json && (json.status === true || json.status === 'true' || json.detail)) {
        successCount++;
        showToast(`✅ [${i + 1}/${techList.length}] WA terkirim ke ${techName}`, 'success');
      } else {
        failCount++;
        showToast(`❌ [${i + 1}/${techList.length}] Gagal kirim ke ${techName}: ${json.reason || json.detail || 'Error'}`, 'error');
      }
    } catch(err) {
      failCount++;
      showToast(`❌ [${i + 1}/${techList.length}] Gagal kirim ke ${techName}: ${err.message}`, 'error');
    }

    await new Promise(r => setTimeout(r, 600));
  }

  showToast(`🎉 Selesai! ${successCount} pesan WA terkirim, ${failCount} gagal/tanpa no HP.`, 'info');
}

window.openWaModal = function(preSelectedTechName = '') {
  const { isAdminOrSiteAdmin } = getAdminOrSiteAdminStatus();
  if (!isAdminOrSiteAdmin) {
    showToast('⚠️ Akses Kirim WA hanya untuk Admin / Site Admin!', 'warning');
    return;
  }

  if (!DOM.modalSendWa) {
    DOM.modalSendWa = document.getElementById('modal-send-wa');
  }
  if (!DOM.modalSendWa) return;

  const currentNik = state.profile ? (state.profile.nik || '').toUpperCase().trim() : '';
  const currentArea = state.profile ? (state.profile.area || '').toUpperCase().trim() : '';
  const isGlobalAdmin = currentNik === 'ADMIN';
  const userSite = SITE_CODES.includes(currentNik) ? currentNik : (SITE_CODES.includes(currentArea) ? currentArea : '');

  // Collect all unique technician names
  const techSet = new Set();
  (state.sheetsData.pendingCases || []).forEach(i => { if (i.teknisi && i.teknisi !== '-') techSet.add(i.teknisi); });
  (state.sheetsData.tagihanRows || []).forEach(i => { if (i.teknisi && i.teknisi !== '-') techSet.add(i.teknisi); });
  (state.sheetsData.partBelumKembali || []).forEach(i => { if (i.teknisi && i.teknisi !== '-') techSet.add(i.teknisi); });
  (state.sheetsData.insentifRows || []).forEach(i => { if (i.nama && i.nama !== '-') techSet.add(i.nama); });

  const techList = Array.from(techSet).sort();

  // Filter technicians matching userSite (e.g. TSM, BDG, BDU, etc.)
  let siteTechList = techList;
  if (!isGlobalAdmin && userSite && userSite !== 'JABAR') {
    siteTechList = techList.filter(tName => isTechInSite(tName, userSite));
    if (siteTechList.length === 0) siteTechList = techList; // Fallback if filter returns 0
  }

  if (DOM.waModalSiteBadge) {
    DOM.waModalSiteBadge.textContent = (!isGlobalAdmin && userSite && userSite !== 'JABAR') ? `Site Filter: ${userSite}` : 'Site Filter: SEMUA';
  }
  if (DOM.waModalSiteTitle) {
    DOM.waModalSiteTitle.innerHTML = `<i data-lucide="message-square"></i> Kirim WA Ke Teknisi ${(!isGlobalAdmin && userSite && userSite !== 'JABAR') ? '(' + userSite + ')' : ''}`;
  }

  if (DOM.waSelectTech) {
    DOM.waSelectTech.innerHTML = siteTechList.map(tName => {
      const pCount = (state.sheetsData.pendingCases || []).filter(i => matchTechName(i.teknisi, tName)).length;
      const tCount = (state.sheetsData.tagihanRows || []).filter(i => matchTechName(i.teknisi, tName)).length;
      return `<option value="${escapeHtml(tName)}">${escapeHtml(tName)} (${pCount} Pending, ${tCount} Tagihan)</option>`;
    }).join('');

    if (preSelectedTechName && siteTechList.includes(preSelectedTechName)) {
      DOM.waSelectTech.value = preSelectedTechName;
    }
  }

  // Populate status checklist dynamically from pendingCases
  const allPendingStatuses = new Set();
  (state.sheetsData.pendingCases || []).forEach(i => {
    const st = (i.status || 'PENDING').toUpperCase().trim();
    if (st) allPendingStatuses.add(st);
  });

  const checklistEl = document.getElementById('wa-status-checklist');
  const checkAllEl = document.getElementById('wa-check-all-status');
  const statusArray = Array.from(allPendingStatuses).sort();

  if (checklistEl) {
    if (statusArray.length === 0) {
      checklistEl.innerHTML = `<span style="font-size:10.5px; color:var(--text-muted);">Tidak ada status pending</span>`;
    } else {
      const activeSelected = state.selectedWaPendingStatuses || null;
      checklistEl.innerHTML = statusArray.map(st => {
        const isChecked = activeSelected === null || activeSelected.includes(st);
        return `
          <label style="font-size: 10.5px; background: var(--bg-card); border: 1px solid var(--border-color); padding: 5px 8px; border-radius: 4px; display: flex; align-items: center; justify-content: flex-start; gap: 6px; cursor: pointer; color: var(--text-main); font-weight: 600; width: 100%; box-sizing: border-box;">
            <input type="checkbox" class="wa-status-item-cb" value="${escapeHtml(st)}" ${isChecked ? 'checked' : ''} style="flex-shrink:0;" />
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(st)}</span>
          </label>
        `;
      }).join('');
    }

    if (checkAllEl) {
      checkAllEl.checked = true;
      checkAllEl.onchange = function() {
        const itemCbs = checklistEl.querySelectorAll('.wa-status-item-cb');
        itemCbs.forEach(cb => cb.checked = checkAllEl.checked);
        updateWaModalFields();
      };
    }

    checklistEl.onchange = function(e) {
      if (e.target && e.target.classList.contains('wa-status-item-cb')) {
        const itemCbs = Array.from(checklistEl.querySelectorAll('.wa-status-item-cb'));
        if (checkAllEl) {
          checkAllEl.checked = itemCbs.every(cb => cb.checked);
        }
        updateWaModalFields();
      }
    };
  }

  // Open modal immediately (Instant 0ms popup)
  DOM.modalSendWa.classList.add('active');
  if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();

  updateWaModalFields();

  // Background fetch user phone map from sheet 'user' Column E if not loaded yet
  if (!state.userPhoneMap || Object.keys(state.userPhoneMap).length === 0) {
    fetchGoogleSheetsUsers().then(() => {
      updateWaModalFields();
    }).catch(() => {});
  }
};

function closeWaModal() {
  if (DOM.modalSendWa) DOM.modalSendWa.classList.remove('active');
}

window.openWaStatusSelectModal = function() {
  const { isAdminOrSiteAdmin } = getAdminOrSiteAdminStatus();
  if (!isAdminOrSiteAdmin) {
    showToast('⚠️ Akses Kirim WA hanya untuk Admin / Site Admin!', 'warning');
    return;
  }

  const modal = DOM.modalWaStatusSelect || document.getElementById('modal-wa-status-select');
  if (!modal) return;

  populateWaStatusChecklist();

  modal.classList.add('active');
  try {
    history.pushState({ modalOpen: 'waStatusSelect' }, '', location.href);
  } catch (err) {}
};

window.closeWaStatusSelectModal = function() {
  const modal = DOM.modalWaStatusSelect || document.getElementById('modal-wa-status-select');
  if (modal) modal.classList.remove('active');
};

function populateWaStatusChecklist() {
  const checklistEl = document.getElementById('wa-status-modal-checklist');
  const checkAllEl = document.getElementById('wa-status-modal-check-all');
  if (!checklistEl) return;

  const allPendingStatuses = new Set();
  (state.sheetsData.pendingCases || []).forEach(i => {
    const st = (i.status || 'PENDING').toUpperCase().trim();
    if (st) allPendingStatuses.add(st);
  });

  const statusArray = Array.from(allPendingStatuses).sort();

  if (statusArray.length === 0) {
    checklistEl.innerHTML = `<span style="font-size:11px; color:var(--text-muted);">Tidak ada status case pending</span>`;
    return;
  }

  const currentSelected = state.selectedWaPendingStatuses || null;

  checklistEl.innerHTML = statusArray.map(st => {
    const isChecked = currentSelected === null || currentSelected.includes(st);
    return `
      <label style="font-size: 11px; background: var(--bg-card); border: 1px solid var(--border-color); padding: 6px 8px; border-radius: 4px; display: flex; align-items: center; justify-content: flex-start; gap: 6px; cursor: pointer; color: var(--text-main); font-weight: 600; width: 100%; box-sizing: border-box;">
        <input type="checkbox" class="wa-status-modal-item-cb" value="${escapeHtml(st)}" ${isChecked ? 'checked' : ''} style="flex-shrink:0;" />
        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(st)}</span>
      </label>
    `;
  }).join('');

  if (checkAllEl) {
    const itemCbs = checklistEl.querySelectorAll('.wa-status-modal-item-cb');
    checkAllEl.checked = Array.from(itemCbs).every(cb => cb.checked);

    checkAllEl.onchange = function() {
      const cbs = checklistEl.querySelectorAll('.wa-status-modal-item-cb');
      cbs.forEach(cb => cb.checked = checkAllEl.checked);
    };
  }

  checklistEl.onchange = function(e) {
    if (e.target && e.target.classList.contains('wa-status-modal-item-cb')) {
      if (checkAllEl) {
        const itemCbs = Array.from(checklistEl.querySelectorAll('.wa-status-modal-item-cb'));
        checkAllEl.checked = itemCbs.every(cb => cb.checked);
      }
    }
  };
}

function handleConfirmWaStatusSend() {
  const checklistEl = document.getElementById('wa-status-modal-checklist');
  if (!checklistEl) return;

  const checkedCbs = checklistEl.querySelectorAll('.wa-status-modal-item-cb:checked');
  const selectedStatuses = Array.from(checkedCbs).map(cb => cb.value.toUpperCase().trim());

  if (selectedStatuses.length === 0) {
    showToast('⚠️ Pilih minimal 1 status case pending yang akan dikirim!', 'warning');
    return;
  }

  state.selectedWaPendingStatuses = selectedStatuses;
  closeWaStatusSelectModal();
  openSendWaConfirmModal();
}

window.openWaTagihanSelectModal = function() {
  const { isAdminOrSiteAdmin } = getAdminOrSiteAdminStatus();
  if (!isAdminOrSiteAdmin) {
    showToast('⚠️ Akses Kirim WA hanya untuk Admin / Site Admin!', 'warning');
    return;
  }

  const modal = DOM.modalWaTagihanSelect || document.getElementById('modal-wa-tagihan-select');
  if (!modal) return;

  populateWaTagihanChecklist();

  modal.classList.add('active');
  try {
    history.pushState({ modalOpen: 'waTagihanSelect' }, '', location.href);
  } catch (err) {}
};

window.closeWaTagihanSelectModal = function() {
  const modal = DOM.modalWaTagihanSelect || document.getElementById('modal-wa-tagihan-select');
  if (modal) modal.classList.remove('active');
};

function populateWaTagihanChecklist() {
  const checklistEl = document.getElementById('wa-tagihan-modal-checklist');
  const checkAllEl = document.getElementById('wa-tagihan-modal-check-all');
  if (!checklistEl) return;

  const currentSelected = state.selectedWaTagihanCategories || null;

  const displayNames = {
    'PT. GONUSA PRIMA DISTRIBUSI': '1. PT. GONUSA PRIMA DISTRIBUSI',
    'SUMBER CIPTA MULTINIAGA': '2. SUMBER CIPTA MULTINIAGA',
    'PT. HARTONO ISTANA TEKNOLOGI': '3. PT. HARTONO ISTANA TEKNOLOGI',
    'DIRECT KONSUMEN': '4. DIRECT KONSUMEN'
  };

  checklistEl.innerHTML = TAGIHAN_CATEGORIES.map(cat => {
    const catUpper = cat.toUpperCase().trim();
    const isChecked = currentSelected === null || currentSelected.includes(catUpper);
    const labelText = displayNames[cat] || cat;
    return `
      <label style="font-size: 11.5px; background: var(--bg-card); border: 1px solid var(--border-color); padding: 8px 10px; border-radius: 4px; display: flex; align-items: center; justify-content: flex-start; gap: 8px; cursor: pointer; color: var(--text-main); font-weight: 600; width: 100%; box-sizing: border-box;">
        <input type="checkbox" class="wa-tagihan-modal-item-cb" value="${escapeHtml(cat)}" ${isChecked ? 'checked' : ''} style="flex-shrink:0; width: 16px; height: 16px;" />
        <span style="white-space: normal; word-break: break-word;">${escapeHtml(labelText)}</span>
      </label>
    `;
  }).join('');

  if (checkAllEl) {
    const itemCbs = checklistEl.querySelectorAll('.wa-tagihan-modal-item-cb');
    checkAllEl.checked = Array.from(itemCbs).every(cb => cb.checked);

    checkAllEl.onchange = function() {
      const cbs = checklistEl.querySelectorAll('.wa-tagihan-modal-item-cb');
      cbs.forEach(cb => cb.checked = checkAllEl.checked);
    };
  }

  checklistEl.onchange = function(e) {
    if (e.target && e.target.classList.contains('wa-tagihan-modal-item-cb')) {
      if (checkAllEl) {
        const itemCbs = Array.from(checklistEl.querySelectorAll('.wa-tagihan-modal-item-cb'));
        checkAllEl.checked = itemCbs.every(cb => cb.checked);
      }
    }
  };
}

function handleConfirmWaTagihanSend() {
  const checklistEl = document.getElementById('wa-tagihan-modal-checklist');
  if (!checklistEl) return;

  const checkedCbs = checklistEl.querySelectorAll('.wa-tagihan-modal-item-cb:checked');
  const selectedCategories = Array.from(checkedCbs).map(cb => cb.value.toUpperCase().trim());

  if (selectedCategories.length === 0) {
    showToast('⚠️ Pilih minimal 1 target tagihan yang akan dikirim!', 'warning');
    return;
  }

  state.selectedWaTagihanCategories = selectedCategories;
  closeWaTagihanSelectModal();
  openSendWaConfirmModal();
}



function updateWaModalFields() {
  if (!DOM.waSelectTech) return;
  const selectedTech = DOM.waSelectTech.value;
  if (!selectedTech) return;

  // Look up phone from state.userPhoneMap (Sheet User Column E) first
  let targetPhone = '';
  if (state.userPhoneMap) {
    for (let k in state.userPhoneMap) {
      if (matchTechName(k, selectedTech) && state.userPhoneMap[k]) {
        targetPhone = state.userPhoneMap[k];
        break;
      }
    }
  }

  // Fallback to checking pendingCases if not found in userPhoneMap
  if (!targetPhone) {
    const matchedPending = (state.sheetsData.pendingCases || []).find(i => matchTechName(i.teknisi, selectedTech));
    if (matchedPending && matchedPending.teknisi && /^08|^628/.test(matchedPending.teknisi)) {
      targetPhone = matchedPending.teknisi;
    }
  }

  if (!targetPhone) {
    for (let item of (state.sheetsData.pendingCases || [])) {
      if (matchTechName(item.teknisi, selectedTech)) {
        if (/^08|^628/.test(item.no_case)) {
          targetPhone = item.no_case;
          break;
        }
      }
    }
  }

  if (DOM.waTargetPhone) {
    DOM.waTargetPhone.value = targetPhone;
    DOM.waTargetPhone.setAttribute('data-last-tech', selectedTech);
  }

  const generatedMsg = buildTechnicianWaMessage(selectedTech);
  if (DOM.waMessagePreview) {
    DOM.waMessagePreview.value = generatedMsg;
  }
}

async function handleWaFonnteSend() {
  const targetPhone = DOM.waTargetPhone ? DOM.waTargetPhone.value.trim() : '';
  const messageText = DOM.waMessagePreview ? DOM.waMessagePreview.value.trim() : '';
  const token = localStorage.getItem(STORAGE_KEYS.FONTE_TOKEN) || '';

  if (!token) {
    showToast('⚠️ Token Fonnte belum diset. Silakan masukkan token Fonnte pada Pengaturan Profil Anda.', 'warning');
    if (DOM.cardFonteForm) DOM.cardFonteForm.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  if (!targetPhone) {
    showToast('⚠️ Mohon isi nomor HP / WhatsApp target!', 'warning');
    if (DOM.waTargetPhone) DOM.waTargetPhone.focus();
    return;
  }

  if (!messageText) {
    showToast('⚠️ Pesan WA kosong.', 'warning');
    return;
  }

  if (DOM.btnWaFonnteSend) DOM.btnWaFonnteSend.disabled = true;

  try {
    let cleanPhone = cleanNumberString(targetPhone);
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    const formData = new FormData();
    formData.append('target', cleanPhone);
    formData.append('message', messageText);
    formData.append('countryCode', '62');

    const resp = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token.trim()
      },
      body: formData
    });

    const json = await resp.json();
    if (json && (json.status === true || json.status === 'true' || json.detail)) {
      showToast('✅ Pesan WhatsApp berhasil dikirim via Fonnte API!', 'success');
      closeWaModal();
    } else {
      throw new Error((json && json.reason) ? json.reason : (json && json.detail ? json.detail : 'Gagal mengirim via Fonnte API'));
    }
  } catch (err) {
    showToast(`❌ Gagal Kirim WA: ${err.message}`, 'error');
  } finally {
    if (DOM.btnWaFonnteSend) DOM.btnWaFonnteSend.disabled = false;
  }
}

async function handleWaBatchSend() {
  const token = localStorage.getItem(STORAGE_KEYS.FONTE_TOKEN) || '';
  if (!token) {
    showToast('⚠️ Token Fonnte belum diset. Silakan masukkan token Fonnte pada Pengaturan Profil Anda.', 'warning');
    if (DOM.cardFonteForm) DOM.cardFonteForm.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  if (!DOM.waSelectTech || !DOM.waSelectTech.options || DOM.waSelectTech.options.length === 0) {
    showToast('⚠️ Tidak ada teknisi terdaftar di site ini!', 'warning');
    return;
  }

  const options = Array.from(DOM.waSelectTech.options).map(opt => opt.value);
  const currentNik = state.profile ? (state.profile.nik || '').toUpperCase().trim() : '';
  const currentArea = state.profile ? (state.profile.area || '').toUpperCase().trim() : '';
  const userSite = SITE_CODES.includes(currentNik) ? currentNik : (SITE_CODES.includes(currentArea) ? currentArea : 'SITE');

  const confirmMsg = `Apakah Anda yakin ingin mengirim pesan WhatsApp (Pending, Tagihan & Part Bekas) secara otomatis ke ALL ${options.length} teknisi di Site ${userSite}?`;
  if (!confirm(confirmMsg)) return;

  if (DOM.btnWaBatchSend) DOM.btnWaBatchSend.disabled = true;
  showToast(`🚀 Memulai pengiriman WhatsApp batch ke ${options.length} teknisi...`, 'info');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < options.length; i++) {
    const techName = options[i];
    let phone = '';
    if (state.userPhoneMap) {
      for (let k in state.userPhoneMap) {
        if (matchTechName(k, techName) && state.userPhoneMap[k]) {
          phone = state.userPhoneMap[k];
          break;
        }
      }
    }

    if (!phone) {
      const matchedPending = (state.sheetsData.pendingCases || []).find(item => matchTechName(item.teknisi, techName));
      if (matchedPending && /^08|^628/.test(matchedPending.teknisi)) phone = matchedPending.teknisi;
    }

    if (!phone) {
      showToast(`⚠️ [${i + 1}/${options.length}] ${techName}: Nomor HP/WA tidak ditemukan di Sheet user (Kolom E)`, 'warning');
      failCount++;
      continue;
    }

    const msg = buildTechnicianWaMessage(techName);
    if (!msg) {
      failCount++;
      continue;
    }

    let cleanPhone = cleanNumberString(phone);
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);

    try {
      const formData = new FormData();
      formData.append('target', cleanPhone);
      formData.append('message', msg);
      formData.append('countryCode', '62');

      const resp = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: { 'Authorization': token.trim() },
        body: formData
      });
      const json = await resp.json();
      if (json && (json.status === true || json.status === 'true' || json.detail)) {
        successCount++;
        showToast(`✅ [${i + 1}/${options.length}] WA terkirim ke ${techName}`, 'success');
      } else {
        failCount++;
        showToast(`❌ [${i + 1}/${options.length}] Gagal kirim ke ${techName}: ${json.reason || json.detail || 'Error'}`, 'error');
      }
    } catch(err) {
      failCount++;
      showToast(`❌ [${i + 1}/${options.length}] Gagal kirim ke ${techName}: ${err.message}`, 'error');
    }

    await new Promise(r => setTimeout(r, 800));
  }

  showToast(`🎉 Selesai! ${successCount} pesan WA terkirim, ${failCount} gagal/tanpa no HP.`, 'info');
  if (DOM.btnWaBatchSend) DOM.btnWaBatchSend.disabled = false;
  closeWaModal();
}

function handleWaDirectOpen() {
  const targetPhone = DOM.waTargetPhone ? DOM.waTargetPhone.value.trim() : '';
  const messageText = DOM.waMessagePreview ? DOM.waMessagePreview.value.trim() : '';

  if (!messageText) {
    showToast('⚠️ Pesan WA kosong.', 'warning');
    return;
  }

  let cleanPhone = cleanNumberString(targetPhone);
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }

  const encodedMsg = encodeURIComponent(messageText);
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedMsg}` : `https://api.whatsapp.com/send?text=${encodedMsg}`;
  window.openWaUrl = window.open(waUrl, '_blank');
  showToast('📲 Membuka WhatsApp...', 'info');
}

// ==========================================
// PENCAPAIAN PDS MODULE & CHART RENDERER
// ==========================================
function renderPdsTab() {
  renderSheetUpdateInfo();
  if (!DOM.pdsContentContainer) return;
  const pdsList = state.sheetsData.pdsRows || [];

  if (DOM.pdsSiteCount) {
    DOM.pdsSiteCount.textContent = `${pdsList.length} Site`;
  }

  if (pdsList.length === 0) {
    DOM.pdsContentContainer.innerHTML = `
      <div class="empty-state-sm">
        <i data-lucide="bar-chart-3" style="width:32px; height:32px; color:var(--text-muted); margin-bottom:6px;"></i>
        <p>Belum ada data Pencapaian PDS dari Sheet.</p>
      </div>`;
    lucide.createIcons();
    return;
  }

  // Calculate Aggregated Totals
  let totalLoad = 0;
  let totalPending = 0;
  pdsList.forEach(item => {
    totalLoad += item.load;
    totalPending += item.pending;
  });

  const overallPctVal = totalLoad > 0 ? ((totalPending / totalLoad) * 100).toFixed(1) : '0';
  const overallPctStr = overallPctVal.endsWith('.0') ? Math.round(overallPctVal) + '%' : overallPctVal + '%';

  // 1. Overall Summary Stats Card
  let html = `
    <div class="pds-summary-card mb-2" style="background:var(--bg-card); border:1px solid var(--border-color); border-left:4px solid var(--primary); padding:10px 12px; border-radius:var(--radius-sm); box-shadow:var(--shadow-main); display:flex; flex-direction:column; gap:8px;">
      <div class="flex-between align-center">
        <div style="font-size:12px; font-weight:700; color:var(--text-main); display:flex; align-items:center; gap:6px;">
          <i data-lucide="award" style="color:var(--primary); width:15px; height:15px;"></i>
          <span>RINGKASAN PENCAPAIAN PDS ALL SITE</span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; text-align:center;">
        <div style="background:var(--bg-input); padding:6px 4px; border-radius:4px; border:1px solid var(--border-color);">
          <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">TOTAL LOAD</div>
          <div style="font-size:15px; font-weight:800; color:var(--primary); margin-top:2px;">${totalLoad.toLocaleString('id-ID')}</div>
        </div>
        <div style="background:var(--bg-input); padding:6px 4px; border-radius:4px; border:1px solid var(--border-color);">
          <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">TOTAL PENDING</div>
          <div style="font-size:15px; font-weight:800; color:var(--warning); margin-top:2px;">${totalPending.toLocaleString('id-ID')}</div>
        </div>
        <div style="background:var(--bg-input); padding:6px 4px; border-radius:4px; border:1px solid var(--border-color);">
          <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">% PENDING</div>
          <div style="font-size:15px; font-weight:800; color:${parseFloat(overallPctVal) > 5 ? 'var(--danger)' : 'var(--success)'}; margin-top:2px;">${overallPctStr}</div>
        </div>
      </div>
    </div>
  `;

  // 2. Chart Box (Grafik Pencapaian All Site)
  html += `
    <div class="card pds-chart-card mb-2" style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:10px 12px; box-shadow:var(--shadow-main); display:flex; flex-direction:column; gap:8px;">
      <div class="flex-between align-center" style="border-bottom:1px dashed var(--border-color); padding-bottom:6px;">
        <div style="font-size:12px; font-weight:700; color:var(--text-main); display:flex; align-items:center; gap:6px;">
          <i data-lucide="bar-chart-2" style="color:var(--secondary); width:15px; height:15px;"></i>
          <span>GRAFIK PENCAPAIAN ALL SITE</span>
        </div>
        <div style="font-size:10px; color:var(--text-muted); display:flex; gap:10px; font-weight:700;">
          <span style="color:var(--primary); display:flex; align-items:center; gap:3px;"><span style="width:8px; height:8px; background:var(--primary); border-radius:2px; display:inline-block;"></span> Load</span>
          <span style="color:var(--warning); display:flex; align-items:center; gap:3px;"><span style="width:8px; height:8px; background:var(--warning); border-radius:2px; display:inline-block;"></span> Pending</span>
        </div>
      </div>
      <div class="chart-canvas-wrapper" style="position:relative; width:100%; height:200px;">
        <canvas id="pdsChartCanvas"></canvas>
      </div>
    </div>
  `;

  // 3. Grid Cards for Each Site
  html += `<div class="pds-site-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:8px; margin-top:2px;">`;

  pdsList.forEach(item => {
    const isZeroLoad = item.load === 0;
    const isHighPending = item.pctNum > 5;
    const badgeColor = isZeroLoad ? 'var(--text-muted)' : (isHighPending ? 'var(--danger)' : 'var(--primary)');
    const badgeBg = isZeroLoad ? 'var(--bg-input)' : (isHighPending ? 'rgba(239, 68, 68, 0.15)' : 'var(--primary-light)');

    let pctBarWidth = Math.min(100, Math.max(0, item.pctNum));
    if (isZeroLoad) pctBarWidth = 0;

    html += `
      <div class="pds-site-card" style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:10px 12px; display:flex; flex-direction:column; gap:8px; box-shadow:var(--shadow-main);">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="width:30px; height:30px; border-radius:6px; background:var(--primary-light); color:var(--primary); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <i data-lucide="building-2" style="width:16px; height:16px;"></i>
            </div>
            <div>
              <div style="font-size:14px; font-weight:800; color:var(--text-main); line-height:1.1;">${escapeHtml(item.site)}</div>
              <div style="font-size:9.5px; color:var(--text-muted);">Data Load & Pending PDS</div>
            </div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; background:var(--bg-input); padding:8px; border-radius:4px; border:1px solid var(--border-color);">
          <div>
            <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">LOAD BULAN INI</div>
            <div style="font-size:15px; font-weight:800; color:var(--primary); margin-top:2px;">${item.load.toLocaleString('id-ID')}</div>
          </div>
          <div style="border-left:1px solid var(--border-color); padding-left:8px;">
            <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">PENDING BULAN INI</div>
            <div style="font-size:15px; font-weight:800; color:var(--warning); margin-top:2px;">${item.pending.toLocaleString('id-ID')}</div>
          </div>
        </div>

        <!-- Visual Progress Bar for % Pending -->
        <div style="display:flex; flex-direction:column; gap:3px;">
          <div style="display:flex; justify-content:space-between; font-size:9.5px; font-weight:700; color:var(--text-muted);">
            <span>Status Pending</span>
            <span style="color:${badgeColor};">${escapeHtml(item.pctPending)}</span>
          </div>
          <div style="width:100%; height:6px; background:var(--bg-input); border-radius:3px; overflow:hidden; border:1px solid var(--border-color);">
            <div style="width:${pctBarWidth}%; height:100%; background:${badgeColor}; transition:width 0.4s ease;"></div>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;

  DOM.pdsContentContainer.innerHTML = html;
  lucide.createIcons();

  // Render Chart.js Grouped Bar Chart
  setTimeout(() => {
    renderPdsChart(pdsList);
  }, 50);
}

function renderPdsChart(pdsList) {
  const canvas = document.getElementById('pdsChartCanvas');
  if (!canvas) return;

  if (window.pdsChartInstance) {
    try { window.pdsChartInstance.destroy(); } catch (e) {}
    window.pdsChartInstance = null;
  }

  if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded');
    return;
  }

  const labels = pdsList.map(item => item.site);
  const loadData = pdsList.map(item => item.load);
  const pendingData = pdsList.map(item => item.pending);

  const isDark = state.theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.07)';

  const ctx = canvas.getContext('2d');
  window.pdsChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Load Bulan Ini',
          data: loadData,
          backgroundColor: '#10b981',
          borderColor: '#059669',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'Pending Bulan Ini',
          data: pendingData,
          backgroundColor: '#f59e0b',
          borderColor: '#d97706',
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            footer: function(tooltipItems) {
              const idx = tooltipItems[0].dataIndex;
              if (pdsList[idx]) {
                return '% Pending: ' + pdsList[idx].pctPending;
              }
              return '';
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: gridColor
          },
          ticks: {
            color: textColor,
            font: {
              size: 10,
              family: 'Plus Jakarta Sans',
              weight: 'bold'
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: gridColor
          },
          ticks: {
            color: textColor,
            font: {
              size: 10,
              family: 'Plus Jakarta Sans'
            }
          }
        }
      }
    }
  });
}

// ==========================================
// FINISHAN HARIAN (TGL 1-31) RECAP RENDERER
// ==========================================
function renderFinishRecapTab() {
  if (!DOM.finishRecapContentContainer) {
    DOM.finishRecapContentContainer = document.getElementById('finish-recap-content-container');
  }
  if (!DOM.finishRecapContentContainer) return;

  const rowsData = (state.sheetsData && state.sheetsData.rawRowsData) || state.rawRowsData || [];
  const currentNama = state.profile ? (state.profile.nama || '') : '';
  const currentNik = state.profile ? (state.profile.nik || '') : '';
  const nikUpper = currentNik.toUpperCase().trim();
  const userAreaUpper = (state.profile ? (state.profile.area || '') : '').toUpperCase().trim();

  const isGlobalAdmin = nikUpper === 'ADMIN';
  const isSiteAdmin = SITE_CODES.includes(nikUpper) || (state.isAdmin && SITE_CODES.includes(userAreaUpper)) || !!state.isSiteAdmin;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const monthName = MONTHS_ID[month];

  // Parse daily finish entries from Sheet DATA (Rows 1+, Col G to AK / index 6 to 36)
  const recapByDate = {};
  let totalValidEntries = 0;

  if (rowsData && rowsData.length > 1) {
    for (let r = 1; r < rowsData.length; r++) {
      const row = rowsData[r];
      if (!row || row.length < 7) continue;

      const techNameRow = String(row[0] || '').trim();
      if (!techNameRow || techNameRow.toUpperCase() === 'NAMA TEKNISI') continue;

      // Filter according to user role
      if (!isGlobalAdmin && !isMatchForCurrentRole(techNameRow)) continue;

      // Loop columns G to AK (index 6 to 36)
      const maxCol = Math.min(row.length - 1, 36);
      for (let c = 6; c <= maxCol; c++) {
        const valStr = String(row[c] !== undefined && row[c] !== null ? row[c] : '').trim();
        const numVal = parseInt(valStr, 10) || 0;

        // Skip 0, empty, 'False', or non-positive values
        if (!valStr || valStr === '0' || valStr === 'False' || numVal <= 0) continue;

        // Determine Day Number
        let dayNum = c - 5; // Default: Col 6 (G) = Day 1, Col 36 (AK) = Day 31
        if (rowsData[0] && rowsData[0][c]) {
          const headerVal = String(rowsData[0][c]).replace(/[^0-9]/g, '');
          if (headerVal) {
            const parsedDay = parseInt(headerVal, 10);
            if (parsedDay >= 1 && parsedDay <= 31) dayNum = parsedDay;
          }
        }

        if (dayNum < 1 || dayNum > daysInMonth) continue;

        const dayStr = String(dayNum).padStart(2, '0');
        const monthStr = String(month + 1).padStart(2, '0');
        const isoDate = `${year}-${monthStr}-${dayStr}`;

        if (!recapByDate[isoDate]) recapByDate[isoDate] = [];
        recapByDate[isoDate].push({
          nama: techNameRow,
          output: numVal,
          rawVal: valStr,
          day: dayNum
        });

        totalValidEntries++;
      }
    }
  }

  // Cross-reference with detailed logs from FINISH sheet if present
  const detailedLogsByDateTech = {};
  (state.finishParsedAllRows || []).forEach(item => {
    if (item && item.tglLaporan && item.nama) {
      const key = `${item.tglLaporan}_${item.nama.toUpperCase().trim()}`;
      detailedLogsByDateTech[key] = item;
    }
  });

  const badgeEl = document.getElementById('finish-recap-badge');
  if (badgeEl) {
    badgeEl.style.display = 'none';
  }

  // Header Summary Card
  let html = `
    <div style="background:var(--bg-card); border-left:4px solid var(--primary); padding:10px 12px; border-radius:var(--radius-sm); border:1px solid var(--border-color); display:flex; flex-direction:column; gap:4px; box-shadow:var(--shadow-main);">
      <div class="flex-between align-center">
        <span style="font-size:12px; font-weight:800; color:var(--text-main);">REKAP FINISHAN HARIAN (${monthName.toUpperCase()} ${year})</span>
      </div>
    </div>
  `;

  // Get active dates that have non-zero entries, sorted descending by day
  const activeDates = Object.keys(recapByDate).sort((a, b) => b.localeCompare(a));

  if (activeDates.length === 0) {
    html += `
      <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:24px 12px; text-align:center; color:var(--text-muted); margin-top:8px;">
        <i data-lucide="inbox" style="width:36px; height:36px; margin-bottom:6px; color:var(--text-muted);"></i>
        <p style="font-weight:700; font-size:13px; margin:0; color:var(--text-main);">Belum Ada Data Finish Harian</p>
      </div>
    `;
  } else {
    html += `<div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">`;

    activeDates.forEach(isoDate => {
      const parts = isoDate.split('-');
      const dayVal = parseInt(parts[2], 10);
      const dayStr = String(dayVal).padStart(2, '0');
      const dateObj = new Date(year, month, dayVal);
      const formattedDate = formatDateIndoFull(dateObj);
      const isToday = dayVal === now.getDate();

      const dateEntries = recapByDate[isoDate] || [];

      let totalOutputDay = 0;
      dateEntries.forEach(e => totalOutputDay += e.output);

      let cardBorder = isToday ? 'border:1.5px solid var(--primary);' : 'border:1px solid var(--border-color);';

      html += `
        <div style="background:var(--bg-card); ${cardBorder} border-radius:var(--radius-sm); padding:10px 12px; box-shadow:var(--shadow-main); display:flex; flex-direction:column; gap:6px;">
          <div class="flex-between align-center" style="border-bottom:1px dashed var(--border-color); padding-bottom:5px;">
            <div style="font-size:12px; font-weight:800; color:var(--text-main); display:flex; align-items:center; gap:6px;">
              <i data-lucide="calendar" style="width:14px; height:14px; color:var(--primary);"></i>
              <span>${escapeHtml(formattedDate)}</span>
              ${isToday ? `<span style="font-size:9.5px; background:var(--primary); color:#fff; padding:1px 6px; border-radius:3px; font-weight:800;">HARI INI</span>` : ''}
            </div>
          </div>
      `;

      dateEntries.forEach(item => {
        const detailKey = `${isoDate}_${item.nama.toUpperCase().trim()}`;
        const detailLog = detailedLogsByDateTech[detailKey];

        html += `
          <div style="background:var(--bg-input); padding:8px 10px; border-radius:4px; border:1px solid var(--border-color); display:flex; flex-direction:column; gap:4px; margin-top:2px;">
            <div class="flex-between align-center" style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
              <span style="font-size:12px; font-weight:800; color:var(--text-main); flex:1; min-width:0;">${escapeHtml(item.nama)}</span>
              <span style="font-size:14px; font-weight:800; color:var(--success); background:rgba(16, 185, 129, 0.15); padding:4px 10px; border-radius:4px; text-align:right; margin-left:auto; flex-shrink:0;">
                ${item.output} Unit
              </span>
            </div>
        `;

        if (detailLog) {
          html += `
            <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:4px; text-align:center; font-size:10px; margin-top:2px;">
              <div style="background:var(--bg-card); padding:4px; border-radius:4px; border:1px solid var(--border-color);"><span style="color:var(--text-muted); font-size:9px;">OUTDOOR</span><br/><strong style="color:var(--success); font-size:11.5px;">${detailLog.finishOutdoor} / ${detailLog.caseOutdoor}</strong></div>
              <div style="background:var(--bg-card); padding:4px; border-radius:4px; border:1px solid var(--border-color);"><span style="color:var(--text-muted); font-size:9px;">INDOOR</span><br/><strong style="color:var(--primary); font-size:11.5px;">${detailLog.finishIndoor}</strong></div>
              <div style="background:var(--bg-card); padding:4px; border-radius:4px; border:1px solid var(--border-color);"><span style="color:var(--text-muted); font-size:9px;">WIP COMP</span><br/><strong style="color:var(--warning); font-size:11.5px;">${detailLog.wipComp}</strong></div>
              <div style="background:var(--bg-card); padding:4px; border-radius:4px; border:1px solid var(--border-color);"><span style="color:var(--text-muted); font-size:9px;">WIP TECH</span><br/><strong style="color:var(--secondary); font-size:11.5px;">${detailLog.wipTech}</strong></div>
              <div style="background:var(--bg-card); padding:4px; border-radius:4px; border:1px solid var(--border-color);"><span style="color:var(--text-muted); font-size:9px;">BATAL</span><br/><strong style="color:var(--danger); font-size:11.5px;">${detailLog.batal}</strong></div>
            </div>
            ${detailLog.ket ? `<div style="font-size:10px; color:var(--text-muted); font-style:italic; margin-top:2px;"><i data-lucide="message-square" style="width:10px; height:10px; vertical-align:middle; margin-right:3px;"></i>${escapeHtml(detailLog.ket)}</div>` : ''}
          `;
        }

        html += `</div>`;
      });

      html += `</div>`;
    });

    html += `</div>`;
  }

  DOM.finishRecapContentContainer.innerHTML = html;
  lucide.createIcons();
}

