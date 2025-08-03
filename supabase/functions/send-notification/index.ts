import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

Deno.serve(async (req: Request) => {
  // CORS 헤더 설정
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { notification } = await req.json();

    // Supabase 클라이언트 생성
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 알림을 데이터베이스에 저장
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        title: notification.title,
        message: notification.message,
        target_type: notification.target_type,
        target_event: notification.target_event || null,
        sent_date: new Date().toISOString(),
        delivered_count: 0,
        read_count: 0,
        status: 'sent',
        sent_by: notification.sent_by,
      })
      .select()
      .single();

    if (error) throw error;

    // Realtime 브로드캐스트
    const { error: broadcastError } = await supabase
      .channel('notifications')
      .send({
        type: 'broadcast',
        event: 'new_notification',
        payload: {
          notification: data,
          timestamp: new Date().toISOString(),
        },
      });

    if (broadcastError) {
      console.error('Broadcast error:', broadcastError);
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
