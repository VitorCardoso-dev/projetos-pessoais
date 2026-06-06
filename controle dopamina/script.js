/* ==========================================================================
       1. DADOS E CONFIGURAÇÕES INICIAIS
       ========================================================================== */
// Lista de hábitos padrão do sistema (Bons e Ruins) com suas respectivas pontuações
// Qualquer alteração feita aqui refletirá IMEDIATAMENTE ao atualizar a página!
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
    "🎁 RECOMPENSA BÔNUS: Descanço total por metade de um dia (Custo: 0 pts)"
];

/* ==========================================================================
       2. SINCRO-SISTEMA AUTOMÁTICO COM O CÓDIGO
       ========================================================================== */
// Buscamos o histórico atual da memória para não perder os pontos acumulados
const itensSalvosNoLS = JSON.parse(localStorage.getItem('itensHabitos')) || [];
const recompensasSalvasNoLS = JSON.parse(localStorage.getItem('itensRecompensas')) || [];

// Filtramos apenas os hábitos/recompensas criados manualmente por você através da tela do sistema
const idsPadraoHabitos = habitosPadrao.map(h => h.id);
const habitosPersonalizados = itensSalvosNoLS.filter(item => !idsPadraoHabitos.includes(item.id));

const idsPadraoRecompensas = recompensasPadrao.map(r => r.id);
const recompensasPersonalizadas = recompensasSalvasNoLS.filter(item => !idsPadraoRecompensas.includes(item.id));

// Montamos as listas finais trazendo SEMPRE o código atualizado + seus itens customizados da tela
let itensHabitos = [...JSON.parse(JSON.stringify(habitosPadrao)), ...habitosPersonalizados];
let itensRecompensas = [...JSON.parse(JSON.stringify(recompensasPadrao)), ...recompensasPersonalizadas];

// Gravamos as listas sincronizadas de volta na memória
localStorage.setItem('itensHabitos', JSON.stringify(itensHabitos));
localStorage.setItem('itensRecompensas', JSON.stringify(itensRecompensas));

// Inicializa as variáveis de pontuação coletando os registros salvos
let ganhos = parseInt(localStorage.getItem('ganhos')) || 0;
let perdas = parseInt(localStorage.getItem('perdas')) || 0;
let saldo = parseInt(localStorage.getItem('saldo')) || 0;

// Inicializa as variáveis numéricas dos contadores de combo
let comboEstudo = parseInt(localStorage.getItem('comboEstudo')) || 0;
let comboTreino = parseInt(localStorage.getItem('comboTreino')) || 0;
let comboLimpo = parseInt(localStorage.getItem('comboLimpo')) || 0;

// Inicializa o estado de recompensas bônus desbloqueadas
let bonusLiberado = localStorage.getItem('bonusLiberado') === 'true';
let textoBonusAtual = localStorage.getItem('textoBonusAtual') || "";

// Executa as renderizações obrigatórias para exibir as informações na tela assim que o app carrega
renderizarListas();
atualizarTela();

/* ==========================================================================
       3. FUNÇÕES DE INTERFACE E EXIBIÇÃO (DOM)
       ========================================================================== */

// Abre ou recolhe o menu que contém as listas de hábitos e contadores
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

// Mostra a caixa de marcação "Corrosivo" apenas se o usuário selecionar "Hábito Ruim" no formulário
function toggleOpcaoCorrosivo() {
    const tipo = document.getElementById('novo-tipo').value;
    document.getElementById('label-corrosivo').style.display = (tipo === 'ruim') ? 'inline-block' : 'none';
}

// Controla a exibição e ações do Cartão Customizado (Modal)
function mostrarCartao(mensagem, tipo, callbackSim) {
    const modal = document.getElementById('cartao-modal');
    const texto = document.getElementById('modal-texto');
    const btnCancelar = document.getElementById('modal-btn-cancelar');
    const btnConfirmar = document.getElementById('modal-btn-confirmar');

    texto.innerText = mensagem;
    modal.style.display = 'flex';

    if (tipo === 'alerta') {
        btnCancelar.style.display = 'none'; // Transforma em um aviso simples de OK
        btnConfirmar.innerText = 'OK';
        btnConfirmar.style.background = '#3b82f6';
        btnConfirmar.onclick = function() {
            modal.style.display = 'none';
        };
    } else if (tipo === 'confirmacao') {
        btnCancelar.style.display = 'inline-block'; // Mostra botão para desistir
        btnConfirmar.innerText = 'Confirmar';
        btnConfirmar.style.background = '#ef4444'; // Vermelho para chamar atenção
        
        btnConfirmar.onclick = function() {
            modal.style.display = 'none';
            if (callbackSim) callbackSim();
        };
        btnCancelar.onclick = function() {
            modal.style.display = 'none';
        };
    }
}

// Lê os campos do formulário para adicionar um novo hábito customizado ou uma nova recompensa na loja
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
        // Vincula de forma inteligente o hábito criado a canais específicos de combo baseado em palavras-chave
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

    // Limpa os campos de digitação do formulário após o salvamento bem-sucedido
    document.getElementById('novo-nome').value = "";
    document.getElementById('novo-valor').value = "";
    document.getElementById('novo-corrosivo').checked = false;

    // box-shadow permanente do navegador com as novas adições
    localStorage.setItem('itensHabitos', JSON.stringify(itensHabitos));
    localStorage.setItem('itensRecompensas', JSON.stringify(itensRecompensas));
    
    renderizarListas();
}

