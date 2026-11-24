const Bunker={
  N:32,
  tex(){
    if(this.T)return;
    const mk=(f)=>{const c=document.createElement('canvas');c.width=c.height=64;f(c.getContext('2d'));return c};
    this.T={
      1:mk(g=>{g.fillStyle='#7c3f2c';g.fillRect(0,0,64,64);g.fillStyle='#5a2a1c';for(let y=0;y<64;y+=16){g.fillRect(0,y,64,2);for(let x=(y/16%2)*16;x<64;x+=32)g.fillRect(x,y,2,16)}for(let i=0;i<120;i++){g.fillStyle='rgba(0,0,0,'+Math.random()*.15+')';g.fillRect(Math.random()*64,Math.random()*64,2,2)}}),
      2:mk(g=>{g.fillStyle='#55606e';g.fillRect(0,0,64,64);g.fillStyle='#3d4652';g.fillRect(0,0,64,3);g.fillRect(0,31,64,3);g.fillRect(0,0,3,64);g.fillRect(31,0,3,64);g.fillStyle='#8a95a3';for(const[x,y]of[[8,8],[56,8],[8,56],[56,56],[24,24],[40,40],[40,24],[24,40]])g.fillRect(x-1,y-1,3,3)}),
      3:mk(g=>{g.fillStyle='#2f4b2f';g.fillRect(0,0,64,64);g.fillStyle='#253c25';for(let i=0;i<64;i+=8)g.fillRect(i,0,4,64);g.fillStyle='#4a6b3a';g.fillRect(0,28,64,8)})
    };
    const sp=(f)=>mk(g=>f(g));
    const man=(g,fire,col)=>{g.fillStyle=col||'#7f1d1d';g.fillRect(24,22,16,22);g.fillStyle='#1f2937';g.fillRect(25,44,6,18);g.fillRect(33,44,6,18);g.fillStyle='#e0b48a';g.fillRect(27,10,10,12);g.fillStyle='#14532d';g.fillRect(25,7,14,6);g.fillStyle='#111';g.fillRect(36,28,16,4);if(fire){g.fillStyle='#fde047';g.beginPath();g.arc(54,30,6,0,7);g.fill()}};
    this.S={
      e0:sp(g=>man(g,false)),e1:sp(g=>man(g,true)),eh:sp(g=>man(g,false,'#fca5a5')),
      dead:sp(g=>{g.fillStyle='#450a0a';g.fillRect(8,56,48,6);g.fillStyle='#7f1d1d';g.fillRect(14,52,30,8);g.fillStyle='#e0b48a';g.fillRect(44,52,10,8)}),
      hp:sp(g=>{g.fillStyle='#f1f5f9';g.fillRect(18,40,28,22);g.fillStyle='#dc2626';g.fillRect(29,44,6,14);g.fillRect(25,48,14,6)}),
      am:sp(g=>{g.fillStyle='#3f6212';g.fillRect(16,44,32,18);g.fillStyle='#fde047';for(let i=0;i<4;i++)g.fillRect(20+i*7,38,4,8)}),
      exit:sp(g=>{const r=g.createRadialGradient(32,36,2,32,36,28);r.addColorStop(0,'#ecfeff');r.addColorStop(.5,'#22d3ee');r.addColorStop(1,'rgba(34,211,238,0)');g.fillStyle=r;g.fillRect(0,0,64,64)})
    };
  },
  start(){this.tex();this.level=1;this.score=0;this.hp=100;this.ammo=40;this.over=false;this.endT=0;this.best=store('bunker');this.build();this.zb=new Float32Array(480);cv.style.cursor='none'},
  stop(){cv.style.cursor=''},
  build(){
    const N=this.N,m=[];for(let y=0;y<N;y++)m.push(Array(N).fill(1));
    const rooms=[];
    for(let t=0;t<400&&rooms.length<9;t++){const w=irnd(4,7),h=irnd(4,7),x=irnd(1,N-w-1),y=irnd(1,N-h-1);if(rooms.some(r=>x<r.x+r.w+1&&x+w+1>r.x&&y<r.y+r.h+1&&y+h+1>r.y))continue;rooms.push({x,y,w,h})}
    for(const r of rooms)for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)m[y][x]=0;
    for(let i=1;i<rooms.length;i++){
      const a=rooms[i-1],b=rooms[i];let x=a.x+(a.w/2|0),y=a.y+(a.h/2|0);const tx=b.x+(b.w/2|0),ty=b.y+(b.h/2|0);
      while(x!==tx){m[y][x]=0;x+=Math.sign(tx-x)}while(y!==ty){m[y][x]=0;y+=Math.sign(ty-y)}
    }
    for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(m[y][x])m[y][x]=((x*7+y*13+this.level*5)%11)<3?2:((x*3+y*5)%17===0?3:1);
    this.m=m;this.rooms=rooms;
    const r0=rooms[0],rl=rooms[rooms.length-1];
    this.p={x:r0.x+r0.w/2,y:r0.y+r0.h/2,a:0,bob:0};
    const tx=rooms[1].x+rooms[1].w/2,ty=rooms[1].y+rooms[1].h/2;this.p.a=Math.atan2(ty-this.p.y,tx-this.p.x);
    this.ex={x:rl.x+rl.w/2,y:rl.y+rl.h/2};
    this.en=[];this.items=[];
    rooms.forEach((r,i)=>{
      if(i===0)return;
      const n=Math.min(4,irnd(1,2)+(this.level>2?1:0)+(this.level>4?1:0));
      for(let k=0;k<n;k++)this.en.push({x:r.x+rnd(.6,r.w-.6),y:r.y+rnd(.6,r.h-.6),hp:60+this.level*10,alert:false,cd:rnd(.8,1.6),fire:0,hurt:0,dead:false});
      if(Math.random()<.5)this.items.push({x:r.x+rnd(.6,r.w-.6),y:r.y+rnd(.6,r.h-.6),k:Math.random()<.5?'hp':'am'});
    });
    this.cd=0;this.flash=0;this.dmg=0;this.msg={t:2,s:'level '+this.level+'. find the exit'};
  },
  solid(x,y){const mx=x|0,my=y|0;return mx<0||my<0||mx>=this.N||my>=this.N||this.m[my][mx]>0},
  free(x,y,r){return!this.solid(x-r,y-r)&&!this.solid(x+r,y-r)&&!this.solid(x-r,y+r)&&!this.solid(x+r,y+r)},
  los(ax,ay,bx,by){const d=Math.hypot(bx-ax,by-ay),n=Math.ceil(d*4);for(let i=1;i<n;i++){if(this.solid(ax+(bx-ax)*i/n,ay+(by-ay)*i/n))return false}return true},
  look(mx){if(!this.over)this.p.a+=mx*.0026},
  down(b){
    if(this.over){if(this.endT>.6)this.start();return}
    if(!document.pointerLockElement&&cv.requestPointerLock){try{const r=cv.requestPointerLock();if(r&&r.catch)r.catch(()=>{})}catch(e){}}
    if(b===0)this.hold=true;
  },
  up(b){if(b===0)this.hold=false},
  key(c){if(this.over&&this.endT>.6&&(c==='Space'||c==='Enter'))this.start()},
  shoot(){
    if(this.ammo<=0){if(this.cd<=0){tone(120,.05,.04);this.cd=.3}return}
    this.ammo--;this.cd=.15;this.flash=.06;noise(.12,2400,.18);
    const p=this.p,dx=Math.cos(p.a),dy=Math.sin(p.a);let hit=null,hd=1e9;
    for(const e of this.en){if(e.dead)continue;const sx=e.x-p.x,sy=e.y-p.y,fwd=sx*dx+sy*dy;if(fwd<.2)continue;const side=Math.abs(-sx*dy+sy*dx);if(side<.28&&fwd<hd&&this.los(p.x,p.y,e.x,e.y)){hit=e;hd=fwd}}
    if(hit){hit.hp-=34;hit.hurt=.12;hit.alert=true;if(hit.hp<=0){hit.dead=true;this.score+=100;tone(180,.2,.06,'sawtooth',60)}}
  },
  update(dt){
    if(this.msg&&(this.msg.t-=dt)<=0)this.msg=null;
    if(this.over){this.endT+=dt;return}
    const p=this.p;
    if(keys.ArrowLeft)p.a-=2.6*dt;if(keys.ArrowRight)p.a+=2.6*dt;
    const f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),s=(keys.KeyD?1:0)-(keys.KeyA?1:0);
    let mx=Math.cos(p.a)*f-Math.sin(p.a)*s,my=Math.sin(p.a)*f+Math.cos(p.a)*s;const l=Math.hypot(mx,my);
    if(l){const sp=(keys.ShiftLeft?4.6:3.3)*dt/l;mx*=sp;my*=sp;if(this.free(p.x+mx,p.y,.22))p.x+=mx;if(this.free(p.x,p.y+my,.22))p.y+=my;p.bob+=dt*10}
    this.cd-=dt;this.flash-=dt;this.dmg=Math.max(0,this.dmg-dt*1.5);
    if((this.hold||keys.Space)&&this.cd<=0)this.shoot();
    for(const e of this.en){
      if(e.dead)continue;e.hurt-=dt;e.fire-=dt;
      const d=Math.hypot(e.x-p.x,e.y-p.y),see=d<13&&this.los(e.x,e.y,p.x,p.y);
      if(see)e.alert=true;
      if(!e.alert)continue;
      if(d>2.2){const vx=(p.x-e.x)/d*1.5*dt,vy=(p.y-e.y)/d*1.5*dt;if(this.free(e.x+vx,e.y,.25))e.x+=vx;if(this.free(e.x,e.y+vy,.25))e.y+=vy}
      e.cd-=dt;
      if(e.cd<=0&&see){e.cd=rnd(1,2.1)-Math.min(this.level*.06,.4);e.fire=.15;noise(.1,1600,.08);if(Math.random()<clamp(.8-d*.06,.2,.8)){this.hp-=irnd(5,10)+this.level;this.dmg=1;if(this.hp<=0){this.hp=0;this.over=true;this.endT=0;this.best=best('bunker',this.score);noise(.8,300,.3)}}}
    }
    for(const it of this.items)if(!it.got&&Math.hypot(it.x-p.x,it.y-p.y)<.6){if(it.k==='hp'&&this.hp<100){this.hp=Math.min(100,this.hp+35);it.got=true;tone(660,.12,.05,'triangle',990)}if(it.k==='am'){this.ammo+=20;it.got=true;tone(500,.1,.05,'square',700)}}
    if(Math.hypot(this.ex.x-p.x,this.ex.y-p.y)<.7){this.score+=250;this.level++;this.ammo+=10;this.hp=Math.min(100,this.hp+20);tone(400,.4,.06,'triangle',1200);this.build()}
  },
  draw(){
    const p=this.p,dx=Math.cos(p.a),dy=Math.sin(p.a),plx=-dy*.66,ply=dx*.66;
    let g=ctx.createLinearGradient(0,0,0,H/2);g.addColorStop(0,'#1a1d24');g.addColorStop(1,'#3a3f4a');ctx.fillStyle=g;ctx.fillRect(0,0,W,H/2);
    g=ctx.createLinearGradient(0,H/2,0,H);g.addColorStop(0,'#2a2520');g.addColorStop(1,'#5a4a3a');ctx.fillStyle=g;ctx.fillRect(0,H/2,W,H/2);
    for(let i=0;i<480;i++){
      const cx=2*i/480-1,rx=dx+plx*cx,ry=dy+ply*cx;let mx=p.x|0,my=p.y|0;
      const ddx=Math.abs(1/rx),ddy=Math.abs(1/ry);let sx,sy,sdx,sdy,side=0;
      if(rx<0){sx=-1;sdx=(p.x-mx)*ddx}else{sx=1;sdx=(mx+1-p.x)*ddx}
      if(ry<0){sy=-1;sdy=(p.y-my)*ddy}else{sy=1;sdy=(my+1-p.y)*ddy}
      let t=0;
      for(let k=0;k<64;k++){if(sdx<sdy){sdx+=ddx;mx+=sx;side=0}else{sdy+=ddy;my+=sy;side=1}if(mx<0||my<0||mx>=this.N||my>=this.N){t=1;break}if(this.m[my][mx]>0){t=this.m[my][mx];break}}
      const pd=side?sdy-ddy:sdx-ddx,lh=H/Math.max(pd,.05);
      let wx=side?p.x+pd*rx:p.y+pd*ry;wx-=Math.floor(wx);let tx=wx*64|0;if(!side&&rx>0||side&&ry<0)tx=63-tx;
      ctx.drawImage(this.T[t]||this.T[1],tx,0,1,64,i*2,H/2-lh/2,2,lh);
      const sh=Math.min(.88,pd/13+(side?.18:0));ctx.fillStyle='rgba(0,0,0,'+sh+')';ctx.fillRect(i*2,H/2-lh/2,2,lh);
      this.zb[i]=pd;
    }
    const inv=1/(plx*dy-dx*ply),list=[];
    for(const e of this.en)list.push({x:e.x,y:e.y,img:e.dead?'dead':e.fire>0?'e1':e.hurt>0?'eh':'e0',sc:1});
    for(const it of this.items)if(!it.got)list.push({x:it.x,y:it.y,img:it.k,sc:1});
    list.push({x:this.ex.x,y:this.ex.y,img:'exit',sc:1.2});
    for(const s of list){s.d=(s.x-p.x)**2+(s.y-p.y)**2}
    list.sort((a,b)=>b.d-a.d);
    for(const s of list){
      const sx=s.x-p.x,sy=s.y-p.y,tX=inv*(dy*sx-dx*sy),tY=inv*(-ply*sx+plx*sy);if(tY<.15)continue;
      const scx=W/2*(1+tX/tY),sz=H/tY*s.sc,x0=scx-sz/2,img=this.S[s.img],top=H/2-sz/2;
      for(let x=Math.max(0,x0|0);x<Math.min(W,x0+sz);x+=2){const zi=x/2|0;if(this.zb[zi]<tY)continue;const sxp=((x-x0)/sz*64)|0;ctx.drawImage(img,sxp,0,1,64,x,top,2,sz)}
    }
    const bob=Math.sin(p.bob)*6,gx=W/2+60+Math.cos(p.bob/2)*5,gy=H-130+Math.abs(bob);
    if(this.flash>0){circ(gx-8,gy-20,30,'rgba(253,224,71,.9)');circ(gx-8,gy-20,16,'#fff')}
    ctx.fillStyle='#1f2937';ctx.beginPath();ctx.moveTo(gx-22,gy-10);ctx.lineTo(gx+6,gy-10);ctx.lineTo(gx+40,H);ctx.lineTo(gx-34,H);ctx.closePath();ctx.fill();
    ctx.fillStyle='#374151';ctx.fillRect(gx-14,gy-30,14,40);ctx.fillStyle='#4b5563';ctx.fillRect(gx-12,gy-28,4,36);
    ctx.fillStyle='#e0b48a';ctx.beginPath();ctx.ellipse(gx+18,H-30,30,40,-.3,0,7);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W/2-10,H/2);ctx.lineTo(W/2-4,H/2);ctx.moveTo(W/2+4,H/2);ctx.lineTo(W/2+10,H/2);ctx.moveTo(W/2,H/2-10);ctx.lineTo(W/2,H/2-4);ctx.moveTo(W/2,H/2+4);ctx.lineTo(W/2,H/2+10);ctx.stroke();
    if(this.dmg>0){ctx.fillStyle='rgba(220,38,38,'+this.dmg*.35+')';ctx.fillRect(0,0,W,H)}
    const ms=4,ox=W-this.N*ms-12,oy=12;ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(ox-4,oy-4,this.N*ms+8,this.N*ms+8);
    for(let y=0;y<this.N;y++)for(let x=0;x<this.N;x++)if(!this.m[y][x]){ctx.fillStyle='rgba(148,163,184,.35)';ctx.fillRect(ox+x*ms,oy+y*ms,ms,ms)}
    circ(ox+this.ex.x*ms,oy+this.ex.y*ms,3,'#22d3ee');circ(ox+p.x*ms,oy+p.y*ms,2.5,'#fde047');
    for(const e of this.en)if(!e.dead&&e.alert)circ(ox+e.x*ms,oy+e.y*ms,2,'#ef4444');
    rr(16,H-56,220,40,6,'rgba(0,0,0,.55)');text('HP '+this.hp,28,H-36,22,this.hp>30?'#a3e635':'#f87171','left');timerBar(120,H-42,100,8,this.hp/100,this.hp>30?'#a3e635':'#f87171');
    rr(W-196,H-56,180,40,6,'rgba(0,0,0,.55)');text('AMMO '+this.ammo,W-28,H-36,22,this.ammo?'#fde68a':'#f87171','right');
    text('level '+this.level+'   score '+this.score+'   enemies '+this.en.filter(e=>!e.dead).length,96,24,16,'#e5e7eb','left');
    if(this.msg)text(this.msg.s,W/2,H/2-80,26,'#fff');
    if(!document.pointerLockElement&&!this.over)text('click to lock the mouse. wasd move, mouse aim, click fire, shift sprint',W/2,H/2+90,16,'rgba(255,255,255,.75)');
    if(this.over&&this.endT>.6)overlay('KIA','score '+this.score+'  level '+this.level+'  best '+this.best,'click to redeploy');
  }
};

