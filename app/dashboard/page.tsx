"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const stages = ["new","contacted","qualified","proposal","won","lost"];
const priorities = ["low","medium","high"];
const services = [
  "Business Strategy",
  "Brand & Marketing",
  "Web & Software",
  "AI & Automation",
  "Sales Systems",
  "Digital Transformation",
];

type Lead = {
  id: string;
  business_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  service_interest: string | null;
  status: string;
  priority: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activityText, setActivityText] = useState("");
  const [newLead, setNewLead] = useState({
    business_name: "",
    contact_name: "",
    email: "",
    phone: "",
    service_interest: "",
    status: "new",
    priority: "medium",
    notes: "",
  });

  async function loadLeads() {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setMessage(error.message);
      return;
    }
    setLeads((data || []) as Lead[]);
  }

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUser(data.user);
      await loadLeads();
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [router]);

  const count = (s: string) => leads.filter((x) => x.status === s).length;

  const pipelineValue = useMemo(
    () => leads.filter((x) => ["qualified", "proposal"].includes(x.status)).length,
    [leads]
  );

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  async function addLead(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("leads").insert({
      business_name: newLead.business_name.trim(),
      contact_name: newLead.contact_name.trim() || null,
      email: newLead.email.trim() || null,
      phone: newLead.phone.trim() || null,
      service_interest: newLead.service_interest || null,
      status: newLead.status,
      priority: newLead.priority,
      notes: newLead.notes.trim() || null,
      source: "CEO Command Center",
    });

    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    setNewLead({
      business_name: "",
      contact_name: "",
      email: "",
      phone: "",
      service_interest: "",
      status: "new",
      priority: "medium",
      notes: "",
    });
    setMessage("Lead added to the CRM.");
    await loadLeads();
  }

  async function updateLead(id: string, patch: Partial<Lead>) {
    setMessage("");
    const { error } = await supabase
      .from("leads")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadLeads();
    setSelectedLead((current) =>
      current && current.id === id ? { ...current, ...patch } : current
    );
  }

  async function logActivity() {
    if (!selectedLead || !activityText.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("activities").insert({
      lead_id: selectedLead.id,
      activity_type: "follow_up",
      description: activityText.trim(),
    });
    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setActivityText("");
    setMessage("Follow-up activity logged.");
  }

  if (!user) {
    return <main className="dashboard"><section className="dashHero"><p>Checking secure session…</p></section></main>;
  }

  return (
    <main className="dashboard">
      <nav>
        <b>Easy Consultants</b>
        <span>CEO Command Center</span>
        <span>{user.email}</span>
        <button onClick={signOut}>Sign out</button>
        <a href="/">Public site</a>
      </nav>

      <section className="dashHero">
        <p className="eyebrow">SECURE SALES ENGINE</p>
        <h1>Turn attention into revenue.</h1>
        <p className="lead">Authenticated CRM command center for Easy Consultants.</p>
      </section>

      <section>
        <div className="metricGrid">
          {[
            ["TOTAL", leads.length],
            ["QUALIFIED", count("qualified")],
            ["PROPOSALS", count("proposal")],
            ["WON", count("won")],
            ["ACTIVE PIPELINE", pipelineValue],
          ].map(([label, value]) => (
            <article key={String(label)}>
              <small>{label}</small>
              <strong>{value}</strong>
              <span>live records</span>
            </article>
          ))}
        </div>
      </section>

      <section>
        <p className="eyebrow">PIPELINE</p>
        <div className="pipeline">
          {stages.map((stage) => (
            <article key={stage}>
              <small>{stage.toUpperCase()}</small>
              <strong>{count(stage)}</strong>
              <div className="bar"><i style={{ width: Math.min(count(stage) * 12, 100) + "%" }} /></div>
            </article>
          ))}
        </div>
      </section>

      <section className="crmSection">
        <div className="crmHeader">
          <div>
            <p className="eyebrow">CRM MANAGEMENT</p>
            <h2>Capture, qualify, follow up.</h2>
          </div>
          {message && <div className="crmMessage">{message}</div>}
        </div>

        <form className="crmForm" onSubmit={addLead}>
          <input required placeholder="Business name *" value={newLead.business_name} onChange={(e) => setNewLead({...newLead, business_name: e.target.value})} />
          <input placeholder="Contact name" value={newLead.contact_name} onChange={(e) => setNewLead({...newLead, contact_name: e.target.value})} />
          <input type="email" placeholder="Email" value={newLead.email} onChange={(e) => setNewLead({...newLead, email: e.target.value})} />
          <input placeholder="Phone / WhatsApp" value={newLead.phone} onChange={(e) => setNewLead({...newLead, phone: e.target.value})} />
          <select value={newLead.service_interest} onChange={(e) => setNewLead({...newLead, service_interest: e.target.value})}>
            <option value="">Service interest</option>
            {services.map((service) => <option key={service}>{service}</option>)}
          </select>
          <select value={newLead.status} onChange={(e) => setNewLead({...newLead, status: e.target.value})}>
            {stages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
          </select>
          <select value={newLead.priority} onChange={(e) => setNewLead({...newLead, priority: e.target.value})}>
            {priorities.map((priority) => <option key={priority} value={priority}>{priority} priority</option>)}
          </select>
          <textarea placeholder="Notes / opportunity details" value={newLead.notes} onChange={(e) => setNewLead({...newLead, notes: e.target.value})} />
          <button className="btn crmSubmit" disabled={saving}>{saving ? "Saving…" : "Add lead"}</button>
        </form>
      </section>

      <section className="dark crmLeads">
        <p className="eyebrow">LEAD PIPELINE</p>
        <h2>{loading ? "Loading CRM…" : leads.length ? "Manage prospects" : "CRM ready for prospects"}</h2>

        <div className="leadTable">
          {leads.map((lead) => (
            <article className="leadRow" key={lead.id}>
              <div className="leadIdentity">
                <b>{lead.business_name}</b>
                <span>{lead.contact_name || "No contact name"}{lead.email ? " · " + lead.email : ""}</span>
                <small>{lead.service_interest || "General enquiry"} · {new Date(lead.created_at).toLocaleDateString()}</small>
              </div>
              <select value={lead.status} onChange={(e) => updateLead(lead.id, { status: e.target.value })}>
                {stages.map((stage) => <option key={stage}>{stage}</option>)}
              </select>
              <select value={lead.priority} onChange={(e) => updateLead(lead.id, { priority: e.target.value })}>
                {priorities.map((priority) => <option key={priority}>{priority}</option>)}
              </select>
              <button className="rowButton" onClick={() => setSelectedLead(lead)}>Open</button>
            </article>
          ))}
        </div>
      </section>

      {selectedLead && (
        <section className="leadDetail">
          <div className="crmHeader">
            <div>
              <p className="eyebrow">LEAD RECORD</p>
              <h2>{selectedLead.business_name}</h2>
              <p>{selectedLead.contact_name || "No contact name"} · {selectedLead.email || "No email"} · {selectedLead.phone || "No phone"}</p>
            </div>
            <button className="rowButton" onClick={() => setSelectedLead(null)}>Close</button>
          </div>

          <textarea
            className="notesBox"
            value={selectedLead.notes || ""}
            placeholder="CRM notes"
            onChange={(e) => setSelectedLead({...selectedLead, notes: e.target.value})}
          />
          <button className="btn" onClick={() => updateLead(selectedLead.id, { notes: selectedLead.notes })}>Save notes</button>

          <div className="activityBox">
            <p className="eyebrow">FOLLOW-UP LOG</p>
            <textarea placeholder="Log call, WhatsApp, meeting, proposal, or next action…" value={activityText} onChange={(e) => setActivityText(e.target.value)} />
            <button className="btn" onClick={logActivity} disabled={saving}>Log activity</button>
          </div>
        </section>
      )}

      <footer>Easy Consultants · Internal dashboard</footer>
    </main>
  );
}
