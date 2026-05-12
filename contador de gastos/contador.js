
/* ============================================================
   STORAGE MODULE
   ------------------------------------------------------------
   Camada de persistência. Toda leitura/escrita do estado do
   app passa por aqui. O estado é salvo no localStorage como
   um único JSON sob a chave STORAGE_KEY.

   Formato do estado:
   {
     income: number,                     // receita mensal
     envelopes: [                        // lista de envelopes
       {
         id: string,                     // identificador único
         name: string,                   // nome do envelope
         category: "essentials" | "investments" | "leisure",
         value: number,                  // valor alocado
         spent: number,                  // total já gasto
         expenses: [                     // histórico de gastos
           { id, description, amount, date }
         ]
       }
     ]
   }
============================================================ */
const STORAGE_KEY = "financial_503020";

// Lê o estado salvo. Se não existir nada, devolve um estado vazio padrão.
function storage_load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : { income: 0, envelopes: [] };
}

// Salva o estado completo (sempre serializado como JSON).
function storage_save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ============================================================
   CALCULOS MODULE
   ------------------------------------------------------------
   Funções puras que calculam números a partir do estado.
   Não tocam no DOM nem no localStorage — só matemática.
============================================================ */

// Devolve os 3 limites mensais (50%, 30%, 20%) a partir da receita.
function calculos_limits(income) {
  return {
    essentials:  income * 0.50,
    investments: income * 0.30,
    leisure:     income * 0.20,
  };
}

// Soma o `value` de todos os envelopes de uma dada categoria.
// Usado para saber quanto do limite daquela categoria já foi comprometido.
function calculos_categoryAllocated(envelopes, category) {
  return envelopes
    .filter(e => e.category === category)
    .reduce((sum, e) => sum + e.value, 0);
}

// Soma o `spent` de todos os envelopes de uma dada categoria.
function calculos_categorySpent(envelopes, category) {
  return envelopes
    .filter(e => e.category === category)
    .reduce((sum, e) => sum + e.spent, 0);
}

// Total alocado em TODOS os envelopes (ignora categoria).
function calculos_totalCommitted(envelopes) {
  return envelopes.reduce((sum, e) => sum + e.value, 0);
}

// Total gasto em TODOS os envelopes (ignora categoria).
function calculos_totalSpent(envelopes) {
  return envelopes.reduce((sum, e) => sum + e.spent, 0);
}

/* ============================================================
   VALIDACOES MODULE
   ------------------------------------------------------------
   Regras de negócio que impedem ações inválidas:
   - Criar envelope acima do limite da categoria
   - Registrar gasto acima do saldo do envelope
   Cada função devolve { valid: bool, msg?: string }.
============================================================ */

// Valida se um novo envelope cabe no limite restante da categoria.
function validacoes_envelope(envelopes, category, value, income) {
  if (!value || value <= 0)
    return { valid: false, msg: "O valor deve ser maior que zero." };

  const limits    = calculos_limits(income);
  const limit     = limits[category];
  const current   = calculos_categoryAllocated(envelopes, category);
  const remaining = limit - current;

  if (value > remaining) {
    return { valid: false, msg: `Limite excedido! Disponível nesta categoria: ${fmt(remaining)}` };
  }
  return { valid: true };
}

// Valida se um gasto cabe no saldo do envelope (value - spent).
function validacoes_expense(envelope, amount) {
  if (!amount || amount <= 0)
    return { valid: false, msg: "O valor deve ser maior que zero." };

  const remaining = envelope.value - envelope.spent;
  if (amount > remaining) {
    return { valid: false, msg: `Saldo insuficiente! Disponível: ${fmt(remaining)}` };
  }
  return { valid: true };
}

/* ============================================================
   FORMATTERS
   ------------------------------------------------------------
   Helpers para exibição: formatação de moeda BRL e de datas
   em pt-BR. Usados em todo o módulo de renderização.
============================================================ */

