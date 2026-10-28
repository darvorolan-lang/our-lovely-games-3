const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const randCode=()=>{const s='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let o='';for(let i=0;i<5;i++)o+=s[Math.floor(Math.random()*s.length)];return o};
const W=320,H=192,T=16,COLS=110,PW=12,PH=14,SOLID='#BPC';
const LETTER='Untuk kamu, sayang...\n\nTerima kasih sudah jadi partner terbaik di dunia kecil kita.\nKamu sudah sampai di ujung petualangan ini, dan aku mau kamu tahu: aku selalu ingin melewati semua level bareng kamu.\n\nI love you. ♡\n\n- dari aku, yang selalu ada untukmu';
const CAT='<svg viewBox="0 0 120 90"><ellipse cx="60" cy="80" rx="48" ry="8" fill="#ff9ccb"/><ellipse cx="60" cy="60" rx="36" ry="22" fill="#8f7ee8"/><circle cx="84" cy="44" r="18" fill="#8f7ee8"/><polygon points="72,30 76,12 84,28" fill="#8f7ee8"/><polygon points="90,28 98,12 100,34" fill="#8f7ee8"/><path d="M76 44q4 4 8 0M92 44q4 4 8 0" stroke="#2a1846" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="82" cy="52" rx="3" ry="2" fill="#ff9ccb"/><path d="M28 60q-16-10-6-26" stroke="#8f7ee8" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M96 14l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1z" fill="#ff86c8"/></svg>';
const BOY='<svg viewBox="0 0 16 16"><rect x="3" y="1" width="10" height="4" fill="#2d2448"/><rect x="4" y="5" width="8" height="5" fill="#ffd9bd"/><rect x="2" y="10" width="12" height="6" fill="#5b8cff"/><rect x="5" y="7" width="1" height="2" fill="#2d2448"/><rect x="10" y="7" width="1" height="2" fill="#2d2448"/></svg>';
const GIRL='<svg viewBox="0 0 16 16"><rect x="2" y="1" width="12" height="5" fill="#8a3b5b"/><rect x="1" y="4" width="2" height="9" fill="#8a3b5b"/><rect x="13" y="4" width="2" height="9" fill="#8a3b5b"/><rect x="4" y="5" width="8" height="5" fill="#ffd9bd"/><rect x="5" y="7" width="1" height="2" fill="#2d2448"/><rect x="10" y="7" width="1" height="2" fill="#2d2448"/><rect x="3" y="10" width="10" height="5" fill="#ff8fb8"/></svg>';

/* ---------- aset gambar, suara, dan font (opsional, dari folder assets/) ---------- */
const CHAR_H=22;   // tinggi karakter di layar (piksel canvas). Naikkan/turunkan kalau ukurannya belum pas
const IMG={};
function ldImg(k,p){const i=new Image();i.src=p;IMG[k]=i;return i}
const ldOk=k=>!!(IMG[k]&&IMG[k].complete&&IMG[k].naturalWidth>0);
ldImg('boy','assets/images/characters/boy.png');ldImg('boyW1','assets/images/characters/boy_walk1.png');ldImg('boyW2','assets/images/characters/boy_walk2.png');
ldImg('girl','assets/images/characters/girl.png');ldImg('girlW1','assets/images/characters/girl_walk1.png');ldImg('girlW2','assets/images/characters/girl_walk2.png');
ldImg('bg','assets/images/backgrounds/game-bg.png');ldImg('pet','assets/images/items/pet.png');
const COIN_FRAMES=[1,2,3,4,5].map(i=>ldImg('coin'+i,'assets/images/items/heart'+i+'.png'));
function coinDraw(x,y){const f=COIN_FRAMES[Math.floor(performance.now()/120)%5];if(f.complete&&f.naturalWidth>0){ctx.drawImage(f,Math.round(x)-1,Math.round(y)-1,10,10)}else{heart(x,y,8,'#ff5c8a');rect(x+1,y+1,2,2,'#ffd1e6')}}
const SND={jump:'assets/sounds/click.mp3',coin:'assets/sounds/heart.mp3',win:'assets/sounds/win.mp3'};
let BGM=null;
function playBgm(){if(BGM)return;try{BGM=new Audio('assets/sounds/bgm.mp3');BGM.loop=true;BGM.volume=.25;BGM.play().catch(()=>{})}catch(e){}}

/* ---------- peta ---------- */
const SEG=[[0,13,10,2,'#'],[17,13,10,2,'#'],[35,16,10,2,'#'],[55,21,10,2,'#'],[81,12,10,2,'#'],[96,14,10,2,'#'],
[13,4,7,1,'B'],[30,4,6,1,'B'],[58,5,7,1,'B'],[66,3,5,1,'B'],[84,4,6,1,'B'],
[40,2,8,2,'#'],[43,3,7,3,'#'],[57,1,9,1,'#'],
[22,1,8,2,'P'],[70,1,8,2,'P'],[88,1,7,3,'P'],
[100,1,3,7,'F'],[104,5,7,3,'C']];
const MAP=Array.from({length:12},()=>Array(COLS).fill('.'));
for(const[x,w,y,h,t] of SEG)for(let r=y;r<y+h;r++)for(let c=x;c<x+w;c++)MAP[r][c]=t;
const HEARTS=[[3,8],[5,8],[7,8],[10,8],[14,5],[15,5],[16,5],[20,8],[24,7],[26,7],[31,4],[33,4],[37,8],[41,6],[45,5],[59,5],[61,5],[63,5],[67,3],[69,3],[72,8],[77,8],[85,4],[87,4],[90,8],[98,8]];
const COINS=HEARTS.map(([c,r],i)=>({i,x:c*T+4,y:r*T+4}));
const ENEMY_COLS=[9,20,25,38,47,63,71,84,99];
const CHK=[2,36,60];
const solid=(c,r)=>{if(c<0||c>=COLS)return true;if(r<0||r>=12)return false;return SOLID.includes(MAP[r][c])};
function collX(e){
  const l=Math.floor(e.x/T),r=Math.floor((e.x+e.w-.01)/T),t=Math.floor(e.y/T),b=Math.floor((e.y+e.h-.01)/T);
  if(e.vx>0){for(let y=t;y<=b;y++)if(solid(r,y)){e.x=r*T-e.w;return true}}
  else if(e.vx<0){for(let y=t;y<=b;y++)if(solid(l,y)){e.x=(l+1)*T;return true}}
  return false;
}
function collY(e){
  const l=Math.floor(e.x/T),r=Math.floor((e.x+e.w-.01)/T),t=Math.floor(e.y/T),b=Math.floor((e.y+e.h-.01)/T);
  if(e.vy>0){for(let c=l;c<=r;c++)if(solid(c,b)){e.y=b*T-e.h;e.vy=0;return true}}
  else if(e.vy<0){for(let c=l;c<=r;c++)if(solid(c,t)){e.y=(t+1)*T;e.vy=0}}
  return false;
}

/* ---------- state ---------- */
const mk=(name,girl)=>({name,girl,x:0,y:0,px:0,py:0,tx:0,ty:0,vx:0,vy:0,f:1,g:false,dead:false,dt:0,won:false,cpc:2,walk:0,hp:3,inv:0});
const ME=mk('Aku',false),THEM=mk('Dia',true);
const WORLD={taken:new Set(),hc:[0,0]};
const INP={l:false,r:false,j:false,jp:false,run:false};
const PARTS=[];
let EN=[],CH=0,HOST_CODE=randCode(),peer=null,READY=false,role=null,conn=null,partner=false,state='menu',cam=0,last=performance.now(),sendT=0,worldT=0,countT=0,toastT=0,paused=false,lockT=0,joinT=0,pendingRoom=null;
const cv=$('cv'),ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;

function spawnP(p,c){p.x=c*T;p.y=10*T-PH;p.px=p.x;p.py=p.y;p.tx=p.x;p.ty=p.y;p.vx=p.vy=0;p.dead=false;p.dt=0;p.g=false;p.won=false;p.hp=3;p.inv=0}
function resetWorld(){
  EN=ENEMY_COLS.map((c,i)=>({x:c*T,y:10*T-13,w:14,h:13,vx:0,vy:0,dir:i%2?1:-1,alive:true}));
  WORLD.taken=new Set();WORLD.hc=[0,0];
  ME.cpc=2;THEM.cpc=2;spawnP(ME,2);spawnP(THEM,2);CATX=null;
}

/* ---------- gambar ---------- */
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function heart(x,y,s,c){
  ctx.fillStyle=c;ctx.beginPath();const r=s/4;
  ctx.moveTo(x+s/2,y+s);ctx.lineTo(x,y+s*.4);ctx.arc(x+s*.25,y+s*.3,r,Math.PI,0);ctx.arc(x+s*.75,y+s*.3,r,Math.PI,0);ctx.lineTo(x+s/2,y+s);ctx.fill();
  if(s>=7){ctx.strokeStyle='rgba(120,20,70,.45)';ctx.lineWidth=.8;ctx.stroke();rect(x+s*.2,y+s*.2,Math.max(1,Math.round(s*.14)),Math.max(1,Math.round(s*.14)),'#ffffff')}
}
function cloud(x,y){ctx.beginPath();ctx.arc(x,y,8,0,7);ctx.arc(x+10,y-4,10,0,7);ctx.arc(x+22,y,8,0,7);ctx.fill()}
function boy(p){
  const f=Math.floor(p.walk)%2;
  rect(2,0,8,3,'#2d2448');rect(1,1,1,2,'#2d2448');rect(10,1,1,2,'#2d2448');
  rect(2,3,8,6,'#ffd9bd');rect(4,5,1,2,'#2d2448');rect(7,5,1,2,'#2d2448');rect(3,7,1,1,'#ff8fb1');rect(8,7,1,1,'#ff8fb1');
  rect(1,9,10,5,'#5b8cff');rect(0,9,1,4,'#4a72d8');rect(11,9,1,4,'#4a72d8');rect(5,10,2,1,'#ffe066');
  rect(2+(f?1:0),13,3,1,'#2d2448');rect(7-(f?1:0),13,3,1,'#2d2448');
}
function girl(p){
  const f=Math.floor(p.walk)%2;
  rect(1,0,10,4,'#8a3b5b');rect(0,3,2,9,'#8a3b5b');rect(10,3,2,9,'#8a3b5b');
  rect(2,3,8,6,'#ffd9bd');rect(4,5,1,2,'#2d2448');rect(7,5,1,2,'#2d2448');rect(3,7,1,1,'#ff8fb1');rect(8,7,1,1,'#ff8fb1');
  rect(8,0,3,2,'#ff7aa8');rect(9,0,1,1,'#ffd1e6');
  rect(2,9,8,2,'#ff8fb8');rect(1,11,10,2,'#ff8fb8');rect(3,11,1,1,'#ffd1e6');
  rect(3+(f?1:0),13,2,1,'#c25a86');rect(7-(f?1:0),13,2,1,'#c25a86');
}
function drawPlayer(p,isMe,cx){
  ctx.save();ctx.translate(Math.round(p.x-cx),Math.round(p.y));
  if(p.f<0){ctx.translate(PW,0);ctx.scale(-1,1)}
  const blink=p.inv>0&&Math.floor(performance.now()/90)%2;
  ctx.globalAlpha=p.dead?.35:blink?.4:(isMe?1:.92);
  const k=p.girl?'girl':'boy';
  const walking=p.g&&Math.abs(p.vx)>10;
  const frame=!p.g?k:(walking?(Math.floor(p.walk)%2?k+'W2':k+'W1'):k);
  if(ldOk(frame)){
    const im=IMG[frame],h=CHAR_H,w=Math.round(h*im.naturalWidth/im.naturalHeight);
    ctx.drawImage(im,Math.round((PW-w)/2),PH-h,w,h);
  }else{if(p.girl)girl(p);else boy(p)}
  ctx.restore();
}
function drawEnemy(e,t,cx){
  const x=Math.round(e.x-cx),y=Math.round(e.y+Math.sin(t*7+e.x)*.6);
  heart(x,y,14,'#8a5cf0');
  rect(x+3,y+3,2,2,'#fff');rect(x+9,y+3,2,2,'#fff');rect(x+4,y+4,1,1,'#2d1b4e');rect(x+10,y+4,1,1,'#2d1b4e');
  ctx.strokeStyle='#1d1030';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+7.5,y+3);ctx.lineTo(x+6.5,y+6);ctx.lineTo(x+8.5,y+8);ctx.lineTo(x+6.5,y+11);ctx.stroke();
  rect(x+10,y+8,2,3,'#7fd8ff');
}
let CATX=null,CATY=0;
function sakura(x,y,s){
  rect(x-2*s,y-16*s,4*s,18*s,'#8a5a3c');
  ctx.fillStyle='#ff9fcb';ctx.beginPath();
  [[0,-26,11],[-10,-20,9],[10,-20,9],[-5,-34,9],[6,-35,8],[0,-14,8]].forEach(([dx,dy,r])=>{ctx.moveTo(x+(dx+r)*s,y+dy*s);ctx.arc(x+dx*s,y+dy*s,r*s,0,7)});
  ctx.fill();
  ctx.fillStyle='#ffd0e8';ctx.beginPath();
  [[-3,-30,4],[7,-24,3],[-8,-16,3]].forEach(([dx,dy,r])=>{ctx.moveTo(x+(dx+r)*s,y+dy*s);ctx.arc(x+dx*s,y+dy*s,r*s,0,7)});
  ctx.fill();
}
function drawBackground(cx){
  if(ldOk('bg')){ctx.drawImage(IMG.bg,0,0,W,H);return}
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#84d6ff');g.addColorStop(.65,'#c9efff');g.addColorStop(1,'#eefbff');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#ffffff';
  for(let i=0;i<5;i++){const x=((i*90-cx*.2)%(W+140)+W+140)%(W+140)-70;cloud(x,14+(i%3)*12)}
  for(let i=-1;i<3;i++){const x=i*170-(cx*.2%170);ctx.fillStyle='#a6e8b0';ctx.beginPath();ctx.ellipse(x+60,H-34,96,50,0,0,7);ctx.fill()}
  for(let i=-1;i<3;i++){const x=i*140-(cx*.35%140);ctx.fillStyle='#7fd77a';ctx.beginPath();ctx.ellipse(x+40,H-16,80,38,0,0,7);ctx.fill()}
  for(let i=-1;i<4;i++){const x=i*120-(cx*.5%120);sakura(x+10,H-40,1)}
}
function drawTiles(c0,c1,cx){
  for(let r=0;r<12;r++)for(let c=c0;c<=c1;c++){
    const t=MAP[r][c];if(t==='.')continue;
    const x=Math.round(c*T-cx),y=r*T,up=r>0?MAP[r-1][c]:'.';
    if(t==='#'){
      rect(x,y,T,T,'#b07040');rect(x,y+6,T,T-6,'#a06238');
      rect(x+2,y+9,3,2,'#7d4a2a');rect(x+10,y+12,3,2,'#7d4a2a');rect(x+6,y+5,2,1,'#c48a55');
      if(!'#BPC'.includes(up)){
        rect(x,y,T,5,'#7fdc62');rect(x,y+5,T,1,'#4fae4a');
        rect(x+1,y-1,3,2,'#9ff07f');rect(x+8,y-1,4,2,'#9ff07f');rect(x+13,y,2,1,'#6fc85a');
      }
    }else if(t==='B'){
      rect(x,y,T,T,'#7a4a24');rect(x+1,y+1,T-2,T-2,'#e0a060');rect(x+3,y+3,T-6,T-6,'#c98443');
      rect(x+3,y+3,T-6,1,'#f2c08a');rect(x+3,y+8,T-6,1,'#7a4a24');rect(x+7,y+3,1,T-6,'#7a4a24');
    }else if(t==='P'){
      rect(x+2,y,12,T,'#6ee0a0');rect(x+4,y,2,T,'#b8f7d0');rect(x+11,y,1,T,'#3fb276');
      if(up!=='P'){rect(x,y,T,5,'#4cc98a');rect(x,y+4,T,1,'#2e9a62');rect(x+2,y+1,3,1,'#dfffee')}
    }else if(t==='C'){
      rect(x,y,T,T,'#d7c4ff');rect(x,y+8,T,1,'#a58cf0');rect(x+6,y,1,8,'#a58cf0');rect(x+2,y+9,1,7,'#a58cf0');rect(x+11,y+9,1,7,'#a58cf0');
      if(up!=='C'){rect(x,y-3,4,3,'#d7c4ff');rect(x+6,y-3,4,3,'#d7c4ff');rect(x+12,y-3,4,3,'#d7c4ff')}
    }else if(t==='F'){
      rect(x+7,y,2,T,'#ffffff');rect(x+8,y,1,T,'#d7c7ff');
      if(up==='.'){rect(x+6,y-2,4,4,'#ffe066');heart(x+9,y+2,8,'#ff5c8a')}
    }
  }
}
function drawCat(cx){
  const g=ME.girl?ME:THEM;
  const tx=g.x-13,ty=g.y+4;
  if(CATX===null){CATX=tx;CATY=ty}
  CATX+=(tx-CATX)*.12;CATY+=(ty-CATY)*.25;
  const x=Math.round(CATX-cx),y=Math.round(CATY+Math.sin(performance.now()/260)*.5);
  if(ldOk('pet')){const im=IMG.pet,w=14,h=Math.round(14*im.naturalHeight/im.naturalWidth);ctx.drawImage(im,x,y+10-h,w,h);return}
  rect(x+1,y+4,10,5,'#fff6fb');rect(x,y+1,6,5,'#fff6fb');
  rect(x,y,2,2,'#ffb3d9');rect(x+4,y,2,2,'#ffb3d9');
  rect(x+1,y+3,1,1,'#3b2352');
  rect(x+5,y+5,3,2,'#ffb3d9');rect(x+10,y+2,2,5,'#ffb3d9');
  rect(x+2,y+9,2,1,'#ffb3d9');rect(x+8,y+9,2,1,'#ffb3d9');
}
function draw(){
  const cx=Math.round(cam);
  drawBackground(cx);
  const c0=Math.max(0,Math.floor(cx/T)),c1=Math.min(COLS-1,Math.floor((cx+W)/T)+1);
  drawTiles(c0,c1,cx);
  for(const c of CHK){const x=c*T-cx;if(x<-20||x>W+20)continue;rect(x+7,9*T-22,2,22,'#ffffff');heart(x+9,9*T-22,7,'#ff8fb8')}
  const bob=Math.sin(performance.now()/300);
  for(const c of COINS){if(WORLD.taken.has(c.i))continue;const x=c.x-cx;if(x<-10||x>W+10)continue;const y=c.y+bob*1.2;coinDraw(x,y)}
  for(const e of EN)if(e.alive&&e.x-cx>-20&&e.x-cx<W+20)drawEnemy(e,performance.now()/1000,cx);
  if(partner)drawPlayer(THEM,false,cx);
  drawCat(cx);
  drawPlayer(ME,true,cx);
  for(const p of PARTS){ctx.globalAlpha=Math.max(0,p.life/.6);heart(p.x-cx,p.y,4,p.c);ctx.globalAlpha=1}
  if(partner){const sx=THEM.x-cx;if(sx<-8||sx>W-4)heart(sx<0?4:W-14,44,10,'#ff5c8a')}
}

