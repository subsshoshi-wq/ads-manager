export const storageKey='ads-manager-demo-v1';
export function validateAd(ad){if(ad?.postUrl){const url=new URL(ad.postUrl);if(url.protocol!=='https:'||!['instagram.com','www.instagram.com'].includes(url.hostname))throw new Error('Enter an HTTPS Instagram post URL.');}if(!ad||typeof ad.name!=='string'||!ad.name.trim())throw new Error('Each ad needs a name.');for(const key of ['results','reach','impressions','spent','budget','costPerResult'])if(ad[key]!==null&&ad[key]!==undefined&&(!Number.isFinite(Number(ad[key]))||Number(ad[key])<0))throw new Error('Metrics must be positive numbers or zero.');return {...ad,id:String(ad.id||crypto.randomUUID()),name:ad.name.trim().slice(0,180),status:['Off','Active','Completed','In review','Paused'].includes(ad.status)?ad.status:'Off'};}
export function metrics(ad){return {frequency:ad.reach?ad.impressions/ad.reach:0,cost:ad.costPerResult!=null&&ad.costPerResult!==''?Number(ad.costPerResult):(ad.results?ad.spent/ad.results:0),cpm:ad.impressions?ad.spent/ad.impressions*1000:0};}
export const datasetVersion='instagram-october-varied-v1';
export const datasetVersionKey=storageKey+'-dataset';
export const previousAdsKey=storageKey+'-before-'+datasetVersion;
const groups=[
 {start:'2026-10-02',end:'2026-10-08',status:'Completed',spent:20000,spends:[3280,3360,3315,3405,3265,3375],budgets:[3280,3360,3315,3405,3265,3375],costs:[.23,.27,.24,.29,.22,.26],codes:['DddbNSTDauL','DdZ3X5TDXhN','DdXNtVoiMcC','DdUqv2tCKye','DdSJxuOCFq9','DYM3GDzDziP']},
 {start:'2026-10-09',end:'2026-10-15',status:'Completed',spent:20000,spends:[4870,5135,4960,5035],budgets:[4870,5135,4960,5035],costs:[.26,.24,.28,.23],codes:['DVbMSPZDysm','DVJKrnJFtbT','DUVqwS6jFnp','DUyA2sjjQqi']},
 {start:'2026-10-16',end:'2026-10-22',status:'Active',spent:8571,spends:[2798,2916,2857],budgets:[6530,6805,6665],costs:[.24,.27,.25],codes:['DVbMSPZDysm','DVOUS3QCLxx','DTVWoAqCNA0']}
];
export function seedAds(){return groups.flatMap((group,groupIndex)=>group.codes.map((code,index)=>{
 const spent=group.spends[index]/100;
 const results=Math.round(spent/group.costs[index]);
 const reach=results*(23+((index*7+groupIndex*11)%19))+97+index*13;
 const frequency=1.19+((index*13+groupIndex*17)%43)/100;
 return {
  id:`october-group-${groupIndex+1}-${code}`,
  name:`Instagram post: ${code} · Oct ${group.start.slice(-2)}–${group.end.slice(-2)}`,
  postUrl:`https://www.instagram.com/p/${code}/`,group:`October group ${groupIndex+1}`,
  starts:group.start,ends:group.end,status:group.status,enabled:group.status==='Active',
  resultType:'Messaging conversations',results,reach,impressions:Math.round(reach*frequency),
  spent,budget:group.budgets[index]/100,budgetType:'Lifetime',costPerResult:null,
  attribution:'7-day click or 1-day view',draft:false,simulated:true,asOf:'2026-10-18'
 };
}));}
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
