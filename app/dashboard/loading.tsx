/**
 * @fileoverview Loading state for dashboard page.
 */

import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
