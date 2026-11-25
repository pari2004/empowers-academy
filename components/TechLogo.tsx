"use client";

import React, { useState } from "react";

type TechLogoProps = {
  name: string;
  iconSlug?: string;
  size?: number;
  className?: string;
};

// High-resolution, official color SVG logos (CDN / Iconify / Devicon)
const OFFICIAL_LOGO_URLS: Record<string, string> = {
  // Python & Data Science
  python: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  pandas: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg",
  numpy: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg",
  mysql: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  postgresql: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  sql: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  jupyter: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jupyter/jupyter-original.svg",
  github: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
  matplotlib: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/matplotlib/matplotlib-original.svg",
  plotly: "https://cdn.simpleicons.org/plotly/3F4F75",
  "scikit learn": "https://api.iconify.design/simple-icons:scikitlearn.svg?color=%23F7931E",
  scikitlearn: "https://api.iconify.design/simple-icons:scikitlearn.svg?color=%23F7931E",
  tensorflow: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg",
  pytorch: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg",
  "hugging face": "https://cdn.simpleicons.org/huggingface/FFD21E",
  huggingface: "https://cdn.simpleicons.org/huggingface/FFD21E",
  langchain: "https://cdn.simpleicons.org/langchain/1C3C3C",
  crewai: "https://cdn.simpleicons.org/crewai/FF5733",
  langgraph: "https://cdn.simpleicons.org/langchain/1C3C3C",
  autogen: "https://api.iconify.design/logos:microsoft-icon.svg",
  microsoft: "https://api.iconify.design/logos:microsoft-icon.svg",
  openai: "https://api.iconify.design/logos:openai-icon.svg",
  chatgpt: "https://api.iconify.design/logos:openai-icon.svg",
  "chatgpt / llms": "https://api.iconify.design/logos:openai-icon.svg",
  "chat gpt": "https://api.iconify.design/logos:openai-icon.svg",
  anthropic: "https://api.iconify.design/logos:anthropic-icon.svg",
  claude: "https://api.iconify.design/logos:claude-icon.svg",
  ollama: "https://cdn.simpleicons.org/ollama/000000",
  vllm: "https://cdn.simpleicons.org/vllm/4B5563",
  qdrant: "https://cdn.simpleicons.org/qdrant/DC2626",
  milvus: "https://cdn.simpleicons.org/milvus/00A1EA",

  // Cloud & DevOps
  aws: "https://api.iconify.design/logos:aws.svg",
  "amazon web services": "https://api.iconify.design/logos:aws.svg",
  docker: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  mlflow: "https://cdn.simpleicons.org/mlflow/0194E2",
  grafana: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/grafana/grafana-original.svg",
  lambda: "https://api.iconify.design/logos:aws-lambda.svg",
  "aws lambda": "https://api.iconify.design/logos:aws-lambda.svg",
  fastapi: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg",
  "github actions": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/githubactions/githubactions-original.svg",
  githubactions: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/githubactions/githubactions-original.svg",
  colab: "https://cdn.simpleicons.org/googlecolab/F9AB00",
  "google colab": "https://cdn.simpleicons.org/googlecolab/F9AB00",
  "vs code": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg",
  vscode: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg",
  streamlit: "https://cdn.simpleicons.org/streamlit/FF4B4B",
  "weights & biases": "https://cdn.simpleicons.org/weightsandbiases/FFBE00",
  wandb: "https://cdn.simpleicons.org/weightsandbiases/FFBE00",
  kubernetes: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
  terraform: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg",
  ansible: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ansible/ansible-original.svg",
  jenkins: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg",
  "gitlab ci": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg",
  gitlab: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg",
  prometheus: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prometheus/prometheus-original.svg",
  linux: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
  bash: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg",
  helm: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/helm/helm-original.svg",
  argocd: "https://cdn.simpleicons.org/argo/EF7B4D",
  nginx: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg",
  sonarqube: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sonarqube/sonarqube-original.svg",
  "elk stack": "https://api.iconify.design/logos:elasticsearch.svg",
  elasticsearch: "https://api.iconify.design/logos:elasticsearch.svg",
  "hashicorp vault": "https://cdn.simpleicons.org/vault/000000",
  opentofu: "https://cdn.simpleicons.org/opentofu/FFDA00",
  azure: "https://api.iconify.design/logos:azure-icon.svg",
  "microsoft azure": "https://api.iconify.design/logos:azure-icon.svg",
  "google cloud": "https://api.iconify.design/logos:google-cloud.svg",
  gcp: "https://api.iconify.design/logos:google-cloud.svg",

  // Cybersecurity
  "kali linux": "https://cdn.simpleicons.org/kalilinux/557C94",
  kalilinux: "https://cdn.simpleicons.org/kalilinux/557C94",
  wireshark: "https://cdn.simpleicons.org/wireshark/1679A7",
  "burp suite": "https://cdn.simpleicons.org/burpsuite/FF6633",
  burpsuite: "https://cdn.simpleicons.org/burpsuite/FF6633",
  metasploit: "https://cdn.simpleicons.org/metasploit/2496ED",
  "owasp zap": "https://cdn.simpleicons.org/owasp/000000",
  owasp: "https://cdn.simpleicons.org/owasp/000000",
  splunk: "https://api.iconify.design/logos:splunk.svg",
  tor: "https://cdn.simpleicons.org/torproject/7D4698",
  hashcat: "https://api.iconify.design/simple-icons:hashcat.svg",

  // Business Analytics & PM
  tableau: "https://api.iconify.design/logos:tableau-icon.svg",
  "power bi": "https://api.iconify.design/logos:microsoft-power-bi.svg",
  powerbi: "https://api.iconify.design/logos:microsoft-power-bi.svg",
  jira: "https://api.iconify.design/logos:jira.svg",
  confluence: "https://api.iconify.design/logos:confluence.svg",
  trello: "https://api.iconify.design/logos:trello.svg",
  notion: "https://api.iconify.design/logos:notion-icon.svg",
  figma: "https://api.iconify.design/logos:figma.svg",
  lucidchart: "https://cdn.simpleicons.org/lucid/282C34",
  snowflake: "https://api.iconify.design/logos:snowflake-icon.svg",
  "google analytics": "https://api.iconify.design/logos:google-analytics.svg",
  "power automate": "https://api.iconify.design/fluent:flow-24-filled.svg",
  powerautomate: "https://api.iconify.design/fluent:flow-24-filled.svg",
  r: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/r/r-original.svg",
};

