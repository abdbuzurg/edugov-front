import Loader from "@/components/Loader";

export default function Loading() {
  return (
    <div className="absolute inset-0
      flex items-center justify-center
      bg-white bg-opacity-75 
      z-50
      backdrop-blur-sm">
      <Loader />

    </div>
  )
}
