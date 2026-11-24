const Mines={
  C:24,R:14,S:36,N:50,
  get ox(){return(W-this.C*this.S)/2},oy:64,
  start(){this.g=[];for(let i=0;i<this.C*this.R;i++)this.g.push({m:false,o:false,f:false,n:0});this.first=true;this.over=false;this.won=false;this.t=0;this.flag=false;this.endT=0;this.best=store('mines')},
  nb(i){const x=i%this.C,y=i/this.C|0,o=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<this.C&&Y<this.R)o.push(Y*this.C+X)}return o},
  plant(s){const safe=new Set([s,...this.nb(s)]);let k=0;while(k<this.N){const i=Math.random()*this.g.length|0;if(safe.has(i)||this.g[i].m)continue;this.g[i].m=true;k++}this.g.forEach((c,i)=>{c.n=this.nb(i).filter(j=>this.g[j].m).length})},
  open(i){const st=[i];while(st.length){const j=st.pop(),c=this.g[j];if(c.o||c.f)continue;c.o=true;if(!c.m&&c.n===0)for(const k of this.nb(j))if(!this.g[k].o)st.push(k)}},
  lose(){this.over=true;this.endT=0;this.g.forEach(c=>{if(c.m)c.o=true});noise(.6,400,.3)},
  check(){if(this.g.every(c=>c.m||c.o)){this.over=true;this.won=true;this.endT=0;const t=Math.round(this.t);if(!this.best||t<this.best){this.best=t;store('mines',t)}tone(520,.4,.06,'triangle',1040)}},
  down(b){
    if(this.over){if(this.endT>.5)this.start();return}
    if(inRect(mouse,{x:W-170,y:14,w:150,h:38})){this.flag=!this.flag;return}
    const x=Math.floor((mouse.x-this.ox)/this.S),y=Math.floor((mouse.y-this.oy)/this.S);if(x<0||y<0||x>=this.C||y>=this.R)return;
    const i=y*this.C+x,c=this.g[i];
    if(b===2||this.flag){if(!c.o){c.f=!c.f;tone(700,.04,.03)}return}
    if(c.f)return;
    if(this.first){this.first=false;this.plant(i)}
    if(c.o){if(c.n&&this.nb(i).filter(j=>this.g[j].f).length===c.n){for(const j of this.nb(i)){const d=this.g[j];if(!d.f&&!d.o){if(d.m){this.lose();return}this.open(j)}}}}
    else{if(c.m){this.lose();return}this.open(i);tone(400,.04,.03,'triangle',600)}
    this.check();
  },
  key(c){if(c==='KeyF')this.flag=!this.flag;if(this.over&&this.endT>.5&&(c==='Space'||c==='Enter'))this.start()},
  update(dt){if(!this.first&&!this.over)this.t+=dt;if(this.over)this.endT+=dt},
  draw(){
    bg('#111827');const S=this.S,ox=this.ox,oy=this.oy,NC=['','#60a5fa','#4ade80','#f87171','#a78bfa','#fb923c','#22d3ee','#f472b6','#e5e7eb'];
    this.g.forEach((c,i)=>{const X=ox+(i%this.C)*S,Y=oy+(i/this.C|0)*S;
      if(c.o){ctx.fillStyle=c.m?'#7f1d1d':'#1f2937';ctx.fillRect(X,Y,S-1,S-1);if(c.m)circ(X+S/2,Y+S/2,9,'#111');else if(c.n)text(c.n,X+S/2,Y+S/2+1,20,NC[c.n])}
      else{rr(X+1,Y+1,S-3,S-3,4,'#374151');ctx.fillStyle='#4b5563';ctx.fillRect(X+3,Y+3,S-7,3);if(c.f){ctx.fillStyle='#ef4444';ctx.beginPath();ctx.moveTo(X+13,Y+8);ctx.lineTo(X+26,Y+14);ctx.lineTo(X+13,Y+20);ctx.fill();ctx.fillStyle='#e5e7eb';ctx.fillRect(X+12,Y+8,2,20)}}
    });
    const fl=this.g.filter(c=>c.f).length;
    text('mines '+(this.N-fl),96,32,20,'#fff','left');text(Math.floor(this.t)+'s',W/2,32,20,'#fff');
    button({x:W-170,y:14,w:150,h:38},this.flag?'flag mode: on':'flag mode: off',this.flag?'#b91c1c':null,15);
    text('click to open, right click or F to flag, click a number to clear around it',W/2,H-14,13,'#6b7280');
    if(this.over&&this.endT>.5)overlay(this.won?'Cleared':'Boom',this.won?'time '+Math.round(this.t)+'s  best '+this.best+'s':'better luck next time','click to play again');
  }
};

