// Bayes' theorem model — pure functions, no three.js. Percent inputs, probabilities 0..1 out.
export const supportsReal=false;
export const defaults={prev:1,sens:90,fpr:9,ph:0,freq:false,urn:false,tests:0};
export const N=1000;
/** Two-event Bayes: prior P(D), likelihoods P(+|D), P(+|D'). */
export function bayes(prior,sens,fpr){const a=prior*sens,b=(1-prior)*fpr,pPos=a+b;return{pPos,post:pPos?a/pPos:0,a,b}}
/** Whole-token counts in a population of n (the "natural frequency" view). */
export function counts(p,n=N){const nD=Math.round(n*p.prev/100),nH=n-nD,TP=Math.round(nD*p.sens/100),FP=Math.round(nH*p.fpr/100);return{n,nD,nH,TP,FN:nD-TP,FP,TN:nH-FP,post:TP+FP?TP/(TP+FP):0}}
/** Three bags (partition E1,E2,E3). Bag chosen by a die: 1-3 → I, 4-5 → II, 6 → III. Each bag has 5 balls. */
export const URN={names:['I','II','III'],prior:[1/2,1/3,1/6],priorTxt:['1/2','1/3','1/6'],red:[2,3,5],size:5};
export function urnPost(){const j=URN.prior.map((p,i)=>p*URN.red[i]/URN.size),pR=j.reduce((s,v)=>s+v,0);return{joint:j,pR,post:j.map(v=>v/pR)}}
export const newTally=()=>({draws:0,red:0,fromBag:[0,0,0],last:null});
const pc=v=>v*100;
export function readouts(p,mode,st){
  if(p.urn){const u=urnPost(),t=st||newTally();const f=t.red?t.fromBag.map(c=>(c/t.red*100).toFixed(0)+'%').join(' · '):'–';
    return{pD:null,sens:null,fpr:null,pPos:null,post:null,
      note:`Bags: P(R) = ${u.pR.toFixed(3)} · P(E₁|R) = ${u.post[0].toFixed(3)}, P(E₂|R) = ${u.post[1].toFixed(3)}, P(E₃|R) = ${u.post[2].toFixed(3)}.`+(t.draws?` Draws ${t.draws}, red ${t.red}; share of red from I · II · III = ${f}.`:' Press 🎲 Draw a ball.')}}
  const b=bayes(p.prev/100,p.sens/100,p.fpr/100),c=counts(p);
  const note=p.freq?`Counting 1000 people: ${c.TP} true + and ${c.FP} false + → ${c.TP}/${c.TP+c.FP} = ${(c.post*100).toFixed(1)}% (formula ${pc(b.post).toFixed(1)}%).`
    :`P(D|+) = ${(p.prev/100).toFixed(3)}×${(p.sens/100).toFixed(2)} / ${b.pPos.toFixed(4)} = ${pc(b.post).toFixed(1)}%`+(p.tests?` · prior updated after ${p.tests} positive test${p.tests>1?'s':''}`:'');
  return{pD:p.prev,sens:p.sens,fpr:p.fpr,pPos:pc(b.pPos),post:pc(b.post),note}}
