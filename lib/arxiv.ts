import { parseStringPromise } from "xml2js";

export interface ArxivPaper {
  arxiv_id: string;
  title: string;
  abstract: string;
  authors: string;
  categories: string;
  published: string;
  url: string;
}

const ARXIV_API = "https://export.arxiv.org/api/query";

const QUERIES = [
  // Image generation
  'cat:cs.CV AND ti:"diffusion model"',
  'cat:cs.CV AND ti:"image generation"',
  // Video generation
  'cat:cs.CV AND ti:"video generation"',
  'cat:cs.CV AND ti:"video diffusion"',
  // Audio generation
  'cat:cs.SD AND ti:"diffusion"',
  'cat:eess.AS AND ti:"generation"',
  // 3D generation
  'cat:cs.CV AND ti:"3D generation"',
  'cat:cs.CV AND ti:"gaussian splatting"',
  // Language models
  'cat:cs.CL AND ti:"language model"',
  'cat:cs.CL AND ti:"large language model"',
];

export async function fetchLatestPapers(): Promise<ArxivPaper[]> {
  const seen = new Set<string>();
  const papers: ArxivPaper[] = [];

  for (const q of QUERIES) {
    const url = new URL(ARXIV_API);
    url.searchParams.set("search_query", q);
    url.searchParams.set("sortBy", "submittedDate");
    url.searchParams.set("sortOrder", "descending");
    url.searchParams.set("max_results", "25");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "DiffusionDaily/1.0 (chethmysore@gmail.com)" },
    });

    if (!res.ok) continue;

    const xml = await res.text();
    const parsed = await parseStringPromise(xml, { explicitArray: true });
    const entries = parsed?.feed?.entry ?? [];

    for (const e of entries) {
      const arxivUrl: string = Array.isArray(e.id) ? e.id[0] : e.id;
      const arxivId = arxivUrl.split("/abs/")[1]?.replace(/v\d+$/, "") ?? arxivUrl;

      if (seen.has(arxivId)) continue;
      seen.add(arxivId);

      const title: string = (Array.isArray(e.title) ? e.title[0] : e.title)
        ?.replace(/\s+/g, " ")
        .trim();

      const abstract: string = (Array.isArray(e.summary) ? e.summary[0] : e.summary)
        ?.replace(/\s+/g, " ")
        .trim();

      const authorList: string[] = (e.author ?? []).map((a: { name?: string[] }) =>
        Array.isArray(a.name) ? a.name[0] : ""
      );

      const categories: string[] = (e.category ?? []).map(
        (c: { $?: { term?: string } }) => c?.$?.term ?? ""
      );

      const published: string = Array.isArray(e.published)
        ? e.published[0]
        : e.published ?? "";

      papers.push({
        arxiv_id: arxivId,
        title,
        abstract,
        authors: authorList.slice(0, 5).join(", ") + (authorList.length > 5 ? " et al." : ""),
        categories: categories.join(", "),
        published: published.slice(0, 10),
        url: `https://arxiv.org/abs/${arxivId}`,
      });
    }
  }

  return papers;
}
