const WORDS5=('about above actor acute admit adopt adult after again agent agree ahead alarm album alert alike alive allow alone along alter among anger angle angry apart apple apply arena argue arise array aside asset audio avoid award aware badly baker basic beach began begin being below bench birth black blade blame blank blast blind block blood board boost booth bound brain brand bread break breed brief bring broad broke brown build built buyer cable candy carry catch cause chain chair chart chase cheap check chest chief child chose civil claim class clean clear climb clock close cloud coach coast corgi could count court cover craft crash cream crime cross crowd crown curve cycle daily dance dealt death delay depth doubt dozen draft drama drawn dream dress drink drive drove eager early earth eight elite empty enemy enjoy enter entry equal error event every exact exist extra faith false fault fiber field fifth fifty fight final first fixed flash fleet floor fluid focus force forth forty found frame fresh front fruit fully funny giant given glass globe grace grade grand grant grass great green gross group grown guard guess guest guide happy heart heavy horse hotel house human ideal image index inner input issue joint judge known label large laser later laugh layer learn lease least leave legal level light limit local logic loose lower lucky lunch major maker march match maybe mayor meant media metal might minor minus mixed model money month moral motor mount mouse mouth movie music never night noise north novel nurse ocean offer often order other paint panel paper party peace phase phone photo piece pilot pitch place plain plane plant plate point pound power press price pride prime print prize proof proud prove queen quick quiet quite radio raise range rapid ratio reach ready right rival river robot rough round route royal scale scene scope score sense serve seven shape share sharp sheet shelf shell shift shirt shock shoot short sight since skill sleep slide small smart smile solid solve sorry sound south space spare speak speed spend split spoke sport staff stage stand start state steam steel stick still stock stone store storm story study stuff style sugar super sweet table taste teach teeth thank theme thick thing think third three throw tight tired title today topic total touch tough tower track trade train treat trend trial truck truly trust truth twice under union until upper upset urban usual valid value video virus visit vital voice waste watch water wheel where which while white whole woman world worry worse worth would write wrong young youth').split(' ');

const CATWORDS={
  animals:['ELEPHANT','GIRAFFE','PENGUIN','KANGAROO','DOLPHIN','OCTOPUS','CHEETAH','HEDGEHOG','CROCODILE','BUTTERFLY','SQUIRREL','FLAMINGO','PORCUPINE','ARMADILLO','CORGI','TORTOISE','PANTHER','RACCOON'],
  food:['SPAGHETTI','PANCAKE','AVOCADO','BROCCOLI','CHOCOLATE','PINEAPPLE','BURRITO','DUMPLING','CROISSANT','PRETZEL','LASAGNA','WATERMELON','NOODLES','POPCORN','MUFFIN','CARROT'],
  countries:['BRAZIL','CANADA','NORWAY','PORTUGAL','ARGENTINA','MOROCCO','VIETNAM','ICELAND','MEXICO','AUSTRALIA','INDONESIA','JAPAN','EGYPT','SWEDEN','PERU','KENYA'],
  sports:['BASKETBALL','VOLLEYBALL','BADMINTON','SWIMMING','WRESTLING','ARCHERY','CRICKET','HOCKEY','SURFING','SKIING','TENNIS','BOXING','CYCLING','ROWING','FENCING','KARATE'],
  things:['TELESCOPE','UMBRELLA','KEYBOARD','LIGHTHOUSE','BACKPACK','HEADPHONES','SANDCASTLE','SNOWFLAKE','TRAMPOLINE','VOLCANO','LANTERN','COMPASS','CANDLE','BICYCLE','ROCKET','MIRROR']
};

