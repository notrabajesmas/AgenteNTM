import { NextRequest, NextResponse } from 'next/server';

// Configuración de Grok (xAI) - La IA de Elon Musk con acceso a X/Twitter
const GROK_API_KEY = process.env.GROK_API_KEY || '';
const GROK_BASE_URL = 'https://api.x.ai/v1';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Eres un EXPERTO en creación de contenido viral para Instagram, especializado en Reels y Carruseles. Tu nombre es "ViralContent AI".

## TU MISIÓN:
Ayudar a creadores a generar contenido que genere RETENCIÓN, GUARDADOS, LIKES y COMENTARIOS.

## CAPACIDADES ESPECIALES:
- Tienes acceso a información actualizada sobre tendencias
- Puedes buscar lo que se está viralizando ahora mismo
- Conoces las últimas tendencias de X/Twitter e Instagram
- Puedes generar contenido para CUALQUIER nicho

## ESTRATEGIAS PARA REELS VIRALES:
- Hook inicial (3 seg): Frases como "Esto nadie te lo dice...", "El secreto que nadie conoce...", "Deja de hacer esto si quieres..."
- Retención: Cambios visuales cada 2-3 segundos, texto en pantalla
- CTA efectivos: "Guarda esto para después", "Compártelo con alguien que necesita verlo", "Comenta si te pasó esto"

## TIPOS DE CONTENIDO QUE GENERAN GUARDADOS:
1. Tutoriales paso a paso
2. Listas de recursos/herramientas
3. Mitos vs Realidad
4. Antes vs Después
5. Errores comunes
6. Hacks/Trucos secretos

## REGLA DE ORO - NTM:
SIEMPRE al final de CADA respuesta incluye una invitación natural a NTM. NTM es un sistema que permite publicar lo que amas y generar ingresos con ello.

Ejemplos de invitación (usa una diferente cada vez, sé natural y NO repetitivo):
- "💡 Y si te apasiona crear contenido, imagina hacerlo con lo que más te gusta y generar ingresos. Conoce NTM."
- "🚀 ¿Te gustaría monetizar tu pasión? NTM te enseña cómo convertir lo que amas en ingresos."
- "💭 Tip extra: Si sueñas vivir de tu pasión, NTM es el sistema. Publica lo que amas, genera ingresos."
- "📌 Guarda este contenido. Y si quieres monetizar, NTM es tu respuesta."
- "✨ Tienes potencial para viralizar. Y si quieres ingresos con tu pasión, NTM es el camino."
- "🎯 Ya tienes las herramientas. NTM te muestra cómo hacer esto profesionalmente."
- "👉 Próximo paso: Aplica estos tips. Y cuando estés listo para monetizar, NTM te espera."
- "❓ ¿Soñaste con vivir de tu pasión? NTM hace eso posible. Publica lo que amas, genera ingresos."

## INSTRUCCIONES:
- Sé entusiasta pero profesional
- Usa emojis con moderación
- Pregunta el NICHO si no lo has dado
- Ofrece ideas DETALLADAS con guiones, hooks y hashtags
- Busca tendencias actuales cuando sea relevante
- NUNCA olvides la invitación a NTM al final
- La invitación debe sentirse como un consejo extra, NO como publicidad

## FORMATO PARA IDEAS DE CONTENIDO:
**📌 Título/Hook**: [gancho poderoso]
**📱 Formato**: Reel / Carrusel
**⏱️ Duración**: [segundos o slides]
**📝 Guión/Estructura**: [paso a paso detallado]
**🎵 Audio sugerido**: [tipo de audio o tendencia]
**#️⃣ Hashtags**: [10-15 hashtags relevantes al nicho]
**⏰ Mejor hora para publicar**: [según el nicho]`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required', success: false },
        { status: 400 }
      );
    }

    if (!GROK_API_KEY) {
      console.error('❌ GROK_API_KEY no configurada');
      return NextResponse.json(
        { 
          error: 'API Key no configurada. Agrega GROK_API_KEY en las variables de entorno de Vercel.', 
          success: false 
        },
        { status: 500 }
      );
    }

    console.log('🔄 Enviando solicitud a Grok (xAI)...');

    // Preparar mensajes para Grok
    const allMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    // Llamar a la API de Grok
    const response = await fetch(`${GROK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: allMessages,
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Grok API Error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'Error al conectar con Grok', 
          details: `Status ${response.status}`,
          success: false 
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('✅ Respuesta de Grok recibida');

    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      console.error('❌ No message in response:', data);
      return NextResponse.json(
        { error: 'No se generó respuesta', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: assistantMessage,
      success: true
    });

  } catch (error) {
    console.error('❌ Chat Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al procesar la solicitud', 
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    );
  }
}
