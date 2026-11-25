/**
 * Empowers Academy Hiring Network & Partners Data
 *
 * This structured dataset powers the Hiring Network section on the Empowers Academy platform.
 * To add, edit, or update a company:
 * - Update the name, slug, industry, logo, website, and partnerStatus.
 * - partnerStatus values:
 *     - "verified_partner": Confirmed Empowers Academy hiring/recruitment relationship.
 *     - "network": Part of the broader hiring network.
 *     - "to_verify": Under internal review / verification.
 */

export type PartnerStatus = "verified_partner" | "network" | "to_verify";

export type CompanyRecord = {
  name: string;
  slug: string;
  industry: string;
  industries?: string[];
  logo: string;
  website?: string;
  partnerStatus: PartnerStatus;
};

export type CompanyCategory = {
  id: string;
  name: string;
};

export const COMPANY_CATEGORIES: CompanyCategory[] = [
  { id: "all", name: "All Companies" },
  { id: "technology", name: "IT, AI & Technology" },
  { id: "it-services", name: "IT Services & GCCs" },
  { id: "bfsi", name: "BFSI" },
  { id: "healthcare", name: "Healthcare" },
  { id: "automotive-aerospace", name: "Automotive" },
  { id: "retail-logistics", name: "Retail & Logistics" },
  { id: "telecom-media", name: "Telecom & Media" },
  { id: "consulting", name: "Consulting" },
  { id: "semiconductors-cybersecurity", name: "Semiconductor & Cybersecurity" },
  { id: "manufacturing-energy", name: "Manufacturing & Energy" },
  { id: "ai-companies", name: "AI Companies" },
  { id: "indian-ai", name: "Indian AI & Analytics" },
];

