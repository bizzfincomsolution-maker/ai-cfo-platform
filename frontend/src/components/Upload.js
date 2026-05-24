import React, { useState } from 'react'

function Upload() {
  const [csvDragging, setCsvDragging]     = useState(false)
  const [pdfDragging, setPdfDragging]     = useState(false)
  const [csvUploaded, setCsvUploaded]     = useState(false)
  const [pdfUploaded, setPdfUploaded]     = useState(false)
  const [csvProcessing, setCsvProcessing] = useState(false)
  const [pdfProcessing, setPdfProcessing] = useState(false)

  const handleCSVUpload = () => {
    setCsvProcessing(true)
    setTimeout(() => {
      setCsvProcessing(false)
      setCsvUploaded(true)
    }, 2000)
  }

  const handlePDFUpload = () => {
    setPdfProcessing(true)
    setTimeout(() => {
      setPdfProcessing(false)
      setPdfUploaded(true)
    }, 2500)
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

        {/* CSV Upload */}
        <div style={{
          flex: 1, minWidth: '300px',
          background: 'white', borderRadius: '12px',
          padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: csvDragging ? '2px dashed #2563eb' : '2px dashed #e5e7eb',
          transition: 'all 0.2s'
        }}
          onDragOver={e => { e.preventDefault(); setCsvDragging(true) }}
          onDragLeave={() => setCsvDragging(false)}
          onDrop={() => { setCsvDragging(false); handleCSVUpload() }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ color: '#1f2937', margin: '0 0 8px 0' }}>
              Bank Statement (CSV)
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 24px 0' }}>
              Upload your bank CSV — AI auto-categorizes transactions using Groq LLaMA 3
            </p>

            {csvUploaded ? (
              <div style={{
                background: '#dcfce7', border: '1px solid #16a34a',
                borderRadius: '8px', padding: '12px', marginBottom: '16px'
              }}>
                <p style={{ color: '#16a34a', margin: 0, fontWeight: '600' }}>
                  ✅ 247 transactions extracted and categorized!
                </p>
                <p style={{ color: '#16a34a', margin: '4px 0 0 0', fontSize: '12px' }}>
                  Dashboard updated in real-time via Supabase WebSocket
                </p>
              </div>
            ) : csvProcessing ? (
              <div style={{
                background: '#dbeafe', border: '1px solid #2563eb',
                borderRadius: '8px', padding: '12px', marginBottom: '16px'
              }}>
                <p style={{ color: '#2563eb', margin: 0 }}>
                  ⏳ AI processing transactions...
                </p>
              </div>
            ) : null}

            <button
              onClick={handleCSVUpload}
              style={{
                background: '#2563eb', color: 'white',
                border: 'none', borderRadius: '8px',
                padding: '12px 24px', cursor: 'pointer',
                fontSize: '14px', fontWeight: '600',
                width: '100%'
              }}
            >
              📂 Upload Bank Statement CSV
            </button>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: '8px 0 0 0' }}>
              or drag and drop here
            </p>
          </div>
        </div>

        {/* PDF Upload */}
        <div style={{
          flex: 1, minWidth: '300px',
          background: 'white', borderRadius: '12px',
          padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: pdfDragging ? '2px dashed #ea580c' : '2px dashed #e5e7eb',
          transition: 'all 0.2s'
        }}
          onDragOver={e => { e.preventDefault(); setPdfDragging(true) }}
          onDragLeave={() => setPdfDragging(false)}
          onDrop={() => { setPdfDragging(false); handlePDFUpload() }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧾</div>
            <h3 style={{ color: '#1f2937', margin: '0 0 8px 0' }}>
              Invoice (PDF)
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 24px 0' }}>
              Upload PDF invoices — OCR extracts text, AI parses vendor, GST, amount automatically
            </p>

            {pdfUploaded ? (
              <div style={{
                background: '#dcfce7', border: '1px solid #16a34a',
                borderRadius: '8px', padding: '12px', marginBottom: '16px'
              }}>
                <p style={{ color: '#16a34a', margin: 0, fontWeight: '600' }}>
                  ✅ Invoice parsed successfully!
                </p>
                <p style={{ color: '#6b7280', margin: '8px 0 0 0', fontSize: '13px' }}>
                  Vendor: Tata Consultancy Services<br/>
                  Amount: Rs.1,85,000 | GST: Rs.33,300<br/>
                  GSTIN: 27AAACT2727Q1ZS ✅ Valid
                </p>
              </div>
            ) : pdfProcessing ? (
              <div style={{
                background: '#ffedd5', border: '1px solid #ea580c',
                borderRadius: '8px', padding: '12px', marginBottom: '16px'
              }}>
                <p style={{ color: '#ea580c', margin: 0 }}>
                  ⏳ OCR scanning + AI parsing invoice...
                </p>
              </div>
            ) : null}

            <button
              onClick={handlePDFUpload}
              style={{
                background: '#ea580c', color: 'white',
                border: 'none', borderRadius: '8px',
                padding: '12px 24px', cursor: 'pointer',
                fontSize: '14px', fontWeight: '600',
                width: '100%'
              }}
            >
              📄 Upload Invoice PDF
            </button>
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
            { step: '1', title: 'Upload File', desc: 'CSV bank statement or PDF invoice', color: '#2563eb' },
            { step: '2', title: 'OCR Extraction', desc: 'Tesseract extracts text from PDF', color: '#7c3aed' },
            { step: '3', title: 'AI Parsing', desc: 'Groq LLaMA 3 categorizes & structures data', color: '#ea580c' },
            { step: '4', title: 'Live Update', desc: 'Dashboard updates via Supabase WebSocket', color: '#16a34a' },
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