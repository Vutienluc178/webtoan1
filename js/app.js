// app.js – toggle theme, sidebar, and in-page viewer
(function(){
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const root = document.documentElement;
  if(localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && prefersDark)){
    root.classList.add('dark');
  }
  const sidebar = document.getElementById('sidebar');
  const toggleMenu = document.getElementById('toggleMenu');
  const toggleTheme = document.getElementById('toggleTheme');
  const viewer = document.getElementById('viewer');
  const viewerTitle = document.getElementById('viewerTitle');
  const openNewTab = document.getElementById('openNewTab');

  toggleMenu.addEventListener('click', ()=> sidebar.classList.toggle('open'));
  toggleTheme.addEventListener('click', ()=>{
    root.classList.toggle('dark');
    localStorage.setItem('theme', root.classList.contains('dark') ? 'dark':'light');
  });

  document.querySelectorAll('a[data-embed]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const url = a.getAttribute('href');
      viewer.setAttribute('src', url);
      viewerTitle.textContent = a.textContent.trim();
      openNewTab.setAttribute('href', url);
      // Auto close menu on mobile
      sidebar.classList.remove('open');
    });
  });

  // Accordion: chỉ mở 1 nhóm, lưu trạng thái
  const accs = document.querySelectorAll('details.acc');
  accs.forEach((d,i)=>{
    d.addEventListener('toggle', ()=>{
      if(d.open){
        accs.forEach((x)=>{ if(x!==d) x.open=false; });
        localStorage.setItem('acc_open', i);
      }else{
        const anyOpen = Array.from(accs).some(x=>x.open);
        if(!anyOpen) localStorage.removeItem('acc_open');
      }
    });
  });
  const saved = localStorage.getItem('acc_open');
  if(saved!==null){
    const idx = parseInt(saved,10);
    if(accs[idx]) accs[idx].open = true;
  }

})();
// Auto load tool from query string (?tool=...)
(function(){
  const params = new URLSearchParams(window.location.search);
  const tool = params.get("tool");
  if(tool){
    const viewer = document.getElementById('viewer');
    const viewerTitle = document.getElementById('viewerTitle');
    const openNewTab = document.getElementById('openNewTab');
    viewer.setAttribute('src', tool);
    viewerTitle.textContent = "Xem: " + decodeURIComponent(tool.split('/').pop());
    openNewTab.setAttribute('href', tool);
  }
})();
(async function buildMenu(){
  const wrap = document.getElementById('autoMenu');
  try{
    const res = await fetch('tools/index.json', {cache:'no-store'});
    const groups = await res.json();
    wrap.innerHTML = ''; // clear "Đang tải…"

    groups.forEach((g, gi)=>{
      const det = document.createElement('details');
      det.className = 'acc';
      if(gi===0) det.open = true;
      const sum = document.createElement('summary');
      sum.textContent = g.group || 'Nhóm';
      det.appendChild(sum);

      const ul = document.createElement('ul');
      (g.items||[]).forEach(item=>{
        const li = document.createElement('li');
        const a  = document.createElement('a');
        a.textContent = item.title || item.path;
        a.href = 'tools/' + item.path.replace(/^tools\//,'');
        a.setAttribute('data-embed','');
        a.addEventListener('click', e=>{
          e.preventDefault();
          const url = a.getAttribute('href');
          const iframe = document.getElementById('viewer');
          const title  = document.getElementById('viewerTitle');
          const open   = document.getElementById('openNewTab');
          iframe.src = url;
          title.textContent = item.title || url;
          open.href = url;
        });
        li.appendChild(a);
        ul.appendChild(li);
      });
      det.appendChild(ul);
      wrap.appendChild(det);
    });
  }catch(err){
    wrap.textContent = 'Không tải được menu (tools/index.json).';
  }
})();