const Five={
  typing:true,
  start(){this.ans=pick(WORDS5).toUpperCase();this.rows=[];this.cur='';this.done=false;this.won=false;this.msg=null;this.shake=0;this.flip=0;this.ks=kbLayout(436,58,46);this.streak=store('five_streak')},
  eval(g){const a=this.ans.split(''),r=Array(5).fill(0);for(let i=0;i<5;i++)if(g[i]===a[i]){r[i]=2;a[i]=null}for(let i=0;i<5;i++)if(!r[i]){const j=a.indexOf(g[i]);if(j>=0){r[i]=1;a[j]=null}}return r},
  input(k){
    if(this.done){if(k==='Enter'&&this.endT>.6)this.start();return}
    if(k==='Enter'){
      if(this.cur.length<5){this.msg={t:1,s:'not enough letters'};this.shake=.3;return}
      const r=this.eval(this.cur);this.rows.push({w:this.cur,r});this.cur='';this.flip=0;tone(500,.06,.04,'triangle');
      if(r.every(x=>x===2)){this.done=true;this.won=true;this.endT=0;this.streak++;store('five_streak',this.streak);setTimeout(()=>tone(880,.3,.06,'triangle',1320),500)}
      else if(this.rows.length>=6){this.done=true;this.endT=0;this.streak=0;store('five_streak',0)}
      return;
    }
    if(k==='Backspace'){this.cur=this.cur.slice(0,-1);return}
    if(this.cur.length<5)this.cur+=k;
  },
  key(c){const l=letterOf(c);if(l)this.input(l);if(c==='Space'&&this.done)this.input('Enter')},
  down(){if(this.done&&this.endT>.6){this.start();return}const k=kbHit(this.ks);if(k)this.input(k)},
  update(dt){if(this.msg&&(this.msg.t-=dt)<=0)this.msg=null;if(this.shake>0)this.shake-=dt;this.flip+=dt;if(this.done)this.endT+=dt},
  draw(){
    bg('#121213');const s=60,g=6,ox=(W-5*s-4*g)/2,oy=18,C=['#3a3a3c','#b59f3b','#538d4e'];
    for(let r=0;r<6;r++)for(let i=0;i<5;i++){
      const X=ox+i*(s+g)+(r===this.rows.length&&this.shake>0?Math.sin(this.shake*60)*6:0),Y=oy+r*(s+g),row=this.rows[r];
      if(row){const last=r===this.rows.length-1,p=last?clamp((this.flip-i*.12)/.25,0,1):1,sc=Math.abs(Math.cos(p*Math.PI)),shown=p>.5;ctx.save();ctx.translate(X+s/2,Y+s/2);ctx.scale(1,Math.max(.05,sc));rr(-s/2,-s/2,s,s,4,shown?C[row.r[i]]:'#121213');if(!shown){ctx.strokeStyle='#565758';ctx.lineWidth=2;ctx.strokeRect(-s/2+1,-s/2+1,s-2,s-2)}text(row.w[i],0,2,32,'#fff');ctx.restore()}
      else{ctx.strokeStyle=r===this.rows.length&&this.cur[i]?'#818384':'#3a3a3c';ctx.lineWidth=2;ctx.strokeRect(X+1,Y+1,s-2,s-2);if(r===this.rows.length&&this.cur[i])text(this.cur[i],X+s/2,Y+s/2+2,32,'#fff')}
    }
    const st={};for(const row of this.rows)row.w.split('').forEach((ch,i)=>{st[ch]=Math.max(st[ch]??-1,row.r[i])});
    kbDraw(this.ks,ch=>st[ch]===undefined?null:['#2a2a2c','#b59f3b','#538d4e'][st[ch]]);
    text('streak '+this.streak,W-20,30,16,'#818384','right');text('guess the five letter word',96,30,16,'#818384','left');
    if(this.msg)text(this.msg.s,W/2,H/2-60,22,'#fff');
    if(this.done&&this.endT>.6)overlay(this.won?'Got It':'The word was '+this.ans,this.won?'in '+this.rows.length+' of 6. streak '+this.streak:'streak reset','press enter or click for a new word');
  }
};

