"use client"

import { authApi } from "@/api/auth"
import { useMutation } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

export default function Logout() {
  const t = useTranslations("NavigationBar")
  const router = useRouter()

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: authApi.logout,
  })
  const onLogoutClick = () => {
    const loadingToast = toast.info(t("logoutLoadingToastText"))
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        toast.dismiss(loadingToast)
        toast.success(t("logoutSuccessToastText"))
        localStorage.removeItem("accessToken")
        localStorage.removeItem("userRole")
        const locale = localStorage.getItem("currentLocale")
        router.push(`/${locale}/login`)
        router.refresh()
      }
    })
  }

  return (
    <span
      className="hover:bg-[#0b64a8] text-white font-bold py-3 px-6 cursor-pointer"
      onClick={() => onLogoutClick()}
    >
      {t("logout")}
    </span>
  )
}
