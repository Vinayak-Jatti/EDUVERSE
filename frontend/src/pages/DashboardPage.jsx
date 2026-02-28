import { useDocumentTitle } from "@/hooks";

const DashboardPage = () => {
  useDocumentTitle("Dashboard");

  return (
    <div className="page-wrapper">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-sm text-gray-500">Your dashboard content goes here.</p>
    </div>
  );
};

export default DashboardPage;
