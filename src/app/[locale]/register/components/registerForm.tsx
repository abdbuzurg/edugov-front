"use client"

import { authApi, AuthRequest, } from "@/api/auth"
import { ApiError } from "@/api/types"
import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useFormik } from "formik"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import * as yup from "yup"

export default function RegisterForm() {
  const t = useTranslations("RegisterPage")
  const router = useRouter()

  const registerMutation = useMutation<boolean, AxiosError<ApiError>, AuthRequest>({
    mutationFn: authApi.register,
  })

  const form = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: yup.object({
      email: yup.string()
        .required(t("emailRequiredValidationError"))
        .email(t("emailValidationError")),
      password: yup.string()
        .required(t("passwordRequiredValidationError"))
        .min(4, t("passwordTooShortValidationError"))
        .max(10, t("passwordTooLongValidationError")),
      confirmPassword: yup.string()
        .required(t("confirmPasswordRequiredValidationError"))
        .min(4, t("passwordTooShortValidationError"))
        .max(10, t("passwordTooLongValidationError"))
        .oneOf([yup.ref('password')], t("passwordNotMatchValidationError"))
    }),
    onSubmit: values => {
      const registationInProcessToast = toast.info(t("toastRegistrationInProccess"), {
        delay: 5,
      })
      registerMutation.mutate({
        email: values.email,
        password: values.confirmPassword,
      }, {
        onSettled: () => {
          toast.dismiss(registationInProcessToast)
        },
        onSuccess: () => {
          toast.info(t("toastRegistrationSuccess"), { delay: 2 })
          const locale = localStorage.getItem("currentLocale")
          router.push(`/${locale}/login`)
        },
        onError: (error) => {
          if (error.response && error.response.data && error.response.data.message) {
            toast.error(`${t("toastRegistrationFailed")} - ${error.response.data.message}`)
          } else {
            toast(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
          }
        }
      })
    }
  })

  return (
    <form className="mt-4 flex flex-col space-y-3" onSubmit={form.handleSubmit}>
      <div className="flex flex-col space-y-1">
        <div className="flex flex-col space-y-1">
          <label htmlFor="email" className="text-l">{t("emailLabel")}</label>
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
          <label htmlFor="password" className="text-l">{t("passwordLabel")}</label>
          <input
            className="border p-2 rounded-xl w-2/3 border-gray-400"
            placeholder=""
            type="password"
            name="password"
            id="password"
            value={form.values.password}
            onChange={form.handleChange}
          />
        </div>
        {form.errors.password && form.touched.password && (
          <div className="text-red-500 font-bold">{form.errors.password}</div>
        )}
      </div>
      <div className="flex flex-col space-y-1">
        <div className="flex flex-col space-y-1">
          <label htmlFor="confirmPassword" className="block mb-2 text-l">{t("confirmPasswordLabel")}</label>
          <input
            className="border p-2 rounded-xl w-2/3 border-gray-400"
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={form.values.confirmPassword}
            onChange={form.handleChange}
          />
        </div>
        {form.errors.confirmPassword && form.touched.confirmPassword && (
          <div className="text-red-500 font-bold">{form.errors.confirmPassword}</div>
        )}
      </div>
      <div>
        <button
          type="submit"
          className="text-white bg-[#1aba1a] hover:bg-[#468f46] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-l px-4 py-2 text-center"
        >
          {t("registerSubmitButtonText")}
        </button>
      </div>
    </form>
  )
}
