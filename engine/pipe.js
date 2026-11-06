// Fluid helpers shared by the fluid chapters: a sketched glass pipe with a varying radius and centre-line height,
// and "volume-coordinate" particles. Each particle carries the volume V of fluid ahead of the inlet; V grows at the
// same rate Q everywhere, so the particles automatically speed up where the pipe is narrow (A·v = Q).
import * as THREE from 'three';
import {fill,COL} from './sketch.js';
const inkMat=new THREE.LineBasicMaterial({color:COL.ink});
/** prof(x) → {y, r} in world units. */
export function makePipe(prof,{x0=-6,x1=6,N=160,M=32,color=0xbfe3ff,rings=13}={}){
  const g=new THREE.Group(),pos=new Float32Array(N*M*3),idx=[];
  for(let i=0;i<N-1;i++)for(let j=0;j<M;j++){const a=i*M+j,b=i*M+(j+1)%M,c=(i+1)*M+j,d=(i+1)*M+(j+1)%M;idx.push(a,c,b,b,c,d)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setIndex(idx);
  const mat=fill(color,.15);mat.transparent=true;mat.opacity=.3;mat.depthWrite=false;mat.side=THREE.DoubleSide;
  const mesh=new THREE.Mesh(geo,mat);mesh.renderOrder=2;g.add(mesh);
  const top=new THREE.Line(new THREE.BufferGeometry(),inkMat),bot=new THREE.Line(new THREE.BufferGeometry(),inkMat),back=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:COL.ink,transparent:true,opacity:.25}));g.add(top,bot,back);
  const ringG=new THREE.Group();g.add(ringG);
  const table={x:new Float64Array(N),V:new Float64Array(N),y:new Float64Array(N),r:new Float64Array(N)};
  function update(){const T=[],B=[],K=[];let V=0;
    for(let i=0;i<N;i++){const x=x0+(x1-x0)*i/(N-1),{y,r}=prof(x);table.x[i]=x;table.y[i]=y;table.r[i]=r;
      if(i){const r0=table.r[i-1];V+=Math.PI*(r*r+r0*r0)/2*(x-table.x[i-1])}table.V[i]=V;
      for(let j=0;j<M;j++){const a=j/M*Math.PI*2,k=(i*M+j)*3;pos[k]=x;pos[k+1]=y+r*Math.cos(a);pos[k+2]=r*Math.sin(a)}
      T.push(new THREE.Vector3(x,y+r,0));B.push(new THREE.Vector3(x,y-r,0));K.push(new THREE.Vector3(x,y,-r))}
    geo.attributes.position.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingSphere();
    top.geometry.dispose();top.geometry=new THREE.BufferGeometry().setFromPoints(T);bot.geometry.dispose();bot.geometry=new THREE.BufferGeometry().setFromPoints(B);back.geometry.dispose();back.geometry=new THREE.BufferGeometry().setFromPoints(K);
    for(const c of ringG.children)c.geometry.dispose();ringG.clear();
    for(let k=0;k<rings;k++){const x=x0+(x1-x0)*k/(rings-1),{y,r}=prof(x),p=[];for(let j=0;j<=40;j++){const a=j/40*Math.PI*2;p.push(new THREE.Vector3(x,y+r*Math.cos(a),r*Math.sin(a)))}
      const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(p),new THREE.LineBasicMaterial({color:COL.ink,transparent:true,opacity:k===0||k===rings-1?.9:.3}));ringG.add(l)}
    table.total=V}
  /** x position for a volume coordinate V (binary search + lerp). */
  function xAt(V){const t=table;if(V<=0)return t.x[0];if(V>=t.total)return t.x[N-1];let lo=0,hi=N-1;while(hi-lo>1){const m=(lo+hi)>>1;t.V[m]<V?lo=m:hi=m}const f=(V-t.V[lo])/(t.V[hi]-t.V[lo]||1);return t.x[lo]+(t.x[hi]-t.x[lo])*f}
  /** volume coordinate for an x position */
  function vAt(x){const t=table,f=(x-x0)/(x1-x0)*(N-1),i=Math.max(0,Math.min(N-2,Math.floor(f)));return t.V[i]+(t.V[i+1]-t.V[i])*(f-i)}
  update();return{group:g,update,xAt,vAt,table,prof}}
/** n particles inside a pipe. flow(dt, Qvis) advances them; bands colours alternate packets of equal volume. */
export function makeParticles(pipe,{n=520,size=.055,colors=[0x2b7de9,0x9fd0ff],hi=0x7b4dff}={}){
  const mesh=new THREE.InstancedMesh(new THREE.SphereGeometry(size,8,6),new THREE.MeshToonMaterial({color:0xffffff}),n);mesh.frustumCulled=false;mesh.renderOrder=3;
  const P=[];for(let i=0;i<n;i++)P.push({V:Math.random(),f:Math.sqrt(Math.random())*.82,a:Math.random()*Math.PI*2});
  const m=new THREE.Matrix4(),c=new THREE.Color(),cs=colors.map(x=>new THREE.Color(x)),ch=new THREE.Color(hi);
  const st={bands:8,mode:'bands',offset:0,highlight:-1};
  function place(){const T=pipe.table,tot=T.total;for(let i=0;i<n;i++){const p=P[i],V=p.V*tot,x=pipe.xAt(V),{y,r}=pipe.prof(x);
      m.makeTranslation(x,y+p.f*r*Math.cos(p.a),p.f*r*Math.sin(p.a));mesh.setMatrixAt(i,m);
      const b=Math.floor(((p.V+st.offset)%1+1)%1*st.bands);
      if(st.mode==='bands')c.copy(b===st.highlight?ch:cs[b%2]);else c.copy(cs[0]);mesh.setColorAt(i,c)}
    mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true}
  /** advance by fraction-of-total-volume per second q */
  function flow(dt,q){for(const p of P){p.V+=q*dt;if(p.V>=1){p.V-=1}}st.offset=(st.offset-q*dt%1+1)%1;place()}
  place();return{mesh,flow,place,st,P}}