const Flick={
  start(){this.state='menu';this.best=store('flick');this.parts=[];this.t=[];cv.style.cursor='crosshair'},
  stop(){cv.style.cursor=''},
  begin(){this.state='play';this.time=30;this.score=0;this.hits=0;this.shots=0;this.streak=0;this.t=[];for(let i=0;i<3;i++)this.spawn()},
  spawn(){let x,y,ok,n=0;do{x=rnd(90,W-90);y=rnd(110,H-70);ok=this.t.every(t=>Math.hypot(t.x-x,t.y-y)>110);n++}while(!ok&&n<50);this.t.push({x,y,r:rnd(20,30),a:0})},
  down(){
    if(this.state!=='play'){if(this.state==='menu'||this.endT>.6)this.begin();return}
    this.shots++;const i=this.t.findIndex(t=>Math.hypot(mouse.x-t.x,mouse.y-t.y)<t.r);
    if(i>=0){const t=this.t[i];this.hits++;this.streak++;const prec=1-Math.hypot(mouse.x-t.x,mouse.y-t.y)/t.r;this.score+=Math.round(60+prec*60+Math.min(this.streak,20)*4);burst(this.parts,t.x,t.y,14,'#fb7185',240);this.t.splice(i,1);this.spawn();tone(900+Math.min(this.streak,10)*40,.05,.05,'square',1400)}
    else{this.streak=0;this.score=Math.max(0,this.score-20);tone(160,.06,.04)}
  },
  key(c){if(this.state!=='play'&&(c==='Space'||c==='Enter')&&(this.state==='menu'||this.endT>.6))this.begin()},
  update(dt){
    stepParts(this.parts,dt);
    if(this.state==='over'){this.endT+=dt;return}
    if(this.state!=='play')return;
    for(const t of this.t)t.a=Math.min(1,t.a+dt*6);
    this.time-=dt;if(this.time<=0){this.time=0;this.state='over';this.endT=0;this.best=best('flick',this.score)}
  },
  draw(){
    bg('#0b1220');ctx.strokeStyle='rgba(148,163,184,.07)';ctx.lineWidth=1;for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    for(const t of this.t){const r=t.r*t.a;circ(t.x,t.y,r,'#fb7185');circ(t.x,t.y,r*.66,'#fff');circ(t.x,t.y,r*.33,'#fb7185')}
    drawParts(this.parts,4);
    if(this.state!=='menu'){text('Score '+this.score,96,24,18,'#fff','left');text(this.time.toFixed(1)+'s',W/2,24,22,this.time<5?'#f87171':'#fff');text('Acc '+(this.shots?Math.round(this.hits/this.shots*100):100)+'%',W-16,24,18,'#fff','right')}
    if(this.state==='menu')overlay('Flick','click targets as fast and as close to center as you can','30 seconds. click to start. best '+this.best);
    if(this.state==='over'&&this.endT>.6)overlay('Time','score '+this.score+'  hits '+this.hits+'  accuracy '+(this.shots?Math.round(this.hits/this.shots*100):0)+'%','best '+this.best+'. click to go again');
  }
};

