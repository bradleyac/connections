export async function fetchConnections(date: string): Promise<string[]> {
  const connectionsUrl = `https://www.nytimes.com/svc/connections/v2/${date}.json`;
  const json = await (await fetch(connectionsUrl, { method: 'GET', referrer: '' })).json();

  // TODO: This only works for strings. Sometimes they have SVGs.
  return json.categories.flatMap((cat: any) => cat.cards.map((c: any) => c.content)).toSorted();
}