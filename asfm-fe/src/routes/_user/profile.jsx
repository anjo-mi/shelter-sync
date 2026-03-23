import { createFileRoute } from '@tanstack/react-router';
import { useBoundStore } from '@/store';
import UserProfilePage from '@/components/UserProfilePage';

export const Route = createFileRoute('/_user/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  const user = useBoundStore((state) => state.user);
  return <UserProfilePage userId={user?.id} />;
}
