import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseClient.ts';

const ACTIVITY_POINTS: Record<string, number> = {
  PARAPHRASE: 10,
  PRACTICE_PLAN: 10,
  DAILY_REVIEW: 15,
  SUMMARY_WRITING: 10,
  MINI_QUIZ: 5, // 기본 5, 퀴즈 정답 수에 따라 extraPoints로 추가
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      studentId,
      activityType,
      inputText,
      outputText,
      extraPoints = 0,
      badgeKey,
    } = body;

    if (!studentId || !activityType || !inputText || !outputText) {
      return new Response(
        JSON.stringify({
          error: 'studentId, activityType, inputText, outputText are required',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: activity, error: insertError } = await supabaseAdmin
      .from('student_activities')
      .insert({
        student_id: studentId,
        activity_type: activityType,
        input_text: inputText,
        output_text: outputText,
      })
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const basePoints = ACTIVITY_POINTS[activityType] ?? 10;
    const pointsToAdd = basePoints + Number(extraPoints) || 0;
    let totalPoints = 0;
    const badgesEarned: string[] = [];

    if (pointsToAdd > 0) {
      const { data: student, error: studentError } = await supabaseAdmin
        .from('students')
        .select('points')
        .eq('id', studentId)
        .single();

      if (!studentError && student != null) {
        const currentPoints = Number(student.points) || 0;
        totalPoints = currentPoints + pointsToAdd;
        await supabaseAdmin
          .from('students')
          .update({ points: totalPoints })
          .eq('id', studentId);
      }
    }

    const { count } = await supabaseAdmin
      .from('student_activities')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId);

    if (count === 1) {
      await supabaseAdmin.from('student_badges').upsert(
        {
          student_id: studentId,
          badge_key: 'first_activity',
          earned_at: new Date().toISOString(),
        },
        { onConflict: 'student_id,badge_key' }
      );
      badgesEarned.push('first_activity');
    }

    if (badgeKey && typeof badgeKey === 'string') {
      const { error: badgeError } = await supabaseAdmin
        .from('student_badges')
        .upsert(
          {
            student_id: studentId,
            badge_key: badgeKey,
            earned_at: new Date().toISOString(),
          },
          { onConflict: 'student_id,badge_key' }
        );
      if (!badgeError) badgesEarned.push(badgeKey);
    }

    return new Response(
      JSON.stringify({
        ...activity,
        pointsAwarded: pointsToAdd,
        totalPoints: totalPoints || undefined,
        badgesEarned: badgesEarned.length ? badgesEarned : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
