const Roof={
  start(){this.p={x:200,y:380,vy:0,on:true,jumps:0};this.b=[{x:-100,w:900,y:380,id:0}];this.crates=[];this.parts=[];this.speed=330;this.dist=0;this.over=false;this.started=false;this.endT=0;this.hold=false;this.nid=1;this.best=store('roof');this.genTo()},
  genTo(){
    let last=this.b[this.b.length-1];
    while(last.x+last.w<W+400){
      const gap=rnd(80,150)+this.speed*.1,y=clamp(last.y+rnd(-85,110),230,H-70),w=rnd(260,620),nb={x:last.x+last.w+gap,w,y,id:this.nid++};
      this.b.push(nb);if(w>360&&Math.random()<.55)this.crates.push({x:nb.x+rnd(140,w-90),y:nb.y,w:32,h:32});last=nb;
    }
  },
  jump(){
    if(this.over){if(this.endT>.5)this.start();return}
    this.started=true;const p=this.p;
    if(p.on){p.vy=-650;p.jumps=1;p.on=false;tone(500,.06,.04,'triangle',800)}else if(p.jumps<2){p.vy=-590;p.jumps=2;tone(650,.06,.04,'triangle',1000)}
  },
  key(c,r){if(!r&&(c==='Space'||c==='ArrowUp'||c==='KeyW'))this.jump()},
  down(){this.hold=true;this.jump()},
  up(){this.hold=false},
  die(){if(this.over)return;this.over=true;this.endT=0;this.best=best('roof',this.score);noise(.4,600,.25);burst(this.parts,this.p.x,this.p.y-20,24,'#f472b6',260)},
  get score(){return this.dist/20|0},
  update(dt){
    stepParts(this.parts,dt,800);
    if(this.over){this.endT+=dt;return}
    if(!this.started)return;
    this.speed=Math.min(780,this.speed+9*dt);const dx=this.speed*dt;this.dist+=dx;
    const p=this.p,held=keys.Space||keys.ArrowUp||keys.KeyW||this.hold;
    for(const b of this.b){if(b.x<=p.x+10&&b.x+dx>p.x+10&&p.y>b.y+6)return this.die();b.x-=dx}
    for(const c of this.crates)c.x-=dx;
    this.b=this.b.filter(b=>b.x+b.w>-60);this.crates=this.crates.filter(c=>c.x+c.w>-60);this.genTo();
    p.vy+=(p.vy<0&&held?1100:2100)*dt;const y0=p.y;p.y+=p.vy*dt;p.on=false;
    for(const b of this.b)if(p.x+10>b.x&&p.x-10<b.x+b.w&&p.vy>=0&&y0<=b.y+1&&p.y>=b.y){p.y=b.y;p.vy=0;p.on=true;p.jumps=0}
    for(const c of this.crates)if(p.x+10>c.x&&p.x-10<c.x+c.w&&p.y>c.y-c.h+4&&p.y-40<c.y)return this.die();
    if(p.y>H+60)this.die();
  },
  draw(){
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1e1b4b');g.addColorStop(1,'#be185d');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    circ(780,110,46,'#fde68a');
    ctx.fillStyle='#2e1065';const o=this.dist*.2%140;for(let i=-1;i<9;i++){const h=120+((i+Math.floor(this.dist*.2/140))*53%5)*40;ctx.fillRect(i*140-o,H-h-40,120,h+40)}
    for(const b of this.b){
      ctx.fillStyle='#111827';ctx.fillRect(b.x,b.y,b.w,H-b.y);ctx.fillStyle='#374151';ctx.fillRect(b.x-4,b.y,b.w+8,8);
      for(let i=0;i*34+20<b.w-20;i++)for(let j=0;b.y+30+j*44<H;j++){ctx.fillStyle=((b.id*73+i*31+j*17)%7)<2?'#fde047':'#1f2937';ctx.fillRect(b.x+20+i*34,b.y+30+j*44,16,22)}
    }
    for(const c of this.crates){ctx.fillStyle='#b45309';ctx.fillRect(c.x,c.y-c.h,c.w,c.h);ctx.strokeStyle='#78350f';ctx.lineWidth=3;ctx.strokeRect(c.x+2,c.y-c.h+2,c.w-4,c.h-4);ctx.beginPath();ctx.moveTo(c.x+3,c.y-c.h+3);ctx.lineTo(c.x+c.w-3,c.y-3);ctx.stroke()}
    if(!this.over){
      const p=this.p,ph=this.dist/18;ctx.strokeStyle='#f9fafb';ctx.lineWidth=5;ctx.lineCap='round';
      const hip={x:p.x,y:p.y-18},sh={x:p.x+4,y:p.y-34};
      ctx.beginPath();ctx.moveTo(hip.x,hip.y);ctx.lineTo(sh.x,sh.y);ctx.stroke();
      const lg=p.on?Math.sin(ph)*10:6;
      ctx.beginPath();ctx.moveTo(hip.x,hip.y);ctx.lineTo(hip.x+lg,p.y);ctx.moveTo(hip.x,hip.y);ctx.lineTo(hip.x-lg,p.y-(p.on?0:8));ctx.stroke();
      ctx.beginPath();ctx.moveTo(sh.x,sh.y+4);ctx.lineTo(sh.x-lg,sh.y+14);ctx.moveTo(sh.x,sh.y+4);ctx.lineTo(sh.x+lg+4,sh.y+12);ctx.stroke();
      circ(sh.x+2,sh.y-9,8,'#f9fafb');ctx.lineCap='butt';
    }
    drawParts(this.parts,4);
    text(this.score+'m',W/2,40,36,'#fff');
    if(!this.started)overlay('Rooftop Run','space, click or tap to jump. jump again in the air','hold to jump higher. best '+this.best+'m');
    if(this.over&&this.endT>.5)overlay('Wiped Out',this.score+'m  best '+this.best+'m','jump to retry');
  }
};

