// Stage presets: 'paper' (drafting table, light sketch), 'graph' (maths grid + axes), 'night' (dark + bloom).
import * as THREE from 'three';
import {canvasTex,axes} from './sketch.js';
const P={
  paper:{bg:0xe9e2d2,bgD:0x1c1a24,fog:[30,85],ground:'paper',bloom:false,exposure:1.05},
  graph:{bg:0xf2f0ea,bgD:0x16171d,fog:[30,70],ground:'graph',bloom:false,exposure:1.0,axes:true},
  night:{bg:0x07080d,bgD:0x07080d,fog:[18,60],ground:'night',bloom:true,exposure:1.1,dark:true}};
function groundTex(kind){return canvasTex(1024,1024,(g,w,h)=>{
  if(kind==='night'){g.fillStyle='#0c0e16';g.fillRect(0,0,w,h);g.strokeStyle='rgba(120,140,255,.10)';for(let i=0;i<=w;i+=64){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.moveTo(0,i);g.lineTo(w,i);g.stroke()}return}
  g.fillStyle=kind==='graph'?'#fbfaf6':'#f8f3e6';g.fillRect(0,0,w,h);
  for(let i=0;i<5000;i++){g.fillStyle=`rgba(120,100,60,${Math.random()*.035})`;g.fillRect(Math.random()*w,Math.random()*h,2,2)}
  const minor=kind==='graph'?'rgba(43,125,233,.14)':'rgba(60,50,30,.06)',major=kind==='graph'?'rgba(43,125,233,.32)':'rgba(60,50,30,.12)';
  for(let i=0;i<=w;i+=kind==='graph'?12.8:32){const M=Math.round(i/(kind==='graph'?64:128))*(kind==='graph'?64:128)===Math.round(i);g.strokeStyle=M?major:minor;g.lineWidth=M?1.6:1;g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.moveTo(0,i);g.lineTo(w,i);g.stroke()}})}
export function makeStage(name,scene,renderer){
  const s=P[name]||P.paper;renderer.toneMappingExposure=s.exposure;
  scene.background=new THREE.Color(s.bg);scene.fog=new THREE.Fog(s.bg,...s.fog);
  const hemi=new THREE.HemisphereLight(0xfff6e6,0x8a7a62,s.dark?.25:.95);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xffe7c4,s.dark?.5:2.3);sun.position.set(-6,12,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:40});sun.shadow.radius=5;sun.shadow.bias=-.0005;scene.add(sun);
  // table (big, darker) + paper sheet (the "page")
  const table=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:s.dark?0x05060a:0xcfc4ad,roughness:.9}));table.rotation.x=-Math.PI/2;table.position.y=-.02;table.receiveShadow=true;scene.add(table);
  const t=groundTex(s.ground);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(12,12);
  const sheet=new THREE.Mesh(new THREE.PlaneGeometry(140,140),new THREE.MeshStandardMaterial({map:t,roughness:.95}));sheet.rotation.x=-Math.PI/2;sheet.receiveShadow=true;scene.add(sheet);
  let ax=null;if(s.axes){ax=axes({size:6});scene.add(ax)}
  return{name,preset:s,hemi,sun,sheet,table,axes:ax,bloom:s.bloom,
    setTheme(dark){if(s.dark)return;scene.background.set(dark?s.bgD:s.bg);scene.fog.color.copy(scene.background);sun.intensity=dark?.55:2.3;hemi.intensity=dark?.35:.95;sheet.material.color.set(dark?0x6d6a74:0xffffff);table.material.color.set(dark?0x111018:0xcfc4ad)}}}
