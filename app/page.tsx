"use client"
import { useState } from "react"

// ✅ Define a proper type
type Item = {
  name: string
  price: string
  quantity: number
}

export default function Home() {
  const [type, setType] = useState<"invoice" | "receipt">("invoice")
  const [customer, setCustomer] = useState("")

  const [items, setItems] = useState<Item[]>([
    { name: "", price: "", quantity: 1 }
  ])

  const addItem = () => {
    setItems([...items, { name: "", price: "", quantity: 1 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  // ✅ FIXED typing here
  const handleChange = (
    index: number,
    field: keyof Item,
    value: string | number
  ) => {
    const newItems = items.map((item, i) =>
      i === index
        ? {
            ...item,
            [field]: field === "quantity" ? Number(value) : value
          }
        : item
    )

    setItems(newItems)
  }

  const total = items.reduce((sum, item) => {
    return sum + (Number(item.price) * Number(item.quantity) || 0)
  }, 0)

  const generateDocument = async () => {
    const res = await fetch("/api/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type,
        customer,
        invoiceNumber: (type === "receipt" ? "RCPT-" : "INV-") + Date.now(),
        date: new Date().toISOString().split("T")[0],
        items: items.map(item => ({
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity)
        }))
      })
    })

    if (!res.ok) {
      alert("Failed to generate document")
      return
    }

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `${type}.pdf`
    a.click()
  }

  return (
    <div className="p-10 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        Invoice & Receipt Generator (UGX)
      </h1>

      {/* SWITCH */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setType("invoice")}
          className={`px-4 py-2 rounded ${
            type === "invoice" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Invoice
        </button>

        <button
          onClick={() => setType("receipt")}
          className={`px-4 py-2 rounded ${
            type === "receipt" ? "bg-green-600 text-white" : "bg-gray-200"
          }`}
        >
          Receipt
        </button>
      </div>

      {/* CUSTOMER */}
      <input
        placeholder="Customer Name"
        className="border p-2 w-full mb-6"
        value={customer}
        onChange={(e) => setCustomer(e.target.value)}
      />

      {/* ITEMS */}
      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-4 gap-3 mb-3">

          <input
            placeholder="Item"
            className="border p-2"
            value={item.name}
            onChange={(e) => handleChange(index, "name", e.target.value)}
          />

          <input
            placeholder="Price"
            type="number"
            className="border p-2"
            value={item.price}
            onChange={(e) => handleChange(index, "price", e.target.value)}
          />

          <input
            placeholder="Qty"
            type="number"
            className="border p-2"
            value={item.quantity}
            onChange={(e) => handleChange(index, "quantity", e.target.value)}
          />

          <button
            onClick={() => removeItem(index)}
            className="bg-red-500 text-white rounded"
          >
            X
          </button>
        </div>
      ))}

      <button
        onClick={addItem}
        className="bg-gray-800 text-white px-4 py-2 rounded mb-6"
      >
        + Add Item
      </button>

      <p className="text-xl mb-6 font-semibold">
        Total: UGX {total.toLocaleString()}
      </p>

      <button
        onClick={generateDocument}
        className={`px-6 py-3 rounded w-full text-white ${
          type === "invoice" ? "bg-blue-600" : "bg-green-600"
        }`}
      >
        Download {type === "invoice" ? "Invoice" : "Receipt"}
      </button>

    </div>
  )
}