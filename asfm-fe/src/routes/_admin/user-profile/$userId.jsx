import { createFileRoute } from '@tanstack/react-router';
import UserProfilePage from '@/components/UserProfilePage';

export const Route = createFileRoute('/_admin/user-profile/$userId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { userId } = Route.useParams();
  return <UserProfilePage userId={userId} />;
}
