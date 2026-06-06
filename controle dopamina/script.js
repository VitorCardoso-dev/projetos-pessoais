/* ==========================================================================
       1. DADOS E CONFIGURAÇÕES INICIAIS
       ========================================================================== */
// Lista de hábitos padrão do sistema (Bons e Ruins) com suas respectivas pontuações
const habitosPadrao = [
    { id: 1, nome: "Estudar (blocos diarios completos)", valor: 15, tipo: "bom", corrosivo: false, canal: "estudo" },
    { id: 2, nome: "Treino / Atividade Física", valor: 15, tipo: "bom", corrosivo: false, canal: "treino" },
    { id: 3, nome: "Ficar limpo de vícios", valor: 20, tipo: "bom", corrosivo: false, canal: "limpo" },
    { id: 4, nome: "Alimentação Saudável", valor: 15, tipo: "bom", corrosivo: false, canal: "nenhum" },
    { id: 5, nome: "Escovar os dentes 3x ao dia", valor: 15, tipo: "bom", corrosivo: false, canal: "nenhum" },
    { id: 12, nome: "Limpar o rosto", valor: 5, tipo: "bom", corrosivo: false, canal: "nenhum" },
    { id: 13, nome: "Dormir cedo", valor: 10, tipo: "bom", corrosivo: false, canal: "nenhum" },
    { id: 14, nome: "Leitura (10 páginas)", valor: 10, tipo: "bom", corrosivo: false, canal: "nenhum" },
    
    // Maus Hábitos
    { id: 6, nome: "Excesso de Celular", valor: 20, tipo: "ruim", corrosivo: false, canal: "nenhum" },
    { id: 7, nome: "Doces / Má Alimentação", valor: 25, tipo: "ruim", corrosivo: false, canal: "nenhum" },
    { id: 8, nome: "Filme/Série antes da hora", valor: 30, tipo: "ruim", corrosivo: false, canal: "nenhum" },
    { id: 9, nome: "Jogar muito / Fora de hora", valor: 20, tipo: "ruim", corrosivo: false, canal: "nenhum" },
    { id: 10, nome: "Não escovar os dentes", valor: 10, tipo: "ruim", corrosivo: false, canal: "nenhum" },
    { id: 11, nome: "Recaída em conteúdos adultos", valor: 0, tipo: "ruim", corrosivo: true, canal: "nenhum" }
];

// Lista de recompensas padrão disponíveis para troca na loja
const recompensasPadrao = [
    { id: 101, nome: "Ver Série/Filme à noite", custo: 20 },
    { id: 102, nome: "Jogar Videogame (1 hora)", custo: 40 },
    { id: 103, nome: "Sair para algum canto", custo: 80 },
];

// Pool de super recompensas que são sorteadas gratuitamente ao atingir combos de nível 5
const recompensasBonusPool = [
    "🎁 RECOMPENSA BÔNUS: Super Saída / Dia de Folga (Custo: 0 pts)",
    "🎁 RECOMPENSA BÔNUS: Comer sua refeição favorita livre (Custo: 0 pts)",
    "🎁 RECOMPENSA BÔNUS: +2 Horas de Jogos ou Filmes (Custo: 0 pts)",
    "🎁 RECOMPENSA BÔNUS: Comprar um presente pessoal (Custo: 0 pts)",
    "🎁 RECOMPENSA BÔNUS: Descanso total por metade de um dia (Custo: 0 pts)"
];

/* ==========================================================================
       2. SINCRO-SISTEMA AUTOMÁTICO COM O CÓDIGO
       ========================================================================== */
const itensSalvosNoLS = JSON.parse(localStorage.getItem('itensHabitos')) || [];
const recompensasSalvasNoLS = JSON.parse(localStorage.getItem('itensRecompensas')) || [];

const idsPadraoHabitos = habitosPadrao.map(h => h.id);
const habitosPersonalizados = itensSalvosNoLS.filter(item => !idsPadraoHabitos.includes(item.id));

const idsPadraoRecompensas = recompensasPadrao.map(r => r.id);
const recompensasPersonalizadas = recompensasSalvasNoLS.filter(item => !idsPadraoRecompensas.includes(item.id));

let itensHabitos = [...JSON.parse(JSON.stringify(habitosPadrao)), ...habitosPersonalizados];
let itensRecompensas = [...JSON.parse(JSON.stringify(recompensasPadrao)), ...recompensasPersonalizadas];

