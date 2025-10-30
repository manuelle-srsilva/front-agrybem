// Variável para armazenar os comentários
let comments = [];

// Função para renderizar a lista de comentários
function renderComments() {
    const commentsList = document.getElementById('comments-list');
    const commentCount = document.getElementById('comment-count');
    commentsList.innerHTML = '';
    commentCount.textContent = comments.length;

    if (comments.length === 0) {
        commentsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-comments"></i>
                </div>
                <p class="empty-state-text">Nenhum comentário ainda. Seja o primeiro a compartilhar!</p>
            </div>
        `;
        return;
    }

    comments.forEach((comment) => {
        const listItem = document.createElement('li');
        listItem.className = 'comment-item';
        listItem.setAttribute('data-id', comment.id);

        const initials = getInitials(comment.author);
        const formattedDate = formatDate(comment.date);

        listItem.innerHTML = `
            <div class="comment-header">
                <div class="comment-author-info">
                    <div class="comment-avatar">${initials}</div>
                    <div class="comment-author-details">
                        <span class="comment-author">${escapeHtml(comment.author)}</span>
                        <span class="comment-date">${formattedDate}</span>
                    </div>
                </div>
                <div class="comment-actions">
                    <button class="edit-btn" onclick="startEditComment(${comment.id})" title="Editar comentário">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="delete-btn" onclick="deleteComment(${comment.id})" title="Excluir comentário">
                        <i class="fas fa-trash-alt"></i> Excluir
                    </button>
                </div>
            </div>
            <div class="comment-body" id="body-${comment.id}">${escapeHtml(comment.text)}</div>
        `;

        commentsList.appendChild(listItem);
    });
}

// Função para obter iniciais do nome
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
}

// Função para formatar a data de forma legível
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
        return 'Agora';
    } else if (diffMins < 60) {
        return `${diffMins}m atrás`;
    } else if (diffHours < 24) {
        return `${diffHours}h atrás`;
    } else if (diffDays < 7) {
        return `${diffDays}d atrás`;
    } else {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}

// Função para escapar HTML (prevenir XSS)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Função para adicionar um novo comentário
document.getElementById('comment-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // const authorInput = document.getElementById('comment-author'); // Removido
    const textInput = document.getElementById('comment-text');

    const author = 'Usuário Cadastrado'; // Simula o nome do usuário logado
    const text = textInput.value.trim();

    if (!text) {
        alert('O comentário não pode estar vazio.');
        return;
    }

    const newComment = {
        id: Date.now(),
        author: author,
        text: text,
        date: new Date().toISOString()
    };

    comments.unshift(newComment);
    renderComments();

    // Limpa o formulário
    textInput.value = '';
    textInput.focus();
});

// Função para iniciar a edição de um comentário
function startEditComment(id) {
    const comment = comments.find(c => c.id === id);
    if (!comment) return;

    const commentBodyDiv = document.getElementById(`body-${id}`);
    const currentText = comment.text;

    // Cria a área de texto para edição
    const textarea = document.createElement('textarea');
    textarea.className = 'edit-textarea';
    textarea.value = currentText;

    // Cria os botões de ação
    const editActions = document.createElement('div');
    editActions.className = 'edit-actions';

    const saveButton = document.createElement('button');
    saveButton.className = 'save-btn';
    saveButton.innerHTML = '<i class="fas fa-check"></i> Salvar';
    saveButton.onclick = () => saveEditComment(id, textarea.value);

    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-btn';
    cancelButton.innerHTML = '<i class="fas fa-times"></i> Cancelar';
    cancelButton.onclick = () => renderComments();

    editActions.appendChild(saveButton);
    editActions.appendChild(cancelButton);

    // Substitui o corpo do comentário pela área de texto e botões
    commentBodyDiv.innerHTML = '';
    commentBodyDiv.appendChild(textarea);
    commentBodyDiv.appendChild(editActions);

    // Esconde os botões de ação (Editar/Excluir)
    const commentItem = commentBodyDiv.closest('.comment-item');
    const actionsDiv = commentItem.querySelector('.comment-actions');
    actionsDiv.style.display = 'none';
    
    textarea.focus();
}

// Função para salvar a edição de um comentário
function saveEditComment(id, newText) {
    const commentIndex = comments.findIndex(c => c.id === id);
    if (commentIndex === -1) return;

    const trimmedText = newText.trim();
    if (trimmedText) {
        comments[commentIndex].text = trimmedText;
        renderComments();
    } else {
        alert('O comentário editado não pode estar vazio.');
    }
}

// Função para excluir um comentário
function deleteComment(id) {
    if (confirm('Tem certeza que deseja excluir este comentário?')) {
        comments = comments.filter(c => c.id !== id);
        renderComments();
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderComments();
    
    // Atualiza o ano no footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Lógica para o menu mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (menuToggle && dropdownMenu) {
        menuToggle.addEventListener('click', () => {
            dropdownMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
    }
});