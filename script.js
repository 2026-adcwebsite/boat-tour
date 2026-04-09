// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 60));
}

// ===== BURGER =====
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
if (burger && navLinks) {
  burger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    document.body.style.overflow = '';
  }));
}

// ===== FADE-IN =====
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ===== CALENDAR – Airbnb Style =====
const WA_NUMBER = '355697015966';

// Generate simulated availability for next 60 days
function generateAvailability() {
  const avail = {};
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const key = d.toISOString().split('T')[0];
    const rand = Math.random();
    if (i === 0) avail[key] = 5;
    else if (rand < 0.20) avail[key] = 0;
    else if (rand < 0.40) avail[key] = Math.floor(Math.random() * 3) + 1;
    else avail[key] = Math.floor(Math.random() * 6) + 5;
  }
  return avail;
}
const availability = generateAvailability();

let calYear, calMonth, selectedDate = null;
const todayObj = new Date();
calYear  = todayObj.getFullYear();
calMonth = todayObj.getMonth();

const monthNames = ['Janar','Shkurt','Mars','Prill','Maj','Qershor','Korrik','Gusht','Shtator','Tetor','Nëntor','Dhjetor'];

function renderCalendar() {
  const grid  = document.getElementById('calGrid');
  const label = document.getElementById('calMonthLabel');
  if (!grid || !label) return;

  label.textContent = `${monthNames[calMonth]} ${calYear}`;
  grid.innerHTML = '';

  const firstDay   = new Date(calYear, calMonth, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Mon-first
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const todayMidnight = new Date(todayObj.getFullYear(), todayObj.getMonth(), todayObj.getDate());

  for (let i = 0; i < startOffset; i++) {
    grid.appendChild(document.createElement('div'));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(calYear, calMonth, day);
    const dateStr = dateObj.toISOString().split('T')[0];
    const isPast  = dateObj < todayMidnight;
    const spots   = availability[dateStr];
    const isFullyBooked = !isPast && (spots === 0 || spots === undefined);
    const isLow   = !isPast && spots > 0 && spots <= 3;
    const isFree  = !isPast && spots > 3;
    const isSel   = dateStr === selectedDate;
    const isClickable = !isPast && !isFullyBooked;

    const cell = document.createElement('div');
    cell.style.cssText = 'text-align:center;padding:3px 1px;position:relative;';

    const dayNum = document.createElement('div');
    dayNum.textContent = day;
    dayNum.style.cssText = `
      width:30px;height:30px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      margin:0 auto 2px;font-size:.82rem;font-weight:600;
      cursor:${isClickable ? 'pointer' : 'default'};
      transition:all .15s;
      background:${isSel ? '#0a2342' : 'transparent'};
      color:${isSel ? 'white' : isPast ? '#d1d5db' : isFullyBooked ? '#d1d5db' : '#0a2342'};
      text-decoration:${isFullyBooked && !isPast ? 'line-through' : 'none'};
      text-decoration-color:#f87171;
    `;
    cell.appendChild(dayNum);

    // Dot indicator
    if (!isPast) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        width:4px;height:4px;border-radius:50%;margin:0 auto;
        background:${isFullyBooked ? '#f3f4f6' : isLow ? '#fbbf24' : '#0d9488'};
      `;
      cell.appendChild(dot);
    }

    if (isClickable) {
      dayNum.addEventListener('mouseenter', () => {
        if (!isSel) { dayNum.style.background = '#e0ecf8'; }
      });
      dayNum.addEventListener('mouseleave', () => {
        if (dateStr !== selectedDate) dayNum.style.background = 'transparent';
      });
      cell.addEventListener('click', () => {
        selectedDate = dateStr;
        renderCalendar();
        updateSelectedInfo(dateStr, spots);
      });
    }

    grid.appendChild(cell);
  }
}

function updateSelectedInfo(dateStr, spots) {
  const infoEl     = document.getElementById('selectedDateInfo');
  const dateTextEl = document.getElementById('selectedDateText');
  const spotsTextEl= document.getElementById('selectedSpotsText');
  const leftLabel  = document.getElementById('spotsLeftLabel');
  if (!infoEl) return;

  const formatted = new Date(dateStr + 'T12:00:00').toLocaleDateString('sq-AL', { weekday:'long', day:'numeric', month:'long' });
  infoEl.style.display = 'block';

  if (!spots || spots === 0) {
    infoEl.style.cssText = 'display:block;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:.7rem 1rem;margin-bottom:.8rem;font-size:.85rem;color:#991b1b;';
    dateTextEl.textContent = formatted + ' – ';
    spotsTextEl.textContent = '❌ E zënë plotësisht';
    if (leftLabel) leftLabel.textContent = 'Nuk ka vende!';
  } else if (spots <= 3) {
    infoEl.style.cssText = 'display:block;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:.7rem 1rem;margin-bottom:.8rem;font-size:.85rem;color:#92400e;';
    dateTextEl.textContent = formatted + ' – ';
    spotsTextEl.textContent = `⚡ Vetëm ${spots} vend${spots > 1 ? 'e' : ''} i lirë!`;
    if (leftLabel) leftLabel.textContent = `Maks. ${spots} persona`;
  } else {
    infoEl.style.cssText = 'display:block;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:.7rem 1rem;margin-bottom:.8rem;font-size:.85rem;color:#166534;';
    dateTextEl.textContent = formatted + ' – ';
    spotsTextEl.textContent = `✅ ${spots} vende të lira`;
    if (leftLabel) leftLabel.textContent = `Maks. ${spots} persona`;
  }
}

document.getElementById('calPrev')?.addEventListener('click', () => {
  if (calMonth === 0) { calMonth = 11; calYear--; } else calMonth--;
  renderCalendar();
});
document.getElementById('calNext')?.addEventListener('click', () => {
  if (calMonth === 11) { calMonth = 0; calYear++; } else calMonth++;
  renderCalendar();
});
renderCalendar();

// ===== GUESTS =====
let guests = 2;
const gCount = document.getElementById('gCount');
const gMinus = document.getElementById('gMinus');
const gPlus  = document.getElementById('gPlus');

function updateGuests() {
  if (gCount) gCount.textContent = guests;
  if (gMinus) gMinus.disabled = guests <= 1;
  if (gPlus)  gPlus.disabled  = guests >= 12;
  updatePriceBreakdown();
}
gMinus?.addEventListener('click', () => { if (guests > 1) { guests--; updateGuests(); } });
gPlus?.addEventListener('click',  () => { if (guests < 12) { guests++; updateGuests(); } });

function updatePriceBreakdown() {
  const sel = document.getElementById('tourSelect');
  if (!sel) return;
  const prices = { sunset:3500, full:5500, island:7500, private:12000 };
  const base = prices[sel.value] || 3500;
  const total = base * guests;
  const fee = Math.round(total * 0.05);
  const fmt = n => n.toLocaleString('sq-AL') + ' Lekë';
  const rb = document.getElementById('rowBase');
  const rf = document.getElementById('rowFee');
  const rt = document.getElementById('rowTotal');
  if (rb) rb.textContent = fmt(total);
  if (rf) rf.textContent = fmt(fee);
  if (rt) rt.textContent = fmt(total + fee);
}
document.getElementById('tourSelect')?.addEventListener('change', updatePriceBreakdown);
updateGuests();

// ===== MODAL =====
const modalOverlay = document.getElementById('modalOverlay');

function openModal(tourHint) {
  if (!modalOverlay) return;
  // Pre-fill tour
  const mTour = document.getElementById('mTour');
  if (mTour && tourHint) {
    for (let opt of mTour.options) {
      if (opt.text.toLowerCase().includes(tourHint.toLowerCase().split(' ')[0])) {
        opt.selected = true; break;
      }
    }
  }
  // Pre-fill date from calendar selection
  const mDate = document.getElementById('mDate');
  if (mDate && selectedDate) mDate.value = selectedDate;

  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  modalOverlay.scrollTop = 0;
}

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('btnBook')?.addEventListener('click', () => {
  const sel = document.getElementById('tourSelect');
  openModal(sel ? sel.options[sel.selectedIndex].text : '');
});

document.querySelectorAll('.btn-book-card').forEach(btn => {
  btn.addEventListener('click', () => openModal(btn.dataset.tour || ''));
});

document.getElementById('modalClose')?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

// Modal form submit → WhatsApp
document.getElementById('modalForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const name  = document.getElementById('mName')?.value || '';
  const phone = document.getElementById('mPhone')?.value || '';
  const tour  = document.getElementById('mTour')?.value || '';
  const date  = document.getElementById('mDate')?.value || '';
  const g     = document.getElementById('mGuests')?.value || '';
  const note  = document.getElementById('mNote')?.value || '';
  const dateFmt = date ? new Date(date+'T12:00:00').toLocaleDateString('sq-AL',{day:'numeric',month:'long',year:'numeric'}) : '';
  const msg = encodeURIComponent(
    `Përshëndetje WaveRider! 🚢\n\nDua të rezervoj:\n🎫 Turi: ${tour}\n📅 Data: ${dateFmt}\n👥 Persona: ${g}\n👤 Emri: ${name}\n📞 Tel: ${phone}` +
    (note ? `\n📝 Shënim: ${note}` : '')
  );
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
  const succ = document.getElementById('successMsg');
  if (succ) succ.style.display = 'block';
  setTimeout(() => { closeModal(); if (succ) succ.style.display = 'none'; document.getElementById('modalForm')?.reset(); }, 3500);
});

// WhatsApp direct button
document.getElementById('btnWA')?.addEventListener('click', () => {
  const sel = document.getElementById('tourSelect');
  const name = sel ? sel.options[sel.selectedIndex].text : 'Tur';
  const dateFmt = selectedDate ? new Date(selectedDate+'T12:00:00').toLocaleDateString('sq-AL',{day:'numeric',month:'long'}) : '';
  const msg = encodeURIComponent(`Përshëndetje WaveRider! 🚢 Dua informacion për "${name}"${dateFmt?' për datën '+dateFmt:''}, ${guests} persona.`);
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
});

// ===== GALLERY LIGHTBOX =====
const lbOverlay = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const galItems = document.querySelectorAll('.gal-item');
let currentLb = 0;
const galImgs = [...galItems].map(i => i.querySelector('img')?.src).filter(Boolean);
galItems.forEach((item, idx) => {
  item.addEventListener('click', () => {
    if (!lbOverlay||!lbImg) return;
    currentLb=idx; lbImg.src=galImgs[idx];
    lbOverlay.classList.add('active'); document.body.style.overflow='hidden';
  });
});
document.getElementById('lbClose')?.addEventListener('click', ()=>{ lbOverlay?.classList.remove('active'); document.body.style.overflow=''; });
document.getElementById('lbPrev')?.addEventListener('click', ()=>{ currentLb=(currentLb-1+galImgs.length)%galImgs.length; if(lbImg) lbImg.src=galImgs[currentLb]; });
document.getElementById('lbNext')?.addEventListener('click', ()=>{ currentLb=(currentLb+1)%galImgs.length; if(lbImg) lbImg.src=galImgs[currentLb]; });
lbOverlay?.addEventListener('click', e=>{ if(e.target===lbOverlay){ lbOverlay.classList.remove('active'); document.body.style.overflow=''; } });

// ===== GALLERY FILTER =====
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.gal-item').forEach(item => {
      item.style.display = (f==='all' || item.dataset.cat===f) ? 'block' : 'none';
    });
  });
});

// ===== CONTACT FORM =====
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const name  = document.getElementById('cName')?.value || '';
  const phone = document.getElementById('cPhone')?.value || '';
  const tour  = document.getElementById('cTour')?.value || '';
  const date  = document.getElementById('cDate')?.value || '';
  const g     = document.getElementById('cPersona')?.value || '';
  const note  = document.getElementById('cNote')?.value || '';
  const msg = encodeURIComponent(
    `Përshëndetje WaveRider! 🚢\n\nRezervim:\n🎫 ${tour}\n📅 ${date}\n👥 ${g}\n👤 ${name}\n📞 ${phone}`+(note?`\n📝 ${note}`:'')
  );
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.textContent='✓ Dërguar! Do ju kontaktojmë!'; btn.style.background='#25d366'; btn.style.color='white'; }
  setTimeout(()=>{ if(btn){ btn.textContent='Dërgo Rezervimin në WhatsApp'; btn.style.cssText=''; } e.target.reset(); }, 4000);
});

// Min date
const todayStr = new Date().toISOString().split('T')[0];
document.querySelectorAll('input[type="date"]').forEach(d => d.min = todayStr);