/* ---------- suara ---------- */
let AC=null;
const BEEP={jump:[300,620,.12,'square'],coin:[880,1320,.1,'square'],stomp:[220,90,.12,'triangle'],hurt:[520,240,.2,'square'],die:[420,70,.45,'sawtooth'],win:[523,1047,.5,'triangle']};
function beep(k){
  if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return}}
  const s=BEEP[k];if(!s)return;
  const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();
  o.type=s[3];o.frequency.setValueAtTime(s[0],t);o.frequency.exponentialRampToValueAtTime(s[1],t+s[2]);
  g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.0001,t+s[2]);
  o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+s[2]);
}
function sfx(k){
  const f=SND[k];
  if(f){const a=new Audio(f);a.volume=.5;a.play().catch(()=>beep(k));return}
  beep(k);
}

/* ---------- fisika ---------- */
function burst(x,y,c,n){for(let i=0;i<(n||6);i++)PARTS.push({x,y,vx:(Math.random()-.5)*120,vy:-Math.random()*120-30,life:.6,c})}
function kill(p){if(p.dead||p.won)return;p.dead=true;p.dt=0;p.vy=-260;p.hp=0;sfx('die');burst(p.x+6,p.y+6,'#ff8fb8',8)}
function hit(p){
  if(p.dead||p.won||p.inv>0)return;
  p.hp--;p.inv=1.6;p.vy=-220;sfx('hurt');burst(p.x+6,p.y+4,'#8a5cf0',6);
  if(p.hp<=0)kill(p);
}
function updP(p,dt,I){
  p.px=p.x;p.py=p.y;
  if(p.inv>0)p.inv-=dt;
  if(p.dead){p.vy+=900*dt;p.y+=p.vy*dt;p.dt+=dt;if(p.dt>1.3)spawnP(p,p.cpc);return}
  if(p.won){p.vx=0;return}
  const acc=p.g?900:600,maxV=I.run?120:88;
  if(I.l&&!I.r){p.vx=Math.max(p.vx-acc*dt,-maxV);p.f=-1}
  else if(I.r&&!I.l){p.vx=Math.min(p.vx+acc*dt,maxV);p.f=1}
  else{const fr=(p.g?1000:300)*dt;p.vx=Math.abs(p.vx)<=fr?0:p.vx-Math.sign(p.vx)*fr}
  if(I.jp&&p.g){p.vy=-268;p.g=false;sfx('jump')}
  if(!I.j&&p.vy<-110)p.vy=-110;
  p.vy=Math.min(p.vy+900*dt,520);
  p.x+=p.vx*dt;if(collX(p))p.vx=0;
  p.y+=p.vy*dt;p.g=collY(p);
  if(p.g&&Math.abs(p.vx)>10)p.walk+=dt*10;
  if(p.y>H+20){kill(p);return}
  for(const c of CHK)if(p.x>=c*T&&c>p.cpc)p.cpc=c;
  const unlocked=WORLD.hc[0]+WORLD.hc[1]>=10;
  if(!unlocked&&p.x+PW>99*T){p.x=99*T-PW;p.vx=0;if(p===ME&&lockT<=0){toast('Kumpulkan 10 hati dulu!');lockT=3}}
  if(unlocked&&p.x+PW>=99*T)p.won=true;
}
function enemyHit(p){
  if(p.dead||p.won)return;
  for(const e of EN){
    if(!e.alive)continue;
    if(p.x+PW<=e.x||p.x>=e.x+e.w||p.y+PH<=e.y||p.y>=e.y+e.h)continue;
    if(p.vy>0&&p.py+PH<=e.y+6){
      e.alive=false;p.vy=-240;sfx('stomp');burst(e.x+7,e.y+6,'#8a5cf0',8);
      if(role==='guest')send({t:'k',i:EN.indexOf(e)});
      return;
    }
    hit(p);return;
  }
}
function coinPick(p){
  if(p.dead||p.won)return;
  for(const c of COINS){
    if(WORLD.taken.has(c.i))continue;
    if(p.x+PW<=c.x||p.x>=c.x+8||p.y+PH<=c.y||p.y>=c.y+8)continue;
    WORLD.taken.add(c.i);
    if(role==='guest')send({t:'c',i:c.i});else WORLD.hc[0]++;
    sfx('coin');burst(c.x,c.y,'#ff8fb8',6);
  }
}
function updEnemies(dt){
  for(const e of EN){
    if(!e.alive)continue;
    e.vy=Math.min(e.vy+900*dt,520);e.y+=e.vy*dt;
    const g=collY(e);
    e.vx=e.dir*30;e.x+=e.vx*dt;
    if(collX(e))e.dir*=-1;
    if(g){const fc=e.dir>0?Math.floor((e.x+e.w+1)/T):Math.floor((e.x-1)/T),fr=Math.floor((e.y+e.h+2)/T);if(!solid(fc,fr))e.dir*=-1}
    if(e.y>H+30)e.alive=false;
  }
}
function updParts(dt){
  for(let i=PARTS.length-1;i>=0;i--){const p=PARTS[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.life-=dt;if(p.life<=0)PARTS.splice(i,1)}
}

/* ---------- jaringan ---------- */
function send(m){if(conn&&conn.open)conn.send(m)}
function toast(t){const el=$('toast');el.textContent=t;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),2600)}
function readMe(){ME.name=$('nm').value.trim().slice(0,10)||'Aku';ME.girl=CH===1}
function showScreen(id){for(const s of['menu','wait','game'])$(s).hidden=s!==id}
function mstatus(t){$('mstatus').textContent=t}
function setWait(t,sub,dots){$('wTitle').innerHTML=t+(dots?'<span class="dots"></span>':'');$('wStatus').textContent=sub||''}

