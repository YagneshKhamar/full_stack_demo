import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";
import type { TokenDto } from "./token.types";
import { calculateExpiresAt } from "./token.utils";
import type { CreateTokenInput } from "./token.validation";



export async function createToken(input: CreateTokenInput): Promise<TokenDto> {
  const now = new Date();
  const expiresAt = calculateExpiresAt(now, input.expiresInMinutes);

  const tokenValue = randomUUID();

  const token = await prisma.token.create({
    data: {
      userId: input.userId,
      scopes: input.scopes,
      token: tokenValue,
      createdAt: now,
      expiresAt,
    },
  });

  return mapTokenToDto(token);
}

export async function getActiveTokens(userId: string): Promise<TokenDto[]> {
  const now = new Date();

  const tokens = await prisma.token.findMany({
    where: {
      userId,
      expiresAt: { gt: now },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return tokens.map(mapTokenToDto);
}

function mapTokenToDto(token: {
  id: string;
  userId: string;
  scopes: string[];
  token: string;
  createdAt: Date;
  expiresAt: Date;
}): TokenDto {
  return {
    id: token.id,
    userId: token.userId,
    scopes: token.scopes,
    token: token.token,
    createdAt: token.createdAt.toISOString(),
    expiresAt: token.expiresAt.toISOString(),
  };
}
