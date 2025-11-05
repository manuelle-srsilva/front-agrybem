/**
 * ===================================================================
 * SISTEMA DE CARRINHO COM CONVERSÃO INTELIGENTE DE UNIDADES
 * ===================================================================
 * 
 * Este arquivo contém a lógica completa do carrinho de compras com
 * suporte a conversão inteligente de unidades baseada no preço base
 * cadastrado pelo empreendedor.
 * 
 * Estrutura de dados do carrinho (localStorage):
 * {
 *   items: [
 *     {
 *       id: string,           // ID único do produto
 *       name: string,         // Nome do produto
 *       category: string,     // Categoria do produto
 *       price: number,        // Preço base (em reais)
 *       baseUnit: string,     // Unidade base do preço (kg, g, un)
 *       image: string,        // URL da imagem
 *       quantity: number,     // Quantidade desejada pelo cliente
 *       unit: string,         // Unidade desejada pelo cliente (kg, g, un)
 *       total: number         // Total do item (calculado)
 *     }
 *   ]
 * }
 */

// ===================================================================
// CONFIGURAÇÕES E CONSTANTES
// ===================================================================

const CART_CONFIG = {
    storageKey: 'agrybemCart',
    apiEndpoint: 'api/cart.php', // Para futura integração com PHP
    currencyFormat: 'pt-BR',
    currencySymbol: 'R$'
};

/**
 * Tabela de conversão entre unidades.
 * Todos os valores são convertidos para a unidade base para cálculo.
 * 
 * Exemplo:
 *   1 kg = 1 kg
 *   1 g = 0.001 kg
 *   1 un (unidade) = varia por produto
 */
const UNIT_CONVERSION = {
    // Conversões padrão
    'kg': 1,
    'g': 0.001,
    
    // Conversões por produto (unidade para kg)
    // Estes valores são usados quando a unidade é 'un' (unidade)
    'Banana': 0.15,
    'Tomate': 0.10,
    'Alface': 0.30,
    'Batata': 0.12,
    'Maçã': 0.18,
    'Abacaxi': 0.25,
    'default': 0.20
};

// ===================================================================
// FUNÇÕES UTILITÁRIAS
// ===================================================================

/**
 * Formata um valor numérico para a moeda brasileira.
 * @param {number} value - Valor a formatar
 * @returns {string} Valor formatado (ex: "R$ 10,50")
 */
function formatCurrency(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        return `${CART_CONFIG.currencySymbol} 0,00`;
    }
    return `${CART_CONFIG.currencySymbol} ${value.toFixed(2).replace('.', ',')}`;
}

/**
 * Valida se um valor é um número válido e positivo.
 * @param {*} value - Valor a validar
 * @returns {boolean} True se válido
 */
function isValidNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
}

/**
 * Converte uma quantidade de uma unidade para outra.
 * 
 * Exemplo:
 *   convertQuantity(1, 'kg', 'g') = 1000
 *   convertQuantity(500, 'g', 'kg') = 0.5
 *   convertQuantity(2, 'un', 'kg', 'Banana') = 0.3 (2 * 0.15)
 * 
 * @param {number} quantity - Quantidade a converter
 * @param {string} fromUnit - Unidade de origem (kg, g, un)
 * @param {string} toUnit - Unidade de destino (kg, g, un)
 * @param {string} productName - Nome do produto (necessário para conversão de 'un')
 * @returns {number} Quantidade convertida
 */
function convertQuantity(quantity, fromUnit, toUnit, productName = '') {
    if (!isValidNumber(quantity)) {
        return 0;
    }

    // Se as unidades são iguais, retorna a quantidade sem conversão
    if (fromUnit === toUnit) {
        return quantity;
    }

    // Converte para kg como unidade base
    let quantityInKg = 0;

    if (fromUnit === 'kg') {
        quantityInKg = quantity;
    } else if (fromUnit === 'g') {
        quantityInKg = quantity * UNIT_CONVERSION['g'];
    } else if (fromUnit === 'un') {
        const conversionFactor = UNIT_CONVERSION[productName] || UNIT_CONVERSION['default'];
        quantityInKg = quantity * conversionFactor;
    }

    // Converte de kg para a unidade de destino
    let result = 0;

    if (toUnit === 'kg') {
        result = quantityInKg;
    } else if (toUnit === 'g') {
        result = quantityInKg / UNIT_CONVERSION['g'];
    } else if (toUnit === 'un') {
        const conversionFactor = UNIT_CONVERSION[productName] || UNIT_CONVERSION['default'];
        result = quantityInKg / conversionFactor;
    }

    return result;
}

