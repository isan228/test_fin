const API_URL = '/api';

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadKeys();
    loadPayments();
    
    // Обработчик формы создания ключа
    document.getElementById('createKeyForm').addEventListener('submit', handleCreateKey);
});

// Загрузка списка ключей
async function loadKeys() {
    try {
        const response = await fetch(`${API_URL}/keys`);
        const result = await response.json();
        
        const keysList = document.getElementById('keysList');
        
        if (result.success && result.data.length > 0) {
            keysList.innerHTML = result.data.map(key => createKeyCard(key)).join('');
            
            // Добавляем обработчики для кнопок
            result.data.forEach(key => {
                const toggleBtn = document.getElementById(`toggle-${key.id}`);
                const deleteBtn = document.getElementById(`delete-${key.id}`);
                
                if (toggleBtn) {
                    toggleBtn.addEventListener('click', () => toggleKey(key.id, !key.isActive));
                }
                
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => deleteKey(key.id));
                }
            });
        } else {
            keysList.innerHTML = '<div class="empty">Нет созданных ключей</div>';
        }
    } catch (error) {
        console.error('Ошибка загрузки ключей:', error);
        document.getElementById('keysList').innerHTML = 
            '<div class="alert alert-error show">Ошибка загрузки ключей: ' + error.message + '</div>';
    }
}

// Загрузка списка платежей
async function loadPayments() {
    try {
        const response = await fetch(`${API_URL}/payments`);
        const result = await response.json();
        
        const paymentsList = document.getElementById('paymentsList');
        
        if (result.success && result.data.length > 0) {
            paymentsList.innerHTML = result.data.map(payment => createPaymentCard(payment)).join('');
        } else {
            paymentsList.innerHTML = '<div class="empty">Нет платежей</div>';
        }
    } catch (error) {
        console.error('Ошибка загрузки платежей:', error);
        document.getElementById('paymentsList').innerHTML = 
            '<div class="empty">Ошибка загрузки платежей</div>';
    }
}

// Создание карточки ключа
function createKeyCard(key) {
    const publicKeyShort = key.publicKey.length > 50 
        ? key.publicKey.substring(0, 50) + '...' 
        : key.publicKey;
    
    const privateKeyShort = key.privateKey.length > 50 
        ? key.privateKey.substring(0, 50) + '...' 
        : key.privateKey;
    
    return `
        <div class="key-item">
            <div class="key-header">
                <div class="key-name">${escapeHtml(key.name)}</div>
                <span class="key-status ${key.isActive ? 'status-active' : 'status-inactive'}">
                    ${key.isActive ? 'Активен' : 'Неактивен'}
                </span>
            </div>
            ${key.description ? `<div class="key-info">${escapeHtml(key.description)}</div>` : ''}
            <div class="key-info">
                <strong>Public Key:</strong>
                <div class="key-value">${escapeHtml(publicKeyShort)}</div>
            </div>
            <div class="key-info">
                <strong>Private Key:</strong>
                <div class="key-value">${escapeHtml(privateKeyShort)}</div>
            </div>
            <div class="key-info">
                <small>Создан: ${new Date(key.createdAt).toLocaleString('ru-RU')}</small>
            </div>
            <div class="key-actions">
                <button class="btn btn-small ${key.isActive ? 'btn-success' : 'btn-primary'}" 
                        id="toggle-${key.id}">
                    ${key.isActive ? 'Деактивировать' : 'Активировать'}
                </button>
                <button class="btn btn-small btn-danger" id="delete-${key.id}">
                    Удалить
                </button>
            </div>
        </div>
    `;
}

// Создание карточки платежа
function createPaymentCard(payment) {
    return `
        <div class="payment-item">
            <div class="key-header">
                <div class="key-name">Платеж #${payment.paymentId}</div>
                <span class="payment-status status-${payment.status}">
                    ${getStatusText(payment.status)}
                </span>
            </div>
            <div class="key-info">
                <strong>Сумма:</strong> ${payment.amount} ${payment.currency}
            </div>
            ${payment.apiKey ? `<div class="key-info"><strong>API ключ:</strong> ${escapeHtml(payment.apiKey.name)}</div>` : ''}
            <div class="key-info">
                <small>Создан: ${new Date(payment.createdAt).toLocaleString('ru-RU')}</small>
            </div>
        </div>
    `;
}

// Обработка создания ключа
async function handleCreateKey(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('keyName').value,
        publicKey: document.getElementById('publicKey').value.trim(),
        privateKey: document.getElementById('privateKey').value.trim(),
        description: document.getElementById('description').value.trim()
    };
    
    try {
        const response = await fetch(`${API_URL}/keys`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Ключ успешно создан!', 'success');
            document.getElementById('createKeyForm').reset();
            loadKeys();
        } else {
            showAlert('Ошибка: ' + result.error, 'error');
        }
    } catch (error) {
        showAlert('Ошибка создания ключа: ' + error.message, 'error');
    }
}

// Переключение статуса ключа
async function toggleKey(id, currentStatus) {
    try {
        const response = await fetch(`${API_URL}/keys/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isActive: !currentStatus })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Статус ключа обновлен!', 'success');
            loadKeys();
        } else {
            showAlert('Ошибка: ' + result.error, 'error');
        }
    } catch (error) {
        showAlert('Ошибка обновления ключа: ' + error.message, 'error');
    }
}

// Удаление ключа
async function deleteKey(id) {
    if (!confirm('Вы уверены, что хотите удалить этот ключ?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/keys/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Ключ удален!', 'success');
            loadKeys();
        } else {
            showAlert('Ошибка: ' + result.error, 'error');
        }
    } catch (error) {
        showAlert('Ошибка удаления ключа: ' + error.message, 'error');
    }
}

// Показать уведомление
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} show`;
    alert.textContent = message;
    
    const card = document.querySelector('.card');
    card.insertBefore(alert, card.firstChild);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Получить текст статуса
function getStatusText(status) {
    const statusMap = {
        'pending': 'Ожидает',
        'success': 'Успешно',
        'failed': 'Ошибка',
        'cancelled': 'Отменен'
    };
    return statusMap[status] || status;
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}




