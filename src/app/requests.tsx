import { Link, useParams } from "react-router";
import { Check, ChevronLeft, ShieldCheck } from "lucide-react";
import { useStore, type QuoteRequest } from "./store";
import { Button, Field } from "./ui";

const STATUS_OPTIONS = ["Pending Review", "Under Review", "More Information Required", "Quote Prepared", "Awaiting Confirmation", "In Transit", "Delivered", "Cancelled"];

const statusClass = (status: string) => `status status-${status.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");

export function RequestDetail({ admin = false }: { admin?: boolean }) {
  const { id } = useParams();
  const { requests, updateRequestStatus } = useStore();
  const request = requests.find((r) => r.id === id || r.reference === id);

  if (!request) {
    return <div className="dashboard"><div className="backline"><Link to={admin ? "/admin/requests" : "/portal/requests"}><ChevronLeft /> Back to requests</Link></div><div className="empty-state panel"><h2>Request not found</h2><p>This request may have been removed, or you do not have access to it.</p></div></div>;
  }

  const r: QuoteRequest = request;
  const facts: [string, string][] = [
    ["Origin", [r.origin, r.originCountry].filter(Boolean).join(", ") || "—"],
    ["Destination", [r.destination, r.destinationCountry].filter(Boolean).join(", ") || "—"],
    ["Method", r.method || "—"],
    ["Load type", r.loadType || "—"],
    ["Equipment", r.equipment || "—"],
    ["Cargo", r.cargo || "General cargo"],
    ["Weight / Volume", [r.weight && `${r.weight} kg`, r.volume && `${r.volume} CBM`].filter(Boolean).join(" / ") || "—"],
    ["Pieces / cartons", r.pieces || "—"],
    ["Ready date", r.readyDate ? new Date(r.readyDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"],
    ["Incoterm", r.incoterm || "Not specified"],
    ["Pickup", r.pickup || "—"],
    ["Delivery", r.delivery || "—"],
    ["Special handling", r.specialHandling || "None"],
  ];

  return <div className="dashboard">
    <div className="backline"><Link to={admin ? "/admin/requests" : "/portal/requests"}><ChevronLeft /> Back to requests</Link><span>Reference {r.reference}</span></div>
    <div className="detail-heading"><div><span>{r.reference}</span><h1>{r.origin || "Origin"} → {r.destination || "Destination"}</h1><p>{r.method} · {r.equipment || r.loadType} · Submitted {fmt(r.createdAt)}</p></div><i className={statusClass(r.status)}>{r.status}</i></div>
    <div className="request-detail-grid">
      <section className="panel detail-section">
        <h2>Shipment details</h2>
        <div className="fact-grid">{facts.map(([label, value]) => <span key={label}><small>{label}</small><b>{value}</b></span>)}</div>
        {r.description && <><h2>Description</h2><p className="detail-text">{r.description}</p></>}
        {r.notes && <><h2>Customer notes</h2><p className="detail-text">{r.notes}</p></>}
        <h2>Customer-visible timeline</h2>
        <div className="mini-timeline"><div><i><Check /></i><span><b>Request submitted</b><small>{fmt(r.createdAt)} · {r.contactName || "Customer"}</small></span></div><div><i /><span><b>{r.status}</b><small>Current status</small></span></div></div>
      </section>
      <aside>
        {admin
          ? <section className="panel action-box"><h2>Customer &amp; admin actions</h2>
            <Field label="Customer"><b>{r.contactName || "—"}</b></Field>
            {r.company && <Field label="Company"><b>{r.company}</b></Field>}
            <Field label="Email"><b>{r.email || "—"}</b></Field>
            <Field label="Phone / WhatsApp"><b>{r.phone || "—"}</b></Field>
            <Field label="Update status"><select value={r.status} onChange={(e) => updateRequestStatus(r.id, e.target.value)}>{STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}</select></Field>
          </section>
          : <section className="panel action-box"><h2>Your contact details</h2>
            <div className="fact-grid"><span><small>Name</small><b>{r.contactName || "—"}</b></span><span><small>Company</small><b>{r.company || "—"}</b></span><span><small>Email</small><b>{r.email || "—"}</b></span><span><small>Phone</small><b>{r.phone || "—"}</b></span></div>
            <Button variant="secondary"><ShieldCheck /> Reference {r.reference}</Button>
          </section>}
      </aside>
    </div>
  </div>;
}

export default RequestDetail;
