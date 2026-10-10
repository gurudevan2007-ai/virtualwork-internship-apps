export type Note = { id: number; body: string; createdAt: string };
export type ProfileCard = { id: number; name: string; bio: string; imageUrl: string; createdAt: string };
export type CoffeeItem = { id: number; slug: string; name: string; description: string; voteCount: number };
export type QuoteEntry = { id: number; quoteId: string; text: string; author: string; createdAt: string };
export type TeamMember = { id: number; slug: string; name: string; role: string; available: boolean };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload as T;
}

export const api = {
  notes: () => request<{ notes: Note[] }>("/api/notes"),
  createNote: (body: string) => request<{ note: Note }>("/api/notes", { method: "POST", body: JSON.stringify({ body }) }),
  createProfile: (profile: { name: string; bio: string; imageUrl: string }) => request<{ profile: ProfileCard }>("/api/profiles", { method: "POST", body: JSON.stringify(profile) }),
  coffees: () => request<{ items: CoffeeItem[] }>("/api/coffee/items"),
  voteCoffee: (id: number) => request<{ item: CoffeeItem }>(`/api/coffee/items/${id}/vote`, { method: "POST", body: JSON.stringify({}) }),
  history: () => request<{ quotes: QuoteEntry[] }>("/api/quotes/history"),
  randomQuote: () => request<{ quote: QuoteEntry }>("/api/quotes/random", { method: "POST", body: JSON.stringify({}) }),
  team: () => request<{ members: TeamMember[] }>("/api/team"),
  setAvailability: (id: number, available: boolean) => request<{ member: TeamMember }>(`/api/team/${id}/availability`, { method: "PATCH", body: JSON.stringify({ available }) }),
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}
