import { useEffect } from "react";
import { APP_NAME } from "@/constants";

/**
 * useDocumentTitle — sets the browser tab title per page.
 *
 * @example
 *   useDocumentTitle("Dashboard"); // → "Dashboard | MyApp"
 */
const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
    return () => {
      document.title = APP_NAME;
    };
  }, [title]);
};

export default useDocumentTitle;
