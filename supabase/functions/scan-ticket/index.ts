/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TicketData {
  expense_type: 'fuel' | 'toll' | 'parking' | 'other';
  amount: number;
  description?: string;
  confidence: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Strip data URL prefix if present to get raw base64
    const base64Data = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    const mimeType = imageBase64.startsWith('data:image/png')
      ? 'image/png'
      : 'image/jpeg';

    console.log('Processing ticket image with Gemini...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Eres un experto en análisis de tickets y recibos de gastos profesionales de conductores en España.

Analiza esta imagen de ticket/recibo y clasifícalo.

Categorías disponibles:
- "fuel" = Gasoil, gasolina, combustible, estación de servicio (Repsol, Cepsa, BP, Shell, etc.)
- "toll" = Peaje, autopista, via-T, telepeaje
- "parking" = Parking, aparcamiento, estacionamiento
- "other" = Otros gastos (comida, material, etc.)

Extrae:
- expense_type: La categoría del gasto (fuel, toll, parking, other)
- amount: El importe total en euros (solo número, sin €)
- description: Descripción breve del establecimiento o concepto (máx 30 caracteres)
- confidence: Tu nivel de confianza de 0 a 100

IMPORTANTE:
- Si ves "gasoil", "diesel", "gasolina", "combustible", estación de servicio -> "fuel"
- Si ves "peaje", "autopista", "via-T" -> "toll"
- Si ves "parking", "aparcamiento", "estacionamiento" -> "parking"
- El importe suele estar etiquetado como "TOTAL", "IMPORTE", "A PAGAR"

Responde ÚNICAMENTE con un JSON válido. Sin explicaciones, sin markdown, sin backticks.
Ejemplo: {"expense_type":"fuel","amount":85.50,"description":"Repsol A-7 km 340","confidence":95}`
              },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Demasiadas solicitudes. Inténtalo de nuevo en unos segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Error processing image with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log('Gemini Response:', content);

    let ticketData: TicketData = {
      expense_type: 'other',
      amount: 0,
      confidence: 0,
    };

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        ticketData = {
          expense_type: ['fuel', 'toll', 'parking', 'other'].includes(parsed.expense_type)
            ? parsed.expense_type
            : 'other',
          amount: typeof parsed.amount === 'number' ? parsed.amount : parseFloat(parsed.amount) || 0,
          description: parsed.description?.substring(0, 50) || undefined,
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 50,
        };
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw content:', content);
    }

    console.log('Extracted ticket data:', ticketData);

    return new Response(
      JSON.stringify({ success: true, data: ticketData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in scan-ticket function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
