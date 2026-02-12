(function(){
  function qs(sel){ return document.querySelector(sel); }
  function esc(s){
    return (s || "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }

  const input = qs('#siteSearchInput');
  const btn = qs('#siteSearchBtn');
  const out = qs('#siteSearchResults');

  if(!input || !btn || !out || !window.ROTR_SEARCH_INDEX) return;

  function run(){
    const q = (input.value || "").trim().toLowerCase();
    out.innerHTML = "";
    if(!q){
      out.innerHTML = '<p class="muted">Type a keyword (e.g., <span class="kbd">AirCo</span>, <span class="kbd">ITA</span>, <span class="kbd">500</span>, <span class="kbd">mutual aid</span>).</p>';
      return;
    }

    const hits = window.ROTR_SEARCH_INDEX
      .map(item => {
        const hay = (item.title + " " + item.text).toLowerCase();
        const score = hay.includes(q) ? 2 : 0;
        const partial = q.length >= 3 && hay.includes(q.slice(0, Math.max(3, Math.floor(q.length*0.8)))) ? 1 : 0;
        return { item, score: score + partial };
      })
      .filter(x => x.score > 0)
      .sort((a,b) => b.score - a.score)
      .slice(0, 12);

    if(!hits.length){
      out.innerHTML = '<p class="muted">No results. Try a broader term like <span class="kbd">airspace</span>, <span class="kbd">deconfliction</span>, or <span class="kbd">interagency</span>.</p>';
      return;
    }

    const base = (document.body.getAttribute('data-page-base') || "");
    out.innerHTML = hits.map(x => {
      const url = base + x.item.url;
      return `
        <div class="result">
          <a href="${esc(url)}">${esc(x.item.title)}</a>
          <p>${esc(x.item.text).slice(0, 180)}...</p>
        </div>
      `;
    }).join("");
  }

  btn.addEventListener('click', run);
  input.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') run(); });

  // Auto-run if q= present
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if(q){
    input.value = q;
    run();
  }
})();
