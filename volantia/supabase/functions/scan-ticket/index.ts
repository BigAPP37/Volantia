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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Lovable AI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing ticket image with AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Eres un experto en análisis de tickets y recibos de gastos profesionales de conductores en España.

Tu tarea es extraer información de una imagen de ticket/recibo y clasificarlo.

Categorías disponibles:
- "fuel" = Gasoil, gasolina, combustible, estación de servicio (Repsol, Cepsa, BP, Shell, etc.)
- "toll" = Peaje, autopista, via-T, telepeaje
- "parking" = Parking, aparcamiento, estacionamiento
- "other" = Otros gastos (comida, material, etc.)

Extrae:
- expense_type: La categoría del gasto (fuel, toll, parking, other)
- amount: El importe total en euros (solo el número, sin símbolo €)
- description: Descripción breve del establecimiento o concepto (máx 30 caracteres)
- confidence: Tu nivel de confianza de 0 a 100

IMPORTANTE:
- Si ves palabras como "gasoil", "diesel", "gasolina", "combustible", estación de servicio -> es "fuel"
- Si ves "peaje", "autopista", "via-T" -> es "toll"  
- Si ves "parking", "aparcamiento", "estacionamiento" -> es "parking"
- El importe suele estar etiquetado como "TOTAL", "IMPORTE", "A PAGAR"

Responde ÚNICAMENTE con un JSON válido. Ejemplo:
{"expense_type": "fuel", "amount": 85.50, "description": "Repsol A-7 km 340", "confidence": 95}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analiza este ticket y extrae el tipo de gasto, importe y descripción. Responde solo con JSON.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Demasiadas solicitudes. Inténtalo de nuevo en unos segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos de IA agotados.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Error processing image with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || '';

    console.log('AI Response:', content);

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
      JSON.stringify({ 
        success: true, 
        data: ticketData,
      }),
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
