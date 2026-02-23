export async function fetchConnections(date: Date | string): Promise<string[]> {
  let formatted = date instanceof Date ? date.toISOString().slice(0, 10) : date;

  const connectionsUrl = `https://www.nytimes.com/svc/connections/v2/${formatted}.json`;
  const json = await (await fetch(connectionsUrl, { method: 'GET', referrer: '' })).json();

  // TODO: This only works for strings. Sometimes they have SVGs.
  return json.categories.flatMap((cat: any) => cat.cards.map((c: any) => c.content)).toSorted();
}