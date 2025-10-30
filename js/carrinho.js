// script.js

// =================================================================
// LÓGICA DE CARRINHO (Compartilhada entre loja.html e carrinho.html)
// =================================================================

const CART_STORAGE_KEY = 'agrybemCart';

/**
 * Carrega o carrinho do localStorage.
 * @returns {Array} O array de itens do carrinho, ou um array vazio se não houver.
 */
function loadCart() {
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
}

/**
 * Salva o carrinho no localStorage.
 * @param {Array} cart O array de itens do carrinho a ser salvo.
 */
function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
}

/**
 * Atualiza o contador de itens do carrinho no cabeçalho.
 */
function updateCartCount() {
    const cart = loadCart();
    const countElement = document.getElementById('cartCount');
    if (countElement) {
        // Conta o número total de itens (não a quantidade total)
        const totalItems = cart.length; 
        countElement.textContent = totalItems;
        countElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

/**
 * Adiciona um produto ao carrinho.
 * @param {Object} product Os dados do produto (id, name, category, price, image).
 */
function addToCart(product) {
    const cart = loadCart();
    
    // Verifica se o produto já está no carrinho
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        // Se já existir, apenas incrementa a quantidade (mantendo a unidade padrão 'kg')
        existingItem.quantity += 1;
    } else {
        // Se for um novo item, adiciona com quantidade 1 e unidade 'kg'
        cart.push({
            id: product.id,
            name: product.name,
            category: product.category,
            price: parseFloat(product.price), // Preço por KG
            image: product.image,
            quantity: 1,
            unit: 'kg', // Unidade padrão ao adicionar
            total: parseFloat(product.price) // Total inicial (1kg * preço)
        });
    }

    saveCart(cart);
    alert(`"${product.name}" adicionado ao carrinho!`);
}

// =================================================================
// LÓGICA DA PÁGINA LOJA (loja.html)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Atualiza o contador do carrinho ao carregar a página
    updateCartCount();

    // 2. Adiciona event listeners aos botões '+'
    const addButtons = document.querySelectorAll('.add-to-cart-btn');
    addButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Previne a propagação do clique para o card (se houver)
            event.stopPropagation(); 
            
            const card = event.target.closest('.product-card');
            const product = {
                id: card.dataset.productId,
                name: card.dataset.productName,
                category: card.dataset.productCategory,
                price: card.dataset.productPrice,
                image: card.dataset.productImage
            };
            addToCart(product);
        });
    });
});


// =================================================================
// LÓGICA DA PÁGINA CARRINHO (carrinho.html)
// =================================================================

/**
 * Mapeamento de conversão de unidades (exemplo).
 * 1 unidade (un) equivale a X quilos (kg).
 * 1 grama (g) equivale a 0.001 quilos (kg).
 */
const UNIT_CONVERSION = {
    'kg': 1,      // 1 kg = 1 kg
    'g': 0.001,   // 1 g = 0.001 kg
    // Conversões por produto (exemplo)
    'Banana': 0.15, // 1 un de Banana = 0.15 kg
    'Tomate': 0.10, // 1 un de Tomate = 0.10 kg
    'Alface': 0.30, // 1 un de Alface = 0.30 kg
    'Batata': 0.12, // 1 un de Batata = 0.12 kg
    'Maçã': 0.18,   // 1 un de Maçã = 0.18 kg
    // Valor padrão para 'un' se o produto não estiver mapeado
    'default': 0.20 
};

/**
 * Calcula o total de um item no carrinho.
 * @param {Object} item O item do carrinho.
 * @returns {number} O valor total calculado.
 */
