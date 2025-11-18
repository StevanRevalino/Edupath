import { ConsultationRepository } from "../repositories/consultationRepository";

const consultationRepository = new ConsultationRepository();

/**
 * Auto-complete consultations that have passed 1 hour from start time
 * This function should be called periodically (e.g., every 5 minutes)
 */
export async function autoCompleteExpiredConsultations() {
  try {
    const now = new Date();
    // Calculate time 1 hour ago
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Find all active consultations that started more than 1 hour ago
    const expiredConsultations =
      await consultationRepository.findExpiredConsultations(oneHourAgo);

    if (expiredConsultations.length > 0) {
      console.log(
        `[Scheduler] Found ${expiredConsultations.length} expired consultations to auto-complete`
      );

      // Update all expired consultations to inactive and completed
      const consultationIds = expiredConsultations.map(
        (c) => c.consultation_id
      );
      const result = await consultationRepository.bulkUpdateStatus(
        consultationIds,
        "COMPLETED",
        false // is_active = false
      );

      console.log(
        `[Scheduler] Auto-completed ${result.count} consultations that exceeded 1 hour`
      );

      return {
        success: true,
        count: result.count,
        consultations: expiredConsultations.map((c) => ({
          id: c.consultation_id,
          startTime: c.consultation_date,
        })),
      };
    } else {
      return { success: true, count: 0, consultations: [] };
    }
  } catch (error) {
    console.error("[Scheduler] Error auto-completing consultations:", error);
    throw error;
  }
}

/**
 * Start the consultation scheduler
 * Runs every 5 minutes to check for expired consultations
 */
export function startConsultationScheduler() {
  // Run immediately on startup
  autoCompleteExpiredConsultations().catch((error) => {
    console.error("[Scheduler] Initial run failed:", error);
  });

  // Then run every 5 minutes
  const interval = setInterval(() => {
    autoCompleteExpiredConsultations().catch((error) => {
      console.error("[Scheduler] Scheduled run failed:", error);
    });
  }, 5 * 60 * 1000); // 5 minutes

  // Return cleanup function
  return () => {
    clearInterval(interval);
    console.log("[Scheduler] Consultation scheduler stopped");
  };
}
