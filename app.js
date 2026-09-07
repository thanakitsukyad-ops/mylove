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
  const configuredPhotos=Array.isArray(config.photos)?config.photos:[];
  let photos=configuredPhotos.map(p=>typeof p==='string'?{url:p}:p).filter(p=>p&&safePhoto(p.url)).map(p=>({url:safePhoto(p.url),caption:p.caption||'ความทรงจำเล็ก ๆ ของเรา ♡'}));
  if(!photos.length&&safePhoto(config.photoUrl))photos=[{url:safePhoto(config.photoUrl),caption:config.photoCaption||'รอยยิ้มของเธอ ♡'}];
  if(!photos.length){photos=[{url:'assets/garden.png',caption:'สวนเล็ก ๆ ที่ตั้งใจทำให้เธอ ♡'}];$('#gift-title').textContent=config.noPhotoTitle||'สวนเล็ก ๆ นี้ ตั้งใจทำให้เธอ';}
  const gift=$('#gift-dialog');gift.classList.add('album-dialog');
  const giftArea=$('.gift-photo');giftArea.replaceChildren();
  const grid=document.createElement('div');grid.className='album-grid';grid.dataset.count=String(photos.length);grid.setAttribute('aria-label','อัลบั้มความทรงจำ');
  const viewer=document.createElement('div');viewer.className='album-viewer';viewer.hidden=true;
  const fullImage=document.createElement('img');fullImage.className='album-full-image';
  const status=document.createElement('p');status.id='photo-status';status.setAttribute('role','status');
  const caption=document.createElement('p');caption.className='album-caption';caption.setAttribute('aria-live','polite');
  const controls=document.createElement('div');controls.className='album-controls';
  function makeButton(label,aria,action){const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent=label;b.setAttribute('aria-label',aria);b.addEventListener('click',action);return b;}
  let current=0;
  const back=makeButton('↗ ดูทั้งอัลบั้ม','กลับไปดูทั้งอัลบั้ม',()=>{viewer.hidden=true;grid.hidden=false;grid.children[current]?.focus();});
  const previous=makeButton('←','ภาพก่อนหน้า',()=>showPhoto(current-1));
  const next=makeButton('→','ภาพถัดไป',()=>showPhoto(current+1));
  const counter=document.createElement('span');counter.className='album-counter';
  controls.append(previous,counter,next);viewer.append(back,fullImage,caption,status,controls);giftArea.append(grid,viewer);
  function loadPhoto(img,photo,onError){
    img.onerror=()=>{img.onerror=null;img.src='assets/garden.png';img.alt='ภาพสำรองสวนกระต่าย';onError?.();};
    img.alt=photo.caption;img.src=photo.url;
  }
  function showPhoto(index){current=(index+photos.length)%photos.length;status.textContent='';grid.hidden=true;viewer.hidden=false;loadPhoto(fullImage,photos[current],()=>{status.textContent='รูปนี้เปิดไม่ได้ในตอนนี้ เลยส่งสวนกระต่ายมาแทนนะ ♡';});caption.textContent=photos[current].caption;counter.textContent=`${current+1} / ${photos.length}`;previous.hidden=next.hidden=photos.length<2;if(!reduceMotion&&fullImage.animate)fullImage.animate([{opacity:0,transform:'translateY(12px) scale(.98)'},{opacity:1,transform:'none'}],{duration:400,easing:'ease-out'});}
  photos.forEach((photo,index)=>{
    const tile=document.createElement('button');tile.type='button';tile.className='album-tile';tile.style.setProperty('--order',index);tile.setAttribute('aria-label',`ดูรูปที่ ${index+1}: ${photo.caption}`);
    const img=document.createElement('img');img.loading='lazy';loadPhoto(img,photo,()=>tile.classList.add('photo-unavailable'));
    const label=document.createElement('span');label.textContent=photo.caption;
    const number=document.createElement('small');number.textContent=String(index+1).padStart(2,'0')+' / OUR MOMENTS';
    tile.append(img,number,label);tile.addEventListener('click',()=>{showPhoto(index);back.focus();});grid.append(tile);
  });
  gift.addEventListener('keydown',event=>{if(viewer.hidden)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();showPhoto(current+(event.key==='ArrowLeft'?-1:1));}});
  let touchStart=null;
  fullImage.addEventListener('touchstart',event=>{touchStart=event.touches.length===1?event.touches[0].clientX:null;},{passive:true});
  fullImage.addEventListener('touchend',event=>{if(touchStart===null)return;const delta=event.changedTouches[0].clientX-touchStart;touchStart=null;if(Math.abs(delta)>55)showPhoto(current+(delta>0?-1:1));},{passive:true});
  gift.addEventListener('close',()=>{viewer.hidden=true;grid.hidden=false;});
  const memoryFrame=$('.memory-frame');memoryFrame.classList.add('album-cover');
  const coverButton=document.createElement('button');coverButton.type='button';coverButton.className='album-cover-button';coverButton.setAttribute('aria-label',`เปิดอัลบั้ม ${photos.length} รูป`);
  const coverGrid=document.createElement('span');coverGrid.className='album-cover-grid';coverGrid.dataset.count=String(Math.min(photos.length,5));
  photos.slice(0,5).forEach(photo=>{const img=document.createElement('img');img.loading='lazy';loadPhoto(img,photo);coverGrid.append(img);});
  const coverCaption=document.createElement('span');coverCaption.className='album-cover-caption';coverCaption.textContent=`${config.albumTitle||'ความทรงจำของเรา'} · ${photos.length} รูป ↗`;
  coverButton.append(coverGrid,coverCaption);memoryFrame.replaceChildren(coverButton);coverButton.addEventListener('click',()=>openDialog(gift));
  $('#reveal').addEventListener('click',()=>openDialog($('#gift-dialog')));
  $('#show-photo').addEventListener('click',()=>openDialog($('#gift-dialog')));
  $('#read-letter').addEventListener('click',()=>{$('#gift-dialog').close();$('#letter').scrollIntoView({behavior:reduceMotion?'instant':'smooth'});});
  const instagramSection=document.createElement('section');instagramSection.className='instagram-invitation';
  const instagramMessage=document.createElement('p');instagramMessage.textContent=config.instagramMessage||'งั้นเธอใช้ไอจีแอคหลักมาฟอลเราได้ไหม\nถ้าเธอสะดวกนะ ♡';
  instagramSection.append(instagramMessage);
  try{
    const instagramUrl=new URL(config.instagramUrl);
    if(instagramUrl.protocol==='https:'&&['instagram.com','www.instagram.com'].includes(instagramUrl.hostname)&&instagramUrl.pathname!=='/'&&!instagramUrl.username&&!instagramUrl.password){
      const instagramLink=document.createElement('a');instagramLink.className='primary instagram-link';instagramLink.href=instagramUrl.href;instagramLink.target='_blank';instagramLink.rel='noopener noreferrer';instagramLink.textContent=config.instagramButtonText||'มาฟอลไอจีเรานะ ↗';instagramSection.append(instagramLink);
    }
  }catch{ /* Show the invitation without a link until an Instagram URL is configured. */ }
  $('#back-garden').before(instagramSection);
  $('#yes').addEventListener('click',()=>{openDialog($('#yes-dialog'));burst(140);});
  $('#back-garden').addEventListener('click',()=>$('#yes-dialog').close());
  $('#later').addEventListener('click',()=>{$('#answer-feedback').textContent=config.notReadyMessage||'ได้เลยนะ ไม่ต้องรีบตอบ ดูแลหัวใจตัวเองก่อน เราเคารพการตัดสินใจของเธอเสมอ ♡';});
  if('IntersectionObserver' in window&&!reduceMotion){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.section').forEach(el=>{el.classList.add('reveal-section');observer.observe(el);});}
})();
