import { apiClient } from "@/lib/apiClient";
import type { SessionFeedback, TutorFeedbackSummary } from "@/types";

export interface CreateSessionFeedbackInput {
  bookingId: string;
  teachingMethod: number;
  punctuality: number;
  communication: number;
  lessonPreparation: number;
  notes?: string;
}

export async function submitSessionFeedback(
  input: CreateSessionFeedbackInput,
): Promise<{ ok: boolean; feedback?: SessionFeedback; error?: string }> {
  try {
    const { data } = await apiClient.post<{ ok: boolean; feedback: SessionFeedback }>(
      "/session-feedback",
      input,
    );
    return { ok: true, feedback: data.feedback };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
      "Không thể gửi feedback.";
    return { ok: false, error: msg };
  }
}

export async function getSessionFeedbackByBooking(
  bookingId: string,
): Promise<SessionFeedback | null> {
  try {
    const { data } = await apiClient.get<{ ok: boolean; feedback: SessionFeedback | null }>(
      `/session-feedback/booking/${bookingId}`,
    );
    return data.feedback;
  } catch {
    return null;
  }
}

export async function getTutorFeedbackSummary(
  tutorId: string,
): Promise<TutorFeedbackSummary> {
  try {
    const { data } = await apiClient.get<{
      ok: boolean;
      count: number;
      summary: TutorFeedbackSummary["summary"];
    }>(`/session-feedback/tutor/${tutorId}/summary`);
    return { count: data.count, summary: data.summary };
  } catch {
    return {
      count: 0,
      summary: {
        teachingMethod: 0,
        punctuality: 0,
        communication: 0,
        lessonPreparation: 0,
      },
    };
  }
}