const Gallery={
  ROWS:[{y:170,sp:150,dir:1,pts:30,r:22},{y:300,sp:105,dir:-1,pts:20,r:28},{y:430,sp:70,dir:1,pts:10,r:34}],
  start(){this.state='menu';this.best=store('gallery');cv.style.cursor='crosshair';this.parts=[]},
  stop(){cv.style.cursor=''},
  begin(){this.state='play';this.time=60;this.score=0;this.ammo=6;this.rel=0;this.items=[];this.pops=[];this.popT=2;this.ROWS.forEach((r,i)=>{for(let x=0;x<W+200;x+=rnd(150,230))this.items.push(this.mk(i,x-100))})},
  mk(i,x){return{row:i,x,bad:Math.random()<.18,k:irnd(0,2),hit:0}},
  reload(){if(this.state==='play'&&this.ammo<6&&this.rel<=0){this.rel=1;tone(300,.1,.04,'square',500)}},
  down(b){
    if(this.state!=='play'){if(this.state==='menu'||this.endT>.6)this.begin();return}
    if(b===2||inRect(mouse,{x:W-150,y:H-60,w:134,h:44})){this.reload();return}
    if(this.rel>0)return;
    if(this.ammo<=0){tone(120,.05,.04);this.reload();return}
    this.ammo--;noise(.12,2000,.15);
    for(const p of this.pops)if(!p.hit&&Math.hypot(mouse.x-p.x,mouse.y-p.y+p.h*40)<30){p.hit=1;this.score+=50;burst(this.parts,mouse.x,mouse.y,14,'#fde047');tone(1000,.1,.05,'triangle',1500);return}
    for(const it of this.items){const R=this.ROWS[it.row];if(it.hit)continue;if(Math.hypot(mouse.x-it.x,mouse.y-R.y)<R.r){it.hit=1;if(it.bad){this.score=Math.max(0,this.score-40);tone(140,.2,.06,'sawtooth',80);this.time=Math.max(0,this.time-3)}else{this.score+=R.pts;tone(700,.06,.05,'square',1100)}burst(this.parts,it.x,R.y,10,it.bad?'#f87171':'#fde68a');return}}
  },
  key(c){if(c==='KeyR')this.reload();if(this.state!=='play'&&(c==='Space'||c==='Enter')&&(this.state==='menu'||this.endT>.6))this.begin()},
  update(dt){
    stepParts(this.parts,dt,500);
    if(this.state==='over'){this.endT+=dt;return}
    if(this.state!=='play')return;
    if(this.rel>0){this.rel-=dt;if(this.rel<=0)this.ammo=6}
    for(const it of this.items){const R=this.ROWS[it.row];it.x+=R.dir*R.sp*dt;if(it.hit)it.hit+=dt*4;if(R.dir>0&&it.x>W+100){Object.assign(it,this.mk(it.row,-100))}if(R.dir<0&&it.x<-100){Object.assign(it,this.mk(it.row,W+100))}}
    this.popT-=dt;if(this.popT<=0){this.popT=rnd(3,6);this.pops.push({x:rnd(100,W-100),y:H-40,h:0,t:0,hit:0})}
    for(const p of this.pops){p.t+=dt;p.h=p.t<.25?p.t/.25:p.t<1.3?1:Math.max(0,1-(p.t-1.3)/.25);if(p.hit)p.h=Math.max(0,p.h-dt*4)}
    this.pops=this.pops.filter(p=>p.t<1.6);
    this.time-=dt;if(this.time<=0){this.time=0;this.state='over';this.endT=0;this.best=best('gallery',this.score)}
  },
  target(x,y,r,k,bad,a){
    ctx.save();ctx.translate(x,y);ctx.scale(1,Math.max(.05,1-a));
    if(bad){circ(0,0,r,'#991b1b');ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-r*.5,-r*.5);ctx.lineTo(r*.5,r*.5);ctx.moveTo(r*.5,-r*.5);ctx.lineTo(-r*.5,r*.5);ctx.stroke()}
    else if(k===0){circ(0,0,r,'#fff');circ(0,0,r*.7,'#ef4444');circ(0,0,r*.4,'#fff');circ(0,0,r*.15,'#ef4444')}
    else if(k===1){rr(-r*.6,-r,r*1.2,r*2,4,'#d1d5db');ctx.fillStyle='#2563eb';ctx.fillRect(-r*.6,-r*.4,r*1.2,r*.8)}
    else{ctx.fillStyle='#facc15';ctx.beginPath();for(let i=0;i<10;i++){const rad=i%2?r*.45:r,an=i/10*Math.PI*2-Math.PI/2;ctx.lineTo(Math.cos(an)*rad,Math.sin(an)*rad)}ctx.fill()}
    ctx.restore();
    ctx.fillStyle='#6b4f2a';ctx.fillRect(x-3,y+r*(1-a),6,40);
  },
  draw(){
    bg('#3b0d0d');
    ctx.fillStyle='#7f1d1d';for(let x=0;x<W;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+40,0);ctx.lineTo(x+20,60);ctx.fill()}
    ctx.fillStyle='#fde68a';ctx.fillRect(0,0,W,8);
    if(this.state==='play'||this.state==='over'){
      this.ROWS.forEach(R=>{ctx.fillStyle='#4a2a12';ctx.fillRect(0,R.y+R.r+30,W,14)});
      for(const it of this.items){if(it.hit>=1)continue;const R=this.ROWS[it.row];this.target(it.x,R.y,R.r,it.k,it.bad,it.hit)}
      for(const p of this.pops){ctx.save();ctx.beginPath();ctx.rect(0,0,W,H-40);ctx.clip();this.target(p.x,H-40-p.h*40,26,2,false,p.hit?1-p.h:0);ctx.restore()}
      ctx.fillStyle='#5b3714';ctx.fillRect(0,H-44,W,44);
      drawParts(this.parts,4);
      for(let i=0;i<6;i++)rr(20+i*20,H-36,10,26,3,i<this.ammo?'#fbbf24':'rgba(255,255,255,.15)');
      button({x:W-150,y:H-60+16,w:134,h:28},this.rel>0?'reloading':'reload (R)',null,14);
      text('Score '+this.score,96,30,22,'#fff','left');text(Math.ceil(this.time)+'s',W/2,30,24,this.time<10?'#f87171':'#fff');
    }
    if(this.state==='menu')overlay('Shooting Gallery','click targets. stars and small ones are worth more. avoid the red X','6 shots, right click or R reloads. click to start. best '+this.best);
    if(this.state==='over'&&this.endT>.6)overlay('Closing Time','score '+this.score+'  best '+this.best,'click to play again');
  }
};