/**
 * Obtém o fator de conversão para uma unidade específica.
 * @param {string} unit - Unidade (kg, g, un)
 * @param {string} productName - Nome do produto (para conversões específicas)
 * @returns {number} Fator de conversão
 */
function getConversionFactor(unit, productName = '') {
    if (unit === 'kg') return UNIT_CONVERSION['kg'];
    if (unit === 'g') return UNIT_CONVERSION['g'];
    if (unit === 'un') {
        return UNIT_CONVERSION[productName] || UNIT_CONVERSION['default'];
    }
    return 1;
}

// ===================================================================
// FUNÇÕES DE GERENCIAMENTO DO CARRINHO (localStorage)
// ===================================================================

/**
 * Carrega o carrinho do localStorage.
 * @returns {Array} Array de itens do carrinho
 */
function loadCart() {
    try {
        const cartJson = localStorage.getItem(CART_CONFIG.storageKey);
        if (!cartJson) return [];
        
        const cart = JSON.parse(cartJson);
        // Validação básica
        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        return [];
    }
}

/**
 * Salva o carrinho no localStorage.
 * @param {Array} cart - Array de itens do carrinho
 * @returns {boolean} True se salvo com sucesso
 */
function saveCart(cart) {
    try {
        if (!Array.isArray(cart)) {
            console.error('Carrinho inválido:', cart);
            return false;
        }
        localStorage.setItem(CART_CONFIG.storageKey, JSON.stringify(cart));
        updateCartCount();
        return true;
    } catch (error) {
        console.error('Erro ao salvar carrinho:', error);
        return false;
    }
}

/**
 * Limpa o carrinho completamente.
 * @returns {boolean} True se limpo com sucesso
 */
function clearCart() {
    try {
        localStorage.removeItem(CART_CONFIG.storageKey);
        updateCartCount();
        return true;
    } catch (error) {
        console.error('Erro ao limpar carrinho:', error);
        return false;
    }
}

/**
 * Atualiza o contador de itens no cabeçalho.
 */
