(function(){
const D=window.QUIZ_DATA, HI=new Set(['Legendary','Mythic']);
const byId={};D.items.forEach(i=>byId[i.id]=i);
const $=id=>document.getElementById(id);
let sel={combo:null,level:null,count:null},st;
const LEVELS={Noob:'Pairs where every possible item is Legendary or Mythic.',Intermediate:'Noob pairs + every single-item pair + trap pairs (red/gold mixed with lower items).',Expert:'Every size + sound pair on this map.'};
function pairsFor(setKey){const m={};D.sets[setKey].forEach(id=>{const i=byId[id],k=i.z+'|'+i.s;(m[k]=m[k]||[]).push(i)});return m}
function levelPairs(pairs,level){return Object.keys(pairs).filter(k=>{const v=pairs[k],allHi=v.every(i=>HI.has(i.r)),anyHi=v.some(i=>HI.has(i.r));
 if(level==='Noob')return allHi; if(level==='Intermediate')return allHi||v.length===1||anyHi; return true})}
const rot=z=>z.split('x').reverse().join('x');
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
function makeQ(pairs,key){const [z,s]=key.split('|'),cands=pairs[key],pool=D.sets[st.set].map(id=>byId[id]);
 const m=Math.min(5,cands.length),k=Math.random()<.07?0:1+Math.floor(Math.random()*m);const correct=shuf(cands).slice(0,k);const used=new Set(correct.map(i=>i.id));
 const notC=i=>!used.has(i.id)&&!(i.z===z&&String(i.s)===s);
 const tiers=[pool.filter(i=>String(i.s)===s&&i.z===rot(z)),pool.filter(i=>String(i.s)===s),pool.filter(i=>i.z===z),pool.filter(i=>i.c===cands[0].c),pool];
 const opts=correct.slice();for(const t of tiers){for(const i of shuf(t.filter(notC))){if(opts.length>=5)break;if(Math.random()<.75||t===pool){opts.push(i);used.add(i.id)}}if(opts.length>=5)break}
 return {z,s,cands,opts:shuf(opts)}}
window.__quiz={pairsFor,levelPairs,makeQ,setState:x=>st=x};
// menu
const maps={};Object.keys(D.combos).forEach(c=>{const m=c.replace(/ (\S+)$/,''),mode=c.match(/(\S+)$/)[1];(maps[m]=maps[m]||[]).push([c,mode])});
Object.keys(maps).sort().forEach(m=>{const d=document.createElement('div');d.className='map';d.innerHTML='<b>'+m+'</b><div class="row"></div>';
 maps[m].forEach(([c,mode])=>{const b=document.createElement('button');b.textContent=mode;b.onclick=()=>pick('combo',c,b,'#maps button');d.lastChild.appendChild(b)});$('maps').appendChild(d)});
function pick(k,v,b,q){sel[k]=v;document.querySelectorAll(q).forEach(x=>x.classList.remove('sel'));b.classList.add('sel');
 if(sel.combo&&sel.level){const p=pairsFor(D.combos[sel.combo]),lp=levelPairs(p,sel.level);$('levelinfo').textContent=LEVELS[sel.level]+' — '+lp.length+' pairs, '+lp.reduce((a,k)=>a+p[k].length,0)+' items.'}
 $('start').disabled=!(sel.combo&&sel.level&&sel.count)}
['Noob','Intermediate','Expert'].forEach(l=>{const b=document.createElement('button');b.textContent=l;b.onclick=()=>pick('level',l,b,'#levels button');$('levels').appendChild(b)});
[['10',10],['20',20],['Endless',0]].forEach(([t,n])=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>pick('count',String(n),b,'#counts button');$('counts').appendChild(b)});
const show=id=>['modesel','menu','imenu','quiz','iquiz','lmenu','lstudy','ldrill','lweak','done'].forEach(x=>$(x).hidden=!(x===id||(id==='menu'&&x==='modesel')));
$('start').onclick=()=>{const set=D.combos[sel.combo],pairs=pairsFor(set);st={set,pairs,keys:levelPairs(pairs,sel.level),n:+sel.count,i:0,right:0,opt:0,optTot:0,bag:[]};show('quiz');next()};
let audio=new Audio();function play(names){let i=0;const go=()=>{if(i>=names.length)return;audio.src='audio/'+names[i++]+'.ogg';audio.onended=()=>setTimeout(go,250);audio.play().catch(()=>{})};go()}
function next(){if(st.n&&st.i>=st.n)return finish();if(!st.bag.length)st.bag=shuf(st.keys);const q=st.q=makeQ(st.pairs,st.bag.pop());st.i++;
 $('where').textContent=sel.combo+' · '+sel.level+' · Q'+st.i+(st.n?'/'+st.n:'');score();$('qsize').textContent=q.z;
 const snd=D.sounds[q.s];$('pdrop').onclick=()=>play([snd.drop]);$('ppick').onclick=()=>play([snd.pickup]);$('pboth').onclick=()=>play([snd.pickup]);
 $('opts').innerHTML='';q.opts.forEach(i=>{const b=document.createElement('button');b.className='opt';b.textContent=i.n;b.dataset.id=i.id;b.onclick=()=>b.classList.toggle('sel');$('opts').appendChild(b)});
 $('submit').hidden=false;$('next').hidden=true;$('reveal').hidden=true;play([snd.pickup])}
function score(){$('score').textContent='Correct '+st.right+'/'+(st.i-(st.q&&!st.done?1:0))+' · Choices '+st.opt+'/'+st.optTot}
$('submit').onclick=()=>{const q=st.q,cs=new Set(q.cands.map(i=>i.id));let all=true;
 document.querySelectorAll('#opts .opt').forEach(b=>{const s=b.classList.contains('sel'),c=cs.has(b.dataset.id);b.disabled=true;st.optTot++;if(s===c)st.opt++;else all=false;
  b.classList.add(c?(s?'ok':'miss'):(s?'bad':'x'))});if(all)st.right++;if(window.WS)WS.rec(q.s,all);
 const none=!q.opts.some(i=>cs.has(i.id));$('reveal').innerHTML='<b>'+(all?'✔ Correct':'✘ Not quite')+'</b>'+(none?' — <b>none of these 5 were possible.</b> For reference,':' —')+' all '+q.cands.length+' item(s) for '+q.z+' + sound '+q.s+':<ul>'+q.cands.sort((a,b)=>b.p-a.p).map(i=>'<li class="r-'+i.r+'">'+i.n+' <small>('+i.r+', ~'+i.p.toLocaleString()+')</small></li>').join('')+'</ul>';
 $('reveal').hidden=false;$('submit').hidden=true;$('next').hidden=false;st.done=true;score();st.done=false};
$('next').onclick=next;$('quit').onclick=finish;$('again').onclick=()=>show('menu');
function finish(){const answered=$('next').hidden?st.i-1:st.i;$('final').textContent='Questions: '+answered+' · Fully correct: '+st.right+' · Individual choices right: '+st.opt+'/'+st.optTot;show('done')}
})();
