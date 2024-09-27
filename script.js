const sheetId = '1mJbjNBsfJQmhThpFvaYchuvNslHtRBPWiV7fgzONJl8';
const apiKey = 'AIzaSyBUBfQAzykuAOrdQzJHR_RTVzK0R5HhFrM';
const sheetName = 'Pagina1';
 const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const headers = data.values[0];
                const products = data.values.slice(1);
                const catalogContainer = document.getElementById('catalog-container');
                const categorySelect = document.getElementById('category-select');
                const subcategorySelect = document.getElementById('subcategory-select');
                const vendorSelect = document.getElementById('vendor-select');
                const sendMessageBtn = document.getElementById('send-message-btn');
                
                const headerIndex = {
                    nome: headers.indexOf('nome'),
                    codigo: headers.indexOf('codigo'),
                    img: headers.indexOf('img'),
                    categoria: headers.indexOf('categoria'),
                    subcategoria: headers.indexOf('subcategoria')
                };
        
                if (Object.values(headerIndex).includes(-1)) {
                    console.error('Uma ou mais colunas necessárias não foram encontradas na planilha.');
                    return;
                }

                // Array de vendedores
                const vendors = [
                    { name: 'GUSTAVO', whatsapp: '+55038998853882' },
                    { name: 'GABRIEL', whatsapp: '+55038997299051' },
                    // Adicione mais vendedores conforme necessário
                ];

                // Preencher o seletor de vendedores
                vendors.forEach(vendor => {
                    const option = document.createElement('option');
                    option.value = vendor.whatsapp;
                    option.textContent = vendor.name;
                    vendorSelect.appendChild(option);
                });
        
                const categories = new Set();
                const subcategories = new Map();
        
                products.forEach(product => {
                    const category = product[headerIndex.categoria];
                    const subcategory = product[headerIndex.subcategoria];
        
                    categories.add(category);
                    if (category && subcategory) {
                        if (!subcategories.has(category)) {
                            subcategories.set(category, new Set());
                        }
                        subcategories.get(category).add(subcategory);
                    }
                });
        
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    categorySelect.appendChild(option);
                });
        
                const allOption = document.createElement('option');
                allOption.value = '';
                allOption.textContent = 'Todas as subcategorias';
                subcategorySelect.appendChild(allOption);
        
                function updateSubcategories() {
                    const selectedCategory = categorySelect.value;
                    subcategorySelect.innerHTML = '<option value="">Escolha uma subcategoria</option>';
        
                    if (selectedCategory) {
                        const subcategoriesForCategory = subcategories.get(selectedCategory);
                        if (subcategoriesForCategory) {
                            subcategoriesForCategory.forEach(subcategory => {
                                const option = document.createElement('option');
                                option.value = subcategory;
                                option.textContent = subcategory;
                                subcategorySelect.appendChild(option);
                            });
                        }
                        subcategorySelect.style.display = 'block';
                    } else {
                        subcategorySelect.style.display = 'none';
                    }
                }
        
                function displayProducts(productsToDisplay) {
                    catalogContainer.innerHTML = '';
                    productsToDisplay.forEach(product => {
                        const nome = product[headerIndex.nome];
                        const codigo = product[headerIndex.codigo];
                        const img = product[headerIndex.img];
        
                        const card = document.createElement('div');
                        card.className = 'card';
        
                        card.innerHTML = `
                            <img src="${img}" alt="${nome}">
                            <div class="card-content">
                                <h3>${nome}</h3>
                                <p class="product-code">Código: ${codigo}</p>
                                <div class="card-actions">
                                    <input type="number" class="quantity-input" value="1" min="1">
                                    <button class="add-to-cart-btn" data-product='${JSON.stringify(product)}'>Adicionar</button>
                                </div>
                            </div>
                        `;
        
                        catalogContainer.appendChild(card);
                        card.querySelector('img').addEventListener('click', () => {
                            document.getElementById('modal-image').src = img;
                            document.getElementById('image-modal').style.display = 'flex';
                        });

                        // Evento para fechar o modal ao clicar
                        document.getElementById('image-modal').addEventListener('click', () => {
                            document.getElementById('image-modal').style.display = 'none';
                        });

                    });
        
                    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                        button.addEventListener('click', addToCart);
                    });
                }
        
                function filterProducts() {
                    const selectedCategory = document.getElementById('category-select').value;
                    const selectedSubcategory = document.getElementById('subcategory-select').value;
        
                    const filteredProducts = products.filter(product => {
                        const productCategory = product[headerIndex.categoria];
                        const productSubcategory = product[headerIndex.subcategoria];
                        return (selectedCategory === '' || productCategory === selectedCategory) &&
                               (selectedSubcategory === '' || productSubcategory === selectedSubcategory);
                    });
        
                    displayProducts(filteredProducts);
                }
                    const searchInput = document.getElementById('search-input');

                    searchInput.addEventListener('input', () => {
                            const searchTerm = searchInput.value.toLowerCase();
                            const filteredProducts = products.filter(product => {
                            const productName = product[headerIndex.nome].toLowerCase();
                            const productCode = product[headerIndex.codigo].toLowerCase();
                            return productName.includes(searchTerm) || productCode.includes(searchTerm);
                        });
                        displayProducts(filteredProducts);
                    });

        
                categorySelect.addEventListener('change', () => {
                    updateSubcategories();
                    filterProducts();
                });
        
                subcategorySelect.addEventListener('change', filterProducts);
        
                displayProducts(products);

                // Cart functionality
                let cart = [];

                function addToCart(event) {
                    const product = JSON.parse(event.target.getAttribute('data-product'));
                    const quantity = parseInt(event.target.previousElementSibling.value);
                    
                    const existingItem = cart.find(item => item.product[headerIndex.codigo] === product[headerIndex.codigo]);
                    
                    if (existingItem) {
                        existingItem.quantity += quantity;
                    } else {
                        cart.push({ product, quantity });
                    }
                    
                    updateCartDisplay();
                    updateCartCount(); // Atualiza a contagem aqui
                    Toastify({
                        text: `Produto adicionado: ${product[headerIndex.nome]} (Quantidade: ${quantity})`,
                        duration: 3000, // Tempo em milissegundos
                        close: true,
                        gravity: "top", // "top" ou "bottom"
                        position: 'right', // "left", "center" ou "right"
                        backgroundColor: "#28a745",
                    }).showToast();

                    function updateCartCount() {
                        const cartCount = document.getElementById('cart-count');
                        cartCount.textContent = cart.length; // Atualiza a contagem com o número de produtos únicos
                    }


                }


                function updateCartDisplay() {
                    const cartItems = document.getElementById('cart-items');
                    cartItems.innerHTML = '';
                    
                    cart.forEach(item => {
                        const cartItem = document.createElement('div');
                        cartItem.className = 'cart-item';
                        cartItem.innerHTML = `
                            <span>${item.product[headerIndex.nome]} (${item.quantity})</span>
                            <button class="remove-item" data-code="${item.product[headerIndex.codigo]}">Remover</button>
                        `;
                        cartItems.appendChild(cartItem);
                    });

                    document.querySelectorAll('.remove-item').forEach(button => {
                        button.addEventListener('click', removeFromCart);
                    });
                }

                function removeFromCart(event) {
                    const codeToRemove = event.target.getAttribute('data-code');
                    cart = cart.filter(item => item.product[headerIndex.codigo] !== codeToRemove);
                    updateCartDisplay();
                }

                const cartIcon = document.getElementById('cart-icon');
                const cartContainer = document.getElementById('cart-container');
                const closeCart = document.getElementById('close-cart');

                cartIcon.addEventListener('click', () => {
                    cartContainer.classList.add('open');
                });

                closeCart.addEventListener('click', () => {
                    cartContainer.classList.remove('open');
                });

                const showAllButton = document.getElementById('show-all');
                showAllButton.addEventListener('click', () => {
                    categorySelect.value = '';
                    subcategorySelect.value = '';
                    subcategorySelect.style.display = 'none';
                    displayProducts(products);
                });

                function sendMessage() {
                    const selectedVendor = vendorSelect.value;
                    
                    if (!selectedVendor) {
                        alert('Por favor, escolha um vendedor.');
                        return;
                    }

                    if (cart.length === 0) {
                        alert('O carrinho está vazio.');
                        return;
                    }

                    let message = 'Olá, gostaria de fazer um pedido:\n\n';
                    cart.forEach(item => {
                        message += `•(Código: ${item.product[headerIndex.codigo]}) - Quantidade: ${item.quantity}\n`;
                    });

                    const encodedMessage = encodeURIComponent(message);
                    const whatsappUrl = `https://api.whatsapp.com/send?phone=${selectedVendor}&text=${encodedMessage}`;

                    window.open(whatsappUrl, '_blank');
                }

                sendMessageBtn.addEventListener('click', sendMessage);
            })
     .catch(error => console.error('Erro ao buscar dados:', error));
