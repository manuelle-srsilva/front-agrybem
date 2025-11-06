function updateStatus(selectElement) {
    const selectedValue = selectElement.value;
    
    // Remove todas as classes de status existentes
    selectElement.classList.remove('status-pending', 'status-finished');
    
    // Adiciona a classe de status correspondente
    if (selectedValue === 'finished') {
        selectElement.classList.add('status-finished');
    } else if (selectedValue === 'pending') {
        selectElement.classList.add('status-pending');
    }
    
    // Opcional: Atualizar o texto da opção selecionada para incluir o emoji
    const options = selectElement.options;
    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        if (option.value === 'finished') {
            option.textContent = '🟢 Finalizado';
        } else if (option.value === 'pending') {
            option.textContent = '🟡 Pendente';
        }
    }
    
    // Em um ambiente real, aqui você faria uma chamada AJAX para atualizar o status no servidor.
    console.log('Pedido atualizado para:', selectedValue);
}