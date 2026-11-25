"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import formStyles from "@/components/admin/Form.module.css";
import UrlField from "@/components/admin/UrlField";
import pageStyles from "../module-list.module.css";

type Settings = {
  siteName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  companyInfo: { address?: string; phone?: string; email?: string } | null;
  socialLinks: Record<string, string> | null;
  copyright: string | null;
  googleAnalyticsId: string | null;
  metaPixelId: string | null;
  gtmId: string | null;
  whatsappNumber: string | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPassword: string | null;
  smtpFrom: string | null;
};

export default function SettingsPage() {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    siteName: "",
    logoUrl: "",
    faviconUrl: "",
    address: "",
    phone: "",
    email: "",
    facebook: "",
    linkedin: "",
    twitter: "",
    instagram: "",
    copyright: "",
    googleAnalyticsId: "",
    metaPixelId: "",
    gtmId: "",
    whatsappNumber: "",
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
    smtpFrom: "",
  });

  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings");
      return (await res.json()) as Settings;
    },
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      siteName: data.siteName ?? "",
      logoUrl: data.logoUrl ?? "",
      faviconUrl: data.faviconUrl ?? "",
      address: data.companyInfo?.address ?? "",
      phone: data.companyInfo?.phone ?? "",
      email: data.companyInfo?.email ?? "",
      facebook: data.socialLinks?.facebook ?? "",
      linkedin: data.socialLinks?.linkedin ?? "",
      twitter: data.socialLinks?.twitter ?? "",
      instagram: data.socialLinks?.instagram ?? "",
      copyright: data.copyright ?? "",
      googleAnalyticsId: data.googleAnalyticsId ?? "",
      metaPixelId: data.metaPixelId ?? "",
      gtmId: data.gtmId ?? "",
      whatsappNumber: data.whatsappNumber ?? "",
      smtpHost: data.smtpHost ?? "",
      smtpPort: data.smtpPort ? String(data.smtpPort) : "",
      smtpUser: data.smtpUser ?? "",
      smtpPassword: data.smtpPassword ?? "",
      smtpFrom: data.smtpFrom ?? "",
    });
  }, [data]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      siteName: form.siteName,
      logoUrl: form.logoUrl || undefined,
      faviconUrl: form.faviconUrl || undefined,
      companyInfo: { address: form.address, phone: form.phone, email: form.email },
      socialLinks: { facebook: form.facebook, linkedin: form.linkedin, twitter: form.twitter, instagram: form.instagram },
      copyright: form.copyright || undefined,
      googleAnalyticsId: form.googleAnalyticsId || undefined,
      metaPixelId: form.metaPixelId || undefined,
      gtmId: form.gtmId || undefined,
      whatsappNumber: form.whatsappNumber || undefined,
      smtpHost: form.smtpHost || undefined,
      smtpPort: form.smtpPort ? Number(form.smtpPort) : undefined,
      smtpUser: form.smtpUser || undefined,
      smtpPassword: form.smtpPassword || undefined,
      smtpFrom: form.smtpFrom || undefined,
    };
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showToast(body.error ?? "Failed to save settings", "error");
      return;
    }
    showToast("Settings saved", "success");
  }

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Global Settings</h1>
      </div>

      <form onSubmit={onSubmit}>
        <div className={formStyles.card}>
          <h2 className={formStyles.sectionTitle}>Branding</h2>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="settings-site-name">Site Name</label>
              <input id="settings-site-name" className={formStyles.input} value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
            </div>
            <UrlField
          id="settings-logo-url"
          label="Logo URL"
          value={form.logoUrl}
          onChange={(v) => setForm({ ...form, logoUrl: v })}
          hint="Internal = an uploaded file from Media. External = a URL on another site."
        />
          </div>
          <UrlField
          id="settings-favicon-url"
          label="Favicon URL"
          value={form.faviconUrl}
          onChange={(v) => setForm({ ...form, faviconUrl: v })}
          hint="Internal = an uploaded file from Media. External = a URL on another site."
        />
        </div>

        <div className={formStyles.card}>
          <h2 className={formStyles.sectionTitle}>Company Info (Footer)</h2>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="settings-address">Address</label>
            <input id="settings-address" className={formStyles.input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="settings-phone">Phone</label>
              <input id="settings-phone" className={formStyles.input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="settings-email">Email</label>
              <input id="settings-email" className={formStyles.input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="settings-copyright-text">Copyright Text</label>
            <input id="settings-copyright-text" className={formStyles.input} value={form.copyright} onChange={(e) => setForm({ ...form, copyright: e.target.value })} />
          </div>
        </div>

        <div className={formStyles.card}>
          <h2 className={formStyles.sectionTitle}>Social Links</h2>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="settings-facebook">Facebook</label>
              <input id="settings-facebook" className={formStyles.input} value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="settings-linkedin">LinkedIn</label>
              <input id="settings-linkedin" className={formStyles.input} value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
            </div>
          </div>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="settings-twitter-x">Twitter / X</label>
              <input id="settings-twitter-x" className={formStyles.input} value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="settings-instagram">Instagram</label>
              <input id="settings-instagram" className={formStyles.input} value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
            </div>
          </div>
        </div>

        <div className={formStyles.card}>
          <h2 className={formStyles.sectionTitle}>Tracking &amp; Integrations</h2>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="settings-google-analytics-id">Google Analytics ID</label>
              <input id="settings-google-analytics-id" className={formStyles.input} value={form.googleAnalyticsId} onChange={(e) => setForm({ ...form, googleAnalyticsId: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="settings-meta-pixel-id">Meta Pixel ID</label>
              <input id="settings-meta-pixel-id" className={formStyles.input} value={form.metaPixelId} onChange={(e) => setForm({ ...form, metaPixelId: e.target.value })} />
            </div>
          </div>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="settings-google-tag-manager-id">Google Tag Manager ID</label>
              <input id="settings-google-tag-manager-id" className={formStyles.input} value={form.gtmId} onChange={(e) => setForm({ ...form, gtmId: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="settings-whatsapp-number">WhatsApp Number</label>
              <input id="settings-whatsapp-number" className={formStyles.input} value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} />
            </div>
          </div>
        </div>

        <div className={formStyles.card}>
          <h2 className={formStyles.sectionTitle}>Email (SMTP)</h2>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="settings-smtp-host">SMTP Host</label>
              <input id="settings-smtp-host" className={formStyles.input} value={form.smtpHost} onChange={(e) => setForm({ ...form, smtpHost: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="settings-smtp-port">SMTP Port</label>
              <input id="settings-smtp-port" className={formStyles.input} value={form.smtpPort} onChange={(e) => setForm({ ...form, smtpPort: e.target.value })} />
            </div>
          </div>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="settings-smtp-user">SMTP User</label>
              <input id="settings-smtp-user" className={formStyles.input} value={form.smtpUser} onChange={(e) => setForm({ ...form, smtpUser: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="settings-smtp-password">SMTP Password</label>
              <input id="settings-smtp-password" type="password" className={formStyles.input} value={form.smtpPassword} onChange={(e) => setForm({ ...form, smtpPassword: e.target.value })} />
            </div>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="settings-from-address">From Address</label>
            <input id="settings-from-address" className={formStyles.input} value={form.smtpFrom} onChange={(e) => setForm({ ...form, smtpFrom: e.target.value })} />
          </div>
        </div>

        <div className={formStyles.actions}>
          <button type="submit" className={formStyles.submitBtn} disabled={submitting}>
            {submitting ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