const Tanks={
  start(){this.wins=0;this.losses=0;this.round()},
  round(){
    const a=[rnd(0,7),rnd(0,7),rnd(0,7)],f=[rnd(.004,.008),rnd(.01,.02),rnd(.025,.04)],amp=[rnd(50,90),rnd(20,40),rnd(6,14)];
    this.h=new Float32Array(W);for(let x=0;x<W;x++){let y=H-170;for(let i=0;i<3;i++)y+=Math.sin(x*f[i]+a[i])*amp[i];this.h[x]=clamp(y,200,H-40)}
    const flat=(x)=>{const y=this.h[x];for(let i=x-22;i<=x+22;i++)this.h[i]=y};
    this.me={x:irnd(90,200),hp:100,ang:50,pow:60,col:'#4ade80'};this.cpu={x:irnd(W-200,W-90),hp:100,ang:130,pow:60,col:'#f87171'};flat(this.me.x);flat(this.cpu.x);
    this.turn='me';this.shot=null;this.ex=null;this.wind=rnd(-60,60);this.cpuErr=14;this.parts=[];this.over=false;this.endT=0;this.btn=null;this.msg='your turn';
  },
  ty(t){return this.h[clamp(t.x|0,0,W-1)]},
  B:[{id:'a-',x:20,y:H-58,w:56,h:42,l:'◀'},{id:'a+',x:82,y:H-58,w:56,h:42,l:'▶'},{id:'p-',x:150,y:H-58,w:56,h:42,l:'-'},{id:'p+',x:212,y:H-58,w:56,h:42,l:'+'},{id:'f',x:282,y:H-58,w:100,h:42,l:'FIRE'}],
  fire(t){const a=t.ang*Math.PI/180,v=t.pow*9.5,x=t.x+Math.cos(a)*26,y=this.ty(t)-18-Math.sin(a)*26;this.shot={x,y,vx:Math.cos(a)*v,vy:-Math.sin(a)*v,by:t,trail:[]};noise(.3,900,.2)},
  down(){
    if(this.over){if(this.endT>.8)this.round();return}
    this.btn=null;for(const b of this.B)if(inRect(mouse,b))this.btn=b.id;
    if(this.btn==='f'&&this.turn==='me'&&!this.shot){this.fire(this.me);this.turn='fly';this.btn=null}
  },
  up(){this.btn=null},
  key(c){
    if(this.over&&this.endT>.8&&(c==='Space'||c==='Enter')){this.round();return}
    if(c==='Space'&&this.turn==='me'&&!this.shot){this.fire(this.me);this.turn='fly'}
  },
  sim(t,ang,pow){const a=ang*Math.PI/180,v=pow*9.5;let x=t.x+Math.cos(a)*26,y=this.ty(t)-18-Math.sin(a)*26,vx=Math.cos(a)*v,vy=-Math.sin(a)*v;for(let i=0;i<2000;i++){const d=1/120;vy+=420*d;vx+=this.wind*d;x+=vx*d;y+=vy*d;if(x<0||x>=W)return x<0?-999:9999;if(y>=this.h[x|0])return x}return 9999},
  cpuShot(){
    let bestA=130,bestP=60,bd=1e9;
    for(let i=0;i<220;i++){const a=rnd(95,165),p=rnd(30,100),x=this.sim(this.cpu,a,p),d=Math.abs(x-this.me.x);if(d<bd){bd=d;bestA=a;bestP=p}}
    this.cpu.ang=bestA+rnd(-1,1)*this.cpuErr*.3;this.cpu.pow=clamp(bestP+rnd(-1,1)*this.cpuErr*.5,10,100);this.cpuErr=Math.max(2,this.cpuErr-3.5);
    this.fire(this.cpu);
  },
  explode(x,y){
    const R=36;this.ex={x,y,t:0,R};noise(.6,500,.3);burst(this.parts,x,y,40,'#fb923c',300);
    for(let i=Math.max(0,x-R|0);i<Math.min(W,x+R);i++){const s=Math.sqrt(Math.max(0,R*R-(i-x)**2));if(y-s<=this.h[i]+1)this.h[i]=Math.min(H-10,Math.max(this.h[i],y+s))}
    for(const t of[this.me,this.cpu]){const d=Math.hypot(t.x-x,this.ty(t)-10-y);if(d<R+26)t.hp=Math.max(0,t.hp-Math.round(60*(1-d/(R+26))+8))}
  },
  update(dt){
    stepParts(this.parts,dt,500);
    if(this.ex){this.ex.t+=dt;if(this.ex.t>.5)this.ex=null}
    if(this.over){this.endT+=dt;return}
    const m=this.me;
    if(this.turn==='me'){
      if(keys.ArrowLeft||keys.KeyA||this.btn==='a+')m.ang=Math.min(180,m.ang+40*dt);
      if(keys.ArrowRight||keys.KeyD||this.btn==='a-')m.ang=Math.max(0,m.ang-40*dt);
      if(keys.ArrowUp||keys.KeyW||this.btn==='p+')m.pow=Math.min(100,m.pow+30*dt);
      if(keys.ArrowDown||keys.KeyS||this.btn==='p-')m.pow=Math.max(5,m.pow-30*dt);
    }
    if(this.turn==='cpuwait'){this.wait-=dt;if(this.wait<=0){this.turn='fly';this.cpuShot()}}
    const s=this.shot;
    if(s){
      const n=6,h=dt/n;
      for(let i=0;i<n&&this.shot;i++){
        s.vy+=420*h;s.vx+=this.wind*h;s.x+=s.vx*h;s.y+=s.vy*h;
        if(i===0)s.trail.push({x:s.x,y:s.y});
        const tgt=s.by===this.me?this.cpu:this.me;
        if(s.x<0||s.x>=W||s.y>H){this.shot=null;break}
        if(Math.hypot(s.x-tgt.x,s.y-(this.ty(tgt)-10))<20||s.y>=this.h[s.x|0]){this.explode(s.x,s.y);this.shot=null}
      }
      if(!this.shot)this.after(s.by);
    }
  },
  after(by){
    if(this.me.hp<=0||this.cpu.hp<=0){this.over=true;this.endT=0;if(this.cpu.hp<=0&&this.me.hp>0)this.wins++;else this.losses++;return}
    this.wind=clamp(this.wind+rnd(-15,15),-70,70);
    if(by===this.me){this.turn='cpuwait';this.wait=1;this.msg='cpu aiming...'}else{this.turn='me';this.msg='your turn'}
  },
  tank(t){
    const y=this.ty(t),a=t.ang*Math.PI/180;
    ctx.strokeStyle=t.col;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(t.x,y-16);ctx.lineTo(t.x+Math.cos(a)*26,y-16-Math.sin(a)*26);ctx.stroke();
    ctx.fillStyle=t.col;ctx.beginPath();ctx.arc(t.x,y-14,11,Math.PI,0);ctx.fill();rr(t.x-20,y-14,40,12,4,t.col);rr(t.x-22,y-5,44,7,3,'#1f2937');
    timerBar(t.x-24,y-44,48,6,t.hp/100,t.hp>40?'#a3e635':'#f87171');
  },
  draw(){
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0f172a');g.addColorStop(1,'#334155');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#3f6212';ctx.beginPath();ctx.moveTo(0,H);for(let x=0;x<W;x+=2)ctx.lineTo(x,this.h[x]);ctx.lineTo(W,H);ctx.fill();
    ctx.fillStyle='#65a30d';for(let x=0;x<W;x+=2)ctx.fillRect(x,this.h[x],2,4);
    this.tank(this.me);this.tank(this.cpu);
    if(this.shot){ctx.fillStyle='rgba(255,255,255,.35)';for(const p of this.shot.trail)ctx.fillRect(p.x-1,p.y-1,2,2);circ(this.shot.x,this.shot.y,4,'#fff')}
    if(this.ex)circ(this.ex.x,this.ex.y,this.ex.R*Math.min(1,this.ex.t*5),'rgba(251,146,60,'+(1-this.ex.t*2)+')');
    drawParts(this.parts,3);
    text('wind',W/2,22,14,'#94a3b8');ctx.strokeStyle='#e2e8f0';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(W/2,42);ctx.lineTo(W/2+this.wind,42);ctx.stroke();ctx.beginPath();ctx.arc(W/2+this.wind,42,4,0,7);ctx.fillStyle='#e2e8f0';ctx.fill();
    text('angle '+Math.round(this.me.ang)+'   power '+Math.round(this.me.pow),96,22,18,'#4ade80','left');
    text('you '+this.wins+' - '+this.losses+' cpu',W-16,22,18,'#fff','right');
    text(this.msg,W/2,72,18,'#cbd5e1');
    for(const b of this.B)button(b,b.l,this.btn===b.id?'#475569':null,18);
    text('arrows aim and power, space fires',W-16,H-30,14,'#94a3b8','right');
    if(this.over&&this.endT>.8)overlay(this.cpu.hp<=0&&this.me.hp>0?'Direct Hit, You Win':'Destroyed','you '+this.wins+' - '+this.losses+' cpu','click for next round');
  }
};

