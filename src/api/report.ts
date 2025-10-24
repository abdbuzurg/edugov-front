import { AxiosResponse } from "axios";
import clientAxios from "./clientAxios"

export interface DownloadFileResponse {
  blob: Blob;
  filename: string;
}

const reportURL = "/report"
export const reportApi = {
  getSummaryReport: async (): Promise<DownloadFileResponse> => {
    try {
      // Make the GET request with Axios.
      // 1. The generic `<Blob>` types the `response.data`.
      // 2. `responseType: 'blob'` is crucial. It tells Axios to handle the
      //    binary response data as a Blob.
      const response: AxiosResponse<Blob> = await clientAxios.get(
        `${reportURL}/summary-data`,
        {
          responseType: 'blob',
        }
      );

      // Axios automatically handles non-2xx responses by throwing an error,
      // so we don't need to check for `response.ok`.

      // The binary data is now in `response.data`
      const blob = response.data;

      // Extract the filename from the 'content-disposition' header
      const contentDisposition = response.headers['content-disposition'];
      let filename = "summary.xlsx"; // A sensible default

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      return { blob, filename };
    } catch (error) {
      // Log the error and re-throw a more user-friendly message
      console.error("Axios download error:", error);
      throw new Error("Failed to download file. Please try again later.");
    }
  },
} 
