"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeadsTable from "@/components/admin/leads/LeadsTable";
import LeadsBoard from "@/components/admin/leads/LeadsBoard";

export default function LeadsPage() {
  const { data: session } = useSession();
  const [myLeadsOnly, setMyLeadsOnly] = useState(false);
  const assignedToId = myLeadsOnly ? session?.user.id : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Leads</h1>
        <Button asChild>
          <Link href="/admin/leads/new">New Lead</Link>
        </Button>
      </div>

      <Tabs defaultValue="table">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="table">List</TabsTrigger>
            <TabsTrigger value="board">Pipeline</TabsTrigger>
          </TabsList>
          <Button
            variant={myLeadsOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setMyLeadsOnly((v) => !v)}
          >
            My Leads
          </Button>
        </div>
        <TabsContent value="table">
          <LeadsTable assignedToId={assignedToId} />
        </TabsContent>
        <TabsContent value="board">
          <LeadsBoard assignedToId={assignedToId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
