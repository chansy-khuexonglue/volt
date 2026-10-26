import { docCategories, docsDatabase, type DocItem } from './useDocsData';

export interface SearchResult {
  slug: string;
  title: string;
  category: string;
  snippet: string;
}

export function useSearch() {
  const isSearchOpen = useState<boolean>('volt-search-open', () => false);

  function openSearch() {
    isSearchOpen.value = true;
  }

  function closeSearch() {
    isSearchOpen.value = false;
  }

  function search(query: string): SearchResult[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResult[] = [];

    for (const [slug, doc] of Object.entries(docsDatabase)) {
      const titleMatch = doc.title.toLowerCase().includes(q);
      const descMatch = doc.description.toLowerCase().includes(q);
      const contentMatch = doc.content.toLowerCase().includes(q);

      if (titleMatch || descMatch || contentMatch) {
        let snippet = doc.description;
        if (!descMatch && contentMatch) {
          const idx = doc.content.toLowerCase().indexOf(q);
          const start = Math.max(0, idx - 40);
          const end = Math.min(doc.content.length, idx + 80);
          snippet = `...${doc.content.substring(start, end).replace(/[#*`]/g, '')}...`;
        }

        results.push({
          slug,
          title: doc.title,
          category: doc.category,
          snippet,
        });
      }
    }

    return results.slice(0, 8);
  }

  return {
    isSearchOpen,
    openSearch,
    closeSearch,
    search,
  };
}
