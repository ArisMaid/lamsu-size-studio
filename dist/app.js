'use strict';
const example={
  "baseSize": "S",
  "care": [
    "bleach",
    "wash",
    "dry",
    "wring",
    "iron"
  ],
  "dimensions": [
    {
      "base": 64,
      "id": "waist",
      "name": "腰围",
      "step": 3
    },
    {
      "base": 94,
      "id": "hip",
      "name": "臀围",
      "step": 3
    },
    {
      "base": 60,
      "id": "thigh",
      "name": "腿围",
      "step": 1.5
    },
    {
      "base": 51,
      "id": "opening",
      "name": "脚围",
      "step": 1
    },
    {
      "base": 103,
      "id": "length",
      "name": "裤长",
      "step": 1
    }
  ],
  "footerNote": "尺码表以平铺测量为准，购买时请参考日常穿着的同类服装尺寸，请勿在身体上测量。",
  "guide": {
    "2XL": "125–135 斤左右",
    "L": "105–115 斤左右",
    "M": "95–105 斤左右",
    "S": "85–95 斤左右",
    "XL": "115–125 斤左右"
  },
  "guideHeight": "160–170 CM · 常规版",
  "measurementNote": "温馨提示：手工测量可能与实际尺寸存在 1–3 CM 误差，还请谅解。",
  "overrides": {},
  "showCare": true,
  "showGuide": true,
  "sizes": [
    "S",
    "M",
    "L",
    "XL",
    "2XL"
  ],
  "styleNo": "",
  "title": "尺码信息"
};
let state=structuredClone(example);
const M=ChartModel,$=id=>document.getElementById(id);
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>String(Math.round((n+Number.EPSILON)*100)/100);
const cellValue=(s,d)=>M.value(state,s,d),hasOverride=(s,id)=>M.hasOverride(state,s,id),automaticValue=(s,d)=>M.automatic(state,s,d);
let toastTimer,modalAction,chartHeight=1400;
function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').classList.add('visible');toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3500)}
function renderEditor(){
 $('size-chips').innerHTML=state.sizes.map(s=>`<span class="size-chip ${s===state.baseSize?'active':''}">${esc(s)}</span>`).join('');
 $('base-size').innerHTML=state.sizes.map(s=>`<option ${s===state.baseSize?'selected':''}>${esc(s)}</option>`).join('');$('base-column-title').textContent=`${state.baseSize} 码尺寸`;
 $('rules-body').innerHTML=state.dimensions.map(d=>`<tr><td><button class="dimension-name" data-rename="${d.id}" title="点击修改名称" aria-label="重命名${esc(d.name)}">${esc(d.name)}</button></td><td><input class="rule-input" type="number" min="0" max="9999" step="0.01" value="${d.base}" data-base="${d.id}" aria-label="${esc(d.name)}基准尺寸"></td><td class="step-field"><span>+</span><input class="rule-input" type="number" min="0" max="999" step="0.01" value="${d.step}" data-step="${d.id}" aria-label="${esc(d.name)}每码递增"></td><td><button class="remove-dimension" data-remove="${d.id}" aria-label="移除${esc(d.name)}" title="移除${esc(d.name)}">×</button></td></tr>`).join('');
 $('style-no').value=state.styleNo;$('chart-title').value=state.title;renderData();renderExtras();
}
function renderData(){
 $('data-table-wrap').innerHTML=`<table class="data-table" style="min-width:${Math.max(490,62+state.dimensions.length*78)}px"><thead><tr><th>尺码</th>${state.dimensions.map(d=>`<th>${esc(d.name)}</th>`).join('')}</tr></thead><tbody>${state.sizes.map(s=>`<tr class="${s===state.baseSize?'base-row':''}"><td title="${s===state.baseSize?'基准码位置：单独编辑只修改此格':'直接编辑尺寸可保留此值'}">${esc(s)}${s===state.baseSize?'<i class="base-mark"></i>':''}</td>${state.dimensions.map(d=>`<td class="${hasOverride(s,d.id)?'manual':''}"><input class="cell-input" type="number" min="0" max="9999" step="0.01" value="${fmt(cellValue(s,d))}" data-size="${esc(s)}" data-dim="${d.id}" aria-label="${esc(s)}码${esc(d.name)}" title="${hasOverride(s,d.id)?'手动保留的尺寸':'自动计算：修改后将手动保留'}">${hasOverride(s,d.id)?revertButton(s,d):''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;updateCounts();
}
function revertButton(s,d){return `<button class="revert-cell" data-revert-size="${esc(s)}" data-revert-dim="${d.id}" aria-label="${esc(s)}码${esc(d.name)}恢复自动" title="恢复自动：${fmt(automaticValue(s,d))} cm">↶</button>`}
function updateCounts(){const count=Object.keys(state.overrides).length;$('override-count').textContent=`${count} 个手动值`;$('reset-overrides').disabled=count===0}
const careSymbols={
 bleach:{label:'不可漂白',path:'<path d="M-24 21 0-22 24 21Z M-27-24l54 49M27-24l-54 49"/>'},
 wash:{label:'30°C 水洗',path:'<path d="m-27-20 9 41h36l9-41M-23-9q6 7 12 0t12 0t12 0t12 0"/><text x="0" y="13" text-anchor="middle" font-size="18" stroke="none" fill="#777">30°</text>'},
 dry:{label:'悬挂晾干',path:'<path d="M-22-23h44v46h-44Z M0-23v38"/>'},
 wring:{label:'不可拧绞',path:'<path d="m-26-7 10-7h32l10 7v13l-10 7h-32l-10-7Z M-15-13l30 26M15-13l-30 26M-29-25l58 50M29-25l-58 50"/>'},
 iron:{label:'低温熨烫',path:'<path d="M-27 18q7-25 31-25h13l7 25Z M-6-17h22l8 35"/><circle cx="1" cy="6" r="2" fill="#777" stroke="none"/>'}
};
function renderExtras(){
 $('show-guide').checked=state.showGuide;$('show-care').checked=state.showCare;$('guide-height').value=state.guideHeight;$('measurement-note').value=state.measurementNote;$('footer-note').value=state.footerNote;
 $('guide-inputs').innerHTML=state.sizes.map(s=>`<label class="guide-input-row"><span>${esc(s)}</span><input maxlength="100" data-guide="${esc(s)}" value="${esc(state.guide[s]||'')}" placeholder="填写体重 / 腰围参考" aria-label="${esc(s)}码选码参考"></label>`).join('');
 $('care-options').innerHTML=Object.entries(careSymbols).map(([id,item])=>`<label><input type="checkbox" data-care="${id}" ${state.care.includes(id)?'checked':''}>${item.label}</label>`).join('');updateExtrasVisibility();
}
function updateExtrasVisibility(){document.querySelector('.guide-field').classList.toggle('hidden',!state.showGuide);$('guide-inputs').classList.toggle('hidden',!state.showGuide);document.querySelector('.field-note').classList.toggle('hidden',!state.showGuide);$('care-options').classList.toggle('hidden',!state.showCare)}
const measureCanvas=document.createElement('canvas'),measure=measureCanvas.getContext('2d');
function lines(text,size,maxWidth){measure.font=`${size}px Arial,"PingFang SC","Microsoft YaHei",sans-serif`;const result=[];for(const paragraph of String(text).split('\n')){let line='';for(const char of paragraph){if(line&&measure.measureText(line+char).width>maxWidth){result.push(line);line=char}else line+=char}result.push(line)}return result}
function textBlock(text,x,y,size,maxWidth,anchor='start',color='#555',extra=''){const wrapped=lines(text,size,maxWidth),lineHeight=size*1.6;return {svg:wrapped.map((line,i)=>`<text x="${x}" y="${y+i*lineHeight}" text-anchor="${anchor}" font-size="${size}" fill="${color}" ${extra}>${esc(line)}</text>`).join(''),height:wrapped.length*lineHeight}}
function renderPreview(){
 const x=80,w=920,rowHeight=55,head=228,cols=state.dimensions.length+1,sizeWidth=cols>7?82:118,colWidth=(w-sizeWidth)/(cols-1);
 const styleLabel=`款号：${state.styleNo||'____________'}`,styleFont=Math.min(36,900/Math.max(1,Array.from(styleLabel).length));
 let body=`<text x="540" y="107" text-anchor="middle" font-size="${styleFont}" fill="#222">${esc(styleLabel)}</text><text x="540" y="165" text-anchor="middle" font-size="${Math.min(30,900/Math.max(1,Array.from(state.title||'尺码信息').length))}">${esc(state.title||'尺码信息')}</text><path d="M524 183h32" stroke="#252525" stroke-width="2"/>`;
 body+=`<text x="1000" y="209" text-anchor="end" font-family="Arial,sans-serif" font-size="24" font-weight="700" letter-spacing="4">LAMSU</text><text x="80" y="209" fill="#777" font-size="18">单位：CM</text><rect x="${x}" y="${head}" width="${w}" height="${rowHeight}" fill="#444"/>`;
 const headers=['尺码',...state.dimensions.map(d=>d.name)],centers=headers.map((_,i)=>i===0?x+sizeWidth/2:x+sizeWidth+colWidth*(i-.5));
 headers.forEach((h,i)=>{const font=i===0?24:Math.min(25,Math.floor((colWidth-12)/Math.max(2,h.length)));body+=`<text x="${centers[i]}" y="${head+36}" text-anchor="middle" fill="white" font-size="${font}">${esc(h)}</text>`});
 state.sizes.forEach((s,r)=>{const y=head+rowHeight*(r+1);[s,...state.dimensions.map(d=>fmt(cellValue(s,d)))].forEach((v,i)=>{const font=i===0?Math.min(24,Math.floor((sizeWidth-12)/Math.max(2,v.length)*1.6)):Math.min(24,colWidth/3.7);body+=`<text x="${centers[i]}" y="${y+36}" text-anchor="middle" font-size="${font}" fill="#444">${esc(v)}</text>`});body+=`<path d="M${x} ${y}h${w}" stroke="#242424" stroke-width="1.5"/>`});
 for(let i=1;i<cols;i++)body+=`<path d="M${x+sizeWidth+(i-1)*colWidth} ${head}v${rowHeight*(state.sizes.length+1)}" stroke="#222" stroke-width="2"/>`;
 body+=`<rect x="${x}" y="${head}" width="${w}" height="${rowHeight*(state.sizes.length+1)}" fill="none" stroke="#222" stroke-width="3"/>`;
 let y=head+rowHeight*(state.sizes.length+1)+62;
 if(state.measurementNote.trim()){const note=textBlock(state.measurementNote,540,y,20,900,'middle');body+=note.svg;y+=note.height+24}
 if(state.showCare&&state.care.length){const gap=w/state.care.length;body+=`<rect x="80" y="${y}" width="920" height="126" fill="#fafafa"/>`;state.care.forEach((id,i)=>{const center=x+gap*(i+.5);if(i)body+=`<path d="M${x+gap*i} ${y+20}v80" stroke="#aaa" stroke-width="1.5"/>`;body+=`<g transform="translate(${center},${y+49})" fill="none" stroke="#777" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round">${careSymbols[id].path}</g><text x="${center}" y="${y+105}" text-anchor="middle" font-size="18" fill="#777">${careSymbols[id].label}</text>`});y+=174}else y+=16;
 if(state.showGuide){
  body+=`<rect x="349" y="${y-24}" width="137" height="29" fill="#111"/><text x="417" y="${y-2}" text-anchor="middle" fill="white" font-size="20">快速选码</text><text x="507" y="${y-2}" font-size="22" letter-spacing="1">CHOOSE CODE</text>`;y+=44;
  const guideTop=y,guideLeft=510;const heightLines=lines(state.guideHeight||'填写适用身高',27,w-guideLeft-26),headerHeight=Math.max(88,heightLines.length*36+22);
  body+=`<rect x="80" y="${y}" width="920" height="${headerHeight}" fill="#ddd"/><path d="M80 ${y}l${guideLeft} ${headerHeight}" stroke="#111" stroke-width="3"/><text x="${x+guideLeft-88}" y="${y+28}" text-anchor="middle" font-size="23">身高（CM）</text><text x="${x+guideLeft/2}" y="${y+headerHeight-12}" text-anchor="middle" font-size="23">体重（斤）/ 腰围</text>`;
  body+=heightLines.map((line,i)=>`<text x="${x+guideLeft+(w-guideLeft)/2}" y="${y+(heightLines.length>1?34:55)+i*36}" text-anchor="middle" font-size="27">${esc(line)}</text>`).join('');y+=headerHeight;
  state.sizes.forEach(s=>{const value=state.guide[s]||'—',wrapped=lines(value,23,guideLeft-34),height=Math.max(72,wrapped.length*34+24);body+=`<path d="M80 ${y}h920" stroke="#111" stroke-width="1.5"/>`;body+=wrapped.map((line,i)=>`<text x="${x+guideLeft/2}" y="${y+(height-wrapped.length*34)/2+27+i*34}" text-anchor="middle" font-size="23">${esc(line)}</text>`).join('');body+=`<text x="${x+guideLeft+(w-guideLeft)/2}" y="${y+height/2+12}" text-anchor="middle" font-size="34">${esc(s)}</text>`;y+=height});
  body+=`<path d="M${x+guideLeft} ${guideTop}v${y-guideTop}" stroke="#111" stroke-width="2.5"/><rect x="80" y="${guideTop}" width="920" height="${y-guideTop}" fill="none" stroke="#111" stroke-width="3"/>`;y+=80;
 }else y+=24;
 if(state.footerNote.trim()){body+=`<path d="M80 ${y}h920" stroke="#777" stroke-dasharray="3 3"/><text x="80" y="${y+56}" font-size="28" font-style="italic">TIPS:</text>`;const foot=textBlock(state.footerNote,190,y+51,19,804);body+=foot.svg;y+=Math.max(70,foot.height+36)}
 chartHeight=Math.ceil(y+55);const invalid=M.invalidCells(state);
 $('preview').innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${chartHeight}" viewBox="0 0 1080 ${chartHeight}" role="img" aria-label="LAMSU 尺寸表预览" style="font-family:Arial,'PingFang SC','Microsoft YaHei',sans-serif"><rect width="1080" height="${chartHeight}" fill="white"/>${body}</svg>${invalid.length?`<div class="preview-error">${esc(invalid.join('、'))}超出有效范围，请修改基准尺寸或递增值。</div>`:''}`;
 $('export-btn').disabled=invalid.length>0||document.querySelector('input[aria-invalid="true"]')!==null;$('print-btn').disabled=$('export-btn').disabled;
}
function openModal(title,html,action,confirm='确定'){$('modal-title').textContent=title;$('modal-body').innerHTML=html;$('modal-error').textContent='';$('confirm-modal').textContent=confirm;modalAction=action;$('modal').showModal()}
function closeModal(){$('modal').close();modalAction=null}
$('close-modal').addEventListener('click',closeModal);$('cancel-modal').addEventListener('click',closeModal);
$('modal').addEventListener('click',e=>{if(e.target===$('modal')){const r=$('modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal()}});
$('modal-form').addEventListener('submit',e=>{e.preventDefault();try{modalAction?.();closeModal()}catch(error){$('modal-error').textContent=error.message}});
$('manage-sizes').addEventListener('click',()=>openModal('自定义尺码',`<label class="field"><span>按从小到大排序，用逗号或空格分隔</span><input id="sizes-input" value="${esc(state.sizes.join(', '))}" maxlength="240" required></label><p class="modal-copy">支持 S、M、L，也支持 26、27 等数字码。顺序决定递增方向。移除尺码时，该码的手动尺寸也会移除。</p>`,()=>{M.setSizes(state,$('sizes-input').value);renderEditor();renderPreview();toast('尺码范围已更新')}));
$('add-dimension').addEventListener('click',()=>openModal('添加尺寸维度',`<div class="modal-fields"><label class="field"><span>尺寸名称</span><input id="dimension-name" placeholder="例如：胸围、肩宽、袖长" maxlength="12" required></label><div class="split"><label class="field"><span>${esc(state.baseSize)} 码尺寸（cm）</span><input id="dimension-base" type="number" min="0" max="9999" step="0.01" value="60" required></label><label class="field"><span>每码递增（cm）</span><input id="dimension-step" type="number" min="0" max="999" step="0.01" value="2" required></label></div></div>`,()=>{M.addDimension(state,$('dimension-name').value,$('dimension-base').value,$('dimension-step').value);renderEditor();renderPreview();toast('已添加尺寸维度')}));
$('rules-body').addEventListener('click',e=>{
 const remove=e.target.closest('[data-remove]'),rename=e.target.closest('[data-rename]');
 if(remove){const d=state.dimensions.find(d=>d.id===remove.dataset.remove);openModal('移除尺寸维度',`<p class="modal-copy">移除「${esc(d.name)}」及这一列的手动尺寸？</p>`,()=>{M.removeDimension(state,d.id);renderEditor();renderPreview()},'移除')}
 if(rename){const d=state.dimensions.find(d=>d.id===rename.dataset.rename);openModal('修改尺寸名称',`<label class="field"><span>尺寸名称</span><input id="rename-input" value="${esc(d.name)}" maxlength="12" required></label>`,()=>{const name=$('rename-input').value.trim();if(!name)throw new Error('请输入尺寸名称。');if(state.dimensions.some(item=>item.id!==d.id&&item.name===name))throw new Error('该名称已存在。');d.name=name;renderEditor();renderPreview()})}
});
$('rules-body').addEventListener('input',e=>{const input=e.target;if(!input.matches('[data-base],[data-step]'))return;try{M.setRule(state,input.dataset.base||input.dataset.step,input.dataset.base?'base':'step',input.value);input.removeAttribute('aria-invalid');input.setCustomValidity('');renderData();renderPreview()}catch(error){input.setAttribute('aria-invalid','true');input.setCustomValidity(error.message);$('export-btn').disabled=true;$('print-btn').disabled=true}});
$('rules-body').addEventListener('change',e=>{if(e.target.getAttribute('aria-invalid')==='true')e.target.reportValidity()});
$('base-size').addEventListener('change',e=>{try{M.setBaseSize(state,e.target.value);renderEditor();renderPreview();toast(`已以 ${state.baseSize} 码现有尺寸作为基准，其余手动值保留`)}catch(error){e.target.value=state.baseSize;toast(error.message)}});
$('data-table-wrap').addEventListener('input',e=>{
 const input=e.target;if(!input.matches('[data-size]'))return;
 try{const size=input.dataset.size,id=input.dataset.dim;M.setCell(state,size,id,input.value);input.removeAttribute('aria-invalid');input.setCustomValidity('');
  const td=input.closest('td'),d=state.dimensions.find(d=>d.id===id);td.classList.add('manual');if(!td.querySelector('.revert-cell'))td.insertAdjacentHTML('beforeend',revertButton(size,d));
  updateCounts();renderPreview();
 }catch(error){input.setAttribute('aria-invalid','true');input.setCustomValidity(error.message);$('export-btn').disabled=true;$('print-btn').disabled=true}
});
$('data-table-wrap').addEventListener('change',e=>{if(e.target.getAttribute('aria-invalid')==='true')e.target.reportValidity()});
$('data-table-wrap').addEventListener('click',e=>{const b=e.target.closest('[data-revert-size]');if(!b)return;M.restoreCell(state,b.dataset.revertSize,b.dataset.revertDim);renderData();renderPreview();toast('该尺寸已恢复跟随递增规则')});
$('reset-overrides').addEventListener('click',()=>{const count=Object.keys(state.overrides).length;if(!count)return;openModal('恢复全部自动',`<p class="modal-copy">将 ${count} 个手动尺寸恢复为当前规则计算的数值。基准尺寸和递增设置会保留。</p>`,()=>{state.overrides={};renderData();renderPreview();toast('所有尺寸已恢复自动计算')},'恢复自动')});
$('example-btn').addEventListener('click',()=>openModal('恢复默认数据','<p class="modal-copy">恢复默认尺寸、选码参考与说明文字，将替换当前编辑内容。</p>',()=>{state=structuredClone(example);renderEditor();renderPreview();toast('默认数据已恢复')},'恢复'));
for(const [id,prop] of [['style-no','styleNo'],['chart-title','title'],['guide-height','guideHeight'],['measurement-note','measurementNote'],['footer-note','footerNote']])$(id).addEventListener('input',e=>{state[prop]=e.target.value;renderPreview()});
for(const [id,prop] of [['show-guide','showGuide'],['show-care','showCare']])$(id).addEventListener('change',e=>{state[prop]=e.target.checked;updateExtrasVisibility();renderPreview()});
$('guide-inputs').addEventListener('input',e=>{if(e.target.matches('[data-guide]')){state.guide[e.target.dataset.guide]=e.target.value;renderPreview()}});
$('care-options').addEventListener('change',e=>{if(e.target.matches('[data-care]')){state.care=Object.keys(careSymbols).filter(id=>document.querySelector(`[data-care="${id}"]`).checked);renderPreview()}});
async function exportImage(){
 if($('export-btn').disabled)return;$('export-btn').disabled=true;let url;
 try{await document.fonts.ready;const source=new XMLSerializer().serializeToString($('preview').querySelector('svg'));url=URL.createObjectURL(new Blob([source],{type:'image/svg+xml;charset=utf-8'}));const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('图片渲染失败，请重试。'));img.src=url});const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=chartHeight;const context=canvas.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,1080,chartHeight);context.drawImage(img,0,0,1080,chartHeight);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('图片生成失败。');const download=URL.createObjectURL(blob),a=document.createElement('a');a.href=download;a.download=`LAMSU_${(state.styleNo.trim()||'尺寸表').replace(/[\\/:*?"<>|]/g,'_')}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(download),10000);toast('高清 PNG 图片已导出')}catch(error){toast(error.message||'导出失败，请重试。')}finally{if(url)URL.revokeObjectURL(url);renderPreview()}
}
$('export-btn').addEventListener('click',exportImage);$('print-btn').addEventListener('click',()=>{if(!$('print-btn').disabled)window.print()});
renderEditor();renderPreview();
if(document.modelContext?.registerTool){
 const controller=new AbortController();
 const registrations=[
  {name:'read_size_chart',title:'读取尺寸表',description:'Read current dimensions, baseline, sizes and manual cells without changing the chart.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute:()=>M.read(state)},
  {name:'configure_size_chart',title:'设置尺寸与递增',description:'Update baseline values, increments or individual cells atomically. Manual cells stay fixed when rules change.',inputSchema:{type:'object',properties:{rules:{type:'array',items:{type:'object',properties:{dimensionId:{type:'string'},base:{type:'number',minimum:0,maximum:9999},step:{type:'number',minimum:0,maximum:999}},required:['dimensionId'],additionalProperties:false}},cells:{type:'array',items:{type:'object',properties:{size:{type:'string'},dimensionId:{type:'string'},value:{type:'number',minimum:0,maximum:9999}},required:['size','dimensionId','value'],additionalProperties:false}}},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute:input=>{if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['rules','cells'].includes(k)))throw new Error('无效的参数。');const next=structuredClone(state);for(const r of input.rules??[]){if(!r||typeof r.dimensionId!=='string'||Object.keys(r).some(k=>!['dimensionId','base','step'].includes(k)))throw new Error('无效的递增规则。');for(const p of ['base','step'])if(Object.hasOwn(r,p)){if(typeof r[p]!=='number')throw new Error('尺寸需为数值。');M.setRule(next,r.dimensionId,p,r[p])}}for(const c of input.cells??[]){if(!c||typeof c.value!=='number'||Object.keys(c).some(k=>!['size','dimensionId','value'].includes(k)))throw new Error('无效的单格尺寸。');M.setCell(next,c.size,c.dimensionId,c.value)}if(M.invalidCells(next).length)throw new Error('自动计算尺寸超出有效范围。');state=next;renderEditor();renderPreview();return M.read(state)}}
 ];
 for(const tool of registrations){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:controller.signal})).catch(()=>{})}catch{}}
 window.addEventListener('pagehide',()=>controller.abort(),{once:true});
}
