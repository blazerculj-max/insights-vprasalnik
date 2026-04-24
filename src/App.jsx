// Barvni kompas — App.jsx z GDPR privolitvijo

import { useState } from 'react'

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwrZtQku9a9pR-_q407TVLT_POE-PV8gHfy-8S5h2A_buBXbg2hsQyXUyXe7FHeZjzAvw/exec'

const SMAP = {L:0,'1':1,'2':2,'3':3,'4':4,'5':5,M:6}
const N = 15
const SN_N = 4

const QUESTIONS = [
  {B:'Natančen in diplomatski',R:'Usmerjen v rezultate in hiter',G:'Spodbujajoč in skrben',Y:'Odprt in družaben'},
  {B:'Zbran in pozoren na podrobnosti',R:'Aktiven in odločen',G:'Diplomatski in pomirjujoč',Y:'Živahen in spontan'},
  {B:'Zanesljiv in zadržan',R:'Odločen in ciljno usmerjen',G:'Prijazen in potrpežljiv',Y:'Prepričljiv in živahen'},
  {B:'Miren in zmeren',R:'Odločen in neposreden',G:'Optimističen in brezskrben',Y:'Natančen in precizen'},
  {B:'Sistematičen in jedrnat',R:'Samozavesten in energičen',G:'Prijeten in stabilen',Y:'Zgovoren in prijazen'},
  {B:'Logičen in jasen',R:'Neposreden in odločen',G:'Zvest in prilagodljiv',Y:'Družaben in komunikativen'},
  {B:'Premišljen in samozadosten',R:'Odločen in pogumen',G:'Povezujoč in prilagodljiv',Y:'Izrazit in poln upanja'},
  {B:'Razmišljujoč in analitičen',R:'Vztrajen in samozavesten',G:'Stabilen in skrben',Y:'Prepričljiv in navdušujoč'},
  {B:'Dosleden in natančen',R:'Odločen in samozavesten',G:'Zvest in pripravljen pomagati',Y:'Družaben in vesel'},
  {B:'Previden in premišljen',R:'Hiter in ciljno naravnan',G:'Pozoren in empatičen',Y:'Spontan in navdušen'},
  {B:'Odgovoren in strukturiran',R:'Odločen in tekmovalen',G:'Zadržan in sodelovalen',Y:'Odprt in komunikativen'},
  {B:'Natančen in racionalen',R:'Usmerjen v nalogo in neposreden',G:'Zmeren in prijazen',Y:'Ustvarjalen in ekipno usmerjen'},
  {B:'Analitičen in temeljit',R:'Tekmovalen in odločen',G:'Nezahteven in odziven',Y:'Prijazen in zabaven'},
  {B:'Stabilen in pozoren',R:'Drzen in objektiven',G:'Razmišljujoč in temeljit',Y:'Vpliven in izrazit'},
  {B:'Previden in natančen',R:'Odkrit in neposreden',G:'Sprejemajoč in zvest',Y:'Optimističen in vesel'},
]

const SN_QUESTIONS = [
  {S:'Osredotočam se na konkretna dejstva in podrobnosti',N:'Iščem vzorce in skrite možnosti za dejstvi'},
  {S:'Zaupam preizkušenim metodam in preteklim izkušnjam',N:'Rad preizkušam nove pristope in nepreizkušene ideje'},
  {S:'Živim v sedanjosti in rešujem aktualne probleme',N:'Razmišljam o prihodnosti in možnostih ki še niso'},
  {S:'Pri odločanju se oprem na konkretne podatke in dokaze',N:'Pri odločanju pogosto sledim notranjemu občutku'},
]
const SN_VALS = ['-3','-2','-1','0','+1','+2','+3']

const CLR = {B:'#4a7ab5',R:'#c94030',G:'#2e8a55',Y:'#c49a10'}
const CLR_L = {B:'#e8f0fa',R:'#faeaea',G:'#e6f5ee',Y:'#fdf6e3'}
const CLR_NAME = {B:'Analitična modra',R:'Aktivna rdeča',G:'Stabilna zelena',Y:'Navdušena rumena'}
const COLORS = ['B','R','G','Y']

function shuffle(arr, seed) {
  const a = [...arr]; let s = seed
  for(let i=a.length-1;i>0;i--){
    s=(s*1664525+1013904223)&0xffffffff
    const j=Math.abs(s)%(i+1);[a[i],a[j]]=[a[j],a[i]]
  }
  return a
}

