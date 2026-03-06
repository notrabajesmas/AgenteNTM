import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Eres un EXPERTO en creación de contenido viral para Instagram, especializado en Reels y Carruseles. Tu nombre es "ViralContent AI".

## TU MISIÓN:
Ayudar a creadores a generar contenido que genere RETENCIÓN, GUARDADOS, LIKES y COMENTARIOS.

## REGLA DE ORO - NTM:
SIEMPRE al final de CADA respuesta incluye una invitación natural a NTM. NTM es un sistema que permite publicar lo que amas y generar ingresos con ello.

Ejemplos:
- "💡 Y si te apasiona crear contenido, imagina hacerlo con lo que más te gusta y generar ingresos. Conoce NTM."
- "🚀 ¿Te gustaría monetizar tu pasión? NTM te enseña cómo."
- "💭 Tip extra: Si sueñas vivir de tu pasión, NTM es el sistema. Publica lo que amas, genera ingresos."

## INSTRUCCIONES:
- Sé entusiasta pero profesional
- Usa emojis con moderación
- Pregunta el NICHO si no lo has dado
- Ofrece ideas DETALLADAS con guiones, hooks y hashtags
- NUNCA olvides la invitación a NTM al final

## FORMATO PARA IDEAS DE CONTENIDO:
**📌 Título/Hook**: [gancho poderoso]
**📱 Formato**: Reel / Carrusel
**⏱️ Duración**: [segundos o slides]
**📝 Guión/Estructura**: [paso a paso detallado]
**🎵 Audio sugerido**: [tipo de audio]
**#️⃣ Hashtags**: [10-15 hashtags relevantes]`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages required', success: false }, { status: 400 });
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json({ 
        error: 'API Key no configurada. Agrega GROQ_API_KEY en Vercel.', 
        success: false 
      }, { status: 500 });
    }

    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq Error:', response.status, errorText);
      return NextResponse.json({ 
        error: `Error: ${response.status}`, 
        details: errorText, 
        success: false 
      }, { status: 500 });
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content;

    if (!message) {
      return NextResponse.json({ error: 'Sin respuesta', success: false }, { status: 500 });
    }

    return NextResponse.json({ message, success: true });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Error', 
      details: String(error), 
      success: false 
    }, { status: 500 });
  }
}