const Stack={
  start(){this.s=[{x:W/2-160,w:320}];this.score=0;this.over=false;this.endT=0;this.cam=0;this.falls=[];this.combo=0;this.flash=0;this.best=store('stack');this.spawn()},
  spawn(){const top=this.s[this.s.length-1];this.cur={x:this.score%2?W-40-top.w:40,w:top.w,dir:this.score%2?-1:1}},
  hue(i){return(i*11+190)%360},
  ly(i){return H-110-i*32+this.cam},
  drop(){
    if(this.over){if(this.endT>.5)this.start();return}
    const top=this.s[this.s.length-1],c=this.cur,i=this.s.length;let l=Math.max(c.x,top.x),r=Math.min(c.x+c.w,top.x+top.w);
    if(r-l<=0){this.falls.push({x:c.x,w:c.w,i,dy:0,vy:0});this.over=true;this.endT=0;this.best=best('stack',this.score);noise(.4,400,.25);return}
    if(Math.abs(c.x-top.x)<7){
      this.combo++;this.flash=.3;l=top.x;r=top.x+top.w;tone(440+Math.min(this.combo,12)*60,.14,.06,'triangle');
      if(this.combo>=3&&r-l<320){l=Math.max(40,l-8);r=Math.min(W-40,r+8)}
    }else{
      this.combo=0;tone(300,.06,.05);
      if(c.x<l)this.falls.push({x:c.x,w:l-c.x,i,dy:0,vy:0});
      if(c.x+c.w>r)this.falls.push({x:r,w:c.x+c.w-r,i,dy:0,vy:0});
    }
    this.s.push({x:l,w:r-l});this.score++;this.spawn();
  },
  key(c,r){if(!r&&(c==='Space'||c==='Enter'))this.drop()},
  down(){this.drop()},
  update(dt){
    for(const f of this.falls){f.vy+=1600*dt;f.dy+=f.vy*dt}this.falls=this.falls.filter(f=>f.dy<900);
    if(this.flash>0)this.flash-=dt;
    const tc=Math.max(0,(this.s.length-11)*32);this.cam+=(tc-this.cam)*Math.min(1,dt*6);
    if(this.over){this.endT+=dt;return}
    const c=this.cur,sp=Math.min(620,250+this.score*9);c.x+=c.dir*sp*dt;
    if(c.x<40){c.x=40;c.dir=1}if(c.x+c.w>W-40){c.x=W-40-c.w;c.dir=-1}
  },
  block(x,w,i,a){const y=this.ly(i);ctx.globalAlpha=a||1;ctx.fillStyle='hsl('+this.hue(i)+',65%,58%)';ctx.fillRect(x,y,w,32);ctx.fillStyle='hsl('+this.hue(i)+',65%,70%)';ctx.fillRect(x,y,w,6);ctx.fillStyle='hsl('+this.hue(i)+',55%,44%)';ctx.fillRect(x,y+28,w,4);ctx.globalAlpha=1},
  draw(){
    const h=this.hue(this.s.length),g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'hsl('+h+',40%,22%)');g.addColorStop(1,'hsl('+(h+40)+',40%,12%)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='hsl('+this.hue(0)+',30%,30%)';ctx.fillRect(this.s[0].x,this.ly(0),this.s[0].w,H);
    this.s.forEach((b,i)=>{if(this.ly(i)<H+40)this.block(b.x,b.w,i)});
    for(const f of this.falls){ctx.save();ctx.translate(0,f.dy);this.block(f.x,f.w,f.i,.9);ctx.restore()}
    if(!this.over)this.block(this.cur.x,this.cur.w,this.s.length);
    if(this.flash>0){ctx.strokeStyle='rgba(255,255,255,'+this.flash*3+')';ctx.lineWidth=3;const t=this.s[this.s.length-1];ctx.strokeRect(t.x-4,this.ly(this.s.length-1)-4,t.w+8,40)}
    text(this.score,W/2,60,56,'#fff');if(this.combo>1)text('perfect x'+this.combo,W/2,104,18,'#fde68a');
    if(this.score===0&&!this.over)text('click, tap or space to drop the block',W/2,140,18,'rgba(255,255,255,.7)');
    if(this.over&&this.endT>.5)overlay('Toppled','height '+this.score+'  best '+this.best,'click to stack again');
  }
};

