export interface TimeRecord {
  id: string;
  date: Date;
  coordinates: {
    lat: number;
    lng: number;
  };
  userID: string;
  requestID: string;
  createdAt: Date;
}
