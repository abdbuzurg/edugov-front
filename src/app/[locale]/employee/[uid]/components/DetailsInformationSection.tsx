"use client"

import { employeeApi } from "@/api/employee";
import { ApiError } from "@/api/types";
import { EmployeeDetails } from "@/types/employee";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { getIn, useFormik } from "formik";
import { useTranslations } from "next-intl";
import { ChangeEvent, useEffect, useState } from "react";
import { FaPen } from "react-icons/fa";
import { toast } from "react-toastify";
import * as yup from "yup"

interface Props {
  details: EmployeeDetails[] | null
  employeeID: number
  locale:string
  uid: string
  profilePictureExist: boolean
}

export default function DetailsInformationSection({ details, locale, employeeID,  uid, profilePictureExist }: Props) {

  const t = useTranslations("Employee.Details")

  const detailsQuery = useQuery<EmployeeDetails[], Error, EmployeeDetails[]>({
    queryKey: ["employee-details", {
      employeeID: employeeID,
    }],
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
        <DetailsDisplay
          details={detailsQuery.data}
          employeeID={employeeID}
          uid={uid}
          profilePictureExist={profilePictureExist}
        />
        :
        <DetailsEdit
          details={detailsQuery.data}
          employeeID={employeeID}
          uid={uid}
          profilePictureExist={profilePictureExist}
          disableEditMode={() => setEditMode(false)}
          locale={locale}
        />
      }
    </div>
  )
}

type LatestDetails = {
  ru: EmployeeDetails,
  en: EmployeeDetails,
  tg: EmployeeDetails,
}

const extractLatestCredentials = (details: EmployeeDetails[], employeeID: number): LatestDetails => {
  let latestRu = details.find(v => v.isNewEmployeeDetails && v.languageCode == "ru")
  if (!latestRu) {
    latestRu = {
      id: 0,
      languageCode: "ru",
      employeeID: employeeID,
      name: "",
      surname: "",
      middlename: "",
      isNewEmployeeDetails: true,
    }
  }

  let latestEn = details.find(v => v.isNewEmployeeDetails && v.languageCode == "en")
  if (!latestEn) {
    latestEn = {
      id: 0,
      languageCode: "en",
      employeeID: employeeID,
      name: "",
      surname: "",
      middlename: "",
      isNewEmployeeDetails: true,
    }
  }

  let latestTg = details.find(v => v.isNewEmployeeDetails && v.languageCode == "tg")
  if (!latestTg) {
    latestTg = {
      id: 0,
      languageCode: "tg",
      employeeID: employeeID,
      name: "",
      surname: "",
      middlename: "",
      isNewEmployeeDetails: true,
    }
  }

  return {
    ru: {...latestRu, employeeID: employeeID},
    en: {...latestEn, employeeID: employeeID},
    tg: {...latestTg, employeeID: employeeID},
  }
}

const extractOldCredentials = (details: EmployeeDetails[], employeeID: number): EmployeeDetails[] => {
  return details.filter(v => !v.isNewEmployeeDetails).map(v => ({ ...v, employeeID: employeeID }))
}

interface DetailsDisplayProps {
  details: EmployeeDetails[] | undefined
  employeeID: number
  uid: string
  profilePictureExist: boolean
}

