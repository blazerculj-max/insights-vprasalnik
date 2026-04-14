import { useState } from 'react'

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyazEHualU85m65udD4dD5hbWYPgGfDcK6W4rL82ccGobRA5RV9H5xyNsqR4uBsXu-KpQ/exec'

const SMAP = {L:0,'1':1,'2':2,'3':3,'4':4,'5':5,M:6}
const N = 15

const QUESTIONS = [
  {B:'Sem natančen in metodičen',R:'Sem odločen in usmerjen v rezultate',G:'Sem empatičen in skrbim za odnose',Y:'Sem entuziastičen in optimističen'},
  {B:'Raje analiziram preden ukrepam',R:'Hitro ukrepam in sprejemam odločitve',G:'Poslušam in razumem druge',Y:'Iščem nove ideje in možnosti'},
  {B:'Cenim kakovost in natančnost',R:'Cenim učinkovitost in hitrost',G:'Cenim harmonijo in sodelovanje',Y:'Cenim ustvarjalnost in inovacije'},
  {B:'V konfliktih ostanem miren in analitičen',R:'V konfliktih sem direkten in odločen',G:'V konfliktih iščem kompromis',Y:'V konfliktih poskušam razbremeniti napetost'},
  {B:'Načrtujem skrbno vnaprej',R:'Osredotočam se na cilje',G:'Gradim zaupanje postopoma',Y:'Sledim navdihu in spontanosti'},
  {B:'Prednost dajem faktom in podatkom',R:'Prednost dajem rezultatom',G:'Prednost dajem ljudem',Y:'Prednost dajem viziji'},
  {B:'Sem sistematičen in organiziran',R:'Sem ambiciozen in pogumen',G:'Sem zvest in zanesljiv',Y:'Sem komunikativen in navdušujoč'},
  {B:'Raje delam samostojno in poglobljeno',R:'Raje vodim in usmerjam',G:'Raje sodelujem in podpiram',Y:'Raje navdušujem in motiviram'},
  {B:'Cenim strukturo in red',R:'Cenim nadzor in moč',G:'Cenim mir in stabilnost',Y:'Cenim zabavo in raznolikost'},
  {B:'Pod pritiskom postanem previdnejši',R:'Pod pritiskom sem bolj direkten',G:'Pod pritiskom se umaknem',Y:'Pod pritiskom dramatiziram'},
  {B:'Odločitve sprejemam na podlagi analize',R:'Odločitve sprejemam hitro in intuitivno',G:'Odločitve sprejemam po posvetovanju',Y:'Odločitve sprejemam na podlagi navdušenja'},
  {B:'Moja moč je v natančnosti',R:'Moja moč je v odločnosti',G:'Moja moč je v empatiji',Y:'Moja moč je v navduševanju'},
  {B:'Cenim mir in tišino pri delu',R:'Cenim izzive in tekmovalnost',G:'Cenim toplino in sprejetost',Y:'Cenim dinamično okolje'},
  {B:'Sem introvertirane narave',R:'Sem ekstrovertirane narave z močno voljo',G:'Sem introvertirane narave s toplim srcem',Y:'Sem ekstrovertirane narave s pozitivno energijo'},
  {B:'Iščem globino in razumevanje',R:'Iščem rezultate in dosežke',G:'Iščem harmonijo in smisel',Y:'Iščem navdih in možnosti'},
]

const COLORS = ['B','R','G','Y']

function shuffle(arr, seed) {
  const a = [...arr]
  let s = seed
  for(let i=a.length-1;i>0;i--){
    s = (s*1664525+1013904223)&0xffffffff
    const j=Math.abs(s)%(i+1)
    ;[a[i],a[j]]=[a[j],a[i]]
  }
  return a
}

function validate(ans) {
  const v = Object.values(ans).filter(x=>x!==null)
  if(v.length<4) return 'incomplete'
  const lc=v.filter(x=>x==='L').length, mc=v.filter(x=>x==='M').length
  if(lc!==1) return lc+'x L'
  if(mc!==1) return mc+'x M'
  if(new Set(v).size!==4) return 'Vrednosti niso razlicne'
  return 'ok'
}

function calcScores(answers) {
  const raw={B:0,R:0,G:0,Y:0}
  answers.forEach(a=>['B','R','G','Y'].forEach(k=>{raw[k]+=SMAP[a[k]]||0}))
  const con={}
  ;['B','R','G','Y'].forEach(k=>{con[k]=parseFloat((raw[k]/N).toFixed(2))})
  return con
}

