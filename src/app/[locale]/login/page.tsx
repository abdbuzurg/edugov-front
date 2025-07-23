import Image from "next/image";
import LoginForm from "./components/loginForm";
import { getTranslations } from "next-intl/server";

export default async function Login() {
  const t = await getTranslations("LoginPage")
  return (
    <main>
      <div className="flex-1 flex bg-white rounded-xl m-auto p-10 lg:w-[1280px] w-full">
        <div className="flex space-x-4 w-full">
          <div className="flex-1 m-3 p-6 text-center">
            <Image
              src="/images/placeholder_image.png"
              alt="placeholder_image"
              width={700}
              height={100}
            />
          </div>
          <div className="flex-1 m-3 p-6">
            <h2 className="text-3xl font-bold text-[#1aba1a] mb-5">{t("header")}</h2>
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  )
}
