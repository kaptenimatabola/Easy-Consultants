"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Lead={id:string;business_name:string;contact_name:string|null;email:string|null;service_interest:string|null;status:string};
type Service={id:string;name:string;description:string|null;price:number|null;currency:string};
type Proposal={id:string;business_name:string;contact_name:string|null;service:string;amount:number;currency:string;timeline:string;scope:string;terms:string;status:string;created_at:string};

const proposalStatuses=["draft","sent","accepted","declined"];

export default function Proposals(){
  const router=useRouter();
  const [user,setUser]=useState<any>(null);
  const [leads,setLeads]=useState<Lead[]>([]);
  const [services,setServices]=useState<Service[]>([]);
  const [proposals,setProposals]=useState<Proposal[]>([]);
  const [selected,setSelected]=useState<Proposal|null>(null);
  const [message,setMessage]=useState("");
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({lead_id:"",service_id:"",amount:"",timeline:"",scope:"",terms:"Payment terms to be confirmed in the final invoice."});

  async function load(){
    const [{data:ld,error:e1},{data:sv,error:e2}]=await Promise.all([
      supabase.from("leads").select("id,business_name,contact_name,email,service_interest,status").in("status",["qualified","proposal","won"]).order("created_at",{ascending:false}),
      supabase.from("services").select("id,name,description,price,currency").eq("active",true).order("name")
    ]);
    if(e1||e2){setMessage(e1?.message||e2?.message||"Unable to load proposal data.");return;}
    setLeads((ld||[]) as Lead[]);
    setServices((sv||[]) as Service[]);
  }

  useEffect(()=>{let mounted=true;supabase.auth.getUser().then(async({data})=>{if(!mounted)return;if(!data.user){router.replace("/login");return;}setUser(data.user);await load();if(mounted){setProposals([])}});return()=>{mounted=false}},[router]);

  function serviceChanged(id:string){
    const service=services.find(x=>x.id===id);
    setForm({...form,service_id:id,amount:service?.price!=null?String(service.price):""});
  }

  async function createProposal(e:FormEvent){
    e.preventDefault();
    const lead=leads.find(x=>x.id===form.lead_id);
    const service=services.find(x=>x.id===form.service_id);
    if(!lead||!service||!form.amount){setMessage("Select a lead, service and agreed amount.");return;}
    setSaving(true);setMessage("");
    const proposal:Proposal={id:crypto.randomUUID(),business_name:lead.business_name,contact_name:lead.contact_name,service:service.name,amount:Number(form.amount),currency:service.currency,timeline:form.timeline,scope:form.scope,terms:form.terms,status:"draft",created_at:new Date().toISOString()};
    setProposals(x=>[proposal,...x]);setSelected(proposal);
    await supabase.from("leads").update({status:"proposal",updated_at:new Date().toISOString()}).eq("id",lead.id);
    await supabase.from("activities").insert({lead_id:lead.id,activity_type:"proposal_created",description:"Proposal drafted for "+service.name+" — "+service.currency+" "+Number(form.amount).toLocaleString()});
    setForm({lead_id:"",service_id:"",amount:"",timeline:"",scope:"",terms:"Payment terms to be confirmed in the final invoice."});
    setSaving(false);setMessage("Proposal drafted. The CRM lead has moved to proposal stage.");
  }

  function updateProposalStatus(id:string,status:string){
    setProposals(x=>x.map(p=>p.id===id?{...p,status}:p));
    setSelected(x=>x&&x.id===id?{...x,status}:x);
  }

  if(!user)return <main className="dashboard"><section className="dashHero"><p>Checking secure session…</p></section></main>;

  return <main className="dashboard">
    <nav><b>Easy Consultants</b><span>Proposal Engine</span><span>{user.email}</span><button onClick={async()=>{await supabase.auth.signOut();router.replace("/login")}}>Sign out</button><a href="/dashboard">CRM</a></nav>
    <section className="dashHero"><p className="eyebrow">PROPOSAL ENGINE</p><h1>Turn qualified leads into signed work.</h1><p className="lead">Build a professional proposal from a CRM lead without inventing pricing or losing the sales context.</p></section>
    <section>
      <div className="crmHeader"><div><p className="eyebrow">CREATE PROPOSAL</p><h2>Draft the deal.</h2></div>{message&&<div className="crmMessage">{message}</div>}</div>
      <form className="crmForm" onSubmit={createProposal}>
        <select required value={form.lead_id} onChange={e=>setForm({...form,lead_id:e.target.value})}><option value="">Select qualified lead *</option>{leads.map(l=><option key={l.id} value={l.id}>{l.business_name}{l.contact_name?" — "+l.contact_name:""}</option>)}</select>
        <select required value={form.service_id} onChange={e=>serviceChanged(e.target.value)}><option value="">Select service *</option>{services.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <input required type="number" min="0" step="0.01" placeholder="Agreed amount (LSL) *" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/>
        <input placeholder="Delivery timeline" value={form.timeline} onChange={e=>setForm({...form,timeline:e.target.value})}/>
        <textarea required placeholder="Scope of work *" value={form.scope} onChange={e=>setForm({...form,scope:e.target.value})}/>
        <textarea placeholder="Terms" value={form.terms} onChange={e=>setForm({...form,terms:e.target.value})}/>
        <button className="btn crmSubmit" disabled={saving}>{saving?"Creating…":"Create proposal"}</button>
      </form>
    </section>
    <section className="dark crmLeads"><p className="eyebrow">PROPOSALS</p><h2>{proposals.length?"Drafts created in this session":"No proposal drafts yet"}</h2>
      <div className="leadTable">{proposals.map(p=><article className="leadRow" key={p.id}><div className="leadIdentity"><b>{p.business_name}</b><span>{p.service} · {p.currency} {p.amount.toLocaleString()}</span><small>{p.timeline||"Timeline to be confirmed"}</small></div><select value={p.status} onChange={e=>updateProposalStatus(p.id,e.target.value)}>{proposalStatuses.map(s=><option key={s}>{s}</option>)}</select><button className="rowButton" onClick={()=>setSelected(p)}>Open</button></article>)}</div>
    </section>
    {selected&&<section className="leadDetail"><div className="crmHeader"><div><p className="eyebrow">PROPOSAL</p><h2>{selected.business_name}</h2><p>{selected.service} · {selected.currency} {selected.amount.toLocaleString()}</p></div><button className="rowButton" onClick={()=>setSelected(null)}>Close</button></div><div className="proposalPreview"><h3>Scope</h3><p>{selected.scope}</p><h3>Timeline</h3><p>{selected.timeline||"To be confirmed"}</p><h3>Terms</h3><p>{selected.terms}</p><p className="proposalStatus">Status: {selected.status}</p></div></section>}
    <footer>Easy Consultants · Proposal Engine</footer>
  </main>;
}
