import { useQuery } from "@tanstack/react-query";
import { useLanguageStore } from "@/store/languageStore";
import { homepageService } from "@/services/homepageService";

export function useHomepageQuery() {
  const { language } = useLanguageStore();
  return useQuery({
    queryKey: ["homepage", language],
    queryFn: () => homepageService.getAll().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}
