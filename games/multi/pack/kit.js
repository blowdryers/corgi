const TOUCH=matchMedia('(pointer:coarse)').matches;
const rnd=(a,b)=>a+Math.random()*(b-a);
const irnd=(a,b)=>Math.floor(a+Math.random()*(b-a+1));
const pick=a=>a[Math.random()*a.length|0];
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function bg(c){ctx.fillStyle=c;ctx.fillRect(0,0,W,H)}
function rr(x,y,w,h,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function circ(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function inRect(p,r){return p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h}
function segDist(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy;let t=l?((px-ax)*dx+(py-ay)*dy)/l:0;t=clamp(t,0,1);return Math.hypot(px-ax-t*dx,py-ay-t*dy)}
function wrapText(t,x,y,maxW,size,color,lh,align){
  ctx.font='bold '+size+'px system-ui,sans-serif';
  const out=[];let line='';
  for(const w of String(t).split(' ')){const tl=line?line+' '+w:w;if(ctx.measureText(tl).width>maxW&&line){out.push(line);line=w}else line=tl}
  out.push(line);
  out.forEach((l,i)=>text(l,x,y+i*(lh||size*1.35),size,color,align||'center','top'));
  return out.length*(lh||size*1.35);
}
function button(r,label,col,size){const h=inRect(mouse,r);rr(r.x,r.y,r.w,r.h,10,col||(h?'#34405c':'#232a3a'));if(h&&!col){ctx.strokeStyle='#5eead4';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(r.x,r.y,r.w,r.h,10);ctx.stroke()}return wrapText(label,r.x+r.w/2,r.y+r.h/2-(size||20)*.68,r.w-20,size||20,'#fff')}
function sprite(rows,x,y,px,col){ctx.fillStyle=col;const ox=x-rows[0].length*px/2,oy=y-rows.length*px/2;rows.forEach((r,j)=>{for(let i=0;i<r.length;i++)if(r[i]!=='0')ctx.fillRect(ox+i*px,oy+j*px,px,px)})}
function burst(arr,x,y,n,col,sp){for(let i=0;i<n;i++){const a=Math.random()*7,s=rnd(30,sp||220);arr.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:rnd(.3,.8),col})}}
function stepParts(arr,dt,g){for(let i=arr.length-1;i>=0;i--){const p=arr[i];p.t-=dt;if(p.t<=0){arr.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;if(g)p.vy+=g*dt}}
function drawParts(arr,sz){for(const p of arr){ctx.globalAlpha=Math.min(1,p.t*2);ctx.fillStyle=p.col;ctx.fillRect(p.x-(sz||3)/2,p.y-(sz||3)/2,sz||3,sz||3)}ctx.globalAlpha=1}
function letterOf(c){if(/^Key[A-Z]$/.test(c))return c[3];if(c==='Enter'||c==='NumpadEnter')return 'Enter';if(c==='Backspace')return 'Backspace';return null}
function digitOf(c){const m=/^(Digit|Numpad)(\d)$/.exec(c);return m?m[2]:null}
const KB_ROWS=['QWERTYUIOP','ASDFGHJKL','>ZXCVBNM<'];
function kbLayout(y,kw,kh){const out=[];KB_ROWS.forEach((r,i)=>{const ws=[...r].map(ch=>ch==='>'||ch==='<'?kw*1.55:kw);let x=(W-ws.reduce((a,b)=>a+b,0)-(r.length-1)*6)/2;[...r].forEach((ch,j)=>{out.push({ch,x,y:y+i*(kh+6),w:ws[j],h:kh});x+=ws[j]+6})});return out}
function kbDraw(ks,colOf){for(const k of ks){const sp=k.ch==='>'||k.ch==='<';rr(k.x,k.y,k.w,k.h,6,(colOf&&colOf(k.ch))||'#2a3142');text(sp?(k.ch==='>'?'enter':'del'):k.ch,k.x+k.w/2,k.y+k.h/2+1,sp?14:18,'#fff')}}
function kbHit(ks){for(const k of ks)if(inRect(mouse,k))return k.ch==='>'?'Enter':k.ch==='<'?'Backspace':k.ch;return null}
function timerBar(x,y,w,h,f,col){rr(x,y,w,h,h/2,'rgba(255,255,255,.1)');if(f>0)rr(x,y,w*clamp(f,0,1),h,h/2,col||'#5eead4')}
