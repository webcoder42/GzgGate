import { useEffect, useMemo, useState, type FormEvent } from "react";
import Country from "country-state-city/lib/country";
import type { ICity } from "country-state-city/lib/interface";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router";
import { ArrowRight, BarChart3, Bookmark, Box, Check, CheckCircle2, ChevronLeft, ChevronRight, CircleDollarSign, Clock3, Container, Download, Filter, Globe2, Heart, Layers3, MapPin, MoreHorizontal, PackageCheck, Plane, Plus, Search, ShieldCheck, Ship, SlidersHorizontal, Sparkles, Trash2, TrendingUp, Warehouse, X } from "lucide-react";
import { serviceCopy, type FreightRate } from "./data";
import { Button, EmptyPage, Field, heroImages, PageHero, serviceIcons } from "./ui";
import { useStore, type QuoteRequest } from "./store";

export const STATUS_OPTIONS = ["Pending Review", "Under Review", "More Information Required", "Quote Prepared", "Awaiting Confirmation", "In Transit", "Delivered", "Cancelled"];
const statusClass = (status: string) => `status status-${status.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

const heroPhoto = "https://images.unsplash.com/photo-1606185540834-d6e7483ee1a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=85&w=1800";

const countries = Country.getAllCountries().slice().sort((a, b) => a.name.localeCompare(b.name));
const countryCodeFor = (name?: string) => countries.find((c) => c.name === name)?.isoCode ?? "";

const cityCache = new Map<string, ICity[]>();
function useCitiesOfCountry(code?: string) {
  const [cities, setCities] = useState<ICity[]>([]);
  useEffect(() => {
    if (!code) { setCities([]); return; }
    const cached = cityCache.get(code);
    if (cached) { setCities(cached); return; }
    let active = true;
    import("country-state-city/lib/city").then(({ default: City }) => {
      const list = City.getCitiesOfCountry(code) ?? [];
      cityCache.set(code, list);
      if (active) setCities(list);
    });
    return () => { active = false; };
  }, [code]);
  return cities;
}

export function Home() {
  const { rates } = useStore();
  const navigate = useNavigate();
  const [route, setRoute] = useState({ from: "", to: "", service: "" });
  const [error, setError] = useState(false);
  const search = (e: FormEvent) => {
    e.preventDefault();
    if (!route.from || !route.to || !route.service) return setError(true);
    navigate(`/freight-rates?origin=${route.from}&destination=${route.to}&service=${route.service}`);
  };
  return (
    <>
      <section className="hero">
        <div className="hero-photo" style={{ backgroundImage: `url(${heroPhoto})` }} />
        <div className="hero-shade" />
        <div className="hero-content">
          <div className="eyebrow light"><Sparkles size={15} /> China To The World</div>
          <h1><span>Connecting China</span><span className="hero-stroke">To The <em>World</em></span></h1>
          <p>Reliable logistics solutions for sea freight, air freight and warehousing support from China.</p>
          <div className="hero-actions"><Link className="btn btn-primary" to="/request-quote">Start a shipment <ArrowRight size={17} /></Link><Link className="btn btn-glass" to="/tracking">Track shipment</Link></div>
          <div className="hero-proof"><div><Globe2 /><span><b>Global route network</b><small>Flexible multimodal coverage</small></span></div><div><ShieldCheck /><span><b>Visible by default</b><small>Milestone-based updates</small></span></div></div>
        </div>
        <form className="route-search" onSubmit={search}>
          <div className="search-top"><div><span>01</span><div><b>Find your freight route</b><small>Compare current illustrative rates</small></div></div></div>
          <div className="search-grid">
            <Field label="Origin"><select value={route.from} onChange={(e) => setRoute({ ...route, from: e.target.value })}><option value="">Country or port</option><option>Guangzhou</option><option>Shenzhen</option><option>Shanghai</option><option>Ningbo</option></select></Field>
            <Field label="Destination"><select value={route.to} onChange={(e) => setRoute({ ...route, to: e.target.value })}><option value="">Country or port</option><option>Los Angeles</option><option>London</option><option>Dubai</option><option>Rotterdam</option></select></Field>
            <Field label="Shipping method"><select value={route.service} onChange={(e) => setRoute({ ...route, service: e.target.value })}><option value="">Select service</option><option>Sea Freight</option><option>Air Freight</option></select></Field>
            <Field label="Cargo ready"><input type="date" /></Field>
          </div>
          {error && <div className="form-error">Choose an origin, destination, and shipping method.</div>}
          <Button type="submit">Find Freight Rates <ArrowRight size={17} /></Button>
        </form>
      </section>

      <section className="logo-strip"><span>BUILT FOR MODERN SUPPLY CHAINS</span><div><b>PORT</b>CONNECT</div><div>NORTH<em>STAR</em></div><div>AXIS CARGO</div><div>MERIDIAN</div><div>BLUEBOX</div></section>

      <section className="section routes-section">
        <div className="section-head"><div><div className="eyebrow">Live opportunity board</div><h2>Popular shipping routes</h2><p>Explore sample pricing across our most requested freight corridors.</p></div><Link to="/freight-rates">View all rates <ArrowRight size={16} /></Link></div>
        <div className="route-cards">
          {rates.slice(0, 4).map((rate, i) => {
            const Icon = serviceIcons[rate.service];
            return <article className={`route-card ${i === 0 ? "featured" : ""}`} key={rate.id}>
              <div className="route-top"><span className="service-icon"><Icon /></span><span className="availability"><i /> {rate.availability}</span></div>
              <div className="route-line"><div><small>{rate.originCountry}</small><strong>{rate.origin}</strong></div><span><i /><i /><i /><i /></span><div><small>{rate.destinationCountry}</small><strong>{rate.destination}</strong></div></div>
              <div className="route-meta"><span><Clock3 /> {rate.transit}</span><span><Box /> {rate.equipment}</span></div>
              <div className="price"><small>{rate.price ? "ILLUSTRATIVE FROM" : "PRICING"}</small><b>{rate.price ? `$${rate.price.toLocaleString()}` : "Custom quote"}</b>{rate.price && <span>/ {rate.unit}</span>}</div>
              <div className="card-actions"><Link to={`/freight-rates/${rate.id}`}>View rate</Link><Link to={`/request-quote?rate=${rate.id}`}>Request shipment <ArrowRight size={15} /></Link></div>
            </article>;
          })}
        </div>
        <p className="rate-note">All prices shown are illustrative demo data, not live commercial quotations. Final pricing is confirmed after review.</p>
      </section>

      <section className="services-block section">
        <div className="section-head center"><div><div className="eyebrow">End-to-end capability</div><h2>One partner. Every freight mode.</h2><p>From factory floor to final destination, choose the exact support your cargo needs.</p></div></div>
        <div className="service-cards">
          {[
            ["Sea Freight", "FCL and LCL ocean freight with flexible container options and strategic route planning.", Ship, "sea-freight"],
            ["Air Freight", "Priority air cargo and express options for time-sensitive, weight-based shipments.", Plane, "air-freight"],
            ["Warehousing", "Origin receiving, secure storage, consolidation, and export-ready preparation.", Warehouse, "warehousing"],
          ].map(([title, text, Icon, slug], i) => <article className="service-card" key={title as string}><span className="service-no">0{i + 1}</span><Icon /><h3>{title as string}</h3><p>{text as string}</p><Link to={`/services/${slug}`}>Explore service <ArrowRight size={16} /></Link></article>)}
        </div>
      </section>

      <section className="process section" id="how">
        <div className="section-head light-head"><div><div className="eyebrow light">A clearer way to ship</div><h2>From route to delivery,<br />without the blind spots.</h2></div><p>Our workflow keeps commercial decisions and operational milestones in one shared view.</p></div>
        <div className="steps">{[["01", "Choose your route", MapPin], ["02", "Share cargo details", Box], ["03", "Review & confirm", CheckCircle2], ["04", "Track every milestone", PackageCheck]].map(([n, title, Icon]) => <div className="step" key={n as string}><span>{n as string}</span><Icon /><h3>{title as string}</h3><p>{n === "01" ? "Compare routes and shipping modes." : n === "02" ? "Tell us what is moving and when." : n === "03" ? "Approve clear terms before booking." : "Follow verified status updates."}</p></div>)}</div>
      </section>

      <section className="section trust">
        <div className="trust-grid"><div><div className="eyebrow">Control tower clarity</div><h2>Logistics feels better when everyone sees the same picture.</h2><p>Structured requests, transparent quotes, customer-visible updates, and a complete operational timeline keep every stakeholder aligned.</p><ul><li><Check /> One reference from request to delivery</li><li><Check /> Clear estimates versus confirmed pricing</li><li><Check /> Private operations notes stay private</li></ul><Link className="btn btn-dark" to="/request-quote">Plan a shipment <ArrowRight size={16} /></Link></div><TrackingCard /></div>
      </section>

      <section className="cta-section"><div><span>READY WHEN YOU ARE</span><h2>Your next shipment starts<br />with a clearer route.</h2></div><Link className="btn btn-primary" to="/request-quote">Request a tailored quote <ArrowRight size={17} /></Link></section>
    </>
  );
}

function TrackingCard() {
  return <div className="tracking-card"><div className="tracking-map"><div className="map-lines" /><span className="pin p1" /><span className="pin p2" /></div><div className="tracking-info"><div><span className="service-icon"><Container /></span><div><small>SAMPLE SHIPMENT</small><b>ARC-SHP-240392</b></div><span className="status green">IN TRANSIT</span></div><div className="track-route"><span>Shanghai<small>May 18</small></span><i><b style={{ width: "64%" }} /></i><span>Dubai<small>Jun 04 est.</small></span></div><div className="next-update"><CheckCircle2 /><span><b>Departed transshipment port</b><small>Singapore · May 24, 09:42 UTC · sample data</small></span></div></div></div>;
}

export function RatesPage() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("origin") || "");
  const [service, setService] = useState(params.get("service") || "All services");
  const { rates, savedRoutes, toggleRoute } = useStore();
  const filtered = useMemo(() => rates.filter((r) => (service === "All services" || r.service === service) && (`${r.origin} ${r.destination} ${r.originCountry} ${r.destinationCountry}`).toLowerCase().includes(query.toLowerCase())), [query, service]);
  return (
    <>
      <PageHero eyebrow="Freight rate directory" title="Compare routes. Plan with confidence." text="Search published illustrative rates or request tailored pricing for your exact cargo requirements." image={heroImages.rates} />
      <section className="rates-layout">
        <aside className="filters"><div><b>Filters</b><button onClick={() => { setQuery(""); setService("All services"); }}>Reset all</button></div><Field label="Search route"><div className="input-icon"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="City, port, or country" /></div></Field><Field label="Shipping method"><select value={service} onChange={(e) => setService(e.target.value)}><option>All services</option><option>Sea Freight</option><option>Air Freight</option><option>Warehousing</option></select></Field><Field label="Origin country"><select><option>All origins</option><option>China</option></select></Field><Field label="Destination"><select><option>All destinations</option><option>United States</option><option>United Kingdom</option><option>UAE</option></select></Field><Field label="Equipment"><select><option>All equipment</option><option>40ft HC</option><option>20ft GP</option><option>LCL</option></select></Field><div className="range-box"><span>Price range (USD)</span><input type="range" min="0" max="6000" defaultValue="4000" /><div><small>$0</small><small>$6,000+</small></div></div><Button><Filter size={16} /> Apply filters</Button></aside>
        <div className="rates-content"><div className="rates-toolbar"><div><b>{filtered.length} available routes</b><span>Illustrative prices · Updated May 2025</span></div><div><button><SlidersHorizontal size={16} /> Sort: Recently updated</button></div></div>
          <div className="rates-table">
            <div className="table-head"><span>Route</span><span>Service / Equipment</span><span>Transit</span><span>Illustrative price</span><span>Updated</span><span /></div>
            {filtered.map((rate) => { const Icon = serviceIcons[rate.service]; return <div className="table-row" key={rate.id}><div className="route-cell"><span className="service-icon"><Icon /></span><div><b>{rate.origin} → {rate.destination}</b><small>{rate.originCountry} to {rate.destinationCountry}</small></div></div><div><b>{rate.service}</b><small>{rate.equipment}</small></div><div><b>{rate.transit}</b><small>Estimated</small></div><div className="table-price"><b>{rate.price ? `$${rate.price.toLocaleString()}` : "Custom quote"}</b><small>{rate.price ? `USD / ${rate.unit}` : "Tailored pricing"}</small></div><div><b>{rate.updated}</b><small><i className="live-dot" /> Published</small></div><div className="row-actions"><button aria-label={savedRoutes.includes(rate.id) ? "Remove saved route" : "Save route"} className={savedRoutes.includes(rate.id) ? "saved" : ""} onClick={() => toggleRoute(rate.id)}>{savedRoutes.includes(rate.id) ? <Bookmark fill="currentColor" size={17} /> : <Bookmark size={17} />}</button><Link to={`/freight-rates/${rate.id}`}>View <ArrowRight size={15} /></Link></div></div>; })}
            {!filtered.length && <div className="empty-state"><Search /><h3>No matching routes</h3><p>Try broadening your search or request custom pricing.</p><Link className="btn btn-primary" to="/request-quote">Request custom quote</Link></div>}
          </div>
          <div className="pagination"><span>Showing {filtered.length} of {rates.length} routes</span><div><button disabled><ChevronLeft /></button><button className="active">1</button><button>2</button><button><ChevronRight /></button></div></div>
        </div>
      </section>
    </>
  );
}

export function RateDetail() {
  const { id } = useParams();
  const { rates } = useStore();
  const rate = rates.find((r) => r.id === id) ?? rates[0];
  if (!rate) return <EmptyPage title="No routes available" />;
  const Icon = serviceIcons[rate.service];
  return <><PageHero image={heroImages.sea} eyebrow={`Route ${rate.id}`} title={`${rate.origin} to ${rate.destination}`} text={`${rate.service} · ${rate.equipment} · ${rate.transit}`}><div className="hero-price"><Icon /><div><small>ILLUSTRATIVE FROM</small><b>{rate.price ? `$${rate.price.toLocaleString()} / ${rate.unit}` : "Custom quote"}</b></div><Link className="btn btn-primary" to={`/request-quote?rate=${rate.id}`}>Request this route</Link></div></PageHero><section className="detail-grid section"><div className="detail-card"><h2>Route overview</h2><div className="fact-grid"><span><small>Origin</small><b>{rate.origin}, {rate.originCountry}</b></span><span><small>Destination</small><b>{rate.destination}, {rate.destinationCountry}</b></span><span><small>Service</small><b>{rate.service}</b></span><span><small>Equipment</small><b>{rate.equipment}</b></span><span><small>Transit estimate</small><b>{rate.transit}</b></span><span><small>Last updated</small><b>{rate.updated}</b></span></div><div className="notice">This is illustrative demo pricing. A final quote is issued after cargo, schedule, surcharges, and availability are reviewed.</div></div><div className="side-quote"><ShieldCheck /><h3>Need an exact quote?</h3><p>Share your cargo details and our operations team will prepare tailored terms.</p><Link className="btn btn-dark" to={`/request-quote?rate=${rate.id}`}>Start request <ArrowRight size={16} /></Link></div></section></>;
}

export function QuoteWizard() {
  const [params] = useSearchParams();
  const { session, rates, createRequest } = useStore();
  const chosen = rates.find((r) => r.id === params.get("rate"));
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [form, setForm] = useState({ originCountry: chosen ? countryCodeFor(chosen.originCountry) : "CN", destinationCountry: chosen ? countryCodeFor(chosen.destinationCountry) : "US", origin: chosen?.origin || "", destination: chosen?.destination || "", pickup: "Port drop-off", delivery: "Port collection", method: chosen?.service || "Sea Freight", loadType: "FCL – Full container", equipment: "40ft High Cube", cargo: "", readyDate: "", weight: "", volume: "", pieces: "", handling: "None", description: "", incoterm: "", name: session?.name || "", company: "", email: session?.email || "", phone: "", notes: "" });
  const originCities = useCitiesOfCountry(form.originCountry);
  const destinationCities = useCitiesOfCountry(form.destinationCountry);
  useEffect(() => {
    if (!chosen) return;
    setForm((f) => (f.origin || f.destination ? f : { ...f, originCountry: countryCodeFor(chosen.originCountry), destinationCountry: countryCodeFor(chosen.destinationCountry), origin: chosen.origin, destination: chosen.destination, method: chosen.service }));
  }, [chosen?.id]);
  const next = () => setStep((s) => Math.min(5, s + 1));
  const submitRequest = async () => {
    setError("");
    setSubmitting(true);
    const countryName = (code: string) => countries.find((c) => c.isoCode === code)?.name ?? code;
    const result = await createRequest({
      origin_country: countryName(form.originCountry),
      destination_country: countryName(form.destinationCountry),
      origin: form.origin,
      destination: form.destination,
      pickup: form.pickup,
      delivery: form.delivery,
      method: form.method,
      load_type: form.loadType,
      equipment: form.equipment,
      cargo: form.cargo,
      ready_date: form.readyDate || null,
      weight: form.weight,
      volume: form.volume,
      pieces: form.pieces,
      special_handling: form.handling,
      cargo_description: form.description,
      incoterm: form.incoterm,
      contact_name: form.name,
      company: form.company,
      email: form.email,
      phone: form.phone,
      notes: form.notes,
      rate_id: chosen?.id ?? null,
    });
    setSubmitting(false);
    if (!result.ok) return setError(result.error || "Could not submit your request. Please try again.");
    setReference(result.reference);
    setSubmitted(true);
  };
  if (submitted) return <section className="success-screen"><div className="success-icon"><Check /></div><div className="eyebrow">Request received</div><h1>You're all set.</h1><p>Your request reference is <b>{reference}</b>. Our team will review the details and follow up by email.</p><div><Link className="btn btn-primary" to="/portal/requests">View my requests</Link><Link className="btn btn-secondary" to="/">Back home</Link></div></section>;
  return <section className="wizard-wrap"><div className="wizard-intro"><div className="eyebrow">Tailored shipping request</div><h1>Tell us what<br />needs to move.</h1><p>Complete the five steps below. Your progress stays in this browser while you sign in.</p><div className="secure-note"><ShieldCheck /><span><b>Clear by design</b><small>Estimates never become bookings without confirmation.</small></span></div></div><div className="wizard-card"><div className="progress">{["Route", "Method", "Cargo", "Contact", "Review"].map((label, i) => <span className={step >= i + 1 ? "active" : ""} key={label}><i>{step > i + 1 ? <Check /> : i + 1}</i><small>{label}</small></span>)}</div>
    {step === 1 && <div className="wizard-step"><div className="step-heading"><span>STEP 1 OF 5</span><h2>Where is your cargo going?</h2><p>Choose the origin and destination locations.</p></div><div className="form-grid"><Field label="Origin country"><select value={form.originCountry} onChange={(e) => setForm({ ...form, originCountry: e.target.value, origin: "" })}><option value="">Select country</option>{countries.map((c) => <option key={c.isoCode} value={c.isoCode}>{c.flag} {c.name}</option>)}</select></Field><Field label="Origin city or port"><select value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} disabled={!form.originCountry}>{form.origin && !originCities.some((c) => c.name === form.origin) ? <option value={form.origin}>{form.origin}</option> : null}<option value="">{form.originCountry ? "Select city" : "Select country first"}</option>{originCities.map((c, i) => <option key={`${c.name}-${i}`} value={c.name}>{c.name}</option>)}</select></Field><Field label="Destination country"><select value={form.destinationCountry} onChange={(e) => setForm({ ...form, destinationCountry: e.target.value, destination: "" })}><option value="">Select country</option>{countries.map((c) => <option key={c.isoCode} value={c.isoCode}>{c.flag} {c.name}</option>)}</select></Field><Field label="Destination city or port"><select value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} disabled={!form.destinationCountry}>{form.destination && !destinationCities.some((c) => c.name === form.destination) ? <option value={form.destination}>{form.destination}</option> : null}<option value="">{form.destinationCountry ? "Select city" : "Select country first"}</option>{destinationCities.map((c, i) => <option key={`${c.name}-${i}`} value={c.name}>{c.name}</option>)}</select></Field><Field label="Pickup preference"><select value={form.pickup} onChange={(e) => setForm({ ...form, pickup: e.target.value })}><option>Port drop-off</option><option>Factory pickup</option></select></Field><Field label="Delivery preference"><select value={form.delivery} onChange={(e) => setForm({ ...form, delivery: e.target.value })}><option>Port collection</option><option>Door delivery</option></select></Field></div></div>}
    {step === 2 && <div className="wizard-step"><div className="step-heading"><span>STEP 2 OF 5</span><h2>Choose a shipping method</h2><p>Select the best fit for your schedule and cargo.</p></div><div className="method-grid">{[["Sea Freight", Ship, "Best for volume and value"], ["Air Freight", Plane, "Best for urgent cargo"], ["Warehousing", Warehouse, "Storage and consolidation"]].map(([name, Icon, desc]) => <button key={name as string} className={form.method === name ? "selected" : ""} onClick={() => setForm({ ...form, method: name as string })}><Icon /><b>{name as string}</b><small>{desc as string}</small><i><Check /></i></button>)}</div><div className="form-grid"><Field label="Load type"><select value={form.loadType} onChange={(e) => setForm({ ...form, loadType: e.target.value })}><option>FCL – Full container</option><option>LCL – Shared container</option></select></Field><Field label="Equipment"><select value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })}><option>40ft High Cube</option><option>20ft General Purpose</option></select></Field></div></div>}
    {step === 3 && <div className="wizard-step"><div className="step-heading"><span>STEP 3 OF 5</span><h2>Describe your cargo</h2><p>These details help us calculate and validate pricing.</p></div><div className="form-grid"><Field label="Cargo name"><input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} placeholder="e.g. Furniture" /></Field><Field label="Cargo ready date"><input type="date" value={form.readyDate} onChange={(e) => setForm({ ...form, readyDate: e.target.value })} /></Field><Field label="Incoterm"><select value={form.incoterm} onChange={(e) => setForm({ ...form, incoterm: e.target.value })}><option value="">Select if known</option>{["EXW", "FCA", "FAS", "FOB", "CFR", "CIF", "CPT", "CIP", "DAP", "DPU", "DDP"].map((term) => <option key={term} value={term}>{term}</option>)}</select></Field><Field label="Weight (kg)"><input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="0" /></Field><Field label="Volume (CBM)"><input type="number" value={form.volume} onChange={(e) => setForm({ ...form, volume: e.target.value })} placeholder="0" /></Field><Field label="Pieces / cartons"><input type="number" value={form.pieces} onChange={(e) => setForm({ ...form, pieces: e.target.value })} placeholder="0" /></Field><Field label="Special handling"><select value={form.handling} onChange={(e) => setForm({ ...form, handling: e.target.value })}><option>None</option><option>Fragile</option><option>Temperature controlled</option></select></Field></div><Field label="Cargo description"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Materials, dimensions, packaging, and other relevant details" /></Field></div>}
    {step === 4 && <div className="wizard-step"><div className="step-heading"><span>STEP 4 OF 5</span><h2>How can we reach you?</h2><p>We will use these details only for your shipping request.</p></div><div className="form-grid"><Field label="Full name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></Field><Field label="Company (optional)"><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" /></Field><Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" /></Field><Field label="Phone / WhatsApp"><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 000 000 0000" /></Field></div><Field label="Additional notes"><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Anything else our team should know?" /></Field></div>}
    {step === 5 && <div className="wizard-step"><div className="step-heading"><span>STEP 5 OF 5</span><h2>Review your request</h2><p>Confirm the details before submitting.</p></div><div className="review-grid"><div><small>ROUTE</small><b>{form.origin || "Guangzhou"} → {form.destination || "Los Angeles"}</b></div><div><small>SHIPPING METHOD</small><b>{form.method}</b></div><div><small>CARGO</small><b>{form.cargo || "General cargo"} · {form.weight || "—"} kg</b></div><div><small>INCOTERM</small><b>{form.incoterm || "Not specified"}</b></div><div><small>CONTACT</small><b>{form.name || session?.name || "Not provided"}</b></div></div><div className="estimate-box"><CircleDollarSign /><div><small>INDICATIVE ESTIMATE</small><b>{chosen?.price ? `$${chosen.price.toLocaleString()} / ${chosen.unit}` : "Price pending confirmation"}</b><p>Final terms are reviewed by an operator and must be confirmed separately.</p></div></div>{!session && <div className="auth-gate"><ShieldCheck /><div><b>Sign in required before submission</b><span>Your completed form will remain available when you return.</span></div><Button onClick={() => navigate("/login?return=/request-quote")}>Sign in</Button></div>}</div>}
    {error && <p className="form-error" style={{ margin: "0 45px 16px", color: "#dc2626" }}>{error}</p>}<div className="wizard-actions">{step > 1 ? <Button variant="secondary" onClick={() => setStep(step - 1)}><ChevronLeft /> Back</Button> : <span />}{step < 5 ? <Button onClick={next}>Continue <ArrowRight /></Button> : <Button disabled={!session || submitting} onClick={submitRequest}>{submitting ? "Submitting…" : "Confirm & submit request"} {!submitting && <Check />}</Button>}</div></div></section>;
}

export function Login() {
  const { session, configured, authenticate, signInWithGoogle, demoLogin } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session) navigate(params.get("return") || "/", { replace: true });
  }, [session]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!configured) return demoLogin("user");
    setBusy(true);
    const result = await authenticate(email.trim(), password);
    setBusy(false);
    if (!result.ok) return setError(result.error || "Authentication failed. Please try again.");
    if (result.needsEmailConfirm) return setMessage("Account created. Check your email to confirm your address, then sign in.");
  };

  const google = async () => {
    setError("");
    if (!configured) return setError("Add your Supabase keys to enable Google sign-in.");
    setBusy(true);
    const result = await signInWithGoogle();
    if (!result.ok) {
      setBusy(false);
      setError(result.error || "Google sign-in failed. Please try again.");
    }
  };
  return <section className="auth-page"><div className="auth-art"><Link to="/" className="auth-back">← Back to Arclane</Link><div><div className="eyebrow light">Move with certainty</div><h1>Visibility for every<br />mile that matters.</h1><p>One secure workspace for freight requests, quotes, and shipment milestones.</p></div><span>Photo by william william on Unsplash</span></div><div className="auth-form"><div className="auth-box"><div className="eyebrow">Secure access</div><h2>Sign in or create your account</h2><p>Enter your email and password. New here? Your account is created automatically — no separate sign-up needed.</p><button className="google-btn" type="button" onClick={google} disabled={busy}><b>G</b> Continue with Google</button><div className="or"><span /> or continue with email <span /></div><form onSubmit={submit}><Field label="Email address"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required /></Field><Field label="Password"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="current-password" minLength={6} required /></Field><div className="form-row"><label><input type="checkbox" /> Remember me</label><Link to="/forgot-password">Forgot password?</Link></div>{error && <div className="auth-alert error">{error}</div>}{message && <div className="auth-alert">{message}</div>}<Button type="submit" disabled={busy}>{busy ? "Please wait…" : "Continue securely"} {!busy && <ArrowRight />}</Button></form>{!configured && <div className="demo-switch"><span>SUPABASE NOT CONFIGURED · DEMO</span><button className="active" onClick={() => demoLogin("user")}>Customer</button><button onClick={() => demoLogin("admin")}>Administrator</button></div>}<p className="signup-line">{configured ? "New here? Just enter your email and password above — your account is created automatically." : "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable real authentication."}</p></div></div></section>;
}

export function Services() {
  return <><PageHero eyebrow="Global freight services" title="A logistics partner for every mode." text="Plan, price, and coordinate sea, air, and warehousing services in one connected workflow." image={heroImages.services} /><section className="service-list section">{Object.entries(serviceCopy).map(([slug, item], i) => { const Icon = [Ship, Plane, Warehouse][i]; return <article key={slug}><span><Icon /></span><div><small>{item.eyebrow}</small><h2>{item.title}</h2><p>{item.text}</p><Link to={`/services/${slug}`}>Explore {slug.replace("-", " ")} <ArrowRight /></Link></div><b>0{i + 1}</b></article>; })}</section></>;
}

export function ServiceDetail() {
  const { type = "sea-freight" } = useParams();
  const item = serviceCopy[type as keyof typeof serviceCopy] || serviceCopy["sea-freight"];
  const heroImage = type === "air-freight" ? heroImages.air : type === "warehousing" ? heroImages.warehouse : heroImages.sea;
  return <><PageHero eyebrow={item.eyebrow} title={item.title} text={item.text} image={heroImage}><Link className="btn btn-primary" to="/request-quote">Request this service <ArrowRight /></Link></PageHero><section className="detail-features section">{["Flexible service options", "Transparent pricing logic", "Milestone visibility", "Dedicated operational review"].map((t, i) => <article key={t}><span>0{i + 1}</span><h3>{t}</h3><p>Configured around your route, cargo profile, and schedule requirements.</p></article>)}</section></>;
}

export function Tracking() {
  const [ref, setRef] = useState("");
  const [show, setShow] = useState(false);
  return <><PageHero eyebrow="Shipment tracking" title="Follow every verified milestone." text="Enter a shipment reference to view its latest customer-visible updates." image={heroImages.tracking}><form className="tracking-search" onSubmit={(e) => { e.preventDefault(); if (ref) setShow(true); }}><input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Try ARC-SHP-240392" /><Button type="submit">Track shipment <Search /></Button></form></PageHero><section className="tracking-page section">{show ? <div className="timeline-card"><div className="timeline-head"><div><span>SAMPLE DATA</span><h2>Shanghai → Dubai</h2><p>ARC-SHP-240392 · Sea Freight</p></div><span className="status green">IN TRANSIT</span></div>{["Request submitted", "Quote confirmed", "Cargo preparation", "Dispatched", "In transit", "Arrived at destination", "Delivered"].map((stage, i) => <div className={`timeline-item ${i <= 4 ? "done" : ""}`} key={stage}><i>{i <= 4 && <Check />}</i><div><b>{stage}</b><small>{i <= 4 ? `May ${18 + i}, 2025 · Sample event` : "Pending"}</small></div></div>)}</div> : <div className="tracking-empty"><Container /><h2>Enter a reference to begin</h2><p>Use sample reference <button onClick={() => setRef("ARC-SHP-240392")}>ARC-SHP-240392</button> to preview the tracking experience.</p></div>}</section></>;
}

export function PortalOverview() {
  return <DashboardPage admin={false} />;
}
export function AdminOverview() {
  return <DashboardPage admin />;
}

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

function DashboardPage({ admin }: { admin: boolean }) {
  const { requests, rates, session } = useStore();
  const pending = requests.filter((r) => /pending|review/i.test(r.status)).length;
  const active = requests.filter((r) => /transit|progress|quote prepared/i.test(r.status)).length;
  const completed = requests.filter((r) => /deliver|complet/i.test(r.status)).length;
  const stats = admin ? [["Total Requests", String(requests.length), "All customers", Box], ["Pending Review", String(pending), "Needs action", Clock3], ["Active Shipments", String(active), "In transit", Container], ["Published Rates", String(rates.length), "Live now", Ship]] : [["Total Requests", String(requests.length), "All time", Box], ["Pending Review", String(pending), "Needs review", Clock3], ["In Progress", String(active), "Active now", Container], ["Completed", String(completed), "Delivered", CheckCircle2]];
  return <div className="dashboard"><div className="dash-heading"><div><span>{admin ? "OPERATIONS WORKSPACE" : `WELCOME BACK, ${(session?.name || "THERE").toUpperCase()}`}</span><h1>{admin ? "Operations overview" : "Your shipping overview"}</h1><p>{admin ? "Monitor commercial activity and operational priorities." : "Track requests, shipments, and recent updates in one place."}</p></div><Link className="btn btn-primary" to={admin ? "/admin/requests" : "/request-quote"}>{admin ? <Download /> : <Plus />}{admin ? "Export report" : "New request"}</Link></div><div className="kpi-grid">{stats.map(([label, value, note, Icon], i) => <article key={label as string}><div><span>{label as string}</span><Icon /></div><b>{value as string}</b><small className={i === 0 ? "up" : ""}>{note as string}</small></article>)}</div>
    <div className="dash-grid"><section className="panel chart-panel"><div className="panel-head"><div><b>{admin ? "Request activity" : "Shipment activity"}</b><span>Last 6 months</span></div><button>This year <ChevronRight /></button></div><div className="chart"><div className="y-axis"><span>150</span><span>100</span><span>50</span><span>0</span></div><div className="bars">{[42, 60, 47, 73, 58, 88].map((h, i) => <div key={i}><span style={{ height: `${h}%` }} /><small>{["Dec", "Jan", "Feb", "Mar", "Apr", "May"][i]}</small></div>)}</div></div></section><section className="panel action-panel"><div className="panel-head"><div><b>{admin ? "Pending actions" : "Latest updates"}</b><span>{admin ? `${pending} require attention` : "Customer-visible events"}</span></div><button><MoreHorizontal /></button></div>{requests.slice(0, 3).map((r, i) => <div className="activity-item" key={r.id}><span className={`activity-icon a${i}`}><Box /></span><div><b>{admin ? `${r.reference} · ${r.status}` : `${r.origin} → ${r.destination}`}</b><small>{timeAgo(r.createdAt)}</small></div><ChevronRight /></div>)}{!requests.length && <p className="activity-empty">No requests yet.</p>}</section></div>
    <section className="panel recent-table"><div className="panel-head"><div><b>{admin ? "Recent requests" : "My recent requests"}</b><span>Live records from Supabase</span></div><Link to={admin ? "/admin/requests" : "/portal/requests"}>View all <ArrowRight /></Link></div><RequestsTable admin={admin} /></section></div>;
}

function StatusUpdateModal({ request, onClose }: { request: QuoteRequest; onClose: () => void }) {
  const { updateRequestStatus } = useStore();
  const [next, setNext] = useState(request.status);
  const changed = next !== request.status;
  const apply = () => {
    updateRequestStatus(request.id, next);
    onClose();
  };
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal status-modal" onMouseDown={(e) => e.stopPropagation()}>
    <div className="modal-head"><div><span>UPDATE STATUS</span><h2>{request.reference}</h2></div><button type="button" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
    <div className="modal-body">
      <div className="status-compare"><div><small>CURRENT</small><i className={statusClass(request.status)}>{request.status}</i></div><span>→</span><div><small>NEW STATUS</small><i className={statusClass(next)}>{next}</i></div></div>
      <Field label="Set new status"><select value={next} onChange={(e) => setNext(e.target.value)}>{STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}</select></Field>
      <p className="modal-hint">The customer sees this status on their portal and tracking page.</p>
    </div>
    <div className="modal-foot"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!changed} onClick={apply}><Check size={15} /> Confirm update</Button></div>
  </div></div>;
}

function RequestsTable({ admin = false, rows, onStatusClick }: { admin?: boolean; rows?: QuoteRequest[]; onStatusClick?: (r: QuoteRequest) => void }) {
  const { requests, rates } = useStore();
  const data = rows ?? requests;
  const head = <div className="request-head"><span>Request</span>{admin && <span>Customer</span>}<span>Route</span><span>Service</span><span>Value</span><span>Status</span><span>Updated</span><span /></div>;
  if (!data.length) return <div className="request-table">{head}<div className="table-empty"><p>{admin ? "No requests match your filters." : "You have not submitted any requests yet."}</p><Link className="btn btn-primary" to="/request-quote">Get a quote <ArrowRight /></Link></div></div>;
  return <div className="request-table">{head}{data.map((r) => {
    const rate = rates.find((x) => x.id === r.rateId);
    return <div className="request-row" key={r.id}><span><b>{r.reference}</b><small>{new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</small></span>{admin && <span><b>{r.contactName || "—"}</b><small>{r.email || ""}</small></span>}<span><b>{r.origin || "—"} → {r.destination || "—"}</b><small>{r.originCountry || "International"}</small></span><span>{r.method}</span><span>{rate?.price ? `$${rate.price.toLocaleString()} est.` : "Awaiting quote"}</span><span>{admin && onStatusClick ? <button type="button" className="status-btn" title="Click to update status" onClick={() => onStatusClick(r)}><i className={statusClass(r.status)}>{r.status}</i></button> : <i className={statusClass(r.status)}>{r.status}</i>}</span><span>{timeAgo(r.createdAt)}</span><Link to={admin ? `/admin/requests/${r.id}` : `/portal/requests/${r.id}`}><ArrowRight /></Link></div>;
  })}</div>;
}

export function RequestsPage({ admin = false }: { admin?: boolean }) {
  const { requests } = useStore();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editing, setEditing] = useState<QuoteRequest | null>(null);
  const filtered = useMemo(() => requests.filter((r) => {
    const matchesQuery = !query || `${r.reference} ${r.origin} ${r.destination} ${r.contactName} ${r.email} ${r.method}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    return matchesQuery && matchesStatus;
  }), [requests, query, statusFilter]);
  return <div className="dashboard"><div className="dash-heading"><div><span>{admin ? "REQUEST MANAGEMENT" : "MY REQUESTS"}</span><h1>{admin ? "All shipping requests" : "Requests & quotations"}</h1><p>Search, filter, and review the complete request history.</p></div><Link className="btn btn-primary" to="/request-quote"><Plus /> New request</Link></div><section className="panel"><div className="list-toolbar"><div className="input-icon"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search request, route, or customer" /></div><select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>{["All", ...STATUS_OPTIONS].map((s) => <option key={s} value={s}>{s === "All" ? "Status: All" : s}</option>)}</select>{(query || statusFilter !== "All") && <button onClick={() => { setQuery(""); setStatusFilter("All"); }}><X size={13} /> Clear</button>}<span className="filter-count">{filtered.length} of {requests.length}</span></div><RequestsTable admin={admin} rows={filtered} onStatusClick={admin ? setEditing : undefined} /></section>{editing && <StatusUpdateModal request={editing} onClose={() => setEditing(null)} />}</div>;
}

