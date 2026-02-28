import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks";
import { ROUTES } from "@/constants";

const NotFoundPage = () => {
  useDocumentTitle("404 — Not Found");

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <p className="text-lg font-medium text-gray-700">Page not found</p>
      <p className="text-sm text-gray-400">The page you're looking for doesn't exist.</p>
      <Link to={ROUTES.HOME} className="mt-2 text-sm text-primary-600 underline hover:text-primary-700">
        Go back home
      </Link>
    </div>
  );
};

export default NotFoundPage;
