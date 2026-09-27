"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Login(){
  const router=useRouter();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [mode,setMode]=useState<"login"|"signup">("login");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);

  async function submit(e:FormEvent){
    e.preventDefault(); setBusy(true); setMessage("");
    const result=mode==="login"
      ? await supabase.auth.signInWithPassword({email,password})
      : await supabase.auth.signUp({email,password});
    if(result.error){setMessage(result.error.message);setBusy(false);return;}
    if(mode==="signup"){setMessage("Account created. If email confirmation is enabled, confirm your email, then sign in.");setMode("login");setBusy(false);return;}
    router.replace("/dashboard");
  }

  return <main className="loginPage"><div className="loginCard">
    <p className="eyebrow">EASY CONSULTANTS</p><h1>{mode==="login"?"CEO Command Center":"Create admin account"}</h1>
    <p>{mode==="login"?"Secure access to the sales CRM.":"Create the account that will operate the CRM."}</p>
    <form onSubmit={submit}><input type="email" placeholder="Business email" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Password (8+ characters)" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required/><button disabled={busy}>{busy?"Working…":mode==="login"?"Sign in":"Create account"}</button></form>
    {message&&<div className="loginMessage">{message}</div>}
    <button className="textButton" onClick={()=>{setMode(mode==="login"?"signup":"login");setMessage("")}}>{mode==="login"?"Create the first account":"Back to sign in"}</button>
    <a href="/">← Public site</a>
  </div></main>
}