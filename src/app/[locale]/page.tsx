import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Главная"
}

export default async function Home() {
  const t = await getTranslations("Landing")
  return (
    <main>
      <div className="flex m-auto lg:w-[1280px] w-full">
        <div className="">
          <Image 
            src="/images/president.png"
            alt={t("presidentImageAlt")}
            loading="eager"
            width={997}
            height={664}
            quality={100}
          />
        </div>
        <div className="flex px-2 py-1 text-xl justify-center items-center w-full font-bold bg-[#095088] text-white text-center">
          <p>{t("presidentQuoteText")}</p>
        </div>
      </div>
      <div className="flex-1">
      </div>
    </main>
  );
}
