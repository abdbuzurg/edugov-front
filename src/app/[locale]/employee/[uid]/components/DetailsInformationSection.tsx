"use client"

import { employeeApi } from "@/api/employee";
import { ApiError } from "@/api/types";
import Loading from "@/app/[locale]/loading";
import { EmployeeDetails } from "@/types/employee";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { getIn, useFormik } from "formik";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FaPen } from "react-icons/fa";
import { toast } from "react-toastify";
import * as yup from "yup"

interface Props {
  details: EmployeeDetails[] | null
  employeeID: number
}

export default function DetailsInformationSection({ details, employeeID }: Props) {

  const t = useTranslations("Employee.Details")

  const detailsQuery = useQuery<EmployeeDetails[], Error, EmployeeDetails[]>({
    queryKey: ["employee-details", { employeeID: employeeID }],
    initialData: details ?? [],
    queryFn: () => employeeApi.getDetailsByEmployeeID(employeeID),
  })

  const [editMode, setEditMode] = useState<boolean>(false)

  return (
    <div className="self-start flex flex-col space-y-2 w-80 py-4 bg-gray-100 rounded-xl">
      <div className="flex justify-between items-center border-b-1 border-gray-500 pb-2 px-6">
        <p className="font-bold text-xl">{t("title")}</p>
        <div className="cursor-pointer">
          {!editMode && <FaPen color="blue" onClick={() => setEditMode(true)} />}
        </div>
      </div>
      {!editMode
        ?
        <>
          {detailsQuery.isLoading && <Loading />}
          {detailsQuery.isSuccess && <DetailsDisplay details={detailsQuery.data} employeeID={employeeID} />}
        </>
        :
        <DetailsEdit details={detailsQuery.data} employeeID={employeeID} disableEditMode={() => setEditMode(false)} />
      }
    </div>
  )
}

const extractLatestCredentials = (details: EmployeeDetails[], employeeID: number): EmployeeDetails => {
  const latest = details.find(v => v.isNewEmployeeDetails)
  if (!latest) {
    return {
      id: 0,
      employeeID: employeeID,
      name: "",
      surname: "",
      middlename: "",
      isNewEmployeeDetails: true,
    }
  }

  return { ...latest, employeeID: employeeID }
}

const extractOldCredentials = (details: EmployeeDetails[], employeeID: number): EmployeeDetails[] => {
  return details.filter(v => !v.isNewEmployeeDetails).map(v => ({ ...v, employeeID: employeeID }))
}

function DetailsDisplay({ details, employeeID }: Props) {
  const [latest, setLatests] = useState<EmployeeDetails>(extractLatestCredentials(details ?? [], employeeID))
  const [old, setOld] = useState<EmployeeDetails[]>(extractOldCredentials(details ?? [], employeeID))

  useEffect(() => {
    setLatests(extractLatestCredentials(details ?? [], employeeID))
    setOld(extractOldCredentials(details ?? [], employeeID))
  }, [details])

  return (
    <>
      <div className="w-full px-6">
        <div className="h-60 bg-gray-300 rounded-xl">
          image here
        </div>
      </div>
      <div className="flex flex-col items-center font-bold text-xl border-b-1 pb-2">
        <span>{latest?.surname ?? "Не указано фамилия"}</span>
        <span>{latest?.name ?? "Не указано имя"}</span>
        <span>{latest?.middlename ?? "Не указано отсчество"}</span>
      </div>
      {old.map((v, index) => (
        <div className="flex flex-col items-center font-bold text-xl border-b-1 pb-2" key={index}>
          <span>{v.surname}</span>
          <span>{v.name}</span>
          <span>{v.middlename}</span>
        </div>
      ))}
    </>

  )
}

