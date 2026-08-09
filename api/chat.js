// Edge Runtime — required for true streaming.
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let question;
  try {
    const body = await req.json();
    question = body?.question;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!question || typeof question !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing question' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ↓↓↓ THIS is where the Groq key gets used — read from environment, never hardcoded ↓↓↓
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Server is missing GROQ_API_KEY' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const RESUME_CONTEXT = `
    Name: Archit Prasad
    Role target: AI/ML Engineer, LLM/GenAI Engineer, RAG Engineer
    Education: B.Tech in Computer Science with AI/ML Specialization, Uttarakhand Technical University, 2023-2027
    Relevant coursework: Data Structures, Data Analysis, Machine Learning, Deep Learning
    Location: Delhi, India

    Academic Achievements:
    - Ranked 2nd position in Academics, Semester 4
    - Ranked 2nd position in Academics, Semester 5

    Internships:
    - Artificial Intelligence Trainee at Slog Solutions, June 2024 - July 2024. Worked on developing and maintaining AI-powered features for the company's software products.
    - AI & Data Analytics Intern, July 2025 - August 2025. Developed and deployed a Machine Learning model for prediction of EV charging stations, and a Machine Learning pipeline for data analysis and visualization.

    Skills: Numpy, Pandas, Matplotlib, Seaborn, Scikit-learn, Flask, SQL, MongoDB,
      PostgreSQL, Git, OpenCV, TensorFlow, Keras, PyTorch, Hugging Face, Groq API

    Projects:
    - 3D Immersive Portfolio (this website -- Three.js, glassmorphism design, Groq-powered AI chat assistant)
    - Resume Parser & Job Matcher -- Python system using Groq's LLM API to score and rank resumes against a job description
    - CIFAR-10 Image Classifier -- Custom CNN built in PyTorch, trained on a T4 GPU via Google Colab
    - EV Charging Point Prediction -- Machine learning model to predict optimal locations for EV charging stations

    Contact: prasadarchit02@gmail.com
    GitHub: github.com/archit7py
    LinkedIn: linkedin.com/in/archit-prasad-0379b8352
  `;

  const systemPrompt = `You are a helpful assistant embedded in Archit Prasad's personal portfolio website. 
Answer questions about Archit's skills, projects, education, and experience using ONLY the information below. 
If asked something not covered here, say you don't have that information yet and suggest contacting Archit directly. 
Keep answers concise (2-4 sentences) and friendly.

${RESUME_CONTEXT}`;

  let groqResponse;
  try {
    groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.4,
        max_tokens: 150,
        stream: true,
      }),
    });
  } catch (fetchError) {
    return new Response(JSON.stringify({ error: 'Could not reach AI service' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!groqResponse.ok || !groqResponse.body) {
    const errText = await groqResponse.text().catch(() => '');
    console.error('Groq API error:', errText);
    return new Response(JSON.stringify({ error: 'AI service error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = groqResponse.body.getReader();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;

            const payload = trimmed.slice(5).trim();
            if (payload === '[DONE]') continue;

            try {
              const parsed = JSON.parse(payload);
              const token = parsed?.choices?.[0]?.delta?.content;
              if (token) controller.enqueue(encoder.encode(token));
            } catch {
              // Skip malformed SSE fragments silently
            }
          }
        }
      } catch (streamError) {
        console.error('Stream read error:', streamError);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}