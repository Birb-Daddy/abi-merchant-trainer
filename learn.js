(function(){
const D=window.QUIZ_DATA,AN=window.ANCHORS,NOTES=window.ANCHOR_NOTES||{},$=id=>document.getElementById(id),byId={};D.items.forEach(i=>byId[i.id]=i);
const SIDS=Object.keys(D.sounds).sort((a,b)=>a-b);
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const allScreens=['modesel','menu','imenu','quiz','iquiz','lmenu','lstudy','ldrill','lweak','done'];const show=ids=>allScreens.forEach(x=>$(x).hidden=!ids.includes(x));
let audio=new Audio();function play(names){let i=0;const go=()=>{if(i>=names.length)return;audio.src='audio/'+names[i++]+'.ogg';audio.onended=()=>setTimeout(go,250);audio.play().catch(()=>{})};go()}
const snd=s=>D.sounds[s];
function pool(){const p=$('lpool').value;return p==='ALL'?D.items:D.sets[D.combos[p]].map(id=>byId[id])}
function family(s,items){return items.filter(i=>String(i.s)===String(s)).sort((a,b)=>b.p-a.p)}
const li=i=>'<li class="r-'+i.r+'">'+i.n+' <small>('+i.z+', ~'+i.p.toLocaleString()+')</small></li>';
// menu
$('mLearn').onclick=()=>window.__mode('l');
$('lpool').innerHTML='<option value="ALL">All merchant items</option>'+Object.keys(D.combos).sort().map(c=>'<option>'+c+'</option>').join('');
let stage=1,count=-1;const picked=new Set(SIDS);
const RAR=['Mythic','Legendary','Epic','Rare','Common'].filter(r=>D.items.some(i=>i.r===r)),pickedR=new Set(RAR);
$('lrar').innerHTML=RAR.map(r=>'<label class="r-'+r+'"><input type="checkbox" data-r="'+r+'" checked>'+r+' <small>('+D.items.filter(i=>i.r===r).length+')</small></label>').join('');
document.querySelectorAll('#lrar input').forEach(c=>c.onchange=()=>{c.checked?pickedR.add(c.dataset.r):pickedR.delete(c.dataset.r);upd()});
$('lst1').onclick=()=>{stage=1;$('lst1').classList.add('sel');$('lst2').classList.remove('sel');upd()};
$('lst2').onclick=()=>{stage=2;$('lst2').classList.add('sel');$('lst1').classList.remove('sel');upd()};
$('lchecks').innerHTML=SIDS.map(s=>'<label><input type="checkbox" data-s="'+s+'" checked>'+s+' · '+AN[s]+'</label>').join('');
const syncChecks=()=>document.querySelectorAll('#lchecks input').forEach(c=>c.checked=picked.has(c.dataset.s));
document.querySelectorAll('#lchecks input').forEach(c=>c.onchange=()=>{c.checked?picked.add(c.dataset.s):picked.delete(c.dataset.s);upd()});
const batchList=[];for(let b=0;b<SIDS.length;b+=5)batchList.push(['Batch '+(b/5+1)+' ('+SIDS[b]+'–'+SIDS[Math.min(b+4,SIDS.length-1)]+')',SIDS.slice(b,b+5)]);
const selB=new Set();const bBtns=[];
function applyBatches(){picked.clear();selB.forEach(k=>batchList[k][1].forEach(s=>picked.add(s)));bBtns.forEach((b,k)=>b.classList.toggle('sel',selB.has(k)));syncChecks();upd()}
[['All',SIDS],['None',[]]].forEach(([t,ss])=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>{selB.clear();if(t==='All')batchList.forEach((_,k)=>selB.add(k));applyBatches()};$('lbatches').appendChild(b)});
batchList.forEach(([t],k)=>{const b=document.createElement('button');b.textContent=t;b.className='sel';b.onclick=()=>{selB.has(k)?selB.delete(k):selB.add(k);applyBatches()};bBtns.push(b);selB.add(k);$('lbatches').appendChild(b)});
[['Adaptive',-1],['Mastery',-2],['10',10],['20',20],['Endless',0]].forEach(([t,n])=>{const b=document.createElement('button');b.textContent=t;b.dataset.n=n;if(n===-1){b.className='sel';b.title='Every selected card must be answered correctly once; misses come back later.'}if(n===-2){b.id='lmastBtn';b.title='Stage 1 only: hear each sound once and type its anchor. No second chances.'}b.onclick=()=>{count=n;document.querySelectorAll('#lcounts button').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');upd()};$('lcounts').appendChild(b)});
$('lpool').onchange=upd;
function usable(){return stage===1?[...picked]:pool().filter(i=>pickedR.has(i.r)).map(i=>i.id)}
function upd(){if(stage===2&&count===-2){count=-1;document.querySelectorAll('#lcounts button').forEach(x=>x.classList.toggle('sel',x.dataset.n==='-1'))}$('lmastBtn').hidden=stage!==1;const u=usable();$('ls1sel').hidden=stage!==1;$('ls2sel').hidden=stage!==2;$('linfo').textContent=stage===1?u.length+' sound(s) selected.'+(u.length<2?' Pick at least 2 for Stage 1.':''):u.length+' item(s) selected.';$('lstart').disabled=!(count!==null&&u.length>=(stage===1?2:1))}
upd();
// study
$('lstudyBtn').onclick=()=>{const it=pool();$('lstudyTitle').textContent='Study · '+($('lpool').value==='ALL'?'All merchant items':$('lpool').value);
 $('lstudyList').innerHTML=SIDS.map(s=>{const f=family(s,it),nm=snd(s).drop.replace(/^(Item_|Prop_Acc_|Item_Misc_)/,'').replace(/_?Down$|_Do$/,'');
  return '<div class="snd"><h3>'+s+' · '+AN[s]+' <small>'+nm+' · '+f.length+' item(s)</small></h3><div class="row"><button data-p="'+snd(s).pickup+'">▶ Pick up</button></div>'+
  (NOTES[s]?'<div class="note">'+NOTES[s]+'</div>':'')+(f.length?'<ul>'+f.map(li).join('')+'</ul>':'<p class="hint">No items with this sound on this map.</p>')+'</div>'}).join('');
 $('lstudyList').querySelectorAll('button').forEach(b=>b.onclick=()=>b.dataset.b?play([snd(b.dataset.b).pickup]):play([b.dataset.p]));show(['lstudy'])};
$('lstudyBack').onclick=()=>{show(['modesel','lmenu'])};
// drills
let st;
function neighborsFirst(s,cands){const all=(D.neighbors[s]||[]).filter(x=>cands.includes(x)),nb=shuf(all.slice(0,6)).concat(all.slice(6));return nb.concat(shuf(cands.filter(x=>!nb.includes(x)&&x!==s)))}
function makeQ1(s,set){// distractors: confusable sounds within selected set first, then confusable from all, then random
 const o=[s];for(const x of neighborsFirst(s,set).concat(neighborsFirst(s,SIDS))){if(o.length>=5)break;if(!o.includes(x)&&AN[x]!==AN[s])o.push(x)}return {s,opts:shuf(o)}}
function makeQ2(s,items){const fam=family(s,items),m=Math.min(5,fam.length);const k=(m===0||Math.random()<.07)?0:1+Math.floor(Math.random()*m);
 const correct=shuf(fam).slice(0,k),used=new Set(correct.map(i=>i.id)),opts=correct.slice(),N=6;
 const nb=(D.neighbors[s]||[]);const cats=new Set(fam.map(i=>i.c));
 const tiers=[items.filter(i=>nb.slice(0,4).includes(String(i.s))),items.filter(i=>cats.has(i.c)&&String(i.s)!==String(s)),items.filter(i=>nb.includes(String(i.s))),items.filter(i=>String(i.s)!==String(s))];
 for(const t of tiers){for(const i of shuf(t)){if(opts.length>=N)break;if(!used.has(i.id)&&String(i.s)!==String(s)){opts.push(i);used.add(i.id)}}if(opts.length>=N)break}
 return {s,fam,opts:shuf(opts)}}
const CONF={"1": ["21", "25"], "21": ["1", "25", "16"], "7": ["11"], "11": ["7", "16", "25"], "25": ["21", "1", "17", "11"], "20": ["36"], "36": ["20"], "16": ["11", "21"], "35": ["37"], "37": ["35"], "3": ["6"], "6": ["3"], "17": ["25", "13"], "13": ["17"]};// easy-to-confuse pairs from anchors.json
function simFirst(s,cands){const c=shuf((CONF[s]||[]).filter(x=>cands.includes(x)));return c.concat(neighborsFirst(s,cands).filter(x=>!c.includes(x)))}
function makeQ2i(id,cands){const it=byId[id],s=String(it.s),o=[s];for(const x of simFirst(s,cands)){if(o.length>=6)break;if(!o.includes(x)&&AN[x]!==AN[s])o.push(x)}
 if(cands!==SIDS&&o.length<2)for(const x of (CONF[s]||[]).concat(D.neighbors[s]||[])){if(o.length>=2)break;if(!o.includes(x)&&AN[x]!==AN[s]){o.push(x);st.topups=(st.topups||0)+1}}return {s,id,opts:shuf(o)}}
window.__learn={makeQ2i,makeQ1,makeQ2,family,neighborsFirst};
function pickSound(){if(st.mastery)return st.queue.shift();const c=st.set.filter(x=>!st.recent.includes(x));const s=c[Math.random()*c.length|0];st.recent.push(s);while(st.recent.length>Math.min(3,st.set.length-1))st.recent.shift();return s}
$('lstart').onclick=()=>{st={stage,set:usable(),items:pool(),mastery:count<0,typed:count===-2,t0:Date.now(),n:count<0?0:count,i:0,right:0,opt:0,optTot:0,recent:[],ans:false};if(st.mastery){st.queue=shuf(st.set);st.total=st.set.length;st.mastered=0;st.misses={}}show(['ldrill']);next()};
function setPlay(s){const x=snd(s);$('lpd').onclick=()=>play([x.drop]);$('lpp').onclick=()=>play([x.pickup]);$('lpb').onclick=()=>play([x.pickup])}
function next(){if(st.n&&st.i>=st.n)return finish();if(st.mastery&&!st.queue.length)return finish();let s=pickSound();st.cur=s;if(st.both){st.stage=+s[0];s=s.slice(2)}let iid=null;if(st.stage===2){iid=s;s=String(byId[iid].s)}st.i++;st.ans=false;setPlay(s);$('lreveal').hidden=true;$('lnext').hidden=true;
 $('lwhere').textContent=(st.weak?'Weak Spots · ':'')+'Stage '+st.stage+' · Q'+st.i+(st.n?'/'+st.n:'')+(st.mastery?' · '+prog():'');sc();$('lopts').innerHTML='';
$('ltypewrap').hidden=!st.typed;$('lpp').textContent=st.typed?'↻ Replay sound':'▶ Pick up';$('lopts').hidden=!!st.typed;
 if(st.typed){st.q={s};$('lprompt').textContent='Type the anchor for this sound:';$('lq').textContent='🔊';$('lplayrow').hidden=false;$('lsubmit').hidden=true;$('ltype').value='';$('ltype').disabled=false;sugUpd();$('ltype').focus();play([snd(s).pickup])}
 else if(st.stage===1){st.q=st.weak?makeQ1w(s):makeQ1(s,st.set);$('lprompt').textContent='Which anchor is this sound?';$('lq').textContent='🔊';$('lplayrow').hidden=false;$('lsubmit').hidden=true;
  st.q.opts.forEach(x=>{const b=document.createElement('button');b.className='opt';b.textContent=AN[x];b.dataset.s=x;b.onclick=()=>ans1(b);$('lopts').appendChild(b)});play([snd(s).pickup])}
 else{st.q=makeQ2i(iid,st.weak?st.wset:SIDS);const it=byId[iid];$('lprompt').textContent='Which sound does this item make?';$('lq').innerHTML='<span class="r-'+it.r+'">'+it.n+'</span> <small>('+it.z+', '+it.r+')</small>';$('lplayrow').hidden=true;$('lsubmit').hidden=true;
  st.q.opts.forEach(x=>{const w=document.createElement('div');w.className='optw';const b=document.createElement('button');b.className='opt';b.textContent=AN[x];b.dataset.s=x;b.onclick=()=>ans1(b);const p=document.createElement('button');p.className='prev';p.textContent='▶';p.title='Preview this sound (does not answer)';p.setAttribute('aria-label','Preview sound of '+AN[x]);p.onclick=e=>{e.stopPropagation();e.preventDefault();play([snd(x).pickup])};w.append(b,p);$('lopts').appendChild(w)})}}
function record(s,ok){WS.rec(s,ok);if(!st.mastery)return;s=st.cur;if(st.typed){if(ok)st.mastered++;else st.misses[s]=1;return}if(ok)st.mastered++;else{st.misses[s]=(st.misses[s]||0)+1;const L=st.queue.length,min=Math.min(2,L);const pos=min+Math.floor(Math.random()*(L-min+1));st.queue.splice(pos,0,s)}
 $('lwhere').textContent=(st.weak?'Weak Spots · ':'')+'Stage '+st.stage+' · Q'+st.i+' · '+prog()}
const prog=()=>st.typed?'Mastery · '+st.mastered+' right, '+(st.total-st.mastered-Object.keys(st.misses).length)+' left':'Learned '+st.mastered+'/'+st.total+', '+(st.total-st.mastered)+' left';
window.__lstate=()=>st;
// Mastery (typed) combobox
const ANL=[...new Set(SIDS.map(s=>AN[s]))].sort((a,b)=>a.localeCompare(b)),norm=t=>t.toLowerCase().replace(/\s+/g,' ').trim();let sugs=[],hi=-1;
function sugUpd(){const t=norm($('ltype').value);sugs=t?ANL.filter(a=>{const n=norm(a);return n.startsWith(t)||n.split(/[\s\-(]+/).some(w=>w.startsWith(t))}):[];if(sugs.length===1&&norm(sugs[0])===t)sugs=[];hi=sugs.length?0:-1;
 $('lsug').innerHTML=sugs.map((a,k)=>'<li role="option" data-k="'+k+'"'+(k===hi?' class="hi" aria-selected="true"':'')+'>'+a+'</li>').join('');$('lsug').hidden=!sugs.length;
 $('lsug').querySelectorAll('li').forEach(x=>{x.onpointerdown=e=>{e.preventDefault();fill(sugs[+x.dataset.k])};x.onclick=()=>fill(sugs[+x.dataset.k]||x.textContent)})}
function hiSet(k){hi=(k+sugs.length)%sugs.length;$('lsug').querySelectorAll('li').forEach((x,j)=>{x.classList.toggle('hi',j===hi);x.setAttribute('aria-selected',j===hi)});const el=$('lsug').children[hi];el&&el.scrollIntoView({block:'nearest'})}
function fill(a){if(!a)return;$('ltype').value=a;sugs=[];$('lsug').hidden=true;$('ltype').focus()}
$('ltype').oninput=sugUpd;
$('ltype').onkeydown=e=>{const open=!$('lsug').hidden&&sugs.length;
 if(e.key==='ArrowDown'&&open){e.preventDefault();hiSet(hi+1)}else if(e.key==='ArrowUp'&&open){e.preventDefault();hiSet(hi-1)}
 else if(e.key==='Tab'&&open){e.preventDefault();hiSet(hi+(e.shiftKey?-1:1))}
 else if(e.key==='Escape'){$('lsug').hidden=true}
 else if(e.key==='Enter'){e.preventDefault();if(open&&hi>=0)fill(sugs[hi]);else typedSubmit()}};
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&st&&st.typed&&st.ans&&!$('ldrill').hidden&&!$('lnext').hidden){e.preventDefault();$('lnext').click()}});
$('ltypeGo').onclick=typedSubmit;$('ltype').onblur=()=>setTimeout(()=>$('lsug').hidden=true,150);
function typedSubmit(){if(st.ans||!st.typed)return;const v=norm($('ltype').value);if(!v)return;st.ans=true;const s=st.q.s,ok=v===norm(AN[s]);if(ok)st.right++;record(s,ok);$('ltype').disabled=true;$('lsug').hidden=true;
 const gs=SIDS.filter(x=>norm(AN[x])===v);
 $('lreveal').innerHTML='<b>'+(ok?'✔ Correct':'✘ Wrong — you typed “'+$('ltype').value+'”'+(gs.length?' (sound '+gs.join('/')+')':''))+'</b><br>'+famHtml(s);$('lreveal').hidden=false;$('lnext').hidden=false;sc();$('lnext').focus()}
window.__typed={sugUpd,typedSubmit,ANL};
// Weak Spots: distractors from within the weak set; top up from confusable neighbors only if fewer than 2 options
function makeQ1w(s){const o=[s];for(const x of neighborsFirst(s,st.set)){if(o.length>=5)break;if(!o.includes(x)&&AN[x]!==AN[s])o.push(x)}
 if(o.length<2)for(const x of (D.neighbors[s]||[])){if(o.length>=2)break;if(!o.includes(x)&&AN[x]!==AN[s]){o.push(x);st.topups=(st.topups||0)+1}}return {s,opts:shuf(o)}}
function makeQ2w_old(s){const ws=new Set(st.set.map(String)),wi=st.items.filter(i=>ws.has(String(i.s))),q=makeQ2(s,wi);
 if(q.opts.length<2){const used=new Set(q.opts.map(i=>i.id)),nb=(D.neighbors[s]||[]).map(String);
  for(const i of shuf(st.items.filter(i=>nb.includes(String(i.s))&&!used.has(i.id)))){if(q.opts.length>=2)break;q.opts.push(i);st.topups=(st.topups||0)+1}q.opts=shuf(q.opts)}return q}
// weak spots
let wst=1;document.querySelectorAll('#lwst button').forEach(b=>b.onclick=()=>{wst=+b.dataset.w;document.querySelectorAll('#lwst button').forEach(x=>x.classList.toggle('sel',x===b))});
function weakPage(){const t=WS.top(15),enough=WS.total()>=3&&t.length>0;
 $('lweakList').innerHTML=enough?'<table class="weak"><tr><th>#</th><th>Sound</th><th>Misses / tries</th><th>Weight</th><th></th></tr>'+t.map((x,k)=>'<tr><td>'+(k+1)+'</td><td>'+x.s+' · '+AN[x.s]+'</td><td>'+x.m+'/'+x.a+' ('+Math.round(100*x.m/x.a)+'%)</td><td>'+x.w.toFixed(1)+'</td><td><button data-b="'+x.s+'">▶</button></td></tr>').join('')+'</table>'
  :'<p class="hint">Not enough data yet — miss at least 3 questions in Learn drills or the Sound Quiz and your weak spots will show up here.</p>';
 $('lweakList').querySelectorAll('button').forEach(b=>b.onclick=()=>play([snd(b.dataset.b).pickup]));$('lweakCtl').hidden=!enough;show(['lweak'])}
$('lweakBtn').onclick=weakPage;$('lweakBack').onclick=()=>show(['modesel','lmenu']);
$('lweakReset').onclick=()=>{if(confirm('Reset all Weak Spots stats? This cannot be undone.')){WS.reset();weakPage()}};
$('lweakGo').onclick=()=>{const items=pool(),ws=WS.top(15).map(x=>x.s),s2=items.filter(i=>ws.includes(String(i.s))).map(i=>i.id);
 let q;if(wst===1||wst===4)q=ws;else if(wst===2)q=s2;else q=ws.map(s=>'1:'+s).concat(s2.map(s=>'2:'+s));if(!q.length)return alert('No weak sounds have items on this map for Stage 2.');
 st={wset:ws,typed:wst===4,t0:Date.now(),stage:wst===3||wst===4?1:wst,both:wst===3,weak:true,set:ws,items,mastery:true,n:0,i:0,right:0,opt:0,optTot:0,recent:[],ans:false,queue:shuf(q),total:q.length,mastered:0,misses:{}};show(['ldrill']);next()};
window.__weak={weakPage};
function famHtml(s){const f=family(s,st.items);return 'Sound '+s+' (“'+AN[s]+'”) family'+(f.length?' — '+f.length+' item(s):<ul>'+f.map(li).join('')+'</ul>':': none on this map.')+(NOTES[s]?'<div class="hint">'+NOTES[s]+'</div>':'')}
function ans1(b){if(st.ans)return;st.ans=true;const ok=b.dataset.s===st.q.s;if(ok)st.right++;record(st.q.s,ok);
 document.querySelectorAll('#lopts .opt').forEach(x=>{x.disabled=true;if(x.dataset.s===st.q.s)x.classList.add('ok');else if(x===b)x.classList.add('bad')});
 $('lreveal').innerHTML='<b>'+(ok?'✔ Correct':'✘ Wrong — you picked “'+AN[b.dataset.s]+'” (sound '+b.dataset.s+')')+'</b><br>'+(st.q.id?byId[st.q.id].n+' makes sound '+st.q.s+' (“'+AN[st.q.s]+'”)<br>':'')+famHtml(st.q.s);if(st.q.id){setPlay(st.q.s);$('lplayrow').hidden=false;play([snd(st.q.s).pickup])}$('lreveal').hidden=false;$('lnext').hidden=false;sc()}
$('lsubmit').onclick=()=>{if(st.ans)return;st.ans=true;const cs=new Set(st.q.fam.map(i=>i.id));let all=true;
 document.querySelectorAll('#lopts .opt').forEach(b=>{const s=b.classList.contains('sel'),c=cs.has(b.dataset.id);b.disabled=true;st.optTot++;if(s===c)st.opt++;else all=false;b.classList.add(c?(s?'ok':'miss'):(s?'bad':'x'));
  if(!c){b.textContent+=' — sound '+byId[b.dataset.id].s+' (“'+AN[byId[b.dataset.id].s]+'”)'}});if(all)st.right++;record(st.q.s,all);
 const none=!st.q.opts.some(i=>cs.has(i.id));
 $('lreveal').innerHTML='<b>'+(all?'✔ Correct':'✘ Not quite')+'</b>'+(none?' — <b>none of these were in the family.</b>':'')+'<br>'+famHtml(st.q.s);$('lreveal').hidden=false;$('lsubmit').hidden=true;$('lnext').hidden=false;sc()};
function sc(){const a=st.ans?st.i:st.i-1;$('lscore').textContent='Correct '+st.right+'/'+a}
function finish(){const a=st.ans?st.i:st.i-1;
 if(st.typed){st.queue=st.queue.length||st.mastered+Object.keys(st.misses).length<st.total?[0]:[];const m=Object.keys(st.misses),sec=Math.round((Date.now()-st.t0)/1000);$('final').innerHTML='Learn · '+(st.weak?'Weak Spots · ':'')+'Stage 1 Mastery'+(st.queue.length?' (stopped early)':'')+'<br><br><b style="font-size:28px">'+st.mastered+'/'+st.total+'</b> · '+Math.floor(sec/60)+'m '+(sec%60)+'s'+(m.length?'<br><br><b>Missed:</b><ul style="text-align:left">'+m.map(s=>'<li>'+s+' · '+AN[s]+'</li>').join('')+'</ul>':(st.queue.length?'':'<br><br>No misses — perfect run!'))+(st.queue.length?'<br>'+(st.total-st.mastered-m.length)+' not answered.':'');show(['done']);return}
 if(st.mastery){const m=Object.entries(st.misses).sort((x,y)=>y[1]-x[1]);$('final').innerHTML='Learn · '+(st.weak?'Weak Spots · ':'')+(st.both?'Stages 1+2':'Stage '+st.stage)+' · Adaptive '+(st.queue.length?'stopped early':'complete')+' · Learned '+st.mastered+'/'+st.total+' in '+a+' questions'+
  (m.length?'<br><br><b>Missed:</b><ul style="text-align:left">'+m.map(([s,n])=>{const k=s;s=st.both?s.slice(2):s;const two=st.both?k[0]==='2':st.stage===2&&!SIDS.includes(s);if(two){const it=byId[s];return '<li>'+(st.both?'S2 · ':'')+it.n+' → '+it.s+' · '+AN[it.s]+' — '+n+'×</li>'}return '<li>'+(st.both?'S'+k[0]+' · ':'')+s+' · '+AN[s]+' — '+n+'×</li>'}).join('')+'</ul>':'<br><br>No misses — perfect run!');show(['done']);return}
 $('final').textContent='Learn · Stage '+st.stage+' · Questions: '+a+' · Correct: '+st.right+'';show(['done'])}
$('lnext').onclick=next;$('lquit').onclick=finish;
})();
