const STORAGE_KEY = 'adxray-state-v1';

const defaultState = {
  ads: [
    {
      id: 'ad-1',
      name: 'Acelerador de Leads',
      product: 'CRM para agências',
      niche: 'marketing digital',
      url: 'https://example.com/lead-accelerator',
      copyText:
        'Pare de perder clientes. Descubra como aumentar leads com automação de follow-up em 7 dias.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ad-2',
      name: 'Sistema de Vendas',
      product: 'ferramenta para vendedores',
      niche: 'vendas B2B',
      url: 'https://example.com/sales-system',
      copyText:
        'Aumente suas conversões com uma máquina de propostas que gera mais reuniões sem depender de mais ação manual.',
      createdAt: new Date().toISOString(),
    },
  ],
  selectedId: null,
};

const state = loadState();

const form = document.getElementById('ad-form');
const adList = document.getElementById('ad-list');
const adCount = document.getElementById('ad-count');
const analysisEmpty = document.getElementById('analysis-empty');
const analysisPanel = document.getElementById('analysis-panel');
const installBtn = document.getElementById('install-btn');

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(defaultState);

  try {
    const parsed = JSON.parse(raw);
    return { ...structuredClone(defaultState), ...parsed, ads: parsed.ads || defaultState.ads };
  } catch {
    return structuredClone(defaultState);
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getSelectedAd() {
  return state.ads.find((ad) => ad.id === state.selectedId) || state.ads[0] || null;
}

function renderAds() {
  adCount.textContent = `${state.ads.length} item${state.ads.length === 1 ? '' : 's'}`;

  if (!state.ads.length) {
    adList.innerHTML = '<div class="empty-card">Nenhum anúncio cadastrado.</div>';
    return;
  }

  adList.innerHTML = state.ads
    .map(
      (ad) => `
        <button class="ad-card ${ad.id === state.selectedId ? 'selected' : ''}" data-id="${ad.id}" type="button">
          <span class="ad-name">${escapeHtml(ad.name)}</span>
          <span class="ad-meta">${escapeHtml(ad.niche)} · ${escapeHtml(ad.product)}</span>
          <span class="ad-copy">${escapeHtml(truncate(ad.copyText, 90))}</span>
        </button>
      `
    )
    .join('');

  document.querySelectorAll('.ad-card').forEach((card) => {
    card.addEventListener('click', () => {
      state.selectedId = card.dataset.id;
      persistState();
      renderAds();
      renderAnalysis();
    });
  });
}

function renderAnalysis() {
  const ad = getSelectedAd();

  if (!ad) {
    analysisEmpty.classList.remove('hidden');
    analysisPanel.classList.add('hidden');
    return;
  }

  analysisEmpty.classList.add('hidden');
  analysisPanel.classList.remove('hidden');

  const analysis = analyzeAd(ad);

  document.getElementById('heuristic-score').textContent = String(analysis.score);
  document.getElementById('hook-result').textContent = analysis.hook;
  document.getElementById('angle-result').textContent = analysis.angle;
  document.getElementById('offer-result').textContent = analysis.offer;
  document.getElementById('audience-result').textContent = analysis.audience;
  document.getElementById('cta-result').textContent = analysis.cta;
}

function analyzeAd(ad) {
  const text = `${ad.name} ${ad.product} ${ad.niche} ${ad.copyText}`.toLowerCase();

  let score = 62;
  if (text.includes('aumente') || text.includes('mais')) score += 7;
  if (text.includes('sem') || text.includes('sem depender')) score += 6;
  if (text.includes('vendas') || text.includes('leads')) score += 8;
  if (text.includes('automação')) score += 5;
  score = Math.min(score, 98);

  const hook =
    text.includes('pare de') || text.includes('aumente')
      ? 'Dobra de dor + promessa de melhoria imediata.'
      : 'Sugestão de ganho rápido com foco em consequência.';

  const angle =
    text.includes('automação') || text.includes('sistema')
      ? 'Produto apresentado como mecanismo de escala e redução de esforço manual.'
      : 'Produto com apelo de eficiência e resultado mensurável.';

  const offer =
    text.includes('lead') || text.includes('vendas')
      ? 'Oferta orientada para performance: mais conversão, mais reuniões e menos fricção operacional.'
      : 'Oferta estruturada em benefício direto + menos esforço para o cliente.';

  const audience =
    text.includes('marketing') || text.includes('agência')
      ? 'Profissionais de marketing e negócios que precisam escalar operação sem crescer em equipe.'
      : 'Times de vendas e operação que precisam acelerar pipeline sem perder qualidade.';

  const cta =
    text.includes('descubra') || text.includes('pare')
      ? 'CTA de baixo atrito: “Descubra como…”'
      : 'CTA de benefício: “Veja como…”';

  return { score, hook, angle, offer, audience, cta };
}

function truncate(value, max = 100) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const ad = {
    id: crypto.randomUUID(),
    name: formData.get('name').toString().trim(),
    product: formData.get('product').toString().trim(),
    niche: formData.get('niche').toString().trim(),
    url: formData.get('url').toString().trim(),
    copyText: formData.get('copyText').toString().trim(),
    createdAt: new Date().toISOString(),
  };

  state.ads.unshift(ad);
  state.selectedId = ad.id;
  persistState();
  renderAds();
  renderAnalysis();
  form.reset();
});

if (state.ads.length) state.selectedId = state.selectedId || state.ads[0].id;

renderAds();
renderAnalysis();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => console.warn('SW failed:', error));
  });
}

let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installBtn.style.display = 'inline-flex';
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.style.display = 'none';
});