const Pairs={
  SY:['circle','square','tri','star','diamond','ring','cross','hex','moon','bolt'],
  COL:['#f87171','#fb923c','#facc15','#4ade80','#22d3ee','#60a5fa','#a78bfa','#f472b6','#e5e7eb','#a3e635'],
  start(){const d=shuffle([...Array(10).keys(),...Array(10).keys()]);this.c=d.map(v=>({v,o:0,up:false,done:false}));this.sel=[];this.moves=0;this.t=0;this.wait=0;this.won=false;this.best=store('pairs')},
  rect(i){const cw=120,ch=104,g=14,ox=(W-5*cw-4*g)/2,oy=(H-4*ch-3*g)/2+16;return{x:ox+(i%5)*(cw+g),y:oy+(i/5|0)*(ch+g),w:cw,h:ch}},
  down(){
    if(this.won){this.start();return}
    if(this.wait>0)return;
    const i=this.c.findIndex((c,k)=>inRect(mouse,this.rect(k)));if(i<0)return;const c=this.c[i];if(c.up||c.done)return;
    c.up=true;this.sel.push(i);tone(500,.04,.03,'triangle');
    if(this.sel.length===2){this.moves++;const[a,b]=this.sel.map(k=>this.c[k]);if(a.v===b.v){a.done=b.done=true;this.sel=[];tone(880,.12,.05,'triangle',1200);if(this.c.every(x=>x.done)){this.won=true;if(!this.best||this.moves<this.best){this.best=this.moves;store('pairs',this.moves)}}}else this.wait=.8}
  },
  key(c){if(this.won&&(c==='Space'||c==='Enter'))this.start()},
  update(dt){if(!this.won)this.t+=dt;for(const c of this.c)c.o+=((c.up||c.done?1:0)-c.o)*Math.min(1,dt*12);if(this.wait>0){this.wait-=dt;if(this.wait<=0){this.sel.forEach(k=>this.c[k].up=false);this.sel=[]}}},
  sym(s,x,y,r,col){
    ctx.fillStyle=col;ctx.strokeStyle=col;ctx.lineWidth=8;ctx.beginPath();
    if(s==='circle')ctx.arc(x,y,r,0,7);
    if(s==='square')ctx.rect(x-r*.85,y-r*.85,r*1.7,r*1.7);
    if(s==='tri'){ctx.moveTo(x,y-r);ctx.lineTo(x+r,y+r*.8);ctx.lineTo(x-r,y+r*.8)}
    if(s==='star')for(let i=0;i<10;i++){const a=i/10*Math.PI*2-Math.PI/2,rad=i%2?r*.45:r;ctx.lineTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad)}
    if(s==='diamond'){ctx.moveTo(x,y-r);ctx.lineTo(x+r*.7,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r*.7,y)}
    if(s==='hex')for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}
    if(s==='moon'){ctx.arc(x,y,r,.6,Math.PI*2-.6);ctx.arc(x+r*.5,y,r*.7,Math.PI*2-.9,.9,true)}
    if(s==='bolt'){ctx.moveTo(x+r*.2,y-r);ctx.lineTo(x-r*.6,y+r*.15);ctx.lineTo(x,y+r*.15);ctx.lineTo(x-r*.2,y+r);ctx.lineTo(x+r*.6,y-r*.15);ctx.lineTo(x,y-r*.15)}
    if(s==='ring'){ctx.arc(x,y,r*.75,0,7);ctx.stroke();return}
    if(s==='cross'){ctx.moveTo(x-r*.7,y-r*.7);ctx.lineTo(x+r*.7,y+r*.7);ctx.moveTo(x+r*.7,y-r*.7);ctx.lineTo(x-r*.7,y+r*.7);ctx.lineCap='round';ctx.stroke();ctx.lineCap='butt';return}
    ctx.closePath();ctx.fill();
  },
  draw(){
    bg('#0f172a');
    this.c.forEach((c,i)=>{const r=this.rect(i),s=Math.abs(Math.cos(c.o*Math.PI)),face=c.o>.5,w=r.w*Math.max(.04,s);
      rr(r.x+(r.w-w)/2,r.y,w,r.h,10,face?(c.done?'#1e293b':'#334155'):'#4338ca');
      if(face&&s>.3){ctx.save();ctx.translate(r.x+r.w/2,r.y+r.h/2);ctx.scale(s,1);this.sym(this.SY[c.v],0,0,28,this.COL[c.v]);ctx.restore()}
      else if(!face){ctx.strokeStyle='rgba(255,255,255,.15)';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(r.x+(r.w-w)/2+8,r.y+8,Math.max(0,w-16),r.h-16,6);ctx.stroke()}
    });
    text('moves '+this.moves,96,28,18,'#fff','left');text(Math.floor(this.t)+'s',W/2,28,18,'#fff');text(this.best?'best '+this.best+' moves':'match all the pairs',W-20,28,18,'#94a3b8','right');
    if(this.won)overlay('All Matched',this.moves+' moves in '+Math.floor(this.t)+'s','best '+this.best+' moves. click to play again');
  }
};

