import { db } from "../db";
import type {
  StudyPlan,
  Conversation,
  Message,
} from "@/types/booking-enhanced";

function currentUserId(): string {
  if (typeof window === "undefined") return "";
  try {
    return (
      (JSON.parse(localStorage.getItem("auth_user") ?? "{}") as { id?: string })
        .id ?? ""
    );
  } catch {
    return "";
  }
}

// ─── Enhanced Bookings ────────────────────────────────────────────────────────
export function handleGetEnhancedBooking(id: string) {
  const booking = db.enhancedBookings.find((b) => b.id === id);
  if (!booking)
    return { status: 404, data: { ok: false, error: "Booking not found" } };

  // Check privacy: if not confirmed, hide sensitive info
  const userId = currentUserId();
  const isTutor = booking.tutorId === userId;

  if (!booking.isConfirmedByTutor && isTutor) {
    // Tutor can see booking but limited info
    return {
      status: 200,
      data: {
        ok: true,
        booking: {
          ...booking,
          contactPreferences: booking.contactPreferences.map((cp) => ({
            ...cp,
            value: cp.isVisible ? cp.value : undefined,
          })),
          locationInfo: {
            district: booking.locationInfo.district,
            city: booking.locationInfo.city,
            // Hide full address until confirmed
          },
        },
      },
    };
  }

  return { status: 200, data: { ok: true, booking } };
}

export function handleConfirmEnhancedBooking(id: string) {
  const booking = db.enhancedBookings.find((b) => b.id === id);
  if (!booking)
    return { status: 404, data: { ok: false, error: "Booking not found" } };

  const userId = currentUserId();
  if (booking.tutorId !== userId) {
    return {
      status: 403,
      data: { ok: false, error: "Only assigned tutor can confirm" },
    };
  }

  booking.status = "Confirmed";
  booking.isConfirmedByTutor = true;
  booking.confirmedAt = new Date().toISOString();

  // Make contact info visible
  booking.contactPreferences.forEach((cp) => {
    cp.isVisible = true;
  });

  // Assign tutor as contact owner
  const tutor = db.tutors.find((t) => t.id === userId);
  if (tutor) {
    booking.currentContactOwner = {
      userId,
      name: tutor.fullName,
      role: "TUTOR",
      avatarUrl: tutor.avatarUrl,
      assignedAt: new Date().toISOString(),
    };

    booking.contactOwnerHistory.push({
      id: `coh_${Date.now()}`,
      bookingId: id,
      from: null,
      to: booking.currentContactOwner,
      reason: "Initial assignment after booking confirmation",
      changedAt: new Date().toISOString(),
      changedBy: "system",
    });
  }

  db.saveEnhancedBookings();
  return { status: 200, data: { ok: true, booking } };
}

// ─── Study Plans ──────────────────────────────────────────────────────────────
export function handleGetStudyPlan(bookingId: string) {
  const plan = db.studyPlans.find((p) => p.bookingId === bookingId);
  if (!plan)
    return { status: 404, data: { ok: false, error: "Study plan not found" } };
  return { status: 200, data: { ok: true, plan } };
}

