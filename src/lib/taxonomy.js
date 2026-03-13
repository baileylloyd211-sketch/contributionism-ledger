export const TIER_MULTIPLIERS = {
  I: 1.0,
  II: 1.8,
  III: 3.2,
}

export const LEVEL_MULTIPLIERS = {
  general:    1.0,
  lead:       1.5,
  management: 2.0,
}

export const TAXONOMY = {
  "I": {
    label: "Tier I — General",
    description: "The foundation of civilization. Labor, care, service, trades. Without it, nothing above exists.",
    color: "#7EB8A4",
    multiplier: 1.0,
    categories: {
      "Labor & Maintenance": {
        vsc: 1.8,
        description: "Physical maintenance of the systems civilization runs on.",
        levels: ["Worker", "Lead Worker", "Maintenance Supervisor"],
      },
      "Sanitation & Waste": {
        vsc: 2.0,
        description: "Waste management, sanitation, environmental cleanup. Civilization's immune system.",
        levels: ["Sanitation Worker", "Sanitation Lead", "Systems Supervisor"],
      },
      "Food & Agriculture": {
        vsc: 1.9,
        description: "Growing, harvesting, processing, and distributing food.",
        levels: ["Farm Worker", "Farm Lead", "Agricultural Manager"],
      },
      "Care & Domestic Work": {
        vsc: 1.7,
        description: "Childcare, eldercare, household support, disability care.",
        levels: ["Caregiver", "Lead Caregiver", "Care Coordinator"],
      },
      "Retail & Service": {
        vsc: 1.2,
        description: "Community-facing service, retail, hospitality.",
        levels: ["Service Worker", "Senior Associate", "Store Manager"],
      },
      "Transportation & Delivery": {
        vsc: 1.5,
        description: "Moving people and goods. The circulatory system of communities.",
        levels: ["Driver / Operator", "Senior Operator", "Fleet Coordinator"],
      },
      "Security & Emergency Response": {
        vsc: 1.6,
        description: "First responders, community safety, emergency services.",
        levels: ["Responder", "Senior Responder", "Emergency Coordinator"],
      },
    },
  },

  "II": {
    label: "Tier II — Skilled",
    description: "Specialized training, licensed practice, higher system dependency.",
    color: "#C4A35A",
    multiplier: 1.8,
    categories: {
      "Construction & Trades": {
        vsc: 1.6,
        description: "Building and maintaining the physical infrastructure of civilization.",
        levels: ["Tradesperson", "Journeyman / Lead", "Master / Foreman"],
      },
      "Real Estate & Property": {
        vsc: 1.1,
        description: "Property development, management, and community housing.",
        levels: ["Agent / Associate", "Broker / Manager", "Developer / Principal"],
      },
      "Legal & Compliance": {
        vsc: 1.3,
        description: "Law, advocacy, regulatory compliance, rights protection.",
        levels: ["Paralegal / Associate", "Attorney / Specialist", "Partner / Director"],
      },
      "Finance & Accounting": {
        vsc: 1.2,
        description: "Resource allocation, accounting, economic planning.",
        levels: ["Analyst / Bookkeeper", "Senior Analyst / CPA", "Controller / Director"],
      },
      "Technology & Engineering": {
        vsc: 1.4,
        description: "Software, hardware, networks — the nervous system of modern civilization.",
        levels: ["Developer / Engineer", "Senior Engineer", "Principal / Tech Lead"],
      },
      "Education & Training": {
        vsc: 1.7,
        description: "Teaching, curriculum, skill transfer. The mechanism by which civilization reproduces itself.",
        levels: ["Educator / Trainer", "Senior Educator", "Curriculum Director"],
      },
      "Arts & Communication": {
        vsc: 1.1,
        description: "Media, design, creative production, public communication.",
        levels: ["Creator / Designer", "Senior Creator", "Creative Director"],
      },
      "Manufacturing & Production": {
        vsc: 1.4,
        description: "Making the physical goods civilization depends on.",
        levels: ["Production Worker", "Senior Technician", "Production Manager"],
      },
    },
  },

  "III": {
    label: "Tier III — Advanced",
    description: "Civilizational-scale impact. Work that changes the τ values.",
    color: "#B87A6E",
    multiplier: 3.2,
    categories: {
      "Medicine & Public Health": {
        vsc: 2.0,
        description: "Healing individuals and populations. Direct impact on civilizational persistence.",
        levels: ["Practitioner", "Specialist / Researcher", "Systems Architect"],
      },
      "Science & Research": {
        vsc: 1.8,
        description: "Expanding the knowledge base civilization uses to solve its problems.",
        levels: ["Researcher", "Senior Scientist", "Principal Investigator"],
      },
      "Systems Engineering": {
        vsc: 1.9,
        description: "Designing and maintaining large-scale infrastructure systems.",
        levels: ["Systems Engineer", "Senior Systems Engineer", "Systems Architect"],
      },
      "Environmental & Climate": {
        vsc: 2.0,
        description: "Directly working on the τ values for atmospheric and ecological systems.",
        levels: ["Ecologist / Analyst", "Senior Researcher", "Systems Ecologist"],
      },
      "Governance & Policy": {
        vsc: 1.7,
        description: "Designing the rules civilization runs on.",
        levels: ["Policy Analyst", "Policy Architect", "Institutional Designer"],
      },
      "Impact & Advocacy": {
        vsc: 1.5,
        description: "Organizing, movement building, rights advocacy.",
        levels: ["Advocate / Organizer", "Senior Advocate", "Movement Architect"],
      },
    },
  },
}

