
export interface LawyerAvailabilityUpdate {
  lawyerId: string;
  availability: {
    audio: boolean;
    video: boolean;
    chat: boolean;
  };
  isOnline: boolean;
  lastActive: Date;
}

export interface EventSourceCallbacks {
  onAvailabilityUpdate?: (update: LawyerAvailabilityUpdate) => void;
  onLawyerOnlineStatus?: (lawyerId: string, isOnline: boolean) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

class EventSourceManager {
  private eventSource: EventSource | null = null;
  private callbacks: EventSourceCallbacks = {};
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000; // Start with 1 second
  private isManuallyDisconnected: boolean = false;

  constructor() {
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);
  }

  public connect(callbacks: EventSourceCallbacks = {}): void {
    this.callbacks = callbacks;
    this.isManuallyDisconnected = false;
    this.createEventSource();
    this.setupEventListeners();
  }

  public disconnect(): void {
    this.isManuallyDisconnected = true;
    this.cleanup();
  }

  public isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  private createEventSource(): void {
    try {
      // Import mock EventSource for demonstration
      // In production, replace this with: new EventSource('/api/lawyer-updates-stream')
      import('./mockEventSource').then(({ createMockEventSource }) => {
        this.eventSource = createMockEventSource('/api/lawyer-updates-stream');
        
        this.eventSource.onopen = this.handleOpen.bind(this);
        this.eventSource.onerror = this.handleError.bind(this);
        
        // Listen for lawyer availability updates
        this.eventSource.addEventListener('availability-update', this.handleAvailabilityUpdate.bind(this));
        
        // Listen for lawyer online status changes
        this.eventSource.addEventListener('online-status', this.handleOnlineStatus.bind(this));
      }).catch(error => {
        console.error('Failed to create EventSource:', error);
        this.scheduleReconnect();
      });
      
    } catch (error) {
      console.error('Failed to create EventSource:', error);
      this.scheduleReconnect();
    }
  }

  private handleOpen(): void {
    console.log('EventSource connected');
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    this.callbacks.onConnect?.();
  }

  private handleError(event: Event): void {
    console.error('EventSource error:', event);
    this.callbacks.onError?.(event);
    
    if (!this.isManuallyDisconnected) {
      this.scheduleReconnect();
    }
  }

  private handleAvailabilityUpdate(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data) as LawyerAvailabilityUpdate;
      data.lastActive = new Date(data.lastActive);
      this.callbacks.onAvailabilityUpdate?.(data);
    } catch (error) {
      console.error('Failed to parse availability update:', error);
    }
  }

  private handleOnlineStatus(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      this.callbacks.onLawyerOnlineStatus?.(data.lawyerId, data.isOnline);
    } catch (error) {
      console.error('Failed to parse online status update:', error);
    }
  }

  private scheduleReconnect(): void {
    if (this.isManuallyDisconnected || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.cleanup();
    this.reconnectAttempts++;
    
    setTimeout(() => {
      if (!this.isManuallyDisconnected) {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.createEventSource();
      }
    }, this.reconnectDelay);

    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
  }

  private setupEventListeners(): void {
    // Listen for page visibility changes to manage connection
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Page is hidden, can optionally disconnect to save resources
      console.log('Page hidden, maintaining connection');
    } else {
      // Page is visible, ensure connection is active
      if (!this.isConnected() && !this.isManuallyDisconnected) {
        console.log('Page visible, reconnecting if needed');
        this.createEventSource();
      }
    }
  }

  private handleOnline(): void {
    console.log('Network online');
    if (!this.isConnected() && !this.isManuallyDisconnected) {
      this.createEventSource();
    }
  }

  private handleOffline(): void {
    console.log('Network offline');
    this.callbacks.onDisconnect?.();
  }

  private cleanup(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}

// Singleton instance
export const eventSourceManager = new EventSourceManager();

// React hook for easier integration
export const useEventSource = (callbacks: EventSourceCallbacks) => {
  const connect = () => eventSourceManager.connect(callbacks);
  const disconnect = () => eventSourceManager.disconnect();
  const isConnected = () => eventSourceManager.isConnected();

  return { connect, disconnect, isConnected };
};
