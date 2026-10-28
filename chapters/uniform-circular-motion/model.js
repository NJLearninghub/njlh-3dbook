// Uniform circular motion — pure functions.
export const supportsReal=false;
export const defaults={r:1.5,v:3,m:0.2,showA:true};
export const omega=p=>p.v/p.r, ac=p=>p.v*p.v/p.r, period=p=>2*Math.PI*p.r/p.v;
/** Angle advance for dt. */
export const advance=(p,ang,dt)=>ang+omega(p)*dt;
export function readouts(p){const w=omega(p),T=period(p);return{w,ac:ac(p),T,f:1/T,F:p.m*ac(p),note:`Centripetal force from the string: F = mv²/r = ${(p.m*ac(p)).toFixed(2)} N`}}
