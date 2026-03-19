/**
 * API Client for Enhanced Booking Features
 * Connects to mock backend with privacy-aware endpoints
 */

import { apiClient } from "@/lib/apiClient";
import type {
  EnhancedBooking,
  StudyPlan,
  Conversation,
  Message,
} from "@/types/booking-enhanced";

// ─── Enhanced Bookings ─────────────────────────────────────────────────────────
export const enhancedBookingApi = {
  /**
   * Get enhanced booking by ID
   * Privacy: Returns limited info if not confirmed by tutor
   */
  getBooking: async (id: string) => {
    const { data } = await apiClient.get<{
      ok: boolean;
      booking: EnhancedBooking;
    }>(`/enhanced-bookings/${id}`);
    return data.booking;
  },

  /**
   * Tutor confirms booking
   * Privacy: Unlocks full details for tutor
   */
  confirmBooking: async (id: string) => {
    const { data } = await apiClient.put<{
      ok: boolean;
      booking: EnhancedBooking;
    }>(`/enhanced-bookings/${id}/confirm`);
    return data.booking;
  },
};

// ─── Study Plans ───────────────────────────────────────────────────────────────
export const studyPlanApi = {
  /**
   * Get study plan by booking ID
   */
  getByBookingId: async (bookingId: string) => {
    const { data } = await apiClient.get<{ ok: boolean; plan: StudyPlan }>(
      `/study-plans/booking/${bookingId}`,
    );
    return data.plan;
  },

  /**
   * Create new study plan (tutor only)
   */
  create: async (plan: Partial<StudyPlan>) => {
    const { data } = await apiClient.post<{ ok: boolean; plan: StudyPlan }>(
      "/study-plans",
      plan,
    );
    return data.plan;
  },

  /**
   * Update existing study plan (tutor only)
   */
  update: async (planId: string, updates: Partial<StudyPlan>) => {
    const { data } = await apiClient.put<{ ok: boolean; plan: StudyPlan }>(
      `/study-plans/${planId}`,
      updates,
    );
    return data.plan;
  },

  /**
   * Send study plan to parent (tutor only)
   * Changes status from DRAFT → SENT
   */
  send: async (planId: string) => {
    const { data } = await apiClient.put<{ ok: boolean; plan: StudyPlan }>(
      `/study-plans/${planId}/send`,
    );
    return data.plan;
  },

  /**
   * Accept study plan (parent only)
   * Changes status from SENT → ACCEPTED
   */
  accept: async (planId: string) => {
    const { data } = await apiClient.put<{ ok: boolean; plan: StudyPlan }>(
      `/study-plans/${planId}/accept`,
    );
    return data.plan;
  },
};

// ─── Conversations & Chat ──────────────────────────────────────────────────────
export const conversationApi = {
  /**
   * Get conversation by booking ID
   * Creates new conversation if doesn't exist
   */
  getByBookingId: async (bookingId: string) => {
    const { data } = await apiClient.get<{
      ok: boolean;
      conversation: Conversation;
    }>(`/conversations/booking/${bookingId}`);
    return data.conversation;
  },

  /**
   * Send message in conversation
   */
  sendMessage: async (bookingId: string, content: string) => {
    const { data } = await apiClient.post<{ ok: boolean; message: Message }>(
      `/conversations/booking/${bookingId}/messages`,
      { content },
    );
    return data.message;
  },

  /**
   * Change contact owner (admin only)
   */
  changeContactOwner: async (
    bookingId: string,
    newOwnerId: string,
    reason?: string,
  ) => {
    const { data } = await apiClient.put<{
      ok: boolean;
      booking: EnhancedBooking;
    }>(`/conversations/booking/${bookingId}/change-owner`, {
      newOwnerId,
      reason,
    });
    return data.booking;
  },
};

// ─── React Query Hooks (Optional but recommended) ──────────────────────────────
// If using @tanstack/react-query:

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useEnhancedBooking = (bookingId: string) => {
  return useQuery({
    queryKey: ["enhancedBooking", bookingId],
    queryFn: () => enhancedBookingApi.getBooking(bookingId),
    enabled: !!bookingId,
  });
};

export const useConfirmBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) =>
      enhancedBookingApi.confirmBooking(bookingId),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({
        queryKey: ["enhancedBooking", booking.id],
      });
    },
  });
};

export const useStudyPlan = (bookingId: string) => {
  return useQuery({
    queryKey: ["studyPlan", bookingId],
    queryFn: () => studyPlanApi.getByBookingId(bookingId),
    enabled: !!bookingId,
  });
};

export const useCreateStudyPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (plan: Partial<StudyPlan>) => studyPlanApi.create(plan),
    onSuccess: (plan) => {
      queryClient.invalidateQueries({
        queryKey: ["studyPlan", plan.bookingId],
      });
    },
  });
};

export const useSendStudyPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => studyPlanApi.send(planId),
    onSuccess: (plan) => {
      queryClient.invalidateQueries({
        queryKey: ["studyPlan", plan.bookingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["enhancedBooking", plan.bookingId],
      });
    },
  });
};

export const useConversation = (bookingId: string) => {
  return useQuery({
    queryKey: ["conversation", bookingId],
    queryFn: () => conversationApi.getByBookingId(bookingId),
    enabled: !!bookingId,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      content,
    }: {
      bookingId: string;
      content: string;
    }) => conversationApi.sendMessage(bookingId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.bookingId],
      });
    },
  });
};
