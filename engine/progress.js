// Progress in localStorage: { [slug]: {seen:[stepIdx], last, quiz:{score,total}, t} }
const KEY='njlh3d:progress:v1';
export const all=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch{return{}}};
const save=o=>{try{localStorage.setItem(KEY,JSON.stringify(o))}catch{}};
export function get(slug){return all()[slug]||{seen:[],last:0}}
export function markStep(slug,i){const o=all(),p=o[slug]||{seen:[],last:0};if(!p.seen.includes(i))p.seen.push(i);p.last=i;p.t=Date.now();o[slug]=p;save(o);return p}
export function markQuiz(slug,score,total){const o=all(),p=o[slug]||{seen:[],last:0};p.quiz={score,total};o[slug]=p;save(o)}
export const prefs={get:(k,d)=>{try{const v=localStorage.getItem('njlh3d:'+k);return v===null?d:JSON.parse(v)}catch{return d}},set:(k,v)=>{try{localStorage.setItem('njlh3d:'+k,JSON.stringify(v))}catch{}}};
