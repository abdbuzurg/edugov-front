"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import ConferencePlanSection from "./ConferencePlanSection";
import NormativeDocumentsSection from "./NormativeDocumentsSection";

type TabKey = "conference" | "normative";

export default function LandingTabsSection() {
  const t = useTranslations("Landing");
  const [activeTab, setActiveTab] = useState<TabKey>("conference");

  return (
    <div className="w-full bg-white">
      <div className="m-auto w-full lg:w-[1280px] px-2 pt-6">
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("conference")}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "conference"
                ? "bg-[#095088] text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {t("conferenceTabText")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("normative")}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "normative"
                ? "bg-[#095088] text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {t("normativeTabText")}
          </button>
        </div>
      </div>

      {activeTab === "conference" ? <ConferencePlanSection /> : <NormativeDocumentsSection />}
    </div>
  );
}
