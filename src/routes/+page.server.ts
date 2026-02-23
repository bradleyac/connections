import { fetchConnections } from "$lib/connections.js";

export const load = async ({ url }) => {
  const date = url.searchParams.get('date');
  return {
    date: date ?? new Date().toISOString().slice(0, 10),
    connections: await fetchConnections(date ?? new Date())
  }
}