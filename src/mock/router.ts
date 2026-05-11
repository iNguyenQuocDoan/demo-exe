/**
 * Mock API router — matches URL+method to mock handler.
 * Used by the axios adapter installed in apiClient when NEXT_PUBLIC_USE_MOCK=true.
 */

import {
  handleLogin,
  handleRegister,
  handleGetMe,
  handleUpdateUserRole,
} from "./handlers/auth";
import {
  handleGetTutors,
  handleGetTutor,
  handleUpdateTutor,
  handleGetTutorReviews,
  handleGetAllReviews,
  handleGetReviewByBookingId,
  handleCreateReview,
  handleGetAvailabilityForSlots,
} from "./handlers/tutors";
import {
  handleGetBookings,
  handleCreateBooking,
  handleAcceptBooking,
  handleStartBooking,
  handleCompleteBooking,
  handleCancelBooking,
  handleGetSeries,
  handlePreviewSeries,
  handleCreateSeries,
  handleAcceptSeries,
  handleSubmitSessionFeedback,
} from "./handlers/bookings";
import {
  handleGetWallet,
  handleGetTransactions,
  handleCreateDeposit,
  handleApproveDeposit,
  handleRejectDeposit,
  handleGetDeposits,
  handleCreateWithdraw,
  handleProcessWithdraw,
  handleGetWithdrawals,
} from "./handlers/wallet";
import {
  handleGetAvailability,
  handleSaveAvailability,
  handleAddSlot,
  handleUpdateSlot,
  handleDeleteSlot,
  handleAddException,
  handleDeleteException,
  handleToggleAcceptingBookings,
} from "./handlers/availability";
import {
  handleGetCities,
  handleGetDistricts,
  handleGetSubjects,
  handleGetFeeConfig,
  handleUpdateFeeConfig,
} from "./handlers/reference";
import {
  handleGetUsers,
  handleGetUser,
  handleUpdateUser,
} from "./handlers/users";
import {
  handleGetApplications,
  handleGetMyApplication,
  handleGetApplication,
  handleSubmitApplication,
  handleUpdateApplicationStatus,
  handleResubmitApplication,
} from "./handlers/applications";
import { handleGetStats } from "./handlers/stats";
import { handleGetTutorAnalytics } from "./handlers/analytics";
import {
  handleGetMySubscription,
  handleCreateSubscription,
} from "./handlers/subscriptions";
import {
  handleCreateReport,
  handleGetReport,
  handleGetReports,
  handleGetMyReports,
  handleGetReportsAgainstMe,
  handleUpdateReport,
} from "./handlers/reports";
import {
  handleGetNotifications,
  handleMarkRead,
  handleMarkAllRead,
} from "./handlers/notifications";
import {
  handleGetEnhancedBooking,
  handleConfirmEnhancedBooking,
  handleGetStudyPlan,
  handleCreateStudyPlan,
  handleSendStudyPlan,
  handleUpdateStudyPlan,
  handleAcceptStudyPlan,
  handleGetConversation,
  handleSendMessage,
  handleChangeContactOwner,
} from "./handlers/enhanced-bookings";

export interface MockResponse {
  status: number;
  data: unknown;
}