export function handleCreateStudyPlan(body: Partial<StudyPlan>) {
  const userId = currentUserId();
  const booking = db.enhancedBookings.find((b) => b.id === body.bookingId);

  if (!booking)
    return { status: 404, data: { ok: false, error: "Booking not found" } };
  if (booking.tutorId !== userId) {
    return {
      status: 403,
      data: { ok: false, error: "Only assigned tutor can create plan" },
    };
  }
  if (!booking.isConfirmedByTutor) {
    return {
      status: 400,
      data: { ok: false, error: "Please confirm booking first" },
    };
  }

  const plan: StudyPlan = {
    id: `sp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    bookingId: body.bookingId!,
    tutorId: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "DRAFT",
    overview: body.overview || "",
    duration: body.duration || "",
    weeklyPlans: body.weeklyPlans || [],
    suggestedSchedule: body.suggestedSchedule,
    materialsNeeded: body.materialsNeeded,
    tutorNotes: body.tutorNotes,
  };

  db.studyPlans.push(plan);
  booking.studyPlanId = plan.id;
  db.saveStudyPlans();
  db.saveEnhancedBookings();

  return { status: 201, data: { ok: true, plan } };
}

export function handleSendStudyPlan(planId: string) {
  const plan = db.studyPlans.find((p) => p.id === planId);
  if (!plan)
    return { status: 404, data: { ok: false, error: "Plan not found" } };

  const userId = currentUserId();
  if (plan.tutorId !== userId) {
    return {
      status: 403,
      data: { ok: false, error: "Only plan owner can send" },
    };
  }

  plan.status = "SENT";
  plan.updatedAt = new Date().toISOString();

  const booking = db.enhancedBookings.find((b) => b.id === plan.bookingId);
  if (booking) {
    booking.status = "PlanSent";
    booking.planSentAt = new Date().toISOString();
    db.saveEnhancedBookings();
  }

  db.saveStudyPlans();
  return { status: 200, data: { ok: true, plan } };
}

export function handleUpdateStudyPlan(
  planId: string,
  body: Partial<StudyPlan>,
) {
  const plan = db.studyPlans.find((p) => p.id === planId);
  if (!plan)
    return { status: 404, data: { ok: false, error: "Plan not found" } };

  const userId = currentUserId();
  if (plan.tutorId !== userId) {
    return {
      status: 403,
      data: { ok: false, error: "Only plan owner can update" },
    };
  }

  Object.assign(plan, {
    ...body,
    id: plan.id,
    bookingId: plan.bookingId,
    tutorId: plan.tutorId,
    createdAt: plan.createdAt,
    updatedAt: new Date().toISOString(),
  });

  db.saveStudyPlans();
  return { status: 200, data: { ok: true, plan } };
}

export function handleAcceptStudyPlan(planId: string) {
  const plan = db.studyPlans.find((p) => p.id === planId);
  if (!plan)
    return { status: 404, data: { ok: false, error: "Plan not found" } };

  const booking = db.enhancedBookings.find((b) => b.id === plan.bookingId);
  const userId = currentUserId();

  if (!booking || booking.parentId !== userId) {
    return {
      status: 403,
      data: { ok: false, error: "Only parent can accept plan" },
    };
  }

  plan.status = "ACCEPTED";
  plan.updatedAt = new Date().toISOString();

  if (booking) {
    booking.planAcceptedAt = new Date().toISOString();
    db.saveEnhancedBookings();
  }

  db.saveStudyPlans();
  return { status: 200, data: { ok: true, plan } };
}

// ─── Conversations & Messages ─────────────────────────────────────────────────
export function handleGetConversation(bookingId: string) {
  const conversation = db.conversations.find((c) => c.bookingId === bookingId);
  if (!conversation) {
    // Create new conversation
    const booking = db.enhancedBookings.find((b) => b.id === bookingId);
    if (!booking)
      return { status: 404, data: { ok: false, error: "Booking not found" } };

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      bookingId,
      parentId: booking.parentId,
      tutorId: booking.tutorId,
      currentContactOwner: booking.currentContactOwner,
      messages: [],
      createdAt: new Date().toISOString(),
    };

    db.conversations.push(newConv);
    db.saveConversations();
    return { status: 200, data: { ok: true, conversation: newConv } };
  }

  return { status: 200, data: { ok: true, conversation } };
}

export function handleSendMessage(
  bookingId: string,
  body: { content: string },
) {
  const userId = currentUserId();
  const user = db.rawUsers.find((u) => u.id === userId);
  if (!user) return { status: 401, data: { ok: false, error: "Unauthorized" } };

  let conversation = db.conversations.find((c) => c.bookingId === bookingId);

  if (!conversation) {
    const booking = db.enhancedBookings.find((b) => b.id === bookingId);
    if (!booking)
      return { status: 404, data: { ok: false, error: "Booking not found" } };

    conversation = {
      id: `conv_${Date.now()}`,
      bookingId,
      parentId: booking.parentId,
      tutorId: booking.tutorId,
      currentContactOwner: booking.currentContactOwner,
      messages: [],
      createdAt: new Date().toISOString(),
    };
    db.conversations.push(conversation);
  }

  const message: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    conversationId: conversation.id,
    senderId: userId,
    senderName: user.fullName,
    senderRole: user.role === "parent" ? "PARENT" : "TUTOR",
    content: body.content,
    createdAt: new Date().toISOString(),
    type: "USER",
  };

  conversation.messages.push(message);
  conversation.lastMessageAt = message.createdAt;

  db.saveConversations();
  return { status: 201, data: { ok: true, message } };
}

export function handleChangeContactOwner(
  bookingId: string,
  body: { newOwnerId: string; reason?: string },
) {
  const booking = db.enhancedBookings.find((b) => b.id === bookingId);
  if (!booking)
    return { status: 404, data: { ok: false, error: "Booking not found" } };

  const newOwner = db.rawUsers.find((u) => u.id === body.newOwnerId);
  if (!newOwner)
    return { status: 404, data: { ok: false, error: "User not found" } };

  const oldOwner = booking.currentContactOwner;

  const newContactOwner = {
    userId: body.newOwnerId,
    name: newOwner.fullName,
    role: (newOwner.role === "admin" ? "ADMIN" : "SUPPORT_STAFF") as
      | "ADMIN"
      | "SUPPORT_STAFF",
    avatarUrl: newOwner.avatarUrl,
    assignedAt: new Date().toISOString(),
  };

  booking.currentContactOwner = newContactOwner;

  const change = {
    id: `coh_${Date.now()}`,
    bookingId,
    from: oldOwner || null,
    to: newContactOwner,
    reason: body.reason || "Contact owner reassigned",
    changedAt: new Date().toISOString(),
    changedBy: currentUserId(),
  };

  booking.contactOwnerHistory.push(change);

  // Add system message to conversation
  const conversation = db.conversations.find((c) => c.bookingId === bookingId);
  if (conversation) {
    const systemMessage: Message = {
      id: `msg_${Date.now()}_sys`,
      conversationId: conversation.id,
      senderId: "system",
      senderName: "System",
      senderRole: "ADMIN",
      content: `Người phụ trách đã thay đổi từ ${oldOwner?.name || "N/A"} sang ${newContactOwner.name}`,
      createdAt: new Date().toISOString(),
      type: "SYSTEM",
      metadata: { contactOwnerChange: change },
    };
    conversation.messages.push(systemMessage);
    conversation.currentContactOwner = newContactOwner;
    db.saveConversations();
  }

  db.saveEnhancedBookings();
  return { status: 200, data: { ok: true, booking } };
}
