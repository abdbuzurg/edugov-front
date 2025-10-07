import Image from "next/image";

export default function HelpInformationSection() {
  return (
    <div className="bg-gray-100 rounded-xl py-4 px-2 text-center flex flex-col gap-y-2">
      <span className="font-bold">Агар савол ё пешниҳод бошад, ба телеграмм - канал нависед</span>
      <div>
        <Image
          src="/images/telegram_help_channel.png"
          alt={"Помощь по заполнению"}
          loading="eager"
          width={997}
          height={664}
          quality={100}
        />
      </div>
    </div>
  )
}
