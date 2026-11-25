"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import styles from "@/components/admin/DataTable.module.css";
import pageStyles from "../module-list.module.css";
import detailStyles from "./contacts.module.css";
import {
  companyTypeLabel,
  lookingForLabel,
  enquiryTypeLabel,
  statusLabel,
  companyTypeOptions,
  lookingForOptions,
  enquiryTypeOptions,
  statusOptions,
} from "@/lib/contactEnquiryLabels";

type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  courseInterested: string | null;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "FOLLOW_UP" | "ENROLLED" | "CLOSED";
  message: string | null;
  notes: string | null;
  companyType: "SERVICE_BASED" | "PRODUCT_BASED" | null;
  lookingFor: "SWITCH_CAREER" | "GROW_ROLE" | "HIGHER_OFFER" | "NOT_SURE" | null;
  companyName: string | null;
  designation: string | null;
  enquiryType: "CALLBACK" | "BROCHURE_DOWNLOAD" | null;
  createdAt: string;
};

const dash = (v: string | null | undefined) => (v && v.trim() ? v : "—");

export default function ContactsPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [enquiryType, setEnquiryType] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Enquiry | null>(null);

  const { data } = useQuery({
    queryKey: ["admin-contacts", page, status, enquiryType, companyType, lookingFor, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (status) params.set("status", status);
      if (enquiryType) params.set("enquiryType", enquiryType);
      if (companyType) params.set("companyType", companyType);
      if (lookingFor) params.set("lookingFor", lookingFor);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/contacts?${params}`);
      return (await res.json()) as { items: Enquiry[]; pageCount: number };
    },
  });

  async function updateStatus(id: string, newStatus: string) {
    await fetch(`/api/admin/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
    showToast("Status updated", "success");
    setSelected((s) => (s && s.id === id ? { ...s, status: newStatus as Enquiry["status"] } : s));
  }

  async function deleteContact(id: string) {
    await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
    showToast("Enquiry deleted", "success");
    setPendingDelete(null);
    setSelected((s) => (s && s.id === id ? null : s));
  }

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Contact Enquiries</h1>
        <Link className={pageStyles.primaryBtn} href="/api/admin/contacts/export">
          Export CSV
        </Link>
      </div>

      <div className={styles.wrap}>
        <div className={detailStyles.toolbarWrap}>
          <input
            className={styles.search}
            placeholder="Search name, email, phone, company, designation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className={styles.search} value={enquiryType} onChange={(e) => setEnquiryType(e.target.value)}>
            <option value="">All enquiry types</option>
            {enquiryTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select className={styles.search} value={companyType} onChange={(e) => setCompanyType(e.target.value)}>
            <option value="">All company types</option>
            {companyTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select className={styles.search} value={lookingFor} onChange={(e) => setLookingFor(e.target.value)}>
            <option value="">All &ldquo;looking for&rdquo;</option>
            {lookingForOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select className={styles.search} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className={detailStyles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company Type</th>
                <th>Looking For</th>
                <th>Enquiry Type</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((e) => (
                <tr key={e.id} className={detailStyles.row} onClick={() => setSelected(e)}>
                  <td>{e.name}</td>
                  <td>{e.email}</td>
                  <td>{dash(e.phone)}</td>
                  <td>{companyTypeLabel(e.companyType)}</td>
                  <td>{lookingForLabel(e.lookingFor)}</td>
                  <td>{enquiryTypeLabel(e.enquiryType)}</td>
                  <td onClick={(ev) => ev.stopPropagation()}>
                    <select className={styles.search} value={e.status} onChange={(ev) => updateStatus(e.id, ev.target.value)}>
                      {statusOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setSelected(e);
                        }}
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setPendingDelete(e);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(data?.items?.length ?? 0) === 0 && <div className={styles.empty}>No enquiries yet.</div>}
        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {data?.pageCount ?? 1}
          </span>
          <button className={styles.pageBtn} disabled={page >= (data?.pageCount ?? 1)} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>

      <Modal open={!!selected} title="Contact Enquiry Details" onClose={() => setSelected(null)} wide>
        {selected && (
          <div className={detailStyles.detailGrid}>
            <div className={detailStyles.detailSection}>
              <span className={detailStyles.detailLabel}>Full Name</span>
              <span className={detailStyles.detailValue}>{dash(selected.name)}</span>
            </div>
            <div className={detailStyles.detailSection}>
              <span className={detailStyles.detailLabel}>Phone Number</span>
              <span className={detailStyles.detailValue}>{dash(selected.phone)}</span>
            </div>
            <div className={detailStyles.detailSection}>
              <span className={detailStyles.detailLabel}>Email Address</span>
              <span className={detailStyles.detailValue}>{dash(selected.email)}</span>
            </div>
            <div className={detailStyles.detailSection}>
              <span className={detailStyles.detailLabel}>Current Company Type</span>
              <span className={detailStyles.detailValue}>{companyTypeLabel(selected.companyType)}</span>
            </div>
            <div className={detailStyles.detailSection}>
              <span className={detailStyles.detailLabel}>What are you looking for?</span>
              <span className={detailStyles.detailValue}>{lookingForLabel(selected.lookingFor)}</span>
            </div>
            <div className={detailStyles.detailSection}>
              <span className={detailStyles.detailLabel}>Company Name</span>
              <span className={detailStyles.detailValue}>{dash(selected.companyName)}</span>
            </div>
            <div className={detailStyles.detailSection}>
              <span className={detailStyles.detailLabel}>Designation</span>
              <span className={detailStyles.detailValue}>{dash(selected.designation)}</span>
            </div>
            <div className={detailStyles.detailSection}>
              <span className={detailStyles.detailLabel}>Enquiry Type</span>
              <span className={detailStyles.detailValue}>{enquiryTypeLabel(selected.enquiryType)}</span>
            </div>
            <div className={detailStyles.detailSection}>
              <span className={detailStyles.detailLabel}>Course / Programme</span>
              <span className={detailStyles.detailValue}>{dash(selected.courseInterested)}</span>
            </div>
            <div className={detailStyles.detailSection}>
              <span className={detailStyles.detailLabel}>Status</span>
              <span className={detailStyles.detailValue}>{statusLabel(selected.status)}</span>
            </div>
            <div className={detailStyles.detailSection}>
              <span className={detailStyles.detailLabel}>Created Date</span>
              <span className={detailStyles.detailValue}>{new Date(selected.createdAt).toLocaleString()}</span>
            </div>
            {(selected.notes || selected.message) && (
              <div className={`${detailStyles.detailSection} ${detailStyles.detailFull}`}>
                <span className={detailStyles.detailLabel}>Notes</span>
                <span className={detailStyles.detailValue}>{dash(selected.notes || selected.message)}</span>
              </div>
            )}
            <div className={`${detailStyles.detailFull} ${detailStyles.detailActions}`}>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                onClick={() => setPendingDelete(selected)}
              >
                Delete Enquiry
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete enquiry"
        message={`Delete the enquiry from "${pendingDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteContact(pendingDelete.id)}
      />
    </div>
  );
}