const Echo={
  P:[{c:'#16a34a',l:'#4ade80',f:330},{c:'#dc2626',l:'#f87171',f:392},{c:'#ca8a04',l:'#fde047',f:262},{c:'#2563eb',l:'#60a5fa',f:196}],
  start(){this.seq=[];this.i=0;this.state='idle';this.lit=-1;this.lt=0;this.t=0;this.best=store('echo')},
  pad(i){const s=210,g=14,ox=W/2-s-g/2,oy=H/2-s-g/2+20;return{x:ox+(i%2)*(s+g),y:oy+(i/2|0)*(s+g),w:s,h:s}},
  flash(i,d){this.lit=i;this.lt=d||.35;tone(this.P[i].f,d||.35,.08,'triangle')},
  next(){this.seq.push(irnd(0,3));this.state='show';this.i=0;this.t=.7},
  press(i){
    if(this.state==='idle'||this.state==='over'){this.seq=[];this.next();return}
    if(this.state!=='input')return;
    this.flash(i,.25);
    if(i!==this.seq[this.i]){this.state='over';noise(.6,300,.3);this.best=best('echo',this.seq.length-1);return}
    this.i++;if(this.i>=this.seq.length){this.state='wait';this.t=.8}
  },
  down(){if(this.state==='idle'||this.state==='over'){this.press(0);return}for(let i=0;i<4;i++)if(inRect(mouse,this.pad(i)))this.press(i)},
  key(c,r){if(r)return;const m={Digit1:0,Digit2:1,Digit3:2,Digit4:3,KeyQ:0,KeyW:1,KeyA:2,KeyS:3,ArrowUp:0,ArrowRight:1,ArrowLeft:2,ArrowDown:3}[c];if((this.state==='idle'||this.state==='over')&&(c==='Space'||c==='Enter'))this.press(0);else if(m!==undefined)this.press(m)},
  update(dt){
    if(this.lt>0){this.lt-=dt;if(this.lt<=0)this.lit=-1}
    if(this.state==='show'){this.t-=dt;if(this.t<=0){if(this.i<this.seq.length){const sp=Math.max(.2,.45-this.seq.length*.015);this.flash(this.seq[this.i],sp);this.i++;this.t=sp+.12}else{this.state='input';this.i=0}}}
    if(this.state==='wait'){this.t-=dt;if(this.t<=0)this.next()}
  },
  draw(){
    bg('#0a0a0a');
    for(let i=0;i<4;i++){const r=this.pad(i),p=this.P[i];rr(r.x,r.y,r.w,r.h,26,this.lit===i?p.l:p.c);if(this.lit===i){ctx.shadowColor=p.l;ctx.shadowBlur=40;rr(r.x,r.y,r.w,r.h,26,p.l);ctx.shadowBlur=0}}
    circ(W/2,H/2+20,62,'#0a0a0a');text(this.seq.length?Math.max(0,this.seq.length-(this.state==='over'?1:0)):'-',W/2,H/2+22,40,'#fff');
    text(this.state==='input'?'your turn':this.state==='show'?'watch':'',W/2,34,22,'#e5e7eb');
    text('best '+this.best,W-20,30,18,'#9ca3af','right');
    if(this.state==='idle')overlay('Echo','watch the pads light up, then repeat the pattern','click, or use 1 2 3 4 or the arrow keys. click to start');
    if(this.state==='over')overlay('Wrong Pad','you got '+(this.seq.length-1)+' in a row. best '+this.best,'click to try again');
  }
};

