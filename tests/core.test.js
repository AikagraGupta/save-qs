import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemo,totals,assess,validateProject,importRegister,registerCSV,parseCSV,toCSV,gaps,money} from '../src/core.js';
import {reportItems, validDate, valuationReference} from '../src/core.js';
import {resolveItemId,commandItemId} from '../src/commands.js';

test('two BQ lines reconcile to the stated opening valuation',()=>{const t=totals(createDemo());assert.deepEqual([t.claimed,t.approved,t.unresolved,t.claim,t.assessed,t.previous,t.current,t.difference],[55,50,5,110000,100000,80000,20000,10000]);});
test('approving D-017 moves only one unit and records the reviewer reason',()=>{const initial=createDemo();const p=assess(initial,'D-017','approved','Inspected installation and confirmed full unit.','Test QS');const t=totals(p);assert.deepEqual([t.approved,t.current,t.difference,t.unresolved],[51,22000,8000,4]);assert.equal(totals(initial).approved,50);assert.equal(p.history[0].delta,2000);assert.equal(p.history[0].actor,'Test QS');});
test('repeated approval and duplicate evidence cannot multiply valuation',()=>{let p=createDemo();p.items.find(i=>i.id==='D-017').evidence.push(...p.items.find(i=>i.id==='D-017').evidence);p=assess(p,'D-017','approved','Reviewed full installation.');p=assess(p,'D-017','approved','Rechecked the same installation.');assert.equal(totals(p).current,22000);assert.equal(p.history[0].delta,0);});
test('correction of a prior certified item remains an explicit negative movement',()=>{let p=createDemo();for(const i of p.items.filter(i=>i.status==='approved'))p=assess(p,i.id,'rejected','Corrected prior approval on review.');assert.equal(totals(p).current,-80000);assert.equal(p.items.filter(i=>i.previous).length,40);});
test('pending evidence is not treated as rejected work',()=>{const p=createDemo();assert.equal(totals(p).rejected,0);assert.deepEqual(gaps(p.items.find(i=>i.id==='D-052'),p),['Photo needed']);assert.equal(totals(p).unresolved,5);});
test('import preserves quoted descriptions, booleans and the prior baseline',()=>{const p=createDemo();p.bq[0].description='Timber door, Type "A"';const restored=importRegister(registerCSV(p),p);assert.equal(restored.bq[0].description,p.bq[0].description);assert.equal(totals(restored).approved,40);assert.equal(totals(restored).claimed,55);assert.equal(totals(restored).current,0);});
test('duplicate physical IDs, inconsistent rates and invalid CSV are refused',()=>{const p=createDemo();const csv=registerCSV(p);assert.throws(()=>importRegister(csv.replace('D-002','D-001'),p),/Duplicate/);assert.throws(()=>importRegister(csv.replace('"2000"','"999"'),p),/Inconsistent/);assert.throws(()=>parseCSV('a,b\n"unclosed,x'),/unclosed/);const q=createDemo();q.items[1].id=q.items[0].id;assert.throws(()=>validateProject(q),/unique/);});
test('backup rejects active-content links, unsupported units and empty registers',()=>{let p=createDemo();p.items[0].evidence[0].sourceUrl='javascript:alert(1)';assert.throws(()=>validateProject(p),/https/);p=createDemo();p.bq[0].unit='m2';assert.throws(()=>validateProject(p),/countable/);p=createDemo();p.items=[];assert.throws(()=>validateProject(p),/non-empty/);});
test('export quotes cells and neutralizes spreadsheet formulas',()=>{assert.equal(toCSV([['=1+1','with "quotes"']]),'"\'=1+1","with ""quotes"""');assert.equal(money(2000.51),'HK$2,000.51');});
test('cent-based arithmetic stays exact with decimal unit rates',()=>{const p=createDemo();p.bq.forEach(b=>b.rate=2000.13);assert.equal(totals(p).current,20001.3);assert.equal(totals(p).difference,10000.65);});
test('new evidence re-enters review without silently changing approved value',()=>{let p=createDemo();const i=p.items.find(i=>i.id==='D-001');i.evidenceNeedsReview=true;assert.equal(totals(p).reviewCount,6);assert.equal(totals(p).assessed,100000);assert.ok(gaps(i,p).includes('New evidence to review'));p=assess(p,'D-001','approved','Rechecked the additional evidence.');assert.equal(totals(p).reviewCount,5);assert.equal(p.history[0].delta,0);});
test('register import preserves real project metadata and explicit certificate references',()=>{
 const p={...createDemo(),name:'QA project',scope:'Floor 9',period:'March 2027',valuationDate:'2027-03-31',valuationReference:'VAL-026',previousCertificate:'VAL-025',reviewer:'Another QS'};
 const q=importRegister(registerCSV(p),p);
 for(const key of ['name','scope','period','valuationDate','valuationReference','previousCertificate','reviewer'])assert.equal(q[key],p[key]);
 const legacy=createDemo();delete legacy.valuationReference;assert.equal(valuationReference(legacy),'Current review');
});
test('approved items with new evidence stay in the report until reviewed',()=>{
 let p=createDemo();p.items[0].evidenceNeedsReview=true;
 assert.equal(reportItems(p).length,6);assert.equal(reportItems(p)[0].id,'D-001');assert.equal(totals(p).difference,10000);
 p=assess(p,'D-001','approved','Confirmed the new photograph.');assert.equal(reportItems(p).length,5);assert.equal(totals(p).difference,10000);
});
test('invalid evidence, history, variations and calendar dates fail before import',()=>{
 for(const change of [p=>p.items[0].evidence=[null],p=>p.history=[null],p=>p.variations[0].amount='2000',p=>p.valuationDate='2026-02-30',p=>p.items[0].evidence[0].capturedAt='2026-13-01',p=>p.items[0].evidence[0].sourceUrl='https://']){
  const p=createDemo();change(p);assert.throws(()=>validateProject(p));
 }
 assert.equal(validDate('2028-02-29'),true);assert.equal(validDate('2027-02-29'),false);
});
test('custom item IDs survive local commands and agent tool resolution',()=>{
 const p=createDemo();p.items[0].id='FD-01';p.items[1].id='FD-010';
 assert.equal(resolveItemId(p,'fd-01'),'FD-01');assert.equal(resolveItemId(p,'17'),'D-017');
 assert.equal(resolveItemId(p,'FD-999'),null);assert.equal(commandItemId(p,'Open FD-010 please'),'FD-010');
 assert.equal(commandItemId(p,'Approve FD-01.'),'FD-01');assert.equal(commandItemId(p,'show door 17'),'D-017');
 assert.equal(commandItemId(p,'show FD-0100'),null);
});
