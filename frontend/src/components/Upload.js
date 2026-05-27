import React, { useState } from 'react'

function Upload() {
  const [csvDragging, setCsvDragging]     = useState(false)
  const [pdfDragging, setPdfDragging]     = useState(false)
  const [csvUploaded, setCsvUploaded]     = useState(false)
  const [pdfUploaded, setPdfUploaded]     = useState(false)
  const [csvProcessing, setCsvProcessing] = useState(false)
  const [pdfProcessing, setPdfProcessing] = useState(false)
  const [csvResult, setCsvResult]         = useState(null)
  const [pdfResult, setPdfResult]         = useState(null)

  // ── CSV Upload Handler ─────────────────────────────────────
  const handleCSVUpload = async (file) => {
    if (!file) return
    setCsvProcessing(true)
    setCsvUploaded(false)
    setCsvResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:8000/api/upload/csv', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setCsvUploaded(true)
        setCsvResult(data)
      } else {
        alert('Upload failed: ' + data.detail)
      }
    } catch (error) {
      alert('Error connecting to backend. Make sure FastAPI is running on port 8000.')
    } finally {
      setCsvProcessing(false)
    }
  }

  // ── PDF Upload Handler ─────────────────────────────────────
  const handlePDFUpload = async (file) => {
    if (!file) return
    setPdfProcessing(true)
    setPdfUploaded(false)
    setPdfResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:8000/api/upload/invoice', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setPdfUploaded(true)
        setPdfResult(data)
      } else {
        alert('Upload failed: ' + data.detail)
      }
    } catch (error) {
      alert('Error connecting to backend. Make sure FastAPI is running on port 8000.')
    } finally {
      setPdfProcessing(false)
    }
  }

  return (
    <div style={{ padding: '24px', background: '#f3f4f6', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
        borderRadius: '12px', padding: '24px',
        marginBottom: '24px', color: 'white'
      }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '24px' }}>
          📤 Accounting Automation
        </h1>
        <p style={{ margin: 0, opacity: 0.8 }}>
          Upload bank statements or invoices — AI auto-categorizes and saves to dashboard
        </p>
      </div>

      {/* Upload Cards */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>

        {/* ── CSV Upload Card ─────────────────────────────── */}
        <div style={{
          flex: 1, minWidth: '300px',
          background: 'white', borderRadius: '12px',
          padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: csvDragging ? '2px dashed #2563eb' : '2px dashed #e5e7eb',
          transition: 'all 0.2s'
        }}
          onDragOver={e => { e.preventDefault(); setCsvDragging(true) }}
          onDragLeave={() => setCsvDragging(false)}
          onDrop={e => {
            e.preventDefault()
            setCsvDragging(false)
            const file = e.dataTransfer.files[0]
            if (file) handleCSVUpload(file)
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ color: '#1f2937', margin: '0 0 8px 0' }}>
              Bank Statement (CSV)
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 24px 0' }}>
              Upload your bank CSV — AI auto-categorizes transactions using Groq LLaMA 3
            </p>

            {/* CSV Processing State */}
            {csvProcessing && (
              <div style={{
                background: '#dbeafe', border: '1px solid #2563eb',
                borderRadius: '8px', padding: '12px', marginBottom: '16px'
              }}>
                <p style={{ color: '#2563eb', margin: 0, fontWeight: '600' }}>
                  ⏳ Groq AI categorizing transactions...
                </p>
                <p style={{ color: '#2563eb', margin: '4px 0 0 0', fontSize: '12px' }}>
                  This takes 10-20 seconds for large files
                </p>
              </div>
            )}

            {/* CSV Success State — Real Results */}
            {csvUploaded && csvResult && (
              <div style={{
                background: '#dcfce7', border: '1px solid #16a34a',
                borderRadius: '8px', padding: '12px', marginBottom: '16px',
                textAlign: 'left'
              }}>
                <p style={{ color: '#16a34a', margin: '0 0 8px 0', fontWeight: '600' }}>
                  ✅ {csvResult.rows_processed} transactions processed by Groq AI!
                </p>
                <p style={{ color: '#374151', margin: '4px 0', fontSize: '12px' }}>
                  💰 Income: Rs.{(csvResult.income_total / 100000).toFixed(1)}L &nbsp;|&nbsp;
                  📉 Expenses: Rs.{(csvResult.expense_total / 100000).toFixed(1)}L
                </p>
                <p style={{ color: '#374151', margin: '4px 0', fontSize: '12px' }}>
                  📂 Categories: {Object.entries(csvResult.categories)
                    .map(([k, v]) => `${k}(${v})`).join(', ')}
                </p>
                <p style={{ color: '#16a34a', margin: '8px 0 0 0',
                  fontSize: '12px', fontWeight: '600' }}>
                  ⚡ Dashboard updated via Supabase WebSocket!
                </p>
              </div>
            )}

            {/* CSV File Input */}
            <input
              type="file"
              accept=".csv"
              id="csv-input"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files[0]
                if (file) handleCSVUpload(file)
              }}
            />
            <label htmlFor="csv-input" style={{
              display: 'block',
              background: csvProcessing ? '#93c5fd' : '#2563eb',
              color: 'white', borderRadius: '8px',
              padding: '12px 24px',
              cursor: csvProcessing ? 'not-allowed' : 'pointer',
              fontSize: '14px', fontWeight: '600',
              width: '100%', textAlign: 'center',
              boxSizing: 'border-box'
            }}>
              {csvProcessing ? '⏳ Processing...' : '📂 Upload Bank Statement CSV'}
            </label>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: '8px 0 0 0' }}>
              or drag and drop here
            </p>
          </div>
        </div>

        {/* ── PDF Upload Card ─────────────────────────────── */}
        <div style={{
          flex: 1, minWidth: '300px',
          background: 'white', borderRadius: '12px',
          padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: pdfDragging ? '2px dashed #ea580c' : '2px dashed #e5e7eb',
          transition: 'all 0.2s'
        }}
          onDragOver={e => { e.preventDefault(); setPdfDragging(true) }}
          onDragLeave={() => setPdfDragging(false)}
          onDrop={e => {
            e.preventDefault()
            setPdfDragging(false)
            const file = e.dataTransfer.files[0]
            if (file) handlePDFUpload(file)
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧾</div>
            <h3 style={{ color: '#1f2937', margin: '0 0 8px 0' }}>
              Invoice (PDF)
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 24px 0' }}>
              Upload PDF invoices — OCR extracts text, AI parses vendor, GST, amount automatically
            </p>

            {/* PDF Processing State */}
            {pdfProcessing && (
              <div style={{
                background: '#ffedd5', border: '1px solid #ea580c',
                borderRadius: '8px', padding: '12px', marginBottom: '16px'
              }}>
                <p style={{ color: '#ea580c', margin: 0, fontWeight: '600' }}>
                  ⏳ OCR scanning + Groq AI parsing invoice...
                </p>
                <p style={{ color: '#ea580c', margin: '4px 0 0 0', fontSize: '12px' }}>
                  Tesseract extracting text from PDF...
                </p>
              </div>
            )}

            {/* PDF Success State — Real Results */}
            {pdfUploaded && pdfResult && (
              <div style={{
                background: '#dcfce7', border: '1px solid #16a34a',
                borderRadius: '8px', padding: '12px', marginBottom: '16px',
                textAlign: 'left'
              }}>
                <p style={{ color: '#16a34a', margin: '0 0 8px 0', fontWeight: '600' }}>
                  ✅ Invoice parsed successfully by Groq AI!
                </p>
                <p style={{ color: '#374151', margin: '4px 0', fontSize: '13px' }}>
                  🏢 Vendor: {pdfResult.vendor_name}
                </p>
                <p style={{ color: '#374151', margin: '4px 0', fontSize: '13px' }}>
                  🧾 Invoice No: {pdfResult.invoice_no}
                </p>
                <p style={{ color: '#374151', margin: '4px 0', fontSize: '13px' }}>
                  💰 Total: Rs.{pdfResult.total_amount?.toLocaleString('en-IN')}
                </p>
                <p style={{ color: '#374151', margin: '4px 0', fontSize: '13px' }}>
                  📊 GST: Rs.{pdfResult.gst_breakdown?.total_gst?.toLocaleString('en-IN')}
                  {pdfResult.gst_breakdown?.cgst > 0
                    ? ` (CGST: Rs.${pdfResult.gst_breakdown?.cgst?.toLocaleString('en-IN')} + SGST: Rs.${pdfResult.gst_breakdown?.sgst?.toLocaleString('en-IN')})`
                    : ` (IGST: Rs.${pdfResult.gst_breakdown?.igst?.toLocaleString('en-IN')})`
                  }
                </p>
                <p style={{ color: '#374151', margin: '4px 0', fontSize: '13px' }}>
                  🔍 GSTIN: {pdfResult.gstin}
                </p>
                <p style={{ color: '#16a34a', margin: '8px 0 0 0',
                  fontSize: '12px', fontWeight: '600' }}>
                  ⚡ Saved to Supabase — dashboard updated!
                </p>
              </div>
            )}

            {/* PDF File Input */}
            <input
              type="file"
              accept=".pdf"
              id="pdf-input"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files[0]
                if (file) handlePDFUpload(file)
              }}
            />
            <label htmlFor="pdf-input" style={{
              display: 'block',
              background: pdfProcessing ? '#fdba74' : '#ea580c',
              color: 'white', borderRadius: '8px',
              padding: '12px 24px',
              cursor: pdfProcessing ? 'not-allowed' : 'pointer',
              fontSize: '14px', fontWeight: '600',
              width: '100%', textAlign: 'center',
              boxSizing: 'border-box'
            }}>
              {pdfProcessing ? '⏳ Processing...' : '📄 Upload Invoice PDF'}
            </label>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: '8px 0 0 0' }}>
              or drag and drop here
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div style={{
        background: 'white', borderRadius: '12px',
        padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
          ⚡ How AI Automation Works
        </h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { step: '1', title: 'Upload File',
              desc: 'CSV bank statement or PDF invoice', color: '#2563eb' },
            { step: '2', title: 'OCR Extraction',
              desc: 'Tesseract extracts text from PDF', color: '#7c3aed' },
            { step: '3', title: 'AI Parsing',
              desc: 'Groq LLaMA 3 categorizes & structures data', color: '#ea580c' },
            { step: '4', title: 'Live Update',
              desc: 'Dashboard updates via Supabase WebSocket', color: '#16a34a' },
          ].map(item => (
            <div key={item.step} style={{
              flex: 1, minWidth: '180px',
              background: '#f9fafb', borderRadius: '8px',
              padding: '16px', textAlign: 'center',
              borderTop: `3px solid ${item.color}`
            }}>
              <div style={{
                width: '32px', height: '32px',
                background: item.color, borderRadius: '50%',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'white',
                fontWeight: 'bold', margin: '0 auto 12px auto'
              }}>
                {item.step}
              </div>
              <h4 style={{ margin: '0 0 4px 0', color: '#1f2937', fontSize: '14px' }}>
                {item.title}
              </h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Upload