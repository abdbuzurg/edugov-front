import Link from "next/link";
import RegisterForm from "./components/registerForm";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function Register() {
  const t = await getTranslations("RegisterPage")

  return (
    <div>
      <div className="flex-1 flex bg-white rounded-xl mt-4 mb-4 p-10">
        <div className="flex space-x-4 w-full">
          <div className="w-1/2 m-3 p-6 text-center">
            <Image
              src="/images/placeholder_image.png"
              alt="placeholder_image"
              width={700}
              height={100}
            />
          </div>
          <div className="w-1/2 m-3 p-6">
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
  )
}
