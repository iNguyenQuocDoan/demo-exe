import { db } from "../db";

export function handleGetStats() {
  const users = db.getUsers();
  const byRole = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  const bookings = db.bookings;
  const byStatus = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});

  // Platform revenue = sum of platformFee from completed bookings
  const revenue = bookings
    .filter((b) => b.status === "Completed")
    .reduce((sum, b) => sum + (b.platformFee ?? 0), 0);

  // Money currently held for active bookings (Pending / Confirmed / InProgress)
  const ACTIVE_STATUSES = ["Pending", "Confirmed", "InProgress", "AwaitingPayment"];
  const activeHoldAmount = bookings
    .filter((b) => ACTIVE_STATUSES.includes(b.status))
    .reduce((sum, b) => sum + (b.totalAmount ?? 0), 0);

  const applications = db.applications;
  const appByStatus = applications.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});
  const pending = (appByStatus["Submitted"] ?? 0) + (appByStatus["Reviewing"] ?? 0);

  // System-level financial snapshot
  const totalWalletBalance = db.wallets.reduce((sum, w) => sum + w.balance, 0);
  const pendingDepositAmount = db.deposits
    .filter((d) => d.status === "Pending")
    .reduce((sum, d) => sum + d.amount, 0);
  const pendingWithdrawalAmount = db.withdrawals
    .filter((w) => w.status === "Pending")
    .reduce((sum, w) => sum + w.amount, 0);

  // Top tutors by booking count
  const bookingCountMap: Record<string, number> = {};
  for (const b of bookings) {
    if (b.tutorId) bookingCountMap[b.tutorId] = (bookingCountMap[b.tutorId] ?? 0) + 1;
  }
  const byBookings = Object.entries(bookingCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tutorId, bookingCount]) => {
      const tutor = db.tutors.find((t) => t.id === tutorId);
      return {
        tutorId,
        name: tutor?.fullName ?? tutorId,
        avatarUrl: tutor?.avatarUrl,
        bookingCount,
        ratingAvg: tutor?.ratingAvg ?? 0,
      };
    });

  // Top tutors by rating (min 1 review)
  const byRating = [...db.tutors]
    .filter((t) => (t.reviewCount ?? 0) >= 1)
    .sort((a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
    .slice(0, 5)
    .map((t) => ({
      tutorId: t.id,
      name: t.fullName,
      avatarUrl: t.avatarUrl,
      ratingAvg: t.ratingAvg ?? 0,
      reviewCount: t.reviewCount ?? 0,
    }));

  return {
    status: 200,
    data: {
      ok: true,
      data: {
        users: { total: users.length, byRole },
        bookings: { total: bookings.length, byStatus, revenue },
        applications: { total: applications.length, byStatus: appByStatus, pending },
        system: {
          platformRevenue: revenue,
          activeHoldAmount,
          totalWalletBalance,
          pendingDepositAmount,
          pendingWithdrawalAmount,
        },
        topTutors: { byBookings, byRating },
      },
    },
  };
}
