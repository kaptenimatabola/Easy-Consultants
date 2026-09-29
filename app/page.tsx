"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../lib/supabase";

const services=["Business Strategy","Brand & Marketing","Web & Software","AI & Automation","Sales Systems","Digital Transformation"];

export default function Home(){
  const [sent,setSent]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); setBusy(true); setError("");
    const form=new FormData(e.currentTarget);
    const payload={
      business_name:String(form.get("business_name")||"").trim(),
      contact_name:String(form.get("contact_name")||"").trim(),
      email:String(form.get("email")||"").trim(),
      phone:String(form.get("phone")||"").trim(),
      source:"Easy Consultants website",
      service_interest:String(form.get("service_interest")||"").trim(),
      notes:String(form.get("message")||"").trim(),
      status:"new",
      priority:"medium"
    };
    const {error}=await supabase.from("leads").insert(payload);
    if(error){setError("We couldn't submit your enquiry right now. Please email us directly.");setBusy(false);return;}
    setSent(true); setBusy(false); e.currentTarget.reset();
  }

  return <main>
    <nav><b>Easy Consultants</b><span>Strategy · Technology · Growth</span><span><a href="https://wa.me/26662667123">WhatsApp +266 6266 7123</a> · <a href="#contact">Start a project</a></span></nav>
    <section className="hero"><p className="eyebrow">INTERNATIONAL CONSULTING & AUTOMATION</p><h1>Build smarter.<br/>Grow faster.<br/><em>Go global.</em></h1><p className="lead">Easy Consultants helps businesses turn ideas into brands, digital products, automated operations and measurable growth.</p><div><a className="btn" href="#contact">Book a consultation</a><a className="ghost" href="#services">Explore services</a></div></section>
    <section id="services"><p className="eyebrow">WHAT WE DO</p><h2>One growth partner. An entire business engine.</h2><div className="grid">{services.map((s,i)=><article key={s}><small>0{i+1}</small><h3>{s}</h3><p>Professional systems, execution and automation designed around your commercial goals.</p></article>)}</div></section>
    <section className="dark"><p className="eyebrow">THE EASY MODEL</p><h2>Strategy → Build → Automate → Acquire → Scale</h2><p>We combine consulting, creative production, software and revenue systems into one operating layer.</p></section>
    <section id="contact" className="contact"><p className="eyebrow">START HERE</p><h2>Tell us what you want to build.</h2><p>Projects can start from Lesotho and serve clients internationally.</p>
      {sent ? <div className="successBox"><strong>Enquiry received.</strong><p>Thank you. Your request is now in the Easy Consultants sales pipeline.</p></div> :
      <form className="leadForm" onSubmit={submit}>
        <input name="business_name" placeholder="Business / company name" required/>
        <input name="contact_name" placeholder="Your name" required/>
        <input name="email" type="email" placeholder="Business email" required/>
        <input name="phone" placeholder="Phone / WhatsApp"/>
        <select name="service_interest" required><option value="">What do you need?</option>{services.map(s=><option key={s}>{s}</option>)}</select>
        <textarea name="message" placeholder="Tell us briefly what you want to achieve." rows={5}/>
        {error&&<p className="formError">{error}</p>}
        <button className="btn" disabled={busy}>{busy?"Submitting…":"Submit project enquiry"}</button>
      </form>}
      <p>Prefer email? <a href="mailto:jeremiahmatabola@gmail.com">jeremiahmatabola@gmail.com</a> · <a href="https://wa.me/26662667123">WhatsApp us</a></p>
    </section>
    <footer>© 2026 Easy Consultants · Global by design.</footer>
  </main>
}