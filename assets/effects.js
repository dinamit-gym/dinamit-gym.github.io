(()=>{
const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const hover=matchMedia('(hover: hover) and (pointer: fine)');
const hero=document.querySelector('.hero, .page-hero');
const photo=document.querySelector('.hero-photo img');
const counters=[...document.querySelectorAll('[data-count]')];
const counting=new Map();
let frame=0,inView=false,fireTimer,holdTimer,burstAt=-2000;
root.classList.add('effects-ready');
const toast=document.createElement('div');
toast.className='secret-toast';
toast.setAttribute('role','status');
toast.setAttribute('aria-atomic','true');
document.body.append(toast);
let toastTimer;
function say(message){
clearTimeout(toastTimer);
toast.textContent=message;
toast.classList.add('shown');
toastTimer=setTimeout(()=>toast.classList.remove('shown'),4500);
}
function burst(x,y){
if(reduced.matches||document.hidden||performance.now()-burstAt<1800)return;
burstAt=performance.now();
const field=document.createElement('div');
field.className='spark-burst';
field.setAttribute('aria-hidden','true');
field.style.setProperty('--x',`${x}px`);
field.style.setProperty('--y',`${y}px`);
for(let i=0;i<19;i++){
const spark=document.createElement('i');
const angle=i*Math.PI*2/18;
const distance=45+Math.random()*95;
spark.style.setProperty('--dx',`${Math.cos(angle) * distance}px`);
spark.style.setProperty('--dy',`${Math.sin(angle) * distance - 35}px`);
spark.style.setProperty('--turn',`${i * 53}deg`);
field.append(spark);
}
document.body.append(field);
setTimeout(()=>field.remove(),1200);
return true;
}
if(hero){
const field=document.createElement('div');
field.className='ember-field';
field.setAttribute('aria-hidden','true');
for(let i=0;i<12;i++){
const ember=document.createElement('i');
ember.style.cssText=`--left:${5 + i * 8}%;--drift:${(i % 3 - 1) * 38}px;--duration:${9 + i % 5}s;--delay:-${i * 1.7}s`;
field.append(ember);
}
hero.append(field);
if(typeof IntersectionObserver==='function'){
const ambient=new IntersectionObserver(entries=>entries.forEach(entry=>{
entry.target.classList.toggle('embers-on',entry.isIntersecting);
if(entry.target===hero){inView=entry.isIntersecting;schedule();}
}));
[hero,...document.querySelectorAll('.trial-offer, .cta')].forEach(el=>ambient.observe(el));
}
}
const fuse=document.createElement('div');
fuse.className='scroll-fuse';
fuse.setAttribute('aria-hidden','true');
fuse.innerHTML='<i></i><b></b>';
document.body.append(fuse);
function finishCount(el){
el.firstElementChild.textContent=el.getAttribute('aria-label');
el.dataset.counted='true';
counting.delete(el);
}
function tick(now){
frame=0;
if(reduced.matches||document.hidden)return;
const y=document.body.classList.contains('scroll-locked')?-parseFloat(document.body.style.top||0):scrollY;
const height=document.body.classList.contains('scroll-locked')?document.body.scrollHeight:root.scrollHeight;
const progress=Math.max(0,Math.min(1,y/Math.max(1,height-innerHeight)));
fuse.firstElementChild.style.transform=`scaleX(${progress})`;
fuse.lastElementChild.style.transform=`translate3d(${progress * (innerWidth - 6)}px,0,0)`;
if(photo&&inView)photo.style.transform=`translate3d(0,${Math.min(y * .055, 36)}px,0) scale(1.07)`;
for(const[el,start]of counting){
const t=Math.min(1,(now-start)/1100);
el.firstElementChild.textContent=Math.round(Number(el.dataset.count)*(1-(1-t)**3)).toLocaleString('ru-RU');
if(t===1)finishCount(el);
}
if(counting.size)schedule();
}
function schedule(){
if(!frame&&!reduced.matches&&!document.hidden)frame=requestAnimationFrame(tick);
}
if(typeof IntersectionObserver==='function'){
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
if(!entry.isIntersecting)return;
observer.unobserve(entry.target);
if(reduced.matches)finishCount(entry.target);
else{counting.set(entry.target,performance.now());schedule();}
}),{threshold:.5});
counters.forEach(el=>observer.observe(el));
}
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',schedule,{passive:true});
schedule();
let pointerFrame=0,pointerTarget,pointerRect,pointerX=0,pointerY=0,rippleAt=-1000;
const interactive='.btn, .feature, .price, .type, .massage-list > div';
function resetPointer(){
cancelAnimationFrame(pointerFrame);pointerFrame=0;
if(pointerTarget)['--mx','--my','--rx','--ry'].forEach(p=>pointerTarget.style.removeProperty(p));
pointerTarget=null;
}
document.addEventListener('pointermove',e=>{
if(e.pointerType==='touch'||!hover.matches||reduced.matches)return;
const target=e.target.closest(interactive);
if(!target||target.closest('.dock, .nav, .header, dialog')){resetPointer();return;}
if(target!==pointerTarget){
resetPointer();pointerTarget=target;pointerRect=target.getBoundingClientRect();
}
pointerX=(e.clientX-pointerRect.left)/pointerRect.width-.5;
pointerY=(e.clientY-pointerRect.top)/pointerRect.height-.5;
if(!pointerFrame)pointerFrame=requestAnimationFrame(()=>{
pointerFrame=0;
if(!pointerTarget)return;
const button=pointerTarget.matches('.btn');
pointerTarget.style.setProperty(button?'--mx':'--ry',`${Math.max(-1, Math.min(1, pointerX)) * (button ? 7 : 5)}${button ? 'px' : 'deg'}`);
pointerTarget.style.setProperty(button?'--my':'--rx',`${Math.max(-1, Math.min(1, pointerY)) * (button ? 7 : -5)}${button ? 'px' : 'deg'}`);
});
},{passive:true});
document.addEventListener('pointerout',e=>{
if(pointerTarget&&!pointerTarget.contains(e.relatedTarget))resetPointer();
});
addEventListener('scroll',resetPointer,{passive:true});
document.addEventListener('pointerdown',e=>{
const button=e.target.closest('.btn');
if(!button||reduced.matches||performance.now()-rippleAt<400)return;
rippleAt=performance.now();
const r=button.getBoundingClientRect();
const ripple=document.createElement('i');
ripple.className='button-ripple';
ripple.setAttribute('aria-hidden','true');
ripple.style.left=`${e.clientX - r.left}px`;
ripple.style.top=`${e.clientY - r.top}px`;
button.append(ripple);
setTimeout(()=>ripple.remove(),650);
},{passive:true});
const faqAnimations=new Map();
document.querySelectorAll('.faq details').forEach(details=>{
const answer=details.querySelector('p');
details.querySelector('summary').addEventListener('click',e=>{
if(reduced.matches)return;
e.preventDefault();
const previous=faqAnimations.get(details);
const reopening=Number(previous?.effect.getKeyframes().at(-1).opacity)===0;
previous?.cancel();
const moving=[...document.querySelectorAll('.faq details, main > section:last-child, .footer')];
const layout=open=>{
const tops=moving.map(el=>el.getBoundingClientRect().top);
details.open=open;
moving.forEach((el,i)=>{
const dy=tops[i]-el.getBoundingClientRect().top;
if(dy&&!reduced.matches)el.animate([{transform:`translateY(${dy}px)`},{transform:'none'}],{duration:300,easing:'cubic-bezier(.2,.7,.2,1)'});
});
};
if(!details.open||reopening){
layout(true);
const animation=answer.animate([{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'none'}],{duration:280});
faqAnimations.set(details,animation);
animation.onfinish=()=>faqAnimations.delete(details);
}else{
const animation=answer.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-6px)'}],{duration:180});
faqAnimations.set(details,animation);
animation.onfinish=()=>{layout(false);faqAnimations.delete(details);};
}
});
});
document.querySelectorAll('.logo').forEach(logo=>logo.addEventListener('click',e=>{
if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button)return;
let record={count:0,at:0};
try{record=JSON.parse(sessionStorage.getItem('dinamit-logo'))||record;}catch{}
record.count=Date.now()-record.at<3500?record.count+1:1;
record.at=Date.now();
if(record.count>=5){
e.preventDefault();record.count=0;
const r=logo.getBoundingClientRect();
say('Бабах! Энергии хватит на тренировку 💥');
const exploded=burst(r.left+20,r.top+20);
if(exploded)logo.querySelector('img')?.animate([{transform:'none'},{transform:'rotate(-16deg) scale(.7)',opacity:.4},{transform:'rotate(8deg) scale(1.15)'},{transform:'none',opacity:1}],{duration:800});
}else if(new URL(logo.href).pathname===location.pathname){
e.preventDefault();scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'});
}
try{sessionStorage.setItem('dinamit-logo',JSON.stringify(record));}catch{}
}));
function stopFire(){clearTimeout(fireTimer);document.body.classList.remove('fire-mode');}
function fire(){
say('Режим «Огонь»! Твой внутренний Динамит зажжён 🔥');
if(reduced.matches||document.body.classList.contains('fire-mode'))return;
document.body.classList.add('fire-mode');
burst(innerWidth*.5,Math.min(300,innerHeight*.4));
fireTimer=setTimeout(stopFire,10000);
}
const konami=['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a'];
let keys=[],typed='',keyAt=0;
document.addEventListener('keydown',e=>{
if(e.ctrlKey||e.altKey||e.metaKey||e.repeat||e.isComposing||e.target.closest('input, textarea, select, [contenteditable], dialog[open]')||document.body.classList.contains('menu-open'))return;
if(Date.now()-keyAt>4000){keys=[];typed='';}
keyAt=Date.now();
const key=e.key.toLowerCase();
keys.push(key);keys=keys.slice(-10);
if(key.length===1)typed=(typed+key).slice(-7);
else typed='';
if(keys.join()===konami.join()||typed==='динамит'){keys=[];typed='';fire();}
});
let holdX,holdY;
const cancelHold=()=>{clearTimeout(holdTimer);holdTimer=null;};
document.addEventListener('pointerdown',e=>{
cancelHold();
if(e.pointerType!=='touch'||e.target.closest('a, button, summary'))return;
if(!e.target.closest('[data-count], .cost, .big-price, .trial-offer, .cta'))return;
holdX=e.clientX;holdY=e.clientY;
holdTimer=setTimeout(()=>{
say('Искра поймана. Зажигай на тренировке! 💥');
if(!reduced.matches){try{navigator.vibrate?.(20);}catch{}burst(holdX,holdY);}
},1000);
},{passive:true});
document.addEventListener('pointermove',e=>{
if(holdTimer&&Math.hypot(e.clientX-holdX,e.clientY-holdY)>10)cancelHold();
},{passive:true});
['pointerup','pointercancel','scroll'].forEach(name=>addEventListener(name,cancelHold,{passive:true}));
const game=document.querySelector('[data-spark-game]');
if(game){
const button=game.querySelector('[data-ignite]');
const score=game.querySelector('[data-score]');
const home=game.querySelector('.game-home');
button.hidden=false;
let hits=0;
button.addEventListener('click',()=>{
if(hits>=5)return;
score.textContent=`${++hits} / 5`;
game.style.setProperty('--charge',hits/5);
if(!reduced.matches){
const r=button.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2);
button.style.transform=`translateX(${hits === 5 ? 0 : [0, 65, -55, 38, -30][hits]}px)`;
}
if(hits===5){
game.classList.add('game-won');button.disabled=true;
button.textContent='Фитиль зажжён!';
home.classList.add('game-home-ready');
toast.classList.remove('shown');
const result=game.querySelector('p');
result.setAttribute('role','status');
result.textContent='Бабах! Все пять искр твои. Теперь — на главную 💥';
}else if(reduced.matches)say(`Искра поймана! ${hits} из 5.`);
});
}
function calm(){
cancelHold();resetPointer();stopFire();
cancelAnimationFrame(frame);frame=0;
counters.forEach(finishCount);
document.querySelectorAll('.spark-burst, .button-ripple').forEach(el=>el.remove());
document.getAnimations().forEach(animation=>{if(animation.effect?.getTiming().iterations!==Infinity)animation.finish();});
}
reduced.addEventListener('change',()=>{if(reduced.matches)calm();else schedule();});
document.addEventListener('visibilitychange',()=>{
root.classList.toggle('page-hidden',document.hidden);
cancelHold();
if(document.hidden){cancelAnimationFrame(frame);frame=0;counters.forEach(finishCount);resetPointer();}
else schedule();
});
if(reduced.matches)calm();
console.info('%c\n  +-----------------------------+\n  |  Д И Н А М И Т   /   ТОМСК  |\n  |  []===[]   *   []===[]       |\n  |     ЗАЖГИ СВОЙ ФИТИЛЬ!      |\n  |     +7 (952) 890-55-88       |\n  +-----------------------------+\n','color:#ffad42;font:bold 14px monospace;background:#17110d;padding:12px;border-radius:10px');
})();
(()=>{
const hero=document.querySelector('.hero');
if(!hero||!window.WebGLRenderingContext)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const c=document.createElement('canvas');
const gl=c.getContext('webgl',{antialias:false,alpha:false,depth:false,powerPreference:'low-power'});
if(!gl)return;
const fs=`precision mediump float;uniform vec2 r;uniform vec2 mo;uniform float t;
vec2 h(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return -1.+2.*fract(sin(p)*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(dot(h(i),f),dot(h(i+vec2(1,0)),f-vec2(1,0)),u.x),mix(dot(h(i+vec2(0,1)),f-vec2(0,1)),dot(h(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y);}
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.);float s=t*.045;
vec2 q=vec2(n(p*1.2+s),n(p*1.2-s+4.));float f=.5+.5*n(p*1.5+q*1.9+vec2(s*1.4,-s));
vec3 col=mix(vec3(.62,.13,.10),vec3(1.,.42,.17),smoothstep(.28,.6,f));col=mix(col,vec3(1.,.78,.36),smoothstep(.64,.9,f));
vec2 cc=(uv-vec2(.5,.8))*vec2(r.x/r.y,1.);float m=clamp(1.1-length(cc*vec2(.8,1.9))*1.3+(f-.5)*.9,0.,1.);col=mix(vec3(.118,.106,.094),col,m*.82);vec2 d=(uv-mo)*vec2(r.x/r.y,1.);col+=vec3(1.,.5,.22)*.22*smoothstep(.55,0.,length(d));
col+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)*.035;gl_FragColor=vec4(col,1.);}`;
const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null;};
const vs=sh(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}');
const fr=sh(gl.FRAGMENT_SHADER,fs);
if(!vs||!fr)return;
const pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fr);gl.linkProgram(pr);
if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return;
gl.useProgram(pr);
gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
const ur=gl.getUniformLocation(pr,'r'),ut=gl.getUniformLocation(pr,'t'),um=gl.getUniformLocation(pr,'mo');
let mx=.75,my=.6,tx=-1,ty=-1;
hero.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const b=hero.getBoundingClientRect();tx=(e.clientX-b.left)/b.width;ty=1-(e.clientY-b.top)/b.height;kick();},{passive:true});
hero.addEventListener('pointerleave',()=>{tx=ty=-1;});
c.className='hero-shader';c.setAttribute('aria-hidden','true');
hero.prepend(c);
let w=1,hgt=1,visible=true,raf=0,last=0;
const t0=performance.now()-20000;
const size=()=>{const k=.5;w=c.width=Math.max(1,hero.clientWidth*k|0);hgt=c.height=Math.max(1,hero.clientHeight*k|0);gl.viewport(0,0,w,hgt);};
const draw=now=>{const sec=(now-t0)/1000;const ax=tx<0?.5+.16*Math.cos(sec*.23):tx,ay=ty<0?.68+.1*Math.sin(sec*.29):ty;mx+=(ax-mx)*.07;my+=(ay-my)*.07;gl.uniform2f(um,mx,my);gl.uniform2f(ur,w,hgt);gl.uniform1f(ut,sec);gl.drawArrays(gl.TRIANGLES,0,3);};
const loop=now=>{raf=0;if(!visible||document.hidden||reduce.matches)return;if(now-last>33){last=now;draw(now);}raf=requestAnimationFrame(loop);};
const kick=()=>{if(!raf&&visible&&!document.hidden&&!reduce.matches)raf=requestAnimationFrame(loop);};
new ResizeObserver(()=>{size();draw(performance.now());}).observe(hero);
new IntersectionObserver(e=>{visible=e[0].isIntersecting;kick();}).observe(hero);
document.addEventListener('visibilitychange',kick);
reduce.addEventListener&&reduce.addEventListener('change',kick);
size();draw(performance.now());c.classList.add('on');kick();
})();
(()=>{
const cine=document.querySelector('.cine');
if(!cine)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const frame=cine.querySelector('.cine-frame');
const parts=[...cine.querySelectorAll('.cine-copy .kicker, .cine-copy h2')];
const card=cine.querySelector('.cine-card');
const clamp=x=>Math.min(1,Math.max(0,x));
const ease=t=>1-Math.pow(1-t,3);
const seg=(p,a,b)=>ease(clamp((p-a)/(b-a)));
const reset=()=>[frame,card,...parts].forEach(el=>{el.style.transform='';el.style.opacity='';});
let queued=false;
const apply=()=>{
queued=false;
if(reduce.matches)return reset();
const r=cine.getBoundingClientRect();
if(r.bottom<-50||r.top>innerHeight+50)return;
const p=clamp(-r.top/Math.max(1,r.height-innerHeight)+.12);
const s=seg(p,0,.5);
frame.style.transform=`scale(${(.66 + .34 * s).toFixed(4)})`;
const h=seg(p,.2,.45);
parts.forEach(el=>{el.style.opacity=h.toFixed(3);el.style.transform=`translateY(${((1 - h) * 36).toFixed(1)}px)`;});
const c=seg(p,.4,.68);
card.style.opacity=c.toFixed(3);card.style.transform=`translateY(${((1 - c) * 48).toFixed(1)}px)`;
};
const queue=()=>{if(!queued){queued=true;requestAnimationFrame(apply);}};
addEventListener('scroll',queue,{passive:true});
addEventListener('resize',queue);
reduce.addEventListener&&reduce.addEventListener('change',queue);
apply();
})();
(()=>{
const band=document.querySelector('.band');
const img=band&&band.querySelector('.band-img');
if(!img)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let queued=false;
const apply=()=>{
queued=false;
if(reduce.matches){img.style.transform='';return;}
const r=band.getBoundingClientRect();
if(r.bottom<0||r.top>innerHeight)return;
const p=(innerHeight-r.top)/(innerHeight+r.height);
img.style.transform='translate3d(0,'+((.5-p)*r.height*.22).toFixed(1)+'px,0)';
};
const queue=()=>{if(!queued){queued=true;requestAnimationFrame(apply);}};
addEventListener('scroll',queue,{passive:true});
addEventListener('resize',queue);
apply();
})();
