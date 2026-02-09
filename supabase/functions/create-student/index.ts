import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseClient.ts';

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateStudentId() {
  const digit1 = Math.floor(Math.random() * 10);
  const digit2 = Math.floor(Math.random() * 10);
  const letter1 = ALPHA[Math.floor(Math.random() * ALPHA.length)];
  const letter2 = ALPHA[Math.floor(Math.random() * ALPHA.length)];
  return `${digit1}${digit2}${letter1}${letter2}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name, email } = await req.json();
    if (!name) {
      return new Response(JSON.stringify({ error: 'name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let created = null;
    let lastError = null;

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const id = generateStudentId();
      const { data: existing, error: lookupError } = await supabaseAdmin
        .from('students')
        .select('id')
        .eq('id', id)
        .limit(1);

      if (lookupError) {
        lastError = lookupError;
        continue;
      }

      if (existing && existing.length > 0) {
        continue;
      }

      const { data, error } = await supabaseAdmin
        .from('students')
        .insert({ id, name, email })
        .select()
        .single();

      if (error) {
        lastError = error;
        continue;
      }

      created = data;
      break;
    }

    if (!created) {
      const message = lastError?.message || 'Failed to generate student id';
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(created), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
