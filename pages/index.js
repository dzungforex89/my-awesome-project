import { useState, useRef } from 'react'

const WEBHOOK_URL = 'https://n8n-TinZ.aipencil.name.vn/webhook-test/68fb8884-93af-4168-9309-3607e8938499'

export default function Home(){
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [response, setResponse] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const inputRef = useRef(null)
  // OCR workflow separate states (uses the same webhook as the upload action)
  const OCR_WF_URL = WEBHOOK_URL // sends to the main webhook by default
  const [ocrFile, setOcrFile] = useState(null)
  const [ocrPreview, setOcrPreview] = useState(null)
  const [ocrDragOver, setOcrDragOver] = useState(false)
  const ocrInputRef = useRef(null)
  const [ocrStatus, setOcrStatus] = useState('')
  const [ocrResult, setOcrResult] = useState(null)
  const [ocrTable, setOcrTable] = useState(null)
  const [ocrDownloadUrl, setOcrDownloadUrl] = useState(null)
  const [ocrDownloadName, setOcrDownloadName] = useState(null)
  // Placeholders for the two trigger-only webhook URLs (replace with your real n8n webhook URLs)
  const TRIGGER_WF_UPPER = 'https://n8n.example.com/webhook/trigger-upper'
  const TRIGGER_WF_LOWER = 'https://n8n.example.com/webhook/trigger-lower'
  const [triggerStatus, setTriggerStatus] = useState('')
  const [triggerResponse, setTriggerResponse] = useState(null)
  const [triggerTable, setTriggerTable] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [downloadName, setDownloadName] = useState(null)

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

  function handleOcrFileSelected(f){
    if(!f) return
    setOcrFile(f)
    setOcrPreview(URL.createObjectURL(f))
    setOcrStatus('')
  }

  function onOcrDrop(e){
    e.preventDefault()
    setOcrDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if(f) handleOcrFileSelected(f)
  }

  function onOcrBrowseClick(){
    ocrInputRef.current?.click()
  }

  async function triggerOCR(){
    if(!ocrFile){
      setOcrStatus('Vui lòng chọn ảnh để OCR.')
      return
    }
    setOcrStatus('Đang gửi cho OCR...')
    setOcrResult(null)
    setOcrTable(null)
    setOcrDownloadUrl(null)
    try{
      const fd = new FormData()
      fd.append('file', ocrFile)
      const res = await fetch(OCR_WF_URL, { method: 'POST', body: fd })
      const ct = (res.headers.get('content-type') || '').toLowerCase()
      const cd = res.headers.get('content-disposition') || ''
      let fname = null
      const m = cd.match(/filename\*=UTF-8''([^;\n]+)/i) || cd.match(/filename="?([^";]+)"?/i)
      if(m) fname = decodeURIComponent(m[1])

      if(ct.includes('application/json')){
        const j = await res.json()
        setOcrResult(JSON.stringify(j, null, 2))
        setOcrStatus(`Hoàn tất OCR (status ${res.status})`)
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
        const blob = await res.blob()
        const urlObj = URL.createObjectURL(blob)
        setOcrDownloadUrl(urlObj)
        setOcrDownloadName(fname || `ocr-result-${Date.now()}`)
        setOcrStatus(`Hoàn tất OCR (status ${res.status}). File sẵn sàng để tải.`)
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
        setTriggerResponse(JSON.stringify(j, null, 2))
        setTriggerStatus(`Hoàn tất (status ${res.status})`)
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
        // assume binary/file
        const blob = await res.blob()
        const urlObj = URL.createObjectURL(blob)
        setDownloadUrl(urlObj)
        setDownloadName(fname || `result-${Date.now()}`)
        setTriggerStatus(`Hoàn tất (status ${res.status}). File sẵn sàng để tải.`)
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
          <h1 className="text-3xl md:text-4xl font-bold">Gửi ảnh hóa đơn — Tham gia cuộc thi</h1>
          <p className="mt-2 text-sm md:text-base">Chọn file ảnh rồi bấm gửi để trigger webhook của n8n và ghi nhận tham gia.</p>
        </div>
      </div>

      {/* Note: main upload moved to the OCR card below. */}
      <div className="card-bg p-6 rounded shadow-sm">
        <p className="text-sm text-gray-600">Upload đã được di chuyển vào phần "Workflow OCR" bên dưới. Dùng phần OCR để gửi ảnh và nhận kết quả.</p>
      </div>

      {/* Trigger-only workflows card */}
      <div className="card-bg p-6 rounded shadow-sm mt-6">
        <h3 className="text-lg font-semibold mb-2">Trigger-only workflows</h3>
        <p className="text-sm text-gray-600 mb-3">Kích hoạt nhanh 2 nhánh workflow (không gửi ảnh từ đây).</p>
        <div className="flex gap-3 mb-3">
          <button type="button" onClick={()=>triggerWorkflow(TRIGGER_WF_UPPER)} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Lines Check Items</button>
          <button type="button" onClick={()=>triggerWorkflow(TRIGGER_WF_LOWER)} className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700">Final Results</button>
          <button type="button" onClick={()=>{setTriggerResponse(null); setTriggerStatus(''); setDownloadUrl(null); setDownloadName(null)}} className="px-3 py-2 border rounded">Clear</button>
        </div>
        <div className="text-sm text-gray-700 mb-2">{triggerStatus}</div>

        {triggerTable && triggerTable.length > 0 && (
          <div className="mt-4 overflow-auto">
            <div className="text-sm font-medium mb-2">CSV Preview:</div>
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {triggerTable[0].map((h, i) => (
                    <th key={i} className="text-left px-3 py-2 border">{h || `col${i+1}`}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {triggerTable.slice(1, 201).map((r, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? '' : 'bg-gray-50'}>
                    {triggerTable[0].map((_, ci) => (
                      <td key={ci} className="px-3 py-2 border">{r[ci] ?? ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {triggerTable.length > 201 && <div className="text-xs text-gray-500 mt-2">Chỉ hiển thị 200 dòng đầu.</div>}
          </div>
        )}

        {triggerResponse && (
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Response:</div>
            <div className="response-box">{triggerResponse}</div>
          </div>
        )}

        {downloadUrl && (
          <div className="mt-3">
            <a className="inline-block bg-green-600 text-white px-4 py-2 rounded" href={downloadUrl} download={downloadName}>Tải file kết quả ({downloadName})</a>
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
          {ocrPreview && <img src={ocrPreview} alt="ocr preview" className="preview-img" />}
        </div>

        <input ref={ocrInputRef} type="file" accept="image/*" className="hidden" onChange={(e)=>handleOcrFileSelected(e.target.files?.[0]||null)} />

        <div className="flex items-center gap-3">
          <button type="button" onClick={triggerOCR} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Trigger OCR</button>
          <button type="button" onClick={()=>{setOcrFile(null); setOcrPreview(null); setOcrResult(null); setOcrTable(null); setOcrStatus('')}} className="px-3 py-2 border rounded">Reset OCR</button>
        </div>

        <div className="mt-3 text-sm text-gray-700">{ocrStatus}</div>

        {ocrTable && ocrTable.length > 0 && (
          <div className="mt-4 overflow-auto">
            <div className="text-sm font-medium mb-2">OCR CSV Preview:</div>
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {ocrTable[0].map((h, i) => (
                    <th key={i} className="text-left px-3 py-2 border">{h || `col${i+1}`}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ocrTable.slice(1, 201).map((r, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? '' : 'bg-gray-50'}>
                    {ocrTable[0].map((_, ci) => (
                      <td key={ci} className="px-3 py-2 border">{r[ci] ?? ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {ocrTable.length > 201 && <div className="text-xs text-gray-500 mt-2">Chỉ hiển thị 200 dòng đầu.</div>}
          </div>
        )}

        {ocrResult && (
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">OCR Result:</div>
            <div className="response-box">{ocrResult}</div>
          </div>
        )}

        {ocrDownloadUrl && (
          <div className="mt-3">
            <a className="inline-block bg-green-600 text-white px-4 py-2 rounded" href={ocrDownloadUrl} download={ocrDownloadName}>Tải kết quả OCR ({ocrDownloadName})</a>
          </div>
        )}
      </div>
    </div>
  )
}