const Gallows={
  typing:true,
  start(){this.wins=store('gallows');this.next()},
  next(){const c=pick(Object.keys(CATWORDS));this.cat=c;this.word=pick(CATWORDS[c]);this.got=new Set();this.miss=[];this.done=false;this.won=false;this.endT=0;this.ks=kbLayout(400,60,52)},
  guess(l){
    if(this.done){if(this.endT>.6)this.next();return}
    if(l==='Enter'||l==='Backspace'||this.got.has(l)||this.miss.includes(l))return;
    if(this.word.includes(l)){this.got.add(l);tone(660,.06,.04,'triangle');if([...this.word].every(ch=>this.got.has(ch))){this.done=true;this.won=true;this.wins++;store('gallows',this.wins);tone(880,.3,.06,'triangle',1320)}}
    else{this.miss.push(l);tone(180,.15,.05,'sawtooth');if(this.miss.length>=7){this.done=true}}
  },
  key(c){const l=letterOf(c);if(l)this.guess(l);if(this.done&&(c==='Space'||c==='Enter')&&this.endT>.6)this.next()},
  down(){if(this.done){if(this.endT>.6)this.next();return}const k=kbHit(this.ks);if(k)this.guess(k)},
  update(dt){if(this.done)this.endT+=dt},
  draw(){
    bg('#1c1917');const m=this.miss.length;ctx.strokeStyle='#d6d3d1';ctx.lineWidth=5;ctx.lineCap='round';
    const bx=140,by=340;ctx.beginPath();ctx.moveTo(bx-60,by);ctx.lineTo(bx+80,by);ctx.moveTo(bx-30,by);ctx.lineTo(bx-30,60);ctx.lineTo(bx+70,60);ctx.lineTo(bx+70,95);ctx.stroke();
    ctx.strokeStyle='#fca5a5';ctx.beginPath();
    if(m>0){ctx.moveTo(bx+92,120);ctx.arc(bx+70,120,22,0,7)}
    if(m>1){ctx.moveTo(bx+70,142);ctx.lineTo(bx+70,220)}
    if(m>2){ctx.moveTo(bx+70,160);ctx.lineTo(bx+40,195)}
    if(m>3){ctx.moveTo(bx+70,160);ctx.lineTo(bx+100,195)}
    if(m>4){ctx.moveTo(bx+70,220);ctx.lineTo(bx+45,270)}
    if(m>5){ctx.moveTo(bx+70,220);ctx.lineTo(bx+95,270)}
    ctx.stroke();if(m>6){ctx.fillStyle='#fca5a5';text('x x',bx+70,116,14,'#1c1917')}ctx.lineCap='butt';
    text('category: '+this.cat,600,70,20,'#a8a29e');
    const L=this.word.length,sw=Math.min(52,560/L),ox=600-L*sw/2;
    [...this.word].forEach((ch,i)=>{const X=ox+i*sw;ctx.fillStyle='#78716c';ctx.fillRect(X+4,220,sw-8,4);if(this.got.has(ch)||this.done)text(ch,X+sw/2,196,34,this.got.has(ch)?'#fff':'#f87171')});
    text('misses '+m+' / 7   '+this.miss.join(' '),600,280,18,'#f87171');
    kbDraw(this.ks,ch=>this.got.has(ch)?'#15803d':this.miss.includes(ch)?'#44403c':null);
    text('wins '+this.wins,W-20,26,16,'#a8a29e','right');
    if(this.done&&this.endT>.6)overlay(this.won?'Saved':'Hanged','the word was '+this.word,'click or press enter for the next one');
  }
};