export const COMPANIES_DATA: CompanyRecord[] = [
  {
    "name": "Microsoft",
    "slug": "microsoft",
    "industry": "technology",
    "industries": [
      "technology"
    ],
    "logo": "/assets/company-logos/microsoft.svg",
    "website": "https://www.microsoft.com",
    "partnerStatus": "network"
  },
  {
    "name": "Alphabet / Google",
    "slug": "google",
    "industry": "technology",
    "industries": [
      "technology"
    ],
    "logo": "/assets/company-logos/google.svg",
    "website": "https://about.google",
    "partnerStatus": "network"
  },
  {
    "name": "Amazon",
    "slug": "amazon",
    "industry": "technology",
    "industries": [
      "technology",
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/amazon.svg",
    "website": "https://www.amazon.com",
    "partnerStatus": "network"
  },
  {
    "name": "Meta Platforms",
    "slug": "meta-platforms",
    "industry": "technology",
    "industries": [
      "technology"
    ],
    "logo": "/assets/company-logos/meta-platforms.svg",
    "website": "https://about.meta.com",
    "partnerStatus": "network"
  },
  {
    "name": "Apple",
    "slug": "apple",
    "industry": "technology",
    "industries": [
      "technology"
    ],
    "logo": "/assets/company-logos/apple.svg",
    "website": "https://www.apple.com",
    "partnerStatus": "network"
  },
  {
    "name": "NVIDIA",
    "slug": "nvidia",
    "industry": "technology",
    "industries": [
      "technology"
    ],
    "logo": "/assets/company-logos/nvidia.svg",
    "website": "https://www.nvidia.com",
    "partnerStatus": "network"
  },
  {
    "name": "IBM",
    "slug": "ibm",
    "industry": "technology",
    "industries": [
      "technology"
    ],
    "logo": "/assets/company-logos/ibm.svg",
    "website": "https://www.ibm.com",
    "partnerStatus": "network"
  },
  {
    "name": "Oracle",
    "slug": "oracle",
    "industry": "technology",
    "industries": [
      "technology"
    ],
    "logo": "/assets/company-logos/oracle.svg",
    "website": "https://www.oracle.com",
    "partnerStatus": "network"
  },
  {
    "name": "Salesforce",
    "slug": "salesforce",
    "industry": "technology",
    "industries": [
      "technology"
    ],
    "logo": "/assets/company-logos/salesforce.svg",
    "website": "https://www.salesforce.com",
    "partnerStatus": "network"
  },
  {
    "name": "Adobe",
    "slug": "adobe",
    "industry": "technology",
    "industries": [
      "technology"
    ],
    "logo": "/assets/company-logos/adobe.svg",
    "website": "https://www.adobe.com",
    "partnerStatus": "network"
  },
  {
    "name": "ServiceNow",
    "slug": "servicenow",
    "industry": "technology",
    "industries": [
      "technology"
    ],
    "logo": "/assets/company-logos/servicenow.svg",
    "website": "https://www.servicenow.com",
    "partnerStatus": "network"
  },
  {
    "name": "Palantir Technologies",
    "slug": "palantir-technologies",
    "industry": "technology",
    "industries": [
      "technology"
    ],
    "logo": "/assets/company-logos/palantir-technologies.svg",
    "website": "https://www.palantir.com",
    "partnerStatus": "network"
  },
  {
    "name": "Snowflake",
    "slug": "snowflake",
    "industry": "technology",
    "industries": [
      "technology"
    ],
    "logo": "/assets/company-logos/snowflake.svg",
    "website": "https://www.snowflake.com",
    "partnerStatus": "network"
  },
  {
    "name": "Databricks",
    "slug": "databricks",
    "industry": "technology",
    "industries": [
      "technology"
    ],
    "logo": "/assets/company-logos/databricks.svg",
    "website": "https://www.databricks.com",
    "partnerStatus": "network"
  },
  {
    "name": "Cisco Systems",
    "slug": "cisco-systems",
    "industry": "technology",
    "industries": [
      "technology",
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/cisco-systems.svg",
    "website": "https://www.cisco.com",
    "partnerStatus": "network"
  },
  {
    "name": "Accenture",
    "slug": "accenture",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/accenture.svg",
    "website": "https://www.accenture.com",
    "partnerStatus": "network"
  },
  {
    "name": "Tata Consultancy Services (TCS)",
    "slug": "tcs",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/tcs.svg",
    "website": "https://www.tcs.com",
    "partnerStatus": "network"
  },
  {
    "name": "Infosys",
    "slug": "infosys",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/infosys.svg",
    "website": "https://www.infosys.com",
    "partnerStatus": "network"
  },
  {
    "name": "Wipro",
    "slug": "wipro",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/wipro.svg",
    "website": "https://www.wipro.com",
    "partnerStatus": "network"
  },
  {
    "name": "HCLTech",
    "slug": "hcltech",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/hcltech.svg",
    "website": "https://www.hcltech.com",
    "partnerStatus": "network"
  },
  {
    "name": "Cognizant",
    "slug": "cognizant",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/cognizant.svg",
    "website": "https://www.cognizant.com",
    "partnerStatus": "network"
  },
  {
    "name": "Capgemini",
    "slug": "capgemini",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/capgemini.svg",
    "website": "https://www.capgemini.com",
    "partnerStatus": "network"
  },
  {
    "name": "Tech Mahindra",
    "slug": "tech-mahindra",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/tech-mahindra.svg",
    "website": "https://www.techmahindra.com",
    "partnerStatus": "network"
  },
  {
    "name": "LTIMindtree",
    "slug": "ltimindtree",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/ltimindtree.svg",
    "website": "https://www.ltimindtree.com",
    "partnerStatus": "network"
  },
  {
    "name": "NTT DATA",
    "slug": "ntt-data",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/ntt-data.svg",
    "website": "https://www.nttdata.com",
    "partnerStatus": "network"
  },
  {
    "name": "DXC Technology",
    "slug": "dxc-technology",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/dxc-technology.svg",
    "website": "https://www.dxc.com",
    "partnerStatus": "network"
  },
  {
    "name": "Atos",
    "slug": "atos",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/atos.svg",
    "website": "https://atos.net",
    "partnerStatus": "network"
  },
  {
    "name": "Genpact",
    "slug": "genpact",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/genpact.svg",
    "website": "https://www.genpact.com",
    "partnerStatus": "network"
  },
  {
    "name": "EXL",
    "slug": "exl",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/exl.svg",
    "website": "https://www.exlservice.com",
    "partnerStatus": "network"
  },
  {
    "name": "WNS Global Services",
    "slug": "wns-global-services",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/wns-global-services.svg",
    "website": "https://www.wns.com",
    "partnerStatus": "network"
  },
  {
    "name": "Mphasis",
    "slug": "mphasis",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/mphasis.svg",
    "website": "https://www.mphasis.com",
    "partnerStatus": "network"
  },
  {
    "name": "Persistent Systems",
    "slug": "persistent-systems",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/persistent-systems.svg",
    "website": "https://www.persistent.com",
    "partnerStatus": "network"
  },
  {
    "name": "Coforge",
    "slug": "coforge",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/coforge.svg",
    "website": "https://www.coforge.com",
    "partnerStatus": "network"
  },
  {
    "name": "Cyient",
    "slug": "cyient",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/cyient.svg",
    "website": "https://www.cyient.com",
    "partnerStatus": "network"
  },
  {
    "name": "Zensar Technologies",
    "slug": "zensar-technologies",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/zensar-technologies.svg",
    "website": "https://www.zensar.com",
    "partnerStatus": "network"
  },
  {
    "name": "Birlasoft",
    "slug": "birlasoft",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/birlasoft.svg",
    "website": "https://www.birlasoft.com",
    "partnerStatus": "network"
  },
  {
    "name": "Sonata Software",
    "slug": "sonata-software",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/sonata-software.svg",
    "website": "https://www.sonata-software.com",
    "partnerStatus": "network"
  },
  {
    "name": "Hexaware Technologies",
    "slug": "hexaware-technologies",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/hexaware-technologies.svg",
    "website": "https://hexaware.com",
    "partnerStatus": "network"
  },
  {
    "name": "Happiest Minds Technologies",
    "slug": "happiest-minds-technologies",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/happiest-minds-technologies.svg",
    "website": "https://www.happiestminds.com",
    "partnerStatus": "network"
  },
  {
    "name": "KPIT Technologies",
    "slug": "kpit-technologies",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/kpit-technologies.svg",
    "website": "https://www.kpit.com",
    "partnerStatus": "network"
  },
  {
    "name": "Tata Elxsi",
    "slug": "tata-elxsi",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/tata-elxsi.svg",
    "website": "https://www.tataelxsi.com",
    "partnerStatus": "network"
  },
  {
    "name": "UST",
    "slug": "ust",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/ust.svg",
    "website": "https://www.ust.com",
    "partnerStatus": "network"
  },
  {
    "name": "EPAM Systems",
    "slug": "epam-systems",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/epam-systems.svg",
    "website": "https://www.epam.com",
    "partnerStatus": "network"
  },
  {
    "name": "Endava",
    "slug": "endava",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/endava.svg",
    "website": "https://www.endava.com",
    "partnerStatus": "network"
  },
  {
    "name": "Globant",
    "slug": "globant",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/globant.svg",
    "website": "https://www.globant.com",
    "partnerStatus": "network"
  },
  {
    "name": "SoftServe",
    "slug": "softserve",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/softserve.svg",
    "website": "https://www.softserveinc.com",
    "partnerStatus": "network"
  },
  {
    "name": "Thoughtworks",
    "slug": "thoughtworks",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/thoughtworks.svg",
    "website": "https://www.thoughtworks.com",
    "partnerStatus": "network"
  },
  {
    "name": "Virtusa",
    "slug": "virtusa",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/virtusa.svg",
    "website": "https://www.virtusa.com",
    "partnerStatus": "network"
  },
  {
    "name": "Publicis Sapient",
    "slug": "publicis-sapient",
    "industry": "it-services",
    "industries": [
      "it-services"
    ],
    "logo": "/assets/company-logos/publicis-sapient.svg",
    "website": "https://www.publicissapient.com",
    "partnerStatus": "network"
  },
  {
    "name": "JPMorgan Chase & Co.",
    "slug": "jpmorgan-chase-co",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/jpmorgan-chase-co.svg",
    "website": "https://www.jpmorganchase.com",
    "partnerStatus": "network"
  },
  {
    "name": "Bank of America",
    "slug": "bank-of-america",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/bank-of-america.svg",
    "website": "https://www.bankofamerica.com",
    "partnerStatus": "network"
  },
  {
    "name": "Morgan Stanley",
    "slug": "morgan-stanley",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/morgan-stanley.svg",
    "website": "https://www.morganstanley.com",
    "partnerStatus": "network"
  },
  {
    "name": "Goldman Sachs",
    "slug": "goldman-sachs",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/goldman-sachs.svg",
    "website": "https://www.goldmansachs.com",
    "partnerStatus": "network"
  },
  {
    "name": "Citigroup",
    "slug": "citigroup",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/citigroup.svg",
    "website": "https://www.citigroup.com",
    "partnerStatus": "network"
  },
  {
    "name": "Wells Fargo",
    "slug": "wells-fargo",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/wells-fargo.svg",
    "website": "https://www.wellsfargo.com",
    "partnerStatus": "network"
  },
  {
    "name": "HSBC",
    "slug": "hsbc",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/hsbc.svg",
    "website": "https://www.hsbc.com",
    "partnerStatus": "network"
  },
  {
    "name": "Barclays",
    "slug": "barclays",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/barclays.svg",
    "website": "https://www.barclays.com",
    "partnerStatus": "network"
  },
  {
    "name": "UBS",
    "slug": "ubs",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/ubs.svg",
    "website": "https://www.ubs.com",
    "partnerStatus": "network"
  },
  {
    "name": "BNP Paribas",
    "slug": "bnp-paribas",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/bnp-paribas.svg",
    "website": "https://www.bnp-paribas.com",
    "partnerStatus": "network"
  },
  {
    "name": "Deutsche Bank",
    "slug": "deutsche-bank",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/deutsche-bank.svg",
    "website": "https://www.deutsche-bank.com",
    "partnerStatus": "network"
  },
  {
    "name": "Standard Chartered",
    "slug": "standard-chartered",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/standard-chartered.svg",
    "website": "https://www.standard-chartered.com",
    "partnerStatus": "network"
  },
  {
    "name": "American Express",
    "slug": "american-express",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/american-express.svg",
    "website": "https://www.american-express.com",
    "partnerStatus": "network"
  },
  {
    "name": "Capital One",
    "slug": "capital-one",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/capital-one.svg",
    "website": "https://www.capital-one.com",
    "partnerStatus": "network"
  },
  {
    "name": "Discover Financial Services",
    "slug": "discover-financial-services",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/discover-financial-services.svg",
    "website": "https://www.discover-financial-services.com",
    "partnerStatus": "network"
  },
  {
    "name": "Visa",
    "slug": "visa",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/visa.svg",
    "website": "https://www.visa.com",
    "partnerStatus": "network"
  },
  {
    "name": "Mastercard",
    "slug": "mastercard",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/mastercard.svg",
    "website": "https://mastercard.com",
    "partnerStatus": "network"
  },
  {
    "name": "PayPal",
    "slug": "paypal",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/paypal.svg",
    "website": "https://www.paypal.com",
    "partnerStatus": "network"
  },
  {
    "name": "Stripe",
    "slug": "stripe",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/stripe.svg",
    "website": "https://stripe.com",
    "partnerStatus": "network"
  },
  {
    "name": "Block, Inc.",
    "slug": "block-inc",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/block-inc.svg",
    "website": "https://www.block-inc.com",
    "partnerStatus": "network"
  },
  {
    "name": "Fidelity Investments",
    "slug": "fidelity-investments",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/fidelity-investments.svg",
    "website": "https://www.fidelity-investments.com",
    "partnerStatus": "network"
  },
  {
    "name": "BlackRock",
    "slug": "blackrock",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/blackrock.svg",
    "website": "https://www.blackrock.com",
    "partnerStatus": "network"
  },
  {
    "name": "Vanguard",
    "slug": "vanguard",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/vanguard.svg",
    "website": "https://www.vanguard.com",
    "partnerStatus": "network"
  },
  {
    "name": "State Street",
    "slug": "state-street",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/state-street.svg",
    "website": "https://www.state-street.com",
    "partnerStatus": "network"
  },
  {
    "name": "Charles Schwab",
    "slug": "charles-schwab",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/charles-schwab.svg",
    "website": "https://www.charles-schwab.com",
    "partnerStatus": "network"
  },
  {
    "name": "BNY Mellon",
    "slug": "bny-mellon",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/bny-mellon.svg",
    "website": "https://www.bny-mellon.com",
    "partnerStatus": "network"
  },
  {
    "name": "Prudential Financial",
    "slug": "prudential-financial",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/prudential-financial.svg",
    "website": "https://www.prudential-financial.com",
    "partnerStatus": "network"
  },
  {
    "name": "MetLife",
    "slug": "metlife",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/metlife.svg",
    "website": "https://www.metlife.com",
    "partnerStatus": "network"
  },
  {
    "name": "American International Group (AIG)",
    "slug": "aig",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/aig.svg",
    "website": "https://www.aig.com",
    "partnerStatus": "network"
  },
  {
    "name": "The Travelers Companies",
    "slug": "the-travelers-companies",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/the-travelers-companies.svg",
    "website": "https://www.the-travelers-companies.com",
    "partnerStatus": "network"
  },
  {
    "name": "Allstate",
    "slug": "allstate",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/allstate.svg",
    "website": "https://www.allstate.com",
    "partnerStatus": "network"
  },
  {
    "name": "Progressive",
    "slug": "progressive",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/progressive.svg",
    "website": "https://www.progressive.com",
    "partnerStatus": "network"
  },
  {
    "name": "Chubb",
    "slug": "chubb",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/chubb.svg",
    "website": "https://www.chubb.com",
    "partnerStatus": "network"
  },
  {
    "name": "Marsh McLennan",
    "slug": "marsh-mclennan",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/marsh-mclennan.svg",
    "website": "https://www.marsh-mclennan.com",
    "partnerStatus": "network"
  },
  {
    "name": "AXA",
    "slug": "axa",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/axa.svg",
    "website": "https://www.axa.com",
    "partnerStatus": "network"
  },
  {
    "name": "Allianz",
    "slug": "allianz",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/allianz.svg",
    "website": "https://www.allianz.com",
    "partnerStatus": "network"
  },
  {
    "name": "HDFC Bank",
    "slug": "hdfc-bank",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/hdfc-bank.svg",
    "website": "https://www.hdfc-bank.com",
    "partnerStatus": "network"
  },
  {
    "name": "ICICI Bank",
    "slug": "icici-bank",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/icici-bank.svg",
    "website": "https://www.icici-bank.com",
    "partnerStatus": "network"
  },
  {
    "name": "Axis Bank",
    "slug": "axis-bank",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/axis-bank.svg",
    "website": "https://www.axis-bank.com",
    "partnerStatus": "network"
  },
  {
    "name": "State Bank of India (SBI)",
    "slug": "sbi",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/sbi.svg",
    "website": "https://www.sbi.com",
    "partnerStatus": "network"
  },
  {
    "name": "Kotak Mahindra Bank",
    "slug": "kotak-mahindra-bank",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/kotak-mahindra-bank.svg",
    "website": "https://www.kotak-mahindra-bank.com",
    "partnerStatus": "network"
  },
  {
    "name": "Bajaj Finance",
    "slug": "bajaj-finance",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/bajaj-finance.svg",
    "website": "https://www.bajaj-finance.com",
    "partnerStatus": "network"
  },
  {
    "name": "Paytm",
    "slug": "paytm",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/paytm.svg",
    "website": "https://paytm.com",
    "partnerStatus": "network"
  },
  {
    "name": "Razorpay",
    "slug": "razorpay",
    "industry": "bfsi",
    "industries": [
      "bfsi"
    ],
    "logo": "/assets/company-logos/razorpay.svg",
    "website": "https://razorpay.com",
    "partnerStatus": "network"
  },
  {
    "name": "Johnson & Johnson",
    "slug": "johnson-johnson",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/johnson-johnson.svg",
    "website": "https://www.johnson-johnson.com",
    "partnerStatus": "network"
  },
  {
    "name": "Pfizer",
    "slug": "pfizer",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/pfizer.svg",
    "website": "https://www.pfizer.com",
    "partnerStatus": "network"
  },
  {
    "name": "Roche",
    "slug": "roche",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/roche.svg",
    "website": "https://www.roche.com",
    "partnerStatus": "network"
  },
  {
    "name": "Novartis",
    "slug": "novartis",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/novartis.svg",
    "website": "https://www.novartis.com",
    "partnerStatus": "network"
  },
  {
    "name": "Merck & Co.",
    "slug": "merck-co",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/merck-co.svg",
    "website": "https://www.merck-co.com",
    "partnerStatus": "network"
  },
  {
    "name": "AbbVie",
    "slug": "abbvie",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/abbvie.svg",
    "website": "https://www.abbvie.com",
    "partnerStatus": "network"
  },
  {
    "name": "AstraZeneca",
    "slug": "astrazeneca",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/astrazeneca.svg",
    "website": "https://www.astrazeneca.com",
    "partnerStatus": "network"
  },
  {
    "name": "Sanofi",
    "slug": "sanofi",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/sanofi.svg",
    "website": "https://www.sanofi.com",
    "partnerStatus": "network"
  },
  {
    "name": "Bristol Myers Squibb",
    "slug": "bristol-myers-squibb",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/bristol-myers-squibb.svg",
    "website": "https://www.bristol-myers-squibb.com",
    "partnerStatus": "network"
  },
  {
    "name": "GSK",
    "slug": "gsk",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/gsk.svg",
    "website": "https://www.gsk.com",
    "partnerStatus": "network"
  },
  {
    "name": "Eli Lilly and Company",
    "slug": "eli-lilly-and-company",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/eli-lilly-and-company.svg",
    "website": "https://www.eli-lilly-and-company.com",
    "partnerStatus": "network"
  },
  {
    "name": "Amgen",
    "slug": "amgen",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/amgen.svg",
    "website": "https://www.amgen.com",
    "partnerStatus": "network"
  },
  {
    "name": "Gilead Sciences",
    "slug": "gilead-sciences",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/gilead-sciences.svg",
    "website": "https://www.gilead-sciences.com",
    "partnerStatus": "network"
  },
  {
    "name": "Bayer",
    "slug": "bayer",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/bayer.svg",
    "website": "https://www.bayer.com",
    "partnerStatus": "network"
  },
  {
    "name": "Novo Nordisk",
    "slug": "novo-nordisk",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/novo-nordisk.svg",
    "website": "https://www.novo-nordisk.com",
    "partnerStatus": "network"
  },
  {
    "name": "UnitedHealth Group",
    "slug": "unitedhealth-group",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/unitedhealth-group.svg",
    "website": "https://www.unitedhealth-group.com",
    "partnerStatus": "network"
  },
  {
    "name": "Elevance Health",
    "slug": "elevance-health",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/elevance-health.svg",
    "website": "https://www.elevance-health.com",
    "partnerStatus": "network"
  },
  {
    "name": "Humana",
    "slug": "humana",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/humana.svg",
    "website": "https://www.humana.com",
    "partnerStatus": "network"
  },
  {
    "name": "CVS Health",
    "slug": "cvs-health",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/cvs-health.svg",
    "website": "https://www.cvs-health.com",
    "partnerStatus": "network"
  },
  {
    "name": "The Cigna Group",
    "slug": "the-cigna-group",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/the-cigna-group.svg",
    "website": "https://www.the-cigna-group.com",
    "partnerStatus": "network"
  },
  {
    "name": "Medtronic",
    "slug": "medtronic",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/medtronic.svg",
    "website": "https://www.medtronic.com",
    "partnerStatus": "network"
  },
  {
    "name": "Abbott Laboratories",
    "slug": "abbott-laboratories",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/abbott-laboratories.svg",
    "website": "https://www.abbott-laboratories.com",
    "partnerStatus": "network"
  },
  {
    "name": "Thermo Fisher Scientific",
    "slug": "thermo-fisher-scientific",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/thermo-fisher-scientific.svg",
    "website": "https://www.thermo-fisher-scientific.com",
    "partnerStatus": "network"
  },
  {
    "name": "Danaher",
    "slug": "danaher",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/danaher.svg",
    "website": "https://www.danaher.com",
    "partnerStatus": "network"
  },
  {
    "name": "Siemens Healthineers",
    "slug": "siemens-healthineers",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/siemens-healthineers.svg",
    "website": "https://www.siemens-healthineers.com",
    "partnerStatus": "network"
  },
  {
    "name": "GE HealthCare",
    "slug": "ge-healthcare",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/ge-healthcare.svg",
    "website": "https://www.ge-healthcare.com",
    "partnerStatus": "network"
  },
  {
    "name": "Philips",
    "slug": "philips",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/philips.svg",
    "website": "https://www.philips.com",
    "partnerStatus": "network"
  },
  {
    "name": "Stryker",
    "slug": "stryker",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/stryker.svg",
    "website": "https://www.stryker.com",
    "partnerStatus": "network"
  },
  {
    "name": "Boston Scientific",
    "slug": "boston-scientific",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/boston-scientific.svg",
    "website": "https://www.boston-scientific.com",
    "partnerStatus": "network"
  },
  {
    "name": "Illumina",
    "slug": "illumina",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/illumina.svg",
    "website": "https://www.illumina.com",
    "partnerStatus": "network"
  },
  {
    "name": "IQVIA",
    "slug": "iqvia",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/iqvia.svg",
    "website": "https://www.iqvia.com",
    "partnerStatus": "network"
  },
  {
    "name": "Labcorp",
    "slug": "labcorp",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/labcorp.svg",
    "website": "https://www.labcorp.com",
    "partnerStatus": "network"
  },
  {
    "name": "Quest Diagnostics",
    "slug": "quest-diagnostics",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/quest-diagnostics.svg",
    "website": "https://www.quest-diagnostics.com",
    "partnerStatus": "network"
  },
  {
    "name": "McKesson",
    "slug": "mckesson",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/mckesson.svg",
    "website": "https://www.mckesson.com",
    "partnerStatus": "network"
  },
  {
    "name": "Cencora",
    "slug": "cencora",
    "industry": "healthcare",
    "industries": [
      "healthcare"
    ],
    "logo": "/assets/company-logos/cencora.svg",
    "website": "https://www.cencora.com",
    "partnerStatus": "network"
  },
  {
    "name": "Tesla",
    "slug": "tesla",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/tesla.svg",
    "website": "https://www.tesla.com",
    "partnerStatus": "network"
  },
  {
    "name": "Toyota Motor Corporation",
    "slug": "toyota-motor-corporation",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/toyota-motor-corporation.svg",
    "website": "https://www.toyota-motor-corporation.com",
    "partnerStatus": "network"
  },
  {
    "name": "Volkswagen Group",
    "slug": "volkswagen-group",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/volkswagen-group.svg",
    "website": "https://www.volkswagen-group.com",
    "partnerStatus": "network"
  },
  {
    "name": "Mercedes-Benz Group",
    "slug": "mercedes",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/mercedes.svg",
    "website": "https://www.mercedes.com",
    "partnerStatus": "network"
  },
  {
    "name": "BMW Group",
    "slug": "bmw-group",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/bmw-group.svg",
    "website": "https://www.bmw-group.com",
    "partnerStatus": "network"
  },
  {
    "name": "Ford Motor Company",
    "slug": "ford-motor-company",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/ford-motor-company.svg",
    "website": "https://www.ford-motor-company.com",
    "partnerStatus": "network"
  },
  {
    "name": "General Motors",
    "slug": "general-motors",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/general-motors.svg",
    "website": "https://www.general-motors.com",
    "partnerStatus": "network"
  },
  {
    "name": "Stellantis",
    "slug": "stellantis",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/stellantis.svg",
    "website": "https://www.stellantis.com",
    "partnerStatus": "network"
  },
  {
    "name": "Honda Motor Co.",
    "slug": "honda-motor-co",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/honda-motor-co.svg",
    "website": "https://www.honda-motor-co.com",
    "partnerStatus": "network"
  },
  {
    "name": "Hyundai Motor Group",
    "slug": "hyundai-motor-group",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/hyundai-motor-group.svg",
    "website": "https://www.hyundai-motor-group.com",
    "partnerStatus": "network"
  },
  {
    "name": "Volvo Group",
    "slug": "volvo-group",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/volvo-group.svg",
    "website": "https://www.volvo-group.com",
    "partnerStatus": "network"
  },
  {
    "name": "Rivian",
    "slug": "rivian",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/rivian.svg",
    "website": "https://www.rivian.com",
    "partnerStatus": "network"
  },
  {
    "name": "Lucid Motors",
    "slug": "lucid-motors",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/lucid-motors.svg",
    "website": "https://www.lucid-motors.com",
    "partnerStatus": "network"
  },
  {
    "name": "Mahindra & Mahindra",
    "slug": "mahindra-mahindra",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/mahindra-mahindra.svg",
    "website": "https://www.mahindra-mahindra.com",
    "partnerStatus": "network"
  },
  {
    "name": "Tata Motors",
    "slug": "tata-motors",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/tata-motors.svg",
    "website": "https://www.tata-motors.com",
    "partnerStatus": "network"
  },
  {
    "name": "Bosch",
    "slug": "bosch",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/bosch.svg",
    "website": "https://www.bosch.com",
    "partnerStatus": "network"
  },
  {
    "name": "Continental",
    "slug": "continental",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/continental.svg",
    "website": "https://www.continental.com",
    "partnerStatus": "network"
  },
  {
    "name": "DENSO",
    "slug": "denso",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/denso.svg",
    "website": "https://www.denso.com",
    "partnerStatus": "network"
  },
  {
    "name": "Magna International",
    "slug": "magna-international",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/magna-international.svg",
    "website": "https://www.magna-international.com",
    "partnerStatus": "network"
  },
  {
    "name": "ZF Group",
    "slug": "zf-group",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/zf-group.svg",
    "website": "https://www.zf-group.com",
    "partnerStatus": "network"
  },
  {
    "name": "Boeing",
    "slug": "boeing",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/boeing.svg",
    "website": "https://www.boeing.com",
    "partnerStatus": "network"
  },
  {
    "name": "Airbus",
    "slug": "airbus",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/airbus.svg",
    "website": "https://www.airbus.com",
    "partnerStatus": "network"
  },
  {
    "name": "Lockheed Martin",
    "slug": "lockheed-martin",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/lockheed-martin.svg",
    "website": "https://www.lockheed-martin.com",
    "partnerStatus": "network"
  },
  {
    "name": "Northrop Grumman",
    "slug": "northrop-grumman",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/northrop-grumman.svg",
    "website": "https://www.northrop-grumman.com",
    "partnerStatus": "network"
  },
  {
    "name": "RTX",
    "slug": "rtx",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/rtx.svg",
    "website": "https://www.rtx.com",
    "partnerStatus": "network"
  },
  {
    "name": "General Dynamics",
    "slug": "general-dynamics",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/general-dynamics.svg",
    "website": "https://www.general-dynamics.com",
    "partnerStatus": "network"
  },
  {
    "name": "BAE Systems",
    "slug": "bae-systems",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/bae-systems.svg",
    "website": "https://www.bae-systems.com",
    "partnerStatus": "network"
  },
  {
    "name": "Honeywell",
    "slug": "honeywell",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace",
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/honeywell.svg",
    "website": "https://www.honeywell.com",
    "partnerStatus": "network"
  },
  {
    "name": "Rolls-Royce",
    "slug": "rolls",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/rolls.svg",
    "website": "https://www.rolls.com",
    "partnerStatus": "network"
  },
  {
    "name": "Safran",
    "slug": "safran",
    "industry": "automotive-aerospace",
    "industries": [
      "automotive-aerospace"
    ],
    "logo": "/assets/company-logos/safran.svg",
    "website": "https://www.safran.com",
    "partnerStatus": "network"
  },
  {
    "name": "Walmart",
    "slug": "walmart",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/walmart.svg",
    "website": "https://www.walmart.com",
    "partnerStatus": "network"
  },
  {
    "name": "Target",
    "slug": "target",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/target.svg",
    "website": "https://www.target.com",
    "partnerStatus": "network"
  },
  {
    "name": "The Home Depot",
    "slug": "the-home-depot",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/the-home-depot.svg",
    "website": "https://www.the-home-depot.com",
    "partnerStatus": "network"
  },
  {
    "name": "Lowe's",
    "slug": "lowes",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/lowes.svg",
    "website": "https://www.lowes.com",
    "partnerStatus": "network"
  },
  {
    "name": "Costco Wholesale",
    "slug": "costco-wholesale",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/costco-wholesale.svg",
    "website": "https://www.costco-wholesale.com",
    "partnerStatus": "network"
  },
  {
    "name": "Best Buy",
    "slug": "best-buy",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/best-buy.svg",
    "website": "https://www.best-buy.com",
    "partnerStatus": "network"
  },
  {
    "name": "Kroger",
    "slug": "kroger",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/kroger.svg",
    "website": "https://www.kroger.com",
    "partnerStatus": "network"
  },
  {
    "name": "Alibaba Group",
    "slug": "alibaba-group",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/alibaba-group.svg",
    "website": "https://www.alibaba-group.com",
    "partnerStatus": "network"
  },
  {
    "name": "JD.com",
    "slug": "jdcom",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/jdcom.svg",
    "website": "https://www.jdcom.com",
    "partnerStatus": "network"
  },
  {
    "name": "Rakuten",
    "slug": "rakuten",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/rakuten.svg",
    "website": "https://www.rakuten.com",
    "partnerStatus": "network"
  },
  {
    "name": "eBay",
    "slug": "ebay",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/ebay.svg",
    "website": "https://www.ebay.com",
    "partnerStatus": "network"
  },
  {
    "name": "Shopify",
    "slug": "shopify",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/shopify.svg",
    "website": "https://www.shopify.com",
    "partnerStatus": "network"
  },
  {
    "name": "Wayfair",
    "slug": "wayfair",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/wayfair.svg",
    "website": "https://www.wayfair.com",
    "partnerStatus": "network"
  },
  {
    "name": "Zalando",
    "slug": "zalando",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/zalando.svg",
    "website": "https://www.zalando.com",
    "partnerStatus": "network"
  },
  {
    "name": "Flipkart",
    "slug": "flipkart",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/flipkart.svg",
    "website": "https://www.flipkart.com",
    "partnerStatus": "network"
  },
  {
    "name": "Meesho",
    "slug": "meesho",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/meesho.svg",
    "website": "https://www.meesho.com",
    "partnerStatus": "network"
  },
  {
    "name": "Myntra",
    "slug": "myntra",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/myntra.svg",
    "website": "https://www.myntra.com",
    "partnerStatus": "network"
  },
  {
    "name": "Reliance Retail",
    "slug": "reliance-retail",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/reliance-retail.svg",
    "website": "https://www.reliance-retail.com",
    "partnerStatus": "network"
  },
  {
    "name": "Swiggy",
    "slug": "swiggy",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/swiggy.svg",
    "website": "https://www.swiggy.com",
    "partnerStatus": "network"
  },
  {
    "name": "Zomato",
    "slug": "zomato",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/zomato.svg",
    "website": "https://www.zomato.com",
    "partnerStatus": "network"
  },
  {
    "name": "Uber",
    "slug": "uber",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/uber.svg",
    "website": "https://www.uber.com",
    "partnerStatus": "network"
  },
  {
    "name": "Lyft",
    "slug": "lyft",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/lyft.svg",
    "website": "https://www.lyft.com",
    "partnerStatus": "network"
  },
  {
    "name": "Grab",
    "slug": "grab",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/grab.svg",
    "website": "https://www.grab.com",
    "partnerStatus": "network"
  },
  {
    "name": "DoorDash",
    "slug": "doordash",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/doordash.svg",
    "website": "https://www.doordash.com",
    "partnerStatus": "network"
  },
  {
    "name": "FedEx",
    "slug": "fedex",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/fedex.svg",
    "website": "https://www.fedex.com",
    "partnerStatus": "network"
  },
  {
    "name": "United Parcel Service (UPS)",
    "slug": "united-parcel-service",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/united-parcel-service.svg",
    "website": "https://www.united-parcel-service.com",
    "partnerStatus": "network"
  },
  {
    "name": "DHL Group",
    "slug": "dhl-group",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/dhl-group.svg",
    "website": "https://www.dhl-group.com",
    "partnerStatus": "network"
  },
  {
    "name": "A.P. Moller - Maersk",
    "slug": "ap-moller",
    "industry": "retail-logistics",
    "industries": [
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/ap-moller.svg",
    "website": "https://www.ap-moller.com",
    "partnerStatus": "network"
  },
  {
    "name": "Schneider Electric",
    "slug": "schneider-electric",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy",
      "retail-logistics"
    ],
    "logo": "/assets/company-logos/schneider-electric.svg",
    "website": "https://www.schneider-electric.com",
    "partnerStatus": "network"
  },
  {
    "name": "AT&T",
    "slug": "at-t",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/at-t.svg",
    "website": "https://www.at-t.com",
    "partnerStatus": "network"
  },
  {
    "name": "Verizon",
    "slug": "verizon",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/verizon.svg",
    "website": "https://www.verizon.com",
    "partnerStatus": "network"
  },
  {
    "name": "T-Mobile",
    "slug": "t",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/t.svg",
    "website": "https://www.t.com",
    "partnerStatus": "network"
  },
  {
    "name": "Vodafone Group",
    "slug": "vodafone-group",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/vodafone-group.svg",
    "website": "https://www.vodafone-group.com",
    "partnerStatus": "network"
  },
  {
    "name": "Telefónica",
    "slug": "telefnica",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/telefnica.svg",
    "website": "https://www.telefnica.com",
    "partnerStatus": "network"
  },
  {
    "name": "Orange",
    "slug": "orange",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/orange.svg",
    "website": "https://www.orange.com",
    "partnerStatus": "network"
  },
  {
    "name": "Bharti Airtel",
    "slug": "bharti-airtel",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/bharti-airtel.svg",
    "website": "https://www.bharti-airtel.com",
    "partnerStatus": "network"
  },
  {
    "name": "Reliance Jio",
    "slug": "reliance-jio",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/reliance-jio.svg",
    "website": "https://www.reliance-jio.com",
    "partnerStatus": "network"
  },
  {
    "name": "Comcast",
    "slug": "comcast",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/comcast.svg",
    "website": "https://www.comcast.com",
    "partnerStatus": "network"
  },
  {
    "name": "Charter Communications",
    "slug": "charter-communications",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/charter-communications.svg",
    "website": "https://www.charter-communications.com",
    "partnerStatus": "network"
  },
  {
    "name": "The Walt Disney Company",
    "slug": "the-walt-disney-company",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/the-walt-disney-company.svg",
    "website": "https://www.the-walt-disney-company.com",
    "partnerStatus": "network"
  },
  {
    "name": "Netflix",
    "slug": "netflix",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/netflix.svg",
    "website": "https://www.netflix.com",
    "partnerStatus": "network"
  },
  {
    "name": "Warner Bros. Discovery",
    "slug": "warner-bros-discovery",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/warner-bros-discovery.svg",
    "website": "https://www.warner-bros-discovery.com",
    "partnerStatus": "network"
  },
  {
    "name": "Paramount",
    "slug": "paramount",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/paramount.svg",
    "website": "https://www.paramount.com",
    "partnerStatus": "network"
  },
  {
    "name": "Sony Group Corporation",
    "slug": "sony-group-corporation",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/sony-group-corporation.svg",
    "website": "https://www.sony-group-corporation.com",
    "partnerStatus": "network"
  },
  {
    "name": "Electronic Arts (EA)",
    "slug": "ea",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/ea.svg",
    "website": "https://www.ea.com",
    "partnerStatus": "network"
  },
  {
    "name": "Activision Blizzard",
    "slug": "activision-blizzard",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/activision-blizzard.svg",
    "website": "https://www.activision-blizzard.com",
    "partnerStatus": "network"
  },
  {
    "name": "Take-Two Interactive",
    "slug": "take",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/take.svg",
    "website": "https://www.take.com",
    "partnerStatus": "network"
  },
  {
    "name": "Ubisoft",
    "slug": "ubisoft",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/ubisoft.svg",
    "website": "https://www.ubisoft.com",
    "partnerStatus": "network"
  },
  {
    "name": "Epic Games",
    "slug": "epic-games",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/epic-games.svg",
    "website": "https://www.epic-games.com",
    "partnerStatus": "network"
  },
  {
    "name": "Unity",
    "slug": "unity",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/unity.svg",
    "website": "https://www.unity.com",
    "partnerStatus": "network"
  },
  {
    "name": "Spotify",
    "slug": "spotify",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/spotify.svg",
    "website": "https://www.spotify.com",
    "partnerStatus": "network"
  },
  {
    "name": "ByteDance",
    "slug": "bytedance",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/bytedance.svg",
    "website": "https://www.bytedance.com",
    "partnerStatus": "network"
  },
  {
    "name": "Tencent",
    "slug": "tencent",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/tencent.svg",
    "website": "https://www.tencent.com",
    "partnerStatus": "network"
  },
  {
    "name": "NetEase",
    "slug": "netease",
    "industry": "telecom-media",
    "industries": [
      "telecom-media"
    ],
    "logo": "/assets/company-logos/netease.svg",
    "website": "https://www.netease.com",
    "partnerStatus": "network"
  },
  {
    "name": "McKinsey & Company",
    "slug": "mckinsey-company",
    "industry": "consulting",
    "industries": [
      "consulting"
    ],
    "logo": "/assets/company-logos/mckinsey-company.svg",
    "website": "https://www.mckinsey.com",
    "partnerStatus": "network"
  },
  {
    "name": "Boston Consulting Group (BCG)",
    "slug": "bcg",
    "industry": "consulting",
    "industries": [
      "consulting"
    ],
    "logo": "/assets/company-logos/bcg.svg",
    "website": "https://www.bcg.com",
    "partnerStatus": "network"
  },
  {
    "name": "Bain & Company",
    "slug": "bain-company",
    "industry": "consulting",
    "industries": [
      "consulting"
    ],
    "logo": "/assets/company-logos/bain-company.svg",
    "website": "https://www.bain.com",
    "partnerStatus": "network"
  },
  {
    "name": "Deloitte",
    "slug": "deloitte",
    "industry": "consulting",
    "industries": [
      "consulting"
    ],
    "logo": "/assets/company-logos/deloitte.svg",
    "website": "https://www.deloitte.com",
    "partnerStatus": "network"
  },
  {
    "name": "PwC",
    "slug": "pwc",
    "industry": "consulting",
    "industries": [
      "consulting"
    ],
    "logo": "/assets/company-logos/pwc.svg",
    "website": "https://www.pwc.com",
    "partnerStatus": "network"
  },
  {
    "name": "Ernst & Young (EY)",
    "slug": "ey",
    "industry": "consulting",
    "industries": [
      "consulting"
    ],
    "logo": "/assets/company-logos/ey.svg",
    "website": "https://www.ey.com",
    "partnerStatus": "network"
  },
  {
    "name": "KPMG",
    "slug": "kpmg",
    "industry": "consulting",
    "industries": [
      "consulting"
    ],
    "logo": "/assets/company-logos/kpmg.svg",
    "website": "https://kpmg.com",
    "partnerStatus": "network"
  },
  {
    "name": "Oliver Wyman",
    "slug": "oliver-wyman",
    "industry": "consulting",
    "industries": [
      "consulting"
    ],
    "logo": "/assets/company-logos/oliver-wyman.svg",
    "website": "https://www.oliver-wyman.com",
    "partnerStatus": "network"
  },
  {
    "name": "Booz Allen Hamilton",
    "slug": "booz-allen-hamilton",
    "industry": "consulting",
    "industries": [
      "consulting"
    ],
    "logo": "/assets/company-logos/booz-allen-hamilton.svg",
    "website": "https://www.booz-allen-hamilton.com",
    "partnerStatus": "network"
  },
  {
    "name": "Gartner",
    "slug": "gartner",
    "industry": "consulting",
    "industries": [
      "consulting"
    ],
    "logo": "/assets/company-logos/gartner.svg",
    "website": "https://www.gartner.com",
    "partnerStatus": "network"
  },
  {
    "name": "Forrester",
    "slug": "forrester",
    "industry": "consulting",
    "industries": [
      "consulting"
    ],
    "logo": "/assets/company-logos/forrester.svg",
    "website": "https://www.forrester.com",
    "partnerStatus": "network"
  },
  {
    "name": "Alvarez & Marsal",
    "slug": "alvarez-marsal",
    "industry": "consulting",
    "industries": [
      "consulting"
    ],
    "logo": "/assets/company-logos/alvarez-marsal.svg",
    "website": "https://www.alvarez-marsal.com",
    "partnerStatus": "network"
  },
  {
    "name": "FTI Consulting",
    "slug": "fti-consulting",
    "industry": "consulting",
    "industries": [
      "consulting"
    ],
    "logo": "/assets/company-logos/fti-consulting.svg",
    "website": "https://www.fti-consulting.com",
    "partnerStatus": "network"
  },
  {
    "name": "Huron Consulting Group",
    "slug": "huron-consulting-group",
    "industry": "consulting",
    "industries": [
      "consulting"
    ],
    "logo": "/assets/company-logos/huron-consulting-group.svg",
    "website": "https://www.huron-consulting-group.com",
    "partnerStatus": "network"
  },
  {
    "name": "Mercer",
    "slug": "mercer",
    "industry": "consulting",
    "industries": [
      "consulting"
    ],
    "logo": "/assets/company-logos/mercer.svg",
    "website": "https://www.mercer.com",
    "partnerStatus": "network"
  },
  {
    "name": "Advanced Micro Devices (AMD)",
    "slug": "amd",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/amd.svg",
    "website": "https://www.amd.com",
    "partnerStatus": "network"
  },
  {
    "name": "Intel",
    "slug": "intel",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/intel.svg",
    "website": "https://www.intel.com",
    "partnerStatus": "network"
  },
  {
    "name": "Qualcomm",
    "slug": "qualcomm",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/qualcomm.svg",
    "website": "https://www.qualcomm.com",
    "partnerStatus": "network"
  },
  {
    "name": "Broadcom",
    "slug": "broadcom",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/broadcom.svg",
    "website": "https://www.broadcom.com",
    "partnerStatus": "network"
  },
  {
    "name": "Texas Instruments",
    "slug": "texas-instruments",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/texas-instruments.svg",
    "website": "https://www.texas-instruments.com",
    "partnerStatus": "network"
  },
  {
    "name": "Micron Technology",
    "slug": "micron-technology",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/micron-technology.svg",
    "website": "https://www.micron-technology.com",
    "partnerStatus": "network"
  },
  {
    "name": "Applied Materials",
    "slug": "applied-materials",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/applied-materials.svg",
    "website": "https://www.applied-materials.com",
    "partnerStatus": "network"
  },
  {
    "name": "ASML",
    "slug": "asml",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/asml.svg",
    "website": "https://www.asml.com",
    "partnerStatus": "network"
  },
  {
    "name": "Lam Research",
    "slug": "lam-research",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/lam-research.svg",
    "website": "https://www.lam-research.com",
    "partnerStatus": "network"
  },
  {
    "name": "KLA Corporation",
    "slug": "kla-corporation",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/kla-corporation.svg",
    "website": "https://www.kla-corporation.com",
    "partnerStatus": "network"
  },
  {
    "name": "Synopsys",
    "slug": "synopsys",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/synopsys.svg",
    "website": "https://www.synopsys.com",
    "partnerStatus": "network"
  },
  {
    "name": "Cadence Design Systems",
    "slug": "cadence-design-systems",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/cadence-design-systems.svg",
    "website": "https://www.cadence-design-systems.com",
    "partnerStatus": "network"
  },
  {
    "name": "Marvell Technology",
    "slug": "marvell-technology",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/marvell-technology.svg",
    "website": "https://www.marvell-technology.com",
    "partnerStatus": "network"
  },
  {
    "name": "Arm",
    "slug": "arm",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/arm.svg",
    "website": "https://www.arm.com",
    "partnerStatus": "network"
  },
  {
    "name": "Taiwan Semiconductor Manufacturing Company (TSMC)",
    "slug": "tsmc",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/tsmc.svg",
    "website": "https://www.tsmc.com",
    "partnerStatus": "network"
  },
  {
    "name": "Palo Alto Networks",
    "slug": "palo-alto-networks",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/palo-alto-networks.svg",
    "website": "https://www.palo-alto-networks.com",
    "partnerStatus": "network"
  },
  {
    "name": "Fortinet",
    "slug": "fortinet",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/fortinet.svg",
    "website": "https://www.fortinet.com",
    "partnerStatus": "network"
  },
  {
    "name": "CrowdStrike",
    "slug": "crowdstrike",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/crowdstrike.svg",
    "website": "https://www.crowdstrike.com",
    "partnerStatus": "network"
  },
  {
    "name": "Cloudflare",
    "slug": "cloudflare",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/cloudflare.svg",
    "website": "https://www.cloudflare.com",
    "partnerStatus": "network"
  },
  {
    "name": "Zscaler",
    "slug": "zscaler",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/zscaler.svg",
    "website": "https://www.zscaler.com",
    "partnerStatus": "network"
  },
  {
    "name": "Check Point Software Technologies",
    "slug": "check-point-software-technologies",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/check-point-software-technologies.svg",
    "website": "https://www.check-point-software-technologies.com",
    "partnerStatus": "network"
  },
  {
    "name": "Trend Micro",
    "slug": "trend-micro",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/trend-micro.svg",
    "website": "https://www.trend-micro.com",
    "partnerStatus": "network"
  },
  {
    "name": "Okta",
    "slug": "okta",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/okta.svg",
    "website": "https://www.okta.com",
    "partnerStatus": "network"
  },
  {
    "name": "SentinelOne",
    "slug": "sentinelone",
    "industry": "semiconductors-cybersecurity",
    "industries": [
      "semiconductors-cybersecurity"
    ],
    "logo": "/assets/company-logos/sentinelone.svg",
    "website": "https://www.sentinelone.com",
    "partnerStatus": "network"
  },
  {
    "name": "ExxonMobil",
    "slug": "exxonmobil",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/exxonmobil.svg",
    "website": "https://www.exxonmobil.com",
    "partnerStatus": "network"
  },
  {
    "name": "Chevron",
    "slug": "chevron",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/chevron.svg",
    "website": "https://www.chevron.com",
    "partnerStatus": "network"
  },
  {
    "name": "Shell",
    "slug": "shell",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/shell.svg",
    "website": "https://www.shell.com",
    "partnerStatus": "network"
  },
  {
    "name": "TotalEnergies",
    "slug": "totalenergies",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/totalenergies.svg",
    "website": "https://www.totalenergies.com",
    "partnerStatus": "network"
  },
  {
    "name": "BP",
    "slug": "bp",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/bp.svg",
    "website": "https://www.bp.com",
    "partnerStatus": "network"
  },
  {
    "name": "Saudi Aramco",
    "slug": "saudi-aramco",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/saudi-aramco.svg",
    "website": "https://www.saudi-aramco.com",
    "partnerStatus": "network"
  },
  {
    "name": "General Electric (GE)",
    "slug": "ge",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/ge.svg",
    "website": "https://www.ge.com",
    "partnerStatus": "network"
  },
  {
    "name": "Siemens",
    "slug": "siemens",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/siemens.svg",
    "website": "https://www.siemens.com",
    "partnerStatus": "network"
  },
  {
    "name": "ABB",
    "slug": "abb",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/abb.svg",
    "website": "https://www.abb.com",
    "partnerStatus": "network"
  },
  {
    "name": "Emerson Electric",
    "slug": "emerson-electric",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/emerson-electric.svg",
    "website": "https://www.emerson-electric.com",
    "partnerStatus": "network"
  },
  {
    "name": "Rockwell Automation",
    "slug": "rockwell-automation",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/rockwell-automation.svg",
    "website": "https://www.rockwell-automation.com",
    "partnerStatus": "network"
  },
  {
    "name": "Eaton",
    "slug": "eaton",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/eaton.svg",
    "website": "https://www.eaton.com",
    "partnerStatus": "network"
  },
  {
    "name": "Caterpillar",
    "slug": "caterpillar",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/caterpillar.svg",
    "website": "https://www.caterpillar.com",
    "partnerStatus": "network"
  },
  {
    "name": "Deere & Company",
    "slug": "deere-company",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/deere-company.svg",
    "website": "https://www.deere-company.com",
    "partnerStatus": "network"
  },
  {
    "name": "3M",
    "slug": "3m",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/3m.svg",
    "website": "https://www.3m.com",
    "partnerStatus": "network"
  },
  {
    "name": "Dow",
    "slug": "dow",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/dow.svg",
    "website": "https://www.dow.com",
    "partnerStatus": "network"
  },
  {
    "name": "DuPont",
    "slug": "dupont",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/dupont.svg",
    "website": "https://www.dupont.com",
    "partnerStatus": "network"
  },
  {
    "name": "BASF",
    "slug": "basf",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/basf.svg",
    "website": "https://www.basf.com",
    "partnerStatus": "network"
  },
  {
    "name": "Rio Tinto",
    "slug": "rio-tinto",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/rio-tinto.svg",
    "website": "https://www.rio-tinto.com",
    "partnerStatus": "network"
  },
  {
    "name": "BHP",
    "slug": "bhp",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/bhp.svg",
    "website": "https://www.bhp.com",
    "partnerStatus": "network"
  },
  {
    "name": "SLB",
    "slug": "slb",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/slb.svg",
    "website": "https://www.slb.com",
    "partnerStatus": "network"
  },
  {
    "name": "Halliburton",
    "slug": "halliburton",
    "industry": "manufacturing-energy",
    "industries": [
      "manufacturing-energy"
    ],
    "logo": "/assets/company-logos/halliburton.svg",
    "website": "https://www.halliburton.com",
    "partnerStatus": "network"
  },
  {
    "name": "OpenAI",
    "slug": "openai",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/openai.svg",
    "website": "https://openai.com",
    "partnerStatus": "network"
  },
  {
    "name": "Anthropic",
    "slug": "anthropic",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/anthropic.svg",
    "website": "https://www.anthropic.com",
    "partnerStatus": "network"
  },
  {
    "name": "Cohere",
    "slug": "cohere",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/cohere.svg",
    "website": "https://cohere.com",
    "partnerStatus": "network"
  },
  {
    "name": "Mistral AI",
    "slug": "mistral-ai",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/mistral-ai.svg",
    "website": "https://mistral.ai",
    "partnerStatus": "network"
  },
  {
    "name": "Perplexity AI",
    "slug": "perplexity-ai",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/perplexity-ai.svg",
    "website": "https://www.perplexity.ai",
    "partnerStatus": "network"
  },
  {
    "name": "Midjourney",
    "slug": "midjourney",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/midjourney.svg",
    "website": "https://www.midjourney.com",
    "partnerStatus": "network"
  },
  {
    "name": "Runway",
    "slug": "runway",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/runway.svg",
    "website": "https://www.runway.com",
    "partnerStatus": "network"
  },
  {
    "name": "Stability AI",
    "slug": "stability-ai",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/stability-ai.svg",
    "website": "https://www.stability-ai.com",
    "partnerStatus": "network"
  },
  {
    "name": "Scale AI",
    "slug": "scale-ai",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/scale-ai.svg",
    "website": "https://www.scale-ai.com",
    "partnerStatus": "network"
  },
  {
    "name": "Hugging Face",
    "slug": "hugging-face",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/hugging-face.svg",
    "website": "https://www.hugging-face.com",
    "partnerStatus": "network"
  },
  {
    "name": "LangChain",
    "slug": "langchain",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/langchain.svg",
    "website": "https://www.langchain.com",
    "partnerStatus": "network"
  },
  {
    "name": "Significant Gravitas",
    "slug": "significant-gravitas",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/significant-gravitas.svg",
    "website": "https://www.significant-gravitas.com",
    "partnerStatus": "network"
  },
  {
    "name": "Cognition",
    "slug": "cognition",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/cognition.svg",
    "website": "https://www.cognition.com",
    "partnerStatus": "network"
  },
  {
    "name": "Poolside",
    "slug": "poolside",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/poolside.svg",
    "website": "https://www.poolside.com",
    "partnerStatus": "network"
  },
  {
    "name": "Harvey",
    "slug": "harvey",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/harvey.svg",
    "website": "https://www.harvey.com",
    "partnerStatus": "network"
  },
  {
    "name": "Glean",
    "slug": "glean",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/glean.svg",
    "website": "https://www.glean.com",
    "partnerStatus": "network"
  },
  {
    "name": "Writer",
    "slug": "writer",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/writer.svg",
    "website": "https://www.writer.com",
    "partnerStatus": "network"
  },
  {
    "name": "Jasper",
    "slug": "jasper",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/jasper.svg",
    "website": "https://www.jasper.com",
    "partnerStatus": "network"
  },
  {
    "name": "Copy.ai",
    "slug": "copyai",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/copyai.svg",
    "website": "https://www.copyai.com",
    "partnerStatus": "network"
  },
  {
    "name": "C3 AI",
    "slug": "c3-ai",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/c3-ai.svg",
    "website": "https://www.c3-ai.com",
    "partnerStatus": "network"
  },
  {
    "name": "AI21 Labs",
    "slug": "ai21-labs",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/ai21-labs.svg",
    "website": "https://www.ai21-labs.com",
    "partnerStatus": "network"
  },
  {
    "name": "Character.AI",
    "slug": "characterai",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/characterai.svg",
    "website": "https://www.characterai.com",
    "partnerStatus": "network"
  },
  {
    "name": "Synthesia",
    "slug": "synthesia",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/synthesia.svg",
    "website": "https://www.synthesia.com",
    "partnerStatus": "network"
  },
  {
    "name": "ElevenLabs",
    "slug": "elevenlabs",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/elevenlabs.svg",
    "website": "https://www.elevenlabs.com",
    "partnerStatus": "network"
  },
  {
    "name": "SoundHound AI",
    "slug": "soundhound-ai",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/soundhound-ai.svg",
    "website": "https://www.soundhound-ai.com",
    "partnerStatus": "network"
  },
  {
    "name": "DataRobot",
    "slug": "datarobot",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/datarobot.svg",
    "website": "https://www.datarobot.com",
    "partnerStatus": "network"
  },
  {
    "name": "H2O.ai",
    "slug": "h2oai",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/h2oai.svg",
    "website": "https://www.h2oai.com",
    "partnerStatus": "network"
  },
  {
    "name": "Domino Data Lab",
    "slug": "domino-data-lab",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/domino-data-lab.svg",
    "website": "https://www.domino-data-lab.com",
    "partnerStatus": "network"
  },
  {
    "name": "Pinecone",
    "slug": "pinecone",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/pinecone.svg",
    "website": "https://www.pinecone.com",
    "partnerStatus": "network"
  },
  {
    "name": "Weaviate",
    "slug": "weaviate",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/weaviate.svg",
    "website": "https://www.weaviate.com",
    "partnerStatus": "network"
  },
  {
    "name": "Qdrant",
    "slug": "qdrant",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/qdrant.svg",
    "website": "https://www.qdrant.com",
    "partnerStatus": "network"
  },
  {
    "name": "Chroma",
    "slug": "chroma",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/chroma.svg",
    "website": "https://www.chroma.com",
    "partnerStatus": "network"
  },
  {
    "name": "Neo4j",
    "slug": "neo4j",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/neo4j.svg",
    "website": "https://www.neo4j.com",
    "partnerStatus": "network"
  },
  {
    "name": "AssemblyAI",
    "slug": "assemblyai",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/assemblyai.svg",
    "website": "https://www.assemblyai.com",
    "partnerStatus": "network"
  },
  {
    "name": "Deepgram",
    "slug": "deepgram",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/deepgram.svg",
    "website": "https://www.deepgram.com",
    "partnerStatus": "network"
  },
  {
    "name": "Unstructured",
    "slug": "unstructured",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/unstructured.svg",
    "website": "https://www.unstructured.com",
    "partnerStatus": "network"
  },
  {
    "name": "LlamaIndex",
    "slug": "llamaindex",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/llamaindex.svg",
    "website": "https://www.llamaindex.com",
    "partnerStatus": "network"
  },
  {
    "name": "Weights & Biases",
    "slug": "weights-biases",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/weights-biases.svg",
    "website": "https://www.weights-biases.com",
    "partnerStatus": "network"
  },
  {
    "name": "Arize AI",
    "slug": "arize-ai",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/arize-ai.svg",
    "website": "https://www.arize-ai.com",
    "partnerStatus": "network"
  },
  {
    "name": "TruEra",
    "slug": "truera",
    "industry": "ai-companies",
    "industries": [
      "ai-companies"
    ],
    "logo": "/assets/company-logos/truera.svg",
    "website": "https://www.truera.com",
    "partnerStatus": "network"
  },
  {
    "name": "Fractal Analytics",
    "slug": "fractal-analytics",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/fractal-analytics.svg",
    "website": "https://fractal.ai",
    "partnerStatus": "network"
  },
  {
    "name": "Tiger Analytics",
    "slug": "tiger-analytics",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/tiger-analytics.svg",
    "website": "https://www.tigeranalytics.com",
    "partnerStatus": "network"
  },
  {
    "name": "Mu Sigma",
    "slug": "mu-sigma",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/mu-sigma.svg",
    "website": "https://www.mu-sigma.com",
    "partnerStatus": "network"
  },
  {
    "name": "Tredence",
    "slug": "tredence",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/tredence.svg",
    "website": "https://www.tredence.com",
    "partnerStatus": "network"
  },
  {
    "name": "LatentView Analytics",
    "slug": "latentview-analytics",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/latentview-analytics.svg",
    "website": "https://www.latentview.com",
    "partnerStatus": "network"
  },
  {
    "name": "LeewayHertz",
    "slug": "leewayhertz",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/leewayhertz.svg",
    "website": "https://www.leewayhertz.com",
    "partnerStatus": "network"
  },
  {
    "name": "Appinventiv",
    "slug": "appinventiv",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/appinventiv.svg",
    "website": "https://www.appinventiv.com",
    "partnerStatus": "network"
  },
  {
    "name": "Azilen Technologies",
    "slug": "azilen-technologies",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/azilen-technologies.svg",
    "website": "https://www.azilen-technologies.com",
    "partnerStatus": "network"
  },
  {
    "name": "Ksolves",
    "slug": "ksolves",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/ksolves.svg",
    "website": "https://www.ksolves.com",
    "partnerStatus": "network"
  },
  {
    "name": "Simform",
    "slug": "simform",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/simform.svg",
    "website": "https://www.simform.com",
    "partnerStatus": "network"
  },
  {
    "name": "Soulpage IT Solutions",
    "slug": "soulpage-it-solutions",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/soulpage-it-solutions.svg",
    "website": "https://www.soulpage-it-solutions.com",
    "partnerStatus": "network"
  },
  {
    "name": "Jellyfish Technologies",
    "slug": "jellyfish-technologies",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/jellyfish-technologies.svg",
    "website": "https://www.jellyfish-technologies.com",
    "partnerStatus": "network"
  },
  {
    "name": "Levitation Infotech",
    "slug": "levitation-infotech",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/levitation-infotech.svg",
    "website": "https://www.levitation-infotech.com",
    "partnerStatus": "network"
  },
  {
    "name": "Krutrim",
    "slug": "krutrim",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/krutrim.svg",
    "website": "https://www.krutrim.com",
    "partnerStatus": "network"
  },
  {
    "name": "Sarvam AI",
    "slug": "sarvam-ai",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/sarvam-ai.svg",
    "website": "https://www.sarvam-ai.com",
    "partnerStatus": "network"
  },
  {
    "name": "Korbit AI",
    "slug": "korbit-ai",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/korbit-ai.svg",
    "website": "https://www.korbit-ai.com",
    "partnerStatus": "network"
  },
  {
    "name": "Yellow.ai",
    "slug": "yellowai",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/yellowai.svg",
    "website": "https://www.yellowai.com",
    "partnerStatus": "network"
  },
  {
    "name": "Gupshup",
    "slug": "gupshup",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/gupshup.svg",
    "website": "https://www.gupshup.com",
    "partnerStatus": "network"
  },
  {
    "name": "Uniphore",
    "slug": "uniphore",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/uniphore.svg",
    "website": "https://www.uniphore.com",
    "partnerStatus": "network"
  },
  {
    "name": "Haptik",
    "slug": "haptik",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/haptik.svg",
    "website": "https://www.haptik.com",
    "partnerStatus": "network"
  },
  {
    "name": "InMobi",
    "slug": "inmobi",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/inmobi.svg",
    "website": "https://www.inmobi.com",
    "partnerStatus": "network"
  },
  {
    "name": "Glance",
    "slug": "glance",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/glance.svg",
    "website": "https://www.glance.com",
    "partnerStatus": "network"
  },
  {
    "name": "Zoho",
    "slug": "zoho",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/zoho.svg",
    "website": "https://www.zoho.com",
    "partnerStatus": "network"
  },
  {
    "name": "Freshworks",
    "slug": "freshworks",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/freshworks.svg",
    "website": "https://www.freshworks.com",
    "partnerStatus": "network"
  },
  {
    "name": "BrowserStack",
    "slug": "browserstack",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/browserstack.svg",
    "website": "https://www.browserstack.com",
    "partnerStatus": "network"
  },
  {
    "name": "Postman",
    "slug": "postman",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/postman.svg",
    "website": "https://www.postman.com",
    "partnerStatus": "network"
  },
  {
    "name": "Druva",
    "slug": "druva",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/druva.svg",
    "website": "https://www.druva.com",
    "partnerStatus": "network"
  },
  {
    "name": "Icertis",
    "slug": "icertis",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/icertis.svg",
    "website": "https://www.icertis.com",
    "partnerStatus": "network"
  },
  {
    "name": "Zenoti",
    "slug": "zenoti",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/zenoti.svg",
    "website": "https://www.zenoti.com",
    "partnerStatus": "network"
  },
  {
    "name": "Chargebee",
    "slug": "chargebee",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/chargebee.svg",
    "website": "https://www.chargebee.com",
    "partnerStatus": "network"
  },
  {
    "name": "Darwinbox",
    "slug": "darwinbox",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/darwinbox.svg",
    "website": "https://www.darwinbox.com",
    "partnerStatus": "network"
  },
  {
    "name": "Mindtickle",
    "slug": "mindtickle",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/mindtickle.svg",
    "website": "https://www.mindtickle.com",
    "partnerStatus": "network"
  },
  {
    "name": "LeadSquared",
    "slug": "leadsquared",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/leadsquared.svg",
    "website": "https://www.leadsquared.com",
    "partnerStatus": "network"
  },
  {
    "name": "Amagi",
    "slug": "amagi",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/amagi.svg",
    "website": "https://www.amagi.com",
    "partnerStatus": "network"
  },
  {
    "name": "RateGain",
    "slug": "rategain",
    "industry": "indian-ai",
    "industries": [
      "indian-ai"
    ],
    "logo": "/assets/company-logos/rategain.svg",
    "website": "https://www.rategain.com",
    "partnerStatus": "network"
  }
];
