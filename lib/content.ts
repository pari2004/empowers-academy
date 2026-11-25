// Central content source for Empowers Academy. All copy comes from the build brief.
// Do not invent new claims or stats — edit here to keep sections in sync.

export const nav = {
  logo: "Empowers Academy",
  links: [
    { label: "Home", href: "#top" },
    { label: "Partners", href: "#partners" },
    { label: "Programs", href: "#programs" },
    { label: "Guarantee", href: "#guarantee" },
    { label: "Trainers", href: "#mentors" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "#footer" },
    { label: "Masterclass", href: "/masterclasses" },
  ],
  cta: "Request a Callback",
  authCta: "Login / Sign Up",
};

export const auth = {
  poweredBy: "FORTIVEX.AI",
  poweredBySub: "Pvt Ltd | Enabling Futures",
  headline: "Building AI Talent.",
  headlineAccent: "Transforming Futures.",
  tagline: [
    { text: "Empowering ", accent: false },
    { text: "Learners", accent: true },
    { text: ". Enabling ", accent: false },
    { text: "Enterprises", accent: true },
    { text: ".", accent: false },
  ],
  capabilities: [
    { icon: "spark", label: "Generative AI & Agentic AI" },
    { icon: "brain", label: "AI & Machine Learning" },
    { icon: "code", label: "AIML Full stack engineering program" },
    { icon: "cloud", label: "Cloud Technologies" },
    { icon: "gear", label: "DevOps & Automation" },
    { icon: "users", label: "Corporate Training & Upskilling" },
  ],
};

export const hero = {
  eyebrow: "AI upskilling for people who already have a career",
  headline: "Get a Better Offer in 180 Days Or Your Money Back, In Writing.",
  subheadline:
    "Live, mentor-led AI programs for experienced professionals, career switchers, and non-tech backgrounds alike. Backed by a signed legal guarantee before you pay a rupee.",
  primaryCta: "Request a Callback",
  secondaryCta: "Download Brochure",
};

export type PartnerLogo = { name: string; src: string; width: number; height: number };

export const partners = {
  eyebrow: "CAREER OPPORTUNITIES",
  heading: "350+ Companies Across Our Hiring Network",
  subheading:
    "Explore organizations across technology, AI, BFSI, healthcare, automotive, manufacturing, logistics, consulting and other industries.",
  logos: [
    { name: "TCS", src: "/partners/tcs.svg", width: 740, height: 297 },
    { name: "Infosys", src: "/partners/infosys.svg", width: 400, height: 160 },
    { name: "Wipro", src: "/partners/wipro.svg", width: 377, height: 297 },
    { name: "HCLTech", src: "/partners/hcltech.svg", width: 153, height: 28 },
    { name: "Accenture", src: "/partners/accenture.svg", width: 163, height: 43 },
    { name: "Deloitte", src: "/partners/deloitte.svg", width: 210, height: 40 },
    { name: "PwC", src: "/partners/pwc.svg", width: 359, height: 174 },
    { name: "Walmart", src: "/partners/walmart.svg", width: 1024, height: 241 },
    { name: "Siemens", src: "/partners/siemens.svg", width: 210, height: 50 },
    { name: "HSBC", src: "/partners/hsbc.svg", width: 316, height: 85 },
    { name: "Huawei", src: "/partners/huawei.svg", width: 576, height: 98 },
    { name: "Broadridge", src: "/partners/broadridge.svg", width: 512, height: 103 },
    { name: "CDW", src: "/partners/cdw.svg", width: 893, height: 448 },
    { name: "IIFL Finance", src: "/partners/iifl-finance.svg", width: 238, height: 45 },
    { name: "Synechron", src: "/partners/synechron.png", width: 600, height: 112 },
    { name: "Archents", src: "/partners/archents.png", width: 259, height: 81 },
  ] satisfies PartnerLogo[],
};

export const whyCards = [
  {
    icon: "shield",
    title: "180-Day Better-Offer Guarantee",
    body:
      "If you don't land a better offer within 180 days of starting, you get a full refund backed by a signed legal agreement executed before you pay anything.",
  },
  {
    icon: "users",
    title: "Live, Small-Batch Cohorts",
    body:
      "Roughly 15–30 learners per batch, live online and mentor-led. Not a pre-recorded video library.",
  },
  {
    icon: "pulse",
    title: "Curriculum That Moves With the Industry Market",
    body:
      "Revised on a rolling basis to track real shifts in AI, not a static syllabus frozen in time.",
  },
  {
    icon: "spark",
    title: "Built for Real Professionals",
    body:
      "Open to experienced professionals, non-tech backgrounds, and freshers alike, not just engineers.",
  },
];

export type ProgramTrainer = {
  name: string;
  designation: string;
  bio: string;
  image?: string;
  skills: string[];
  experience?: string;
};

export type ProgramFaqItem = { q: string; a: string };

export type ProgramCurriculumLesson = { title: string; duration?: string };
export type ProgramCurriculumSection = { title: string; lessons: ProgramCurriculumLesson[] };

// Extra, deeper content for a program's full-screen detail page. Every field
// is optional so programs without a source doc yet just render fewer sections.
export type ProgramDetails = {
  headline?: string;
  tagline?: string;
  category?: string;
  overview?: string;
  keyFeatures?: string[];
  learningOutcomes?: string[];
  learningPath?: string[];
  curriculum?: ProgramCurriculumSection[];
  skills?: string[];
  tools?: string[];
  toolCategorized?: { category: string; tools: { name: string; iconSlug?: string }[] }[];
  projectCategories?: string[];
  projectsList?: { title: string; description: string; tech?: string; iconSlug?: string }[];
  capstone?: string;
  certifications?: string[];
  placementSupport?: string[];
  placementRate?: number;
  avgSalaryHikePct?: number;
  avgPackageLpa?: number;
  careerRoles?: string[];
  additionalNotes?: string[];
  price?: number;
  discountPrice?: number;
  gstRate?: number;
  gstText?: string;
  badge?: string;
  emiAvailable?: boolean;
  emiDetails?: string;
  scholarshipInfo?: string;
  galleryImages?: string[];
  videoUrl?: string;
  curriculumHtmlUrl?: string;
  trainers?: ProgramTrainer[];
  faqs?: ProgramFaqItem[];
  unfairAdvantage?: {
    headline: string;
    subheadline?: string;
    items: { title: string; desc: string; badge?: string }[];
  };
  careerMatrix?: {
    category: string;
    commitment: string;
    routing: string;
  }[];
  marketRealignment?: {
    stat?: string;
    title: string;
    desc: string;
  }[];
};

export type Program = {
  // URL segment for /programs/<slug> — must stay stable once indexed by
  // search engines; changing it breaks inbound links and rankings.
  slug: string;
  tag: string;
  title: string;
  goal: string;
  eligibility?: string;
  format: string;
  stack: string[];
  focus: string[];
  mentors?: string;
  details?: ProgramDetails;
  trendingNow?: boolean;
  comingSoon?: boolean;
  image?: string;
  applyCtaLabel?: string;
  applyCtaHref?: string;
  certificate?: string;
  price?: number;
  discountPrice?: number;
  gstRate?: number;
  gstText?: string;
  badge?: string;
};

