export default {
  sliders:[{key:'u',label:'u',min:5,max:40,step:1,unit:'m/s'},{key:'th',label:'θ',min:5,max:85,step:1,unit:'°'},{key:'g',label:'g',min:1.6,max:25,step:.1,unit:'m/s²'},{key:'h',label:'h',min:0,max:30,step:1,unit:'m'}],
  readouts:[{key:'T',label:'T',unit:'s',dp:2},{key:'H',label:'H',unit:'m'},{key:'R',label:'R',unit:'m'},{key:'dev',label:'ΔR',unit:'%',dp:0}],
  buttons:[{id:'fire',label:'▶ Fire'},{id:'cmp',label:'θ vs 90°−θ',toggle:'cmp'},{id:'slow',label:'Slow-mo',toggle:'slow'}],
  formula:'$$T=\\frac{2u\\sin\\theta}{g},\\ H=\\frac{u^2\\sin^2\\theta}{2g},\\ R=\\frac{u^2\\sin2\\theta}{g}$$<p class="note">(formulas for h = 0; the lab also handles launch from a height h)</p>'
};
