// script.js
document.addEventListener('DOMContentLoaded', () => {
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

    // Image Modal Logic
    const imageModal = document.getElementById('image-modal');
    const imageModalContent = document.getElementById('image-modal-content');
    const closeImageModal = document.getElementById('close-image-modal');

    // Info Modal Logic
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

    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.classList.add('hidden');
        }
    });

    function showErrorPopup(message) {
        errorModalMsg.textContent = message;
        errorModal.classList.remove('hidden');
        errorModal.style.display = 'flex'; // Override any conflicting hidden classes
    }

    closeErrorModal.addEventListener('click', () => {
        errorModal.classList.add('hidden');
        errorModal.style.display = 'none';
    });

    loginTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            loginTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (tab.dataset.type === 'student') {
                usernameLabel.textContent = 'Student ID';
                usernameInput.placeholder = 'Enter your Student ID';
            } else {
                usernameLabel.textContent = 'Staff ID';
                usernameInput.placeholder = 'Enter your Staff ID';
            }
        });
    });

    // --- Auth Logic ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = usernameInput.value.trim();
        const password = document.getElementById('password').value;
        const activeTab = document.querySelector('.login-tab.active');
        const role = activeTab ? activeTab.dataset.type : 'student';
        const submitBtn = e.target.querySelector('button');

        if (id && password) {
            // Show loading state
            submitBtn.innerHTML = 'Logging in...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, password, role })
                });

                const data = await response.json();

                if (data.success) {
                    // Successful Login
                    loginScreen.classList.add('hidden');
                    dashboardScreen.classList.remove('hidden');

                    // Clear inputs
                    usernameInput.value = '';
                    document.getElementById('password').value = '';

                    // Format email
                    data.user.email = `${id}@klh.edu.in`;

                    // Store simple user session info
                    localStorage.setItem('campusConnectUser', JSON.stringify(data.user));

                    // Update Profile UI
                    updateProfileUI(data.user);
                } else {
                    // Return Error Message
                    showErrorPopup('Invalid Credentials');
                }
            } catch (error) {
                console.error('Login Error:', error);
                showErrorPopup('Unable to connect to the server. Please ensure the backend is running.');
            } finally {
                // Restore button state
                submitBtn.innerHTML = 'Login';
                submitBtn.disabled = false;
            }
        } else {
            showErrorPopup('Please enter both ID and Password.');
        }
    });

    // Dashboard Form Logic
    const itemForm = document.getElementById('item-form');
    const itemList = document.getElementById('item-list');
    const searchInput = document.getElementById('searchInput');
    const filterType = document.getElementById('filterType');
    const filterCategory = document.getElementById('filterCategory');

    let items = [];

    // Profile UI Setup
    const updateProfileUI = (user) => {
        if (!user) return;
        const email = user.email || `${user.id}@klh.edu.in`;
        user.email = email; // Fallback update

        document.getElementById('userEmailDisplay').textContent = user.email;
        document.getElementById('userRoleDisplay').textContent = user.role === 'admin' ? 'Admin' : (user.role === 'staff' ? 'Staff' : 'Student');
        document.getElementById('avatarInitials').textContent = user.email.charAt(0).toUpperCase();
    };

    // Initialize profile if already logged in (testing convenience)
    const existingUser = JSON.parse(localStorage.getItem('campusConnectUser'));
    if (existingUser) updateProfileUI(existingUser);

    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            profileMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
                profileMenu.classList.add('hidden');
            }
        });
    }

    const menuLogout = document.getElementById('menuLogout');
    if (menuLogout) {
        menuLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('campusConnectUser');
            dashboardScreen.classList.add('hidden');
            loginScreen.classList.remove('hidden');
            profileMenu.classList.add('hidden');
        });
    }

    // Info Modal content generators
    const menuProfile = document.getElementById('menuProfile');
    const menuClaims = document.getElementById('menuClaims');
    const menuReports = document.getElementById('menuReports');

    if (menuProfile) {
        menuProfile.addEventListener('click', (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('campusConnectUser'));
            if (!user) return;
            infoModalTitle.textContent = "My Profile";
            const roleLabel = user.role === 'admin' ? 'Admin' : (user.role === 'staff' ? 'Staff' : 'Student');
            infoModalContent.innerHTML = `
                <div style="padding: 16px; background: #f8fafc; border-radius: 8px; margin-bottom: 12px; border: 2px solid #e2e8f0;">
                    <p style="margin-bottom: 8px;"><strong>Role:</strong> ${roleLabel}</p>
                    <p style="margin-bottom: 8px;"><strong>ID (Roll No):</strong> ${user.id}</p>
                    <p><strong>University Email:</strong> ${user.email}</p>
                </div>
            `;
            infoModal.classList.remove('hidden');
            profileMenu.classList.add('hidden');
        });
    }

    if (menuClaims) {
        menuClaims.addEventListener('click', (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('campusConnectUser'));
            if (!user) return;
            infoModalTitle.textContent = "My Claims";
            const myClaims = items.filter(i => i.claimedBy === user.email);

            if (myClaims.length === 0) {
                infoModalContent.innerHTML = '<p>You have not claimed any items yet.</p>';
            } else {
                let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
                myClaims.forEach(i => {
                    html += `
                        <div style="padding: 12px; background: #f8fafc; border-radius: 8px; border: 2px solid #e2e8f0;">
                            <h4 style="color:#0f172a; margin-bottom: 4px;">${escapeHTML(i.name)}</h4>
                            <p style="font-size: 0.85rem; margin-bottom: 4px;"><strong>Location:</strong> ${escapeHTML(i.location)}</p>
                            <p style="font-size: 0.85rem;"><strong>Status:</strong> <span style="color:var(--primary); font-weight:600;">${i.recovered ? 'Recovered' : 'Claimed'}</span></p>
                        </div>
                    `;
                });
                html += '</div>';
                infoModalContent.innerHTML = html;
            }
            infoModal.classList.remove('hidden');
            profileMenu.classList.add('hidden');
        });
    }

    if (menuReports) {
        menuReports.addEventListener('click', (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('campusConnectUser'));
            if (!user) return;
            infoModalTitle.textContent = "My Reports";
            const myReports = items.filter(i => i.reportedBy === user.email);

            if (myReports.length === 0) {
                infoModalContent.innerHTML = '<p>You have not reported any items yet.</p>';
            } else {
                let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
                myReports.forEach(i => {
                    html += `
                        <div style="padding: 12px; background: #f8fafc; border-radius: 8px; border: 2px solid #e2e8f0;">
                            <h4 style="color:#0f172a; margin-bottom: 4px;">${escapeHTML(i.name)}</h4>
                            <p style="font-size: 0.85rem; margin-bottom: 4px;"><strong>Type:</strong> ${i.type}</p>
                            <p style="font-size: 0.85rem;"><strong>Status:</strong> <span style="font-weight:600;">${i.claimed ? 'Claimed' : (i.recovered ? 'Recovered' : 'Active')}</span></p>
                        </div>
                    `;
                });
                html += '</div>';
                infoModalContent.innerHTML = html;
            }
            infoModal.classList.remove('hidden');
            profileMenu.classList.add('hidden');
        });
    }

    // Fetch items from the backend API
    async function fetchItems() {
        try {
            const response = await fetch('http://localhost:3000/api/items');
            if (response.ok) {
                items = await response.json();
                renderItems();
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }

    // Call fetch items on load
    fetchItems();

    // Form submission
    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const proofFile = document.getElementById('proof').files[0];

        const createItem = async (proofUrl) => {
            const currentUser = JSON.parse(localStorage.getItem('campusConnectUser'));
            const newItemData = {
                type: document.querySelector('input[name="itemType"]:checked').value,
                name: document.getElementById('itemName').value,
                category: document.getElementById('category').value,
                date: document.getElementById('itemDate').value,
                location: document.getElementById('location').value,
                contact: document.getElementById('contact').value,
                description: document.getElementById('description').value,
                proof: proofUrl,
                reportedBy: currentUser ? currentUser.email : null
            };

            const submitBtn = document.getElementById('addItemBtn');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Submitting...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('http://localhost:3000/api/items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newItemData)
                });

                if (response.ok) {
                    const data = await response.json();
                    items.unshift(data.item); // Add to local array for immediate rendering
                    renderItems();
                    itemForm.reset();
                    document.querySelector('input[name="itemType"][value="Lost"]').checked = true;
                } else {
                    alert('Failed to add item. Please try again.');
                }
            } catch (error) {
                console.error('Error saving item:', error);
                alert('Connection error while saving item.');
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        };

        if (proofFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                createItem(event.target.result);
            };
            reader.readAsDataURL(proofFile);
        } else {
            createItem(null);
        }
    });

    // Event listeners for search and filter
    searchInput.addEventListener('input', renderItems);
    filterType.addEventListener('change', renderItems);
    if (filterCategory) filterCategory.addEventListener('change', renderItems);

    function renderItems() {
        itemList.innerHTML = '';

        const currentUser = JSON.parse(localStorage.getItem('campusConnectUser'));
        const isAdmin = currentUser && currentUser.role === 'admin';

        const searchTerm = searchInput.value.toLowerCase();
        const filterVal = filterType.value;

        const categoryVal = filterCategory ? filterCategory.value : 'All';

        const filteredItems = items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm) ||
                item.location.toLowerCase().includes(searchTerm);

            let matchesType = true;
            if (filterVal === 'Recovered') {
                matchesType = item.recovered === true;
            } else if (filterVal === 'Claimed') {
                matchesType = item.claimed === true && !item.recovered;
            } else if (filterVal !== 'All') {
                matchesType = item.type === filterVal && !item.recovered && !item.claimed;
            }

            let matchesCategory = true;
            if (categoryVal !== 'All') {
                matchesCategory = item.category === categoryVal;
            }

            return matchesSearch && matchesType && matchesCategory;
        });

        if (filteredItems.length === 0) {
            itemList.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p>No items found matching your criteria.</p>
                </div>
            `;
            return;
        }

        // Sort items so recovered ones are at the bottom naturally if we show "All"
        const sortedItems = [...filteredItems].sort((a, b) => {
            if (a.recovered === b.recovered) return 0;
            return a.recovered ? 1 : -1;
        });

        sortedItems.forEach(item => {
            const card = document.createElement('div');

            let statusClass;
            let displayStatus;

            if (item.recovered) {
                statusClass = 'recovered';
                displayStatus = 'Recovered';
            } else if (item.claimed) {
                statusClass = 'claimed';
                displayStatus = 'Claimed';
            } else {
                statusClass = item.type.toLowerCase();
                displayStatus = item.type;
            }

            card.className = `card ${statusClass}`;

            card.innerHTML = `
                <div class="card-header">
                    <div class="card-title-group">
                        <div class="card-title">${escapeHTML(item.name)}</div>
                        <span class="badge ${statusClass}">
                            ${displayStatus}
                        </span>
                    </div>
                </div>
                ${item.proof ? `
                <div class="card-image-wrapper">
                    <img src="${item.proof}" alt="Proof for ${escapeHTML(item.name)}" class="card-image" onclick="openImageModal('${item.proof}')">
                </div>
                ` : ''}
                <div class="card-body">
                    <div class="card-info-item">
                        <span class="card-info-label">Category</span>
                        <span class="card-info-value">${escapeHTML(item.category)}</span>
                    </div>
                    <div class="card-info-item">
                        <span class="card-info-label">Date</span>
                        <span class="card-info-value">${escapeHTML(item.date)}</span>
                    </div>
                    <div class="card-info-item">
                        <span class="card-info-label">Location</span>
                        <span class="card-info-value">${escapeHTML(item.location)}</span>
                    </div>
                    <div class="card-info-item">
                        <span class="card-info-label">Contact</span>
                        <span class="card-info-value">${escapeHTML(item.contact)}</span>
                    </div>
                    <div class="card-info-item full-width">
                        <span class="card-info-label">Description</span>
                        <span class="card-info-value">${escapeHTML(item.description)}</span>
                    </div>
                    ${item.claimedBy ? `
                    <div class="card-info-item full-width">
                        <span class="card-info-label">Claimed By</span>
                        <span class="card-info-value" style="font-weight:600; color:var(--primary);">${escapeHTML(item.claimedBy)}</span>
                    </div>` : ''}
                </div>
                <div class="card-footer" style="padding-top: 8px;">
                    ${(!item.claimed && !item.recovered && currentUser && item.reportedBy !== currentUser.email) ? `
                    <button class="recover-btn" onclick="claimItem(${item.id})" style="margin-right: 8px; color: var(--primary); border-color: #bfdbfe; background: #eff6ff;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        Claim Item
                    </button>
                    ` : ''}
                    ${(!item.recovered && isAdmin) ? `
                    <button class="recover-btn" onclick="markAsRecovered(${item.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Mark as Recovered
                    </button>
                    ` : ''}
                </div>
            `;

            itemList.appendChild(card);
        });
    }

    // Global function to mark as recovered (accessible from onclick attributes)
    window.markAsRecovered = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/api/items/${id}/recover`, {
                method: 'PUT'
            });

            if (response.ok) {
                const item = items.find(i => i.id === id);
                if (item) {
                    item.recovered = true;
                    renderItems();
                }
            } else {
                alert('Failed to update status.');
            }
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Connection error.');
        }
    };

    // Global function to claim an item
    window.claimItem = async (id) => {
        try {
            const user = JSON.parse(localStorage.getItem('campusConnectUser'));
            if (!user) return alert('Please login first.');

            if (!confirm('Are you sure you want to claim this item?')) return;

            const response = await fetch(`http://localhost:3000/api/items/${id}/claim`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ claimedBy: user.email })
            });

            if (response.ok) {
                const item = items.find(i => i.id === id);
                if (item) {
                    item.claimed = true;
                    item.claimedBy = user.email;
                    renderItems();
                }
            } else {
                const err = await response.json();
                alert(err.message || 'Failed to claim item.');
            }
        } catch (error) {
            console.error('Error claiming item:', error);
            alert('Connection error.');
        }
    };

    // Helper to escape HTML and prevent basic XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }

    // Initial render
    renderItems();
});