export function SavedRoutes() {
  const { rates, savedRoutes } = useStore();
  const items = rates.filter((r) => savedRoutes.includes(r.id));
  return <div className="dashboard"><div className="dash-heading"><div><span>QUICK ACCESS</span><h1>Saved routes</h1><p>Keep frequently used lanes close at hand.</p></div></div>{items.length ? <div className="route-cards">{items.map((r) => <article className="route-card" key={r.id}><div className="price"><small>{r.origin} → {r.destination}</small><b>{r.price ? `$${r.price.toLocaleString()}` : "Custom"}</b></div><Link to={`/freight-rates/${r.id}`}>View route <ArrowRight /></Link></article>)}</div> : <div className="empty-state panel"><Heart /><h2>No saved routes yet</h2><p>Save a route from the public freight rate directory.</p><Link className="btn btn-primary" to="/freight-rates">Browse rates</Link></div>}</div>;
}

const today = () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const blankRate = (): FreightRate => ({ id: "", origin: "", originCountry: "China", destination: "", destinationCountry: "", service: "Sea Freight", equipment: "", unit: "container", price: 0, transit: "", updated: today(), availability: "Published" });

function RateEditor({ rate, onClose }: { rate: FreightRate | null; onClose: () => void }) {
  const { saveRate } = useStore();
  const [draft, setDraft] = useState<FreightRate>(rate ?? blankRate());
  const originCities = useCitiesOfCountry(countryCodeFor(draft.originCountry));
  const destinationCities = useCitiesOfCountry(countryCodeFor(draft.destinationCountry));
  const set = <K extends keyof FreightRate>(key: K, value: FreightRate[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const custom = draft.availability === "Custom quote";
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const generated = `${draft.origin.slice(0, 3)}-${draft.destination.slice(0, 3)}-${draft.service === "Air Freight" ? "AIR" : draft.service === "Warehousing" ? "WHS" : "SEA"}`.toUpperCase().replace(/^-+|-+$/g, "") || `RATE-${Date.now()}`;
    saveRate({ ...draft, id: (draft.id.trim() || generated).toUpperCase(), price: custom ? null : Number(draft.price) || 0, updated: today() });
    onClose();
  };
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
    <div className="modal-head"><div><span>{rate ? "EDIT RATE" : "NEW RATE"}</span><h2>{rate ? `${rate.origin} → ${rate.destination}` : "Create a freight rate"}</h2></div><button type="button" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
    <div className="modal-body">
      <Field label="Rate code"><input value={draft.id} onChange={(e) => set("id", e.target.value)} placeholder="Auto-generated from the route if left blank" /></Field>
      <div className="form-grid">
        <Field label="Origin country"><select value={draft.originCountry} onChange={(e) => setDraft((d) => ({ ...d, originCountry: e.target.value, origin: "" }))}><option value="">Select country</option>{countries.map((c) => <option key={c.isoCode} value={c.name}>{c.flag} {c.name}</option>)}</select></Field>
        <Field label="Origin city / port"><select value={draft.origin} onChange={(e) => set("origin", e.target.value)} disabled={!originCities.length}>{draft.origin && !originCities.some((c) => c.name === draft.origin) ? <option value={draft.origin}>{draft.origin}</option> : null}<option value="">{draft.originCountry ? "Select city" : "Select country first"}</option>{originCities.map((c, i) => <option key={`${c.name}-${i}`} value={c.name}>{c.name}</option>)}</select></Field>
        <Field label="Destination country"><select value={draft.destinationCountry} onChange={(e) => setDraft((d) => ({ ...d, destinationCountry: e.target.value, destination: "" }))}><option value="">Select country</option>{countries.map((c) => <option key={c.isoCode} value={c.name}>{c.flag} {c.name}</option>)}</select></Field>
        <Field label="Destination city / port"><select value={draft.destination} onChange={(e) => set("destination", e.target.value)} disabled={!destinationCities.length}>{draft.destination && !destinationCities.some((c) => c.name === draft.destination) ? <option value={draft.destination}>{draft.destination}</option> : null}<option value="">{draft.destinationCountry ? "Select city" : "Select country first"}</option>{destinationCities.map((c, i) => <option key={`${c.name}-${i}`} value={c.name}>{c.name}</option>)}</select></Field>
        <Field label="Service"><select value={draft.service} onChange={(e) => set("service", e.target.value as FreightRate["service"])}><option>Sea Freight</option><option>Air Freight</option><option>Warehousing</option></select></Field>
        <Field label="Equipment"><input value={draft.equipment} onChange={(e) => set("equipment", e.target.value)} placeholder="e.g. 40ft HC" /></Field>
        <Field label="Unit"><select value={draft.unit} onChange={(e) => set("unit", e.target.value)}><option value="container">container</option><option value="kg">kg</option><option value="CBM">CBM</option><option value="pallet">pallet</option></select></Field>
        <Field label="Transit time"><input value={draft.transit} onChange={(e) => set("transit", e.target.value)} placeholder="e.g. 18–24 days" /></Field>
        <Field label="Price (USD)">{custom ? <input value="Custom quote" disabled /> : <input type="number" min="0" step="0.01" value={draft.price ?? 0} onChange={(e) => set("price", e.target.value === "" ? 0 : Number(e.target.value))} placeholder="0" />}</Field>
        <Field label="Pricing"><select value={draft.availability} onChange={(e) => set("availability", e.target.value as FreightRate["availability"])}><option value="Published">Published price</option><option value="Custom quote">Custom quote</option></select></Field>
      </div>
    </div>
    <div className="modal-foot"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">{rate ? "Save changes" : "Add rate"}</Button></div>
  </form></div>;
}

export function AdminRates() {
  const { rates, deleteRate } = useStore();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<FreightRate | null>(null);
  const [open, setOpen] = useState(false);
  const filtered = rates.filter((r) => `${r.id} ${r.origin} ${r.destination} ${r.service} ${r.originCountry} ${r.destinationCountry}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="dashboard">
    <div className="dash-heading"><div><span>COMMERCIAL CATALOG</span><h1>Freight rate management</h1><p>Prepare, preview, and publish route pricing.</p></div><Button onClick={() => { setEditing(null); setOpen(true); }}><Plus /> Add rate</Button></div>
    <section className="panel">
      <div className="list-toolbar"><div className="input-icon"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search routes" /></div><button><Filter /> {filtered.length} routes</button></div>
      <div className="rates-table admin-rate-table">
        {filtered.map((rate) => <div className="table-row" key={rate.id}>
          <div><b>{rate.origin} → {rate.destination}</b><small>{rate.id}</small></div>
          <div><b>{rate.service}</b><small>{rate.equipment}</small></div>
          <div className="table-price"><b>{rate.price ? `$${rate.price.toLocaleString()}` : "Custom"}</b><small>/ {rate.unit}</small></div>
          <div><span className={rate.availability === "Published" ? "status green" : "status status-pending-review"}>{rate.availability}</span></div>
          <div><b>{rate.updated}</b><small>{rate.transit}</small></div>
          <div className="row-actions"><button onClick={() => { setEditing(rate); setOpen(true); }}>Edit</button><button aria-label="Remove rate" onClick={() => { if (window.confirm(`Remove rate ${rate.id}?`)) deleteRate(rate.id); }}><Trash2 size={15} /></button></div>
        </div>)}
        {!filtered.length && <div className="empty-state"><Search /><h3>No rates found</h3><p>Adjust your search or add a new rate.</p><Button onClick={() => { setEditing(null); setOpen(true); }}><Plus size={15} /> Add rate</Button></div>}
      </div>
    </section>
    {open && <RateEditor rate={editing} onClose={() => setOpen(false)} />}
  </div>;
}

export function Generic({ title }: { title: string }) {
  return <EmptyPage title={title} />;
}

export function Protected({ admin = false, children }: { admin?: boolean; children: React.ReactNode }) {
  const { session } = useStore();
  if (!session) return <Navigate to={`/login?return=${window.location.pathname}`} replace />;
  if (admin && session.role !== "admin") return <Navigate to="/portal" replace />;
  return children;
}