const Slice={
  start(){this.f=[];this.halves=[];this.trail=[];this.p=[];this.score=0;this.miss=0;this.over=false;this.endT=0;this.t=1;this.hold=false;this.lx=null;this.combo=0;this.msg=null;this.best=store('slice')},
  down(){if(this.over){if(this.endT>.6)this.start();return}this.hold=true;this.lx=mouse.x;this.ly=mouse.y;this.trail=[{x:mouse.x,y:mouse.y,t:.18}]},
  up(){this.hold=false;this.lx=null;if(this.combo>=3){this.score+=this.combo;this.msg={t:1.2,s:this.combo+' fruit combo +'+this.combo}}this.combo=0},
  key(c){if(this.over&&this.endT>.6&&(c==='Space'||c==='Enter'))this.start()},
  toss(){const n=irnd(1,Math.min(5,1+(this.score/12|0)));for(let i=0;i<n;i++){const bomb=this.score>4&&Math.random()<.15,x=rnd(160,W-160);this.f.push({x,y:H+40,vx:(W/2-x)*rnd(.25,.6),vy:-rnd(860,1000),R:bomb?26:rnd(27,36),bomb,hue:pick([0,28,48,95,275,330]),rot:0,vr:rnd(-3,3)})}tone(260,.08,.03,'sine',380)},
  end(){this.over=true;this.endT=0;this.best=best('slice',this.score)},
  update(dt){
    stepParts(this.p,dt,700);
    for(const t of this.trail)t.t-=dt;this.trail=this.trail.filter(t=>t.t>0);
    for(const h of this.halves){h.x+=h.vx*dt;h.y+=h.vy*dt;h.vy+=900*dt;h.rot+=h.vr*dt}this.halves=this.halves.filter(h=>h.y<H+80);
    if(this.msg&&(this.msg.t-=dt)<=0)this.msg=null;
    if(this.over){this.endT+=dt;return}
    this.t-=dt;if(this.t<=0){this.toss();this.t=rnd(.9,1.7)-Math.min(this.score*.006,.5)}
    if(this.hold&&this.lx!==null){
      const ax=this.lx,ay=this.ly,bx=mouse.x,by=mouse.y;
      if(Math.hypot(bx-ax,by-ay)>3){
        this.trail.push({x:bx,y:by,t:.18});const a=Math.atan2(by-ay,bx-ax);
        for(const f of this.f){
          if(f.cut||segDist(f.x,f.y,ax,ay,bx,by)>f.R)continue;
          f.cut=true;
          if(f.bomb){burst(this.p,f.x,f.y,60,'#fbbf24',420);noise(.9,300,.4);this.end();break}
          this.score++;this.combo++;tone(700+this.combo*80,.07,.05,'triangle',300);
          const nx=-Math.sin(a),ny=Math.cos(a);
          for(const s of[1,-1])this.halves.push({x:f.x,y:f.y,vx:f.vx+nx*130*s,vy:f.vy*.4+ny*130*s,R:f.R,hue:f.hue,a,side:s,rot:0,vr:rnd(-2,2)*s});
          burst(this.p,f.x,f.y,14,'hsl('+f.hue+',85%,60%)',260);
        }
        this.lx=bx;this.ly=by;
      }
    }
    for(const f of this.f){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=900*dt;f.rot+=f.vr*dt;if(f.vy>0&&f.y>H+50){f.gone=true;if(!f.cut&&!f.bomb){this.miss++;tone(150,.25,.06,'sawtooth',90);if(this.miss>=3)this.end()}}}
    this.f=this.f.filter(f=>!f.cut&&!f.gone);
  },
  fruit(f){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.rot);
    if(f.bomb){circ(0,0,f.R,'#1f2937');circ(-8,-8,6,'rgba(255,255,255,.25)');ctx.strokeStyle='#a16207';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-f.R);ctx.quadraticCurveTo(10,-f.R-14,4,-f.R-20);ctx.stroke();circ(4,-f.R-21,4+Math.random()*3,'#fb923c');text('X',0,2,22,'#ef4444')}
    else{circ(0,0,f.R,'hsl('+f.hue+',80%,52%)');circ(-f.R*.35,-f.R*.35,f.R*.3,'rgba(255,255,255,.35)');ctx.fillStyle='#166534';ctx.beginPath();ctx.ellipse(4,-f.R,8,4,.5,0,7);ctx.fill()}
    ctx.restore()},
  draw(){
    const g=ctx.createRadialGradient(W/2,H/2,50,W/2,H/2,600);g.addColorStop(0,'#5b3a1e');g.addColorStop(1,'#2a1a0c');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=2;for(let x=60;x<W;x+=120){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
    for(const h of this.halves){ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.a+h.rot);ctx.fillStyle='hsl('+h.hue+',80%,52%)';ctx.beginPath();ctx.arc(0,0,h.R,h.side>0?0:Math.PI,h.side>0?Math.PI:Math.PI*2);ctx.fill();ctx.fillStyle='hsl('+h.hue+',90%,80%)';ctx.fillRect(-h.R+3,-2,h.R*2-6,4);ctx.restore()}
    for(const f of this.f)this.fruit(f);
    drawParts(this.p,4);
    if(this.trail.length>1){ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineCap='round';for(let i=1;i<this.trail.length;i++){ctx.lineWidth=this.trail[i].t/.18*8;ctx.beginPath();ctx.moveTo(this.trail[i-1].x,this.trail[i-1].y);ctx.lineTo(this.trail[i].x,this.trail[i].y);ctx.stroke()}ctx.lineCap='butt'}
    text(this.score,96,40,40,'#fde68a','left');
    for(let i=0;i<3;i++)text('X',W-30-i*34,36,30,i<this.miss?'#ef4444':'rgba(255,255,255,.2)');
    if(this.msg)text(this.msg.s,W/2,90,26,'#fde047');
    if(this.score===0&&!this.over)text('hold and swipe across the fruit. never the bombs',W/2,H-24,16,'rgba(255,255,255,.6)');
    if(this.over&&this.endT>.6)overlay('Game Over','score '+this.score+'  best '+this.best,'click to play again');
  }
};

