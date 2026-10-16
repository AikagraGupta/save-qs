import { totals, explanation, money, gaps, reviewReason, reportItems } from './core.js';
import { jsPDF } from 'jspdf';

export function downloadFile(name, content, type='text/plain') {
 const url=URL.createObjectURL(new Blob([content],{type})); const a=document.createElement('a'); a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
export async function makePDF(p) {
 const pdf=new jsPDF({unit:'mm',format:'a4'}), t=totals(p);let y=24;
 const clean=s=>String(s).replace(/[\u2013\u2014]/g,'-').replace(/[\u0000-\u0008\u000B-\u001F]/g,'');
 const header=title=>{pdf.setFillColor(18,43,41);pdf.rect(0,0,210,12,'F');pdf.setFont('helvetica','bold');pdf.setFontSize(20);pdf.setTextColor(18,43,41);pdf.text(title,18,27);y=40;};
 // jsPDF's built-in Helvetica cannot encode CJK. Render those lines with the
 // browser's system fonts instead of silently removing names and evidence notes.
 const text=(s,size=10,bold=false)=>{
   const content=clean(s),unicode=/[^\x20-\x7E\n]/.test(content);
   pdf.setFont('helvetica',bold?'bold':'normal');pdf.setFontSize(size);
   if(!unicode){for(const l of pdf.splitTextToSize(content,174)){if(y>270){pdf.addPage();header('SAVE / Assessment continued');pdf.setFont('helvetica',bold?'bold':'normal');pdf.setFontSize(size);}pdf.text(l,18,y);y+=size*.47;}}
   else {
     const pxPerMm=96/25.4,fontPx=size*96/72,scale=3;
     const measure=document.createElement('canvas').getContext('2d');measure.font=`${bold?'600':'400'} ${fontPx}px system-ui, sans-serif`;
     const lines=[];for(const paragraph of content.split('\n')){let line='';for(const char of Array.from(paragraph)){if(line&&measure.measureText(line+char).width>174*pxPerMm){lines.push(line);line='';}line+=char;}lines.push(line);}
     for(const line of lines){if(y>266){pdf.addPage();header('SAVE / Assessment continued');}
       if(line){const canvas=document.createElement('canvas');canvas.width=Math.ceil((measure.measureText(line).width+4)*scale);canvas.height=Math.ceil(fontPx*1.5*scale);const ctx=canvas.getContext('2d');ctx.scale(scale,scale);ctx.font=measure.font;ctx.fillStyle='#122b29';ctx.textBaseline='top';ctx.fillText(line,0,0);pdf.addImage(canvas,'PNG',18,y-fontPx*.78/pxPerMm,canvas.width/scale/pxPerMm,canvas.height/scale/pxPerMm);}
       y+=Math.max(size*.47,fontPx*1.5/pxPerMm);
     }
   }
   y+=3;
 };
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
 for(const item of reportItems(p))text(`${item.id} | ${item.floor}, ${item.zone}, Room ${item.room}\n${item.status.toUpperCase()}: ${reviewReason(item)}\nEvidence checks: ${gaps(item,p).join('; ')||'QS confirmation required'}`);
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
