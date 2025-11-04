document.addEventListener('DOMContentLoaded', function() {
    const uploadInput = document.getElementById('uploadFoto');
    const uploadBox = document.querySelector('.upload-box');
    let previewImage = document.querySelector('.upload-icon');

    // Função para processar o arquivo e exibir a pré-visualização
    function handleFile(file) {
        // Verifica se é um arquivo de imagem
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // 1. Garante que o elemento de imagem existe
                if (!previewImage) {
                    previewImage = document.createElement('img');
                    previewImage.classList.add('upload-icon'); // Mantém a classe para estilos
                    uploadBox.innerHTML = ''; // Limpa o conteúdo anterior (ícone de upload)
                    uploadBox.appendChild(previewImage);
                }
                
                // 2. Atualiza o src da imagem de preview
                previewImage.src = e.target.result;
                previewImage.alt = 'Foto do Produto Selecionada';
                
                // 3. Aplica estilos para que a imagem preencha a caixa
                previewImage.style.width = '100%';
                previewImage.style.height = '100%';
                previewImage.style.objectFit = 'cover';
                previewImage.style.borderRadius = '20px';
                previewImage.style.opacity = '1';
            };
            
            reader.readAsDataURL(file);
            
            // 4. Sincronizar o arquivo com o input de arquivo (necessário para submissão)
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            uploadInput.files = dataTransfer.files;
            
        } else {
            // Limpa o input se o arquivo não for uma imagem
            uploadInput.value = '';
            alert('Por favor, selecione um arquivo de imagem válido.');
        }
    }

    // 1. Funcionalidade de Clique
    uploadBox.addEventListener('click', function() {
        uploadInput.click();
    });

    // 2. Funcionalidade de Mudança (seleção de arquivo)
    uploadInput.addEventListener('change', function(event) {
        if (event.target.files && event.target.files[0]) {
            handleFile(event.target.files[0]);
        }
    });

    // 3. Funcionalidade de Drag and Drop

    // Previne o comportamento padrão (abrir o arquivo) e adiciona feedback visual
    uploadBox.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadBox.classList.add('drag-over');
    });

    // Remove o feedback visual
    uploadBox.addEventListener('dragleave', function() {
        uploadBox.classList.remove('drag-over');
    });

    // Processa o arquivo solto
    uploadBox.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadBox.classList.remove('drag-over');

        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            handleFile(file);
        }
    });
});
