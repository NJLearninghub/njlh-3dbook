// World: 1000 sketched people sorted into an area diagram + tree board + ratio bar; and three bags of balls.
import * as THREE from 'three';
import {ink,fill,line,canvasTex,COL} from '../../engine/sketch.js';
import * as M from './model.js';
const GREY=0xb9b2a4,CREAM=0xf6f0e2,PINK=0xeaa9a1,PURPLE=COL.acc;
// wide label sprite (engine labels are 256 px wide; these hold formulas)
const WL=[];
function wl(text,{size=1,color='#1d1b18',w=512}={}){
  const mk=t=>canvasTex(w,96,(g,W,H)=>{g.fillStyle='rgba(255,255,255,.9)';g.strokeStyle='#1d1b18';g.lineWidth=4;g.beginPath();g.roundRect(4,4,W-8,H-8,18);g.fill();g.stroke();
    g.fillStyle=color;let f=56;g.font=`italic bold ${f}px Georgia, serif`;while(g.measureText(t).width>W-36&&f>20){f-=2;g.font=`italic bold ${f}px Georgia, serif`}g.textAlign='center';g.textBaseline='middle';g.fillText(t,W/2,H/2+2)});
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:mk(text),depthTest:false,toneMapped:false}));s.renderOrder=10;s.userData={base:size,w,text};
  s.setText=t=>{if(t===s.userData.text)return;s.userData.text=t;s.material.map.dispose();s.material.map=mk(t)};WL.push(s);return s}