function calculateItemTotal(item) {
    const pricePerKg = item.price;
    let quantityInKg = 0;

    if (item.unit === 'kg') {
        quantityInKg = item.quantity;
    } else if (item.unit === 'g') {
        quantityInKg = item.quantity * UNIT_CONVERSION['g'];
    } else if (item.unit === 'un') {
        // Usa a conversão específica do produto ou o valor padrão
        const conversionFactor = UNIT_CONVERSION[item.name] || UNIT_CONVERSION['default'];
        quantityInKg = item.quantity * conversionFactor;
    }

    // valor_total = preço_por_kg × quantidade_convertida
    const total = pricePerKg * quantityInKg;
    return total;
}

/**
 * Renderiza o carrinho na página carrinho.html.
 */
function renderCart() {
    const cart = loadCart();
    const container = document.getElementById('cart-items-container');
    const emptyMessage = document.getElementById('empty-cart-message');
    const grandTotalElement = document.getElementById('grand-total');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    // container.innerHTML = ''; // Não limpamos mais o container, apenas atualizamos os itens existentes

    if (cart.length === 0) {
        emptyMessage.style.display = 'block';
        grandTotalElement.textContent = 'R$ 0,00';
        checkoutBtn.disabled = true;
        return;
    }

    emptyMessage.style.display = 'none';
    checkoutBtn.disabled = false;
    checkoutBtn.removeEventListener('click', redirectToCheckout); // Remove para evitar duplicidade
    checkoutBtn.addEventListener('click', redirectToCheckout);

    let grandTotal = 0;

    cart.forEach(item => {
        // Recalcula o total do item e atualiza o objeto do item
        item.total = calculateItemTotal(item);
        grandTotal += item.total;

        // Tenta encontrar o elemento existente
        let itemElement = document.querySelector(`.cart-item[data-item-id="${item.id}"]`);

        if (!itemElement) {
            // Se não existir, cria o novo elemento
            itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.dataset.itemId = item.id;
            container.appendChild(itemElement); // Adiciona ao container
        }
        
        // Atualiza o conteúdo do elemento (ou define se for novo)
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-category">${item.category}</p>
                <p class="cart-item-base-price">Preço base: R$ ${item.price.toFixed(2)} / kg</p>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-unit-group">
                    <input type="number" 
                           class="item-quantity-input" 
                           value="${item.quantity}" 
                           min="0.01" 
                           step="${item.unit === 'g' ? '1' : (item.unit === 'un' ? '1' : '0.01')}"
                           data-item-id="${item.id}">
                    <select class="item-unit-select" data-item-id="${item.id}">
                        <option value="kg" ${item.unit === 'kg' ? 'selected' : ''}>kg</option>
                        <option value="g" ${item.unit === 'g' ? 'selected' : ''}>g</option>
                        <option value="un" ${item.unit === 'un' ? 'selected' : ''}>un</option>
                    </select>
                </div>
                <span class="item-total-price" data-item-id="${item.id}">R$ ${item.total.toFixed(2)}</span>
                <button class="remove-item-btn" data-item-id="${item.id}">Remover</button>
            </div>
        `;
        container.appendChild(itemElement);
    });

    // Atualiza o total geral
    grandTotalElement.textContent = `R$ ${grandTotal.toFixed(2).replace('.', ',')}`;

    // Salva o carrinho atualizado (com os totais recalculados)
    saveCart(cart);
    
    // Remove itens que não estão mais no carrinho (se houver)
    document.querySelectorAll('.cart-item').forEach(existingItem => {
        const itemId = existingItem.dataset.itemId;
        if (!cart.find(item => item.id === itemId)) {
            existingItem.remove();
        }
    });

    // Adiciona event listeners para os novos elementos
    addCartEventListeners();
}

/**
 * Adiciona listeners para eventos de mudança de quantidade/unidade e remoção.
 */
function addCartEventListeners() {
    // Listener para input de quantidade
    document.querySelectorAll('.item-quantity-input').forEach(input => {
        input.addEventListener('change', handleQuantityChange);
        input.addEventListener('input', handleQuantityChange); // Para atualização em tempo real
    });

    // Listener para select de unidade
    document.querySelectorAll('.item-unit-select').forEach(select => {
        select.addEventListener('change', handleUnitChange);
    });

    // Listener para botão de remoção
    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', handleRemoveItem);
    });
}

/**
 * Manipula a mudança de quantidade de um item.
 * @param {Event} event O evento de mudança.
 */
function handleQuantityChange(event) {
    const itemId = event.target.dataset.itemId;
    const newQuantity = parseFloat(event.target.value);
    
    if (isNaN(newQuantity) || newQuantity <= 0) {
        // Ignora valores inválidos ou zero, mas mantém o valor anterior
        // Poderia-se forçar um valor mínimo, mas vamos apenas ignorar por enquanto
        // Se o usuário quer remover, ele deve usar o botão remover.
        event.target.value = loadCart().find(item => item.id === itemId).quantity;
        return;
    }

    updateCartItem(itemId, { quantity: newQuantity });
}

/**
 * Manipula a mudança de unidade de um item.
 * @param {Event} event O evento de mudança.
 */
function handleUnitChange(event) {
    const itemId = event.target.dataset.itemId;
    const newUnit = event.target.value;
    
    // Ao mudar a unidade, ajustamos o step do input de quantidade
    const inputElement = document.querySelector(`.item-quantity-input[data-item-id="${itemId}"]`);
    if (newUnit === 'g' || newUnit === 'un') {
        // Para gramas e unidades, a quantidade deve ser um número inteiro (ou passo de 1)
        inputElement.step = '1';
        // Se a unidade for 'un', forçamos a quantidade para ser um inteiro
        if (newUnit === 'un') {
             inputElement.value = Math.max(1, Math.round(parseFloat(inputElement.value)));
        }
    } else {
        // Para kg, permite decimais
        inputElement.step = '0.01';
    }
    
    updateCartItem(itemId, { unit: newUnit, quantity: parseFloat(inputElement.value) });
}

/**
 * Remove um item do carrinho.
 * @param {Event} event O evento de clique.
 */
function handleRemoveItem(event) {
    const itemId = event.target.dataset.itemId;
    let cart = loadCart();
    
    cart = cart.filter(item => item.id !== itemId);
    
    saveCart(cart);
    renderCart(); // Renderiza novamente o carrinho
}

/**
 * Atualiza as propriedades de um item no carrinho e renderiza.
 * @param {string} itemId O ID do item.
 * @param {Object} updates As propriedades a serem atualizadas (ex: { quantity: 2, unit: 'g' }).
 */
function updateCartItem(itemId, updates) {
    let cart = loadCart();
    const itemIndex = cart.findIndex(item => item.id === itemId);

    if (itemIndex > -1) {
        // Atualiza as propriedades
        cart[itemIndex] = { ...cart[itemIndex], ...updates };
        
        // Recalcula o total do item
        cart[itemIndex].total = calculateItemTotal(cart[itemIndex]);
        
        saveCart(cart);
        
        // Atualiza o total do item na tela
        const totalElement = document.querySelector(`.item-total-price[data-item-id="${itemId}"]`);
        if (totalElement) {
            totalElement.textContent = `R$ ${cart[itemIndex].total.toFixed(2)}`;
        }
        
        // Atualiza o total geral
        const grandTotal = cart.reduce((acc, item) => acc + calculateItemTotal(item), 0);
        const grandTotalElement = document.getElementById('grand-total');
        if (grandTotalElement) {
            grandTotalElement.textContent = `R$ ${grandTotal.toFixed(2).replace('.', ',')}`;
        }
    }
}

// Inicializa a renderização do carrinho se estiver na página carrinho.html
if (window.location.pathname.includes('carrinho.html')) {
    document.addEventListener('DOMContentLoaded', renderCart);
}

/**
 * Redireciona para a página de checkout.
 */
function redirectToCheckout() {
    window.location.href = 'checkout.html';
}