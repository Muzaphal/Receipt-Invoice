import chromium from "@sparticuz/chromium"
import puppeteer from "puppeteer-core"
import puppeteerFull from "puppeteer"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function formatUGX(amount) {
  return Number(amount || 0).toLocaleString("en-UG")
}

function escapeHtml(text = "") {

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export async function POST(req) {

  let browser

  try {

    const body = await req.json()

    const {
      type = "invoice",
      customer = "Walk-in Customer",
      items = [],
      invoiceNumber,
      date,
      paymentMethod = "Cash",
      cashier = "Admin"
    } = body

    if (!items.length) {

      return Response.json(
        {
          success: false,
          message: "No items provided"
        },
        {
          status: 400
        }
      )
    }

    const subtotal = items.reduce((acc, item) => {

      return (
        acc +
        (
          Number(item.price || 0) *
          Number(item.quantity || 0)
        )
      )

    }, 0)

    const total = subtotal

    const rows = items.map((item, index) => {

      const price = Number(item.price || 0)

      const quantity = Number(item.quantity || 0)

      const itemTotal = price * quantity

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item.name)}</td>
          <td>${quantity}</td>
          <td>UGX ${formatUGX(price)}</td>
          <td>UGX ${formatUGX(itemTotal)}</td>
        </tr>
      `

    }).join("")

    const isReceipt = type === "receipt"

    const html = `
    <!DOCTYPE html>

    <html>

      <head>

        <meta charset="UTF-8" />

        <style>

          * {
            box-sizing: border-box;
          }

          body {

            font-family: Arial, sans-serif;

            padding: ${
              isReceipt
                ? "12px"
                : "35px"
            };

            color: #111827;

            background: white;
          }

          .container {
            width: 100%;
          }

          .header {
            text-align: center;
            margin-bottom: 20px;
          }

          .company {
            font-size: ${
              isReceipt
                ? "20px"
                : "32px"
            };

            font-weight: bold;
          }

          .details {

            font-size: ${
              isReceipt
                ? "11px"
                : "14px"
            };

            color: #555;

            margin-top: 6px;

            line-height: 1.7;
          }

          .badge {

            margin-top: 14px;

            display: inline-block;

            padding: 8px 20px;

            border-radius: 999px;

            background: #111827;

            color: white;

            font-size: ${
              isReceipt
                ? "11px"
                : "13px"
            };

            font-weight: bold;
          }

          .top {

            display: flex;

            justify-content: space-between;

            gap: 20px;

            margin-top: 25px;

            flex-direction: ${
              isReceipt
                ? "column"
                : "row"
            };
          }

          .card {

            border: 1px solid #e5e7eb;

            border-radius: 12px;

            padding: 14px;

            width: 100%;

            background: #f9fafb;
          }

          .card p {
            margin: 6px 0;
            font-size: ${
              isReceipt
                ? "11px"
                : "14px"
            };
          }

          table {

            width: 100%;

            border-collapse: collapse;

            margin-top: 20px;
          }

          thead {

            background: #d1d5db;

            color: black;
          }

          th {

            padding: 12px 8px;

            font-size: ${
              isReceipt
                ? "10px"
                : "13px"
            };

            text-align: left;
          }

          td {

            padding: 12px 8px;

            border-bottom: 1px solid #e5e7eb;

            font-size: ${
              isReceipt
                ? "10px"
                : "13px"
            };
          }

          td:nth-child(1),
          th:nth-child(1) {
            text-align: center;
            width: 8%;
          }

          td:nth-child(3),
          th:nth-child(3) {
            text-align: center;
            width: 12%;
          }

          td:nth-child(4),
          td:nth-child(5),
          th:nth-child(4),
          th:nth-child(5) {
            text-align: right;
          }

          .summary {

            margin-top: 20px;

            display: flex;

            justify-content: flex-end;
          }

          .summary-box {

            width: ${
              isReceipt
                ? "100%"
                : "320px"
            };

            border: 1px solid #d1d5db;

            border-radius: 12px;

            padding: 16px;

            background: #f9fafb;
          }

          .summary-row {

            display: flex;

            justify-content: space-between;

            margin-bottom: 12px;

            font-size: ${
              isReceipt
                ? "11px"
                : "14px"
            };
          }

          .grand-total {

            border-top: 2px solid #111827;

            padding-top: 12px;

            font-weight: bold;

            font-size: ${
              isReceipt
                ? "14px"
                : "20px"
            };
          }

          .footer {

            margin-top: 30px;

            text-align: center;

            font-size: ${
              isReceipt
                ? "10px"
                : "12px"
            };

            color: #666;

            line-height: 1.8;
          }

        </style>

      </head>

      <body>

        <div class="container">

          <div class="header">

            <div class="company">
              DAR PAINT SMC LTD
            </div>

            <div class="details">
              Dealers in all types of paints <br/>
              Kampala, Uganda • +256 702 096 737
            </div>

            <div class="badge">
              ${isReceipt ? "RECEIPT" : "INVOICE"}
            </div>

          </div>

          <div class="top">

            <div class="card">

              <p>
                <strong>Customer:</strong>
                ${escapeHtml(customer)}
              </p>

            </div>

            <div class="card">

              <p>
                <strong>No:</strong>
                ${escapeHtml(invoiceNumber)}
              </p>

              <p>
                <strong>Date:</strong>
                ${escapeHtml(date)}
              </p>

              <p>
                <strong>Cashier:</strong>
                ${escapeHtml(cashier)}
              </p>

            </div>

          </div>

          <table>

            <thead>

              <tr>
                <th>No</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>

            </thead>

            <tbody>

              ${rows}

            </tbody>

          </table>

          <div class="summary">

            <div class="summary-box">

              <div class="summary-row">
                <span>Subtotal</span>
                <strong>UGX ${formatUGX(subtotal)}</strong>
              </div>

              <div class="summary-row grand-total">
                <span>Total</span>
                <span>UGX ${formatUGX(total)}</span>
              </div>

            </div>

          </div>

          <div class="footer">

            Thank you for your business <br/>

            Generated by DAR PAINT SMC LTD

          </div>

        </div>

      </body>

    </html>
    `

    if (process.env.NODE_ENV === "development") {

      browser = await puppeteerFull.launch({
        headless: true
      })

    } else {

      browser = await puppeteer.launch({

        args: chromium.args,

        executablePath: await chromium.executablePath(),

        headless: chromium.headless,

        defaultViewport: chromium.defaultViewport
      })
    }

    const page = await browser.newPage()

    await page.setContent(html, {
      waitUntil: "networkidle0"
    })

    const pdf = await page.pdf({

      format: isReceipt ? undefined : "A4",

      width: isReceipt ? "80mm" : undefined,

      printBackground: true,

      margin: {
        top: "10px",
        bottom: "10px",
        left: "10px",
        right: "10px"
      }
    })

    await browser.close()

    return new Response(pdf, {

      status: 200,

      headers: {

        "Content-Type": "application/pdf",

        "Content-Disposition":
          `inline; filename=${type}-${invoiceNumber}.pdf`
      }
    })

  } catch (error) {

    console.error(error)

    if (browser) {
      await browser.close()
    }

    return Response.json(
      {
        success: false,
        message: "Failed to generate document",
        error: error.message
      },
      {
        status: 500
      }
    )
  }
}                             