function validate(ans) {
  const v=Object.values(ans).filter(x=>x!==null)
  if(v.length<4) return 'incomplete'
  const lc=v.filter(x=>x==='L').length,mc=v.filter(x=>x==='M').length
  if(lc!==1) return lc+'x L'
  if(mc!==1) return mc+'x M'
  if(new Set(v).size!==4) return 'Vrednosti niso različne'
  return 'ok'
}

function calcScores(answers) {
  const raw={B:0,R:0,G:0,Y:0}
  answers.forEach(a=>['B','R','G','Y'].forEach(k=>{raw[k]+=SMAP[a[k]]||0}))
  const con={}
  ;['B','R','G','Y'].forEach(k=>{con[k]=parseFloat((raw[k]/N).toFixed(2))})
  return con
}

function validateSN(val) {
  return val !== null ? 'ok' : 'incomplete'
}

function calcSN(snAnswers) {
  const vals = snAnswers.filter(v=>v!==null).map(v=>parseInt(v))
  if(vals.length === 0) return {type:'U', snScore:0, label:'Uravnotežen'}
  const avg = parseFloat((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2))
  if(avg >= 0.5) return {type:'N', snScore:avg, label:'Intuicija'}
  if(avg <= -0.5) return {type:'S', snScore:avg, label:'Zaznavanje'}
  return {type:'U', snScore:avg, label:'Uravnotežen'}
}

function ColorWheel({size=60}) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <path d="M30,30 L30,4 A26,26 0 0,1 56,30 Z" fill={CLR.R}/>
      <path d="M30,30 L56,30 A26,26 0 0,1 30,56 Z" fill={CLR.Y}/>
      <path d="M30,30 L30,56 A26,26 0 0,1 4,30 Z" fill={CLR.G}/>
      <path d="M30,30 L4,30 A26,26 0 0,1 30,4 Z" fill={CLR.B}/>
      <circle cx="30" cy="30" r="10" fill="white"/>
    </svg>
  )
}