function updateCartCount() {
    const cart = loadCart();
    const countElement = document.getElementById('cart-count');
    
    if (countElement) {
        const totalItems = cart.length;
        countElement.textContent = totalItems;
        countElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// ===================================================================
// FUNÇÕES DE CÁLCULO COM CONVERSÃO INTELIGENTE
// ===================================================================

/**
 * Calcula o total de um item do carrinho com conversão inteligente de unidades.
 * 
 * LÓGICA:
 * 1. Pega o preço base e a unidade base (ex: R$ 17,90 por kg)
 * 2. Converte o preço para a unidade base (kg)
 * 3. Converte a quantidade desejada para a unidade base (kg)
 * 4. Multiplica: (preço em kg) * (quantidade em kg) = total
 * 
 * EXEMPLO:
 * - Preço base: R$ 17,90 por kg
 * - Cliente quer: 300 gramas
 * - Cálculo:
 *   a) Preço por grama: R$ 17,90 / 1000 = R$ 0,01790
 *   b) Total: R$ 0,01790 * 300 = R$ 5,37
 * 
 * @param {Object} item - Item do carrinho
 * @returns {number} Total calculado
 */
function calculateItemTotal(item) {
    if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
        return 0;
    }

    // Pega o preço base e a unidade base
    const priceBase = item.price;
    const baseUnit = item.baseUnit || 'kg'; // Padrão: kg se não especificado
    const productName = item.name || '';

    // Converte o preço para a unidade base (kg)
    let pricePerKg = 0;

    if (baseUnit === 'kg') {
        pricePerKg = priceBase;
    } else if (baseUnit === 'g') {
        // Se o preço é por grama, converte para por kg
        // R$ X por grama = R$ (X * 1000) por kg
        pricePerKg = priceBase * 1000;
    } else if (baseUnit === 'un') {
        // Se o preço é por unidade, converte para por kg
        // R$ X por unidade = R$ (X / fator de conversão) por kg
        const conversionFactor = UNIT_CONVERSION[productName] || UNIT_CONVERSION['default'];
        pricePerKg = priceBase / conversionFactor;
    }

    // Converte a quantidade desejada para kg
    const quantityInKg = convertQuantity(item.quantity, item.unit, 'kg', productName);

    // Calcula o total: preço por kg * quantidade em kg
    const total = pricePerKg * quantityInKg;

    return total;
}

/**
 * Calcula o total geral do carrinho.
 * @param {Array} cart - Array de itens do carrinho
 * @returns {number} Total geral
 */
function calculateCartTotal(cart) {
    if (!Array.isArray(cart)) return 0;
    
    return cart.reduce((total, item) => {
        return total + calculateItemTotal(item);
    }, 0);
}

// ===================================================================
// FUNÇÕES DE MANIPULAÇÃO DO CARRINHO
// ===================================================================

/**
 * Adiciona um produto ao carrinho.
 * Estruturado para receber dados do PHP futuramente.
 * 
 * @param {Object} product - Dados do produto
 *   - id: string (obrigatório)
 *   - name: string (obrigatório)
 *   - price: number (obrigatório)
 *   - baseUnit: string (obrigatório: 'kg', 'g' ou 'un')
 *   - category: string (opcional)
 *   - image: string (opcional)
 * @returns {boolean} True se adicionado com sucesso
 */
function addToCart(product) {
    // Validação dos dados do produto
    if (!product || !product.id || !product.name || typeof product.price !== 'number') {
        console.error('Produto inválido:', product);
        return false;
    }

    // Validação da unidade base
    if (!product.baseUnit || !['kg', 'g', 'un'].includes(product.baseUnit)) {
        console.error('Unidade base inválida:', product.baseUnit);
        return false;
    }

    const cart = loadCart();
    
    // Verifica se o produto já está no carrinho
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        // Se já existir, incrementa a quantidade
        existingItem.quantity += 1;
    } else {
        // Se for novo, adiciona com quantidade 1
        cart.push({
            id: product.id,
            name: product.name,
            category: product.category || 'Sem categoria',
            price: parseFloat(product.price),
            baseUnit: product.baseUnit, // IMPORTANTE: Armazena a unidade base do preço
            image: product.image || 'img/placeholder.png',
            quantity: 1,
            unit: product.baseUnit, // Começa com a mesma unidade base
            total: parseFloat(product.price)
        });
    }

    if (saveCart(cart)) {
        console.log(`Produto "${product.name}" adicionado ao carrinho`);
        return true;
    }
    return false;
}

/**
 * Remove um item do carrinho.
 * @param {string} itemId - ID do item a remover
 * @returns {boolean} True se removido com sucesso
 */
function removeFromCart(itemId) {
    let cart = loadCart();
    const initialLength = cart.length;
    
    cart = cart.filter(item => item.id !== itemId);
    
    if (cart.length < initialLength) {
        return saveCart(cart);
    }
    return false;
}

/**
 * Atualiza um item do carrinho.
 * @param {string} itemId - ID do item
 * @param {Object} updates - Propriedades a atualizar
 * @returns {boolean} True se atualizado com sucesso
 */
function updateCartItem(itemId, updates) {
    let cart = loadCart();
    const itemIndex = cart.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
        console.error('Item não encontrado:', itemId);
        return false;
    }

    // Validação das atualizações
    if (updates.quantity !== undefined && !isValidNumber(updates.quantity)) {
        console.error('Quantidade inválida:', updates.quantity);
        return false;
    }

    if (updates.unit && !['kg', 'g', 'un'].includes(updates.unit)) {
        console.error('Unidade inválida:', updates.unit);
        return false;
    }

    // Aplica as atualizações
    cart[itemIndex] = { ...cart[itemIndex], ...updates };
    
    // Recalcula o total do item
    cart[itemIndex].total = calculateItemTotal(cart[itemIndex]);
    
    return saveCart(cart);
}

// ===================================================================
// FUNÇÕES DE RENDERIZAÇÃO
// ===================================================================

/**
 * Renderiza o carrinho na página.
 * Função principal que atualiza a interface com os dados do carrinho.
 */