function createPeer(){
  peer=new Peer('ourlevel-'+HOST_CODE);
  peer.on('open',()=>{
    READY=true;
    if(role==='host')$('codeBig').textContent=HOST_CODE;
    if(pendingRoom){const c=pendingRoom;pendingRoom=null;joinRoom(c)}
  });
  peer.on('connection',c=>{
    if(role!=='host'||(conn&&conn.open)){c.close();return}
    setConn(c);
  });
  peer.on('error',e=>{
    if(e.type==='unavailable-id'){peer.destroy();HOST_CODE=randCode();createPeer();return}
    if(e.type==='peer-unavailable'){
      if(conn){conn=null}
      role=null;showScreen('menu');state='menu';
      mstatus('Room tidak ditemukan. Cek kodenya, atau minta dia buat room dulu.');
      return;
    }
    mstatus('Koneksi bermasalah ('+e.type+'). Coba refresh halaman.');
  });
}

function hostStart(){
  readMe();role='host';state='wait';
  showScreen('wait');
  $('codeBig').textContent=HOST_CODE;$('share').hidden=false;$('bStart').hidden=true;
  setWait('Menunggu dia masuk',"Dia cukup masukkan kode di atas, atau buka link undangan.",true);
  history.replaceState(null,'','?room='+HOST_CODE);
}
function joinRoom(code){
  if(!READY){pendingRoom=code;mstatus('Menyiapkan koneksi, tunggu sebentar...');return}
  readMe();role='guest';state='wait';
  showScreen('wait');
  $('share').hidden=true;$('bStart').hidden=true;
  setWait('Menghubungkan ke room',code,true);
  history.replaceState(null,'','?room='+code);
  const c=peer.connect('ourlevel-'+code,{reliable:true});
  setConn(c);
  clearTimeout(joinT);
  joinT=setTimeout(()=>{
    if(!partner&&role==='guest'&&state==='wait'){
      if(conn)conn.close();conn=null;role=null;state='menu';
      showScreen('menu');mstatus('Room tidak ditemukan. Cek kodenya.');
    }
  },12000);
}
function setConn(c){
  conn=c;
  c.on('open',()=>{
    partner=true;clearTimeout(joinT);
    c.send({t:'hi',name:ME.name,girl:ME.girl});
    if(role==='host'&&(state==='count'||state==='play'))c.send({t:'s',r:1});
  });
  c.on('data',onData);
  c.on('close',()=>{
    partner=false;conn=null;
    if(state==='count'||state==='play'){toast('Dia keluar sebentar. Tunggu, dia bisa masuk lagi pakai link yang sama.');return}
    if(role==='host'&&state==='wait'){$('bStart').hidden=true;$('share').hidden=false;setWait('Menunggu dia masuk',"Dia cukup masukkan kode di atas, atau buka link undangan.",true)}
    else if(role==='guest'&&state==='wait'){setWait('Host sedang tidak tersambung','Refresh halaman lalu gabung lagi.',false)}
  });
}
function onData(m){
  if(m.t==='hi'){
    THEM.name=m.name;THEM.girl=!!m.girl;
    if(role==='host'&&state==='wait'){
      setWait('Dia sudah masuk!',THEM.name+' sudah ada di room. Tekan Mulai kalau kamu siap.',false);
      $('share').hidden=true;$('bStart').hidden=false;$('bStart').disabled=false;
    }else if(role==='guest'&&state==='wait'){
      setWait('Terhubung!','Menunggu host menekan Mulai.',true);
    }
    return;
  }
  if(m.t==='s'){startGame(!!m.r);return}
  if(m.t==='rs'){restartLevel();return}
  if(m.t==='p'){THEM.tx=m.x;THEM.ty=m.y;THEM.f=m.f;THEM.dead=!!m.d;THEM.won=!!m.won;THEM.walk=m.wk||0;return}
  if(m.t==='w'){
    EN.forEach((e,i)=>{const s=m.en[i];if(s){e.x=s[0];e.y=s[1];e.alive=!!s[2];e.dir=s[3]}});
    WORLD.taken=new Set(m.tk);WORLD.hc=m.hc;return;
  }
  if(m.t==='k'){if(EN[m.i])EN[m.i].alive=false;return}
  if(m.t==='c'){if(!WORLD.taken.has(m.i)){WORLD.taken.add(m.i);WORLD.hc[1]++}return}
}

