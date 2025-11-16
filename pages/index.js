import { useState, useRef } from 'react'

const WEBHOOK_URL = 'https://n8n-TinZ.aipencil.name.vn/webhook-test/ocr_invoices'

export default function Home(){
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [response, setResponse] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const inputRef = useRef(null)
  // OCR workflow separate states (uses the same webhook as the upload action)
  const OCR_WF_URL = WEBHOOK_URL // sends to the main webhook by default
  // allow multiple OCR files
  const [ocrFiles, setOcrFiles] = useState([])
  const [ocrPreviews, setOcrPreviews] = useState([])
  const [ocrDragOver, setOcrDragOver] = useState(false)
  const ocrInputRef = useRef(null)
  const [ocrStatus, setOcrStatus] = useState('')
  const [ocrResult, setOcrResult] = useState(null)
  const [ocrTable, setOcrTable] = useState(null)
  const [ocrDownloadUrl, setOcrDownloadUrl] = useState(null)
  const [ocrDownloadName, setOcrDownloadName] = useState(null)
  // PO/GRN upload states (for nhập liệu webhook)
  const [poFile, setPoFile] = useState(null)
  const [grnFile, setGrnFile] = useState(null)
  const [poPreview, setPoPreview] = useState(null)
  const [grnPreview, setGrnPreview] = useState(null)
  const poInputRef = useRef(null)
  const grnInputRef = useRef(null)
  const [poGrnStatus, setPoGrnStatus] = useState('')
  const [poGrnResponse, setPoGrnResponse] = useState(null)
  const [poGrnDownloadUrl, setPoGrnDownloadUrl] = useState(null)
  const [poGrnDownloadName, setPoGrnDownloadName] = useState(null)
  // Placeholders for the two trigger-only webhook URLs (replace with your real n8n webhook URLs)
  const TRIGGER_WF_UPPER = 'https://n8n-TinZ.aipencil.name.vn/webhook/lines_check'
  const TRIGGER_WF_LOWER = 'https://n8n-TinZ.aipencil.name.vn/webhook-test/final_results'
  const [triggerStatus, setTriggerStatus] = useState('')
  const [triggerResponse, setTriggerResponse] = useState(null)
  const [triggerTable, setTriggerTable] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [downloadName, setDownloadName] = useState(null)
  // Collapse toggle states
  const [showTriggerPreview, setShowTriggerPreview] = useState(true)
  const [showOcrPreview, setShowOcrPreview] = useState(true)
  // Row count display states (5, 10, 15, or all)
  const [triggerRowCount, setTriggerRowCount] = useState(5)
  const [ocrRowCount, setOcrRowCount] = useState(5)

  async function handleSubmit(e){
    e.preventDefault()
    if(!file){
      setStatus('Vui lòng chọn ảnh hóa đơn.')
      return
    }
    setStatus('Đang gửi...')
    setResponse(null)
    try{
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(WEBHOOK_URL, { method: 'POST', body: fd })
      const contentType = res.headers.get('content-type') || ''
      let bodyText = ''
      if(contentType.includes('application/json')){
        const json = await res.json()
        bodyText = JSON.stringify(json, null, 2)
      } else {
        bodyText = await res.text()
      }
      setResponse({ status: res.status, body: bodyText })
      setStatus(`Gửi xong (status ${res.status}).`)
    }catch(err){
      setStatus('Lỗi: ' + err.message)
    }
  }

  function handleFileSelected(f){
    if(!f) return
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setStatus('')
  }

  function onDrop(e){
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if(f) handleFileSelected(f)
  }

  function onBrowseClick(){
    inputRef.current?.click()
  }

  // Add one or more OCR files and create previews
  function addOcrFiles(files){
    if(!files || files.length === 0) return
    const arr = Array.from(files)
    const urls = arr.map(f => URL.createObjectURL(f))
    setOcrFiles(prev => [...prev, ...arr])
    setOcrPreviews(prev => [...prev, ...urls])
    setOcrStatus('')
  }

  function onOcrDrop(e){
    e.preventDefault()
    setOcrDragOver(false)
    const files = e.dataTransfer.files
    if(files && files.length) addOcrFiles(files)
  }

  function onOcrBrowseClick(){
    ocrInputRef.current?.click()
  }

  // PO/GRN helpers
  async function handlePoSelected(f){
    if(!f) return
    setPoFile(f)
    try{
      const txt = await f.text()
      const lines = txt.split(/\r?\n/).slice(0,6).join('\n')
      setPoPreview(lines)
    }catch(e){
      setPoPreview(null)
    }
  }
  async function handleGrnSelected(f){
    if(!f) return
    setGrnFile(f)
    try{
      const txt = await f.text()
      const lines = txt.split(/\r?\n/).slice(0,6).join('\n')
      setGrnPreview(lines)
    }catch(e){
      setGrnPreview(null)
    }
  }

  function onPoBrowseClick(){ poInputRef.current?.click() }
  function onGrnBrowseClick(){ grnInputRef.current?.click() }

  // Send both files to the nhập liệu webhook
  async function sendPoGrn(){
    if(!poFile || !grnFile){
      setPoGrnStatus('Vui lòng chọn cả 2 file: po.csv và grn.csv')
      return
    }
    setPoGrnStatus('Đang gửi...')
    setPoGrnResponse(null)
    setPoGrnDownloadUrl(null)
    try{
      const fd = new FormData()
      fd.append('po', poFile)
      fd.append('grn', grnFile)
      const res = await fetch('https://n8n-TinZ.aipencil.name.vn/webhook-test/nhap_lieu', { method: 'POST', body: fd })
      const ct = (res.headers.get('content-type') || '').toLowerCase()
      const cd = res.headers.get('content-disposition') || ''
      let fname = null
      const m = cd.match(/filename\*=UTF-8''([^;\n]+)/i) || cd.match(/filename="?([^";]+)"?/i)
      if(m) fname = decodeURIComponent(m[1])

      if(ct.includes('application/json')){
        const j = await res.json()
        setPoGrnResponse(JSON.stringify(j, null, 2))
        setPoGrnStatus(`Hoàn tất (status ${res.status}) - JSON`)
      } else if(ct.includes('csv') || ct.includes('text/csv')){
        const t = await res.text()
        setPoGrnResponse(t)
        setPoGrnStatus(`Hoàn tất (status ${res.status}) - CSV`)
      } else if(ct.startsWith('text/') || ct === ''){
        const t = await res.text()
        setPoGrnResponse(t)
        setPoGrnStatus(`Hoàn tất (status ${res.status})`)
      } else {
        // binary/file response
        const blob = await res.blob()
        const urlObj = URL.createObjectURL(blob)
        setPoGrnDownloadUrl(urlObj)
        setPoGrnDownloadName(fname || `nhaplieu-result-${Date.now()}`)
        setPoGrnStatus(`Hoàn tất (status ${res.status}). File sẵn sàng để tải.`)
      }
    }catch(err){
      setPoGrnStatus('Lỗi: ' + err.message)
    }
  }

  async function triggerOCR(){
    if(!ocrFiles || ocrFiles.length === 0){
      setOcrStatus('Vui lòng chọn ảnh để OCR.')
      return
    }
    setOcrStatus('Đang gửi cho OCR...')
    setOcrResult(null)
    setOcrTable(null)
    setOcrDownloadUrl(null)
    try{
      const fd = new FormData()
      // append multiple files (if any) as files[]
      for(const f of ocrFiles){
        fd.append('files[]', f)
      }
      const res = await fetch(OCR_WF_URL, { method: 'POST', body: fd })
      const ct = (res.headers.get('content-type') || '').toLowerCase()
      const cd = res.headers.get('content-disposition') || ''
      let fname = null
      const m = cd.match(/filename\*=UTF-8''([^;\n]+)/i) || cd.match(/filename="?([^";]+)"?/i)
      if(m) fname = decodeURIComponent(m[1])

      if(ct.includes('application/json')){
        const j = await res.json()
        // Extract n8n binary and parse XLSX
        const bin = extractN8nBinary(j)
        if(bin && bin.base64){
          try{
            const raw = bin.base64.replace(/\s+/g,'')
            const idx = raw.indexOf('base64,')
            const b64 = idx !== -1 ? raw.slice(idx + 7) : raw
            const binaryString = atob(b64)
            const len = binaryString.length
            const bytes = new Uint8Array(len)
            for(let i=0;i<len;i++) bytes[i] = binaryString.charCodeAt(i)
            const arrayBuffer = bytes.buffer
            const XLSX = await import('xlsx')
            const wb = XLSX.read(arrayBuffer, { type: 'array' })
            const firstSheetName = wb.SheetNames[0]
            const sheet = wb.Sheets[firstSheetName]
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })
            setOcrTable(data)
            setOcrStatus(`Hoàn tất OCR (status ${res.status}) - XLSX`)
            const urlObj = URL.createObjectURL(new Blob([arrayBuffer]))
            setOcrDownloadUrl(urlObj)
            setOcrDownloadName(bin.fileName || `ocr-result-${Date.now()}.xlsx`)
          }catch(e){
            setOcrStatus(`Lỗi parse XLSX: ${e.message}`)
          }
        } else {
          setOcrResult(JSON.stringify(j, null, 2))
          setOcrStatus(`Hoàn tất OCR (status ${res.status}) - JSON`)
        }
      } else if(ct.includes('csv') || ct.includes('text/csv')){
        const t = await res.text()
        const table = parseCSV(t)
        setOcrTable(table)
        setOcrStatus(`Hoàn tất OCR (status ${res.status}) - CSV`)
      } else if(ct.startsWith('text/') || ct === ''){
        const t = await res.text()
        // try parse as csv if applicable
        if(t.indexOf(',') !== -1 && (t.indexOf('\n') !== -1 || t.indexOf('\r') !== -1)){
          const table = parseCSV(t)
          setOcrTable(table)
          setOcrStatus(`Hoàn tất OCR (status ${res.status}) - parsed as CSV`)
        } else {
          setOcrResult(t)
          setOcrStatus(`Hoàn tất OCR (status ${res.status})`)
        }
      } else {
        // binary/file response - try to handle Excel (.xlsx) specially
        const blob = await res.blob()
        const isXlsx = ct.includes('spreadsheet') || (fname && fname.toLowerCase().endsWith('.xlsx')) || cd.toLowerCase().includes('xlsx')
        if(isXlsx){
          try{
            const arrayBuffer = await blob.arrayBuffer()
            const XLSX = await import('xlsx')
            const wb = XLSX.read(arrayBuffer, { type: 'array' })
            const firstSheetName = wb.SheetNames[0]
            const sheet = wb.Sheets[firstSheetName]
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })
            setOcrTable(data)
            setOcrStatus(`Hoàn tất OCR (status ${res.status}) - XLSX parsed`)
            // also provide download
            const urlObj = URL.createObjectURL(new Blob([arrayBuffer]))
            setOcrDownloadUrl(urlObj)
            setOcrDownloadName(fname || `ocr-result-${Date.now()}.xlsx`)
          }catch(parseErr){
            const urlObj = URL.createObjectURL(blob)
            setOcrDownloadUrl(urlObj)
            setOcrDownloadName(fname || `ocr-result-${Date.now()}`)
            setOcrStatus(`Hoàn tất OCR (status ${res.status}). (Could not parse XLSX)`) 
          }
        } else {
          const urlObj = URL.createObjectURL(blob)
          setOcrDownloadUrl(urlObj)
          setOcrDownloadName(fname || `ocr-result-${Date.now()}`)
          setOcrStatus(`Hoàn tất OCR (status ${res.status}). File sẵn sàng để tải.`)
        }
      }
    }catch(err){
      setOcrStatus('Lỗi OCR: ' + err.message)
    }
  }

  // Basic CSV parser that handles quoted fields and commas inside quotes
  function parseCSV(text){
    const rows = []
    let cur = ''
    let row = []
    let inQuotes = false
    for(let i=0;i<text.length;i++){
      const ch = text[i]
      if(ch === '"'){
        if(inQuotes && text[i+1] === '"'){
          // escaped quote
          cur += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if(ch === ',' && !inQuotes){
        row.push(cur)
        cur = ''
      } else if((ch === '\n' || ch === '\r') && !inQuotes){
        // handle CRLF or LF
        row.push(cur)
        cur = ''
        // push row if not empty row (to avoid stray empties)
        rows.push(row)
        row = []
        // skip following LF if present
        if(ch === '\r' && text[i+1] === '\n') i++
      } else {
        cur += ch
      }
    }
    // push last
    if(cur !== '' || row.length > 0){
      row.push(cur)
      rows.push(row)
    }
    return rows
  }

  // Extract n8n-style binary from JSON response (items array or single object with binary field)
  function extractN8nBinary(obj){
    if(!obj) return null
    // If it's an array (n8n returns [{ binary: {...} }]), check each item
    if(Array.isArray(obj)){
      for(const it of obj){
        const r = extractN8nBinary(it)
        if(r) return r
      }
    } else if(typeof obj === 'object'){
      // If object has 'binary' field
      if(obj.binary && typeof obj.binary === 'object'){
        for(const key of Object.keys(obj.binary)){
          const bin = obj.binary[key]
          if(bin && typeof bin === 'object' && typeof bin.data === 'string' && bin.data.length > 100){
            // n8n binary shape: { data: '<base64>', fileName: '...', mimeType: '...'}
            return { base64: bin.data, fileName: bin.fileName || `${key}.xlsx`, mimeType: bin.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
          }
        }
      }
      // recurse into nested objects
      for(const k of Object.keys(obj)){
        const r = extractN8nBinary(obj[k])
        if(r) return r
      }
    }
    return null
  }

  // Trigger-only workflow: POST to webhook and handle file/JSON/text response
  async function triggerWorkflow(url){
    setTriggerStatus('Kích hoạt...')
    setTriggerResponse(null)
    setTriggerTable(null)
    setDownloadUrl(null)
    setDownloadName(null)
    try{
      const res = await fetch(url, { method: 'POST' })
      const ct = (res.headers.get('content-type') || '').toLowerCase()
      // try to extract filename from Content-Disposition
      const cd = res.headers.get('content-disposition') || ''
      let fname = null
      const m = cd.match(/filename\*=UTF-8''([^;\n]+)/i) || cd.match(/filename=\"?([^\";]+)\"?/i)
      if(m) fname = decodeURIComponent(m[1])

      if(ct.includes('application/json')){
        const j = await res.json()
        // Extract n8n binary and parse XLSX
        const n8nBin = extractN8nBinary(j)
        if(n8nBin && n8nBin.base64){
          try{
            const raw = n8nBin.base64.replace(/\s+/g,'')
            const idx = raw.indexOf('base64,')
            const b64 = idx !== -1 ? raw.slice(idx + 7) : raw
            const binaryString = atob(b64)
            const len = binaryString.length
            const bytes = new Uint8Array(len)
            for(let i=0;i<len;i++) bytes[i] = binaryString.charCodeAt(i)
            const arrayBuffer = bytes.buffer
            const XLSX = await import('xlsx')
            const wb = XLSX.read(arrayBuffer, { type: 'array' })
            const firstSheetName = wb.SheetNames[0]
            const sheet = wb.Sheets[firstSheetName]
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })
            setTriggerTable(data)
            setTriggerStatus(`Hoàn tất (status ${res.status}) - XLSX`)
            const urlObj = URL.createObjectURL(new Blob([arrayBuffer]))
            setDownloadUrl(urlObj)
            setDownloadName(n8nBin.fileName || `result-${Date.now()}.xlsx`)
          }catch(e){
            setTriggerStatus(`Lỗi parse XLSX: ${e.message}`)
          }
        } else {
          setTriggerResponse(JSON.stringify(j, null, 2))
          setTriggerStatus(`Hoàn tất (status ${res.status}) - JSON`)
        }
      } else if(ct.includes('csv') || ct.includes('text/csv')){
        const t = await res.text()
        const table = parseCSV(t)
        setTriggerTable(table)
        setTriggerStatus(`Hoàn tất (status ${res.status}) - CSV`)
      } else if(ct.startsWith('text/') || ct === ''){
        const t = await res.text()
        // if looks like CSV (contains commas and newlines) try parse
        if(t.indexOf(',') !== -1 && (t.indexOf('\n') !== -1 || t.indexOf('\r') !== -1)){
          const table = parseCSV(t)
          setTriggerTable(table)
          setTriggerStatus(`Hoàn tất (status ${res.status}) - parsed as CSV`)
        } else {
          setTriggerResponse(t)
          setTriggerStatus(`Hoàn tất (status ${res.status})`)
        }
      } else {
        // assume binary/file - try to parse XLSX into table preview
        const blob = await res.blob()
        const isXlsx = ct.includes('spreadsheet') || (fname && fname.toLowerCase().endsWith('.xlsx')) || cd.toLowerCase().includes('xlsx')
        if(isXlsx){
          try{
            const arrayBuffer = await blob.arrayBuffer()
            const XLSX = await import('xlsx')
            const wb = XLSX.read(arrayBuffer, { type: 'array' })
            const firstSheetName = wb.SheetNames[0]
            const sheet = wb.Sheets[firstSheetName]
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })
            setTriggerTable(data)
            setTriggerStatus(`Hoàn tất (status ${res.status}) - XLSX parsed`)
            const urlObj = URL.createObjectURL(new Blob([arrayBuffer]))
            setDownloadUrl(urlObj)
            setDownloadName(fname || `result-${Date.now()}.xlsx`)
          }catch(parseErr){
            const urlObj = URL.createObjectURL(blob)
            setDownloadUrl(urlObj)
            setDownloadName(fname || `result-${Date.now()}`)
            setTriggerStatus(`Hoàn tất (status ${res.status}). (Could not parse XLSX)`)
          }
        } else {
          const urlObj = URL.createObjectURL(blob)
          setDownloadUrl(urlObj)
          setDownloadName(fname || `result-${Date.now()}`)
          setTriggerStatus(`Hoàn tất (status ${res.status}). File sẵn sàng để tải.`)
        }
      }
    }catch(err){
      setTriggerStatus('Lỗi: ' + err.message)
    }
  }

  const heroImage = "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=1400&q=80"

  return (
    <div>
      <div className="hero mb-6" style={{backgroundImage: `url('${heroImage}')`}}>
        <div className="hero-content container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold">Nhập ảnh hóa đơn</h1>
          <p className="mt-2 text-sm md:text-base">Chọn file ảnh rồi bấm gửi để trigger webhook.</p>
        </div>
      </div>

      {/* Note: main upload moved to the OCR card below. */}
      <div className="card-bg p-6 rounded shadow-sm">
        <p className="text-sm text-gray-600">Upload đã được di chuyển vào phần "Workflow OCR" bên dưới. Dùng phần OCR để gửi ảnh và nhận kết quả.</p>
      </div>

      {/* Trigger-only workflows card */}
      {/* PO + GRN upload (nhập liệu) */}
      <div className="card-bg p-6 rounded shadow-sm mt-6">
        <h3 className="text-lg font-semibold mb-2">Nhập liệu (PO + GRN)</h3>
        <p className="text-sm text-gray-600 mb-3">Tải lên 2 file CSV: `po.csv` và `grn.csv` rồi gửi tới webhook nhập liệu.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <div className={`dropzone ${poFile? 'border-green-400' : ''}`} onClick={onPoBrowseClick} role="button">
              <div className="dz-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v-8" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Chọn `po.csv`</div>
                <div className="text-xs text-gray-600">Click để chọn file CSV</div>
              </div>
            </div>
            <input ref={poInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e)=>handlePoSelected(e.target.files?.[0]||null)} />
            {poFile && <div className="mt-2 text-sm">Chọn: <strong>{poFile.name}</strong></div>}
            {poPreview && <div className="response-box text-xs mt-2 max-h-36 overflow-auto">{poPreview}</div>}
          </div>

          <div>
            <div className={`dropzone ${grnFile? 'border-green-400' : ''}`} onClick={onGrnBrowseClick} role="button">
              <div className="dz-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v-8" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Chọn `grn.csv`</div>
                <div className="text-xs text-gray-600">Click để chọn file CSV</div>
              </div>
            </div>
            <input ref={grnInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e)=>handleGrnSelected(e.target.files?.[0]||null)} />
            {grnFile && <div className="mt-2 text-sm">Chọn: <strong>{grnFile.name}</strong></div>}
            {grnPreview && <div className="response-box text-xs mt-2 max-h-36 overflow-auto">{grnPreview}</div>}
          </div>
        </div>

        <div className="flex gap-3 mb-3">
          <button type="button" onClick={sendPoGrn} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Gửi nhập liệu</button>
          <button type="button" onClick={()=>{ setPoFile(null); setGrnFile(null); setPoPreview(null); setGrnPreview(null); setPoGrnResponse(null); setPoGrnStatus('') }} className="px-3 py-2 border rounded">Clear</button>
        </div>

        <div className="text-sm text-gray-700 mb-2">{poGrnStatus}</div>
        {poGrnResponse && (
          <div className="mt-3">
            <div className="text-sm font-medium mb-2">Response:</div>
            <div className="response-box text-xs max-h-48 overflow-auto">{poGrnResponse}</div>
          </div>
        )}
        {poGrnDownloadUrl && (
          <div className="mt-3">
            <a className="inline-block bg-green-600 text-white px-3 py-1 rounded text-sm" href={poGrnDownloadUrl} download={poGrnDownloadName}>Tải ({poGrnDownloadName})</a>
          </div>
        )}
      </div>
      <div className="card-bg p-6 rounded shadow-sm mt-6">
        <h3 className="text-lg font-semibold mb-2">Trigger-only workflows</h3>
        <p className="text-sm text-gray-600 mb-3">Kích hoạt nhanh 2 nhánh workflow (không gửi ảnh từ đây).</p>
        <div className="flex gap-3 mb-3">
          <button type="button" onClick={()=>triggerWorkflow(TRIGGER_WF_UPPER)} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Final Results</button>
          <button type="button" onClick={()=>triggerWorkflow(TRIGGER_WF_LOWER)} className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700">Lines Check Item</button>
          <button type="button" onClick={()=>{setTriggerResponse(null); setTriggerStatus(''); setDownloadUrl(null); setDownloadName(null); setTriggerTable(null); setShowTriggerPreview(true); setTriggerRowCount(5)}} className="px-3 py-2 border rounded">Clear</button>
        </div>
        <div className="text-sm text-gray-700 mb-2">{triggerStatus}</div>

        {(triggerTable || triggerResponse || downloadUrl) && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <button type="button" onClick={()=>setShowTriggerPreview(!showTriggerPreview)} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <span>{showTriggerPreview ? '▼' : '▶'}</span>
                {showTriggerPreview ? 'Ẩn' : 'Hiển thị'} kết quả
              </button>
              {downloadUrl && (
                <a className="inline-block bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700" href={downloadUrl} download={downloadName}>Tải ({downloadName})</a>
              )}
            </div>
            {showTriggerPreview && (
              <div>
                {triggerTable && triggerTable.length > 0 && (
                  <div className="mt-3 overflow-auto">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">Kết quả XLSX:</div>
                      <div className="flex gap-2">
                        {[5, 10, 15, 'all'].map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => setTriggerRowCount(count)}
                            className={`text-xs px-2 py-1 rounded ${triggerRowCount === count ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                          >
                            {count}
                          </button>
                        ))}
                      </div>
                    </div>
                    <table className="min-w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          {triggerTable[0].map((h, i) => (
                            <th key={i} className="text-left px-2 py-1 border">{h || `col${i+1}`}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(triggerRowCount === 'all' ? triggerTable.slice(1) : triggerTable.slice(1, triggerRowCount + 1)).map((r, ri) => (
                          <tr key={ri} className={ri % 2 === 0 ? '' : 'bg-gray-50'}>
                            {triggerTable[0].map((_, ci) => (
                              <td key={ci} className="px-2 py-1 border text-xs">{r[ci] ?? ''}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {triggerRowCount !== 'all' && triggerTable.length > triggerRowCount + 1 && <div className="text-xs text-gray-500 mt-1">Chỉ hiển thị {triggerRowCount} dòng đầu.</div>}
                  </div>
                )}

                {triggerResponse && (
                  <div className="mt-3">
                    <div className="text-sm font-medium mb-2">JSON:</div>
                    <div className="response-box text-xs max-h-48 overflow-auto">{triggerResponse}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <div className="mt-4 text-xs text-gray-500">Lưu ý: Phiên bản này chỉ phục vụ mục đích riêng của tác giả.</div>
      </div>

      {/* OCR workflow card (separate) */}
      <div className="card-bg p-6 rounded shadow-sm mt-6">
        <h3 className="text-lg font-semibold mb-2">Workflow OCR (separate)</h3>
        <p className="text-sm text-gray-600 mb-3">Tải ảnh lên khu vực OCR riêng và kích hoạt workflow OCR để nhận kết quả (text/CSV/file).</p>

        <div className={`dropzone mb-4 ${ocrDragOver? 'dragover' : ''}`}
             onDragOver={(e)=>{e.preventDefault(); setOcrDragOver(true)}}
             onDragLeave={()=>setOcrDragOver(false)}
             onDrop={onOcrDrop}
             onClick={onOcrBrowseClick}
             role="button"
             tabIndex={0}
        >
          <div className="dz-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium">Drop image for OCR here</div>
            <div className="text-xs text-gray-600">Click to browse or drop image. OCR will run on the selected image.</div>
          </div>
          {ocrPreviews && ocrPreviews.length > 0 && (
            <div className="flex gap-2">
              {ocrPreviews.map((p, idx) => (
                <img key={idx} src={p} alt={`ocr preview ${idx+1}`} className="preview-img" />
              ))}
            </div>
          )}
        </div>

  <input ref={ocrInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e)=>addOcrFiles(e.target.files)} />

        <div className="flex items-center gap-3">
          <button type="button" onClick={triggerOCR} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Trigger OCR</button>
          <button type="button" onClick={()=>{
            // revoke preview URLs
            ocrPreviews.forEach(u=>{ try{ URL.revokeObjectURL(u) }catch(e){}
            })
            setOcrFiles([]); setOcrPreviews([]); setOcrResult(null); setOcrTable(null); setOcrStatus('')
          }} className="px-3 py-2 border rounded">Reset OCR</button>
        </div>

        <div className="mt-3 text-sm text-gray-700">{ocrStatus}</div>

        {(ocrTable || ocrResult || ocrDownloadUrl) && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <button type="button" onClick={()=>setShowOcrPreview(!showOcrPreview)} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <span>{showOcrPreview ? '▼' : '▶'}</span>
                {showOcrPreview ? 'Ẩn' : 'Hiển thị'} kết quả
              </button>
              {ocrDownloadUrl && (
                <a className="inline-block bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700" href={ocrDownloadUrl} download={ocrDownloadName}>Tải ({ocrDownloadName})</a>
              )}
            </div>
            {showOcrPreview && (
              <div>
                {ocrTable && ocrTable.length > 0 && (
                  <div className="mt-3 overflow-auto">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">Kết quả XLSX:</div>
                      <div className="flex gap-2">
                        {[5, 10, 15, 'all'].map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => setOcrRowCount(count)}
                            className={`text-xs px-2 py-1 rounded ${ocrRowCount === count ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                          >
                            {count}
                          </button>
                        ))}
                      </div>
                    </div>
                    <table className="min-w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          {ocrTable[0].map((h, i) => (
                            <th key={i} className="text-left px-2 py-1 border">{h || `col${i+1}`}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(ocrRowCount === 'all' ? ocrTable.slice(1) : ocrTable.slice(1, ocrRowCount + 1)).map((r, ri) => (
                          <tr key={ri} className={ri % 2 === 0 ? '' : 'bg-gray-50'}>
                            {ocrTable[0].map((_, ci) => (
                              <td key={ci} className="px-2 py-1 border text-xs">{r[ci] ?? ''}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {ocrRowCount !== 'all' && ocrTable.length > ocrRowCount + 1 && <div className="text-xs text-gray-500 mt-1">Chỉ hiển thị {ocrRowCount} dòng đầu.</div>}
                  </div>
                )}

                {ocrResult && (
                  <div className="mt-3">
                    <div className="text-sm font-medium mb-2">Text/JSON:</div>
                    <div className="response-box text-xs max-h-48 overflow-auto">{ocrResult}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
