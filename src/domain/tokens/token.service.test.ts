import { describe, it, expect } from "vitest";
import { calculateExpiresAt } from "./token.utils";

describe("calculateExpiresAt", () => {
  it("adds the correct number of minutes", () => {
    const createdAt = new Date("2025-01-01T10:00:00.000Z");

    const result = calculateExpiresAt(createdAt, 60);

    expect(result.toISOString()).toBe("2025-01-01T11:00:00.000Z");
  });

  it("can handle non-round minute values", () => {
    const createdAt = new Date("2025-01-01T10:00:00.000Z");

    const result = calculateExpiresAt(createdAt, 30);

    expect(result.toISOString()).toBe("2025-01-01T10:30:00.000Z");
  });

  it("returns a new Date instance and does not mutate the input", () => {
    const createdAt = new Date("2025-01-01T10:00:00.000Z");

    const result = calculateExpiresAt(createdAt, 10);

    expect(result).not.toBe(createdAt);
    expect(createdAt.toISOString()).toBe("2025-01-01T10:00:00.000Z");
  });
});
