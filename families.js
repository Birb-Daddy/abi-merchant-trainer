// Stage 2 "Families": hear a sound, tick every item in its family among 10 tiles.
(function(){
const D=window.QUIZ_DATA,AN=window.ANCHORS,$=id=>document.getElementById(id),byId={};D.items.forEach(i=>byId[i.id]=i);
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const SIDS=Object.keys(D.sounds).sort((a,b)=>a-b),MIN=3,N=10;
let audio=new Audio();const play=n=>{audio.src='audio/'+n+'.ogg';audio.play().catch(()=>{})};const pp=s=>play(D.sounds[s].pickup);
const pool=()=>{const p=$('lpool').value;return p==='ALL'?D.items:D.sets[D.combos[p]].map(id=>byId[id])};
const fams=items=>{const f={};items.forEach(i=>(f[i.s]=f[i.s]||[]).push(i));return f};
const picked=new Set();let F={};
function list(){F=fams(pool());const q=SIDS.filter(s=>(F[s]||[]).length>=MIN);[...picked].forEach(s=>{if(!q.includes(s))picked.delete(s)});
 $('lfchecks').innerHTML=q.map(s=>'<label><input type="checkbox" data-s="'+s+'"'+(picked.has(s)?' checked':'')+'>'+s+' · '+AN[s]+' <small>('+F[s].length+')</small></label>').join('');
 $('lfchecks').querySelectorAll('input').forEach(c=>c.onchange=()=>{c.checked?picked.add(c.dataset.s):picked.delete(c.dataset.s);info()});
 $('lfall').onclick=()=>{q.forEach(s=>picked.add(s));list()};$('lfnone').onclick=()=>{picked.clear();list()};
 $('lfcount').textContent=q.length+' sounds have '+MIN+'+ items.';info()}
function info(){$('lfstart').disabled=!picked.size;$('lfinfo').textContent=picked.size+' sound(s) selected.'}
const famUI=on=>{['ls1sel','lcountsWrap','lstart','linfo'].forEach(id=>{const e=$(id);if(e){if(on){e.dataset.fh=e.hidden?'1':'';e.hidden=true}else if(e.dataset.fh!==undefined){e.hidden=e.dataset.fh==='1';delete e.dataset.fh}}});$('lfsel').hidden=!on;if(on)$('lst1').classList.remove('sel');$('lst3').classList.toggle('sel',on)};
$('lst3').onclick=()=>{if(!$('lfsel').hidden)return;famUI(true);list()};
['lst1'].forEach(x=>$(x).addEventListener('click',()=>{if(!$('lfsel').hidden)famUI(false)}));
$('lpool').addEventListener('change',()=>{if(!$('lfsel').hidden)list()});
let st;
function start(list,weak){const items=pool();F=fams(items);
 st={weak,sounds:shuf(list),k:0,items,t0:Date.now(),hit:0,miss:0,fp:0,r:0};startSound();['modesel','lmenu','lweak'].forEach(x=>$(x).hidden=true);$('lfam').hidden=false;round()}
$('lfstart').onclick=()=>start([...picked]);
function startSound(){const s=st.sounds[st.k];st.s=s;st.left=shuf(F[s].map(i=>i.id))}
function round(){const s=st.s;st.r++;
 const k=Math.min(st.left.length,1+(Math.random()*4|0)),correct=st.left.splice(0,k).map(id=>byId[id]);
 const famIds=new Set(F[s].map(i=>i.id)),used=new Set(correct.map(i=>i.id));
 // distractors: other sounds' families (size>=2 only), weighted by family size
 let cands=st.items.filter(i=>String(i.s)!==String(s)&&(F[i.s]||[]).length>=2);const opts=correct.slice();
 while(opts.length<N&&cands.length){const tot=cands.reduce((t,i)=>t+F[i.s].length,0);let r=Math.random()*tot,j=0;for(;j<cands.length-1;j++){r-=F[cands[j].s].length;if(r<0)break}
  const it=cands.splice(j,1)[0];if(!used.has(it.id)&&!famIds.has(it.id)){opts.push(it);used.add(it.id)}}
 st.opts=shuf(opts);st.sel=new Set();st.done=false;
 $('lfwhere').textContent=(st.weak?'Weak Spots · ':'')+'Families · Sound '+(st.k+1)+'/'+st.sounds.length+' · Round '+st.r;
 $('lfscore').textContent='✔'+st.hit+' ✘'+st.miss+' ⚠'+st.fp;
 $('lfprompt').textContent='Tick every item that makes this sound.';
 $('lfplay').onclick=()=>pp(s);
 $('lftiles').innerHTML=st.opts.map((i,n)=>'<div class="ft" data-n="'+n+'"><button class="ftb r-'+i.r+'" data-n="'+n+'">'+i.n+'<small></small></button><button class="prev" data-p="'+i.s+'" aria-label="Preview">▶</button></div>').join('');
 $('lftiles').querySelectorAll('.ftb').forEach(b=>b.onclick=()=>{if(st.done)return;const n=+b.dataset.n;st.sel.has(n)?st.sel.delete(n):st.sel.add(n);b.classList.toggle('on',st.sel.has(n))});
 $('lftiles').querySelectorAll('.prev').forEach(b=>b.onclick=()=>pp(b.dataset.p));
 $('lfsubmit').hidden=false;$('lfnext').hidden=true;$('lfres').hidden=true;pp(s)}
$('lfsubmit').onclick=()=>{if(st.done)return;st.done=true;const s=st.s;let h=0,m=0,f=0;
 $('lftiles').querySelectorAll('.ftb').forEach(b=>{const n=+b.dataset.n,i=st.opts[n],inF=String(i.s)===String(s),on=st.sel.has(n);
  let cls='',tag='';if(inF&&on){cls='ok';tag='✔ ';h++}else if(inF){cls='missd';tag='✘ missed · ';m++}else if(on){cls='bad';tag='⚠ ';f++}else cls='x';
  b.classList.add(cls);b.querySelector('small').textContent=tag+i.s+' · '+AN[i.s];
  if(inF)WS.rec(s,on);else if(on)WS.rec(s,false)});
 st.hit+=h;st.miss+=m;st.fp+=f;$('lfscore').textContent='✔'+st.hit+' ✘'+st.miss+' ⚠'+st.fp;
 $('lfres').hidden=false;$('lfres').textContent=((m||f)?h+' right, '+m+' missed, '+f+' wrong pick(s).':'Perfect round!')+' · '+(F[s].length-st.left.length)+'/'+F[s].length+' family items shown so far.';
 $('lfsubmit').hidden=true;$('lfnext').hidden=false;
 $('lfnext').textContent=st.left.length?'NEXT ROUND':(st.k+1<st.sounds.length?'NEXT SOUND':'FINISH')};
$('lfnext').onclick=()=>{if(!st.left.length){st.k++;if(st.k>=st.sounds.length)return finish();startSound()}round()};
function finish(stopped){const sec=Math.round((Date.now()-st.t0)/1000);$('lfam').hidden=true;
 $('final').innerHTML='Learn · Stage 2 Families'+(stopped?' (stopped early)':'')+'<br><br><b style="font-size:24px">✔ '+st.hit+' correct · ✘ '+st.miss+' missed · ⚠ '+st.fp+' wrong picks</b><br>'+st.r+' rounds · '+Math.floor(sec/60)+'m '+(sec%60)+'s<br><br>Sounds: '+st.sounds.slice(0,st.k+(stopped?1:0)).map(s=>s+' · '+AN[s]).join(', ');$('done').hidden=false}
$('lfquit').onclick=()=>finish(true);
$('again').addEventListener('click',()=>{$('lfam').hidden=true});
window.__fam={fams,MIN,start,qualify:()=>{F=fams(pool());return SIDS.filter(s=>(F[s]||[]).length>=MIN)}};
})();
