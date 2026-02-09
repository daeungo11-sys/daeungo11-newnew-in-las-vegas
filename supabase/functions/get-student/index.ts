import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get('studentId');

    if (!studentId) {
      return new Response(JSON.stringify({ error: 'studentId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      return new Response(JSON.stringify({ error: studentError?.message ?? 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let badges: { badge_key: string; earned_at?: string }[] = [];
    try {
      const { data } = await supabaseAdmin
        .from('student_badges')
        .select('badge_key, earned_at')
        .eq('student_id', studentId)
        .order('earned_at', { ascending: false });
      badges = data ?? [];
    } catch {
      // student_badges 테이블이 없을 수 있음
    }

    const response = {
      ...student,
      points: Number(student.points) ?? 0,
      badges,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