const Scramble={
  typing:true,
  start(){this.state='menu';this.best=store('scramble');this.ks=kbLayout(436,58,46)},
  pool(){return WORDS5.map(w=>w.toUpperCase()).concat(Object.values(CATWORDS).flat().filter(w=>w.length<=8))},
  begin(){this.state='play';this.time=60;this.score=0;this.solved=0;this.cur='';this.flash=0;this.next()},
  next(){do{this.word=pick(this.pool())}while(this.word.length<5);let s;do{s=shuffle(this.word.split('')).join('')}while(s===this.word);this.mix=s;this.cur='';this.hint=0},
  input(k){
    if(this.state!=='play'){if(k==='Enter'&&(this.state==='menu'||this.endT>.6))this.begin();return}
    if(k==='Backspace'){this.cur=this.cur.slice(0,-1);return}
    if(k==='Enter'){if(this.cur===this.word)this.ok();else if(this.cur.length){this.flash=-.3;tone(160,.15,.05,'sawtooth');this.cur=''}return}
    if(this.cur.length<this.word.length){this.cur+=k;if(this.cur===this.word)this.ok();else if(this.cur.length===this.word.length){this.flash=-.3;tone(160,.15,.05,'sawtooth');setTimeout(()=>{if(this.cur.length===this.word.length&&this.cur!==this.word)this.cur=''},250)}}
  },
  ok(){this.solved++;this.score+=this.word.length*10-this.hint*10;this.time+=3;this.flash=.3;tone(880,.1,.05,'triangle',1320);this.next()},
  skip(){if(this.state!=='play')return;this.time=Math.max(0,this.time-5);this.next();tone(240,.1,.04)},
  key(c){if(c==='Tab'){this.skip();return}const l=letterOf(c);if(l)this.input(l);if(c==='Space'&&this.state!=='play')this.input('Enter')},
  down(){if(this.state!=='play'){if(this.state==='menu'||this.endT>.6)this.begin();return}if(inRect(mouse,{x:W/2-160,y:330,w:150,h:44})){this.skip();return}if(inRect(mouse,{x:W/2+10,y:330,w:150,h:44})){if(this.hint<this.word.length-1){this.hint++;this.cur=this.word.slice(0,this.hint)}return}const k=kbHit(this.ks);if(k)this.input(k)},
  update(dt){
    if(this.state==='over'){this.endT+=dt;return}
    if(this.state!=='play')return;
    if(this.flash>0)this.flash=Math.max(0,this.flash-dt);if(this.flash<0)this.flash=Math.min(0,this.flash+dt);
    this.time-=dt;if(this.time<=0){this.time=0;this.state='over';this.endT=0;this.best=best('scramble',this.score)}
  },
  draw(){
    bg(this.flash>0?'#14532d':this.flash<0?'#450a0a':'#172554');
    if(this.state!=='menu'){
      text('score '+this.score,96,30,18,'#fff','left');text(Math.ceil(this.time)+'s',W/2,30,24,this.time<10?'#fca5a5':'#fff');text('solved '+this.solved,W-24,30,18,'#bfdbfe','right');
      const L=this.word.length,s=58,ox=W/2-(L*(s+8)-8)/2;
      [...this.mix].forEach((ch,i)=>{rr(ox+i*(s+8),90,s,s,8,'#fde68a');text(ch,ox+i*(s+8)+s/2,90+s/2+2,30,'#1e293b')});
      for(let i=0;i<L;i++){const X=ox+i*(s+8);ctx.strokeStyle='#93c5fd';ctx.lineWidth=2;ctx.strokeRect(X+1,200,s-2,s-2);if(this.cur[i])text(this.cur[i],X+s/2,200+s/2+2,30,'#fff')}
      button({x:W/2-160,y:330,w:150,h:44},'skip (-5s)',null,16);button({x:W/2+10,y:330,w:150,h:44},'hint (-10)',null,16);
      kbDraw(this.ks);
    }
    if(this.state==='menu')overlay('Scramble','unscramble as many words as you can. each one adds 3 seconds','tab skips. click or press enter to start. best '+this.best);
    if(this.state==='over'&&this.endT>.6)overlay('Time','solved '+this.solved+'  score '+this.score+'  best '+this.best,'click to play again');
  }
};

