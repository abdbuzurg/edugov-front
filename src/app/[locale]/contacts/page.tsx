import { Metadata } from "next";
import { FaPhoneAlt, FaRegClock } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosMail } from "react-icons/io";

export const metadata: Metadata = {
  title: "Тамос"
}

export default function Contacts() {
  return (
    <div className="m-auto lg:w-[1280px] w-full flex flex gap-x-4 py-4 justify-between">
      <div className="flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-1">
          <p className="font-bold text-xl italic">
            Вазорати маориф ва илми Ҷумҳурии Тоҷикистон <br/>Раёсати илм ва инноватсия
          </p>
        </div>
        <div className="flex py-2 gap-x-4">
          <div className="w-15 h-15 rounded-full bg-gray-100 flex items-center justify-center">
            <FaLocationDot
              size={25}
              color={"#095088"}
              className="w-full"
            />
          </div>
          <div className="flex flex-col">
            <p className="font-semibold">Суроға</p>
            <p>734024</p>
            <p>ш. Душанбе, кӯчаи Нисормуҳаммад, 13а</p>
          </div>
        </div>
        <div className="flex py-2 gap-x-4">
          <div className="w-15 h-15 rounded-full bg-gray-100 flex items-center justify-center">
            <FaPhoneAlt
              size={25}
              color={"#095088"}
              className="w-full"
            />
          </div>
          <div className="flex flex-col">
            <p className="font-semibold">Телефони боварӣ</p>
            <p>2273259</p>
            <p>+992 2277686</p>
          </div>
        </div>
        <div className="flex py-2 gap-x-4">
          <div className="w-15 h-15 rounded-full bg-gray-100 flex items-center justify-center">
            <IoIosMail
              size={30}
              color={"#095088"}
              className="w-full"
            />
          </div>
          <div className="flex flex-col">
            <p className="font-semibold">Почтаи электронӣ</p>
            <p>ilm@maorif.tj</p>
            <p>nsid@maorif.tj</p>
          </div>
        </div>
        <div className="flex py-2 gap-x-4">
          <div className="w-15 h-15 rounded-full bg-gray-100 flex items-center justify-center">
            <FaRegClock
              size={30}
              color={"#095088"}
              className="w-full"
            />
          </div>
          <div className="flex flex-col">
            <p className="font-semibold">Рӯзҳои корӣ</p>
            <p>Душанбе-Ҷумъа</p>
            <p>08:00-17:00</p>
          </div>
        </div>
      </div>
      <div>
        <iframe src="https://yandex.com/map-widget/v1/?um=constructor%3A60607150b34088577639230e062dd51aac87b34e56d53e000329e46723604ba4&amp;source=constructor" width="679" height="638" frameBorder="0"></iframe>
      </div>
    </div>
  )
}