/* ---------- alur ---------- */
function startGame(resume){
  playBgm();
  showScreen('game');
  state='count';countT=3;paused=false;$('pause').hidden=true;
  if(resume){spawnP(ME,2)}else resetWorld();
  hud();
}
function restartLevel(){
  $('win').hidden=true;
  startGame(false);
}
function winGame(){
  state='win';sfx('win');
  $('letter').textContent=LETTER;$('win').hidden=false;
}

/* ---------- loop ---------- */
function update(dt){
  if(role!=='guest')updEnemies(dt);
  updP(ME,dt,INP);
  enemyHit(ME);coinPick(ME);
  if(partner){THEM.x+=(THEM.tx-THEM.x)*Math.min(1,dt*18);THEM.y+=(THEM.ty-THEM.y)*Math.min(1,dt*18)}
  const want=clamp(ME.x+PW/2-W/2,0,COLS*T-W);
  cam+=(want-cam)*Math.min(1,dt*10);
  if(lockT>0)lockT-=dt;
  updParts(dt);
  if(ME.won&&(!partner||THEM.won)&&state==='play')winGame();
  hud();
}
let hudKey='';
function hud(){
  const total=WORLD.hc[0]+WORLD.hc[1];
  const key=ME.hp+'|'+total+'|'+(ME.girl?1:0);
  if(key===hudKey)return;hudKey=key;
  $('hp1').innerHTML=[0,1,2].map(i=>`<span class="${i<ME.hp?'':'off'}"><img src="assets/images/items/heart.png" alt="" onerror="this.replaceWith('♥')"></span>`).join('');
  $('progbar').style.width=Math.min(100,total/10*100)+'%';
  $('cnt').textContent=Math.min(total,10)+' / 10';
  $('qt').textContent=total>=10?'Quest Selesai!':'Collect 10 Hearts!';
  $('avTL').innerHTML=`<img src="${ME.girl?'assets/images/characters/girl.png':'assets/images/characters/boy.png'}" alt="" onerror="this.parentNode.innerHTML=(${ME.girl}?GIRL:BOY)">`;
}
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min((now-last)/1000,.033);last=now;
  if(state==='count'){
    countT-=dt;const n=Math.ceil(countT);
    const el=$('count');el.hidden=false;el.textContent=n>0?n:'GO!';
    if(countT<=-.6){state='play';el.hidden=true}
    updParts(dt);
    cam=clamp(ME.x+PW/2-W/2,0,COLS*T-W);
    draw();
  }else if(state==='play'){
    if(!paused)update(dt);
    draw();
  }
  if(partner&&now-sendT>50&&(state==='play'||state==='count')){
    sendT=now;
    send({t:'p',x:Math.round(ME.x*10)/10,y:Math.round(ME.y*10)/10,f:ME.f,d:ME.dead?1:0,won:ME.won?1:0,wk:Math.round(ME.walk*10)/10});
  }
  if(role==='host'&&partner&&now-worldT>66&&(state==='play'||state==='count')){
    worldT=now;
    send({t:'w',en:EN.map(e=>[Math.round(e.x*10)/10,Math.round(e.y*10)/10,e.alive?1:0,e.dir]),tk:[...WORLD.taken],hc:WORLD.hc});
  }
  INP.jp=false;
}

