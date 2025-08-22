
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
    this.startSimulation();
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
    // Simulate random availability changes every 5-15 seconds
    this.intervalId = setInterval(() => {
      this.simulateAvailabilityChange();
    }, Math.random() * 10000 + 5000);
  }

  private simulateAvailabilityChange(): void {
    const lawyerIds = ['gqy3IKSZIaJDQHGijuuh', 'lawyer2', 'lawyer3', 'lawyer4', 'lawyer5'];
    const randomLawyerId = lawyerIds[Math.floor(Math.random() * lawyerIds.length)];
    
    // Initialize lawyer data if not exists
    if (!this.lawyerData[randomLawyerId]) {
      this.lawyerData[randomLawyerId] = {
        availability: { audio: true, video: true, chat: true },
        isOnline: true,
        lastActive: new Date()
      };
    }

    const currentData = this.lawyerData[randomLawyerId];
    
    // Randomly change availability
    const changeType = Math.random();
    
    if (changeType < 0.3) {
      // Change service availability
      const services = ['audio', 'video', 'chat'] as const;
      const randomService = services[Math.floor(Math.random() * services.length)];
      currentData.availability[randomService] = !currentData.availability[randomService];
      
      this.broadcastAvailabilityUpdate(randomLawyerId, currentData);
    } else if (changeType < 0.6) {
      // Change online status
      currentData.isOnline = !currentData.isOnline;
      currentData.lastActive = new Date();
      
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

// Mock the EventSource for demonstration
export const createMockEventSource = (url: string): EventSource => {
  const mockEventSource = {
    readyState: EventSource.CONNECTING,
    url,
    withCredentials: false,
    CONNECTING: EventSource.CONNECTING,
    OPEN: EventSource.OPEN,
    CLOSED: EventSource.CLOSED,
    onopen: null as ((event: Event) => void) | null,
    onmessage: null as ((event: MessageEvent) => void) | null,
    onerror: null as ((event: Event) => void) | null,
    listeners: new Map<string, ((event: MessageEvent) => void)[]>(),
    
    addEventListener(type: string, listener: (event: MessageEvent) => void): void {
      if (!this.listeners.has(type)) {
        this.listeners.set(type, []);
      }
      this.listeners.get(type)!.push(listener);
    },
    
    removeEventListener(type: string, listener: (event: MessageEvent) => void): void {
      const listeners = this.listeners.get(type);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    },
    
    dispatchEvent(event: Event): boolean {
      return true;
    },
    
    close(): void {
      this.readyState = EventSource.CLOSED;
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    },
    
    unsubscribe: null as (() => void) | null
  } as EventSource;

  // Simulate connection
  setTimeout(() => {
    mockEventSource.readyState = EventSource.OPEN;
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
        
        const listeners = mockEventSource.listeners.get(eventType);
        if (listeners) {
          listeners.forEach(listener => listener(messageEvent));
        }
      }
    });
  }, 100);

  return mockEventSource;
};
