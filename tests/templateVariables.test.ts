import { describe, it, expect } from "vitest";
import { renderTemplate, extractTemplateVariables, escapeHtml } from "@/lib/templateVariables";

describe("templateVariables.renderTemplate", () => {
  it("substitutes known tokens", () => {
    const out = renderTemplate("Hi {{studentName}}, welcome to {{courseName}}!", {
      studentName: "Aditi",
      courseName: "AI Bootcamp",
    });
    expect(out).toBe("Hi Aditi, welcome to AI Bootcamp!");
  });

  it("leaves unknown tokens untouched", () => {
    const out = renderTemplate("Hi {{studentName}}, due {{dueDate}}", { studentName: "Aditi" });
    expect(out).toBe("Hi Aditi, due {{dueDate}}");
  });

  it("renders null/undefined values as empty string", () => {
    expect(renderTemplate("Batch: {{batchName}}", { batchName: null })).toBe("Batch: ");
    expect(renderTemplate("Batch: {{batchName}}", { batchName: undefined })).toBe("Batch: ");
  });

  it("HTML-escapes every substituted value to prevent stored/reflected XSS", () => {
    const out = renderTemplate("Hi {{studentName}}", { studentName: "<script>alert(1)</script>" });
    expect(out).toBe("Hi &lt;script&gt;alert(1)&lt;/script&gt;");
    expect(out).not.toContain("<script>");
  });

  it("escapes quotes and ampersands", () => {
    expect(escapeHtml(`Tom & "Jerry" 'Co'`)).toBe("Tom &amp; &quot;Jerry&quot; &#39;Co&#39;");
  });

  it("substitutes numeric values", () => {
    expect(renderTemplate("Amount: {{paymentAmount}}", { paymentAmount: 4999 })).toBe("Amount: 4999");
  });
});

describe("templateVariables.extractTemplateVariables", () => {
  it("returns distinct tokens in first-seen order", () => {
    const vars = extractTemplateVariables("{{studentName}} - {{courseName}} - {{studentName}}");
    expect(vars).toEqual(["studentName", "courseName"]);
  });

  it("returns an empty array when there are no tokens", () => {
    expect(extractTemplateVariables("No tokens here")).toEqual([]);
  });
});
