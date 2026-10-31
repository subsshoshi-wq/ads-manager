import {test} from 'node:test';import assert from 'node:assert/strict';import {validateAd,metrics,seedAds,loadAds,storageKey,datasetVersionKey,previousAdsKey,datasetVersion,october22MigrationKey,october22SpendCorrectionKey,october22MetricsKey,october22RefinedMetricsKey,october22Ads} from './model.js';
test('seed ads have unique identities and valid metrics',()=>{const ads=seedAds();assert.equal(ads.length,15);assert.equal(new Set(ads.map(a=>a.id)).size,15);ads.forEach(validateAd);});
test('rejects invalid imported metrics and missing names',()=>{assert.throws(()=>validateAd({name:'x',spent:-1}));assert.throws(()=>validateAd({name:'x',reach:'bad'}));assert.throws(()=>validateAd({name:' '}));});
test('calculates frequency, cost per result and CPM',()=>{assert.deepEqual(metrics({reach:100,impressions:200,results:5,spent:20}),{frequency:2,cost:4,cpm:100});assert.deepEqual(metrics({}),{frequency:0,cost:0,cpm:0});});

test('October groups allocate exactly $200 each with correct messaging costs and dates',()=>{
 const ads=seedAds().filter(a=>a.group!=='October group 4');
 assert.equal(ads.filter(a=>a.status==='Completed').length,10);
 assert.equal(ads.filter(a=>a.status==='Active').length,3);
 for(let g=1;g<=3;g++){
  const group=ads.filter(a=>a.group===`October group ${g}`);
  assert.equal(group.reduce((s,a)=>s+Math.round(a.budget*100),0),20000);
  assert.equal(group.reduce((s,a)=>s+Math.round(a.spent*100),0),g===3?8571:20000);
  group.forEach(a=>{assert.equal(a.resultType,'Messaging conversations');assert.ok(metrics(a).cost>=.2&&metrics(a).cost<=.3);assert.equal((Date.parse(a.ends)-Date.parse(a.starts))/86400000,6);assert.ok(a.reach>=a.results);assert.ok(a.impressions>=a.reach);});
 }
 assert.equal(ads.reduce((s,a)=>s+Math.round(a.spent*100),0),48571);
 assert.equal(ads.filter(a=>a.postUrl.includes('DVbMSPZDysm')).length,2);
});
test('one-time replacement preserves previous data and subsequent user edits',()=>{
 const values=new Map([[storageKey,JSON.stringify([{name:'Previous ad'}])]]);
 const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 assert.equal(loadAds(storage).length,15);
 assert.equal(JSON.parse(storage.getItem(previousAdsKey))[0].name,'Previous ad');
 assert.equal(storage.getItem(datasetVersionKey),datasetVersion);
 const edited=JSON.parse(storage.getItem(storageKey));edited[0].name='Edited by user';storage.setItem(storageKey,JSON.stringify(edited));
 assert.equal(loadAds(storage)[0].name,'Edited by user');
 storage.setItem(storageKey,'[]');assert.deepEqual(loadAds(storage),[]);
});
test('rejects unsafe post links',()=>{assert.throws(()=>validateAd({name:'Test',postUrl:'javascript:alert(1)'}));});

test('manual cost per result overrides calculation and blank uses calculated cost',()=>{
 assert.equal(metrics({spent:20,results:100,costPerResult:.28}).cost,.28);
 assert.equal(metrics({spent:20,results:100,costPerResult:0}).cost,0);
 assert.equal(metrics({spent:20,results:100,costPerResult:null}).cost,.2);
 assert.equal(metrics({spent:20,results:100}).cost,.2);
 assert.throws(()=>validateAd({name:'Test',costPerResult:-.1}));
 assert.throws(()=>validateAd({name:'Test',costPerResult:'bad'}));
});

test('simulated metrics vary between ads, remain coherent and survive reload unchanged',()=>{
 const ads=seedAds().filter(a=>a.group!=='October group 4');assert.deepEqual(seedAds().filter(a=>a.group!=='October group 4'),ads);
 for(const field of ['spent','budget','results','reach','impressions']){assert.ok(new Set(ads.map(a=>a[field])).size>=10);for(const group of new Set(ads.map(a=>a.group)))assert.ok(new Set(ads.filter(a=>a.group===group).map(a=>a[field])).size>1);}
 assert.ok(new Set(ads.map(a=>metrics(a).cost.toFixed(2))).size>=6);
 assert.ok(new Set(ads.map(a=>metrics(a).frequency.toFixed(2))).size>=6);
 assert.ok(new Set(ads.map(a=>metrics(a).cpm.toFixed(2))).size>=6);
 ads.forEach(a=>{assert.equal(a.costPerResult,null);assert.equal(metrics(a).cost,a.spent/a.results);assert.equal(a.simulated,true);assert.ok(a.results>0);});
});

