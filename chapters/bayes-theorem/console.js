export default {
  sliders:[{key:'prev',label:'P(D)',min:.1,max:99.9,step:.1,unit:'%'},{key:'sens',label:'P(+|D)',min:50,max:100,step:1,unit:'%'},{key:'fpr',label:"P(+|D′)",min:0,max:30,step:.5,unit:'%'}],
  readouts:[{key:'pD',label:'P(D)',unit:'%'},{key:'sens',label:'P(+|D)',unit:'%',dp:0},{key:'fpr',label:"P(+|D′)",unit:'%'},{key:'pPos',label:'P(+)',unit:'%',dp:2},{key:'post',label:'P(D|+)',unit:'%'}],
  buttons:[{id:'sort',label:'▶ Sort'},{id:'retest',label:'↻ Test again'},{id:'freq',label:'Count tokens',toggle:'freq'},{id:'urn',label:'Bags scenario',toggle:'urn'},{id:'draw',label:'🎲 Draw a ball'},{id:'draw50',label:'×50 draws'}],
  formula:'$$P(E_i\\mid A)=\\frac{P(E_i)\\,P(A\\mid E_i)}{\\sum_{j=1}^{n}P(E_j)\\,P(A\\mid E_j)}$$<p class="note">E₁…Eₙ: a partition of the sample space (here D, D′ or Bags I, II, III); A: the evidence (a + test, a red ball).</p>'
};
