// 3D scene. build(lab) returns {layers, shots, update, onStep?, onParam?, action?, play?}
import * as THREE from 'three';
import {ink,fill,arrow,line,label,trail,axes,plot,COL} from '../../engine/sketch.js';
import * as M from './model.js';
export function build(lab){
  const P=lab.params,root=new THREE.Group();lab.scene.add(root);
  const L={main:new THREE.Group()};root.add(L.main);
  const ball=ink(new THREE.SphereGeometry(.3,24,16),{mat:fill(COL.acc,.5),hull:.06});ball.position.y=.3;L.main.add(ball);
  const v=arrow(COL.acc2,{text:'v'});L.main.add(v,v.label);
  let t=0;
  return{layers:L,
    shots:{overview:{pos:[0,5,12],target:[0,1,0],fov:40},close:{pos:[2,2,5],target:[0,.5,0],fov:40}},
    action(id){if(id==='go')lab.setPlaying(true)},
    update(dt){if(lab.playing)t+=dt;ball.position.x=M.position(P,t);v.set(ball.position,new THREE.Vector3(P.a*Math.cos(t),0,0))}}}
