/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT FOR GOOGLE SHEETS LIVE DATA SINKRONISASI (STANDALONE / ID BASED)
 * ==============================================================================
 * Petunjuk Pemasangan:
 * 1. Buka Apps Script: https://script.google.com atau melalui Google Sheet manapun.
 * 2. Hapus semua kode di editor, lalu Tempel (Paste) seluruh kode file ini.
 * 3. Script ini mengakses Google Sheet Utama menggunakan ID:
 *    SPREADSHEET_ID = '1YhZ9aC-ypray0WwSZxY5dXNVraqLm-BNIuyWYNUkUQ0'
 * 4. Untuk menjadikan API Endpoint (Web App):
 *    - Klik 'Terapkan' (Deploy) -> 'Penerapan baru' (New deployment).
 *    - Pilih Jenis: Web App
 *    - Jalankan sebagai: Saya (Me)
 *    - Yang memiliki akses: Siapa Saja (Anyone)
 * ==============================================================================
 */

// ID Google Sheet Utama yang dituju
var SPREADSHEET_ID = '1YhZ9aC-ypray0WwSZxY5dXNVraqLm-BNIuyWYNUkUQ0';

// Helper untuk membuka Spreadsheet berdasarkan ID
function getTargetSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// Fungsi untuk menangani permintaan HTTP GET dari Aplikasi (API Data JSON)
function doGet(e) {
  try {
    var ss = getTargetSpreadsheet();
    
    // Sheet DATA
    var dataSheet = ss.getSheetByName('DATA');
    var dataValues = dataSheet ? dataSheet.getDataRange().getValues() : [];
    
    // Sheet NOTIF
    var notifSheet = ss.getSheetByName('NOTIF');
    var notifValues = notifSheet ? notifSheet.getDataRange().getValues() : [];
    
    // Ambil data cell Z2 (Row index 1, Col index 25)
    var cellZ2 = (dataValues.length > 1 && dataValues[1].length > 25) ? dataValues[1][25] : '';
    
    var result = {
      status: 'success',
      sheetId: SPREADSHEET_ID,
      timestamp: new Date().toISOString(),
      cellZ2: cellZ2,
      data: dataValues,
      notif: notifValues
    };
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi otomatis untuk meng-update timestamp Cell Z2 di Sheet DATA
function updateTimestampZ2() {
  try {
    var ss = getTargetSpreadsheet();
    var sheet = ss.getSheetByName('DATA');
    if (sheet) {
      var now = new Date();
      var formattedTime = Utilities.formatDate(now, Session.getScriptTimeZone() || "GMT+7", "dd/MM/yyyy HH:mm:ss");
      sheet.getRange("Z2").setValue(formattedTime);
    }
  } catch (err) {
    Logger.log("Error update Z2: " + err.toString());
  }
}

// Trigger otomatis saat ada pengeditan
function onEdit(e) {
  updateTimestampZ2();
}
