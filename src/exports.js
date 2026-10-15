import { totals, explanation, money, gaps, reviewReason } from './core.js';
import { jsPDF } from 'jspdf';

export function downloadFile(name, content, type='text/plain') {
 const url=URL.createObjectURL(new Blob([content],{type})); const a=document.createElement('a'); a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
export async function makePDF(p) {
 const pdf=new jsPDF({unit:'mm',format:'a4'}), t=totals(p);let y=24;
 const clean=s=>String(s).replace(/[\u2013\u2014]/g,'-').replace(/[^\x20-\x7E\n]/g,'');
 const header=title=>{pdf.setFillColor(18,43,41);pdf.rect(0,0,210,12,'F');pdf.setFont('helvetica','bold');pdf.setFontSize(20);pdf.setTextColor(18,43,41);pdf.text(title,18,27);y=40;};
 const text=(s,size=10,bold=false)=>{pdf.setFont('helvetica',bold?'bold':'normal');pdf.setFontSize(size);const lines=pdf.splitTextToSize(clean(s),174);for(const l of lines){if(y>270){pdf.addPage();header('SAVE / Assessment continued');}pdf.text(l,18,y);y+=size*.47;}y+=3;};
 header('SAVE / Draft payment assessment');
 text(`${p.name} | ${p.period} | ${p.scope}`,11,true);
 text(`Valuation date: ${p.valuationDate}   Reviewer: ${p.reviewer}`);
 text(p.isDemo?'SYNTHETIC DEMO DATA':'User-imported project. Verify all source records.',9,true);
 [['Cumulative claim',t.claim],['Approved cumulative gross assessment',t.assessed],['Previous certified gross value',t.previous],['Proposed gross movement this period',t.current],['Difference from cumulative claim',t.difference]].forEach(([k,v])=>text(`${k}: ${money(v)}`,11,true));
 text(explanation(p));
 text('BQ calculation breakdown',13,true);
 for(const l of t.lines) text(`${l.id} - ${l.description}\n${l.approved} approved x ${money(l.rate)} = ${money(l.assessedValue)} cumulative. Less ${money(l.previousValue)} previously certified = ${money(l.currentValue)} this period.`);
 text('Basis: approved complete units only. No partial-stage weights. Retention, variations and other adjustments excluded. This is not a certificate or an instruction to pay.',9);
 pdf.addPage();header('Unresolved items and decisions');
 for(const item of p.items.filter(i=>i.claimed&&i.status!=='approved'))text(`${item.id} | ${item.floor}, ${item.zone}, Room ${item.room}\n${item.status.toUpperCase()}: ${reviewReason(item)}\nEvidence checks: ${gaps(item,p).join('; ')||'QS confirmation required'}`);
 text('Recent review history',13,true);
 for(const h of p.history.slice(0,15)) text(`${new Date(h.at).toLocaleString('en-HK',{timeZone:'Asia/Hong_Kong'})} | ${h.actor} | ${h.itemId||h.type}\n${h.note}`,9);
 const evidenced=p.items.filter(i=>i.evidence.some(e=>e.data));
 for(const item of evidenced.slice(0,20)) {
   pdf.addPage();header(`Evidence annex / ${item.id}`);
   text(`${item.floor} | ${item.zone} | Room ${item.room} | ${item.bqId}`,11,true);
   text(`Assessment: ${item.status}. ${reviewReason(item)}`);
   for(const ev of item.evidence.filter(e=>e.data).slice(0,2)){
     if(y>160){pdf.addPage();header(`Evidence annex / ${item.id}`);}
     text(`${ev.name} | Captured: ${ev.capturedAt} (as supplied)\nSource: ${ev.source||'Upload'} | ${ev.note||''}`,9);
     try {const props=pdf.getImageProperties(ev.data);const scale=Math.min(174/props.width,105/props.height),w=props.width*scale,h=props.height*scale;pdf.addImage(ev.data,props.fileType,18,y,w,h);y+=h+10;}catch{text('Image unavailable. Refer to the project backup.');}
   }
 }
 if(evidenced.length>20){pdf.addPage();header('Annex scope');text('First 20 photographed item records included. The JSON project backup contains all uploaded evidence.');}
 for(let i=1;i<=pdf.getNumberOfPages();i++){pdf.setPage(i);pdf.setTextColor(90);pdf.setFontSize(8);pdf.text(`SAVE | Draft assessment | ${i} / ${pdf.getNumberOfPages()}`,18,287);}
 pdf.save(`SAVE-${p.period.replace(/\W+/g,'-')}-assessment.pdf`);
 return {pages:pdf.getNumberOfPages()};
}