export const programs: Program[] = [
  {
    slug: "the-apex-ai-programme",
    tag: "Flagship",
    title: "AIML Full Stack Development",
    goal: "A 6-month, production-grade AI / ML / GenAI / Agentic AI curriculum engineered to match Scaler-tier employability.",
    image: "/Programs/Full Stack Development.png",
    certificate: "/certificates/AIML Full stack dvelopment.png",
    price: 99999,
    gstRate: 18,
    gstText: "+ 18% GST",
    eligibility: "Pre-cohort diagnostic places you into a Beginner or Advanced stream",
    format: "6 months · 26 weeks · ~600 hours · live online · mentor-led",
    stack: [
      "Python", "NumPy", "Pandas", "PyTorch", "Hugging Face", "LangChain",
      "CrewAI", "LangGraph", "Docker", "AWS",
    ],
    focus: [
      "Project-first, production-grade curriculum, not just theory",
      "Interview-focused throughout, not bolted on at the end",
      "Four parallel tracks running side by side",
      "Weekly mentorship, code reviews, and a Demo Day",
      "Ends in a real production deployment and a career launch track",
    ],
    details: {
      headline: "A 6-Month, Production-Grade AI / ML / GenAI / Agentic AI Curriculum.",
      tagline: "Engineered to match Scaler-tier employability.",
      category: "AI / ML / GenAI / Agentic AI",
      overview:
        "An employability-first, project-first curriculum focused on production engineering rather than theory alone — built to take you from foundations through a live production deployment.",
      keyFeatures: [
        "Live cohort",
        "Real projects every module",
        "Weekly mentorship",
        "Production deployments",
        "Code reviews",
        "Demo Day",
        "GitHub portfolio",
        "Career support",
      ],
      learningOutcomes: [
        "Build end-to-end ML systems",
        "Ship LLM-powered applications",
        "Design and deploy agentic AI systems",
        "Deploy models to production",
        "Interview-ready technical depth",
        "A GitHub portfolio of shipped projects",
        "System design fundamentals for AI systems",
      ],
      learningPath: [
        "Launchpad & Engineering Foundations",
        "Advanced Python & Data Processing",
        "Production Machine Learning",
        "Deep Learning with PyTorch",
        "Transformers & LLM Foundations",
        "Generative AI, RAG & Vector DBs",
        "Agentic AI & Multi-Agent Systems",
        "Production MLOps & LLMOps",
        "Full-Stack AI Capstone & Demo Day",
      ],
      curriculum: [
        {
          title: "Launchpad & Engineering Foundations",
          lessons: [
            { title: "AI Engineering Environment Setup (VS Code, WSL2, Conda, CUDA, Poetry)", duration: "Week 1" },
            { title: "Git & GitHub Production Workflows (Branching, PRs, Conventional Commits)", duration: "Week 1" },
            { title: "Linux Shell Scripting, CLI Automation & Virtual Environments", duration: "Week 2" },
            { title: "Algorithmic Foundations & Core Data Structures in Python", duration: "Week 2" },
            { title: "Capstone Milestone: Reproducible AI Engineering Workspace Setup", duration: "Project" },
          ],
        },
        {
          title: "Advanced Python & High-Performance Data Processing",
          lessons: [
            { title: "OOP, Type Hinting, Decorators, Generators & AsyncIO in Python", duration: "Week 3" },
            { title: "Vectorized Numerical Computing with NumPy & Performance Profiling", duration: "Week 3" },
            { title: "Data Wrangling, Cleaning & Transformation with Pandas", duration: "Week 4" },
            { title: "Relational Queries with PostgreSQL, DuckDB & SQLAlchemy", duration: "Week 4" },
            { title: "Exploratory Data Analysis (EDA) & Interactive Visuals with Plotly", duration: "Week 5" },
            { title: "Capstone Milestone: High-Throughput Data Ingestion & Analytics Pipeline", duration: "Project" },
          ],
        },
        {
          title: "Production Machine Learning & Statistical Modeling",
          lessons: [
            { title: "Supervised Learning: Linear/Logistic Regression, Decision Trees & Ensembles", duration: "Week 6" },
            { title: "Gradient Boosting Mastery: XGBoost, LightGBM & CatBoost", duration: "Week 7" },
            { title: "Unsupervised Learning: Clustering (K-Means, DBSCAN) & PCA / UMAP", duration: "Week 8" },
            { title: "Feature Engineering, Cross-Validation & Data Leakage Prevention", duration: "Week 8" },
            { title: "Hyperparameter Tuning with Optuna & Experiment Tracking with MLflow", duration: "Week 9" },
            { title: "Capstone Milestone: Production-Ready Predictive Pricing Model API", duration: "Project" },
          ],
        },
        {
          title: "Deep Learning & Neural Architectures with PyTorch",
          lessons: [
            { title: "PyTorch Core: Tensors, Autograd, Computation Graphs & GPU Acceleration", duration: "Week 10" },
            { title: "Deep Feedforward Networks, Loss Functions & Optimizers (AdamW, Cosine)", duration: "Week 11" },
            { title: "Convolutional Neural Networks (CNNs) & Modern Vision Backbones (ResNet)", duration: "Week 12" },
            { title: "Sequence Modeling: RNNs, LSTMs, GRUs & Bidirectional Processing", duration: "Week 13" },
            { title: "Capstone Milestone: Multi-Modal Deep Neural Classifier in PyTorch", duration: "Project" },
          ],
        },
        {
          title: "Transformer Architectures & LLM Foundations",
          lessons: [
            { title: "Self-Attention Mechanism, Multi-Head Attention & Transformer Internals", duration: "Week 14" },
            { title: "Encoder vs Decoder Architectures: BERT, GPT-4, Llama 3 & Claude", duration: "Week 14" },
            { title: "Hugging Face Ecosystem: Transformers, Tokenizers & Datasets Library", duration: "Week 15" },
            { title: "Parameter-Efficient Fine-Tuning: LoRA, QLoRA, Prefix Tuning with PEFT", duration: "Week 16" },
            { title: "Capstone Milestone: Fine-Tuning a 7B Parameter Model with QLoRA & Unsloth", duration: "Project" },
          ],
        },
        {
          title: "Generative AI, RAG & Vector Databases",
          lessons: [
            { title: "Advanced Prompting: Few-Shot, Chain-of-Thought & ReAct Patterns", duration: "Week 17" },
            { title: "Vector Embeddings: Dense, Sparse (BM25), BGE-M3 & ColBERT Multi-Vector", duration: "Week 17" },
            { title: "Vector Databases: Pinecone, Qdrant, ChromaDB, Weaviate & pgvector", duration: "Week 18" },
            { title: "Production RAG: Chunking Strategies, Reranking (Cohere) & Contextual Compression", duration: "Week 19" },
            { title: "Capstone Milestone: Enterprise Multi-Document RAG with Citations & Reranking", duration: "Project" },
          ],
        },
        {
          title: "Agentic AI & Autonomous Multi-Agent Workflows",
          lessons: [
            { title: "Agent Fundamentals: Tool Calling, Function Calling, ReAct & Memory", duration: "Week 20" },
            { title: "LangGraph: Cyclic Graph Architectures, State Persistence & Human-in-the-Loop", duration: "Week 21" },
            { title: "CrewAI: Role-Based Autonomous Agent Teams & Hierarchical Delegation", duration: "Week 22" },
            { title: "Integrating External Tools: Web Scraping, Code Execution, SQL Agents & APIs", duration: "Week 22" },
            { title: "Capstone Milestone: Autonomous Financial Analyst Multi-Agent System", duration: "Project" },
          ],
        },
        {
          title: "Production MLOps, LLMOps & Cloud Deployment",
          lessons: [
            { title: "Containerizing AI Workloads with Docker & Multi-Stage GPU Images", duration: "Week 23" },
            { title: "High-Throughput Model Serving with FastAPI, vLLM & Ollama", duration: "Week 23" },
            { title: "CI/CD Pipelines for Machine Learning with GitHub Actions", duration: "Week 24" },
            { title: "LLMOps & Monitoring: Arize Phoenix, LangSmith, Prometheus & Grafana", duration: "Week 24" },
            { title: "Safety, Guardrails & Governance with NeMo Guardrails & Guardrails AI", duration: "Week 25" },
            { title: "Capstone Milestone: Live Cloud Deployment of Agentic AI System with CI/CD", duration: "Project" },
          ],
        },
        {
          title: "Full-Stack AI Capstone & Demo Day",
          lessons: [
            { title: "End-to-End Enterprise Solution Development (FinTech/HealthTech/E-Com)", duration: "Week 26" },
            { title: "Benchmarking, Evaluation with Ragas & Latency Optimization", duration: "Week 26" },
            { title: "Production Verification, Security Audit & Custom Domain SSL Setup", duration: "Week 27" },
            { title: "Demo Day: Live Presentation & Code Walkthrough to Industry Mentors", duration: "Final" },
          ],
        },
      ],
      skills: [
        "Advanced Python & OOP",
        "Data Structures & Algorithms (DSA)",
        "Mathematical Foundations for AI",
        "SQL & Relational Database Design",
        "Exploratory Data Analysis (EDA)",
        "Feature Engineering & Selection",
        "Machine Learning Algorithms",
        "Supervised & Unsupervised Learning",
        "Ensemble Methods (XGBoost, LightGBM)",
        "Deep Learning with PyTorch",
        "Convolutional Neural Networks (CNNs)",
        "Recurrent Neural Networks (LSTMs & GRUs)",
        "Transformer Architectures & Self-Attention",
        "Large Language Models (LLMs)",
        "Prompt Engineering & Few-Shot Learning",
        "Retrieval-Augmented Generation (RAG)",
        "GraphRAG & Hybrid Search",
        "Vector Databases & Semantic Search",
        "Autonomous Agentic AI",
        "Multi-Agent Orchestration (CrewAI & LangGraph)",
        "Function Calling & Tool Execution",
        "Fine-Tuning (PEFT, LoRA & QLoRA)",
        "Model Evaluation with Ragas",
        "High-Throughput Model Serving (vLLM & Ollama)",
        "REST API Engineering with FastAPI",
        "Docker Containerization",
        "Cloud Infrastructure on AWS",
        "MLOps & CI/CD Automation",
        "Model Monitoring & Data Drift Detection",
        "AI System Design & Architecture",
        "Git & Production Version Control",
        "Full-Stack AI Application Deployment",
      ],
      tools: [
        "Python", "Pandas", "NumPy", "MySQL", "Jupyter", "GitHub", "Matplotlib",
        "Seaborn", "Plotly", "Scikit Learn", "XG Boost", "LightGBM", "TensorFlow",
        "PyTorch", "Hugging Face", "LlamaIndex", "LangGraph", "CrewAI", "AutoGen",
        "AWS", "Docker", "OpenAI", "MLflow", "Grafana", "AWS Lambda", "FastAPI",
        "GitHub Actions", "LangChain", "Google Colab", "VS Code", "Streamlit", "Weights & Biases"
      ],
      toolCategorized: [
        {
          category: "Languages & Core",
          tools: [
            { name: "Python" },
            { name: "PyTorch" },
            { name: "MySQL" },
            { name: "PostgreSQL" },
            { name: "VS Code" },
            { name: "GitHub" },
          ],
        },
        {
          category: "Data Science & Viz",
          tools: [
            { name: "NumPy" },
            { name: "Pandas" },
            { name: "Matplotlib" },
            { name: "Seaborn" },
            { name: "Plotly" },
            { name: "Jupyter" },
            { name: "Google Colab" },
          ],
        },
        {
          category: "Machine Learning & AI",
          tools: [
            { name: "Scikit Learn" },
            { name: "XG Boost" },
            { name: "LightGBM" },
            { name: "TensorFlow" },
            { name: "Hugging Face" },
            { name: "OpenAI" },
          ],
        },
        {
          category: "Generative & Agentic AI",
          tools: [
            { name: "LangChain" },
            { name: "CrewAI" },
            { name: "LangGraph" },
            { name: "LlamaIndex" },
            { name: "AutoGen" },
          ],
        },
        {
          category: "Cloud, MLOps & Deployment",
          tools: [
            { name: "AWS" },
            { name: "Docker" },
            { name: "FastAPI" },
            { name: "AWS Lambda" },
            { name: "MLflow" },
            { name: "Grafana" },
            { name: "GitHub Actions" },
            { name: "Streamlit" },
          ],
        },
      ],
      projectCategories: [
        "1. Predictive Customer Churn Analytics Platform",
        "2. Computer Vision Defect Detection System",
        "3. Fine-Tuned Domain LLM with LoRA",
        "4. Enterprise Agentic RAG Knowledge Base",
        "5. Autonomous Multi-Agent Research Assistant",
        "6. Full-Stack AI Web Application",
        "7. Production MLOps CI/CD Deployment Pipeline",
        "8. Real-Time Fraud & Anomaly Detection Engine",
        "9. Multimodal Document Parsing & OCR Pipeline",
        "10. E-Commerce Recommendation & Personalization Engine",
      ],
      projectsList: [
        {
          title: "Predictive Customer Churn Analytics Platform",
          description: "Analyze large-scale tabular enterprise datasets using Pandas, NumPy, and Scikit-Learn to build predictive ML models with feature engineering and automated model interpretability.",
          tech: "Scikit Learn",
          iconSlug: "scikitlearn"
        },
        {
          title: "Computer Vision Defect Detection System",
          description: "Train CNN and Vision Transformer models using PyTorch for automated real-time quality control and defect classification on manufacturing assembly lines.",
          tech: "PyTorch",
          iconSlug: "pytorch"
        },
        {
          title: "Fine-Tuned Domain LLM with LoRA",
          description: "Fine-tune open-source LLMs using Hugging Face PEFT/LoRA techniques on custom domain text datasets, optimizing throughput for specialized enterprise tasks.",
          tech: "Hugging Face",
          iconSlug: "huggingface"
        },
        {
          title: "Enterprise Agentic RAG Knowledge Base",
          description: "Construct a semantic vector search retrieval system using LangChain, hybrid vector indexing, and dynamic document chunking to query internal knowledge bases accurately.",
          tech: "LangChain",
          iconSlug: "langchain"
        },
        {
          title: "Autonomous Multi-Agent Research Assistant",
          description: "Develop a stateful multi-agent system using CrewAI and LangGraph that autonomously browses web sources, aggregates data, and synthesizes structured analytical reports.",
          tech: "CrewAI",
          iconSlug: "crewai"
        },
        {
          title: "Full-Stack AI Web Application",
          description: "Build an interactive web application featuring real-time streaming LLM responses, user authentication, session state management, and robust backend API integration.",
          tech: "FastAPI",
          iconSlug: "fastapi"
        },
        {
          title: "Production MLOps CI/CD Deployment Pipeline",
          description: "Deploy an end-to-end ML pipeline with Docker containerization, AWS cloud hosting, automated model tracking via MLflow, and continuous integration monitoring.",
          tech: "Docker",
          iconSlug: "docker"
        },
        {
          title: "Real-Time Fraud & Anomaly Detection Engine",
          description: "Engineer an event-driven streaming pipeline using Kafka, XGBoost, and FastAPI to score high-volume transactions for fraud in under 15ms.",
          tech: "AWS",
          iconSlug: "amazonwebservices"
        },
        {
          title: "Multimodal Document Parsing & OCR Pipeline",
          description: "Create an intelligent document processing system that extracts tables, key-value pairs, and text from unstructured financial PDFs with LayoutLM and Vision LLMs.",
          tech: "OpenAI",
          iconSlug: "openai"
        },
        {
          title: "E-Commerce Recommendation & Personalization Engine",
          description: "Build a collaborative filtering and deep learning recommendation system using PyTorch and Redis to serve personalized product recommendations at scale.",
          tech: "Python",
          iconSlug: "python"
        }
      ],
      capstone:
        "An individual, production-ready AI system presented at Demo Day and added to your interview portfolio.",
      certifications: [
        "AI & ML Practitioner",
        "GenAI & LLM Engineer",
        "Certified Agentic AI Practitioner (CAAP)",
      ],
      placementSupport: [
        "Career launch track",
        "Resume support",
        "LinkedIn profile support",
        "Demo Day in front of hiring partners",
        "Mock interviews",
        "Introductions to the careers team",
      ],
      careerRoles: ["AI Engineer", "GenAI Engineer", "LLM Application Engineer", "Agentic AI Engineer"],
      curriculumHtmlUrl: "/Programs/curriculum/full-stack-development/index.html",
      price: 99999,
      gstRate: 18,
      gstText: "+ 18% GST",
      additionalNotes: [
        "Four parallel tracks run through the program",
        "Weekly rhythm of live sessions, assignments, and mentor feedback",
        "Pre-cohort diagnostic places you into a Beginner or Advanced stream",
      ],
      unfairAdvantage: {
        headline: "The Unfair Advantage: Why Top Engineers Choose Empowers",
        subheadline: "Most AI bootcamps drop hundreds of students into passive recorded lectures. We built an intensive, engineering-first environment where you build real full-stack AI systems.",
        items: [
          {
            title: "Micro-Batch Exclusivity",
            desc: "Small cohorts strictly capped for direct 1-on-1 mentor interaction and thorough code reviews.",
            badge: "Intensive Cohorts",
          },
          {
            title: "Production Full-Stack AI",
            desc: "Don't just run Jupyter notebooks. Build, package, and deploy full-stack AI services with FastAPI, PyTorch, and AWS.",
            badge: "Production First",
          },
          {
            title: "$1,500+ Developer Pass",
            desc: "Access to cloud compute environments, pre-loaded CUDA GPU labs, and developer toolchains.",
            badge: "$1,500+ Included",
          },
          {
            title: "100% Guaranteed Role-Matched Placement",
            desc: "180-day refund guarantee with targeted role and preferred location routing (Bengaluru, US Remote, GCC Hubs).",
            badge: "100% Placement Guarantee",
          },
        ],
      },
      careerMatrix: [
        {
          category: "Freshers",
          commitment: "100% Placement Guarantee within 180 Days",
          routing: "Minimum package commitment of ₹5 LPA.",
        },
        {
          category: "Experienced Professionals",
          commitment: "100% Placement Guarantee within 180 Days",
          routing: "Targeting 50%+ salary hike over current CTC.",
        },
        {
          category: "Location Routing",
          commitment: "Preferred Geography Matching",
          routing: "Bengaluru, Hyderabad, Gurgaon, US Remote, GCC Hubs, Other Locations.",
        },
      ],
      marketRealignment: [
        {
          stat: "68%",
          title: "Full-Stack AI Talent Shortage",
          desc: "Over 68% of tech companies cite a severe shortage of engineers who bridge ML modeling and production deployment.",
        },
        {
          stat: "Top Tier",
          title: "Recruiters Hunting Builders",
          desc: "Amazon, Swiggy, Uber, and Flipkart actively recruit engineers with verified production deployments.",
        },
        {
          stat: "Live Code",
          title: "Proof of Capability Over Degree",
          desc: "A verified GitHub portfolio of live deployed full-stack systems beats generic certificates every time.",
        },
      ],
    },
  },
  {
    slug: "pg-executive-agentic-ai-generative-ai",
    tag: "PG Executive",
    title: "Post Graduate Program in Generative AI & Agentic AI",
    goal: "Taught Live by FAANG AI Architects. Strictly capped at 10 candidates per batch with $1,500+ Enterprise AI Developer Pass and 100% role-matched placement guarantee.",
    image: "/Programs/PG Executive Agentic AI & Generative AI.png",
    certificate: "/certificates/Pg Excutive agentic AI & Generativ AI.png",
    format: "Live Online (Mon-Fri) · 6 Months (26 Weeks, ~600 Hours) · FAANG AI Architects",
    trendingNow: true,
    badge: "ULTRA-EXCLUSIVE COHORT",
    price: 129999,
    gstRate: 18,
    gstText: "+ 18% GST",
    stack: [
      "Generative AI", "Agentic AI", "LLM Engineering", "Prompt Engineering",
      "RAG Systems", "Vector Databases", "Multi-Agent Orchestration", "MLOps",
      "Python", "Deep Learning",
    ],
    focus: [
      "Micro-Batch Exclusivity: Strictly capped at 10 candidates per batch for direct, daily 1-on-1 mentorship",
      "Live Monday–Friday Intensity: Taught live 5 days a week by FAANG / MAANG AI Architects",
      "$1,500+ Enterprise AI Developer Pass: Complimentary 1-year access to AWS Cloud, ChatGPT Plus/API, Claude 3.5 Sonnet, and Cursor Pro",
      "100% Guaranteed Role-Matched Placement: 180-day refund guarantee with targeted role and preferred location routing (Bengaluru, US Remote, GCC Hubs)",
      "Building applications on top of large language models (LLMs) & multi-agent systems",
      "Building MLOps pipelines to monitor and manage production AI models",
    ],
    mentors: "FAANG / MAANG AI Architects",
    details: {
      headline: "Taught Live by FAANG AI Architects | Strictly 10 Candidates Per Batch",
      tagline: "Ultra-Exclusive Cohort · 100% Guaranteed Role-Matched Placement",
      category: "PG Executive",
      overview:
        "Most AI programs drop 500+ students into passive weekend lectures with zero code reviews or enterprise tool access. We built the anti-bootcamp. An elite, hyper-personalized, engineering-first environment where you build production-grade multi-agent systems alongside active Big Tech veterans.\n\nIn an era where traditional software engineering roles are being automated, the market has shifted toward Agentic AI Architects—engineers who build autonomous systems that plan, execute, and self-correct. Empowers Academy bridges the gap between passive theoretical knowledge and high-yield enterprise execution. You don't just learn concepts; you deploy autonomous workflows, optimize vector databases, and build multi-agent ecosystems that make you indispensable to top tech recruiters.",
      keyFeatures: [
        "10-Learner Cohorts: Maximum engagement with zero ignored pull-requests or questions",
        "Live Monday–Friday Masterclasses: Daily interactive live sessions taught by FAANG / MAANG AI Architects",
        "$1,500+ Enterprise AI Developer Pass: Complimentary 1-year access to AWS Cloud, ChatGPT Plus/API, Claude 3.5 Sonnet, and Cursor Pro",
        "100% Guaranteed Role-Matched Placement: 180-day refund guarantee with targeted role and preferred location routing (Bengaluru, US Remote, GCC Hubs)",
        "Parallel Production Projects: Every module features a concurrent live enterprise build for your job-ready portfolio",
        "Browser-Based Cloud GPU Labs: 1-Click pre-configured VS Code and Jupyter workspaces with pre-loaded CUDA drivers",
        "Live, Code-First Industry Immersion: Daily pull-request code reviews from FAANG AI leads and simulated incident drills",
        "1-Year Dedicated Mentorship & Lifetime Alumni Circle: Post-graduation technical guidance, code profiling, and private roundtables",
      ],
      learningOutcomes: [
        "Enterprise Document Intelligence Engine: Hybrid RAG pipeline with custom guardrails",
        "Autonomous Multi-Agent Software Team: CrewAI + LangGraph orchestration for automated code generation & QA",
        "Scalable AI Observability Pipeline: Real-time token cost, latency, and hallucination monitoring using AWS Bedrock and MLflow",
        "Fine-Tuned Domain Models: Train & quantize models with PEFT, LoRA, QLoRA, and custom domain model alignment",
        "MAANG System Design Drills: 1-on-1 mock architecture rounds covering multi-agent system design",
        "Verified GitHub Portfolio: Verified portfolio of live deployed production agents beating generic certifications",
      ],
      learningPath: [
        "Python & Deep Learning",
        "LLM Foundations",
        "Prompt Engineering & RAG",
        "Vector Databases",
        "Agentic AI (CrewAI & LangGraph)",
        "Multi-Agent Systems",
        "MLOps",
        "Executive Capstone",
      ],
      curriculum: [
        {
          title: "Python & Deep Learning",
          lessons: [
            { title: "Python for AI Systems: Advanced OOP, AsyncIO, Type Hints & Generators", duration: "Week 1" },
            { title: "Mathematical Foundations: Linear Algebra, Vector Calculus & Probability", duration: "Week 1" },
            { title: "PyTorch Fundamentals: Tensors, Autograd & GPU Acceleration Workflows", duration: "Week 2" },
            { title: "Deep Neural Architectures: Optimization, Regularization & Backprop", duration: "Week 2" },
            { title: "Hands-on Lab: Custom Multi-Modal Classifier Trained in PyTorch", duration: "Project" },
          ],
        },
        {
          title: "LLM Foundations",
          lessons: [
            { title: "Transformer Architecture: Self-Attention, KV-Cache & Positional Encodings", duration: "Week 3" },
            { title: "Foundation Model Landscape: Llama 3, Mistral, DeepSeek, Claude & GPT-4o", duration: "Week 3" },
            { title: "Tokenization Mechanics, Context Window Scaling & RoPE Embeddings", duration: "Week 4" },
            { title: "Parameter-Efficient Fine-Tuning (PEFT): LoRA, QLoRA & 4-bit Quantization", duration: "Week 4" },
            { title: "Hands-on Lab: Fine-Tuning a 7B LLM on Domain Data with Unsloth", duration: "Project" },
          ],
        },
        {
          title: "Prompt Engineering & RAG",
          lessons: [
            { title: "Systematic Prompt Design: Chain-of-Thought, Tree-of-Thought & DSPy", duration: "Week 5" },
            { title: "Retrieval-Augmented Generation (RAG) Architecture & Chunking Strategies", duration: "Week 5" },
            { title: "Embedding Models: Dense, Sparse (BM25), BGE-M3 & ColBERT Multi-Vector", duration: "Week 6" },
            { title: "Advanced Retrieval: Hybrid Search, Reranking (Cohere) & Context Compression", duration: "Week 6" },
            { title: "Hands-on Lab: Production Enterprise RAG with Hallucination Checks & Citations", duration: "Project" },
          ],
        },
        {
          title: "Vector Databases",
          lessons: [
            { title: "Vector Indexing Mechanics: HNSW, IVF-PQ, Flat Index & Distance Metrics", duration: "Week 7" },
            { title: "Enterprise Vector Engines: Pinecone, Qdrant, Milvus & pgvector", duration: "Week 7" },
            { title: "Metadata Filtering, Partitioning, Namespaces & Multi-Tenancy Patterns", duration: "Week 8" },
            { title: "GraphRAG: Combining Knowledge Graphs (Neo4j) with Vector Similarity", duration: "Week 8" },
            { title: "Hands-on Lab: Billion-Vector Query Engine with Hybrid Search & Filtering", duration: "Project" },
          ],
        },
        {
          title: "Agentic AI (CrewAI & LangGraph)",
          lessons: [
            { title: "Autonomous Agent Architecture: Perception, Planning, Memory & Tool Use", duration: "Week 9" },
            { title: "LangGraph Deep Dive: Cyclic Graphs, State Persistence & Checkpointing", duration: "Week 9" },
            { title: "Human-in-the-Loop Workflows & Interactive Approval Gateways", duration: "Week 10" },
            { title: "CrewAI: Role-Playing Agents, Shared Memory & Hierarchical Delegation", duration: "Week 10" },
            { title: "Hands-on Lab: Autonomous Financial Analyst Agent with Tool Calling & Search", duration: "Project" },
          ],
        },
        {
          title: "Multi-Agent Systems",
          lessons: [
            { title: "Multi-Agent Orchestration: Inter-Agent Communication & Consensus Protocols", duration: "Week 11" },
            { title: "Complex Workflows: Researcher, Coder, Critic & Reviewer Dynamics", duration: "Week 11" },
            { title: "AutoGen & LangGraph Swarms: Dynamic Routing & State Synchronization", duration: "Week 12" },
            { title: "Fault Tolerance, Deadlock Prevention & Error Recovery in Agent Networks", duration: "Week 12" },
            { title: "Hands-on Lab: Autonomous Multi-Agent Software Engineering Squad", duration: "Project" },
          ],
        },
        {
          title: "MLOps",
          lessons: [
            { title: "High-Throughput Inference Engines: vLLM, TensorRT-LLM, Ollama & TGI", duration: "Week 13" },
            { title: "LLM Evaluation & Quality Benchmarking with Ragas, TruLens & DeepEval", duration: "Week 13" },
            { title: "Guardrails & Safety: NeMo Guardrails, Guardrails AI & Prompt Injection Defense", duration: "Week 14" },
            { title: "Observability & Tracing: Arize Phoenix, LangSmith & OpenTelemetry", duration: "Week 14" },
            { title: "Hands-on Lab: Production LLMOps Pipeline with Real-Time Drift & Hallucination Tracing", duration: "Project" },
          ],
        },
        {
          title: "Executive Capstone",
          lessons: [
            { title: "Executive Problem Formulation, Architecture Blueprint & ROI Feasibility", duration: "Week 15" },
            { title: "High-Scale System Design: Concurrency, Caching, Token Budgeting & SLA", duration: "Week 15" },
            { title: "End-to-End Autonomous AI Enterprise Solution Implementation", duration: "Week 16" },
            { title: "Live Production Cloud Deployment with Full CI/CD & Observability", duration: "Week 16" },
            { title: "Capstone Presentation & Demo Day to Executive AI Panel & Mentors", duration: "Final" },
          ],
        },
      ],
      skills: [
        "Generative AI & Foundation Models",
        "Agentic AI Architecture & Design",
        "LLM Engineering & Prompt Design",
        "Multi-Agent Orchestration (LangGraph & CrewAI)",
        "Autonomous Task Planning & Decomposition",
        "State Graph Modeling & Cyclic Loops",
        "Agent Long-Term & Short-Term Memory Systems",
        "Function Calling & Tool Integration",
        "Human-in-the-Loop (HITL) Workflow Governance",
        "Retrieval-Augmented Generation (RAG)",
        "Advanced RAG (Self-RAG & Corrective RAG)",
        "GraphRAG & Knowledge Graphs",
        "Hybrid Search (Dense + BM25 Sparse Search)",
        "Semantic Chunking & Re-ranking",
        "Vector Databases (Pinecone, Qdrant, Milvus)",
        "Parameter-Efficient Fine-Tuning (PEFT, LoRA, QLoRA)",
        "Model Alignment (RLHF, DPO & Instruction Tuning)",
        "Unsloth Accelerated Fine-Tuning",
        "Model Quantization (GGUF, AWQ & GPTQ)",
        "Local LLM Deployment (Ollama & vLLM)",
        "LLM Guardrails & Safety (NeMo Guardrails, Guardrails AI)",
        "Prompt Injection Defense & Red Teaming",
        "Automated LLM Evaluation (Ragas & DeepEval)",
        "LLMOps, Tracing & Observability (LangSmith & Phoenix)",
        "Enterprise AI System Design & Scalability",
        "High-Concurrency Async Streaming",
        "Multi-Modal AI (Vision, Audio & Document AI)",
        "Cloud LLM Infrastructure (AWS Bedrock, Azure OpenAI)",
        "Enterprise AI Strategy & ROI Feasibility",
        "FastAPI Production Microservices & Docker",
      ],
      tools: [
        "Python", "PyTorch", "OpenAI", "Anthropic", "Hugging Face", "LangChain",
        "CrewAI", "LangGraph", "LlamaIndex", "AutoGen", "Ollama", "vLLM", "Pinecone",
        "Qdrant", "Milvus", "ChromaDB", "Docker", "AWS", "FastAPI", "Streamlit",
        "MLflow", "Phoenix", "LangSmith", "Ragas", "Guardrails AI", "GitHub", "Jupyter",
        "Google Colab", "Weights & Biases"
      ],
      toolCategorized: [
        {
          category: "Languages & Core",
          tools: [
            { name: "Python", iconSlug: "python" },
            { name: "PyTorch", iconSlug: "pytorch" },
          ],
        },
        {
          category: "Frameworks & Agents",
          tools: [
            { name: "LangChain", iconSlug: "langchain" },
            { name: "CrewAI", iconSlug: "crewai" },
            { name: "LangGraph", iconSlug: "langgraph" },
            { name: "LlamaIndex", iconSlug: "llamaindex" },
            { name: "AutoGen", iconSlug: "microsoft" },
          ],
        },
        {
          category: "Vector DBs & Search",
          tools: [
            { name: "Pinecone", iconSlug: "pinecone" },
            { name: "Qdrant", iconSlug: "qdrant" },
            { name: "Milvus", iconSlug: "milvus" },
            { name: "ChromaDB", iconSlug: "chromadb" },
          ],
        },
        {
          category: "Inference & Fine-Tuning",
          tools: [
            { name: "Hugging Face", iconSlug: "huggingface" },
            { name: "vLLM", iconSlug: "vllm" },
            { name: "Ollama", iconSlug: "ollama" },
            { name: "Unsloth", iconSlug: "unsloth" },
            { name: "PEFT/LoRA", iconSlug: "pytorch" },
          ],
        },
        {
          category: "Evals & Guardrails",
          tools: [
            { name: "Ragas", iconSlug: "ragas" },
            { name: "Guardrails AI", iconSlug: "guardrails" },
            { name: "NeMo Guardrails", iconSlug: "nvidia" },
          ],
        },
        {
          category: "Observability & Ops",
          tools: [
            { name: "MLflow", iconSlug: "mlflow" },
            { name: "Docker", iconSlug: "docker" },
            { name: "FastAPI", iconSlug: "fastapi" },
            { name: "Streamlit", iconSlug: "streamlit" },
            { name: "Phoenix / LangSmith", iconSlug: "langsmith" },
          ],
        },
      ],
      projectCategories: [
        "1. Enterprise Autonomous Code Auditor & Refactoring Agent",
        "2. Multi-Modal Medical & Healthcare Diagnostics Copilot",
        "3. Financial Intelligence & Automated Earnings Call Analyst",
        "4. Enterprise LLM Evaluation, Guardrails & Governance Platform",
        "5. Autonomous E-Commerce Customer Support & Refund Orchestrator",
        "6. On-Premises Specialized Fine-Tuned Model Pipeline",
        "7. Production-Grade RAG Assistant & Knowledge Base",
        "8. Stateful Multi-Agent Workflow Orchestrator",
        "9. Full-Stack End-to-End GenAI Application",
        "10. Production MLOps Pipeline & Telemetry Suite",
      ],
      projectsList: [
        {
          title: "Enterprise Autonomous Code Auditor & Refactoring Agent",
          description: "Build an autonomous code-review agent using LangGraph & CrewAI that parses enterprise repositories, analyzes static code quality & security vulnerabilities, and generates automated refactoring PRs with automated unit test validation.",
          tech: "LangGraph",
          iconSlug: "langgraph"
        },
        {
          title: "Multi-Modal Medical & Healthcare Diagnostics Copilot",
          description: "Design a HIPAA-compliant multi-modal AI assistant capable of processing medical imaging (X-rays/MRIs) alongside EHR patient notes using vision LLMs and structured medical knowledge graphs.",
          tech: "OpenAI",
          iconSlug: "openai"
        },
        {
          title: "Financial Intelligence & Automated Earnings Call Analyst",
          description: "Develop an agentic RAG pipeline for org-level financial report analysis. The auditor agent reviews SEC filings and earnings call transcripts for consistency, completeness, and audit-readiness with automated tabular extraction.",
          tech: "LlamaIndex",
          iconSlug: "llamaindex"
        },
        {
          title: "Enterprise LLM Evaluation, Guardrails & Governance Platform",
          description: "Architect a production-grade governance hub leveraging Guardrails AI and NeMo Guardrails to enforce PII masking, hallucination detection, prompt injection defense, and automated evaluation metrics via Ragas.",
          tech: "Guardrails AI",
          iconSlug: "guardrails"
        },
        {
          title: "Autonomous E-Commerce Customer Support & Refund Orchestrator",
          description: "Deploy an end-to-end multi-agent support orchestrator using function calling to interface with ERP/CRM APIs, process automated refund approvals within policy limits, and escalate complex disputes.",
          tech: "CrewAI",
          iconSlug: "crewai"
        },
        {
          title: "On-Premises Specialized Fine-Tuned Model Pipeline",
          description: "Fine-tune open-weight LLMs (Llama 3 / Mistral) using QLoRA, PEFT, and Unsloth on proprietary domain datasets. Quantize and serve high-throughput inference on-premise using vLLM and Ollama.",
          tech: "Unsloth",
          iconSlug: "unsloth"
        },
        {
          title: "Production-Grade RAG Assistant & Knowledge Base",
          description: "Build a hybrid-search GraphRAG system combining dense vector embeddings (Pinecone/Qdrant) and sparse keyword retrieval with reranking, dynamic document chunking, and PDF retriever agents.",
          tech: "Pinecone",
          iconSlug: "pinecone"
        },
        {
          title: "Stateful Multi-Agent Workflow Orchestrator",
          description: "Orchestrate complex long-running business workflows using LangGraph and AutoGen, featuring human-in-the-loop verification checkpoints, state persistence, and graceful error handling.",
          tech: "LangChain",
          iconSlug: "langchain"
        },
        {
          title: "Full-Stack End-to-End GenAI Application",
          description: "Construct a responsive full-stack GenAI web app with FastAPI backend and interactive frontend, featuring streaming responses, session management, and integrated tool calling APIs.",
          tech: "FastAPI",
          iconSlug: "fastapi"
        },
        {
          title: "Production MLOps Pipeline & Telemetry Suite",
          description: "Establish a continuous integration and observability suite using MLflow, Docker, Phoenix, and LangSmith to track latency, token usage costs, drift detection, and LLM telemetry in real-time.",
          tech: "Phoenix / LangSmith",
          iconSlug: "phoenix"
        }
      ],
      capstone: "Build an autonomous multi-agent enterprise AI system capable of solving complex multi-step workflows.",
      certifications: ["Certified Agentic AI Practitioner (CAAP)", "GenAI & LLM Engineer"],
      placementSupport: [
        "Freshers: 100% Placement Guarantee within 180 Days (Minimum package commitment of ₹5 LPA)",
        "Experienced Professionals: 100% Placement Guarantee within 180 Days (Targeting 50%+ salary hike over current CTC)",
        "Location Routing: Preferred Geography Matching across Bengaluru, Hyderabad, Gurgaon, US Remote, GCC Hubs, and Other Locations",
        "180-Day Refund Guarantee: Full written legal refund contract executed prior to fee payment",
        "Direct Corporate Referrals: Network introductions to Microsoft, Accenture, JPMorgan, Swiggy, Razorpay & global AI scale-ups",
        "MAANG Architecture Drills: 1-on-1 mock system design rounds covering multi-agent system design and live technical evaluation",
      ],
      careerRoles: ["Agentic AI Engineer", "GenAI Lead", "LLM Architect", "AI Solutions Engineer"],
      curriculumHtmlUrl: "/Programs/curriculum/pg-executive-agentic-ai-generative-ai/index.html",
      badge: "ULTRA-EXCLUSIVE COHORT",
      price: 129999,
      gstRate: 18,
      gstText: "+ 18% GST",
      unfairAdvantage: {
        headline: "The Unfair Advantage: Why Top Engineers Choose Empowers",
        subheadline: "Most AI programs drop 500+ students into passive weekend lectures with zero code reviews or enterprise tool access. We built the anti-bootcamp.",
        items: [
          {
            title: "Micro-Batch Exclusivity",
            desc: "Strictly capped at 10 candidates per batch for direct, daily 1-on-1 mentorship.",
            badge: "Strictly 10 Seats",
          },
          {
            title: "Live Monday–Friday Intensity",
            desc: "Taught live 5 days a week by FAANG / MAANG AI Architects.",
            badge: "5 Days / Week Live",
          },
          {
            title: "$1,500+ Enterprise AI Developer Pass",
            desc: "Complimentary 1-year access to AWS Cloud, ChatGPT Plus/API, Claude 3.5 Sonnet, and Cursor Pro.",
            badge: "$1,500+ Included",
          },
          {
            title: "100% Guaranteed Role-Matched Placement",
            desc: "180-day refund guarantee with targeted role and preferred location routing (Bengaluru, US Remote, GCC Hubs).",
            badge: "100% Placement Guarantee",
          },
        ],
      },
      careerMatrix: [
        {
          category: "Freshers",
          commitment: "100% Placement Guarantee within 180 Days",
          routing: "Minimum package commitment of ₹5 LPA.",
        },
        {
          category: "Experienced Professionals",
          commitment: "100% Placement Guarantee within 180 Days",
          routing: "Targeting 50%+ salary hike over current CTC.",
        },
        {
          category: "Location Routing",
          commitment: "Preferred Geography Matching",
          routing: "Bengaluru, Hyderabad, Gurgaon, US Remote, GCC Hubs, Other Locations.",
        },
      ],
      marketRealignment: [
        {
          stat: "74%",
          title: "Enterprise AI Budgets Shifting",
          desc: "74% of Enterprise AI Budgets are shifting from simple chatbots to autonomous Agentic Workflows.",
        },
        {
          stat: "Top Tier",
          title: "Recruiters Hunting Builders",
          desc: "Microsoft, Accenture, JPMorgan, Swiggy, and Razorpay are actively hunting engineers with hands-on RAG and multi-agent deployment experience.",
        },
        {
          stat: "Live Code",
          title: "Proof of Capability Over Degree",
          desc: "A verified GitHub portfolio of live deployed agents beats generic certifications every single time.",
        },
      ],
      additionalNotes: [
        "74% of Enterprise AI Budgets are shifting from simple chatbots to autonomous Agentic Workflows.",
        "Top Recruiters (Microsoft, Accenture, JPMorgan, Swiggy, Razorpay) are actively hunting engineers with hands-on RAG and multi-agent deployment experience.",
        "Proof of Capability Over Degree: A verified GitHub portfolio of live deployed agents beats generic certifications every single time.",
        "Complimentary 1-Year $1,500+ Enterprise Pass: AWS Cloud credits, ChatGPT Plus/API, Claude 3.5 Sonnet, and Cursor Pro access included.",
      ],
    },
  },
  {
    slug: "cybersecurity-ceh-v13",
    tag: "Cybersecurity",
    title: "Cybersecurity & Ethical hacking (CEH V13 AI)",
    goal: "The Certified Ethical Hacker (CEH v13) global standard for defensive security & AI ethical hacking.",
    image: "/Programs/Cybersecurity (CEH v13).png",
    certificate: "/certificates/Cybersecurity (2).png",
    format: "6 months · 26 weeks · ~600 hours · live online · mentor-led",
    price: 79999,
    gstRate: 18,
    gstText: "+ 18% GST",
    stack: ["Ethical Hacking", "CEH v13", "Network Security", "AI Threat Defense", "Penetration Testing"],
    focus: [
      "Master defensive security, ethical hacking, vulnerability assessment, and AI integration into threat mitigation.",
      "Prepare for the globally recognized Certified Ethical Hacker (CEH v13) certification.",
      "Conduct live penetration tests and vulnerability audits on enterprise networks.",
      "Deploy AI-driven threat detection and automated incident response tools.",
    ],
    details: {
      headline: "Global Standard for Defensive Security & AI-Integrated Ethical Hacking.",
      tagline: "Master ethical hacking, threat mitigation, and penetration testing.",
      category: "Cybersecurity",
      overview:
        "Cybersecurity (focusing on CEH v13), The Certified Ethical Hacker (CEH v13) is the latest, globally recognized standard for defensive security, notable for integrating AI into ethical hacking. My proposed goal for this standalone module is to train students to become Ethical Hackers or Cybersecurity Professionals.",
      keyFeatures: [
        "CEH v13 exam preparation",
        "AI-driven threat intelligence & defense",
        "Live penetration testing labs",
        "Network security & malware analysis",
        "Web application vulnerability assessment",
        "Incident response & threat hunting",
      ],
      learningOutcomes: [
        "Conduct comprehensive vulnerability assessments and penetration tests",
        "Identify, analyze, and mitigate AI-driven security threats",
        "Secure enterprise network infrastructure and web applications",
        "Perform malware analysis and incident response procedures",
        "Prepare for global Certified Ethical Hacker (CEH v13) certification",
      ],
      learningPath: [
        "Footprinting & Reconnaissance",
        "Network Scanning",
        "Vulnerability Analysis",
        "System Hacking",
        "Malware Threats",
        "Web App Hacking",
        "Wireless & IoT Security",
        "AI Threat Defense",
      ],
      curriculum: [
        {
          title: "Footprinting & Reconnaissance",
          lessons: [
            { title: "OSINT Framework: Open-Source Intelligence Gathering & Methodology", duration: "Week 1" },
            { title: "Search Engine Intelligence, Google Dorking & Social Media Footprinting", duration: "Week 1" },
            { title: "DNS, WHOIS, Subdomain Enumeration & Network Route Tracing", duration: "Week 2" },
            { title: "Automated Recon Tools: Maltego, Recon-ng, theHarvester & Shodan", duration: "Week 2" },
            { title: "Hands-on Lab: Full Passive & Active Reconnaissance Audit on Target Enterprise", duration: "Project" },
          ],
        },
        {
          title: "Network Scanning",
          lessons: [
            { title: "TCP/IP Three-Way Handshake, Packet Flags & Header Analysis", duration: "Week 3" },
            { title: "Advanced Nmap Scanning Techniques (SYN, Stealth, UDP, OS Fingerprinting)", duration: "Week 3" },
            { title: "Banner Grabbing, Service Enumeration & NSE (Nmap Scripting Engine)", duration: "Week 4" },
            { title: "Packet Analysis & Traffic Sniffing with Wireshark & tcpdump", duration: "Week 4" },
            { title: "Hands-on Lab: Mapping an Enterprise Network Perimeter and Exposing Services", duration: "Project" },
          ],
        },
        {
          title: "Vulnerability Analysis",
          lessons: [
            { title: "Vulnerability Lifecycle, CVE Databases & CVSS v3.1 Scoring", duration: "Week 5" },
            { title: "Enterprise Vulnerability Scanning with Nessus Professional & OpenVAS", duration: "Week 5" },
            { title: "Scan Analysis, False Positive Elimination & Risk Prioritization", duration: "Week 6" },
            { title: "Compliance Auditing: CIS Benchmarks, NIST Framework & ISO 27001", duration: "Week 6" },
            { title: "Hands-on Lab: Full Vulnerability Assessment Report for Multi-Tier Infrastructure", duration: "Project" },
          ],
        },
        {
          title: "System Hacking",
          lessons: [
            { title: "Password Cracking & Hash Analysis: John the Ripper, Hashcat & Hydra", duration: "Week 7" },
            { title: "Linux Privilege Escalation: SUID, Sudo Rights, Cron Jobs & Kernel Exploits", duration: "Week 7" },
            { title: "Windows Privilege Escalation: Token Manipulation, DLL Hijacking & Services", duration: "Week 8" },
            { title: "Metasploit Framework: Payloads, Handlers, Meterpreter & Pivoting", duration: "Week 8" },
            { title: "Hands-on Lab: Gaining Root & Domain Admin on a Hardened Lab Network", duration: "Project" },
          ],
        },
        {
          title: "Malware Threats",
          lessons: [
            { title: "Malware Taxonomy: Trojans, Ransomware, Rootkits, Worms & Botnets", duration: "Week 9" },
            { title: "Static Malware Analysis: PE Headers, Hashes, Strings & Ghidra Decompilation", duration: "Week 9" },
            { title: "Dynamic Analysis in Sandboxes: Process Monitoring & Network Call Tracing", duration: "Week 10" },
            { title: "Antivirus & EDR Evasion Techniques, Obfuscation & Fileless Attacks", duration: "Week 10" },
            { title: "Hands-on Lab: Dissecting Real-World Ransomware & Extracting Indicators of Compromise (IOCs)", duration: "Project" },
          ],
        },
        {
          title: "Web App Hacking",
          lessons: [
            { title: "OWASP Top 10 Deep Dive: SQLi, XSS, CSRF, SSRF & Broken Access Control", duration: "Week 11" },
            { title: "Web Proxy Interception, Spidering & Fuzzing with Burp Suite Professional", duration: "Week 11" },
            { title: "Authentication Flaws, JWT Token Forgery & Session Hijacking", duration: "Week 12" },
            { title: "API Security Testing: REST, GraphQL, Broken Object Level Authorization (BOLA)", duration: "Week 12" },
            { title: "Hands-on Lab: Complete Black-Box Web App Penetration Test with Exploit PoC", duration: "Project" },
          ],
        },
        {
          title: "Wireless & IoT Security",
          lessons: [
            { title: "Wi-Fi Protocol Exploits: WPA2/WPA3 4-Way Handshake Cracking with Aircrack-ng", duration: "Week 13" },
            { title: "Rogue Access Points, Evil Twin Attacks & Deauthentication Floods", duration: "Week 13" },
            { title: "IoT Architecture Vulnerabilities, Firmware Extraction & Hardware Hacking", duration: "Week 14" },
            { title: "Mobile Security Testing: Android APK Reverse Engineering & iOS Sandboxing", duration: "Week 14" },
            { title: "Hands-on Lab: Intercepting & Exploiting Vulnerable IoT Smart Gateway Protocols", duration: "Project" },
          ],
        },
        {
          title: "AI Threat Defense",
          lessons: [
            { title: "AI-Powered Cyber Threats: Automated Phishing, LLM Jailbreaking & Poisoning", duration: "Week 15" },
            { title: "Security Operations Center (SOC) Architecture & SIEM with Splunk", duration: "Week 15" },
            { title: "Automated Threat Hunting & Intrusion Detection with Suricata & Snort", duration: "Week 16" },
            { title: "Incident Response Playbooks: Containment, Eradication & Forensics", duration: "Week 16" },
            { title: "Capstone: 24-Hour Red Team vs. Blue Team Live Cyber Range Simulation", duration: "Final" },
          ],
        },
      ],
      skills: [
        "Ethical Hacking (CEH v13 Certified Core)",
        "Penetration Testing (Web, Network & Wireless)",
        "Vulnerability Assessment & Management (VAPT)",
        "Network Security & Packet Inspection (Wireshark)",
        "Network Scanning & Reconnaissance (Nmap)",
        "Web Application Security & OWASP Top 10",
        "SQL Injection & Cross-Site Scripting (XSS) Exploitation",
        "Exploit Development & Metasploit Framework",
        "Privilege Escalation (Linux & Windows)",
        "AI-Driven Threat Defense & Anomaly Detection",
        "AI Red Teaming & LLM Security (OWASP LLM Top 10)",
        "Intrusion Detection & Prevention (Snort, Suricata)",
        "Security Information & Event Management (SIEM / Splunk)",
        "Digital Forensics & Incident Response (DFIR)",
        "Threat Hunting & Security Log Analysis",
        "Malware Analysis Fundamentals & Reverse Engineering",
        "Wireless Network Security & Defense (Aircrack-ng)",
        "Social Engineering Tactics & Awareness Defense",
        "Password Auditing & Cracking (Hashcat, John the Ripper)",
        "Applied Cryptography & Public Key Infrastructure (PKI)",
        "Identity & Access Management (IAM)",
        "Cloud Security & Zero Trust Architecture",
        "Linux System Hardening & Security Auditing",
        "Secure Coding Practices & Python for Security",
        "Active Directory Penetration Testing & Kerberos Attacks",
        "Vulnerability Scanning with Nessus & OpenVAS",
        "Open-Source Intelligence (OSINT & Shodan)",
        "Cybersecurity Governance & Compliance (ISO 27001, NIST)",
      ],
      tools: [
        "Kali Linux", "Nmap", "Wireshark", "Burp Suite", "Metasploit", "OWASP ZAP",
        "Snort", "Splunk", "John the Ripper", "Hydra", "Aircrack-ng", "Nessus",
        "Hashcat", "Ghidra", "Suricata", "OpenVAS", "Shodan", "Maltego",
        "Python", "Bash", "Linux", "Docker", "Tor", "GitHub"
      ],
      toolCategorized: [
        {
          category: "Reconnaissance & Scanners",
          tools: [
            { name: "Nmap" },
            { name: "Wireshark" },
            { name: "OWASP ZAP" },
            { name: "Tor" },
          ],
        },
        {
          category: "Exploitation & OS",
          tools: [
            { name: "Metasploit" },
            { name: "Burp Suite" },
            { name: "Kali Linux" },
            { name: "Linux" },
          ],
        },
        {
          category: "Defense, SIEM & Scripting",
          tools: [
            { name: "Snort" },
            { name: "Splunk" },
            { name: "Python" },
            { name: "Bash" },
            { name: "Docker" },
            { name: "GitHub" },
          ],
        },
      ],
      projectCategories: [
        "1. Enterprise Vulnerability Assessment Audit",
        "2. Automated Penetration Test & Security Report",
        "3. Malware Behavioral Analysis & Reverse Engineering",
        "4. AI-Driven Threat Detection & Defense System",
        "5. Web Application Exploitation & Hardening",
        "6. Wireless Network & IoT Security Audit",
        "7. SOC Incident Response & SIEM Threat Hunting",
        "8. Active Directory Privilege Escalation Simulation",
        "9. Cloud Security Misconfiguration & IAM Audit",
        "10. Cryptographic Password Auditing & Cracking Defense",
      ],
      projectsList: [
        {
          title: "Enterprise Vulnerability Assessment Audit",
          description: "Perform deep vulnerability scanning across network infrastructures using Nmap and OWASP ZAP, producing CVE risk matrices and remediation roadmaps.",
          tech: "Nmap",
          iconSlug: "nmap"
        },
        {
          title: "Automated Penetration Test & Security Report",
          description: "Simulate real-world adversary attacks using Metasploit, Kali Linux, and Burp Suite to audit web apps and internal corporate networks.",
          tech: "Metasploit",
          iconSlug: "metasploit"
        },
        {
          title: "Malware Behavioral Analysis & Reverse Engineering",
          description: "Analyze zero-day malware samples inside isolated sandbox environments using Wireshark and disassemblers to identify command-and-control communication.",
          tech: "Wireshark",
          iconSlug: "wireshark"
        },
        {
          title: "AI-Driven Threat Detection & Defense System",
          description: "Train machine learning threat-hunting models on network log data to detect anomalous traffic spikes and trigger automated intrusion prevention rules.",
          tech: "Snort",
          iconSlug: "snort"
        },
        {
          title: "Web Application Exploitation & Hardening",
          description: "Identify and exploit OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, SSRF) on staged production environments and author secure code remediation patches.",
          tech: "OWASP ZAP",
          iconSlug: "owasp"
        },
        {
          title: "Wireless Network & IoT Security Audit",
          description: "Audit enterprise WPA2/WPA3 enterprise Wi-Fi networks and connected IoT hardware to detect credential interception and handshake capture vulnerabilities.",
          tech: "Kali Linux",
          iconSlug: "kalilinux"
        },
        {
          title: "SOC Incident Response & SIEM Threat Hunting",
          description: "Deploy Splunk to ingest syslogs and endpoint telemetry, building automated correlation rules for rapid containment of active ransomware threats.",
          tech: "Splunk",
          iconSlug: "splunk"
        },
        {
          title: "Active Directory Privilege Escalation Simulation",
          description: "Execute internal red team domain takeover simulations using BloodHound and Kerberoasting to map attack paths and implement Zero Trust controls.",
          tech: "Burp Suite",
          iconSlug: "burpsuite"
        },
        {
          title: "Cloud Security Misconfiguration & IAM Audit",
          description: "Audit AWS and Azure cloud environments for overly permissive IAM roles, exposed storage buckets, and missing TLS encryption to align with CIS benchmarks.",
          tech: "AWS",
          iconSlug: "amazonwebservices"
        },
        {
          title: "Cryptographic Password Auditing & Cracking Defense",
          description: "Test corporate password entropy policies using dictionary attacks and rainbow tables, enforcing modern salted SHA-256 and Argon2 password hashing architectures.",
          tech: "Hashcat",
          iconSlug: "hashcat"
        }
      ],
      capstone:
        "Execute a full-scope simulated penetration test on an enterprise network and deliver an executive-grade vulnerability audit report.",
      certifications: ["Certified Ethical Hacker (CEH v13) Prep", "Cybersecurity Practitioner"],
      placementSupport: ["Resume & LinkedIn optimization", "Mock security interview rounds", "Hiring partner introductions", "Portfolio audit"],
      careerRoles: ["Ethical Hacker", "Cybersecurity Analyst", "Penetration Tester", "Security Engineer", "SOC Analyst"],
      curriculumHtmlUrl: "/Programs/curriculum/cybersecurity-ceh-v13/index.html",
      price: 79999,
      gstRate: 18,
      gstText: "+ 18% GST",
      unfairAdvantage: {
        headline: "The Unfair Advantage: Why Top Engineers Choose Empowers",
        subheadline: "Most security programs focus on slide presentations and rote memorization. We built a live cyber range where you hack and defend real vulnerable networks.",
        items: [
          {
            title: "Live Cyber-Range Labs",
            desc: "Hands-on virtual attack simulations, malware analysis, and real-time threat detection drills.",
            badge: "Live Attack Labs",
          },
          {
            title: "CEH v13 Global Standard",
            desc: "Latest EC-Council CEH v13 curriculum updated with AI-driven threat mitigation and automated incident response.",
            badge: "CEH v13 AI",
          },
          {
            title: "Offensive & Defensive Tool Pass",
            desc: "Access to industry standard security tooling environments (Burp Suite Pro, Kali, Metasploit, Wireshark, Splunk).",
            badge: "Enterprise Tools",
          },
          {
            title: "100% Guaranteed Role-Matched Placement",
            desc: "180-day refund guarantee with targeted role and preferred location routing (Bengaluru, US Remote, GCC Hubs).",
            badge: "100% Placement Guarantee",
          },
        ],
      },
      careerMatrix: [
        {
          category: "Freshers",
          commitment: "100% Placement Guarantee within 180 Days",
          routing: "Minimum package commitment of ₹5 LPA.",
        },
        {
          category: "Experienced Professionals",
          commitment: "100% Placement Guarantee within 180 Days",
          routing: "Targeting 50%+ salary hike over current CTC.",
        },
        {
          category: "Location Routing",
          commitment: "Preferred Geography Matching",
          routing: "Bengaluru, Hyderabad, Gurgaon, US Remote, GCC Hubs, Other Locations.",
        },
      ],
      marketRealignment: [
        {
          stat: "82%",
          title: "Surge in AI Cyber Threats",
          desc: "82% of cybersecurity executives report escalating AI-powered automated attacks, creating urgent demand for AI-literate ethical hackers.",
        },
        {
          stat: "Top Tier",
          title: "Top Security Recruiters",
          desc: "Deloitte, PwC, EY, Securonix, and CrowdStrike actively recruit practitioners with hands-on penetration testing experience.",
        },
        {
          stat: "Live Labs",
          title: "Proof of Capability Over Degree",
          desc: "Demonstrated CVE exploitation and bug-bounty documentation outperform generic security certificates every time.",
        },
      ],
    },
  },
  {
    slug: "cloud-computing-devops",
    tag: "Cloud & DevOps",
    title: "Cloud Computing and DevOps",
    goal: "Focusing on building, deploying, automating, and managing modern applications in the cloud.",
    image: "/Programs/Cloud Computing & DevOps.png",
    certificate: "/certificates/Cloud cpmputing and devops.png",
    price: 85000,
    gstRate: 18,
    gstText: "+ 18% GST",
    format: "6 months · 26 weeks · ~600 hours · live online · mentor-led",
    stack: ["Cloud Engineering", "DevOps", "Docker", "Kubernetes", "AWS", "CI/CD", "Terraform"],
    focus: [
      "Transition away from traditional physical servers and utilize code to automatically build, test, and release software into highly scalable cloud environments.",
      "Architect scalable multi-cloud infrastructure on AWS and Azure.",
      "Containerize microservices with Docker and orchestrate with Kubernetes.",
      "Automate deployment pipelines using CI/CD tools like GitHub Actions and Jenkins.",
    ],
    mentors: "",
    details: {
      headline: "Master Cloud Infrastructure, CI/CD Automation & DevOps.",
      tagline: "Build, deploy, automate, and manage scalable cloud systems.",
      category: "Cloud & DevOps",
      overview:
        "This is a distinct, non-cybersecurity course focusing on building, deploying, automating, and managing modern applications in the cloud. The goal is to prepare students to become Cloud Engineers or DevOps Engineers.",
      keyFeatures: [
        "Live mentor-led cohort",
        "Hands-on AWS & Multi-Cloud labs",
        "Docker & Kubernetes orchestration",
        "CI/CD automation pipelines",
        "Infrastructure as Code (Terraform)",
        "Production deployment & MLOps basics",
      ],
      learningOutcomes: [
        "Architect scalable cloud infrastructures on AWS & Azure",
        "Containerize applications with Docker & orchestrate with Kubernetes",
        "Build automated CI/CD deployment pipelines",
        "Automate infrastructure provisioning with Terraform",
        "Deploy and monitor production web applications",
      ],
      learningPath: [
        "Linux & Networking",
        "Python for DevOps",
        "AWS Cloud Core",
        "Docker & Containerization",
        "Kubernetes Orchestration",
        "CI/CD & Jenkins",
        "Terraform IaC",
        "Capstone",
      ],
      curriculum: [
        {
          title: "Linux & Networking",
          lessons: [
            { title: "Linux Internals: Filesystem Hierarchy, Process Management & Permissions", duration: "Week 1" },
            { title: "Bash Shell Scripting: Automation, Cron, Signal Handling & Text Processing (awk, sed)", duration: "Week 1" },
            { title: "Networking Fundamentals: TCP/UDP, DNS, DHCP, Subnetting & CIDR Routing", duration: "Week 2" },
            { title: "SSH Architecture, Firewall Configuration (iptables, UFW) & Systemd Services", duration: "Week 2" },
            { title: "Hands-on Lab: Automated Linux Server Hardening & Zero-Trust Bastion Host Setup", duration: "Project" },
          ],
        },
        {
          title: "Python for DevOps",
          lessons: [
            { title: "Python Core for System Administrators (OS, Sys, Subprocess, Requests)", duration: "Week 3" },
            { title: "Cloud Automation with AWS SDK (Boto3) & Azure SDK", duration: "Week 3" },
            { title: "Automated Log Parsing, Health Checks & System Monitoring Scripts", duration: "Week 4" },
            { title: "Building Custom DevOps CLI Tools with Click and Argparse", duration: "Week 4" },
            { title: "Hands-on Lab: Automated Multi-Region Cloud Resource Inventory and Cleanup Tool", duration: "Project" },
          ],
        },
        {
          title: "AWS Cloud Core",
          lessons: [
            { title: "Global Infrastructure: Regions, Availability Zones & Edge Locations", duration: "Week 5" },
            { title: "Compute & Storage: EC2, Auto-Scaling, EBS, S3 Storage Classes & EFS", duration: "Week 5" },
            { title: "Virtual Private Cloud (VPC): Public/Private Subnets, NAT Gateways & Route Tables", duration: "Week 6" },
            { title: "Identity & Access Management (IAM): Roles, Policies, MFA & Least Privilege", duration: "Week 6" },
            { title: "Hands-on Lab: Multi-AZ High-Availability Web Application Architecture on AWS", duration: "Project" },
          ],
        },
        {
          title: "Docker & Containerization",
          lessons: [
            { title: "Container Architecture: Namespaces, Cgroups & Union File Systems", duration: "Week 7" },
            { title: "Writing Production Dockerfiles: Multi-Stage Builds & Image Size Optimization", duration: "Week 7" },
            { title: "Container Networking, Volume Mounts & Data Persistence", duration: "Week 8" },
            { title: "Multi-Container Orchestration with Docker Compose", duration: "Week 8" },
            { title: "Hands-on Lab: Containerizing a Polyglot Microservices App with Nginx Reverse Proxy", duration: "Project" },
          ],
        },
        {
          title: "Kubernetes Orchestration",
          lessons: [
            { title: "Kubernetes Architecture: Control Plane, Kubelet, etcd & Kube-Proxy", duration: "Week 9" },
            { title: "Core Objects: Pods, ReplicaSets, Deployments, Services & Ingress Controllers", duration: "Week 9" },
            { title: "Configuration Management: ConfigMaps, Secrets & External Secrets Operator", duration: "Week 10" },
            { title: "Package Management with Helm: Creating Production Charts and Value Overrides", duration: "Week 10" },
            { title: "Hands-on Lab: Zero-Downtime Rolling Update & Auto-Scaling (HPA) on EKS", duration: "Project" },
          ],
        },
        {
          title: "CI/CD & Jenkins",
          lessons: [
            { title: "CI/CD Architecture: Trunk-Based Development & Semantic Versioning", duration: "Week 11" },
            { title: "Declarative Jenkins Pipelines: Shared Libraries, Webhooks & Pipeline-as-Code", duration: "Week 11" },
            { title: "GitHub Actions: Custom Matrix Workflows, Artifact Caching & Secret Management", duration: "Week 12" },
            { title: "Automated Code Quality & Vulnerability Scanning with SonarQube & Trivy", duration: "Week 12" },
            { title: "Hands-on Lab: Automated Multi-Stage CI Pipeline from Pull Request to Docker Registry", duration: "Project" },
          ],
        },
        {
          title: "Terraform IaC",
          lessons: [
            { title: "Terraform Core: HCL Syntax, Providers, Resources, Variables & Outputs", duration: "Week 13" },
            { title: "State Management: Remote State in S3 with DynamoDB Distributed Locking", duration: "Week 13" },
            { title: "Modular Architecture: Writing Reusable, Parameterized Infrastructure Modules", duration: "Week 14" },
            { title: "GitOps Integration: Continuous Delivery with ArgoCD & Progressive Canary Rollouts", duration: "Week 14" },
            { title: "Hands-on Lab: Provisioning a Complete Production AWS VPC & EKS Cluster with Terraform", duration: "Project" },
          ],
        },
        {
          title: "Capstone",
          lessons: [
            { title: "Enterprise Cloud & DevOps Architecture Design and Review", duration: "Week 15" },
            { title: "Complete Infrastructure-as-Code Provisioning with Terraform", duration: "Week 15" },
            { title: "Microservices Deployment to Kubernetes with Helm & ArgoCD GitOps", duration: "Week 16" },
            { title: "Full Observability Stack: Prometheus, Grafana Dashboards & Alertmanager", duration: "Week 16" },
            { title: "Capstone Presentation: Live Disaster Recovery & Chaos Engineering Demo", duration: "Final" },
          ],
        },
      ],
      skills: [
        "Cloud Architecture & System Design",
        "Amazon Web Services (AWS Core Services & VPC)",
        "Microsoft Azure Cloud Infrastructure",
        "Infrastructure as Code (IaC) with Terraform & OpenTofu",
        "Configuration Management with Ansible",
        "Linux System Administration & Shell Scripting (Bash)",
        "Python Automation for DevOps",
        "Containerization with Docker & Multi-Stage Builds",
        "Container Orchestration with Kubernetes (K8s)",
        "Kubernetes Helm Package Management",
        "Continuous Integration & Continuous Delivery (CI/CD)",
        "GitHub Actions Pipeline Automation",
        "GitLab CI & Jenkins Automation Pipelines",
        "GitOps Deployment Workflows with ArgoCD",
        "Microservices Architecture & Container Networking",
        "Ingress Controllers & Reverse Proxies (Nginx)",
        "Cloud Networking, Subnets, Routing & Security Groups",
        "Site Reliability Engineering (SRE) & SLA/SLO Principles",
        "Cloud Infrastructure Monitoring with Prometheus",
        "Metrics Visualization & Alerting with Grafana",
        "Centralized Log Management with ELK Stack",
        "Secrets & Security Management with HashiCorp Vault",
        "DevSecOps & Automated Vulnerability Scanning (SonarQube, Trivy)",
        "Cloud Cost Optimization & FinOps Best Practices",
        "High Availability, Load Balancing & Auto-Scaling",
        "Disaster Recovery (DR) & Automated Backup Strategies",
        "Chaos Engineering & Fault Injection Testing",
        "Cloud Storage & Database Management (S3, RDS, DynamoDB)",
      ],
      tools: [
        "AWS", "Microsoft Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform",
        "Ansible", "Jenkins", "GitHub Actions", "GitLab CI", "Prometheus", "Grafana",
        "Linux", "Bash", "Python", "Helm", "ArgoCD", "Nginx", "SonarQube", "ELK Stack",
        "HashiCorp Vault", "OpenTofu"
      ],
      toolCategorized: [
        {
          category: "Cloud Platforms",
          tools: [
            { name: "AWS" },
            { name: "Microsoft Azure" },
            { name: "Google Cloud" },
          ],
        },
        {
          category: "Containers & Orchestration",
          tools: [
            { name: "Docker" },
            { name: "Kubernetes" },
            { name: "Helm" },
            { name: "ArgoCD" },
          ],
        },
        {
          category: "IaC & Automation",
          tools: [
            { name: "Terraform" },
            { name: "Ansible" },
            { name: "HashiCorp Vault" },
            { name: "OpenTofu" },
          ],
        },
        {
          category: "CI/CD & Code Quality",
          tools: [
            { name: "Jenkins" },
            { name: "GitHub Actions" },
            { name: "GitLab CI" },
            { name: "SonarQube" },
          ],
        },
        {
          category: "Observability & Linux",
          tools: [
            { name: "Prometheus" },
            { name: "Grafana" },
            { name: "ELK Stack" },
            { name: "Linux" },
            { name: "Bash" },
            { name: "Python" },
            { name: "Nginx" },
          ],
        },
      ],
      projectCategories: [
        "1. Highly Available Multi-AZ AWS Infrastructure",
        "2. Microservice Kubernetes Cluster Deployment",
        "3. Zero-Downtime Automated CI/CD Pipeline",
        "4. Terraform Infrastructure as Code Automation",
        "5. Full-Stack Multi-Tier Cloud Deployment",
        "6. GitOps Continuous Delivery with ArgoCD & Helm",
        "7. Enterprise Cloud Security & Secrets Management",
        "8. Multi-Cloud Hybrid Architecture (AWS & Azure)",
        "9. Centralized Logging & Distributed Tracing with ELK",
        "10. Serverless Event-Driven Microservices Architecture",
      ],
      projectsList: [
        {
          title: "Highly Available Multi-AZ AWS Infrastructure",
          description: "Provision auto-scaling EC2 instances behind Application Load Balancers with multi-region VPC peering and RDS database replication.",
          tech: "AWS",
          iconSlug: "amazonwebservices"
        },
        {
          title: "Microservice Kubernetes Cluster Deployment",
          description: "Orchestrate multi-container microservices on EKS/Kubernetes with ingress controllers, secret management, and auto-healing pods.",
          tech: "Kubernetes",
          iconSlug: "kubernetes"
        },
        {
          title: "Zero-Downtime Automated CI/CD Pipeline",
          description: "Configure GitHub Actions and Jenkins pipelines for continuous testing, automated Docker image builds, and blue-green serverless deployments.",
          tech: "GitHub Actions",
          iconSlug: "githubactions"
        },
        {
          title: "Terraform Infrastructure as Code Automation",
          description: "Write modular Terraform scripts to programmatically manage multi-environment cloud resources with state locking in S3.",
          tech: "Terraform",
          iconSlug: "terraform"
        },
        {
          title: "Full-Stack Multi-Tier Cloud Deployment",
          description: "Deploy an enterprise web app with Prometheus and Grafana telemetry dashboards monitoring CPU, memory, and application latency metrics.",
          tech: "Grafana",
          iconSlug: "grafana"
        },
        {
          title: "GitOps Continuous Delivery with ArgoCD & Helm",
          description: "Automate Kubernetes cluster synchronization from Git repositories using ArgoCD declarative state management and Helm package charts.",
          tech: "ArgoCD",
          iconSlug: "argocd"
        },
        {
          title: "Enterprise Cloud Security & Secrets Management",
          description: "Integrate HashiCorp Vault with AWS IAM and Kubernetes to inject dynamic short-lived credentials and rotate API tokens automatically.",
          tech: "HashiCorp Vault",
          iconSlug: "vault"
        },
        {
          title: "Multi-Cloud Hybrid Architecture (AWS & Azure)",
          description: "Connect AWS VPCs with Azure Virtual Networks using IPsec VPN tunnels, deploying distributed container workloads across cloud providers.",
          tech: "Microsoft Azure",
          iconSlug: "azure"
        },
        {
          title: "Centralized Logging & Distributed Tracing with ELK",
          description: "Ingest cluster logs with Fluentbit, ElasticSearch, and Kibana, alongside OpenTelemetry distributed tracing to diagnose microservice bottlenecks.",
          tech: "Docker",
          iconSlug: "docker"
        },
        {
          title: "Serverless Event-Driven Microservices Architecture",
          description: "Architect an event-driven serverless system on AWS Lambda, API Gateway, SQS, and DynamoDB for cost-effective pay-per-execution scaling.",
          tech: "Python",
          iconSlug: "python"
        }
      ],
      capstone:
        "Design, build, and deploy an end-to-end automated multi-tier cloud infrastructure with full CI/CD and observability.",
      certifications: ["Certified Cloud Engineer", "DevOps Practitioner"],
      placementSupport: ["Resume & LinkedIn optimization", "Mock technical interviews", "Hiring partner referrals", "Portfolio showcase"],
      careerRoles: ["Cloud Engineer", "DevOps Engineer", "Site Reliability Engineer (SRE)", "Infrastructure Engineer"],
      curriculumHtmlUrl: "/Programs/curriculum/cloud-computing-devops/index.html",
      price: 85000,
      gstRate: 18,
      gstText: "+ 18% GST",
      unfairAdvantage: {
        headline: "The Unfair Advantage: Why Top Engineers Choose Empowers",
        subheadline: "Most DevOps courses stop at basic command-line syntax. We built an enterprise-grade cloud sandbox where you architect, containerize, and automate real production infrastructure.",
        items: [
          {
            title: "Multi-Cloud Sandbox Labs",
            desc: "Dedicated AWS and Azure cloud sandboxes with real VPCs, IAM policies, and live Kubernetes clusters.",
            badge: "Live Cloud Labs",
          },
          {
            title: "Production Infrastructure as Code",
            desc: "Learn real Terraform and GitHub Actions automation pipelines, not simulated toy deployments.",
            badge: "Production First",
          },
          {
            title: "Cloud & DevOps Tool Pass",
            desc: "Hands-on access to Docker, Kubernetes, Jenkins, Terraform, Vault, Prometheus, and Grafana stacks.",
            badge: "Enterprise Tooling",
          },
          {
            title: "100% Guaranteed Role-Matched Placement",
            desc: "180-day refund guarantee with targeted role and preferred location routing (Bengaluru, US Remote, GCC Hubs).",
            badge: "100% Placement Guarantee",
          },
        ],
      },
      careerMatrix: [
        {
          category: "Freshers",
          commitment: "100% Placement Guarantee within 180 Days",
          routing: "Minimum package commitment of ₹5 LPA.",
        },
        {
          category: "Experienced Professionals",
          commitment: "100% Placement Guarantee within 180 Days",
          routing: "Targeting 50%+ salary hike over current CTC.",
        },
        {
          category: "Location Routing",
          commitment: "Preferred Geography Matching",
          routing: "Bengaluru, Hyderabad, Pune, Chennai, US Remote, Other Locations.",
        },
      ],
      marketRealignment: [
        {
          stat: "78%",
          title: "Infrastructure Shift to Cloud & IaC",
          desc: "78% of modern engineering teams have transitioned fully to automated Kubernetes and Terraform infrastructure.",
        },
        {
          stat: "High Demand",
          title: "Top Cloud & SRE Recruiters",
          desc: "Infosys, Wipro, Accenture, Walmart, and Siemens actively hunt engineers with hands-on multi-cloud and CI/CD capabilities.",
        },
        {
          stat: "Live Deployments",
          title: "Proof of Capability Over Degree",
          desc: "A verified repository of automated Terraform configurations and containerized clusters beats written certifications.",
        },
      ],
    },
  },
  {
    slug: "business-analyst-ai-program",
    tag: "Business Analyst",
    title: "Business Analyst and AI Program",
    goal: "Become the kind of engineer enterprises embed directly to ship AI solutions in business environments.",
    image: "/Programs/Business Analyst and Ai Program.png",
    certificate: "/certificates/Business Analyst and AI Program (2).png",
    format: "6 months · 26 weeks · ~600 hours · live online · mentor-led",
    badge: "Best Selling Program",
    price: 74999,
    gstRate: 18,
    gstText: "+ 18% GST",
    stack: ["Business Analysis", "AI Operations", "Data Analytics", "Requirements Engineering", "SQL"],
    focus: [
      "Bridge business strategy and AI technology by mastering data analytics, AI product management, and business intelligence.",
      "Analyze business operations and identify high-impact AI integration opportunities.",
      "Write advanced SQL queries and build interactive dashboards with Power BI / Tableau.",
      "Design AI product requirements and functional specifications for engineering teams.",
    ],
    details: {
      headline: "Bridge Business Strategy and AI Operations.",
      tagline: "Become the kind of analyst enterprises embed directly to ship AI solutions.",
      category: "Business Analyst",
      overview:
        "Become the kind of engineer enterprises embed directly to ship AI in the field. This program bridges business strategy, data analytics, and artificial intelligence, equipping you to translate complex business challenges into data-driven AI systems.",
      keyFeatures: [
        "Business intelligence & data analytics",
        "AI product management & prompt engineering",
        "SQL & Python for business decision making",
        "Process automation with AI tools",
        "Stakeholder communication & requirements analysis",
        "Real-world business case studies",
      ],
      learningOutcomes: [
        "Analyze business operations and identify high-impact AI opportunities",
        "Write complex SQL queries and analyze data with Python & Tableau/PowerBI",
        "Design AI product requirements and workflows for engineering teams",
        "Build interactive dashboards and executive data models",
        "Lead AI transformation projects in corporate environments",
      ],
      learningPath: [
        "Business Analysis Foundations",
        "SQL & Relational Databases",
        "Data Visualization",
        "Python for Business Analytics",
        "Generative AI for Analysts",
        "AI Product Requirements",
        "Business Case Studies",
      ],
      curriculum: [
        {
          title: "Business Analysis Foundations",
          lessons: [
            { title: "Role of Modern Business Analyst: Bridging Business Strategy and AI Engineering", duration: "Week 1" },
            { title: "Software Development Methodologies: Agile, Scrum, Kanban & Sprint Ceremonies", duration: "Week 1" },
            { title: "Stakeholder Management, Requirements Elicitation & Gap Analysis", duration: "Week 2" },
            { title: "Process Modeling: BPMN 2.0 Workflows, AS-IS vs. TO-BE State Mapping", duration: "Week 2" },
            { title: "Hands-on Lab: Business Architecture Transformation Blueprint for an E-Commerce Enterprise", duration: "Project" },
          ],
        },
        {
          title: "SQL & Relational Databases",
          lessons: [
            { title: "Relational Database Concepts: Tables, Primary/Foreign Keys & Schemas", duration: "Week 3" },
            { title: "Intermediate & Advanced SQL: Multi-Table JOINs, Subqueries & CTEs", duration: "Week 3" },
            { title: "Window Functions: RANK, DENSE_RANK, LEAD, LAG & Running Totals", duration: "Week 4" },
            { title: "Performance Optimization, Query Plans & Working with Big Data Warehouses (Snowflake)", duration: "Week 4" },
            { title: "Hands-on Lab: Extracting Critical Revenue & Customer Retention Insights from SQL", duration: "Project" },
          ],
        },
        {
          title: "Data Visualization",
          lessons: [
            { title: "Visual Analytics Principles: Cognitive Load, Chart Selection & Storytelling", duration: "Week 5" },
            { title: "Power BI Deep Dive: Power Query, Data Modeling, Star Schemas & DAX Measures", duration: "Week 5" },
            { title: "Tableau Deep Dive: Calculated Fields, Level of Detail (LOD) Expressions & Dual-Axis", duration: "Week 6" },
            { title: "Building Executive KPI Dashboards with Real-Time Interactivity and Drill-Downs", duration: "Week 6" },
            { title: "Hands-on Lab: Publishing a Multi-Page Executive Leadership Dashboard in Power BI", duration: "Project" },
          ],
        },
        {
          title: "Python for Business Analytics",
          lessons: [
            { title: "Python Fundamentals for Business Analysts (Variables, Lists, Dicts, Functions)", duration: "Week 7" },
            { title: "Data Cleaning & Transformation with Pandas and NumPy", duration: "Week 7" },
            { title: "Exploratory Data Analysis (EDA): Uncovering Correlations, Outliers & Trends", duration: "Week 8" },
            { title: "Automated Reporting: Exporting Dynamic Excel Sheets and PDF Summaries with Python", duration: "Week 8" },
            { title: "Hands-on Lab: Automated Customer Churn Risk Analysis & Predictive Cohort Segmentation", duration: "Project" },
          ],
        },
        {
          title: "Generative AI for Analysts",
          lessons: [
            { title: "GenAI Fundamentals: Prompt Engineering for Document Summarization & Research", duration: "Week 9" },
            { title: "Automating Requirements Gathering: Writing User Stories, BRDs & PRDs with ChatGPT/Claude", duration: "Week 9" },
            { title: "Synthesizing Unstructured Customer Feedback & Meeting Transcripts", duration: "Week 10" },
            { title: "No-Code Workflow Automation with Microsoft Power Automate & Zapier", duration: "Week 10" },
            { title: "Hands-on Lab: Building an Automated AI-Powered RFP & Requirements Synthesizer", duration: "Project" },
          ],
        },
        {
          title: "AI Product Requirements",
          lessons: [
            { title: "AI/ML Solution Lifecycle: Problem Framing, Data Feasibility & Model Evaluation", duration: "Week 11" },
            { title: "Writing Technical Specifications for Data Science and Engineering Teams", duration: "Week 11" },
            { title: "Defining Acceptance Criteria, Confusion Matrices & Business KPIs for AI Models", duration: "Week 12" },
            { title: "UI/UX Prototyping for AI-Powered Applications in Figma & Miro", duration: "Week 12" },
            { title: "Hands-on Lab: Drafting an End-to-End Product Requirements Document (PRD) for an AI Feature", duration: "Project" },
          ],
        },
        {
          title: "Business Case Studies",
          lessons: [
            { title: "Customer Lifetime Value (CLV) Calculation & RFM Segmentation", duration: "Week 13" },
            { title: "Financial Modeling for AI Initiatives: Build vs. Buy & ROI Calculations", duration: "Week 13" },
            { title: "A/B Testing Fundamentals: Hypothesis Testing, Sample Sizing & P-Value Interpretation", duration: "Week 14" },
            { title: "AI Governance, Risk Management, Data Privacy (GDPR) & Bias Mitigation", duration: "Week 14" },
            { title: "Capstone: Executive Boardroom Pitch Deck & End-to-End AI Business Case Presentation", duration: "Final" },
          ],
        },
      ],
      skills: [
        "Business Analysis & Strategic Problem Solving",
        "Requirements Engineering (BRD, FRD, SRS Documentation)",
        "Business Process Modeling & Notation (BPMN 2.0)",
        "Use Case Modeling & User Story Mapping",
        "Stakeholder Management & Cross-Functional Alignment",
        "Agile & Scrum Methodologies (Sprint Facilitation)",
        "Jira & Confluence Workflow Management",
        "Advanced SQL & Relational Database Querying",
        "Exploratory Data Analysis (EDA) & Data Cleansing",
        "Business Intelligence (BI) with Tableau",
        "Interactive Dashboarding with Microsoft Power BI",
        "Advanced Microsoft Excel, Financial Modeling & Pivot Tables",
        "Python for Business Analytics & Data Storytelling",
        "Pandas & NumPy Data Analysis",
        "Statistical Inference & Hypothesis Testing",
        "A/B Testing, Experimentation & Conversion Rate Optimization",
        "Generative AI Tools for Business Analysts (Prompt Engineering)",
        "AI Transformation Strategy & Digital Roadmaps",
        "AI ROI Feasibility & Build vs. Buy Cost Modeling",
        "Workflow Automation with AI & Power Automate",
        "Customer Lifetime Value (CLV) & Churn Analysis",
        "RFM Customer Segmentation & Cohort Analysis",
        "Executive Pitch Deck Design & Data-Driven Storytelling",
        "Data Governance, Privacy & Compliance (GDPR, DPDP)",
        "Risk Assessment & Ethical AI Decision Frameworks",
        "Market Research & Competitive Intelligence Analysis",
      ],
      tools: [
        "SQL", "MySQL", "PostgreSQL", "Tableau", "Power BI", "Excel",
        "Python", "Pandas", "NumPy", "Jira", "Confluence", "Trello",
        "ChatGPT", "Claude", "Notion", "Figma", "Lucidchart", "Snowflake",
        "Google Analytics", "Power Automate", "R"
      ],
      toolCategorized: [
        {
          category: "BI, SQL & Databases",
          tools: [
            { name: "SQL", iconSlug: "sql" },
            { name: "MySQL", iconSlug: "mysql" },
            { name: "PostgreSQL", iconSlug: "postgresql" },
            { name: "Tableau", iconSlug: "tableau" },
            { name: "Power BI", iconSlug: "powerbi" },
            { name: "Snowflake", iconSlug: "snowflake" },
          ],
        },
        {
          category: "Analytics & Programming",
          tools: [
            { name: "Excel", iconSlug: "excel" },
            { name: "Python", iconSlug: "python" },
            { name: "Pandas", iconSlug: "pandas" },
            { name: "NumPy", iconSlug: "numpy" },
            { name: "R", iconSlug: "r" },
            { name: "Google Analytics", iconSlug: "google analytics" },
          ],
        },
        {
          category: "AI & Automation",
          tools: [
            { name: "ChatGPT", iconSlug: "chatgpt" },
            { name: "Claude", iconSlug: "claude" },
            { name: "Power Automate", iconSlug: "power automate" },
          ],
        },
        {
          category: "Agile & Requirements Management",
          tools: [
            { name: "Jira", iconSlug: "jira" },
            { name: "Confluence", iconSlug: "confluence" },
            { name: "Trello", iconSlug: "trello" },
            { name: "Notion", iconSlug: "notion" },
            { name: "Figma", iconSlug: "figma" },
            { name: "Lucidchart", iconSlug: "lucidchart" },
          ],
        },
      ],
      projectCategories: [
        "1. Executive Financial & Sales BI Dashboard",
        "2. Customer Retention & Market Basket Analysis",
        "3. Enterprise AI Opportunity & ROI Audit",
        "4. End-to-End AI Transformation Business Proposal",
        "5. Supply Chain Optimization & Demand Forecasting",
        "6. Banking Fraud Risk Analysis & Compliance Reporting",
        "7. E-Commerce Product Funnel & Conversion Rate Optimization",
        "8. Healthcare Operations Patient Flow Simulation",
        "9. Automated AI Prompt Engineering & Workflow Pipeline",
        "10. Agile Product Requirements Document (PRD) & Sprint Backlog",
      ],
      projectsList: [
        {
          title: "Executive Financial & Sales BI Dashboard",
          description: "Connect SQL databases to Tableau and Power BI to build interactive revenue, customer churn, and profit dashboards for C-suite executive leadership.",
          tech: "Tableau",
          iconSlug: "tableau"
        },
        {
          title: "Customer Retention & Market Basket Analysis",
          description: "Use Python data libraries to mine transaction logs, uncover purchase affinities, and segment customer cohorts for targeted cross-selling campaigns.",
          tech: "Python",
          iconSlug: "python"
        },
        {
          title: "Enterprise AI Opportunity & ROI Audit",
          description: "Perform an operational workflow audit for an enterprise client to identify high-ROI automation targets and draft technical specifications.",
          tech: "Power BI",
          iconSlug: "powerbi"
        },
        {
          title: "End-to-End AI Transformation Business Proposal",
          description: "Deliver a comprehensive capstone business proposal detailing feasibility, cost-benefit analysis, AI model selection, and rollout timeline.",
          tech: "SQL",
          iconSlug: "mysql"
        },
        {
          title: "Supply Chain Optimization & Demand Forecasting",
          description: "Model seasonal inventory demand using time-series forecasting in Python and create real-time supply chain tracking dashboards in Power BI.",
          tech: "Pandas",
          iconSlug: "pandas"
        },
        {
          title: "Banking Fraud Risk Analysis & Compliance Reporting",
          description: "Formulate SQL queries to audit millions of financial transactions, identifying suspicious transaction patterns and generating AML compliance reports.",
          tech: "PostgreSQL",
          iconSlug: "postgresql"
        },
        {
          title: "E-Commerce Product Funnel & Conversion Rate Optimization",
          description: "Analyze web analytics and user drop-off funnels using Google Analytics and SQL to recommend UX improvements that increase checkout conversions.",
          tech: "Google Analytics",
          iconSlug: "googleanalytics"
        },
        {
          title: "Healthcare Operations Patient Flow Simulation",
          description: "Map hospital emergency department workflows, identify admission bottlenecks, and build interactive Tableau capacity planning models.",
          tech: "Excel",
          iconSlug: "excel"
        },
        {
          title: "Automated AI Prompt Engineering & Workflow Pipeline",
          description: "Create customized LLM prompt chains and automated workflows using ChatGPT, Claude, and Power Automate to accelerate business report generation.",
          tech: "OpenAI",
          iconSlug: "openai"
        },
        {
          title: "Agile Product Requirements Document (PRD) & Sprint Backlog",
          description: "Write comprehensive user stories, acceptance criteria, and technical PRDs in Jira and Confluence for an AI-powered enterprise SaaS feature.",
          tech: "Jira",
          iconSlug: "jira"
        }
      ],
      capstone:
        "Deliver an end-to-end AI transformation proposal and interactive BI dashboard for a real enterprise business model.",
      certifications: ["AI Business Analyst", "Certified Data & AI Specialist"],
      placementSupport: ["Resume & LinkedIn positioning", "Mock case interview rounds", "Direct corporate referrals"],
      careerRoles: ["Business Analyst", "AI Product Manager", "Data Analyst", "Strategy Consultant"],
      curriculumHtmlUrl: "/Programs/curriculum/business-analyst-and-ai-program/index.html",
      badge: "Best Selling Program",
      price: 74999,
      gstRate: 18,
      gstText: "+ 18% GST",
      unfairAdvantage: {
        headline: "The Unfair Advantage: Why Top Engineers Choose Empowers",
        subheadline: "Most business analyst courses teach outdated Excel slides. We train you on live data lakes, interactive BI dashboards, and AI product workflows that translate directly into enterprise business impact.",
        items: [
          {
            title: "Live Business Case Studies",
            desc: "Hands-on projects with enterprise sales, financial, and operational datasets from real Fortune 500 scenarios.",
            badge: "Real Enterprise Cases",
          },
          {
            title: "AI-Powered Business Intelligence",
            desc: "Master Tableau, Power BI, SQL, and generative AI prompt engineering to build automated boardroom dashboards.",
            badge: "Applied GenAI",
          },
          {
            title: "Business Analytics Pass",
            desc: "Full access to cloud BI tools, SQL querying environments, Jira, Confluence, and AI workflow tools.",
            badge: "Enterprise Tools",
          },
          {
            title: "100% Guaranteed Role-Matched Placement",
            desc: "180-day refund guarantee with targeted role and preferred location routing (Bengaluru, US Remote, GCC Hubs).",
            badge: "100% Placement Guarantee",
          },
        ],
      },
      careerMatrix: [
        {
          category: "Freshers",
          commitment: "100% Placement Guarantee within 180 Days",
          routing: "Minimum package commitment of ₹5 LPA.",
        },
        {
          category: "Experienced Professionals",
          commitment: "100% Placement Guarantee within 180 Days",
          routing: "Targeting 50%+ salary hike over current CTC.",
        },
        {
          category: "Location Routing",
          commitment: "Preferred Geography Matching",
          routing: "Bengaluru, Mumbai, Gurgaon, Hyderabad, Remote, Other Locations.",
        },
      ],
      marketRealignment: [
        {
          stat: "85%",
          title: "AI Embedded in Analytics",
          desc: "85% of enterprises are actively embedding AI into their operational analytics and executive decision-making pipelines.",
        },
        {
          stat: "High Demand",
          title: "Top Consulting & Tech Recruiters",
          desc: "McKinsey, Accenture, Deloitte, Fractal, and Tiger Analytics actively recruit analysts who speak both business and AI.",
        },
        {
          stat: "Live Dashboards",
          title: "Proof of Capability Over Degree",
          desc: "Live interactive Tableau/Power BI portfolios and actionable PRDs impress hiring managers far more than paper degrees.",
        },
      ],
    },
  },
];

