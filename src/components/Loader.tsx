"use client"

import { Circles } from "react-loader-spinner";

export default function Loader() {
  return (
    <Circles
      height="150"
      width="150"
      color="#4fa94d"
      ariaLabel="circles-loading"
      wrapperStyle={{}}
      wrapperClass=""
      visible={true}
    />
  )
}
