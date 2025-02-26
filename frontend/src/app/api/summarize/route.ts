// src/app/api/summarize/route.ts
import axios from 'axios'

export async function POST(request: Request) {
  const { messages } = await request.json()

  try {
    console.log(messages,"messages in api")
    const response = await axios.post('http://localhost:8000/summarize', { 
      messages
    })

    return Response.json(response.data)
  } catch (error) {
    return Response.json(
      { error: `Summarization failed ${error}` }, 
      { status: 500 }
    )
  }
}

// .\venv\Scripts\activate.bat
// uvicorn inference:app --reload