const PDFDocument = require('pdfkit');

function numberToWords(num) {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return;
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'And ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only' : '';
  return str.trim() || 'Zero only';
}

const generateBillPDF = (bill) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 30 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const fontNormal = 'Helvetica';
      const fontBold = 'Helvetica-Bold';
      
      const width = doc.page.width - 60; // 30 margin on each side
      
      // ---------- HEADER ----------
      doc.font(fontBold).fontSize(28).text('LuxeStore', 30, 30);
      
      doc.font(fontBold).fontSize(14).text('Tax Invoice/Bill of Supply/Cash Memo', 30, 30, { align: 'right', width: width });
      doc.font(fontNormal).fontSize(11).text('(Original for Recipient)', { align: 'right', width: width });
      
      doc.fontSize(8).text('Digitally Signed by LUXESTORE INDIA PRIVATE LIMITED', 30, 65);
      doc.text(`Date: ${new Date(bill.createdAt).toISOString().split('.')[0]} UTC`);
      doc.text('Reason: Invoice');
      
      doc.moveDown(1.5);
      
      // ---------- ADDRESS SECTION ----------
      const startY = doc.y;
      
      // Left Column (Sold By)
      doc.font(fontBold).fontSize(10).text('Sold By :', 30, startY);
      doc.font(fontNormal).text('LuxeStore India Private Limited');
      doc.text('Khasra No 14/24/212, 16/3/2');
      doc.text('Darbari Pur Road Village Hassanpur');
      doc.text('Gurgaon, Haryana, 122001');
      doc.text('IN');
      
      doc.moveDown(1);
      doc.font(fontBold).text('PAN No: ', { continued: true }).font(fontNormal).text('AAQCS4259Q');
      doc.font(fontBold).text('GST Registration No: ', { continued: true }).font(fontNormal).text('06AAQCS4259Q1ZE');
      
      // Right Column (Billing / Shipping)
      const rightColX = doc.page.width / 2 + 10;
      doc.font(fontBold).text('Billing Address :', rightColX, startY, { align: 'right', width: width / 2 - 10 });
      const userAddress = (bill.user?.address || bill.customer?.address || 'Address not provided').replace(/\n/g, ', ');
      const userName = bill.user?.name || bill.customer?.name || 'Customer';
      
      doc.font(fontNormal).text(userName, { align: 'right', width: width / 2 - 10 });
      doc.text(userAddress, { align: 'right', width: width / 2 - 10 });
      doc.text('IN', { align: 'right', width: width / 2 - 10 });
      doc.font(fontBold).text('State/UT Code: ', { align: 'right', width: width / 2 - 10, continued: true }).font(fontNormal).text('10');
      
      doc.moveDown(1);
      doc.font(fontBold).text('Shipping Address :', rightColX, doc.y, { align: 'right', width: width / 2 - 10 });
      doc.font(fontNormal).text(userName, { align: 'right', width: width / 2 - 10 });
      doc.text(userAddress, { align: 'right', width: width / 2 - 10 });
      doc.text('IN', { align: 'right', width: width / 2 - 10 });
      doc.font(fontBold).text('State/UT Code: ', { align: 'right', width: width / 2 - 10, continued: true }).font(fontNormal).text('10');
      doc.font(fontBold).text('Place of supply: ', { align: 'right', width: width / 2 - 10, continued: true }).font(fontNormal).text('HARYANA');
      doc.font(fontBold).text('Place of delivery: ', { align: 'right', width: width / 2 - 10, continued: true }).font(fontNormal).text('HARYANA');
      
      doc.moveDown(1);
      
      // ---------- ORDER INFO ----------
      const orderInfoY = Math.max(doc.y, startY + 120);
      
      doc.font(fontBold).text('Order Number: ', 30, orderInfoY, { continued: true }).font(fontNormal).text(bill.billNumber);
      doc.font(fontBold).text('Order Date: ', 30, doc.y, { continued: true }).font(fontNormal).text(new Date(bill.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.'));
      
      doc.font(fontBold).text('Invoice Number: ', rightColX, orderInfoY, { align: 'right', width: width / 2 - 10, continued: true }).font(fontNormal).text(`IN-${bill.billNumber}`);
      doc.font(fontBold).text('Invoice Details: ', rightColX, doc.y, { align: 'right', width: width / 2 - 10, continued: true }).font(fontNormal).text(`HR-INV-${new Date().getTime().toString().slice(-6)}`);
      doc.font(fontBold).text('Invoice Date: ', rightColX, doc.y, { align: 'right', width: width / 2 - 10, continued: true }).font(fontNormal).text(new Date().toLocaleDateString('en-GB').replace(/\//g, '.'));
      
      doc.moveDown(2);
      
      // ---------- TABLE ----------
      const tableTop = doc.y;
      
      // Draw Table Header Background
      doc.rect(30, tableTop, width, 30).fill('#e5e5e5');
      doc.fillColor('#000000');
      
      const cols = [
        { name: 'Sl.\nNo', x: 30, w: 20 },
        { name: 'Description', x: 50, w: 180 },
        { name: 'Unit\nPrice', x: 230, w: 50 },
        { name: 'Discount', x: 280, w: 45 },
        { name: 'Qty', x: 325, w: 25 },
        { name: 'Net\nAmount', x: 350, w: 50 },
        { name: 'Tax\nRate', x: 400, w: 30 },
        { name: 'Tax\nType', x: 430, w: 30 },
        { name: 'Tax\nAmount', x: 460, w: 50 },
        { name: 'Total\nAmount', x: 510, w: 55 }
      ];
      
      doc.font(fontBold).fontSize(9);
      cols.forEach(c => {
        doc.text(c.name, c.x + 2, tableTop + 4, { width: c.w - 4, align: 'center' });
      });
      
      // Draw Header Borders
      doc.rect(30, tableTop, width, 30).stroke();
      cols.forEach(c => {
        if (c.x > 30) doc.moveTo(c.x, tableTop).lineTo(c.x, tableTop + 30).stroke();
      });
      
      let rowY = tableTop + 30;
      doc.font(fontNormal).fontSize(8);
      
      bill.items.forEach((item, index) => {
        const itemHeight = 40; // Approx height per item
        
        doc.text((index + 1).toString(), cols[0].x, rowY + 5, { width: cols[0].w, align: 'center' });
        doc.text(`${item.product.name}`, cols[1].x + 2, rowY + 5, { width: cols[1].w - 4 });
        
        doc.text(`₹${parseFloat(item.unitPrice).toFixed(2)}`, cols[2].x + 2, rowY + 5, { width: cols[2].w - 4, align: 'center' });
        doc.text(`₹0.00`, cols[3].x + 2, rowY + 5, { width: cols[3].w - 4, align: 'center' });
        doc.text(item.quantity.toString(), cols[4].x, rowY + 5, { width: cols[4].w, align: 'center' });
        
        const netAmt = (item.quantity * item.unitPrice).toFixed(2);
        doc.text(`₹${netAmt}`, cols[5].x + 2, rowY + 5, { width: cols[5].w - 4, align: 'center' });
        
        doc.text(`18%`, cols[6].x + 2, rowY + 5, { width: cols[6].w - 4, align: 'center' });
        doc.text(`IGST`, cols[7].x + 2, rowY + 5, { width: cols[7].w - 4, align: 'center' });
        
        const taxAmt = (netAmt * 0.18).toFixed(2);
        doc.text(`₹${taxAmt}`, cols[8].x + 2, rowY + 5, { width: cols[8].w - 4, align: 'center' });
        
        const totalAmt = (parseFloat(netAmt) + parseFloat(taxAmt)).toFixed(2);
        doc.text(`₹${totalAmt}`, cols[9].x + 2, rowY + 5, { width: cols[9].w - 4, align: 'center' });
        
        // Draw Row borders
        doc.rect(30, rowY, width, itemHeight).stroke();
        cols.forEach(c => {
          if (c.x > 30) doc.moveTo(c.x, rowY).lineTo(c.x, rowY + itemHeight).stroke();
        });
        
        rowY += itemHeight;
      });
      
      // Draw Discount Row if applicable
      if (bill.discount && parseFloat(bill.discount) > 0) {
        const discHeight = 25;
        doc.text('Bill Discount', cols[1].x + 2, rowY + 5, { width: cols[1].w - 4 });
        doc.text(`-₹${parseFloat(bill.discount).toFixed(2)}`, cols[9].x + 2, rowY + 5, { width: cols[9].w - 4, align: 'center' });
        
        doc.rect(30, rowY, width, discHeight).stroke();
        cols.forEach(c => {
          if (c.x > 30 && (c.x === cols[1].x || c.x === cols[9].x)) doc.moveTo(c.x, rowY).lineTo(c.x, rowY + discHeight).stroke();
          // Draw minimal borders for the discount row
          if (c.x > 30) doc.moveTo(c.x, rowY).lineTo(c.x, rowY + discHeight).stroke();
        });
        rowY += discHeight;
      }
      
      // ---------- TOTAL ROW ----------
      const totalRowHeight = 20;
      doc.font(fontBold).fontSize(10);
      doc.text('TOTAL:', 30 + 5, rowY + 5);
      
      doc.text(`₹${parseFloat(bill.grandTotal).toFixed(2)}`, cols[9].x + 2, rowY + 5, { width: cols[9].w - 4, align: 'center' });
      
      doc.rect(30, rowY, width, totalRowHeight).stroke();
      doc.moveTo(cols[9].x, rowY).lineTo(cols[9].x, rowY + totalRowHeight).stroke();
      rowY += totalRowHeight;
      
      // ---------- AMOUNT IN WORDS ----------
      const wordRowHeight = 35;
      doc.fontSize(10).text('Amount in Words:', 30 + 5, rowY + 5);
      doc.text(`${numberToWords(Math.round(bill.grandTotal))}`, 30 + 5, rowY + 18);
      
      doc.rect(30, rowY, width, wordRowHeight).stroke();
      rowY += wordRowHeight;
      
      // ---------- SIGNATORY ----------
      const sigHeight = 60;
      doc.rect(30, rowY, width, sigHeight).stroke();
      
      doc.text('For LuxeStore India Private Limited:', 30 + width - 250, rowY + 5, { width: 240, align: 'right' });
      doc.text('Authorized Signatory', 30 + width - 250, rowY + sigHeight - 15, { width: 240, align: 'right' });
      
      rowY += sigHeight;
      
      // Footer Note
      doc.font(fontNormal).fontSize(9).text('Whether tax is payable under reverse charge - No', 30, rowY + 5);
      
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

const generatePackingSlipPDF = (bill) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const fontNormal = 'Helvetica';
      const fontBold = 'Helvetica-Bold';
      
      const width = doc.page.width - 80;
      
      doc.font(fontNormal).fontSize(10);
      doc.text('Page 1 of 1, 1-1/1', 40, 40);
      doc.text(`Packing slip for ${bill.billNumber} ${new Date(bill.createdAt).toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'})}`, 40, 55);
      
      // Draw a pseudo-barcode on the top right
      const barcodeX = doc.page.width - 240;
      const barcodeY = 40;
      doc.rect(barcodeX, barcodeY, 200, 60).fill('#ffffff'); // clear area
      let currentX = barcodeX;
      for (let i = 0; i < 50; i++) {
        const barWidth = Math.random() > 0.5 ? 2 : 4;
        const gap = Math.random() > 0.5 ? 2 : 3;
        doc.rect(currentX, barcodeY, barWidth, 60).fill('#000000');
        currentX += barWidth + gap;
        if (currentX > barcodeX + 195) break;
      }
      doc.fillColor('#000000');
      doc.fontSize(8).text(`${bill.billNumber} /-1 of 1 -// std-in-10k`, barcodeX, barcodeY + 65);
      
      doc.moveDown(3);
      
      doc.font(fontBold).fontSize(10).text('Sold By', 40, doc.y);
      doc.font(fontNormal).text('LuxeStore India Private Limited');
      doc.text('Khasra No 14/24/212, 16/3/2, 4/2,5/2/1, 6/2,7');
      doc.text('Darbari Pur Road Village Hassanpur');
      doc.text('Gurgaon - 122001');
      doc.text('Haryana, India');
      
      doc.moveDown(1.5);
      doc.text(`Invoice Number: IN-${bill.billNumber}`);
      
      doc.moveDown(1.5);
      
      const tableY = doc.y;
      
      // Thick line
      doc.lineWidth(2).moveTo(40, tableY).lineTo(doc.page.width - 40, tableY).stroke();
      doc.lineWidth(1); // reset
      
      doc.font(fontBold).fontSize(10).text(`Order ID ${bill.billNumber}`, 40, tableY + 5);
      doc.font(fontNormal).text('This is a computer generated document', 40, tableY + 5, { align: 'right', width: width });
      
      const headerY = tableY + 25;
      doc.lineWidth(2).moveTo(40, headerY).lineTo(doc.page.width - 40, headerY).stroke();
      doc.lineWidth(1);
      
      doc.font(fontNormal).text('QTY', 40, headerY + 5);
      doc.text('DESCRIPTION', 80, headerY + 5);
      
      const firstRowY = headerY + 25;
      doc.lineWidth(2).moveTo(40, firstRowY).lineTo(doc.page.width - 40, firstRowY).stroke();
      doc.lineWidth(1);
      
      let rowY = firstRowY + 10;
      doc.font(fontBold);
      bill.items.forEach(item => {
        doc.text(item.quantity.toString(), 40, rowY);
        doc.text(item.product.name, 80, rowY);
        rowY += 20;
      });
      
      doc.moveDown(1);
      const endY = doc.y;
      doc.lineWidth(2).moveTo(40, endY).lineTo(doc.page.width - 40, endY).stroke();
      doc.lineWidth(1);
      
      // Footer
      doc.moveDown(2);
      doc.font(fontNormal).fontSize(9);
      doc.text('Registered Address for\nLuxeStore India Private Limited, #11, 6th Floor, Divyashree Chambers, B wing,\nShaughnessy Road, Langford town, Akkithimanahalli, Bangalore - 560025, KARNATAKA, IN', 40, doc.y, { align: 'center', width: width });
      
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateBillPDF, generatePackingSlipPDF };
