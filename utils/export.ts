import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FuelTransaction, Client } from '../types';
import { format } from 'date-fns';

export const generateInvoicePDF = (client: Client, transactions: FuelTransaction[]) => {
  const doc = new jsPDF();
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  // Header
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text('FUEL PURCHASE INVOICE', 14, 22);

  // Client Info
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Client ID: ${client.uniqueId}`, 14, 32);
  doc.text(`Client Name: ${client.name}`, 14, 37);
  if (client.address) {
    doc.text(`Address: ${client.address}`, 14, 42);
  }
  doc.text(`Invoice Date: ${dateStr}`, 150, 32);

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
    head: [['Date', 'Card #', 'Station', 'Type', 'Liters', 'Price/L (UAH)', 'Total (UAH)']],
    body: tableData,
    foot: [['', '', '', '', '', 'GRAND TOTAL:', `${grandTotal.toFixed(2)} UAH`]],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] }, // Tailwind blue-500
    styles: { fontSize: 8, cellPadding: 2 },
  });

  return doc;
};

export const downloadInvoice = (client: Client, transactions: FuelTransaction[]) => {
    const doc = generateInvoicePDF(client, transactions);
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    doc.save(`Invoice_${client.uniqueId}_${dateStr}.pdf`);
};

export const downloadConsolidatedInvoice = (transactions: FuelTransaction[], clients: Client[], client?: Client) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
  const dateStr = format(new Date(), 'yyyy-MM-dd HH:mm');

  // Header
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text('CONSOLIDATED FUEL INVOICE', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Report Generated: ${dateStr}`, 14, 28);
  
  if (client) {
    doc.text(`Client: ${client.name} (${client.uniqueId})`, 14, 33);
  } else {
    doc.text(`Scope: Multiple Clients`, 14, 33);
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
    head: [['Date', 'Client Name', 'Asset Card', 'Station', 'Address', 'Liters', 'Price/L', 'Total']],
    body: tableData,
    foot: [
      ['', '', '', '', 'GRAND TOTALS:', totalLiters.toFixed(2), '', `${totalPrice.toFixed(2)} UAH`]
    ],
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }, // Tailwind indigo-600
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      4: { cellWidth: 50 }, // Station Address column wider
    }
  });

  doc.save(`Consolidated_Invoice_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
};