export const journey = [
  {
    title: "Enrollment & Orientation",
    body: "Current-role assessment, personalized target-offer mapping, legal guarantee agreement signed.",
  },
  { title: "Live Sessions", body: "Cohort-based, expert-led, live Q&A, code-alongs." },
  { title: "Weekly Assignments", body: "Graded, with direct mentor feedback." },
  { title: "Applied Projects", body: "Built around your own industry/domain where possible." },
  { title: "Portfolio Building", body: "GitHub profile, project showcase, case studies." },
  {
    title: "Positioning",
    body: "Resume, LinkedIn, and personal brand rebuilt around your new AI-relevant skill set.",
  },
  {
    title: "Interview Support",
    body: "Mock technical, system-design, and behavioral rounds until a better offer is secured.",
  },
];

export const guarantee = [
  {
    title: "Sign the Agreement",
    body: "Before you pay anything, you sign a legal agreement laying out the exact guarantee terms.",
  },
  {
    title: "Complete the Program",
    body: "Attend your live cohort, finish the applied projects, and work with your mentors.",
  },
  {
    title: "Get Placement Support",
    body: "Use the full 180-day window for resume positioning, mock interviews, and introductions to hiring partners.",
  },
  {
    title: "Land a Better Offer",
    body: "Backed by the mentoring, projects, and placement support, you accept an offer that beats your starting role in pay, title, or scope.",
  },
  {
    title: "If Not, Claim Your Refund",
    body: "If you don't have a better offer than the one you started with, within 180 days, you get a full refund, exactly as agreed in writing before you paid.",
  },
  {
    title: "Achieve Career Success",
    body: "Graduate with production-ready AI skills, a strong portfolio, interview confidence, and lifelong career support to accelerate your professional growth.",
  },
];

