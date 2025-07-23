import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import Logout from "./Logout";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

interface Props {
  locale: string
  isLogged: boolean
}

export default async function NavigationBar({ locale, isLogged }: Props) {
  const t = await getTranslations("NavigationBar")

  return (
    <>
      <div className="w-full lg:w-[1280px] m-auto bg-white rounded-xl flex justify-between items-center py-2">
        <div className="flex h-auto items-center space-x-1">
          <Image
            src="/images/logo.jpg"
            alt="logo"
            width={90}
            height={100}
          />
          <div className="flex flex-col space-y-0 items-start justify-start uppercase">
            <h1 className="text-4xl font-bold text-purple-900">{t("bigMessagePart1")}</h1>
            <h1 className="text-4xl font-bold text-purple-900">{t("bigMessagePart2")}</h1>
          </div>
        </div>
        <div className="flex flex-col font-bold space-y-0 italic">
          <p> Зи фарзонагон чун сухан бишнавем,</p>
          <p> Ба рою ба фармоншон бигравем.</p>
          <p> К-аз эшон ҳаме дониш омӯхтем,</p>
          <p> Ба фарҳанг дилхо барафрӯхтем.</p>
          <p className="text-right">Абулқосим Фирдавсӣ</p>
        </div>
      </div>
      <div className="w-full bg-[#095088]">
        <div className="lg:w-[1280px] w-full flex m-auto justify-between">
          <div className="flex">
            <Link href={`/${locale}`} className="hover:bg-[#0b64a8] text-white font-bold py-3 px-6">{t("home")}</Link>
            <Link href="/institutions" className="hover:bg-[#0b64a8] text-white font-bold py-3 px-6">{t("institutions")}</Link>
            <Link href="/personnel" className="hover:bg-[#0b64a8] text-white font-bold py-3 px-6">{t("personnel")}</Link>
            <Link href="/library" className="hover:bg-[#0b64a8] text-white font-bold py-3 px-6">{t("library")}</Link>
            <Link href="/scientific_publications" className="hover:bg-[#0b64a8] text-white font-bold py-3 px-6">{t("scientificPublications")}</Link>
            <Link href="/contacts" className="hover:bg-[#0b64a8] text-white font-bold py-3 px-6">{t("contacts")}</Link>
          </div>
          <div className="flex">
            {!isLogged
              ?
              <>
                <Link href={`/${locale}/register`} className="hover:bg-[#0b64a8] text-white font-bold py-3 px-6">{t("register")}</Link>
                <Link href={`/${locale}/login`} className="hover:bg-[#0b64a8] text-white font-bold py-3 px-6">{t("login")}</Link>
              </>
              :
              <Logout />
            }
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </>
  )
}
