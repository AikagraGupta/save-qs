import test from 'node:test';
import assert from 'node:assert/strict';
import {IDBFactory, IDBDatabase} from 'fake-indexeddb';
import {loadProject,saveProject} from '../src/storage.js';
import {createDemo,assess,totals} from '../src/core.js';

test('browser database round-trips evidence, review history and valuation',async()=>{
 globalThis.indexedDB=new IDBFactory();
 assert.equal(await loadProject(),null);
 const p=assess(createDemo(),'D-017','approved','QA full unit inspection.');
 p.items[0].evidenceNeedsReview=true;
 await saveProject(p);
 p.name='Not committed';
 const restored=await loadProject();
 assert.equal(restored.name,'Harbour House');assert.equal(totals(restored).current,22000);
 assert.equal(restored.items[0].evidenceNeedsReview,true);assert.equal(restored.history[0].delta,2000);
});
test('an aborted write rejects and leaves the last saved project intact',async()=>{
 globalThis.indexedDB=new IDBFactory();
 await saveProject(createDemo());
 const original=IDBDatabase.prototype.transaction;
 IDBDatabase.prototype.transaction=function(...args){const tx=original.apply(this,args);if(args[1]==='readwrite')queueMicrotask(()=>tx.abort());return tx;};
 try{await assert.rejects(saveProject({...createDemo(),name:'Must not persist'}),/Storage/i);}finally{IDBDatabase.prototype.transaction=original;}
 assert.equal((await loadProject()).name,'Harbour House');
});
test('an uncloneable write fails without deleting the existing records',async()=>{
 globalThis.indexedDB=new IDBFactory();await saveProject(createDemo());
 await assert.rejects(saveProject({invalid:()=>{}}));
 assert.equal((await loadProject()).items.length,60);
});