/* ---------- input ---------- */
const KEY={ArrowLeft:'l',KeyA:'l',ArrowRight:'r',KeyD:'r',ArrowUp:'j',KeyW:'j',Space:'j',ShiftLeft:'run',ShiftRight:'run'};
function setInp(k,v){
  if(k==='j'){if(v&&!INP.j)INP.jp=true;INP.j=v}
  else INP[k]=v;
}
addEventListener('keydown',e=>{
  const k=KEY[e.code];if(!k||(state!=='play'&&state!=='count'))return;
  e.preventDefault();setInp(k,true);
});
addEventListener('keyup',e=>{const k=KEY[e.code];if(k)setInp(k,false)});
document.querySelectorAll('[data-k]').forEach(b=>{
  const k=b.dataset.k;
  b.addEventListener('pointerdown',e=>{e.preventDefault();setInp(k,true)});
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>setInp(k,false)));
});

/* ---------- tombol ---------- */
document.querySelectorAll('.ch').forEach(b=>b.onclick=()=>{
  CH=+b.dataset.c;
  document.querySelectorAll('.ch').forEach(x=>x.classList.toggle('on',x===b));
});
$('bHost').onclick=()=>{readMe();hostStart()};
$('bJoin').onclick=()=>{
  const c=$('code').value.trim().toUpperCase();
  if(c.length<5){mstatus('Kode room harus 5 karakter.');return}
  readMe();joinRoom(c);
};
$('code').addEventListener('keydown',e=>{if(e.key==='Enter')$('bJoin').click()});
$('bCopy').onclick=()=>{
  const link=location.origin+location.pathname+'?room='+HOST_CODE;
  if(navigator.clipboard)navigator.clipboard.writeText(link).then(()=>{$('wStatus').textContent='Link sudah disalin!'});
  else prompt('Salin link ini:',link);
};
$('bStart').onclick=()=>{send({t:'s',r:0});startGame(false)};
$('bPause').onclick=()=>{if(state==='play'){paused=true;$('pause').hidden=false}};
$('bResume').onclick=()=>{paused=false;$('pause').hidden=true};
$('bAgain').onclick=()=>{send({t:'rs'});restartLevel()};

/* ---------- mulai ---------- */
$('av0').innerHTML=BOY;$('av1').innerHTML=GIRL;$('avTL').innerHTML=BOY;$('waitCat').innerHTML=CAT;
const qRoom=new URLSearchParams(location.search).get('room');
if(qRoom){$('code').value=qRoom.toUpperCase().slice(0,5)}
resetWorld();
createPeer();
requestAnimationFrame(frame);