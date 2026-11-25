import LeadForm from "@/components/admin/leads/LeadForm";

export default function NewLeadPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">New Lead</h1>
      <LeadForm />
    </div>
  );
}
