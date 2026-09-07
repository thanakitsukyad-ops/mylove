(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const config = window.LOVE_CONFIG || {};
  document.querySelectorAll('[data-recipient]').forEach(e => e.textContent = config.recipient || 'คนเก่งของเรา');
  document.querySelectorAll('[data-sender]').forEach(e => e.textContent = config.sender || 'คนที่อยากดูแลเธอ');
  for (const [selector, content] of Object.entries(config.texts || {})) {
    try { document.querySelectorAll(selector).forEach(el => { el.textContent = content; el.style.whiteSpace = 'pre-line'; }); } catch { /* Ignore invalid optional selectors. */ }
  }
  if(config.pageTitle) document.title = config.pageTitle;
  // Keep the last line of the two main titles pink, even after editing the copy.
  for(const selector of ['h1','.proposal h2']){
    const heading=$(selector), lines=heading.textContent.split('\n');
    if(lines.length>1){heading.replaceChildren(document.createTextNode(lines.slice(0,-1).join('\n')+'\n'));const accent=document.createElement('em');accent.textContent=lines.at(-1);heading.append(accent);}
  }
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let audio, master, melodyTimer, musicOn = false;
  const notes = [523.25,659.25,783.99,659.25,587.33,659.25,523.25,440,523.25,659.25,880,783.99,659.25,587.33,523.25,0];
  function playMelody() {
    if (!musicOn || !audio) return;
    const now = audio.currentTime;
    notes.forEach((frequency,i) => {
      if(!frequency) return;
      const osc = audio.createOscillator(), volume = audio.createGain();
      osc.type='sine'; osc.frequency.value=frequency;
      volume.gain.setValueAtTime(0,now+i*.55);
      volume.gain.linearRampToValueAtTime(.12,now+i*.55+.025);
      volume.gain.exponentialRampToValueAtTime(.001,now+i*.55+1.7);
      osc.connect(volume); volume.connect(master); osc.start(now+i*.55); osc.stop(now+i*.55+1.8);
    });
    melodyTimer=setTimeout(playMelody,notes.length*550);
  }
  $('#sound').addEventListener('click',async () => {
    try {
      if(!audio){audio=new (window.AudioContext || window.webkitAudioContext)();master=audio.createGain();master.connect(audio.destination);master.gain.value=0;}
      await audio.resume(); musicOn=!musicOn;
      master.gain.setTargetAtTime(musicOn?.22:0,audio.currentTime,.15);
      clearTimeout(melodyTimer);if(musicOn)playMelody();
      $('#sound').setAttribute('aria-pressed',String(musicOn));
      $('#sound').setAttribute('aria-label',musicOn?'ปิดเสียงดนตรี':'เปิดเสียงดนตรี');
      $('#sound span').textContent=musicOn?'ปิดเสียง':'เปิดเสียง';
    } catch { $('#sound span').textContent='เสียงไม่พร้อม'; }
  });
  document.addEventListener('visibilitychange',()=>{if(audio){if(document.hidden)audio.suspend();else if(musicOn)audio.resume().catch(()=>{});}});
  const canvas=$('#particles'),ctx=canvas.getContext('2d');
  let dots=[],raf=0,w=innerWidth,h=innerHeight,last=0;
  function resize(){w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx?.setTransform(dpr,0,0,dpr,0,0);}
  resize();addEventListener('resize',resize);
  function burst(count=65){
    if(reduceMotion||!ctx)return;
    for(let i=0;i<count;i++)dots.push({x:w/2,y:h*.55,vx:(Math.random()-.5)*9,vy:-Math.random()*10-2,life:150+Math.random()*55,size:9+Math.random()*16,angle:Math.random()*6,color:['#cf7296','#efb3cb','#bc456c','#e9baa0'][i%4]});
    dots=dots.slice(-220);if(!raf){last=performance.now();raf=requestAnimationFrame(frame);}
  }
  function frame(time){const dt=Math.min((time-last)/16.67,2);last=time;ctx.clearRect(0,0,w,h);dots=dots.filter(p=>p.life>0&&p.y<h+50);for(const p of dots){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.045*dt;p.life-=dt;p.angle+=.025*dt;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.globalAlpha=Math.min(1,p.life/35);ctx.fillStyle=p.color;ctx.font=`${p.size}px Georgia`;ctx.fillText('♥',0,0);ctx.restore();}raf=dots.length?requestAnimationFrame(frame):0;}
  $('#enter').addEventListener('click',()=>{$('#intro').classList.add('gone');$('#intro').inert=true;burst(85);$('#reveal').focus({preventScroll:true});});
  let returnFocus;
  function openDialog(dialog){returnFocus=document.activeElement;dialog.showModal();burst();}
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
    dialog.addEventListener('close',()=>{returnFocus?.focus({preventScroll:true});});
  });
  function safePhoto(value){
    if(typeof value!=='string'||!value.trim())return '';
    try{const url=new URL(value,location.href);return ['https:','http:','file:'].includes(url.protocol)?url.href:'';}catch{return '';}
  }
  const photo=safePhoto(config.photoUrl);
  if(photo){
    $('#memory-caption').textContent=config.photoCaption||'รอยยิ้มของเธอ ♡';
    for(const id of ['#gift-image','#memory-image']){
      const img=$(id);img.alt=config.photoCaption||'ภาพความทรงจำของเรา';
      img.addEventListener('error',()=>{img.src='assets/garden.png';img.alt='สวนกระต่ายสีชมพู';$('#photo-status').textContent='ตอนนี้รูปยังเปิดไม่ได้ เลยส่งสวนกระต่ายมาให้กอดแทนนะ ♡';},{once:true});
      img.src=photo;
    }
  }else{$('#gift-title').textContent=config.noPhotoTitle||'สวนเล็ก ๆ นี้ ตั้งใจทำให้เธอ';}
  $('#reveal').addEventListener('click',()=>openDialog($('#gift-dialog')));
  $('#show-photo').addEventListener('click',()=>openDialog($('#gift-dialog')));
  $('#read-letter').addEventListener('click',()=>{$('#gift-dialog').close();$('#letter').scrollIntoView({behavior:reduceMotion?'instant':'smooth'});});
  $('#yes').addEventListener('click',()=>{openDialog($('#yes-dialog'));burst(140);});
  $('#back-garden').addEventListener('click',()=>$('#yes-dialog').close());
  $('#later').addEventListener('click',()=>{$('#answer-feedback').textContent=config.notReadyMessage||'ได้เลยนะ ไม่ต้องรีบตอบ ดูแลหัวใจตัวเองก่อน เราเคารพการตัดสินใจของเธอเสมอ ♡';});
  if('IntersectionObserver' in window&&!reduceMotion){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.section').forEach(el=>{el.classList.add('reveal-section');observer.observe(el);});}
})();
