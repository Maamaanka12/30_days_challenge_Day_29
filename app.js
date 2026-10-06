const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const K={s:'attendance_students_v1',r:'attendance_records_v1'};
// one-time cleanup of legacy keys from earlier versions
['rollcall_students_v1','rollcall_records_v1','rollcall_students_v2','rollcall_records_v2','rollcall_students_v3','rollcall_records_v3','rollcall_rail'].forEach(k=>{try{localStorage.removeItem(k);}catch(e){}});
let students=JSON.parse(localStorage.getItem(K.s)||'[]');
let records=JSON.parse(localStorage.getItem(K.r)||'{}');
const save=()=>{localStorage.setItem(K.s,JSON.stringify(students));localStorage.setItem(K.r,JSON.stringify(records));};
const fmt=d=>d.toISOString().slice(0,10);
const pretty=k=>new Date(k+'T12:00').toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'});
let date=fmt(new Date()),draft={...(records[date]||{})},dirty=false;
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2200);};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>fmt(new Date());
const dayRec=k=>records[k]||(k===date?draft:(k===today()?draft:{}));
// nav
const isMobile=()=>matchMedia('(max-width:760px)').matches;
const setRail=on=>{document.body.classList.toggle('rail',on);
  $('#collapseBtn').textContent=on?'>':'<';
  $('#collapseBtn').setAttribute('aria-label',on?'Expand sidebar':'Collapse sidebar');};
try{if(localStorage.getItem('attendance_rail')==='1'&&!isMobile())setRail(true);}catch(e){}
$('#collapseBtn').onclick=()=>{const on=!document.body.classList.contains('rail');setRail(on);
  try{localStorage.setItem('attendance_rail',on?'1':'0');}catch(e){}};
const setSide=open=>{document.body.classList.toggle('side-open',open);
  $('#scrim').hidden=!open;$('#menuBtn').setAttribute('aria-expanded',open);};
