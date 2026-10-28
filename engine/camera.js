// Camera rig: named shots, eased transitions, idle drift, user orbit that eases back.
// Shot: {pos:[x,y,z], target:[x,y,z], fov?, drift?, portrait?:{pos,target,fov}}
import * as THREE from 'three';
export class CameraRig{
  constructor(camera,controls,shots){Object.assign(this,{camera,controls,shots});this.pos=camera.position.clone();this.tgt=new THREE.Vector3();this.fov=camera.fov;
    this.goal={pos:new THREE.Vector3(),tgt:new THREE.Vector3(),fov:40,drift:.12};this.user=false;this.lastUser=-1e9;this.time=0;this.name=null;
    controls.addEventListener('start',()=>{this.user=true});controls.addEventListener('end',()=>{this.user=false;this.lastUser=this.time});
    this.shake=0}
  resolve(name){const s=this.shots[name]||this.shots[Object.keys(this.shots)[0]];const port=innerHeight>innerWidth;const v=port&&s.portrait?{...s,...s.portrait}:s;
    const pos=new THREE.Vector3(...v.pos),tgt=new THREE.Vector3(...v.target);let fov=v.fov||40;
    if(port&&!s.portrait){// keep the landscape horizontal field of view (designed for aspect 1.6)
      const aspect=innerWidth/innerHeight,hf=2*Math.atan(Math.tan(fov*Math.PI/360)*1.6);let need=2*Math.atan(Math.tan(hf/2)/aspect)*180/Math.PI;
      if(need>62){const k=Math.tan(hf/2)/aspect/Math.tan(31*Math.PI/180);pos.sub(tgt).multiplyScalar(k*.74).add(tgt);need=62}fov=need}
    return{pos,tgt,fov,drift:s.drift??.12}}
  go(name,instant=false){this.name=name;const r=this.resolve(name);this.goal=r;this.lastUser=-1e9;if(instant){this.pos.copy(r.pos);this.tgt.copy(r.tgt);this.fov=r.fov}}
  refresh(){if(this.name)this.go(this.name)}
  update(dt){this.time+=dt;const c=this.controls;
    if(this.user||this.time-this.lastUser<2.2){c.update();if(!this.user){this.pos.copy(this.camera.position);this.tgt.copy(c.target)}return}
    const k=1-Math.exp(-dt*2.4);this.pos.lerp(this.goal.pos,k);this.tgt.lerp(this.goal.tgt,k);this.fov+=(this.goal.fov-this.fov)*k;
    const d=this.goal.drift,t=this.time;this.camera.position.set(this.pos.x+Math.sin(t*.21)*d*3,this.pos.y+Math.sin(t*.17)*d,this.pos.z+Math.cos(t*.19)*d*2);
    if(this.shake>0){this.shake=Math.max(0,this.shake-dt);const a=this.shake*.08;this.camera.position.x+=(Math.random()-.5)*a;this.camera.position.y+=(Math.random()-.5)*a}
    c.target.copy(this.tgt);this.camera.lookAt(this.tgt);if(Math.abs(this.camera.fov-this.fov)>.01){this.camera.fov=this.fov;this.camera.updateProjectionMatrix()}}}
