/**
 * Browser Web Notifications API wrapper.
 * Handles permission request, sending notifications, and
 * auto-triggering on CRITICAL incidents.
 */

export type NotificationPermission = 'default' | 'granted' | 'denied';

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission as NotificationPermission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  const result = await Notification.requestPermission();
  return result as NotificationPermission;
}

export interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export function sendBrowserNotification(opts: PushNotificationOptions): Notification | null {
  if (!('Notification' in window) || Notification.permission !== 'granted') return null;

  const n = new Notification(opts.title, {
    body: opts.body,
    icon: opts.icon ?? '/icon-192.png',
    tag: opts.tag,
    requireInteraction: opts.requireInteraction ?? false,
    silent: false,
  });

  // Auto-close after 8 seconds if not requireInteraction
  if (!opts.requireInteraction) {
    setTimeout(() => n.close(), 8000);
  }

  return n;
}

/** Send a critical incident alert notification */
export function notifyCriticalIncident(incidentType: string, location: string) {
  sendBrowserNotification({
    title: `🚨 CRITICAL: ${incidentType.replace(/_/g, ' ')}`,
    body: `New critical incident reported near ${location}. Immediate response required.`,
    tag: 'critical-incident',
    requireInteraction: true,
  });
}

/** Send an alert broadcast notification */
export function notifyAlertBroadcast(channel: string, preview: string) {
  sendBrowserNotification({
    title: `📢 Alert Broadcast via ${channel}`,
    body: preview.slice(0, 100),
    tag: 'alert-broadcast',
  });
}
