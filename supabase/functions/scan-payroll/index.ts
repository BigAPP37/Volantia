/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    // 1. Require authentication
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

    // 2. Validate input
    const body = await req.json();
    const { imageBase64 } = body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Validate image type
    const isJpeg = imageBase64.startsWith('data:image/jpeg') || imageBase64.startsWith('data:image/jpg') || imageBase64.startsWith('/9j/');
    const isPng = imageBase64.startsWith('data:image/png') || imageBase64.startsWith('iVBOR');
    if (!isJpeg && !isPng) {
      return new Response(
        JSON.stringify({ error: 'Solo se permiten imágenes JPG o PNG' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Validate size
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
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
            {
              type: 'text',
              text: `Analiza esta nómina española y extrae los datos. Responde SOLO con JSON válido, sin explicaciones ni backticks.

Campos:
- companyName: Nombre de la empresa
- companyCIF: CIF de la empresa
- baseSalary: Salario base mensual (solo número)
- irpf: Porcentaje de IRPF (solo número)
- socialSecurity: Porcentaje SS trabajador (solo número)
- netSalary: Salario neto (solo número)

Si no puedes leer algún campo, omítelo. Ejemplo:
{"companyName":"Transportes ABC S.L.","baseSalary":1500,"irpf":12,"socialSecurity":4.7,"netSalary":1250}`,
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

    // Parse and sanitize — never return rawResponse to client
    let payrollData: Record<string, unknown> = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Only return known safe fields
        payrollData = {
          ...(parsed.companyName && { companyName: String(parsed.companyName).substring(0, 100) }),
          ...(parsed.companyCIF && { companyCIF: String(parsed.companyCIF).substring(0, 20) }),
          ...(parsed.baseSalary && { baseSalary: parseFloat(parsed.baseSalary) || 0 }),
          ...(parsed.irpf && { irpf: parseFloat(parsed.irpf) || 0 }),
          ...(parsed.socialSecurity && { socialSecurity: parseFloat(parsed.socialSecurity) || 0 }),
          ...(parsed.netSalary && { netSalary: parseFloat(parsed.netSalary) || 0 }),
        };
      }
    } catch (_) { /* keep empty */ }

    return new Response(
      JSON.stringify({ success: true, data: payrollData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('scan-payroll error:', msg);
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