function renderCart() {
    const cart = loadCart();
    const container = document.getElementById('cart-items-container');
    const emptyMessage = document.getElementById('empty-cart-message');
    const grandTotalElement = document.getElementById('grand-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (!container) {
        console.error('Container do carrinho não encontrado');
        return;
    }

    // Se o carrinho está vazio
    if (cart.length === 0) {
        container.innerHTML = '';
        if (emptyMessage) {
            emptyMessage.style.display = 'block';
        }
        if (grandTotalElement) {
            grandTotalElement.textContent = formatCurrency(0);
        }
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
        }
        return;
    }

    // Carrinho não está vazio
    if (emptyMessage) {
        emptyMessage.style.display = 'none';
    }
    if (checkoutBtn) {
        checkoutBtn.disabled = false;
    }

    let grandTotal = 0;

    // Renderiza cada item do carrinho
    cart.forEach(item => {
        // Recalcula o total do item
        item.total = calculateItemTotal(item);
        grandTotal += item.total;

        // Procura por um elemento existente
        let itemElement = container.querySelector(`.cart-item[data-item-id="${item.id}"]`);

        if (!itemElement) {
            // Cria um novo elemento se não existir
            itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.dataset.itemId = item.id;
            container.appendChild(itemElement);
        }

        // Atualiza o conteúdo do elemento
        itemElement.innerHTML = createCartItemHTML(item);
    });

    // Remove itens que não estão mais no carrinho
    container.querySelectorAll('.cart-item').forEach(existingItem => {
        const itemId = existingItem.dataset.itemId;
        if (!cart.find(item => item.id === itemId)) {
            existingItem.remove();
        }
    });

    // Atualiza o total geral
    if (grandTotalElement) {
        grandTotalElement.textContent = formatCurrency(grandTotal);
    }

    // Salva o carrinho atualizado
    saveCart(cart);

    // Adiciona os event listeners
    attachCartEventListeners();
}

/**
 * Cria o HTML de um item do carrinho.
 * 
 * Exibe o preço base e a unidade base para referência do cliente.
 * 
 * @param {Object} item - Item do carrinho
 * @returns {string} HTML do item
 */
function createCartItemHTML(item) {
    const unitLabel = item.unit === 'un' ? `${item.quantity}` : `${item.quantity.toFixed(2)}`;
    
    return `
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-details">
            <h3 class="cart-item-name">${item.name}</h3>
            <p class="cart-item-category">${item.category}</p>
            <p class="cart-item-base-price">Preço base: ${formatCurrency(item.price)} / ${item.baseUnit}</p>
        </div>
        <div class="cart-item-controls">
            <div class="quantity-unit-group">
                <input type="number" 
                       class="item-quantity-input" 
                       value="${item.quantity}" 
                       min="0.01" 
                       step="${item.unit === 'g' ? '1' : (item.unit === 'un' ? '1' : '0.01')}"
                       data-item-id="${item.id}"
                       aria-label="Quantidade de ${item.name}">
                <select class="item-unit-select" data-item-id="${item.id}" aria-label="Unidade de ${item.name}">
                    <option value="kg" ${item.unit === 'kg' ? 'selected' : ''}>kg</option>
                    <option value="g" ${item.unit === 'g' ? 'selected' : ''}>g</option>
                    <option value="un" ${item.unit === 'un' ? 'selected' : ''}>un</option>
                </select>
            </div>
            <span class="item-total-price" data-item-id="${item.id}">${formatCurrency(item.total)}</span>
            <button class="remove-item-btn" data-item-id="${item.id}" aria-label="Remover ${item.name}">Remover</button>
        </div>
    `;
}

// ===================================================================
// FUNÇÕES DE EVENT LISTENERS
// ===================================================================

/**
 * Adiciona event listeners aos elementos do carrinho.
 */
function attachCartEventListeners() {
    // Listeners para mudança de quantidade
    document.querySelectorAll('.item-quantity-input').forEach(input => {
        input.removeEventListener('change', handleQuantityChange);
        input.removeEventListener('input', handleQuantityChange);
        input.addEventListener('change', handleQuantityChange);
        input.addEventListener('input', handleQuantityChange);
    });

    // Listeners para mudança de unidade
    document.querySelectorAll('.item-unit-select').forEach(select => {
        select.removeEventListener('change', handleUnitChange);
        select.addEventListener('change', handleUnitChange);
    });

    // Listeners para remoção de itens
    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.removeEventListener('click', handleRemoveItem);
        button.addEventListener('click', handleRemoveItem);
    });
}

/**
 * Manipula a mudança de quantidade de um item.
 * @param {Event} event - Evento de mudança
 */
