const Rocks={
  start(){this.s={x:W/2,y:H/2,vx:0,vy:0,a:-Math.PI/2,inv:2};this.b=[];this.r=[];this.p=[];this.score=0;this.lives=3;this.wave=0;this.over=false;this.cd=0;this.hold=false;this.best=store('rocks');this.next()},
  next(){this.wave++;for(let i=0;i<2+this.wave;i++){let x,y;do{x=rnd(0,W);y=rnd(0,H)}while(Math.hypot(x-this.s.x,y-this.s.y)<220);this.rock(x,y,3)}},
  rock(x,y,sz){const a=rnd(0,7),sp=rnd(30,70)+(3-sz)*35+this.wave*4,pts=[];for(let i=irnd(9,13);i>0;i--)pts.push(rnd(.72,1.12));this.r.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,sz,R:sz*15+4,pts,rot:0,vr:rnd(-1.2,1.2)})},
  key(c){if(this.over&&(c==='Enter'||c==='Space'))this.start()},
  down(){if(this.over)this.start();else this.hold=true},
  up(){this.hold=false},
  wrap(o){o.x=(o.x+W)%W;o.y=(o.y+H)%H},
  update(dt){
    stepParts(this.p,dt);
    for(const r of this.r){r.x+=r.vx*dt;r.y+=r.vy*dt;r.rot+=r.vr*dt;this.wrap(r)}
    if(this.over)return;
    const s=this.s;
    if(keys.ArrowLeft||keys.KeyA)s.a-=4.4*dt;
    if(keys.ArrowRight||keys.KeyD)s.a+=4.4*dt;
    if(this.hold){s.a+=clamp(angDiff(Math.atan2(mouse.y-s.y,mouse.x-s.x),s.a),-6*dt,6*dt)}
    this.thr=keys.ArrowUp||keys.KeyW||(this.hold&&TOUCH&&Math.hypot(mouse.x-s.x,mouse.y-s.y)>120);
    if(this.thr){s.vx+=Math.cos(s.a)*420*dt;s.vy+=Math.sin(s.a)*420*dt}
    const f=Math.pow(.5,dt);s.vx*=f;s.vy*=f;s.x+=s.vx*dt;s.y+=s.vy*dt;this.wrap(s);
    s.inv=Math.max(0,s.inv-dt);this.cd-=dt;
    if((keys.Space||this.hold)&&this.cd<=0){this.cd=.17;this.b.push({x:s.x+Math.cos(s.a)*16,y:s.y+Math.sin(s.a)*16,vx:Math.cos(s.a)*640+s.vx,vy:Math.sin(s.a)*640+s.vy,t:.85});tone(880,.04,.03,'square',440)}
    for(const b of this.b){b.x+=b.vx*dt;b.y+=b.vy*dt;b.t-=dt;this.wrap(b)}
    const born=[];
    for(const b of this.b)for(const r of this.r){
      if(b.t>0&&!r.dead&&Math.hypot(b.x-r.x,b.y-r.y)<r.R){
        b.t=0;r.dead=true;this.score+=[0,100,50,20][r.sz];burst(this.p,r.x,r.y,8+r.sz*4,'#cbd5e1');noise(.25,1400-r.sz*300,.15);
        if(r.sz>1)born.push([r.x,r.y,r.sz-1],[r.x,r.y,r.sz-1]);
      }
    }
    this.b=this.b.filter(b=>b.t>0);this.r=this.r.filter(r=>!r.dead);born.forEach(a=>this.rock(...a));
    if(!s.inv)for(const r of this.r)if(Math.hypot(s.x-r.x,s.y-r.y)<r.R+9){
      this.lives--;burst(this.p,s.x,s.y,40,'#5eead4',300);noise(.7,400,.3);
      if(this.lives<=0){this.over=true;this.best=best('rocks',this.score)}else{s.x=W/2;s.y=H/2;s.vx=s.vy=0;s.inv=2.5}
      break;
    }
    if(!this.r.length)this.next();
  },
  draw(){
    bg('#04060c');
    ctx.fillStyle='#1c2436';for(let i=0;i<80;i++)ctx.fillRect((i*137.5)%W,(i*311.7)%H,2,2);
    ctx.strokeStyle='#cbd5e1';ctx.lineWidth=2;
    for(const r of this.r){ctx.beginPath();r.pts.forEach((k,i)=>{const a=r.rot+i/r.pts.length*Math.PI*2,x=r.x+Math.cos(a)*r.R*k,y=r.y+Math.sin(a)*r.R*k;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.stroke()}
    ctx.fillStyle='#fde047';for(const b of this.b)ctx.fillRect(b.x-2,b.y-2,4,4);
    drawParts(this.p);
    const s=this.s;
    if(!this.over&&!(s.inv&&(s.inv*10|0)%2)){
      ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.a);ctx.strokeStyle='#5eead4';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(17,0);ctx.lineTo(-11,-11);ctx.lineTo(-6,0);ctx.lineTo(-11,11);ctx.closePath();ctx.stroke();
      if(this.thr){ctx.strokeStyle='#fb923c';ctx.beginPath();ctx.moveTo(-8,-5);ctx.lineTo(-18-Math.random()*9,0);ctx.lineTo(-8,5);ctx.stroke()}
      ctx.restore();
    }
    text('Score '+this.score,96,24,18,'#fff','left');text('Wave '+this.wave,W/2,24,18,'#fff');text('Lives '+this.lives,W-16,24,18,'#fff','right');
    text('arrows turn and thrust, space shoots. or hold the mouse to steer and fire',W/2,H-16,14,'#4b5677');
    if(this.over)overlay('Game Over','score '+this.score+'  best '+this.best,'space or click to restart');
  }
};

