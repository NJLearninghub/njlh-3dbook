// Projectile model — pure functions, no three.js. Units: SI.
export const supportsReal=true;
export const realNote='air drag on a cricket ball + tape/stopwatch rounding';
export const defaults={u:20,th:45,g:9.8,h:0,cmp:false,slow:false};
// cricket ball: m=0.16 kg, r=0.036 m, Cd=0.47, rho=1.2 → k = ½ρCdA/m
const K=0.5*1.2*0.47*Math.PI*0.036**2/0.16;
const rad=d=>d*Math.PI/180;
/** Textbook (ideal) results, any launch height h. */
export function ideal(u,th,g,h=0){const ux=u*Math.cos(rad(th)),uy=u*Math.sin(rad(th));const T=(uy+Math.sqrt(uy*uy+2*g*h))/g;return{T,H:h+uy*uy/(2*g),R:ux*T,ux,uy,tTop:uy/g}}
/** Sampled path [{t,x,y,vx,vy}] for ideal or real (quadratic drag, RK-free semi-implicit Euler at 2 ms). */
export function path(p,mode='ideal',th=p.th){const g=p.g;
  if(mode!=='real'){const a=ideal(p.u,th,g,p.h),N=120,o=[];for(let i=0;i<=N;i++){const t=a.T*i/N;o.push({t,x:a.ux*t,y:p.h+a.uy*t-.5*g*t*t,vx:a.ux,vy:a.uy-g*t})}return o}
  let x=0,y=p.h,vx=p.u*Math.cos(rad(th)),vy=p.u*Math.sin(rad(th)),t=0;const dt=.002,o=[{t,x,y,vx,vy}];
  for(let i=0;i<200000;i++){const v=Math.hypot(vx,vy);vx+=-K*v*vx*dt;vy+=(-g-K*v*vy)*dt;const px=x,py=y;x+=vx*dt;y+=vy*dt;t+=dt;
    if(y<0){const f=py/(py-y);x=px+(x-px)*f;t=t-dt+dt*f;o.push({t,x,y:0,vx,vy});break}if(i%10===0)o.push({t,x,y,vx,vy})}return o}
export function summary(pts){const last=pts[pts.length-1];let H=0;for(const q of pts)H=Math.max(H,q.y);return{T:last.t,R:last.x,H}}
/** State at time t by linear interpolation of a path. */
export function at(pts,t){if(t<=0)return pts[0];const L=pts[pts.length-1];if(t>=L.t)return L;let lo=0,hi=pts.length-1;while(hi-lo>1){const m=(lo+hi)>>1;(pts[m].t<t?lo=m:hi=m)}const a=pts[lo],b=pts[hi],f=(t-a.t)/(b.t-a.t);const o={};for(const k in a)o[k]=a[k]+(b[k]-a[k])*f;return o}
const round=(v,s)=>Math.round(v/s)*s;
export function readouts(p,mode){const I=ideal(p.u,p.th,p.g,p.h);
  if(mode!=='real'){const o={T:I.T,H:I.H,R:I.R,dev:null};if(p.cmp){const b=ideal(p.u,90-p.th,p.g,p.h);o.note=`θ = ${p.th}° → R = ${I.R.toFixed(1)} m · 90°−θ = ${90-p.th}° → R = ${b.R.toFixed(1)} m${p.h===0?'  (equal when h = 0)':''}`}return o}
  const s=summary(path(p,'real'));return{T:round(s.T,.1),H:round(s.H,.5),R:round(s.R,.5),dev:(s.R-I.R)/I.R*100,
    note:`Measured with a tape (±0.5 m) and stopwatch (±0.1 s). Drag cuts the range by ${((1-s.R/I.R)*100).toFixed(0)}% vs the ideal ${I.R.toFixed(1)} m.`}}
