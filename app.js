const messier = [
  ['M1','Crab Nebula','Nebula'],['M2','', 'Globular Cluster'],['M3','', 'Globular Cluster'],['M4','', 'Globular Cluster'],['M5','', 'Globular Cluster'],['M6','Butterfly Cluster','Open Cluster'],['M7','Ptolemy Cluster','Open Cluster'],['M8','Lagoon Nebula','Nebula'],['M9','', 'Globular Cluster'],['M10','', 'Globular Cluster'],
  ['M11','Wild Duck Cluster','Open Cluster'],['M12','', 'Globular Cluster'],['M13','Hercules Cluster','Globular Cluster'],['M14','', 'Globular Cluster'],['M15','', 'Globular Cluster'],['M16','Eagle Nebula','Nebula'],['M17','Omega Nebula','Nebula'],['M18','', 'Open Cluster'],['M19','', 'Globular Cluster'],['M20','Trifid Nebula','Nebula'],
  ['M21','', 'Open Cluster'],['M22','Sagittarius Cluster','Globular Cluster'],['M23','', 'Open Cluster'],['M24','Sagittarius Star Cloud','Other'],['M25','', 'Open Cluster'],['M26','', 'Open Cluster'],['M27','Dumbbell Nebula','Nebula'],['M28','', 'Globular Cluster'],['M29','Cooling Tower Cluster','Open Cluster'],['M30','', 'Globular Cluster'],
  ['M31','Andromeda Galaxy','Galaxy'],['M32','Le Gentil','Galaxy'],['M33','Triangulum Galaxy','Galaxy'],['M34','Spiral Cluster','Open Cluster'],['M35','Shoe-Buckle Cluster','Open Cluster'],['M36','Pinwheel Cluster','Open Cluster'],['M37','Salt and Pepper Cluster','Open Cluster'],['M38','Starfish Cluster','Open Cluster'],['M39','', 'Open Cluster'],['M40','Winnecke 4','Other'],
  ['M41','Little Beehive','Open Cluster'],['M42','Orion Nebula','Nebula'],['M43','De Mairan’s Nebula','Nebula'],['M44','Beehive Cluster','Open Cluster'],['M45','Pleiades','Open Cluster'],['M46','', 'Open Cluster'],['M47','', 'Open Cluster'],['M48','', 'Open Cluster'],['M49','', 'Galaxy'],['M50','Heart-Shaped Cluster','Open Cluster'],
  ['M51','Whirlpool Galaxy','Galaxy'],['M52','Scorpion Cluster','Open Cluster'],['M53','', 'Globular Cluster'],['M54','', 'Globular Cluster'],['M55','', 'Globular Cluster'],['M56','', 'Globular Cluster'],['M57','Ring Nebula','Nebula'],['M58','', 'Galaxy'],['M59','', 'Galaxy'],['M60','', 'Galaxy'],
  ['M61','Swelling Spiral Galaxy','Galaxy'],['M62','Flickering Globular','Globular Cluster'],['M63','Sunflower Galaxy','Galaxy'],['M64','Black Eye Galaxy','Galaxy'],['M65','Leo Triplet','Galaxy'],['M66','Leo Triplet','Galaxy'],['M67','King Cobra Cluster','Open Cluster'],['M68','', 'Globular Cluster'],['M69','', 'Globular Cluster'],['M70','', 'Globular Cluster'],
  ['M71','Angelfish Cluster','Globular Cluster'],['M72','', 'Globular Cluster'],['M73','', 'Other'],['M74','Phantom Galaxy','Galaxy'],['M75','', 'Globular Cluster'],['M76','Little Dumbbell Nebula','Nebula'],['M77','Cetus A','Galaxy'],['M78','Casper the Friendly Ghost','Nebula'],['M79','', 'Globular Cluster'],['M80','', 'Globular Cluster'],
  ['M81','Bode’s Galaxy','Galaxy'],['M82','Cigar Galaxy','Galaxy'],['M83','Southern Pinwheel Galaxy','Galaxy'],['M84','Markarian’s Chain','Galaxy'],['M85','', 'Galaxy'],['M86','Markarian’s Chain','Galaxy'],['M87','Virgo A','Galaxy'],['M88','', 'Galaxy'],['M89','', 'Galaxy'],['M90','', 'Galaxy'],
  ['M91','', 'Galaxy'],['M92','', 'Globular Cluster'],['M93','', 'Open Cluster'],['M94','Croc’s Eye Galaxy','Galaxy'],['M95','', 'Galaxy'],['M96','', 'Galaxy'],['M97','Owl Nebula','Nebula'],['M98','', 'Galaxy'],['M99','Coma Pinwheel Galaxy','Galaxy'],['M100','Mirror Galaxy','Galaxy'],
  ['M101','Pinwheel Galaxy','Galaxy'],['M102','Spindle Galaxy','Galaxy'],['M103','', 'Open Cluster'],['M104','Sombrero Galaxy','Galaxy'],['M105','', 'Galaxy'],['M106','', 'Galaxy'],['M107','', 'Globular Cluster'],['M108','Surfboard Galaxy','Galaxy'],['M109','Vacuum Cleaner Galaxy','Galaxy'],['M110','Edward Young Star','Galaxy']
].map(([id,name,type]) => ({ id, name: name || id, type }));

