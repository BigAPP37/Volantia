/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Only allow requests from our own app
const ALLOWED_ORIGINS = [
  'https://volantia.vercel.app',
  'https://volantia-git-main-alejandros-projects-7fd781fd.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function getCorsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o));
  return {
    'Access-Control-Allow-Origin': allowed ? origin! : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Verify user is authenticated
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse and validate input
    const body = await req.json();
    const { imageBase64 } = body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Validate image type (only JPG/PNG)
    const isJpeg = imageBase64.startsWith('data:image/jpeg') || imageBase64.startsWith('data:image/jpg') || imageBase64.startsWith('/9j/');
    const isPng = imageBase64.startsWith('data:image/png') || imageBase64.startsWith('iVBOR');
    if (!isJpeg && !isPng) {
      return new Response(
        JSON.stringify({ error: 'Solo se permiten imágenes JPG o PNG' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Validate image size
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const estimatedBytes = Math.ceil(base64Data.length * 0.75);
    if (estimatedBytes > MAX_IMAGE_SIZE_BYTES) {
      return new Response(
        JSON.stringify({ error: 'Imagen demasiado grande. Máximo 5MB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mediaType = isPng ? 'image/png' : 'image/jpeg';

    // 5. Call AI
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Service unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
            {
              type: 'text',
              text: `Analiza este ticket/recibo de un conductor profesional en España. Responde SOLO con JSON válido, sin explicaciones ni backticks.

Categorías: "fuel" = Gasoil/gasolina, "toll" = Peaje, "parking" = Parking, "other" = Otros

Campos:
- expense_type: categoría (fuel, toll, parking, other)
- amount: importe total en euros (solo número)
- description: descripción breve del establecimiento (máx 30 caracteres)
- confidence: nivel de confianza 0-100

Ejemplo: {"expense_type":"fuel","amount":85.50,"description":"Repsol A-7 km 340","confidence":95}`,
            },
          ],
        }],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Demasiadas solicitudes. Inténtalo en unos segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Error processing image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.content?.[0]?.text || '';

    let ticketData = { expense_type: 'other', amount: 0, confidence: 0 };
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        ticketData = {
          expense_type: ['fuel', 'toll', 'parking', 'other'].includes(parsed.expense_type) ? parsed.expense_type : 'other',
          amount: typeof parsed.amount === 'number' ? parsed.amount : parseFloat(parsed.amount) || 0,
          description: parsed.description?.substring(0, 50) || undefined,
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 50,
        };
      }
    } catch (_) { /* keep defaults */ }

    return new Response(
      JSON.stringify({ success: true, data: ticketData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('scan-ticket error:', msg);
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
