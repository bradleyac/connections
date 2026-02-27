import { fetchConnections } from "$lib/connections.js";

export const load = async ({ url }) => {
  const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
  let connections: string[] = [];
  try {
    connections = await fetchConnections(date);
  }
  catch (e) {
    connections = ["CONNECTIONS", "WORDS", "WERE", "NOT", "FOUND", "FOR", "SELECTED", "DATE", "PLEASE", "TRY", "ANOTHER", "ONE", "OR", "CHECK", "BACK", "LATER"];
  }
  return {
    date,
    connections
  }
}