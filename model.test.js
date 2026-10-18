import {test} from 'node:test';import assert from 'node:assert/strict';import {validateAd,metrics,seedAds,loadAds,storageKey,datasetVersionKey,previousAdsKey,datasetVersion} from './model.js';
test('seed ads have unique identities and valid metrics',()=>{const ads=seedAds();assert.equal(ads.length,13);assert.equal(new Set(ads.map(a=>a.id)).size,13);ads.forEach(validateAd);});
test('rejects invalid imported metrics and missing names',()=>{assert.throws(()=>validateAd({name:'x',spent:-1}));assert.throws(()=>validateAd({name:'x',reach:'bad'}));assert.throws(()=>validateAd({name:' '}));});
test('calculates frequency, cost per result and CPM',()=>{assert.deepEqual(metrics({reach:100,impressions:200,results:5,spent:20}),{frequency:2,cost:4,cpm:100});assert.deepEqual(metrics({}),{frequency:0,cost:0,cpm:0});});

test('October groups allocate exactly $200 each with correct messaging costs and dates',()=>{
 const ads=seedAds();
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
 assert.equal(loadAds(storage).length,13);
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
 const ads=seedAds();assert.deepEqual(seedAds(),ads);
 for(const field of ['spent','budget','results','reach','impressions']){assert.ok(new Set(ads.map(a=>a[field])).size>=10);for(const group of new Set(ads.map(a=>a.group)))assert.ok(new Set(ads.filter(a=>a.group===group).map(a=>a[field])).size>1);}
 assert.ok(new Set(ads.map(a=>metrics(a).cost.toFixed(2))).size>=6);
 assert.ok(new Set(ads.map(a=>metrics(a).frequency.toFixed(2))).size>=6);
 assert.ok(new Set(ads.map(a=>metrics(a).cpm.toFixed(2))).size>=6);
 ads.forEach(a=>{assert.equal(a.costPerResult,null);assert.equal(metrics(a).cost,a.spent/a.results);assert.equal(a.simulated,true);assert.ok(a.results>0);});
});
