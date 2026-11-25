const Crypt={
  C:30,R:17,TS:32,
  M:{
    rat:{hp:3,atk:2,ch:'r',col:'#a8a29e',xp:1,min:1},
    bat:{hp:4,atk:2,ch:'b',col:'#78716c',xp:2,min:1},
    goblin:{hp:6,atk:3,ch:'g',col:'#84cc16',xp:3,min:1},
    skeleton:{hp:9,atk:4,ch:'s',col:'#e5e7eb',xp:5,min:2},
    orc:{hp:14,atk:5,ch:'o',col:'#16a34a',xp:7,min:3},
    wraith:{hp:16,atk:7,ch:'w',col:'#a78bfa',xp:10,min:5},
    troll:{hp:28,atk:8,ch:'T',col:'#65a30d',xp:15,min:7}
  },
  start(){this.depth=0;this.pl={hp:20,max:20,atk:3,def:0,gold:0,lvl:1,xp:0,pots:1,x:0,y:0,kills:0};this.log=[];this.over=false;this.endT=0;this.best=store('crypt');this.descend()},
  say(s,c){this.log.push({s,c:c||'#cbd5e1'});if(this.log.length>3)this.log.shift()},
  descend(){
    this.depth++;const C=this.C,R=this.R,m=[];for(let y=0;y<R;y++)m.push(Array(C).fill('#'));
    const rooms=[];
    for(let t=0;t<400&&rooms.length<9;t++){const w=irnd(4,8),h=irnd(3,5),x=irnd(1,C-w-1),y=irnd(1,R-h-1);if(rooms.some(r=>x<r.x+r.w+1&&x+w+1>r.x&&y<r.y+r.h+1&&y+h+1>r.y))continue;rooms.push({x,y,w,h})}
    rooms.sort((a,b)=>a.x-b.x);
    for(const r of rooms)for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)m[y][x]='.';
    for(let i=1;i<rooms.length;i++){
      const a=rooms[i-1],b=rooms[i];let x=a.x+(a.w/2|0),y=a.y+(a.h/2|0);const tx=b.x+(b.w/2|0),ty=b.y+(b.h/2|0);
      if(Math.random()<.5){while(x!==tx){m[y][x]='.';x+=Math.sign(tx-x)}while(y!==ty){m[y][x]='.';y+=Math.sign(ty-y)}}
      else{while(y!==ty){m[y][x]='.';y+=Math.sign(ty-y)}while(x!==tx){m[y][x]='.';x+=Math.sign(tx-x)}}
    }
    const r0=rooms[0],rl=rooms[rooms.length-1];
    this.pl.x=r0.x+(r0.w/2|0);this.pl.y=r0.y+(r0.h/2|0);m[rl.y+(rl.h/2|0)][rl.x+(rl.w/2|0)]='>';
    this.m=m;this.mons=[];this.items=[];
    this.seen=[];this.vis=[];for(let y=0;y<R;y++){this.seen.push(Array(C).fill(false));this.vis.push(Array(C).fill(false))}
    const pool=Object.keys(this.M).filter(k=>this.M[k].min<=this.depth);
    const freeCell=(r)=>{for(let t=0;t<30;t++){const x=irnd(r.x,r.x+r.w-1),y=irnd(r.y,r.y+r.h-1);if(m[y][x]==='.'&&!this.at(x,y)&&!this.itemAt(x,y)&&!(x===this.pl.x&&y===this.pl.y))return{x,y}}return null};
    rooms.forEach((r,i)=>{
      if(i>0){const n=irnd(0,2)+(this.depth>3?1:0);for(let k=0;k<n;k++){const c=freeCell(r);if(!c)continue;const key=pool[Math.min(pool.length-1,Math.floor(Math.pow(Math.random(),.8)*pool.length))],T=this.M[key];this.mons.push({...c,k:key,hp:T.hp+Math.floor(this.depth/3)*2,max:T.hp+Math.floor(this.depth/3)*2,atk:T.atk+Math.floor(this.depth/4),awake:false})}}
      const drop=(k,p)=>{if(Math.random()<p){const c=freeCell(r);if(c)this.items.push({...c,k})}};
      drop('gold',.55);drop('pot',.3);drop('sword',.08);drop('armor',.08);
    });
    this.fov();this.say('you reach depth '+this.depth+'. find the stairs',  '#fde68a');
  },
  at(x,y){return this.mons.find(m=>m.x===x&&m.y===y)},
  itemAt(x,y){return this.items.find(i=>i.x===x&&i.y===y)},
  wall(x,y){return x<0||y<0||x>=this.C||y>=this.R||this.m[y][x]==='#'},
  fov(){
    const p=this.pl,R=7;
    for(let y=0;y<this.R;y++)this.vis[y].fill(false);
    for(let y=p.y-R;y<=p.y+R;y++)for(let x=p.x-R;x<=p.x+R;x++){
      if(x<0||y<0||x>=this.C||y>=this.R||(x-p.x)**2+(y-p.y)**2>R*R+1)continue;
      const n=Math.max(Math.abs(x-p.x),Math.abs(y-p.y));let ok=true;
      for(let i=1;i<n;i++){const cx=Math.round(p.x+(x-p.x)*i/n),cy=Math.round(p.y+(y-p.y)*i/n);if(this.m[cy][cx]==='#'){ok=false;break}}
      if(ok){this.vis[y][x]=true;this.seen[y][x]=true}
    }
  },
  quaff(){const p=this.pl;if(this.over)return;if(p.pots<=0){this.say('no potions left','#f87171');return}if(p.hp>=p.max){this.say('already at full health');return}p.pots--;const h=10+this.depth*2;p.hp=Math.min(p.max,p.hp+h);this.say('you drink a potion. +'+h+' hp','#4ade80');tone(600,.2,.05,'sine',900);this.monTurn()},
  act(dx,dy){
    if(this.over){if(this.endT>.6)this.start();return}
    const p=this.pl,nx=p.x+dx,ny=p.y+dy;
    if(dx||dy){
      const mon=this.at(nx,ny);
      if(mon){
        const d=irnd(Math.ceil(p.atk/2),p.atk);mon.hp-=d;mon.awake=true;tone(240,.05,.05,'square',160);
        if(mon.hp<=0){
          this.mons=this.mons.filter(m=>m!==mon);const T=this.M[mon.k];p.xp+=T.xp;p.kills++;this.say('you slay the '+mon.k+'. +'+T.xp+' xp','#fde68a');
          if(Math.random()<.3)this.items.push({x:mon.x,y:mon.y,k:Math.random()<.6?'gold':'pot'});
          while(p.xp>=p.lvl*8){p.xp-=p.lvl*8;p.lvl++;p.max+=5;p.hp=Math.min(p.max,p.hp+10);p.atk++;this.say('level up. you are now level '+p.lvl,'#5eead4');tone(500,.4,.06,'triangle',1000)}
        }else this.say('you hit the '+mon.k+' for '+d);
      }else if(!this.wall(nx,ny)){
        p.x=nx;p.y=ny;
        const it=this.itemAt(nx,ny);
        if(it){
          this.items=this.items.filter(i=>i!==it);
          if(it.k==='gold'){const g=irnd(3,8)*this.depth;p.gold+=g;this.say('you pick up '+g+' gold','#facc15');tone(1200,.05,.04,'square',1600)}
          if(it.k==='pot'){p.pots++;this.say('you find a healing potion. Q to drink','#f87171')}
          if(it.k==='sword'){p.atk+=2;this.say('a sharper blade. attack +2','#93c5fd')}
          if(it.k==='armor'){p.def++;this.say('sturdier armor. defense +1','#93c5fd')}
        }
        if(this.m[ny][nx]==='>'){tone(300,.4,.05,'triangle',150);this.descend();return}
      }else return;
    }
    this.monTurn();
  },
  monTurn(){
    const p=this.pl;
    for(const m of this.mons){
      if(this.vis[m.y][m.x])m.awake=true;
      if(!m.awake)continue;
      if(Math.abs(m.x-p.x)+Math.abs(m.y-p.y)===1){
        const d=Math.max(0,irnd(1,m.atk)-p.def);p.hp-=d;
        if(d)this.say('the '+m.k+' hits you for '+d,'#fca5a5');else this.say('the '+m.k+' misses');
        if(p.hp<=0){p.hp=0;this.over=true;this.endT=0;const sc=this.depth*100+p.gold+p.kills*10;this.score=sc;this.best=best('crypt',sc);this.say('you died on depth '+this.depth,'#ef4444');noise(.8,300,.3);return}
        continue;
      }
      const opts=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:m.x+dx,y:m.y+dy})).filter(c=>!this.wall(c.x,c.y)&&!this.at(c.x,c.y)&&!(c.x===p.x&&c.y===p.y)).sort((a,b)=>(Math.abs(a.x-p.x)+Math.abs(a.y-p.y))-(Math.abs(b.x-p.x)+Math.abs(b.y-p.y)));
      if(opts.length&&Math.abs(opts[0].x-p.x)+Math.abs(opts[0].y-p.y)<Math.abs(m.x-p.x)+Math.abs(m.y-p.y)){m.x=opts[0].x;m.y=opts[0].y}
    }
    this.fov();
  },
  key(c){
    if(c==='KeyQ'){this.quaff();return}
    const d={ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1],ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0],Period:[0,0],Space:[0,0],Enter:[0,0]}[c];
    if(d)this.act(...d);
  },
  down(){
    if(this.over){this.act(0,0);return}
    if(inRect(mouse,{x:W-150,y:H-50,w:136,h:40})){this.quaff();return}
    const T=this.TS,px=this.pl.x*T+T/2,py=this.pl.y*T+T/2,dx=mouse.x-px,dy=mouse.y-py;
    if(mouse.y>this.R*T)return;
    if(Math.abs(dx)<T/2&&Math.abs(dy)<T/2)this.act(0,0);else if(Math.abs(dx)>Math.abs(dy))this.act(Math.sign(dx),0);else this.act(0,Math.sign(dy));
  },
  update(dt){if(this.over)this.endT+=dt},
  draw(){
    bg('#07060a');const T=this.TS;
    for(let y=0;y<this.R;y++)for(let x=0;x<this.C;x++){
      if(!this.seen[y][x])continue;const v=this.vis[y][x],t=this.m[y][x],X=x*T,Y=y*T;
      if(t==='#'){ctx.fillStyle=v?'#4b4458':'#26222e';ctx.fillRect(X,Y,T,T);ctx.fillStyle=v?'#5d556c':'#2e2a38';ctx.fillRect(X,Y,T,5)}
      else{ctx.fillStyle=v?'#1f1c27':'#121017';ctx.fillRect(X,Y,T,T);ctx.fillStyle=v?'#272331':'#16141c';ctx.fillRect(X+2,Y+2,T-4,T-4);if(t==='>'){ctx.fillStyle=v?'#fde68a':'#8a7a4a';for(let i=0;i<4;i++)ctx.fillRect(X+6+i*5,Y+8+i*5,T-12-i*5,4)}}
    }
    for(const it of this.items){if(!this.vis[it.y][it.x])continue;const X=it.x*T+T/2,Y=it.y*T+T/2;
      if(it.k==='gold'){circ(X-4,Y+4,6,'#facc15');circ(X+4,Y+2,6,'#eab308');circ(X,Y-3,6,'#fde047')}
      if(it.k==='pot'){circ(X,Y+4,9,'#dc2626');ctx.fillStyle='#e5e7eb';ctx.fillRect(X-3,Y-10,6,8)}
      if(it.k==='sword'){ctx.save();ctx.translate(X,Y);ctx.rotate(-.8);ctx.fillStyle='#cbd5e1';ctx.fillRect(-2,-13,4,20);ctx.fillStyle='#a16207';ctx.fillRect(-7,7,14,3);ctx.fillRect(-2,10,4,6);ctx.restore()}
      if(it.k==='armor'){ctx.fillStyle='#60a5fa';ctx.beginPath();ctx.moveTo(X-10,Y-10);ctx.lineTo(X+10,Y-10);ctx.lineTo(X+8,Y+6);ctx.lineTo(X,Y+12);ctx.lineTo(X-8,Y+6);ctx.fill()}
    }
    for(const m of this.mons){if(!this.vis[m.y][m.x])continue;const X=m.x*T+T/2,Y=m.y*T+T/2,Tm=this.M[m.k];circ(X,Y,13,'#0b0a10');text(Tm.ch,X,Y+1,20,Tm.col);if(m.hp<m.max)timerBar(m.x*T+3,m.y*T+1,T-6,4,m.hp/m.max,'#ef4444')}
    const p=this.pl;circ(p.x*T+T/2,p.y*T+T/2,13,'#fbbf24');text('@',p.x*T+T/2,p.y*T+T/2+1,20,'#1c1917');
    const hy=this.R*T;ctx.fillStyle='#0f0d14';ctx.fillRect(0,hy,W,H-hy);
    timerBar(14,hy+10,160,10,p.hp/p.max,p.hp/p.max>.35?'#4ade80':'#ef4444');text('HP '+p.hp+'/'+p.max,182,hy+15,14,'#e5e7eb','left');
    text('lvl '+p.lvl+'  atk '+p.atk+'  def '+p.def+'  gold '+p.gold+'  depth '+this.depth,14,hy+38,14,'#a8a29e','left');
    this.log.forEach((l,i)=>text(l.s,330,hy+10+i*14,13,l.c,'left'));
    button({x:W-150,y:H-50,w:136,h:40},'potion x'+p.pots+' (Q)',null,15);
    if(this.over&&this.endT>.6)overlay('You Died','depth '+this.depth+'  score '+this.score+'  best '+this.best,'click or press a key to delve again');
  }
};

