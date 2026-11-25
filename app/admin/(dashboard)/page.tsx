import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { can } from "@/lib/rbac";
import StatCard from "@/components/admin/StatCard";
import { LineChartCard, BarChartCard } from "@/components/admin/charts/ChartCard";
import AiDashboardSection from "@/components/admin/ai/AiDashboardSection";
import { getCachedDashboardInsights } from "@/lib/services/ai/aiDashboardInsightService";
import { getCachedRevenueForecast } from "@/lib/services/ai/aiRevenueForecastService";
import {
  getDashboardStats,
  getRecentActivity,
  getCourseViewsSeries,
  getEnquiriesSeries,
  getPopularCourses,
  getVisitorAnalyticsSeries,
  getLeadStats,
  getLeadPipelineCounts,
  getLeadsSeries,
  getLeadsBySource,
  getUpcomingSessions,
  getTodaysFollowUps,
  getCounsellorPerformance,
  getAdmissionStats,
  getBatchFillRates,
} from "@/lib/services/dashboardService";
import { getRevenueSummary } from "@/lib/services/financeDashboardService";
import { sourceLabel } from "@/components/admin/leads/types";
import { PIPELINE_STAGES, TERMINAL_OUTCOMES, stageLabel } from "@/lib/leadPipeline";
import styles from "./dashboard.module.css";

