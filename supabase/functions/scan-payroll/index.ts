/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayrollData {
  companyName?: string;
  companyCIF?: string;
  baseSalary?: number;
  irpf?: number;
  socialSecurity?: number;
  netSalary?: number;
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

    // Detect mime type
    const mimeType = imageBase64.startsWith('data:image/png') 
      ? 'image/png' 
      : 'image/jpeg';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Eres un experto en análisis de nóminas españolas. Analiza esta imagen de nómina y extrae los datos.

Extrae los siguientes campos si están presentes:
- companyName: Nombre de la empresa
- companyCIF: CIF de la empresa
- baseSalary: Salario base mensual (solo número)
- irpf: Porcentaje de IRPF (solo número sin %)
- socialSecurity: Porcentaje de Seguridad Social del trabajador (solo número)
- netSalary: Salario neto (solo número)

Responde ÚNICAMENTE con un JSON válido. Sin explicaciones, sin markdown, sin backticks.
Ejemplo: {"companyName":"Transportes ABC S.L.","companyCIF":"B12345678","baseSalary":1500,"irpf":12,"socialSecurity":4.7,"netSalary":1250}`
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
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Error processing image with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let payrollData: PayrollData = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        payrollData = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw content:', content);
    }

    return new Response(
      JSON.stringify({ success: true, data: payrollData, rawResponse: content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in scan-payroll function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
