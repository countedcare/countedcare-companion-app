import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ResourceFilters } from "@/types/resources";

const STORAGE_KEY = "countedcare_resource_filters";
const DEBOUNCE_MS = 300;

const defaultFilters: ResourceFilters = {
  q: "",
  state: null,
  counties: [],
  universities: [],
  categories: [],
  sort: "recommended",
  page: 1,
};

export function useResourceFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFiltersState] = useState<ResourceFilters>(defaultFilters);
  const [debouncedQ, setDebouncedQ] = useState("");

  // Initialize from URL or localStorage
  useEffect(() => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;

    if (hasUrlParams) {
      // Parse from URL
      const urlFilters: ResourceFilters = {
        q: searchParams.get("q") || "",
        state: searchParams.get("state") || null,
        counties: searchParams.getAll("county"),
        universities: searchParams.getAll("university"),
        categories: searchParams.getAll("category"),
        sort: (searchParams.get("sort") as ResourceFilters["sort"]) || "recommended",
        page: parseInt(searchParams.get("page") || "1", 10),
      };
      setFiltersState(urlFilters);
      setDebouncedQ(urlFilters.q);
    } else {
      // Try to restore from localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setFiltersState({ ...defaultFilters, ...parsed, page: 1 });
          setDebouncedQ(parsed.q || "");
        }
      } catch (e) {
        console.error("Failed to parse stored filters:", e);
      }
    }
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(filters.q);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters.q]);

  // Sync to URL and localStorage whenever filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedQ) params.set("q", debouncedQ);
    if (filters.state) params.set("state", filters.state);
    filters.counties.forEach((c) => params.append("county", c));
    filters.universities.forEach((u) => params.append("university", u));
    filters.categories.forEach((cat) => params.append("category", cat));
    if (filters.sort !== "recommended") params.set("sort", filters.sort);
    if (filters.page > 1) params.set("page", filters.page.toString());

    setSearchParams(params, { replace: true });

    // Save to localStorage (without debounced q, use actual q)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (e) {
      console.error("Failed to save filters to localStorage:", e);
    }
  }, [filters, debouncedQ, setSearchParams]);

  const setFilters = useCallback((updates: Partial<ResourceFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...updates, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
    setDebouncedQ("");
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const setQ = useCallback((q: string) => {
    setFiltersState((prev) => ({ ...prev, q, page: 1 }));
  }, []);

  const setState = useCallback((state: string | null) => {
    setFiltersState((prev) => ({
      ...prev,
      state,
      counties: [], // Reset counties when state changes
      page: 1,
    }));
  }, []);

  const toggleCounty = useCallback((county: string) => {
    setFiltersState((prev) => ({
      ...prev,
      counties: prev.counties.includes(county)
        ? prev.counties.filter((c) => c !== county)
        : [...prev.counties, county],
      page: 1,
    }));
  }, []);

  const toggleUniversity = useCallback((universityId: string) => {
    setFiltersState((prev) => ({
      ...prev,
      universities: prev.universities.includes(universityId)
        ? prev.universities.filter((u) => u !== universityId)
        : [...prev.universities, universityId],
      page: 1,
    }));
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setFiltersState((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
      page: 1,
    }));
  }, []);

  const setSort = useCallback((sort: ResourceFilters["sort"]) => {
    setFiltersState((prev) => ({ ...prev, sort, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFiltersState((prev) => ({ ...prev, page }));
  }, []);

  return {
    filters: { ...filters, q: debouncedQ }, // Use debounced q for queries
    rawFilters: filters, // Expose raw filters for input binding
    setFilters,
    resetFilters,
    setQ,
    setState,
    toggleCounty,
    toggleUniversity,
    toggleCategory,
    setSort,
    setPage,
  };
}
