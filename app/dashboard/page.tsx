"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
const stages=["new","qualified","contacted","discovery","proposal","won"];
export default function Dashboard(){
 const [leads,setLeads]=useState<any[]>([]); const [loading,setLoading]=useState(true);
 useEffect(()=>{supabase.from("ec_leads").select("*").order("created_at",{ascending:false}).then(({data})=>{setLeads(data||[]);setLoading(false)})},[]);
 const count=(s:string)=>leads.filter(x=>x.status===s).length;
 return <main className="dashboard"><nav><b>Easy Consultants</b><span>CEO Command Center</span><a href="/">Public site</a></nav>
 <section className="dashHero"><p className="eyebrow">LIVE SALES ENGINE</p><h1>Turn attention into revenue.</h1><p className="lead">Live CRM pipeline connected to the Easy Consultants operational database.</p></section>
 <section><div className="metricGrid">{[["TOTAL",leads.length],["QUALIFIED",count("qualified")],["PROPOSALS",count("proposal")],["WON",count("won")]].map(([a,b])=><article key={String(a)}><small>{a}</small><strong>{b}</strong><span>live records</span></article>)}</div></section>
 <section><p className="eyebrow">PIPELINE</p><div className="pipeline">{stages.map(s=><article key={s}><small>{s.toUpperCase()}</small><strong>{count(s)}</strong><div className="bar"><i style={{width:Math.min(count(s)*12,100)+"%"}}/></div></article>)}</div></section>
 <section className="dark"><p className="eyebrow">LEADS</p><h2>{loading?"Loading CRM…":leads.length?"Latest prospects":"CRM ready for prospects"}</h2><div className="actionList">{leads.slice(0,10).map(l=><div key={l.id}><b>{l.status}</b><span>{l.full_name}{l.company?" · "+l.company:""}</span><em>{l.service||"General"} →</em></div>)}</div></section>
 <footer>Easy Consultants · Internal dashboard</footer></main>}