// World: the 3D sketch diorama. Uses engine sketch helpers + pure model functions.
import * as THREE from 'three';
import {ink,fill,hatch,arrow,label,line,trail,COL} from '../../engine/sketch.js';
import * as M from './model.js';
export function build(lab){
  const {scene}=lab,P=lab.params;const root=new THREE.Group();scene.add(root);
  const ORIG=new THREE.Vector3(-4.6,0,0);let S=.1,cur={real:null,ideal:null,cmp:null};
  const L={cannon:new THREE.Group(),path:new THREE.Group(),vectors:new THREE.Group(),marks:new THREE.Group(),compare:new THREE.Group(),ideal:new THREE.Group(),ball:new THREE.Group()};
  for(const g of Object.values(L))root.add(g);
  // cannon on a hatched cliff
  const base=new THREE.Group();L.cannon.add(base);
  const cliff=ink(new THREE.BoxGeometry(1.1,1,1.3));base.add(cliff);const ch=hatch(1.1,1,10);ch.position.z=.651;cliff.add(ch);
  const cannon=new THREE.Group();base.add(cannon);
  for(const z of[-.3,.3]){const w=ink(new THREE.CylinderGeometry(.26,.26,.08,20),{thr:40});w.rotation.x=Math.PI/2;w.position.set(0,.26,z);cannon.add(w)}
  const pivot=new THREE.Group();pivot.position.y=.36;cannon.add(pivot);
  const barrel=ink(new THREE.CylinderGeometry(.13,.17,.9,16),{thr:40,hull:.04});barrel.position.y=.45;pivot.add(barrel);
  const ground=line(COL.ink);L.cannon.add(ground);
  const pathL=line(COL.ink,{dashed:true});L.path.add(pathL);const tr=trail(COL.acc,900);L.path.add(tr);
  const idealL=line(0x9a917f,{dashed:true,opacity:.8});L.ideal.add(idealL);const idealTag=label('ideal',{color:'#7a705e',size:.75});L.ideal.add(idealTag);
  const cmpL=line(COL.acc2,{dashed:true});L.compare.add(cmpL);
  const ball=ink(new THREE.SphereGeometry(.16,24,16),{mat:fill(COL.acc,.6),hull:.08});L.ball.add(ball);
  const ball2=ink(new THREE.SphereGeometry(.13,20,14),{mat:fill(COL.acc2,.5),hull:.08});L.compare.add(ball2);
  const aV=arrow(COL.acc,{text:'v'}),aX=arrow(COL.blue,{text:'vₓ'}),aY=arrow(COL.ok,{text:'vᵧ'});L.vectors.add(aV,aX,aY,aV.label,aX.label,aY.label);
  const hM=label('H'),rM=label('R'),hLine=line(COL.ink,{dashed:true});L.marks.add(hM,rM,hLine);
  const glow=new THREE.PointLight(COL.acc,1.2,4);root.add(glow);
  // doodle sun
  const sun=new THREE.Group();sun.add(ink(new THREE.SphereGeometry(.4,24,16),{hull:.06}));{const p=[];for(let i=0;i<12;i++){const a=i/12*Math.PI*2;p.push(new THREE.Vector3(Math.cos(a)*.55,Math.sin(a)*.55,0),new THREE.Vector3(Math.cos(a)*.85,Math.sin(a)*.85,0))}sun.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(p),new THREE.LineBasicMaterial({color:COL.ink})))}
  sun.position.set(4,5.6,-3);root.add(sun);
  const Wp=(x,y)=>new THREE.Vector3(ORIG.x+x*S,ORIG.y+.36+y*S,0);
  let t=0,running=false;
  function layout(){cur.real=M.path(P,lab.mode);cur.ideal=lab.mode==='real'?M.path(P,'ideal'):null;cur.cmp=P.cmp?M.path(P,lab.mode,90-P.th):null;
    const sa=M.summary(cur.real),si=cur.ideal?M.summary(cur.ideal):sa,sc=cur.cmp?M.summary(cur.cmp):{R:0,H:0};
    const R=Math.max(si.R,sc.R,1),H=Math.max(si.H,sc.H,.5);S=Math.min(9.4/R,4.4/H);
    const hs=P.h*S;cliff.visible=P.h>0;cliff.scale.set(1,Math.max(hs,.01),1);cliff.position.y=hs/2;cannon.position.y=hs;base.position.copy(ORIG);pivot.rotation.z=-(Math.PI/2-P.th*Math.PI/180);
    const toV=pts=>pts.map(q=>Wp(q.x,q.y));pathL.setPts(toV(cur.real));L.ideal.visible=!!cur.ideal&&(!lab.layersOn||lab.layersOn.includes('ideal'));
    if(cur.ideal){idealL.setPts(toV(cur.ideal));idealTag.position.copy(Wp(si.R,0)).add(new THREE.Vector3(0,.35,.4))}
    L.compare.visible=!!cur.cmp;if(cur.cmp)cmpL.setPts(toV(cur.cmp));
    ground.setPts([new THREE.Vector3(ORIG.x-.7,.01,0),new THREE.Vector3(ORIG.x+Math.max(si.R,sa.R,sc.R)*S+.5,.01,0)]);
    let top=cur.real[0];for(const q of cur.real)if(q.y>top.y)top=q;hM.position.copy(Wp(top.x,top.y)).add(new THREE.Vector3(0,.4,0));hLine.setPts([Wp(top.x,top.y),Wp(top.x,0)]);
    rM.position.copy(Wp(sa.R,0)).add(new THREE.Vector3(0,.35,.35));place()}
  function place(){const s=M.at(cur.real,t),p=Wp(s.x,s.y);ball.position.copy(p);glow.position.copy(p);const k=.06;
    aV.set(p,new THREE.Vector3(s.vx*k,s.vy*k,0));aX.set(p,new THREE.Vector3(s.vx*k,0,0));aY.set(p,new THREE.Vector3(0,s.vy*k,0));
    if(cur.cmp){const c=M.at(cur.cmp,t);ball2.position.copy(Wp(c.x,c.y))}}
  function fire(){t=0;running=true;tr.clear();lab.setPlaying(true);lab.beep(140,.25,'sawtooth');lab.rig.shake=.25}
  const Tmax=()=>Math.max(cur.real.at(-1).t,cur.cmp?cur.cmp.at(-1).t:0);
  layout();
  return{layers:L,
    shots:{overview:{pos:[0,5,14.5],target:[0,2,0],fov:38},side:{pos:[0,2.8,16.5],target:[0,2.4,0],fov:40,drift:.08},
      top:{pos:[2,6.5,8],target:[0,3.2,0],fov:42},wide:{pos:[-2,7,16],target:[0,2,0],fov:40},cliff:{pos:[-9,5,9],target:[-1,2.2,0],fov:44},low:{pos:[-8,.8,6],target:[0,1.8,0],fov:46}},
    onStep(s,lab){lab.layersOn=s.layers;t=0;running=false;tr.clear();layout()},
    onParam(k){if(k==='slow')return;t=0;running=false;tr.clear();lab.setPlaying(false);layout()},
    action(id){if(id==='fire')fire()},
    play(lab){if(!running||t>=Tmax())fire();else lab.setPlaying(!lab.playing)},
    update(dt){sun.rotation.z+=dt*.2;
      if(running&&lab.playing){const T=Tmax();t+=dt*(P.slow?.25:1)*Math.min(1.4,6/Math.max(T,1));if(t>=T){t=T;running=false;lab.setPlaying(false);lab.beep(90,.2)}place();tr.push(ball.position)}}}}