// Inline SVG components for special brand icons (100% offline resilient)
function InlineSvg({ name, size }: { name: string; size: number }) {
  const norm = name.toLowerCase().trim();

  // Seaborn
  if (norm === "seaborn") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#0C4B64" />
        <path d="M12 28C16 16 22 14 26 24C30 34 34 32 38 20" stroke="#48CAE4" strokeWidth="4" strokeLinecap="round" />
        <circle cx="16" cy="20" r="3" fill="#90E0EF" />
        <circle cx="26" cy="24" r="3" fill="#CAF0F8" />
        <circle cx="34" cy="24" r="3" fill="#0077B6" />
      </svg>
    );
  }

  // XGBoost
  if (norm === "xg boost" || norm === "xgboost") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#1A202C" />
        <path d="M14 14L34 34M34 14L14 34" stroke="#F97316" strokeWidth="5" strokeLinecap="round" />
        <circle cx="24" cy="24" r="4" fill="#38BDF8" />
      </svg>
    );
  }

  // LightGBM
  if (norm === "lightgbm") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#059669" />
        <path d="M24 10V38M16 24H32M18 16L30 32M30 16L18 32" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <circle cx="24" cy="10" r="3" fill="#FEF08A" />
      </svg>
    );
  }

  // LlamaIndex
  if (norm === "llamaindex") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#7C3AED" />
        <circle cx="24" cy="20" r="10" fill="#FFFFFF" />
        <circle cx="20" cy="18" r="2" fill="#7C3AED" />
        <circle cx="28" cy="18" r="2" fill="#7C3AED" />
        <path d="M19 12L22 7M29 12L26 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M18 30C18 28 22 28 24 28C26 28 30 28 30 30V38H18V30Z" fill="#FFFFFF" />
      </svg>
    );
  }

  // Pinecone
  if (norm === "pinecone") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#047857" />
        <path d="M24 10L16 22H32L24 10Z" fill="#34D399" />
        <path d="M24 18L14 30H34L24 18Z" fill="#10B981" />
        <path d="M24 26L12 38H36L24 26Z" fill="#059669" />
      </svg>
    );
  }

  // ChromaDB / Chroma
  if (norm === "chromadb" || norm === "chroma") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#EA580C" />
        <circle cx="18" cy="18" r="5" fill="#FDE047" />
        <circle cx="30" cy="18" r="5" fill="#38BDF8" />
        <circle cx="24" cy="30" r="5" fill="#4ADE80" />
      </svg>
    );
  }

  // ChatGPT / OpenAI
  if (norm === "chatgpt" || norm === "chat gpt" || norm === "chatgpt / llms" || norm === "openai") {
    return (
      <svg width={size} height={size} viewBox="0 0 256 260" fill="none">
        <rect width="256" height="260" rx="48" fill="#10A37F" />
        <path fill="#FFFFFF" d="M239.184 106.203a64.72 64.72 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.72 64.72 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.67 64.67 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.77 64.77 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483m-97.56 136.338a48.4 48.4 0 0 1-31.105-11.255l1.535-.87l51.67-29.825a8.6 8.6 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601M37.158 197.93a48.35 48.35 0 0 1-5.781-32.589l1.534.921l51.722 29.826a8.34 8.34 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803M23.549 85.38a48.5 48.5 0 0 1 25.58-21.333v61.39a8.29 8.29 0 0 0 4.195 7.316l62.874 36.272l-21.845 12.636a.82.82 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405zm179.466 41.695l-63.08-36.63L161.73 77.86a.82.82 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.54 8.54 0 0 0-4.4-7.213m21.742-32.69l-1.535-.922l-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.72.72 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391zM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87l-51.67 29.825a8.6 8.6 0 0 0-4.246 7.367zm11.868-25.58L128.067 97.3l28.188 16.218v32.434l-28.086 16.218l-28.188-16.218z"/>
      </svg>
    );
  }

  // Claude / Anthropic
  if (norm === "claude" || norm === "anthropic") {
    return (
      <svg width={size} height={size} viewBox="0 0 256 257" fill="none">
        <rect width="256" height="257" rx="48" fill="#FDFBF7" />
        <path fill="#D97757" d="m50.228 170.321l50.357-28.257l.843-2.463l-.843-1.361h-2.462l-8.426-.518l-28.775-.778l-24.952-1.037l-24.175-1.296l-6.092-1.297L0 125.796l.583-3.759l5.12-3.434l7.324.648l16.202 1.101l24.304 1.685l17.629 1.037l26.118 2.722h4.148l.583-1.685l-1.426-1.037l-1.101-1.037l-25.147-17.045l-27.22-18.017l-14.258-10.37l-7.713-5.25l-3.888-4.925l-1.685-10.758l7-7.713l9.397.649l2.398.648l9.527 7.323l20.35 15.75L94.817 91.9l3.889 3.24l1.555-1.102l.195-.777l-1.75-2.917l-14.453-26.118l-15.425-26.572l-6.87-11.018l-1.814-6.61c-.648-2.723-1.102-4.991-1.102-7.778l7.972-10.823L71.42 0l10.63 1.426l4.472 3.888l6.61 15.101l10.694 23.786l16.591 32.34l4.861 9.592l2.592 8.879l.973 2.722h1.685v-1.556l1.36-18.211l2.528-22.36l2.463-28.776l.843-8.1l4.018-9.722l7.971-5.25l6.222 2.981l5.12 7.324l-.713 4.73l-3.046 19.768l-5.962 30.98l-3.889 20.739h2.268l2.593-2.593l10.499-13.934l17.628-22.036l7.778-8.749l9.073-9.657l5.833-4.601h11.018l8.1 12.055l-3.628 12.443l-11.342 14.388l-9.398 12.184l-13.48 18.147l-8.426 14.518l.778 1.166l2.01-.194l30.46-6.481l16.462-2.982l19.637-3.37l8.88 4.148l.971 4.213l-3.5 8.62l-20.998 5.184l-24.628 4.926l-36.682 8.685l-.454.324l.519.648l16.526 1.555l7.065.389h17.304l32.21 2.398l8.426 5.574l5.055 6.805l-.843 5.184l-12.962 6.611l-17.498-4.148l-40.83-9.721l-14-3.5h-1.944v1.167l11.666 11.406l21.387 19.314l26.767 24.887l1.36 6.157l-3.434 4.86l-3.63-.518l-23.526-17.693l-9.073-7.972l-20.545-17.304h-1.36v1.814l4.73 6.935l25.017 37.59l1.296 11.536l-1.814 3.76l-6.481 2.268l-7.13-1.297l-14.647-20.544l-15.1-23.138l-12.185-20.739l-1.49.843l-7.194 77.448l-3.37 3.953l-7.778 2.981l-6.48-4.925l-3.436-7.972l3.435-15.749l4.148-20.544l3.37-16.333l3.046-20.285l1.815-6.74l-.13-.454l-1.49.194l-15.295 20.999l-23.267 31.433l-18.406 19.702l-4.407 1.75l-7.648-3.954l.713-7.064l4.277-6.286l25.47-32.405l15.36-20.092l9.917-11.6l-.065-1.686h-.583L44.07 198.125l-12.055 1.555l-5.185-4.86l.648-7.972l2.463-2.593l20.35-13.999z"/>
      </svg>
    );
  }

  // Power Automate / Microsoft Power Automate
  if (norm === "power automate" || norm === "powerautomate" || norm === "microsoft power automate") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#F0F9FF" />
        <path d="M28.16 17.6a3.5 3.5 0 0 0-2.66 3.4v6a6.5 6.5 0 0 1-5.63 6.44A8 8 0 1 1 19.84 30.4a3.5 3.5 0 0 0 2.66-3.4v-6a6.5 6.5 0 0 1 5.63-6.44A8 8 0 1 1 44 16a8 8 0 0 1-15.84 1.6Z" fill="#0066FF" />
        <circle cx="12" cy="32" r="4" fill="#0078D4" />
        <circle cx="36" cy="16" r="4" fill="#0284C7" />
      </svg>
    );
  }

  // Excel / Google Sheets
  if (norm === "excel" || norm === "excel/google sheets" || norm === "google sheets") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#107C41" />
        <path d="M16 16L32 32M32 16L16 32" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Nmap
  if (norm === "nmap") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#0284C7" />
        <circle cx="24" cy="24" r="14" stroke="#FFFFFF" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="8" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="24" y1="10" x2="24" y2="38" stroke="#FFFFFF" strokeWidth="1.5" />
        <line x1="10" y1="24" x2="38" y2="24" stroke="#FFFFFF" strokeWidth="1.5" />
        <line x1="24" y1="24" x2="34" y2="14" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Snort
  if (norm === "snort") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#E11D48" />
        <ellipse cx="24" cy="24" rx="13" ry="10" fill="#FFFFFF" />
        <circle cx="20" cy="24" r="2.5" fill="#E11D48" />
        <circle cx="28" cy="24" r="2.5" fill="#E11D48" />
      </svg>
    );
  }

  // Unsloth
  if (norm === "unsloth") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#8B5CF6" />
        <ellipse cx="24" cy="25" rx="14" ry="12" fill="#EDE9FE" />
        <ellipse cx="19" cy="24" rx="4" ry="5" fill="#7C3AED" transform="rotate(-15 19 24)" />
        <ellipse cx="29" cy="24" rx="4" ry="5" fill="#7C3AED" transform="rotate(15 29 24)" />
        <circle cx="19.5" cy="24.5" r="1.5" fill="#FFFFFF" />
        <circle cx="28.5" cy="24.5" r="1.5" fill="#FFFFFF" />
        <ellipse cx="24" cy="28" rx="2.5" ry="1.8" fill="#5B21B6" />
        <path d="M22 30C23 31.5 25 31.5 26 30" stroke="#5B21B6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Ragas
  if (norm === "ragas") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#10B981" />
        <path d="M16 34V14H25C28.3 14 31 16.7 31 20C31 22.8 29 25.1 26.4 25.8L32 34H26L21 26H21V34H16Z" fill="#FFFFFF" />
        <path d="M21 19V22H25C25.8 22 26.5 21.3 26.5 20.5C26.5 19.7 25.8 19 25 19H21Z" fill="#10B981" />
        <circle cx="34" cy="14" r="3" fill="#A7F3D0" />
      </svg>
    );
  }

  // Guardrails AI
  if (norm === "guardrails ai" || norm === "guardrails") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#6366F1" />
        <path d="M24 10L35 15V24C35 30.5 30.3 36.5 24 38C17.7 36.5 13 30.5 13 24V15L24 10Z" fill="#4F46E5" />
        <path d="M24 13L32.5 16.8V23.5C32.5 28.5 28.8 33.3 24 34.6C19.2 33.3 15.5 28.5 15.5 23.5V16.8L24 13Z" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M20 24L23 27L28 21" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // NeMo Guardrails
  if (norm === "nemo guardrails" || norm === "nemo" || norm === "nvidia") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#0F172A" />
        <path d="M24 12C16.8 12 11 17.8 11 25C11 29.8 13.6 33.9 17.5 36.1L20.8 32.2C18.5 30.8 17 28.3 17 25.4C17 21.1 20.3 17.6 24.6 17.4V12.1L24 12Z" fill="#76B900" />
        <path d="M24 18.2C20.2 18.2 17.2 21.3 17.2 25.1C17.2 27.8 18.8 30.1 21.1 31.2L24 28V18.2Z" fill="#76B900" />
        <path d="M27.5 12V36L35 24L27.5 12Z" fill="#76B900" />
      </svg>
    );
  }

  // Phoenix / LangSmith
  if (norm === "phoenix / langsmith" || norm === "phoenix" || norm === "langsmith") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#EA580C" />
        <path d="M24 10C24 10 27 16 26 20C25 24 21 25 21 29C21 32 23 34 26 34C29 34 32 31 32 27C32 22 28 17 28 17C28 17 31 20 32 24C33 28 35 28 36 26C37 24 36 21 35 19C35 19 39 23 38 29C37 35 32 38 26 38C19 38 15 33 15 27C15 21 19 16 24 10Z" fill="#FEF08A" />
        <circle cx="25" cy="27" r="3" fill="#DC2626" />
      </svg>
    );
  }

  // PEFT/LoRA
  if (norm === "peft/lora" || norm === "peft" || norm === "lora") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#EE4C2C" />
        <path d="M24 10L26 12C29.5 15.5 30 20.5 27.5 24.5L24 23L20.5 24.5C18 20.5 18.5 15.5 22 12L24 10Z" fill="#FFFFFF" />
        <circle cx="28.5" cy="13.5" r="2.5" fill="#FDE047" />
        <rect x="12" y="27" width="24" height="11" rx="3.5" fill="#0F172A" />
        <text x="24" y="35.5" fill="#38BDF8" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">LoRA</text>
      </svg>
    );
  }

  return null;
}

export default function TechLogo({ name, iconSlug, size = 32, className = "" }: TechLogoProps) {
  const [failed, setFailed] = useState(false);
  const normalizedKey = (iconSlug || name).toLowerCase().trim();

  // 1. Check if we have an inline SVG component
  const inlineSvgElement = InlineSvg({ name: normalizedKey, size });
  if (inlineSvgElement) {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        {inlineSvgElement}
      </span>
    );
  }

  // 2. Resolve URL
  const matchedUrl =
    OFFICIAL_LOGO_URLS[normalizedKey] ||
    OFFICIAL_LOGO_URLS[name.toLowerCase().trim()] ||
    (iconSlug ? `https://cdn.simpleicons.org/${iconSlug}` : null);

  if (failed || !matchedUrl) {
    // Beautiful stylized fallback monogram badge
    const initials = name
      .split(/[\s/_-]+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 rounded-xl font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200 shadow-sm ${className}`}
        style={{ width: size, height: size }}
        title={name}
      >
        {initials || name.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={matchedUrl}
        alt={`${name} logo`}
        width={size}
        height={size}
        className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-200"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
