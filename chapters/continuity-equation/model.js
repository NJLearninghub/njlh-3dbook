// Equation of continuity — pure functions, no three.js. Sliders use cm and m/s; all maths in SI.
export const supportsReal=false;
// r1, r2 in cm (radius!), v1 in m/s. ex: which NCERT preset is loaded (null = free exploring).
export const defaults={r1:2,r2:1,v1:0.5,bands:true,ex:null,diam:false};
/** NCERT XI (rationalised) Ch 9, Exercise 9.16: spray pump. A1 = 8.0 cm², 40 holes of diameter 1.0 mm, v1 = 1.5 m/min. */
export const SPRAY={A1:8.0e-4,n:40,d:1.0e-3,v1:1.5/60};
SPRAY.A2=SPRAY.n*Math.PI*(SPRAY.d/2)**2;              // 3.1416e-5 m²
SPRAY.v2=SPRAY.A1*SPRAY.v1/SPRAY.A2;                   // 0.6366 m/s (NCERT answer 0.64 m/s)
SPRAY.r1cm=Math.sqrt(SPRAY.A1/Math.PI)*100;            // equivalent single radius 1.596 cm
SPRAY.r2cm=Math.sqrt(SPRAY.A2/Math.PI)*100;            // one hole of the same total area: 0.316 cm
export const area=rcm=>Math.PI*(rcm/100)**2;           // m²
/** A1v1 = A2v2 for an ideal (incompressible, steady) fluid. */
export function flow(p){let A1=area(p.r1),A2=area(p.r2);if(p.ex==='spray'){A1=SPRAY.A1;A2=SPRAY.A2}
  const Q=A1*p.v1,v2=Q/A2;return{A1,A2,Q,v2,areaRatio:A1/A2,speedRatio:v2/p.v1,radiusRatio:Math.sqrt(A1/A2)}}
const sig=(x,n=3)=>{if(!isFinite(x))return'–';if(x===0)return'0';const a=Math.abs(x);return a>=1e4||a<1e-3?x.toExponential(n-1).replace('e','×10^').replace(/\^\+?(-?\d+)/,(m,e)=>sup(e)):(+x.toPrecision(n)).toString()};
const S='⁰¹²³⁴⁵⁶⁷⁸⁹',sup=e=>e.replace('-','⁻').replace(/\d/g,d=>S[d]);
export {sig};
export function readouts(p){const f=flow(p);
  const out={A1:sig(f.A1*1e4,4)+' cm²',A2:sig(f.A2*1e4,4)+' cm²',v1:sig(p.v1,3)+' m/s',v2:sig(f.v2,4)+' m/s',
    Q:sig(f.Q*1e6,4)+' cm³/s',Ql:sig(f.Q*6e4,3)+' L/min',ar:sig(f.areaRatio,4)+' : 1',vr:sig(f.speedRatio,4)+' ×'};
  let note=`A₁v₁ = ${sig(f.A1,4)} m² × ${sig(p.v1,3)} m/s = ${sig(f.Q,4)} m³/s  =  A₂v₂ = ${sig(f.A2,4)} m² × ${sig(f.v2,4)} m/s. Area ratio A₁/A₂ = ${sig(f.areaRatio,4)} = speed ratio v₂/v₁.`;
  if(p.ex==='spray')note=`NCERT Ex 9.16: A₁ = 8.0 cm², A₂ = 40 × π(0.5 mm)² = ${sig(f.A2*1e4,4)} cm², v₁ = 1.5 m/min = 0.025 m/s → v₂ = A₁v₁/A₂ = ${sig(f.v2,4)} m/s ≈ 0.64 m/s ✓ (the lab draws the 40 holes as one opening of the same total area).`;
  else if(p.diam){const wrong=(p.r1/p.r2);note+=` ⚠ Radius vs diameter: area ∝ r² ∝ d², so the ratio is (r₁/r₂)² = (d₁/d₂)² = ${sig(f.areaRatio,4)}. Mixing them up (r₁ with d₂) gives (r₁/2r₂)² = ${sig((wrong/2)**2,4)} — off by 4×. Forgetting the square gives ${sig(wrong,3)}.`}
  return{...out,note,_f:f}}
