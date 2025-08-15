"use client"

import { employeeApi } from "@/api/employee"
import { ApiError } from "@/api/types"
import Dialog from "@/components/Dialog"
import { EmployeeSocial } from "@/types/employee"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Axios, AxiosError } from "axios"
import { useFormik } from "formik"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { FaExternalLinkAlt, FaPen, FaPlus, FaTrash } from "react-icons/fa"
import { toast } from "react-toastify"
import * as yup from "yup"

interface Props {
  socials: EmployeeSocial[] | undefined
  employeeID: number
  isCurrentUserProfile: boolean
}

interface SocialState extends EmployeeSocial {
  editMode: boolean
}

export default function SocialInformationSection({ socials, employeeID, isCurrentUserProfile }: Props) {
  const t = useTranslations("Employee.Social")
  const queryClient = useQueryClient()

  const [socialsState, setSocialsState] = useState<SocialState[]>([])
  useEffect(() => {
    setSocialsState(socials ? socials.map((v) => ({
      ...v,
      employeeID: employeeID,
      editMode: false,
    })) : [])
  }, [])

  const socialQuery = useQuery<EmployeeSocial[], AxiosError<ApiError>, EmployeeSocial[]>({
    queryKey: ["employee-socials", {
      employeeID: employeeID,
    }],
    queryFn: () => employeeApi.getSocialByEmployeeID(employeeID),
    initialData: socials ?? [],
    refetchOnMount: false,
  })
  useEffect(() => {
    if (socialQuery.data) {
      setSocialsState([...socialQuery.data.map((v) => ({
        ...v,
        employeeID: employeeID,
        editMode: false,
      }))])
    }
  }, [socialQuery.data])

  const addNewSocial = () => {
    const socials = socialsState.find(v => v.id == 0)
    if (socials) {
      toast.error(t("finishCurrentNewEntry"))
      return
    }

    setSocialsState([{
      id: 0,
      employeeID: employeeID,
      socialName: "",
      linkToSocial: "",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
      editMode: true,
    }, ...socialsState])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedID, setToBeDeletedID] = useState(-1)
  const deleteDegreeMutation = useMutation<void, AxiosError<ApiError>, number>({
    mutationFn: employeeApi.deleteSocial
  })
  const deleteDegree = () => {
    const loadingStateToast = toast.info(t("deleteLoadingToastText"))
    deleteDegreeMutation.mutate(toBeDeletedID, {
      onSettled: () => {
        toast.dismiss(loadingStateToast)
      },
      onSuccess: () => {
        toast.success(t("deleteSuccessToastText"))
        queryClient.invalidateQueries({
          queryKey: ["employee-socials", {
            employeeID: employeeID,
          }]
        })
        setIsDeleteDialogOpen(false)
      },
      onError: (error) => {
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(`${t("deleteErrorToastText")} - ${error.response.data.message}`)
        } else {
          toast(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
        }
      }
    })
  }

  return (
    <div className="bg-gray-100 rounded-xl py-4">
      <div className="flex justify-between border-b-1 border-gray-500 pb-2 px-6">
        <p className="font-bold text-xl">{t("socialLabelText")}</p>
        {isCurrentUserProfile &&
          <div className="cursor-pointer">
            <FaPlus color="blue" onClick={() => addNewSocial()} />
          </div>
        }
      </div>
      <div className="flex flex-col space-y-1 px-6 py-1">
        <Dialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <h4 className="text-center font-semibold">{t("deleteDialogHeaderText")}</h4>
          <div className="flex space-x-2 items-center justify-center mt-2">
            <div
              className="py-2 px-4 bg-red-500 hover:bg-red-700 text-white rounded cursor-pointer"
              onClick={() => deleteDegree()}
            >
              {t("deleteDialogDeleteButtonText")}
            </div>
            <div
              className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded cursor-pointer"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t("deleteDialogCancelButtonText")}
            </div>
          </div>
        </Dialog>
        {socialsState.map((social, index) =>
          !social.editMode
            ?
            <SocialDisplay
              key={social.id}
              social={social}
              isCurrentUserProfile={isCurrentUserProfile}
              enableEditMode={() => {
                const editModeEnabled = socialsState.map((v, i) => i == index ? { ...v, editMode: true } : v)
                setSocialsState([...editModeEnabled])
              }}
              onDeleteClick={() => {
                setIsDeleteDialogOpen(true)
                setToBeDeletedID(social.id)
              }}
            />
            :
            <SocialEdit
              key={social.id}
              social={social}
              index={index}
              employeeID={employeeID}
              disableEditMode={() => {
                const editModeEnabled = socialsState.map((v, i) => i == index ? { ...v, editMode: false } : v)
                setSocialsState([...editModeEnabled])
              }}
              removeNewDegreeOnCancel={() => {
                const socials = socialsState.filter((_, i) => i != index)
                setSocialsState(socials)
              }}
              updateDegreeState={(values: SocialState) => {
                const socials = socialsState.map((v, i) => i === index ? values : v)
                setSocialsState(socials)
              }}
            />
        )}
      </div>
    </div>
  )
}