const systemFonts = ['Inter','Space Grotesk','IBM Plex Mono','Bebas Neue','Arial','Helvetica','Georgia','Times New Roman','Courier New','Verdana','Trebuchet MS','Tahoma'];
const typeClass = t => `type-${t.toLowerCase().replace(/\s+/g, '-')}`;
const els = Object.fromEntries([...document.querySelectorAll('[id]')].map(el => [el.id, el]));
const defaultAdjust = { zoom: 1, x: 50, y: 50, rotate: 0 };
const logFields = ['location','date','telescope','mount','filter','camera','software','notes'];
const logElementIds = { location:'logLocation', date:'logDate', telescope:'logTelescope', mount:'logMount', filter:'logFilter', camera:'logCamera', software:'logSoftware', notes:'logNotes' };
const defaultLog = Object.fromEntries(logFields.map(k => [k, '']));
const defaultCustomGrid = { enabled:false, layout:'free', highlight:'manual', preset:'bigThree', tileSizes:{} };
const defaultState = { title:'TEXT', footer:'TEXT', template:'classic', font:'Inter', bg:'#050505', text:'#f5f5f5', accent:'#ffffff', typeColors:true, date:'TEXT', customGrid:{...defaultCustomGrid} };
let state = { ...defaultState }, photos = {}, adjustments = {}, logs = {}, selectedId = null, pendingAdjust = null, db, dirty=false;
let pendingClearAll = false;
const validTemplates = new Set(['classic','wide']);
const validCustomLayouts = new Set(['free','fit']);
const validHighlightModes = new Set(['manual','preset']);
const validCustomPresets = new Set(['bigThree','deepSkyIcons','galaxyShowcase']);
const tileSizesFree = ['1x1','2x1','1x2','2x2','3x1','1x3','3x2','2x3','3x3'];
const tileSizesFit = ['1x1','2x1','1x2','2x2'];
const parseTileSize = size => {
  const m=String(size||'1x1').match(/^(\d+)x(\d+)$/);
  if(!m) return {w:1,h:1,key:'1x1'};
  const w=clamp(Number(m[1])||1,1,3), h=clamp(Number(m[2])||1,1,3);
  return {w,h,key:`${w}x${h}`};
};
const tileArea = size => { const d=parseTileSize(size); return d.w*d.h; };
const getGridColumns = () => state.template==='wide' ? 11 : 10;
const exactPresetSizes = () => {
  const cols=getGridColumns();
  if(state.customGrid?.preset==='deepSkyIcons') return cols===11
    ? {M31:'3x2',M42:'2x2',M45:'2x2'}
    : {M31:'3x2',M42:'2x2',M45:'1x3'};
  if(state.customGrid?.preset==='galaxyShowcase') return cols===11
    ? {M31:'3x2',M33:'2x2',M51:'2x2'}
    : {M31:'3x2',M51:'2x2',M101:'1x3'};
  return cols===11
    ? {M31:'3x2',M42:'2x2',M45:'2x2'}
    : {M31:'3x2',M42:'2x2',M45:'1x3'};
};
function normalizeCustomGrid(input={}){
  const next={...defaultCustomGrid,...input};
  if(!validCustomLayouts.has(next.layout)) next.layout='free';
  if(!validHighlightModes.has(next.highlight)) next.highlight='manual';
  if(!validCustomPresets.has(next.preset)) next.preset='bigThree';
  next.tileSizes={...(input.tileSizes||{})};
  Object.keys(next.tileSizes).forEach(id=>{
    if(!messier.some(o=>o.id===id)) delete next.tileSizes[id];
    else next.tileSizes[id]=parseTileSize(next.tileSizes[id]).key;
  });
  return next;
}
function normalizeState(){
  state={...defaultState,...state,customGrid:normalizeCustomGrid(state.customGrid)};
  if(!validTemplates.has(state.template)) state.template='classic';
}
function getTileSizeMap(){
  const cfg=state.customGrid||defaultCustomGrid;
  if(!cfg.enabled) return {};
  if(cfg.highlight==='preset') return exactPresetSizes();
  const allowed=cfg.layout==='fit' ? tileSizesFit : tileSizesFree;
  const out={};
  Object.entries(cfg.tileSizes||{}).forEach(([id,size])=>{ if(allowed.includes(size) && size!=='1x1') out[id]=size; });
  return out;
}
function customGridTotalSlots(sizeMap){
  return messier.reduce((sum,obj)=>sum+tileArea(sizeMap[obj.id]||'1x1'),0);
}
function fillerCountFor(sizeMap){
  const cols=getGridColumns();
  const rem=customGridTotalSlots(sizeMap)%cols;
  return rem ? cols-rem : 0;
}
function customGridStatus(sizeMap=getTileSizeMap()){
  if(!state.customGrid?.enabled) return 'Custom Grid is off.';
  const filler=fillerCountFor(sizeMap);
  if(state.customGrid.layout==='fit') return filler===0 ? 'Fit layout: exact.' : `Fit layout: ${filler} balancing tile${filler>1?'s':''} added.`;
  return filler===0 ? 'Free layout: exact by chance.' : `Free layout: ${filler} blank tile${filler>1?'s':''} kept at the end.`;
}
function syncCustomGridControls(){
  const cfg=state.customGrid||defaultCustomGrid;
  if(els.customGridEnabled) els.customGridEnabled.checked=!!cfg.enabled;
  if(els.customGridLayout) els.customGridLayout.value=cfg.layout;
  if(els.highlightMode) els.highlightMode.value=cfg.highlight;
  if(els.presetSelect) els.presetSelect.value=cfg.preset;
  if(els.customGridStatus) els.customGridStatus.textContent=customGridStatus();
  if(els.manualCustomHint) els.manualCustomHint.style.display=cfg.highlight==='manual' ? 'block' : 'none';
  if(els.presetCustomHint) els.presetCustomHint.style.display=cfg.highlight==='preset' ? 'block' : 'none';
  if(els.presetSelect) els.presetSelect.disabled=!cfg.enabled || cfg.highlight!=='preset';
}
function populateTileSizeSelect(){
  if(!els.tileSizeSelect || !selectedId) return;
  const cfg=state.customGrid||defaultCustomGrid;
  const options=cfg.layout==='fit' ? tileSizesFit : tileSizesFree;
  const map=getTileSizeMap();
  const selected=map[selectedId] || '1x1';
  els.tileSizeSelect.innerHTML=options.map(size=>`<option value="${size}">${size}</option>`).join('');
  els.tileSizeSelect.value=options.includes(selected)?selected:'1x1';
  els.tileSizeSelect.disabled=!cfg.enabled || cfg.highlight!=='manual';
  if(els.tileSizePanel) els.tileSizePanel.style.display=cfg.enabled && cfg.highlight==='manual' ? 'block' : 'none';
  if(els.tileSizeHint) els.tileSizeHint.textContent=cfg.layout==='fit' ? 'Fit layout allows compact sizes and fills the last row automatically.' : 'Free layout allows larger sizes and keeps balancing blanks if needed.';
}

