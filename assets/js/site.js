/* OVC site script. Vanilla JS, no dependencies. Every component is initialised per instance. */
(function(){
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s,c){return (c||document).querySelector(s)}
  function $$(s,c){return [].slice.call((c||document).querySelectorAll(s))}
  var OVC = window.OVC = window.OVC || {};

  /* ---------- Header: sticky shadow, dropdowns, mobile menu ---------- */
  var hdr=$('#hdr');
  if(hdr) addEventListener('scroll',function(){hdr.classList.toggle('scrolled',scrollY>8)},{passive:true});
  var toggles=$$('.nav-link[aria-controls]');
  function closeAll(except){toggles.forEach(function(b){if(b!==except){b.setAttribute('aria-expanded','false');var d=document.getElementById(b.getAttribute('aria-controls'));if(d)d.classList.remove('open')}})}
  toggles.forEach(function(b){
    var d=document.getElementById(b.getAttribute('aria-controls'));
    b.addEventListener('click',function(e){e.stopPropagation();var o=b.getAttribute('aria-expanded')==='true';closeAll(b);b.setAttribute('aria-expanded',String(!o));d.classList.toggle('open',!o)});
    var li=b.parentNode;
    li.addEventListener('mouseenter',function(){if(innerWidth>1140){closeAll(b);b.setAttribute('aria-expanded','true');d.classList.add('open')}});
    li.addEventListener('mouseleave',function(){if(innerWidth>1140){b.setAttribute('aria-expanded','false');d.classList.remove('open')}});
  });
  document.addEventListener('click',function(e){if(!e.target.closest('.nav'))closeAll()});
  var burger=$('#burger'),nav=$('#nav');
  function setMenu(o){if(!nav)return;document.documentElement.style.setProperty('--menu-top',hdr.getBoundingClientRect().bottom+'px');nav.classList.toggle('open',o);burger.setAttribute('aria-expanded',String(o));burger.setAttribute('aria-label',o?'Close menu':'Open menu');document.body.style.overflow=o?'hidden':''}
  if(burger) burger.addEventListener('click',function(){setMenu(!nav.classList.contains('open'))});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeAll();setMenu(false)}});
  OVC.closeMenu=function(){closeAll();setMenu(false)};

  /* ---------- Route board (homepage hero) ---------- */
  var DEST={
    ca:{name:'Canada',code:'YYZ',city:'Toronto',intake:'Jan, May, Sep',dist:'≈ 11,300 km',test:'IELTS or PTE',link:'/country/canada/',label:'Study in Canada'},
    uk:{name:'United Kingdom',code:'LHR',city:'London',intake:'Sep, Jan',dist:'≈ 6,700 km',test:'IELTS or PTE',link:'/country/uk/',label:'Study in the UK'},
    us:{name:'USA',code:'JFK',city:'New York',intake:'Aug–Sep, Jan',dist:'≈ 11,750 km',test:'IELTS or PTE',link:'/country/usa/',label:'Study in the USA'},
    au:{name:'Australia',code:'MEL',city:'Melbourne',intake:'Feb, Jul',dist:'≈ 10,200 km',test:'IELTS or PTE',link:'/country/australia/',label:'Study in Australia'},
    nz:{name:'New Zealand',code:'AKL',city:'Auckland',intake:'Feb, Jul',dist:'≈ 12,500 km',test:'IELTS or PTE',link:'/country/new-zealand/',label:'Study in New Zealand'}
  };
  $$('[data-route-board]').forEach(function(board){
    var plane=$('.plane',board),pass=$('.pass',board),raf;
    function f(n){return $('[data-f="'+n+'"]',board)}
    function place(path,len,at){var p=path.getPointAtLength(Math.max(0,Math.min(len,at))),q=path.getPointAtLength(Math.max(0,Math.min(len,at-1)));var a=Math.atan2(p.y-q.y,p.x-q.x)*180/Math.PI+90;plane.setAttribute('transform','translate('+p.x+' '+p.y+') rotate('+a+') scale(1.2)')}
    function fly(c,animate){
      var path=$('.path[data-c="'+c+'"]',board),d=DEST[c];
      $$('.path,.dest',board).forEach(function(el){el.classList.toggle('on',el.getAttribute('data-c')===c)});
      $$('.chip',board).forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-c')===c))});
      f('code').textContent=d.code;f('city').textContent=d.city;f('intake').textContent=d.intake;f('dist').textContent=d.dist;f('test').textContent=d.test;f('name').textContent=d.name;
      var l=f('link');l.setAttribute('href',OVC.href?OVC.href(d.link):d.link);l.textContent=d.label;
      pass.classList.remove('swap');void pass.offsetWidth;pass.classList.add('swap');
      var len=path.getTotalLength();cancelAnimationFrame(raf);
      if(reduce||!animate){place(path,len,len);return}
      path.style.strokeDasharray=len;path.style.strokeDashoffset=len;
      var t0=null,dur=1300;
      function tick(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/dur),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;path.style.strokeDashoffset=len*(1-e);place(path,len,len*e);if(k<1)raf=requestAnimationFrame(tick);else{path.style.strokeDasharray='';path.style.strokeDashoffset=''}}
      raf=requestAnimationFrame(tick);
    }
    $$('.chip',board).forEach(function(b){b.addEventListener('click',function(){fly(b.getAttribute('data-c'),true)})});
    $$('.dest',board).forEach(function(g){g.style.cursor='pointer';g.addEventListener('click',function(){fly(g.getAttribute('data-c'),true)})});
    board._fly=fly;
    setTimeout(function(){fly('ca',true)},450);
  });

  /* ---------- Tabs (journey, exam switch). Arrow keys move between tabs. ---------- */
  $$('[data-tabs]').forEach(function(wrap){
    var tabs=$$('[role=tab]',wrap),fill=$('.fill',wrap);
    function sel(i,focus){
      tabs.forEach(function(t,j){var on=j===i;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;t.classList.toggle('done',j<i);var p=document.getElementById(t.getAttribute('aria-controls'));if(p)p.hidden=!on});
      if(fill){var a=$('.num',tabs[0]).getBoundingClientRect(),b=$('.num',tabs[i]).getBoundingClientRect();fill.style.height=Math.max(0,b.top-a.top)+'px'}
      if(focus)tabs[i].focus();
    }
    tabs.forEach(function(t,i){
      t.addEventListener('click',function(){sel(i)});
      t.addEventListener('keydown',function(e){
        if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();sel((i+1)%tabs.length,true)}
        if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();sel((i-1+tabs.length)%tabs.length,true)}
      });
    });
    wrap._refresh=function(){var i=tabs.findIndex(function(t){return t.getAttribute('aria-selected')==='true'});sel(i<0?0:i)};
  });
  addEventListener('resize',function(){$$('[data-tabs]').forEach(function(w){w._refresh&&w._refresh()})});
  OVC.refresh=function(){$$('[data-tabs]').forEach(function(w){w._refresh&&w._refresh()})};

  /* ---------- IELTS band calculator: average of 4, rounded to nearest 0.5 ---------- */
  $$('[data-calc]').forEach(function(c){
    var ins=$$('input[type=range]',c);
    function run(){
      var s=0;ins.forEach(function(r){var v=+r.value;s+=v;r.nextElementSibling.textContent=v.toFixed(1);r.style.setProperty('--p',(v/9*100)+'%')});
      var avg=s/4,band=Math.round(avg*2)/2,diff=band-avg;
      $('[data-out=band]',c).textContent=band.toFixed(1);
      $('[data-out=sub]',c).textContent='Average '+(+avg.toFixed(3))+(diff>0.001?', rounded up':diff<-0.001?', rounded down':'');
      $('[data-out=msg]',c).textContent=band>=7?'Strong for most courses':band>=6?'Meets many course minimums':'Below most course minimums';
    }
    ins.forEach(function(r){r.addEventListener('input',run)});run();
  });

  /* ---------- Test format bar ---------- */
  $$('[data-format]').forEach(function(w){
    var bs=$$('.format-bar button',w),det=$('.format-detail',w);
    function sel(i){bs.forEach(function(b,j){b.setAttribute('aria-pressed',String(i===j))});var b=bs[i];det.innerHTML='<span class="dur">'+b.getAttribute('data-dur')+'</span><h3>'+b.getAttribute('data-name')+'</h3><p>'+b.getAttribute('data-desc')+'</p>'}
    bs.forEach(function(b,i){b.addEventListener('click',function(){sel(i)})});sel(0);
  });

  /* ---------- Testimonial carousel ---------- */
  $$('[data-carousel]').forEach(function(w){
    var items;try{items=JSON.parse($('script[type="application/json"]',w).textContent)}catch(e){return}
    var i=0;
    function show(n){i=(n+items.length)%items.length;var v=items[i];
      $('[data-v=q]',w).innerHTML='<span class="ph">'+v.q+'</span>';$('[data-v=n]',w).innerHTML='<span class="ph">'+v.n+'</span>';$('[data-v=d]',w).innerHTML='<span class="ph">'+v.d+'</span>';$('[data-v=a]',w).textContent=v.a;
      $$('.dots span',w).forEach(function(s,j){s.classList.toggle('on',j===i)})}
    $('[data-v=prev]',w).addEventListener('click',function(){show(i-1)});$('[data-v=next]',w).addEventListener('click',function(){show(i+1)});
  });

  /* ---------- Document checklist with progress ---------- */
  $$('[data-checklist]').forEach(function(w){
    var boxes=$$('input[type=checkbox]',w),bar=$('.bar i',w),txt=$('[data-out=count]',w);
    function run(){var n=boxes.filter(function(b){return b.checked}).length;bar.style.width=(n/boxes.length*100)+'%';txt.textContent=n+' of '+boxes.length+' ready'}
    boxes.forEach(function(b){b.addEventListener('change',run)});run();
  });

  /* ---------- Country comparison: show or hide columns ---------- */
  $$('[data-compare]').forEach(function(w){
    var chips=$$('.chip',w);
    function run(){var on=chips.filter(function(c){return c.getAttribute('aria-pressed')==='true'}).map(function(c){return c.getAttribute('data-c')});
      $$('[data-col]',w).forEach(function(cell){cell.classList.toggle('hide',on.indexOf(cell.getAttribute('data-col'))<0)})}
    chips.forEach(function(c){c.addEventListener('click',function(){
      var pressed=c.getAttribute('aria-pressed')==='true';
      var count=chips.filter(function(x){return x.getAttribute('aria-pressed')==='true'}).length;
      if(pressed&&count===1)return; /* keep at least one column */
      c.setAttribute('aria-pressed',String(!pressed));run()})});
    run();
  });

  /* ---------- Gallery: filters + lightbox ---------- */
  $$('[data-gallery]').forEach(function(w){
    var items=$$('.gallery button',w),dlg=$('dialog',w),cur=0,visible=items;
    $$('.filters .chip',w).forEach(function(ch,_,all){ch.addEventListener('click',function(){
      all.forEach(function(x){x.setAttribute('aria-pressed',String(x===ch))});
      var f=ch.getAttribute('data-f');items.forEach(function(it){it.hidden=!(f==='all'||it.getAttribute('data-cat')===f)});
      visible=items.filter(function(it){return !it.hidden})})});
    function open(i){cur=i;var it=visible[i];$('.lb-img',dlg).textContent=it.getAttribute('data-title');$('.lb-cap',dlg).textContent=it.getAttribute('data-title')+' ('+(i+1)+' of '+visible.length+')';if(!dlg.open){dlg.showModal?dlg.showModal():dlg.setAttribute('open','')}}
    items.forEach(function(it){it.addEventListener('click',function(){open(visible.indexOf(it))})});
    $('[data-lb=prev]',dlg).addEventListener('click',function(){open((cur-1+visible.length)%visible.length)});
    $('[data-lb=next]',dlg).addEventListener('click',function(){open((cur+1)%visible.length)});
    $('[data-lb=close]',dlg).addEventListener('click',function(){dlg.close?dlg.close():dlg.removeAttribute('open')});
    dlg.addEventListener('keydown',function(e){if(e.key==='ArrowRight')open((cur+1)%visible.length);if(e.key==='ArrowLeft')open((cur-1+visible.length)%visible.length)});
    dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
  });

  /* ---------- Registration form (Formspree, same endpoint and field names as before) ---------- */
  $$('[data-reg-form]').forEach(function(form){
    var btn=$('button[type=submit]',form),label=$('.lbl',btn),msg=$('.form-msg',form);
    var rules={
      first_name:function(v){return v.trim()?'':'Enter your first name.'},
      last_name:function(v){return v.trim()?'':'Enter your last name.'},
      email:function(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())?'':'Enter an email address like name@example.com.'},
      phone:function(v){return v.replace(/\D/g,'').replace(/^91/,'').length===10?'':'Enter a 10-digit mobile number.'},
      service:function(v){return v?'':'Choose what you are interested in.'}
    };
    function check(el){var r=rules[el.name];if(!r)return true;var e=r(el.value),f=el.closest('.field');f.classList.toggle('invalid',!!e);$('.err',f).textContent=e;el.setAttribute('aria-invalid',e?'true':'false');return !e}
    Object.keys(rules).forEach(function(n){var el=form.elements[n];if(el){el.addEventListener('blur',function(){check(el)});el.addEventListener('input',function(){if(el.closest('.field').classList.contains('invalid'))check(el)})}});
    function show(kind,text){msg.className='form-msg '+kind;msg.innerHTML=(kind==='ok'?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 7v6M12 16.5v.5"/></svg>')+'<span>'+text+'</span>';msg.setAttribute('tabindex','-1');msg.focus({preventScroll:true});msg.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'})}
    var idle=label.textContent,okMsg=form.getAttribute('data-ok')||'Thank you! Your registration has been submitted. We will contact you soon.';
    function busy(on){btn.disabled=on;btn.classList.toggle('loading',on);label.textContent=on?'Sending…':idle}
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var ok=true,first=null;Object.keys(rules).forEach(function(n){var el=form.elements[n];if(el&&!check(el)){ok=false;first=first||el}});
      if(!ok){first.focus();return}
      busy(true);
      if(form.hasAttribute('data-preview')){setTimeout(function(){busy(false);form.reset();show('ok',okMsg+' (Preview only: nothing was sent.)')},700);return}
      fetch(form.getAttribute('action'),{method:'POST',body:new FormData(form),headers:{'Accept':'application/json'}})
        .then(function(r){busy(false);if(r.ok){form.reset();show('ok',okMsg)}else{throw new Error()}})
        .catch(function(){busy(false);show('bad','Your details could not be sent. Check your connection and try again, or email us at info@ovconsultancy.com.')});
    });
  });

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach(function(el){el.textContent=new Date().getFullYear()});
})();
