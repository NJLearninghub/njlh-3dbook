// World: horizontal pipe whose radius changes smoothly; particles move by volume coordinate so A·v is the same everywhere.
import * as THREE from 'three';
import {ink,fill,arrow,label,line,COL} from '../../engine/sketch.js';
import {makePipe,makeParticles} from '../../engine/pipe.js';
import * as M from './model.js';
export function build(lab){
  const P=lab.params,root=new THREE.Group();lab.scene.add(root);
  const L={pipe:new THREE.Group(),flow:new THREE.Group(),gauges:new THREE.Group(),dims:new THREE.Group()};for(const g of Object.values(L))root.add(g);
  const Y=1.7,X0=-6,X1=6,XA=-3.6,XB=3.6;let kr=1;
  const sm=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
  const vis=()=>{const f=M.flow(P);return{R1:Math.sqrt(f.A1/Math.PI)*100,R2:Math.sqrt(f.A2/Math.PI)*100,f}}; // cm, equivalent radii
  const prof=x=>{const {R1,R2}=vis();const r=R1+(R2-R1)*sm((x+1.6)/3.2);return{y:Y,r:r*kr}};
  const pipe=makePipe(prof,{x0:X0,x1:X1});L.pipe.add(pipe.group);
  // stands
  for(const x of[-4.8,0,4.8]){const s=ink(new THREE.BoxGeometry(.12,1,.5));s.position.set(x,.5,0);L.pipe.add(s)}
  const parts=makeParticles(pipe);L.flow.add(parts.mesh);
  // station gates: ring + area label + velocity arrow
  const mkGate=(x,c,t)=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.025,8,48),fill(c,.6));ring.rotation.y=Math.PI/2;ring.position.x=x;
    const disc=new THREE.Mesh(new THREE.CircleGeometry(1,48),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}));disc.rotation.y=Math.PI/2;disc.position.x=x;
    const a=arrow(c,{text:t});const lb=label('A',{size:.9});L.gauges.add(ring,disc,a,a.label,lb);return{x,ring,disc,a,lb}};
  const G1=mkGate(XA,COL.acc2,'v₁'),G2=mkGate(XB,COL.acc,'v₂');
  const dimR1=line(COL.red),dimR2=line(COL.red),tR1=label('r₁',{color:'#c8433a',size:.7}),tR2=label('r₂',{color:'#c8433a',size:.7});L.dims.add(dimR1,dimR2,tR1,tR2);
  const capNote=label('',{size:.9});capNote.position.set(0,4.4,0);L.gauges.add(capNote);
  let vScale=1,qVis=.05;
  function layout(){const {R1,R2,f}=vis();kr=1.15/Math.max(R1,R2);pipe.update();
    for(const[G,R]of[[G1,R1],[G2,R2]]){const r=R*kr;G.ring.scale.setScalar(r);G.disc.scale.setScalar(r);G.ring.position.y=G.disc.position.y=Y}
    // inlet visual speed ~ v1 (sqrt-compressed so small speeds still move); cap the fastest particle speed
    const vin=.35+1.1*Math.sqrt(Math.min(P.v1,3)/3);const ratio=f.speedRatio;vScale=Math.min(1,7/(vin*ratio));
    const A1w=Math.PI*(R1*kr)**2;qVis=vin*vScale*A1w/pipe.table.total;
    const k=Math.min(.9,4.2/(vin*Math.max(1,ratio)));const L1=Math.max(.25,vin*k),L2=Math.max(.25,vin*ratio*k);
    G1.a.set(new THREE.Vector3(XA-.2,Y+R1*kr+.45,0),new THREE.Vector3(L1,0,0));G2.a.set(new THREE.Vector3(XB-.2,Y+R2*kr+.45,0),new THREE.Vector3(Math.min(L2,2.4),0,0));
    G1.lb.setText(M.sig(f.A1*1e4,3)+' cm²');G2.lb.setText(M.sig(f.A2*1e4,3)+' cm²');
    G1.lb.position.set(XA,Y-R1*kr-.5,.3);G2.lb.position.set(XB,Y-R2*kr-.5,.3);
    dimR1.setPts([new THREE.Vector3(XA-.6,Y,0),new THREE.Vector3(XA-.6,Y+R1*kr,0)]);dimR2.setPts([new THREE.Vector3(XB+.6,Y,0),new THREE.Vector3(XB+.6,Y+R2*kr,0)]);
    tR1.position.set(XA-1.05,Y+R1*kr/2,0);tR2.position.set(XB+1.05,Y+R2*kr/2,0);
    tR1.setText(M.sig(Math.sqrt(f.A1/Math.PI)*100,3)+' cm');tR2.setText(M.sig(Math.sqrt(f.A2/Math.PI)*100,3)+' cm');
    capNote.setText(`v₂=${M.sig(ratio,3)}v₁`);capNote.visible=true;
    parts.st.mode=P.bands?'bands':'plain';parts.place()}
  layout();
  return{layers:L,
    shots:{overview:{pos:[0,4.6,17.5],target:[0,1.9,0],fov:40},
      inlet:{pos:[-9,3.6,9],target:[-2.5,1.7,0],fov:42},
      outlet:{pos:[8.5,3.8,9.5],target:[2.2,1.7,0],fov:42},
      side:{pos:[0,2.4,15.5],target:[0,2,0],fov:44,drift:.06},
      end:{pos:[12,3,4.5],target:[0,1.7,0],fov:40}},
    onStep(s){layout();lab.setPlaying(true)},
    onParam(k){if(['r1','r2','v1'].includes(k))P.ex=null;layout()},
    action(id){if(id==='half'){P.ex=null;P.r2=+(P.r1/2).toFixed(3);layout()}
      if(id==='spray'){P.ex='spray';P.r1=+M.SPRAY.r1cm.toFixed(3);P.r2=+M.SPRAY.r2cm.toFixed(3);P.v1=M.SPRAY.v1;layout()}},
    update(dt){if(lab.playing)parts.flow(dt,qVis);parts.st.highlight=P.bands?3:-1}}}