function setDirty(v=true){dirty=v;}
window.addEventListener('beforeunload', e=>{if(!dirty) return; e.preventDefault(); e.returnValue='';});
function openDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open('messierist',2);req.onupgradeneeded=()=>req.result.createObjectStore('photos');req.onsuccess=()=>{db=req.result;resolve(db)};req.onerror=()=>reject(req.error);});}
function txDone(mode, fn){return new Promise(res=>{const tx=db.transaction('photos',mode);fn(tx.objectStore('photos'));tx.oncomplete=res;});}
function dbGetAll(){return new Promise(resolve=>{const tx=db.transaction('photos','readonly');const s=tx.objectStore('photos');const r=s.getAllKeys();r.onsuccess=()=>{const out={};let left=r.result.length;if(!left)return resolve(out);r.result.forEach(k=>{const g=s.get(k);g.onsuccess=()=>{out[k]=g.result;if(--left===0)resolve(out)};});};});}
const saveState=()=>{localStorage.setItem('messierist-state',JSON.stringify({state,adjustments,logs})); setDirty(false);};
function loadState(){const s=localStorage.getItem('messierist-state');if(s){const d=JSON.parse(s);state={...defaultState,...(d.state||{})};adjustments=d.adjustments||{};logs=d.logs||{};} normalizeState();}
const objectLabel=o=>(o.name&&o.name!==o.id)?`${o.id} · ${o.name}`:o.id;
function getAdjust(id){return {...defaultAdjust,...(adjustments[id]||{})};}
function getLog(id){return {...defaultLog,...(logs[id]||{})};}
function fillLogFields(id){
  const data=getLog(id);
  logFields.forEach(key=>{
    const el=els[logElementIds[key]];
    if(el) el.value=data[key]||'';
  });
}
function readLogFields(){
  return Object.fromEntries(logFields.map(key=>[key,(els[logElementIds[key]]?.value||'').trim()]));
}
function hasLogContent(data){return Object.values(data).some(v=>String(v||'').trim());}
function tileStyleFor(id){const a=getAdjust(id);return `--img-x:${a.x}%;--img-y:${a.y}%;--img-scale:${a.zoom};--img-rotate:${a.rotate}deg;`;}
function setTransformVars(el,a){
  if(!el) return;
  el.style.setProperty('--img-x', `${a.x}%`);
  el.style.setProperty('--img-y', `${a.y}%`);
  el.style.setProperty('--img-scale', a.zoom);
  el.style.setProperty('--img-rotate', `${a.rotate}deg`);
}
function setImageCoverFit(target,img,stageRatio=1){
  if(!target || !img || !img.naturalWidth || !img.naturalHeight) return;
  const imageRatio=img.naturalWidth/img.naturalHeight;
  target.style.setProperty('--img-ratio', `${img.naturalWidth} / ${img.naturalHeight}`);
  target.classList.toggle('fit-wide', imageRatio>=stageRatio);
  target.classList.toggle('fit-tall', imageRatio<stageRatio);
}
function updatePosterScale(){
  if(!els.workspace || !els.posterWrap || !els.poster) return;

  els.poster.style.setProperty('--poster-scale','1');
  els.posterWrap.style.removeProperty('width');
  els.posterWrap.style.removeProperty('height');

  const workspaceRect=els.workspace.getBoundingClientRect();
  const cs=getComputedStyle(els.workspace);
  const maxW=Math.max(1, workspaceRect.width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight));
  const maxH=Math.max(1, workspaceRect.height-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom));
  const posterW=els.poster.offsetWidth || 1120;
  const posterH=els.poster.scrollHeight || els.poster.offsetHeight || 1;
  const scale=clamp(Math.min(maxW/posterW, maxH/posterH, 1), 0.05, 1);

  els.poster.style.setProperty('--poster-scale', scale);
  els.posterWrap.style.width=`${posterW*scale}px`;
  els.posterWrap.style.height=`${posterH*scale}px`;
}
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function angleFromCenter(e, center){return Math.atan2(e.clientY-center.y, e.clientX-center.x) * 180 / Math.PI;}

