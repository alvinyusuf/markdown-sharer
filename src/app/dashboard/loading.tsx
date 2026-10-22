import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      <Skeleton className="h-80 w-full rounded-2xl" />
    </div>
  );
}