const Ridge={
  TS:40,
  start(){this.level=1;this.lives=3;this.gems=0;this.score=0;this.over=false;this.won=0;this.endT=0;this.best=store('ridge');this.build()},
  build(){
    const R=15,cols=70+this.level*18,g=[];for(let y=0;y<R;y++)g.push(Array(cols).fill(' '));
    const col=(x,h,top)=>{for(let y=R-h;y<R;y++)g[y][x]='#';if(top)g[R-h-1][x]=top};
    this.en=[];let x=0,h=3;
    for(;x<8;x++)col(x,h);
    const diff=Math.min(this.level,6);
    while(x<cols-14){
      const r=Math.random();
      if(r<.2){const n=irnd(4,8);const sx=x;for(let i=0;i<n;i++)col(x++,h);if(Math.random()<.5)for(let i=sx+1;i<x-1;i++)g[R-h-2][i]='o';if(n>=5&&Math.random()<.35+diff*.08)this.en.push({x0:sx*40+10,x1:x*40-10,x:(sx+n/2)*40,y:(R-h)*40,d:1,dead:false})}
      else if(r<.38){const w=irnd(2,diff>2?3:2);for(let i=0;i<w;i++){if(i===w>>1)g[R-h-3][x]='o';x++}col(x++,h);col(x++,h)}
      else if(r<.5){h=Math.min(9,h+irnd(1,2));col(x++,h);col(x++,h);col(x++,h)}
      else if(r<.62){h=Math.max(2,h-irnd(1,3));col(x++,h);col(x++,h)}
      else if(r<.74){col(x++,h);col(x++,h);const n=irnd(1,diff>3?3:2);for(let i=0;i<n;i++)col(x++,h,'^');col(x++,h);col(x++,h)}
      else if(r<.86){col(x++,h);const sx=x;for(let i=0;i<8;i++)x++;g[R-h-2][sx+3]='=';g[R-h-2][sx+4]='=';g[R-h-3][sx+3]='o';col(x++,h);col(x++,h)}
      else if(h<=5){col(x++,h);col(x++,h,'B');col(x++,h);h=h+5;col(x++,h);g[R-h-2][x-1]='o';col(x++,h);col(x++,h)}
    }
    const fx=x+6;for(;x<cols;x++)col(x,h);
    g[R-h-1][fx]='F';
    this.g=g;this.cols=cols;
    this.spawn={x:80,y:(R-3)*40-1};this.reset();
  },
  reset(){this.p={x:this.spawn.x,y:this.spawn.y,vx:0,vy:0,on:false,coy:0,buf:0,face:1,dead:0,win:0};this.cam=Math.max(0,this.p.x-W/2)},
  tile(x,y){const tx=Math.floor(x/40),ty=Math.floor(y/40);if(tx<0||tx>=this.cols)return '#';if(ty<0)return ' ';if(ty>=15)return ' ';return this.g[ty][tx]},
  solid(t){return t==='#'||t==='='||t==='B'},
  hit(x,y,w,h){const x0=Math.floor(x/40),x1=Math.floor((x+w-.01)/40),y0=Math.floor(y/40),y1=Math.floor((y+h-.01)/40);for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){if(tx<0||tx>=this.cols)return true;if(ty<0||ty>=15)continue;if(this.solid(this.g[ty][tx]))return true}return false},
  jump(){this.p.buf=.12},
  key(c,r){if(this.over){if(this.endT>.6&&(c==='Space'||c==='Enter'))this.start();return}if(!r&&(c==='Space'||c==='ArrowUp'||c==='KeyW'))this.jump()},
  down(){if(this.over){if(this.endT>.6)this.start();return}this.hold=true;if(mouse.x>W*.25&&mouse.x<W*.75)this.jump()},
  up(){this.hold=false},
  die(){if(this.p.dead)return;this.p.dead=1;this.lives--;noise(.5,500,.25);tone(300,.4,.06,'sawtooth',80)},
  update(dt){
    if(this.over){this.endT+=dt;return}
    const p=this.p,PW=26,PH=34;
    if(p.dead){p.dead+=dt;p.vy+=1900*dt;p.y+=p.vy*dt;if(p.dead>1.2){if(this.lives<=0){this.over=true;this.endT=0;this.best=best('ridge',this.score)}else this.reset()}return}
    if(p.win){p.win+=dt;if(p.win>1.2){this.level++;this.score+=100;this.build()}return}
    let mv=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0);
    if(this.hold&&TOUCH){if(mouse.x<W*.25)mv=-1;else if(mouse.x>W*.75)mv=1;else mv=p.face}
    const acc=p.on?2400:1500;
    if(mv){p.vx=clamp(p.vx+mv*acc*dt,-260,260);p.face=mv}else{const f=p.on?2600:600;p.vx=Math.abs(p.vx)<f*dt?0:p.vx-Math.sign(p.vx)*f*dt}
    p.coy=p.on?.09:p.coy-dt;p.buf-=dt;
    const held=keys.Space||keys.ArrowUp||keys.KeyW||(this.hold&&mouse.x>W*.25&&mouse.x<W*.75);
    if(p.buf>0&&p.coy>0){p.vy=-650;p.buf=0;p.coy=0;tone(520,.06,.04,'triangle',820)}
    p.vy+=(p.vy<0&&held?1500:2300)*dt;p.vy=Math.min(p.vy,900);
    let nx=p.x+p.vx*dt;
    if(this.hit(nx-PW/2,p.y-PH,PW,PH)){const s=Math.sign(p.vx);for(let i=0;i<12&&!this.hit(p.x+s-PW/2,p.y-PH,PW,PH);i++)p.x+=s;p.vx=0}else p.x=nx;
    const ny=p.y+p.vy*dt;p.on=false;
    if(this.hit(p.x-PW/2,ny-PH,PW,PH)){
      const s=Math.sign(p.vy);for(let i=0;i<60&&!this.hit(p.x-PW/2,p.y+s-PH,PW,PH);i++)p.y+=s;
      if(s>0){p.on=true;if(this.tile(p.x,p.y+2)==='B'){p.vy=-1000;p.on=false;tone(300,.25,.06,'triangle',1100)}else p.vy=0}else p.vy=0;
    }else p.y=ny;
    for(const[ox,oy]of[[-10,-4],[10,-4],[0,-17],[-10,-30],[10,-30]]){
      const t=this.tile(p.x+ox,p.y+oy),tx=Math.floor((p.x+ox)/40),ty=Math.floor((p.y+oy)/40);
      if(t==='o'){this.g[ty][tx]=' ';this.gems++;this.score+=10;tone(1100,.06,.04,'square',1700)}
      if(t==='^'&&(p.y+oy)%40>18)this.die();
      if(t==='F'&&!p.win){p.win=.001;tone(520,.5,.07,'triangle',1300)}
    }
    for(const e of this.en){
      if(e.dead){e.dt=(e.dt||0)+dt;continue}
      e.x+=e.d*70*dt;if(e.x<e.x0){e.x=e.x0;e.d=1}if(e.x>e.x1){e.x=e.x1;e.d=-1}
      if(Math.abs(e.x-p.x)<26&&p.y>e.y-30&&p.y-PH<e.y){if(p.vy>0&&p.y<e.y-14){e.dead=true;p.vy=-480;this.score+=25;tone(700,.1,.05,'square',300)}else this.die()}
    }
    if(p.y>15*40+60)this.die();
    p.x=clamp(p.x,PW/2,this.cols*40-PW/2);
    this.cam+=(clamp(p.x-W*.4,0,this.cols*40-W)-this.cam)*Math.min(1,dt*8);
  },
  draw(){
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#7dd3fc');g.addColorStop(1,'#e0f2fe');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#a7d8a0';ctx.beginPath();ctx.moveTo(0,H);for(let x=0;x<=W;x+=20)ctx.lineTo(x,380+Math.sin((x+this.cam*.3)/120)*40);ctx.lineTo(W,H);ctx.fill();
    const c0=Math.floor(this.cam/40),cam=this.cam;
    for(let y=0;y<15;y++)for(let x=c0;x<=c0+25&&x<this.cols;x++){
      const t=this.g[y][x],X=x*40-cam,Y=y*40;if(t===' ')continue;
      if(t==='#'){const top=y===0||this.g[y-1][x]!=='#';ctx.fillStyle='#92603a';ctx.fillRect(X,Y,40,40);ctx.fillStyle='#7a4e2e';ctx.fillRect(X+6,Y+14,6,6);ctx.fillRect(X+24,Y+28,6,6);if(top){ctx.fillStyle='#4caf50';ctx.fillRect(X,Y,40,10);ctx.fillStyle='#66bb6a';ctx.fillRect(X,Y,40,4)}}
      else if(t==='='){rr(X+1,Y+1,38,38,4,'#c08a52');ctx.strokeStyle='#8a5a2b';ctx.lineWidth=2;ctx.strokeRect(X+5,Y+5,30,30)}
      else if(t==='^'){ctx.fillStyle='#94a3b8';for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(X+i*13+1,Y+40);ctx.lineTo(X+i*13+7,Y+18);ctx.lineTo(X+i*13+13,Y+40);ctx.fill()}}
      else if(t==='B'){ctx.fillStyle='#92603a';ctx.fillRect(X,Y,40,40);rr(X+4,Y-6,32,10,4,'#ef4444');ctx.fillStyle='#fca5a5';ctx.fillRect(X+8,Y-4,24,3)}
      else if(t==='o'){const b=Math.sin(performance.now()/250+x)*3;ctx.fillStyle='#a855f7';ctx.beginPath();ctx.moveTo(X+20,Y+8+b);ctx.lineTo(X+31,Y+20+b);ctx.lineTo(X+20,Y+32+b);ctx.lineTo(X+9,Y+20+b);ctx.fill();ctx.fillStyle='#e9d5ff';ctx.fillRect(X+16,Y+15+b,4,4)}
      else if(t==='F'){ctx.fillStyle='#e5e7eb';ctx.fillRect(X+18,Y-120,4,160);ctx.fillStyle='#f43f5e';ctx.beginPath();ctx.moveTo(X+22,Y-120);ctx.lineTo(X+62,Y-104);ctx.lineTo(X+22,Y-88);ctx.fill()}
    }
    for(const e of this.en){if(e.dead&&e.dt>.4)continue;const X=e.x-cam;if(e.dead){rr(X-16,e.y-8,32,8,4,'#7c3aed');continue}ctx.fillStyle='#7c3aed';ctx.beginPath();ctx.ellipse(X,e.y-14,17,14,0,Math.PI,0);ctx.fill();ctx.fillRect(X-17,e.y-14,34,10);circ(X-6+e.d*3,e.y-18,4,'#fff');circ(X+6+e.d*3,e.y-18,4,'#fff');circ(X-6+e.d*4,e.y-18,2,'#111');circ(X+6+e.d*4,e.y-18,2,'#111');ctx.fillStyle='#5b21b6';ctx.fillRect(X-14,e.y-4,8,4);ctx.fillRect(X+6,e.y-4,8,4)}
    const p=this.p;
    if(!(p.dead&&p.dead>1)){ctx.save();ctx.translate(p.x-cam,p.y);ctx.scale(p.face,1);if(p.dead)ctx.rotate(p.dead*6);
      rr(-13,-34,26,26,7,'#2563eb');rr(-13,-14,26,8,3,'#1e3a8a');circ(4,-24,5,'#fff');circ(6,-24,2.5,'#111');ctx.fillStyle='#fbbf24';ctx.fillRect(-14,-38,24,6);
      const st=p.on?Math.sin(p.x/9)*4:3;ctx.fillStyle='#1e293b';ctx.fillRect(-10+st,-6,8,6);ctx.fillRect(2-st,-6,8,6);ctx.restore()}
    text('Level '+this.level,96,24,20,'#0f172a','left');text('gems '+this.gems+'   score '+this.score,W/2,24,18,'#0f172a');text('lives '+this.lives,W-16,24,20,'#0f172a','right');
    if(this.level===1&&this.cam<100&&!this.over)text(TOUCH?'hold left or right edges to run, tap the middle to jump':'arrows or wasd to run, space to jump. stomp the blobs, reach the flag',W/2,H/2-150,18,'#0f172a');
    if(p.win)text('level clear',W/2,H/2-100,40,'#0f172a');
    if(this.over&&this.endT>.6)overlay('Game Over','reached level '+this.level+'  score '+this.score+'  best '+this.best,'click to start over');
  }
};

