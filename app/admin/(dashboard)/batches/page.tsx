import Link from "next/link";
import { Button } from "@/components/ui/button";
import BatchesTable from "@/components/admin/batches/BatchesTable";

export default function BatchesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Batches</h1>
        <Button asChild>
          <Link href="/admin/batches/new">New Batch</Link>
        </Button>
      </div>
      <BatchesTable />
    </div>
  );
}