// Formata número como moeda brasileira (R$ 1.234,56).
function fmt(val) {
  return (val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Formata data ISO em "DD mes AAAA, HH:MM" pt-BR.
function fmtDate(iso) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

/* ============================================================
   RENDERIZACAO MODULE
   ------------------------------------------------------------
   Funções que recebem o estado (data) e atualizam o DOM.
   - renderizacao_summary    → cards do "Resumo Geral"
   - renderizacao_categories → cards da divisão 50-30-20
   - renderizacao_envelopes  → grade de envelopes agrupados
   - renderizacao_all        → chama os 3 acima (re-render geral)
============================================================ */

// Atualiza os 3 cards de topo: Em Envelopes, Total Gasto, Livre.
function renderizacao_summary(data) {
  const { income, envelopes } = data;
  const committed = calculos_totalCommitted(envelopes);
  const spent     = calculos_totalSpent(envelopes);
  const free      = income - committed;
  // % protegido contra divisão por zero
  const pctC      = income > 0 ? ((committed / income) * 100).toFixed(0) : 0;
  const pctS      = income > 0 ? ((spent / income) * 100).toFixed(0) : 0;

  document.getElementById("sum-committed").textContent     = fmt(committed);
  document.getElementById("sum-committed-pct").textContent = `${pctC}% da receita planejado`;
  document.getElementById("sum-spent").textContent         = fmt(spent);
  document.getElementById("sum-spent-pct").textContent     = `${pctS}% da receita`;
  document.getElementById("sum-free").textContent          = fmt(free);
}

// Atualiza os 3 cards de categoria (limite, alocado, livre, barra, gasto).
function renderizacao_categories(data) {
  const { income, envelopes } = data;
  const limits = calculos_limits(income);
  const cats   = ["essentials", "investments", "leisure"];

  // Itera as 3 categorias e preenche os elementos com IDs padronizados:
  // cat-<categoria>-limit / -alloc / -free / -bar / -footer
  cats.forEach(cat => {
    const limit = limits[cat];
    const alloc = calculos_categoryAllocated(envelopes, cat);
    const spent = calculos_categorySpent(envelopes, cat);
    const free  = limit - alloc;
    const pct   = limit > 0 ? (alloc / limit) * 100 : 0;

    document.getElementById(`cat-${cat}-limit`).textContent  = fmt(limit);
    document.getElementById(`cat-${cat}-alloc`).textContent  = fmt(alloc);
    document.getElementById(`cat-${cat}-free`).textContent   = fmt(free);
    // Barra: limita em 100% para não estourar visualmente
    document.getElementById(`cat-${cat}-bar`).style.width    = Math.min(pct, 100) + "%";
    document.getElementById(`cat-${cat}-footer`).textContent =
      `Gasto: ${fmt(spent)} · ${pct.toFixed(0)}% do limite usado`;
  });
}

// Gera dinamicamente a lista de envelopes, agrupados por categoria.
function renderizacao_envelopes(data) {
  const container = document.getElementById("envelopes-container");
  const { envelopes } = data;

  // Estado vazio: nenhum envelope criado ainda
  if (envelopes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>Nenhum envelope criado.<br>Crie envelopes para organizar seus gastos.</p>
      </div>`;
    return;
  }

  // Metadados visuais por categoria (label exibido, emoji e classe CSS)
  const catConfig = {
    essentials:  { label: "Obrigatórios",  emoji: "🏠", cls: "env-essentials" },
    investments: { label: "Investimentos", emoji: "📈", cls: "env-investments" },
    leisure:     { label: "Lazer",         emoji: "🎮", cls: "env-leisure" },
  };

  let html = "";

  // Para cada categoria, monta um "grupo" com os envelopes que pertencem a ela.
  // Categorias sem envelopes são puladas (não geram cabeçalho vazio).
  Object.entries(catConfig).forEach(([cat, cfg]) => {
    const group = envelopes.filter(e => e.category === cat);
    if (group.length === 0) return;

    html += `<div class="env-group">
      <div class="env-group-title">${cfg.emoji} ${cfg.label}</div>
      <div class="env-grid">`;

    // Para cada envelope, monta o card com stats, barra e histórico.
    group.forEach(env => {
      const remaining = env.value - env.spent;
      const pct       = env.value > 0 ? (env.spent / env.value) * 100 : 0;
      // Cores da barra mudam conforme o nível de uso
      const barCls    = pct >= 90 ? "danger" : pct >= 70 ? "warn" : "";
      // Estilo do saldo: vermelho quando esgota
      const remCls    = remaining <= 0 ? "depleted" : "env-remaining";

      // Linhas do histórico de gastos do envelope (mais recente primeiro)
      const expRows = env.expenses.map(exp => `
        <div class="exp-row">
          <div>
            <div class="exp-desc">${exp.description}</div>
            <div class="exp-date">${fmtDate(exp.date)}</div>
          </div>
          <div class="exp-amount">-${fmt(exp.amount)}</div>
        </div>`).join("");

      // Botão "ver histórico" só aparece se houver pelo menos 1 gasto
      const historyBtn = env.expenses.length > 0
        ? `<button class="env-history-toggle" onclick="toggleHistory('${env.id}')">
             <span id="hist-arrow-${env.id}">▾</span> ${env.expenses.length} gasto(s)
           </button>
           <div class="env-history" id="hist-${env.id}">${expRows}</div>`
        : "";

      // Card do envelope (cabeçalho + stats + barra + histórico)
      html += `
        <div class="env-card ${cfg.cls}">
          <div class="env-top">
            <div>
              <div class="env-name-row">
                <span class="env-emoji">${cfg.emoji}</span>
                <span class="env-name">${env.name}</span>
              </div>
              <span class="env-cat-tag">${cfg.label}</span>
            </div>
            <div class="env-actions">
              <!-- Botão 🧾 abre o modal para registrar gasto neste envelope -->
              <button class="btn-icon" title="Registrar gasto" onclick="openExpenseModal('${env.id}')">🧾</button>
              <!-- Botão 🗑 exclui o envelope (pede confirmação) -->
              <button class="btn-icon danger" title="Excluir" onclick="deleteEnvelope('${env.id}')">🗑</button>
            </div>
          </div>

          <div class="env-stats">
            <div>
              <div class="env-stat-label">Alocado</div>
              <div class="env-stat-val">${fmt(env.value)}</div>
            </div>
            <div>
              <div class="env-stat-label">Gasto</div>
              <div class="env-stat-val spent">${fmt(env.spent)}</div>
            </div>
            <div>
              <div class="env-stat-label">Saldo</div>
              <div class="env-stat-val ${remCls}">${fmt(remaining)}</div>
            </div>
          </div>

          <!-- Barra de progresso de uso (spent / value) -->
          <div class="env-bar-track">
            <div class="env-bar-fill ${barCls}" style="width:${Math.min(pct, 100)}%"></div>
          </div>
          <div class="env-pct">${pct.toFixed(0)}% usado</div>

          ${historyBtn}
        </div>`;
    });

    html += `</div></div>`;
  });

  // Substitui o conteúdo do container de uma vez (única atualização de DOM)
  container.innerHTML = html;
}

// Atalho: re-renderiza tudo de uma vez. Chamado depois de qualquer mudança no estado.
function renderizacao_all(data) {
  renderizacao_summary(data);
  renderizacao_categories(data);
  renderizacao_envelopes(data);
}

/* ============================================================
   INCOME — gestão da receita mensal
============================================================ */

// Lê o input de receita, valida e salva. Se ok, troca para o modo "display".
function submitIncome() {
  // Aceita vírgula ou ponto como separador decimal
  const raw = document.getElementById("income-input").value.replace(",", ".");
  const val = parseFloat(raw);

  if (!val || val <= 0) { alert("Insira uma receita válida."); return; }

  const data = storage_load();
  data.income = val;
  storage_save(data);
  applyIncome(data);
}

// Esconde o form, mostra o display, libera o resto do app e o botão de reset.
// Também dispara a renderização inicial dos cards e envelopes.
function applyIncome(data) {
  document.getElementById("income-form").style.display        = "none";
  document.getElementById("income-display").style.display     = "flex";
  document.getElementById("income-display-value").textContent = fmt(data.income);
  document.getElementById("app-content").style.display        = "block";
  document.getElementById("btn-reset").style.display          = "inline-flex";
  renderizacao_all(data);
}

// Volta do modo "display" para o modo "form" (com o valor atual preenchido).
function startEditIncome() {
  document.getElementById("income-display").style.display = "none";
  document.getElementById("income-form").style.display    = "flex";
  document.getElementById("income-input").value = storage_load().income;
  document.getElementById("income-input").focus();
}

/* ============================================================
   CREATE ENVELOPE MODAL — abertura, fechamento e submissão
============================================================ */

// Limpa os campos, esconde mensagens de erro e abre o modal.
function openCreateModal() {
  document.getElementById("env-name").value     = "";
  document.getElementById("env-category").value = "";
  document.getElementById("env-value").value    = "";
  document.getElementById("env-category-hint").textContent = "";
  document.getElementById("create-error").className = "modal-error";
  document.getElementById("modal-create").classList.add("open");
  document.getElementById("env-name").focus();
}

// Fecha o modal de criação sem salvar nada.
function closeCreateModal() {
  document.getElementById("modal-create").classList.remove("open");
}

// Ao trocar a categoria no <select>, mostra um hint com o saldo disponível.
function onCategoryChange() {
  const cat  = document.getElementById("env-category").value;
  const hint = document.getElementById("env-category-hint");
  if (!cat) { hint.textContent = ""; return; }

  const data      = storage_load();
  const limits    = calculos_limits(data.income);
  const allocated = calculos_categoryAllocated(data.envelopes, cat);
  const remaining = limits[cat] - allocated;
  hint.textContent = `Disponível nesta categoria: ${fmt(remaining)}`;
}

// Lê os campos, valida e (se ok) adiciona o envelope no estado.
function submitCreateEnvelope() {
  const name  = document.getElementById("env-name").value.trim();
  const cat   = document.getElementById("env-category").value;
  const raw   = document.getElementById("env-value").value.replace(",", ".");
  const value = parseFloat(raw);
  const errEl = document.getElementById("create-error");

  // Helper local para exibir mensagem de erro no próprio modal
  const showErr = msg => { errEl.textContent = msg; errEl.className = "modal-error show"; };

  if (!name) { showErr("Dê um nome ao envelope."); return; }
  if (!cat)  { showErr("Selecione uma categoria."); return; }

  const data = storage_load();
  const v    = validacoes_envelope(data.envelopes, cat, value, data.income);
  if (!v.valid) { showErr(v.msg); return; }

  // Cria o novo envelope (id baseado em timestamp é simples e único o bastante)
  data.envelopes.push({
    id: Date.now().toString(),
    name,
    value,
    category: cat,
    spent: 0,
    expenses: []
  });

  storage_save(data);
  renderizacao_all(data);
  closeCreateModal();
}

/* ============================================================
   EXPENSE MODAL — registrar um gasto em um envelope
============================================================ */

// Guarda qual envelope está sendo editado enquanto o modal está aberto.
// O modal é único na tela, então precisamos saber a quem se refere.
let _currentEnvelopeId = null;

// Preenche o modal com info do envelope alvo e abre.
function openExpenseModal(envId) {
  const data = storage_load();
  const env  = data.envelopes.find(e => e.id === envId);
  if (!env) return;

  _currentEnvelopeId = envId;
  const remaining = env.value - env.spent;

  document.getElementById("expense-modal-title").textContent = `Registrar Gasto — ${env.name}`;
  document.getElementById("expense-remaining").textContent   = fmt(remaining);
  document.getElementById("expense-desc").value  = "";
  document.getElementById("expense-value").value = "";
  document.getElementById("expense-error").textContent = "";
  document.getElementById("expense-error").className   = "modal-error";
  document.getElementById("modal-expense").classList.add("open");
  document.getElementById("expense-desc").focus();
}

// Fecha o modal e zera a referência do envelope ativo.
function closeExpenseModal() {
  document.getElementById("modal-expense").classList.remove("open");
  _currentEnvelopeId = null;
}

// Valida e registra o gasto no envelope alvo.
// Acrescenta o gasto no histórico (mais recente primeiro) e soma no `spent`.
function submitExpense() {
  if (!_currentEnvelopeId) return;

  const desc   = document.getElementById("expense-desc").value.trim();
  const raw    = document.getElementById("expense-value").value.replace(",", ".");
  const amount = parseFloat(raw);
  const errEl  = document.getElementById("expense-error");

  const showErr = msg => { errEl.textContent = msg; errEl.className = "modal-error show"; };

  if (!desc) { showErr("Informe uma descrição para o gasto."); return; }

  const data = storage_load();
  const env  = data.envelopes.find(e => e.id === _currentEnvelopeId);
  if (!env) { showErr("Envelope não encontrado."); return; }

  // Regra de negócio: não pode gastar mais do que o saldo disponível
  const v = validacoes_expense(env, amount);
  if (!v.valid) { showErr(v.msg); return; }

  // Atualiza o envelope
  env.spent += amount;
  env.expenses.unshift({          // unshift = adiciona no INÍCIO (mais recente primeiro)
    id: Date.now().toString(),
    description: desc,
    amount,
    date: new Date().toISOString()
  });

  storage_save(data);
  renderizacao_all(data);
  closeExpenseModal();
}

/* ============================================================
   ENVELOPE ACTIONS — excluir envelope e alternar histórico
============================================================ */

// Exclui o envelope pelo id, com confirm() nativo do navegador.
function deleteEnvelope(envId) {
  const data = storage_load();
  const env  = data.envelopes.find(e => e.id === envId);
  if (!env) return;

  if (!confirm(`Excluir o envelope "${env.name}"? Os gastos registrados nele também serão removidos.`)) return;

  data.envelopes = data.envelopes.filter(e => e.id !== envId);
  storage_save(data);
  renderizacao_all(data);
}

// Mostra/esconde a lista de gastos de um envelope (acordeon simples via classe .open).
function toggleHistory(envId) {
  const box   = document.getElementById(`hist-${envId}`);
  const arrow = document.getElementById(`hist-arrow-${envId}`);
  if (!box) return;

  const open = box.classList.toggle("open");
  if (arrow) arrow.textContent = open ? "▴" : "▾";
}

/* ============================================================
   RESET — apagar tudo e voltar ao estado inicial
============================================================ */

// Abre o modal de confirmação (ação destrutiva).
function confirmReset() {
  document.getElementById("modal-reset").classList.add("open");
}

// Apaga o estado do localStorage e devolve a UI ao estado inicial
// (formulário de receita visível, app-content escondido, sem botão reset).
function doReset() {
  localStorage.removeItem(STORAGE_KEY);
  document.getElementById("modal-reset").classList.remove("open");

  // Volta para o estado inicial da interface
  document.getElementById("income-display").style.display = "none";
  document.getElementById("income-form").style.display    = "flex";
  document.getElementById("income-input").value = "";
  document.getElementById("app-content").style.display    = "none";
  document.getElementById("btn-reset").style.display      = "none";
}

/* ============================================================
   FECHAR MODAIS — clique fora do conteúdo OU tecla ESC
============================================================ */

// Clique no overlay (fora da caixa branca) fecha o modal.
// e.target === ov garante que o clique foi no fundo escuro, não dentro do modal.
document.querySelectorAll(".overlay").forEach(ov => {
  ov.addEventListener("click", e => {
    if (e.target === ov) ov.classList.remove("open");
  });
});

// Tecla ESC fecha qualquer modal que esteja aberto no momento.
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.querySelectorAll(".overlay.open").forEach(ov => ov.classList.remove("open"));
  }
});

/* ============================================================
   INICIALIZAÇÃO
   ------------------------------------------------------------
   Quando o DOM termina de carregar:
   - Se já existir receita salva → entra direto no modo "app"
   - Se não → mostra o formulário de receita (estado inicial)
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const data = storage_load();

  // Botão de reset começa escondido; só aparece após cadastrar receita
  document.getElementById("btn-reset").style.display = "none";

  if (data.income > 0) {
    // Já existe estado salvo: aplica direto (mostra valores, envelopes, etc.)
    applyIncome(data);
  } else {
    // Primeiro acesso (ou após reset): apenas o formulário de receita
    document.getElementById("income-form").style.display    = "flex";
    document.getElementById("income-display").style.display = "none";
    document.getElementById("app-content").style.display    = "none";
  }
});