// Remove permanentemente um hábito da lista utilizando seu ID numérico único
function deletarHabito(id) {
    mostrarCartao("Tem certeza que deseja excluir permanentemente este hábito?", "confirmacao", () => {
        itensHabitos = itensHabitos.filter(item => item.id !== id);
        localStorage.setItem('itensHabitos', JSON.stringify(itensHabitos));
        renderizarListas();
    });
}

// Remove permanentemente uma recompensa da loja utilizando seu ID numérico único
function deletarRecompensa(id) {
    mostrarCartao("Tem certeza que deseja excluir permanentemente esta recompensa?", "confirmacao", () => {
        itensRecompensas = itensRecompensas.filter(item => item.id !== id);
        localStorage.setItem('itensRecompensas', JSON.stringify(itensRecompensas));
        renderizarListas();
    });
}

// Constrói dinamicamente os blocos HTML de cada item dentro de suas respectivas colunas visuais
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
            // Renderização especial diferenciada caso o hábito possua a propriedade corrosiva ativa
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

// Atualiza os textos numéricos de saldo, os números dos combos e a visibilidade dos banners bônus
function atualizarTela() {
    document.getElementById('soma-ganhos').innerText = ganhos + " pts";
    document.getElementById('soma-perdas').innerText = perdas + " pts";
    document.getElementById('saldo-final').innerText = saldo + " pts";
    
    document.getElementById('combo-estudo').innerText = comboEstudo;
    document.getElementById('combo-treino').innerText = comboTreino;
    document.getElementById('combo-limpo').innerText = comboLimpo;

    // Controla a exibição das seções escondidas da loja e do cabeçalho dedicadas ao prêmio bônus
    if (bonusLiberado) {
        document.getElementById('banner-bonus').style.display = 'flex'; 
        document.getElementById('item-bonus-loja').style.display = 'flex';
        document.getElementById('texto-bonus').innerText = textoBonusAtual;
    } else {
        document.getElementById('banner-bonus').style.display = 'none';
        document.getElementById('item-bonus-loja').style.display = 'none';
    }

    // Salva os estados atuais atualizados das pontuações na memória do navegador
    localStorage.setItem('ganhos', ganhos);
    localStorage.setItem('perdas', perdas);
    localStorage.setItem('saldo', saldo);
    localStorage.setItem('comboEstudo', comboEstudo);
    localStorage.setItem('comboTreino', comboTreino);
    localStorage.setItem('comboLimpo', comboLimpo);
    localStorage.setItem('bonusLiberado', bonusLiberado);
    localStorage.setItem('textoBonusAtual', textoBonusAtual);
}

/* ==========================================================================
       4. LÓGICA DOS COMBOS E REGRAS DE NEGÓCIO
       ========================================================================== */

// Gerencia o acionamento de um Hábito Bom, computando pontos e avançando marcas de constância
function cliqueHabitoBom(valor, canal) {
    ganhos += valor;
    
    if (canal === "estudo") {
        comboEstudo++;
        if (comboEstudo === 5) checarEAtivarBonus("Estudos");
    } else if (canal === "treino") {
        comboTreino++;
        if (comboTreino === 5) checarEAtivarBonus("Treino");
    } else if (canal === "limpo") {
        comboLimpo++;
        if (comboLimpo === 5) checarEAtivarBonus("Dias Limpos");
    }

    saldo = ganhos - perdas;
    atualizarTela();
}

// Sorteia aleatoriamente e ativa uma das super recompensas gratuitas caso o combo atinja a meta de 5 marcas
function checarEAtivarBonus(origem) {
    if (!bonusLiberado) {
        bonusLiberado = true;
        const indexAleatorio = Math.floor(Math.random() * recompensasBonusPool.length);
        textoBonusAtual = recompensasBonusPool[indexAleatorio];
        mostrarCartao(`🌟 Excelente! Combo de [${origem}] alcançou o nível 5! Nova Super Recompensa liberada de graça!`, "alerta");
    }
}

// Aplica apenas a perda de pontos de hábitos ruins comuns, sem falsos alarmes ou quebras indevidas de combo.
function cliqueHabitoRuim(valor) {
    perdas += valor;
    saldo = ganhos - perdas;
    atualizarTela();
}

// Gerencia a punição severa do Hábito Corrosivo: zera de forma irreversível todos os combos e corta o saldo atual pela metade
function cliqueHabitoCorrosivo() {
    mostrarCartao("Confirmar ocorrência de hábito corrosivo? Todos os seus combos zeram e você perde metade do saldo.", "confirmacao", () => {
        comboEstudo = 0;
        comboTreino = 0;
        comboLimpo = 0;
        bonusLiberado = false;
        textoBonusAtual = "";

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

// Consome pontos acumulados do saldo atual para adquirir uma das recompensas cadastradas na loja
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

// Consome e limpa o prêmio bônus obtido, redefinindo os marcadores de combo globais para recomeçar o ciclo de evolução
function gastarRecompensaBonus() {
    mostrarCartao("Aproveite seu super prêmio de constância!", "alerta", () => {
        bonusLiberado = false;
        textoBonusAtual = "";
        comboEstudo = 0;
        comboTreino = 0;
        comboLimpo = 0;
        atualizarTela();
    });
}

// Limpa apenas o histórico numérico de saldos e pontuações, preservando a lista de hábitos customizada intacta
function resetarSaldos() {
    mostrarCartao("Zerar apenas a pontuação, preservando os hábitos?", "confirmacao", () => {
        ganhos = 0;
        perdas = 0;
        saldo = 0;
        comboEstudo = 0;
        comboTreino = 0;
        comboLimpo = 0;
        bonusLiberado = false;
        textoBonusAtual = "";
        atualizarTela();
    });
}

// Redefine totalmente a lista de itens ativos trazendo de volta as configurações padrão de fábrica registradas no topo do arquivo
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