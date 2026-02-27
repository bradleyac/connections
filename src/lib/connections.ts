import type { ConnectionsCard } from "./types";

export async function fetchConnections(date: string): Promise<ConnectionsCard[]> {
  const connectionsUrl = `https://www.nytimes.com/svc/connections/v2/${date}.json`;
  const json = await (await fetch(connectionsUrl, { method: 'GET', referrer: '' })).json();

  // This works for strings and images. Do they have anything else?
  const result = [...json.categories.flatMap(
    (cat: any) => cat.cards.map((c: any) => c.content
      ? ({ type: 'word', value: c.content, position: c.position })
      : c.image_url
        ? ({ type: 'image', value: c.image_url, position: c.position })
        : null))
    .filter(Boolean)]
    .toSorted((a, b) => a.position - b.position);

  console.log(result);
  return result;
}