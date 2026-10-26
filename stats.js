// Weak Spots stats: per-sound misses/attempts + decaying weight, in localStorage.
(function(){const K='abiWeakSpots.v1';
let S;try{S=JSON.parse(localStorage.getItem(K))||{}}catch(e){S={}}
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
window.WS={
 rec(s,ok){s=String(s);const x=S[s]=S[s]||{m:0,a:0,w:0,c:0};x.a++;if(ok){x.c++;x.w=Math.max(0,x.w-0.5)}else{x.m++;x.w+=1}save()},
 get:s=>S[String(s)]||{m:0,a:0,w:0,c:0},
 top(n){return Object.entries(S).filter(([,x])=>x.w>0).sort((p,q)=>q[1].w-p[1].w||(q[1].m/q[1].a)-(p[1].m/p[1].a)).slice(0,n).map(([s,x])=>Object.assign({s},x))},
 total:()=>Object.values(S).reduce((t,x)=>t+x.m,0),
 reset(){S={};save()}};
})();
