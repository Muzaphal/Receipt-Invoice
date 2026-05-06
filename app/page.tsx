// "use client"
// import { useState } from "react"

// export default function Home() {

//   const [customer, setCustomer] = useState("")
//   const [items, setItems] = useState([
//     { name: "", price: "", quantity: 1 }
//   ])

//   // Add new item row
//   const addItem = () => {
//     setItems([...items, { name: "", price: "", quantity: 1 }])
//   }

//   // Remove item
//   const removeItem = (index: number) => {
//     const newItems = items.filter((_, i) => i !== index)
//     setItems(newItems)
//   }

//   // Handle item change
//   const handleChange = (index: number, field: string, value: any) => {
//     const newItems = [...items]
//     newItems[index][field] = value
//     setItems(newItems)
//   }

//   // Calculate total
//   const total = items.reduce((sum, item) => {
//     return sum + (Number(item.price) * Number(item.quantity) || 0)
//   }, 0)

//   const generateInvoice = async () => {

//     const res = await fetch("/api/invoice", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         customer,
//         invoiceNumber: "INV-" + Date.now(),
//         date: new Date().toISOString().split("T")[0],
//         items: items.map(item => ({
//           name: item.name,
//           price: Number(item.price),
//           quantity: Number(item.quantity)
//         }))
//       })
//     })

//     const blob = await res.blob()
//     const url = window.URL.createObjectURL(blob)

//     const a = document.createElement("a")
//     a.href = url
//     a.download = "invoice.pdf"
//     a.click()
//   }

//   return (
//     <div className="p-10 max-w-2xl mx-auto">

//       <h1 className="text-3xl font-bold mb-6">
//         Invoice Generator
//       </h1>

//       {/* Customer */}
//       <input
//         placeholder="Customer Name"
//         className="border p-2 w-full mb-6"
//         onChange={(e)=>setCustomer(e.target.value)}
//       />

//       {/* Items */}
//       {items.map((item, index) => (
//         <div key={index} className="grid grid-cols-4 gap-3 mb-3">

//           <input
//             placeholder="Item"
//             className="border p-2"
//             onChange={(e)=>handleChange(index, "name", e.target.value)}
//           />

//           <input
//             placeholder="Price"
//             type="number"
//             className="border p-2"
//             onChange={(e)=>handleChange(index, "price", e.target.value)}
//           />

//           <input
//             placeholder="Qty"
//             type="number"
//             className="border p-2"
//             value={item.quantity}
//             onChange={(e)=>handleChange(index, "quantity", e.target.value)}
//           />

//           <button
//             onClick={()=>removeItem(index)}
//             className="bg-red-500 text-white rounded"
//           >
//             X
//           </button>
//         </div>
//       ))}

//       {/* Add Item */}
//       <button
//         onClick={addItem}
//         className="bg-gray-800 text-white px-4 py-2 rounded mb-6"
//       >
//         + Add Item
//       </button>

//       {/* Total */}
//       <p className="text-xl mb-6 font-semibold">
//         Total: UGX {total.toLocaleString()}
//       </p>

//       {/* Generate */}
//       <button
//         onClick={generateInvoice}
//         className="bg-blue-600 text-white px-6 py-3 rounded w-full"
//       >
//         Download Invoice
//       </button>

//     </div>
//   )
// }

"use client"
import { useState } from "react"

export default function Home() {

  const [type, setType] = useState<"invoice" | "receipt">("invoice")
  const [customer, setCustomer] = useState("")

  const [items, setItems] = useState([
    { name: "", price: "", quantity: 1 }
  ])

  const addItem = () => {
    setItems([...items, { name: "", price: "", quantity: 1 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleChange = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index][field] = value
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
          className={`px-4 py-2 rounded ${type === "invoice" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Invoice
        </button>

        <button
          onClick={() => setType("receipt")}
          className={`px-4 py-2 rounded ${type === "receipt" ? "bg-green-600 text-white" : "bg-gray-200"}`}
        >
          Receipt
        </button>
      </div>

      {/* CUSTOMER */}
      <input
        placeholder="Customer Name"
        className="border p-2 w-full mb-6"
        onChange={(e)=>setCustomer(e.target.value)}
      />

      {/* ITEMS */}
      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-4 gap-3 mb-3">

          <input
            placeholder="Item"
            className="border p-2"
            onChange={(e)=>handleChange(index, "name", e.target.value)}
          />

          <input
            placeholder="Price"
            type="number"
            className="border p-2"
            onChange={(e)=>handleChange(index, "price", e.target.value)}
          />

          <input
            placeholder="Qty"
            type="number"
            className="border p-2"
            value={item.quantity}
            onChange={(e)=>handleChange(index, "quantity", e.target.value)}
          />

          <button
            onClick={()=>removeItem(index)}
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