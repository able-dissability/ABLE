// Settings, password reset, account deletion, and web push helpers.
let RECOVER=false,AB=false;
const urlB64=b=>{const s=(b+"=".repeat((4-b.length%4)%4)).replace(/-/g,"+").replace(/_/g,"/"),r=atob(s);return Uint8Array.from([...r].map(c=>c.charCodeAt(0)))};
const pushOK=()=>sb&&"serviceWorker" in navigator&&"PushManager" in window&&"Notification" in window&&typeof VAPID_PUBLIC!=="undefined"&&!VAPID_PUBLIC.startsWith("YOUR");
const savePrefs=()=>sb&&S.me&&W(sb.from("profiles").update({prefs:S.prefs}).eq("id",S.me.id));
async function enablePush(){if(!pushOK()||!S.me){toast(t("push_na"));return render()}
 if(await Notification.requestPermission()!=="granted"){toast(t("push_denied"));return render()}
 try{const reg=await navigator.serviceWorker.register("sw.js");await navigator.serviceWorker.ready;
  const sub=(await reg.pushManager.getSubscription())||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlB64(VAPID_PUBLIC)});
  const j=sub.toJSON(),x=await sb.from("push_subscriptions").upsert({user_id:S.me.id,endpoint:j.endpoint,sub:j},{onConflict:"endpoint"});
  if(x.error)throw x.error;S.prefs.push=true;savePrefs();toast(t("push_on"))}catch(err){toast(String(err.message||err))}render()}
async function disablePush(){try{const reg=await navigator.serviceWorker.getRegistration();const sub=reg&&await reg.pushManager.getSubscription();if(sub){await sb.from("push_subscriptions").delete().eq("endpoint",sub.endpoint);await sub.unsubscribe()}}catch(e){}
 S.prefs.push=false;savePrefs();toast(t("push_off"));render()}
function settingsPage(){const p=S.prefs||{email:true,push:false},row=(a,on,l)=>`<label style="font-weight:400;display:flex;gap:.6rem;align-items:center"><input type="checkbox" style="width:auto" data-a="${a}" ${on?"checked":""}> ${t(l)}</label>`;
return `<section class="sec"><div class="w" style="max-width:700px"><h1>${t("settings")}</h1>
<div class="card"><h2>${t("set_notif")}</h2>${sb?row("emailtog",p.email!==false,"set_email"):""}${pushOK()?row("pushtog",!!p.push,"set_push")+`<p class="mut">${t("push_ios")}</p>`:`<p class="mut">${t("push_na")}</p>`}</div>
<form class="card" data-f="pw" style="margin-top:1rem"><h2>${t("set_pw")}</h2><div id="errs" role="alert"></div>${fld("password","newpw","password")}<p><button class="btn">${t("save")}</button></p></form>
<div class="card" style="margin-top:1rem"><h2>${t("set_del")}</h2><p class="mut">${t("del_warn")}</p><label for="dc">${t("del_type")}</label><input id="dc" autocomplete="off"><p><button class="btn d" data-a="delacc">${t("set_del")}</button></p></div></div></section>`}
const forgotPage=()=>`<section class="sec"><div class="w" style="max-width:480px"><h1>${t("forgot")}</h1><form class="card" data-f="forgot" novalidate><div id="errs" role="alert"></div>${fld("email","email","email")}<p><button class="btn">${t("send_link")}</button></p></form></div></section>`;
const resetPage=()=>`<section class="sec"><div class="w" style="max-width:480px"><h1>${t("reset_h")}</h1><form class="card" data-f="reset" novalidate><div id="errs" role="alert"></div>${fld("password","newpw","password")}<p><button class="btn">${t("save")}</button></p></form></div></section>`;
if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
