"use client"

import { DownloadFileResponse, reportApi } from "@/api/report"
import { useMutation } from "@tanstack/react-query"

export default function SummaryDataButton() {

  const { mutate, isPending } = useMutation<DownloadFileResponse, Error, void>({
    mutationFn: () => reportApi.getSummaryReport(),
    onSuccess: (data) => {
      const { blob, filename } = data;

      // Create a temporary URL from the blob data
      const url = window.URL.createObjectURL(blob);

      // Create a hidden anchor element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // Set the downloaded file's name

      // Append the link to the body, click it, and then remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the object URL to free up memory
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      // `error` is typed as Error
      console.error('Download failed:', error.message);
      // Here you could show a toast notification to the user
      alert(`Error: ${error.message}`);
    },
  })

  const handleDownload = () => {
    // Calling mutate() triggers the mutationFn
    mutate();
  };

  return (
    <button
      className="bg-[#095088] px-2 py-4 rounded-xl text-white uppercase font-bold cursor-pointer hover:bg-blue-400"
      onClick={handleDownload}
      disabled={isPending}
    >
      маълумоти ҷамъбастӣ
    </button>
  )
}
