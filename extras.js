(() => {
  'use strict';
  const c=window.LOVE_CONFIG||{}, reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
  const button=(text,cls='primary')=>{const b=el('button',cls,text);b.type='button';return b;};
  const paper=document.querySelector('.letter-paper');
  const envelope=el('div','envelope-panel');
  const seal=el('span','envelope-icon','💌');seal.setAttribute('aria-hidden','true');
  envelope.append(seal,el('p','handwritten','Sealed with a little love'),el('p','',c.envelopeMessage||'จดหมายฉบับนี้ รอให้เธอเปิดอยู่นะ'));
  const unseal=button(c.envelopeButton||'แกะซองจดหมาย ♡');unseal.setAttribute('aria-expanded','false');paper.id='personal-letter';unseal.setAttribute('aria-controls',paper.id);
  envelope.append(unseal);paper.before(envelope);paper.hidden=true;
  unseal.addEventListener('click',()=>{
    unseal.disabled=true;unseal.setAttribute('aria-expanded','true');envelope.classList.add('unsealed');
    const reveal=()=>{envelope.hidden=true;paper.hidden=false;if(!reduced){paper.animate([{opacity:0,transform:'translateY(35px) rotateX(-12deg)'},{opacity:1,transform:'none'}],{duration:850,easing:'ease-out'});[...paper.children].forEach((line,i)=>line.animate([{opacity:0,transform:'translateY(9px)'},{opacity:1,transform:'none'}],{duration:550,delay:i*130,fill:'backwards'}));}paper.setAttribute('tabindex','-1');paper.focus({preventScroll:true});paper.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});};
    if(reduced)reveal();else setTimeout(reveal,480);
  });
  const section=el('section','section open-when');section.id='open-when';
  section.append(el('div','section-label','A LITTLE COMFORT, WHENEVER YOU NEED'),el('p','handwritten','Open when…'),el('h2','',c.openWhenTitle||'เก็บไว้เปิด ในวันที่เธอต้องการ'),el('p','section-sub','เลือกซองที่ตรงกับใจเธอวันนี้ได้เลย ♡'));
  const letters=Array.isArray(c.openWhenLetters)?c.openWhenLetters:[];
  const grid=el('div','comfort-grid');
  const comfort=el('dialog','comfort-dialog');const close=button('×','close');close.setAttribute('aria-label','ปิดจดหมาย');const heading=el('h2');heading.id='comfort-title';comfort.setAttribute('aria-labelledby',heading.id);const body=el('p','comfort-body');const signature=el('p','handwritten',c.sender||'คนที่อยากดูแลเธอ');comfort.append(close,heading,body,signature);document.body.append(comfort);
  let comfortTrigger;close.addEventListener('click',()=>comfort.close());comfort.addEventListener('close',()=>comfortTrigger?.focus({preventScroll:true}));
  letters.forEach((letter,index)=>{const b=button('','comfort-card');b.append(el('span','comfort-number',`LETTER ${String(index+1).padStart(2,'0')}`),el('span','comfort-icon',letter.icon||'♡'),el('strong','',letter.title),el('span','comfort-open','เปิดอ่าน ↗'));b.addEventListener('click',()=>{comfortTrigger=b;heading.textContent=letter.title;body.textContent=letter.message;comfort.showModal();});grid.append(b);});section.append(grid);if(letters.length)document.querySelector('#question').before(section);
  const voiceSection=el('section','section voice-section');voiceSection.id='voice-note';
  voiceSection.append(el('div','section-label','A MESSAGE IN MY OWN VOICE'),el('p','handwritten','Just between you and me.'),el('h2','',c.voiceTitle||'มีบางอย่าง… อยากบอกด้วยเสียงของเรา'),el('p','section-sub',c.voiceDescription||'กดฟังตอนที่เธอพร้อมนะ ♡'));
  const audio=document.createElement('audio');audio.controls=true;audio.preload='none';audio.setAttribute('aria-label','ข้อความเสียงจากคนทำเว็บ');
  const voiceStatus=el('p','voice-status');voiceStatus.setAttribute('role','status');
  let voiceUrl='';try{if(c.voiceUrl?.trim()){const u=new URL(c.voiceUrl,location.href);if(['https:','http:','file:'].includes(u.protocol))voiceUrl=u.href;}}catch{}
  if(voiceUrl){audio.src=voiceUrl;voiceSection.append(audio);voiceStatus.textContent='กดเล่นเพื่อฟังเสียงของเรา';}else{voiceStatus.textContent=c.voiceEmptyMessage||'ขอติดข้อความเสียงไว้ก่อนนะ ระหว่างนี้รับจดหมายจากเราไปก่อน ♡';voiceSection.classList.add('voice-pending');}
  if(c.voiceTranscript){const details=el('details','voice-transcript');details.append(el('summary','','อ่านข้อความเสียง'),el('p','',c.voiceTranscript));voiceSection.append(details);}
  voiceSection.append(voiceStatus);document.querySelector('#question').before(voiceSection);
  function voiceEvent(playing){document.dispatchEvent(new CustomEvent('love-voice',{detail:{playing}}));}
  audio.addEventListener('play',()=>{voiceEvent(true);voiceStatus.textContent='กำลังฟังข้อความจากเรา ♡';});
  audio.addEventListener('pause',()=>voiceEvent(false));audio.addEventListener('ended',()=>{voiceEvent(false);voiceStatus.textContent='ฟังอีกครั้งได้เสมอนะ ♡';});audio.addEventListener('error',()=>{voiceEvent(false);voiceStatus.textContent='ตอนนี้เสียงยังเปิดไม่ได้ ลองอีกครั้งภายหลังนะ';});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.pause();});
  const finale=el('dialog','cinema-dialog');finale.setAttribute('aria-labelledby','cinema-title');
  const petals=el('div','cinema-petals');petals.setAttribute('aria-hidden','true');for(let i=0;i<18;i++){const p=el('span','',i%3?'✿':'♡');p.style.setProperty('--x',`${(i*37)%100}%`);p.style.setProperty('--delay',`${-(i%7)}s`);p.style.setProperty('--speed',`${6+i%4}s`);petals.append(p);}
  const cinemaContent=el('div','cinema-content');const kicker=el('p','section-label','THE BEGINNING OF US');const names=el('h2','cinema-names');names.id='cinema-title';names.append(el('span','',c.sender||'เรา'),el('i','','&'),el('span','',c.recipient||'เธอ'));const line=el('p','cinema-line',c.finaleMessage||'เรื่องราวบทใหม่ของเรา\nเริ่มต้นตรงนี้นะ ♡');const next=button('ไปต่อด้วยกัน ♡');const skip=button('ข้ามฉากนี้ ↗','cinema-skip');cinemaContent.append(kicker,names,line,next);finale.append(petals,skip,cinemaContent);document.body.append(finale);
  let completion=null,finaleTrigger=null;
  function finish(){if(!finale.open)return;finale.close();}
  next.addEventListener('click',finish);skip.addEventListener('click',finish);
  finale.addEventListener('close',()=>{finaleTrigger?.focus({preventScroll:true});const action=completion;completion=null;action?.();});
  window.LoveExtras={startFinale(action){if(finale.open)return;audio.pause();completion=action;finaleTrigger=document.activeElement;finale.showModal();finale.scrollTop=0;}};
})();
