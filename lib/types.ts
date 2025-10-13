export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
}

export interface App {
  id: string;
  name: string;
  shortName: string;
  icon: string; // Font Awesome class string
  color: string;
  path: string;
}
