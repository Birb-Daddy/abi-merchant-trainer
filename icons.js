(function(){
const D=window.QUIZ_DATA,$=id=>document.getElementById(id),byId={};D.items.forEach(i=>byId[i.id]=i);
const RAR=['Common','Rare','Epic','Legendary','Mythic'];
let s={pool:'ALL',rar:new Set(RAR),count:null},st;
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
function poolItems(pool){return (pool==='ALL'?D.items:D.sets[D.combos[pool]].map(id=>byId[id]))}
function filtered(){return poolItems(s.pool).filter(i=>s.rar.has(i.r))}
function weight(i){const L=D.look[i.id],s=L?L.s:4;return s===0?.1:s<4?.35:1}
function pickTarget(st){const n=st.items.length,win=Math.min(Math.floor(n/2),8),rec=st.recent||(st.recent=[]);
 const c=st.items.filter(i=>!rec.includes(i.id)),tot=c.reduce((a,i)=>a+weight(i),0);let r=Math.random()*tot,t=c[c.length-1];
 for(const i of c){r-=weight(i);if(r<=0){t=i;break}}rec.push(t.id);while(rec.length>win)rec.shift();return t}
function makeQ(target,pool){const used=new Set([target.id]),opts=[target],inPool=new Set(pool.map(i=>i.id));
 for(const id of ((D.look[target.id]||{}).l||[])){if(opts.length>=4+1)break;if(inPool.has(id)&&!used.has(id)){opts.push(byId[id]);used.add(id)}}
 const tiers=[i=>i.r===target.r,i=>i.c===target.c,i=>i.z===target.z,()=>true];
 for(const t of tiers){for(const i of shuf(pool.filter(x=>!used.has(x.id)&&t(x)))){if(opts.length>=5)break;opts.push(i);used.add(i.id)}if(opts.length>=5)break}
 return {target,opts:shuf(opts)}}
function tile(i,cell){const [w,h]=i.z.split('x').map(Number),d=document.createElement('div');d.className='ic bg-'+i.r;d.style.width=w*cell+'px';d.style.height=h*cell+'px';
 d.innerHTML='<img alt="" src="icons/'+i.id+'.png">';return d}
window.__icons={makeQ,poolItems,pickTarget,weight};
// mode switch
const SOUND=['menu'],ICON=['imenu'];
function mode(m){$('mSound').classList.toggle('sel',m==='s');$('mIcon').classList.toggle('sel',m==='i');$('menu').hidden=m!=='s';$('imenu').hidden=m!=='i';$('mLearn').classList.toggle('sel',m==='l');$('lmenu').hidden=m!=='l'}
$('mSound').onclick=()=>mode('s');window.__mode=mode;$('mIcon').onclick=()=>mode('i');
const allScreens=['modesel','menu','imenu','quiz','iquiz','lmenu','lstudy','ldrill','lweak','done'];
const show=ids=>allScreens.forEach(x=>$(x).hidden=!ids.includes(x));
// observe sound quiz screens to hide mode selector during sound quiz
// pool buttons
const maps={};Object.keys(D.combos).forEach(c=>{const m=c.replace(/ (\S+)$/,''),mo=c.match(/(\S+)$/)[1];(maps[m]=maps[m]||[]).push([c,mo])});
function selPool(v,b){s.pool=v;document.querySelectorAll('#imenu .pb').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');upd()}
$('iAll').classList.add('pb');$('iAll').onclick=()=>selPool('ALL',$('iAll'));
Object.keys(maps).sort().forEach(m=>{const d=document.createElement('div');d.className='map';d.innerHTML='<b>'+m+'</b><div class="row"></div>';
 maps[m].forEach(([c,mo])=>{const b=document.createElement('button');b.className='pb';b.textContent=mo;b.onclick=()=>selPool(c,b);d.lastChild.appendChild(b)});$('imaps').appendChild(d)});
RAR.forEach(r=>{const b=document.createElement('button');b.textContent=r;b.className='sel';b.onclick=()=>{s.rar.has(r)?s.rar.delete(r):s.rar.add(r);b.classList.toggle('sel');upd()};$('irar').appendChild(b)});
[['10',10],['20',20],['Endless',0]].forEach(([t,n])=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>{s.count=n;document.querySelectorAll('#icounts button').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');upd()};$('icounts').appendChild(b)});
function upd(){const n=filtered().length;$('iinfo').textContent=n+' items match.'+(n<5&&n>0?' (Extra choices will come from the rest of the pool.)':'');$('istart').disabled=!(n>0&&s.count!==null)}
upd();
$('istart').onclick=()=>{st={items:filtered(),pool:poolItems(s.pool),n:s.count,i:0,right:0,bag:[]};show(['iquiz']);next()};
function next(){if(st.n&&st.i>=st.n)return finish();const q=st.q=makeQ(pickTarget(st),st.pool);st.i++;st.ans=false;
 $('iwhere').textContent=(s.pool==='ALL'?'All items':s.pool)+' · Q'+st.i+(st.n?'/'+st.n:'');sc();$('iname').textContent=q.target.n;
 const cell=Math.min(56,Math.floor((Math.min(window.innerWidth,720)-60)/9));
 $('iopts').innerHTML='';q.opts.forEach(i=>{const b=document.createElement('button');b.className='icb';b.style.padding='4px';b.appendChild(tile(i,cell));b.dataset.id=i.id;b.onclick=()=>answer(b);$('iopts').appendChild(b)});
 $('ireveal').hidden=true;$('inext').hidden=true}
function answer(b){if(st.ans)return;st.ans=true;const t=st.q.target,ok=b.dataset.id===t.id;if(ok)st.right++;
 document.querySelectorAll('#iopts .icb').forEach(x=>{x.disabled=true;const ic=x.firstChild;if(x.dataset.id===t.id)ic.classList.add('ok');else if(x===b)ic.classList.add('bad')});
 const r=$('ireveal');r.innerHTML='';r.appendChild(tile(t,48));const p=document.createElement('div');
 const wrong=ok?'':'<br><small>You picked: '+byId[b.dataset.id].n+'</small>';
 p.innerHTML='<b>'+(ok?'✔ Correct':'✘ Wrong')+'</b><br><span class="r-'+t.r+'">'+t.n+'</span><br><small>'+t.z+' · '+t.r+' · '+t.c+' · ~'+t.p.toLocaleString()+'</small>'+wrong;
 r.appendChild(p);r.hidden=false;$('inext').hidden=false;sc()}
function sc(){$('iscore').textContent='Correct '+st.right+'/'+(st.ans?st.i:st.i-1)}
function finish(){const a=st.ans?st.i:st.i-1;$('final').textContent='Icon quiz · Questions: '+a+' · Correct: '+st.right;show(['done'])}
$('inext').onclick=next;$('iquit').onclick=finish;
$('again').addEventListener('click',()=>{show(['modesel']);mode($('mIcon').classList.contains('sel')?'i':$('mLearn').classList.contains('sel')?'l':'s')});
})();
