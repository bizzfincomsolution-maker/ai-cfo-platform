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

  const handleCSVUpload = async (file) => {
    if (!file) return
    setCsvProcessing(true)
    setCsvUploaded(false)
    setCsvResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('http://localhost:8000/api/upload/csv', {
        method: 'POST', body: formData
      })
      const data = await response.json()
      if (data.success) { setCsvUploaded(true); setCsvResult(data) }
      else alert('Upload failed: ' + data.detail)
    } catch { alert('Error connecting to backend.') }
    finally { setCsvProcessing(false) }
  }

  const handlePDFUpload = async (file) => {
    if (!file) return
    setPdfProcessing(true)
    setPdfUploaded(false)
    setPdfResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('http://localhost:8000/api/upload/invoice', {
        method: 'POST', body: formData
      })
      const data = await response.json()
      if (data.success) { setPdfUploaded(true); setPdfResult(data) }
      else alert('Upload failed: ' + data.detail)
    } catch { alert('Error connecting to backend.') }
    finally { setPdfProcessing(false) }
  }

  const steps = [
    { n:'1', title:'Upload File',     desc:'CSV or PDF invoice',              color:'#2563eb' },
    { n:'2', title:'OCR Extraction',  desc:'Tesseract reads PDF text',        color:'#7c3aed' },
    { n:'3', title:'Groq AI Parsing', desc:'LLaMA 3 categorizes & structures', color:'#ea580c' },
    { n:'4', title:'Live Update',     desc:'Supabase WebSocket fires',         color:'#16a34a' },
  ]

  return (
    <div style={{ padding:'24px', background:'#f3f4f6',
      minHeight:'100vh', fontFamily:'Inter, sans-serif',
      animation:'fadeSlideIn 0.35s ease forwards' }}>

      {/* Header */}
      <div style={{
        background:'linear-gradient(135deg, #1e3a5f, #ea580c)',
        borderRadius:'16px', padding:'28px 32px',
        marginBottom:'24px', color:'white',
        boxShadow:'0 8px 32px rgba(234,88,12,0.2)',
        position:'relative', overflow:'hidden'
      }}>
        <div style={{ position:'absolute', top:'-30px', right:'-30px',
          width:'160px', height:'160px', borderRadius:'50%',
          background:'rgba(255,255,255,0.05)' }}/>
        <div style={{ display:'flex', alignItems:'center',
          gap:'12px', marginBottom:'6px' }}>
          <div style={{ width:'40px', height:'40px', borderRadius:'10px',
            background:'rgba(255,255,255,0.15)', display:'flex',
            alignItems:'center', justifyContent:'center', fontSize:'20px' }}>
            📤
          </div>
          <h1 style={{ margin:0, fontSize:'24px', fontWeight:'800',
            letterSpacing:'-0.02em' }}>Accounting Automation</h1>
        </div>
        <p style={{ margin:0, opacity:0.75, fontSize:'14px' }}>
          Upload bank statements or invoices — AI auto-categorizes and updates dashboard live
        </p>
      </div>

      {/* Upload Cards */}
      <div style={{ display:'flex', gap:'20px',
        marginBottom:'20px', flexWrap:'wrap' }}>

        {/* CSV Card */}
        <div style={{
          flex:1, minWidth:'300px', background:'white',
          borderRadius:'16px', padding:'28px',
          boxShadow: csvDragging
            ? '0 0 0 3px #2563eb, 0 8px 24px rgba(37,99,235,0.15)'
            : '0 2px 8px rgba(0,0,0,0.06)',
          border: `2px dashed ${csvDragging ? '#2563eb' : '#e5e7eb'}`,
          transition:'all 0.2s ease',
          transform: csvDragging ? 'scale(1.01)' : 'scale(1)',
        }}
          onDragOver={e => { e.preventDefault(); setCsvDragging(true) }}
          onDragLeave={() => setCsvDragging(false)}
          onDrop={e => { e.preventDefault(); setCsvDragging(false)
            const f = e.dataTransfer.files[0]; if(f) handleCSVUpload(f) }}
        >
          {/* Icon */}
          <div style={{ width:'64px', height:'64px', borderRadius:'16px',
            background:'linear-gradient(135deg, #dbeafe, #eff6ff)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'30px', marginBottom:'16px',
            boxShadow:'0 4px 12px rgba(37,99,235,0.15)' }}>
            📊
          </div>

          <h3 style={{ margin:'0 0 8px 0', fontSize:'17px',
            fontWeight:'700', color:'#111827' }}>
            Bank Statement (CSV)
          </h3>
          <p style={{ color:'#6b7280', fontSize:'13px',
            margin:'0 0 20px 0', lineHeight:'1.6' }}>
            Upload your bank CSV — Groq LLaMA 3 automatically
            categorizes every transaction into 11 financial categories
            and calculates GST amounts.
          </p>

          {/* Tech Pills */}
          <div style={{ display:'flex', gap:'6px',
            flexWrap:'wrap', marginBottom:'20px' }}>
            {['Groq LLaMA 3', 'Auto-categorize', 'Real-time sync'].map(t => (
              <span key={t} style={{
                padding:'3px 10px', borderRadius:'999px',
                background:'#eff6ff', color:'#2563eb',
                fontSize:'11px', fontWeight:'600'
              }}>{t}</span>
            ))}
          </div>

          {/* Processing */}
          {csvProcessing && (
            <div style={{ background:'#eff6ff', border:'1px solid #93c5fd',
              borderRadius:'10px', padding:'12px 14px', marginBottom:'14px',
              display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'16px', height:'16px', borderRadius:'50%',
                border:'2px solid #2563eb', borderTopColor:'transparent',
                animation:'spin 0.8s linear infinite', flexShrink:0 }}/>
              <div>
                <p style={{ margin:0, color:'#1d4ed8', fontWeight:'600',
                  fontSize:'13px' }}>Groq AI processing...</p>
                <p style={{ margin:0, color:'#3b82f6', fontSize:'11px' }}>
                  Categorizing transactions in batches of 20
                </p>
              </div>
            </div>
          )}

          {/* Success */}
          {csvUploaded && csvResult && (
            <div style={{ background:'#f0fdf4', border:'1px solid #86efac',
              borderRadius:'10px', padding:'14px', marginBottom:'14px' }}>
              <p style={{ color:'#16a34a', margin:'0 0 8px 0',
                fontWeight:'700', fontSize:'14px' }}>
                ✅ {csvResult.rows_processed} transactions processed!
              </p>
              <div style={{ display:'flex', gap:'12px',
                flexWrap:'wrap', marginBottom:'6px' }}>
                <span style={{ fontSize:'12px', color:'#374151' }}>
                  💰 Income: <b>Rs.{(csvResult.income_total/100000).toFixed(1)}L</b>
                </span>
                <span style={{ fontSize:'12px', color:'#374151' }}>
                  📉 Expenses: <b>Rs.{(csvResult.expense_total/100000).toFixed(1)}L</b>
                </span>
              </div>
              <p style={{ margin:'4px 0 0 0', fontSize:'11px', color:'#6b7280' }}>
                {Object.entries(csvResult.categories)
                  .slice(0,4).map(([k,v]) => `${k}(${v})`).join(' • ')}
              </p>
              <p style={{ margin:'8px 0 0 0', fontSize:'12px',
                color:'#16a34a', fontWeight:'600' }}>
                ⚡ Dashboard updated via Supabase WebSocket!
              </p>
            </div>
          )}

          {/* Button */}
          <input type="file" accept=".csv" id="csv-input"
            style={{ display:'none' }}
            onChange={e => { const f=e.target.files[0]; if(f) handleCSVUpload(f) }} />
          <label htmlFor="csv-input" style={{
            display:'flex', alignItems:'center', justifyContent:'center',
            gap:'8px', width:'100%', padding:'13px',
            background: csvProcessing
              ? '#93c5fd'
              : 'linear-gradient(135deg, #2563eb, #3b82f6)',
            color:'white', borderRadius:'10px',
            cursor: csvProcessing ? 'not-allowed' : 'pointer',
            fontSize:'14px', fontWeight:'600',
            boxShadow: csvProcessing ? 'none' : '0 4px 12px rgba(37,99,235,0.3)',
            transition:'all 0.2s', boxSizing:'border-box',
            userSelect:'none'
          }}>
            {csvProcessing ? '⏳ Processing...' : '📂 Upload Bank Statement CSV'}
          </label>
          <p style={{ color:'#9ca3af', fontSize:'11px',
            margin:'8px 0 0 0', textAlign:'center' }}>
            or drag & drop your CSV file here
          </p>
        </div>

        {/* PDF Card */}
        <div style={{
          flex:1, minWidth:'300px', background:'white',
          borderRadius:'16px', padding:'28px',
          boxShadow: pdfDragging
            ? '0 0 0 3px #ea580c, 0 8px 24px rgba(234,88,12,0.15)'
            : '0 2px 8px rgba(0,0,0,0.06)',
          border: `2px dashed ${pdfDragging ? '#ea580c' : '#e5e7eb'}`,
          transition:'all 0.2s ease',
          transform: pdfDragging ? 'scale(1.01)' : 'scale(1)',
        }}
          onDragOver={e => { e.preventDefault(); setPdfDragging(true) }}
          onDragLeave={() => setPdfDragging(false)}
          onDrop={e => { e.preventDefault(); setPdfDragging(false)
            const f = e.dataTransfer.files[0]; if(f) handlePDFUpload(f) }}
        >
          {/* Icon */}
          <div style={{ width:'64px', height:'64px', borderRadius:'16px',
            background:'linear-gradient(135deg, #ffedd5, #fff7ed)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'30px', marginBottom:'16px',
            boxShadow:'0 4px 12px rgba(234,88,12,0.15)' }}>
            🧾
          </div>

          <h3 style={{ margin:'0 0 8px 0', fontSize:'17px',
            fontWeight:'700', color:'#111827' }}>
            Invoice (PDF)
          </h3>
          <p style={{ color:'#6b7280', fontSize:'13px',
            margin:'0 0 20px 0', lineHeight:'1.6' }}>
            Upload any PDF invoice — Tesseract OCR extracts the text,
            then Groq AI parses vendor, amount, GSTIN and
            CGST/SGST/IGST breakdown automatically.
          </p>

          {/* Tech Pills */}
          <div style={{ display:'flex', gap:'6px',
            flexWrap:'wrap', marginBottom:'20px' }}>
            {['Tesseract OCR', 'Groq AI Parse', 'GST Entries'].map(t => (
              <span key={t} style={{
                padding:'3px 10px', borderRadius:'999px',
                background:'#fff7ed', color:'#ea580c',
                fontSize:'11px', fontWeight:'600'
              }}>{t}</span>
            ))}
          </div>

          {/* Processing */}
          {pdfProcessing && (
            <div style={{ background:'#fff7ed', border:'1px solid #fdba74',
              borderRadius:'10px', padding:'12px 14px', marginBottom:'14px',
              display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'16px', height:'16px', borderRadius:'50%',
                border:'2px solid #ea580c', borderTopColor:'transparent',
                animation:'spin 0.8s linear infinite', flexShrink:0 }}/>
              <div>
                <p style={{ margin:0, color:'#c2410c', fontWeight:'600',
                  fontSize:'13px' }}>OCR + AI parsing invoice...</p>
                <p style={{ margin:0, color:'#ea580c', fontSize:'11px' }}>
                  Tesseract extracting text from PDF pages
                </p>
              </div>
            </div>
          )}

          {/* Success */}
          {pdfUploaded && pdfResult && (
            <div style={{ background:'#f0fdf4', border:'1px solid #86efac',
              borderRadius:'10px', padding:'14px', marginBottom:'14px' }}>
              <p style={{ color:'#16a34a', margin:'0 0 10px 0',
                fontWeight:'700', fontSize:'14px' }}>
                ✅ Invoice parsed by Groq AI!
              </p>
              {[
                ['🏢 Vendor',   pdfResult.vendor_name],
                ['🧾 Invoice',  pdfResult.invoice_no],
                ['💰 Total',    `Rs.${pdfResult.total_amount?.toLocaleString('en-IN')}`],
                ['📊 GST',      `Rs.${pdfResult.gst_breakdown?.total_gst?.toLocaleString('en-IN')}`],
                ['🔍 GSTIN',    pdfResult.gstin],
              ].map(([label, value]) => (
                <div key={label} style={{ display:'flex', gap:'8px',
                  marginBottom:'4px', fontSize:'12px' }}>
                  <span style={{ color:'#6b7280', minWidth:'80px' }}>{label}</span>
                  <span style={{ color:'#111827', fontWeight:'600' }}>{value}</span>
                </div>
              ))}
              <p style={{ margin:'8px 0 0 0', fontSize:'12px',
                color:'#16a34a', fontWeight:'600' }}>
                ⚡ Saved to Supabase — dashboard updated!
              </p>
            </div>
          )}

          {/* Button */}
          <input type="file" accept=".pdf" id="pdf-input"
            style={{ display:'none' }}
            onChange={e => { const f=e.target.files[0]; if(f) handlePDFUpload(f) }} />
          <label htmlFor="pdf-input" style={{
            display:'flex', alignItems:'center', justifyContent:'center',
            gap:'8px', width:'100%', padding:'13px',
            background: pdfProcessing
              ? '#fdba74'
              : 'linear-gradient(135deg, #ea580c, #f97316)',
            color:'white', borderRadius:'10px',
            cursor: pdfProcessing ? 'not-allowed' : 'pointer',
            fontSize:'14px', fontWeight:'600',
            boxShadow: pdfProcessing ? 'none' : '0 4px 12px rgba(234,88,12,0.3)',
            transition:'all 0.2s', boxSizing:'border-box',
            userSelect:'none'
          }}>
            {pdfProcessing ? '⏳ Processing...' : '📄 Upload Invoice PDF'}
          </label>
          <p style={{ color:'#9ca3af', fontSize:'11px',
            margin:'8px 0 0 0', textAlign:'center' }}>
            or drag & drop your PDF invoice here
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div style={{ background:'white', borderRadius:'16px',
        padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
        <h3 style={{ margin:'0 0 4px 0', fontSize:'15px',
          fontWeight:'600', color:'#111827' }}>
          How AI Automation Works
        </h3>
        <p style={{ margin:'0 0 20px 0', fontSize:'12px', color:'#9ca3af' }}>
          4-step automated pipeline from upload to dashboard
        </p>
        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ flex:1, minWidth:'160px',
              background:'#f9fafb', borderRadius:'12px',
              padding:'16px', position:'relative',
              borderTop:`3px solid ${s.color}` }}>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div style={{ position:'absolute', right:'-7px',
                  top:'50%', transform:'translateY(-50%)',
                  zIndex:1, color:'#d1d5db', fontSize:'16px',
                  display:'none' }}>→</div>
              )}
              <div style={{ width:'36px', height:'36px',
                borderRadius:'10px', background:s.color,
                display:'flex', alignItems:'center',
                justifyContent:'center', color:'white',
                fontWeight:'800', fontSize:'14px',
                marginBottom:'10px',
                boxShadow:`0 4px 8px ${s.color}40` }}>
                {s.n}
              </div>
              <h4 style={{ margin:'0 0 4px 0', color:'#111827',
                fontSize:'13px', fontWeight:'600' }}>
                {s.title}
              </h4>
              <p style={{ margin:0, color:'#9ca3af', fontSize:'12px' }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Upload