function DetailsDisplay({ details, employeeID, uid, profilePictureExist }: DetailsDisplayProps) {
  if (!details) return null;
  console.log(uid)

  const [latest, setLatests] = useState<LatestDetails>(extractLatestCredentials(details ?? [], employeeID))

  useEffect(() => {
    setLatests(extractLatestCredentials(details ?? [], employeeID))
  }, [details])

  return (
    <>
      <div className="w-full px-6">
        <div className="h-60 bg-gray-300 rounded-xl">
          {profilePictureExist &&
            <img
              className="w-full h-full object-fill"
              src={`${process.env.NEXT_PUBLIC_ACTUAL_BACKEND_URL}/profile-picture/${uid}`}
              alt=""
            />
          }
        </div>
      </div>
      {latest.tg.id !== 0 &&
        <div className="flex flex-col items-center font-bold text-xl border-b-1 pb-2">
          <span>{latest.tg.surname}</span>
          <span>{latest.tg.name}</span>
          <span>{latest.tg.middlename}</span>
        </div>
      }
      {latest.ru.id !== 0 &&
        <div className="flex flex-col items-center font-bold text-xl border-b-1 pb-2">
          <span>{latest.ru.surname}</span>
          <span>{latest.ru.name}</span>
          <span>{latest.ru.middlename}</span>
        </div>
      }
      {latest.en.id !== 0 &&
        <div className="flex flex-col items-center font-bold text-xl border-b-1 pb-2">
          <span>{latest.en.surname}</span>
          <span>{latest.en.name}</span>
          <span>{latest.en.middlename}</span>
        </div>
      }
    </>

  )
}

interface DetailsEditProps {
  details: EmployeeDetails[] | null
  employeeID: number
  profilePictureExist: boolean
  uid: string
  disableEditMode: () => void
  locale: string
}

