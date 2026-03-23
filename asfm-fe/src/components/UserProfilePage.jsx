import { useState, useEffect } from 'react';
import { useBoundStore } from '@/store';
import apiClient from '@/lib/axios';
import { DashboardSummaryCard } from '@/components/DashboardSummaryCard';
import DashboardCard from '@/components/custom/DashboardCard';
import { Button } from '@/components/ui/button';
import { Loader2, PawPrint, Timer } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function UserProfilePage({ userId }) {
  const userRole = useBoundStore((state) => state.userRole);
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchAll = async () => {
      setLoading(true);

      const animalsEndpoint =
        userRole === 'USER' ? '/animals' : `/users/${userId}/animals`;
      const transactionsEndpoint =
        userRole === 'USER'
          ? '/inventory-transactions?limit=10000'
          : `/inventory-transactions?foster_user_id=${userId}&limit=10000`;

      const [userResult, animalsResult, transactionsResult, assignmentsResult] =
        await Promise.allSettled([
          apiClient.get(`/users/${userId}`),
          apiClient.get(animalsEndpoint),
          apiClient.get(transactionsEndpoint),
          apiClient.get(`/users/${userId}/assignments`),
        ]);

      if (userResult.status === 'fulfilled') setProfileUser(userResult.value.data);
      if (animalsResult.status === 'fulfilled') setAnimals(animalsResult.value.data ?? []);
      if (transactionsResult.status === 'fulfilled')
        setTransactions(transactionsResult.value.data ?? []);
      if (assignmentsResult.status === 'fulfilled')
        setAssignments(assignmentsResult.value.data ?? []);

      setLoading(false);
    };

    fetchAll();
  }, [userId, userRole]);

  const activeLoans = transactions.filter(
    (t) => t.type === 'LOAN' && t.status === 'ACTIVE',
  );

  const animalRows = animals.map((a) => ({
    name: a.name,
    species: a.species,
    status: a.foster_status,
  }));

  const loanRows = activeLoans.map((t) => ({
    item: t.item?.name,
    quantity: t.quantity,
  }));

  const transactionRows = transactions.slice(0, 20).map((t) => ({
    item: t.item?.name,
    type: t.type,
    quantity: t.quantity,
  }));

  const assignmentRows = assignments.map((a) => ({
    animal: a.animal?.name ?? '—',
    status: a.status,
    started: a.start_date ? new Date(a.start_date).toLocaleDateString() : '—',
  }));

  const isStaff = userRole === 'STAFF';

  const initials = profileUser
    ? `${profileUser.first_name?.[0] ?? ''}${profileUser.last_name?.[0] ?? ''}`.toUpperCase()
    : '?';

  return (
    <div className="p-6 space-y-6">
      {isStaff && (
        <Button variant="ghost" className="-ml-2" onClick={() => navigate({ to: '/users' })}>
          ← Back to Users
        </Button>
      )}

      {/* User Info Card */}
      <div className="relative overflow-hidden rounded-xl border bg-card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center size-14 rounded-full bg-primary/10 border border-primary/20 shrink-0">
            <span className="text-xl font-bold text-primary">{loading ? '?' : initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-2">
                <div className="h-7 bg-muted rounded w-48 animate-pulse" />
                <div className="h-4 bg-muted rounded w-64 animate-pulse" />
                <div className="h-4 bg-muted rounded w-40 animate-pulse" />
              </div>
            ) : profileUser ? (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {profileUser.first_name} {profileUser.last_name}
                  </h1>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      profileUser.role === 'STAFF'
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-secondary/40 text-muted-foreground border border-border'
                    }`}
                  >
                    {profileUser.role}
                  </span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground space-y-0.5">
                  {profileUser.email && <p>{profileUser.email}</p>}
                  {profileUser.phone && <p>{profileUser.phone}</p>}
                  {profileUser.address && <p>{profileUser.address}</p>}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">User not found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <DashboardSummaryCard
          title="Animals"
          value={loading ? '...' : animals.length}
          subtitle="Currently Fostered / Adopted"
          icon={<PawPrint className="size-6" />}
        />
        <DashboardSummaryCard
          title="Active Loans"
          value={loading ? '...' : activeLoans.length}
          subtitle="Outstanding Loans"
          icon={<Timer className="size-6" />}
        />
      </div>

      {/* Data Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="animate-spin size-5" />
          Loading Profile...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardCard
            title="Animals"
            navLink={isStaff ? 'animals' : 'my-animals'}
            itemsArray={animalRows.length ? animalRows : [{ info: 'No Animals Found' }]}
            cardDescriptionClassName="max-h-64 overflow-y-auto"
          />
          <DashboardCard
            title="Active Loans"
            navLink={isStaff ? 'loans' : 'my-supplies'}
            itemsArray={loanRows.length ? loanRows : [{ info: 'No Active Loans Found' }]}
            cardDescriptionClassName="max-h-64 overflow-y-auto"
          />
          <DashboardCard
            title="Transactions"
            navLink={isStaff ? 'transactions' : 'my-supplies'}
            itemsArray={
              transactionRows.length ? transactionRows : [{ info: 'No Transactions Found' }]
            }
            cardDescriptionClassName="max-h-64 overflow-y-auto"
          />
          <DashboardCard
            title="Assignment History"
            navLink={isStaff ? 'animals' : 'my-animals'}
            itemsArray={
              assignmentRows.length ? assignmentRows : [{ info: 'No Assignment History Found' }]
            }
            cardDescriptionClassName="max-h-64 overflow-y-auto"
          />
        </div>
      )}
    </div>
  );
}
