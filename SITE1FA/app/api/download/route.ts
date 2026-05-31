import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Usa a API do Cobalt para obter o link direto de download
    const cobaltResponse = await fetch("https://api.cobalt.tools/api/json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        url: url,
        vCodec: "h264",
        vQuality: "720",
        aFormat: "mp3",
        filenamePattern: "basic",
        isAudioOnly: false,
        disableMetadata: false,
      }),
    })

    if (!cobaltResponse.ok) {
      // Tenta API alternativa - SaveFrom
      const saveFromUrl = `https://api.saveservall.xyz/api/v1/info?url=${encodeURIComponent(url)}`
      const saveFromResponse = await fetch(saveFromUrl)
      
      if (saveFromResponse.ok) {
        const saveFromData = await saveFromResponse.json()
        if (saveFromData.url) {
          return NextResponse.json({ 
            status: "redirect",
            url: saveFromData.url 
          })
        }
      }

      return NextResponse.json({ 
        error: "Failed to get download link",
        fallback: true 
      }, { status: 500 })
    }

    const data = await cobaltResponse.json()

    if (data.status === "error") {
      return NextResponse.json({ 
        error: data.text || "Download failed",
        fallback: true 
      }, { status: 400 })
    }

    // Cobalt retorna diferentes formatos dependendo do tipo
    if (data.status === "redirect" || data.status === "stream") {
      return NextResponse.json({ 
        status: data.status,
        url: data.url,
        filename: data.filename || "video"
      })
    }

    if (data.status === "picker" && data.picker) {
      // Múltiplas opções (ex: video com áudio separado)
      return NextResponse.json({ 
        status: "picker",
        options: data.picker,
        audio: data.audio
      })
    }

    return NextResponse.json({ 
      error: "Unknown response format",
      fallback: true 
    }, { status: 500 })

  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      fallback: true 
    }, { status: 500 })
  }
}