const Four={
  C:7,R:6,
  start(){this.b=Array.from({length:6},()=>Array(7).fill(0));this.turn=1;this.over=0;this.anim=null;this.hov=3;this.win=null;this.endT=0;this.w=store('four_w');this.l=store('four_l')},
  drop(b,c,p){for(let r=5;r>=0;r--)if(!b[r][c]){b[r][c]=p;return r}return -1},
  wins(b,p){const D=[[0,1],[1,0],[1,1],[1,-1]];for(let r=0;r<6;r++)for(let c=0;c<7;c++)for(const[dr,dc]of D){const cells=[];for(let k=0;k<4;k++){const R=r+dr*k,C=c+dc*k;if(R<0||R>=6||C<0||C>=7||b[R][C]!==p)break;cells.push([R,C])}if(cells.length===4)return cells}return null},
  score(b){
    let s=0;const W4=(a)=>{const p=a.filter(x=>x===2).length,o=a.filter(x=>x===1).length,e=4-p-o;if(p===4)return 1e5;if(o===4)return -1e5;if(p===3&&e===1)return 6;if(p===2&&e===2)return 2;if(o===3&&e===1)return -8;if(o===2&&e===2)return -2;return 0};
    for(let r=0;r<6;r++)if(b[r][3]===2)s+=3;
    for(let r=0;r<6;r++)for(let c=0;c<7;c++)for(const[dr,dc]of[[0,1],[1,0],[1,1],[1,-1]]){const R=r+dr*3,Cc=c+dc*3;if(R<0||R>=6||Cc<0||Cc>=7)continue;s+=W4([0,1,2,3].map(k=>b[r+dr*k][c+dc*k]))}
    return s;
  },
  mm(b,d,a,be,max){
    if(this.wins(b,2))return 1e6+d;if(this.wins(b,1))return -1e6-d;
    const moves=[3,2,4,1,5,0,6].filter(c=>!b[0][c]);if(!moves.length)return 0;if(d===0)return this.score(b);
    if(max){let v=-1e9;for(const c of moves){const r=this.drop(b,c,2);v=Math.max(v,this.mm(b,d-1,a,be,false));b[r][c]=0;a=Math.max(a,v);if(a>=be)break}return v}
    let v=1e9;for(const c of moves){const r=this.drop(b,c,1);v=Math.min(v,this.mm(b,d-1,a,be,true));b[r][c]=0;be=Math.min(be,v);if(a>=be)break}return v;
  },
  cpu(){let bc=3,bv=-1e12;for(const c of[3,2,4,1,5,0,6]){if(this.b[0][c])continue;const r=this.drop(this.b,c,2),v=this.mm(this.b,5,-1e12,1e12,false)+Math.random();this.b[r][c]=0;if(v>bv){bv=v;bc=c}}this.play(bc,2)},
  play(c,p){const r=this.drop(this.b,c,p);if(r<0)return;this.b[r][c]=0;this.anim={c,r,p,y:-1,v:0};tone(p===1?440:330,.05,.04,'triangle')},
  land(){
    const a=this.anim;this.b[a.r][a.c]=a.p;this.anim=null;tone(200,.06,.05);
    const w=this.wins(this.b,a.p);
    if(w){this.win=w;this.over=a.p;this.endT=0;if(a.p===1)store('four_w',++this.w);else store('four_l',++this.l);return}
    if(this.b[0].every(x=>x)){this.over=3;this.endT=0;return}
    this.turn=a.p===1?2:1;if(this.turn===2)this.cpuT=.35;
  },
  geo(){const s=72,ox=(W-7*s)/2,oy=110;return{s,ox,oy}},
  col(){const{s,ox}=this.geo();return Math.floor((mouse.x-ox)/s)},
  down(){if(this.over){if(this.endT>.5)this.start();return}if(this.turn!==1||this.anim)return;const c=this.col();if(c>=0&&c<7&&!this.b[0][c])this.play(c,1)},
  key(c){if(this.over){if(this.endT>.5&&(c==='Space'||c==='Enter'))this.start();return}if(this.turn!==1||this.anim)return;if(c==='ArrowLeft')this.hov=Math.max(0,this.hov-1);if(c==='ArrowRight')this.hov=Math.min(6,this.hov+1);if((c==='Space'||c==='Enter'||c==='ArrowDown')&&!this.b[0][this.hov])this.play(this.hov,1);const d=digitOf(c);if(d&&+d>=1&&+d<=7&&!this.b[0][+d-1])this.play(+d-1,1)},
  update(dt){
    if(this.over){this.endT+=dt;return}
    if(mouse.moved){const c=this.col();if(c>=0&&c<7)this.hov=c;mouse.moved=false}
    if(this.anim){const a=this.anim;a.v+=40*dt;a.y+=a.v*dt;if(a.y>=a.r){a.y=a.r;this.land()}return}
    if(this.turn===2){this.cpuT-=dt;if(this.cpuT<=0)this.cpu()}
  },
  draw(){
    bg('#0c1222');const{s,ox,oy}=this.geo(),pc=['','#ef4444','#facc15'];
    if(!this.over&&this.turn===1&&!this.anim)circ(ox+this.hov*s+s/2,oy-40,s*.38,'rgba(239,68,68,.6)');
    if(this.anim)circ(ox+this.anim.c*s+s/2,oy+this.anim.y*s+s/2,s*.4,pc[this.anim.p]);
    ctx.fillStyle='#1d4ed8';ctx.beginPath();ctx.roundRect(ox-10,oy-10,7*s+20,6*s+20,16);
    for(let r=0;r<6;r++)for(let c=0;c<7;c++){ctx.moveTo(ox+c*s+s/2+s*.4,oy+r*s+s/2);ctx.arc(ox+c*s+s/2,oy+r*s+s/2,s*.4,0,Math.PI*2,true)}
    ctx.fill('evenodd');
    for(let r=0;r<6;r++)for(let c=0;c<7;c++)if(this.b[r][c])circ(ox+c*s+s/2,oy+r*s+s/2,s*.4,pc[this.b[r][c]]);
    if(this.win)for(const[r,c]of this.win){ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(ox+c*s+s/2,oy+r*s+s/2,s*.3,0,7);ctx.stroke()}
    text('you '+this.w+' - '+this.l+' cpu',W/2,30,20,'#e5e7eb');
    text(this.turn===1?'your move':'cpu thinking',W/2,H-24,16,'#94a3b8');
    if(this.over&&this.endT>.5)overlay(this.over===1?'You Win':this.over===2?'CPU Wins':'Draw','four in a row, any direction','click to play again');
  }
};

