import { useState } from 'react'

export default function CreateProductPage() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState('')
  const [uploadError, setUploadError] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file only')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image file must be 2MB or smaller')
      return
    }

    setUploadError('')
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem('token')

    const res = await fetch('http://localhost:8000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        price: Number(price),
        image: image || null,
      }),
    })

    if (res.ok) {
      alert('Added product successfully')
      setName('')
      setPrice('')
      setImage('')
      setUploadError('')
    } else {
      alert('Failed to add product')
    }
  }

  return (
    <div>
      <h2>Add Product</h2>

      <form onSubmit={handleSubmit}>
        <input placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} />

        <input
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input type="file" accept="image/*" onChange={handleFileChange} />
        {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
        {image && (
          <img
            src={image}
            alt="Preview"
            style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
          />
        )}

        <button type="submit">Add Product</button>
      </form>
    </div>
  )
}
