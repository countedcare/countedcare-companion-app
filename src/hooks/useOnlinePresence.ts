import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const HEARTBEAT_MS = 30_000;

function uuidv4() {
  // Lightweight UUID (ok for client session ids)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function useOnlinePresence() {
  const { user } = useAuth();
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const sessionIdRef = useRef<string | null>(null);
  const heartbeatRef = useRef<number | null>(null);

  // Start/stop a session for this tab
  useEffect(() => {
    if (!user) return;

    const client_session_id = uuidv4();
    sessionIdRef.current = client_session_id;

    const payload = {
      user_id: user.id,
      client_session_id,
      display_name: user.user_metadata?.full_name ?? user.email ?? user.id,
      email: user.email ?? null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
    };

    // Insert (ignore duplicate session errors if any)
    supabase
      .from('user_sessions')
      .insert(payload)
      .then(({ error }) => {
        if (error && !/duplicate/i.test(error.message)) {
          console.warn('user_sessions insert error', error);
        }

        // Start heartbeat after insert attempt (idempotent)
        heartbeatRef.current = window.setInterval(async () => {
          await supabase
            .from('user_sessions')
            .update({ last_seen: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('client_session_id', client_session_id);
        }, HEARTBEAT_MS);
      });

    const endSession = async () => {
      const id = sessionIdRef.current;
      if (!id) return;
      await supabase
        .from('user_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('client_session_id', id);
    };

    window.addEventListener('beforeunload', endSession);
    return () => {
      if (heartbeatRef.current) window.clearInterval(heartbeatRef.current);
      window.removeEventListener('beforeunload', endSession);
      endSession();
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep an up-to-date count (RPC + DB subscription)
  useEffect(() => {
    const refresh = async () => {
      const { data, error } = await supabase.rpc('get_online_user_count');
      if (!error && typeof data === 'number') setOnlineCount(data);
    };
    refresh();

    const ch = supabase
      .channel('online-users-watch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_sessions' }, refresh)
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  return { onlineCount };
}