import type { AlumniOutcome } from "@/components/Alumni";

export const outcomes: AlumniOutcome[] = [
  {
    name: "Zaid",
    prior: "AIML Learner",
    role: "Data Scientist",
    company: "VMware",
    salary: 28,
    quote:
      "I have Done my AIML job guarantee at empowers academy, I got placed at VMware as a data scientist , I got a good training from pavan sir and Shruti mam for the training, and special to Abhishek sir and Yashwant sir for helping me in this journey. I'm Always Thankful to Empowers academy.",
  },
  {
    name: "Lisha",
    prior: "AIML Learner",
    role: "AI/ML Professional",
    company: "Placed Student",
    salary: 26,
    quote:
      "One of the best academies for AI and Machine Learning training. The trainers explain concepts very clearly with real-time projects. They also provide excellent placement assistance and interview preparation.",
  },
  {
    name: "Thanuj",
    prior: "AIML Learner",
    role: "AI/ML Professional",
    company: "Placed Student",
    salary: 29,
    quote:
      "Excellent training institute for AI and Machine Learning. The teaching quality is very good and the placement assistance is really helpful for freshers.",
  },
  {
    name: "Karthik Achyutha",
    prior: "AIML Learner",
    role: "AI/ML Professional",
    company: "Placed Student",
    salary: 27,
    quote:
      "Best institute for AI/ML training. The faculty is highly knowledgeable and the classes are very interactive. They guide students step-by-step and provide strong placement support.",
  },
  {
    name: "Ramesh",
    prior: "AIML Learner",
    role: "AI/ML Professional",
    company: "Placed Student",
    salary: 19,
    quote:
      "This academy helps us to get job 100% , i hot placement in this aiml job guarantee program, with in 5 months of training I have placed , best place to learn aiml",
  },
  {
    name: "Yashaswini",
    prior: "AIML Learner",
    role: "AI/ML Professional",
    company: "Placed Student",
    salary: 30,
    quote:
      "The institute stands out for its well-structured curriculum, which covers everything from the fundamentals of artificial intelligence to more advanced concepts like machine learning, deep learning, and real-world applications. The trainers are knowledgeable and approachable, making even complex topics easier to understand. What I appreciated most was the hands-on learning approach—regular projects, assignments, and practical sessions helped reinforce the concepts effectively.",
  },
  {
    name: "Chandana C.H",
    prior: "AIML Learner",
    role: "AI/ML Professional",
    company: "Placed Student",
    salary: 21,
    quote:
      "If you're looking to upskill, Empowers Academy is the place to be. Great trainers, hands-on learning, and they actually deliver on their placement promises. I felt supported from day one until I landed my role. 10/10!",
  },
  {
    name: "Prashanth Gowda",
    prior: "AIML Learner",
    role: "AI/ML Professional",
    company: "Placed Student",
    salary: 22,
    quote:
      "AI ML advanced program is best in today job and best placement for working professional",
  },
  {
    name: "Rakshith Naik",
    prior: "AIML Learner",
    role: "AI/ML Professional",
    company: "IBM",
    salary: 20,
    quote:
      "Got placed in IBM. Thank you Sir for all your support",
  },
  {
    name: "Kavya Iyer",
    prior: "Backend Engineer",
    role: "Data Engineer",
    company: "Swiggy",
    salary: 18,
    quote:
      "I'd only ever worked on backend systems. The data engineering track gave me the pipeline and warehousing skills I was missing.",
  },
  {
    name: "Rohan Das",
    prior: "Systems Engineer",
    role: "Robotics Engineer",
    company: "TCS",
    salary: 25,
    quote:
      "Systems engineering was close to robotics but not quite there. The computer vision module was the bridge I needed.",
  },
  {
    name: "Meera Nair",
    prior: "Product Manager",
    role: "AI Product Manager",
    company: "Zomato",
    salary: 26,
    quote:
      "I didn't want to become an engineer, I wanted to understand AI deeply enough to lead it. This program gave me exactly that balance.",
  },
];

