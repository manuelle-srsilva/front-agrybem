document.addEventListener('DOMContentLoaded', function() {
    const editIcons = document.querySelectorAll('.edit-icon');
    const modalOverlay = document.getElementById('editModal');
    const btnExcluir = document.getElementById('btnExcluir');
    const btnOK = document.getElementById('btnOK'); // Novo botão OK
    const accordionHeader = document.getElementById('accordionEdit');
    const accordionContent = document.getElementById('accordionContent');

    // Campos do Modal
    const modalId = document.getElementById('modal-product-id');
    const modalNome = document.getElementById('modal-nome');
    const modalPreco = document.getElementById('modal-preco');
    const modalCategoria = document.getElementById('modal-categoria');

    // Função para abrir o modal
    function openModal(id, nome, preco, categoria) {
        // Preenche os campos do modal com os dados do card
        modalId.value = id;
        modalNome.value = nome;
        modalPreco.value = preco;
        modalCategoria.value = categoria;

        // Garante que o acordeão esteja fechado ao abrir o modal
        accordionContent.classList.remove('active');
        accordionHeader.classList.remove('active');
        
        // Garante que a classe 'closing' seja removida para a animação de entrada
        modalOverlay.classList.remove('closing');

        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Evita scroll da página
    }

    // Função para fechar o modal com fade-out
    function closeModal() {
        // Adiciona a classe 'closing' para iniciar a animação de fade-out
        modalOverlay.classList.add('closing');
        
        // Remove a classe 'active' após o tempo da transição (0.3s)
        setTimeout(() => {
            modalOverlay.classList.remove('active');
            modalOverlay.classList.remove('closing'); // Remove 'closing' para o próximo open
            document.body.style.overflow = ''; // Restaura scroll da página
        }, 300); // Deve ser igual ou maior que a duração da transição no CSS
    }

    // Evento de clique nos ícones de edição
    editIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation(); // Impede que o clique no ícone propague para o card
            e.preventDefault(); // Previne qualquer ação padrão do link/card
            
            // Encontra o elemento pai que contém os dados (card ou card-link)
            let dataElement = this.closest('.card');
            if (!dataElement) {
                // Se não encontrou o .card, procura o .card-link que o envolve
                dataElement = this.closest('.card-link');
            }

            if (dataElement) {
                const id = dataElement.getAttribute('data-id');
                const nome = dataElement.getAttribute('data-nome');
                const preco = dataElement.getAttribute('data-preco');
                const categoria = dataElement.getAttribute('data-categoria');

                openModal(id, nome, preco, categoria);
            }
        });
    });

    // Evento de clique no botão OK (simula salvar e fecha)
    btnOK.addEventListener('click', function(e) {
        e.preventDefault();
        
        const data = {
            id: modalId.value,
            nome: modalNome.value,
            preco: modalPreco.value,
            categoria: modalCategoria.value
        };

        // Simulação de salvamento
        console.log('Simulação: Dados a serem salvos (OK clicado):', data);
        
        closeModal();
    });

    // Evento de clique no botão Excluir (simula exclusão e fecha)
    btnExcluir.addEventListener('click', function(e) {
        e.preventDefault();
        const id = modalId.value;
        const nome = modalNome.value;
        
        // Simulação de exclusão (sem funcionalidade real)
        console.log(`Simulação: Produto "${nome}" (ID: ${id}) excluído.`);
        
        closeModal();
    });

    // Evento de clique no overlay para fechar o modal
    modalOverlay.addEventListener('click', function(e) {
        // Fecha o modal apenas se o clique for no overlay (fora do modal-content)
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Evento de clique no cabeçalho do acordeão (Alterar)
    accordionHeader.addEventListener('click', function() {
        accordionContent.classList.toggle('active');
        accordionHeader.classList.toggle('active');
    });

    // Evento de tecla ESC para fechar o modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });
});