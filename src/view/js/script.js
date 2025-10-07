const API_BASE_URL = 'http://192.168.1.5:3000';
let itens = [];
let currentEditItem = null;

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => { notification.classList.remove('show');}, 2500);
}

function loadItems() {
    const list = document.getElementById('itemList');
    list.innerHTML = '<li class="loading">Carregando...</li>';

    fetch(`${API_BASE_URL}/getItems`).then(response => {
        if (!response.ok) throw new Error('Servidor não encontrado');
        return response.json();
    }).then(data => {
        if (data && data.length > 0) itens = data;
        else if(data.length == 0) itens = [];
        exibirItens();
    }).catch(error => {
        console.log('Usando dados locais:', error.message);
        exibirItens();
    });
}

function exibirItens() {
    const list = document.getElementById('itemList');
    list.innerHTML = '';

    if (itens.length === 0) {
        list.innerHTML = `
            <li class="empty-state">
                <div class="empty-icon">🛒</div>
                <p>Nenhum item na lista</p>
            </li>
        `;
        return;
    }

    itens.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'item-card';
        const itemName = item.name || item.itemName;
        const quantity = item.quantity || 1;
        const price = parseFloat(item.price)|| 0;
        const totalItemPrice = price * quantity;

        li.innerHTML = `
            <div class="item-info">
                <div class="item-name">${itemName}</div>
                <div class="item-details">${quantity} un. • R$ ${price.toFixed(2).replace('.', ',')}</div>
            </div>
            <div class="item-price">R$ ${totalItemPrice.toFixed(2).replace('.', ',')}</div>
        `;

        li.onclick = () => openEditModal(item);
        list.appendChild(li);
    });
}

function openEditModal(item) {
    currentEditItem = item;
    document.getElementById('editName').value = item.name || item.itemName;
    document.getElementById('editQuantity').value = item.quantity || 1;
    document.getElementById('editPrice').value = item.price || 0;
    document.getElementById('editModal').classList.add('show');
}

function closeModal() {
    document.getElementById('editModal').classList.remove('show');
    currentEditItem = null;
}

function deleteItem() {
    if (!currentEditItem) return;
    console.log(currentEditItem);

    const itemName = currentEditItem.name || currentEditItem.itemName;

    fetch(`${API_BASE_URL}/deleteItem?itemNameDelete=${encodeURIComponent(itemName)}`, {
        method: 'GET',
    }).then(response => {
        if (!response.ok) throw new Error('Servidor não disponível');
        return response.text();
    }).then(() => {
        itens = itens.filter(item =>
            (item.name || item.itemName).toLowerCase() !== itemName.toLowerCase()
        );
        loadItems();
        closeModal();
        showNotification('Item removido');
    }).catch(error => {
        console.log('Processando localmente:', error.message);
        itens = itens.filter(item =>
            (item.name || item.itemName).toLowerCase() !== itemName.toLowerCase()
        );
        loadItems();
        closeModal();
        showNotification('Item removido');
    });
}

function clearFields(){
    document.getElementById('productName').value = '';
    document.getElementById('productQuantity').value = '1';
    document.getElementById('productPrice').value = '0';
}

document.getElementById('addForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const itemName = document.getElementById('productName').value.trim();
    const itemQuantity = Number(document.getElementById('productQuantity').value);
    const itemPrice = document.getElementById('productPrice').value;

    if (!itemName) return;

    fetch(`${API_BASE_URL}/addItem?itemNameAdd=${encodeURIComponent(itemName)}&itemQuantity=${encodeURIComponent(itemQuantity)}&itemPrice=${encodeURIComponent(itemPrice)}`, {
        method: 'GET',
    }).then(response => {
        if (!response.ok) throw new Error('Servidor não disponível');
        return response.text();
    }).then(() => {
        itens.push({
            name: itemName,
            quantity: itemQuantity,
            price: itemPrice
        });
        loadItems();
        clearFields();
        showNotification('Item adicionado');
    }).catch(error => {
        console.log('Processando localmente:', error.message);
        itens.push({
            name: itemName,
            quantity: itemQuantity,
            price: itemPrice
        });
        loadItems();
        clearFields();
        showNotification('Item adicionado');
    });
});

document.getElementById('editForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const itemName = currentEditItem.name || currentEditItem.itemName;
    const itemNameUpdate = document.getElementById('editName').value.trim();
    const quantity = document.getElementById('editQuantity').value;
    const price = document.getElementById('editPrice').value;

    fetch(`${API_BASE_URL}/updateItem?itemName=${encodeURIComponent(itemName)}&itemNameUpdate=${encodeURIComponent(itemNameUpdate)}&itemQuantity=${quantity}&itemPrice=${price}`, {
        method: 'GET',
    }).then(response => {
        if (!response.ok) throw new Error('Servidor não disponível');
        return response.text();
    }).then(() => {
        const itemIndex = itens.findIndex(item =>
            (item.name || item.itemName).toLowerCase() === itemName.toLowerCase()
        );

        if (itemIndex !== -1) {
            itens[itemIndex].name = itemName;
            itens[itemIndex].quantity = parseInt(quantity);
            itens[itemIndex].price = parseFloat(price);
        }

        loadItems();
        closeModal();
        showNotification('Item atualizado');
    }).catch(error => {
        console.log('Erro:', error.message);
        loadItems();
        closeModal();
        showNotification('Item atualizado');
    });
});

document.getElementById("btnDelete").addEventListener('click', function(e){
    const itemName = currentEditItem.name || currentEditItem.itemName;

    fetch(`${API_BASE_URL}/deleteItem?itemNameDelete=${encodeURIComponent(itemName)}`,{
        method: 'GET',
    }).then(response => {
        if (!response.ok) throw new Error('Servidor não disponível');
        return response.text();
    }).then(() => {
        loadItems();
        closeModal();
        showNotification('Item deletado');
    }).catch(error => {
        console.log('Erro:', error.message);
        loadItems();
        closeModal();
        showNotification('Item deletado');
    })
});

document.getElementById('editModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

document.getElementById("btnCancel").addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

document.addEventListener('DOMContentLoaded', loadItems);