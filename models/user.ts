export interface currentUser {
  id: string;
  department: string[];
  email: string;
  display_name: string;
  birthdate: string;
  image_url: string;
}

export interface User {
  id: string;
  display_name: string;
  birthdate: string;
  photo_url: string;
  email: string;
  period: string;
}
