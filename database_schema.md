
# Firebase Firestore Database Schema

## Collections Structure

### 1. users
```javascript
{
  userId: "j0bYugrGBuT7PUt4b59Xa4aLzaq2", // Firebase Auth UID
  displayName: "Jhon DON",
  email: "tyahoo@gmail.com",
  phoneNumber: "5225588896",
  photoURL: null,
  createdAt: timestamp,
  role: "user", // "user" | "lawyer" | "admin"
  isVerified: false,
  preferences: {
    notifications: true,
    language: "en"
  }
}
```

### 2. lawyer_profiles
```javascript
{
  id: "gqy3IKSZIaJDQHGijuuh", // Same as Firebase Auth UID for lawyers
  name: "lawyer 1",
  email: "adv.anuj@example.com",
  phoneNumber: "+91 98765 43210",
  image: "gs://legal-port.firebasestorage.app/lawyer1.jpg",
  experience: 3, // years
  connections: 23,
  rating: 4.5,
  reviews: 150,
  isOnline: true,
  lastActive: timestamp,
  verified: true,
  
  // Availability settings (controlled by lawyer)
  availability: {
    audio: true,
    video: false,
    chat: true
  },
  
  // Pricing per minute in INR
  pricing: {
    audio: 30,
    chat: 12,
    video: 20
  },
  
  // Specializations (references to categories)
  specializations: ["Mkm3WeIk35qDCCN2UnF"], // Array of category IDs
  
  // Profile details
  bio: "Experienced lawyer specializing in criminal and civil law...",
  education: [
    {
      degree: "LLB",
      institution: "Delhi University",
      year: 2018
    }
  ],
  
  // Working hours
  workingHours: {
    monday: { start: "09:00", end: "18:00", available: true },
    tuesday: { start: "09:00", end: "18:00", available: true },
    // ... other days
  },
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. categories
```javascript
{
  id: "Mkm3WeIk35qDCCN2UnF",
  names: {
    0: "Matrimonial",
    1: "Commercial"
  },
  description: "Legal matters related to marriage and family",
  isActive: true,
  createdAt: timestamp
}
```

### 4. consultation_requests
```javascript
{
  id: "QFqSLFbRvZnoSDDnfNNy",
  clientId: "j0bYugrGBuT7PUt4b59Xa4aLzaq2",
  lawyerId: "gqy3IKSZIaJDQHGijuuh",
  
  // Client information
  clientInfo: {
    name: "Jhon DON",
    email: "tyahoo@gmail.com",
    phone: "5225588896"
  },
  
  serviceType: "audio", // "audio" | "video" | "chat"
  
  status: "pending", // "pending" | "accepted" | "rejected" | "completed" | "cancelled"
  
  // Request details
  description: "I need legal advice regarding...",
  category: "Mkm3WeIk35qDCCN2UnF", // Category ID
  urgency: "medium", // "low" | "medium" | "high"
  estimatedDuration: 30, // minutes
  
  // Timestamps
  timestamp: timestamp,
  scheduledAt: timestamp, // When the consultation is scheduled
  
  // Pricing
  ratePerMinute: 30,
  estimatedCost: 900,
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 5. active_sessions
```javascript
{
  id: "QNEYaeJ6IyyQwjWqUqzj",
  clientId: "j0bYugrGBuT7PUt4b59Xa4aLzaq2",
  lawyerId: "gqy3IKSZIaJDQHGijuuh",
  consultationRequestId: "QFqSLFbRvZnoSDDnfNNy",
  
  status: "active", // "active" | "ended" | "paused"
  type: "audio", // "audio" | "video" | "chat"
  
  startedAt: timestamp,
  endedAt: null,
  duration: 0, // in minutes, updated in real-time
  
  // Session metadata
  sessionData: {
    roomId: "session_12345",
    recordingEnabled: false,
    chatHistory: [] // For text messages during call
  }
}
```

### 6. sessions (completed sessions)
```javascript
{
  id: "SQQpIukYu4SZ5rmMFQAJ",
  userId: "j0bYugrGBuT7PUt4b59Xa4aLzaq2",
  lawyerId: "gqy3IKSZIaJDQHGijuuh",
  consultationRequestId: "QFqSLFbRvZnoSDDnfNNy",
  
  serviceType: "audio",
  duration: 25, // minutes
  cost: 750, // total cost in INR
  
  // Session details
  startedAt: timestamp,
  endedAt: timestamp,
  
  // Ratings and feedback
  clientRating: 5,
  clientFeedback: "Very helpful session",
  lawyerNotes: "Provided advice on property dispute",
  
  status: "completed",
  paymentStatus: "paid", // "pending" | "paid" | "refunded"
  
  createdAt: timestamp
}
```

### 7. chat_rooms
```javascript
{
  id: "room_clientId_lawyerId",
  participants: {
    client: "j0bYugrGBuT7PUt4b59Xa4aLzaq2",
    lawyer: "gqy3IKSZIaJDQHGijuuh"
  },
  
  lastMessage: {
    text: "Thank you for the consultation",
    sender: "client", // "client" | "lawyer"
    timestamp: timestamp
  },
  
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 8. messages (subcollection of chat_rooms)
```javascript
// Path: chat_rooms/{roomId}/messages/{messageId}
{
  id: "msg_12345",
  senderId: "j0bYugrGBuT7PUt4b59Xa4aLzaq2",
  senderType: "client", // "client" | "lawyer"
  text: "Hello, I need legal advice",
  
  timestamp: timestamp,
  read: false,
  
  // Optional fields
  attachments: [
    {
      type: "document",
      url: "gs://legal-port.firebasestorage.app/documents/doc1.pdf",
      name: "contract.pdf"
    }
  ]
}
```

### 9. notifications
```javascript
{
  id: "notif_12345",
  userId: "j0bYugrGBuT7PUt4b59Xa4aLzaq2", // Can be client or lawyer
  type: "consultation_request", // "consultation_request" | "session_started" | "payment" | etc.
  
  title: "New Consultation Request",
  message: "You have a new consultation request from Jhon DON",
  
  data: {
    consultationRequestId: "QFqSLFbRvZnoSDDnfNNy",
    actionUrl: "/consultation/QFqSLFbRvZnoSDDnfNNy"
  },
  
  read: false,
  createdAt: timestamp
}
```

## Security Rules (firestore.rules)

The security rules should be updated to handle proper authentication and authorization:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Lawyer profiles - lawyers can update their own, users can read
    match /lawyer_profiles/{lawyerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == lawyerId;
    }
    
    // Categories - read only for all authenticated users
    match /categories/{categoryId} {
      allow read: if request.auth != null;
    }
    
    // Consultation requests
    match /consultation_requests/{requestId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.clientId || 
         request.auth.uid == resource.data.lawyerId);
      allow create: if request.auth != null && request.auth.uid == request.resource.data.clientId;
      allow update: if request.auth != null && request.auth.uid == resource.data.lawyerId;
    }
    
    // Sessions and active sessions
    match /{path=**}/sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.uid == resource.data.lawyerId);
    }
    
    // Chat rooms and messages
    match /chat_rooms/{roomId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants.values();
        
      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
          request.auth.uid == resource.data.senderId;
      }
    }
    
    // Notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Key Features of this Schema:

1. **Real-time Availability**: Lawyers can toggle their availability for different services
2. **Authentication Integration**: Uses Firebase Auth UIDs as document IDs
3. **Flexible Pricing**: Each lawyer sets their own rates per service type
4. **Session Management**: Tracks both active and completed sessions
5. **Category-based Specializations**: Lawyers are linked to categories for filtering
6. **Chat System**: Supports real-time messaging between clients and lawyers
7. **Comprehensive Request Management**: Full lifecycle from request to completion
8. **Security**: Proper Firestore security rules to protect user data
