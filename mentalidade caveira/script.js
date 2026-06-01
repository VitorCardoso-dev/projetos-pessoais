//SCRIPT PARA A ANIMAÇÃO DE ENTRADA DE ELEMENTOS NA TELA (FADE IN + SLIDE UP)

document.addEventListener("DOMContentLoaded", () => {
    // === ADICIONADO: FECHAR MENU AO CLICAR EM UM LINK ===
    const linksMenu = document.querySelectorAll('nav a');
    const checkboxMenu = document.getElementById('menu-check');

    linksMenu.forEach(link => {
        link.addEventListener('click', () => {
            checkboxMenu.checked = false; // Fecha o menu tirando o 'check'
        });
    });

    // === SEU SCRIPT DE ANIMAÇÃO EXISTENTE ===
    const fadeEls = document.querySelectorAll('.sobre, .card-funcao, .beneficios-item, .video-container-premium, .texto-introducao');
    
    fadeEls.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
    });

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const target = e.target;
                
                target.style.opacity = '1';
                target.style.transform = 'translateY(0)';
                
                setTimeout(() => {
                    target.style.transform = '';
                    target.style.transition = '';
                    target.style.opacity = '1'; 
                }, 800);

                fadeObserver.unobserve(target);
            }
        });
    }, { threshold: 0.10 });

    fadeEls.forEach(el => fadeObserver.observe(el));
});



//SCRIPT PARA A PAGINA ROTINA DIÁRIA E DESAFIOS


