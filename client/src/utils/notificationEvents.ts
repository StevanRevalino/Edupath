// Custom events for notification updates

export const NOTIFICATION_EVENTS = {
  CONSULTATION_UPDATED: "consultationUpdated",
  CHAT_UPDATED: "chatUpdated",
} as const;

export const triggerNotificationRefresh = () => {
  window.dispatchEvent(
    new CustomEvent(NOTIFICATION_EVENTS.CONSULTATION_UPDATED)
  );
};

export const triggerChatRefresh = () => {
  window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENTS.CHAT_UPDATED));
};