localStorage.setItem('itensHabitos', JSON.stringify(itensHabitos));
localStorage.setItem('itensRecompensas', JSON.stringify(itensRecompensas));

let ganhos = parseInt(localStorage.getItem('ganhos')) || 0;
let perdas = parseInt(localStorage.getItem('perdas')) || 0;
let saldo = parseInt(localStorage.getItem('saldo')) || 0;

let comboEstudo = parseInt(localStorage.getItem('comboEstudo')) || 0;
let comboTreino = parseInt(localStorage.getItem('comboTreino')) || 0;
let comboLimpo = parseInt(localStorage.getItem('comboLimpo')) || 0;

// Inicializa a lista de bônus acumulados ativos como Array
let bonusesAtivos = JSON.parse(localStorage.getItem('bonusesAtivos')) || [];

renderizarListas();
atualizarTela();

/* ==========================================================================
       3. FUNÇÕES DE INTERFACE E EXIBIÇÃO (DOM)
       ========================================================================== */
function togglePainelAtividades() {
    const painel = document.getElementById('painel-atividades-retratil');
    const btn = document.getElementById('btn-toggle-painel');
    if(painel.style.display === 'none') {
        painel.style.display = 'block';
        btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Ocultar Atividades e Constâncias';
    } else {
        painel.style.display = 'none';
        btn.innerHTML = '<i class="fa-solid fa-eye"></i> Ver Hábitos e Constâncias';
    }
}

function toggleOpcaoCorrosivo() {
    const tipo = document.getElementById('novo-tipo').value;
    document.getElementById('label-corrosivo').style.display = (tipo === 'ruim') ? 'inline-block' : 'none';
}

// Controla a exibição e ações do seu Cartão Customizado Animado (Modal)
function mostrarCartao(mensagem, tipo, callbackSim) {
    const modal = document.getElementById('cartao-modal');
    const texto = document.getElementById('modal-texto');
    const btnCancelar = document.getElementById('modal-btn-cancelar');
    const btnConfirmar = document.getElementById('modal-btn-confirmar');

    texto.innerText = mensagem;
    modal.style.display = 'flex';

    if (tipo === 'alerta') {
        btnCancelar.style.display = 'none'; 
        btnConfirmar.innerText = 'OK';
        btnConfirmar.style.background = '#3b82f6';
        btnConfirmar.onclick = function() {
            modal.style.display = 'none';
            if (callbackSim) callbackSim(); 
        };
    } else if (tipo === 'confirmacao') {
        btnCancelar.style.display = 'inline-block'; 
        btnConfirmar.innerText = 'Confirmar';
        btnConfirmar.style.background = '#ef4444'; 
        
        btnConfirmar.onclick = function() {
            modal.style.display = 'none';
            if (callbackSim) callbackSim();
        };
        btnCancelar.onclick = function() {
            modal.style.display = 'none';
        };
    }
}

function criarItemPersonalizado() {
    const nome = document.getElementById('novo-nome').value.trim();
    const valor = parseInt(document.getElementById('novo-valor').value);
    const tipo = document.getElementById('novo-tipo').value;
    const ehCorrosivo = document.getElementById('novo-corrosivo').checked;

    if (!nome || isNaN(valor) || valor <= 0) {
        mostrarCartao("Por favor, preencha o nome e um valor em pontos válido.", "alerta");
        return;
    }

    if (tipo === 'recompensa') {
        itensRecompensas.push({ id: Date.now(), nome: nome, custo: valor });
    } else {
        let canalIdentificado = "nenhum";
        if (nome.toLowerCase().includes("estud")) canalIdentificado = "estudo";
        else if (nome.toLowerCase().includes("trein")) canalIdentificado = "treino";
        else if (nome.toLowerCase().includes("limp")) canalIdentificado = "limpo";

        itensHabitos.push({
            id: Date.now(),
            nome: nome,
            valor: valor,
            tipo: tipo,
            corrosivo: (tipo === 'ruim' && ehCorrosivo),
            canal: canalIdentificado
        });
    }

    document.getElementById('novo-nome').value = "";
    document.getElementById('novo-valor').value = "";
    document.getElementById('novo-corrosivo').checked = false;

    localStorage.setItem('itensHabitos', JSON.stringify(itensHabitos));
    localStorage.setItem('itensRecompensas', JSON.stringify(itensRecompensas));
    
    renderizarListas();
}

function deletarHabito(id) {
    mostrarCartao("Tem certeza que deseja excluir permanentemente este hábito?", "confirmacao", () => {
        itensHabitos = itensHabitos.filter(item => item.id !== id);
        localStorage.setItem('itensHabitos', JSON.stringify(itensHabitos));
        renderizarListas();
    });
}