function renderGrid(){
  els.grid.innerHTML='';
  const sizeMap=getTileSizeMap();
  els.grid.classList.toggle('custom-grid-on', !!state.customGrid?.enabled);
  els.grid.classList.toggle('custom-grid-free', state.customGrid?.enabled && state.customGrid.layout==='free');
  els.grid.classList.toggle('custom-grid-fit', state.customGrid?.enabled && state.customGrid.layout==='fit');
  messier.forEach(obj=>{
    const size=parseTileSize(sizeMap[obj.id]||'1x1');
    const t=document.createElement('button');
    t.className=`tile size-${size.key} ${size.key!=='1x1'?'featured-tile':''} ${photos[obj.id]?'':'empty'} ${state.typeColors?'type-colored':''} ${typeClass(obj.type)}`;
    t.dataset.id=obj.id;
    t.style.cssText=tileStyleFor(obj.id);
    t.style.gridColumn=`span ${size.w}`;
    t.style.gridRow=`span ${size.h}`;
    if(photos[obj.id]){
      const i=document.createElement('img');
      i.alt=objectLabel(obj);
      i.onload=()=>{setImageCoverFit(i,i,size.w/size.h); requestAnimationFrame(updatePosterScale);};
      i.src=photos[obj.id];
      t.appendChild(i);
    }
    const n=document.createElement('span');
    n.className='tile-number';
    n.textContent=obj.id;
    t.appendChild(n);
    t.addEventListener('click',()=>openModal(obj.id));
    els.grid.appendChild(t);
  });
  const fillers=fillerCountFor(sizeMap);
  for(let i=0;i<fillers;i++){
    const f=document.createElement('div');
    f.className=`filler-tile ${state.customGrid?.layout==='fit'?'fit-filler':'free-filler'}`;
    f.setAttribute('aria-hidden','true');
    els.grid.appendChild(f);
  }
  if(els.customGridStatus) els.customGridStatus.textContent=customGridStatus(sizeMap);
  if(selectedId) syncStageSize(selectedId);
  updateProgress();
  requestAnimationFrame(updatePosterScale);
}
function applyState(){
  normalizeState();
  ['title','footer','template','font','bg','text','accent','date'].forEach(k=>{const el=els[k+'Input']||els[k+'Select']||els[k+'Color'];if(el) el.value=state[k];});
  els.typeColors.checked=state.typeColors;
  syncCustomGridControls();
  els.posterTitle.textContent=state.title;els.posterFooter.textContent=state.footer;els.posterDateText.textContent=state.date;els.dateInput.value=state.date;
  els.poster.className=`poster template-${state.template} ${state.customGrid.enabled?'poster-custom-grid':''} custom-${state.customGrid.layout}`;
  document.documentElement.style.setProperty('--poster-bg',state.bg);document.documentElement.style.setProperty('--text',state.text);document.documentElement.style.setProperty('--accent',state.accent);document.documentElement.style.setProperty('--gap','5px');document.documentElement.style.setProperty('--poster-font',`'${state.font}', sans-serif`);
  renderGrid();
}
function updateProgress(){const c=Object.keys(photos).filter(k=>photos[k]).length;els.completedCount.textContent=c;els.progressFill.style.width=`${c/110*100}%`;const stats={Nebula:0,Cluster:0,Galaxy:0};Object.keys(photos).forEach(id=>{if(!photos[id]) return; const obj=messier.find(m=>m.id===id); if(!obj) return; if(obj.type==='Nebula') stats.Nebula++; else if(obj.type==='Galaxy') stats.Galaxy++; else if(obj.type.includes('Cluster')) stats.Cluster++;}); if(els.typeStats) els.typeStats.innerHTML=`<div>Nebula: ${stats.Nebula}</div><div>Cluster: ${stats.Cluster}</div><div>Galaxy: ${stats.Galaxy}</div>`;}