export default function App() {
  const [step, setStep] = useState('intro')
  const [ime, setIme] = useState('')
  const [email, setEmail] = useState('')
  const [podjetje, setPodjetje] = useState('')
  const [delovnoMesto, setDelovnoMesto] = useState('')
  const [spol, setSpol] = useState('m')
  const [gdprSoglasje, setGdprSoglasje] = useState(false)
  const [answers, setAnswers] = useState(Array(15).fill(null).map(()=>({B:null,R:null,G:null,Y:null})))
  const [snAnswers, setSnAnswers] = useState(Array(4).fill(null))
  const [current, setCurrent] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const orders = QUESTIONS.map((_,i)=>shuffle(COLORS,i*999+42))

  function setVal(qi,color,val) {
    setAnswers(prev=>{
      const next=prev.map(a=>({...a}))
      Object.keys(next[qi]).forEach(k=>{if(next[qi][k]===val)next[qi][k]=null})
      next[qi][color]=val
      return next
    })
  }

  function setSnVal(qi, val) {
    setSnAnswers(prev=>{
      const next=[...prev]
      next[qi] = next[qi]===val ? null : val
      return next
    })
  }

  async function handleSubmit() {
    setSubmitting(true); setError('')
    try {
      const scores=calcScores(answers)
      const snResult=calcSN(snAnswers)
      const params=new URLSearchParams({
        ime, email, podjetje, delovno_mesto: delovnoMesto, spol,
        B:scores.B, G:scores.G, Y:scores.Y, R:scores.R,
        SN:snResult.snScore
      })
      await fetch(APPS_SCRIPT_URL+'?'+params.toString(),{method:'GET',mode:'no-cors'})
      setStep('done')
    } catch(e) { setError('Napaka pri pošiljanju. Poskusite znova.') }
    setSubmitting(false)
  }

  const vals = ['L','1','2','3','4','5','M']

  const CSS = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    .fu{animation:fadeUp .55s ease forwards}
    .fu2{animation:fadeUp .55s .12s ease forwards;opacity:0}
    .fu3{animation:fadeUp .55s .24s ease forwards;opacity:0}
    .fu4{animation:fadeUp .55s .36s ease forwards;opacity:0}
    input:focus{border-color:#1a1a1a !important;outline:none;background:white !important}
    button{transition:all .12s ease}
    .btn-primary:hover{opacity:.88;transform:translateY(-1px)}
  `

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if(step==='intro') return (
    <div style={{fontFamily:'system-ui,sans-serif',minHeight:'100vh',background:'#fafaf8',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <style>{CSS}</style>
      <div style={{maxWidth:480,width:'100%'}}>
        <div className="fu" style={{display:'flex',alignItems:'center',gap:14,marginBottom:40}}>
          <ColorWheel size={52}/>
          <div>
            <div style={{fontFamily:'Georgia,serif',fontSize:18,fontWeight:700,color:'#1a1a1a'}}>Barvni kompas</div>
            <div style={{fontSize:12,color:'#aaa',marginTop:1}}>Osebnostni profil</div>
          </div>
        </div>
        <div className="fu2">
          <h1 style={{fontFamily:'Georgia,serif',fontSize:40,fontWeight:700,color:'#1a1a1a',lineHeight:1.05,marginBottom:18,letterSpacing:'-0.025em'}}>Spoznajte<br/>svojo osebnost</h1>
          <p style={{fontSize:15,color:'#6b6460',lineHeight:1.8,marginBottom:32}}>Vprašalnik temelji na Jungovi tipologiji in vam v 5–8 minutah razkrije vaš edinstveni osebnostni profil — kako razmišljate, komunicirate in delujete pod pritiskom.</p>
        </div>
        <div className="fu3" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:32}}>
          {[{icon:'🎯',text:'Vaš delovni slog in komunikacija'},{icon:'💡',text:'Prednosti in razvojne priložnosti'},{icon:'👥',text:'Prispevek k timu in vodenje'},{icon:'📊',text:'Prodajni profil in akcijski plan'}].map((item,i)=>(
            <div key={i} style={{background:'white',border:'1px solid #e8e4df',borderRadius:12,padding:'13px 14px',display:'flex',alignItems:'flex-start',gap:10}}>
              <span style={{fontSize:17,flexShrink:0}}>{item.icon}</span>
              <span style={{fontSize:12,color:'#4a4a4a',lineHeight:1.55}}>{item.text}</span>
            </div>
          ))}
        </div>
        <div className="fu4">
          <button className="btn-primary" onClick={()=>setStep('form')} style={{width:'100%',padding:'16px',background:'#1a1a1a',color:'white',border:'none',borderRadius:14,fontSize:16,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Začni vprašalnik →</button>
          <p style={{textAlign:'center',fontSize:11,color:'#bbb',marginTop:14,lineHeight:1.65}}>5–8 minut · 15 vprašanj · Vaši podatki so zaščiteni</p>
        </div>
      </div>
    </div>
  )

  // ── FORM ───────────────────────────────────────────────────────────────────
  if(step==='form') return (
    <div style={{fontFamily:'system-ui,sans-serif',minHeight:'100vh',background:'#fafaf8',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <style>{CSS}</style>
      <div style={{maxWidth:420,width:'100%'}}>
        <button onClick={()=>setStep('intro')} style={{background:'none',border:'none',fontSize:13,color:'#aaa',cursor:'pointer',padding:'0 0 20px',display:'flex',alignItems:'center',gap:5,fontFamily:'inherit'}}>← Nazaj</button>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
          <ColorWheel size={36}/>
          <div>
            <div style={{fontFamily:'Georgia,serif',fontSize:16,fontWeight:700,color:'#1a1a1a'}}>Vaši podatki</div>
            <div style={{fontSize:11,color:'#aaa'}}>Korak 1 od 2</div>
          </div>
        </div>
        <div style={{background:'white',borderRadius:16,padding:'24px',border:'1px solid #e8e4df',marginBottom:12}}>
          {[
            {id:'ime',label:'Ime in priimek',placeholder:'Jana Novak',val:ime,set:setIme,type:'text'},
            {id:'email',label:'E-pošta',placeholder:'jana@podjetje.si',val:email,set:setEmail,type:'email'},
            {id:'podjetje',label:'Podjetje (neobvezno)',placeholder:'Podjetje d.o.o.',val:podjetje,set:setPodjetje,type:'text'},
            {id:'delovno_mesto',label:'Delovno mesto (neobvezno)',placeholder:'npr. Prodajalec, Manager, Coach...',val:delovnoMesto,set:setDelovnoMesto,type:'text'},
          ].map(f=>(
            <div key={f.id} style={{marginBottom:16}}>
              <label style={{display:'block',fontSize:10,fontWeight:700,color:'#999',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:6}}>{f.label}</label>
              <input type={f.type} value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder} style={{width:'100%',padding:'11px 14px',border:'1.5px solid #e5e0d8',borderRadius:10,fontSize:14,fontFamily:'inherit',boxSizing:'border-box',background:'#fafaf8',color:'#1a1a1a'}}/>
            </div>
          ))}
          <div>
            <label style={{display:'block',fontSize:10,fontWeight:700,color:'#999',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:6}}>Spol</label>
            <div style={{display:'flex',gap:8}}>
              {[{v:'m',l:'Moški'},{v:'z',l:'Ženski'}].map(({v,l})=>(
                <button key={v} onClick={()=>setSpol(v)} style={{flex:1,padding:'11px',border:'1.5px solid '+(spol===v?'#1a1a1a':'#e5e0d8'),borderRadius:10,fontSize:14,fontFamily:'inherit',background:spol===v?'#1a1a1a':'white',color:spol===v?'white':'#666',cursor:'pointer',fontWeight:spol===v?600:400}}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        {/* GDPR privolitev */}
        <div style={{marginBottom:12,padding:'14px 16px',background:'#f9f7f4',borderRadius:12,border:'1px solid #e8e4df'}}>
          <label style={{display:'flex',alignItems:'flex-start',gap:10,cursor:'pointer'}}>
            <input
              type="checkbox"
              checked={gdprSoglasje}
              onChange={e=>setGdprSoglasje(e.target.checked)}
              style={{marginTop:3,width:16,height:16,accentColor:'#1a1a1a',flexShrink:0,cursor:'pointer'}}
            />
            <span style={{fontSize:12,color:'#4a4a4a',lineHeight:1.7}}>
              Strinjam se z{' '}
              <button
                onClick={()=>setStep('zasebnost')}
                style={{background:'none',border:'none',padding:0,fontSize:12,color:'#1a1a1a',textDecoration:'underline',cursor:'pointer',fontFamily:'inherit',fontWeight:600}}
              >
                Politiko zasebnosti
              </button>
              . Moje podatke bo obdeloval izvajalec Barvnega kompasa izključno za pripravo osebnostnega profila. Podatki se hranijo največ 2 leti in ne delijo s tretjimi osebami.
            </span>
          </label>
        </div>

        {error&&<div style={{color:'#c94030',fontSize:13,marginBottom:10,textAlign:'center',padding:'8px',background:'#faeaea',borderRadius:8}}>{error}</div>}

        <button className="btn-primary" onClick={()=>{
          if(!ime.trim()) return setError('Vnesite ime in priimek')
          if(!email.trim()||!email.includes('@')) return setError('Vnesite veljaven e-naslov')
          if(!gdprSoglasje) return setError('Strinjati se morate s politiko zasebnosti')
          setError(''); setStep('questionnaire')
        }} style={{width:'100%',padding:'14px',background:gdprSoglasje?'#1a1a1a':'#ccc',color:'white',border:'none',borderRadius:12,fontSize:15,fontWeight:600,cursor:gdprSoglasje?'pointer':'default',fontFamily:'inherit'}}>Nadaljuj →</button>
      </div>
    </div>
  )

  // ── POLITIKA ZASEBNOSTI ────────────────────────────────────────────────────
  if(step==='zasebnost') return (
    <div style={{fontFamily:'system-ui,sans-serif',minHeight:'100vh',background:'#fafaf8',padding:'24px'}}>
      <style>{CSS}</style>
      <div style={{maxWidth:600,margin:'0 auto'}}>
        <button onClick={()=>setStep('form')} style={{background:'none',border:'none',fontSize:13,color:'#aaa',cursor:'pointer',padding:'0 0 20px',display:'flex',alignItems:'center',gap:5,fontFamily:'inherit'}}>← Nazaj na vprašalnik</button>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
          <ColorWheel size={36}/>
          <div>
            <div style={{fontFamily:'Georgia,serif',fontSize:18,fontWeight:700,color:'#1a1a1a'}}>Politika zasebnosti</div>
            <div style={{fontSize:11,color:'#aaa'}}>Barvni kompas · Osebnostni profil</div>
          </div>
        </div>
        <div style={{background:'white',borderRadius:16,padding:'28px',border:'1px solid #e8e4df',lineHeight:1.8}}>
          {[
            {title:'1. Kdo obdeluje vaše podatke',text:'Vaše podatke obdeluje izvajalec storitve Barvni kompas. Storitev je namenjena pripravi individualnega osebnostnega profila na podlagi vaših odgovorov.'},
            {title:'2. Katere podatke zbiramo',text:'Zbiramo naslednje podatke: ime in priimek, e-poštni naslov, ime podjetja (neobvezno), delovno mesto (neobvezno), spol ter odgovore na vprašalnik. Ne zbiramo občutljivih osebnih podatkov (zdravstveni, finančni, biometrični ipd.).'},
            {title:'3. Namen obdelave',text:'Vaši podatki se uporabljajo izključno za pripravo in dostavo vašega osebnostnega profila Barvni kompas. Podatkov ne prodajamo, ne posredujemo oglaševalcem in ne delimo s tretjimi osebami brez vaše izrecne privolitve.'},
            {title:'4. Pravna podlaga',text:'Obdelava temelji na vaši prostovoljni privolitvi (člen 6(1)(a) GDPR), ki jo podate s potrditvijo polja ob prijavi. Privolitev lahko kadarkoli prekličete z zahtevo na e-naslov izvajalca.'},
            {title:'5. Hramba podatkov',text:'Vaše podatke hranimo največ 2 leti od oddaje vprašalnika oziroma do preklica vaše privolitve. Po poteku tega roka se podatki trajno izbrišejo.'},
            {title:'6. Vaše pravice',text:'Skladno z GDPR imate pravico do dostopa, popravka, izbrisa (pozaba), omejitve obdelave in prenosljivosti vaših podatkov. Za uveljavljanje pravic ali preklic privolitve pišite izvajalcu.'},
            {title:'7. Varnost podatkov',text:'Vaši podatki so shranjeni lokalno pri izvajalcu in niso javno dostopni. Odgovori vprašalnika se pošiljajo izključno prek varne HTTPS povezave.'},
            {title:'8. Piškotki',text:'Ta spletna stran ne uporablja piškotkov za sledenje ali profiliranje.'},
          ].map((s,i)=>(
            <div key={i} style={{marginBottom:22}}>
              <div style={{fontSize:13,fontWeight:700,color:'#1a1a1a',marginBottom:5}}>{s.title}</div>
              <div style={{fontSize:13,color:'#4a4a4a'}}>{s.text}</div>
            </div>
          ))}
          <div style={{marginTop:24,padding:'14px',background:'#f9f7f4',borderRadius:10,fontSize:12,color:'#888'}}>
            Datum zadnje posodobitve: April 2026 · Za vprašanja o zasebnosti pišite izvajalcu storitve.
          </div>
        </div>
        <div style={{marginTop:20,textAlign:'center'}}>
          <button onClick={()=>setStep('form')} style={{padding:'12px 28px',background:'#1a1a1a',color:'white',border:'none',borderRadius:12,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>← Nazaj na vprašalnik</button>
        </div>
      </div>
    </div>
  )

  // ── VPRAŠALNIK ─────────────────────────────────────────────────────────────
  if(step==='questionnaire') {
    const q=QUESTIONS[current], a=answers[current], order=orders[current]
    const vstat=validate(a)
    const allDone=answers.every(ans=>validate(ans)==='ok')
    const done=answers.filter(ans=>validate(ans)==='ok').length
    const pct=Math.round(done/QUESTIONS.length*100)
    return (
      <div style={{fontFamily:'system-ui,sans-serif',minHeight:'100vh',background:'#fafaf8',padding:'16px 16px 56px'}}>
        <style>{CSS}</style>
        <div style={{maxWidth:560,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <ColorWheel size={28}/>
              <span style={{fontFamily:'Georgia,serif',fontSize:13,fontWeight:700,color:'#1a1a1a'}}>Barvni kompas</span>
            </div>
            <div style={{fontSize:12,color:'#888',fontWeight:600,background:'white',border:'1px solid #e8e4df',padding:'4px 10px',borderRadius:20}}>{current+1} / {QUESTIONS.length}</div>
          </div>
          <div style={{marginBottom:18}}>
            <div style={{height:4,background:'#e5e0d8',borderRadius:4,overflow:'hidden',marginBottom:5}}>
              <div style={{height:'100%',background:'#1a1a1a',width:pct+'%',borderRadius:4,transition:'width .4s ease'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#bbb'}}>
              <span>{pct}% dokončano</span>
              <span>{done} / {QUESTIONS.length} odgovorjenih</span>
            </div>
          </div>
          <div style={{background:'white',borderRadius:16,padding:'18px',marginBottom:12,border:'1px solid #e8e4df',boxShadow:'0 2px 16px rgba(0,0,0,.04)'}}>
            <div style={{fontSize:10,fontWeight:700,color:'#aaa',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:12}}>Sklop {current+1} od {QUESTIONS.length}</div>
            <div style={{fontSize:11,color:'#888',lineHeight:1.65,marginBottom:14,padding:'9px 12px',background:'#f9f7f4',borderRadius:8}}>
              Razvrstite trditve od <strong style={{color:'#1a1a1a'}}>L</strong> (najmanj podoben) do <strong style={{color:'#1a1a1a'}}>M</strong> (najbolj podoben). Vsako vrednost <strong style={{color:'#1a1a1a'}}>samo enkrat</strong>.
            </div>
            {order.map(k=>(
              <div key={k} style={{marginBottom:10,padding:'12px 13px',background:'#f9f7f4',borderRadius:12,border:'1.5px solid '+(a[k]?'#1a1a1a':'transparent'),transition:'border-color .15s'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:9}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:a[k]?'#1a1a1a':'#d8d3cc',flexShrink:0,transition:'background .15s'}}/>
                  <div style={{fontSize:13,color:'#1a1a1a',fontWeight:a[k]?600:400,lineHeight:1.4,flex:1}}>{q[k]}</div>
                  {a[k]&&<div style={{fontSize:9,fontWeight:800,color:'#1a1a1a',background:'#e5e0d8',padding:'2px 8px',borderRadius:20,flexShrink:0}}>{a[k]==='L'?'NAJMANJ':a[k]==='M'?'NAJBOLJ':a[k]}</div>}
                </div>
                <div style={{display:'flex',gap:4}}>
                  {vals.map(v=>{
                    const isSel=a[k]===v, isUsed=!isSel&&Object.values(a).includes(v)
                    return <button key={v} onClick={()=>setVal(current,k,v)} style={{flex:1,height:33,borderRadius:7,border:'none',background:isSel?'#1a1a1a':isUsed?'#ede9e3':'#e5e0d8',color:isSel?'white':isUsed?'#ccc':'#666',fontWeight:700,fontSize:11,cursor:isUsed?'default':'pointer',fontFamily:'inherit',boxShadow:isSel?'0 2px 8px rgba(0,0,0,0.2)':'none',transition:'all .1s',opacity:isUsed?0.45:1}}>{v}</button>
                  })}
                </div>
              </div>
            ))}
            {vstat!=='ok'&&vstat!=='incomplete'&&<div style={{fontSize:12,color:'#c94030',marginTop:8,padding:'7px 12px',background:'#faeaea',borderRadius:8}}>⚠ {vstat}</div>}
          </div>
          <div style={{display:'flex',gap:10,marginBottom:14}}>
            <button onClick={()=>setCurrent(c=>Math.max(0,c-1))} disabled={current===0} style={{padding:'12px 18px',background:'white',border:'1.5px solid #e5e0d8',borderRadius:12,fontSize:13,color:current===0?'#ccc':'#555',cursor:current===0?'default':'pointer',fontFamily:'inherit',fontWeight:500}}>← Nazaj</button>
            <div style={{flex:1}}/>
            {current<QUESTIONS.length-1
              ? <button className="btn-primary" onClick={()=>vstat==='ok'&&setCurrent(c=>c+1)} disabled={vstat!=='ok'} style={{padding:'12px 24px',background:vstat==='ok'?'#1a1a1a':'#ddd',color:vstat==='ok'?'white':'#aaa',border:'none',borderRadius:12,fontSize:13,fontWeight:600,cursor:vstat==='ok'?'pointer':'default',fontFamily:'inherit'}}>Naprej →</button>
              : <button className="btn-primary" onClick={()=>allDone&&setStep('sn')} disabled={!allDone} style={{padding:'12px 24px',background:allDone?'#1a1a1a':'#ddd',color:allDone?'white':'#aaa',border:'none',borderRadius:12,fontSize:13,fontWeight:600,cursor:allDone?'pointer':'default',fontFamily:'inherit'}}>Nadaljuj →</button>
            }
          </div>
          <div style={{display:'flex',justifyContent:'center',gap:5,flexWrap:'wrap'}}>
            {QUESTIONS.map((_,i)=>{
              const s=validate(answers[i])
              return <button key={i} onClick={()=>setCurrent(i)} style={{width:i===current?22:8,height:8,borderRadius:4,border:'none',cursor:'pointer',background:s==='ok'?'#2e8a55':i===current?'#1a1a1a':'#e5e0d8',transition:'all .2s ease',padding:0}}/>
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── S/N VPRAŠANJA ──────────────────────────────────────────────────────────
  if(step==='sn') {
    const allSnDone = snAnswers.every(v=>validateSN(v)==='ok')
    return (
      <div style={{fontFamily:'system-ui,sans-serif',minHeight:'100vh',background:'#fafaf8',padding:'16px 16px 56px'}}>
        <style>{CSS}</style>
        <div style={{maxWidth:560,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <ColorWheel size={28}/>
              <span style={{fontFamily:'Georgia,serif',fontSize:13,fontWeight:700,color:'#1a1a1a'}}>Barvni kompas</span>
            </div>
            <div style={{fontSize:12,color:'#888',fontWeight:600,background:'white',border:'1px solid #e8e4df',padding:'4px 10px',borderRadius:20}}>2. del · 4 vprašanja</div>
          </div>
          <div style={{marginBottom:18}}>
            <div style={{height:4,background:'#e5e0d8',borderRadius:4,overflow:'hidden',marginBottom:5}}>
              <div style={{height:'100%',background:'#1a1a1a',width:'100%',borderRadius:4}}/>
            </div>
            <div style={{fontSize:10,color:'#bbb'}}>Barvna vprašanja končana · Zadnji del</div>
          </div>
          <div style={{background:'white',borderRadius:16,padding:'18px',marginBottom:12,border:'1px solid #e8e4df',boxShadow:'0 2px 16px rgba(0,0,0,.04)'}}>
            <div style={{fontSize:10,fontWeight:700,color:'#aaa',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:12}}>Stil razmišljanja</div>
            <div style={{fontSize:11,color:'#888',lineHeight:1.65,marginBottom:14,padding:'9px 12px',background:'#f9f7f4',borderRadius:8}}>
              Za vsak par trditev označite kje se nahajate. Izberite vrednost ki vam je najbližje.
            </div>
            {SN_QUESTIONS.map((q,qi)=>{
              const val = snAnswers[qi]
              return (
                <div key={qi} style={{marginBottom:12,padding:'14px',background:'#f9f7f4',borderRadius:12,border:'1.5px solid '+(validateSN(val)==='ok'?'#1a1a1a':'transparent'),transition:'border-color .15s'}}>
                  <div style={{fontSize:10,fontWeight:700,color:'#aaa',marginBottom:12}}>Vprašanje {qi+1}</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:10,alignItems:'center',marginBottom:12}}>
                    <div style={{fontSize:11,color:'#1a1a1a',lineHeight:1.5,fontWeight:val!==null&&parseInt(val)<0?700:400,textAlign:'right'}}>{q.S}</div>
                    <div style={{width:1,height:36,background:'#e5e0d8',flexShrink:0}}/>
                    <div style={{fontSize:11,color:'#1a1a1a',lineHeight:1.5,fontWeight:val!==null&&parseInt(val)>0?700:400}}>{q.N}</div>
                  </div>
                  <div style={{display:'flex',gap:3}}>
                    {SN_VALS.map(v=>{
                      const isSel=val===v, num=parseInt(v)
                      return <button key={v} onClick={()=>setSnVal(qi,v)} style={{flex:1,height:34,borderRadius:7,border:'none',background:isSel?(num<0?'#4a7ab5':num>0?'#c49a10':'#555'):'#e5e0d8',color:isSel?'white':'#666',fontWeight:700,fontSize:11,cursor:'pointer',fontFamily:'inherit',boxShadow:isSel?'0 2px 8px rgba(0,0,0,0.25)':'none',transition:'all .1s'}}>{v}</button>
                    })}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{display:'flex',gap:10,marginBottom:14}}>
            <button onClick={()=>setStep('questionnaire')} style={{padding:'12px 18px',background:'white',border:'1.5px solid #e5e0d8',borderRadius:12,fontSize:13,color:'#555',cursor:'pointer',fontFamily:'inherit',fontWeight:500}}>← Nazaj</button>
            <div style={{flex:1}}/>
            <button className="btn-primary" onClick={handleSubmit} disabled={!allSnDone||submitting} style={{padding:'12px 24px',background:allSnDone&&!submitting?'#2e8a55':'#ddd',color:allSnDone&&!submitting?'white':'#aaa',border:'none',borderRadius:12,fontSize:13,fontWeight:600,cursor:allSnDone&&!submitting?'pointer':'default',fontFamily:'inherit'}}>{submitting?'Pošiljam...':'✓ Oddaj vprašalnik'}</button>
          </div>
          <div style={{display:'flex',justifyContent:'center',gap:5}}>
            {SN_QUESTIONS.map((_,i)=>(
              <div key={i} style={{width:8,height:8,borderRadius:'50%',background:validateSN(snAnswers[i])==='ok'?'#2e8a55':'#e5e0d8',transition:'background .2s'}}/>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── ZAKLJUČEK ──────────────────────────────────────────────────────────────
  const scores=calcScores(answers)
  const sorted=['B','R','G','Y'].map(k=>({k,v:scores[k]})).sort((a,b)=>b.v-a.v)
  const lead=sorted[0]
  const snResult=calcSN(snAnswers)

  return (
    <div style={{fontFamily:'system-ui,sans-serif',minHeight:'100vh',background:'#fafaf8',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <style>{CSS}</style>
      <div style={{maxWidth:440,width:'100%',textAlign:'center'}}>
        <div className="fu" style={{width:76,height:76,borderRadius:'50%',background:CLR_L[lead.k],border:'3px solid '+CLR[lead.k],display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',fontSize:30}}>✓</div>
        <div className="fu2">
          <h1 style={{fontFamily:'Georgia,serif',fontSize:30,fontWeight:700,color:'#1a1a1a',marginBottom:10,letterSpacing:'-0.02em'}}>Hvala, {ime.trim().split(' ')[0]}!</h1>
          <p style={{fontSize:14,color:'#6b6460',lineHeight:1.8,marginBottom:28}}>Vaš vprašalnik je bil uspešno oddan. Vaš osebnostni profil bomo pripravili in vam ga posredovali na <strong style={{color:'#1a1a1a'}}>{email}</strong>.</p>
        </div>
        <div className="fu3" style={{background:'white',borderRadius:16,padding:'20px 24px',border:'1px solid #e8e4df',marginBottom:20}}>
          <div style={{fontSize:10,fontWeight:700,color:'#aaa',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:16}}>Vaš prevladujoč profil</div>
          <div style={{display:'flex',justifyContent:'center',gap:10,marginBottom:14}}>
            {sorted.map(({k,v})=>(
              <div key={k} style={{textAlign:'center'}}>
                <div style={{width:46,height:46,borderRadius:'50%',background:CLR_L[k],border:'2.5px solid '+CLR[k],display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 6px'}}>
                  <span style={{fontSize:13,fontWeight:800,color:CLR[k]}}>{v.toFixed(1)}</span>
                </div>
                <div style={{fontSize:9,color:CLR[k],fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{k}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:12,color:'#888',lineHeight:1.75}}>
            Vaša primarna energija je <strong style={{color:CLR[lead.k]}}>{CLR_NAME[lead.k]}</strong>.<br/>
            Percepcijski stil: <strong style={{color:'#1a1a1a'}}>{snResult.label} ({snResult.snScore>0?'+':''}{snResult.snScore})</strong>.<br/>
            Kmalu prejmete podroben osebnostni profil.
          </div>
        </div>
        <div style={{fontSize:11,color:'#ccc',lineHeight:1.7}}>Barvni kompas · Osebnostni profil</div>
      </div>
    </div>
  )
}
