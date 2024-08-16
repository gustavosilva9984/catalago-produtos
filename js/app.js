document.addEventListener('DOMContentLoaded', () => {
    async function carregarProdutos() {
        try {
            const response = await fetch('produtos.json');
            const produtos = await response.json();

            const produtosContainer = document.getElementById('produtos');
            produtos.forEach(produto => {
                const produtoElemento = document.createElement('div');
                produtoElemento.className = 'produto';
                produtoElemento.innerHTML = `
                    <h2>${produto.nome}</h2>
                    <p>${produto.descricao}</p>
                    <p><strong>${produto.preco}</strong></p>
                    <img src="${produto.imagem}" alt="${produto.nome}">
                `;
                produtosContainer.appendChild(produtoElemento);
            });
        } catch (error) {
            console.error('Erro ao carregar os produtos:', error);
        }
    }

    carregarProdutos();
});
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/js/service-worker.js')
            .then(registration => {
                console.log('Service Worker registrado com sucesso:', registration);
            })
            .catch(error => {
                console.log('Falha ao registrar o Service Worker:', error);
            });
    });
}
// Abrir ou criar um banco de dados IndexedDB
let db;

const request = indexedDB.open('catalogo-produtos-db', 1);

request.onupgradeneeded = event => {
    db = event.target.result;

    // Criar um armazenamento de objetos
    const objectStore = db.createObjectStore('produtos', { keyPath: 'id' });

    // Criar índices, se necessário
    objectStore.createIndex('nome', 'nome', { unique: false });
};

request.onsuccess = event => {
    db = event.target.result;
    console.log('Banco de dados IndexedDB aberto com sucesso!');
};

request.onerror = event => {
    console.error('Erro ao abrir IndexedDB:', event.target.errorCode);
};
function adicionarProduto(produto) {
    const transaction = db.transaction(['produtos'], 'readwrite');
    const objectStore = transaction.objectStore('produtos');
    const request = objectStore.add(produto);

    request.onsuccess = () => {
        console.log('Produto adicionado com sucesso!');
    };

    request.onerror = event => {
        console.error('Erro ao adicionar produto:', event.target.errorCode);
    };
}

// Exemplo de uso
adicionarProduto({
    id: 1,
    nome: 'Banana',
    descricao: 'Banana orgânica, rica em potássio.',
    preco: 'R$ 5,00',
    imagem: '/images/banana.jpg'
});
function obterProduto(id) {
    const transaction = db.transaction(['produtos'], 'readonly');
    const objectStore = transaction.objectStore('produtos');
    const request = objectStore.get(id);

    request.onsuccess = event => {
        const produto = event.target.result;
        console.log('Produto obtido:', produto);
    };

    request.onerror = event => {
        console.error('Erro ao obter produto:', event.target.errorCode);
    };
}

// Exemplo de uso
obterProduto(1);
function atualizarProduto(produto) {
    const transaction = db.transaction(['produtos'], 'readwrite');
    const objectStore = transaction.objectStore('produtos');
    const request = objectStore.put(produto);

    request.onsuccess = () => {
        console.log('Produto atualizado com sucesso!');
    };

    request.onerror = event => {
        console.error('Erro ao atualizar produto:', event.target.errorCode);
    };
}

// Exemplo de uso
atualizarProduto({
    id: 1,
    nome: 'Banana',
    descricao: 'Banana orgânica, rica em potássio e amadurecida.',
    preco: 'R$ 5,50',
    imagem: '/images/banana.jpg'
});
function deletarProduto(id) {
    const transaction = db.transaction(['produtos'], 'readwrite');
    const objectStore = transaction.objectStore('produtos');
    const request = objectStore.delete(id);

    request.onsuccess = () => {
        console.log('Produto deletado com sucesso!');
    };

    request.onerror = event => {
        console.error('Erro ao deletar produto:', event.target.errorCode);
    };
}

// Exemplo de uso
deletarProduto(1);
function consultarPorNome(nome) {
    const transaction = db.transaction(['produtos'], 'readonly');
    const objectStore = transaction.objectStore('produtos');
    const index = objectStore.index('nome');
    const request = index.getAll(nome);

    request.onsuccess = event => {
        const produtos = event.target.result;
        console.log('Produtos encontrados:', produtos);
    };

    request.onerror = event => {
        console.error('Erro ao consultar produtos:', event.target.errorCode);
    };
}

// Exemplo de uso
consultarPorNome('Banana');
