import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseClient.ts';

/** 학급 요약 대시보드용 집계 (제출률, 활동 학생 수, 오류 분포 등) */
export type ClassSummary = {
  submissionRate: number;
  averageScore: number | null;
  topError: string;
  activeStudentsToday: number;
  errorDistribution: Array<{ name: string; value: number }>;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const todayIso = today.toISOString();
    const sevenDaysAgoIso = sevenDaysAgo.toISOString();

    // 전체 학생 수
    const { count: totalStudents, error: countError } = await supabaseAdmin
      .from('students')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return new Response(JSON.stringify({ error: countError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const total = Number(totalStudents) || 0;

    // 지난 7일 동안 활동한 학생 수 (distinct)
    const { data: activeLast7 } = await supabaseAdmin
      .from('student_activities')
      .select('student_id')
      .gte('created_at', sevenDaysAgoIso);

    const uniqueLast7 = new Set((activeLast7 || []).map((r) => r.student_id));
    const active7Count = uniqueLast7.size;
    const submissionRate = total > 0 ? Math.round((active7Count / total) * 100) : 0;

    // 오늘 활동한 학생 수
    const { data: activeToday } = await supabaseAdmin
      .from('student_activities')
      .select('student_id')
      .gte('created_at', todayIso);

    const uniqueToday = new Set((activeToday || []).map((r) => r.student_id));
    const activeStudentsToday = uniqueToday.size;

    // 평균 점수·오류 유형은 DB에 없으면 0/없음 (추후 컬럼 추가 시 연동 가능)
    const averageScore: number | null = null;
    const topError = '없음';

    const errorDistribution = [
      { name: '시제/수일치', value: 0 },
      { name: '전치사', value: 0 },
      { name: '동의어', value: 0 },
      { name: '관계사', value: 0 },
    ];

    const summary: ClassSummary = {
      submissionRate,
      averageScore,
      topError,
      activeStudentsToday,
      errorDistribution,
    };

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
