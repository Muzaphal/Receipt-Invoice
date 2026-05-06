import puppeteer from "puppeteer"

function formatUGX(amount) {
  return Number(amount).toLocaleString("en-UG")
}

export async function POST(req) {
  const data = await req.json()

  const {
    customer,
    items, // [{ name, price, quantity }]
    invoiceNumber,
    date
  } = data

  // Calculate totals
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  const total = subtotal // you can add tax later

  // Generate table rows
  const rows = items.map((item, index) => `
  <tr>
    <td>${index + 1}</td>
    <td>${item.name}</td>
    <td>${item.quantity}</td>
    <td>UGX ${formatUGX(item.price)}</td>
    <td>UGX ${formatUGX(item.price * item.quantity)}</td>
  </tr>
  `).join("")

  const html = `
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 40px;
        color: #222;
      }

      .title {
        text-align: center;
        font-size: 26px;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .subtitle {
        text-align: center;
        font-size: 14px;
        margin-bottom: 20px;
      }

      .top-section {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
      }

      .box {
        border: 1px solid #ddd;
        padding: 12px;
        width: 48%;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        table-layout: fixed;
      }

      th, td {
        border: 1px solid #ddd;
        padding: 10px;
        font-size: 14px;
      }

      th {
        background: #f3f4f6;
        font-weight: bold;
      }

      /* Column widths */
      th:nth-child(1), td:nth-child(1) { width: 8%; text-align: center; }
      th:nth-child(2), td:nth-child(2) { width: 40%; }
      th:nth-child(3), td:nth-child(3) { width: 12%; text-align: center; }
      th:nth-child(4), td:nth-child(4) { width: 20%; text-align: right; }
      th:nth-child(5), td:nth-child(5) { width: 20%; text-align: right; }

      .totals {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
      }

      .totals-box {
        width: 300px;
        border: 1px solid #ddd;
        padding: 15px;
      }

      .totals-box p {
        margin: 6px 0;
      }

      .grand-total {
        font-size: 18px;
        font-weight: bold;
        border-top: 1px solid #000;
        padding-top: 8px;
      }

      .signature {
        margin-top: 60px;
        display: flex;
        justify-content: space-between;
      }

      .sign-box {
        text-align: center;
        width: 200px;
      }

      .line {
        margin-top: 50px;
        border-top: 1px solid #000;
      }

      .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 12px;
        color: #666;
      }
    </style>
  </head>

  <body>

    <!-- COMPANY HEADER -->
    <div class="title">DAR PAINT SMC LTD</div>
    <div class="subtitle">
      Dealers in all types of paints | Kampala, Uganda | +256 702 096 737
    </div>

    <!-- CUSTOMER & INVOICE INFO -->
    <div class="top-section">
      <div class="box">
        <strong>Billed To:</strong><br/>
        ${data.customer}
      </div>

      <div class="box">
        <p><strong>Invoice No:</strong> ${data.invoiceNumber}</p>
        <p><strong>Date:</strong> ${data.date}</p>
      </div>
    </div>

    <!-- TABLE -->
    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Item</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>

      <tbody>
        ${items.map((item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>UGX ${formatUGX(item.price)}</td>
            <td>UGX ${formatUGX(item.price * item.quantity)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <!-- TOTALS -->
    <div class="totals">
      <div class="totals-box">
        <p>Subtotal: UGX ${formatUGX(subtotal)}</p>
        <p class="grand-total">Total: UGX ${formatUGX(total)}</p>
      </div>
    </div>

    <!-- SIGNATURE -->
    <div class="signature">
      <div class="sign-box">
        <div class="line"></div>
        Authorized Signature
      </div>

      <div class="sign-box">
        <div class="line"></div>
        Customer Signature
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      Thank you for your business
    </div>

  </body>
</html>
`

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  })

  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: "domcontentloaded" })

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true
  })

  await browser.close()

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${invoiceNumber}.pdf`
    }
  })
}