function handleQuantityChange(event) {
    const itemId = event.target.dataset.itemId;
    const newQuantity = parseFloat(event.target.value);

    if (!isValidNumber(newQuantity)) {
        // Restaura o valor anterior se inválido
        const cart = loadCart();
        const item = cart.find(item => item.id === itemId);
        if (item) {
            event.target.value = item.quantity;
        }
        return;
    }

    updateCartItem(itemId, { quantity: newQuantity });
    renderCart();
}

/**
 * Manipula a mudança de unidade de um item.
 * @param {Event} event - Evento de mudança
 */
function handleUnitChange(event) {
    const itemId = event.target.dataset.itemId;
    const newUnit = event.target.value;

    // Ajusta o step do input de quantidade baseado na unidade
    const inputElement = document.querySelector(`.item-quantity-input[data-item-id="${itemId}"]`);
    if (inputElement) {
        if (newUnit === 'g' || newUnit === 'un') {
            inputElement.step = '1';
            if (newUnit === 'un') {
                inputElement.value = Math.max(1, Math.round(parseFloat(inputElement.value)));
            }
        } else {
            inputElement.step = '0.01';
        }
    }

    updateCartItem(itemId, { unit: newUnit });
    renderCart();
}

/**
 * Manipula a remoção de um item.
 * @param {Event} event - Evento de clique
 */
function handleRemoveItem(event) {
    event.preventDefault();
    const itemId = event.target.dataset.itemId;
    
    if (confirm('Tem certeza que deseja remover este item?')) {
        removeFromCart(itemId);
        renderCart();
    }
}

/**
 * Manipula o clique no botão de checkout.
 */
function handleCheckout() {
    const cart = loadCart();
    
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    // Redireciona para a página de checkout
    window.location.href = 'checkout.html';
}

// ===================================================================
// INICIALIZAÇÃO
// ===================================================================

/**
 * Inicializa o carrinho quando o DOM está pronto.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Renderiza o carrinho
    renderCart();

    // Adiciona listener ao botão de checkout
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.removeEventListener('click', handleCheckout);
        checkoutBtn.addEventListener('click', handleCheckout);
    }

    // Atualiza o contador do carrinho
    updateCartCount();
});

// ===================================================================
// FUNÇÕES PARA INTEGRAÇÃO COM LOJA (loja.html)
// ===================================================================

/**
 * Inicializa os listeners dos botões de adicionar ao carrinho.
 * Chamada na página da loja (loja.html).
 */
function initializeAddToCartButtons() {
    const addButtons = document.querySelectorAll('.add-to-cart-btn');
    
    addButtons.forEach(button => {
        button.removeEventListener('click', handleAddToCart);
        button.addEventListener('click', handleAddToCart);
    });

    // Atualiza o contador do carrinho
    updateCartCount();
}

/**
 * Manipula o clique no botão de adicionar ao carrinho.
 * @param {Event} event - Evento de clique
 */
function handleAddToCart(event) {
    event.preventDefault();
    event.stopPropagation();

    const button = event.target;
    const card = button.closest('.product-card');

    if (!card) {
        console.error('Card do produto não encontrado');
        return;
    }

    // Extrai os dados do produto do atributo data-*
    const product = {
        id: card.dataset.productId,
        name: card.dataset.productName,
        category: card.dataset.productCategory,
        price: parseFloat(card.dataset.productPrice),
        baseUnit: card.dataset.productBaseUnit || 'kg', // IMPORTANTE: Lê a unidade base
        image: card.dataset.productImage
    };

    // Validação básica
    if (!product.id || !product.name || isNaN(product.price)) {
        console.error('Dados do produto incompletos:', product);
        alert('Erro ao adicionar produto ao carrinho. Dados incompletos.');
        return;
    }

    if (!['kg', 'g', 'un'].includes(product.baseUnit)) {
        console.error('Unidade base inválida:', product.baseUnit);
        alert('Erro ao adicionar produto ao carrinho. Unidade base inválida.');
        return;
    }

    if (addToCart(product)) {
        alert(`"${product.name}" adicionado ao carrinho!`);
    } else {
        alert('Erro ao adicionar produto ao carrinho.');
    }
}

// Inicializa os botões de adicionar ao carrinho se estiver na página da loja
if (window.location.pathname.includes('loja.html') || window.location.pathname.endsWith('/')) {
    document.addEventListener('DOMContentLoaded', initializeAddToCartButtons);
}