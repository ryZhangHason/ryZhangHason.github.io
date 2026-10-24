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