function deletarRecompensa(id) {
    mostrarCartao("Tem certeza que deseja excluir permanentemente esta recompensa?", "confirmacao", () => {
        itensRecompensas = itensRecompensas.filter(item => item.id !== id);
        localStorage.setItem('itensRecompensas', JSON.stringify(itensRecompensas));
        renderizarListas();
    });
}

function renderizarListas() {
    const listaBons = document.getElementById('lista-bons');
    const listaRuins = document.getElementById('lista-ruins');
    const listaRecs = document.getElementById('lista-recompensas');

    listaBons.innerHTML = '';
    listaRuins.innerHTML = '';
    listaRecs.innerHTML = '';

    itensHabitos.forEach(item => {
        const div = document.createElement('div');
        div.className = 'linha-habito';
        
        if (item.tipo === 'bom') {
            div.innerHTML = `
                <span class="texto-item">${item.nome} (+${item.valor} pts)</span>
                <div class="botoes-acoes">
                    <button class="btn-add" onclick="cliqueHabitoBom(${item.valor}, '${item.canal}')"><i class="fa-solid fa-plus"></i></button>
                    <button class="btn-delete" onclick="deletarHabito(${item.id})"><i class="fa-solid fa-trash"></i></button>
                </div>`;
            listaBons.appendChild(div);
        } else {
            if (item.corrosivo) {
                div.style.background = '#fff5f5';
                div.style.padding = '6px 8px';
                div.style.borderRadius = '4px';
                div.innerHTML = `
                    <span class="texto-item" style="color: #c5221f; font-weight: bold;">${item.nome}</span>
                    <div class="botoes-acoes">
                        <button class="corrosivo" onclick="cliqueHabitoCorrosivo()"><i class="fa-solid fa-skull"></i> Ativar</button>
                        <button class="btn-delete" onclick="deletarHabito(${item.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>`;
            } else {
                div.innerHTML = `
                    <span class="texto-item">${item.nome} (-${item.valor} pts)</span>
                    <div class="botoes-acoes">
                        <button class="btn-sub" onclick="cliqueHabitoRuim(${item.valor})"><i class="fa-solid fa-minus"></i></button>
                        <button class="btn-delete" onclick="deletarHabito(${item.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>`;
            }
            listaRuins.appendChild(div);
        }
    });

    itensRecompensas.forEach(item => {
        const div = document.createElement('div');
        div.className = 'linha-habito';
        div.innerHTML = `
            <span class="texto-item">${item.nome} (Custo: ${item.custo} pts)</span>
            <div class="botoes-acoes">
                <button class="btn-gastar" onclick="gastarPontos(${item.custo})"><i class="fa-solid fa-cart-shopping"></i> Gastar</button>
                <button class="btn-delete" onclick="deletarRecompensa(${item.id})"><i class="fa-solid fa-trash"></i></button>
            </div>`;
        listaRecs.appendChild(div);
    });
}

function atualizarTela() {
    document.getElementById('soma-ganhos').innerText = ganhos + " pts";
    document.getElementById('soma-perdas').innerText = perdas + " pts";
    document.getElementById('saldo-final').innerText = saldo + " pts";
    
    document.getElementById('combo-estudo').innerText = comboEstudo;
    document.getElementById('combo-treino').innerText = comboTreino;
    document.getElementById('combo-limpo').innerText = comboLimpo;

    const containerBonusLoja = document.getElementById('item-bonus-loja');

    // CONSERTADO: Transforma a área de bônus em cartões independentes e empilhados verticalmente
    if (bonusesAtivos.length > 0) {
        document.getElementById('banner-bonus').style.display = 'flex'; 
        containerBonusLoja.style.display = 'block'; 
        containerBonusLoja.style.background = 'transparent'; 
        containerBonusLoja.style.padding = '0';
        containerBonusLoja.style.border = 'none';
        containerBonusLoja.style.boxShadow = 'none';
        
        // Mapeia o array criando um cartão físico individual para cada bônus conquistado
        containerBonusLoja.innerHTML = bonusesAtivos.map((bonus, index) => `
            <div class="linha-habito" style="background: #fef3c7; padding: 12px 15px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #f59e0b; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <span class="texto-item" style="font-weight: bold; color: #92400e; font-size: 14px;">${bonus}</span>
                <div class="botoes-acoes">
                    <button class="btn-gastar" style="background: #f59e0b; color: white; padding: 6px 12px; border-radius: 4px; border: none; cursor: pointer;" onclick="gastarRecompensaBonus(${index})">
                        <i class="fa-solid fa-star"></i> Resgatar
                    </button>
                </div>
            </div>
        `).join('');
    } else {
        document.getElementById('banner-bonus').style.display = 'none';
        containerBonusLoja.style.display = 'none';
        containerBonusLoja.innerHTML = '';
    }

    localStorage.setItem('ganhos', ganhos);
    localStorage.setItem('perdas', perdas);
    localStorage.setItem('saldo', saldo);
    localStorage.setItem('comboEstudo', comboEstudo);
    localStorage.setItem('comboTreino', comboTreino);
    localStorage.setItem('comboLimpo', comboLimpo);
    localStorage.setItem('bonusesAtivos', JSON.stringify(bonusesAtivos));
}

