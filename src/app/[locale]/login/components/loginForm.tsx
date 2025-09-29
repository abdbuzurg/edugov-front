"use client"

import { authApi, AuthRequest, AuthResponse } from "@/api/auth"
import { ApiError } from "@/api/types"
import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useFormik } from "formik"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import * as yup from "yup"

export default function LoginForm() {
  const t = useTranslations("LoginPage")
  const router = useRouter()

  const loginMutition = useMutation<AuthResponse, AxiosError<ApiError>, AuthRequest>({
    mutationFn: authApi.login,
  })
  const form = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: yup.object({
      email: yup
        .string()
        .required(t("emailRequiredValidationError"))
        .email(t("emailValidationError")),
      password: yup
        .string()
        .required(t("passwordRequiredValidationError")),
    }),
    onSubmit: values => {
      const loginInProgressToast = toast.info(t("toastLoginInProgress"))
      loginMutition.mutate(values, {
        onSettled: () => {
          toast.dismiss(loginInProgressToast)
        },
        onSuccess: (data) => {
          localStorage.setItem("accessToken", data.accessToken)
          localStorage.setItem("userRole", data.userRole)

          toast.info(t("toastLoginSuccess"), { delay: 2 })
          const locale = localStorage.getItem("currentLocale")
          router.push(`/${locale}/employee/${data.uid}`)
          router.refresh()
        },
        onError: (error) => {
          if (error.response && error.response.data && error.response.data.message) {
            toast.error(`${t("toastLoginFailed")} - ${error.response.data.message}`)
          } else {
            toast(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
          }
        }
      })
    }
  })

  return (
    <form className="flex flex-col space-y-3" onSubmit={form.handleSubmit}>
      <div className="flex flex-col space-y-1">
        <div className="flex flex-col space-y-1">
          <label htmlFor="email" className="block mb-2 text-l">{t("emailLabel")}</label>
          <input
            className="border p-2 rounded-xl w-2/3 border-gray-400"
            type="email"
            id="email"
            name="email"
            value={form.values.email}
            onChange={form.handleChange}
          />
        </div>
        {form.errors.email && form.touched.email && (
          <div className="text-red-500 font-bold">{form.errors.email}</div>
        )}
      </div>
      <div className="flex flex-col space-y-1">
        <div className="flex flex-col space-y-1">
          <label htmlFor="password" className="block mb-2 text-l">{t("passwordLabel")}</label>
          <input
            className="border p-2 rounded-xl w-2/3 border-gray-400"
            type="password"
            id="password"
            name="password"
            value={form.values.password}
            onChange={form.handleChange}
          />
          {form.errors.password && form.touched.password && (
            <div className="text-red-500 font-bold">{form.errors.password}</div>
          )}
        </div>
      </div>
      <div>
        <button
          type="submit"
          className="cursor-pointer text-white bg-[#1aba1a] hover:bg-[#468f46] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-l px-4 py-2 text-center"
        >
          {t("loginSubmitButtonText")}
        </button>
      </div>
    </form>
  )
}
