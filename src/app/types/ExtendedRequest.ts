import { NextApiRequest } from "next";

export interface User {
  id: string; // Unique identifier for the user
  email: string; // User's email address
  name?: string; // Optional name of the user
  [key: string]: any; // Allows for additional properties as needed
}

export interface ExtendedRequest extends NextApiRequest {
  user?: User;
  logIn(user: User, done: (err: any) => void): void;
  logOut(done: (err: any) => void): void;
  isAuthenticated(): boolean;
}
