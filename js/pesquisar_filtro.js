// js/pesquisar_filtro.js

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const productCardsContainer = document.getElementById('productCardsContainer');

    // 1. Armazenar os produtos iniciais (estáticos)
    const initialProducts = Array.from(productCardsContainer.querySelectorAll('.product-card')).map(card => {
        return {
            id: card.dataset.productId,
            name: card.dataset.productName,
            category: card.dataset.productCategory,
            price: card.dataset.productPrice,
            image: card.dataset.productImage,
            element: card // Referência ao elemento DOM original
        };
    });

    // 2. Simular um "catálogo" de produtos que podem ser pesquisados, mas não estão na página
    const dynamicCatalog = [
        { id: '6', name: 'Manga', category: 'Fruta', price: '8.50', image: 'img/manga.png' },
        { id: '7', name: 'Cenoura', category: 'Raiz', price: '3.90', image: 'img/cenoura.png' },
        { id: '8', name: 'Couve', category: 'Verdura', price: '2.50', image: 'img/couve.png' },
        { id: '9', name: 'Limão', category: 'Fruta', price: '4.00', image: 'img/limao.png' },
        // Adicione mais produtos dinâmicos aqui
    ];

    // Função para renderizar um card de produto
    function createProductCard(product) {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.dataset.productId = product.id;
        card.dataset.productName = product.name;
        card.dataset.productCategory = product.category;
        card.dataset.productPrice = product.price;
        card.dataset.productImage = product.image;

        card.innerHTML = `
            <div class="product-image-placeholder">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info-overlay">
                <h3 class="product-name">${product.name}</h3>
                <h3 class="product-description">${product.category}</br>${parseFloat(product.price).toFixed(2).replace('.', ',')} R$</h3>
            </div>
            <button class="add-to-cart-btn" data-product-id="${product.id}">+</button>
        `;

        // Adiciona o event listener de adicionar ao carrinho
        const addButton = card.querySelector('.add-to-cart-btn');
        addButton.addEventListener('click', (event) => {
            event.stopPropagation(); 
            // A função addToCart é definida em script.js, que deve ser carregado antes
            if (typeof addToCart === 'function') {
                addToCart({
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    image: product.image
                });
            } else {
                console.error("Função addToCart não encontrada. Verifique a ordem dos scripts.");
            }
        });

        return card;
    }

    // Função principal de filtragem e exibição
    function filterProducts() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        // 1. Limpar o container de cards (remover dinâmicos e esconder estáticos)
        productCardsContainer.innerHTML = '';
        
        // 2. Filtrar produtos estáticos (os que já estavam no HTML)
        const filteredStaticProducts = initialProducts.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(searchTerm);
            const categoryMatch = product.category.toLowerCase().includes(searchTerm);
            return nameMatch || categoryMatch;
        });

        // 3. Filtrar produtos dinâmicos (os que estão no catálogo simulado)
        const filteredDynamicProducts = dynamicCatalog.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(searchTerm);
            const categoryMatch = product.category.toLowerCase().includes(searchTerm);
            return nameMatch || categoryMatch;
        });
        
        // 4. Combinar e exibir os resultados
        
        // Exibe os produtos estáticos (reutilizando o elemento DOM original)
        filteredStaticProducts.forEach(product => {
            // Re-adiciona o elemento DOM original ao container
            productCardsContainer.appendChild(product.element);
        });

        // Cria e exibe os cards dos produtos dinâmicos
        filteredDynamicProducts.forEach(product => {
            const newCard = createProductCard(product);
            productCardsContainer.appendChild(newCard);
        });

        // Se o termo de busca estiver vazio, exibe todos os estáticos
        if (searchTerm === '') {
            initialProducts.forEach(product => {
                productCardsContainer.appendChild(product.element);
            });
        }
        
        // Se o termo de busca não for vazio, mas não houver resultados
        if (searchTerm !== '' && filteredStaticProducts.length === 0 && filteredDynamicProducts.length === 0) {
             productCardsContainer.innerHTML = '<p style="width: 100%; text-align: center; margin-top: 20px;">Nenhum produto encontrado com o termo: "' + searchInput.value + '"</p>';
        }
    }

    // Event Listeners
    searchButton.addEventListener('click', filterProducts);
    searchInput.addEventListener('keyup', (event) => {
        // Filtra ao digitar, ou ao pressionar Enter
        if (searchInput.value.trim() === '' || event.key === 'Enter') {
            filterProducts();
        }
    });

    // Inicializa a exibição (garantindo que todos os estáticos estejam visíveis ao carregar)
    filterProducts();
});