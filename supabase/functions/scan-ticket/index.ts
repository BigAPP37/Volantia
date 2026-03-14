/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Anthropic API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const base64Data = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    const mediaType = imageBase64.startsWith('data:image/png')
      ? 'image/png'
      : 'image/jpeg';

    console.log('Processing ticket image with Claude...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: `Analiza este ticket/recibo de un conductor profesional en España. Responde SOLO con JSON válido, sin explicaciones ni backticks.

Categorías:
- "fuel" = Gasoil, gasolina, combustible, estación de servicio
- "toll" = Peaje, autopista, via-T, telepeaje
- "parking" = Parking, aparcamiento
- "other" = Otros gastos

Campos a extraer:
- expense_type: categoría (fuel, toll, parking, other)
- amount: importe total en euros (solo número)
- description: descripción breve del establecimiento (máx 30 caracteres)
- confidence: nivel de confianza 0-100

Ejemplo:
{"expense_type":"fuel","amount":85.50,"description":"Repsol A-7 km 340","confidence":95}`,
            },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Demasiadas solicitudes. Inténtalo en unos segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Error processing image with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.content?.[0]?.text || '';

    console.log('Claude Response:', content);

    let ticketData = {
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

    return new Response(
      JSON.stringify({ success: true, data: ticketData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in scan-ticket:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
