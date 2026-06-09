// ============================================================
// BRAVAS TOUR BCN — Google Apps Script Backend
// ============================================================
// 1. Crear un nuevo Google Spreadsheet
// 2. Ir a Extensiones > Apps Script
// 3. Pegar este código
// 4. Completar las constantes de abajo
// 5. Publicar > Implementar como aplicación web
//    - Ejecutar como: Yo mismo
//    - Quién tiene acceso: Cualquier usuario
// 6. Copiar la URL del deployment y pegarla en VITE_API_URL
// ============================================================

const SHEET_ID = 'TU_SPREADSHEET_ID';       // ID del Google Sheet (de la URL)
const SHEET_NAME = 'bravas';                  // Nombre de la pestaña
const DRIVE_FOLDER_ID = 'TU_FOLDER_ID';      // ID de la carpeta de Google Drive para fotos

// Cabeceras del sheet — NO cambiar el orden
const HEADERS = [
  'id', 'bar_name', 'fecha', 'barrio', 'precio',
  'foto_1', 'foto_2', 'foto_3',
  'primera_impresion_tiago', 'primera_impresion_monica',
  'all_i_oli_tiago', 'all_i_oli_monica',
  'salsa_brava_tiago', 'salsa_brava_monica',
  'mix_tiago', 'mix_monica',
  'patata_tiago', 'patata_monica',
  'ambiente_tiago', 'ambiente_monica',
  'impresion_general_tiago', 'impresion_general_monica',
  'comentario_final_tiago', 'comentario_final_monica'
];

// ============================================================
// Entry points
// ============================================================

function doGet(e) {
  return handleRequest(e.parameter.action || 'getBars', e.parameter, null);
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  return handleRequest(body.action, null, body);
}

function handleRequest(action, params, body) {
  try {
    let result;
    switch (action) {
      case 'getBars':    result = getBars(); break;
      case 'addBar':     result = addBar(body); break;
      case 'updateBar':  result = updateBar(body); break;
      case 'uploadPhoto': result = uploadPhoto(body); break;
      case 'initSheet':  result = initSheet(); break;
      default:           result = { error: 'Acción desconocida: ' + action };
    }
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ error: err.toString(), stack: err.stack });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// Acciones
// ============================================================

function getBars() {
  const sheet = getSheet();
  const numRows = sheet.getLastRow();
  if (numRows <= 1) return [];

  const data = sheet.getRange(2, 1, numRows - 1, HEADERS.length).getValues();

  return data
    .filter(row => row[0] !== '')
    .map(row => {
      const obj = {};
      HEADERS.forEach((h, i) => {
        // Convertir números vacíos a cadena vacía
        obj[h] = row[i] === '' || row[i] === null ? '' : row[i];
      });
      return obj;
    });
}

function addBar(data) {
  ensureHeaders();
  const sheet = getSheet();
  const id = Date.now().toString();
  const row = HEADERS.map(h => {
    if (h === 'id') return id;
    const val = data[h];
    return (val === undefined || val === null) ? '' : val;
  });
  sheet.appendRow(row);
  return { success: true, id };
}

function updateBar(data) {
  const sheet = getSheet();
  const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat();
  const rowIndex = ids.indexOf(data.id);
  if (rowIndex === -1) return { error: 'Bar no encontrado: ' + data.id };

  const sheetRow = rowIndex + 2; // +1 por header, +1 por base-1

  HEADERS.forEach((h, colIndex) => {
    if (h !== 'id' && data[h] !== undefined && data[h] !== null) {
      sheet.getRange(sheetRow, colIndex + 1).setValue(data[h]);
    }
  });

  return { success: true };
}

function uploadPhoto(data) {
  // data.file: string base64 con prefijo "data:image/jpeg;base64,..."
  // data.fileName: nombre del archivo (opcional)
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const base64 = data.file.includes(',') ? data.file.split(',')[1] : data.file;
  const mimeType = data.file.includes('png') ? 'image/png' : 'image/jpeg';
  const fileName = data.fileName || ('bravas_' + Date.now() + '.jpg');

  const blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const fileId = file.getId();
  // URL de thumbnail para mostrar en la app (máx 800px de ancho)
  const url = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w800';

  return { success: true, url, fileId };
}

// ============================================================
// Helpers
// ============================================================

function getSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function ensureHeaders() {
  const sheet = getSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  } else {
    const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
    if (firstRow[0] !== 'id') {
      sheet.insertRowBefore(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    }
  }
}

function initSheet() {
  ensureHeaders();
  return { success: true, message: 'Sheet inicializado con cabeceras' };
}
