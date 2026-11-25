"use client";

import { useMemo } from "react";
import { Icon } from "./Icons";
import { emit } from "@/lib/events";
import type { NextBatchInfo } from "./ProgramContent";

interface ProgramCohortsProps {
  programTitle: string;
  format?: string;
  nextBatch?: NextBatchInfo | null;
}

interface CohortSchedule {
  cohortName: string;
  inductionDate: string;
  inductionTime: string;
  classesDate: string;
  classesTime: string;
  batchDays: string[];
  seatsLeft: number;
  totalSeats: number;
}

function calculateCohortSchedule(programTitle: string, format?: string, nextBatch?: NextBatchInfo | null): CohortSchedule {
  const isWeekdayBatch = format?.toLowerCase().includes("mon-fri") ?? false;
  // If nextBatch is provided from DB/CMS, base dates on it
  const baseDate = nextBatch?.startDate ? new Date(nextBatch.startDate) : new Date();

  // If baseDate is in the past, roll forward to upcoming start date
  const now = new Date();
  const targetDate = baseDate > now ? new Date(baseDate) : new Date(now);

  if (targetDate <= now) {
    if (isWeekdayBatch) {
      // Upcoming Monday
      const daysUntilMonday = ((1 + 7 - targetDate.getDay()) % 7) || 7;
      targetDate.setDate(targetDate.getDate() + daysUntilMonday);
    } else {
      const daysUntilNextSaturday = ((6 + 7 - targetDate.getDay()) % 7) || 7;
      targetDate.setDate(targetDate.getDate() + daysUntilNextSaturday);
    }
  }

  // Month names
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Cohort month identifier
  const cohortMonth = monthNames[targetDate.getMonth()];
  const cohortYear = targetDate.getFullYear();
  const cohortName = isWeekdayBatch
    ? `${programTitle} · ${cohortMonth} ${cohortYear} Live Mon–Fri Executive Cohort`
    : `${programTitle} · ${cohortMonth} ${cohortYear} Weekend Cohort`;

  // Induction date (day before first class)
  const inductionDateObj = new Date(targetDate);
  inductionDateObj.setDate(inductionDateObj.getDate() - (isWeekdayBatch ? 2 : 1));
  if (inductionDateObj < now) {
    inductionDateObj.setTime(targetDate.getTime());
  }
  const inductionDateStr = `${inductionDateObj.getDate()} ${monthNames[inductionDateObj.getMonth()]}, ${inductionDateObj.getFullYear()}`;

  // End date (approx 5-6 months out)
  const endDateObj = new Date(targetDate);
  endDateObj.setMonth(endDateObj.getMonth() + 6);
  const classesDateStr = `${targetDate.getDate()} ${monthNames[targetDate.getMonth()]}, ${cohortYear} – ${endDateObj.getDate()} ${monthNames[endDateObj.getMonth()]}, ${endDateObj.getFullYear()}`;

  const seatsLeft = nextBatch?.seatsLeft ?? Math.max(2, 10 - ((targetDate.getDate() * 3) % 7));
  const totalSeats = nextBatch?.capacity ?? 10;
  const classesTime = nextBatch?.timing || (isWeekdayBatch ? "8:00 PM – 10:00 PM IST (Mon to Fri)" : "7:00 PM – 9:00 PM IST (Sat & Sun)");

  return {
    cohortName,
    inductionDate: inductionDateStr,
    inductionTime: "7:00 PM – 8:30 PM IST",
    classesDate: classesDateStr,
    classesTime,
    batchDays: isWeekdayBatch ? ["M", "Tu", "W", "Th", "F"] : ["Sa", "Su"],
    seatsLeft,
    totalSeats,
  };
}