const Swarm={
  A:[['00011000','00111100','01111110','11011011','11111111','00100100','01011010','10100101'],['00011000','00111100','01111110','11011011','11111111','01011010','10000001','01000010']],
  B:[['00100100','10011001','10111101','11011011','11111111','01111110','00100100','01000010'],['00100100','00011000','00111100','01011010','11111111','11111111','10100101','00100100']],
  C:[['00111100','01111110','11111111','11100111','11111111','00111100','01100110','11000011'],['00111100','01111110','11111111','11100111','11111111','00111100','01011010','00100100']],
  start(){this.score=0;this.lives=3;this.wave=0;this.over=false;this.best=store('swarm');this.px=W/2;this.p=[];this.hold=false;this.next()},
  next(){
    this.wave++;this.al=[];this.shots=[];this.bombs=[];
    for(let r=0;r<5;r++)for(let c=0;c<11;c++)this.al.push({x:150+c*60,y:80+r*44+Math.min(this.wave-1,5)*12,t:r<1?2:r<3?1:0,dead:false});
    this.dir=1;this.sp=34+this.wave*7;this.cd=0;this.ufo=null;this.ut=rnd(10,20);this.anim=0;
    this.shields=[];for(let i=0;i<4;i++)for(let y=0;y<4;y++)for(let x=0;x<8;x++)if(!(y===3&&x>1&&x<6))this.shields.push({x:150+i*200+x*10,y:H-150+y*10,hp:3});
  },
  key(c){if(this.over&&(c==='Space'||c==='Enter'))this.start()},
  down(){if(this.over)this.start();else this.hold=true},
  up(){this.hold=false},
  hitMe(){if(this.over)return;this.lives--;burst(this.p,this.px,H-50,30,'#5eead4',260);noise(.5,500,.3);this.bombs=[];if(this.lives<=0){this.lives=0;this.over=true;this.best=best('swarm',this.score)}},
  update(dt){
    stepParts(this.p,dt);
    if(this.over)return;
    this.anim+=dt;
    if(keys.ArrowLeft||keys.KeyA)this.px-=420*dt;if(keys.ArrowRight||keys.KeyD)this.px+=420*dt;
    if(mouse.moved){this.px=mouse.x;mouse.moved=false}
    this.px=clamp(this.px,30,W-30);this.cd-=dt;
    if((keys.Space||this.hold)&&this.cd<=0&&this.shots.length<2){this.shots.push({x:this.px,y:H-62});this.cd=.28;tone(900,.06,.04,'square',500)}
    const live=this.al.filter(a=>!a.dead),sp=this.sp*(1+(55-live.length)/16);
    let edge=false;for(const a of live){a.x+=this.dir*sp*dt;if(a.x<28||a.x>W-28)edge=true}
    if(edge){this.dir*=-1;for(const a of live){a.y+=18;a.x+=this.dir*4}}
    if(live.length&&Math.random()<dt*(.9+this.wave*.25)){const s=pick(live),low=live.filter(a=>Math.abs(a.x-s.x)<20).sort((a,b)=>b.y-a.y)[0];this.bombs.push({x:low.x,y:low.y+14,v:190+this.wave*15})}
    this.ut-=dt;if(this.ut<=0&&!this.ufo)this.ufo=Math.random()<.5?{x:-40,d:1}:{x:W+40,d:-1};
    if(this.ufo){this.ufo.x+=this.ufo.d*150*dt;if(this.ufo.x<-60||this.ufo.x>W+60){this.ufo=null;this.ut=rnd(12,22)}}
    for(const s of this.shots){
      s.y-=650*dt;
      for(const a of live)if(!a.dead&&!s.hit&&Math.abs(s.x-a.x)<17&&Math.abs(s.y-a.y)<14){a.dead=true;s.hit=true;this.score+=[10,20,30][a.t];burst(this.p,a.x,a.y,12,['#4ade80','#38bdf8','#f472b6'][a.t]);tone(220,.08,.05,'square',90)}
      if(this.ufo&&!s.hit&&Math.abs(s.x-this.ufo.x)<26&&Math.abs(s.y-42)<12){s.hit=true;this.score+=pick([50,100,150,300]);burst(this.p,this.ufo.x,42,25,'#f87171');this.ufo=null;this.ut=rnd(12,22);tone(500,.3,.07,'triangle',1500)}
      for(const b of this.shields)if(!s.hit&&b.hp>0&&s.x>b.x-1&&s.x<b.x+11&&s.y>b.y&&s.y<b.y+10){b.hp--;s.hit=true}
    }
    this.shots=this.shots.filter(s=>!s.hit&&s.y>-10);
    for(const b of this.bombs){
      b.y+=b.v*dt;
      for(const sh of this.shields)if(!b.hit&&sh.hp>0&&b.x>sh.x-2&&b.x<sh.x+12&&b.y>sh.y&&b.y<sh.y+10){sh.hp--;b.hit=true}
      if(!b.hit&&b.y>H-64&&b.y<H-36&&Math.abs(b.x-this.px)<22){b.hit=true;this.hitMe()}
    }
    this.bombs=this.bombs.filter(b=>!b.hit&&b.y<H);
    for(const a of live){
      if(a.y>H-170)for(const sh of this.shields)if(sh.hp>0&&Math.abs(sh.x+5-a.x)<20&&Math.abs(sh.y+5-a.y)<16)sh.hp=0;
      if(a.y>H-76){this.lives=1;this.hitMe();return}
    }
    if(!this.al.some(a=>!a.dead))this.next();
  },
  draw(){
    bg('#060812');
    const f=(this.anim*2|0)%2;
    for(const a of this.al)if(!a.dead)sprite([this.A,this.B,this.C][a.t][f],a.x,a.y,3.5,['#4ade80','#38bdf8','#f472b6'][a.t]);
    if(this.ufo){ctx.fillStyle='#f87171';ctx.beginPath();ctx.ellipse(this.ufo.x,42,26,9,0,0,7);ctx.fill();ctx.fillStyle='#fecaca';ctx.beginPath();ctx.ellipse(this.ufo.x,35,11,8,0,Math.PI,0);ctx.fill()}
    for(const s of this.shields)if(s.hp>0){ctx.fillStyle=['','#166534','#22c55e','#4ade80'][s.hp];ctx.fillRect(s.x,s.y,10,10)}
    ctx.fillStyle='#fde047';for(const s of this.shots)ctx.fillRect(s.x-2,s.y-10,4,12);
    ctx.fillStyle='#fb7185';for(const b of this.bombs){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.sin(b.y/12)*.4);ctx.fillRect(-2,-8,4,16);ctx.restore()}
    if(!this.over){ctx.fillStyle='#5eead4';ctx.fillRect(this.px-24,H-50,48,14);ctx.fillRect(this.px-14,H-58,28,8);ctx.fillRect(this.px-3,H-66,6,10)}
    drawParts(this.p);
    ctx.fillStyle='#1f2937';ctx.fillRect(0,H-30,W,2);
    text('Score '+this.score,96,18,18,'#fff','left');text('Wave '+this.wave,W/2,18,18,'#fff');text('Lives '+this.lives,W-16,18,18,'#fff','right');
    text('move with arrows or mouse, space or click to fire',W/2,H-12,13,'#4b5677');
    if(this.over)overlay('Overrun','score '+this.score+'  best '+this.best,'space or click to restart');
  }
};

