// ============================================================
// TYPES MESSAGERIE — src/types/message.ts
// ============================================================

export type Conversation = {
  id:            string;
  participants:  string[];   // [patientId, doctorId] (UID Auth)
  patientId:     string;
  doctorId:      string;
  patientName:   string;
  doctorName:    string;
  specialty?:    string;
  lastMessage?:  string;
  lastSenderId?: string;
  updatedAt?:    any;        // Timestamp Firestore
  unread?:       Record<string, number>; // non-lus par UID
};

export type Message = {
  id:         string;
  senderId:   string;
  senderName: string;
  text:       string;
  createdAt?: any;           // Timestamp Firestore
};
