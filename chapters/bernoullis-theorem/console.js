export default {
  intro:'Ideal fluid: incompressible, non-viscous, steady (streamline) flow. P = gauge pressure; h = height of the pipe’s centre line above the ground; radii are drawn to a separate scale.',
  sliders:[{key:'v1',label:'v₁',min:0,max:10,step:.05,unit:'m/s',dp:2},{key:'r1',label:'r₁',min:.5,max:3,step:.05,unit:'cm',dp:2},{key:'r2',label:'r₂',min:.5,max:3,step:.05,unit:'cm',dp:2},
    {key:'h1',label:'h₁',min:.5,max:6,step:.05,unit:'m',dp:2},{key:'h2',label:'h₂',min:.5,max:6,step:.05,unit:'m',dp:2},{key:'P1',label:'P₁',min:-50,max:200,step:.5,unit:'kPa',dp:1},
    {key:'hT',label:'h',min:.1,max:5,step:.05,unit:'m',dp:2},{key:'y1',label:'y₁',min:.2,max:3,step:.05,unit:'m',dp:2},{key:'PT',label:'P−Pₐ',min:0,max:200,step:1,unit:'kPa',dp:0},
    {key:'vt',label:'v top',min:0,max:100,step:.5,unit:'m/s',dp:1},{key:'vb',label:'v bottom',min:0,max:100,step:.5,unit:'m/s',dp:1},{key:'Aw',label:'A',min:.5,max:50,step:.5,unit:'m²',dp:1},
    {key:'rho',label:'ρ',min:1,max:1500,step:.1,unit:'kg/m³',dp:1}],
  readouts:[{key:'P1',label:'P₁'},{key:'P2',label:'P₂'},{key:'v1',label:'v₁'},{key:'v2',label:'v₂'},{key:'A1',label:'A₁'},{key:'A2',label:'A₂'},
    {key:'W',label:'W/ΔV = P₁−P₂'},{key:'dK',label:'ΔK/ΔV'},{key:'dU',label:'ΔU/ΔV'},{key:'ke1',label:'½ρv₁²'},{key:'ke2',label:'½ρv₂²'},{key:'pe1',label:'ρgh₁'},{key:'pe2',label:'ρgh₂'},{key:'t1',label:'Total₁'},{key:'t2',label:'Total₂'},
    {key:'tv',label:'v₁ (efflux)'},{key:'th',label:'h'},{key:'ty1',label:'y₁'},{key:'tR',label:'lands at'},{key:'tP',label:'P−Pₐ'},
    {key:'lt',label:'v top'},{key:'lb',label:'v bottom'},{key:'ldP',label:'ΔP'},{key:'lF',label:'lift F'},{key:'lA',label:'area'}],
  buttons:[{id:'fig99',label:'📘 Fig 9.9',toggle:'fig'},{id:'packet',label:'Packet B→C, D→E',toggle:'packet'},{id:'bars',label:'Term bars',toggle:'bars'},{id:'reset',label:'↺ Reset'},
    {id:'open',label:'Open tank'},{id:'ex914',label:'📘 NCERT Ex 9.14'},{id:'spin',label:'Spin the ball',toggle:'spin'}],
  formula:'$$P_1+\\tfrac12\\rho v_1^2+\\rho g h_1=P_2+\\tfrac12\\rho v_2^2+\\rho g h_2$$<p class="note">NCERT Eq. (9.12); in general $P+\\tfrac12\\rho v^2+\\rho gh=$ constant (9.13). Each term: Pa = J m⁻³. g = 9.8 m s⁻².</p>'
};
