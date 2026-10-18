export const storageKey='ads-manager-demo-v1';
export function validateAd(ad){if(ad?.postUrl){const url=new URL(ad.postUrl);if(url.protocol!=='https:'||!['instagram.com','www.instagram.com'].includes(url.hostname))throw new Error('Enter an HTTPS Instagram post URL.');}if(!ad||typeof ad.name!=='string'||!ad.name.trim())throw new Error('Each ad needs a name.');for(const key of ['results','reach','impressions','spent','budget'])if(ad[key]!==null&&ad[key]!==undefined&&(!Number.isFinite(Number(ad[key]))||Number(ad[key])<0))throw new Error('Metrics must be positive numbers or zero.');return {...ad,id:String(ad.id||crypto.randomUUID()),name:ad.name.trim().slice(0,180),status:['Off','Active','Completed','In review','Paused'].includes(ad.status)?ad.status:'Off'};}
export function metrics(ad){return {frequency:ad.reach?ad.impressions/ad.reach:0,cost:ad.results?ad.spent/ad.results:0,cpm:ad.impressions?ad.spent/ad.impressions*1000:0};}
export const datasetVersion='instagram-october-200-v1';
export const datasetVersionKey=storageKey+'-dataset';
export const previousAdsKey=storageKey+'-before-'+datasetVersion;
const groups=[
 {start:'2026-10-02',end:'2026-10-08',status:'Completed',spent:20000,codes:['DddbNSTDauL','DdZ3X5TDXhN','DdXNtVoiMcC','DdUqv2tCKye','DdSJxuOCFq9','DYM3GDzDziP']},
 {start:'2026-10-09',end:'2026-10-15',status:'Completed',spent:20000,codes:['DVbMSPZDysm','DVJKrnJFtbT','DUVqwS6jFnp','DUyA2sjjQqi']},
 {start:'2026-10-16',end:'2026-10-22',status:'Active',spent:8571,codes:['DVbMSPZDysm','DVOUS3QCLxx','DTVWoAqCNA0']}
];
function split(total,count,index){return Math.floor(total/count)+(index<total%count?1:0);}
export function seedAds(){return groups.flatMap((group,groupIndex)=>group.codes.map((code,index)=>({
 id:`october-group-${groupIndex+1}-${code}`,
 name:`Instagram post: ${code} · Oct ${group.start.slice(-2)}–${group.end.slice(-2)}`,
 postUrl:`https://www.instagram.com/p/${code}/`,
 group:`October group ${groupIndex+1}`,
 starts:group.start,ends:group.end,status:group.status,enabled:group.status==='Active',
 resultType:'Messaging conversations',
 results:split(Math.round(group.spent/25),group.codes.length,index),
 reach:null,impressions:null,
 spent:split(group.spent,group.codes.length,index)/100,
 budget:split(20000,group.codes.length,index)/100,budgetType:'Lifetime',
 attribution:'7-day click or 1-day view',draft:false,simulated:true,asOf:'2026-10-18'
})));}
// Apply the requested replacement once, retaining the previous browser list as a backup.
export function loadAds(storage){
 const current=storage.getItem(storageKey);
 if(storage.getItem(datasetVersionKey)!==datasetVersion){
  if(current!==null&&storage.getItem(previousAdsKey)===null)storage.setItem(previousAdsKey,current);
  const next=seedAds();
  storage.setItem(storageKey,JSON.stringify(next));
  storage.setItem(datasetVersionKey,datasetVersion);
  return next;
 }
 if(current===null)return seedAds();
 const parsed=JSON.parse(current);
 if(!Array.isArray(parsed))throw new Error('Invalid saved ads');
 return parsed.map(validateAd);
}