const TypeRain={
  typing:true,
  start(){this.state='menu';this.best=store('typerain');this.parts=[];this.w=[];this.ks=TOUCH?kbLayout(440,58,46):null},
  begin(){this.state='play';this.w=[];this.t=0;this.score=0;this.lives=5;this.typed='';this.lock=null;this.sp=40;this.parts=[];this.el=0},
  floor(){return this.ks?430:H-40},
  spawn(){const pool=WORDS5.concat(['cat','dog','sun','run','map','sky','fox','zip','jam','owl','keyboard','monster','galaxy','thunder','rocket','planet','window','silver','jungle','puzzle']);let w;do{w=pick(pool).toLowerCase()}while(this.w.some(x=>x.s[0]===w[0]));ctx.font='bold 24px system-ui,sans-serif';const wd=ctx.measureText(w).width;this.w.push({s:w,x:rnd(20,W-20-wd),y:-10,v:this.sp*rnd(.8,1.25)})},
  input(k){
    if(this.state!=='play'){if(k==='Enter'&&(this.state==='menu'||this.endT>.6))this.begin();return}
    if(k==='Backspace'||k==='Enter'){this.typed='';this.lock=null;return}
    const ch=k.toLowerCase(),nt=this.typed+ch;
    let tgt=this.lock&&this.w.includes(this.lock)?this.lock:null;
    if(!tgt)tgt=this.w.filter(w=>w.s.startsWith(nt)).sort((a,b)=>b.y-a.y)[0];
    if(tgt&&tgt.s.startsWith(nt)){this.typed=nt;this.lock=tgt;tone(900,.02,.02,'square');
      if(nt===tgt.s){this.score+=tgt.s.length*10;ctx.font='bold 24px system-ui,sans-serif';burst(this.parts,tgt.x+ctx.measureText(tgt.s).width/2,tgt.y,20,'#5eead4',260);this.w=this.w.filter(w=>w!==tgt);this.typed='';this.lock=null;tone(1200,.06,.04,'triangle',1600)}}
    else{tone(140,.05,.04)}
  },
  key(c){const l=letterOf(c);if(l)this.input(l);if(c==='Space'&&this.state!=='play')this.input('Enter')},
  down(){if(this.state!=='play'){if(this.state==='menu'||this.endT>.6)this.begin();return}if(this.ks){const k=kbHit(this.ks);if(k)this.input(k)}},
  update(dt){
    stepParts(this.parts,dt,300);
    if(this.state==='over'){this.endT+=dt;return}
    if(this.state!=='play')return;
    this.el+=dt;this.sp=40+this.el*1.2;this.t-=dt;
    if(this.t<=0){this.spawn();this.t=Math.max(.7,2.2-this.el*.02)}
    for(const w of this.w){w.y+=w.v*dt;if(w.y>this.floor()){w.dead=true;this.lives--;noise(.3,500,.2);if(w===this.lock){this.lock=null;this.typed=''}}}
    this.w=this.w.filter(w=>!w.dead);
    if(this.lives<=0){this.state='over';this.endT=0;this.best=best('typerain',this.score)}
  },
  draw(){
    bg('#020617');
    ctx.fillStyle='rgba(56,189,248,.05)';for(let x=0;x<W;x+=24)ctx.fillRect(x,(x*37+performance.now()/8)%H,1,30);
    ctx.font='bold 24px system-ui,sans-serif';ctx.textBaseline='middle';ctx.textAlign='left';
    for(const w of this.w){const on=w===this.lock;ctx.fillStyle=on?'#94a3b8':'#e2e8f0';ctx.fillText(w.s,w.x,w.y);if(on){ctx.fillStyle='#5eead4';ctx.fillText(this.typed,w.x,w.y)}}
    drawParts(this.parts,3);
    ctx.fillStyle='#7f1d1d';ctx.fillRect(0,this.floor(),W,3);
    if(this.state!=='menu'){text('score '+this.score,96,24,18,'#fff','left');for(let i=0;i<5;i++)circ(W-30-i*26,24,8,i<this.lives?'#38bdf8':'rgba(255,255,255,.15)')}
    if(this.ks)kbDraw(this.ks);
    if(this.state==='menu')overlay('Type Rain','type the falling words before they hit the ground','backspace clears. click or press enter to start. best '+this.best);
    if(this.state==='over'&&this.endT>.6)overlay('Flooded','score '+this.score+'  best '+this.best,'click to play again');
  }
};

