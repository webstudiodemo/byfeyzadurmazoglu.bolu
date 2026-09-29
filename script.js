(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  const header = document.getElementById('header');
  const menu = document.getElementById('mobile-menu');
  const menuToggle = document.querySelector('.menu-toggle');
  const booking = document.getElementById('booking');
  const dialog = booking?.querySelector('.booking__dialog');
  const closeBooking = booking?.querySelector('.booking__close');
  const bookingForm = document.getElementById('booking-form');
  let lastFocused = null;

  const intro = document.getElementById('intro');
  if (intro && !reduced) {
    const tl = gsap.timeline({defaults:{ease:'power3.inOut'},onComplete:()=>{intro.style.pointerEvents='none';intro.setAttribute('aria-hidden','true')}});
    tl.to('.intro__line--top,.intro__line--bottom',{scaleX:1,duration:.8})
      .from('.intro__eyebrow',{y:12,opacity:0,duration:.55},'-.35')
      .from('.intro__wordmark',{y:35,opacity:0,filter:'blur(8px)',duration:1},'-.3')
      .from('.intro__caption',{y:10,opacity:0,duration:.45},'-.55')
      .to('.intro__center',{scale:1.04,opacity:0,duration:.65,delay:.35})
      .to('.intro',{clipPath:'inset(0 0 100% 0)',duration:1.05},'-.2');
  } else if (intro) intro.remove();

  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  const setMenu = open => {
    menu?.classList.toggle('is-open',open);
    menu?.setAttribute('aria-hidden',String(!open));
    menuToggle?.setAttribute('aria-expanded',String(open));
    body.classList.toggle('is-locked',open);
  };
  menuToggle?.addEventListener('click',()=>setMenu(!menu.classList.contains('is-open')));
  menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));

  document.querySelectorAll('a[href^="#"]').forEach(link=>{
    link.addEventListener('click',e=>{
      const target=document.querySelector(link.getAttribute('href')); if(!target)return;
      e.preventDefault(); setMenu(false); target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
    });
  });

  if (window.gsap && window.ScrollTrigger && !reduced) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.reveal').forEach(el=>gsap.to(el,{opacity:1,y:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 82%',once:true}}));
    gsap.to('.hero__media img',{yPercent:12,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.hero__content',{y:-55,opacity:.72,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});

    const pinFrame=document.querySelector('.pin-frame');
    if(pinFrame){
      gsap.to(pinFrame,{width:'100vw',height:'100vh',ease:'none',scrollTrigger:{trigger:'.pin-section',start:'top top',end:'bottom bottom',scrub:true,pin:'.pin-stage',pinSpacing:false}});
      gsap.to('.pin-caption',{opacity:0,y:30,ease:'none',scrollTrigger:{trigger:'.pin-section',start:'30% top',end:'65% top',scrub:true}});
      gsap.to('.pin-overlay',{opacity:.2,ease:'none',scrollTrigger:{trigger:'.pin-section',start:'45% top',end:'80% top',scrub:true}});
    }

    const viewport=document.querySelector('.services__viewport'), track=document.querySelector('.services__track');
    if(viewport&&track&&window.innerWidth>700){
      const distance=()=>Math.max(0,track.scrollWidth-viewport.clientWidth);
      gsap.to(track,{x:()=>-distance(),ease:'none',scrollTrigger:{trigger:'.services',start:'top top',end:()=>'+='+(distance()+window.innerHeight*.9),scrub:1,pin:true,invalidateOnRefresh:true}});
    }
  }

  const openBooking=()=>{
    lastFocused=document.activeElement;
    booking.classList.add('is-open'); booking.setAttribute('aria-hidden','false'); body.classList.add('is-locked');
    buildDates();
    if(window.innerWidth<700)setTimeout(()=>dialog?.scrollTo({top:0}),0);
    closeBooking?.focus();
  };
  const hideBooking=()=>{
    booking.classList.remove('is-open'); booking.setAttribute('aria-hidden','true'); body.classList.remove('is-locked'); lastFocused?.focus?.();
  };
  document.querySelectorAll('.js-open-booking').forEach(btn=>btn.addEventListener('click',openBooking));
  closeBooking?.addEventListener('click',hideBooking);
  booking?.querySelector('.booking__backdrop')?.addEventListener('click',hideBooking);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&booking.classList.contains('is-open'))hideBooking()});

  const dateGrid=document.getElementById('date-grid'), timeGrid=document.getElementById('time-grid'), dateInput=document.getElementById('date'), timeInput=document.getElementById('time'), serviceInput=document.getElementById('service'), summary=document.getElementById('booking-summary');
  const timeSlots=['09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00'];
  const dayNames=['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
  let chosenDate=null;

  const buildDates=()=>{
    if(!dateGrid||dateGrid.children.length)return;
    const now=new Date();
    for(let i=0;i<21;i++){
      const d=new Date(now); d.setHours(0,0,0,0); d.setDate(now.getDate()+i);
      const btn=document.createElement('button'); btn.type='button'; btn.className='date-button';
      const iso=d.toISOString().slice(0,10), label=d.toLocaleDateString('tr-TR',{day:'numeric',month:'short'});
      btn.innerHTML='<small>'+dayNames[d.getDay()]+'</small>'+label; btn.dataset.date=iso;
      btn.addEventListener('click',()=>{
        dateGrid.querySelectorAll('.date-button').forEach(x=>x.classList.remove('is-active'));
        btn.classList.add('is-active'); chosenDate=d; dateInput.value=iso; buildTimes(d); updateSummary();
      });
      dateGrid.appendChild(btn);
    }
    dateGrid.querySelector('.date-button')?.click();
  };

  const buildTimes=()=>{
    timeGrid.innerHTML='';
    timeSlots.forEach(slot=>{
      const btn=document.createElement('button'); btn.type='button'; btn.className='time-button'; btn.textContent=slot;
      btn.addEventListener('click',()=>{
        timeGrid.querySelectorAll('.time-button').forEach(x=>x.classList.remove('is-active'));
        btn.classList.add('is-active'); timeInput.value=slot; updateSummary();
      });
      timeGrid.appendChild(btn);
    });
  };

  const updateSummary=()=>{
    const service=serviceInput.value||'Hizmet seçilmedi';
    const date=chosenDate?chosenDate.toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'}):'Tarih seçilmedi';
    const time=timeInput.value||'Saat seçilmedi';
    summary.querySelector('strong').textContent=service+' · '+date+' · '+time;
  };
  serviceInput?.addEventListener('change',updateSummary);

  bookingForm?.addEventListener('submit',e=>{
    e.preventDefault();
    if(!serviceInput.value||!dateInput.value||!timeInput.value)return;
    const name=document.getElementById('name').value.trim(), phone=document.getElementById('phone').value.trim(), note=document.getElementById('note').value.trim()||'—';
    const dateLabel=chosenDate.toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    const message='Merhaba, web siteniz üzerinden randevu oluşturmak istiyorum.%0A%0AAd Soyad: '+encodeURIComponent(name)+'%0ATelefon: '+encodeURIComponent(phone)+'%0AHizmet: '+encodeURIComponent(serviceInput.value)+'%0ATarih: '+encodeURIComponent(dateLabel)+'%0ASaat: '+encodeURIComponent(timeInput.value)+'%0ANot: '+encodeURIComponent(note);
    window.open('https://wa.me/905347099081?text='+message,'_blank','noopener');
  });

  if(window.matchMedia('(pointer:fine)').matches&&!reduced){
    const dot=document.createElement('div'); dot.setAttribute('aria-hidden','true');
    Object.assign(dot.style,{position:'fixed',left:'0',top:'0',width:'7px',height:'7px',borderRadius:'50%',background:'#f1eee7',mixBlendMode:'difference',pointerEvents:'none',zIndex:'300',transform:'translate(-50%,-50%)',opacity:'0',transition:'opacity .2s'});
    document.body.appendChild(dot);
    window.addEventListener('pointermove',e=>{dot.style.opacity='1';dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px'},{passive:true});
  }
})();