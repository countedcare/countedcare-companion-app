import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type OnlineUser = {
  user_id: string;
  display_name: string | null;
  email: string | null;
  last_seen: string;
};

export default function Metrics() {
  const [users, setUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.rpc('get_online_users');
      if (!error) setUsers(data ?? []);
    };
    load();

    const ch = supabase
      .channel('metrics-online')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_sessions' }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Currently Online</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-4">{users.length}</div>
          <ul className="list-disc pl-6">
            {users.map((u) => (
              <li key={`${u.user_id}-${u.last_seen}`}>
                {(u.display_name || u.email || u.user_id)} — last seen{' '}
                {new Date(u.last_seen).toLocaleTimeString()}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}