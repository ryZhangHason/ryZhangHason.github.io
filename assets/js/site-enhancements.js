(() => {
  const heading=document.querySelector('#works'), content=document.querySelector('.main-text-content'), contact=document.querySelector('#contact');
  if(!heading||!content||!contact)return;
  const originals=[],groups=[]; let group=[],node=heading.nextElementSibling;
  while(node&&node!==contact){const next=node.nextElementSibling;if(node.tagName==='HR'){if(group.length)groups.push(group);group=[];originals.push(node);}else{group.push(node);originals.push(node);}node=next;}
  if(group.length)groups.push(group); if(!groups.length)return;
  const deck=document.createElement('section');deck.className='archive-deck';deck.setAttribute('aria-label','Selective works');
  deck.innerHTML='<div class="archive-deck__pin"><div class="archive-deck__masthead"><span><strong>Selective Works</strong></span><span>'+groups.length+' works</span></div><div class="archive-deck__toolbar"><span class="archive-deck__counter" aria-live="polite"></span><span class="archive-deck__scroll-hint">Scroll to read and see the next work</span></div><div class="archive-deck__stage" aria-label="Scroll the page to move through these works"></div><div class="archive-deck__footer"><span>WORKS / <b data-footer-count></b></span><div class="archive-deck__track" aria-hidden="true"><span></span></div><span class="archive-deck__scroll-hint">↑ Previous work · Next work ↓</span></div></div><div class="archive-deck__runway" aria-hidden="true"></div>';
  const pin=deck.querySelector('.archive-deck__pin'),stage=deck.querySelector('.archive-deck__stage'),runway=deck.querySelector('.archive-deck__runway');
  const cards=groups.map((nodes,index)=>{const card=document.createElement('article');card.className='archive-record';card.setAttribute('aria-label','Work '+(index+1)+' of '+groups.length);card.setAttribute('aria-hidden','true');card.inert=true;const content=document.createElement('div');content.className='archive-record__content';nodes.forEach(item=>content.appendChild(item));card.appendChild(content);const source=card.querySelector('ul li strong');const title=source?source.textContent.trim():'Untitled work';if(source)source.remove();const citation=card.querySelector('ul li');const year=(citation?.textContent||'').match(/20\d{2}/);const venue=citation?.querySelector('em')?.textContent?.trim()||'Research';const stamp=document.createElement('div');stamp.className='archive-record__stamp';stamp.innerHTML='<span><b>WORK '+String(index+1).padStart(2,'0')+'</b> · '+venue+'</span><span>'+(year?.[0]||'')+'</span>';const titleNode=document.createElement('h3');titleNode.textContent=title;content.insertBefore(titleNode,content.firstChild);content.insertBefore(stamp,content.firstChild);const turnZone=document.createElement('div');turnZone.className='archive-record__turn-zone';turnZone.setAttribute('aria-hidden','true');turnZone.innerHTML='<span>MORE WORKS BELOW</span><span>KEEP SCROLLING · NEXT WORK →</span>';content.appendChild(turnZone);stage.appendChild(card);return card;});
  heading.after(deck);let current=0,metrics=[],totalRunway=0,scheduled=false;
  const counter=deck.querySelector('.archive-deck__counter'),footerCount=deck.querySelector('[data-footer-count]'),progressBar=deck.querySelector('.archive-deck__track span');
  const activate=index=>{if(index===current)return;const direction=index>current?1:-1,old=cards[current],incoming=cards[index];old.classList.remove('is-current');old.classList.add(direction>0?'is-leaving-left':'is-leaving-right');old.setAttribute('aria-hidden','true');old.inert=true;incoming.classList.add(direction>0?'is-entering-right':'is-entering-left');incoming.style.visibility='visible';incoming.setAttribute('aria-hidden','false');incoming.inert=false;current=index;requestAnimationFrame(()=>{incoming.classList.add('is-current');incoming.classList.remove('is-entering-right','is-entering-left');});setTimeout(()=>{old.classList.remove('is-leaving-left','is-leaving-right');old.style.visibility='hidden';},500);};
  const render=()=>{scheduled=false;const start=deck.getBoundingClientRect().top+window.scrollY-(parseFloat(getComputedStyle(pin).top)||0);let offset=Math.max(0,Math.min(totalRunway,window.scrollY-start)),index=0;while(index<metrics.length-1&&offset>=metrics[index].step){offset-=metrics[index].step;index++;}activate(index);const metric=metrics[index];const content=cards[index].querySelector('.archive-record__content'),contentOffset=Math.max(0,offset-metric.entryHold);content.style.transform='translate3d(0,'+(-Math.min(contentOffset,metric.contentOverflow))+'px,0)';const fraction=metric.step?Math.min(1,offset/metric.step):0;const value=String(index+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');counter.textContent=value;footerCount.textContent=value;progressBar.style.width=((index+fraction)/cards.length*100)+'%';};
  const scheduleRender=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(render);};
  const measure=()=>{const stageHeight=stage.clientHeight,entryHold=Math.max(180,window.innerHeight*.18),turnHold=Math.max(200,window.innerHeight*.2);metrics=cards.map(card=>{const content=card.querySelector('.archive-record__content'),style=getComputedStyle(card),verticalPadding=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom),contentOverflow=Math.max(0,content.scrollHeight-(stageHeight-verticalPadding));return {contentOverflow,entryHold,step:entryHold+contentOverflow+turnHold};});totalRunway=metrics.reduce((sum,item)=>sum+item.step,0);runway.style.height=totalRunway+'px';scheduleRender();};
  let focusActive=false,focusMeasureTimer;
  const setArchiveFocus=active=>{const next=active&&window.innerWidth>1100;if(next===focusActive)return;focusActive=next;document.body.classList.toggle('archive-focus',next);if(next){requestAnimationFrame(measure);clearTimeout(focusMeasureTimer);focusMeasureTimer=setTimeout(measure,700);}};
  const updateArchiveFocus=()=>{const rect=deck.getBoundingClientRect(),pinTop=parseFloat(getComputedStyle(pin).top)||58,entryLine=Math.max(pinTop+24,window.innerHeight*.28);setArchiveFocus(rect.top<=entryLine&&rect.bottom>pinTop);};
  updateArchiveFocus();
  cards[0].classList.add('is-current');cards[0].setAttribute('aria-hidden','false');cards[0].inert=false;window.addEventListener('scroll',()=>{scheduleRender();updateArchiveFocus();},{passive:true});window.addEventListener('resize',()=>{updateArchiveFocus();measure();if(window.innerWidth>1100){clearTimeout(focusMeasureTimer);focusMeasureTimer=setTimeout(measure,700);}});cards.forEach(card=>card.querySelectorAll('img').forEach(img=>img.addEventListener('load',measure)));measure();if(document.fonts?.ready)document.fonts.ready.then(measure);
})();

