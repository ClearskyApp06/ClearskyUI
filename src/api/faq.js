// @ts-check
import { useQuery } from '@tanstack/react-query';
import { fetchClearskyApi } from './core';

/**
 * Custom hook to fetch FAQs
 */
export function useFaq() {
  return useQuery({
    queryKey: ['faq'],
    queryFn: getFaqRaw,
  });
}

/**
 * Fetches raw FAQ data from the API
 * @returns {Promise<Array<{ question: string, answer: string, category: string }>>}
 */
async function getFaqRaw() {
  const json = await fetchClearskyApi('v1', 'faq/get-faq');
  return json.data || [];
}
