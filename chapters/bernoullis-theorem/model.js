// Bernoulli's principle — pure functions, no three.js. SI inside.
// Scenes: 'pipe' = NCERT Fig. 9.9 (wide inlet B/C low at h1 → narrow outlet D/E high at h2),
//         'tank' = Fig. 9.10 Torricelli, 'lift' = Fig. 9.11 / Exercise 9.14.
export const supportsReal=false;
export const G=9.8,PA=1.013e5; // g (NCERT), atmospheric pressure (Pa)
export const defaults={scene:'pipe',v1:1.5,r1:2,r2:1.2,h1:1,h2:3,P1:40,rho:1000,
  y1:1,hT:1.8,PT:0,vt:70,vb:63,Aw:2.5,obj:'wing',spin:false,
  fig:true,packet:true,bars:false,ex:null};
export const EX914={vt:70,vb:63,Aw:2.5,rho:1.3}; // NCERT XI Part II Ch 9 Exercise 9.14 (answer ≈ 1.5×10³ N)
const area=rcm=>Math.PI*(rcm/100)**2;
/** Fig. 9.9: inlet (A1,v1,P1,h1) and outlet (A2,v2,P2,h2). Gauge pressures in Pa. */
export function pipe(p){const A1=area(p.r1),A2=area(p.r2),v2=A1*p.v1/A2,rho=p.rho,P1=p.P1*1e3;
  const ke1=.5*rho*p.v1**2,ke2=.5*rho*v2**2,pe1=rho*G*p.h1,pe2=rho*G*p.h2;const P2=P1+ke1+pe1-ke2-pe2;
  return{A1,A2,v1:p.v1,v2,P1,P2,ke1,ke2,pe1,pe2,t1:P1+ke1+pe1,t2:P2+ke2+pe2,dK:ke2-ke1,dU:pe2-pe1,W:P1-P2,Q:A1*p.v1}}
/** Fig. 9.10 / Eq. (9.14): v1 = sqrt(2gh + 2(P−Pa)/ρ); open tank PT=0 → Torricelli (9.15). */
export function tank(p){const v=Math.sqrt(Math.max(0,2*G*p.hT+2*p.PT*1e3/p.rho)),t=Math.sqrt(2*p.y1/G);return{v,vOpen:Math.sqrt(2*G*p.hT),t,range:v*t}}
/** Dynamic lift: ΔP = ½ρ(v_top² − v_bottom²) (heights neglected), F = ΔP·A. */
export function lift(p){const dP=.5*p.rho*(p.vt**2-p.vb**2);return{dP,F:dP*p.Aw}}
export function fmtP(x){if(Math.abs(x)<5e-9)x=0;const a=Math.abs(x);if(!isFinite(x))return'–';if(a>=1e6)return(x/1e6).toFixed(3)+' MPa';if(a>=1e4)return(x/1e3).toFixed(2)+' kPa';if(a>=1e3)return(x/1e3).toFixed(3)+' kPa';if(a>=10)return(Math.round(x*100)/100).toFixed(2)+' Pa';return x.toFixed(2)+' Pa'}
export const short=x=>{if(Math.abs(x)<5e-9)x=0;const a=Math.abs(x);return a>=1e4?(x/1e3).toFixed(1)+' kPa':a>=1e3?(x/1e3).toFixed(2)+' kPa':a>=10?x.toFixed(0)+' Pa':x.toFixed(1)+' Pa'};
const fv=v=>v>=100?v.toFixed(1):v>=1?v.toFixed(3):v.toPrecision(3);
const fN=F=>Math.abs(F)>=1e4?(F/1e3).toFixed(1)+' kN':F.toFixed(0)+' N';
export function readouts(p){
  if(p.scene==='tank'){const t=tank(p);let note=`v₁ = √(2gh${p.PT?' + 2(P−Pₐ)/ρ':''}) = ${t.v.toFixed(3)} m/s (h = y₂ − y₁ = ${p.hT.toFixed(2)} m). Same as a stone dropped through h: √(2gh) = ${t.vOpen.toFixed(3)} m/s. The jet lands ${t.range.toFixed(2)} m from the wall after ${t.t.toFixed(3)} s (fall of y₁).`;
    if(p.PT)note+=` Closed tank, gauge P − Pₐ = ${p.PT} kPa → Eq. (9.14).`;
    return{tv:fv(t.v)+' m/s',th:p.hT.toFixed(2)+' m',ty1:p.y1.toFixed(2)+' m',tR:t.range.toFixed(2)+' m',tP:p.PT?p.PT.toFixed(1)+' kPa':'0 (open)',note}}
  if(p.scene==='lift'){const l=lift(p);let note=`ΔP = ½ρ(v_top² − v_bottom²) = ½ × ${p.rho} × (${p.vt}² − ${p.vb}²) = ${fmtP(l.dP)}; F = ΔP × A = ${fmtP(l.dP)} × ${p.Aw} m² = ${fN(l.F)}.`;
    const isEx=p.vt===70&&p.vb===63&&p.Aw===2.5&&p.rho===1.3;if(isEx)note+=' NCERT Ex 9.14 answer ≈ 1.5 × 10³ N ✓';
    if(p.obj==='ball')note=p.vt===p.vb?'Ball without spin (Fig. 9.11a): streamlines symmetric, equal speeds above and below → ΔP = 0, no lift.':`Spinning ball (Fig. 9.11b): air relative to the ball is faster above, so pressure is lower above → net force upward (Magnus effect). ΔP = ${fmtP(l.dP)}.`;
    return{lt:fv(p.vt)+' m/s',lb:fv(p.vb)+' m/s',ldP:fmtP(l.dP),lF:fN(l.F),lA:p.Aw+' m²',note}}
  const s=pipe(p);const abs2=PA+s.P2;
  let note=`Inlet: ${fmtP(s.P1)} + ${fmtP(s.ke1)} + ${fmtP(s.pe1)} = ${fmtP(s.t1)} · Outlet: ${fmtP(s.P2)} + ${fmtP(s.ke2)} + ${fmtP(s.pe2)} = ${fmtP(s.t2)}. P = gauge pressure (above atmospheric).`;
  if(s.P2<0)note+=abs2>0?` P₂ gauge is negative: the fluid is below atmospheric pressure (absolute ≈ ${fmtP(abs2)}). That is allowed — a side tube there would suck in air rather than hold a column.`:` ⚠ Absolute P₂ = Pₐ + P₂ = ${fmtP(abs2)} < 0, which is impossible: a real liquid would cavitate (boil) and the ideal model breaks down. Lower v₁ or h₂, or raise P₁.`;
  return{P1:fmtP(s.P1),P2:fmtP(s.P2),v1:fv(s.v1)+' m/s',v2:fv(s.v2)+' m/s',A1:(s.A1*1e4).toPrecision(4)+' cm²',A2:(s.A2*1e4).toPrecision(4)+' cm²',
    W:fmtP(s.W),dK:fmtP(s.dK),dU:fmtP(s.dU),ke1:fmtP(s.ke1),ke2:fmtP(s.ke2),pe1:fmtP(s.pe1),pe2:fmtP(s.pe2),t1:fmtP(s.t1),t2:fmtP(s.t2),note}}
