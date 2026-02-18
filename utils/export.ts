import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FuelTransaction, Client } from '../types';
import { format } from 'date-fns';

/**
 * Fetches and loads a Cyrillic-compatible font into jsPDF.
 * We use NotoSans which is reliable and professional.
 * Using a more robust fetch and registration approach.
 */
const setupCyrillicFont = async (doc: jsPDF) => {
  try {
    // Reliable CDN mirror for NotoSans Regular (Cyrillic support)
    const fontUrl = 'https://raw.githubusercontent.com/googlefonts/noto-fonts/master/hinted/ttf/NotoSans/NotoSans-Regular.ttf';
    
    const response = await fetch(fontUrl);
    if (!response.ok) throw new Error('Font download failed');
    
    const fontArrayBuffer = await response.arrayBuffer();
    const fontUint8Array = new Uint8Array(fontArrayBuffer);
    
    // Robust binary to base64 conversion
    let binary = '';
    const bytes = new Uint8Array(fontArrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Font = btoa(binary);

    const fileName = 'NotoSans-Regular.ttf';
    const fontName = 'NotoSans';

    doc.addFileToVFS(fileName, base64Font);
    doc.addFont(fileName, fontName, 'normal');
    doc.setFont(fontName);
    
    return fontName;
  } catch (error) {
    console.error('Cyrillic font setup failed, falling back to standard font:', error);
    // If external font fails, we can't do much for Cyrillic in standard jsPDF 
    // without pre-encoding a font as a local asset.
    return 'Helvetica'; 
  }
};

export const generateInvoicePDF = async (client: Client, transactions: FuelTransaction[]) => {
  const doc = new jsPDF();
  const fontName = await setupCyrillicFont(doc);
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  // Set default font for the document
  doc.setFont(fontName);

  // Header
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text('FUEL PURCHASE INVOICE / РАХУНОК НА ПАЛЬНЕ', 14, 22);

  // Client Info
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Client ID / ID Клієнта: ${client.uniqueId}`, 14, 32);
  doc.text(`Client Name / Назва: ${client.name}`, 14, 37);
  if (client.address) {
    doc.text(`Address / Адреса: ${client.address}`, 14, 42);
  }
  doc.text(`Invoice Date / Дата: ${dateStr}`, 140, 32);

  // Table
  const tableData = transactions.map((t) => {
    const clientPricePerLiter = t.costPerLiter + client.marginPerLiter;
    const totalPaid = t.liters * clientPricePerLiter;
    return [
      t.date,
      t.fuelCardNumber,
      `${t.stationName}\n${t.stationAddress}`,
      t.fuelType,
      t.liters.toFixed(2),
      clientPricePerLiter.toFixed(2),
      totalPaid.toFixed(2)
    ];
  });

  const grandTotal = transactions.reduce((sum, t) => sum + (t.liters * (t.costPerLiter + client.marginPerLiter)), 0);

  autoTable(doc, {
    startY: 50,
    head: [['Date / Дата', 'Card / Картка', 'Station / АЗС', 'Type / Тип', 'Liters / Літри', 'Price/L (UAH)', 'Total (UAH)']],
    body: tableData,
    foot: [['', '', '', '', '', 'GRAND TOTAL / ВСЬОГО:', `${grandTotal.toFixed(2)} UAH`]],
    theme: 'striped',
    styles: { 
      font: fontName, 
      fontSize: 8, 
      cellPadding: 3 
    },
    headStyles: { 
      fillColor: [59, 130, 246], 
      font: fontName,
      fontStyle: 'normal'
    },
    bodyStyles: { 
      font: fontName 
    },
    footStyles: { 
      font: fontName,
      fontStyle: 'normal'
    },
  });

  return doc;
};

export const downloadInvoice = async (client: Client, transactions: FuelTransaction[]) => {
    const doc = await generateInvoicePDF(client, transactions);
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    doc.save(`Invoice_${client.uniqueId}_${dateStr}.pdf`);
};

export const downloadConsolidatedInvoice = async (transactions: FuelTransaction[], clients: Client[], client?: Client) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for consolidated
  const fontName = await setupCyrillicFont(doc);
  const dateStr = format(new Date(), 'yyyy-MM-dd HH:mm');

  // Set default font
  doc.setFont(fontName);

  // Header
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text('CONSOLIDATED FUEL INVOICE / ЗВЕДЕНИЙ ЗВІТ', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Report Generated / Створено: ${dateStr}`, 14, 28);
  
  if (client) {
    doc.text(`Client / Клієнт: ${client.name} (${client.uniqueId})`, 14, 33);
  } else {
    doc.text(`Scope / Область: Multiple Clients / Всі клієнти`, 14, 33);
  }

  let totalLiters = 0;
  let totalPrice = 0;

  const tableData = transactions.map((t) => {
    const clientRef = clients.find(c => c.id === t.clientId);
    const clientPricePerLiter = t.costPerLiter + (clientRef?.marginPerLiter || 0);
    const totalRow = t.liters * clientPricePerLiter;
    
    totalLiters += t.liters;
    totalPrice += totalRow;

    return [
      t.date,
      clientRef?.name || 'Manual Entry',
      t.fuelCardNumber,
      t.stationName,
      t.stationAddress,
      t.liters.toFixed(2),
      `${clientPricePerLiter.toFixed(2)} UAH`,
      `${totalRow.toFixed(2)} UAH`
    ];
  });

  autoTable(doc, {
    startY: 40,
    head: [['Date / Дата', 'Client / Назва', 'Card / Картка', 'Station / АЗС', 'Address / Адреса', 'Liters / Літри', 'Price/L', 'Total']],
    body: tableData,
    foot: [
      ['', '', '', '', 'GRAND TOTALS / ВСЬОГО:', totalLiters.toFixed(2), '', `${totalPrice.toFixed(2)} UAH`]
    ],
    theme: 'striped',
    styles: { 
      font: fontName, 
      fontSize: 8, 
      cellPadding: 2 
    },
    headStyles: { 
      fillColor: [79, 70, 229], 
      font: fontName,
      fontStyle: 'normal'
    },
    bodyStyles: { 
      font: fontName 
    },
    footStyles: { 
      font: fontName,
      fontStyle: 'normal'
    },
    columnStyles: {
      4: { cellWidth: 50 }, // Station Address column wider
    }
  });

  doc.save(`Consolidated_Invoice_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
};