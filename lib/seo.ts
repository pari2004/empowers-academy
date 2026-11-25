// Single source of truth for site-wide SEO values. Everything that emits a
// URL (metadata, sitemap, robots, JSON-LD) imports from here so a domain
// change is a one-line edit.

export const siteUrl = "https://empowersacademy.com";

export const siteName = "Empowers Academy";

// Name variants people actually type into search — declared as
// schema.org alternateName and covered in keywords so brand-variant
// queries still resolve to us.
export const alternateNames = [
  "Empower Academy",
  "Empowers",
  "Empowers AI Academy",
  "Empower Academy Bangalore",
  "Empowers Academy Bengaluru",
  "Empowers Academy by Fortivex.AI",
];

export const siteTitle =
  "Empowers Academy — Better Offer in 180 Days, Guaranteed in Writing";

export const siteDescription =
  "Live, mentor-led AI programs in Bengaluru for experienced professionals, career switchers, and non-tech backgrounds. Learn Generative AI, Agentic AI, ML and MLOps — backed by a signed 180-day better-offer guarantee before you pay a rupee.";

// Approximate coordinates for BTM Layout, Bengaluru (the campus address).
export const geo = { lat: 12.9166, lng: 77.6101 };

export const keywords = [
  // Brand (including common variants and misspellings people search for)
  "Empowers Academy",
  "Empower Academy",
  "Empower Academy Bangalore",
  "Empower Academy AI course",
  "Empowers AI Academy",
  "Empowers Academy Bangalore",
  "Empowers Academy Bengaluru",
  "Empowers Academy reviews",
  "Empowers Academy placement guarantee",
  "Fortivex AI",
  // Core offering
  "AI course with placement guarantee",
  "AI course money back guarantee",
  "180 day job guarantee course",
  "AI upskilling for working professionals",
  "AI career switch program",
  "AI course for non tech background",
  "AI course for freshers",
  "live online AI course India",
  "mentor-led AI program",
  "small batch AI cohort",
  // Programs & topics
  "Generative AI course",
  "Agentic AI course",
  "GenAI certification India",
  "LLM engineering course",
  "large language models training",
  "RAG retrieval augmented generation course",
  "prompt engineering course",
  "machine learning course Bangalore",
  "deep learning course India",
  "MLOps course",
  "AI ML certification with placement",
  "PG executive program artificial intelligence",
  "forward deployed engineer program",
  "The Apex AI Programme",
  // Tools
  "Python for AI course",
  "PyTorch training",
  "LangChain course",
  "LangGraph course",
  "CrewAI course",
  "Hugging Face course",
  "vector database course",
  "AWS AI deployment course",
  // Careers
  "become AI engineer",
  "GenAI engineer jobs training",
  "LLM application engineer",
  "AI engineer interview preparation",
  "AI job placement support India",
  "AI salary hike course",
  // Local
  "AI training institute BTM Layout",
  "AI course Madiwala Bengaluru",
  "best AI institute Bangalore",
];
