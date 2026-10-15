export type FreightRate = {
  id: string;
  origin: string;
  originCountry: string;
  destination: string;
  destinationCountry: string;
  service: "Sea Freight" | "Air Freight" | "Warehousing";
  equipment: string;
  unit: string;
  price: number | null;
  transit: string;
  updated: string;
  availability: "Published" | "Custom quote";
};

export const rates: FreightRate[] = [
  { id: "GZ-LAX-40", origin: "Guangzhou", originCountry: "China", destination: "Los Angeles", destinationCountry: "United States", service: "Sea Freight", equipment: "40ft HC", unit: "container", price: 2840, transit: "18–24 days", updated: "May 24, 2025", availability: "Published" },
  { id: "SZ-LON-AIR", origin: "Shenzhen", originCountry: "China", destination: "London", destinationCountry: "United Kingdom", service: "Air Freight", equipment: "General cargo", unit: "kg", price: 4.85, transit: "4–7 days", updated: "May 22, 2025", availability: "Published" },
  { id: "SHA-DXB-LCL", origin: "Shanghai", originCountry: "China", destination: "Dubai", destinationCountry: "United Arab Emirates", service: "Sea Freight", equipment: "LCL", unit: "CBM", price: 118, transit: "16–21 days", updated: "May 21, 2025", availability: "Published" },
  { id: "NGB-RTM-20", origin: "Ningbo", originCountry: "China", destination: "Rotterdam", destinationCountry: "Netherlands", service: "Sea Freight", equipment: "20ft GP", unit: "container", price: 2130, transit: "28–34 days", updated: "May 20, 2025", availability: "Published" },
  { id: "GZ-KHI-LCL", origin: "Guangzhou", originCountry: "China", destination: "Karachi", destinationCountry: "Pakistan", service: "Sea Freight", equipment: "LCL", unit: "CBM", price: null, transit: "14–19 days", updated: "May 18, 2025", availability: "Custom quote" },
  { id: "HKG-JFK-AIR", origin: "Hong Kong", originCountry: "China", destination: "New York", destinationCountry: "United States", service: "Air Freight", equipment: "Priority cargo", unit: "kg", price: 5.62, transit: "3–5 days", updated: "May 17, 2025", availability: "Published" },
];

export const demoRequests = [
  { id: "RQ-2025-1048", route: "Guangzhou → Los Angeles", service: "Sea Freight", date: "May 24, 2025", amount: "$2,840 est.", status: "Pending Review", updated: "2 hours ago" },
  { id: "RQ-2025-0981", route: "Shenzhen → London", service: "Air Freight", date: "May 12, 2025", amount: "$1,746 quoted", status: "Awaiting Confirmation", updated: "Yesterday" },
  { id: "RQ-2025-0724", route: "Shanghai → Dubai", service: "Sea Freight", date: "Apr 18, 2025", amount: "$944 confirmed", status: "In Transit", updated: "May 23, 2025" },
  { id: "RQ-2025-0519", route: "Ningbo → Rotterdam", service: "Sea Freight", date: "Mar 29, 2025", amount: "$2,130 confirmed", status: "Delivered", updated: "May 14, 2025" },
];

export const serviceCopy = {
  "sea-freight": {
    eyebrow: "Ocean logistics",
    title: "Sea freight built around your supply chain.",
    text: "Flexible FCL and LCL options, expert route planning, and transparent milestones from origin port to final destination.",
  },
  "air-freight": {
    eyebrow: "Priority logistics",
    title: "Move urgent cargo with clarity.",
    text: "Reliable air cargo solutions with weight-based pricing, priority options, and proactive status updates.",
  },
  warehousing: {
    eyebrow: "Cargo operations",
    title: "One place to receive, consolidate, and prepare.",
    text: "Flexible origin warehousing for receiving, storage, consolidation, inspection, and export preparation.",
  },
};
