// Long-form articles served at /resources/<slug>. These exist to rank for
// informational, top-of-funnel queries ("how to build a rag pipeline", "ai
// engineer interview questions") that a landing page can never reach — the
// reader arrives for the answer, not the course.
//
// Content is stored as typed blocks rather than raw HTML so nothing
// unescaped ever reaches the DOM.

// image/table/embed added for the CMS's Blog rich text editor (lib/services/blogService.ts,
// components/admin/RichTextEditor.tsx) — additive, existing articles below are unaffected.
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; code: string }
  | { type: "callout"; text: string }
  | { type: "image"; src: string; alt?: string }
  | { type: "table"; rows: string[][] }
  | { type: "embed"; url: string };

export type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  readingTime: string;
  datePublished: string; // ISO 8601
  dateModified: string;
  keywords: string[];
  blocks: Block[];
};

export const articles: Article[] = [
  {
    slug: "how-to-build-a-rag-pipeline-with-langchain-and-pinecone",
    title: "How to Build a RAG Pipeline with LangChain and Pinecone",
    description:
      "A practical, end-to-end walkthrough of Retrieval-Augmented Generation: chunking, embeddings, vector storage in Pinecone, retrieval with LangChain, and the failure modes nobody warns you about.",
    category: "Engineering",
    readingTime: "11 min read",
    datePublished: "2026-05-18",
    dateModified: "2026-07-13",
    keywords: [
      "RAG pipeline",
      "LangChain tutorial",
      "Pinecone vector database",
      "retrieval augmented generation",
      "LLM application development",
      "embeddings",
      "chunking strategy",
    ],
    blocks: [
      {
        type: "p",
        text: "Retrieval-Augmented Generation is the most common way production teams give a language model access to knowledge it was never trained on — internal documentation, a product catalogue, last quarter's support tickets. The concept is simple: before you ask the model a question, you go and fetch the most relevant passages from your own data, and you paste them into the prompt. The model answers from what you gave it rather than from memory.",
      },
      {
        type: "p",
        text: "The concept is simple. Getting it to work reliably is not. Most RAG systems that fail in production don't fail at the model — they fail at retrieval, and the model faithfully answers using the wrong context it was handed. This walkthrough builds a working pipeline with LangChain and Pinecone, then spends real time on the parts that break.",
      },

      { type: "h2", text: "The four stages of a RAG pipeline" },
      {
        type: "p",
        text: "Every RAG system, no matter how elaborate, is these four stages. Understanding them as distinct problems is what lets you debug the thing later.",
      },
      {
        type: "ol",
        items: [
          "Ingestion — load your source documents and split them into chunks small enough to be individually meaningful.",
          "Embedding — convert each chunk into a vector, a list of numbers that encodes its meaning.",
          "Storage & retrieval — put those vectors in a database that can find the nearest neighbours to a query vector, fast.",
          "Generation — hand the retrieved chunks to the model as context, along with the user's actual question.",
        ],
      },

      { type: "h2", text: "Stage 1: Chunking is where most RAG systems are lost" },
      {
        type: "p",
        text: "It is tempting to treat chunking as a formality split every 1,000 characters and move on. This is the single most common reason a RAG system gives vague, unhelpful answers. If you split mid-sentence, or separate a table from its heading, or break a procedure away from the paragraph explaining when to use it, you have produced chunks that are individually meaningless. No amount of retrieval sophistication recovers from that.",
      },
      {
        type: "p",
        text: "Chunk on semantic boundaries wherever the format allows. Markdown headers, document sections, and paragraph breaks are all better split points than a raw character count. Use overlap so that a thought spanning a boundary survives in at least one chunk.",
      },
      {
        type: "code",
        code: `from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=120,
    # Try to split on the most meaningful boundary available,
    # falling back to weaker ones only when necessary.
    separators=["\\n## ", "\\n### ", "\\n\\n", "\\n", ". ", " "],
)

chunks = splitter.split_documents(documents)`,
      },
      {
        type: "callout",
        text: "Rule of thumb: read five random chunks out loud. If a chunk doesn't make sense on its own, your retriever can't make sense of it either.",
      },

      { type: "h2", text: "Stage 2: Embeddings" },
      {
        type: "p",
        text: "An embedding model turns text into a vector positioned so that semantically similar text lands nearby. This is what lets a query like \"how do I cancel\" retrieve a passage titled \"Terminating your subscription\" — the words don't overlap at all, but the meanings do.",
      },
      {
        type: "p",
        text: "The critical, non-negotiable rule: you must embed your queries with the same model you used to embed your documents. Mixing embedding models produces vectors in incompatible spaces, and your retrieval quietly becomes random. If you upgrade your embedding model, you must re-embed your entire corpus.",
      },

      { type: "h2", text: "Stage 3: Storing and retrieving with Pinecone" },
      {
        type: "p",
        text: "Pinecone is a managed vector database — it handles the approximate-nearest-neighbour indexing so you don't build it yourself. Create an index whose dimension matches your embedding model's output, then upsert your chunks.",
      },
      {
        type: "code",
        code: `from langchain_pinecone import PineconeVectorStore
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

vector_store = PineconeVectorStore.from_documents(
    documents=chunks,
    embedding=embeddings,
    index_name="company-docs",
)

# Retrieve more than you need, then narrow it down.
retriever = vector_store.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 8},
)`,
      },
      {
        type: "p",
        text: "Note the k value. Retrieving a single best chunk feels efficient and is usually a mistake the right answer is often spread across two or three passages. Retrieve generously, then use a reranker or let the model sift. Retrieval is cheap; being wrong is expensive.",
      },

      { type: "h2", text: "Stage 4: Generation, and the prompt that prevents lies" },
      {
        type: "p",
        text: "Now you assemble the prompt. The most important line in the entire pipeline is the instruction that tells the model what to do when the retrieved context does not contain the answer. Without it, the model will cheerfully fall back on its training data and invent something plausible — and your users will have no way to tell the difference.",
      },
      {
        type: "code",
        code: `from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("""
Answer the question using ONLY the context below.
If the context does not contain the answer, say
"I don't have that information" do not guess.
Cite the source of each claim you make.

Context:
{context}

Question: {question}
""")`,
      },

      { type: "h2", text: "The failure modes nobody warns you about" },
      { type: "h3", text: "Retrieval looks fine, answers are still wrong" },
      {
        type: "p",
        text: "Log the retrieved chunks for every query in development. Almost always, the problem is visible immediately: the model was handed the wrong passages and answered them correctly. You have a retrieval bug, not a model bug. Teams waste weeks tuning prompts to fix what is actually a chunking problem.",
      },
      { type: "h3", text: "Semantic search misses exact terms" },
      {
        type: "p",
        text: "Embeddings capture meaning, which means they are surprisingly bad at exact identifiers — error codes, SKUs, function names, part numbers. A user searching for \"ERR_4021\" may get passages that are semantically about errors but never mention that code. The fix is hybrid search: combine dense vector similarity with old fashioned keyword matching, and merge the results.",
      },
      { type: "h3", text: "Stale data" },
      {
        type: "p",
        text: "Your vector store is a copy. When the source document changes, the embedding does not — and your system confidently serves last month's refund policy. Plan for re-indexing from the beginning, and store a document ID and version on every chunk's metadata so you can update in place rather than rebuilding the whole index.",
      },

      { type: "h2", text: "Evaluate, or you're guessing" },
      {
        type: "p",
        text: "The hardest discipline in RAG is refusing to judge quality by vibes. Build a small evaluation set — thirty to fifty real questions with known correct answers — before you start tuning. Then measure two things separately:",
      },
      {
        type: "ul",
        items: [
          "Retrieval quality: did the correct passage appear in the retrieved chunks at all? If not, no prompt can save you.",
          "Answer quality: given the correct passage, did the model actually use it faithfully and without embellishment?",
        ],
      },
      {
        type: "p",
        text: "Separating these two numbers tells you where to spend your effort. Almost every team that skips this step ends up optimising the wrong half of the system.",
      },

      { type: "h2", text: "Where to go from here" },
      {
        type: "p",
        text: "A working RAG pipeline is roughly a hundred lines of code. A reliable one is an ongoing engineering discipline — chunking strategy, hybrid retrieval, reranking, evaluation harnesses, and re-indexing pipelines. That gap between \"works in a notebook\" and \"survives real users\" is exactly the gap that separates a tutorial from a production AI engineer.",
      },
    ],
  },

  {
    slug: "ai-engineer-interview-playbook",
    title: "The Ultimate AI Engineer Interview Playbook",
    description:
      "What AI engineering interviews actually test in 2026 the five rounds, the questions that separate candidates, and how to talk about projects so they land.",
    category: "Careers",
    readingTime: "13 min read",
    datePublished: "2026-06-02",
    dateModified: "2026-07-13",
    keywords: [
      "AI engineer interview questions",
      "machine learning interview preparation",
      "LLM interview",
      "MLOps interview",
      "AI engineer career",
      "ML system design",
    ],
    blocks: [
      {
        type: "p",
        text: "AI engineering interviews have changed faster than the advice about them. A lot of preparation material still assumes you'll be asked to derive backpropagation by hand or explain the bias-variance tradeoff for twenty minutes. Some teams still do that. Most have moved on, because the job has moved on: companies are hiring people who can ship systems that use models, not people who can recite how models work.",
      },
      {
        type: "p",
        text: "Here is what the loop actually looks like now, and what each round is really measuring.",
      },

      { type: "h2", text: "Round 1: The screen can you explain your own work?" },
      {
        type: "p",
        text: "A recruiter or hiring manager walks through your resume. This round is almost entirely about whether your projects are real. Interviewers have read hundreds of resumes claiming \"built an LLM-powered chatbot,\" and they have learned to find the bottom of that claim in about four minutes.",
      },
      {
        type: "p",
        text: "The tell is always specificity. Candidates who actually built the thing know why they chose a 800-token chunk size, what broke when they didn't, and what the latency was. Candidates who followed a tutorial know that they \"used LangChain.\" Prepare by writing down, for every project on your resume: what the hardest decision was, what you tried first that failed, and what you'd do differently now.",
      },
      {
        type: "callout",
        text: "If you cannot name something that went wrong in a project, the interviewer will conclude you did not build it. Failure detail is the strongest possible proof of authorship.",
      },

      { type: "h2", text: "Round 2: Coding Python, data manipulation, and one algorithm" },
      {
        type: "p",
        text: "This is less brutal than a pure software-engineering loop. You will rarely be asked to invert a binary tree. You will very often be asked to manipulate data competently under mild time pressure: parse a messy file, reshape a dataframe, deduplicate records, compute a metric grouped by a key.",
      },
      {
        type: "ul",
        items: [
          "Be genuinely fluent in Python comprehensions, generators, dictionaries, and the standard library.",
          "Know pandas well enough that you don't fight it: groupby, merge, pivot, and handling missing values.",
          "Expect one classic algorithm question, usually easy-to-medium. Arrays, hashmaps, and strings dominate.",
          "Write code that runs. A working brute-force solution beats an elegant broken one, every single time.",
        ],
      },

      { type: "h2", text: "Round 3: ML fundamentals  narrower than you fear, deeper than you hope" },
      {
        type: "p",
        text: "You do not need to derive the transformer attention equation from scratch. You do need to reason about models the way an engineer reasons about a system: what breaks, why, and how you'd know. The questions that separate candidates are almost always diagnostic rather than definitional.",
      },
      {
        type: "p",
        text: "Weak questions ask \"what is overfitting?\" Strong questions ask \"your model gets 99% training accuracy and 60% test accuracy — walk me through what you check, in order.\" Prepare for the second kind.",
      },
      {
        type: "ul",
        items: [
          "Your model performs well offline and badly in production. What are the candidate explanations, and how do you distinguish them?",
          "Your dataset is 98% one class. What does accuracy tell you, and what would you measure instead?",
          "Why might a model that was fine last quarter be degrading now, with no code change?",
          "When would you not use a deep learning model for a problem?",
        ],
      },

      { type: "h2", text: "Round 4: LLM and GenAI depth — the round that's new" },
      {
        type: "p",
        text: "This is the round that didn't exist three years ago and now often decides the offer. It tests whether you have built with language models or only used them.",
      },
      { type: "h3", text: "Questions you should be able to answer cold" },
      {
        type: "ul",
        items: [
          "When do you choose RAG over fine-tuning, and when is neither the right answer?",
          "The model is hallucinating in production. Give me four distinct causes and how you'd rule each one out.",
          "How do you evaluate a system whose output is free-form text and has no single correct answer?",
          "What is the context window actually costing you in latency, in money, and in accuracy?",
          "How would you stop a customer facing agent from taking a destructive action?",
        ],
      },
      {
        type: "p",
        text: "That last question increasingly matters. As agentic systems move into production, teams are acutely aware that a model with tool access can do real damage. Candidates who have thought about guardrails, human-in-the-loop approval, and blast-radius limits stand out sharply from those who have only chained prompts together.",
      },

      { type: "h2", text: "Round 5: System design — the highest-leverage round" },
      {
        type: "p",
        text: "\"Design a system that answers customer questions from our documentation.\" \"Design a recommendation service for 10 million users.\" This round has the widest scoring spread of any, which means it's where preparation pays the most.",
      },
      {
        type: "p",
        text: "The mistake nearly every candidate makes is starting with the model. Strong candidates start with the problem and spend the first several minutes refusing to design anything:",
      },
      {
        type: "ol",
        items: [
          "Clarify the requirement. Who uses this? How many? How fast must it respond? What is the cost of a wrong answer?",
          "Define success before architecture. What metric tells you this works? How will you measure it in production, not just offline?",
          "Sketch the data path first where does data come from, how does it get processed, where does it live.",
          "Only now, choose the model. And justify why a simpler approach wouldn't do.",
          "Design for failure. What happens when the model is down, slow, or wrong? What's the fallback?",
          "Close the loop. How do you monitor, retrain, and roll back?",
        ],
      },
      {
        type: "callout",
        text: "Proposing the simplest thing that could work and explaining when you'd upgrade — reads as seniority. Reaching for the most sophisticated architecture available reads as inexperience.",
      },

      { type: "h2", text: "How to talk about your projects" },
      {
        type: "p",
        text: "Every project story should carry four things, in this order: the problem, the constraint, the decision, and the number. \"We needed to answer support questions from our docs. The docs changed weekly, so fine-tuning was out. I built a RAG pipeline with a nightly re-index. It cut escalations to a human by about a third.\"",
      },
      {
        type: "p",
        text: "That is thirty seconds and it demonstrates problem framing, tradeoff reasoning, technical execution, and business impact. Compare it to \"I built a chatbot using LangChain and OpenAI,\" which demonstrates that you have heard of LangChain.",
      },

      { type: "h2", text: "The uncomfortable truth about preparation" },
      {
        type: "p",
        text: "You cannot cram your way through the LLM depth round or the system design round. Both test judgment, and judgment only comes from having built things and watched them break. The candidates who clear these loops are, almost without exception, the ones with a portfolio of real systems they can speak about honestly  including the parts that went wrong.",
      },
      {
        type: "p",
        text: "Which means the most effective interview preparation isn't interview preparation. It's shipping something real, breaking it, and fixing it.",
      },
    ],
  },

  {
    slug: "structuring-your-resume-to-beat-ats-systems",
    title: "Structuring Your Resume to Beat ATS Systems in Tech",
    description:
      "How applicant tracking systems actually parse your resume, the formatting choices that silently destroy it, and how to write bullets that survive both the filter and the human.",
    category: "Careers",
    readingTime: "9 min read",
    datePublished: "2026-06-21",
    dateModified: "2026-07-13",
    keywords: [
      "ATS resume",
      "applicant tracking system",
      "tech resume format",
      "resume keywords",
      "AI engineer resume",
      "resume tips India",
    ],
    blocks: [
      {
        type: "p",
        text: "Most rejected resumes are never read by anyone. They are parsed by an applicant tracking system, converted into structured fields, scored against the job description, and sorted. If the parse goes badly, a strong candidate can be filtered out before a human ever sees the file — not because they weren't qualified, but because their two-column layout confused a text extractor.",
      },
      {
        type: "p",
        text: "This is a solvable problem, and solving it costs nothing. Here is what actually happens to your resume, and how to make sure it survives.",
      },

      { type: "h2", text: "What an ATS actually does" },
      {
        type: "p",
        text: "An ATS does three things in sequence. First it extracts raw text from your file. Then it tries to identify sections — where does experience start, which lines are job titles, what are dates. Finally it matches the extracted content against the requirements of the role, usually by looking for specific terms.",
      },
      {
        type: "p",
        text: "Every one of these steps can fail, and the first is the one that quietly destroys the most resumes. Modern systems are considerably better than their reputation suggests, but they still parse a single-column document far more reliably than a designed one.",
      },

      { type: "h2", text: "Formatting choices that break the parse" },
      {
        type: "ul",
        items: [
          "Multi-column layouts. Text extractors read left to right across the full page width. A two-column resume can interleave your skills section into the middle of your job history, producing gibberish.",
          "Text inside images or graphics. It is invisible. A skills section rendered as a chart contributes exactly nothing.",
          "Headers and footers. Many parsers skip them entirely. If your phone number and email live in the header, you may have submitted an anonymous resume.",
          "Tables. Support is inconsistent and the failure is silent.",
          "Creative section names. \"Where I've Made An Impact\" will not be recognised as your experience section. Call it Experience.",
          "Uncommon fonts and icon glyphs. A phone icon may extract as a garbage character glued to your number.",
        ],
      },
      {
        type: "callout",
        text: "Test it yourself in ten seconds: open your PDF, select all, copy, and paste into a plain text editor. What you see is roughly what the ATS sees. If it's scrambled or missing, so is your application.",
      },

      { type: "h2", text: "The structure that works" },
      {
        type: "p",
        text: "Single column. Standard section headings, in a conventional order. A common font. PDF, unless the application explicitly asks for .docx.",
      },
      {
        type: "ol",
        items: [
          "Name and contact details in the body of the document, not the header.",
          "A two-line summary, only if it says something specific. Skip it rather than write a generic one.",
          "Skills — a plain, scannable list of real technologies.",
          "Experience — reverse chronological, with dates in a consistent format.",
          "Projects — for career switchers this may deserve to sit above Experience.",
          "Education and certifications.",
        ],
      },

      { type: "h2", text: "Keywords: mirror the posting, don't stuff it" },
      {
        type: "p",
        text: "The matching step looks for terms from the job description. If the posting says \"PyTorch\" and your resume says \"deep learning frameworks,\" you may not match — the system is often doing something closer to string matching than semantic understanding.",
      },
      {
        type: "p",
        text: "So mirror the posting's vocabulary, exactly, wherever it is honestly true of you. If they ask for RAG, write RAG — not \"retrieval systems.\" If they list Kubernetes, and you have used Kubernetes, the word Kubernetes should appear on your resume.",
      },
      {
        type: "p",
        text: "Two guardrails. First: spell out acronyms once, in the form \"Retrieval-Augmented Generation (RAG),\" so you match both variants. Second: never list a technology you cannot discuss for five minutes in an interview. Keyword stuffing gets you into a room where you are then exposed, which is worse than not getting into the room.",
      },

      { type: "h2", text: "Bullets that survive the human, too" },
      {
        type: "p",
        text: "Passing the filter only earns you six seconds of a recruiter's attention. What loses that attention is a resume that lists responsibilities instead of results.",
      },
      {
        type: "p",
        text: "The pattern that works: what you did, how you did it, what changed as a result. The last part is the one almost everyone omits, and it is the only part that distinguishes you.",
      },
      {
        type: "ul",
        items: [
          "Weak: \"Responsible for building machine learning models.\"",
          "Better: \"Built a customer churn model in Python and scikit-learn.\"",
          "Strong: \"Built a churn prediction model (Python, scikit-learn, XGBoost) that identified at-risk accounts two weeks earlier than the previous rules-based system, cutting monthly churn by 12%.\"",
        ],
      },
      {
        type: "p",
        text: "If you genuinely don't have a metric, use scale or scope instead the size of the dataset, the number of users, the volume of traffic, the reduction in manual hours. Something concrete beats an adjective every time.",
      },

      { type: "h2", text: "If you're switching careers" },
      {
        type: "p",
        text: "The temptation is to hide the old career. Don't  it's an asset, and pretending otherwise makes your timeline look suspicious. The move is to reframe it as domain expertise and put your evidence of the new skill above it.",
      },
      {
        type: "p",
        text: "A finance analyst moving into AI is not competing with fresh graduates; they are a candidate who understands financial data, which is worth a great deal to a fintech hiring an ML engineer. Lead with a projects section that proves you can build, keep the old experience but rewrite the bullets to emphasise data, analysis, and systems, and let the combination speak.",
      },

      { type: "h2", text: "The one-page question" },
      {
        type: "p",
        text: "Under roughly ten years of experience, keep it to one page. This is not a formatting rule, it is an editing discipline: the constraint forces you to cut the bullets that were never impressing anyone. Two pages are acceptable for genuinely senior candidates with a long record of relevant work. Three pages are not.",
      },
    ],
  },
];

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);
