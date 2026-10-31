export const storageKey='ads-manager-demo-v1';
export function validateAd(ad){if(ad?.postUrl){const url=new URL(ad.postUrl);if(url.protocol!=='https:'||!['instagram.com','www.instagram.com'].includes(url.hostname))throw new Error('Enter an HTTPS Instagram post URL.');}if(!ad||typeof ad.name!=='string'||!ad.name.trim())throw new Error('Each ad needs a name.');for(const key of ['results','reach','impressions','spent','budget','costPerResult'])if(ad[key]!==null&&ad[key]!==undefined&&(!Number.isFinite(Number(ad[key]))||Number(ad[key])<0))throw new Error('Metrics must be positive numbers or zero.');return {...ad,id:String(ad.id||crypto.randomUUID()),name:ad.name.trim().slice(0,180),status:['Off','Active','Completed','In review','Paused'].includes(ad.status)?ad.status:'Off'};}
export function metrics(ad){return {frequency:ad.reach?ad.impressions/ad.reach:0,cost:ad.costPerResult!=null&&ad.costPerResult!==''?Number(ad.costPerResult):(ad.results?ad.spent/ad.results:0),cpm:ad.impressions?ad.spent/ad.impressions*1000:0};}
export const datasetVersion='instagram-october-varied-v1';
export const datasetVersionKey=storageKey+'-dataset';
export const previousAdsKey=storageKey+'-before-'+datasetVersion;
export const october22MigrationKey=storageKey+'-october-22-ads-added-v1';
export const october22SpendCorrectionKey=storageKey+'-october-22-spend-corrected-v1';
export const october22MetricsKey=storageKey+'-october-22-messaging-estimates-v1';
const groups=[
 {start:'2026-10-02',end:'2026-10-08',status:'Completed',spent:20000,spends:[3280,3360,3315,3405,3265,3375],budgets:[3280,3360,3315,3405,3265,3375],costs:[.23,.27,.24,.29,.22,.26],codes:['DddbNSTDauL','DdZ3X5TDXhN','DdXNtVoiMcC','DdUqv2tCKye','DdSJxuOCFq9','DYM3GDzDziP']},
 {start:'2026-10-09',end:'2026-10-15',status:'Completed',spent:20000,spends:[4870,5135,4960,5035],budgets:[4870,5135,4960,5035],costs:[.26,.24,.28,.23],codes:['DVbMSPZDysm','DVJKrnJFtbT','DUVqwS6jFnp','DUyA2sjjQqi']},
 {start:'2026-10-16',end:'2026-10-22',status:'Active',spent:8571,spends:[2798,2916,2857],budgets:[6530,6805,6665],costs:[.24,.27,.25],codes:['DVbMSPZDysm','DVOUS3QCLxx','DTVWoAqCNA0']}
];
export function october22Ads(){return [{code:'DewR1mKlMnY',results:168,reach:8750,impressions:14000},{code:'Deq_XOuCh_-',results:156,reach:8000,impressions:12600}].map(({code,results,reach,impressions})=>({
 id:`october-group-4-${code}`,name:`Instagram post: ${code} · Oct 22–28`,
 postUrl:`https://www.instagram.com/p/${code}/?img_index=1`,group:'October group 4',
 starts:'2026-10-22',ends:'2026-10-28',status:'Completed',enabled:false,
 resultType:'Messaging conversations',results,reach,impressions,spent:42,budget:42,
 budgetType:'Lifetime',costPerResult:null,attribution:'7-day click or 1-day view',draft:false,
 simulated:true
}));}
export function seedAds(){return [...groups.flatMap((group,groupIndex)=>group.codes.map((code,index)=>{
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
})),...october22Ads()];}
// Apply the requested replacement once, retaining the previous browser list as a backup.
export function loadAds(storage){
 const current=storage.getItem(storageKey);
 if(storage.getItem(datasetVersionKey)!==datasetVersion){
  if(current!==null&&storage.getItem(previousAdsKey)===null)storage.setItem(previousAdsKey,current);
  const next=seedAds();
  storage.setItem(storageKey,JSON.stringify(next));
  storage.setItem(datasetVersionKey,datasetVersion);
  storage.setItem(october22MigrationKey,'1');
  storage.setItem(october22SpendCorrectionKey,'1');
  storage.setItem(october22MetricsKey,'1');
  return next;
 }
 if(current===null){storage.setItem(october22MigrationKey,'1');storage.setItem(october22SpendCorrectionKey,'1');storage.setItem(october22MetricsKey,'1');return seedAds();}
 const parsed=JSON.parse(current);
 if(!Array.isArray(parsed))throw new Error('Invalid saved ads');
 let ads=parsed.map(validateAd);
 if(storage.getItem(october22MigrationKey)!=='1'){
  const ids=new Set(ads.map(ad=>ad.id));
  ads=[...ads,...october22Ads().filter(ad=>!ids.has(ad.id))];
  storage.setItem(storageKey,JSON.stringify(ads));
  storage.setItem(october22MigrationKey,'1');
 }
 if(storage.getItem(october22SpendCorrectionKey)!=='1'){
  const ids=new Set(october22Ads().map(ad=>ad.id));
  ads=ads.map(ad=>{
   if(!ids.has(ad.id))return ad;
   const updated={...ad};
   if(Number(ad.spent)===21)updated.spent=42;
   if(Number(ad.budget)===21&&ad.budgetType==='Lifetime')updated.budget=42;
   if(updated.spendAllocation==='Even split of $42 combined spend; individual amounts are estimates.')delete updated.spendAllocation;
   return updated;
  });
  storage.setItem(storageKey,JSON.stringify(ads));
  storage.setItem(october22SpendCorrectionKey,'1');
 }
 if(storage.getItem(october22MetricsKey)!=='1'){
  const estimates=new Map(october22Ads().map(ad=>[ad.id,ad]));
  ads=ads.map(ad=>{
   const estimate=estimates.get(ad.id);
   if(!estimate)return ad;
   const updated={...ad};
   for(const key of ['results','reach','impressions'])if(updated[key]===null||updated[key]===undefined||updated[key]==='')updated[key]=estimate[key];
   if(updated.resultType==='Results'||updated.resultType===null||updated.resultType===undefined||updated.resultType==='')updated.resultType='Messaging conversations';
   return updated;
  });
  storage.setItem(storageKey,JSON.stringify(ads));
  storage.setItem(october22MetricsKey,'1');
 }
 return ads;
}

