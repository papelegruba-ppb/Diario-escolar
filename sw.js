const C='mi-diario-v4';
const ASSETS=['./','index.html','manifest.json','icon.svg'];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(C)
      .then(c=>Promise.all(ASSETS.map(u=>c.add(u).catch(()=>{}))))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(u.origin!==location.origin) return;

  e.respondWith(
    fetch(r)
      .then(res=>{
        const cp=res.clone();
        caches.open(C).then(c=>c.put(r,cp));
        return res;
      })
      .catch(()=>caches.match(r).then(m=>m||caches.match('index.html')))
  );
});

self.addEventListener('message',e=>{
  if(e.data==='skipWaiting') self.skipWaiting();
});