/* ==========================================================================
       4. LÓGICA DOS COMBOS E REGRAS DE NEGÓCIO
       ========================================================================== */
function cliqueHabitoBom(valor, canal) {
    ganhos += valor;
    
    if (canal === "estudo") {
        comboEstudo++;
        if (comboEstudo % 5 === 0) checarEAtivarBonus("Estudos");
    } else if (canal === "treino") {
        comboTreino++;
        if (comboTreino % 5 === 0) checarEAtivarBonus("Treino");
    } else if (canal === "limpo") {
        comboLimpo++;
        if (comboLimpo % 5 === 0) checarEAtivarBonus("Dias Limpos");
    }

    saldo = ganhos - perdas;
    atualizarTela();
}

function checarEAtivarBonus(origem) {
    const indexAleatorio = Math.floor(Math.random() * recompensasBonusPool.length);
    const novaRecompensa = recompensasBonusPool[indexAleatorio];
    
    bonusesAtivos.push(novaRecompensa);
    atualizarTela();
    
    // Dispara o bônus usando o seu cartão animado!
    mostrarCartao(`🌟 Excelente! Combo de [${origem}] alcançou mais um nível 5! Nova Super Recompensa liberada e acumulada de graça!`, "alerta");
}

function cliqueHabitoRuim(valor) {
    perdas += valor;
    saldo = ganhos - perdas;
    atualizarTela();
}

function cliqueHabitoCorrosivo() {
    mostrarCartao("Confirmar ocorrência de hábito corrosivo? Todos os seus combos zeram e você perde metade do saldo.", "confirmacao", () => {
        comboEstudo = 0;
        comboTreino = 0;
        comboLimpo = 0;
        bonusesAtivos = []; 

        if (saldo > 0) {
            let perdaCorrosiva = Math.floor(saldo / 2);
            perdas += perdaCorrosiva;
        } else {
            perdas += 50; 
        }
        saldo = ganhos - perdas;
        atualizarTela();
    });
}

function gastarPontos(custo) {
    if (saldo >= custo) {
        perdas += custo;
        saldo = ganhos - perdas;
        atualizarTela();
        mostrarCartao("Recompensa resgatada com sucesso!", "alerta");
    } else {
        mostrarCartao("Saldo insuficiente para esta recompensa!", "alerta");
    }
}

// CONSERTADO: Aplica o alerta animado ao bônus correto e remove apenas ele ao clicar em OK
function gastarRecompensaBonus(index) {
    mostrarCartao("Aproveite seu super prêmio de constância!", "alerta", () => {
        bonusesAtivos.splice(index, 1); 
        atualizarTela();
    });
}

function resetarSaldos() {
    mostrarCartao("Zerar apenas a pontuação, preservando os hábitos?", "confirmacao", () => {
        ganhos = 0;
        perdas = 0;
        saldo = 0;
        comboEstudo = 0;
        comboTreino = 0;
        comboLimpo = 0;
        bonusesAtivos = [];
        atualizarTela();
    });
}

function resetarTudo() {
    mostrarCartao("Restaurar lista para o padrão inicial? Seus pontos não sumirão.", "confirmacao", () => {
        itensHabitos = JSON.parse(JSON.stringify(habitosPadrao));
        itensRecompensas = JSON.parse(JSON.stringify(recompensasPadrao));
        localStorage.setItem('itensHabitos', JSON.stringify(itensHabitos));
        localStorage.setItem('itensRecompensas', JSON.stringify(itensRecompensas));
        renderizarListas();
        atualizarTela();
        mostrarCartao("Lista de hábitos restaurada!", "alerta");
    });
}