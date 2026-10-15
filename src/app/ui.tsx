import { ArrowRight, Bell, Box, ChevronDown, Container, Globe2, LogOut, Menu, Plane, Search, ShieldCheck, Ship, Warehouse, X } from "lucide-react";
import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { useStore } from "./store";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className={`logo ${inverse ? "logo-inverse" : ""}`}       aria-label="Guangzhou Global Gate home">
      <span className="logo-mark"><span /></span>
      <span>GUANGZHOU<small>GLOBAL GATE</small></span>
    </Link>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "dark" }) {
  return <button className={`btn btn-${variant} ${className}`} {...props}>{children}</button>;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { session, logout } = useStore();
  return (
    <>
      <header className="site-header">
        <div className="nav-wrap">
          <Logo />
          <nav className={open ? "main-nav open" : "main-nav"}>
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/services">Services</NavLink>
            <NavLink to="/freight-rates">Freight Rates</NavLink>
            <NavLink to="/tracking">Track Shipment</NavLink>
            <a href="/#how">How It Works</a>
          </nav>
          <div className="nav-actions">
            {session ? (
              <div className="profile-menu">
                <button className="avatar" aria-label="Account menu" aria-expanded={profileOpen} onClick={() => setProfileOpen(!profileOpen)}>{session.name.split(" ").map((n) => n[0]).join("")}</button>
                <div className={profileOpen ? "profile-pop open" : "profile-pop"}>
                  <strong>{session.name}</strong><span>{session.email}</span>
                  <Link to="/portal" onClick={() => setProfileOpen(false)}>My portal</Link>
                  {session.role === "admin" && <Link className="admin-link" to="/admin" onClick={() => setProfileOpen(false)}><ShieldCheck size={15} /> Admin Console</Link>}
                  <button onClick={() => { setProfileOpen(false); logout(); }}><LogOut size={15} /> Sign out</button>
                </div>
              </div>
            ) : <Link className="signin" to="/login">Sign In</Link>}
            <Link className="btn btn-primary quote-nav" to="/request-quote">Get a Quote <ArrowRight size={16} /></Link>
            <button className="mobile-menu" aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
          </div>
        </div>
      </header>
      <Ticker />
    </>
  );
}

export function Ticker() {
  const { rates } = useStore();
  if (!rates.length) return null;
  const items = rates.map((r) => ({ id: r.id, text: `${r.origin} → ${r.destination} · ${r.price ? `from $${r.price.toLocaleString()} / ${r.unit}` : "custom quote"} · ${r.service.replace(/ Freight$/i, "").toLowerCase()}` }));
  return <div className="ticker"><div className="ticker-track">{[...items, ...items].map((item, i) => <Link to={`/freight-rates/${item.id}`} key={i}><span>ILLUSTRATIVE RATE</span>{item.text}</Link>)}</div></div>;
}

export function PublicLayout() {
  return <div><Header /><main><Outlet /></main><Footer /></div>;
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div><Logo inverse /><p>International freight, made visible from first quote to final milestone.</p><div className="status-pill"><span /> Platform demo · integrations pending</div></div>
        <div><b>Solutions</b><Link to="/services/sea-freight">Sea freight</Link><Link to="/services/air-freight">Air freight</Link><Link to="/services/warehousing">Warehousing</Link><Link to="/freight-rates">Freight rates</Link></div>
        <div><b>Company</b><Link to="/about">About</Link><Link to="/contact">Contact</Link><Link to="/tracking">Shipment tracking</Link><Link to="/portal">Customer portal</Link></div>
        <div><b>Get in touch</b><p>support@arclane.example<br />Mon–Fri, 08:00–18:00 UTC</p><Link className="footer-link" to="/contact">Contact our team <ArrowRight size={14} /></Link></div>
      </div>
      <div className="footer-bottom"><span>© 2025 Guangzhou Global Gate. Demonstration experience.</span><div><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div></div>
    </footer>
  );
}

export const serviceIcons = { "Sea Freight": Ship, "Air Freight": Plane, Warehousing: Warehouse };

const heroImage = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&fm=jpg&q=70&w=1920`;

export const heroImages = {
  default: heroImage("photo-1759389003827-2a214e4c73b4"),
  services: heroImage("photo-1778441531349-b0c874287ebc"),
  sea: heroImage("photo-1755428855454-56c364d2a808"),
  air: heroImage("photo-1752901814805-e074a23559f6"),
  warehouse: heroImage("photo-1761853448290-790fa53a2910"),
  rates: heroImage("photo-1755288208009-a0d7c666962b"),
  tracking: heroImage("photo-1761307234324-0c9eadb951de"),
};

export function PageHero({ eyebrow, title, text, image = heroImages.default, children }: { eyebrow: string; title: string; text: string; image?: string; children?: ReactNode }) {
  return (
    <section className="page-hero">
      <div className="page-hero-photo" style={{ backgroundImage: `url(${image})` }} />
      <div className="page-hero-shade" />
      <div className="page-hero-content">
        <div className="eyebrow light">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{text}</p>
        {children}
      </div>
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

export function EmptyPage({ title }: { title: string }) {
  return <PageHero eyebrow="Arclane" title={title} text="This area is prepared for your live content and Supabase-backed workflow."><Link className="btn btn-primary" to="/contact">Talk to support <ArrowRight size={16} /></Link></PageHero>;
}

const portalLinks = [
  ["Overview", "/portal", Globe2], ["My Requests", "/portal/requests", Box], ["My Shipments", "/portal/shipments", Container], ["Track Shipment", "/tracking", Search], ["Saved Routes", "/portal/saved-routes", Ship], ["Notifications", "/portal/notifications", Bell],
];
const adminLinks = [
  ["Overview", "/admin", Globe2], ["All Requests", "/admin/requests", Box], ["Active Shipments", "/admin/shipments", Container], ["Freight Rates", "/admin/rates", Ship], ["Route Management", "/admin/routes", Globe2], ["Customers", "/admin/customers", Bell], ["Revenue & Reports", "/admin/reports", Search],
];

export function AppShell({ admin = false }: { admin?: boolean }) {
  const { session, logout } = useStore();
  const navigate = useNavigate();
  const links = admin ? adminLinks : portalLinks;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo inverse />
        <div className="workspace-label">{admin ? "Operations workspace" : "Customer workspace"}</div>
        <nav>{links.map(([label, href, Icon]) => <NavLink key={href as string} to={href as string} end={href === (admin ? "/admin" : "/portal")}><Icon size={18} />{label}<span>›</span></NavLink>)}</nav>
        <div className="sidebar-bottom"><Link to="/">← Back to website</Link><button onClick={() => { logout(); navigate("/"); }}><LogOut size={17} /> Sign out</button></div>
      </aside>
      <div className="app-main">
        <div className="app-topbar"><div><span>{admin ? "ADMIN PORTAL" : "MY PORTAL"}</span><strong>{admin ? "Operations Center" : "Customer Portal"}</strong></div><div className="top-actions"><button><Search size={18} /></button><button><Bell size={18} /><i /></button><div className="user-chip"><span>{(session?.name || "Jordan Lee").split(" ").map(n => n[0]).join("")}</span><div><b>{session?.name || "Jordan Lee"}</b><small>{admin ? "Administrator" : "Customer"}</small></div><ChevronDown size={15} /></div></div></div>
        <Outlet />
      </div>
    </div>
  );
}