function DetailsEdit({
  details,
  employeeID,
  disableEditMode,
  uid,
  profilePictureExist,
  locale,
}: DetailsEditProps) {
  const t = useTranslations("Employee.Details")

  const queryClient = useQueryClient()
  const updateDetailsMutation = useMutation<EmployeeDetails[], AxiosError<ApiError>, EmployeeDetails[]>({
    mutationFn: employeeApi.updateDetails,
  })

  const updateProfilePictureMutation = useMutation<void, AxiosError<ApiError>, { profilePicture: File, uid: string }>({
    mutationFn: employeeApi.updateProfilePicture,
  })

  const [isProfilePictureAvailable, setIsProfilePictureAvialable] = useState(profilePictureExist)
  const [employeeImage, setEmployeeImage] = useState<File | undefined>()
  const onPofilePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files) {
      if (e.currentTarget.files.length > 1) {
        e.currentTarget.value=''
        toast.error(t("onProfileImageMultipleFilesErrorToastText"))
        return
      }

      const imageFile = e.currentTarget.files[0]
      console.log(imageFile)
      if (!imageFile.type.startsWith("image/")) {
        e.currentTarget.value=''
        toast.error(t("onProfileImageNotImageErrorToastText"))
        return
      }

      const maximumImageSize = 10*1024*1024
      if (imageFile.size > maximumImageSize) {
        e.currentTarget.value=''
        toast.error(t("onProfileImageSizeExceededErrorToastText"))
        return
      }
    
      setEmployeeImage(imageFile)
      setIsProfilePictureAvialable(true)
    }
  }

  const form = useFormik({
    initialValues: {
      latest: extractLatestCredentials(details ?? [], employeeID),
      old: extractOldCredentials(details ?? [], employeeID),
    },
    validationSchema: yup.object({
      latest: yup.object({
        tg: yup.object({
          name: yup.string().required(t("nameRequiredValidationText")),
          surname: yup.string().required(t("surnameRequiredValidationText")),
          middlename: yup.string().required(t("middlenameRequiredValidationText")),
        }),
        ru: yup.object({
          name: yup.string().required(t("nameRequiredValidationText")),
          surname: yup.string().required(t("surnameRequiredValidationText")),
          middlename: yup.string().required(t("middlenameRequiredValidationText")),
        }),
        en: yup.object({
          name: yup.string().required(t("nameRequiredValidationText")),
          surname: yup.string().required(t("surnameRequiredValidationText")),
          middlename: yup.string().required(t("middlenameRequiredValidationText")),
        }),
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
        values.latest.tg,
        values.latest.ru,
        values.latest.en,
        ...values.old
      ]

      const loadingStateToast = toast.info(`${t("onUpdateLoadingToastText")}`)

      if (employeeImage) {
        updateProfilePictureMutation.mutate({ profilePicture: employeeImage, uid: uid })
      }

      updateDetailsMutation.mutate(updateEmployeeDetails, {
        onSettled: () => {
          toast.dismiss(loadingStateToast)
        },
        onSuccess: () => {
          toast.success(`${t("onUpdateSuccessToastText")}`)
          queryClient.invalidateQueries({
            queryKey: ["employee-details", {
              employeeID: employeeID,
            }]
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
      languageCode: locale,
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
      <div className="py-2">
        {/* Profile picture */}
        <div className="w-full px-6 border-b-1 items-center">
          <div className="pb-4 flex flex-col space-y-4">
            <div className="h-60 bg-gray-300 rounded-xl">
              {isProfilePictureAvailable &&
                <img
                  className="w-full h-full object-fill"
                  src={!employeeImage
                    ?
                    `${process.env.NEXT_PUBLIC_ACTUAL_BACKEND_URL}profile-picture/${uid}`
                    :
                    URL.createObjectURL(employeeImage)
                  }
                />
              }
            </div>
            <div className="text-center">
              <label
                htmlFor="employeeImage"
                className="py-2 px-4 bg-green-500 hover:bg-green-700 text-white rounded cursor-pointer"
              >
                Изменить фотографию
              </label>
              <input
                type="file"
                accept="image/*"
                name="image"
                id="employeeImage"
                hidden
                onChange={onPofilePictureChange}
              />
            </div>
          </div>
        </div>
        {/* Latest credentials on tajik */}
        <div className="border-b-1 px-2 pb-4">
          <h4 className="font-semibold text-l text-center">{t("stateYourCurrentCredentialsOnTajik")}</h4>
          <div className="flex flex-col space-y-1 px-3">
            <label htmlFor="latest.tg.surname" className="font-semibold">{t("surnameLabel")}</label>
            <input
              className="border p-2 rounded-xl border-gray-400 bg-gray-300"
              name="latest.tg.surname"
              id="latest.tg.surname"
              type="text"
              value={form.values.latest.tg.surname}
              onChange={form.handleChange}
            />
            {form.errors.latest && form.errors.latest.tg?.surname && form.touched.latest && form.touched.latest.tg?.surname && (
              <div className="text-red-500 font-bold text-sm">{form.errors.latest.tg.surname}</div>
            )}
          </div>
          <div className="flex flex-col space-y-1 px-3">
            <label htmlFor="latest.tg.name" className="font-semibold">{t("nameLabel")}</label>
            <input
              className="border p-2 rounded-xl border-gray-400 bg-gray-300"
              name="latest.tg.name"
              id="latest.tg.name"
              type="text"
              value={form.values.latest.tg.name}
              onChange={form.handleChange}
            />
            {form.errors.latest && form.errors.latest.tg?.name && form.touched.latest && form.touched.latest.tg?.name && (
              <div className="text-red-500 font-bold text-sm">{form.errors.latest.tg.name}</div>
            )}
          </div>
          <div className="flex flex-col space-y-1 px-3">
            <label htmlFor="latest.tg.middlename" className="font-semibold">{t("middlenameLabel")}</label>
            <input
              className="border p-2 rounded-xl border-gray-400 bg-gray-300"
              name="latest.tg.middlename"
              id="latest.tg.middlename"
              type="text"
              value={form.values.latest.tg.middlename}
              onChange={form.handleChange}
            />
            {form.errors.latest && form.errors.latest.tg?.middlename && form.touched.latest && form.touched.latest.tg?.middlename && (
              <div className="text-red-500 font-bold text-sm">{form.errors.latest.tg.middlename}</div>
            )}
          </div>
        </div>
        {/* Latest credentials on russian */}
        <div className="border-b-1 px-2 pb-4">
          <h4 className="font-semibold text-l text-center">{t("stateYourCurrentCredentialsOnRussian")}</h4>
          <div className="flex flex-col space-y-1 px-3">
            <label htmlFor="latest.ru.surname" className="font-semibold">{t("surnameLabel")}</label>
            <input
              className="border p-2 rounded-xl border-gray-400 bg-gray-300"
              name="latest.ru.surname"
              id="latest.ru.surname"
              type="text"
              value={form.values.latest.ru.surname}
              onChange={form.handleChange}
            />
            {form.errors.latest && form.errors.latest.ru?.surname && form.touched.latest && form.touched.latest.ru?.surname && (
              <div className="text-red-500 font-bold text-sm">{form.errors.latest.ru.surname}</div>
            )}
          </div>
          <div className="flex flex-col space-y-1 px-3">
            <label htmlFor="latest.ru.name" className="font-semibold">{t("nameLabel")}</label>
            <input
              className="border p-2 rounded-xl border-gray-400 bg-gray-300"
              name="latest.ru.name"
              id="latest.ru.name"
              type="text"
              value={form.values.latest.ru.name}
              onChange={form.handleChange}
            />
            {form.errors.latest && form.errors.latest.ru?.name && form.touched.latest && form.touched.latest.ru?.name && (
              <div className="text-red-500 font-bold text-sm">{form.errors.latest.ru.name}</div>
            )}
          </div>
          <div className="flex flex-col space-y-1 px-3">
            <label htmlFor="latest.ru.middlename" className="font-semibold">{t("middlenameLabel")}</label>
            <input
              className="border p-2 rounded-xl border-gray-400 bg-gray-300"
              name="latest.ru.middlename"
              id="latest.ru.middlename"
              type="text"
              value={form.values.latest.ru.middlename}
              onChange={form.handleChange}
            />
            {form.errors.latest && form.errors.latest.ru?.middlename && form.touched.latest && form.touched.latest.ru?.middlename && (
              <div className="text-red-500 font-bold text-sm">{form.errors.latest.ru.middlename}</div>
            )}
          </div>
        </div>
        {/* Latest credentials on english */}
        <div className="border-b-1 px-2 pb-4">
          <h4 className="font-semibold text-l text-center">{t("stateYourCurrentCredentialsOnEnglish")}</h4>
          <div className="flex flex-col space-y-1 px-3">
            <label htmlFor="latest.en.surname" className="font-semibold">{t("surnameLabel")}</label>
            <input
              className="border p-2 rounded-xl border-gray-400 bg-gray-300"
              name="latest.en.surname"
              id="latest.en.surname"
              type="text"
              value={form.values.latest.en.surname}
              onChange={form.handleChange}
            />
            {form.errors.latest && form.errors.latest.en?.surname && form.touched.latest && form.touched.latest.en?.surname && (
              <div className="text-red-500 font-bold text-sm">{form.errors.latest.en.surname}</div>
            )}
          </div>
          <div className="flex flex-col space-y-1 px-3">
            <label htmlFor="latest.en.name" className="font-semibold">{t("nameLabel")}</label>
            <input
              className="border p-2 rounded-xl border-gray-400 bg-gray-300"
              name="latest.en.name"
              id="latest.en.name"
              type="text"
              value={form.values.latest.en.name}
              onChange={form.handleChange}
            />
            {form.errors.latest && form.errors.latest.en?.name && form.touched.latest && form.touched.latest.en?.name && (
              <div className="text-red-500 font-bold text-sm">{form.errors.latest.en.name}</div>
            )}
          </div>
          <div className="flex flex-col space-y-1 px-3">
            <label htmlFor="latest.en.middlename" className="font-semibold">{t("middlenameLabel")}</label>
            <input
              className="border p-2 rounded-xl border-gray-400 bg-gray-300"
              name="latest.en.middlename"
              id="latest.en.middlename"
              type="text"
              value={form.values.latest.en.middlename}
              onChange={form.handleChange}
            />
            {form.errors.latest && form.errors.latest.en?.middlename && form.touched.latest && form.touched.latest.en?.middlename && (
              <div className="text-red-500 font-bold text-sm">{form.errors.latest.en.middlename}</div>
            )}
          </div>
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