export const stats = [
  { value: 5000, suffix: "+", label: "Professionals Trained" },
  { value: 50, suffix: "+", label: "Expert Trainers" },
  { value: 350, suffix: "+", label: "Hiring Partner Companies" },
  { value: 4.9, suffix: "/5", label: "Client Rating", decimals: 1 },
];

export const mentors = [
  {
    name: "Ms. Thanushree B R",
    focus: "AI & Machine Learning",
    title: "AI & Machine Learning Mentor",
    aboutTitle: "AI & Machine Learning Mentor",
    specialization: "Applying ML algorithms to solve real-world security problems, including image processing and predictive modeling",
    initials: "TH",
    image: "/mentors/Thanushree.jpeg",
    bio: "Thanushree is a results-driven AI and Machine Learning mentor with expertise in Python, TensorFlow, and Scikit-learn. She has successfully built intelligent systems for fake currency detection and phishing website classification.",
    techStack: ["Python", "TensorFlow", "Scikit-learn", "OpenCV", "Pandas"],
    experience: "Computer Science & AI Specialist",
  },
  {
    name: "Ms. Spoorthy S G",
    focus: "AI & Machine Learning",
    title: "Software Engineer & AI/ML Mentor",
    aboutTitle: "Software Engineer & AI/ML Mentor",
    specialization: "Building scalable AI-powered applications using Python, Machine Learning, and REST APIs",
    initials: "SP",
    image: "/mentors/Spoorthy.jpeg",
    bio: "Spoorthy is a Software Engineer with a passion for developing scalable AI solutions. She specializes in Computer Vision (YOLOv8, OpenCV), Natural Language Processing, and building robust backends with FastAPI and Python.",
    techStack: ["Python", "FastAPI", "Machine Learning", "Computer Vision", "React.js"],
    experience: "Software Engineer & AI/ML Specialist",
  },
  {
    name: "Mr. Parikshith T T",
    focus: "Full Stack Engineer",
    title: "Full Stack Engineer & Product Mentor",
    aboutTitle: "Full Stack Engineer & Product Mentor",
    specialization: "Shipping complete, deployable AI-powered web applications end to end",
    initials: "PT",
    image: "/mentors/parikshith.png",
    bio: "Parikshith brings production engineering discipline to the program, helping learners turn AI prototypes into complete, deployable products. He covers everything from API design and authentication to deployment, so learners graduate with a real portfolio, not just notebooks.",
    techStack: ["React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS"],
    experience: "",
  },
];