const Slide={
  start(){this.n=4;this.b=[...Array(15).keys()].map(x=>x+1).concat(0);let e=15,prev=-1;for(let k=0;k<300;k++){const o=this.adj(e).filter(x=>x!==prev),j=pick(o);[this.b[e],this.b[j]]=[this.b[j],this.b[e]];prev=e;e=j}this.moves=0;this.t=0;this.won=false;this.best=store('slide')},
  adj(i){const n=this.n,x=i%n,y=i/n|0,o=[];if(x>0)o.push(i-1);if(x<n-1)o.push(i+1);if(y>0)o.push(i-n);if(y<n-1)o.push(i+n);return o},
  geo(){const s=110,ox=(W-4*s)/2,oy=(H-4*s)/2+16;return{s,ox,oy}},
  mv(i){if(this.won)return;const e=this.b.indexOf(0);if(!this.adj(e).includes(i))return;[this.b[e],this.b[i]]=[this.b[i],this.b[e]];this.moves++;tone(300+this.b[e]*20,.04,.03,'triangle');if(this.b.every((v,k)=>k===15?v===0:v===k+1)){this.won=true;if(!this.best||this.moves<this.best){this.best=this.moves;store('slide',this.moves)}}},
  down(){if(this.won){this.start();return}const{s,ox,oy}=this.geo(),x=Math.floor((mouse.x-ox)/s),y=Math.floor((mouse.y-oy)/s);if(x<0||y<0||x>3||y>3)return;const i=y*4+x,e=this.b.indexOf(0),ex=e%4,ey=e/4|0;
    if(x===ex&&y!==ey){const st=y>ey?4:-4;for(let k=e+st;;k+=st){this.mv(k);if(k===i)break}}else if(y===ey&&x!==ex){const st=x>ex?1:-1;for(let k=e+st;;k+=st){this.mv(k);if(k===i)break}}},
  key(c){if(this.won&&(c==='Space'||c==='Enter')){this.start();return}const e=this.b.indexOf(0),ex=e%4,ey=e/4|0;if((c==='ArrowLeft'||c==='KeyA')&&ex<3)this.mv(e+1);if((c==='ArrowRight'||c==='KeyD')&&ex>0)this.mv(e-1);if((c==='ArrowUp'||c==='KeyW')&&ey<3)this.mv(e+4);if((c==='ArrowDown'||c==='KeyS')&&ey>0)this.mv(e-4)},
  update(dt){if(!this.won)this.t+=dt},
  draw(){
    bg('#1c1917');const{s,ox,oy}=this.geo();rr(ox-10,oy-10,4*s+20,4*s+20,14,'#292524');
    this.b.forEach((v,i)=>{if(!v)return;const x=ox+(i%4)*s,y=oy+(i/4|0)*s,ok=v===i+1;rr(x+4,y+4,s-8,s-8,12,ok?'#0d9488':'#57534e');text(v,x+s/2,y+s/2+2,40,'#fff')});
    text('moves '+this.moves,96,28,18,'#fff','left');text(Math.floor(this.t)+'s',W/2,28,18,'#fff');if(this.best)text('best '+this.best,W-20,28,18,'#a8a29e','right');
    text('click a tile in line with the gap, or use the arrow keys',W/2,H-18,14,'#78716c');
    if(this.won)overlay('Solved',this.moves+' moves in '+Math.floor(this.t)+'s','best '+this.best+'. click to shuffle again');
  }
};

