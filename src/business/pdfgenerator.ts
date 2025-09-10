import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateInvoice = (payment:any, user:any, plan:any) => {
  const invoiceDir = path.join(process.cwd(),"invoices");
  if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir);

  const filePath = path.join(invoiceDir, `invoice_${payment._id}.pdf`);
const doc = new PDFDocument({ size: "A4", margin: 50 });

  doc.pipe(fs.createWriteStream(filePath));

  // ----- HEADER -----
  // Logo placeholder
  doc.image(path.join(process.cwd(), "assets/logo.png"), 50, 45, { width: 100 }).fontSize(20).text("Legal Alliance", 160, 50);
  doc.fontSize(10).text("Your trusted legal service platform", 160, 75);
  
  // Invoice title & date
  doc.fontSize(20).text("INVOICE", 400, 50, { align: "right" });
  doc.fontSize(10).text(`Invoice #: ${payment._id}`, 400, 75, { align: "right" });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 400, 90, { align: "right" });

  doc.moveDown(4);

  // ----- BILL TO -----
  doc.fontSize(12).text(`Billed To:`, 50, 150);
  doc.fontSize(10)
    .text(user.name, 50, 165)
    .text(user.email, 50, 180)
    .text(user.phone, 50, 195);

  // ----- PAYMENT INFO -----
  doc.text(`Payment ID: ${payment.razorpayPaymentId}`, 50, 220)
    .text(`Order ID: ${payment.razorpayOrderId}`, 50, 235);

  // ----- TABLE OF ITEMS -----
  const tableTop = 270;
  const itemX = 50;
  const descX = 150;
  const amountX = 400;

  doc.fontSize(12).text("Description", descX, tableTop);
  doc.text("Amount (₹)", amountX, tableTop);

  doc.moveTo(itemX, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();

  const y = tableTop + 30;
  doc.fontSize(10)
    .text(plan.name, descX, y)
    .text(`₹${payment.amount}`, amountX, y);

  // ----- TOTAL -----
  doc.moveTo(itemX, y + 25)
    .lineTo(550, y + 25)
    .stroke();

  doc.fontSize(12)
    .text("Total", descX, y + 40)
    .text(`₹${payment.amount}`, amountX, y + 40);

  // ----- FOOTER -----
  doc.fontSize(10)
    .text("Thank you for your payment!", 50, 700, { align: "center" })
    .text("Legal Alliance - Your trusted legal service platform", 50, 715, { align: "center" });

  doc.end();
  return filePath;
};