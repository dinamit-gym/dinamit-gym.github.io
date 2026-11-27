(()=>{
const repo='https://api.github.com/repos/dinamit-gym/dinamit-gym.github.io';
const api=repo+'/contents/data/massage-busy.json';
const storeName='dinamit-trainer-key';
const zone=7*3600e3,dayMs=864e5,daysAhead=14,first=7*60,last=22*60+30;
const weekdays=['вс','пн','вт','ср','чт','пт','сб'];
const weekdaysFull=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
const months=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const $=selector=>document.querySelector(selector);
const login=$('#login'),app=$('#app'),keyInput=$('#key'),loginError=$('.trainer-error');
const status=$('.trainer-status'),daysBox=$('.trainer-days'),slotsBox=$('.trainer-slots'),dayTitle=$('.trainer-day-title');
let key='',sha='',busy={},selected=0,timer=0,saving=false,dirty=false;
const readKey=()=>{try{return localStorage.getItem(storeName)||'';}catch(e){return'';}};
const keepKey=value=>{try{if(value)localStorage.setItem(storeName,value);else localStorage.removeItem(storeName);}catch(e){}};
const pad=n=>String(n).padStart(2,'0');
const local=ms=>new Date(ms+zone);
const dateKey=d=>d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate());
const clock=m=>pad(Math.floor(m/60))+':'+pad(m%60);
const capital=s=>s[0].toUpperCase()+s.slice(1);
const nowMinutes=()=>{const d=local(Date.now());return d.getUTCHours()*60+d.getUTCMinutes();};
const dayAt=offset=>local(Date.now()+offset*dayMs);
const headers=extra=>Object.assign({Authorization:'Bearer '+key,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},extra);
const say=(text,tone)=>{status.textContent=text;status.dataset.tone=tone||'';};
const keyProblem='Ключ не подходит или закончился его срок. Попроси новый ключ у владельца сайта.';
async function pull(){
const response=await fetch(api+'?ref=main&t='+Date.now(),{headers:headers(),cache:'no-store'});
if(response.status===401||response.status===403)throw Error('key');
if(response.status===404){
const access=await fetch(repo,{headers:headers(),cache:'no-store'});
if(!access.ok)throw Error('key');
sha='';
return{};
}
if(!response.ok)throw Error('net');
const file=await response.json();
sha=file.sha;
const data=JSON.parse(atob(file.content.split('\n').join('')));
return data&&typeof data.busy==='object'&&data.busy?data.busy:{};
}
function cleaned(){
const today=dateKey(dayAt(0)),out={};
Object.keys(busy).sort().forEach(k=>{
if(k>=today&&Array.isArray(busy[k])&&busy[k].length)out[k]=[...new Set(busy[k])].sort();
});
return out;
}
async function push(retry){
busy=cleaned();
const body=JSON.stringify({v:1,updated:new Date().toISOString(),busy:busy},null,1)+'\n';
const payload={message:'Массаж: занятое время',content:btoa(body),branch:'main'};
if(sha)payload.sha=sha;
const response=await fetch(api,{method:'PUT',headers:headers({'Content-Type':'application/json'}),body:JSON.stringify(payload)});
if(response.status===401||response.status===403||response.status===404)throw Error('key');
if((response.status===409||response.status===422)&&!retry){
const mine=busy;
await pull();
busy=mine;
return push(true);
}
if(!response.ok)throw Error('net');
sha=(await response.json()).content.sha;
}
function schedule(){
dirty=true;
say('Сохраняю…');
clearTimeout(timer);
timer=setTimeout(save,1200);
}
async function save(){
clearTimeout(timer);
if(saving||!dirty||!key)return;
saving=true;
dirty=false;
let problem='';
try{await push(false);}catch(error){dirty=true;problem=error.message;}
saving=false;
if(problem==='key')say(keyProblem,'error');
else if(problem){say('Не сохранилось — нет связи. Повторю сам, когда появится интернет. Не закрывай страницу.','error');timer=setTimeout(save,15000);}
else if(dirty)timer=setTimeout(save,800);
else say('Сохранено в '+clock(nowMinutes())+'. Клиенты увидят это на сайте через 1–2 минуты.','ok');
}
function renderDays(){
daysBox.replaceChildren(...Array.from({length:daysAhead},(_,offset)=>{
const d=dayAt(offset),count=(busy[dateKey(d)]||[]).length;
const button=document.createElement('button');
const top=document.createElement('small'),date=document.createElement('b'),mark=document.createElement('i');
button.type='button';
button.setAttribute('aria-pressed',String(offset===selected));
button.setAttribute('aria-label',capital(weekdaysFull[d.getUTCDay()])+', '+d.getUTCDate()+' '+months[d.getUTCMonth()]+(count?', отмечено занятых: '+count:''));
top.textContent=offset===0?'Сегодня':offset===1?'Завтра':capital(weekdays[d.getUTCDay()]);
date.textContent=d.getUTCDate();
mark.textContent=count?'занято '+count:'';
button.append(top,date,mark);
button.addEventListener('click',()=>{selected=offset;renderDays();renderSlots();});
return button;
}));
}
function renderSlots(){
const d=dayAt(selected),k=dateKey(d),marked=new Set(busy[k]||[]),now=nowMinutes();
dayTitle.textContent=capital(weekdaysFull[d.getUTCDay()])+', '+d.getUTCDate()+' '+months[d.getUTCMonth()];
const buttons=[];
for(let m=first;m<=last;m+=30){
const time=clock(m),button=document.createElement('button');
button.type='button';
button.textContent=time;
button.setAttribute('aria-pressed',String(marked.has(time)));
button.disabled=selected===0&&m+30<=now;
button.addEventListener('click',()=>{
const list=new Set(busy[k]||[]);
if(list.has(time))list.delete(time);else list.add(time);
busy[k]=[...list].sort();
button.setAttribute('aria-pressed',String(list.has(time)));
renderDays();
schedule();
});
buttons.push(button);
}
slotsBox.replaceChildren(...buttons);
}
function showLogin(message){
app.hidden=true;
login.hidden=false;
loginError.textContent=message||'';
say('');
}
async function start(){
say('Загружаю отметки…');
try{busy=await pull();}catch(error){
if(error.message==='key'){key='';keepKey('');showLogin(keyProblem);return;}
say('Нет связи. Проверь интернет и обнови страницу.','error');
return;
}
keepKey(key);
login.hidden=true;
app.hidden=false;
renderDays();
renderSlots();
say('Нажми на время, которое уже занято. Сохраняется само.');
}
login.addEventListener('submit',event=>{
event.preventDefault();
key=keyInput.value.trim();
keyInput.value='';
if(key)start();
});
$('#clear-day').addEventListener('click',()=>{
const k=dateKey(dayAt(selected));
if(!(busy[k]||[]).length||!confirm('Убрать все отметки на '+dayTitle.textContent.toLowerCase()+'?'))return;
delete busy[k];
renderDays();
renderSlots();
schedule();
});
$('#logout').addEventListener('click',()=>{
if(dirty||saving){say('Подожди, пока сохранится.','error');return;}
key='';
keepKey('');
showLogin('Ты вышел на этом устройстве. Чтобы вернуться, введи ключ.');
});
addEventListener('online',save);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save();});
addEventListener('beforeunload',event=>{if(dirty||saving){event.preventDefault();event.returnValue='';}});
setInterval(()=>{if(!app.hidden){renderDays();renderSlots();}},60000);
const hash=location.hash.slice(1);
if(hash.indexOf('key=')===0){
key=decodeURIComponent(hash.slice(4)).trim();
history.replaceState(null,'',location.pathname);
}else key=readKey();
if(key)start();else showLogin();
})();