interface SocialDisplayProps {
  social: EmployeeSocial | undefined
  isCurrentUserProfile: boolean
  enableEditMode: () => void
  onDeleteClick: () => void
}

function SocialDisplay({ social, isCurrentUserProfile, enableEditMode, onDeleteClick }: SocialDisplayProps) {
  if (!social) return null
  return (
    <div className="flex justify-between">
      <div className="flex gap-x-2 items-center">
        <h4 className="font-semibold text-l">{social.socialName}</h4>
        <a
          className="inline-block ml-1"
          href={social.linkToSocial}
          target="_blank"
        >
          <FaExternalLinkAlt color="blue" />
        </a>
      </div>
      {isCurrentUserProfile &&
        <div className="flex space-x-2">
          <FaPen
            className="cursor-pointer"
            color="blue"
            onClick={() => enableEditMode()}
          />
          <FaTrash
            color="red"
            onClick={() => onDeleteClick()}
            className="cursor-pointer"
          />
        </div>
      }
    </div>
  )
}

interface SocialEditProps {
  index: number
  employeeID: number
  social: EmployeeSocial | undefined
  disableEditMode: () => void
  removeNewDegreeOnCancel: () => void
  updateDegreeState: (values: SocialState) => void
}


function SocialEdit({ index, employeeID, social, disableEditMode, removeNewDegreeOnCancel, updateDegreeState }: SocialEditProps) {
  if (!social) return null
  const t = useTranslations("Employee.Social")

  const defaultSocials = [
    "Google Scolar",
    "Scopus",
    "E-library",
    t("otherValue"),
  ]

  const queryClient = useQueryClient()
  const createSocialMutation = useMutation<EmployeeSocial, AxiosError<ApiError>, EmployeeSocial>({
    mutationFn: employeeApi.createSocial,
  })

  const updateSocialMutation = useMutation<EmployeeSocial, AxiosError<ApiError>, EmployeeSocial>({
    mutationFn: employeeApi.updateSocial,
  })

  const form = useFormik({
    initialValues: {
      ...social,
      socialName: defaultSocials.find(v => v == social.socialName) ?? t("otherValue"),
      otherSocial: !defaultSocials.find(v => v == social.socialName) ? social.socialName : "",
    },
    validationSchema: yup.object({
      socialName: yup
        .string()
        .required("socialNameValidationRequiredText"),
      linkToSocial: yup
        .string()
        .required("linkToSocialValidationRequiredText"),
      otherSocial: yup
        .string()
        .when('socialName', {
          is: t("otherValue"),
          then: (schema) => schema.required("otherSocialValidationRequiredText"),
          otherwise: (schema) => schema.optional().strip()
        }),
    }),
    onSubmit: (values) => {
      const mutationVariable: EmployeeSocial = {
        ...values,
        socialName: values.socialName == t("otherValue") ? values.otherSocial : values.socialName,
        employeeID: employeeID,
      }

      if (values.id === 0) {
        const loadingStateToast = toast.info(t("createLoadingToastText"))
        createSocialMutation.mutate(mutationVariable, {
          onSettled: () => {
            toast.dismiss(loadingStateToast)
          },
          onSuccess: () => {
            toast.success(t("createSuccessToastText"))
            queryClient.invalidateQueries({
              queryKey: ["employee-socials", {
                employeeID: employeeID,
              }]
            })
            disableEditMode()
          },
          onError: (error) => {
            if (error.response && error.response.data && error.response.data.message) {
              toast.error(`${t("createErrorToastText")} - ${error.response.data.message}`)
            } else {
              toast(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
            }
          }
        })

        return
      }

      const loadingStateToast = toast.info(t("updateLoadingToastText"))
      updateSocialMutation.mutate(mutationVariable, {
        onSettled: () => {
          toast.dismiss(loadingStateToast)
        },
        onSuccess: () => {
          toast.success(t("updateSuccessToastText"))
          queryClient.invalidateQueries({
            queryKey: ["employee-socials", {
              employeeID: employeeID,
            }]
          })
          disableEditMode()
        },
        onError: (error) => {
          if (error.response && error.response.data && error.response.data.message) {
            toast.error(`${t("updateErrorToastText")} - ${error.response.data.message}`)
          } else {
            toast(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
          }
        }
      })
    }
  })

  const onCancelClick = (id: number) => {
    if (id === 0) {
      removeNewDegreeOnCancel()
      return
    }

    disableEditMode()
  }

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col space-y-2 border-b-1 pb-2">
      <div className="flex flex-col gap-y-1">
        <label className="font-semibold">{t("socialNameLabelText")}</label>
        <div className="flex flex-col gap-y-2">
          <select
            value={form.values.socialName}
            name="socialName"
            onChange={(e) => form.setFieldValue("socialName", e.target.value)}
            className="flex-1 border p-2 rounded-xl border-gray-400 bg-gray-300"
          >
            <option value="" disabled>Выбрите соц.сеть</option>
            {defaultSocials.map((v, i) => (
              <option key={i} value={v}>{v}</option>
            ))}
          </select>
          {form.values.socialName == t("otherValue") &&
            <input
              type="text"
              className="flex-1 border p-2 rounded-xl border-gray-400 bg-gray-300"
              id={`${index}_speciality`}
              name="otherSocial"
              value={form.values.otherSocial}
              onChange={form.handleChange}
              placeholder={t("socialNameOtherPlaceholderLabelText")}
            />
          }
        </div>
        {form.errors.socialName && form.touched.socialName && (
          <div className="text-red-500 font-bold text-sm">{form.errors.socialName}</div>
        )}
        {form.values.socialName == "other" && form.touched.otherSocial && form.errors.otherSocial ? (
          <div className="text-red-500 font-bold text-sm">{form.errors.otherSocial}</div>
        ) : null}
      </div>
      <div className="flex flex-col space-y-1">
        <label htmlFor={`social[${index}.linkToSocial]`} className="font-semibold">{t("linkToSocialLabelText")}</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_linkToSocial`}
          name="linkToSocial"
          value={form.values.linkToSocial}
          onChange={form.handleChange}
        />
        {form.errors.linkToSocial && form.touched.linkToSocial && (
          <div className="text-red-500 font-bold text-sm">{form.errors.linkToSocial}</div>
        )}
      </div>
      <div className="flex flex-col gap-y-2 items-center justify-start">
        <button
          type="submit"
          className="py-2 px-4 bg-green-500 hover:bg-green-700 text-white rounded cursor-pointer"
        >
          {t("saveButtonText")}
        </button>
        <button
          type="button"
          className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded cursor-pointer"
          onClick={() => onCancelClick(social.id)}
        >
          {t("cancelButtonText")}
        </button>
      </div>
    </form>
  )
}