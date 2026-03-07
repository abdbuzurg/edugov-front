"use client";

import conferencePlan from "@/data/conferencePlan2026.json";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

const ITEMS_PER_PAGE = 15;

type PaginationToken = number | "ellipsis";

function buildPageTokens(totalPages: number, currentPage: number): PaginationToken[] {
  const selectedPages = new Set<number>([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1
  ]);

  const sortedPages = Array.from(selectedPages)
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
    .sort((a, b) => a - b);

  const tokens: PaginationToken[] = [];

  sortedPages.forEach((pageNumber, index) => {
    const previousPage = sortedPages[index - 1];
    if (previousPage && pageNumber - previousPage > 1) {
      tokens.push("ellipsis");
    }
    tokens.push(pageNumber);
  });

  return tokens;
}

export default function ConferencePlanSection() {
  const t = useTranslations("Landing");
  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = conferencePlan.items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const pageTokens = useMemo(
    () => buildPageTokens(totalPages, currentPage),
    [currentPage, totalPages]
  );

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return conferencePlan.items.slice(start, end);
  }, [currentPage]);

  const showingFrom = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const showingTo = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  return (
    <section className="w-full bg-white py-8">
      <div className="m-auto w-full lg:w-[1280px] px-2">
        <div className="rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
            <h2 className="text-xl font-bold text-slate-900">{t("conferenceSectionTitle")}</h2>
            <p className="mt-2 text-sm text-slate-700">{conferencePlan.title}</p>
            <p className="mt-2 text-sm text-slate-600">
              {t("conferenceShowingLabel")} {showingFrom}-{showingTo} {t("conferenceOfLabel")}{" "}
              {totalItems}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-100 text-left text-slate-800">
                <tr>
                  <th className="w-14 border-b border-slate-200 px-3 py-2 text-center">
                    {conferencePlan.headers.number}
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2">
                    {conferencePlan.headers.eventName}
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2">
                    {conferencePlan.headers.eventTypeAndLevel}
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2">
                    {conferencePlan.headers.scientificDirection}
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2">
                    {conferencePlan.headers.eventDate}
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2">
                    {conferencePlan.headers.indexing}
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2">
                    {conferencePlan.headers.organizer}
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={item.id} className="even:bg-slate-50/50">
                    <td className="border-b border-slate-100 px-3 py-2 text-center align-top">
                      {showingFrom + index}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 align-top whitespace-pre-line">
                      {item.eventName || "—"}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 align-top whitespace-pre-line">
                      {item.eventTypeAndLevel || "—"}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 align-top whitespace-pre-line">
                      {item.scientificDirection || "—"}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 align-top whitespace-pre-line">
                      {item.eventDate || "—"}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 align-top whitespace-pre-line">
                      {item.indexing || "—"}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 align-top whitespace-pre-line">
                      {item.organizer || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-600">
              {t("conferencePageLabel")} {currentPage}/{totalPages}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("conferencePreviousButtonText")}
              </button>

              {pageTokens.map((token, index) =>
                token === "ellipsis" ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-slate-500">
                    …
                  </span>
                ) : (
                  <button
                    key={token}
                    type="button"
                    onClick={() => setCurrentPage(token)}
                    className={`rounded-md border px-3 py-1 text-sm ${
                      token === currentPage
                        ? "border-[#095088] bg-[#095088] text-white"
                        : "border-slate-300 text-slate-700"
                    }`}
                  >
                    {token}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("conferenceNextButtonText")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