test('October 22 posts each cover seven days at $6 per day',()=>{
 const ads=seedAds().filter(a=>a.group==='October group 4');
 assert.equal(ads.length,2);
 assert.deepEqual(ads.map(a=>new URL(a.postUrl).pathname),['/p/DewR1mKlMnY/','/p/Deq_XOuCh_-/']);
 assert.equal(ads.reduce((sum,a)=>sum+a.spent,0),84);
 assert.equal(ads.reduce((sum,a)=>sum+a.budget,0),84);
 ads.forEach(a=>{assert.equal(a.spent,42);assert.equal(a.budget,42);assert.equal(a.status,'Completed');assert.equal(a.starts,'2026-10-22');assert.equal(a.ends,'2026-10-28');assert.equal(a.resultType,'Messaging conversations');assert.equal(a.simulated,true);assert.ok(a.results>0);assert.ok(a.impressions>=a.reach);});
 assert.deepEqual(ads.map(a=>[a.results,a.reach,a.impressions]),[[167,8756,13986],[157,8031,12647]]);
});

test('messaging estimates fill missing values once without replacing saved edits or deleted ads',()=>{
 const [first]=october22Ads();
 const existing={...first,name:'My edited ad',resultType:'Results',results:123,reach:null,impressions:'',spent:40};
 const other={id:'mine',name:'Another ad',results:null,reach:null,impressions:null};
 const values=new Map([[storageKey,JSON.stringify([existing,other])],[datasetVersionKey,datasetVersion],[october22MigrationKey,'1'],[october22SpendCorrectionKey,'1']]);
 const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 const loaded=loadAds(storage);assert.equal(loaded.length,2);assert.equal(loaded[0].name,'My edited ad');assert.equal(loaded[0].resultType,'Messaging conversations');assert.equal(loaded[0].results,123);assert.equal(loaded[0].reach,8756);assert.equal(loaded[0].impressions,13986);assert.equal(loaded[0].spent,40);assert.equal(loaded[1].reach,null);assert.equal(storage.getItem(october22MetricsKey),'1');
 loaded[0].reach=null;storage.setItem(storageKey,JSON.stringify(loaded));assert.equal(loadAds(storage)[0].reach,null);
});
test('one-time addition preserves existing ads and later edits and deletions',()=>{
 const original=[{id:'mine',name:'My edited ad',spent:8}];
 const values=new Map([[storageKey,JSON.stringify(original)],[datasetVersionKey,datasetVersion]]);
 const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 const first=loadAds(storage);assert.equal(first.length,3);assert.equal(first[0].name,'My edited ad');
 assert.equal(storage.getItem(october22MigrationKey),'1');
 first[1].spent=19;first.splice(2,1);storage.setItem(storageKey,JSON.stringify(first));
 const next=loadAds(storage);assert.equal(next.length,2);assert.equal(next[1].spent,19);
});


test('spend correction updates old estimates once and preserves edits and deleted ads',()=>{
 const old=october22Ads().map(a=>({...a,spent:21,budget:21,spendAllocation:'Even split of $42 combined spend; individual amounts are estimates.'}));
 old[0].name='My renamed ad';old[0].results=123;old[1].spent=30;old[1].budget=33;
 const other={id:'mine',name:'Other ad',spent:21,budget:21};
 const values=new Map([[storageKey,JSON.stringify([...old,other])],[datasetVersionKey,datasetVersion],[october22MigrationKey,'1']]);
 const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 const corrected=loadAds(storage);assert.equal(corrected[0].spent,42);assert.equal(corrected[0].budget,42);
 assert.equal(corrected[0].name,'My renamed ad');assert.equal(corrected[0].results,123);assert.equal(corrected[0].spendAllocation,undefined);
 assert.equal(corrected[1].spent,30);assert.equal(corrected[1].budget,33);assert.equal(corrected[2].spent,21);
 assert.equal(storage.getItem(october22SpendCorrectionKey),'1');
 corrected[0].spent=21;corrected.splice(1,1);storage.setItem(storageKey,JSON.stringify(corrected));
 const reloaded=loadAds(storage);assert.equal(reloaded.length,2);assert.equal(reloaded[0].spent,21);
});


test('refined estimates replace earlier simulated figures once while preserving edits and deletions',()=>{
 const [first,second]=october22Ads();
 const oldFirst={...first,results:168,reach:8750,impressions:14000,name:'My edited ad'};
 const oldSecond={...second,results:156,reach:9000,impressions:12600};
 const unrelated={id:'mine',name:'Other ad',results:168,reach:8750,impressions:14000,simulated:true};
 const values=new Map([[storageKey,JSON.stringify([oldFirst,oldSecond,unrelated])],[datasetVersionKey,datasetVersion],[october22MigrationKey,'1'],[october22SpendCorrectionKey,'1'],[october22MetricsKey,'1']]);
 const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 const updated=loadAds(storage);
 assert.deepEqual([updated[0].results,updated[0].reach,updated[0].impressions],[167,8756,13986]);
 assert.equal(updated[0].name,'My edited ad');
 assert.deepEqual([updated[1].results,updated[1].reach,updated[1].impressions],[157,9000,12647]);
 assert.deepEqual([updated[2].results,updated[2].reach,updated[2].impressions],[168,8750,14000]);
 assert.equal(storage.getItem(october22RefinedMetricsKey),'1');
 updated[0].reach=8750;updated.splice(1,1);storage.setItem(storageKey,JSON.stringify(updated));
 const reloaded=loadAds(storage);assert.equal(reloaded.length,2);assert.equal(reloaded[0].reach,8750);
});