const Climb={
  X0:220,CW:520,
  start(){this.p={x:W/2,y:H-80,vx:0,vy:-900,face:1};this.pl=[{x:W/2-45,y:H-40,w:90,t:'n'}];this.cam=0;this.over=false;this.endT=0;this.score=0;this.hold=false;this.parts=[];this.best=store('climb');this.topY=H-40;this.fill()},
  fill(){
    while(this.topY>this.cam-150){
      const lvl=-this.topY/10,gap=rnd(55,85)+Math.min(lvl/40,75),y=this.topY-gap,w=Math.max(60,90-lvl/100);
      const r=Math.random(),t=lvl>150&&r<.28?'m':'n',x=this.X0+rnd(0,this.CW-w);
      this.pl.push({x,y,w,t,vx:t==='m'?rnd(70,140)*(Math.random()<.5?1:-1):0,s:Math.random()<.08});
      if(lvl>60&&Math.random()<.3)this.pl.push({x:this.X0+rnd(0,this.CW-70),y:y+gap/2,w:70,t:'b'});
      this.topY=y;
    }
  },
  key(c){if(this.over&&this.endT>.5&&(c==='Space'||c==='Enter'))this.start()},
  down(){if(this.over){if(this.endT>.5)this.start();return}this.hold=true},
  up(){this.hold=false},
  update(dt){
    stepParts(this.parts,dt,800);
    if(this.over){this.endT+=dt;return}
    const p=this.p,l=keys.ArrowLeft||keys.KeyA,r=keys.ArrowRight||keys.KeyD;
    if(mouse.moved){this.mt=.8;mouse.moved=false}this.mt=(this.mt||0)-dt;
    if(l||r){p.vx=(r?1:-1)*400;p.face=r?1:-1}else if(this.hold||this.mt>0){p.vx=clamp((mouse.x-p.x)*7,-430,430);if(Math.abs(p.vx)>20)p.face=Math.sign(p.vx)}else p.vx*=Math.pow(.02,dt);
    p.x+=p.vx*dt;if(p.x<this.X0)p.x+=this.CW;if(p.x>this.X0+this.CW)p.x-=this.CW;
    p.vy+=1500*dt;const y0=p.y;p.y+=p.vy*dt;
    for(const q of this.pl){
      if(q.t==='m'){q.x+=q.vx*dt;if(q.x<this.X0||q.x+q.w>this.X0+this.CW)q.vx*=-1}
      if(p.vy>0&&!q.broken&&p.x+14>q.x&&p.x-14<q.x+q.w&&y0<=q.y&&p.y>=q.y){
        if(q.t==='b'){q.broken=true;q.fall=0;noise(.15,1500,.1);continue}
        p.y=q.y;p.vy=q.s?-1550:-900;tone(q.s?300:520,q.s?.25:.06,.04,'triangle',q.s?1200:780);
      }
      if(q.broken)q.fall=(q.fall||0)+dt;
    }
    if(p.y-this.cam<H*.42)this.cam=p.y-H*.42;
    this.score=Math.max(this.score,Math.round((H-80-p.y)/10));
    this.fill();this.pl=this.pl.filter(q=>q.y-this.cam<H+60&&!(q.broken&&q.fall>1));
    if(p.y-this.cam>H+40){this.over=true;this.endT=0;this.best=best('climb',this.score);noise(.5,300,.25)}
  },
  draw(){
    bg('#0f172a');
    const g=ctx.createLinearGradient(0,0,0,H),h=200+Math.min(this.score/20,140);g.addColorStop(0,'hsl('+h+',60%,78%)');g.addColorStop(1,'hsl('+(h-20)+',60%,90%)');ctx.fillStyle=g;ctx.fillRect(this.X0,0,this.CW,H);
    ctx.strokeStyle='rgba(30,64,175,.08)';ctx.lineWidth=1;for(let y=-((-this.cam)%30);y<H;y+=30){ctx.beginPath();ctx.moveTo(this.X0,y);ctx.lineTo(this.X0+this.CW,y);ctx.stroke()}
    ctx.save();ctx.beginPath();ctx.rect(this.X0,0,this.CW,H);ctx.clip();
    for(const q of this.pl){const y=q.y-this.cam+(q.broken?q.fall*q.fall*600:0);
      rr(q.x,y,q.w,14,7,q.t==='b'?'#a16207':q.t==='m'?'#2563eb':'#16a34a');
      if(q.t==='b'){ctx.strokeStyle='#713f12';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q.x+q.w/2,y);ctx.lineTo(q.x+q.w/2-4,y+14);ctx.stroke()}
      if(q.s){rr(q.x+q.w/2-10,y-10,20,10,3,'#9ca3af');ctx.strokeStyle='#4b5563';ctx.lineWidth=2;ctx.beginPath();for(let k=0;k<3;k++){ctx.moveTo(q.x+q.w/2-10,y-3-k*3);ctx.lineTo(q.x+q.w/2+10,y-3-k*3)}ctx.stroke()}
    }
    const p=this.p,py=p.y-this.cam;
    for(const ox of[0,-this.CW,this.CW]){const x=p.x+ox;ctx.save();ctx.translate(x,py);ctx.scale(p.face,1);rr(-15,-38,30,32,10,'#f97316');rr(-15,-12,30,8,3,'#ea580c');circ(6,-28,6,'#fff');circ(8,-28,3,'#111');ctx.fillStyle='#ea580c';ctx.fillRect(-12,-4,6,6);ctx.fillRect(6,-4,6,6);ctx.restore()}
    ctx.restore();
    ctx.fillStyle='#0f172a';ctx.fillRect(0,0,this.X0,H);ctx.fillRect(this.X0+this.CW,0,W,H);
    text(this.score,this.X0/2,60,44,'#fff');text('height',this.X0/2,96,16,'#64748b');text('best '+Math.max(this.best,this.score),this.X0/2,130,16,'#64748b');
    text('arrows or move the mouse',this.X0+this.CW+this.X0/2,H/2-12,14,'#64748b');text('to steer',this.X0+this.CW+this.X0/2,H/2+10,14,'#64748b');
    if(this.over&&this.endT>.5)overlay('Fell','height '+this.score+'  best '+this.best,'click to climb again');
  }
};