async function checkDbHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export default async function DashboardPage() {
  const session = await auth();
  const canUseAi = can(session, "ai.view");

  const [
    stats,
    activity,
    courseViews,
    enquiries,
    popularCourses,
    visitors,
    dbHealthy,
    leadStats,
    leadPipeline,
    leadsSeries,
    leadsBySource,
    upcomingSessions,
    todaysFollowUps,
    counsellorPerformance,
    admissionStats,
    batchFillRates,
    revenueSummary,
    aiInsights,
    aiForecast,
  ] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
    getCourseViewsSeries(),
    getEnquiriesSeries(),
    getPopularCourses(),
    getVisitorAnalyticsSeries(),
    checkDbHealth(),
    getLeadStats(),
    getLeadPipelineCounts(),
    getLeadsSeries(),
    getLeadsBySource(),
    getUpcomingSessions(),
    getTodaysFollowUps(),
    getCounsellorPerformance(),
    getAdmissionStats(),
    getBatchFillRates(),
    getRevenueSummary(),
    canUseAi ? getCachedDashboardInsights() : Promise.resolve(null),
    canUseAi ? getCachedRevenueForecast() : Promise.resolve(null),
  ]);

  const pipelineStageCounts = PIPELINE_STAGES.map((s) => ({
    stage: s.label,
    count: leadPipeline.find((p) => p.stage === s.value)?.count ?? 0,
  }));
  const closedOutcomeCounts = TERMINAL_OUTCOMES.map((s) => ({
    stage: s.label,
    count: leadPipeline.find((p) => p.stage === s.value)?.count ?? 0,
  }));

  return (
    <div>
      <h1 className={styles.heading}>Dashboard</h1>

      <div className={styles.statGrid}>
        <StatCard label="Total Courses" value={stats.totalCourses} />
        <StatCard label="Published Courses" value={stats.publishedCourses} />
        <StatCard label="Draft Courses" value={stats.draftCourses} />
        <StatCard label="Total Instructors" value={stats.totalInstructors} />
        <StatCard label="Blogs" value={stats.totalBlogs} />
        <StatCard label="Testimonials" value={stats.totalTestimonials} />
        <StatCard label="FAQs" value={stats.totalFaqs} />
        <StatCard label="Media Files" value={stats.totalMedia} />
        <StatCard label="Contact Enquiries" value={stats.totalEnquiries} />
        <StatCard label="Newsletter Subscribers" value={stats.totalSubscribers} />
        <StatCard
          label="System Health"
          value={dbHealthy ? "Healthy" : "Degraded"}
          hint={dbHealthy ? "Database reachable" : "Database unreachable"}
        />
      </div>

      <h2 className={styles.activityHeading}>Leads (CRM)</h2>
      <div className={styles.statGrid}>
        <StatCard label="New Leads Today" value={leadStats.newToday} />
        <StatCard label="Active Leads" value={leadStats.active} />
        <StatCard label="Follow-ups Due" value={leadStats.followUpsDue} />
        <StatCard label="Conversion Rate" value={`${leadStats.conversionRate}%`} hint="Onboarded / total leads" />
        <StatCard label="Admissions Today" value={admissionStats.admissionsToday} />
        <StatCard label="Revenue Today" value={`₹${revenueSummary.todayRevenue.toLocaleString("en-IN")}`} />
        <StatCard label="Revenue This Month" value={`₹${revenueSummary.monthlyRevenue.toLocaleString("en-IN")}`} />
      </div>

      {canUseAi && (
        <>
          <h2 className={styles.activityHeading}>AI Insights</h2>
          <AiDashboardSection initialInsights={aiInsights} initialForecast={aiForecast} />
        </>
      )}

      <div className={styles.chartGrid}>
        <LineChartCard title="New Leads (last 14 days)" data={leadsSeries} />
        <BarChartCard title="Pipeline by Stage" data={pipelineStageCounts} dataKey="count" nameKey="stage" />
        <BarChartCard title="Closed Leads by Outcome" data={closedOutcomeCounts} dataKey="count" nameKey="stage" />
        <BarChartCard
          title="Leads by Source"
          data={leadsBySource.map((s) => ({ source: sourceLabel(s.source), count: s.count }))}
          dataKey="count"
          nameKey="source"
        />
        <LineChartCard title="Course Views (last 14 days)" data={courseViews} />
        <LineChartCard title="Visitor Analytics (last 14 days)" data={visitors} />
        <LineChartCard title="Enquiries (last 14 days)" data={enquiries} />
        <BarChartCard title="Popular Courses" data={popularCourses} dataKey="views" nameKey="title" />
        <BarChartCard title="Batch Fill Rate (%)" data={batchFillRates} dataKey="fillRate" nameKey="name" />
      </div>

      <div className={styles.chartGrid}>
        <div className={styles.activityCard}>
          <h2 className={styles.activityHeading}>Scheduled Sessions</h2>
          {upcomingSessions.length === 0 ? (
            <p className={styles.empty}>No sessions scheduled.</p>
          ) : (
            <ul className={styles.activityList}>
              {upcomingSessions.map((d) => (
                <li key={d.id} className={styles.activityItem}>
                  <span className={styles.activityAction}>
                    {d.name}
                    {d.courseTitle ? ` · ${d.courseTitle}` : ""}
                  </span>
                  <span className={styles.activityMeta}>
                    {d.assigneeName} · {new Date(d.sessionScheduledAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.activityCard}>
          <h2 className={styles.activityHeading}>Today&apos;s Follow-ups</h2>
          {todaysFollowUps.length === 0 ? (
            <p className={styles.empty}>No follow-ups due.</p>
          ) : (
            <ul className={styles.activityList}>
              {todaysFollowUps.map((f) => (
                <li key={f.id} className={styles.activityItem}>
                  <span className={styles.activityAction}>
                    {f.name} · {stageLabel(f.stage)}
                  </span>
                  <span className={styles.activityMeta}>
                    {f.assigneeName} · {new Date(f.nextFollowUpAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.activityCard}>
          <h2 className={styles.activityHeading}>Counsellor Performance</h2>
          {counsellorPerformance.length === 0 ? (
            <p className={styles.empty}>No leads assigned yet.</p>
          ) : (
            <table className={styles.miniTable}>
              <thead>
                <tr>
                  <th>Counsellor</th>
                  <th>Assigned</th>
                  <th>Onboarded</th>
                  <th>Conversion</th>
                </tr>
              </thead>
              <tbody>
                {counsellorPerformance.map((c) => (
                  <tr key={c.userId}>
                    <td>{c.name}</td>
                    <td>{c.assigned}</td>
                    <td>{c.onboarded}</td>
                    <td>{c.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className={styles.activityCard}>
        <h2 className={styles.activityHeading}>Recent Activity</h2>
        {activity.length === 0 ? (
          <p className={styles.empty}>No activity yet.</p>
        ) : (
          <ul className={styles.activityList}>
            {activity.map((a) => (
              <li key={a.id} className={styles.activityItem}>
                <span className={styles.activityAction}>{a.action}</span>
                <span className={styles.activityMeta}>
                  {a.entityType ? `${a.entityType} · ` : ""}
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
