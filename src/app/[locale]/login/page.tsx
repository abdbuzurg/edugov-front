import LoginForm from "./components/loginForm";
import { getTranslations } from "next-intl/server";

export default async function Login() {
  const t = await getTranslations("LoginPage")
  return (
    <div>
      <div className="flex-1 flex bg-white rounded-xl mt-4 mb-4 p-10">
        <div className="flex space-x-4 w-full">
          <div className="w-1/2 m-3 p-6 text-center">
            Image here
          </div>
          <div className="w-1/2 m-3 p-6">
            <h2 className="text-3xl font-bold text-[#1aba1a] mb-5">{t("header")}</h2>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
