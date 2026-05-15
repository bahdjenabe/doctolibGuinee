export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  city: string;
  image?: string;
  rating?: number;
  reviews?: number;
  workingHours?: {
    [day: string]: string[]; // ex: { monday: ["08:00-12:00"] }
  };
};