import chromium from "@sparticuz/chromium"
import puppeteer from "puppeteer-core"
import puppeteerFull from "puppeteer"

function formatUGX(amount) {
  return Number(amount || 0).toLocaleString("en-UG")
}

export async function POST(req) {

  try {

    const data = await req.json()

    const {
      customer,
      items,
      invoiceNumber,
      date
    } = data

    // VALIDATION
    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No items provided"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    }

    // CALCULATE TOTALS
    const subtotal = items.reduce(
      (acc, item) =>
        acc + (Number(item.price) * Number(item.quantity)),
      0
    )

    const total = subtotal

    // GENERATE ROWS
    const rows = items.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>UGX ${formatUGX(item.price)}</td>
        <td>UGX ${formatUGX(item.price * item.quantity)}</td>
      </tr>
    `).join("")

    // HTML TEMPLATE
    const html = `
    <html>
      <head>
        <meta charset="UTF-8" />

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #222;
            background: #fff;
          }

          .container {
            width: 100%;
          }

          .title {
            text-align: center;
            font-size: 30px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 5px;
          }

          .subtitle {
            text-align: center;
            font-size: 14px;
            color: #4b5563;
            margin-bottom: 30px;
          }

          .top-section {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 25px;
          }

          .box {
            width: 48%;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 14px;
            background: #f9fafb;
          }

          .box p {
            margin: 6px 0;
            font-size: 14px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            table-layout: fixed;
          }

          th {
            background: #f9fafb;
            color: black;
            font-size: 14px;
            padding: 12px;
            text-align: left;
          }

          td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            font-size: 14px;
          }

          tr:nth-child(even) {
            background: #f9fafb;
          }

          /* COLUMN WIDTHS */

          th:nth-child(1),
          td:nth-child(1) {
            width: 8%;
            text-align: center;
          }

          th:nth-child(2),
          td:nth-child(2) {
            width: 40%;
          }

          th:nth-child(3),
          td:nth-child(3) {
            width: 12%;
            text-align: center;
          }

          th:nth-child(4),
          td:nth-child(4) {
            width: 20%;
            text-align: right;
          }

          th:nth-child(5),
          td:nth-child(5) {
            width: 20%;
            text-align: right;
          }

          .totals {
            margin-top: 25px;
            display: flex;
            justify-content: flex-end;
          }

          .totals-box {
            width: 320px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 18px;
            background: #f9fafb;
          }

          .totals-box p {
            margin: 8px 0;
            font-size: 15px;
          }

          .grand-total {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 2px solid #111827;
            font-size: 20px;
            font-weight: bold;
            color: #111827;
          }

          .signature {
            margin-top: 70px;
            display: flex;
            justify-content: space-between;
          }

          .sign-box {
            width: 220px;
            text-align: center;
            font-size: 14px;
          }

          .line {
            border-top: 1px solid #111827;
            margin-top: 50px;
            margin-bottom: 8px;
          }

          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }

        </style>
      </head>

      <body>

        <div class="container">

          <!-- COMPANY -->

          <div class="title">
            DAR PAINT SMC LTD
          </div>

          <div class="subtitle">
            Dealers in all types of paints • Kampala, Uganda • +256 702 096 737
          </div>

          <!-- TOP INFO -->

          <div class="top-section">

            <div class="box">
              <p><strong>Billed To:</strong></p>
              <p>${customer || "Walk-in Customer"}</p>
            </div>

            <div class="box">
              <p><strong>Invoice No:</strong> ${invoiceNumber}</p>
              <p><strong>Date:</strong> ${date}</p>
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
              ${rows}
            </tbody>

          </table>

          <!-- TOTALS -->

          <div class="totals">

            <div class="totals-box">

              <p>
                Subtotal:
                <strong>
                  UGX ${formatUGX(subtotal)}
                </strong>
              </p>

              <p class="grand-total">
                Total:
                UGX ${formatUGX(total)}
              </p>

            </div>

          </div>

          <!-- SIGNATURES -->

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

        </div>

      </body>
    </html>
    `

    let browser

    // LOCAL DEVELOPMENT
    if (process.env.NODE_ENV === "development") {

      browser = await puppeteerFull.launch({
        headless: true
      })

    } else {

      // VERCEL PRODUCTION
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      })

    }

    const page = await browser.newPage()

    await page.setContent(html, {
      waitUntil: "networkidle0"
    })

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px"
      }
    })

    await browser.close()

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          `attachment; filename=invoice-${invoiceNumber}.pdf`
      }
    })

  } catch (error) {

    console.error("PDF ERROR:", error)

    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to generate document",
        error: error.message
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
  }
}