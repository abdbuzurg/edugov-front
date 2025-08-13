import Link from "next/link";
import RegisterForm from "./components/registerForm";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Регистрация"
}

export default async function Register() {
  const t = await getTranslations("RegisterPage")

  return (
    <main>
      <div className="flex rounded-xl m-auto lg:w-[1280px] w-full">
        <div className="flex w-full space-x-4">
          <div className="flex-1">
            <Image
              src="/images/placeholder_image.png"
              alt="placeholder_image"
              width={700}
              height={100}
            />
          </div>
          <div className="flex-1 flex justify-center items-center">
            <div className="w-full px-4">
              <h2 className="text-3xl font-bold text-[#1aba1a] mb-5">{t("header")}</h2>
              <RegisterForm />
              <p className="text-sm font-bold text-gray-400">
                {t("alreadyAccountExistText")}
                <Link href="/login" className="ml-1 text-[#1aba1a] hover:text-[#468f46] ">
                  {t("loginLinkText")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
