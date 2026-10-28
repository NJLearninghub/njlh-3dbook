// Liquid-glass UI: brand, chapter card (step text + data-defined console), toolbar, steps menu, quiz.
import * as progress from './progress.js';
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'');
const ICON={menu:'M4 7h16M4 12h12M4 17h16',prev:'M15 6l-6 6 6 6',next:'M9 6l6 6-6 6',play:'M8 5l11 7-11 7z',pause:'M7 5h3v14H7zM14 5h3v14h-3z',
  snd:'M4 9h4l5-4v14l-5-4H4z',sndX:'M16 9l5 6M21 9l-5 6',theme:'M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z',quiz:'M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5',home:'M3 11l9-7 9 7M5 10v10h14V10'};
const btn=(id,ic,lab)=>`<button id="${id}" aria-label="${lab}" title="${lab}"><svg viewBox="0 0 24 24"><path d="${ICON[ic]}"${ic==='play'?' fill="currentColor"':''}/>${id==='bSnd'?`<path id="sndX" d="${ICON.sndX}"/>`:''}</svg></button>`;
export function renderMath(el){if(window.renderMathInElement)window.renderMathInElement(el,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false})}
export class UI{
  constructor(lab,spec,handlers){this.lab=lab;this.spec=spec||{};this.h=handlers;const c=lab.content;
    document.body.insertAdjacentHTML('beforeend',`
<a class="brand glass" href="${lab.root}index.html">NJ Learning Hub · <b>Nihal Jani</b></a>
<div id="hint">drag to look · it eases back</div>
<div id="menu" class="glass"></div>
<div id="quiz"><div class="box glass"></div></div>
<div id="ui"><div id="card" class="glass"><div id="cardHead"><span class="n" id="stepN">1</span><span class="t" id="stepT"></span><span id="chev">▲</span></div>
<div id="cardBody"><div id="stepBody"></div><hr class="soft"><div id="console"></div></div></div>
<div id="bar" class="glass">${btn('bMenu','menu','Steps')}${btn('bPrev','prev','Previous step')}${btn('bPlay','play','Play')}<div id="dots"></div>${btn('bNext','next','Next step')}${btn('bSnd','snd','Sound')}${btn('bTheme','theme','Theme')}${c.quiz?.length?btn('bQuiz','quiz','Quiz'):''}</div></div>`);
    this.buildConsole();this.buildMenu();
    $('#cardHead').onclick=()=>$('#card').classList.toggle('open');
    if(innerWidth>=1000||innerHeight>700)$('#card').classList.add('open');
    $('#bPrev').onclick=()=>handlers.go(lab.step-1);$('#bNext').onclick=()=>handlers.go(lab.step+1);$('#bPlay').onclick=()=>handlers.play();
    $('#bSnd').onclick=()=>{lab.sound=!lab.sound;this.syncSound();lab.beep(660,.08)};this.syncSound();
    $('#bTheme').onclick=()=>handlers.theme();
    if($('#bQuiz'))$('#bQuiz').onclick=()=>this.openQuiz();
    $('#bMenu').onclick=e=>{e.stopPropagation();$('#menu').classList.toggle('show')};
    document.addEventListener('click',e=>{if(!e.target.closest('#menu'))$('#menu').classList.remove('show')});
    $('#quiz').onclick=e=>{if(e.target.id==='quiz')$('#quiz').classList.remove('show')};
  }
  syncSound(){$('#sndX').style.display=this.lab.sound?'none':''}
  setPlaying(p){$('#bPlay path').setAttribute('d',p?ICON.pause:ICON.play)}
  buildMenu(){const c=this.lab.content;$('#menu').innerHTML=c.steps.map((s,i)=>`<div data-i="${i}">${i+1}. ${esc(s.title)}</div>`).join('')+(c.quiz?.length?`<div data-q="1">★ Quick check (${c.quiz.length} Qs)</div>`:'')+`<a href="${this.lab.root}index.html">← All chapters</a>`;
    $('#menu').onclick=e=>{const d=e.target.closest('[data-i],[data-q]');if(!d)return;if(d.dataset.q)this.openQuiz();else this.h.go(+d.dataset.i);$('#menu').classList.remove('show')};
    $('#dots').innerHTML=c.steps.map((_,i)=>`<i data-i="${i}" title="Step ${i+1}"></i>`).join('');$('#dots').onclick=e=>{const i=e.target.dataset.i;if(i!==undefined)this.h.go(+i)}}
  showStep(i){const c=this.lab.content,s=c.steps[i],seen=progress.get(c.slug).seen;
    $('#stepN').textContent=i+1;$('#stepT').innerHTML=`${esc(s.title)}<small>${esc(c.title)} · step ${i+1} of ${c.steps.length}</small>`;
    const ref=s.ref||c.ncert?.ref;
    $('#stepBody').innerHTML=`<div class="sec q"><div class="k">Question</div><p>${esc(s.question)}</p></div>
<div class="sec"><div class="k">Do this</div>${esc(s.action)}</div>
${s.expected?`<div class="sec"><div class="k">What to expect</div>${esc(s.expected)}</div>`:''}
${s.conclusion?`<details class="concl sec"><summary>Conclusion</summary><div>${esc(s.conclusion)}</div></details>`:''}
${s.math?`<div class="f">${s.math}</div>`:''}${ref?`<span class="ref">📖 ${esc(ref)}</span>`:''}`;
    renderMath($('#stepBody'));
    document.querySelectorAll('#dots i').forEach((d,j)=>{d.classList.toggle('cur',j===i);d.classList.toggle('seen',seen.includes(j))});
    document.querySelectorAll('#menu [data-i]').forEach((d,j)=>d.classList.toggle('cur',j===i));
    const hl=s.focus||[];document.querySelectorAll('#console .row').forEach(r=>r.classList.toggle('hl',hl.includes(r.dataset.k)));
    this.sync()}
  buildConsole(){const sp=this.spec,lab=this.lab,P=lab.params;let h='';
    if(sp.intro)h+=`<p class="note">${sp.intro}</p>`;
    if(lab.model.supportsReal)h+=`<div class="btns"><span class="seg" id="modeSeg"><button data-m="ideal">Ideal</button><button data-m="real">Real</button></span><span class="note" id="modeNote"></span></div>`;
    for(const s of sp.sliders||[])h+=`<div class="row" data-k="${s.key}"><span>${s.label}</span><input type="range" data-k="${s.key}" min="${s.min}" max="${s.max}" step="${s.step}" value="${P[s.key]}"><output data-o="${s.key}"></output></div>`;
    if(sp.readouts?.length)h+=`<div class="reads">${sp.readouts.map(r=>`<div>${r.label}<b data-r="${r.key}">–</b></div>`).join('')}</div>`;
    if(sp.buttons?.length)h+=`<div class="btns">${sp.buttons.map(b=>`<button class="pill" data-b="${b.id}" ${b.toggle?`data-t="${b.toggle}"`:''}>${b.label}</button>`).join('')}</div>`;
    h+=`<div class="note" id="liveNote"></div>`;
    if(sp.formula)h+=`<div class="f">${sp.formula}</div>`;
    const el=$('#console');el.innerHTML=h;renderMath(el);
    el.querySelectorAll('input[type=range]').forEach(inp=>inp.oninput=()=>this.h.param(inp.dataset.k,+inp.value));
    el.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{if(b.dataset.t)this.h.param(b.dataset.t,!P[b.dataset.t]);else this.h.action(b.dataset.b)});
    el.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>this.h.mode(b.dataset.m))}
  sync(){const sp=this.spec,lab=this.lab,P=lab.params,el=$('#console');
    for(const s of sp.sliders||[]){const i=el.querySelector(`input[data-k="${s.key}"]`);if(+i.value!==P[s.key])i.value=P[s.key];el.querySelector(`[data-o="${s.key}"]`).textContent=`${(+P[s.key]).toFixed(s.dp??(s.step<1?1:0))} ${s.unit||''}`}
    el.querySelectorAll('[data-t]').forEach(b=>b.classList.toggle('on',!!P[b.dataset.t]));
    el.querySelectorAll('[data-m]').forEach(b=>b.classList.toggle('on',b.dataset.m===lab.mode));
    const mn=$('#modeNote');if(mn)mn.textContent=lab.mode==='real'?(lab.model.realNote||'real-world effects on'):'textbook assumptions';
    this.readouts()}
  readouts(){const sp=this.spec,lab=this.lab;if(!lab.model.readouts)return;const r=lab.model.readouts(lab.params,lab.mode,lab.state);
    for(const o of sp.readouts||[]){const e=document.querySelector(`[data-r="${o.key}"]`);if(!e)continue;const v=r[o.key];e.textContent=v==null?'–':(typeof v==='number'?v.toFixed(o.dp??1):v)+(o.unit?' '+o.unit:'')}
    const ln=$('#liveNote');if(ln)ln.textContent=r.note||''}
  openQuiz(){const c=this.lab.content,Q=c.quiz,ans={};const box=$('#quiz .box');
    box.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:18px">Quick check · ${esc(c.title)}</b><button class="pill" id="qClose">✕</button></div>`+
      Q.map((q,i)=>`<div class="qq" data-q="${i}"><b>${i+1}.</b> ${q.q}<div class="opts">${q.options.map((o,j)=>`<button class="pill" data-o="${j}">${o}</button>`).join('')}</div>${q.why?`<div class="why">${q.why}</div>`:''}</div>`).join('')+`<div id="qScore" style="font-weight:600;margin-top:8px"></div>`;
    renderMath(box);$('#quiz').classList.add('show');$('#qClose').onclick=()=>$('#quiz').classList.remove('show');
    box.querySelectorAll('.qq').forEach(d=>d.onclick=e=>{const b=e.target.closest('[data-o]');if(!b)return;const qi=+d.dataset.q;if(qi in ans)return;const ok=+b.dataset.o===Q[qi].answer;ans[qi]=ok;
      b.classList.add(ok?'ok':'no');if(!ok)d.querySelectorAll('[data-o]')[Q[qi].answer].classList.add('ok');d.classList.add('done');this.lab.beep(ok?880:200,.12);
      const n=Object.keys(ans).length;if(n===Q.length){const s=Object.values(ans).filter(Boolean).length;$('#qScore').textContent=`Score: ${s} / ${Q.length}`;progress.markQuiz(c.slug,s,Q.length)}})}}
