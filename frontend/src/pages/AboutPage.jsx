import { useDocumentTitle } from "@/hooks";

const AboutPage = () => {
  useDocumentTitle("About");

  return (
    <div className="page-wrapper">
      <h1 className="text-2xl font-bold text-gray-900">About</h1>
      <p className="mt-2 text-sm text-gray-500">About page content goes here.</p>
    </div>
  );
};

export default AboutPage;
