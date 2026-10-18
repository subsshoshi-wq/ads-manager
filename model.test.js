import {test} from 'node:test';import assert from 'node:assert/strict';import {validateAd,metrics,seedAds} from './model.js';
test('seed ads have unique identities and valid metrics',()=>{const ads=seedAds();assert.equal(ads.length,16);assert.equal(new Set(ads.map(a=>a.id)).size,16);ads.forEach(validateAd);});
test('rejects invalid imported metrics and missing names',()=>{assert.throws(()=>validateAd({name:'x',spent:-1}));assert.throws(()=>validateAd({name:'x',reach:'bad'}));assert.throws(()=>validateAd({name:' '}));});
test('calculates frequency, cost per result and CPM',()=>{assert.deepEqual(metrics({reach:100,impressions:200,results:5,spent:20}),{frequency:2,cost:4,cpm:100});assert.deepEqual(metrics({}),{frequency:0,cost:0,cpm:0});});
