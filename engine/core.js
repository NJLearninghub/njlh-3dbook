// Engine entry: boot({content, model, world, consoleSpec}) — see docs/ADDING_A_CHAPTER.md
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {makeStage} from './stages.js';
import {CameraRig} from './camera.js';
import {UI} from './ui.js';
import {scaleLabels} from './sketch.js';
import * as progress from './progress.js';
export {THREE};
export async function boot({content,model,world,consoleSpec,root='../../'}){
  document.body.classList.add('lab');if(new URLSearchParams(location.search).has('cover'))document.body.classList.add('cover');
  const prefs=progress.prefs;if(prefs.get('dark',false))document.body.classList.add('dark');
  const canvas=document.createElement('canvas');canvas.id='c';document.body.prepend(canvas);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  let pr=Math.min(devicePixelRatio||1,1.75);renderer.setPixelRatio(pr);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.1,300);
  const stage=makeStage(content.stage||'paper',scene,renderer);
  if(stage.preset.dark)document.body.classList.add('dark');
  // ---- audio
  let actx;const beep=(f,d=.1,type='sine',vol=.14)=>{if(!lab.sound)return;try{actx=actx||new AudioContext();const o=actx.createOscillator(),g=actx.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(vol,actx.currentTime);g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+d);o.connect(g).connect(actx.destination);o.start();o.stop(actx.currentTime+d)}catch{}};
  const lab={THREE,scene,camera,renderer,stage,content,model,root,params:{...model.defaults},mode:'ideal',t:0,playing:false,step:0,sound:false,state:null,beep,
    get portrait(){return innerHeight>innerWidth}};
  // ---- world
  const W=await world.build(lab);lab.world=W;
  const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=3;controls.maxDistance=60;controls.maxPolarAngle=1.5;
  const rig=new CameraRig(camera,controls,W.shots);lab.rig=rig;
  // ---- optional bloom (night stage or content.bloom)
  let composer=null,bloomPass=null;
  if(stage.bloom||content.bloom){try{const [{EffectComposer},{RenderPass},{UnrealBloomPass},{OutputPass}]=await Promise.all([import('three/addons/postprocessing/EffectComposer.js'),import('three/addons/postprocessing/RenderPass.js'),import('three/addons/postprocessing/UnrealBloomPass.js'),import('three/addons/postprocessing/OutputPass.js')]);
    composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));bloomPass=new UnrealBloomPass(new THREE.Vector2(256,256),.9,.5,.2);composer.addPass(bloomPass);composer.addPass(new OutputPass())}catch(e){console.warn('bloom off',e)}}
  // ---- step runner
  const steps=content.steps;
  function applyLayers(s){if(!W.layers)return;const on=s.layers;for(const[k,o]of Object.entries(W.layers))o.visible=!on||on.includes(k)}
  function go(i,{instant=false}={}){i=Math.max(0,Math.min(steps.length-1,i));const s=steps[i];lab.step=i;
    if(s.set)Object.assign(lab.params,s.set);if(s.mode)lab.mode=s.mode;applyLayers(s);rig.go(s.shot||Object.keys(W.shots)[0],instant);
    W.onStep?.(s,lab);progress.markStep(content.slug,i);ui.showStep(i);
    if(s.auto)action(s.auto);history.replaceState(null,'','#step-'+(i+1))}
  const setPlaying=p=>{lab.playing=p;ui.setPlaying(p)};lab.setPlaying=setPlaying;
  function param(k,v){lab.params[k]=v;W.onParam?.(k,lab);ui.sync()}
  function action(id){W.action?.(id,lab);ui.sync()}
  function mode(m){if(!model.supportsReal)return;lab.mode=m;W.onParam?.('mode',lab);ui.sync()}
  function play(){if(W.play)W.play(lab);else setPlaying(!lab.playing)}
  function theme(){const d=!document.body.classList.contains('dark');document.body.classList.toggle('dark',d);stage.setTheme(d);W.onTheme?.(d,lab);prefs.set('dark',d)}
  const ui=new UI(lab,consoleSpec,{go,param,action,mode,play,theme});lab.ui=ui;
  if(document.body.classList.contains('dark'))stage.setTheme(true);
  // KaTeX may finish loading after boot
  window.__kx=()=>ui.showStep(lab.step);
  // ---- keyboard
  addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(e.key==='ArrowRight'||e.key==='PageDown')go(lab.step+1);else if(e.key==='ArrowLeft'||e.key==='PageUp')go(lab.step-1);else if(e.key===' '){e.preventDefault();play()}else if(e.key==='q'&&content.quiz)ui.openQuiz();else if(e.key==='Escape')document.getElementById('quiz').classList.remove('show')});
  // ---- resize
  function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;
    // portrait: the UI covers the bottom, so shift the scene up (view offset)
    if(h>w)camera.setViewOffset(w,h,0,h*.2,w,h);else if(w>=1000)camera.setViewOffset(w,h,200,0,w,h);else camera.clearViewOffset();
    camera.updateProjectionMatrix();composer?.setSize(w,h);scaleLabels(h>w?1.4:1);rig.refresh()}
  addEventListener('resize',resize);
  // ---- initial step: #step-n or last visited
  const m=location.hash.match(/step-(\d+)/);const start=m?+m[1]-1:(progress.get(content.slug).last||0);
  resize();go(start,{instant:true});
  // ---- loop with dt cap, 8 Hz panel refresh, low-fps fallback
  const clock=new THREE.Clock();let acc=0,frames=0,fpsT=0,fps=60,checked=false,elapsed=0;
  renderer.setAnimationLoop(()=>{const dt=Math.min(clock.getDelta(),.05);elapsed+=dt;frames++;fpsT+=dt;
    if(fpsT>=1){fps=frames/fpsT;frames=0;fpsT=0;lab.fps=fps;if(!checked&&elapsed>4){checked=true;if(fps<28)lowfps()}}
    W.update?.(dt,lab);rig.update(dt);
    acc+=dt;if(acc>.125){acc=0;ui.readouts()}
    composer?composer.render():renderer.render(scene,camera)});
  function lowfps(){document.body.classList.add('lowfps');pr=1;renderer.setPixelRatio(1);renderer.shadowMap.enabled=false;if(bloomPass)bloomPass.enabled=false;resize()}
  // ---- test hook
  window.__lab={ready:true,lab,go,param,action,mode,play,get step(){return lab.step},steps:steps.length,get fps(){return fps},lowfps,
    snapshot:()=>({slug:content.slug,step:lab.step,mode:lab.mode,params:{...lab.params},readouts:model.readouts?.(lab.params,lab.mode,lab.state)})};
  return lab}
