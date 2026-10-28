import * as THREE from 'three';
import {ink,fill,arrow,line,COL} from '../../engine/sketch.js';
import * as M from './model.js';
export function build(lab){
  const P=lab.params,root=new THREE.Group();lab.scene.add(root);
  const L={rig:new THREE.Group(),stone:new THREE.Group(),vel:new THREE.Group(),acc:new THREE.Group(),ghost:new THREE.Group()};for(const g of Object.values(L))root.add(g);
  const HUB=2.4,hub=new THREE.Vector3(0,HUB,0);
  const pole=ink(new THREE.CylinderGeometry(.07,.07,HUB,12),{thr:40});pole.position.y=HUB/2;L.rig.add(pole);
  const pb=ink(new THREE.CylinderGeometry(.4,.46,.12,24),{thr:40});pb.position.y=.06;L.rig.add(pb);
  const orbit=line(COL.ink,{dashed:true}),shadow=line(0x9a917f,{dashed:true}),str=line(COL.ink);L.rig.add(orbit,shadow,str);
  const stone=ink(new THREE.IcosahedronGeometry(.2,1),{mat:fill(COL.acc,.6),thr:15,hull:.06});L.stone.add(stone);
  const aV=arrow(COL.acc2,{text:'v'}),aA=arrow(COL.ok,{text:'a꜀'});L.vel.add(aV,aV.label);L.acc.add(aA,aA.label);
  const tangent=line(COL.acc2,{dashed:true});L.ghost.add(tangent);
  const glow=new THREE.PointLight(COL.acc,1.2,4);root.add(glow);
  let ang=0,cut=false,cutT=0,cutP=new THREE.Vector3(),cutV=new THREE.Vector3();
  function ring(){const R=P.r,a=[],b=[];for(let i=0;i<=72;i++){const t=i/72*Math.PI*2;a.push(new THREE.Vector3(Math.cos(t)*R,HUB,Math.sin(t)*R));b.push(new THREE.Vector3(Math.cos(t)*R,.02,Math.sin(t)*R))}orbit.setPts(a);shadow.setPts(b)}
  ring();lab.setPlaying?.(true);
  return{layers:L,
    shots:{overview:{pos:[0,6.5,9.5],target:[0,1.6,0],fov:40},top:{pos:[0,11,1.2],target:[0,HUB,0],fov:36,drift:.05},side:{pos:[7.5,3.2,5],target:[0,1.8,0],fov:40}},
    onStep(){cut=false;L.ghost.visible=false;lab.setPlaying(true);ring()},
    onParam(k){if(k==='r')ring()},
    action(id){if(id==='cut'&&!cut){cut=true;cutT=0;lab.beep(300,.15);lab.setPlaying(true)}},
    update(dt){const R=P.r;
      if(!cut){if(lab.playing)ang=M.advance(P,ang,dt);const p=new THREE.Vector3(Math.cos(ang)*R,HUB,Math.sin(ang)*R);stone.position.copy(p);str.visible=true;str.setPts([hub,p]);
        const tan=new THREE.Vector3(-Math.sin(ang),0,Math.cos(ang)),inw=hub.clone().sub(p).normalize();
        aV.set(p,tan.clone().multiplyScalar(.35*P.v));aA.set(p,inw.multiplyScalar(Math.min(.12*M.ac(P),R*.95)));L.ghost.visible=false;cutP.copy(p);cutV.copy(tan).multiplyScalar(P.v*.9)}
      else{cutT+=dt;const p=cutP.clone().addScaledVector(cutV,cutT);p.y-=Math.min(.5*9.8*.15*cutT*cutT,HUB-.2);stone.position.copy(p);str.visible=false;aA.visible=false;aA.label.visible=false;
        aV.set(p,cutV.clone().multiplyScalar(.35));L.ghost.visible=true;tangent.setPts([cutP,cutP.clone().addScaledVector(cutV,3)]);if(cutT>2.6){cut=false;aA.label.visible=true}}
      glow.position.copy(stone.position)}}}
