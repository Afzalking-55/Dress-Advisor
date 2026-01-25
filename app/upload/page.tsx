"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import BottomNav from "../components/BottomNav";
import { addWardrobeItem } from "../lib/db";

/* ---------------- TYPES ---------------- */

type Category = "Top" | "Bottom" | "Shoes" | "Other";

type WardrobeItem = {
  id: string;
  category: Category;
  imageUrl: string;
  createdAt: number;
  colorName: string;
  aiName: string;
  occasions: string[];
  clothType?: string;
  confidence?: number;
};

const OCCASIONS = ["College","Casual","Office","Party","Date","Wedding","Meeting"];

/* Auto switch backend */
const BACKEND =
  typeof window !== "undefined" && location.hostname === "localhost"
    ? "http://127.0.0.1:8001"
    : "https://dressai-backend-production.up.railway.app";

/* ---------------- HELPERS ---------------- */

function resolveCategory(label:string):Category{
  const l = label.toLowerCase();

  if(l.match(/shoe|sneaker|boot|sandal/)) return "Shoes";
  if(l.match(/pant|jean|trouser|cargo|short/)) return "Bottom";
  if(l.match(/shirt|tshirt|tee|hoodie|jacket|sweater|top/)) return "Top";

  return "Other";
}

function normalizeConfidence(v:any){
  const n = Number(v||0.4);
  return Math.round((n>1?n/100:n)*100);
}

/* timeout wrapper */
function withTimeout<T>(p:Promise<T>, ms=15000):Promise<T>{
  return new Promise((res,rej)=>{
    const t=setTimeout(()=>rej("AI timeout"),ms);
    p.then(v=>{clearTimeout(t);res(v)}).catch(e=>{clearTimeout(t);rej(e)});
  });
}

/* ---------------- COMPONENT ---------------- */

export default function UploadPage(){

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [user,setUser]=useState<User|null>(null);
  const [file,setFile]=useState<File|null>(null);
  const [preview,setPreview]=useState("");

  const [aiName,setAiName]=useState("");
  const [category,setCategory]=useState<Category>("Other");
  const [clothType,setClothType]=useState("");
  const [colorName,setColorName]=useState("Grey");
  const [confidence,setConfidence]=useState(0);

  const [occasions,setOccasions]=useState<string[]>([]);
  const [msg,setMsg]=useState("");
  const [loading,setLoading]=useState(false);
  const [aiLoading,setAiLoading]=useState(false);

  useEffect(()=>{
    return onAuthStateChanged(auth,u=>{
      if(!u) router.push("/auth");
      else setUser(u);
    });
  },[router]);

  function toggle(o:string){
    setOccasions(p=>p.includes(o)?p.filter(x=>x!==o):[...p,o]);
  }

  /* ---------------- AI ---------------- */

  async function detectAI(file:File){
    const form=new FormData();
    form.append("file",file);

    const res = await fetch(`${BACKEND}/api/process/multi`,{
      method:"POST",
      body:form
    });

    if(!res.ok) throw await res.text();
    return res.json();
  }

  async function uploadCloudinary(uid:string,file:File){
    const form=new FormData();
    form.append("file",file);
    form.append("uid",uid);

    const r=await fetch("/api/cloudinary-upload",{method:"POST",body:form});
    const d=await r.json();

    if(!r.ok) throw "Cloudinary failed";
    return d.url;
  }

  /* ---------------- PICK ---------------- */

  async function pick(f:File){

    setFile(f);
    setPreview(URL.createObjectURL(f));
    setAiLoading(true);
    setMsg("Analyzing…");

    try{
      const data:any = await withTimeout(detectAI(f));

      console.log("AI RAW:",data);

      const t=data?.top;
      if(!t?.label) throw "No detection";

      const label=String(t.label);
      const conf=normalizeConfidence(t.confidence);

      setClothType(label);
      setCategory(resolveCategory(label));
      setAiName(t.aiName||label);
      setColorName(t.colorName||"Grey");
      setConfidence(conf);

      setMsg(conf>60?"AI detected ✅":"Low confidence ⚠️");

    }catch(e){
      console.error(e);
      setMsg("AI failed — manual mode");
      setConfidence(35);
    }finally{
      setAiLoading(false);
    }
  }

  /* ---------------- SAVE ---------------- */

  async function save(){

    if(!user||!file) return alert("Missing image");
    if(!occasions.length) return alert("Select occasion");

    setLoading(true);

    try{
      const url = await uploadCloudinary(user.uid,file);

      const item:WardrobeItem={
        id:crypto.randomUUID(),
        imageUrl:url,
        createdAt:Date.now(),
        aiName: aiName||clothType||"Outfit",
        category,
        clothType,
        colorName,
        confidence,
        occasions
      };

      await addWardrobeItem(user.uid,item);
      router.push("/wardrobe");

    }catch(e:any){
      alert(e);
    }finally{
      setLoading(false);
    }
  }

  return(
    <main className="min-h-screen p-6 text-white pb-28">

      <button onClick={()=>router.back()}>← Back</button>

      <div className="mt-6 grid md:grid-cols-2 gap-6">

        <div className="border p-4 rounded">

          <input ref={inputRef} hidden type="file" accept="image/*"
            onChange={e=>e.target.files&&pick(e.target.files[0])}/>

          <button onClick={()=>inputRef.current?.click()} className="border p-3 w-full">
            Upload Image
          </button>

          {preview && <img src={preview} className="mt-4 rounded"/>}

          <div className="mt-2 text-sm">
            {aiLoading?"AI thinking…":msg}
          </div>

        </div>

        <div className="border p-4 rounded space-y-3">

          <input value={aiName} onChange={e=>setAiName(e.target.value)}
            placeholder="Item name"
            className="w-full p-2 border bg-black"/>

          <div className="grid grid-cols-4 gap-2">
            {(["Top","Bottom","Shoes","Other"] as Category[]).map(c=>(
              <button key={c} onClick={()=>setCategory(c)}
                className={category===c?"bg-white text-black p-2":"border p-2"}>
                {c}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map(o=>(
              <button key={o} onClick={()=>toggle(o)}
                className={occasions.includes(o)?"bg-white text-black px-3":"border px-3"}>
                {o}
              </button>
            ))}
          </div>

          <div className="text-xs opacity-70">
            Confidence: {confidence}%
          </div>

          <button onClick={save} disabled={loading}
            className="bg-white text-black w-full py-3 font-bold">
            {loading?"Saving…":"Save"}
          </button>

        </div>

      </div>

      <BottomNav/>
    </main>
  );
}
