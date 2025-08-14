"use client"

import Image, { ImageProps } from "next/image"
import { useState } from "react"

interface Props extends ImageProps {
  fallbackSrc: string
}

export default function ProfilePicture({
  fallbackSrc,
  src,
  ...props
}: Props) {
  const [imgSrc, setImageSrc] = useState(src)

  const handleError = () => {
    setImageSrc(fallbackSrc)
  }

  return (
    <Image
      className={props.className}
      src={imgSrc}
      alt="profile_picture"
      width={100}
      height={100}
      onError={handleError}
      unoptimized={true}
      priority={true}
    />
  )
}