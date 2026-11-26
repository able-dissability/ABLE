// Supabase data layer: login, database reads/writes, realtime notifications.
const sb=(window.supabase&&typeof SB_URL!=="undefined"&&!SB_URL.startsWith("YOUR"))?supabase.createClient(SB_URL,SB_KEY):null;
console.info("ABLE: Supabase "+(sb?"connected":"NOT connected (demo mode). Check js/config.js"));
const W=p=>p.then(x=>{if(x.error)toast(x.error.message)});
const ALLT=()=>TALENT.concat(S.tal||[]);
let SUBCH=null;
async function sbLoad(u){const {data}=await sb.from("profiles").select("*").eq("id",u.id).single();if(!data)return false;S.me={role:data.role,name:data.name,email:u.email,id:u.id};
 if(data.role==="s"){S.prof=data.data||{};S.asr=S.prof.asr||null;S.streak=S.prof.streak||{n:0,last:""};S.chk=S.prof.chk||[]}else{S.co=data.data||{};if(S.co.emps)S.emps=S.co.emps}
 S.prefs=data.prefs||{email:true,push:false};if(!S.prefs.lang){S.prefs.lang=S.L;savePrefs()}
 await sbData();sbSub();return true}
async function sbData(){const [j,cp,nt]=await Promise.all([sb.from("jobs").select("*").order("id"),sb.from("companies").select("name,logo"),sb.from("notifications").select("*").order("created_at",{ascending:false}).limit(30)]);
 if(j.data&&j.data.length)S.jobs=j.data.map(x=>({id:x.id,t:x.t,c:x.c,loc:x.loc,ty:x.ty,cat:x.cat,sk:x.sk,ac:x.ac,w:x.w,o:x.owner,open:x.is_open?1:0}));
 S.logos=Object.fromEntries((cp.data||[]).filter(x=>x.logo).map(x=>[x.name,x.logo]));
 if(S.me)S.notes=(nt.data||[]).map(x=>({id:x.id,to:S.me.role,x:x.x,d:x.created_at.slice(0,16).replace("T"," "),r:x.r?1:0}));
 if(isS()){const [a,sj,c,v]=await Promise.all([sb.from("applications").select("*"),sb.from("saved_jobs").select("job_id"),sb.from("course_progress").select("*"),sb.from("verified_skills").select("skill")]);
  S.apps=(a.data||[]).map(x=>({id:x.id,j:x.job_id,s:x.status,d:x.created_at.slice(0,10),h:x.h&&x.h.length?x.h:undefined}));S.saved=(sj.data||[]).map(x=>x.job_id);
  S.prog=Object.fromEntries((c.data||[]).map(x=>[x.course_id,x.pct]));S.les=Object.fromEntries((c.data||[]).map(x=>[x.course_id,x.done||[]]));S.ver=(v.data||[]).map(x=>x.skill)}
 if(isS()){const bm=await sb.from("buddy_messages").select("*").order("id");S.chat={};[0,1].forEach(m=>{S.chat[m]=[{f:"b",x:MENT[m].hi},...(bm.data||[]).filter(r=>r.mentor===m).map(r=>({f:r.mine?"me":"b",x:r.x}))]})}
 if(isE()){const [x,tp]=await Promise.all([sb.rpc("employer_candidates"),sb.rpc("talent_pool")]);
  S.cands=(x.data||[]).map(c=>({id:c.id,jid:c.jid,n:c.n,v:c.v,ed:(c.d&&c.d.edu)||"–",ex:(c.d&&c.d.exp)||"–",cv:(c.d&&c.d.cv)||"–",ac:c.d&&c.d.access?P(c.d.access,c.d.access):null,st:c.st,ph:(c.d&&c.d.photo)||""}));S.tal=tp.data||[]}
 sv()}
function sbSub(){if(SUBCH)sb.removeChannel(SUBCH);SUBCH=sb.channel("n-"+S.me.id).on("postgres_changes",{event:"INSERT",schema:"public",table:"notifications",filter:"user_id=eq."+S.me.id},p=>{const x=p.new;S.notes.unshift({id:x.id,to:S.me.role,x:x.x,d:x.created_at.slice(0,16).replace("T"," "),r:0});sv();toast(pl(x.x));render()}).subscribe()}
async function sbSaveProf(){if(!sb||!S.me||!S.me.id)return;await sb.from("profiles").update({name:S.me.name,data:S.me.role==="s"?S.prof:S.co}).eq("id",S.me.id);
 if(S.me.role==="e")await sb.from("companies").upsert({owner:S.me.id,name:S.co.name,logo:S.co.logo||null})}
async function sbSignup(d,s){AB=true;try{const info=s?{name:d.name,phone:d.phone,dis:d.dis,access:d.accr?t(d.accr):"",work:"hybrid",interest:"tech"}:{name:d.name,ind:d.ind,cdesc:d.cdesc,web:d.web,cp:d.cp,acc:""};
 const {data,error}=await sb.auth.signUp({email:d.email,password:d.password,options:{data:{role:regRole,name:d.name,info},emailRedirectTo:location.origin+location.pathname}});
 if(error)return errs([error.message]);
 if(!data.session){$("#errs").innerHTML=`<div class="ok">${t("confirm_sent")}</div>`;return}
 await sbLoad(data.user);if(!s)await sbSaveProf();S.tab[regRole]="home";sv();go(s?"seeker":"employer");toast(t("done"))}finally{AB=false}}
async function sbLogin(d){AB=true;try{const {data,error}=await sb.auth.signInWithPassword({email:d.email,password:d.password});if(error||!await sbLoad(data.user))return errs([t("wrong")]);S.tab[S.me.role]="home";sv();go(S.me.role==="s"?"seeker":"employer")}finally{AB=false}}
if(sb)sb.auth.onAuthStateChange((ev,session)=>{
 if(ev==="PASSWORD_RECOVERY"){RECOVER=true;setTimeout(()=>{location.hash="reset"},0);return}
 if(ev==="SIGNED_IN"&&session&&!AB&&!RECOVER&&!(S.me&&S.me.id===session.user.id)&&["","home","login","signup"].includes(route()))setTimeout(async()=>{if(await sbLoad(session.user)){S.tab[S.me.role]="home";sv();go(S.me.role==="s"?"seeker":"employer")}},0)});
async function sbPost(d,f){const sk=new FormData(f).getAll("rs");if(!sk.length)return toast(t("need_rs"));const row={t:P(d.t,d.t),loc:d.loc,sk,ac:P(d.ac,d.ac),w:d.w,ty:d.ty,cat:d.cat};
 const x=await(S.edit?sb.from("jobs").update(row).eq("id",S.edit):sb.from("jobs").insert({...row,owner:S.me.id,c:S.co.name||"ABLE"}));if(x.error)return toast(x.error.message);S.edit=null;await sbData();render();toast(t("done"))}
