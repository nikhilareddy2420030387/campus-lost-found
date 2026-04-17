// script.js
document.addEventListener('DOMContentLoaded', () => {

    const BASE_URL = "https://campus-lost-found-8v49.onrender.com"; // ✅ ADDED

    // Login Screen Logic
    const loginForm = document.getElementById('login-form');
    const loginTabs = document.querySelectorAll('.login-tab');
    const usernameLabel = document.querySelector('label[for="username"]');
    const usernameInput = document.getElementById('username');
    const loginScreen = document.getElementById('login-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');

    const errorModal = document.getElementById('error-modal');
    const errorModalMsg = document.getElementById('error-modal-msg');
    const closeErrorModal = document.getElementById('close-error-modal');

    const imageModal = document.getElementById('image-modal');
    const imageModalContent = document.getElementById('image-modal-content');
    const closeImageModal = document.getElementById('close-image-modal');

    const infoModal = document.getElementById('info-modal');
    const infoModalTitle = document.getElementById('info-modal-title');
    const infoModalContent = document.getElementById('info-modal-content');
    const closeInfoModal = document.getElementById('close-info-modal');

    closeInfoModal.addEventListener('click', () => {
        infoModal.classList.add('hidden');
    });

    window.openImageModal = (src) => {
        imageModalContent.src = src;
        imageModal.classList.remove('hidden');
    };

    closeImageModal.addEventListener('click', () => {
        imageModal.classList.add('hidden');
    });

    function showErrorPopup(message) {
        errorModalMsg.textContent = message;
        errorModal.classList.remove('hidden');
        errorModal.style.display = 'flex';
    }

    closeErrorModal.addEventListener('click', () => {
        errorModal.classList.add('hidden');
        errorModal.style.display = 'none';
    });

    loginTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            loginTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            usernameLabel.textContent = tab.dataset.type === 'student' ? 'Student ID' : 'Staff ID';
            usernameInput.placeholder = tab.dataset.type === 'student' ? 'Enter your Student ID' : 'Enter your Staff ID';
        });
    });

    // LOGIN
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = usernameInput.value.trim();
        const password = document.getElementById('password').value;
        const role = document.querySelector('.login-tab.active')?.dataset.type || 'student';

        try {
            const response = await fetch(`${BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, password, role })
            });

            const data = await response.json();

            if (data.success) {
                loginScreen.classList.add('hidden');
                dashboardScreen.classList.remove('hidden');

                data.user.email = `${id}@klh.edu.in`;
                localStorage.setItem('campusConnectUser', JSON.stringify(data.user));

                updateProfileUI(data.user);
            } else {
                showErrorPopup('Invalid Credentials');
            }

        } catch (err) {
            showErrorPopup('Unable to connect to server');
        }
    });

    // ITEMS
    let items = [];

    async function fetchItems() {
        const res = await fetch(`${BASE_URL}/api/items`);
        items = await res.json();
        renderItems();
    }

    fetchItems();

    const itemForm = document.getElementById('item-form');

    itemForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem('campusConnectUser'));

        const newItem = {
            name: document.getElementById('itemName').value,
            category: document.getElementById('category').value,
            location: document.getElementById('location').value,
            description: document.getElementById('description').value,
            reportedBy: user.email
        };

        const res = await fetch(`${BASE_URL}/api/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem)
        });

        const data = await res.json();
        items.unshift(data.item);
        renderItems();
    });

    window.claimItem = async (id) => {
        const user = JSON.parse(localStorage.getItem('campusConnectUser'));

        await fetch(`${BASE_URL}/api/items/${id}/claim`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ claimedBy: user.email })
        });

        fetchItems();
    };

    window.markAsRecovered = async (id) => {
        await fetch(`${BASE_URL}/api/items/${id}/recover`, {
            method: 'PUT'
        });

        fetchItems();
    };

    function updateProfileUI(user) {
        document.getElementById('userEmailDisplay').textContent = user.email;
    }

    function renderItems() {
        const list = document.getElementById('item-list');
        list.innerHTML = '';

        items.forEach(item => {
            const div = document.createElement('div');
            div.innerHTML = `
                <h3>${item.name}</h3>
                <p>${item.location}</p>
                <button onclick="claimItem(${item.id})">Claim</button>
            `;
            list.appendChild(div);
        });
    }
});