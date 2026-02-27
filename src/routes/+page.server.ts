import { fetchConnections } from "$lib/connections.js";
import type { ConnectionsCard } from "$lib/types.js";

export const load = async ({ url }) => {
  const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
  let connections: ConnectionsCard[] = [];
  try {
    connections = await fetchConnections(date);
  }
  catch (e) {
    connections = ["CONNECTIONS", "WORDS", "WERE", "NOT", "FOUND", "FOR", "SELECTED", "DATE", "PLEASE", "TRY", "ANOTHER", "ONE", "OR", "CHECK", "BACK", "LATER"].map((word, i) => ({ type: 'word', value: word, position: i }));
  }
  return {
    date,
    connections
  }
}