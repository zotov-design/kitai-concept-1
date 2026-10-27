import './components.js';
if(new URLSearchParams(location.search).has('qa')) import('./qa-metrics.js');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const all = (selector, root=document) => [...root.querySelectorAll(selector)];

// Reveal each section once. No scroll interception or persistent animation loop.
const reveals=all('.reveal');
if ('IntersectionObserver' in window && !motion.matches) {
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-visible');entry.target.classList.remove('is-pending');observer.unobserve(entry.target);}
  }),{threshold:0,rootMargin:'0px 0px -35px 0px'});
  reveals.forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('is-pending');observer.observe(el);}});
  motion.addEventListener('change',()=>{if(motion.matches){reveals.forEach(el=>el.classList.remove('is-pending'));observer.disconnect();}});
}

const menu=document.querySelector('#mobile-menu');
const menuButton=document.querySelector('.menu-toggle');
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Открыть меню');}
menuButton.addEventListener('click',()=>{const opened=menuButton.getAttribute('aria-expanded')==='true';menu.hidden=opened;menuButton.setAttribute('aria-expanded',String(!opened));menuButton.setAttribute('aria-label',opened?'Открыть меню':'Закрыть меню');});
menu.addEventListener('click',event=>{if(event.target.closest('a,button'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){closeMenu();menuButton.focus();}});
document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();});
matchMedia('(min-width:1200px)').addEventListener('change',closeMenu);

const cities={beijing:{image:'assets/beijing.jpg',alt:'Храм Неба в Пекине'},shanghai:{image:'assets/shanghai.jpg',alt:'Набережная Вайтань и панорама Шанхая'},zhangjiajie:{image:'assets/zhangjiajie.jpg',alt:'Горы национального парка Чжанцзяцзе'},chengdu:{image:'assets/chengdu.jpg',alt:'Большая панда в Чэнду'}};
const destinationLinks=all('[data-city]');
const desktopHover=matchMedia('(min-width:640px) and (hover:hover) and (pointer:fine)');
const preview=document.querySelector('#city-preview');
const photo=document.querySelector('#destination-photo');
const nextPhoto=document.querySelector('#destination-next');
let selection=0, fadeTimer;
async function previewCity(link){
  if(!desktopHover.matches)return;
  const token=++selection;
  preview.setAttribute('aria-labelledby',link.id);
  const city=cities[link.dataset.city];
  const preload=new Image();preload.src=city.image;
  try{await preload.decode();}catch{return;}
  if(token!==selection)return;
  clearTimeout(fadeTimer);
  nextPhoto.classList.remove('is-visible');nextPhoto.hidden=true;
  if(motion.matches){photo.src=city.image;photo.alt=city.alt;return;}
  nextPhoto.src=city.image;nextPhoto.hidden=false;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(token===selection)nextPhoto.classList.add('is-visible');}));
  fadeTimer=setTimeout(()=>{if(token!==selection)return;photo.src=city.image;photo.alt=city.alt;nextPhoto.hidden=true;nextPhoto.classList.remove('is-visible');},420);
}
destinationLinks.forEach(link=>{
  link.addEventListener('mouseenter',()=>previewCity(link));
  link.addEventListener('focus',()=>previewCity(link));
});

