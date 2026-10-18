import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createReport} from './report.js';
test('report includes metrics, totals, print controls and safe ad text',()=>{
 const html=createReport([{name:'<script>alert("x")</script>',status:'Active',results:5,reach:100,impressions:200,spent:20,budget:3,budgetType:'Daily',resultType:'Purchases'}],new Date('2026-10-18T12:00:00Z'));
 assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('$20.00'));assert.ok(html.includes('$4.00'));assert.ok(html.includes('$100.00'));assert.ok(html.includes('2.00'));assert.ok(html.includes('Purchases'));assert.ok(html.includes('window.print()'));assert.ok(html.includes('Simulation report'));
});
test('missing metrics and no end date are represented without invented values',()=>{
 const html=createReport([{name:'Example',status:'Off',budgetType:'Shared'}]);assert.ok(html.includes('—'));assert.ok(html.includes('Ongoing'));assert.ok(html.includes('Ad set budget'));assert.ok(!html.includes('NaN'));
});