const Sudoku={
  typing:true,
  start(){this.gen();this.sel=40;this.t=0;this.won=false;this.errs=0;this.best=store('sudoku')},
  ok(g,i,v){const r=i/9|0,c=i%9,br=r-r%3,bc=c-c%3;for(let k=0;k<9;k++){if(g[r*9+k]===v||g[k*9+c]===v)return false;if(g[(br+(k/3|0))*9+bc+k%3]===v)return false}return true},
  fill(g){const i=g.indexOf(0);if(i<0)return true;for(const v of shuffle([1,2,3,4,5,6,7,8,9])){if(this.ok(g,i,v)){g[i]=v;if(this.fill(g))return true;g[i]=0}}return false},
  count(g,lim){const i=g.indexOf(0);if(i<0)return 1;let n=0;for(let v=1;v<=9&&n<lim;v++){if(this.ok(g,i,v)){g[i]=v;n+=this.count(g,lim-n);g[i]=0}}return n},
  gen(){const g=Array(81).fill(0);this.fill(g);this.sol=g.slice();const p=g.slice();let rem=0;for(const i of shuffle([...Array(81).keys()])){if(rem>=50)break;const v=p[i];p[i]=0;if(this.count(p.slice(),2)!==1)p[i]=v;else rem++}this.given=p.map(v=>v>0);this.g=p},
  set(v){if(this.won||this.given[this.sel])return;this.g[this.sel]=v;if(v&&v!==this.sol[this.sel]){this.errs++;tone(160,.12,.05,'sawtooth')}else if(v)tone(600,.05,.04,'triangle');if(this.g.every((x,i)=>x===this.sol[i])){this.won=true;const t=Math.round(this.t);if(!this.best||t<this.best){this.best=t;store('sudoku',t)}tone(520,.5,.06,'triangle',1040)}},
  geo(){const s=56,ox=120,oy=(H-9*s)/2;return{s,ox,oy}},
  pad(i){return{x:700,y:110+Math.floor(i/3)*76,w:66,h:66,ox:(i%3)*76}},
  down(){
    if(this.won){this.start();return}
    const{s,ox,oy}=this.geo(),x=Math.floor((mouse.x-ox)/s),y=Math.floor((mouse.y-oy)/s);
    if(x>=0&&y>=0&&x<9&&y<9){this.sel=y*9+x;return}
    for(let i=0;i<9;i++){const p=this.pad(i),r={x:p.x+p.ox,y:p.y,w:p.w,h:p.h};if(inRect(mouse,r)){this.set(i+1);return}}
    if(inRect(mouse,{x:700,y:346,w:218,h:50}))this.set(0);
    if(inRect(mouse,{x:700,y:406,w:218,h:50})){this.start()}
  },
  key(c){
    if(this.won&&(c==='Space'||c==='Enter')){this.start();return}
    const d=digitOf(c);if(d!==null){this.set(+d);return}
    if(c==='Backspace'||c==='Delete')this.set(0);
    const m={ArrowLeft:-1,ArrowRight:1,ArrowUp:-9,ArrowDown:9}[c];if(m){const n=this.sel+m;if(n>=0&&n<81&&!(m===1&&n%9===0)&&!(m===-1&&this.sel%9===0))this.sel=n}
  },
  update(dt){if(!this.won)this.t+=dt},
  draw(){
    bg('#f8fafc');const{s,ox,oy}=this.geo(),sr=this.sel/9|0,sc=this.sel%9,sv=this.g[this.sel];
    for(let i=0;i<81;i++){const r=i/9|0,c=i%9,X=ox+c*s,Y=oy+r*s;
      let col='#fff';if(r===sr||c===sc||(Math.floor(r/3)===Math.floor(sr/3)&&Math.floor(c/3)===Math.floor(sc/3)))col='#e2e8f0';if(sv&&this.g[i]===sv)col='#bfdbfe';if(i===this.sel)col='#93c5fd';
      ctx.fillStyle=col;ctx.fillRect(X,Y,s,s);
      if(this.g[i])text(this.g[i],X+s/2,Y+s/2+2,30,this.given[i]?'#0f172a':this.g[i]===this.sol[i]?'#2563eb':'#dc2626');
    }
    for(let k=0;k<=9;k++){ctx.fillStyle='#0f172a';const w=k%3?1:3;ctx.fillRect(ox+k*s-w/2,oy,w,9*s);ctx.fillRect(ox,oy+k*s-w/2,9*s,w)}
    for(let i=0;i<9;i++){const p=this.pad(i),r={x:p.x+p.ox,y:p.y,w:p.w,h:p.h},h=inRect(mouse,r);rr(r.x,r.y,r.w,r.h,10,h?'#cbd5e1':'#e2e8f0');text(i+1,r.x+r.w/2,r.y+r.h/2+2,28,'#0f172a')}
    rr(700,346,218,50,10,'#e2e8f0');text('erase',809,372,20,'#0f172a');rr(700,406,218,50,10,'#e2e8f0');text('new puzzle',809,432,20,'#0f172a');
    text('time '+Math.floor(this.t/60)+':'+String(Math.floor(this.t%60)).padStart(2,'0'),700,60,20,'#0f172a','left');text('mistakes '+this.errs,700,86,16,'#64748b','left');
    if(this.best)text('best '+Math.floor(this.best/60)+':'+String(this.best%60).padStart(2,'0'),700,490,16,'#64748b','left');
    text('click a cell, type 1 to 9. esc to leave',700,540,14,'#94a3b8','left');
    if(this.won)overlay('Solved','time '+Math.floor(this.t/60)+':'+String(Math.floor(this.t%60)).padStart(2,'0')+'  mistakes '+this.errs,'click for a new puzzle');
  }
};

