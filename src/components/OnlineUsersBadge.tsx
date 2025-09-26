import { Users } from 'lucide-react';
import useOnlinePresence from '@/hooks/useOnlinePresence';

export default function OnlineUsersBadge() {
  const { onlineCount } = useOnlinePresence();
  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm bg-white">
      <Users className="h-4 w-4" />
      <span>{onlineCount} online</span>
    </div>
  );
}