const Hunt={
  N:12,
  start(){this.cat=pick(Object.keys(CATWORDS));this.build();this.t=0;this.won=false;this.drag=null},
  build(){
    const N=this.N;
    for(let attempt=0;attempt<50;attempt++){
      const g=Array(N*N).fill(''),placed=[],D=[[1,0],[0,1],[1,1],[1,-1],[-1,0],[0,-1],[-1,-1],[-1,1]];
      for(const w of shuffle(CATWORDS[this.cat].filter(w=>w.length<=N).slice())){
        if(placed.length>=8)break;
        for(let t=0;t<200;t++){
          const[dx,dy]=pick(D),x=irnd(0,N-1),y=irnd(0,N-1),ex=x+dx*(w.length-1),ey=y+dy*(w.length-1);
          if(ex<0||ey<0||ex>=N||ey>=N)continue;
          let ok=true;for(let i=0;i<w.length;i++){const c=g[(y+dy*i)*N+x+dx*i];if(c&&c!==w[i]){ok=false;break}}
          if(!ok)continue;
          for(let i=0;i<w.length;i++)g[(y+dy*i)*N+x+dx*i]=w[i];
          placed.push({w,x,y,ex,ey,found:false});break;
        }
      }
      if(placed.length>=6){const A='ABCDEFGHIJKLMNOPRSTUVWY';this.g=g.map(c=>c||A[Math.random()*A.length|0]);this.words=placed;return}
    }
  },
  geo(){const s=44,ox=60,oy=(H-this.N*s)/2;return{s,ox,oy}},
  cell(){const{s,ox,oy}=this.geo(),x=Math.floor((mouse.x-ox)/s),y=Math.floor((mouse.y-oy)/s);return x>=0&&y>=0&&x<this.N&&y<this.N?{x,y}:null},
  down(){if(this.won){this.start();return}const c=this.cell();if(c)this.drag={a:c,b:c}},
  up(){
    if(!this.drag)return;const{a,b}=this.drag;this.drag=null;
    for(const w of this.words){if(w.found)continue;if(a.x===w.x&&a.y===w.y&&b.x===w.ex&&b.y===w.ey||b.x===w.x&&b.y===w.y&&a.x===w.ex&&a.y===w.ey){w.found=true;tone(880,.12,.05,'triangle',1200);if(this.words.every(x=>x.found))this.won=true;return}}
    if(a.x!==b.x||a.y!==b.y)tone(180,.08,.04);
  },
  key(c){if(this.won&&(c==='Space'||c==='Enter'))this.start()},
  update(dt){
    if(!this.won)this.t+=dt;
    if(this.drag){const c=this.cell();if(c){const dx=c.x-this.drag.a.x,dy=c.y-this.drag.a.y;if(dx===0||dy===0||Math.abs(dx)===Math.abs(dy))this.drag.b=c}}
  },
  line(a,b,col){const{s,ox,oy}=this.geo();ctx.strokeStyle=col;ctx.lineWidth=s*.72;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(ox+a.x*s+s/2,oy+a.y*s+s/2);ctx.lineTo(ox+b.x*s+s/2,oy+b.y*s+s/2);ctx.stroke();ctx.lineCap='butt'},
  draw(){
    bg('#fefce8');const{s,ox,oy}=this.geo();rr(ox-8,oy-8,this.N*s+16,this.N*s+16,12,'#fff');
    this.words.forEach((w,i)=>{if(w.found)this.line({x:w.x,y:w.y},{x:w.ex,y:w.ey},'hsla('+(i*47)%360+',80%,60%,.45)')});
    if(this.drag)this.line(this.drag.a,this.drag.b,'rgba(59,130,246,.35)');
    for(let i=0;i<this.g.length;i++)text(this.g[i],ox+(i%this.N)*s+s/2,oy+(i/this.N|0)*s+s/2+1,22,'#292524');
    const rx=ox+this.N*s+60;text('find the '+this.cat,rx,60,26,'#292524','left');
    this.words.forEach((w,i)=>{text(w.w,rx,110+i*40,22,w.found?'#a8a29e':'#292524','left');if(w.found){ctx.fillStyle='#a8a29e';ctx.font='bold 22px system-ui,sans-serif';ctx.fillRect(rx,110+i*40,ctx.measureText(w.w).width,2)}});
    text(Math.floor(this.t)+'s',W-24,30,18,'#78716c','right');
    text('drag from the first letter to the last',rx,H-40,14,'#a8a29e','left');
    if(this.won)overlay('All Found','took '+Math.floor(this.t)+'s','click for a new puzzle');
  }
};

addGame(Five,'Five','guess the hidden five letter word in six tries','#538d4e','word');
addGame(Gallows,'Gallows','classic hangman with categories','#fca5a5','word');
addGame(Scramble,'Scramble','unscramble words against the clock','#fde68a','word');
addGame(TypeRain,'Type Rain','type falling words before they land','#38bdf8','word');
addGame(Hunt,'Word Hunt','find the hidden words in a letter grid','#eab308','word');
