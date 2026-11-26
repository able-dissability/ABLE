// ABLE service worker: shows web push notifications and opens the app when tapped.
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(clients.claim()));
self.addEventListener("push",e=>{let d={};try{d=e.data.json()}catch(x){d={body:e.data?e.data.text():""}}
 e.waitUntil(self.registration.showNotification(d.title||"ABLE",{body:d.body||"",icon:"icon-192.png",badge:"icon-192.png",data:{url:d.url||"./"}}))});
self.addEventListener("notificationclick",e=>{e.notification.close();const u=e.notification.data.url;
 e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(l=>{for(const c of l){if(c.focus){if(c.navigate)c.navigate(u);return c.focus()}}return clients.openWindow(u)}))});