const rail=document.querySelector('#tour-rail');
const cards=all('tour-card',rail);
const dots=all('[data-slide]');
const prev=document.querySelector('#tour-prev'),next=document.querySelector('#tour-next');
let currentSlide=0,scrollQueued=false;
function updateCarousel(){
  const edge=rail.getBoundingClientRect().left+parseFloat(getComputedStyle(rail).paddingLeft);
  const distances=cards.map(card=>Math.abs(card.getBoundingClientRect().left-edge));
  currentSlide=distances.indexOf(Math.min(...distances));
  prev.disabled=rail.scrollLeft<=2;next.disabled=rail.scrollLeft>=rail.scrollWidth-rail.clientWidth-2;
  dots.forEach((dot,index)=>{dot.classList.toggle('is-active',index===currentSlide);if(index===currentSlide)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');});
  document.querySelector('#carousel-status').textContent=`Тур ${currentSlide+1} из ${cards.length}`;
}
function goToSlide(index){
  const target=cards[Math.max(0,Math.min(index,cards.length-1))];
  const left=rail.scrollLeft+target.getBoundingClientRect().left-rail.getBoundingClientRect().left-parseFloat(getComputedStyle(rail).paddingLeft);
  rail.scrollTo({left,behavior:motion.matches?'instant':'smooth'});
}
prev.addEventListener('click',()=>goToSlide(currentSlide-1));next.addEventListener('click',()=>goToSlide(currentSlide+1));
dots.forEach(dot=>dot.addEventListener('click',()=>goToSlide(Number(dot.dataset.slide))));
rail.addEventListener('scroll',()=>{if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(()=>{updateCarousel();scrollQueued=false;});},{passive:true});
rail.addEventListener('keydown',event=>{if(event.target!==rail)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();goToSlide(currentSlide+(event.key==='ArrowRight'?1:-1));}});
new ResizeObserver(updateCarousel).observe(rail);updateCarousel();

// Mouse dragging supplements native touch/trackpad scrolling. A real drag must
// never turn into a card click, and releasing the pointer must not snap/jump.
all('img',rail).forEach(img=>{img.draggable=false;});
let mouseDrag=null,suppressDragClick=false;
rail.addEventListener('pointerdown',event=>{
  if(event.pointerType!=='mouse'||event.button!==0)return;
  suppressDragClick=false;
  rail.scrollTo({left:rail.scrollLeft,behavior:'instant'});
  mouseDrag={id:event.pointerId,x:event.clientX,y:event.clientY,left:rail.scrollLeft,active:false};
});
window.addEventListener('pointermove',event=>{
  if(!mouseDrag||event.pointerId!==mouseDrag.id)return;
  if(!(event.buttons&1)){finishMouseDrag();return;}
  const dx=event.clientX-mouseDrag.x,dy=event.clientY-mouseDrag.y;
  if(!mouseDrag.active){
    if(Math.abs(dx)<6||Math.abs(dx)<Math.abs(dy))return;
    mouseDrag.active=true;
    rail.classList.add('is-dragging');
    rail.setPointerCapture(event.pointerId);
  }
  event.preventDefault();
  rail.scrollLeft=mouseDrag.left-dx;
},{passive:false});
function finishMouseDrag(){
  if(!mouseDrag)return;
  const ended=mouseDrag;
  mouseDrag=null;
  suppressDragClick=ended.active;
  rail.classList.remove('is-dragging');
  if(rail.hasPointerCapture(ended.id))rail.releasePointerCapture(ended.id);
}
window.addEventListener('pointerup',finishMouseDrag);
window.addEventListener('pointercancel',finishMouseDrag);
window.addEventListener('blur',finishMouseDrag);
rail.addEventListener('lostpointercapture',finishMouseDrag);
rail.addEventListener('click',event=>{
  if(!suppressDragClick)return;
  suppressDragClick=false;
  event.preventDefault();
  event.stopImmediatePropagation();
},true);

const dialog=document.querySelector('#detail-dialog'),title=document.querySelector('#dialog-title'),content=document.querySelector('#dialog-content');
let returnFocus=null;
function openDialog(heading,paragraphs){
  returnFocus=document.activeElement;title.textContent=heading;content.replaceChildren();
  paragraphs.forEach(({text,className})=>{const p=document.createElement('p');p.textContent=text;if(className)p.className=className;content.append(p);});
  dialog.showModal();
}
function closeDialog(){dialog.close();}
all('[data-info]').forEach(button=>button.addEventListener('click',()=>{
  const label=button.dataset.info;
  const contact=['Контакты','WhatsApp','Telegram'].includes(label);
  openDialog(label,[{text:contact?'В V1 указан демонстрационный номер из макета. Рабочие контакты и ссылки на мессенджеры ещё не предоставлены.':'Этот раздел не входит в текущий макет V1. Сейчас доступны выбор направления и рекомендуемые туры.'}]);
}));
all('[data-tour]').forEach(button=>button.addEventListener('click',()=>{
  const card=button.closest('tour-card');
  const details=button.dataset.demo==='true'?'Дополнительный вариант для демонстрации концепта. Программу, длительность и стоимость нужно согласовать отдельно.':'Маршрут и стоимость перенесены из макета V1. Программу, даты выезда и бронирование нужно подключить после предоставления данных.';
  openDialog(card.querySelector('h3').textContent,[{text:card.querySelector('.tour-duration').textContent},{text:card.querySelector('.tour-price').textContent,className:'detail-price'},{text:details}]);
}));
document.querySelector('.dialog-close').addEventListener('click',closeDialog);document.querySelector('.dialog-done').addEventListener('click',closeDialog);
dialog.addEventListener('click',event=>{const rect=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))closeDialog();});
dialog.addEventListener('close',()=>{
  const target=returnFocus?.getClientRects().length?returnFocus:menuButton;
  target?.focus({preventScroll:true});
});
