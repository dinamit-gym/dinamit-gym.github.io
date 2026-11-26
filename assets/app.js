const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollLocks=new Set();
let savedScroll=0;
function lockScroll(owner,locked){
if(locked){
if(scrollLocks.has(owner))return;
if(!scrollLocks.size){
savedScroll=window.scrollY;
document.body.style.top=`-${savedScroll}px`;
document.body.classList.add('scroll-locked');
}
scrollLocks.add(owner);
}else{
scrollLocks.delete(owner);
if(!scrollLocks.size&&document.body.classList.contains('scroll-locked')){
document.body.classList.remove('scroll-locked');
document.body.style.top='';
window.scrollTo({top:savedScroll,behavior:'instant'});
}
}
}
const menuBtn=document.querySelector('.menu-btn');
const nav=document.querySelector('.nav');
if(menuBtn&&nav){
[...nav.children].forEach((link,i)=>link.style.setProperty('--menu-order',i));
const mobile=window.matchMedia('(max-width: 1100px)');
const setMenu=(open,returnFocus=false)=>{
menuBtn.setAttribute('aria-expanded',String(open));
menuBtn.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
nav.classList.toggle('open',open);
document.body.classList.toggle('menu-open',open);
lockScroll('menu',open);
document.querySelectorAll('main, .footer, .dock').forEach(el=>{el.inert=open;});
if(returnFocus)menuBtn.focus({preventScroll:true});
};
menuBtn.addEventListener('click',()=>{
setMenu(menuBtn.getAttribute('aria-expanded')!=='true');
});
nav.addEventListener('click',e=>{
if(e.target.closest('a'))setMenu(false);
});
document.addEventListener('keydown',e=>{
if(menuBtn.getAttribute('aria-expanded')!=='true')return;
if(e.key==='Escape'){e.preventDefault();setMenu(false,true);}
if(e.key==='Tab'){
const items=[menuBtn,...nav.querySelectorAll('a')];
const first=items[0];
const last=items[items.length-1];
if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
}
});
mobile.addEventListener('change',()=>{if(!mobile.matches)setMenu(false);});
document.addEventListener('click',e=>{
if(menuBtn.getAttribute('aria-expanded')==='true'&&!e.target.closest('.header'))setMenu(false);
});
}
const lightbox=document.querySelector('.lightbox');
if(lightbox&&lightbox.showModal){
const img=lightbox.querySelector('img');
const caption=lightbox.querySelector('.lightbox-caption');
const count=lightbox.querySelector('.lightbox-count');
const photos=[...document.querySelectorAll('[data-full]')];
let index=0;
let opener;
const showPhoto=next=>{
index=(next+photos.length)%photos.length;
const photo=photos[index];
img.src=photo.dataset.full;
img.alt=photo.querySelector('img').alt;
caption.textContent=img.alt;
count.textContent=`${index + 1} / ${photos.length}`;
};
photos.forEach((button,i)=>{
button.addEventListener('click',()=>{
opener=button;
showPhoto(i);
lightbox.showModal();
lockScroll('lightbox',true);
});
});
lightbox.querySelector('.lightbox-close').addEventListener('click',()=>lightbox.close());
lightbox.querySelector('[data-prev]').addEventListener('click',()=>showPhoto(index-1));
lightbox.querySelector('[data-next]').addEventListener('click',()=>showPhoto(index+1));
lightbox.addEventListener('keydown',e=>{
if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
e.preventDefault();
showPhoto(index+(e.key==='ArrowLeft'?-1:1));
}
});
let touchStart;
img.addEventListener('touchstart',e=>{
touchStart=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;
},{passive:true});
img.addEventListener('touchend',e=>{
if(!touchStart||!e.changedTouches.length)return;
const dx=e.changedTouches[0].clientX-touchStart.x;
const dy=e.changedTouches[0].clientY-touchStart.y;
if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)showPhoto(index+(dx<0?1:-1));
touchStart=null;
},{passive:true});
img.addEventListener('touchcancel',()=>{touchStart=null;},{passive:true});
lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close();});
lightbox.addEventListener('close',()=>{
lockScroll('lightbox',false);
opener?.focus({preventScroll:true});
});
}
const mapBtn=document.querySelector('[data-map]');
if(mapBtn){
mapBtn.closest('.map-load').addEventListener('click',e=>{if(e.target!==mapBtn)mapBtn.click();});
mapBtn.addEventListener('click',()=>{
const frame=document.createElement('iframe');
frame.src='https://www.openstreetmap.org/export/embed.html?bbox=84.9443%2C56.4631%2C84.9523%2C56.4661&layer=mapnik&marker=56.464605%2C84.948278';
frame.title='Карта: Томск, проспект Ленина, 30/2';
frame.allowFullscreen=true;
const box=mapBtn.closest('.map');
box.querySelector('.map-load').remove();
box.append(frame);
});
}
const reveals=document.querySelectorAll('.reveal');
let revealObserver;
const revealAll=()=>{
reveals.forEach(el=>el.classList.add('in'));
revealObserver?.disconnect();
};
if(typeof IntersectionObserver==='function'&&!motion.matches){
revealObserver=new IntersectionObserver(entries=>{
entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in');revealObserver.unobserve(entry.target);}});
},{rootMargin:'0px',threshold:0});
reveals.forEach(el=>{
const section=el.closest('.section');
const direction=[...document.querySelectorAll('.section')].indexOf(section)%3;
el.style.setProperty('--reveal-x',`${direction === 0 ? -16 : direction === 1 ? 16 : 0}px`);
el.style.setProperty('--reveal-y',`${direction === 2 ? 24 : 12}px`);
const siblings=[...el.parentElement.children].filter(child=>child.classList.contains('reveal'));
el.style.setProperty('--reveal-delay',`${Math.min(siblings.indexOf(el), 3) * 90}ms`);
el.addEventListener('transitionend',e=>{
if(e.propertyName==='opacity'&&el.classList.contains('in'))el.style.removeProperty('--reveal-delay');
});
revealObserver.observe(el);
});
document.documentElement.classList.add('motion-ready');
}else{
revealAll();
}
window.addEventListener('beforeprint',revealAll);
motion.addEventListener('change',()=>{if(motion.matches)revealAll();});
if(motion.matches)revealAll();
const ticker=document.querySelector('.ticker');
if(ticker){
const track=ticker.firstElementChild;
const group=document.createElement('div');
group.className='ticker-group';
group.append(...track.children);
const copy=group.cloneNode(true);
copy.setAttribute('aria-hidden','true');
track.className='ticker-track';
track.append(group,copy);
ticker.classList.add('ticker-ready');
}
const header=document.querySelector('.header');
const updateHeader=()=>header?.classList.toggle('scrolled',(scrollLocks.size?savedScroll:window.scrollY)>40);
window.addEventListener('scroll',updateHeader,{passive:true});
updateHeader();
const sectionLinks=[...document.querySelectorAll('.nav a[href^="#"]')];
const sections=sectionLinks.map(link=>document.querySelector(link.hash)).filter(Boolean);
if(typeof IntersectionObserver==='function'&&sections.length){
const activeSections=new Set();
const updateActive=()=>{
const current=[...activeSections].sort((a,b)=>Math.abs(a.getBoundingClientRect().top-90)-Math.abs(b.getBoundingClientRect().top-90))[0];
sectionLinks.forEach(link=>{
if(current&&link.hash==='#'+current.id)link.setAttribute('aria-current','location');
else link.removeAttribute('aria-current');
});
};
const sectionObserver=new IntersectionObserver(entries=>{
entries.forEach(entry=>entry.isIntersecting?activeSections.add(entry.target):activeSections.delete(entry.target));
updateActive();
},{rootMargin:'-80px 0px -45% 0px',threshold:0});
sections.forEach(section=>sectionObserver.observe(section));
}
const desktop=window.matchMedia('(hover: hover) and (pointer: fine)');
let callDlg;
function showCall(link){
if(!callDlg){
callDlg=document.createElement('dialog');
callDlg.className='call-dialog';
callDlg.setAttribute('aria-labelledby','call-title');
callDlg.innerHTML='<p class="call-kicker" id="call-title">Звони и записывайся</p>'+
'<a class="call-number"></a>'+
'<p class="call-hint">Набери номер с телефона. Время тренировки договариваешься с тренером.</p>'+
'<div class="call-actions"><button type="button" class="btn btn-fire call-copy">Скопировать номер</button>'+
'<button type="button" class="btn btn-ghost call-close">Закрыть</button></div>';
document.body.append(callDlg);
callDlg.querySelector('.call-close').addEventListener('click',()=>callDlg.close());
callDlg.addEventListener('click',e=>{if(e.target===callDlg)callDlg.close();});
callDlg.addEventListener('close',()=>lockScroll('call',false));
callDlg.querySelector('.call-copy').addEventListener('click',async e=>{
const btn=e.currentTarget;
const num=callDlg.querySelector('.call-number').textContent;
try{await navigator.clipboard.writeText(num);btn.textContent='Скопировано ✓';}
catch{getSelection().selectAllChildren(callDlg.querySelector('.call-number'));btn.textContent='Нажми Ctrl+C';}
});
}
const tel=link.getAttribute('href');
const pretty='+7 (952) 890-55-88';
const a=callDlg.querySelector('.call-number');
a.href=tel;a.textContent=tel==='tel:+79528905588'?pretty:tel.slice(4);
callDlg.querySelector('.call-copy').textContent='Скопировать номер';
lockScroll('call',true);
callDlg.showModal();
}
document.addEventListener('click',e=>{
const link=e.target.closest('a[href^="tel:"]');
if(!link||!desktop.matches||!window.HTMLDialogElement||link.closest('.call-dialog'))return;
e.preventDefault();
showCall(link);
});
const maxDialog=document.querySelector('#max-contact');
if(maxDialog?.showModal){
let maxOpener;
document.querySelectorAll('[data-max]').forEach(link=>link.addEventListener('click',e=>{
e.preventDefault();
maxOpener=link;
maxDialog.querySelector('.max-copy').textContent='Скопировать номер';
maxDialog.querySelector('.copy-status').textContent='';
maxDialog.showModal();
lockScroll('max',true);
}));
maxDialog.querySelector('.max-close').addEventListener('click',e=>{e.preventDefault();maxDialog.close();});
maxDialog.addEventListener('keydown',e=>{
if(e.key==='Escape'){e.preventDefault();e.stopPropagation();maxDialog.close();}
});
maxDialog.addEventListener('click',e=>{if(e.target===maxDialog)maxDialog.close();});
maxDialog.addEventListener('close',()=>{
lockScroll('max',false);
maxOpener?.focus({preventScroll:true});
});
maxDialog.querySelector('.max-copy').addEventListener('click',async e=>{
try{
await navigator.clipboard.writeText('+79528905588');
e.target.textContent='Скопировано ✓';
maxDialog.querySelector('.copy-status').textContent='Номер скопирован';
}catch{
getSelection().selectAllChildren(maxDialog.querySelector('.call-number'));
maxDialog.querySelector('.copy-status').textContent='Номер выделен. Скопируй его через меню устройства.';
e.target.textContent='Скопируй выделенный номер';
}
});
}
