"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Client={id:string;business_name:string;contact_name:string|null;email:string|null;phone:string|null;industry:string|null;status:string};
type Project={id:string;client_id:string|null;name:string;service_id:string|null;status:string;start_date:string|null;due_date:string|null;budget:number|null;notes:string|null;clients?:{business_name:string}|null;services?:{name:string}|null};
type Invoice={id:string;client_id:string|null;project_id:string|null;invoice_number:string;amount:number;currency:string;status:string;due_date:string|null;stripe_payment_url:string|null;clients?:{business_name:string}|null;projects?:{name:string}|null};

const projectStatuses=["planned","active","review","completed","cancelled"];
const invoiceStatuses=["draft","sent","paid","overdue","cancelled"];

export default function Operations(){
 const router=useRouter();
 const [user,setUser]=useState<any>(null);
 const [clients,setClients]=useState<Client[]>([]);
 const [projects,setProjects]=useState<Project[]>([]);
 const [invoices,setInvoices]=useState<Invoice[]>([]);
 const [message,setMessage]=useState("");
 const [saving,setSaving]=useState(false);

 async function load(){
  const [{data:c,error:e1},{data:p,error:e2},{data:i,error:e3}]=await Promise.all([
   supabase.from("clients").select("*").order("created_at",{ascending:false}),
   supabase.from("projects").select("id,client_id,name,service_id,status,start_date,due_date,budget,notes,clients(business_name),services(name)").order("created_at",{ascending:false}),
   supabase.from("invoices").select("id,client_id,project_id,invoice_number,amount,currency,status,due_date,stripe_payment_url,clients(business_name),projects(name)").order("created_at",{ascending:false})
  ]);
  if(e1||e2||e3){setMessage(e1?.message||e2?.message||e3?.message||"Unable to load operations.");return;}
  setClients((c||[]) as Client[]); setProjects((p||[]) as Project[]); setInvoices(((i||[]) as any[]).map(x=>({...x,amount:Number(x.amount)})));
 }

 useEffect(()=>{supabase.auth.getUser().then(async({data})=>{if(!data.user){router.replace("/login");return;}setUser(data.user);await load();});},[router]);

 async function updateProject(id:string,status:string){
  setSaving(true); setMessage("");
  const {error}=await supabase.from("projects").update({status,updated_at:new Date().toISOString()}).eq("id",id);
  if(error)setMessage(error.message); else {setMessage("Project status updated.");await load();}
  setSaving(false);
 }

 async function updateInvoice(id:string,status:string){
  setSaving(true); setMessage("");
  const {error}=await supabase.from("invoices").update({status}).eq("id",id);
  if(error)setMessage(error.message); else {setMessage("Invoice status updated.");await load();}
  setSaving(false);
 }

 const outstanding=invoices.filter(x=>["draft","sent","overdue"].includes(x.status)).reduce((a,x)=>a+x.amount,0);
 const paid=invoices.filter(x=>x.status==="paid").reduce((a,x)=>a+x.amount,0);

 if(!user)return <main className="dashboard"><section className="dashHero"><p>Checking secure session…</p></section></main>;

 return <main className="dashboard">
  <nav><b>Easy Consultants</b><span>Client Operations</span><span>{user.email}</span><button onClick={async()=>{await supabase.auth.signOut();router.replace("/login")}}>Sign out</button><a href="/dashboard">CRM</a><a href="/proposals">Proposals</a></nav>
  <section className="dashHero"><p className="eyebrow">DELIVERY & REVENUE OPERATIONS</p><h1>From signed work to completed work.</h1><p className="lead">Manage clients, delivery, invoices and collection status from one authenticated workspace.</p></section>
  <section><div className="metricGrid">
   {[["CLIENTS",clients.length],["PROJECTS",projects.length],["OUTSTANDING",`LSL ${outstanding.toLocaleString()}`],["PAID",`LSL ${paid.toLocaleString()}`],["ACTIVE",projects.filter(x=>x.status==="active").length]].map(([l,v])=><article key={String(l)}><small>{l}</small><strong>{v}</strong><span>live records</span></article>)}
  </div></section>
  {message&&<section><div className="crmMessage">{message}</div></section>}
  <section className="dark crmLeads"><p className="eyebrow">CLIENTS</p><h2>Active client base</h2><div className="leadTable">
   {clients.length?clients.map(c=><article className="leadRow" key={c.id}><div className="leadIdentity"><b>{c.business_name}</b><span>{c.contact_name||"No contact"}{c.email?" · "+c.email:""}</span><small>{c.industry||"Consulting client"} · {c.status}</small></div><span className="proposalNumber">{projects.filter(p=>p.client_id===c.id).length} project(s)</span></article>):<p>No clients yet. Accept a proposal to create the first client.</p>}
  </div></section>
  <section className="crmSection"><p className="eyebrow">PROJECT DELIVERY</p><h2>Projects</h2><div className="leadTable">
   {projects.length?projects.map(p=><article className="leadRow" key={p.id}><div className="leadIdentity"><b>{p.name}</b><span>{p.clients?.business_name||"Client"} · {p.services?.name||"Service"}</span><small>{p.budget!=null?`LSL ${Number(p.budget).toLocaleString()}`:"Budget not set"}{p.due_date?` · Due ${p.due_date}`:""}</small></div><select disabled={saving} value={p.status} onChange={e=>updateProject(p.id,e.target.value)}>{projectStatuses.map(s=><option key={s}>{s}</option>)}</select></article>):<p>No projects yet.</p>}
  </div></section>
  <section className="crmSection"><p className="eyebrow">INVOICING</p><h2>Invoices</h2><div className="leadTable">
   {invoices.length?invoices.map(i=><article className="leadRow" key={i.id}><div className="leadIdentity"><b>{i.invoice_number}</b><span>{i.clients?.business_name||"Client"} · {i.projects?.name||"Project"}</span><small>LSL {i.amount.toLocaleString()}{i.due_date?` · Due ${i.due_date}`:""}{i.stripe_payment_url?" · Payment link ready":""}</small></div><select disabled={saving} value={i.status} onChange={e=>updateInvoice(i.id,e.target.value)}>{invoiceStatuses.map(s=><option key={s}>{s}</option>)}</select></article>):<p>No invoices yet. Accept a proposal to generate the first invoice.</p>}
  </div></section>
  <footer>Easy Consultants · Client Operations</footer>
 </main>;
}
