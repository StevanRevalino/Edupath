import { ConsultationRepository } from "../repositories/consultationRepository";
import { notificationRepository } from "../repositories/notificationRepository";

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
 * Notify students about consultations that are about to start (within 5 minutes)
 * This function should be called periodically (e.g., every minute)
 */
export async function notifyUpcomingConsultations() {
  try {
    const now = new Date();
    // Check for consultations starting in the next 5 minutes
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Find all accepted and active consultations starting soon
    const upcomingConsultations = await consultationRepository.findMany({
      status: "ACCEPTED",
      is_active: true,
    });

    // Filter consultations that start within the next 5 minutes
    const consultationsToNotify = upcomingConsultations.filter((c) => {
      const consultationDate = new Date(c.consultation_date);
      return consultationDate > now && consultationDate <= fiveMinutesFromNow;
    });

    if (consultationsToNotify.length > 0) {
      console.log(
        `[Scheduler] Found ${consultationsToNotify.length} consultations starting soon`
      );

      for (const consultation of consultationsToNotify) {
        // Check if notification was already sent (to avoid duplicate notifications)
        const existingNotification = await notificationRepository.findByUserId(
          consultation.murid_id
        );

        const alreadyNotified = existingNotification.some(
          (n) =>
            n.type === "CONSULTATION_STARTING" &&
            n.related_id === consultation.consultation_id &&
            // Only check notifications created in the last 10 minutes
            new Date(n.created_at) > new Date(now.getTime() - 10 * 60 * 1000)
        );

        if (!alreadyNotified) {
          const consultationDate = new Date(consultation.consultation_date);
          const minutesUntilStart = Math.round(
            (consultationDate.getTime() - now.getTime()) / (60 * 1000)
          );

          await notificationRepository.create({
            user_id: consultation.murid_id,
            type: "CONSULTATION_STARTING",
            title: "Konseling Akan Segera Dimulai! 🔔",
            message: `Konseling Anda dengan topik "${consultation.topic}" akan dimulai dalam ${minutesUntilStart} menit. Silakan bergabung ke chat konseling.`,
            related_id: consultation.consultation_id,
            link: `/konseling`,
          });

          console.log(
            `[Scheduler] Sent notification to user ${consultation.murid_id} for consultation ${consultation.consultation_id}`
          );
        }
      }

      return {
        success: true,
        count: consultationsToNotify.length,
      };
    }

    return { success: true, count: 0 };
  } catch (error) {
    console.error("[Scheduler] Error notifying upcoming consultations:", error);
    throw error;
  }
}

/**
 * Start the consultation scheduler
 * Runs every 5 minutes to check for expired consultations
 * Runs every minute to check for upcoming consultations
 */
export function startConsultationScheduler() {
  // Run immediately on startup
  autoCompleteExpiredConsultations().catch((error) => {
    console.error("[Scheduler] Initial auto-complete run failed:", error);
  });

  notifyUpcomingConsultations().catch((error) => {
    console.error("[Scheduler] Initial notification run failed:", error);
  });

  // Auto-complete expired consultations every 5 minutes
  const autoCompleteInterval = setInterval(() => {
    autoCompleteExpiredConsultations().catch((error) => {
      console.error("[Scheduler] Auto-complete scheduled run failed:", error);
    });
  }, 5 * 60 * 1000); // 5 minutes

  // Notify upcoming consultations every minute
  const notificationInterval = setInterval(() => {
    notifyUpcomingConsultations().catch((error) => {
      console.error("[Scheduler] Notification scheduled run failed:", error);
    });
  }, 60 * 1000); // 1 minute

  console.log(
    "[Scheduler] Consultation scheduler started (auto-complete: 5min, notifications: 1min)"
  );

  // Return cleanup function
  return () => {
    clearInterval(autoCompleteInterval);
    clearInterval(notificationInterval);
    console.log("[Scheduler] Consultation scheduler stopped");
  };
}
