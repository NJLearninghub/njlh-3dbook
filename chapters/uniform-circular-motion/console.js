export default {
  sliders:[{key:'r',label:'r',min:.5,max:2.5,step:.1,unit:'m'},{key:'v',label:'v',min:.5,max:6,step:.1,unit:'m/s'},{key:'m',label:'m',min:.05,max:1,step:.05,unit:'kg',dp:2}],
  readouts:[{key:'w',label:'ω',unit:'rad/s',dp:2},{key:'ac',label:'a꜀',unit:'m/s²'},{key:'T',label:'T',unit:'s',dp:2},{key:'f',label:'ν',unit:'Hz',dp:2},{key:'F',label:'F',unit:'N',dp:2}],
  buttons:[{id:'cut',label:'✂ Cut the string'}],
  formula:'$$\\omega=\\frac{v}{r},\\ a_c=\\frac{v^2}{r}=\\omega^2r,\\ T=\\frac{2\\pi r}{v},\\ \\nu=\\frac1T$$'
};
