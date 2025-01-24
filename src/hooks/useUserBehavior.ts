import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface TrackingEvent {
  type: 'view' | 'search' | 'click' | 'purchase' | 'wishlist';
  itemId?: string;
  itemType?: 'product' | 'category' | 'brand' | 'collection';
  query?: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

// Queue to store events before sending to backend
let eventQueue: TrackingEvent[] = [];
const QUEUE_FLUSH_INTERVAL = 5000; // Flush every 5 seconds
const QUEUE_SIZE_LIMIT = 20; // Flush when queue reaches 20 events

export function useUserBehavior() {
  const { user } = useAuth();

  const trackEvent = (
    type: TrackingEvent['type'],
    {
      itemId,
      itemType,
      query,
      metadata = {}
    }: Omit<TrackingEvent, 'type' | 'timestamp'>
  ) => {
    const event: TrackingEvent = {
      type,
      itemId,
      itemType,
      query,
      metadata: {
        ...metadata,
        url: window.location.pathname,
        referrer: document.referrer,
        deviceType: getDeviceType(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      timestamp: Date.now()
    };

    queueEvent(event);
  };

  // Initialize event flushing
  useEffect(() => {
    const intervalId = setInterval(flushEventQueue, QUEUE_FLUSH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [user?.id]);

  return { trackEvent };
}

// Helper function to determine device type
function getDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// Queue management
function queueEvent(event: TrackingEvent) {
  eventQueue.push(event);
  
  // Flush if queue size exceeds limit
  if (eventQueue.length >= QUEUE_SIZE_LIMIT) {
    flushEventQueue();
  }
}

async function flushEventQueue() {
  if (eventQueue.length === 0) return;

  const events = [...eventQueue];
  eventQueue = []; // Clear queue

  try {
    // TODO: Replace with actual API call
    // This is where you'd send the events to your analytics/tracking backend
    console.log('Sending events to backend:', events);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 100));
    
  } catch (error) {
    // On error, add events back to queue
    eventQueue = [...events, ...eventQueue];
    console.error('Failed to send events:', error);
  }
}