const Lantern={
  S:{
    start:{t:'You wake on the cold stone floor of a lighthouse. Wind screams through a cracked window. Far out at sea a ship sounds its horn, and the great lamp above you is dark.',c:[['Climb the spiral stairs','stairs'],['Search the storeroom','store'],['Step outside into the storm','outside']]},
    hall:{t:'The ground floor of the lighthouse. Rain hammers the door. The storeroom is to one side, the spiral stairs wind upward.',c:[['Climb the spiral stairs','stairs'],['Search the storeroom','store'],['Step outside into the storm','outside']]},
    store:{t:'Shelves of rope, tins and a rusted lockbox bolted to the wall. A dented can of lamp oil sits in the corner.',c:[['Take the oil can','store',null,'oil','oil'],['Pry the lockbox open','box','bar',null,'matches'],['Try the lockbox with your hands','boxno',null,null,'bar'],['Go back','hall']]},
    boxno:{t:'The lockbox will not budge. You would need something to lever it open.',c:[['Go back','store']]},
    box:{t:'The lockbox screeches open. Inside, wrapped in oilcloth, is a dry tin of matches.',c:[['Take the matches','store',null,'matches']]},
    outside:{t:'Rain hits sideways. A path leads down to the keepers cottage and a small boathouse at the waters edge. An iron crowbar lies by the woodpile.',c:[['Pick up the crowbar','outside',null,'bar','bar'],['Go to the cottage','cottage'],['Go to the boathouse','boathouse'],['Head back inside','hall']]},
    cottage:{t:'The keepers cottage is empty. A journal lies open on the table beside a cold cup of tea.',c:[['Read the journal','journal'],['Search the drawers','drawers'],['Go back outside','outside']]},
    journal:{t:'"The lamp room is locked. The code is the year cast on the bell, I always forget it. Spare matches are in the storeroom lockbox." The last line is shaky: "something in the boathouse water. do not go there at night."',c:[['Close the journal','cottage',null,'read']]},
    drawers:{t:'Mostly string and old letters. At the back of one drawer you find a heavy brass key tag with no key, and a waterproof flare.',c:[['Take the flare','cottage',null,'flare','flare'],['Leave it','cottage']]},
    boathouse:{t:'The boathouse door creaks. A rowboat knocks against the dock in black water. Something large moves beneath the surface, then is still.',c:[['Take the rowboat out to the ship','row'],['Reach into the water for the glint you saw','reach'],['Back away slowly','outside']]},
    reach:{t:'Your fingers close around something smooth and cold. Then something closes around your wrist. The water is very dark and very deep.',end:'Taken by the Deep',good:false},
    row:{t:'You row into the swell toward the horn. The waves are taller than the lighthouse. The ship never sees your tiny boat.',end:'Lost at Sea',good:false},
    stairs:{t:'The stairs wind up into darkness. Halfway, an old brass bell hangs from a beam, the year 1887 cast into its lip. At the top, a steel door with a four digit lock.',c:[['Ring the bell','ring'],['Try the lock','lock'],['Go back down','hall']]},
    ring:{t:'The bell booms over the storm. Somewhere below, something answers with a long, low groan.',c:[['Keep going','stairs']]},
    lock:{t:'Four brass dials, each from 0 to 9.',c:[['Enter 1887','lamp'],['Enter 1912','wrong'],['Enter 0000','wrong'],['Step back','stairs']]},
    wrong:{t:'The lock buzzes angrily and stays shut.',c:[['Step back','stairs']]},
    lamp:{t:'The lamp room. The huge glass lens is cold and the oil reservoir is bone dry. Through the windows you can see the ship, heading straight for the rocks.',c:[['Pour in the oil','lamp','oil','filled','filled'],['Strike a match and light the lamp','lit','filled'],['Strike a match on the dry wick','dry','matches',null,'filled'],['Fire the flare from the balcony','flareEnd','flare'],['Go back down','stairs']]},
    dry:{t:'The wick flares for a second and dies. Without oil it is useless.',c:[['Think again','lamp']]},
    lit:{t:'The lamp roars to life. The beam sweeps the water and the ship heels hard away from the rocks with seconds to spare. At dawn, its crew rows ashore to thank a keeper they had never met.',end:'The Keeper',good:true},
    flareEnd:{t:'A red star bursts above the storm. The ship sees it and turns, but too late to turn fully. It scrapes the rocks and limps on. Everyone lives, barely.',end:'Close Call',good:true},
    late:{t:'The horn sounds one last time, then stops. In the grey morning there is wreckage on the rocks. You were too slow.',end:'Too Late',good:false}
  },
  start(){this.node='start';this.inv=new Set();this.turns=0;this.endings=new Set((()=>{try{return JSON.parse(localStorage.getItem('arcade_lantern')||'[]')}catch(e){return[]}})());this.btns=[]},
  choices(){const n=this.S[this.node];if(n.end)return[['Play again','__r']];return n.c.filter(c=>(!c[2]||this.inv.has(c[2]))&&(!c[4]||!this.inv.has(c[4])))},
  choose(i){
    const ch=this.choices()[i];if(!ch)return;
    if(ch[1]==='__r'){this.start();return}
    if(ch[3])this.inv.add(ch[3]);
    this.turns++;tone(440,.05,.03,'sine',520);
    this.node=this.turns>=26&&!this.S[ch[1]].end?'late':ch[1];
    const n=this.S[this.node];
    if(n.end){this.endings.add(n.end);try{localStorage.setItem('arcade_lantern',JSON.stringify([...this.endings]))}catch(e){}}
  },
  key(c){const d=digitOf(c);if(d)this.choose(+d-1)},
  down(){this.btns.forEach((b,i)=>{if(inRect(mouse,b))this.choose(i)})},
  update(){},
  draw(){
    bg('#0b0a08');
    const g=ctx.createRadialGradient(W/2,120,10,W/2,120,520);g.addColorStop(0,'rgba(253,224,71,.12)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    const n=this.S[this.node];
    text(n.end?'Ending: '+n.end:'Lantern',W/2,44,n.end?30:26,n.end?(n.good?'#fde047':'#f87171'):'#fde68a');
    const th=wrapText(n.t,W/2,84,760,21,'#e7e5e4',30);
    const ch=this.choices();this.btns=[];
    let y=Math.max(84+th+30,250);
    ch.forEach((c,i)=>{const r={x:W/2-300,y,w:600,h:46};this.btns.push(r);button(r,(i+1)+'.  '+c[0],null,18);y+=56});
    if(this.inv.size){const names={oil:'lamp oil',bar:'crowbar',matches:'matches',flare:'flare'};const list=[...this.inv].filter(k=>names[k]).map(k=>names[k]);if(list.length)text('carrying: '+list.join(', '),16,H-20,14,'#a8a29e','left')}
    text('endings found '+this.endings.size+' of '+Object.values(this.S).filter(n=>n.end).length,W-16,H-20,14,'#a8a29e','right');
    if(!n.end&&this.turns>14)text('the horn sounds closer',W/2,H-20,14,'#f87171');
  }
};

addGame(Crypt,'Crypt','turn based dungeon crawl. fight monsters, level up, drink potions, go deeper','#a78bfa','adventure');
addGame(Ridge,'Ridge Runner','platformer with endless generated levels, gems, bounce pads and blobs to stomp','#2563eb','adventure');
addGame(Lantern,'Lantern','short choose your path story in a lighthouse during a storm. five endings','#fde68a','adventure');
