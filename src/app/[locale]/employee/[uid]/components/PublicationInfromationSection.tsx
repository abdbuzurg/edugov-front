"use client"

import { employeeApi } from "@/api/employee"
import { ApiError } from "@/api/types"
import Dialog from "@/components/Dialog"
import { EmployeePublication } from "@/types/employee"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useFormik } from "formik"
import { useEffect, useState } from "react"
import { FaExternalLinkAlt, FaPen, FaPlus, FaTrash } from "react-icons/fa"
import { toast } from "react-toastify"
import * as yup from "yup"


interface Props {
  publications: EmployeePublication[] | undefined
  employeeID: number
  locale: string
}

interface PublicationState extends EmployeePublication {
  editMode: boolean
}

export default function PublicationInformationSection({ publications, employeeID, locale }: Props) {
  const queryClient = useQueryClient()

  const [publicationState, setPublicationState] = useState<PublicationState[]>([])
  useEffect(() => {
    setPublicationState(publications ? publications.map(v => ({
      ...v,
      employeeID: employeeID,
      editMode: false,
    })) : [])
  }, [])

  const publicationQuery = useQuery<EmployeePublication[], AxiosError<ApiError>, EmployeePublication[]>({
    queryKey: ["employee-publication", {
      employeeID: employeeID,
      locale: locale,
    }],
    queryFn: () => employeeApi.getPublicationByEmployeeID(employeeID),
  })
  useEffect(() => {
    if (publicationQuery.data) {
      setPublicationState([...publicationQuery.data.map(v => ({
        ...v,
        editMode: false,
      }))])
    }
  }, [publicationQuery.data])

  const addNewPublication = () => {
    const publication = publicationState.find(v => v.id === 0)
    if (publication) {
      toast.error("Завершите текущее добавление.")
      return
    }
    setPublicationState([
      {
        id: 0,
        employeeID: employeeID,
        publicationTitle: "",
        linkToPublication: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        editMode: true,
      },
      ...publicationState,
    ])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedID, setToBeDeletedID] = useState(-1)
  const deletePublicationMutation = useMutation<void, AxiosError<ApiError>, number>({
    mutationFn: employeeApi.deletePublication,
  })
  const deletePublication = () => {
    const loadingStateToast = toast.info("Удаление из категории Публикации...")
    deletePublicationMutation.mutate(toBeDeletedID, {
      onSettled: () => {
        toast.dismiss(loadingStateToast)
      },
      onSuccess: () => {
        toast.success("Удаление Успешно.")
        queryClient.invalidateQueries({
          queryKey: ["employee-publication", {
            employeeID: employeeID,
            locale: locale,
          }]
        })
        setIsDeleteDialogOpen(false)
      },
      onError: (error) => {
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(`{t("onUpdateErrorToastText")} - ${error.response.data.message}`)
        } else {
          toast(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
        }
      }
    })
  }

  return (
    <div className="bg-gray-100 rounded-xl py-4">
      <div className="flex justify-between border-b-1 border-gray-500 pb-2 px-6">
        <p className="font-bold text-xl">Публикации</p>
        <div className="cursor-pointer">
          <FaPlus color="blue" onClick={() => addNewPublication()} />
        </div>
      </div>
      <div className="flex flex-col space-y-1 pb-2 px-6">
        <Dialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <h4 className="text-center font-semibold">Вы уверены что хотите удалить?</h4>
          <div className="flex space-x-2 items-center justify-center mt-2">
            <div
              className="py-2 px-4 bg-red-500 hover:bg-red-700 text-white rounded cursor-pointer"
              onClick={() => deletePublication()}
            >
              Удалить
            </div>
            <div
              className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded cursor-pointer"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Отмена
            </div>
          </div>
        </Dialog>
        {publicationState.map((publication, index) =>
          !publication.editMode
            ?
            <PublicationDisplay
              key={publication.id}
              publication={publication}
              enableEditMode={() => {
                const publications = publicationState.map((v, i) => i === index ? { ...v, editMode: true } : v)
                setPublicationState(publications)
              }}
              onDeleteClick={() => {
                setIsDeleteDialogOpen(true)
                setToBeDeletedID(publication.id)
              }}
            />
            :
            <PublicationEdit
              key={publication.id}
              publication={publication}
              employeeID={employeeID}
              index={index}
              locale={locale}
              disableEditMode={() => {
                const publications = publicationState.map((v, i) => i === index ? { ...v, editMode: false } : v)
                setPublicationState(publications)
              }}
              removeNewPublicationOnCancel={() => {
                const publications = publicationState.filter((_, i) => i != index)
                setPublicationState([...publications])
              }}
            />
        )}
      </div>
    </div>
  )
}

