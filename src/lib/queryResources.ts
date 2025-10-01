import { supabase } from "@/integrations/supabase/client";
import { ResourceItem, ResourceFilters } from "@/types/resources";

const PAGE_SIZE = 24;

export async function fetchResources(
  filters: ResourceFilters
): Promise<{ items: ResourceItem[]; count: number; hasMore: boolean }> {
  let query = supabase
    .from("resources")
    .select("*", { count: "exact" })
    .eq("is_active", true);

  // Text search across title, description, and tags
  if (filters.q && filters.q.trim()) {
    const term = filters.q.trim();
    query = query.or(
      `title.ilike.%${term}%,description.ilike.%${term}%,tags.cs.{${term}}`
    );
  }

  // State filter
  if (filters.state) {
    query = query.eq("state_code", filters.state);
  }

  // County filter (multiple)
  if (filters.counties.length > 0) {
    query = query.in("county_name", filters.counties);
  }

  // University filter (multiple)
  if (filters.universities.length > 0) {
    query = query.overlaps("university_ids", filters.universities);
  }

  // Category filter (multiple) - check both category field and tags
  if (filters.categories.length > 0) {
    const categoryConditions = filters.categories
      .map((cat) => `category.eq.${cat},tags.cs.{${cat}}`)
      .join(",");
    query = query.or(categoryConditions);
  }

  // Sorting
  switch (filters.sort) {
    case "az":
      query = query.order("title", { ascending: true });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "recommended":
    default:
      // Recommended: prioritize by category hierarchy, then by date
      query = query
        .order("category", { ascending: true })
        .order("created_at", { ascending: false });
      break;
  }

  // Pagination
  const from = (filters.page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error("Error fetching resources:", error);
    throw error;
  }

  return {
    items: (data as ResourceItem[]) || [],
    count: count ?? 0,
    hasMore: (count ?? 0) > to + 1,
  };
}

export async function fetchUniversities(searchTerm: string = "") {
  let query = supabase.from("universities").select("*").order("name");

  if (searchTerm.trim()) {
    query = query.ilike("name", `%${searchTerm}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching universities:", error);
    throw error;
  }

  return data || [];
}

export async function fetchDistinctCounties(stateCode?: string | null) {
  let query = supabase
    .from("resources")
    .select("county_name")
    .not("county_name", "is", null)
    .eq("is_active", true);

  if (stateCode) {
    query = query.eq("state_code", stateCode);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching counties:", error);
    return [];
  }

  // Get unique counties
  const counties = Array.from(
    new Set(data?.map((r) => r.county_name).filter(Boolean) as string[])
  ).sort();

  return counties;
}

export async function fetchDistinctCategories() {
  const { data, error } = await supabase
    .from("resources")
    .select("category")
    .not("category", "is", null)
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  // Get unique categories
  const categories = Array.from(
    new Set(data?.map((r) => r.category).filter(Boolean) as string[])
  ).sort();

  return categories;
}
