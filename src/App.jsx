import React, { useEffect, useState } from "react";

export default function App(){
  const [msg,setMsg]=useState("Verifica funzione Netlify/Blobs...");
  useEffect(()=>{
    (async()=>{
      try{
        const r = await fetch('/.netlify/functions/state',{cache:'no-store'});
        const j = await r.json();
        setMsg("OK! Stato corrente: " + JSON.stringify(j));
      }catch(e){
        setMsg("Errore: " + String(e));
      }
    })();
  },[]);
  return (<div className="p-6 max-w-2xl mx-auto">
    <h1 className="text-2xl font-bold mb-2">Paris League – test backend</h1>
    <p className="text-sm mb-4">Se leggi <b>OK!</b> qui sotto, la funzione e i Blobs sono configurati.</p>
    <pre className="p-3 bg-white rounded-xl border whitespace-pre-wrap text-xs">{msg}</pre>
  </div>);
}
