import { useQuery } from "@tanstack/react-query";
import { useLanguageStore } from "@/store/languageStore";
import { aboutService } from "@/services/aboutService";

export function useAboutQuery() {
  const { language } = useLanguageStore();
  return useQuery({
    queryKey: ["about", language],
    queryFn: () => aboutService.getAll().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}