const Pins={
  CX:W/2,CY:220,R:88,
  start(){this.level=1;this.score=0;this.over=false;this.endT=0;this.best=store('pins');this.parts=[];this.setup()},
  setup(){
    this.ang=0;this.t=0;this.stuck=[];this.fly=null;this.bounce=null;this.clear=0;
    const pre=Math.min(this.level-1,5);for(let i=0;i<pre;i++)this.stuck.push(i/pre*Math.PI*2+rnd(-.2,.2));
    this.left=5+Math.min(this.level,7);this.mode=(this.level-1)%4;
  },
  throwPin(){if(this.over){if(this.endT>.5)this.start();return}if(!this.fly&&this.left>0&&this.clear<=0){this.fly={y:H-90};this.left--;tone(800,.04,.03,'square',400)}},
  key(c,r){if(!r&&(c==='Space'||c==='Enter'))this.throwPin()},
  down(){this.throwPin()},
  w(){const b=1.4+this.level*.12;return this.mode===0?b:this.mode===1?-b*1.15:this.mode===2?Math.sin(this.t*1.3)*b*1.8:b*(.4+Math.abs(Math.sin(this.t*.9))*1.4)},
  update(dt){
    stepParts(this.parts,dt,900);
    if(this.bounce){const b=this.bounce;b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=1500*dt;b.r+=b.vr*dt;if(b.y>H+100)this.bounce=null}
    if(this.over){this.endT+=dt;return}
    if(this.clear>0){this.clear-=dt;if(this.clear<=0){this.level++;this.setup()}return}
    this.t+=dt;this.ang+=this.w()*dt;
    if(this.fly){
      this.fly.y-=2100*dt;
      if(this.fly.y<=this.CY+this.R){
        const la=Math.PI/2-this.ang;
        if(this.stuck.some(a=>Math.abs(angDiff(a,la))<.17)){this.bounce={x:this.CX,y:this.CY+this.R+20,vx:rnd(-200,200),vy:-300,r:0,vr:12};this.fly=null;this.over=true;this.endT=0;this.best=best('pins',this.score);noise(.4,1800,.25);return}
        this.stuck.push(la);this.fly=null;this.score++;tone(300,.06,.06,'triangle',160);
        burst(this.parts,this.CX,this.CY+this.R,6,'#d6a16a',160);
        if(this.left===0){this.clear=1;burst(this.parts,this.CX,this.CY,50,'#b7793d',420);tone(600,.3,.06,'triangle',1200)}
      }
    }
  },
  pin(x,y,a){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle='#e5e7eb';ctx.fillRect(-3,0,6,62);ctx.fillStyle='#94a3b8';ctx.beginPath();ctx.moveTo(-3,0);ctx.lineTo(0,-10);ctx.lineTo(3,0);ctx.fill();circ(0,66,9,'#ef4444');ctx.restore()},
  draw(){
    bg('#1e1b2e');
    if(this.clear<=0){
      for(const a of this.stuck){const ga=a+this.ang;this.pin(this.CX+Math.cos(ga)*this.R,this.CY+Math.sin(ga)*this.R,ga-Math.PI/2)}
      ctx.save();ctx.translate(this.CX,this.CY);ctx.rotate(this.ang);
      circ(0,0,this.R,'#b7793d');for(let k=3;k>0;k--){ctx.strokeStyle='rgba(90,50,20,.45)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,this.R*k/4,0,7);ctx.stroke()}
      ctx.strokeStyle='#8a5a2b';ctx.lineWidth=6;ctx.beginPath();ctx.arc(0,0,this.R,0,7);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(-4,-this.R+8,8,30);
      ctx.restore();
    }
    drawParts(this.parts,5);
    if(this.fly)this.pin(this.CX,this.fly.y,0);
    else if(!this.over&&this.left>0&&this.clear<=0)this.pin(this.CX,H-90,0);
    if(this.bounce)this.pin(this.bounce.x,this.bounce.y,this.bounce.r);
    for(let i=0;i<this.left;i++){ctx.fillStyle='#e5e7eb';ctx.fillRect(40,H-40-i*24,6,18)}
    text('Level '+this.level,W-20,30,20,'#fff','right');text(this.score,96,40,40,'#fde68a','left');
    if(this.clear>0)text('level clear',W/2,H/2+60,36,'#fde047');
    if(this.score===0&&!this.over)text('tap or space to throw. dont hit another pin',W/2,H-24,16,'rgba(255,255,255,.6)');
    if(this.over&&this.endT>.5)overlay('Clang','score '+this.score+'  level '+this.level+'  best '+this.best,'click to retry');
  }
};

const Hoops={
  BR:22,
  start(){this.score=0;this.miss=0;this.over=false;this.endT=0;this.streak=0;this.msg=null;this.best=store('hoops');this.place();this.reset()},
  place(){this.base=rnd(600,820);this.hy=rnd(190,350);this.amp=this.score>=6?rnd(40,110):0;this.ht=0},
  get hx(){return this.base+Math.sin(this.ht)*this.amp},
  reset(){this.b={x:180,y:H-110,vx:0,vy:0,fly:false,t:0,touched:false,done:false};this.drag=null},
  down(){if(this.over){if(this.endT>.5)this.start();return}if(!this.b.fly&&Math.hypot(mouse.x-this.b.x,mouse.y-this.b.y)<140)this.drag=true},
  up(){if(!this.drag)return;this.drag=null;const dx=this.b.x-mouse.x,dy=this.b.y-mouse.y,l=Math.hypot(dx,dy);if(l<20)return;const k=Math.min(l*5.6,1450)/l;this.b.vx=dx*k;this.b.vy=dy*k;this.b.fly=true;tone(300,.08,.04,'triangle',200)},
  key(c){if(this.over&&this.endT>.5&&(c==='Space'||c==='Enter'))this.start()},
  result(made){
    this.b.done=true;
    if(made){const pts=this.b.touched?2:3;this.score+=pts;this.streak++;this.msg={t:1,s:this.b.touched?'+2':'swish +3'};tone(880,.15,.06,'triangle',1320)}
    else{this.miss++;this.streak=0;this.msg={t:1,s:'miss'};tone(160,.25,.05,'sawtooth',90)}
    setTimeout(()=>{if(this.miss>=3){this.over=true;this.endT=0;this.best=best('hoops',this.score)}else{if(made)this.place();this.reset()}},made?700:500);
  },
  update(dt){
    if(this.msg&&(this.msg.t-=dt)<=0)this.msg=null;
    if(this.over){this.endT+=dt;return}
    this.ht+=dt*1.4;
    const b=this.b;if(!b.fly||b.done&&b.y>H+100)return;
    b.t+=dt;const n=6,h=dt/n,hx=this.hx,R=this.BR;
    for(let i=0;i<n;i++){
      const py=b.y;b.vy+=1400*h;b.x+=b.vx*h;b.y+=b.vy*h;
      for(const p of[{x:hx-38,y:this.hy},{x:hx+38,y:this.hy}]){const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy);if(d<R+4){const nx=dx/d,ny=dy/d,vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=1.6*vn*nx;b.vy-=1.6*vn*ny;b.touched=true;tone(220,.05,.04)}b.x=p.x+nx*(R+4);b.y=p.y+ny*(R+4)}}
      const bx=hx+48;if(b.x+R>bx&&b.x-R<bx+8&&b.y>this.hy-120&&b.y<this.hy+14){if(b.vx>0&&b.x<bx){b.x=bx-R;b.vx*=-.6;b.touched=true;tone(140,.06,.05)}else if(b.vx<0&&b.x>bx+8){b.x=bx+8+R;b.vx*=-.6}}
      if(!b.done&&py<this.hy&&b.y>=this.hy&&b.vy>0&&b.x>hx-34&&b.x<hx+34)this.result(true);
      if(b.y>H-40-R){b.y=H-40-R;b.vy*=-.55;b.vx*=.8}
    }
    if(!b.done&&(b.t>4||b.x>W+60||b.x<-60||b.t>.6&&b.y>=H-40-R-1&&Math.abs(b.vy)<60))this.result(false);
  },
  draw(){
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0c4a6e');g.addColorStop(1,'#082f49');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#c2864b';ctx.fillRect(0,H-40,W,40);ctx.fillStyle='#a46d38';for(let x=0;x<W;x+=48)ctx.fillRect(x,H-40,2,40);
    const hx=this.hx,hy=this.hy;
    rr(hx+48,hy-120,8,134,2,'#e5e7eb');ctx.strokeStyle='#ef4444';ctx.lineWidth=2;ctx.strokeRect(hx+48,hy-80,8,40);
    ctx.fillStyle='#9ca3af';ctx.fillRect(hx+56,hy-60,W,6);
    ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=2;
    for(let i=0;i<=6;i++){const t=i/6;ctx.beginPath();ctx.moveTo(hx-38+76*t,hy);ctx.lineTo(hx-24+48*t,hy+46);ctx.stroke()}
    ctx.beginPath();ctx.moveTo(hx-34,hy+16);ctx.lineTo(hx+34,hy+16);ctx.moveTo(hx-28,hy+32);ctx.lineTo(hx+28,hy+32);ctx.stroke();
    if(this.drag&&!this.b.fly){
      const dx=this.b.x-mouse.x,dy=this.b.y-mouse.y,l=Math.hypot(dx,dy);
      if(l>20){const k=Math.min(l*5.6,1450)/l;let x=this.b.x,y=this.b.y,vx=dx*k,vy=dy*k;ctx.fillStyle='rgba(255,255,255,.6)';for(let i=0;i<14;i++){for(let s=0;s<3;s++){vy+=1400*.008;x+=vx*.008;y+=vy*.008}circ(x,y,3,'rgba(255,255,255,'+(1-i/14)*.7+')')}}
    }
    const b=this.b;circ(b.x,b.y,this.BR,'#ea580c');ctx.strokeStyle='#7c2d12';ctx.lineWidth=2;ctx.beginPath();ctx.arc(b.x,b.y,this.BR,0,7);ctx.moveTo(b.x-this.BR,b.y);ctx.lineTo(b.x+this.BR,b.y);ctx.moveTo(b.x,b.y-this.BR);ctx.lineTo(b.x,b.y+this.BR);ctx.stroke();
    ctx.strokeStyle='#f97316';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(hx-40,hy);ctx.lineTo(hx+40,hy);ctx.stroke();
    text(this.score,96,40,40,'#fff','left');text('streak '+this.streak,30,76,16,'#7dd3fc','left');
    for(let i=0;i<3;i++)circ(W-30-i*30,30,9,i<this.miss?'#ef4444':'rgba(255,255,255,.2)');
    if(this.msg)text(this.msg.s,W/2,80,32,'#fde047');
    if(this.score===0&&this.miss===0&&!b.fly)text('drag back from the ball and let go to shoot',W/2,H-60,18,'rgba(255,255,255,.7)');
    if(this.over&&this.endT>.5)overlay('Final Buzzer','score '+this.score+'  best '+this.best,'click to play again');
  }
};

addGame(Roof,'Rooftop Run','sprint across a city at night and leap the gaps between buildings','#ec4899','mobile');
addGame(Stack,'Stacker','drop sliding blocks to build the tallest tower you can','#60a5fa','mobile');
addGame(Slice,'Fruit Slash','swipe to slice flying fruit and dodge the bombs','#f97316','mobile');
addGame(Climb,'Sky Climb','bounce up endless platforms. springs help, brown ones crumble','#16a34a','mobile');
addGame(Pins,'Pin Toss','throw pins into a spinning log without hitting the others','#b7793d','mobile');
addGame(Hoops,'Hoops','flick the ball into a hoop that starts moving once you get good','#ea580c','mobile');
