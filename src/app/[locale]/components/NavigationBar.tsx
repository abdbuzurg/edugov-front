import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import Logout from "./Logout";
import { getTranslations } from "next-intl/server";

interface Props {
  locale: string
  isLogged: boolean
}

export default async function NavigationBar({ locale, isLogged }: Props) {
  const t = await getTranslations("NavigationBar")

  return (
    <>
      <div className="w-full bg-white rounded-xl flex justify-center h-20">
        <h1 className="text-4xl p-4 font-bold text-purple-900">{t("bigMessage")}</h1>
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