function DetailsEdit({
  details,
  employeeID,
  disableEditMode,
}: {
  details: EmployeeDetails[] | null
  employeeID: number
  disableEditMode: () => void
}) {
  const t = useTranslations("Employee.Details")

  const queryClient = useQueryClient()
  const updateDetailsMutation = useMutation<EmployeeDetails[], AxiosError<ApiError>, EmployeeDetails[]>({
    mutationFn: employeeApi.updateDetails,
  })

  const form = useFormik({
    initialValues: {
      latest: extractLatestCredentials(details ?? [], employeeID),
      old: extractOldCredentials(details ?? [], employeeID),
    },
    validationSchema: yup.object({
      latest: yup.object({
        name: yup.string().required(t("nameRequiredValidationText")),
        surname: yup.string().required(t("surnameRequiredValidationText")),
        middlename: yup.string().required(t("middlenameRequiredValidationText")),
      }),
      old: yup.array().of(
        yup.object({
          name: yup.string().required(t("nameRequiredValidationText")),
          surname: yup.string().required(t("surnameRequiredValidationText")),
          middlename: yup.string().required(t("middlenameRequiredValidationText")),
        })
      )
    }),
    onSubmit: (values) => {
      const updateEmployeeDetails: EmployeeDetails[] = [
        {
          ...values.latest
        },
        ...values.old
      ]


      const loadingStateToast = toast.info(`${t("onUpdateLoadingToastText")}`)
      updateDetailsMutation.mutate(updateEmployeeDetails, {
        onSettled: () => {
          toast.dismiss(loadingStateToast)
        },
        onSuccess: () => {
          toast.success(`${t("onUpdateSuccessToastText")}`)
          queryClient.invalidateQueries({
            queryKey: ["employee-details", { employeeID: employeeID }]
          })
          disableEditMode()
        },
        onError: (error) => {
          if (error.response && error.response.data && error.response.data.message) {
            toast.error(`${t("onUpdateErrorToastText")} - ${error.response.data.message}`)
          } else {
            toast(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
          }
        }
      })
    },
  })

  const onDeleteOldClick = (index: number) => {
    const old = form.values.old.filter((_, i) => i != index)
    form.setFieldValue("old", old)
  }

  const onAddOldClick = () => {
    form.setFieldValue("old", [...form.values.old, {
      id: 0,
      employeeID: employeeID,
      name: "",
      surname: "",
      middlename: "",
      isEmployeeDetailsNew: false,
    }])
  }

  const onCancelClick = () => {
    form.setFieldValue("latest", extractLatestCredentials(details ?? [], employeeID))
    form.setFieldValue("old", [...extractOldCredentials(details ?? [], employeeID)])
    disableEditMode()
  }

  return (
    <form className="flex flex-col space-y-3" onSubmit={form.handleSubmit}>
      {/* CURRECT CREDENTIAL FORM */}
      <div className="border-b-1 py-2">
        <div className="w-full px-6">
          <div className="h-60 bg-gray-300 rounded-xl">
            image here
          </div>
        </div>
        <h4 className="font-semibold text-l text-center">{t("stateYourCurrentCredentials")}</h4>
        <div className="flex flex-col space-y-1 px-3">
          <label htmlFor="latest.surname" className="font-semibold">{t("surnameLabel")}</label>
          <input
            className="border p-2 rounded-xl border-gray-400 bg-gray-300"
            name="latest.surname"
            id="latest.surname"
            type="text"
            value={form.values.latest.surname}
            onChange={form.handleChange}
          />
          {form.errors.latest && form.errors.latest.surname && form.touched.latest && form.touched.latest.surname && (
            <div className="text-red-500 font-bold text-sm">{form.errors.latest.surname}</div>
          )}
        </div>
        <div className="flex flex-col space-y-1 px-3">
          <label htmlFor="latest.name" className="font-semibold">{t("nameLabel")}</label>
          <input
            className="border p-2 rounded-xl border-gray-400 bg-gray-300"
            name="latest.name"
            id="latest.name"
            type="text"
            value={form.values.latest.name}
            onChange={form.handleChange}
          />
          {form.errors.latest && form.errors.latest.name && form.touched.latest && form.touched.latest.name && (
            <div className="text-red-500 font-bold text-sm">{form.errors.latest.name}</div>
          )}
        </div>
        <div className="flex flex-col space-y-1 px-3">
          <label htmlFor="latest.middlename" className="font-semibold">{t("middlenameLabel")}</label>
          <input
            className="border p-2 rounded-xl border-gray-400 bg-gray-300"
            name="latest.middlename"
            id="latest.middlename"
            type="text"
            value={form.values.latest.middlename}
            onChange={form.handleChange}
          />
          {form.errors.latest && form.errors.latest.middlename && form.touched.latest && form.touched.latest.middlename && (
            <div className="text-red-500 font-bold text-sm">{form.errors.latest.middlename}</div>
          )}
        </div>
      </div>
      {/* OLD CREDENTIAL FORM */}
      <div className="border-b-1 py-2 px-3">
        <h4 className="font-semibold text-l text-center">{t("stateYourOldCredentials")}</h4>
        {form.values.old.map((_, i) => (
          <div className="border-b-1 py-2" key={i}>
            <div className="flex flex-col space-y-1 px-3">
              <label htmlFor={`old[${i}].surname`} className="font-semibold">{t("surnameLabel")}</label>
              <input
                className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                name={`old[${i}].surname`}
                id={`old[${i}].surname`}
                type="text"
                value={form.values.old[i].surname}
                onChange={form.handleChange}
              />
              {form.errors.old && getIn(form.errors, `old[${i}].surname`) && form.touched.old && form.touched.old[i].surname && (
                <div className="text-red-500 font-bold text-sm">{getIn(form.errors, `old[${i}].surname`)}</div>
              )}
            </div>
            <div className="flex flex-col space-y-1 px-3">
              <label htmlFor={`old[${i}].name`} className="font-semibold">{t("nameLabel")}</label>
              <input
                className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                name={`old[${i}].name`}
                id={`old[${i}].name`}
                type="text"
                value={form.values.old[i].name}
                onChange={form.handleChange}
              />
              {form.errors.old && getIn(form.errors, `old[${i}].name`) && form.touched.old && form.touched.old[i].name && (
                <div className="text-red-500 font-bold text-sm">{getIn(form.errors, `old[${i}].name`)}</div>
              )}
            </div>
            <div className="flex flex-col space-y-1 px-3">
              <label htmlFor={`old[${i}].middlename`} className="font-semibold">{t("middlenameLabel")}</label>
              <input
                className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                name={`old[${i}].middlename`}
                id={`old[${i}].middlename`}
                type="text"
                value={form.values.old[i].middlename}
                onChange={form.handleChange}
              />
              {form.errors.old && getIn(form.errors, `old[${i}].middlename`) && form.touched.old && form.touched.old[i].middlename && (
                <div className="text-red-500 font-bold text-sm">{getIn(form.errors, `old[${i}].middlename`)}</div>
              )}
            </div>
            <div className="flex w-full items-center justify-center py-2">
              <div
                className="py-2 px-4 bg-red-500 hover:bg-red-700 text-white rounded cursor-pointer"
                onClick={() => onDeleteOldClick(i)}
              >
                {t("deleteButtonText")}
              </div>
            </div>
          </div>
        ))}
        <div className="flex w-full items-center justify-center py-2">
          <div
            className="py-2 px-4 bg-[#095088] hover:bg-[#0b64a8] text-white rounded cursor-pointer"
            onClick={() => onAddOldClick()}
          >
            {t("addButtonText")}
          </div>
        </div>
      </div>
      <div className="flex space-x-2 items-center justify-center">
        <button
          type="submit"
          className="py-2 px-4 bg-green-500 hover:bg-green-700 text-white rounded cursor-pointer"
        >
          {t("saveButtonText")}
        </button>
        <button
          type="button"
          className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded cursor-pointer"
          onClick={() => onCancelClick()}
        >
          {t("cancelButtonText")}
        </button>
      </div>
    </form>
  )
}