const Stand={
  start(){this.p={x:W/2,y:H/2,hp:100,inv:0};this.b=[];this.e=[];this.parts=[];this.drops=[];this.score=0;this.wave=0;this.over=false;this.endT=0;this.cd=0;this.hold=false;this.wep=0;this.wt=0;this.best=store('stand');cv.style.cursor='crosshair';this.next()},
  stop(){cv.style.cursor=''},
  next(){this.wave++;this.left=5+this.wave*4;this.st=1;this.msg=2},
  T:{grunt:{hp:2,sp:85,R:14,col:'#ef4444',pts:10},fast:{hp:1,sp:165,R:10,col:'#facc15',pts:15},tank:{hp:12,sp:48,R:24,col:'#a855f7',pts:60}},
  spawn(){
    const side=irnd(0,3),x=side===1?W+20:side===3?-20:rnd(0,W),y=side===0?-20:side===2?H+20:rnd(0,H);
    const r=Math.random(),k=this.wave>2&&r<.14?'tank':this.wave>1&&r<.42?'fast':'grunt',T=this.T[k];
    this.e.push({x,y,k,R:T.R,sp:T.sp*(1+this.wave*.03),col:T.col,pts:T.pts,hp:T.hp+Math.floor(this.wave/4),flash:0});
  },
  down(){if(this.over){if(this.endT>.6)this.start();return}this.hold=true},
  up(){this.hold=false},
  key(c){if(this.over&&this.endT>.6&&(c==='Space'||c==='Enter'))this.start()},
  update(dt){
    stepParts(this.parts,dt);
    if(this.over){this.endT+=dt;return}
    if(this.msg>0)this.msg-=dt;
    const p=this.p;let mx=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0),my=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0);
    let aim=Math.atan2(mouse.y-p.y,mouse.x-p.x),firing=this.hold||keys.Space;
    if(TOUCH){
      if(this.hold&&Math.hypot(mouse.x-p.x,mouse.y-p.y)>40){mx=mouse.x-p.x;my=mouse.y-p.y}
      let n=null,nd=1e9;for(const e of this.e){const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<nd){nd=d;n=e}}
      if(n){aim=Math.atan2(n.y-p.y,n.x-p.x);firing=nd<420}else firing=false;
    }
    const l=Math.hypot(mx,my);if(l){p.x+=mx/l*230*dt;p.y+=my/l*230*dt}
    p.x=clamp(p.x,16,W-16);p.y=clamp(p.y,16,H-16);this.aim=aim;
    this.cd-=dt;if(this.wt>0){this.wt-=dt;if(this.wt<=0)this.wep=0}
    if(firing&&this.cd<=0){
      const sh=(a)=>this.b.push({x:p.x+Math.cos(a)*18,y:p.y+Math.sin(a)*18,vx:Math.cos(a)*820,vy:Math.sin(a)*820});
      if(this.wep===1){for(const o of[-.18,0,.18])sh(aim+o);this.cd=.24}else if(this.wep===2){sh(aim+rnd(-.06,.06));this.cd=.06}else{sh(aim);this.cd=.15}
      tone(this.wep===1?300:600,.04,.03,'square',200);
    }
    for(const b of this.b){b.x+=b.vx*dt;b.y+=b.vy*dt}
    for(const e of this.e){
      const d=Math.hypot(p.x-e.x,p.y-e.y)||1;e.x+=(p.x-e.x)/d*e.sp*dt;e.y+=(p.y-e.y)/d*e.sp*dt;e.flash-=dt;
      for(const o of this.e){if(o===e)continue;const dd=Math.hypot(o.x-e.x,o.y-e.y);if(dd<e.R+o.R&&dd>0){e.x-=(o.x-e.x)/dd*30*dt;e.y-=(o.y-e.y)/dd*30*dt}}
      for(const b of this.b)if(!b.dead&&Math.hypot(b.x-e.x,b.y-e.y)<e.R+3){b.dead=true;e.hp--;e.flash=.08;if(e.hp<=0&&!e.dead){e.dead=true;this.score+=e.pts;burst(this.parts,e.x,e.y,16,e.col,240);noise(.15,1200,.08);if(Math.random()<.09)this.drops.push({x:e.x,y:e.y,k:pick(['hp','spread','rapid']),t:10})}}
      if(d<e.R+12&&p.inv<=0){p.hp-=(e.k==='tank'?30:14)*dt*3;if(p.hp<=0){p.hp=0;this.over=true;this.endT=0;this.best=best('stand',this.score);burst(this.parts,p.x,p.y,40,'#5eead4',300);noise(.8,300,.3)}}
    }
    this.e=this.e.filter(e=>!e.dead);this.b=this.b.filter(b=>!b.dead&&b.x>-20&&b.x<W+20&&b.y>-20&&b.y<H+20);
    for(const d of this.drops){d.t-=dt;if(Math.hypot(d.x-p.x,d.y-p.y)<24){d.t=0;if(d.k==='hp')p.hp=Math.min(100,p.hp+35);else{this.wep=d.k==='spread'?1:2;this.wt=10}tone(800,.15,.05,'triangle',1300)}}
    this.drops=this.drops.filter(d=>d.t>0);
    this.st-=dt;if(this.left>0&&this.st<=0){this.spawn();this.left--;this.st=Math.max(.22,1.1-this.wave*.07)}
    if(this.left<=0&&!this.e.length)this.next();
  },
  draw(){
    bg('#1c1917');ctx.fillStyle='#292524';for(let x=0;x<W;x+=48)for(let y=0;y<H;y+=48)if((x/48+y/48)%2)ctx.fillRect(x,y,48,48);
    for(const d of this.drops){const c={hp:'#22c55e',spread:'#f97316',rapid:'#38bdf8'}[d.k];if(d.t>2||(d.t*6|0)%2){rr(d.x-11,d.y-11,22,22,5,c);text(d.k==='hp'?'+':d.k==='spread'?'S':'R',d.x,d.y+1,15,'#fff')}}
    for(const e of this.e){circ(e.x,e.y,e.R,e.flash>0?'#fff':e.col);circ(e.x-e.R*.3,e.y-e.R*.25,e.R*.2,'#111');circ(e.x+e.R*.3,e.y-e.R*.25,e.R*.2,'#111')}
    ctx.fillStyle='#fde047';for(const b of this.b)ctx.fillRect(b.x-2,b.y-2,4,4);
    drawParts(this.parts,4);
    if(!this.over){const p=this.p;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(this.aim||0);ctx.fillStyle='#1f2937';ctx.fillRect(4,-4,20,8);circ(0,0,14,'#5eead4');circ(6,0,5,'#0f766e');ctx.restore()}
    timerBar(96,16,200,12,this.p.hp/100,this.p.hp>35?'#4ade80':'#ef4444');
    text('Score '+this.score,W-16,22,18,'#fff','right');text('Wave '+this.wave,W/2,22,18,'#fff');
    if(this.wt>0)text((this.wep===1?'spread ':'rapid ')+Math.ceil(this.wt)+'s',96,46,15,'#fdba74','left');
    if(this.msg>0)text('wave '+this.wave,W/2,H/2-60,40,'rgba(255,255,255,'+Math.min(1,this.msg)+')');
    if(this.wave===1&&this.msg>0)text(TOUCH?'hold to move, shooting is automatic':'wasd to move, aim with the mouse, hold click to shoot',W/2,H/2-20,18,'#a8a29e');
    if(this.over&&this.endT>.6)overlay('Overwhelmed','wave '+this.wave+'  score '+this.score+'  best '+this.best,'click to try again');
  }
};

addGame(Bunker,'Bunker','old school raycast shooter. clear rooms, grab supplies, find the exit, go deeper','#7c3f2c','shooter');
addGame(Stand,'Last Stand','top down survival. hold out against endless waves, grab power ups','#14b8a6','shooter');
addGame(Tanks,'Artillery','turn based tank duel. read the wind, set angle and power, blow up the hill','#65a30d','shooter');
addGame(Gallery,'Shooting Gallery','carnival targets on conveyor belts, six shots and a reload','#dc2626','shooter');
addGame(Flick,'Flick','30 second aim trainer with accuracy and precision scoring','#fb7185','shooter');
