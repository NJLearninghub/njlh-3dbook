// World: three scenes. 'pipe' reproduces NCERT Fig. 9.9 (wide end B–C low at h1, narrow end D–E high at h2, rising curved pipe);
// 'tank' reproduces Fig. 9.10 (Torricelli); 'lift' follows Fig. 9.11 (ball, spinning ball, aerofoil) with Exercise 9.14 data.
import * as THREE from 'three';
import {ink,fill,arrow,label,line,COL} from '../../engine/sketch.js';
import * as M from './model.js';
const KEYS={pipe:{s:['v1','r1','r2','h1','h2','P1','rho'],r:['P1','P2','v1','v2','A1','A2','W','dK','dU','ke1','ke2','pe1','pe2','t1','t2'],b:['fig99','packet','bars','reset']},
  tank:{s:['hT','y1','PT','rho'],r:['tv','th','ty1','tR','tP'],b:['open','reset']},
  lift:{s:['vt','vb','Aw','rho'],r:['lt','lb','ldP','lF','lA'],b:['ex914','spin','reset']}};
export function build(lab){
  const P=lab.params,root=new THREE.Group();lab.scene.add(root);
  const L={pipe:new THREE.Group(),packet:new THREE.Group(),bars:new THREE.Group(),tank:new THREE.Group(),lift:new THREE.Group()};for(const g of Object.values(L))root.add(g);
  const KH=.8,X0=-5.5,X1=5.5,V3=(x,y,z=0)=>new THREE.Vector3(x,y,z);
  const ground=line(COL.ink);ground.setPts([V3(-7,.01),V3(7,.01)]);root.add(ground);
  // ---------- PIPE (Fig. 9.9) ----------
  let kr=1,S=M.pipe(P);
  const C=s=>V3(X0+(X1-X0)*s,KH*(P.h1+(P.h2-P.h1)*Math.sin(s*Math.PI/2)));           // centre line at true heights h1 → h2
  const Tn=s=>{const d=KH*(P.h2-P.h1)*Math.PI/2*Math.cos(s*Math.PI/2);return V3(X1-X0,d).normalize()};
  const Nn=s=>{const t=Tn(s);return V3(-t.y,t.x)};
  const R=s=>(P.r1+(P.r2-P.r1)*s)*kr;
  const N=140,MM=28,ZV=V3(0,0,1);
  function tubeGeo(n){const pos=new Float32Array(n*MM*3),idx=[];for(let i=0;i<n-1;i++)for(let j=0;j<MM;j++){const a=i*MM+j,b=i*MM+(j+1)%MM,c=(i+1)*MM+j,d=(i+1)*MM+(j+1)%MM;idx.push(a,c,b,b,c,d)}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setIndex(idx);return g}
  function fillTube(g,s0,s1,shrink=1){const pos=g.attributes.position.array,n=pos.length/(MM*3);for(let i=0;i<n;i++){const s=s0+(s1-s0)*i/(n-1),c=C(s),nn=Nn(s),r=R(s)*shrink;
      for(let j=0;j<MM;j++){const a=j/MM*Math.PI*2,k=(i*MM+j)*3;pos[k]=c.x+nn.x*r*Math.cos(a);pos[k+1]=c.y+nn.y*r*Math.cos(a);pos[k+2]=r*Math.sin(a)}}
    g.attributes.position.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere()}
  const glass=fill(0xbfe3ff,.15);glass.transparent=true;glass.opacity=.3;glass.depthWrite=false;glass.side=THREE.DoubleSide;
  const tg=tubeGeo(N),tube=new THREE.Mesh(tg,glass);tube.renderOrder=2;L.pipe.add(tube);
  const eTop=line(COL.ink),eBot=line(COL.ink),eIn=line(COL.ink),eOut=line(COL.ink);L.pipe.add(eTop,eBot,eIn,eOut);
  const table=new Float64Array(N);let VT=1;
  const sAt=V=>{if(V<=0)return 0;if(V>=VT)return 1;let lo=0,hi=N-1;while(hi-lo>1){const m=(lo+hi)>>1;table[m]<V?lo=m:hi=m}return(lo+(V-table[lo])/(table[hi]-table[lo]))/(N-1)};
  // particles (volume coordinate → automatically faster in the narrow end: A·v = const)
  const NP=420,pm=new THREE.InstancedMesh(new THREE.SphereGeometry(.05,8,6),new THREE.MeshToonMaterial({color:COL.blue}),NP);pm.frustumCulled=false;pm.renderOrder=3;L.pipe.add(pm);
  const PP=[...Array(NP)].map(()=>({V:Math.random(),f:Math.sqrt(Math.random())*.82,a:Math.random()*Math.PI*2}));const mtx=new THREE.Matrix4();
  function placeParts(){for(let i=0;i<NP;i++){const p=PP[i],s=sAt(p.V*VT),c=C(s),n=Nn(s),r=R(s)*p.f;mtx.makeTranslation(c.x+n.x*r*Math.cos(p.a),c.y+n.y*r*Math.cos(p.a),r*Math.sin(p.a));pm.setMatrixAt(i,mtx)}pm.instanceMatrix.needsUpdate=true}
  // labels like the figure
  const T=(t,o={})=>{const s=label(t,{size:.75,...o});L.pipe.add(s);return s};
  const lB=T('B'),lC=T('C'),lD=T('D'),lE=T('E'),lA1=T('A₁, P₁',{color:'#c8433a'}),lA2=T('A₂, P₂',{color:'#c8433a'}),lh1=T('h₁',{color:'#2e9b5b'}),lh2=T('h₂',{color:'#2e9b5b'}),lv1=T('v₁Δt',{size:.65}),lv2=T('v₂Δt',{size:.65});
  const dh1=line(COL.ok,{dashed:true}),dh2=line(COL.ok,{dashed:true});L.pipe.add(dh1,dh2);
  // packet: hatched slabs BC and DE + moving end faces with the pressure forces
  const slabM=fill(COL.acc2,.4);slabM.transparent=true;slabM.opacity=.55;slabM.side=THREE.DoubleSide;
  const gBC=tubeGeo(10),gDE=tubeGeo(10),mBC=new THREE.Mesh(gBC,slabM),mDE=new THREE.Mesh(gDE,slabM);mBC.renderOrder=mDE.renderOrder=4;L.packet.add(mBC,mDE);
  const bodyM=fill(COL.acc,.4);bodyM.transparent=true;bodyM.opacity=.22;bodyM.depthWrite=false;const gBody=tubeGeo(60),mBody=new THREE.Mesh(gBody,bodyM);L.packet.add(mBody);
  const faceM=new THREE.MeshBasicMaterial({color:COL.acc,side:THREE.DoubleSide,transparent:true,opacity:.75});const fB=new THREE.Mesh(new THREE.CircleGeometry(1,40),faceM),fF=fB.clone();L.packet.add(fB,fF);
  const aB=arrow(COL.red,{text:'P₁A₁'}),aF=arrow(COL.red,{text:'P₂A₂'});L.packet.add(aB,aF,aB.label,aF.label);
  let tau=0,dV=1;
  function face(m,s){const c=C(s),t=Tn(s);m.position.copy(c);m.quaternion.setFromUnitVectors(ZV,t);m.scale.setScalar(R(s)*.98)}
  function packet(){const sb=sAt(tau*dV),sf=sAt(VT-dV+tau*dV);fillTube(gBody,sb,sf,.9);face(fB,sb);face(fF,sf);
    const F1=Math.max(M.PA+S.P1,0)*S.A1,F2=Math.max(M.PA+S.P2,0)*S.A2,Fm=Math.max(F1,F2,1e-9);
    const t1=Tn(sb),t2=Tn(sf);aB.set(C(sb).addScaledVector(t1,-.1-1.4*F1/Fm),t1.clone().multiplyScalar(1.4*F1/Fm));aF.set(C(sf).addScaledVector(t2,.1+1.4*F2/Fm),t2.clone().multiplyScalar(-1.4*F2/Fm))}
  // stacked term bars behind inlet and outlet
  const bars=[0,1].map(i=>{const mk=c=>{const b=ink(new THREE.BoxGeometry(.8,1,.4),{mat:fill(c,.25),thr:80});L.bars.add(b);return b};const o={pe:mk(COL.ok),ke:mk(COL.acc2),p:mk(COL.blue),t:label('',{size:.75})};L.bars.add(o.t);return o});
  const barTop=line(COL.ink,{dashed:true});L.bars.add(barTop);
  function layoutPipe(){S=M.pipe(P);kr=.8/Math.max(P.r1,P.r2);fillTube(tg,0,1);
    const top=[],bot=[];for(let i=0;i<N;i++){const s=i/(N-1),c=C(s),n=Nn(s),r=R(s);top.push(c.clone().addScaledVector(n,r));bot.push(c.clone().addScaledVector(n,-r));
      if(i){const a=C((i-1)/(N-1)),ra=R((i-1)/(N-1));table[i]=table[i-1]+Math.PI*(r*r+ra*ra)/2*c.distanceTo(a)}else table[0]=0}
    VT=table[N-1];eTop.setPts(top);eBot.setPts(bot);
    const ring=s=>{const c=C(s),n=Nn(s),t=Tn(s),r=R(s),p=[];for(let j=0;j<=40;j++){const a=j/40*Math.PI*2;p.push(c.clone().addScaledVector(n,r*Math.cos(a)).add(V3(0,0,r*Math.sin(a))))}return p};eIn.setPts(ring(0));eOut.setPts(ring(1));
    dV=Math.PI*(P.r1*kr)**2*1.3; // volume of slab BC (length 1.3 world units at the inlet)
    const sC=sAt(dV),sD=sAt(VT-dV);fillTube(gBC,0,sC,.96);fillTube(gDE,sD,1,.96);
    const up=(s,k=.45)=>C(s).addScaledVector(Nn(s),R(s)+k);
    lB.position.copy(up(0));lC.position.copy(up(sC));lD.position.copy(up(sD));lE.position.copy(up(1));
    lA1.position.copy(C(0)).add(V3(-1.3,.5,0));lA2.position.copy(C(1)).add(V3(1.3,.5,0));
    lv1.position.copy(C(sC/2)).addScaledVector(Nn(sC/2),-R(sC/2)-.4);lv2.position.copy(C((1+sD)/2)).addScaledVector(Nn((1+sD)/2),-R((1+sD)/2)-.4);
    const ci=C(0),co=C(1);dh1.setPts([V3(ci.x-.2,0,.6),V3(ci.x-.2,ci.y,.6)]);dh2.setPts([V3(co.x+.2,0,.6),V3(co.x+.2,co.y,.6)]);
    lh1.setText('h₁ = '+P.h1.toFixed(2)+' m');lh2.setText('h₂ = '+P.h2.toFixed(2)+' m');lh1.position.set(ci.x-.2,Math.max(ci.y/2,.35),.8);lh2.position.set(co.x+.2,Math.max(co.y/2,.35),.8);
    const kb=2.4/Math.max(Math.abs(S.t1),S.pe1+S.ke1,S.pe2+S.ke2,S.pe1+S.ke1-S.P1,S.pe2+S.ke2-S.P2,1e-9);
    [[S.pe1,S.ke1,S.P1,S.t1,-4.6],[S.pe2,S.ke2,S.P2,S.t2,4.6]].forEach(([pe,ke,p,t,x],i)=>{const b=bars[i],z=-2.6,set=(m,a,c)=>{const lo=Math.min(a,c)*kb,hi=Math.max(a,c)*kb;m.visible=hi-lo>.002;m.scale.y=Math.max(hi-lo,.002);m.position.set(x,lo+(hi-lo)/2+.02,z)};
      set(b.pe,0,pe);set(b.ke,pe,pe+ke);set(b.p,pe+ke,t);b.p.userData.mesh.material.color.set(p<0?COL.red:COL.blue);b.t.setText(M.short(t));b.t.position.set(x,Math.max(t,pe+ke)*kb+.45,z)});
    barTop.setPts([V3(-5.4,S.t1*kb+.02,-2.6),V3(5.4,S.t1*kb+.02,-2.6)]);
    placeParts();packet()}
  // ---------- TANK (Fig. 9.10) ----------
  const KT0=.6;let KT=KT0,tk={};
  const tankG=new THREE.Group();L.tank.add(tankG);const TW=3,TD=2,TX=-1.5;
  const wallM=fill(0xffffff,.05);wallM.transparent=true;wallM.opacity=.25;wallM.depthWrite=false;wallM.side=THREE.DoubleSide;
  const waterM=fill(0x6fb6ff,.25);waterM.transparent=true;waterM.opacity=.55;waterM.depthWrite=false;
  const walls=ink(new THREE.BoxGeometry(TW,1,TD),{mat:wallM,thr:10});const water=new THREE.Mesh(new THREE.BoxGeometry(TW*.98,1,TD*.98),waterM);const lid=ink(new THREE.BoxGeometry(TW,.08,TD),{mat:fill(0x9a917f,.1)});
  tankG.add(walls,water,lid);const hole=ink(new THREE.CylinderGeometry(.09,.09,.3,14),{mat:fill(COL.ink)});hole.rotation.z=Math.PI/2;tankG.add(hole);
  const jet=line(COL.blue),drops=new THREE.InstancedMesh(new THREE.SphereGeometry(.06,8,6),fill(COL.blue,.4),40);drops.frustumCulled=false;L.tank.add(jet,drops);
  const tv=arrow(COL.acc2,{text:'v₁'});L.tank.add(tv,tv.label);
  const TL=(t,o)=>{const s=label(t,{size:.7,...o});L.tank.add(s);return s};const t1=TL('①'),t2=TL('② P₂ = P'),tPa=TL('Pₐ'),ty1=TL('y₁',{color:'#2e9b5b'}),ty2=TL('y₂',{color:'#2e9b5b'}),tH=TL('h',{color:'#7b4dff'}),tA2=TL('A₂'),tR=TL('');
  const dy1=line(COL.ok,{dashed:true}),dy2=line(COL.ok,{dashed:true}),dH=line(COL.acc,{dashed:false});L.tank.add(dy1,dy2,dH);
  let tt=0;
  function layoutTank(){const r=M.tank(P),y2=P.y1+P.hT;KT=Math.min(KT0,4.2/(y2+.4),5.5/Math.max(r.range,.01));tk=r;
    const Hw=(y2+.35)*KT;walls.scale.y=Hw;walls.position.set(TX,Hw/2,0);water.scale.y=y2*KT;water.position.set(TX,y2*KT/2,0);lid.visible=P.PT>0;lid.position.set(TX,Hw,0);
    const hx=TX+TW/2;hole.position.set(hx+.1,P.y1*KT,0);const pts=[];for(let i=0;i<=60;i++){const t=r.t*i/60;pts.push(V3(hx+.25+KT*r.v*t,KT*(P.y1-.5*M.G*t*t),0))}jet.setPts(pts);
    tv.set(V3(hx+.3,P.y1*KT+.35,0),V3(Math.min(.5+r.v*.12,2),0,0));
    t1.position.set(hx-.35,P.y1*KT+.35,TD/2);t2.position.set(TX-.3,y2*KT+.35+(P.PT>0?.2:0),TD/2);t2.setText(P.PT>0?'② P₂ = P':'② P₂ = Pₐ');tPa.position.set(hx+.8,P.y1*KT-.4,0);
    dy1.setPts([V3(TX-.4,0,TD/2+.05),V3(TX-.4,P.y1*KT,TD/2+.05)]);dy2.setPts([V3(TX-1,0,TD/2+.05),V3(TX-1,y2*KT,TD/2+.05)]);dH.setPts([V3(TX+.6,P.y1*KT,TD/2+.05),V3(TX+.6,y2*KT,TD/2+.05)]);
    ty1.position.set(TX-.4,P.y1*KT/2,TD/2+.2);ty2.position.set(TX-1.2,y2*KT*.75,TD/2+.2);tH.position.set(TX+.6,(P.y1+P.hT/2)*KT,TD/2+.2);tA2.position.set(TX+1.1,y2*KT+.35,TD/2);
    tR.setText(r.range.toFixed(2)+' m');tR.position.set(hx+.25+KT*r.range,.35,0)}
  function animTank(dt){tt+=dt*.8;for(let i=0;i<40;i++){const f=((tt*.5+i/40)%1),t=tk.t*f;mtx.makeTranslation(TX+TW/2+.25+KT*tk.v*t,KT*(P.y1-.5*M.G*t*t),(Math.sin(i*7)*.04));drops.setMatrixAt(i,mtx)}drops.instanceMatrix.needsUpdate=true}
  // ---------- LIFT (Fig. 9.11) ----------
  const LY=2.2,ball=ink(new THREE.SphereGeometry(.9,32,20),{mat:fill(0xf3efe6),thr:30});ball.position.y=LY;L.lift.add(ball);
  const seam=new THREE.Mesh(new THREE.TorusGeometry(.905,.025,6,48),fill(COL.red));ball.add(seam);
  const af=new THREE.Shape();{const c=4;
    const X=x=>x,th=x=>5*.18*(.2969*Math.sqrt(x)-.126*x-.3516*x*x+.2843*x**3-.1015*x**4),cm=x=>x<.4?.06/.16*(.8*x-x*x):.06/.36*(.2+.8*x-x*x);
    const up=[],lo=[];for(let i=0;i<=40;i++){const x=(1-Math.cos(i/40*Math.PI))/2;up.push([x,cm(x)+th(x)]);lo.push([x,cm(x)-th(x)])}
    af.moveTo((up[0][0]-.5)*c,up[0][1]*c);for(const[x,y]of up)af.lineTo((x-.5)*c,y*c);for(const[x,y]of lo.reverse())af.lineTo((x-.5)*c,y*c)}
  const wing=ink(new THREE.ExtrudeGeometry(af,{depth:2.2,bevelEnabled:false}),{mat:fill(0xffffff),thr:30});wing.position.set(0,LY,-1.1);wing.rotation.z=-.06;L.lift.add(wing);
  const NL=12,stream=[...Array(NL)].map(()=>{const l=line(COL.blue,{opacity:.7});L.lift.add(l);return l});
  const ND=NL*14,dots=new THREE.InstancedMesh(new THREE.SphereGeometry(.055,8,6),fill(COL.blue,.4),ND);dots.frustumCulled=false;L.lift.add(dots);
  const lF=arrow(COL.ok,{text:'F'});L.lift.add(lF,lF.label);const lTop=label('',{size:.8,color:'#7b4dff'}),lBot=label('',{size:.8,color:'#7b4dff'});L.lift.add(lTop,lBot);
  let paths=[],dph=[...Array(ND)].map((_,i)=>(i%14)/14);
  function profile(x){if(P.obj==='ball'){const r=.9;return Math.abs(x)<r?[Math.sqrt(r*r-x*x),-Math.sqrt(r*r-x*x)]:[0,0]}
    const u=x/4+.5;if(u<0||u>1)return[0,0];const th=5*.18*(.2969*Math.sqrt(u)-.126*u-.3516*u*u+.2843*u**3-.1015*u**4),cm=u<.4?.06/.16*(.8*u-u*u):.06/.36*(.2+.8*u-u*u);return[(cm+th)*4+.12-x*.06,(cm-th)*4+.12-x*.06]}
  function layoutLift(){ball.visible=P.obj==='ball';wing.visible=P.obj!=='ball';const vinf=Math.max((P.vt+P.vb)/2,.1);paths=[];
    for(let k=0;k<NL;k++){const upper=k<NL/2,j=upper?k+1:k-NL/2+1,y0=(upper?1:-1)*j*.42,vloc=upper?P.vt:P.vb,crowd=Math.min(1.6,Math.max(.4,vinf/Math.max(vloc,.1)));const pts=[];
      for(let i=0;i<=80;i++){const x=-6+12*i/80,w=Math.exp(-(x*x)/(P.obj==='ball'?1.4:4)),[tp,bt]=profile(x),base=upper?tp:bt,fall=Math.exp(-j*.35);
        pts.push(V3(x,LY+y0*(1-(1-crowd)*w)+base*fall,0))}paths.push({pts,v:vloc,upper});stream[k].setPts(pts)}
    const l=M.lift(P),Fm=Math.max(Math.abs(l.F),1e-9);lF.set(V3(0,LY,.8),V3(0,Math.abs(l.F)<1e-9?0:Math.sign(l.F)*1.6,0));
    lTop.setText('v = '+P.vt+' m/s');lBot.setText('v = '+P.vb+' m/s');lTop.position.set(-3.2,LY+1.95,0);lBot.position.set(-3.2,LY-1.95,0)}
  let spinA=0;
  function animLift(dt){const vmax=Math.max(P.vt,P.vb,1);for(let k=0;k<NL;k++){const p=paths[k];const sp=.25*(p.v/vmax+.05);
      for(let i=0;i<14;i++){const d=k*14+i;dph[d]=(dph[d]+dt*sp)%1;const f=dph[d]*80,a=Math.floor(f),q=p.pts[a],r=p.pts[Math.min(a+1,80)],u=f-a;mtx.makeTranslation(q.x+(r.x-q.x)*u,q.y+(r.y-q.y)*u,0);dots.setMatrixAt(d,mtx)}}
    dots.instanceMatrix.needsUpdate=true;if(P.obj==='ball'&&P.spin){spinA+=dt*4;ball.rotation.z=spinA}}
  // ---------- reference figure (redrawn schematic, not a scan) ----------
  const ref=document.createElement('div');ref.id='figRef';ref.className='glass';
  ref.innerHTML=`<svg viewBox="0 0 300 170" width="100%"><defs><pattern id="hz" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#2b7de9" stroke-width="2"/></pattern></defs>
<line x1="10" y1="150" x2="290" y2="150" stroke="#1d1b18"/><path d="M40 92 Q140 52 250 42 L250 64 Q140 72 40 124 Z" fill="#cfe7fb" stroke="#1d1b18"/>
<path d="M40 92 L62 84 L62 116 L40 124Z" fill="url(#hz)" stroke="#1d1b18"/><path d="M234 43 L250 42 L250 64 L234 65Z" fill="url(#hz)" stroke="#1d1b18"/>
<line x1="34" y1="108" x2="34" y2="150" stroke="#1d1b18" stroke-dasharray="3 2"/><line x1="256" y1="53" x2="256" y2="150" stroke="#1d1b18" stroke-dasharray="3 2"/>
<g font-family="Georgia" font-style="italic" font-size="11" fill="#1d1b18"><text x="34" y="88">B</text><text x="60" y="78">C</text><text x="228" y="38">D</text><text x="248" y="36">E</text>
<text x="8" y="104">A₁,P₁</text><text x="258" y="50">A₂,P₂</text><text x="20" y="134">h₁</text><text x="260" y="110">h₂</text><text x="44" y="138" font-size="9">v₁Δt</text><text x="214" y="80" font-size="9">v₂Δt</text></g>
<text x="150" y="166" text-anchor="middle" font-size="9" fill="#5a5345">Redrawn after NCERT XI Fig. 9.9 · h to the centre line</text></svg>`;
  Object.assign(ref.style,{position:'fixed',left:'14px',top:'64px',width:'min(300px,46vw)',padding:'6px 8px',borderRadius:'14px',zIndex:5,pointerEvents:'none'});document.body.appendChild(ref);
  // ---------- scene switching ----------
  function applyScene(){const sc=P.scene,K=KEYS[sc];L.pipe.visible=sc==='pipe';L.packet.visible=sc==='pipe'&&!!P.packet;L.bars.visible=sc==='pipe'&&!!P.bars;L.tank.visible=sc==='tank';L.lift.visible=sc==='lift';
    ground.visible=sc!=='lift';
    ref.style.display=sc==='pipe'&&P.fig?'':'none';
    document.querySelectorAll('#console .row').forEach(r=>r.style.display=K.s.includes(r.dataset.k)?'':'none');
    document.querySelectorAll('#console [data-r]').forEach(e=>e.parentElement.style.display=K.r.includes(e.dataset.r)?'':'none');
    document.querySelectorAll('#console [data-b]').forEach(e=>e.style.display=K.b.includes(e.dataset.b)&&!(e.dataset.b==='spin'&&P.obj!=='ball')&&!(e.dataset.b==='ex914'&&P.obj==='ball')?'':'none')}
  function layout(){if(P.scene==='pipe')layoutPipe();else if(P.scene==='tank')layoutTank();else layoutLift();applyScene()}
  layout();setTimeout(applyScene,0);
  const RESET={pipe:{v1:1.5,r1:2,r2:1.2,h1:1,h2:3,P1:40,rho:1000},tank:{hT:1.8,y1:1,PT:0,rho:1000},lift:{...M.EX914}};
  return{layers:L,
    shots:{fig:{pos:[0,3.6,18],target:[0,2,0],fov:40},packet:{pos:[-3,4,11.5],target:[-.3,1.9,0],fov:42,drift:.06},outlet:{pos:[6,5,9.5],target:[2.5,2.6,0],fov:42},
      bars:{pos:[2,7,16],target:[0,2,-1.2],fov:42},level:{pos:[0,2,13],target:[0,1,0],fov:42},
      tank:{pos:[2,2.6,8.5],target:[.3,1.3,0],fov:42},tank2:{pos:[-3,3.8,10.5],target:[1.4,1.4,0],fov:44},
      lift:{pos:[0,2.6,12.5],target:[0,2.2,0],fov:40},ball:{pos:[2,3.2,13],target:[0,2.2,0],fov:40}},
    onStep(s){lab.layersOn=null;tau=0;layout();lab.setPlaying(true)},
    onParam(k){if(k==='spin'){Object.assign(P,P.spin?{vt:36,vb:24}:{vt:30,vb:30})}layout()},
    action(id){if(id==='reset')Object.assign(P,P.scene==='lift'&&P.obj==='ball'?{vt:30,vb:30,spin:false,Aw:.5,rho:1.3}:RESET[P.scene]);
      if(id==='open')P.PT=0;if(id==='ex914')Object.assign(P,{obj:'wing',...M.EX914});layout()},
    update(dt){if(!lab.playing)return;
      if(P.scene==='pipe'){const q=(.25+.5*Math.sqrt(Math.min(P.v1,10)/10))*Math.PI*(P.r1*kr)**2/VT*(P.v1>0?1:0);for(const p of PP){p.V+=q*dt;if(p.V>=1)p.V-=1}placeParts();
        if(P.packet){tau+=dt*.35*(P.v1>0?1:0);if(tau>1.25)tau=0;const tc=Math.min(tau,1);const keep=tau;tau=tc;packet();tau=keep}}
      else if(P.scene==='tank')animTank(dt);else animLift(dt)}}}
