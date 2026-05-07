"use client"

import { useMemo, useState } from "react"

type Item = {
  name: string
  price: string
  quantity: number
}

export default function Home() {

  const [type, setType] = useState<"invoice" | "receipt">("invoice")

  const [customer, setCustomer] = useState("")

  const [cashier, setCashier] = useState("Admin")

  const [loading, setLoading] = useState(false)

  const [items, setItems] = useState<Item[]>([
    {
      name: "",
      price: "",
      quantity: 1
    }
  ])

  const addItem = () => {
    setItems([
      ...items,
      {
        name: "",
        price: "",
        quantity: 1
      }
    ])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleChange = (
    index: number,
    field: keyof Item,
    value: string | number
  ) => {

    const updated = [...items]

    updated[index] = {
      ...updated[index],
      [field]:
        field === "quantity"
          ? Number(value)
          : value
    }

    setItems(updated)
  }

  const total = useMemo(() => {

    return items.reduce((sum, item) => {

      return (
        sum +
        (
          Number(item.price || 0) *
          Number(item.quantity || 0)
        )
      )

    }, 0)

  }, [items])

  const generateDocument = async () => {

    try {

      setLoading(true)

      const res = await fetch("/api/invoice", {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          type,

          customer,

          cashier,

          invoiceNumber:
            type === "invoice"
              ? `INV-${Date.now()}`
              : `RCPT-${Date.now()}`,

          date: new Date().toLocaleDateString("en-UG"),

          items: items.map(item => ({
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity)
          }))
        })
      })

      if (!res.ok) {

        const error = await res.json()

        alert(error.message || "Failed to generate document")

        return
      }

      const blob = await res.blob()

      const url = window.URL.createObjectURL(blob)

      window.open(url)

    } catch (error) {

      console.error(error)

      alert("Something went wrong")

    } finally {

      setLoading(false)

    }
  }

  return (

    <div className="min-h-screen bg-gray-100 py-10 px-4">

      <div className="max-w-5xl mx-auto bg-black rounded-3xl shadow-xl overflow-hidden">

        {/* HEADER */}

        <div className="bg-black text-white p-8">

          <h1 className="text-4xl font-bold mb-2">
            DAR PAINT SMC LTD
          </h1>

          <p className="text-gray-300">
            Professional Invoice & Receipt Generator (UGX)
          </p>

        </div>

        <div className="p-8">

          {/* SWITCH */}

          <div className="flex gap-4 mb-8">

            <button
              onClick={() => setType("invoice")}
              className={`px-6 py-3 rounded-xl font-semibold transition ${
                type === "invoice"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Invoice
            </button>

            <button
              onClick={() => setType("receipt")}
              className={`px-6 py-3 rounded-xl font-semibold transition ${
                type === "receipt"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Receipt
            </button>

          </div>

          {/* CUSTOMER DETAILS */}

          <div className="grid md:grid-cols-3 gap-4 mb-8">

            <input
              type="text"
              placeholder="Customer Name"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="border rounded-xl p-4 outline-none focus:ring-2 focus:ring-black"
            />

            <input
              type="text"
              placeholder="Cashier"
              value={cashier}
              onChange={(e) => setCashier(e.target.value)}
              className="border rounded-xl p-4 outline-none"
            />

          </div>

          {/* ITEMS */}

          <div className="space-y-4">

            {items.map((item, index) => (

              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-3"
              >

                <input
                  placeholder="Item Name"
                  value={item.name}
                  onChange={(e) =>
                    handleChange(index, "name", e.target.value)
                  }
                  className="md:col-span-5 border rounded-xl p-4"
                />

                <input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) =>
                    handleChange(index, "price", e.target.value)
                  }
                  className="md:col-span-3 border rounded-xl p-4"
                />

                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    handleChange(index, "quantity", e.target.value)
                  }
                  className="md:col-span-2 border rounded-xl p-4"
                />

                <button
                  onClick={() => removeItem(index)}
                  className="md:col-span-2 bg-red-500 hover:bg-red-600 text-white rounded-xl"
                >
                  Remove
                </button>

              </div>

            ))}

          </div>

          {/* ACTIONS */}

          <div className="flex flex-col md:flex-row justify-between items-center gap-5 mt-8">

            <button
              onClick={addItem}
              className="bg-gray-900 hover:bg-black text-white px-6 py-4 rounded-xl font-semibold"
            >
              + Add Item
            </button>

            <div className="text-2xl font-bold">
              Total: UGX {total.toLocaleString("en-UG")}
            </div>

          </div>

          {/* GENERATE */}

          <button
            onClick={generateDocument}
            disabled={loading}
            className={`w-full mt-8 py-5 rounded-2xl text-lg font-bold text-white transition ${
              type === "invoice"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >

            {
              loading
                ? "Generating..."
                : `Generate ${type === "invoice" ? "Invoice" : "Receipt"}`
            }

          </button>

        </div>

      </div>

    </div>
  )
}