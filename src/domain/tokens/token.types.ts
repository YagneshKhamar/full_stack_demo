export interface TokenDto {
  id: string;
  userId: string;
  scopes: string[];
  createdAt: string; // ISO
  expiresAt: string; // ISO
  token: string;
}
