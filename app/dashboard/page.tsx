"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const stages=["new","contacted","qualified","proposal","won","lost"];

export default function Dashboard(){
  const router=useRouter();
  const [user,setUser]=useState<any>(null);
  const [leads,setLeads]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    let mounted=true;
    supabase.auth.getUser().then(({data})=>{
      if(!mounted) return;
      if(!data.user){ router.replace("/login"); return; }
      setUser(data.user);
      supabase.from("leads").select("*").order("created_at",{ascending:false}).then(({data,error})=>{
        if(error) console.error(error);
        if(mounted){setLeads(data||[]);setLoading(false);}
      });
    });
    return()=>{mounted=false};
  },[router]);

  const count=(s:string)=>leads.filter(x=>x.status===s).length;

  async function signOut(){
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if(!user) return <main className="dashboard"><section className="dashHero"><p>Checking secure session…</p></section></main>;

  return <main className="dashboard">
    <nav><b>Easy Consultants</b><span>CEO Command Center</span><span>{user.email}</span><button onClick={signOut}>Sign out</button><a href="/">Public site</a></nav>
    <section className="dashHero"><p className="eyebrow">SECURE SALES ENGINE</p><h1>Turn attention into revenue.</h1><p className="lead">Authenticated CRM command center for Easy Consultants.</p></section>
    <section><div className="metricGrid">
      {[["TOTAL",leads.length],["QUALIFIED",count("qualified")],["PROPOSALS",count("proposal")],["WON",count("won")]].map(([a,b])=><article key={String(a)}><small>{a}</small><strong>{b}</strong><span>live records</span></article>)}
    </div></section>
    <section><p className="eyebrow">PIPELINE</p><div className="pipeline">
      {stages.map(s=><article key={s}><small>{s.toUpperCase()}</small><strong>{count(s)}</strong><div className="bar"><i style={{width:Math.min(count(s)*12,100)+"%"}}/></div></article>)}
    </div></section>
    <section className="dark"><p className="eyebrow">LEADS</p><h2>{loading?"Loading CRM…":leads.length?"Latest prospects":"CRM ready for prospects"}</h2>
      <div className="actionList">{leads.slice(0,10).map(l=><div key={l.id}><b>{l.status}</b><span>{l.contact_name||"Unnamed contact"}{l.business_name?" · "+l.business_name:""}</span><em>{l.service_interest||"General"} →</em></div>)}</div>
    </section>
    <footer>Easy Consultants · Internal dashboard</footer>
  </main>
}