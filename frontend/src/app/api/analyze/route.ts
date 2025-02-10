// src/app/api/summarize/route.ts
import axios from 'axios'

export async function POST(request: Request) {
  const { tasks } = await request.json()

  try {
    console.log(tasks,"tasks in api")
    const response = await axios.post('http://localhost:8000/analyze', { 
      tasks
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return Response.json(response.data)
  } catch (error) {
    return Response.json(
      { error: 'Analyze failed' }, 
      { status: 500 }
    )
  }
}

// .\venv\Scripts\activate.bat
// uvicorn inference:app --reload