interface PublicationDisplayProps {
  publication: EmployeePublication | undefined
  enableEditMode: () => void
  onDeleteClick: () => void
}

function PublicationDisplay({ publication, enableEditMode, onDeleteClick }: PublicationDisplayProps) {
  if (!publication) return null

  return (
    <div className="flex justify-between items-center border-gray-500 space-x-2">
      <div className="flex space-x-1 items-center">
        <p className="font-bold text-l">
          {publication.publicationTitle}
          <a
            className="inline-block ml-1"
            href={publication.linkToPublication}
            target="_blank"
          >
            <FaExternalLinkAlt color="blue" />
          </a>
        </p>
      </div>
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
    </div>
  )
}

interface PublicationEditProps {
  publication: EmployeePublication | undefined
  employeeID: number
  index: number
  locale: string
  disableEditMode: () => void
  removeNewPublicationOnCancel: () => void
}

function PublicationEdit({
  publication,
  employeeID,
  index,
  locale,
  disableEditMode,
  removeNewPublicationOnCancel,
}: PublicationEditProps) {
  if (!publication) return null

  const queryClient = useQueryClient()
  const createPublication = useMutation<EmployeePublication, AxiosError<ApiError>, EmployeePublication>({
    mutationFn: employeeApi.createPublication,
  })

  const updatePublication = useMutation<EmployeePublication, AxiosError<ApiError>, EmployeePublication>({
    mutationFn: employeeApi.updatePublication,
  })

  const form = useFormik({
    initialValues: { ...publication },
    validationSchema: yup.object({
      publicationTitle: yup.string().required(),
      linkToPublication: yup.string().required()
    }),
    onSubmit: (values) => {
      if (values.id === 0) {
        const loadingStateToast = toast.info("Идёт сохранение новых данных в категории Публикации...")
        createPublication.mutate(values, {
          onSettled: () => {
            toast.dismiss(loadingStateToast)
          },
          onSuccess: () => {
            toast.success("Новые данные были успешно добавлены в категорию Публикации.")
            queryClient.invalidateQueries({
              queryKey: ["employee-publication", {
                employeeID: employeeID,
                locale: locale
              }]
            })
            disableEditMode()
          },
          onError: (error) => {
            if (error.response && error.response.data && error.response.data.message) {
              toast.error(`{t("onUpdateErrorToastText")} - ${error.response.data.message}`)
            } else {
              toast(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
            }
          }
        })
        return
      }

      const loadingStateToast = toast.info("Идёт обновление данных в категории Публикации...")
      updatePublication.mutate(values, {
        onSettled: () => {
          toast.dismiss(loadingStateToast)
        },
        onSuccess: () => {
          toast.success("Данные были успешно обновлены в категорию Публикации.")
          queryClient.invalidateQueries({
            queryKey: ["employee-publication", {
              employeeID: employeeID,
              locale: locale,
            }]
          })
          disableEditMode()
        },
        onError: (error) => {
          if (error.response && error.response.data && error.response.data.message) {
            toast.error(`{t("onUpdateErrorToastText")} - ${error.response.data.message}`)
          } else {
            toast(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
          }
        }
      })
    }
  })

  const onCancelClick = (id: number) => {
    if (id === 0) {
      removeNewPublicationOnCancel()
      return
    }

    disableEditMode()
  }

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col space-y-2 border-b-1 pb-2">
      <div className="flex flex-col space-y-1">
        <label htmlFor={`${index}_publicationTitle]`} className="font-semibold">Название публикации</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_publicationTitle`}
          name={`publicationTitle`}
          value={form.values.publicationTitle}
          onChange={form.handleChange}
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor={`${index}_linkToPublication]`} className="font-semibold">Ссылка на публикацию</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_linkToPublication`}
          name={`linkToPublication`}
          value={form.values.linkToPublication}
          onChange={form.handleChange}
        />
      </div>

      <div className="flex space-x-2 items-center justify-start">
        <button
          type="submit"
          className="py-2 px-4 bg-green-500 hover:bg-green-700 text-white rounded cursor-pointer"
        >
          Сохранить
        </button>
        <button
          type="button"
          className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded cursor-pointer"
          onClick={() => onCancelClick(publication.id)}
        >
          Отмена
        </button>
      </div>
    </form>
  )
}