export const CREDIT_SYSTEM = {
  startingCredits: 100,
  accessTiers: [
    { contributionsRequired: 0,  accessibleCredits: 25,  label: "Entry" },
    { contributionsRequired: 1,  accessibleCredits: 50,  label: "Active" },
    { contributionsRequired: 3,  accessibleCredits: 100, label: "Established" },
  ],
  depreciationRate: 0.02,
  depreciationInterval: "week",
  maxCreditCap: 10000,
}

export function calculateScore({ hours, tier, levelIndex, categoryKey, consecutiveWeeks = 0 }) {
  const tierData = TAXONOMY[tier]
  if (!tierData) return 0
  const categoryData = tierData.categories[categoryKey]
  if (!categoryData) return 0
  const tierMult = TIER_MULTIPLIERS[tier]
  const levelMult = Object.values(LEVEL_MULTIPLIERS)[Math.min(levelIndex, 2)]
  const vsc = categoryData.vsc
  const consistency = Math.min(1 + (0.01 * consecutiveWeeks), 1.5)
  return Math.round(hours * tierMult * levelMult * vsc * consistency)
}

export function getCreditAccess(verifiedContributions) {
  const tiers = [...CREDIT_SYSTEM.accessTiers].reverse()
  const match = tiers.find(t => verifiedContributions >= t.contributionsRequired)
  return match?.accessibleCredits ?? 25
}

export function applyWeeklyDepreciation(currentCredits, earnedCredits) {
  const unspent = Math.max(0, currentCredits - earnedCredits)
  const decay = unspent * CREDIT_SYSTEM.depreciationRate
  return Math.max(0, currentCredits - decay)
}

export const CONTACT_STATUSES = {
  none:      { label: "—",               color: "#444",    bg: "#111" },
  pending:   { label: "Contact Pending", color: "#C4A35A", bg: "#1c1a12" },
  inProcess: { label: "In Process",      color: "#7EB8A4", bg: "#121c1a" },
  completed: { label: "Completed",       color: "#8888cc", bg: "#12121a" },
}

