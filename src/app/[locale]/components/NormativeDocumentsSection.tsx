"use client";

import normativeDocuments from "@/data/normativeDocuments.json";
import { useTranslations } from "next-intl";

export default function NormativeDocumentsSection() {
  const t = useTranslations("Landing");

  return (
    <section className="w-full bg-white py-8">
      <div className="m-auto w-full lg:w-[1280px] px-2">
        <div className="rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
            <h2 className="text-xl font-bold text-slate-900">{t("normativeSectionTitle")}</h2>
            <p className="mt-2 text-sm text-slate-700">{normativeDocuments.title}</p>
            <p className="mt-2 text-sm text-slate-600">
              {t("normativeDocumentsCountLabel")}: {normativeDocuments.items.length}
            </p>
          </div>

          <ol className="px-4 py-3">
            {normativeDocuments.items.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-b-0"
              >
                <span className="mt-0.5 min-w-7 rounded-full bg-[#095088] px-2 py-0.5 text-center text-xs font-semibold text-white">
                  {item.id}
                </span>
                <p className="text-sm text-slate-800">{item.title}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