// Rendered visibly on the homepage AND emitted as FAQPage schema. Google
// requires FAQ markup to match on-page content, so these two must stay in
// sync — both read from this array. Every answer here is grounded in facts
// already stated elsewhere in this file; do not add claims (pricing, batch
// dates, placement rates) that the business hasn't confirmed.
export const faqs = [
  {
    q: "How does the 180 day better offer guarantee actually work?",
    a: "Before you pay anything, you sign a legal agreement that lays out the exact guarantee terms in writing. You then complete the program attending your live cohort, finishing the applied projects, and working with your mentors and use the full 180 day window for placement support. If you don't have a better offer than the one you started with within 180 days, you get a full refund, exactly as agreed in writing before you paid.",
  },
  {
    q: "What counts as a \"better offer\"?",
    a: "An offer that beats the role you started with in pay, title, or scope. The specific terms are defined in the legal agreement you sign before you pay, so there is no ambiguity about what qualifies.",
  },
  {
    q: "Can I join if I don't come from a technical or coding background?",
    a: "Yes. The programs are open to experienced professionals, career switchers, non-tech backgrounds, and freshers alike  not just engineers. The Apex AI Programme begins with a pre-cohort diagnostic that places you into either a Beginner or an Advanced stream, so you start at the right level rather than a one size fitsall pace.",
  },
  {
    q: "Are the classes live, or pre-recorded videos?",
    a: "Every session is live, online, and mentor led this is not a pre recorded video library. Cohorts are deliberately kept small so you get live Q&A, code alongs, weekly graded assignments with direct mentor feedback, and code reviews.",
  },
  {
    q: "How long is the program and how much time does it take?",
    a: "All programs run for 6 months. The Apex AI Programme is 26 weeks and roughly 600 hours, structured around a weekly rhythm of live sessions, assignments, and mentor feedback.",
  },
  {
    q: "What will I actually learn?",
    a: "The Apex AI Programme covers a production grade path from Python and Machine Learning through Deep Learning, Generative AI, Agentic AI, and MLOps, ending in a capstone. You work with the real toolchain  PyTorch, Hugging Face, LangChain, CrewAI, LangGraph, Docker, AWS, and MLflow and ship a project in every module rather than only studying theory.",
  },
  {
    q: "Do I finish with something I can show in interviews?",
    a: "Yes. Projects are built around your own industry or domain where possible, and you graduate with a GitHub portfolio of shipped work plus an individual, production ready capstone system presented at Demo Day. The curriculum is interview focused throughout rather than bolted on at the end.",
  },
  {
    q: "What placement support is included?",
    a: "A career launch track that covers resume and LinkedIn positioning rebuilt around your new AI skill set, mock technical, system design, and behavioral interview rounds, Demo Day in front of hiring partners, and introductions to the careers team continuing until a better offer is secured within the 180 day window.",
  },
  {
    q: "What certifications do I receive?",
    a: "Cloud Computing & DevOps,Cybersecurity & Ethical hacking (CEH V13 AI),Business Analyst and Ai Program,PG Executive Agentic AI & Generative AI,AIML Full stack engineering program.",
  },
  {
    q: "What does it cost?",
    a: "Fees depend on the program and the stream you're placed into. Request a callback and an advisor will walk you through the current pricing and the guarantee agreement  with no obligation to enrol.",
  },
  {
    q: "Where are you located?",
    a: "Empowers Academy is based at BMTC Complex, Old Madiwala, Kuvempu Nagar, Stage 2, BTM Layout, Bengaluru, Karnataka 560068. The programs themselves run live online, so you can join from anywhere in India.",
  },
  {
    q: "What happens after I graduate?",
    a: "You keep lifetime access to the alumni community after your 180 day window ends, along with ongoing access to updated curriculum as the AI landscape shifts, alumni meetups, direct introductions to hiring partners through the referral network, and continued access to mentors for career questions even after placement.",
  },
];

