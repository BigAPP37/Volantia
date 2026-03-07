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
  // Handle CORS preflight requests
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

    // Call Lovable AI Gateway with vision capabilities
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
            content: `Eres un experto en análisis de nóminas españolas. Tu tarea es extraer datos de una imagen de nómina.

Extrae los siguientes campos si están presentes:
- Nombre de la empresa (companyName)
- CIF de la empresa (companyCIF) 
- Salario base mensual (baseSalary) - solo el número
- Porcentaje de IRPF (irpf) - solo el número sin el símbolo %
- Porcentaje de Seguridad Social del trabajador (socialSecurity) - solo el número
- Salario neto (netSalary) - solo el número

Responde ÚNICAMENTE con un JSON válido con estos campos. Si no puedes leer algún campo, omítelo del JSON.
Ejemplo de respuesta:
{"companyName": "Transportes ABC S.L.", "companyCIF": "B12345678", "baseSalary": 1500, "irpf": 12, "socialSecurity": 4.7, "netSalary": 1250}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analiza esta nómina española y extrae los datos solicitados. Responde solo con el JSON.'
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
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Error processing image with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || '';

    // Parse the JSON from AI response
    let payrollData: PayrollData = {};
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        payrollData = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw content:', content);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: payrollData,
        rawResponse: content 
      }),
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