function parseBody(data: unknown): Record<string, unknown> {
  if (!data) return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  if (data instanceof FormData) return {};
  return data as Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function routeMockRequest(config: {
  url?: string;
  method?: string;
  params?: any;
  data?: any;
}): MockResponse | null {
  const raw = (config.url ?? "").replace(/\?.*/, "");
  const url = raw.startsWith("/") ? raw : `/${raw}`;
  const method = (config.method ?? "get").toLowerCase();
  const params = (config.params ?? {}) as Record<string, string>;
  const body = parseBody(config.data) as Record<string, unknown>;

  // ── Auth ────────────────────────────────────────────────────────────────────
  if (method === "post" && url === "/auth/login")
    return handleLogin(body as Parameters<typeof handleLogin>[0]);
  if (method === "post" && url === "/auth/register")
    return handleRegister(body as Parameters<typeof handleRegister>[0]);
  if (method === "get" && url === "/auth/me") return handleGetMe();

  // ── Tutors ──────────────────────────────────────────────────────────────────
  if (method === "get" && url === "/tutors") return handleGetTutors(params);
  const tutorMatch = url.match(/^\/tutors\/([^/]+)$/);
  if (tutorMatch) {
    if (method === "get") return handleGetTutor(tutorMatch[1]);
    if (method === "put") return handleUpdateTutor(tutorMatch[1], body);
  }
  const tutorReviewMatch = url.match(/^\/tutors\/([^/]+)\/reviews$/);
  if (tutorReviewMatch && method === "get")
    return handleGetTutorReviews(tutorReviewMatch[1]);

  // ── Reviews ─────────────────────────────────────────────────────────────────
  if (method === "get" && url === "/reviews")
    return handleGetAllReviews(params);
  if (method === "post" && url === "/reviews")
    return handleCreateReview(body as Parameters<typeof handleCreateReview>[0]);
  const reviewByBookingMatch = url.match(/^\/reviews\/booking\/([^/]+)$/);
  if (reviewByBookingMatch && method === "get")
    return handleGetReviewByBookingId(reviewByBookingMatch[1]);

  // ── Availability ────────────────────────────────────────────────────────────
  const availBase = url.match(/^\/availability\/([^/]+)$/);
  if (availBase) {
    const tutorId = availBase[1];
    if (method === "get") return handleGetAvailability(tutorId);
    if (method === "put") return handleSaveAvailability(tutorId, body);
  }
  const availSlots = url.match(/^\/availability\/([^/]+)\/slots$/);
  if (availSlots && method === "post")
    return handleAddSlot(
      availSlots[1],
      body as Parameters<typeof handleAddSlot>[1],
    );
  const availSlot = url.match(/^\/availability\/([^/]+)\/slots\/([^/]+)$/);
  if (availSlot) {
    if (method === "put")
      return handleUpdateSlot(availSlot[1], availSlot[2], body);
    if (method === "delete")
      return handleDeleteSlot(availSlot[1], availSlot[2]);
  }
  const availEx = url.match(/^\/availability\/([^/]+)\/exceptions$/);
  if (availEx && method === "post")
    return handleAddException(
      availEx[1],
      body as Parameters<typeof handleAddException>[1],
    );
  const availExId = url.match(/^\/availability\/([^/]+)\/exceptions\/([^/]+)$/);
  if (availExId && method === "delete")
    return handleDeleteException(availExId[1], availExId[2]);
  const availToggle = url.match(/^\/availability\/([^/]+)\/toggle$/);
  if (availToggle && method === "put")
    return handleToggleAcceptingBookings(
      availToggle[1],
      body as { accepting?: boolean },
    );

  // ── Bookings ────────────────────────────────────────────────────────────────
  if (url === "/bookings") {
    if (method === "get") return handleGetBookings(params);
    if (method === "post")
      return handleCreateBooking(
        body as Parameters<typeof handleCreateBooking>[0],
      );
  }
  const bookingFeedbackMatch = url.match(/^\/bookings\/([^/]+)\/feedback$/);
  if (bookingFeedbackMatch && method === "post")
    return handleSubmitSessionFeedback(
      bookingFeedbackMatch[1],
      (body as { feedback: Parameters<typeof handleSubmitSessionFeedback>[1] }).feedback,
    );

  const bookingAction = url.match(
    /^\/bookings\/([^/]+)\/(accept|cancel|start|complete)$/,
  );
  if (bookingAction && method === "put") {
    const [, id, action] = bookingAction;
    if (action === "accept") return handleAcceptBooking(id);
    if (action === "cancel") return handleCancelBooking(id);
    if (action === "start") return handleStartBooking(id);
    if (action === "complete") return handleCompleteBooking(id);
  }

  // ── Series ──────────────────────────────────────────────────────────────────
  if (url === "/series") {
    if (method === "get") return handleGetSeries(params);
    if (method === "post")
      return handleCreateSeries(
        body as Parameters<typeof handleCreateSeries>[0],
      );
  }
  if (url === "/series/preview" && method === "post")
    return handlePreviewSeries(
      body as Parameters<typeof handlePreviewSeries>[0],
    );
  const seriesAccept = url.match(/^\/series\/([^/]+)\/accept$/);
  if (seriesAccept && method === "put")
    return handleAcceptSeries(seriesAccept[1]);

  // ── Wallet ──────────────────────────────────────────────────────────────────
  if (method === "get" && url === "/wallet/me") return handleGetWallet();
  if (method === "get" && url === "/wallet/transactions")
    return handleGetTransactions(params);
  if (method === "post" && url === "/wallet/deposit")
    return handleCreateDeposit(
      body as Parameters<typeof handleCreateDeposit>[0],
    );
  if (method === "get" && url === "/wallet/deposits")
    return handleGetDeposits(params);
  const depAction = url.match(/^\/wallet\/deposit\/([^/]+)\/(approve|reject)$/);
  if (depAction && method === "put") {
    if (depAction[2] === "approve") return handleApproveDeposit(depAction[1]);
    if (depAction[2] === "reject")
      return handleRejectDeposit(depAction[1], body as { reason?: string });
  }
  if (method === "post" && url === "/wallet/withdraw")
    return handleCreateWithdraw(
      body as Parameters<typeof handleCreateWithdraw>[0],
    );
  if (method === "get" && url === "/wallet/withdrawals")
    return handleGetWithdrawals(params);
  const witAction = url.match(/^\/wallet\/withdraw\/([^/]+)\/process$/);
  if (witAction && method === "put")
    return handleProcessWithdraw(
      witAction[1],
      body as { approved?: boolean; rejectedReason?: string },
    );

  // ── Reference ────────────────────────────────────────────────────────────────
  if (method === "get" && url === "/reference/cities") return handleGetCities();
  if (method === "get" && url === "/reference/districts")
    return handleGetDistricts(params);
  if (method === "get" && url === "/reference/subjects")
    return handleGetSubjects();
  if (method === "get" && url === "/reference/fee-config")
    return handleGetFeeConfig();
  if (method === "put" && url === "/reference/fee-config")
    return handleUpdateFeeConfig(
      body as Parameters<typeof handleUpdateFeeConfig>[0],
    );

  // ── Users ───────────────────────────────────────────────────────────────────
  if (method === "get" && url === "/users") return handleGetUsers(params);
  const userMatch = url.match(/^\/users\/([^/]+)$/);
  if (userMatch) {
    const userId = userMatch[1];
    if (method === "get") return handleGetUser(userId);
    if (method === "put") {
      // Could be role update (auth) or profile update (users)
      if (body.role !== undefined)
        return handleUpdateUserRole(userId, body as { role?: string });
      return handleUpdateUser(userId, body);
    }
  }

  // ── Applications ─────────────────────────────────────────────────────────────
  if (url === "/applications") {
    if (method === "get") return handleGetApplications(params);
    if (method === "post")
      return handleSubmitApplication(
        body as Parameters<typeof handleSubmitApplication>[0],
      );
  }
  if (method === "get" && url === "/applications/user/me")
    return handleGetMyApplication();
  const appMatch = url.match(/^\/applications\/([^/]+)$/);
  if (appMatch && method === "get") return handleGetApplication(appMatch[1]);
  const appStatus = url.match(/^\/applications\/([^/]+)\/status$/);
  if (appStatus && method === "put")
    return handleUpdateApplicationStatus(
      appStatus[1],
      body as Parameters<typeof handleUpdateApplicationStatus>[1],
    );
  const appResubmit = url.match(/^\/applications\/([^/]+)\/resubmit$/);
  if (appResubmit && method === "put")
    return handleResubmitApplication(
      appResubmit[1],
      body as Parameters<typeof handleResubmitApplication>[1],
    );

  // ── Stats ────────────────────────────────────────────────────────────────────
  if (method === "get" && url === "/stats/dashboard") return handleGetStats();
  if (method === "get" && url === "/stats/tutor/analytics") return handleGetTutorAnalytics();

  // ── Subscriptions ────────────────────────────────────────────────────────────
  if (method === "get" && url === "/subscriptions/me") return handleGetMySubscription();
  if (method === "post" && url === "/subscriptions")
    return handleCreateSubscription(body as Parameters<typeof handleCreateSubscription>[0]);

  // ── Reports / Disputes ───────────────────────────────────────────────────────
  if (url === "/reports") {
    if (method === "get") return handleGetReports(params);
    if (method === "post") return handleCreateReport(body as Parameters<typeof handleCreateReport>[0]);
  }
  if (method === "get" && url === "/reports/me") return handleGetMyReports(params);
  if (method === "get" && url === "/reports/against-me") return handleGetReportsAgainstMe(params);
  const reportMatch = url.match(/^\/reports\/([^/]+)$/);
  if (reportMatch) {
    if (method === "get") return handleGetReport(reportMatch[1]);
    if (method === "put") return handleUpdateReport(reportMatch[1], body as Parameters<typeof handleUpdateReport>[1]);
  }

  // ── Notifications ────────────────────────────────────────────────────────────
  if (method === "get" && url === "/notifications") return handleGetNotifications();
  if (method === "put" && url === "/notifications/read-all") return handleMarkAllRead();
  const notifReadMatch = url.match(/^\/notifications\/([^/]+)\/read$/);
  if (notifReadMatch && method === "put") return handleMarkRead(notifReadMatch[1]);

  // ── Uploads ──────────────────────────────────────────────────────────────────
  if (method === "post" && url === "/uploads/image") {
    // Return a realistic placeholder photo URL (picsum gives real photos by seed)
    const seed = `upload-${Date.now()}`;
    return {
      status: 200,
      data: { ok: true, url: `https://picsum.photos/seed/${seed}/600/400` },
    };
  }

  // ── Conversations ─────────────────────────────────────────────────────────────
  if (method === "get" && url === "/conversations")
    return { status: 200, data: { ok: true, conversations: [] } };
  if (method === "post" && url === "/conversations/init")
    return { status: 200, data: { ok: true } };

  // ── Enhanced Bookings ──────────────────────────────────────────────────────────
  const enhancedBookingMatch = url.match(/^\/enhanced-bookings\/([^/]+)$/);
  if (enhancedBookingMatch && method === "get")
    return handleGetEnhancedBooking(enhancedBookingMatch[1]);
  const confirmBookingMatch = url.match(
    /^\/enhanced-bookings\/([^/]+)\/confirm$/,
  );
  if (confirmBookingMatch && method === "put")
    return handleConfirmEnhancedBooking(confirmBookingMatch[1]);

  // ── Study Plans ─────────────────────────────────────────────────────────────────
  const studyPlanByBooking = url.match(/^\/study-plans\/booking\/([^/]+)$/);
  if (studyPlanByBooking && method === "get")
    return handleGetStudyPlan(studyPlanByBooking[1]);
  if (url === "/study-plans" && method === "post")
    return handleCreateStudyPlan(
      body as Parameters<typeof handleCreateStudyPlan>[0],
    );
  const sendPlanMatch = url.match(/^\/study-plans\/([^/]+)\/send$/);
  if (sendPlanMatch && method === "put")
    return handleSendStudyPlan(sendPlanMatch[1]);
  const acceptPlanMatch = url.match(/^\/study-plans\/([^/]+)\/accept$/);
  if (acceptPlanMatch && method === "put")
    return handleAcceptStudyPlan(acceptPlanMatch[1]);
  const updatePlanMatch = url.match(/^\/study-plans\/([^/]+)$/);
  if (updatePlanMatch && method === "put")
    return handleUpdateStudyPlan(
      updatePlanMatch[1],
      body as Parameters<typeof handleUpdateStudyPlan>[1],
    );

  // ── Chat / Conversations ─────────────────────────────────────────────────────────
  const conversationMatch = url.match(/^\/conversations\/booking\/([^/]+)$/);
  if (conversationMatch && method === "get")
    return handleGetConversation(conversationMatch[1]);
  const sendMessageMatch = url.match(
    /^\/conversations\/booking\/([^/]+)\/messages$/,
  );
  if (sendMessageMatch && method === "post")
    return handleSendMessage(sendMessageMatch[1], body as { content: string });
  const changeOwnerMatch = url.match(
    /^\/conversations\/booking\/([^/]+)\/change-owner$/,
  );
  if (changeOwnerMatch && method === "put")
    return handleChangeContactOwner(
      changeOwnerMatch[1],
      body as Parameters<typeof handleChangeContactOwner>[1],
    );

  // Unhandled route — fall through (return null to let real request proceed if needed)
  return null;
}

/** Helper to get the availability for the tutorApi.getTutorAvailability call */
export { handleGetAvailabilityForSlots };
