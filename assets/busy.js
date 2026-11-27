(()=>{
const box=document.getElementById('busy');
if(!box||!window.fetch)return;
const zone=7*3600e3,dayMs=864e5;
const weekdays=['вс','пн','вт','ср','чт','пт','сб'];
const months=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const pad=n=>String(n).padStart(2,'0');
const local=ms=>new Date(ms+zone);
const dateKey=d=>d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate());
const clock=m=>pad(Math.floor(m/60))+':'+pad(m%60);
const date=d=>d.getUTCDate()+' '+months[d.getUTCMonth()];
const minutes=t=>{
if(typeof t!=='string'||t.length!==5||t[2]!==':')return-1;
const h=Number(t.slice(0,2)),m=Number(t.slice(3));
return h>=0&&h<24&&(m===0||m===30)?h*60+m:-1;
};
const dayName=(offset,d)=>{
if(offset===0)return'Сегодня, '+date(d);
if(offset===1)return'Завтра, '+date(d);
const w=weekdays[d.getUTCDay()];
return w[0].toUpperCase()+w.slice(1)+', '+date(d);
};
const when=ms=>{
const d=local(ms),k=dateKey(d),time=' в '+clock(d.getUTCHours()*60+d.getUTCMinutes());
if(k===dateKey(local(Date.now())))return'сегодня'+time;
if(k===dateKey(local(Date.now()-dayMs)))return'вчера'+time;
return date(d)+time;
};
fetch('data/massage-busy.json',{cache:'no-cache'})
.then(response=>response.ok?response.json():null)
.then(data=>{
if(!data||typeof data.busy!=='object'||!data.busy)return;
const now=Date.now(),today=local(now),nowMin=today.getUTCHours()*60+today.getUTCMinutes();
const rows=[];
for(let offset=0;offset<7;offset++){
const d=local(now+offset*dayMs),list=data.busy[dateKey(d)];
if(!Array.isArray(list))continue;
const starts=[...new Set(list.map(minutes).filter(m=>m>=0))].sort((a,b)=>a-b);
const ranges=[];
for(const start of starts){
const last=ranges[ranges.length-1];
if(last&&last[1]===start)last[1]=start+30;
else ranges.push([start,start+30]);
}
const ahead=ranges.filter(r=>offset>0||r[1]>nowMin);
if(ahead.length)rows.push([dayName(offset,d),ahead.map(r=>clock(r[0])+'–'+clock(r[1])).join(', ')]);
}
if(!rows.length)return;
box.querySelector('.busy-list').replaceChildren(...rows.map(row=>{
const item=document.createElement('li'),day=document.createElement('b'),times=document.createElement('span');
day.textContent=row[0];
times.textContent=row[1];
item.append(day,times);
return item;
}));
const updated=Date.parse(data.updated);
if(updated)box.querySelector('.busy-updated').textContent=' Обновлено '+when(updated)+'.';
box.hidden=false;
})
.catch(()=>{});
})();
