const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const SPREADSHEET_ID = '1v1BwSx6BAY9MCkCkNXZ7TR8WeeAlhYigw6WgUS7iTFQ';
const SHEET_NAME = 'Productos'; // Nombre exacto de tu hoja
const SHEET_ID = 1824323229;    // Tu gid exacto

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

// Obtener todos los productos
app.get('/productos', async (req, res) => {
  try {
    const client = await auth.getClient();
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:Z1000`,
      auth: client,
    });
    const [headers, ...rows] = result.data.values;
    const productos = rows.map(row =>
      Object.fromEntries(headers.map((h, i) => [h, row[i] || '']))
    );
    res.json(productos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Agregar producto
app.post('/productos', async (req, res) => {
  try {
    const client = await auth.getClient();
    const { values } = req.body;
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [values] },
      auth: client,
    });
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Editar producto (PUT, fila empieza en 2)
app.put('/productos/:row', async (req, res) => {
  try {
    const client = await auth.getClient();
    const row = Number(req.params.row);
    const { values } = req.body;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${row}:Z${row}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [values] },
      auth: client,
    });
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Borrar producto (por número de fila, fila empieza en 2)
app.delete('/productos/:row', async (req, res) => {
  try {
    const client = await auth.getClient();
    const row = Number(req.params.row);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: SHEET_ID, // Usar tu sheetId correcto
                dimension: 'ROWS',
                startIndex: row - 1,
                endIndex: row,
              },
            },
          },
        ],
      },
      auth: client,
    });
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => console.log('API corriendo en http://localhost:3000'));