const Lights={
  start(){this.level=1;this.best=store('lights');this.setup()},
  setup(){this.b=Array(25).fill(false);const n=2+this.level;const used=new Set();while(used.size<Math.min(n,20)){const i=irnd(0,24);if(used.has(i))continue;used.add(i);this.tog(i)}if(this.b.every(x=>!x))this.tog(12);this.moves=0;this.par=used.size;this.won=0},
  tog(i){const x=i%5,y=i/5|0;for(const[dx,dy]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<5&&Y<5)this.b[Y*5+X]=!this.b[Y*5+X]}},
  geo(){const s=96,ox=(W-5*s)/2,oy=(H-5*s)/2+20;return{s,ox,oy}},
  down(){if(this.won){if(this.won>.6){this.level++;this.best=best('lights',this.level-1);this.setup()}return}const{s,ox,oy}=this.geo(),x=Math.floor((mouse.x-ox)/s),y=Math.floor((mouse.y-oy)/s);if(x<0||y<0||x>4||y>4)return;this.tog(y*5+x);this.moves++;tone(this.b[y*5+x]?660:440,.05,.04,'triangle');if(this.b.every(v=>!v))this.won=.001},
  key(c){if(c==='KeyR'){this.setup()}if(this.won>.6&&(c==='Space'||c==='Enter'))this.down()},
  update(dt){if(this.won)this.won+=dt},
  draw(){
    bg('#09090b');const{s,ox,oy}=this.geo();
    this.b.forEach((v,i)=>{const X=ox+(i%5)*s,Y=oy+(i/5|0)*s;if(v){ctx.shadowColor='#fde047';ctx.shadowBlur=30}rr(X+6,Y+6,s-12,s-12,14,v?'#fde047':'#27272a');ctx.shadowBlur=0});
    text('Level '+this.level,96,28,20,'#fff','left');text('moves '+this.moves+'  (can be done in '+this.par+')',W/2,28,18,'#a1a1aa');text('R to reset',W-20,28,16,'#71717a','right');
    text('pressing a light flips it and its neighbors. turn them all off',W/2,H-20,14,'#71717a');
    if(this.won>.6)overlay('Lights Out','level '+this.level+' in '+this.moves+' moves','click for the next level');
  }
};

addGame(Mines,'Minefield','clear the field without stepping on any of the 50 mines','#9ca3af','puzzle');
addGame(Sudoku,'Sudoku','fresh puzzle every time with a unique solution','#2563eb','puzzle');
addGame(Four,'Four Up','drop discs and get four in a row before the cpu does','#facc15','puzzle');
addGame(Pairs,'Pairs','flip cards and match every pair in as few moves as possible','#6366f1','puzzle');
addGame(Echo,'Echo','repeat the growing pattern of lights and tones','#16a34a','puzzle');
addGame(Slide,'Slide 15','put the numbered tiles back in order','#0d9488','puzzle');
addGame(Lights,'Lights Out','flip lights and their neighbors until the board is dark','#fde047','puzzle');
