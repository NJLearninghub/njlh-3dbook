// Reusable sketch-style helpers: ink-outlined meshes, arrows, labels, lines, trails, axes, grid.
import * as THREE from 'three';
export const COL={ink:0x1d1b18,acc:0x7b4dff,acc2:0xe0662a,ok:0x2e9b5b,blue:0x2b7de9,red:0xc8433a};
const inkMat=new THREE.LineBasicMaterial({color:COL.ink});
const hullMat=new THREE.MeshBasicMaterial({color:COL.ink,side:THREE.BackSide});
export const fill=(color=0xffffff,glow=0)=>new THREE.MeshToonMaterial({color,emissive:glow?color:0x000000,emissiveIntensity:glow});
/** Ink-outlined mesh: white (or given) toon fill + crease edges + optional back-face hull outline. */
export function ink(geo,{mat=fill(),thr=25,hull=0,shadow=true,edges=true}={}){
  const g=new THREE.Group(),m=new THREE.Mesh(geo,mat);m.castShadow=shadow;m.receiveShadow=true;g.add(m);
  if(edges)g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo,thr),inkMat));
  if(hull){const h=new THREE.Mesh(geo,hullMat);h.scale.setScalar(1+hull);g.add(h)}
  g.userData.mesh=m;return g}
export function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t}
/** Hatching lines on a w×h rectangle (local XY plane). */
export function hatch(w,h,n=10,op=.45){const p=[];for(let i=0;i<n;i++){const x=-w/2+i/n*w;p.push(new THREE.Vector3(x,-h/2,0),new THREE.Vector3(Math.min(x+h*.6,w/2),h/2,0))}
  return new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(p),new THREE.LineBasicMaterial({color:COL.ink,transparent:true,opacity:op}))}
/** Label sprite (always faces camera, drawn on top). label.setText(t) to change. */
export function label(text,{color='#1d1b18',size=1,bg='rgba(255,255,255,.88)'}={}){
  const mk=t=>canvasTex(256,96,(g,w,h)=>{g.fillStyle=bg;g.strokeStyle='#1d1b18';g.lineWidth=4;g.beginPath();g.roundRect(4,4,w-8,h-8,18);g.fill();g.stroke();g.fillStyle=color;g.font='italic bold 62px Georgia, serif';g.textAlign='center';g.textBaseline='middle';g.fillText(t,w/2,h/2+2)});
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:mk(text),depthTest:false,toneMapped:false}));s.renderOrder=10;s.userData.base=size;
  s.setText=t=>{if(t===s.userData.text)return;s.userData.text=t;s.material.map.dispose();s.material.map=mk(t)};s.userData.text=text;
  s.scale.set(1.2*size,.45*size,1);LABELS.add(s);return s}
export const LABELS=new Set();
/** Scale all labels (engine calls with ~1.35 on phones so text stays readable). */
export function scaleLabels(k){for(const s of LABELS){const b=s.userData.base;s.scale.set(1.2*b*k,.45*b*k,1)}}
/** Polyline; line.setPts([Vector3...]). */
export function line(color=COL.ink,{dashed=false,dash=.12,gap=.08,opacity=1}={}){
  const mat=dashed?new THREE.LineDashedMaterial({color,dashSize:dash,gapSize:gap,transparent:opacity<1,opacity}):new THREE.LineBasicMaterial({color,transparent:opacity<1,opacity});
  const l=new THREE.Line(new THREE.BufferGeometry(),mat);
  l.setPts=p=>{l.geometry.dispose();l.geometry=new THREE.BufferGeometry().setFromPoints(p.length?p:[new THREE.Vector3()]);if(dashed)l.computeLineDistances()};return l}
/** Growing trail with fixed capacity (no per-frame allocation). */
export function trail(color=COL.acc,max=600){const pos=new Float32Array(max*3),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setDrawRange(0,0);
  const l=new THREE.Line(geo,new THREE.LineBasicMaterial({color}));let n=0;l.frustumCulled=false;
  l.push=v=>{if(n>=max)return;pos.set([v.x,v.y,v.z],n*3);n++;geo.setDrawRange(0,n);geo.attributes.position.needsUpdate=true};l.clear=()=>{n=0;geo.setDrawRange(0,0)};return l}
/** Vector arrow with ink outline. a.set(fromV3, vecV3). Optional label follows the tip. */
export function arrow(color=COL.acc,{radius=.04,head=.3,text=null,labelColor}={}){
  const g=new THREE.Group(),m=fill(color,.35);
  const sh=ink(new THREE.CylinderGeometry(radius,radius,1,8),{mat:m,thr:60}),hd=ink(new THREE.ConeGeometry(radius*3,head,12),{mat:m,thr:60});g.add(sh,hd);
  const up=new THREE.Vector3(0,1,0),tmp=new THREE.Vector3();
  if(text){g.label=label(text,{color:labelColor||'#'+color.toString(16).padStart(6,'0'),size:.8})}
  g.set=(from,vec,labelOffset=.28)=>{const L=vec.length();const vis=L>.02;g.visible=vis;if(g.label)g.label.visible=vis&&g.parent?.visible!==false;if(!vis)return;
    g.position.copy(from);g.quaternion.setFromUnitVectors(up,tmp.copy(vec).normalize());const s=Math.max(L-head,.01);sh.scale.set(1,s,1);sh.position.y=s/2;hd.position.y=s+head/2;
    if(g.label)g.label.position.copy(from).addScaledVector(tmp,L+labelOffset)};
  return g}
/** Axes with ticks and labels: for maths/graph stages. */
export function axes({size=5,step=1,labels=['x','y','z'],z=true}={}){const g=new THREE.Group();const d=[[1,0,0],[0,1,0],[0,0,1]].slice(0,z?3:2);const cols=[COL.red,COL.ok,COL.blue];
  d.forEach((v,i)=>{const dir=new THREE.Vector3(...v);const a=arrow(cols[i],{radius:.02,head:.22,text:labels[i]});a.set(dir.clone().multiplyScalar(-size*(i===1?0:1)),dir.clone().multiplyScalar(size*(i===1?1:2)+.2));g.add(a);if(a.label)g.add(a.label);
    const p=[];for(let t=-size;t<=size;t+=step){if(!t)continue;const c=dir.clone().multiplyScalar(t),o=new THREE.Vector3(...(i===0?[0,.08,0]:[.08,0,0]));p.push(c.clone().sub(o),c.clone().add(o))}
    g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(p),inkMat))});return g}
export function grid(size=10,div=10,color=0x9a917f,op=.35){const h=new THREE.GridHelper(size,div,color,color);h.material.transparent=true;h.material.opacity=op;return h}
/** Plot y=f(x) as a 3D tube-ish line on z=0 plane. */
export function plot(f,{from=-5,to=5,n=200,color=COL.acc}={}){const l=line(color);const pts=[];for(let i=0;i<=n;i++){const x=from+(to-from)*i/n,y=f(x);if(isFinite(y))pts.push(new THREE.Vector3(x,y,0))}l.setPts(pts);return l}
