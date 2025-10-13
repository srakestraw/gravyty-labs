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
  color: string;
  path: string;
}
