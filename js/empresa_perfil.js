// ===== FUNCIONALIDADE DE EDIÇÃO POR CARD =====

document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card');
    const institutionTitle = document.querySelector('.institution-title');
    const companyNameInput = document.getElementById('company-name');
    
    // Armazenar valores originais para cancelamento
    const originalValues = {};

    // Inicializar cada card
    cards.forEach(card => {
        const cardType = card.getAttribute('data-card');
        const editButton = card.querySelector('.card-edit-button');
        const saveButton = card.querySelector('.card-save-button');
        const cancelButton = card.querySelector('.card-cancel-button');
        const cardActions = card.querySelector('.card-actions'); // Mantido para referência, mas não será usado para display
        const inputs = card.querySelectorAll('input, textarea');

        // Armazenar valores originais
        inputs.forEach(input => {
            originalValues[input.id] = input.value;
        });

        // Se não houver botão de edição (como no mapa), pular
        if (!editButton) return;

        // Evento ao clicar no botão de edição
        editButton.addEventListener('click', function(e) {
            e.preventDefault();
            enableCardEditMode(card, inputs);
        });

        // Evento ao clicar em salvar
        saveButton.addEventListener('click', function(e) {
            e.preventDefault();
            saveCardChanges(card, inputs, cardType);
        });

        // Evento ao clicar em cancelar
        cancelButton.addEventListener('click', function(e) {
            e.preventDefault();
            cancelCardChanges(card, inputs, originalValues);
        });

        // Permitir salvar com Ctrl+Enter
        inputs.forEach(input => {
            input.addEventListener('keydown', function(e) {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    saveButton.click();
                }
            });

            // Permitir cancelar com Escape
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    cancelButton.click();
                }
            });
        });
    });

    // Sincronizar nome da empresa com o título
    if (companyNameInput) {
        companyNameInput.addEventListener('input', function() {
            institutionTitle.textContent = this.value || 'Cesta Rural';
        });
    }

    // Função para ativar modo edição do card
    function enableCardEditMode(card, inputs) {
        // Habilitar todos os inputs do card
        inputs.forEach(input => {
            input.disabled = false;
        });

        // A visibilidade dos botões de ação e do botão de edição agora é controlada pelo CSS
        // ao adicionar a classe 'editing' ao card.
        // cardActions.style.display = 'flex'; // REMOVIDO

        // Adicionar classe de edição - ISSO É O QUE FAZ A MÁGICA NO CSS
        card.classList.add('editing');

        // Focar no primeiro input
        if (inputs.length > 0) {
            inputs[0].focus();
        }
    }

    // Função para salvar alterações do card
    function saveCardChanges(card, inputs, cardType) {
        // Coletar dados
        const formData = {};
        inputs.forEach(input => {
            formData[input.id] = input.value;
            originalValues[input.id] = input.value; // Atualizar valores originais
        });

        console.log(`Salvando ${cardType}:`, formData);

        // Aqui você pode enviar os dados para o servidor
        /*
        fetch('/api/save-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Sucesso:', data);
            disableCardEditMode(card, inputs);
            alert('Alterações salvas com sucesso!');
        })
        .catch((error) => {
            console.error('Erro:', error);
            alert('Erro ao salvar alterações!');
        });
        */

        // Por enquanto, apenas desabilita o modo edição
        disableCardEditMode(card, inputs);
        alert('Alterações salvas com sucesso!');
    }

    // Função para desativar modo edição do card
    function disableCardEditMode(card, inputs) {
        // Desabilitar todos os inputs do card
        inputs.forEach(input => {
            input.disabled = true;
        });

        // A visibilidade dos botões de ação e do botão de edição agora é controlada pelo CSS
        // ao remover a classe 'editing' do card.
        // cardActions.style.display = 'none'; // REMOVIDO

        // Remover classe de edição - ISSO É O QUE FAZ A MÁGICA NO CSS
        card.classList.remove('editing');
    }

    // Função para cancelar alterações do card
    function cancelCardChanges(card, inputs, originalValues) {
        if (confirm('Descartar alterações?')) {
            // Restaurar valores originais
            inputs.forEach(input => {
                input.value = originalValues[input.id];
            });

            // Sincronizar título se o nome da empresa foi alterado
            if (companyNameInput) {
                institutionTitle.textContent = companyNameInput.value || 'Cesta Rural';
            }

            // Desabilitar modo edição
            disableCardEditMode(card, inputs);
        }
    }
});

    // ===== FUNCIONALIDADE DE EDIÇÃO DE FOTO =====

    const photoEditButton = document.querySelector('.photo-edit-button');

    if (photoEditButton) {
        photoEditButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Simulação da lógica de troca de foto
            const confirmed = confirm('Você deseja trocar a foto de perfil? (Esta é apenas uma simulação. A funcionalidade real de upload precisaria de mais código.)');
            
            if (confirmed) {
                alert('Funcionalidade de troca de foto acionada. (Implemente aqui a lógica real de upload de arquivo.)');
                // Exemplo de como você faria a troca:
                // 1. Abrir um input file.
                // 2. Fazer o upload da nova imagem.
                // 3. Atualizar o src do elemento .logo-img.
            }
        });
    }
