  // clock
  function pad(n){ return n.toString().padStart(2,'0'); }
  function tick(){
    const d = new Date();
    const s = pad(d.getUTCHours())+":"+pad(d.getUTCMinutes())+":"+pad(d.getUTCSeconds())+" UTC";
    document.getElementById('clock').textContent = s;
    const fc = document.getElementById('footerClock');
    if(fc) fc.textContent = s + " · ÓRBITA EM ANDAMENTO";
  }
  tick(); setInterval(tick, 1000);

  // ticker content (duplicated for seamless loop)
  const tickerData = [
    ["ALT", "408 KM"], ["VEL", "27.600 KM/H"], ["PERÍODO", "92 MIN"],
    ["INCLINAÇÃO", "51,6°"], ["NASCERES DO SOL", "16 POR DIA"], ["TRIPULAÇÃO ISS", "≈ 7"],
    ["DISTÂNCIA MÉDIA À TERRA", "384.400 KM (LUA)"], ["CIRCUNFERÊNCIA", "40.075 KM"]
  ];
  const track = document.getElementById('tickerTrack');
  function buildTicker(){
    let html = "";
    for(let r=0; r<2; r++){
      tickerData.forEach(([k,v])=>{
        html += `<div class="ticker-item"><span class="dot"></span>${k} <b>${v}</b></div>`;
      });
    }
    track.innerHTML = html;
  }
  buildTicker();

  // scroll progress rail
  const railFill = document.getElementById('railFill');
  const railLabel = document.getElementById('railLabel');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const bgs = Array.from(document.querySelectorAll('.panel-bg'));

  function onScroll(){
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, Math.max(0,(scrollTop/docHeight)*100)) : 0;
    railFill.style.height = pct + "%";
    railLabel.textContent = String(Math.round(pct)).padStart(3,'0') + "%";

    if(!reduceMotion){
      bgs.forEach(bg=>{
        const speed = parseFloat(bg.dataset.speed || 0.15);
        const rect = bg.parentElement.getBoundingClientRect();
        const offset = rect.top * speed;
        bg.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    }
  }

  let rafId = null;
  window.addEventListener('scroll', ()=>{
    if(rafId) return;
    rafId = requestAnimationFrame(()=>{ onScroll(); rafId = null; });
  }, { passive:true });
  onScroll();

  // reveal on view
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.35 });
  document.querySelectorAll('.panel').forEach(p=>io.observe(p));

const cards = document.querySelectorAll(".cmt-card");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

let currentRotation = 0;

function positionCards() {

    const total = cards.length;
    const angle = 360 / total;
    const radius = 260;

    cards.forEach((card, index) => {

        const rotate = (index * angle) + currentRotation;

        card.style.transform = `
            rotateY(${rotate}deg)
            translateZ(${radius}px)
        `;

    });
}

nextBtn.addEventListener("click", () => {
    currentRotation -= 72;
    positionCards();
});

prevBtn.addEventListener("click", () => {
    currentRotation += 72;
    positionCards();
});

cards.forEach((card, index) => {

    card.addEventListener("click", () => {

        currentRotation = -(index * (360 / cards.length));

        positionCards();

    });

});

positionCards();