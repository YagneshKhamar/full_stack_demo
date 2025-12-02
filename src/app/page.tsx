"use client";

import { useState } from "react";

type TokenDto = {
  id: string;
  userId: string;
  scopes: string[];
  createdAt: string;
  expiresAt: string;
  token: string;
};

export default function HomePage() {
  // Create token form state
  const [userId, setUserId] = useState("");
  const [scopesInput, setScopesInput] = useState("");
  const [expiresInMinutes, setExpiresInMinutes] = useState(60);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<TokenDto | null>(null);

  // List tokens state
  const [queryUserId, setQueryUserId] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenDto[]>([]);

  async function handleCreateToken(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreatedToken(null);

    const trimmedUserId = userId.trim();
    const scopes = scopesInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (!trimmedUserId) {
      setCreateError("userId is required");
      return;
    }
    if (scopes.length === 0) {
      setCreateError("At least one scope is required");
      return;
    }
    if (!expiresInMinutes || expiresInMinutes <= 0) {
      setCreateError("expiresInMinutes must be > 0");
      return;
    }

    setCreateLoading(true);
    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_TOKENS_API_KEY ?? "",
        },
        body: JSON.stringify({
          userId: trimmedUserId,
          scopes,
          expiresInMinutes,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCreateError(
          data?.message || `Failed to create token (status ${res.status})`
        );
        return;
      }

      const data = (await res.json()) as TokenDto;
      setCreatedToken(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setCreateError(err?.message || "Network error");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleListTokens() {
    setListError(null);
    setTokens([]);

    const trimmedUserId = queryUserId.trim();
    if (!trimmedUserId) {
      setListError("userId is required to list tokens");
      return;
    }

    setListLoading(true);
    try {
      const res = await fetch(
        `/api/tokens?userId=${encodeURIComponent(trimmedUserId)}`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_TOKENS_API_KEY ?? "",
          },
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setListError(
          data?.message || `Failed to fetch tokens (status ${res.status})`
        );
        return;
      }

      const data = (await res.json()) as TokenDto[];
      setTokens(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setListError(err?.message || "Network error");
    } finally {
      setListLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto max-w-5xl px-4">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          Token Management Demo
        </h1>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Create Token */}
          <section className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-800">
              Create Token
            </h2>
            <form className="space-y-4" onSubmit={handleCreateToken}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  userId
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. user-123"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  scopes (comma-separated)
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  value={scopesInput}
                  onChange={(e) => setScopesInput(e.target.value)}
                  placeholder="e.g. read, write"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  expiresInMinutes
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  value={expiresInMinutes}
                  onChange={(e) => setExpiresInMinutes(Number(e.target.value))}
                  min={1}
                />
              </div>

              {createError && (
                <p className="text-sm text-red-600">{createError}</p>
              )}

              <button
                type="submit"
                disabled={createLoading}
                className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {createLoading ? "Creating..." : "Create Token"}
              </button>
            </form>

            {createdToken && (
              <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm">
                <h3 className="mb-2 font-semibold text-emerald-900">
                  Token created
                </h3>
                <div className="space-y-1 text-emerald-900">
                  <p>
                    <span className="font-medium">ID:</span> {createdToken.id}
                  </p>
                  <p>
                    <span className="font-medium">User:</span>{" "}
                    {createdToken.userId}
                  </p>
                  <p>
                    <span className="font-medium">Scopes:</span>{" "}
                    {createdToken.scopes.join(", ")}
                  </p>
                  <p className="break-all">
                    <span className="font-medium">Token:</span>{" "}
                    {createdToken.token}
                  </p>
                  <p>
                    <span className="font-medium">Expires at:</span>{" "}
                    {new Date(createdToken.expiresAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* List Tokens */}
          <section className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-800">
              List Active Tokens
            </h2>

            <div className="mb-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  userId to query
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  value={queryUserId}
                  onChange={(e) => setQueryUserId(e.target.value)}
                  placeholder="e.g. user-123"
                />
              </div>

              {listError && <p className="text-sm text-red-600">{listError}</p>}

              <button
                type="button"
                onClick={handleListTokens}
                disabled={listLoading}
                className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {listLoading ? "Loading..." : "Fetch Tokens"}
              </button>
            </div>

            <div className="mt-4 max-h-80 space-y-3 overflow-auto">
              {tokens.length === 0 && !listLoading && (
                <p className="text-sm text-slate-500">
                  No active tokens found for this user.
                </p>
              )}

              {tokens.map((t) => (
                <div
                  key={t.id}
                  className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-black"
                >
                  <p className="mb-1 text-xs font-semibold text-slate-600">
                    {t.id}
                  </p>
                  <p>
                    <span className="font-medium">User:</span> {t.userId}
                  </p>
                  <p>
                    <span className="font-medium">Scopes:</span>{" "}
                    {t.scopes.join(", ")}
                  </p>
                  <p className="break-all">
                    <span className="font-medium">Token:</span> {t.token}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Created: {new Date(t.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    Expires: {new Date(t.expiresAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
