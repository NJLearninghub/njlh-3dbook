export default {
  intro:'Sliders set the <b>radius</b> r (not the diameter) of each end. Ideal fluid: incompressible, steady, non-viscous; the pipe is horizontal.',
  sliders:[{key:'r1',label:'r₁',min:.2,max:3,step:.05,unit:'cm',dp:2},{key:'r2',label:'r₂',min:.2,max:3,step:.05,unit:'cm',dp:2},{key:'v1',label:'v₁',min:.02,max:3,step:.01,unit:'m/s',dp:3}],
  readouts:[{key:'A1',label:'A₁'},{key:'A2',label:'A₂'},{key:'v1',label:'v₁'},{key:'v2',label:'v₂'},{key:'Q',label:'Q = Av'},{key:'Ql',label:'Q'},{key:'ar',label:'A₁/A₂'},{key:'vr',label:'v₂/v₁'}],
  buttons:[{id:'half',label:'r₂ = r₁/2'},{id:'spray',label:'📘 NCERT Ex 9.16'},{id:'bands',label:'Equal-volume packets',toggle:'bands'},{id:'diam',label:'r vs d check',toggle:'diam'}],
  formula:'$$A_1v_1=A_2v_2=Q\\qquad A=\\pi r^2=\\tfrac{\\pi d^2}{4}\\;\\Rightarrow\\;\\frac{v_2}{v_1}=\\frac{A_1}{A_2}=\\Big(\\frac{r_1}{r_2}\\Big)^2$$<p class="note">Q: volume flow rate (discharge), m³ s⁻¹. NCERT Eq. (9.10)–(9.11).</p>'
};
