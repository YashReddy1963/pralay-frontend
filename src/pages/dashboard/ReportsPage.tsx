import { useAuth } from "@/contexts/AuthContext";
import ReportsTable from "./ReportsTable";
import DistrictReports from "./DistrictReports";

const ReportsPage = () => {
  const { user } = useAuth();

  // If user is district chairman, show the specialized district reports page
  if (user?.role === 'district_chairman') {
    return <DistrictReports />;
  }

  // For all other roles (state chairman, etc.), show the regular reports table
  return <ReportsTable />;
};

export default ReportsPage;