const Hop={
  CS:64,
  start(){this.rows={};this.r=0;this.x=7*64+32;this.cam=-2;this.over=false;this.why='';this.hopT=0;this.face=0;this.score=0;this.started=false;this.best=store('hop');this.gen=-6;this.extend()},
  extend(){
    while(this.gen<this.r+20){
      const i=this.gen++,prev=this.rows[i-1],prev2=this.rows[i-2];
      let t='grass';
      if(i>2){const r=Math.random();t=r<.34?'grass':r<.74?'road':'river';if(t==='river'&&prev&&prev.type==='river'&&prev2&&prev2.type==='river')t='grass'}
      const row={type:t,trees:new Set(),items:[],dir:Math.random()<.5?1:-1,sp:0};
      const lvl=Math.max(0,i);
      if(t==='grass'){
        if(i<1){if(i<0)for(let c=0;c<15;c++)row.trees.add(c);else{row.trees.add(0);row.trees.add(14)}}
        else if(prev&&prev.type==='grass'){for(const c of prev.trees)if(Math.random()<.6)row.trees.add(c)}
        else for(let c=0;c<15;c++)if(Math.random()<.16)row.trees.add(c);
      }else if(t==='road'){
        row.sp=rnd(90,160)+Math.min(lvl,200)*.7;const n=irnd(2,4),L=W+600;
        for(let k=0;k<n;k++){const w=Math.random()<.25?120:64;row.items.push({x:-300+k*L/n+rnd(0,60),w,col:pick(['#ef4444','#3b82f6','#f59e0b','#a855f7','#10b981','#e5e7eb'])})}
      }else{
        row.sp=rnd(50,100)+Math.min(lvl,200)*.3;const L=W+600;let x=-300;
        while(x<W+300){const w=irnd(2,4)*64;row.items.push({x,w});x+=w+rnd(90,190)}
      }
      this.rows[i]=row;
    }
  },
  move(dr,dc){
    if(this.over)return;
    const c=clamp(Math.round((this.x-32)/64)+dc,0,14),nr=this.r+dr,row=this.rows[nr];
    if(!row||row.type==='grass'&&row.trees.has(c))return;
    this.started=true;this.r=nr;this.x=c*64+32;this.hopT=.12;this.face=dc?(dc>0?1:-1):0;
    if(this.r>this.score){this.score=this.r}
    tone(500+Math.random()*80,.04,.03,'triangle',700);this.extend();
  },
  key(c){
    if(this.over){if(c==='Space'||c==='Enter')this.start();return}
    const m={ArrowUp:[1,0],KeyW:[1,0],ArrowDown:[-1,0],KeyS:[-1,0],ArrowLeft:[0,-1],KeyA:[0,-1],ArrowRight:[0,1],KeyD:[0,1],Space:[1,0]}[c];
    if(m)this.move(...m);
  },
  down(){if(this.over){this.start();return}const sy=this.ry(this.r);if(Math.abs(mouse.x-this.x)>80&&Math.abs(mouse.y-sy)<70)this.move(0,mouse.x>this.x?1:-1);else this.move(mouse.y>sy+40?-1:1,0)},
  ry(i){return H-90-(i-this.cam)*64},
  die(w){if(this.over)return;this.over=true;this.why=w;this.best=best('hop',this.score);noise(.5,500,.3)},
  update(dt){
    const lo=Math.floor(this.cam)-2,hi=Math.ceil(this.cam)+11,L=W+600;
    for(let i=lo;i<=hi;i++){const row=this.rows[i];if(!row||!row.sp)continue;for(const it of row.items){it.x+=row.dir*row.sp*dt;if(it.x>W+300)it.x-=L;if(it.x<-300)it.x+=L}}
    if(this.over)return;
    this.hopT=Math.max(0,this.hopT-dt);
    const tc=this.r-2;if(tc>this.cam)this.cam+=(tc-this.cam)*Math.min(1,dt*5);
    if(this.started)this.cam+=dt*(.22+Math.min(this.score,300)*.003);
    if(this.r<this.cam-1.3)return this.die('too slow');
    const row=this.rows[this.r];
    if(row.type==='road'){for(const it of row.items)if(this.x+18>it.x&&this.x-18<it.x+it.w)return this.die('hit by a car')}
    if(row.type==='river'&&this.hopT<=0){
      const log=row.items.find(it=>this.x>it.x+4&&this.x<it.x+it.w-4);
      if(!log)return this.die('fell in the river');
      this.x+=row.dir*row.sp*dt;if(this.x<12||this.x>W-12)return this.die('swept away');
    }
  },
  corgi(x,y,s){
    ctx.save();ctx.translate(x,y-s);if(this.face<0)ctx.scale(-1,1);
    ctx.fillStyle='#e8913a';ctx.beginPath();ctx.ellipse(0,4,20,12,0,0,7);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(6,9,9,6,0,0,7);ctx.fill();
    ctx.fillStyle='#e8913a';ctx.beginPath();ctx.arc(15,-6,10,0,7);ctx.fill();
    ctx.beginPath();ctx.moveTo(9,-12);ctx.lineTo(11,-25);ctx.lineTo(17,-14);ctx.fill();ctx.beginPath();ctx.moveTo(16,-13);ctx.lineTo(22,-24);ctx.lineTo(24,-10);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(21,-3,6,4,0,0,7);ctx.fill();
    circ(25,-4,2.2,'#111');circ(16,-8,1.8,'#111');
    ctx.fillStyle='#c46f22';ctx.fillRect(-14,12,5,6);ctx.fillRect(8,12,5,6);
    ctx.restore();
  },
  draw(){
    const lo=Math.floor(this.cam)-2,hi=Math.ceil(this.cam)+10;
    for(let i=hi;i>=lo;i--){
      const row=this.rows[i],y=this.ry(i)-32;if(!row)continue;
      if(row.type==='grass'){ctx.fillStyle=i%2?'#6cbf4f':'#62b347';ctx.fillRect(0,y,W,64);for(const c of row.trees){const x=c*64+32;ctx.fillStyle='#6b4423';ctx.fillRect(x-5,y+38,10,18);circ(x,y+28,22,'#2f7d32');circ(x-6,y+22,12,'#3a9a3e')}}
      else if(row.type==='road'){ctx.fillStyle='#3b3f4a';ctx.fillRect(0,y,W,64);ctx.fillStyle='#5b606c';for(let x=0;x<W;x+=60)ctx.fillRect(x,y+62,30,2);for(const it of row.items){rr(it.x,y+12,it.w,40,8,it.col);ctx.fillStyle='rgba(15,23,42,.7)';ctx.fillRect(row.dir>0?it.x+it.w-24:it.x+8,y+17,16,30);ctx.fillStyle='#fde68a';ctx.fillRect(row.dir>0?it.x+it.w-4:it.x,y+16,4,8);ctx.fillRect(row.dir>0?it.x+it.w-4:it.x,y+40,4,8)}}
      else{ctx.fillStyle='#2f7fc1';ctx.fillRect(0,y,W,64);ctx.fillStyle='rgba(255,255,255,.12)';for(let x=(performance.now()/30*row.dir)%80-80;x<W;x+=80)ctx.fillRect(x,y+20+(i%3)*10,30,3);for(const it of row.items){rr(it.x,y+10,it.w,44,10,'#8b5a2b');ctx.fillStyle='#a06a36';for(let k=it.x+20;k<it.x+it.w-10;k+=40)ctx.fillRect(k,y+18,20,3)}}
    }
    if(!this.over||this.why!=='fell in the river')this.corgi(this.x,this.ry(this.r)+14,Math.sin(this.hopT/.12*Math.PI)*14);
    text(this.score,W/2,40,44,'#fff');text('best '+Math.max(this.best,this.score),W-16,24,16,'rgba(255,255,255,.8)','right');
    if(!this.started&&!this.over)text('arrows, wasd, swipe or tap to hop',W/2,H-20,16,'#fff');
    if(this.over)overlay('Corgi Down',this.why+'. score '+this.score+'  best '+this.best,'space or click to restart');
  }
};