function syncStageSize(id){
  if(!els.imageStage) return;
  const tile=id ? els.grid?.querySelector(`[data-id="${id}"]`) : null;
  const rect=tile?.getBoundingClientRect();
  const width=Math.round(rect?.width || 0);
  const height=Math.round(rect?.height || 0);

  if(width>=48 && height>=48){
    const ratio = width / height;
    const stageWidth = clamp(Math.round(width * 4.5), 260, 420);
    const stageHeight = Math.round(stageWidth / ratio);
    els.imageStage.style.width=`${stageWidth}px`;
    els.imageStage.style.height=`${stageHeight}px`;
    els.imageStage.style.maxWidth='100%';
    els.imageStage.style.aspectRatio=`${width} / ${height}`;
  } else {
    els.imageStage.style.removeProperty('width');
    els.imageStage.style.removeProperty('height');
    els.imageStage.style.removeProperty('aspect-ratio');
  }
}

function openModal(id){
  selectedId=id;
  const obj=messier.find(o=>o.id===id);
  if(!obj||!els.modalTitle||!els.modalMeta||!els.stageImage||!els.modal) return;
  syncStageSize(id);
  els.modalTitle.textContent=objectLabel(obj);
  els.modalMeta.textContent=obj.type;
  pendingAdjust=getAdjust(id);
  els.transformTarget.classList.remove('fit-wide','fit-tall');
  els.stageImage.onload=()=>setImageCoverFit(els.transformTarget, els.stageImage, 1);
  els.stageImage.src=photos[id]||'';
  if(els.stageImage.complete) setImageCoverFit(els.transformTarget, els.stageImage, 1);
  setTransformVars(els.transformTarget,pendingAdjust);
  fillLogFields(id);
  populateTileSizeSelect();
  els.modal.setAttribute('aria-hidden','false');
}
const closeModal=()=>{els.modal.setAttribute('aria-hidden','true');selectedId=null;pendingAdjust=null;};
const fileToDataUrl=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f);});
function matchMessierId(filename){const clean=filename.toUpperCase().replace(/\s+/g,'');const m=clean.match(/(^|[^A-Z0-9])M\s*0*(\d{1,3})([^0-9]|$)/i)||clean.match(/^0*(\d{1,3})[^0-9]/);if(!m)return null;const n=Number(m[2]||m[1]);return n>=1&&n<=110?`M${n}`:null;}
async function setPhoto(id,data){photos[id]=data;await txDone('readwrite',s=>s.put(data,id));renderGrid();setDirty();}
async function removePhoto(id){delete photos[id];await txDone('readwrite',s=>s.delete(id));renderGrid();setDirty();}
async function exportPng(){const oldScale=els.poster.style.getPropertyValue('--poster-scale');els.poster.style.setProperty('--poster-scale','1');const canvas=await html2canvas(els.poster,{backgroundColor:state.bg,scale:2,useCORS:true});els.poster.style.setProperty('--poster-scale',oldScale||'1');updatePosterScale();const link=document.createElement('a');link.download=`messierist-${new Date().toISOString().slice(0,10)}.png`;link.href=canvas.toDataURL('image/png');link.click();}
function saveProject(){const blob=new Blob([JSON.stringify({version:3,state,photos,adjustments,logs})],{type:'application/json'});const a=document.createElement('a');a.download=`messierist-project-${new Date().toISOString().slice(0,10)}.json`;a.href=URL.createObjectURL(blob);a.click();URL.revokeObjectURL(a.href);saveState();}
async function loadProject(e){const f=e.target.files[0];if(!f)return;const d=JSON.parse(await f.text());state={...defaultState,...(d.state||{})};normalizeState();photos=d.photos||{};adjustments=d.adjustments||{};logs=d.logs||{};await txDone('readwrite',s=>s.clear());for(const [id,url] of Object.entries(photos)) await txDone('readwrite',s=>s.put(url,id));applyState();saveState();e.target.value='';}
function bindInputs(){
  [['titleInput','title'],['footerInput','footer'],['templateSelect','template'],['fontSelect','font'],['bgColor','bg'],['textColor','text'],['accentColor','accent'],['dateInput','date']].forEach(([el,key])=>{if(!els[el]) return; els[el].addEventListener('input',e=>{state[key]=e.target.value; if(key==='template'&&!validTemplates.has(state.template)) state.template='classic'; applyState();setDirty();});});
  if(els.typeColors) els.typeColors.addEventListener('change',e=>{state.typeColors=e.target.checked;applyState();setDirty();});
  if(els.customGridEnabled) els.customGridEnabled.addEventListener('change',e=>{state.customGrid.enabled=e.target.checked;applyState();setDirty();});
  if(els.customGridLayout) els.customGridLayout.addEventListener('change',e=>{state.customGrid.layout=e.target.value;applyState();setDirty();});
  if(els.highlightMode) els.highlightMode.addEventListener('change',e=>{state.customGrid.highlight=e.target.value;applyState();setDirty();});
  if(els.presetSelect) els.presetSelect.addEventListener('change',e=>{state.customGrid.preset=e.target.value;applyState();setDirty();});
  if(els.tileSizeSelect) els.tileSizeSelect.addEventListener('change',e=>{
    if(!selectedId) return;
    const size=parseTileSize(e.target.value).key;
    if(size==='1x1') delete state.customGrid.tileSizes[selectedId];
    else state.customGrid.tileSizes[selectedId]=size;
    renderGrid();
    populateTileSizeSelect();
    setDirty();
  });
  logFields.forEach(key=>{
    const el=els[logElementIds[key]];
    if(el) el.addEventListener('input',()=>setDirty());
  });
  if(els.closeModal) els.closeModal.addEventListener('click',closeModal); if(els.modal) els.modal.addEventListener('click',e=>{if(e.target===els.modal)closeModal();});

  const applyStage=()=>{
    if(!selectedId || !pendingAdjust) return;
    setTransformVars(els.transformTarget,pendingAdjust);
  };
  const changeAdjust=(patch)=>{
    if(!selectedId) return;
    pendingAdjust={...(pendingAdjust || getAdjust(selectedId)),...patch};
    applyStage();
  };
  const saveTransform=()=>{
    if(!selectedId || !pendingAdjust) return;
    adjustments[selectedId]={...pendingAdjust};
    const nextLog=readLogFields();
    if(hasLogContent(nextLog)) logs[selectedId]=nextLog;
    else delete logs[selectedId];
    renderGrid();
    setDirty();
    closeModal();
  };

  let activeTransform=null;
  const getTargetCenter=()=>{
    const r=els.transformTarget.getBoundingClientRect();
    return {x:r.left+r.width/2,y:r.top+r.height/2};
  };
  const startTransform=(mode,e)=>{
    if(!selectedId || !els.imageStage || !els.transformTarget) return;
    e.preventDefault();
    e.stopPropagation();
    const stageRect=els.imageStage.getBoundingClientRect();
    const center=getTargetCenter();
    const a=pendingAdjust || getAdjust(selectedId);
    activeTransform={
      mode,
      pointerId:e.pointerId,
      startX:e.clientX,
      startY:e.clientY,
      stageRect,
      center,
      start:a,
      startDist:Math.max(8,Math.hypot(e.clientX-center.x,e.clientY-center.y)),
      startAngle:angleFromCenter(e,center)
    };
    els.imageStage.setPointerCapture(e.pointerId);
    els.imageStage.classList.add(`is-${mode}`);
  };

  if(els.imageStage) {
    els.imageStage.addEventListener('pointerdown',e=>{
      const handle=e.target.closest('[data-handle]');
      if(handle?.dataset.handle==='resize') return startTransform('resize',e);
      if(handle?.dataset.handle==='rotate') return startTransform('rotate',e);
      if(e.target===els.stageImage || e.target===els.transformTarget) return startTransform('move',e);
    });
    els.imageStage.addEventListener('pointermove',e=>{
      if(!activeTransform || e.pointerId!==activeTransform.pointerId || !selectedId) return;
      const a=activeTransform.start;
      if(activeTransform.mode==='move'){
        const dx=(e.clientX-activeTransform.startX)/activeTransform.stageRect.width*100;
        const dy=(e.clientY-activeTransform.startY)/activeTransform.stageRect.height*100;
        changeAdjust({x:clamp(a.x+dx,-100,200), y:clamp(a.y+dy,-100,200)});
      }
      if(activeTransform.mode==='resize'){
        const dist=Math.max(8,Math.hypot(e.clientX-activeTransform.center.x,e.clientY-activeTransform.center.y));
        changeAdjust({zoom:clamp(a.zoom*(dist/activeTransform.startDist),0.25,5)});
      }
      if(activeTransform.mode==='rotate'){
        const ang=angleFromCenter(e,activeTransform.center);
        changeAdjust({rotate:a.rotate+(ang-activeTransform.startAngle)});
      }
    });
    const endTransform=e=>{
      if(!activeTransform || e.pointerId!==activeTransform.pointerId) return;
      els.imageStage.classList.remove('is-move','is-resize','is-rotate');
      activeTransform=null;
    };
    els.imageStage.addEventListener('pointerup',endTransform);
    els.imageStage.addEventListener('pointercancel',endTransform);
    els.imageStage.addEventListener('wheel',e=>{
      if(!selectedId) return;
      e.preventDefault();
      const a=pendingAdjust || getAdjust(selectedId);
      if(e.shiftKey){
        changeAdjust({rotate:a.rotate+(e.deltaY>0?3:-3)});
      } else {
        changeAdjust({zoom:clamp(a.zoom+(e.deltaY>0?-0.05:0.05),0.25,5)});
      }
    },{passive:false});
  }

  if(els.saveTransformBtn) els.saveTransformBtn.addEventListener('click',saveTransform);
  if(els.resetTransformBtn) els.resetTransformBtn.addEventListener('click',()=>{
    if(!selectedId) return;
    pendingAdjust={...defaultAdjust};
    applyStage();
  });
  els.singleUpload.addEventListener('change',async e=>{const f=e.target.files[0];if(!f||!selectedId)return;await setPhoto(selectedId,await fileToDataUrl(f));els.stageImage.src=photos[selectedId]||'';e.target.value='';});
  els.removeImageBtn.addEventListener('click',async()=>{if(selectedId) await removePhoto(selectedId); if(els.stageImage) els.stageImage.src='';});
  els.bulkUploadBtn.addEventListener('click',()=>els.bulkUploadInput.click());
  els.bulkUploadInput.addEventListener('change',async e=>{for(const f of [...e.target.files]){const id=matchMessierId(f.name);if(id) await setPhoto(id,await fileToDataUrl(f));}e.target.value='';});
  els.exportPngBtn.addEventListener('click',exportPng);els.saveProjectBtn.addEventListener('click',saveProject);els.loadProjectBtn.addEventListener('click',()=>els.loadProjectInput.click());els.loadProjectInput.addEventListener('change',loadProject);
  els.clearBtn.addEventListener('click',async()=>{
    if(dirty){
      pendingClearAll = true;
      if(els.confirmModal) els.confirmModal.setAttribute('aria-hidden','false');
      return;
    }
    state={...defaultState,customGrid:{...defaultCustomGrid}};photos={};adjustments={};logs={};localStorage.removeItem('messierist-state');await txDone('readwrite',s=>s.clear());applyState();setDirty();
  });

  if(els.confirmSaveBtn) els.confirmSaveBtn.addEventListener('click',()=>{
    saveProject();
    if(els.confirmModal) els.confirmModal.setAttribute('aria-hidden','true');
    pendingClearAll = false;
  });

  if(els.confirmCancelBtn) els.confirmCancelBtn.addEventListener('click',()=>{
    if(els.confirmModal) els.confirmModal.setAttribute('aria-hidden','true');
    pendingClearAll = false;
  });

  if(els.confirmModal) els.confirmModal.addEventListener('click',e=>{
    if(e.target===els.confirmModal){
      els.confirmModal.setAttribute('aria-hidden','true');
      pendingClearAll = false;
    }
  });
}
function initFonts(){els.fontSelect.innerHTML=systemFonts.map(f=>`<option value="${f}">${f}</option>`).join('');}

window.addEventListener('resize',()=>{
  if(selectedId) syncStageSize(selectedId);
  updatePosterScale();
});

const posterResizeObserver = 'ResizeObserver' in window ? new ResizeObserver(()=>requestAnimationFrame(updatePosterScale)) : null;

(async function init(){
  await openDb();
  loadState();
  photos=await dbGetAll();
  initFonts();
  bindInputs();
  applyState();
  if(posterResizeObserver){
    posterResizeObserver.observe(els.workspace);
    posterResizeObserver.observe(els.poster);
  }
  if(document.fonts?.ready) document.fonts.ready.then(()=>requestAnimationFrame(updatePosterScale));
  requestAnimationFrame(updatePosterScale);
})();
