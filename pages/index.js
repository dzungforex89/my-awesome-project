import { useState, useRef } from 'react'

const WEBHOOK_URL = 'https://n8n-TinZ.aipencil.name.vn/webhook-test/68fb8884-93af-4168-9309-3607e8938499'

export default function Home(){
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [response, setResponse] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const inputRef = useRef(null)

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

  const heroImage = "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=1400&q=80"

  return (
    <div>
      <div className="hero mb-6" style={{backgroundImage: `url('${heroImage}')`}}>
        <div className="hero-content container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold">Gửi ảnh hóa đơn — Tham gia cuộc thi</h1>
          <p className="mt-2 text-sm md:text-base">Chọn file ảnh rồi bấm gửi để trigger webhook của n8n và ghi nhận tham gia.</p>
        </div>
      </div>

      <div className="card-bg p-6 rounded shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className={`dropzone mb-4 ${dragOver? 'dragover' : ''}`}
               onDragOver={(e)=>{e.preventDefault(); setDragOver(true)}}
               onDragLeave={()=>setDragOver(false)}
               onDrop={onDrop}
               onClick={onBrowseClick}
               role="button"
               tabIndex={0}
          >
            <div className="dz-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h6l4 4v5a4 4 0 01-4 4H7z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">Drag and drop files here</div>
              <div className="text-xs text-gray-600">Limit 200MB per file • Image formats</div>
            </div>
            {previewUrl && <img src={previewUrl} alt="preview" className="preview-img" />}
          </div>

          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e)=>handleFileSelected(e.target.files?.[0]||null)} />

          <div className="flex items-center space-x-3">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Gửi</button>
            <button type="button" onClick={()=>{setFile(null); setStatus(''); setResponse(null); setPreviewUrl(null)}} className="px-3 py-2 border rounded">Reset</button>
          </div>

          <div className="mt-4 text-sm text-gray-700">{status}</div>

          {response && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Webhook response (status {response.status}):</div>
              <div className="response-box">{response.body}</div>
            </div>
          )}

        </form>
      </div>
    </div>
  )
}