const Sky={
  CX:[140,230,320,640,730,820],BX:[50,480,910],
  start(){this.cities=[1,1,1,1,1,1];this.wave=0;this.score=0;this.over=false;this.best=store('sky');this.p=[];this.next()},
  next(){this.wave++;this.ammo=[10,10,10];this.toSpawn=8+this.wave*3;this.spawnT=1;this.m=[];this.ex=[];this.ic=[];this.pause=0;this.bonus=0},
  down(){
    if(this.over){this.start();return}
    if(this.pause>0||mouse.y>H-90)return;
    let bi=-1,bd=1e9;this.BX.forEach((x,i)=>{if(this.ammo[i]>0&&Math.abs(x-mouse.x)<bd){bd=Math.abs(x-mouse.x);bi=i}});
    if(bi<0){tone(120,.1,.05);return}
    this.ammo[bi]--;this.ic.push({x:this.BX[bi],y:H-62,sx:this.BX[bi],sy:H-62,tx:mouse.x,ty:mouse.y,sp:bi===1?900:650});tone(700,.08,.04,'sawtooth',300);
  },
  key(c){if(this.over&&(c==='Space'||c==='Enter'))this.start()},
  targets(){const t=[];this.cities.forEach((a,i)=>{if(a)t.push(this.CX[i])});this.BX.forEach(x=>t.push(x));return t},
  launch(x,y){const tx=pick(this.targets());this.m.push({sx:x,sy:y,x,y,tx,ty:H-50,sp:28+this.wave*6+rnd(0,15),split:this.wave>1&&Math.random()<.2?rnd(150,300):0})},
  boom(x,y,R){this.ex.push({x,y,r:0,R,t:0});noise(.4,700,.12)},
  update(dt){
    stepParts(this.p,dt,200);
    if(this.over)return;
    if(this.pause>0){this.pause-=dt;if(this.pause<=0){if(!this.cities.some(c=>c)){this.over=true;this.best=best('sky',this.score)}else this.next()}return}
    this.spawnT-=dt;
    if(this.toSpawn>0&&this.spawnT<=0){const n=Math.min(this.toSpawn,irnd(1,3));for(let i=0;i<n;i++)this.launch(rnd(20,W-20),-10);this.toSpawn-=n;this.spawnT=rnd(1.2,3)-Math.min(this.wave*.1,1)}
    for(const m of this.m){
      const dx=m.tx-m.sx,dy=m.ty-m.sy,l=Math.hypot(dx,dy);m.x+=dx/l*m.sp*dt;m.y+=dy/l*m.sp*dt;
      if(m.split&&m.y>m.split){m.split=0;for(let i=0;i<2;i++){const tx=pick(this.targets());this.m.push({sx:m.x,sy:m.y,x:m.x,y:m.y,tx,ty:H-50,sp:m.sp,split:0})}}
      if(m.y>=m.ty){m.dead=true;this.boom(m.x,m.y,36);this.CX.forEach((x,i)=>{if(Math.abs(x-m.x)<30&&this.cities[i]){this.cities[i]=0;burst(this.p,x,H-50,30,'#fb923c',260)}});this.BX.forEach((x,i)=>{if(Math.abs(x-m.x)<30)this.ammo[i]=0})}
    }
    for(const c of this.ic){const dx=c.tx-c.x,dy=c.ty-c.y,l=Math.hypot(dx,dy);if(l<c.sp*dt){c.dead=true;this.boom(c.tx,c.ty,50)}else{c.x+=dx/l*c.sp*dt;c.y+=dy/l*c.sp*dt}}
    for(const e of this.ex){e.t+=dt;e.r=e.t<.45?e.R*e.t/.45:e.R*Math.max(0,1-(e.t-.45)/.45);
      for(const m of this.m)if(!m.dead&&Math.hypot(m.x-e.x,m.y-e.y)<e.r){m.dead=true;this.score+=25;this.ex.push({x:m.x,y:m.y,r:0,R:30,t:0})}}
    this.m=this.m.filter(m=>!m.dead);this.ic=this.ic.filter(c=>!c.dead);this.ex=this.ex.filter(e=>e.t<.9);
    if(this.toSpawn<=0&&!this.m.length&&!this.ic.length&&!this.ex.length){this.bonus=this.cities.filter(c=>c).length*100+this.ammo.reduce((a,b)=>a+b,0)*5;this.score+=this.bonus;this.pause=2.5}
  },
  draw(){
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#020617');g.addColorStop(1,'#1e1b4b');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#a16207';ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(0,H-40);this.BX.forEach(x=>{ctx.lineTo(x-40,H-40);ctx.lineTo(x-20,H-62);ctx.lineTo(x+20,H-62);ctx.lineTo(x+40,H-40)});ctx.lineTo(W,H-40);ctx.lineTo(W,H);ctx.fill();
    this.CX.forEach((x,i)=>{if(this.cities[i]){ctx.fillStyle='#38bdf8';ctx.fillRect(x-22,H-58,12,18);ctx.fillRect(x-8,H-70,14,30);ctx.fillRect(x+8,H-54,14,14);ctx.fillStyle='#fef08a';ctx.fillRect(x-4,H-64,3,3);ctx.fillRect(x+1,H-56,3,3)}else{ctx.fillStyle='#44403c';ctx.fillRect(x-22,H-46,44,6)}});
    this.BX.forEach((x,i)=>{for(let k=0;k<this.ammo[i];k++){ctx.fillStyle='#e0f2fe';ctx.fillRect(x-18+(k%5)*8,H-34+(k/5|0)*9,4,6)}});
    ctx.lineWidth=2;
    for(const m of this.m){ctx.strokeStyle='rgba(248,113,113,.6)';ctx.beginPath();ctx.moveTo(m.sx,m.sy);ctx.lineTo(m.x,m.y);ctx.stroke();ctx.fillStyle='#fff';ctx.fillRect(m.x-2,m.y-2,4,4)}
    for(const c of this.ic){ctx.strokeStyle='rgba(94,234,212,.6)';ctx.beginPath();ctx.moveTo(c.sx,c.sy);ctx.lineTo(c.x,c.y);ctx.stroke();ctx.strokeStyle='#5eead4';ctx.beginPath();ctx.moveTo(c.tx-5,c.ty-5);ctx.lineTo(c.tx+5,c.ty+5);ctx.moveTo(c.tx+5,c.ty-5);ctx.lineTo(c.tx-5,c.ty+5);ctx.stroke()}
    for(const e of this.ex){circ(e.x,e.y,e.r,'hsla('+(e.t*200%360)+',90%,65%,.85)')}
    drawParts(this.p);
    text('Score '+this.score,96,24,18,'#fff','left');text('Wave '+this.wave,W-16,24,18,'#fff','right');
    if(this.wave===1&&this.toSpawn>8)text('click the sky to launch interceptors. protect the cities',W/2,60,18,'#94a3b8');
    if(this.pause>0&&!this.over)text('wave clear  +'+this.bonus,W/2,H/2,34,'#fde047');
    if(this.over)overlay('The End','score '+this.score+'  best '+this.best,'click to restart');
  }
};

