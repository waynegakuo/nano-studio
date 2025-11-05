export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  imageGenerations?: number;
  lastGenerationDate?: string;
}
