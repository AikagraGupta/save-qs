export function doorArt(stage = 'Leaf and frame installed', number = 'D-017') {
 const partial = stage === 'Frame only';
 const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="920" height="620" viewBox="0 0 920 620"><defs><linearGradient id="wall" x2="0.8" y2="1"><stop stop-color="#e2ded4"/><stop offset="1" stop-color="#b5b9b2"/></linearGradient><linearGradient id="leaf" x2="1" y2="0"><stop stop-color="#a7b4ac"/><stop offset="1" stop-color="#7c9387"/></linearGradient><pattern id="grain" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M0 27h28M27 0v28" stroke="#fff" opacity=".08"/></pattern></defs><path fill="url(#wall)" d="M0 0h920v620H0z"/><path fill="#d4d1c6" d="M0 440l920-45v225H0z"/><path fill="#aeafa6" d="M0 440l920-45v12L0 453z"/><path fill="#253d35" d="M331 65l290 18v402l-290 29z"/><path fill="#e9e4d8" stroke="#969e91" stroke-width="5" d="M322 53l310 19v420l-310 34z"/><path fill="${partial ? '#384f49' : 'url(#leaf)'}" d="M342 76l267 16v384l-267 26z"/>${partial ? '<path d="M365 112l223 335M585 111L365 447" stroke="#62746b" stroke-width="8"/>' : '<path d="M366 111l216 13v328l-216 21z" fill="none" stroke="#b4c0b7" stroke-width="2"/><rect x="558" y="275" width="23" height="9" rx="4" fill="#ecebda"/><path d="M564 264v36" stroke="#e0e1cf" stroke-width="4"/>'}<path fill="url(#grain)" d="M0 0h920v620H0z"/><path d="M55 0v452M811 0v400" stroke="#d4d6ca" stroke-width="3"/><path d="M230 620l138-113M756 620L597 478" stroke="#a4aaa0" stroke-width="2"/><path d="M0 550l920-82" stroke="#bac0b4" stroke-width="2"/><rect x="674" y="132" width="109" height="52" rx="2" fill="#eeeae0" stroke="#bbbdb2"/><text x="694" y="166" font-size="24" font-family="Arial" fill="#233d33">${number.replace(/[^A-Za-z0-9-]/g,'')}</text><rect x="25" y="555" width="415" height="39" rx="3" fill="#183b32" opacity=".9"/><text x="41" y="581" fill="#fff" font-family="Arial" font-size="19">ILLUSTRATED SAMPLE · NOT SITE EVIDENCE</text>${stage === 'Not visible' ? '<path d="M210 580V120h110v460M285 580V175h190v405" fill="#b5ad97" opacity=".9"/><path d="M220 170h90M220 230h90M220 290h90" stroke="#8c8e7e" stroke-width="3"/>' : ''}</svg>`;
 return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export const icons = {
 grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 photo:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m21 15-5-5L5 21"/>',
 file:'<path d="M14 2H5v20h14V7zM14 2v6h5M8 13h8M8 17h6"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
 changes:'<path d="M3 7h14l-3-3M21 17H7l3 3M17 7l-3 3M7 17l3-3"/>',
 settings:'<path d="m9 3-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3 3-1 3 1 1-3 3-1-1-3 2-2-2-2 1-3-3-1-1-3-3 1z"/><circle cx="12" cy="12" r="3"/>',
 arrow:'<path d="M4 12h15m-5-5 5 5-5 5"/>',
 mic:'<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 check:'<path d="m5 12 4 4L20 5"/>',
 search:'<circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/>',
 chevron:'<path d="m9 5 7 7-7 7"/>',
 x:'<path d="m6 6 12 12M6 18 18 6"/>',
 download:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',
 upload:'<path d="M12 16V3m-4 4 4-4 4 4M4 16v5h16v-5"/>',
 help:'<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 5 2c-1 1-2 1-2 3M12 17h.01"/>',
 pin:'<path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
 spark:'<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/>',
 volume:'<path d="m11 4-6 5H2v6h3l6 5zM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>'
};
export const icon = (name, cls='') => `<svg class="icon ${cls}" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[name]||icons.file}</svg>`;
