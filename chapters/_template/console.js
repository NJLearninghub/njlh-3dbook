// Data-only control panel. Engine builds sliders/readouts/buttons from this.
export default {
  sliders:[{key:'a',label:'a',min:0,max:5,step:.1,unit:'m'}],
  readouts:[{key:'x',label:'x',unit:'m',dp:2}],
  buttons:[{id:'go',label:'▶ Go'},{id:'on',label:'Toggle',toggle:'on'}], // id → world.action(id); toggle → flips params[key]
  formula:'$$x=a\\sin t$$'
};