$('#menuBtn').onclick=()=>setSide(true);
$('#scrim').onclick=()=>setSide(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape')setSide(false);});
$$('[data-nav]').forEach(b=>b.onclick=()=>{const v=b.dataset.nav;
  if(isMobile())setSide(false);
  $$('.nav-item').forEach(n=>n.classList.toggle('active',n===b||n.dataset.nav===v));
  $$('.view').forEach(x=>x.classList.remove('active'));$('#view-'+v).classList.add('active');window.scrollTo({top:0});});
// dashboard
function renderDash(){
  const t=today(),rec=dayRec(t),vals=Object.values(rec);
  const n=k=>vals.filter(v=>v===k).length,q=students.length;
  const pct=q?Math.round((n('Present')+n('Late')*.5)/q*100):0;
  $('#sTotal').textContent=q;$('#bTotal').textContent=q;
  $('#sPresent').textContent=n('Present');$('#sAbsent').textContent=n('Absent');$('#sLate').textContent=n('Late');
  $('#sRate').textContent=pct+'%';$('#sRateBar').style.width=pct+'%';
  $('#sPresentSub').textContent=q?Math.round(n('Present')/q*100)+'% of class':'-';
  $('#sAbsentSub').textContent=vals.length?n('Absent')+' need follow-up':'not marked yet';
  $('#sLateSub').textContent=vals.length?n('Late')+' arrived late':'not marked yet';
  $('#sRateSub').textContent=Object.keys(records).length+' saved day(s) - '+pretty(t);
  $('#sideDate').textContent=pretty(t);
  $('#dashBody').innerHTML=students.map(s=>{const v=rec[s.id];
    return `<tr><td class="mono">${esc(s.id)}</td><td>${esc(s.name)}</td><td>${esc(s.cls)}</td>
    <td><span class="pill ${v||'none'}">${v||'Unmarked'}</span></td></tr>`;  }).join('')||'<tr><td colspan="4">No students yet - add your class on the Students page.</td></tr>';
}
// students
function renderStudents(){
  const q=($('#stuSearch').value||'').toLowerCase(),t=today(),rec=dayRec(t);
  const list=students.filter(s=>(s.name+s.id+s.cls).toLowerCase().includes(q));
  $('#stuCount').textContent=students.length;
  $('#stuBody').innerHTML=list.map(s=>{const v=rec[s.id];
    return `<tr><td class="mono">${esc(s.id)}</td><td>${esc(s.name)}</td><td>${esc(s.cls)}</td>
    <td><span class="pill ${v||'none'}">${v||'Unmarked'}</span></td>
    <td><button class="del" data-del="${esc(s.id)}">Remove</button></td></tr>`;  }).join('')||(students.length?'<tr><td colspan="5">No matches.</td></tr>':'<tr><td colspan="5">No students yet - use the form above to add your class.</td></tr>');
  $$('#stuBody [data-del]').forEach(b=>b.onclick=()=>{students=students.filter(s=>s.id!==b.dataset.del);
    Object.values(records).forEach(r=>delete r[b.dataset.del]);delete draft[b.dataset.del];save();renderAll();toast('Student removed');});
}
$('#stuSearch').addEventListener('input',renderStudents);
$('#addForm').addEventListener('submit',e=>{e.preventDefault();
  const name=$('#fName').value.trim(),id=$('#fRoll').value.trim().toUpperCase(),cls=$('#fClass').value.trim();
  if(!name||!id||!cls)return;
  if(students.some(s=>s.id.toLowerCase()===id.toLowerCase())){$('#formHint').textContent='That student ID already exists.';return;}
  students.push({id,name,cls});$('#formHint').textContent='';e.target.reset();save();renderAll();toast(name+' added');});
// attendance
function syncAtt(){
  $('#dateInput').value=date;
  $('#attTitle').textContent=(date===today()?"Today's register - ":"Register - ")+pretty(date);
  const q=($('#attSearch').value||'').toLowerCase();
  const list=students.filter(s=>(s.name+s.id+s.cls).toLowerCase().includes(q));
  const m=Object.keys(draft).length,c={Present:0,Absent:0,Late:0};Object.values(draft).forEach(v=>c[v]++);
  $('#attBar').style.width=(q?m/students.length*100:0)+'%';
  $('#attSummary').textContent=`${m} of ${students.length} marked - ${c.Present} present - ${c.Late} late - ${c.Absent} absent`;
  const note=$('#saveNote');note.textContent=dirty?'Unsaved changes - press Save attendance':'Saved - '+pretty(date);
  $('#attBody').innerHTML=list.map(s=>{const v=draft[s.id]||'';
    return `<tr><td class="mono">${esc(s.id)}</td><td>${esc(s.name)}</td><td>${esc(s.cls)}</td><td><div class="rowbtns">
    <button class="att ${v==='Present'?'on-P':''}" data-id="${esc(s.id)}" data-v="Present">Present</button>
    <button class="att ${v==='Absent'?'on-A':''}" data-id="${esc(s.id)}" data-v="Absent">Absent</button>
    <button class="att ${v==='Late'?'on-L':''}" data-id="${esc(s.id)}" data-v="Late">Late</button></div></td></tr>`;  }).join('')||'<tr><td colspan="4">No students yet - add them on the Students page.</td></tr>';
  $$('#attBody .att').forEach(b=>b.onclick=()=>{draft[b.dataset.id]=b.dataset.v;dirty=true;syncAtt();renderDash();renderStudents();});
}
$('#attSearch').addEventListener('input',syncAtt);
$('#dateInput').addEventListener('change',e=>{date=e.target.value||date;draft={...(records[date]||{})};dirty=false;syncAtt();});
$('#prevDay').onclick=()=>{date=fmt(new Date(new Date(date+'T12:00').getTime()-864e5));draft={...(records[date]||{})};dirty=false;syncAtt();};
$('#nextDay').onclick=()=>{date=fmt(new Date(new Date(date+'T12:00').getTime()+864e5));draft={...(records[date]||{})};dirty=false;syncAtt();};
$('#todayBtn').onclick=()=>{date=today();draft={...(records[date]||{})};dirty=false;syncAtt();};
$('#allPresent').onclick=()=>{students.forEach(s=>draft[s.id]='Present');dirty=true;syncAtt();renderDash();renderStudents();};
$('#saveBtn').onclick=()=>{if(!Object.keys(draft).length){toast('Mark at least one student first');return;}
  records[date]={...draft};dirty=false;save();renderAll();toast('Attendance saved - '+pretty(date));};
$('#csvBtn').onclick=()=>{const rows=[['Date','Student ID','Name','Class','Status']];
  Object.keys(records).sort().forEach(k=>students.forEach(s=>{if(records[k][s.id])rows.push([k,s.id,s.name,s.cls,records[k][s.id]]);}));
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n')],{type:'text/csv'}));a.download='attendance.csv';a.click();toast('CSV exported');};
function renderHist(){
  const days=Object.keys(records).sort().reverse();
  $('#histBody').innerHTML=days.map(k=>{const v=Object.values(records[k]);const n=x=>v.filter(y=>y===x).length;
    const r=v.length?Math.round((n('Present')+n('Late')*.5)/students.length*100):0;
    return `<tr><td>${pretty(k)}</td><td>${n('Present')}</td><td>${n('Late')}</td><td>${n('Absent')}</td><td><span class="rate">${r}%</span></td><td><button class="link-btn" data-open="${k}">Load</button></td></tr>`;}).join('')||'<tr><td colspan="6">No saved days yet.</td></tr>';
  $$('#histBody [data-open]').forEach(b=>b.onclick=()=>{date=b.dataset.open;draft={...(records[date]||{})};dirty=false;syncAtt();toast('Loaded '+pretty(date));});
}
// reports
function renderReports(){
  $('#repBody').innerHTML=students.map(s=>{let t=0,p=0,l=0,a=0;
    Object.values(records).forEach(r=>{if(r[s.id]){t++;if(r[s.id]==='Present')p++;else if(r[s.id]==='Late')l++;else a++;}});
    const r=t?Math.round((p+l*.5)/t*100):0;
    return `<tr><td class="mono">${esc(s.id)}</td><td>${esc(s.name)}</td><td>${t}</td><td>${p}</td><td>${a}</td><td>${l}</td><td><span class="rate">${r}%</span></td></tr>`;}).join('')||'<tr><td colspan="7">No data yet - save a day first.</td></tr>';
}
function renderAll(){renderDash();renderStudents();syncAtt();renderHist();renderReports();}
renderAll();
