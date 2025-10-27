"use client";
import { useEffect, useState } from "react";

type Props = { id?: string; className?: string };

export default function FavLink({ id, className }: Props){
  const key = id ?? "__global__"; // fonctionne même sans id
  const [on,setOn]=useState(false);
  useEffect(()=>{ try{ const a=JSON.parse(localStorage.getItem("lk_favs")||"[]"); setOn(a.includes(key)); }catch{} },[key]);
  function toggle(){
    try{
      const a: string[] = JSON.parse(localStorage.getItem("lk_favs")||"[]");
      const i=a.indexOf(key); if(i===-1) a.push(key); else a.splice(i,1);
      localStorage.setItem("lk_favs", JSON.stringify(a));
      setOn(!on);
    }catch{}
  }
  return (
    <button aria-pressed={on} onClick={toggle}
      className={"inline-flex items-center gap-1 text-sm "+(on? "text-red-600":"text-gray-500")+(className? " "+className:"")}>
      <span>{on? "★":"☆"}</span><span>Favori</span>
    </button>
  );
}
