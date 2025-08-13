import { Metadata } from "next";
import PersonnelView from "./components/PersonnelView";

export const metadata: Metadata = {
  title: "Кадры"
}

export default async function Personnel({
  params
}: {
  params: Promise<{
    locale: string
  }>
}) {

  const {locale } = await params

  return (
    <PersonnelView locale={locale}/>
  )
}