export default function ProgramCohorts({ programTitle, format, nextBatch }: ProgramCohortsProps) {
  const isWeekday = format?.toLowerCase().includes("mon-fri") ?? false;
  const schedule = useMemo(
    () => calculateCohortSchedule(programTitle, format, nextBatch),
    [programTitle, format, nextBatch]
  );

  return (
    <section className="program-detail-section program-cohorts-section" id="program-cohorts">
      <div className="program-cohorts-heading-group">
        <h2 className="program-cohorts-title">Program Cohorts</h2>
        <p className="program-cohorts-subtitle">
          {isWeekday ? "Live Monday–Friday Executive Cohort (Strictly 10 Seats)" : "Next Weekend Cohort"}
          {format ? ` · ${format}` : ""}
        </p>
      </div>

      <div className="program-cohort-card glass-panel">
        {/* Card Header */}
        <div className="program-cohort-card-header">
          <div className="program-cohort-name-wrap">
            <span className="program-cohort-badge-pulse" aria-hidden="true" />
            <h3 className="program-cohort-name">{schedule.cohortName}</h3>
          </div>
          <div className="program-cohort-seats-chip">
            <span className="seats-warn-icon">⚡</span>
            <span>Limited Seats Left · {schedule.seatsLeft} of {schedule.totalSeats} Available</span>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="program-cohort-table-responsive">
          <table className="program-cohort-table">
            <thead>
              <tr>
                <th className="th-step">Milestone</th>
                <th className="th-date">
                  <span className="th-icon-label">
                    <Icon name="calendar" size={15} />
                    <span>Date</span>
                  </span>
                </th>
                <th className="th-time">
                  <span className="th-icon-label">
                    <Icon name="pulse" size={15} />
                    <span>Time</span>
                  </span>
                </th>
                <th className="th-batch">
                  <span className="th-icon-label">
                    <Icon name="users" size={15} />
                    <span>Batch Type & Schedule</span>
                  </span>
                </th>
                <th className="th-action">Enrollment</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Program Induction */}
              <tr className="cohort-row">
                <td className="td-step">
                  <div className="step-badge-wrap">
                    <span className="step-badge">1</span>
                    <span className="step-label">Program Induction</span>
                  </div>
                </td>
                <td className="td-date">
                  <strong>{schedule.inductionDate}</strong>
                </td>
                <td className="td-time">
                  <span>{schedule.inductionTime}</span>
                </td>
                <td className="td-batch">
                  <span className="batch-type-pill orientation-pill">Orientation &amp; Tooling Setup</span>
                </td>
                <td className="td-action" rowSpan={2}>
                  <div className="cohort-cta-wrap">
                    <button
                      type="button"
                      className="btn btn-primary cohort-apply-btn"
                      onClick={() => emit("open-lead")}
                    >
                      Apply Now
                    </button>
                    <span className="cohort-cta-note">Strictly 10 Learners / Batch</span>
                  </div>
                </td>
              </tr>

              {/* Row 2: Regular Live Classes */}
              <tr className="cohort-row">
                <td className="td-step">
                  <div className="step-badge-wrap">
                    <span className="step-badge">2</span>
                    <span className="step-label">Regular Live Classes</span>
                  </div>
                </td>
                <td className="td-date">
                  <strong>{schedule.classesDate}</strong>
                </td>
                <td className="td-time">
                  <span>{schedule.classesTime}</span>
                </td>
                <td className="td-batch">
                  <div className="batch-schedule-meta">
                    <span className="batch-weekday-label">Weekend (Sat &amp; Sun)</span>
                    <div className="day-chips-row" aria-label="Live classes on Saturday and Sunday">
                      <span className="day-chip day-chip--off" title="Self-study / Project work">M</span>
                      <span className="day-chip day-chip--off" title="Self-study / Project work">T</span>
                      <span className="day-chip day-chip--off" title="Self-study / Project work">W</span>
                      <span className="day-chip day-chip--off" title="Self-study / Project work">Th</span>
                      <span className="day-chip day-chip--off" title="Self-study / Project work">F</span>
                      <span className="day-chip day-chip--active" title="Live class on Saturday">Sa</span>
                      <span className="day-chip day-chip--active" title="Live class on Sunday">Su</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Exclusive Batch Features Highlight */}
        <div className="program-cohort-highlights">
          <div className="cohort-highlight-item">
            <span className="cohort-highlight-icon">👥</span>
            <div>
              <strong>Batch Size: 10 Learners</strong>
              <p>Strictly capped small cohort for elite 1-on-1 personalized mentorship.</p>
            </div>
          </div>
          <div className="cohort-highlight-item">
            <span className="cohort-highlight-icon">🧑‍💻</span>
            <div>
              <strong>Live Mentor Sessions (Weekdays)</strong>
              <p>Daily live engineering reviews, 1-on-1 doubt clearing, and code walkthroughs held on weekdays (Monday to Friday).</p>
            </div>
          </div>
          <div className="cohort-highlight-item">
            <span className="cohort-highlight-icon">🕒</span>
            <div>
              <strong>Around the Clock (24/7) Support</strong>
              <p>Continuous lab assistance and on-demand mentor query resolution alongside weekend core classes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Counselor Assistance Banner */}
      <div className="program-cohort-help-banner">
        <div className="cohort-help-text">
          <span className="cohort-help-icon">💬</span>
          <div className="cohort-help-copy">
            <h4>Got Questions Regarding Cohort Dates, Timings or Batch Size?</h4>
            <p>Our academic counselors are available to guide you through customized schedules, EMI plans, and admissions.</p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-secondary cohort-counselor-btn"
          onClick={() => emit("open-lead")}
        >
          Talk to an Admissions Counselor
        </button>
      </div>
    </section>
  );
}