export default function App() {
  const [step, setStep] = useState('form')
  const [ime, setIme] = useState('')
  const [email, setEmail] = useState('')
  const [podjetje, setPodjetje] = useState('')
  const [spol, setSpol] = useState('m')
  const [answers, setAnswers] = useState(Array(15).fill(null).map(()=>({B:null,R:null,G:null,Y:null})))
  const [current, setCurrent] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const orders = QUESTIONS.map((_,i) => shuffle(COLORS, i*999+42))

  function setVal(qi, color, val) {
    setAnswers(prev => {
      const next = prev.map(a=>({...a}))
      Object.keys(next[qi]).forEach(k => {
        if(next[qi][k]===val) next[qi][k]=null
      })
      next[qi][color] = val
      return next
    })
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    try {
      const scores = calcScores(answers)
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          ime, email, podjetje, spol,
          B: scores.B, G: scores.G, Y: scores.Y, R: scores.R,
        })
      })
      setStep('done')
    } catch(e) {
      setError('Napaka pri posiljanju. Preverite internetno povezavo.')
    }
    setSubmitting(false)
  }

  if(step==='done') return (
    <div style={{fontFamily:'system-ui,sans-serif',minHeight:'100vh',background:'#f7f5f1',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'white',borderRadius:20,padding:'48px 52px',maxWidth:480,textAlign:'center',boxShadow:'0 8px 40px rgba(0,0,0,.08)'}}>
        <div style={{width:64,height:64,borderRadius:'50%',background:'#e6f5ee',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:28}}>✓</div>
        <div style={{fontFamily:'Georgia,serif',fontSize:24,fontWeight:600,marginBottom:12}}>Hvala, {ime.trim().split(' ')[0]}!</div>
        <div style={{fontSize:15,color:'#6b6460',lineHeight:1.7,marginBottom:20}}>Vas vprasalnik je bil uspesno oddan. Vas osebnostni profil bomo pripravili in vam ga poslali na <strong>{email}</strong> v kratkem.</div>
        <div style={{fontSize:12,color:'#aaa'}}>Insights Discovery · Osebnostni profil</div>
      </div>
    </div>
  )

  if(step==='form') return (
    <div style={{fontFamily:'system-ui,sans-serif',minHeight:'100vh',background:'#f7f5f1',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{background:'white',borderRadius:20,padding:'40px 44px',maxWidth:460,width:'100%',boxShadow:'0 8px 40px rgba(0,0,0,.08)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
          <div style={{width:40,height:40,borderRadius:'50%',background:'conic-gradient(#4a7ab5 0deg 90deg,#c94030 90deg 180deg,#c49a10 180deg 270deg,#2e8a55 270deg 360deg)',flexShrink:0}}/>
          <div>
            <div style={{fontFamily:'Georgia,serif',fontSize:18,fontWeight:600}}>Insights Discovery</div>
            <div style={{fontSize:12,color:'#888'}}>Osebnostni vprasalnik</div>
          </div>
        </div>
        <div style={{fontSize:13,color:'#6b6460',lineHeight:1.7,marginBottom:24}}>Izpolnite vprasalnik in prejmite osebnostni profil, ki vam bo pomagal bolje razumeti vas stil dela, komunikacije in prodaje.</div>
        {[
          {id:'ime',label:'Ime in priimek',placeholder:'Jana Novak',val:ime,set:setIme},
          {id:'email',label:'E-posta',placeholder:'jana@podjetje.si',val:email,set:setEmail},
          {id:'podjetje',label:'Podjetje (neobvezno)',placeholder:'Podjetje d.o.o.',val:podjetje,set:setPodjetje},
        ].map(f=>(
          <div key={f.id} style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:5}}>{f.label}</div>
            <input type={f.id==='email'?'email':'text'} value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder}
              style={{width:'100%',padding:'10px 14px',border:'1.5px solid #e5e0d8',borderRadius:10,fontSize:14,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
          </div>
        ))}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:5}}>Spol</div>
          <div style={{display:'flex',gap:8}}>
            {[{v:'m',l:'Moski'},{v:'z',l:'Zenski'}].map(({v,l})=>(
              <button key={v} onClick={()=>setSpol(v)}
                style={{flex:1,padding:'10px',border:'1.5px solid '+(spol===v?'#181818':'#e5e0d8'),borderRadius:10,fontSize:14,fontFamily:'inherit',background:spol===v?'#181818':'white',color:spol===v?'white':'#444',cursor:'pointer',fontWeight:spol===v?600:400}}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <button onClick={()=>{
          if(!ime.trim()) return setError('Vnesite ime in priimek')
          if(!email.trim()||!email.includes('@')) return setError('Vnesite veljaven e-mail')
          setError(''); setStep('questionnaire')
        }} style={{width:'100%',padding:'13px',background:'#181818',color:'white',border:'none',borderRadius:12,fontSize:15,fontWeight:500,cursor:'pointer',fontFamily:'inherit'}}>
          Zacni vprasalnik →
        </button>
        {error&&<div style={{color:'#c94030',fontSize:13,marginTop:10,textAlign:'center'}}>{error}</div>}
        <div style={{marginTop:20,fontSize:11,color:'#bbb',textAlign:'center',lineHeight:1.6}}>Vprasalnik traja priblizno 5-8 minut.<br/>Vasi podatki so zasciteni in se ne delijo s tretjimi osebami.</div>
      </div>
    </div>
  )

  const q = QUESTIONS[current]
  const a = answers[current]
  const order = orders[current]
  const vals = ['L','1','2','3','4','5','M']
  const vstat = validate(a)
  const allDone = answers.every(ans=>validate(ans)==='ok')

  return (
    <div style={{fontFamily:'system-ui,sans-serif',minHeight:'100vh',background:'#f7f5f1',padding:'20px 20px 40px'}}>
      <div style={{maxWidth:580,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:30,height:30,borderRadius:'50%',background:'conic-gradient(#4a7ab5 0deg 90deg,#c94030 90deg 180deg,#c49a10 180deg 270deg,#2e8a55 270deg 360deg)'}}/>
            <span style={{fontFamily:'Georgia,serif',fontSize:14,fontWeight:600}}>Insights Discovery</span>
          </div>
          <div style={{fontSize:12,color:'#888',fontWeight:500}}>{current+1} / {QUESTIONS.length}</div>
        </div>
        <div style={{height:3,background:'#e5e0d8',borderRadius:2,marginBottom:20,overflow:'hidden'}}>
          <div style={{height:'100%',background:'#181818',width:((current+1)/QUESTIONS.length*100)+'%',borderRadius:2,transition:'width .3s ease'}}/>
        </div>
        <div style={{background:'white',borderRadius:16,padding:'20px',marginBottom:12,boxShadow:'0 2px 12px rgba(0,0,0,.06)'}}>
          <div style={{fontSize:10,fontWeight:700,color:'#aaa',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:4}}>Sklop {current+1} od {QUESTIONS.length}</div>
          <div style={{fontSize:12,color:'#888',marginBottom:16,lineHeight:1.5}}>Ocenite vsako trditev od <strong>L</strong> (najmanj podoben) do <strong>M</strong> (najbolj podoben). Vsaka vrednost samo enkrat.</div>
          {order.map(k => (
            <div key={k} style={{marginBottom:10,padding:'11px 13px',background:'#f9f7f4',borderRadius:10}}>
              <div style={{fontSize:13,color:'#222',marginBottom:8,fontWeight:a[k]?600:400,lineHeight:1.4}}>{q[k]}</div>
              <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                {vals.map(v => (
                  <button key={v} onClick={()=>setVal(current,k,v)}
                    style={{width:34,height:34,borderRadius:7,border:'none',background:a[k]===v?'#181818':'#e5e0d8',color:a[k]===v?'white':'#666',fontWeight:700,fontSize:11,cursor:'pointer',fontFamily:'inherit',opacity:a[k]&&a[k]!==v&&Object.values(a).includes(v)?0.3:1,transition:'all .1s'}}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {vstat!=='ok'&&vstat!=='incomplete'&&(
            <div style={{fontSize:12,color:'#c94030',marginTop:8,padding:'6px 10px',background:'#faeaea',borderRadius:6}}>⚠ {vstat}</div>
          )}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <button onClick={()=>setCurrent(c=>Math.max(0,c-1))} disabled={current===0}
            style={{padding:'10px 20px',background:'white',border:'1.5px solid #e5e0d8',borderRadius:10,fontSize:13,color:'#666',cursor:current===0?'not-allowed':'pointer',fontFamily:'inherit',opacity:current===0?.4:1}}>
            ← Nazaj
          </button>
          {current<QUESTIONS.length-1?(
            <button onClick={()=>vstat==='ok'&&setCurrent(c=>c+1)} disabled={vstat!=='ok'}
              style={{padding:'10px 24px',background:vstat==='ok'?'#181818':'#ccc',color:'white',border:'none',borderRadius:10,fontSize:13,fontWeight:600,cursor:vstat==='ok'?'pointer':'not-allowed',fontFamily:'inherit'}}>
              Naprej →
            </button>
          ):(
            <button onClick={handleSubmit} disabled={!allDone||submitting}
              style={{padding:'10px 28px',background:allDone&&!submitting?'#2e8a55':'#ccc',color:'white',border:'none',borderRadius:10,fontSize:13,fontWeight:600,cursor:allDone&&!submitting?'pointer':'not-allowed',fontFamily:'inherit'}}>
              {submitting?'Posiljam...':'✓ Oddaj vprasalnik'}
            </button>
          )}
        </div>
        <div style={{display:'flex',justifyContent:'center',gap:4,flexWrap:'wrap'}}>
          {QUESTIONS.map((_,i)=>{
            const s=validate(answers[i])
            return <div key={i} onClick={()=>setCurrent(i)} style={{width:8,height:8,borderRadius:'50%',cursor:'pointer',transition:'all .2s',background:s==='ok'?'#2e8a55':i===current?'#181818':'#e5e0d8'}}/>
          })}
        </div>
      </div>
    </div>
  )
}