export const community = {
  heading: "More Than a Program, A Career-Long Network",
  points: [
    "Lifetime access to the alumni community after your 180-day window ends",
    "Ongoing access to updated curriculum as the AI landscape shifts",
    "Alumni meetups and networking sessions",
    "Direct introductions to hiring partners through the alumni referral network",
    "Continued access to mentors for career questions, even after placement",
  ],
};

export const brochure = {
  heading: "Want the Full Program Breakdown?",
  body:
    "Download the Empowers Academy brochure for complete curriculum, mentor, and format details no obligation.",
  button: "Download Brochure",
};

export const contactBar = {
  text: "Not sure which program fits your career?",
  phone: "+91 81518 76077",
  whatsapp: "918151876077",
  cta: "Request a Call",
};

export type FooterLink = { label: string; href?: string };

export const footer = {
  columns: [
    {
      title: "Programs",
      links: [
        { label: "Cloud Computing & DevOps", href: "/programs/cloud-computing-devops" },
        { label: "Cybersecurity & Ethical hacking (CEH V13 AI)", href: "/programs/cybersecurity-ceh-v13" },
        { label: "Business Analyst and Ai Program", href: "/programs/business-analyst-ai-program" },
        { label: "PG Executive Agentic AI & Generative AI", href: "/programs/pg-executive-agentic-ai-generative-ai" },
        { label: "AIML Full stack engineering program", href: "/programs/the-apex-ai-programme" },
      ] as FooterLink[],
    },
    {
      title: "Company",
      links: [
        { label: "Why Empowers", href: "#why" },
        { label: "Trainers", href: "#mentors" },
        { label: "The Guarantee", href: "#guarantee" },
        { label: "FAQ", href: "#faq" },
        { label: "Contact", href: "#footer" },
      ] as FooterLink[],
    },
    {
      title: "Resources",
      links: [
        {
          label: "How to Build a RAG Pipeline with LangChain and Pinecone",
          href: "/resources/how-to-build-a-rag-pipeline-with-langchain-and-pinecone",
        },
        {
          label: "The Ultimate AI Engineer Interview Playbook",
          href: "/resources/ai-engineer-interview-playbook",
        },
        {
          label: "Structuring Your Resume to Beat ATS Systems in Tech",
          href: "/resources/structuring-your-resume-to-beat-ats-systems",
        },
      ] as FooterLink[],
    },
  ],
  contact: {
    phone: "+91 81518 76077",
    whatsapp: "918151876077",
    email: "contact@empowersacademy.com",
    address:
      "BMTC Complex, Old Madiwala, Kuvempu Nagar, Stage 2, BTM Layout, Bengaluru, Karnataka 560068",
  },
  hours: [
    "Mon–Fri 9:00 AM–8:00 PM",
    "Sat 9:00 AM–6:00 PM",
    "Sun 9:00 AM–5:00 PM",
  ],
  copyright: "© 2024–2026 Empowers Academy. All rights reserved.",
  legalLinks: ["Terms and Conditions", "Privacy Policy"],
};

export const about = {
  eyebrow: "About Empowers Academy",
  heading: "Built to get you a better offer, not just a certificate",
  paragraphs: [
    "Empowers Academy runs live, mentor led AI programs for experienced professionals, career switchers, and people from non-tech backgrounds. Every cohort is small and applied, taught by practitioners who build AI systems for a living, not lecturers reading slides.",
    `We're powered by ${auth.poweredBy} (${auth.poweredBySub}), and every program is backed by a legal, signed 180-day better-offer guarantee before you pay a rupee, so our incentives are the same as yours: you landing a better role.`,
  ],
  teamEyebrow: "The team behind the cohorts",
  teamHeading: "Meet the people teaching you",
  teamBody:
    "The mentors leading every track, in one place. Scroll through to see who you'll actually be learning from.",
};
