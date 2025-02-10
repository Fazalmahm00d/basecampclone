import Assignments from "@/components/dashboard-components/Assignments";
import RecentlyVisited from "@/components/dashboard-components/RecentlyVisited";
import Schedule from "@/components/dashboard-components/Schedule";
import ActionButtons from "@/components/dashboard-components/Button";
import { Separator } from "@/components/ui/separator";
import ProjectGrid from "@/components/dashboard-components/ProjectGrid";

export default function DashBoard() {
  return (
    <div className="container min-h-screen bg-gray-50 ">
      <ActionButtons />
      <Separator/>
      <div className="">
        <RecentlyVisited />
        <ProjectGrid/>
      <div className="flex gap-2 items-start justify-center">
        <Schedule />
        <Assignments />
      </div>
      </div>

    </div>
  );
}