document.addEventListener("DOMContentLoaded", () => {
            // MATRIZ COMPLETA DE DESAFIOS
            const dicionarioDesafios = {
                "i1": { titulo: "Hidratação Constante", nivel: "Iniciante", regras: ["Beber 2.5 litros de água pura todos os dias.", "Gatilho: Manter garrafa cheia visível na mesa."], conquistas: ["Otimização metabólica primária."], nomeHabito: "Choque Hídrico Diário" },
                "i2": { titulo: "Alvorada Limpa", nivel: "Iniciante", regras: ["Arrumar a cama imediatamente após levantar da cama.", "Proibido deixar objetos jogados no chão do quarto."], conquistas: ["Organização mental imediata."], nomeHabito: "Ambiente Organizado" },
                "i3": { titulo: "Leitura de Ignição", nivel: "Iniciante", regras: ["Ler exatamente 5 páginas de um livro útil por dia.", "Horário fixo determinado pelo usuário."], conquistas: ["Sustentação do foco cognitivo."], nomeHabito: "Leitura Mínima Executada" },
                "i4": { titulo: "Postura Operacional", nivel: "Iniciante", regras: ["Ajustar a coluna conscientemente sempre que sentar.", "Proibido trabalhar curvado."], conquistas: ["Consciência corporal ativa."], nomeHabito: "Postura Sob Controle" },
                "m1": { titulo: "Mobilidade e Ativação", nivel: "Intermediario", regras: ["Executar 10 minutos de alongamentos logo ao acordar.", "Foco em destravar articulações fundamentais."], conquistas: ["Melhor amplitude mecânica matinal."], nomeHabito: "Mobilidade Cumprida" },
                "m2": { titulo: "Constancia de Passos", nivel: "Intermediario", regras: ["Atingir a marca mínima de 7.500 passos todos os dias.", "Substituir elevadores curtos por escadas comuns."], conquistas: ["Tônus cardiovascular basal estimulado."], nomeHabito: "Passos Concluídos" },
                "m3": { titulo: "Blackout Digital Noturno", nivel: "Intermediario", regras: ["Desconectar de smartphones e notebooks 30 minutos antes de dormir.", "Leitura analógica ou meditação liberadas."], conquistas: ["Profundidade e reparação biológica do sono."], nomeHabito: "Blackout Pré-Sono" },
                "m4": { titulo: "Mapeamento de Gratidão", nivel: "Intermediario", regras: ["Escrever 3 pontos construtivos que deram certo no seu dia à noite.", "Uso de caderno físico ou bloco de notas técnico."], conquistas: ["Redução de ansiedade analítica."], nomeHabito: "Pontos do Dia Mapeados" },
                "a1": { titulo: "Foco Profundo (Deep Work)", nivel: "Avançado", regras: ["Executar bloco isolado de 2 horas de trabalho ou estudo de elite.", "Celular desligado ou em outro cômodo durante o bloco."], conquistas: ["Produção hiperfocada livre de ruídos."], nomeHabito: "Bloco Deep Work Feito" },
                "a2": { titulo: "Resiliencia Termica Total", nivel: "Avançado", regras: ["Terminar o banho diário com pelo menos 2 minutos de água 100% fria.", "Proibido recuar ou encurtar o tempo."], conquistas: ["Controle imediato sobre o conforto volitivo."], nomeHabito: "Choque Térmico Efetuado" },
                "a3": { titulo: "Corte de Estímulos Baratos", nivel: "Avançado", regras: ["Zero consumo de redes de vídeo infinito rápido (Shorts/Reels).", "Proibido jogos de gratificação imediata."], conquistas: ["Restauração de receptores dopaminérgicos."], nomeHabito: "Jejum Dopaminérgico Ativo" },
                "a4": { titulo: "Estrategia Antecipada", nivel: "Avançado", regras: ["Escrever o planejamento do dia EM DESTAQUE antes de deitar.", "Definir as 3 tarefas prioritárias inegociáveis."], conquistas: ["Eliminação da parálise de decisão matinal."], nomeHabito: "Dia Seguinte Planejado" }
            };

            let desafioSelecionadoId = null;
            const abas = document.querySelectorAll('.btn-aba-patamar');
            const gruposContainers = document.querySelectorAll('.grupo-desafios-container');
            const cardsDesafio = document.querySelectorAll('.opcao-desafio');
            const painelForm = document.getElementById('form-desafio');
            const formTitulo = document.getElementById('form-titulo-desafio');
            const formRegras = document.getElementById('form-regras-lista');
            const formConquistas = document.getElementById('form-conquistas-lista');
            const inputDataInicio = document.getElementById('data-inicio-desafio');
            const containerDesafioAlocado = document.getElementById('container-desafio-alocado-espaco');
            const msgSemDesafio = document.getElementById('msg-sem-desafio-ativo');
            
            // Seletores dos Banners
            const bannerSemanal = document.getElementById('banner-semanal-ok');
            const bannerRotina = document.getElementById('banner-rotina-ok');

            inputDataInicio.value = new Date().toISOString().split('T')[0];

            // 1. ENGINE DE FILTRAGEM POR ABAS TÁTICAS
            abas.forEach(aba => {
                aba.addEventListener('click', () => {
                    abas.forEach(a => a.classList.remove('active'));
                    gruposContainers.forEach(g => g.classList.remove('active'));

                    aba.classList.add('active');
                    const targetId = aba.getAttribute('data-target');
                    document.getElementById(`container-${targetId}`).classList.add('active');

                    // Fecha o formulario de ativação ao mudar de nível para manter a tela limpa
                    painelForm.style.display = "none";
                    cardsDesafio.forEach(c => c.classList.remove('selecionado'));
                });
            });

            // 2. DETALHAR APENAS APOS O CLIQUE NO CARD DO DESAFIO
            cardsDesafio.forEach(card => {
                card.addEventListener('click', () => {
                    cardsDesafio.forEach(c => c.classList.remove('selecionado'));
                    card.classList.add('selecionado');

                    desafioSelecionadoId = card.getAttribute('data-id');
                    const dados = dicionarioDesafios[desafioSelecionadoId];

                    formTitulo.innerHTML = `DIRETRIZ ATIVAÇÃO: <span style="color:var(--tactical-red);">${dados.titulo.toUpperCase()} (${dados.nivel.toUpperCase()})</span>`;
                    formRegras.innerHTML = dados.regras.map(r => `<li>${r}</li>`).join('');
                    formConquistas.innerHTML = dados.conquistas.map(c => `<li>${c}</li>`).join('');

                    painelForm.style.display = "block";
                    painelForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                });
            });

            //  ALOCAR DESAFIO E EXECUTAR JANELA DE TEMPO AUTOMÁTICA
            document.getElementById('btn-engajar-desafio').addEventListener('click', () => {
                if (!desafioSelecionadoId) return;

                if (msgSemDesafio) msgSemDesafio.style.display = "none";

                const dados = dicionarioDesafios[desafioSelecionadoId];

                // Calculo automatico: Terrmino exato 7 dias depois
                const dataInicioRaw = new Date(inputDataInicio.value + "T00:00:00");
                const dataFimRaw = new Date(dataInicioRaw);
                dataFimRaw.setDate(dataInicioRaw.getDate() + 7);

                const formatarData = (d) => d.toLocaleDateString('pt-BR');

                const htmlDesafioAtivo = `
                    <div id="item-desafio-ativo">
                        <div style="margin-bottom:12px;">
                            <span class="badge-desafio-alocado">${dados.nivel.toUpperCase()}</span>
                            <h3 style="font-family:'Oswald'; text-transform:uppercase; font-size:1.2rem; margin-top:5px;">${dados.titulo}</h3>
                            <p style="font-size:0.85rem; color:var(--text-muted);">${dados.regras[0]}</p>
                            <div class="data-container-desafio"><i class="fa-solid fa-calendar-days"></i> JANELA: ${formatarData(dataInicioRaw)} até ${formatarData(dataFimRaw)}</div>
                        </div>
                        
                        <div class="grid-dias-desafio">
                            ${Array.from({length: 7}, (_, i) => `
                                <div class="dia-box" data-dia="${i+1}">
                                    <span>DIA 0${i+1}</span>
                                    <input type="checkbox" class="desafio-dia-check">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                containerDesafioAlocado.innerHTML = htmlDesafioAtivo;
                configurarEventosDesafioExclusivo();
                calcularProgressoDesafioExclusivo();

                // Recolhe o painel para otimizar espaço
                painelForm.style.display = "none";
                cardsDesafio.forEach(c => c.classList.remove('selecionado'));
            });

            function configurarEventosDesafioExclusivo() {
                const boxes = document.querySelectorAll('.dia-box');
                boxes.forEach(box => {
                    box.addEventListener('click', (e) => {
                        const checkbox = box.querySelector('.desafio-dia-check');
                        if (e.target.tagName !== 'INPUT') {
                            checkbox.checked = !checkbox.checked;
                        }
                        if (checkbox.checked) box.classList.add('concluido');
                        else box.classList.remove('concluido');
                        
                        calcularProgressoDesafioExclusivo();
                    });
                });

                document.querySelectorAll('.desafio-dia-check').forEach(check => {
                    check.addEventListener('change', (e) => {
                        const box = e.target.closest('.dia-box');
                        if (e.target.checked) box.classList.add('concluido');
                        else box.classList.remove('concluido');
                        calcularProgressoDesafioExclusivo();
                    });
                });
            }

            function calcularProgressoDesafioExclusivo() {
                const checks = document.querySelectorAll('.desafio-dia-check');
                const barra = document.getElementById('barra-desafio-exclusiva');
                const texto = document.getElementById('texto-desafio-exclusivo');

                let diasMarcados = 0;
                checks.forEach(c => { if(c.checked) diasMarcados++; });

                const totalDias = 7;
                const porcentagem = totalDias > 0 ? Math.round((diasMarcados / totalDias) * 100) : 0;

                if (barra) barra.style.width = `${porcentagem}%`;
                if (texto) texto.textContent = `${porcentagem}% CONCLUÍDO (${diasMarcados}/7 DIAS)`;

                // MONITORAMENTO DO BANNER SEMANAL + TIMEOUT DE AUTODISMISS (5 SEGUNDOS)
                if (bannerSemanal) {
                    if (porcentagem === 100 && checks.length > 0) {
                        if (!bannerSemanal.classList.contains('ativo')) {
                            bannerSemanal.classList.add('ativo');
                            setTimeout(() => {
                                bannerSemanal.classList.remove('ativo');
                            }, 5000); 
                        }
                    } else {
                        bannerSemanal.classList.remove('ativo');
                    }
                }
            }

            // 4. CRIAÇÃO DE HÁBITOS E DIVISÃO CRONOLÓGICA DIÁRIA
            document.getElementById('btn-salvar-habito').addEventListener('click', () => {
                const nome = document.getElementById('novo-habito-nome').value.trim();
                const desc = document.getElementById('novo-habito-desc').value.trim();
                const periodo = document.getElementById('novo-habito-periodo').value;

                if (!nome) {
                    alert("Defina o nome da atividade para prosseguir.");
                    return;
                }

                let targetContainer, msgRemover;

                if (periodo === "Manhã") {
                    targetContainer = document.getElementById('custom-container-manha');
                    msgRemover = document.getElementById('vazio-manha');
                } else if (periodo === "Tarde") {
                    targetContainer = document.getElementById('custom-container-tarde');
                    msgRemover = document.getElementById('vazio-tarde');
                } else {
                    targetContainer = document.getElementById('custom-container-noite');
                    msgRemover = document.getElementById('vazio-noite');
                }

                if (msgRemover) msgRemover.style.display = "none";

                const itemHtml = `
                    <div class="check-item">
                        <input type="checkbox" class="habito-check">
                        <div class="check-item-info">
                            <h4>${nome} <span class="badge-periodo">${periodo}</span></h4>
                            <p>${desc ? desc : 'Hábito de rotina diária recorrente.'}</p>
                        </div>
                    </div>
                `;

                targetContainer.insertAdjacentHTML('beforeend', itemHtml);

                document.getElementById('novo-habito-nome').value = '';
                document.getElementById('novo-habito-desc').value = '';

                configurarEventosChecklistGeral();
                calcularProgressoGeral();
            });

            function calcularProgressoGeral() {
                const checks = document.querySelectorAll('.habito-check');
                const barra = document.getElementById('barra-habitos');
                const textoBarra = document.getElementById('texto-habitos');

                let marcados = 0;
                checks.forEach(check => {
                    const card = check.closest('.check-item');
                    if (check.checked) {
                        marcados++;
                        card.classList.add('completo');
                    } else {
                        card.classList.remove('completo');
                    }
                });

                const total = checks.length;
                const porridge = total > 0 ? Math.round((marcados / total) * 100) : 0;

                if (barra) barra.style.width = `${porridge}%`;
                if (textoBarra) textoBarra.textContent = `${porridge}% COMPLETO`;

                // MONITORAMENTO DO BANNER DIÁRIO + TIMEOUT DE AUTODISMISS (5 SEGUNDOS)
                if (bannerRotina) {
                    if (porridge === 100 && total > 0) {
                        if (!bannerRotina.classList.contains('ativo')) {
                            bannerRotina.classList.add('ativo');
                            setTimeout(() => {
                                bannerRotina.classList.remove('ativo');
                            }, 5000);
                        }
                    } else {
                        bannerRotina.classList.remove('ativo');
                    }
                }
            }

            function configurarEventosChecklistGeral() {
                document.querySelectorAll('.habito-check').forEach(check => {
                    const item = check.closest('.check-item');
                    const novoItem = item.cloneNode(true);
                    item.parentNode.replaceChild(novoItem, item);
                });

                document.querySelectorAll('.check-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        const checkbox = item.querySelector('.habito-check');
                        if (e.target.tagName !== 'INPUT') {
                            checkbox.checked = !checkbox.checked;
                        }
                        calcularProgressoGeral();
                    });
                });

                document.querySelectorAll('.habito-check').forEach(check => {
                    check.addEventListener('change', calcularProgressoGeral);
                });
            }

            configurarEventosChecklistGeral();
        });

        //Script para a pagina de DESAFIOS e TREINOS
        
        document.addEventListener("DOMContentLoaded", () => {
            let exerciciosTemporarios = [];
            
            // Estrutura hierárquica para empilhar múltiplos treinos contendo seus exercícios
            let missaoAtiva = []; 
            let dataMissaoAtiva = ''; 
            let diasSeguidos = 0;
            
            const modelosMilitares = {
                iniciante: [
                    { nome: "Corrida de Resistência (TAF)", series: "1", reps: "15 min" },
                    { nome: "Flexões Padrão Militar", series: "3", reps: "12" },
                    { nome: "Abdominais Remador", series: "3", reps: "15" },
                    { nome: "Agachamento Livre (Squat)", series: "3", reps: "20" }
                ],
                intermediario: [
                    { nome: "Corrida de Resistência (TAF)", series: "1", reps: "25 min" },
                    { nome: "Flexões Padrão Militar", series: "4", reps: "20" },
                    { nome: "Abdominais Remador", series: "4", reps: "35" },
                    { nome: "Barra Fixa Pronada", series: "3", reps: "6" },
                    { nome: "Burpees Táticos", series: "3", reps: "12" }
                ],
                avancado: [
                    { nome: "Corrida de Resistência (TAF)", series: "1", reps: "40 min" },
                    { nome: "Burpees Táticos", series: "5", reps: "20" },
                    { nome: "Abdominais Remador", series: "5", reps: "50" },
                    { nome: "Barra Fixa Pronada", series: "4", reps: "12" },
                    { nome: "Flexões Padrão Militar", series: "5", reps: "30" }
                ]
            };

            let arquivoTreinosSalvos = [
                { id: 1, doutrina: "Calistenia", nome: "Rotina Fibra Corporal", itens: [{ nome: "Barra Fixa Pronada", series: "4", reps: "8" }, { nome: "Paralelas (Dips)", series: "4", reps: "12" }] },
                { id: 2, doutrina: "Musculação / Hipertrofia", nome: "Força Bruta: Pernas", itens: [{ nome: "Agachamento Livre com Barra", series: "4", reps: "10" }, { nome: "Levantamento Terra", series: "3", reps: "8" }] }
            ];

            const selectTipo = document.getElementById('tipo-treino');
            const inputData = document.getElementById('data-missao');
            const blocoMilitares = document.getElementById('bloco-modelos-militares');
            const previaContainer = document.getElementById('previa-exercicios');
            const areaChecklist = document.getElementById('area-checklist');
            const historicoContainer = document.getElementById('historico-salvos');
            const bannerSucesso = document.getElementById('banner-missao-cumprida');

            const inputPlanoNome = document.getElementById('nome-plano');
            const inputNome = document.getElementById('nome-exercicio');
            const inputSeries = document.getElementById('series');
            const inputReps = document.getElementById('reps');

            inputData.value = new Date().toISOString().split('T')[0];

            selectTipo.addEventListener('change', () => {
                blocoMilitares.style.display = (selectTipo.value === "Militar / Operacional") ? "block" : "none";
            });

            document.querySelectorAll('.btn-modelo').forEach(botao => {
                botao.addEventListener('click', () => {
                    const nivel = botao.getAttribute('data-nivel');
                    exerciciosTemporarios = [...modelosMilitares[nivel]];
                    atualizarPrevia();
                });
            });

            document.getElementById('btn-add-exercicio').addEventListener('click', () => {
                const nome = inputNome.value.trim();
                const series = inputSeries.value.trim();
                const reps = inputReps.value.trim();

                if (!nome || !series || !reps) return;

                exerciciosTemporarios.push({ nome, series, reps });
                atualizarPrevia();

                inputNome.value = ''; inputSeries.value = ''; inputReps.value = '';
            });

            function atualizarPrevia() {
                if (exerciciosTemporarios.length === 0) {
                    previaContainer.innerHTML = '<p class="missao-vazia" style="margin-top: 50px;">Nenhum exercício adicionado ao escopo.</p>';
                    return;
                }
                previaContainer.innerHTML = '';
                exerciciosTemporarios.forEach((ex, index) => {
                    previaContainer.innerHTML += `<div class="item-previa"><span><strong>${index + 1}. ${ex.nome}</strong></span><span>${ex.series}x${ex.reps}</span></div>`;
                });
            }

            // Publicar novo treino criado na tela e empilhar na execução
            document.getElementById('btn-publicar-treino').addEventListener('click', () => {
                if (exerciciosTemporarios.length === 0) return;

                let nomeFinalTreino = inputPlanoNome.value.trim();
                if (!nomeFinalTreino) {
                    nomeFinalTreino = `Op. ${selectTipo.value.split(' ')[0]} #${arquivoTreinosSalvos.length + 1}`;
                }

                // Cria o objeto do novo treino
                const novoTreino = {
                    id: Date.now(),
                    doutrina: selectTipo.value,
                    nome: nomeFinalTreino,
                    itens: exerciciosTemporarios.map(ex => ({ ...ex, concluido: false }))
                };

                // Adiciona ao banco de históricos estáticos
                arquivoTreinosSalvos.push({
                    id: novoTreino.id,
                    doutrina: novoTreino.doutrina,
                    nome: novoTreino.nome,
                    itens: exerciciosTemporarios.map(ex => ({ ...ex }))
                });

                dataMissaoAtiva = inputData.value;
                
                // Empilha o treino completo estruturado na lista ativa
                missaoAtiva.push(novoTreino);

                exerciciosTemporarios = [];
                inputPlanoNome.value = '';
                atualizarPrevia();
                renderizarHistoricoSalvos();

                bannerSucesso.style.display = "none"; 
                construirChecklist();
                atualizarProgresso();
            });

            // RECONSTRUÇÃO DO CHECKLIST COM IDENTIFICAÇÃO VISUAL AGREGADA POR TREINO
            function construirChecklist() {
                if (missaoAtiva.length === 0) {
                    areaChecklist.innerHTML = '<p class="missao-vazia">Nenhum plano operacional ativo na tela. Aloque ou crie uma missão ao lado.</p>';
                    return;
                }

                areaChecklist.innerHTML = '';

                missaoAtiva.forEach((treino, tIndex) => {
                    // Bloco do Treino
                    const blocoTreino = document.createElement('div');
                    blocoTreino.style.marginBottom = '25px';

                    // Cabeçalho identificando a origem dos exercícios abaixo dele
                    const cabecalho = document.createElement('div');
                    cabecalho.style.display = 'flex';
                    cabecalho.style.justifyContent = 'space-between';
                    cabecalho.style.alignItems = 'center';
                    cabecalho.style.borderBottom = '1px solid #222';
                    cabecalho.style.paddingBottom = '4px';

                    cabecalho.innerHTML = `
                        <span class="tipo-badge" style="margin:0;">${treino.doutrina} &bull; ${treino.nome}</span>
                        <button class="btn-deletar-salvo" style="padding: 2px 8px; font-size:0.75rem;" title="Remover este treino do dia"><i class="fa-solid fa-times"></i></button>
                    `;

                    // Botão para retirar apenas este treino específico da execução do dia
                    cabecalho.querySelector('button').addEventListener('click', () => {
                        missaoAtiva.splice(tIndex, 1);
                        construirChecklist();
                        atualizarProgresso();
                    });

                    blocoTreino.appendChild(cabecalho);

                    // Lista contendo os exercícios deste treino específico
                    const containerItens = document.createElement('div');
                    containerItens.className = 'checklist-container';

                    treino.itens.forEach((ex, iIndex) => {
                        const itemElement = document.createElement('div');
                        itemElement.className = `check-item ${ex.concluido ? 'completo' : ''}`;
                        itemElement.innerHTML = `
                            <input type="checkbox" ${ex.concluido ? 'checked' : ''}>
                            <div class="check-item-info">
                                <h4>${ex.nome}</h4>
                                <p>${ex.series} Séries &bull; ${ex.reps} Repetições</p>
                            </div>
                        `;

                        const alternarEstado = () => {
                            ex.concluido = !ex.concluido;
                            itemElement.querySelector('input[type="checkbox"]').checked = ex.concluido;
                            itemElement.classList.toggle('completo', ex.concluido);
                            atualizarProgresso();
                        };

                        itemElement.addEventListener('click', (e) => {
                            if (e.target.tagName !== 'INPUT') {
                                alternarEstado();
                            } else {
                                ex.concluido = e.target.checked;
                                itemElement.classList.toggle('completo', ex.concluido);
                                atualizarProgresso();
                            }
                        });

                        containerItens.appendChild(itemElement);
                    });

                    blocoTreino.appendChild(containerItens);
                    areaChecklist.appendChild(blocoTreino);
                });
            }

            function atualizarProgresso() {
                if (missaoAtiva.length === 0) {
                    document.getElementById('barra-progresso').style.width = `0%`;
                    document.getElementById('texto-progresso').textContent = `0% CONCLUÍDO`;
                    return;
                }

                let totalExercicios = 0;
                let totalConcluidos = 0;

                missaoAtiva.forEach(treino => {
                    totalExercicios += treino.itens.length;
                    treino.itens.forEach(ex => {
                        if (ex.concluido) totalConcluidos++;
                    });
                });

                const porcentagem = totalExercicios > 0 ? Math.round((totalConcluidos / totalExercicios) * 100) : 0;

                document.getElementById('barra-progresso').style.width = `${porcentagem}%`;
                document.getElementById('texto-progresso').textContent = `${porcentagem}% CONCLUÍDO`;

                if (porcentagem === 100 && totalExercicios > 0) {
                    bannerSucesso.style.display = "block";
                    bannerSucesso.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    marcarDiaNoCalendario(dataMissaoAtiva);
                    missaoAtiva = []; 
                    construirChecklist();
                }
            }

            document.getElementById('btn-fechar-sucesso').addEventListener('click', () => {
                bannerSucesso.style.display = "none";
            });

            // RENDERIZAR HISTÓRICO EXIBINDO OS SEUS EXERCÍCIOS EMBUTIDOS
            function renderizarHistoricoSalvos() {
                historicoContainer.innerHTML = '';
                if (arquivoTreinosSalvos.length === 0) {
                    historicoContainer.innerHTML = '<p style="color:#555; font-size:0.85rem; font-style:italic;">Nenhuma missão arquivada ainda.</p>';
                    return;
                }

                arquivoTreinosSalvos.forEach(treino => {
                    const div = document.createElement('div');
                    div.className = 'treino-salvo-item';
                    div.style.flexDirection = 'column';
                    div.style.alignItems = 'stretch';
                    div.style.gap = '8px';

                    // Mapeia os exercícios salvos para exibi-los em texto reduzido na aba de histórico
                    const exerciciosInternosHtml = treino.itens.map(ex => `• ${ex.nome} (${ex.series}x ${ex.reps})`).join('<br>');

                    div.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                            <div>
                                <strong style="color:#fff;">${treino.nome}</strong><br>
                                <small style="color:var(--gold-tactical); font-weight:700; text-transform:uppercase; font-size:0.75rem;">${treino.doutrina}</small>
                            </div>
                            <div class="acoes-historico">
                                <button class="btn-carregar-salvo">Alocar</button>
                                <button class="btn-deletar-salvo"><i class="fa-solid fa-trash-can"></i></button>
                            </div>
                        </div>
                        <div style="font-size:0.78rem; color:#858a91; border-top:1px solid #1c2127; padding-top:6px; line-height:1.3;">
                            ${exerciciosInternosHtml}
                        </div>
                    `;

                    // Alocar sem limpar o que já está na tela, mantendo os exercícios agrupados
                    div.querySelector('.btn-carregar-salvo').addEventListener('click', () => {
                        const novoTreinoAtivo = {
                            id: Date.now() + Math.random(),
                            doutrina: treino.doutrina,
                            nome: treino.nome,
                            itens: treino.itens.map(ex => ({ ...ex, concluido: false }))
                        };
                        
                        missaoAtiva.push(novoTreinoAtivo);
                        dataMissaoAtiva = inputData.value; 

                        bannerSucesso.style.display = "none";
                        construirChecklist();
                        atualizarProgresso();
                    });

                    div.querySelector('.btn-deletar-salvo').addEventListener('click', () => {
                        arquivoTreinosSalvos = arquivoTreinosSalvos.filter(t => t.id !== treino.id);
                        renderizarHistoricoSalvos();
                    });

                    historicoContainer.appendChild(div);
                });
            }

            function gerarCalendarioDias() {
                const grid = document.getElementById('calendario-ops');
                grid.innerHTML = '';
                
                for(let i = 1; i <= 31; i++) {
                    grid.innerHTML += `
                        <div class="dia-box">
                            <span class="dia-num">Dia ${String(i).padStart(2, '0')}</span>
                            <div class="dia-status neutro" id="dia-id-${i}">&bull;</div>
                        </div>
                    `;
                }
            }

            function marcarDiaNoCalendario(dataString) {
                if (!dataString) return;
                
                const partes = dataString.split('-');
                const numeroDia = parseInt(partes[2], 10);

                const diaAlvo = document.getElementById(`dia-id-${numeroDia}`);
                if (diaAlvo) {
                    if (!diaAlvo.classList.contains('check')) {
                        diaAlvo.className = "dia-status check";
                        diaAlvo.innerHTML = "&#10003;";
                        
                        diasSeguidos++;
                        document.getElementById('contador-dias').textContent = `${String(diasSeguidos).padStart(2, '0')} Dias Seguidos`;
                    } else {
                        diaAlvo.className = "dia-status check";
                        diaAlvo.innerHTML = "&#10003;";
                    }
                }
            }

            renderizarHistoricoSalvos();
            gerarCalendarioDias();

            const fadeEls = document.querySelectorAll('.revelar-ao-scroll');
            fadeEls.forEach(el => {
                el.style.opacity = '0'; el.style.transform = 'translateY(40px)';
                el.style.transition = 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
            });

            const fadeObserver = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        const target = e.target;
                        target.style.opacity = '1'; target.style.transform = 'translateY(0)';
                        setTimeout(() => {
                            target.style.transform = ''; target.style.transition = ''; target.style.opacity = '1'; 
                        }, 800);
                        fadeObserver.unobserve(target);
                    }
                });
            }, { threshold: 0.05 });
            fadeEls.forEach(el => fadeObserver.observe(el));
        });
    