import { useDocumentTitle } from "@/hooks";

const HomePage = () => {
  useDocumentTitle("Home");

  return (
    <div className="page-wrapper">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          React + Vite Starter 🚀
        </h1>
        <p className="mt-4 max-w-md text-gray-500">
          Clean component-based architecture. Replace this page with your own content.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
