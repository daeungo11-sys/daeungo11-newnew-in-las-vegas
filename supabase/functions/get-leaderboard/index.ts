import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get('limit') || '50';
    const limit = Math.min(Number.parseInt(limitParam, 10) || 50, 100);

    const { data, error } = await supabaseAdmin
      .from('students')
      .select('id, name, points')
      .order('points', { ascending: false })
      .limit(limit);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const leaderboard = (data ?? []).map((row, index) => ({
      rank: index + 1,
      studentId: row.id,
      name: row.name,
      points: Number(row.points) ?? 0,
    }));

    return new Response(JSON.stringify(leaderboard), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