(() => {
  const emailLink=document.querySelector('.author__urls a[href^="mailto:"]');
  if(!emailLink)return;
  const email=emailLink.getAttribute('href').slice(7);
  const toast=document.createElement('div');
  toast.className='email-copy-toast';
  toast.setAttribute('role','status');
  toast.setAttribute('aria-live','polite');
  toast.setAttribute('aria-atomic','true');
  toast.innerHTML='<span class="email-copy-toast__message"></span><button class="email-copy-toast__close" type="button" aria-label="Close notification">×</button>';
  document.body.appendChild(toast);
  const message=toast.querySelector('.email-copy-toast__message');
  let hideTimer;
  const hideToast=()=>{toast.classList.remove('is-visible');clearTimeout(hideTimer);};
  toast.querySelector('.email-copy-toast__close').addEventListener('click',hideToast);
  const fallbackCopy=()=>{
    const input=document.createElement('textarea');
    input.value=email;input.setAttribute('readonly','');input.tabIndex=-1;
    input.style.cssText='position:fixed;opacity:0;pointer-events:none;left:-9999px;top:0';
    document.body.appendChild(input);input.select();input.setSelectionRange(0,email.length);
    let copied=false;try{copied=document.execCommand('copy');}catch{}
    input.remove();return copied;
  };
  emailLink.addEventListener('click',async event=>{
    event.preventDefault();
    let copied=false;
    try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(email);copied=true;}}catch{}
    if(!copied)copied=fallbackCopy();
    message.textContent=copied?'Copied to clipboard: '+email:'Could not copy. Email address: '+email;
    toast.classList.add('is-visible');clearTimeout(hideTimer);hideTimer=setTimeout(hideToast,6000);
  });
})();