const Reflex={
  start(){this.state='idle';this.t=0;this.wait=0;this.res=[];this.ms=0;this.bestMs=store('reflex')||0},
  go(){
    if(this.state==='idle'||this.state==='result'||this.state==='early'){if(this.res.length>=5)this.res=[];this.state='wait';this.wait=rnd(1.5,4);this.t=0;return}
    if(this.state==='wait'){this.state='early';noise(.2,500,.15);return}
    if(this.state==='now'){this.ms=Math.round(this.t*1000);this.res.push(this.ms);this.state='result';tone(880,.1,.05,'triangle',1300);if(this.res.length===5){const avg=Math.round(this.res.reduce((a,b)=>a+b)/5);if(!this.bestMs||avg<this.bestMs){this.bestMs=avg;store('reflex',avg)}}}
  },
  key(c,r){if(!r&&(c==='Space'||c==='Enter'))this.go()},
  down(){this.go()},
  update(dt){this.t+=dt;if(this.state==='wait'&&this.t>=this.wait){this.state='now';this.t=0}},
  draw(){
    const C={idle:'#1e293b',wait:'#7f1d1d',now:'#15803d',result:'#1e3a8a',early:'#78350f'};bg(C[this.state]);
    if(this.state==='idle')text('Reflex',W/2,H/2-60,60),text('wait for green, then click or press space as fast as you can',W/2,H/2+10,20,'#cbd5e1'),text('5 tries, average counts',W/2,H/2+44,16,'#94a3b8');
    if(this.state==='wait')text('wait for green...',W/2,H/2,48);
    if(this.state==='now')text('CLICK',W/2,H/2,80);
    if(this.state==='early')text('too early',W/2,H/2-20,48),text('click to try again',W/2,H/2+30,20,'#fde68a');
    if(this.state==='result'){
      text(this.ms+' ms',W/2,H/2-50,72);
      if(this.res.length===5){const avg=Math.round(this.res.reduce((a,b)=>a+b)/5);text('average '+avg+' ms',W/2,H/2+20,28,'#bfdbfe');text('click to go again',W/2,H/2+60,18,'#93c5fd')}
      else text('try '+(this.res.length+1)+' of 5, click to continue',W/2,H/2+20,20,'#bfdbfe');
    }
    text(this.res.map(r=>r+'ms').join('   '),W/2,H-60,18,'rgba(255,255,255,.7)');
    if(this.bestMs)text('best average '+this.bestMs+' ms',W/2,H-30,16,'rgba(255,255,255,.55)');
  }
};

addGame(Rocks,'Rock Drift','drift through an asteroid field and blast rocks into smaller rocks','#cbd5e1','arcade');
addGame(Swarm,'Swarm','hold the line against a descending alien formation','#4ade80','arcade');
addGame(Hop,'Corgi Crossing','endless road and river crossing with a very short dog','#e8913a','arcade');
addGame(Sky,'Skyguard','intercept incoming missiles before they flatten your cities','#a78bfa','arcade');
addGame(Reflex,'Reflex','test your reaction time over five tries','#22c55e','arcade');