export function build(lab){
  const P=lab.params,root=new THREE.Group();lab.scene.add(root);lab.state=M.newTally();
  const L={med:new THREE.Group(),tree:new THREE.Group(),bar:new THREE.Group(),urn:new THREE.Group()};for(const g of Object.values(L))root.add(g);
  // ---------- 1000 people (instanced capsules)
  const N=M.N,ROWS=25,SP=.2;
  const people=new THREE.InstancedMesh(new THREE.CapsuleGeometry(.055,.1,3,8),new THREE.MeshToonMaterial({color:0xffffff}),N);people.castShadow=true;people.receiveShadow=true;L.med.add(people);
  const heads=new THREE.InstancedMesh(new THREE.SphereGeometry(.05,10,8),new THREE.MeshToonMaterial({color:0xffffff}),N);heads.castShadow=true;L.med.add(heads);
  const cur=new Float32Array(N*3),tgt=new Float32Array(N*3),sc=new Float32Array(N).fill(1),scT=new Float32Array(N).fill(1),spd=new Float32Array(N);
  const perm=[...Array(N).keys()];let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;for(let i=N-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]]}
  for(let i=0;i<N;i++)spd[i]=2+rnd()*2.5;
  const col=new THREE.Color(),dummy=new THREE.Object3D();
  const frames=[];const frameGrp=new THREE.Group();L.med.add(frameGrp);
  const tags=[0,1,2,3,4,5].map(()=>{const s=wl('',{size:.72,w:400});L.med.add(s);return s});
  function rect(x0,x1,z0,z1,c){const l=line(c);l.setPts([[x0,z0],[x1,z0],[x1,z1],[x0,z1],[x0,z0]].map(([x,z])=>new THREE.Vector3(x,.015,z)));return l}
  let C=M.counts(P);
  function layout(){C=M.counts(P);frameGrp.clear();tags.forEach(t=>t.visible=false);
    const z0=-(ROWS-1)*SP/2,cols=n=>Math.ceil(n/ROWS);
    // groups in order; each member i (identity) → group & rank
    // identities: 0..nD-1 ill (first TP positive), nD.. healthy (first FP positive)
    const ph=P.ph,gap1=.35,gap2=.9;let blocks;
    if(ph===0)blocks=[{ids:perm,c:null}];
    else if(ph===1)blocks=[{ids:range(0,C.nD),name:`Disease · ${C.nD}`,c:COL.red},{ids:range(C.nD,N),name:`Healthy · ${C.nH}`,c:0x7a705e,gap:gap2}];
    else blocks=[{ids:range(0,C.TP),name:`D ∩ + · ${C.TP}`,c:COL.red},{ids:range(C.TP,C.nD),name:`D ∩ − · ${C.FN}`,c:PINK,gap:gap1},
                 {ids:range(C.nD,C.nD+C.FP),name:`D′ ∩ + · ${C.FP}`,c:COL.acc2,gap:gap2},{ids:range(C.nD+C.FP,N),name:`D′ ∩ − · ${C.TN}`,c:0x7a705e,gap:gap1}];
    const nb=blocks.filter(b=>b.ids.length);let W=0;nb.forEach((b,k)=>W+=cols(b.ids.length)*SP+(k?b.gap:0));let x=-W/2;
    nb.forEach((b,k)=>{if(k)x+=b.gap;const w=cols(b.ids.length)*SP;b.ids.forEach((id,r)=>{tgt[id*3]=x+Math.floor(r/ROWS)*SP+SP/2;tgt[id*3+2]=z0+(r%ROWS)*SP});
      if(b.c!=null){frameGrp.add(rect(x-.04,x+w+.04,z0-.14,z0+(ROWS-1)*SP+.14,b.c));const t=tags[k];t.visible=true;t.setText(b.name);t.position.set(x+w/2,.5+k*.42,z0-.3)}
      x+=w});
    for(let i=0;i<N;i++){const pos=i<C.TP||(i>=C.nD&&i<C.nD+C.FP);scT[i]=ph===3&&!pos?.45:1}
    recolor()}
  const range=(a,b)=>{const o=[];for(let i=a;i<b;i++)o.push(i);return o};
  function recolor(){const ph=P.ph;for(let i=0;i<N;i++){const ill=i<C.nD,pos=ill?i<C.TP:i<C.nD+C.FP;let c;
      if(ph===0)c=CREAM;else if(ph===1)c=ill?COL.red:CREAM;else if(ph===2)c=ill?(pos?COL.red:PINK):(pos?COL.acc2:CREAM);else c=pos?(ill?COL.red:COL.acc2):GREY;
      col.setHex(c);people.setColorAt(i,col);heads.setColorAt(i,col)}people.instanceColor.needsUpdate=true;heads.instanceColor.needsUpdate=true}
  // start positions = crowd
  P.ph=P.ph||0;layout();cur.set(tgt);
  function placePeople(dt){for(let i=0;i<N;i++){const k=1-Math.exp(-dt*spd[i]),ix=i*3;const dx=tgt[ix]-cur[ix],dz=tgt[ix+2]-cur[ix+2];cur[ix]+=dx*k;cur[ix+2]+=dz*k;sc[i]+=(scT[i]-sc[i])*k;
      const hop=Math.min(Math.hypot(dx,dz)*.35,.6),s=sc[i];dummy.position.set(cur[ix],.11*s+hop,cur[ix+2]);dummy.scale.setScalar(s);dummy.updateMatrix();people.setMatrixAt(i,dummy.matrix);
      dummy.position.y=.25*s+hop;dummy.updateMatrix();heads.setMatrixAt(i,dummy.matrix)}people.instanceMatrix.needsUpdate=true;heads.instanceMatrix.needsUpdate=true}
  // ---------- tree board (behind the crowd)
  const board=new THREE.Group();board.position.set(0,0,-3.7);L.tree.add(board);
  const panel=ink(new THREE.BoxGeometry(11,4.4,.12));panel.position.set(0,2.5,-.08);board.add(panel);
  for(const x of[-5,5]){const leg=ink(new THREE.BoxGeometry(.12,.4,.12));leg.position.set(x,.2,-.08);board.add(leg)}
  const node=(x,y,c)=>{const n=ink(new THREE.SphereGeometry(.12,16,12),{mat:fill(c,.3),hull:.06});n.position.set(x,y,.1);board.add(n);return n};
  const NP={root:[-4.6,2.5],D:[-1.6,3.7],H:[-1.6,1.3],Dp:[2.6,4.25],Dm:[2.6,3.15],Hp:[2.6,1.85],Hm:[2.6,.75]};
  node(...NP.root,0xffffff);node(...NP.D,COL.red);node(...NP.H,CREAM);node(...NP.Dp,COL.red);node(...NP.Dm,PINK);node(...NP.Hp,COL.acc2);node(...NP.Hm,GREY);
  const edges={};for(const[a,b]of[['root','D'],['root','H'],['D','Dp'],['D','Dm'],['H','Hp'],['H','Hm']]){const l=line(COL.ink);l.setPts([new THREE.Vector3(...NP[a],.1),new THREE.Vector3(...NP[b],.1)]);board.add(l);
    const s=wl('',{size:.62,w:384});s.position.set((NP[a][0]+NP[b][0])/2,(NP[a][1]+NP[b][1])/2+.28,.25);board.add(s);edges[b]=s}
  const leafT={};for(const k of['Dp','Dm','Hp','Hm']){const s=wl('',{size:.7,w:512,color:k==='Dp'?'#c8433a':k==='Hp'?'#e0662a':'#1d1b18'});s.position.set(NP[k][0]+1.45,NP[k][1],.25);board.add(s);leafT[k]=s}
  const rootT=wl('',{size:.6,w:384});rootT.position.set(NP.root[0],NP.root[1]+.45,.25);board.add(rootT);
  function treeText(){const f=P.freq,b=M.bayes(P.prev/100,P.sens/100,P.fpr/100),p=P.prev/100,s=P.sens/100,q=P.fpr/100,r=v=>+v.toFixed(4);
    rootT.setText(f?'1000 people':'everyone');
    edges.D.setText(f?`ill: ${C.nD}`:`P(D)=${r(p)}`);edges.H.setText(f?`healthy: ${C.nH}`:`P(D′)=${r(1-p)}`);
    edges.Dp.setText(`P(+|D)=${r(s)}`);edges.Dm.setText(`P(−|D)=${r(1-s)}`);edges.Hp.setText(`P(+|D′)=${r(q)}`);edges.Hm.setText(`P(−|D′)=${r(1-q)}`);
    leafT.Dp.setText(f?`true + : ${C.TP}`:`D∩+ : ${r(p*s)}`);leafT.Dm.setText(f?`missed : ${C.FN}`:`D∩− : ${r(p*(1-s))}`);
    leafT.Hp.setText(f?`false + : ${C.FP}`:`D′∩+ : ${r((1-p)*q)}`);leafT.Hm.setText(f?`true − : ${C.TN}`:`D′∩− : ${r((1-p)*(1-q))}`)}
  // ---------- ratio bar P(D|+)
  const BAR=8,barG=new THREE.Group();barG.position.set(0,0,3.35);L.bar.add(barG);
  const tpB=ink(new THREE.BoxGeometry(1,.36,.5),{mat:fill(COL.red,.25)}),fpB=ink(new THREE.BoxGeometry(1,.36,.5),{mat:fill(COL.acc2,.25)});tpB.position.y=fpB.position.y=.19;barG.add(tpB,fpB);
  const barTag=wl('',{size:1.15,w:640,color:'#7b4dff'});barTag.position.set(0,1.05,0);barG.add(barTag);
  const tpT=wl('',{size:.6,w:320,color:'#c8433a'}),fpT=wl('',{size:.6,w:320,color:'#e0662a'});barG.add(tpT,fpT);
  let fr=.09;
  function barUpdate(dt){const b=M.bayes(P.prev/100,P.sens/100,P.fpr/100);const goal=P.freq?C.post:b.post;fr+=(goal-fr)*(1-Math.exp(-dt*3));
    const a=Math.max(BAR*fr,.02),c=Math.max(BAR-a,.02);tpB.scale.x=a;tpB.position.x=-BAR/2+a/2;fpB.scale.x=c;fpB.position.x=-BAR/2+a+c/2;
    tpT.position.set(-BAR/2+Math.max(a/2,.8),.62,.3);fpT.position.set(BAR/2-Math.max(c/2,.8),.62,.3);
    tpT.setText(P.freq?`true + ${C.TP}`:`${(P.prev*P.sens/1e4).toFixed(4)}`);fpT.setText(P.freq?`false + ${C.FP}`:`${((100-P.prev)*P.fpr/1e4).toFixed(4)}`);
    barTag.setText(P.freq?`P(D|+) ≈ ${C.TP}/${C.TP+C.FP} = ${(C.post*100).toFixed(1)}%`:`P(D|+) = ${(b.post*100).toFixed(1)}%`+(P.tests?` (test ${P.tests+1})`:''))}
  // ---------- bags
  const U=M.URN,bagX=[-4.2,0,4.2],bags=[],postCols=[],priorCols=[],freqCols=[];
  const redM=fill(COL.red,.35),whiteM=fill(0xffffff,.05);
  U.names.forEach((nm,i)=>{const g=new THREE.Group();g.position.set(bagX[i],0,0);L.urn.add(g);
    const pts=[];for(let k=0;k<=12;k++){const t=k/12;pts.push(new THREE.Vector2(.85+.35*Math.sin(t*Math.PI)-.25*t,t*1.6))}
    const sackM=fill(0xd9c9a6);sackM.transparent=true;sackM.opacity=.45;sackM.side=THREE.DoubleSide;sackM.depthWrite=false;
    const sack=ink(new THREE.LatheGeometry(pts,28),{mat:sackM,thr:50});g.add(sack);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.6,.05,8,32),fill(0x8a6d3b));rim.rotation.x=Math.PI/2;rim.position.y=1.6;g.add(rim);
    const balls=[];for(let k=0;k<U.size;k++){const red=k<U.red[i];const b=ink(new THREE.SphereGeometry(.22,18,12),{mat:red?redM:whiteM,hull:.06});
      const a=k/U.size*Math.PI*2+i;b.position.set(k<4?Math.cos(a)*.42:0,k<4?.25:.62,k<4?Math.sin(a)*.42:0);g.add(b);balls.push(b)}
    const t=wl(`Bag ${nm} · P(E${'₁₂₃'[i]}) = ${U.priorTxt[i]}`,{size:.8,w:560});t.position.set(0,2.25,.4);g.add(t);
    const t2=wl(`${U.red[i]} red · ${U.size-U.red[i]} white`,{size:.6,w:400});t2.position.set(0,-.05,1.35);g.add(t2);
    // columns behind: prior (grey), posterior (purple), frequency (orange)
    const mk=(c,x)=>{const m=ink(new THREE.BoxGeometry(.38,1,.38),{mat:fill(c,.2)});m.position.set(x,0,-1.8);g.add(m);return m};
    priorCols.push(mk(GREY,-.45));postCols.push(mk(PURPLE,0));freqCols.push(mk(COL.acc2,.45));
    const pt=wl('',{size:.62,w:420,color:'#7b4dff'});g.add(pt);postCols[i].userData.tag=pt;bags.push({g,balls})});
  const keyT=wl('grey = prior · purple = posterior · orange = share of reds',{size:.7,w:900});keyT.position.set(0,.25,-3.1);L.urn.add(keyT);
  const tallyT=wl('',{size:.85,w:820});tallyT.position.set(0,.3,2.9);L.urn.add(tallyT);
  const flyer=ink(new THREE.SphereGeometry(.26,18,12),{mat:redM,hull:.08});L.urn.add(flyer);flyer.visible=false;
  const flyGlow=new THREE.PointLight(COL.red,0,4);L.urn.add(flyGlow);
  let fly=null;const H=4.2;
  function sample(){const st=lab.state,r=Math.random();const bag=r<U.prior[0]?0:r<U.prior[0]+U.prior[1]?1:2;const red=Math.random()<U.red[bag]/U.size;
    st.draws++;if(red){st.red++;st.fromBag[bag]++}st.last={bag,red};return{bag,red}}
  function draw(){const d=sample();fly={...d,t:0};flyer.visible=true;flyer.children[0].material=d.red?redM:whiteM;lab.beep(d.red?660:330,.12);lab.rig.shake=.12}
  function urnUpdate(dt){const u=M.urnPost(),st=lab.state;
    for(let i=0;i<3;i++){const set=(m,v)=>{const h=Math.max(v*H,.02);m.scale.y+= (h-m.scale.y)*(1-Math.exp(-dt*4));m.position.y=m.scale.y/2};
      set(priorCols[i],U.prior[i]);set(postCols[i],u.post[i]);freqCols[i].visible=P.freq&&st.red>0;set(freqCols[i],st.red?st.fromBag[i]/st.red:0);
      const tg=postCols[i].userData.tag;tg.position.set(0,postCols[i].scale.y+.35,-1.8);tg.setText(`P(E${'₁₂₃'[i]}|R)=${u.post[i].toFixed(2)}`+(P.freq&&st.red?` · ${(st.fromBag[i]/st.red).toFixed(2)}`:''));
      bags[i].g.position.y+=(((fly&&fly.bag===i)?.25:0)-bags[i].g.position.y)*(1-Math.exp(-dt*6))}
    tallyT.setText(st.draws?`draws ${st.draws} · red ${st.red} · from I ${st.fromBag[0]}, II ${st.fromBag[1]}, III ${st.fromBag[2]}`:'press 🎲 Draw a ball');
    if(fly){fly.t+=dt/1.3;const t=Math.min(fly.t,1),a=new THREE.Vector3(bagX[fly.bag],1.3,0),b=new THREE.Vector3(0,.3,2.1);flyer.position.lerpVectors(a,b,t);flyer.position.y+=Math.sin(t*Math.PI)*2.2;
      flyGlow.position.copy(flyer.position);flyGlow.intensity=fly.red?1.5:0;if(fly.t>=1.6){fly=null;flyer.visible=false;flyGlow.intensity=0}}}
  // ---------- visibility, steps
  function vis(){const on=lab.layersOn;for(const[k,g]of Object.entries(L))g.visible=(!on||on.includes(k))&&(k==='urn'?!!P.urn:!P.urn)}
  function relayout(){layout();treeText()}
  relayout();
  return{layers:L,
    shots:{overview:{pos:[0,7.5,10],target:[0,.3,0],fov:40,portrait:{pos:[0,13,14],target:[0,.3,-.5],fov:50}},
      split:{pos:[0,9.5,8.5],target:[0,.8,-.8],fov:44,drift:.06},
      low:{pos:[-9.5,3.8,8.5],target:[-2.8,.6,-.5],fov:44},
      focus:{pos:[0,6.5,12.5],target:[0,1,0],fov:42},
      tree:{pos:[.4,3.3,5.2],target:[0,2.4,-3.7],fov:46},
      urn:{pos:[0,4.6,10.5],target:[0,1.2,0],fov:40},
      urnTop:{pos:[3.5,8.5,11.5],target:[0,1.1,-.6],fov:44}},
    onStep(s,lab){lab.layersOn=s.layers;if(s.set&&!('tests' in s.set)&&!P.urn){}relayout();vis()},
    onParam(k,lab){if(k==='prev'||k==='sens'||k==='fpr')P.tests=0;if(k==='urn'){vis();lab.rig.go(P.urn?'urn':'focus')}relayout()},
    action(id,lab){
      if(id==='sort'){P.ph=(P.ph+1)%4;if(P.urn){P.urn=false;vis();lab.rig.go('overview')}relayout();lab.beep(220+P.ph*110,.12)}
      else if(id==='retest'){if(P.urn){P.urn=false;vis()}const b=M.bayes(P.prev/100,P.sens/100,P.fpr/100);P.prev=Math.min(99.9,Math.max(.1,Math.round(b.post*1000)/10));P.tests++;P.ph=3;relayout();lab.rig.shake=.15;lab.beep(520,.15)}
      else if(id==='draw'||id==='draw50'){if(!P.urn){P.urn=true;vis();lab.rig.go('urn')}if(id==='draw50')for(let i=0;i<50;i++)sample();draw()}},
    play(lab){this.action(P.urn?'draw':'sort',lab)},
    update(dt,lab){placePeople(dt);if(L.bar.visible)barUpdate(dt);if(L.urn.visible)urnUpdate(dt);
      const k=lab.portrait?1.3:1;for(const s of WL){const b=s.userData.base,w=s.userData.w/256;s.scale.set(1.2*b*w*k,.45*b*k,1)}}}}
