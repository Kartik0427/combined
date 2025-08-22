
// Mock EventSource server simulation
// In a real application, this would be implemented on your backend

interface MockLawyerData {
  [lawyerId: string]: {
    availability: { audio: boolean; video: boolean; chat: boolean };
    isOnline: boolean;
    lastActive: Date;
  };
}

class MockEventSourceServer {
  private clients: Set<(data: string) => void> = new Set();
  private lawyerData: MockLawyerData = {};
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeSampleData();
    this.startSimulation();
  }

  private initializeSampleData(): void {
    // Initialize with some sample lawyers
    const lawyerIds = ['gqy3IKSZIaJDQHGijuuh', 'lawyer2', 'lawyer3', 'lawyer4', 'lawyer5'];
    lawyerIds.forEach(id => {
      this.lawyerData[id] = {
        availability: { 
          audio: Math.random() > 0.5, 
          video: Math.random() > 0.5, 
          chat: Math.random() > 0.5 
        },
        isOnline: Math.random() > 0.3,
        lastActive: new Date()
      };
    });
  }

  public addClient(callback: (data: string) => void): () => void {
    this.clients.add(callback);
    
    // Send initial data to new client
    Object.entries(this.lawyerData).forEach(([lawyerId, data]) => {
      this.sendAvailabilityUpdate(lawyerId, data, callback);
    });

    // Return unsubscribe function
    return () => {
      this.clients.delete(callback);
    };
  }

  private startSimulation(): void {
    // Simulate random availability changes every 3-8 seconds
    this.intervalId = setInterval(() => {
      this.simulateAvailabilityChange();
    }, Math.random() * 5000 + 3000);
  }

  private simulateAvailabilityChange(): void {
    const lawyerIds = Object.keys(this.lawyerData);
    if (lawyerIds.length === 0) return;

    const randomLawyerId = lawyerIds[Math.floor(Math.random() * lawyerIds.length)];
    const currentData = this.lawyerData[randomLawyerId];
    
    // Randomly change availability
    const changeType = Math.random();
    
    if (changeType < 0.4) {
      // Change service availability
      const services = ['audio', 'video', 'chat'] as const;
      const randomService = services[Math.floor(Math.random() * services.length)];
      currentData.availability[randomService] = !currentData.availability[randomService];
      currentData.lastActive = new Date();
      
      console.log(`[Mock EventSource] ${randomLawyerId} ${randomService} availability changed to ${currentData.availability[randomService]}`);
      this.broadcastAvailabilityUpdate(randomLawyerId, currentData);
    } else if (changeType < 0.7) {
      // Change online status
      currentData.isOnline = !currentData.isOnline;
      currentData.lastActive = new Date();
      
      console.log(`[Mock EventSource] ${randomLawyerId} online status changed to ${currentData.isOnline}`);
      this.broadcastOnlineStatus(randomLawyerId, currentData.isOnline);
      this.broadcastAvailabilityUpdate(randomLawyerId, currentData);
    }
  }

  private broadcastAvailabilityUpdate(lawyerId: string, data: MockLawyerData[string]): void {
    this.clients.forEach(client => {
      this.sendAvailabilityUpdate(lawyerId, data, client);
    });
  }

  private broadcastOnlineStatus(lawyerId: string, isOnline: boolean): void {
    const message = JSON.stringify({ lawyerId, isOnline });
    this.clients.forEach(client => {
      client(`event: online-status\ndata: ${message}\n\n`);
    });
  }

  private sendAvailabilityUpdate(lawyerId: string, data: MockLawyerData[string], client: (data: string) => void): void {
    const message = JSON.stringify({
      lawyerId,
      availability: data.availability,
      isOnline: data.isOnline,
      lastActive: data.lastActive.toISOString()
    });
    
    client(`event: availability-update\ndata: ${message}\n\n`);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.clients.clear();
  }
}

// Singleton instance
export const mockEventSourceServer = new MockEventSourceServer();

// Custom EventSource implementation that extends the native interface
interface MockEventSource extends EventSource {
  listeners: Map<string, ((event: MessageEvent) => void)[]>;
  unsubscribe: (() => void) | null;
}

// Mock the EventSource for demonstration
export const createMockEventSource = (url: string): EventSource => {
  // Create a custom object that implements EventSource interface
  const listeners = new Map<string, ((event: MessageEvent) => void)[]>();
  let unsubscribe: (() => void) | null = null;
  let readyState = EventSource.CONNECTING;

  const mockEventSource: MockEventSource = {
    readyState,
    url,
    withCredentials: false,
    CONNECTING: EventSource.CONNECTING,
    OPEN: EventSource.OPEN,
    CLOSED: EventSource.CLOSED,
    onopen: null,
    onmessage: null,
    onerror: null,
    listeners,
    unsubscribe,
    
    addEventListener(type: string, listener: (event: MessageEvent) => void): void {
      if (!this.listeners.has(type)) {
        this.listeners.set(type, []);
      }
      this.listeners.get(type)!.push(listener);
    },
    
    removeEventListener(type: string, listener: (event: MessageEvent) => void): void {
      const eventListeners = this.listeners.get(type);
      if (eventListeners) {
        const index = eventListeners.indexOf(listener);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    },
    
    dispatchEvent(event: Event): boolean {
      return true;
    },
    
    close(): void {
      (this as any).readyState = EventSource.CLOSED;
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    }
  } as MockEventSource;

  // Simulate connection
  setTimeout(() => {
    (mockEventSource as any).readyState = EventSource.OPEN;
    if (mockEventSource.onopen) {
      mockEventSource.onopen(new Event('open'));
    }
    
    // Subscribe to mock server
    mockEventSource.unsubscribe = mockEventSourceServer.addClient((data) => {
      const lines = data.split('\n');
      let eventType = 'message';
      let eventData = '';
      
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventType = line.substring(7);
        } else if (line.startsWith('data: ')) {
          eventData = line.substring(6);
        }
      }
      
      if (eventData) {
        const messageEvent = new MessageEvent(eventType, {
          data: eventData,
          origin: window.location.origin,
          source: window
        });
        
        const eventListeners = mockEventSource.listeners.get(eventType);
        if (eventListeners) {
          eventListeners.forEach((listener: (event: MessageEvent) => void) => listener(messageEvent));
        }
      }
    });
  }, 100);

  return mockEventSource as EventSource;
};
