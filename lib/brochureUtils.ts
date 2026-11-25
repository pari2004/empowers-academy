export function resolveProgramBrochureUrl(slug: string, title?: string): string {
  const s = (slug || "").toLowerCase();
  const t = (title || "").toLowerCase();

  if (s.includes("cloud") || t.includes("cloud")) {
    return "/brochures/Cloud_Devops.pdf";
  }
  if (s.includes("cyber") || s.includes("ceh") || t.includes("cybersecurity") || t.includes("ethical")) {
    return "/brochures/Cybersecurity_CEH_v13_Brochure.pdf";
  }
  if (s.includes("business") || t.includes("business analyst") || t.includes("ai program")) {
    return "/brochures/Business_Analyst_and_AI_Program_edited.pdf";
  }
  if (s.includes("executive") || t.includes("executive") || t.includes("agentic")) {
    return "/brochures/Executive GenAI & Agentic AI Programme Brochure (1).pdf";
  }
  if (s.includes("full-stack") || s.includes("apex") || t.includes("full stack") || t.includes("apex")) {
    return "/brochures/Full_Stack_Development_Brochure.pdf";
  }

  return "/brochures/Full_Stack_Development_Brochure.pdf";
}
