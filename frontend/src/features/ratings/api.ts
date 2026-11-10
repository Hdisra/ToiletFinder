import { api } from "@/api/client";
import type { Page } from "@/api/types";
import type { AdminRating } from "./types";

/** Paging and search options of the admin list. */
export interface ListParams {
  page: number;
  pageSize: number;
  search: string;
}

/** One page of ratings (optionally filtered by bathroom, user or comment) for the admin table. */
export const fetchRatings = ({ page, pageSize, search }: ListParams) => {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) query.set("search", search);
  return api<Page<AdminRating>>(`/admin/ratings?${query}`);
};

/** `comment: null` removes the comment. */
export const updateRating = (
  id: number,
  data: { score?: number; comment?: string | null },
) =>
  api<AdminRating>(`/admin/ratings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

/** Deletes a rating; the bathroom's average is recalculated by the server. */
export const deleteRating = (id: number) =>
  api<void>(`/admin/ratings/${id}`, { method: "DELETE" });
