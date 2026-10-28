// 1) Copy this folder to chapters/<slug>/  2) fill in this file  3) add a catalog.json entry (status:'live')
export default {
  slug:'my-chapter', title:'My Chapter', subject:'physics' /* or 'maths' */, class:11,
  stage:'paper' /* 'paper' | 'graph' (maths, axes+grid) | 'night' (dark + bloom) */,
  ncert:{chapter:1,chapterTitle:'NCERT chapter title',section:'1.1',ref:'NCERT Physics XI · Ch 1 · §1.1 (p. 1)'},
  question:'The guiding question for the whole chapter?',
  steps:[
    {id:'s1',title:'First step',shot:'overview',set:{a:1},/* layers:['main'], mode:'real', auto:'actionId', focus:['a'] */
     question:'What happens when…?',action:'Drag the slider a.',expected:'You should see…',conclusion:'Because $x = a t$ …'},
    {id:'s2',title:'Second step',shot:'close',question:'…?',action:'…',expected:'…',conclusion:'…'}],
  quiz:[{q:'Question?',options:['A','B','C','D'],answer:0,why:'Explanation.'}]
};
