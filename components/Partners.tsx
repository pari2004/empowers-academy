"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { 
  COMPANIES_DATA, 
  COMPANY_CATEGORIES 
} from "@/lib/data/companies";
import type { PartnerLogo } from "@/lib/content";

export type PartnersData = { 
  eyebrow?: string; 
  heading?: string; 
  subheading?: string; 
  logos?: PartnerLogo[];
};

const INITIAL_BATCH_SIZE = 60;

export default function Partners({ partners }: { partners: PartnersData }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [visibleLimit, setVisibleLimit] = useState<number>(INITIAL_BATCH_SIZE);

  // Check if any verified partners exist
  const verifiedPartners = useMemo(() => {
    return COMPANIES_DATA.filter((c) => c.partnerStatus === "verified_partner");
  }, []);

  // Filter companies based on category and search query
  const filteredCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return COMPANIES_DATA.filter((company) => {
      // 1. Category match
      const categoryMatch =
        activeCategory === "all" ||
        company.industry === activeCategory ||
        (company.industries && company.industries.includes(activeCategory));

      if (!categoryMatch) return false;

      // 2. Search match (by name or industry)
      if (q) {
        const nameMatch = company.name.toLowerCase().includes(q);
        const industryMatch = company.industry.toLowerCase().includes(q);
        return nameMatch || industryMatch;
      }

      return true;
    });
  }, [activeCategory, searchQuery]);

  // When searching or viewing specific category, show all matching.
  // When viewing "all" with no search, paginate for smooth performance.
  const isAllUnfiltered = activeCategory === "all" && !searchQuery.trim();
  const displayedCompanies = isAllUnfiltered
    ? filteredCompanies.slice(0, visibleLimit)
    : filteredCompanies;

  const hasMore = isAllUnfiltered && visibleLimit < filteredCompanies.length;

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    setVisibleLimit(INITIAL_BATCH_SIZE);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setVisibleLimit(INITIAL_BATCH_SIZE);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setVisibleLimit(INITIAL_BATCH_SIZE);
  };

  const loadMore = () => {
    setVisibleLimit((prev) => prev + INITIAL_BATCH_SIZE);
  };

  const showAll = () => {
    setVisibleLimit(filteredCompanies.length);
  };

  // Eyebrow, heading, subheading
  const sectionTag = partners.eyebrow || "CAREER OPPORTUNITIES";
  const mainHeading = partners.heading || "350+ Companies Across Our Hiring Network";
  const supportingText =
    partners.subheading ||
    "Explore organizations across technology, AI, BFSI, healthcare, automotive, manufacturing, logistics, consulting and other industries.";

  return (
    <section className="partners hiring-network-section" id="partners">
      <div className="container">
        {/* SECTION A: Verified Hiring Partners (Only rendered if verified partner records exist) */}
        {verifiedPartners.length > 0 && (
          <div className="verified-partners-block mb-12">
            <div className="section-head reveal">
              <span className="eyebrow">VERIFIED RELATIONSHIPS</span>
              <h3>Verified Hiring Partners</h3>
              <p>Organizations with direct, established recruitment partnerships with Empowers Academy.</p>
            </div>
            <div className="glass-panel partners-panel reveal">
              <div className="partners-logos">
                <div className="logo-row">
                  <div className="logo-track">
                    {[...verifiedPartners, ...verifiedPartners].map((vp, idx) => (
                      <div className="logo-item" key={`vp-${vp.slug}-${idx}`}>
                        <Image
                          src={vp.logo}
                          alt={vp.name}
                          width={110}
                          height={50}
                          className="logo-svg"
                          loading="lazy"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION B: Companies Across Our Hiring Network */}
        <div className="section-head reveal text-center">
          <span className="eyebrow">{sectionTag}</span>
          <h2>{mainHeading}</h2>
          <p>{supportingText}</p>
        </div>

        {/* Search Bar */}
        <div className="hiring-search-wrapper reveal">
          <div className="hiring-search-box">
            <svg
              className="hiring-search-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="hiring-search-input"
              placeholder="Search companies by name..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search companies by name"
              id="hiring-network-search"
            />
            {searchQuery && (
              <button
                type="button"
                className="hiring-search-clear"
                onClick={clearSearch}
                aria-label="Clear search input"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Industry Filter Buttons / Tabs */}
        <div
          className="industry-filters reveal"
          role="tablist"
          aria-label="Filter companies by industry"
        >
          {COMPANY_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                id={`filter-btn-${cat.id}`}
                className={`filter-btn ${isActive ? "active" : ""}`}
                onClick={() => handleCategorySelect(cat.id)}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Grid Meta / Active Info */}
        <div className="hiring-grid-meta">
          <span className="hiring-count-badge">
            {filteredCompanies.length === 1
              ? "1 company found"
              : `${filteredCompanies.length} companies found`}
            {activeCategory !== "all" && (
              <span className="hiring-category-tag">
                {" "}in {COMPANY_CATEGORIES.find((c) => c.id === activeCategory)?.name}
              </span>
            )}
            {searchQuery && (
              <span className="hiring-query-tag"> matching &ldquo;{searchQuery}&rdquo;</span>
            )}
          </span>
        </div>

        {/* Company Grid */}
        {displayedCompanies.length > 0 ? (
          <div id="company-grid" className="company-grid" role="region" aria-live="polite">
            {displayedCompanies.map((company) => (
              <div
                className="company-card company-card--white"
                key={company.slug}
                data-industry={company.industry}
                title={company.name}
              >
                <div className="company-logo">
                  <Image
                    src={company.logo}
                    alt={`${company.name} logo`}
                    width={110}
                    height={50}
                    className="company-logo-img"
                    loading="lazy"
                    unoptimized
                  />
                </div>
                <div className="company-name">{company.name}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="hiring-empty-state">
            <p>No companies found matching your search.</p>
            <button
              type="button"
              className="btn btn-secondary text-sm mt-3"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Pagination / Load More Controls for "All Companies" */}
        {hasMore && (
          <div className="hiring-load-more-container">
            <button
              type="button"
              className="btn btn-secondary hiring-load-more-btn"
              onClick={loadMore}
            >
              Load More Companies ({filteredCompanies.length - visibleLimit} remaining)
            </button>
            <button
              type="button"
              className="hiring-show-all-btn"
              onClick={showAll}
            >
              Show All ({filteredCompanies.length})
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
