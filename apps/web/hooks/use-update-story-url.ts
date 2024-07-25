import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export const useUpdateStoryUrl = (): (({
  fileId,
  fileName,
  title,
}: {
  fileId: string;
  fileName: string;
  title?: string;
}) => void) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateStoryUrl = useCallback(
    ({
      fileId,
      fileName,
      title,
    }: {
      fileId: string;
      fileName: string;
      title?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (fileId) {
        params.set("file", fileName);
      }

      const newQueryString = params.toString();
      const newPath = title ? `/stories/${title}` : pathname;
      router.push(`${newPath}?${newQueryString}`);
    },
    [router, pathname, searchParams]
  );

  return updateStoryUrl;
};

export default useUpdateStoryUrl;