export const SAMPLE_MEMBERS = [
  {
    id: "1", name: "Darnell Washington", tier: "I", category: "Sanitation & Waste",
    levelIndex: 1, title: "Sanitation Systems Lead",
    description: "Darnell has maintained NE Portland's sanitation grid for 11 years. He holds institutional knowledge about system failure points that no documentation captures. His VSC score reflects what the theorem makes explicit: this work is civilizational infrastructure. Failure here cascades within 72 hours.",
    contribution_score: 1840, verified_transactions: 44, start_date: "2013-04-01",
    contact_status: "none", skills: ["Waste Systems", "Route Optimization", "Hazmat Handling", "System Mapping"],
    verified_by: "Miriam Osei", consecutive_weeks: 48,
  },
  {
    id: "2", name: "Miriam Osei", tier: "III", category: "Systems Engineering",
    levelIndex: 2, title: "Water Systems Resilience Architect",
    description: "Miriam applies the Persistence Condition directly to physical infrastructure — measuring inflow, outflow, and disturbance for urban water systems. Currently leading UIAC accounting implementation for the Portland Water Bureau pilot.",
    contribution_score: 2340, verified_transactions: 47, start_date: "2021-03-14",
    contact_status: "inProcess", skills: ["Hydrology", "Systems Modeling", "UIAC Accounting", "Community Liaison"],
    verified_by: "Thomas Reyes", consecutive_weeks: 62,
  },
  {
    id: "3", name: "Priya Nataraj", tier: "II", category: "Governance & Policy",
    levelIndex: 1, title: "Pilot Program Transparency Liaison",
    description: "Manages the public-facing transparency portal for Stage 0. Ensures all financial flows, scoring distributions, and AI monitoring logs are legible to the general public.",
    contribution_score: 760, verified_transactions: 19, start_date: "2023-02-08",
    contact_status: "none", skills: ["Public Communication", "Data Visualization", "Governance Design"],
    verified_by: "Carlos Vega-Ruiz", consecutive_weeks: 31,
  },
  {
    id: "4", name: "Carlos Vega-Ruiz", tier: "I", category: "Food & Agriculture",
    levelIndex: 1, title: "Urban Soil Restoration Lead",
    description: "Leads a crew of 18 contributors restoring degraded urban agricultural plots in the Portland metro. All work is UIAC-logged.",
    contribution_score: 1120, verified_transactions: 31, start_date: "2022-06-20",
    contact_status: "completed", skills: ["Agroecology", "Team Coordination", "UIAC Logging", "Soil Systems"],
    verified_by: "Priya Nataraj", consecutive_weeks: 40,
  },
  {
    id: "5", name: "Thomas Reyes", tier: "III", category: "Medicine & Public Health",
    levelIndex: 2, title: "Community Health Infrastructure Designer",
    description: "Thomas reframes public health as an infrastructure problem. Has documented measurable τ improvements in three community health systems through contributionist resource allocation.",
    contribution_score: 2910, verified_transactions: 52, start_date: "2020-09-15",
    contact_status: "completed", skills: ["Public Health Systems", "Infrastructure Mapping", "τ Calculation", "Community Design"],
    verified_by: "Miriam Osei", consecutive_weeks: 88,
  },
  {
    id: "6", name: "Asha Brennan", tier: "I", category: "Care & Domestic Work",
    levelIndex: 0, title: "Neighborhood Mutual Aid Organizer",
    description: "Asha coordinates distributed care networks across NE Portland. New to the ledger but deep in the work — her contribution history predates the system.",
    contribution_score: 142, verified_transactions: 3, start_date: "2024-08-01",
    contact_status: "none", skills: ["Mutual Aid", "Network Coordination", "Community Trust"],
    verified_by: "Priya Nataraj", consecutive_weeks: 8,
  },
  {
    id: "7", name: "Jin-Ho Park", tier: "II", category: "Technology & Engineering",
    levelIndex: 1, title: "Energy Grid Decentralization Engineer",
    description: "Designs distributed energy micro-grids that apply CIA classification principles — systems whose failure cascades across two or more critical domains.",
    contribution_score: 1050, verified_transactions: 28, start_date: "2022-04-17",
    contact_status: "inProcess", skills: ["Electrical Engineering", "Grid Resilience", "CIA Classification", "Systems Cascades"],
    verified_by: "Thomas Reyes", consecutive_weeks: 38,
  },
  {
    id: "8", name: "Fatima Al-Rashidi", tier: "III", category: "Impact & Advocacy",
    levelIndex: 2, title: "Civilizational Literacy Movement Architect",
    description: "Builds educational frameworks that teach the Persistence Condition to general audiences. Author of 'What τ Means,' read by over 200,000 people.",
    contribution_score: 3180, verified_transactions: 61, start_date: "2020-01-30",
    contact_status: "pending", skills: ["Curriculum Design", "Public Education", "Civilizational Literacy", "Publishing"],
    verified_by: "Thomas Reyes", consecutive_weeks: 95,
  },
]
