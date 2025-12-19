/* ============================================
   MEGUMI'S USAGI CAFE - MAIN APP
   兎茶店 - Application Logic
   ============================================ */

// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
    cart: [],
    stamps: 0,
    drinksOrdered: 0,
    rabbitVisits: 0,
    lastCheckin: null,
    checkedInToday: false,
    unlockedRewards: [],
    currentPage: 'home'
};

// Load state from localStorage
function loadState() {
    const saved = localStorage.getItem('megumi-usagi-state');
    if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(state, parsed);

        // Check if last checkin was today
        if (state.lastCheckin) {
            const lastDate = new Date(state.lastCheckin).toDateString();
            const today = new Date().toDateString();
            state.checkedInToday = lastDate === today;
        }
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('megumi-usagi-state', JSON.stringify(state));
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const navigateButtons = document.querySelectorAll('[data-navigate]');
    const mobileToggle = document.getElementById('mobileNavToggle');
    const navLinksContainer = document.querySelector('.nav-links');

    function navigateTo(pageId) {
        // Update nav links
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageId);
        });

        // Update pages
        pages.forEach(page => {
            page.classList.toggle('active', page.id === `page-${pageId}`);
        });

        // Close mobile nav
        navLinksContainer.classList.remove('open');

        state.currentPage = pageId;

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => navigateTo(link.dataset.page));
    });

    navigateButtons.forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.navigate));
    });

    // Mobile nav toggle
    mobileToggle.addEventListener('click', () => {
        navLinksContainer.classList.toggle('open');
    });
}

// ============================================
// BOBA PARTICLES BACKGROUND
// ============================================
function initBobaParticles() {
    const container = document.getElementById('bobaParticles');
    const colors = ['#FFD9F3', '#F4D9FF', '#FFE8D9', '#D9F0FF', '#D9FFE8'];

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'boba-particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.animationDuration = `${6 + Math.random() * 4}s`;
        container.appendChild(particle);
    }
}

// ============================================
// SCROLL LOCK
// ============================================
function lockScroll() {
    document.body.classList.add('no-scroll');
}

function unlockScroll() {
    document.body.classList.remove('no-scroll');
}

// ============================================
// MENU / DRINKS
// ============================================
function initMenu() {
    const menuGrid = document.getElementById('menuGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const drinkModal = document.getElementById('drinkModal');
    const drinkModalClose = document.getElementById('drinkModalClose');

    function renderDrinks(filter = 'all') {
        const filteredDrinks = filter === 'all'
            ? DRINKS
            : DRINKS.filter(d => d.category === filter);

        menuGrid.innerHTML = filteredDrinks.map(drink => `
            <div class="drink-card" data-drink-id="${drink.id}">
                <div class="drink-visual">
                    <div class="drink-cup" style="background: ${drink.gradient}">
                        <div class="drink-straw"></div>
                    </div>
                </div>
                <div class="drink-info">
                    <h3 class="drink-name">${drink.name}</h3>
                    <p class="drink-desc">${drink.description}</p>
                    <div class="drink-footer">
                        <span class="drink-price">$${drink.price.toFixed(2)}</span>
                        <button class="drink-add" data-add-drink="${drink.id}">+</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to add buttons
        document.querySelectorAll('[data-add-drink]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                addToCart(btn.dataset.addDrink);
            });
        });

        // Add event listeners to drink cards for modal
        document.querySelectorAll('.drink-card').forEach(card => {
            card.addEventListener('click', () => {
                openDrinkModal(card.dataset.drinkId);
            });
        });
    }

    // Modal close handlers
    drinkModalClose.addEventListener('click', () => {
        drinkModal.classList.remove('open');
        unlockScroll();
    });

    drinkModal.addEventListener('click', (e) => {
        if (e.target === drinkModal) {
            drinkModal.classList.remove('open');
            unlockScroll();
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderDrinks(btn.dataset.filter);
        });
    });

    renderDrinks();
}

// Background images for drink modal
const drinkBackgrounds = [
    'images/references/reference image 1.png',
    'images/references/reference image 2.png',
    'images/references/reference image 3.png'
];

function openDrinkModal(drinkId) {
    const drink = DRINKS.find(d => d.id === drinkId);
    if (!drink) return;

    const modal = document.getElementById('drinkModal');
    const inner = document.getElementById('drinkCardInner');

    // Pick a random background
    const bgImage = drinkBackgrounds[Math.floor(Math.random() * drinkBackgrounds.length)];

    inner.innerHTML = `
        <div class="drink-detail-visual" style="background-image: url('${bgImage}')">
            <div class="drink-detail-cup" style="background: ${drink.gradient}">
                <div class="drink-detail-straw"></div>
            </div>
        </div>
        <div class="drink-detail-info">
            <div class="drink-detail-header">
                <h2 class="drink-detail-name">${drink.name}</h2>
                <span class="drink-detail-price">$${drink.price.toFixed(2)}</span>
            </div>
            <span class="drink-detail-category">${drink.category}</span>
            <p class="drink-detail-desc">${drink.description}</p>
            <div class="drink-detail-toppings">
                <h4>Customize Your Drink</h4>
                <div class="topping-list">
                    <span class="topping-tag">+ Boba Pearls</span>
                    <span class="topping-tag">+ Grass Jelly</span>
                    <span class="topping-tag">+ Pudding</span>
                    <span class="topping-tag">+ Aloe Vera</span>
                    <span class="topping-tag">+ Cheese Foam</span>
                </div>
            </div>
            <div class="drink-detail-actions">
                <button class="btn btn-primary" onclick="addToCartAndClose('${drink.id}')">Add to Order</button>
            </div>
        </div>
    `;

    modal.classList.add('open');
    lockScroll();
}

function addToCartAndClose(drinkId) {
    addToCart(drinkId);
    document.getElementById('drinkModal').classList.remove('open');
    unlockScroll();
}

// ============================================
// CART
// ============================================
function initCart() {
    const cartBtn = document.getElementById('cartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartClose = document.getElementById('cartClose');
    const checkoutBtn = document.getElementById('checkoutBtn');

    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        lockScroll();
    });

    cartClose.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
        unlockScroll();
    });

    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
        if (!cartSidebar.contains(e.target) && !cartBtn.contains(e.target) && cartSidebar.classList.contains('open')) {
            cartSidebar.classList.remove('open');
            unlockScroll();
        }
    });

    checkoutBtn.addEventListener('click', handleCheckout);

    renderCart();
}

function addToCart(drinkId) {
    const drink = DRINKS.find(d => d.id === drinkId);
    if (!drink) return;

    const existingItem = state.cart.find(item => item.id === drinkId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        state.cart.push({ ...drink, quantity: 1 });
    }

    saveState();
    renderCart();
    showToast(`Added ${drink.name} to cart!`, '🧋');

    // Bounce the cart button
    const cartBtn = document.getElementById('cartBtn');
    cartBtn.style.animation = 'none';
    cartBtn.offsetHeight; // Trigger reflow
    cartBtn.style.animation = 'cartBounce 0.5s var(--bounce)';
}

function updateCartQuantity(drinkId, change) {
    const item = state.cart.find(item => item.id === drinkId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        state.cart = state.cart.filter(i => i.id !== drinkId);
    }

    saveState();
    renderCart();
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');

    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartCount.textContent = totalItems;
    cartTotal.textContent = `$${totalPrice.toFixed(2)}`;

    if (state.cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <span class="cart-empty-icon">🧋</span>
                <p>Your cart is empty</p>
                <p>Time to treat yourself!</p>
            </div>
        `;
        return;
    }

    cartItems.innerHTML = state.cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-visual" style="background: ${item.gradient}"></div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-qty">
                <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
            </div>
        </div>
    `).join('');
}

function handleCheckout() {
    if (state.cart.length === 0) {
        showToast('Your cart is empty!', '😅');
        return;
    }

    const pickupTime = document.getElementById('pickupTime').value;
    if (!pickupTime) {
        showToast('Please select a pickup time!', '⏰');
        return;
    }

    // Calculate stamps earned (1 per drink)
    const drinksCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    state.stamps += drinksCount;
    state.drinksOrdered += drinksCount;

    // Check for newly unlocked rewards
    checkRewardUnlocks();

    // Clear cart
    state.cart = [];
    saveState();
    renderCart();
    updateStats();
    renderPassport();

    // Close cart
    document.getElementById('cartSidebar').classList.remove('open');
    unlockScroll();

    showToast(`Order placed! +${drinksCount} stamps earned!`, '🎉');
}

// ============================================
// RABBITS
// ============================================
function initRabbits() {
    const rabbitsGrid = document.getElementById('rabbitsGrid');
    const rabbitModal = document.getElementById('rabbitModal');
    const rabbitModalClose = document.getElementById('rabbitModalClose');
    const scheduleRabbitSelect = document.getElementById('scheduleRabbit');

    // Render rabbit cards
    rabbitsGrid.innerHTML = RABBITS.map(rabbit => `
        <div class="rabbit-card" data-rabbit-id="${rabbit.id}">
            <div class="rabbit-card-image" style="background: var(--gradient-dream)">
                ${rabbit.emoji}
                <span class="rabbit-rarity rarity-${rabbit.rarity}">${rabbit.rarity}</span>
            </div>
            <div class="rabbit-card-info">
                <h3 class="rabbit-name">${rabbit.name}</h3>
                <p class="rabbit-personality">${rabbit.personality}</p>
                <div class="rabbit-stats">
                    <div class="rabbit-stat">
                        <span class="rabbit-stat-value">${rabbit.stats.fluffiness}</span>
                        <span class="rabbit-stat-label">Fluff</span>
                    </div>
                    <div class="rabbit-stat">
                        <span class="rabbit-stat-value">${rabbit.stats.friendliness}</span>
                        <span class="rabbit-stat-label">Friend</span>
                    </div>
                    <div class="rabbit-stat">
                        <span class="rabbit-stat-value">${rabbit.stats.chaos}</span>
                        <span class="rabbit-stat-label">Chaos</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Populate schedule dropdown
    scheduleRabbitSelect.innerHTML = RABBITS.map(rabbit =>
        `<option value="${rabbit.id}">${rabbit.emoji} ${rabbit.name}</option>`
    ).join('');

    // Add click handlers for rabbit cards
    document.querySelectorAll('.rabbit-card').forEach(card => {
        card.addEventListener('click', () => {
            openRabbitModal(card.dataset.rabbitId);
        });
    });

    // Modal close
    rabbitModalClose.addEventListener('click', () => {
        rabbitModal.classList.remove('open');
        unlockScroll();
    });

    rabbitModal.addEventListener('click', (e) => {
        if (e.target === rabbitModal) {
            rabbitModal.classList.remove('open');
            unlockScroll();
        }
    });
}

function openRabbitModal(rabbitId) {
    const rabbit = RABBITS.find(r => r.id === rabbitId);
    if (!rabbit) return;

    const modal = document.getElementById('rabbitModal');
    const inner = document.getElementById('rabbitCardInner');

    inner.innerHTML = `
        <div class="rabbit-detail-header">
            <span class="rabbit-detail-emoji">${rabbit.emoji}</span>
            <h2 class="rabbit-detail-name">${rabbit.name}</h2>
            <p class="rabbit-detail-title">${rabbit.title}</p>
        </div>
        <p class="rabbit-detail-bio">${rabbit.bio}</p>
        <div class="rabbit-detail-stats">
            <div class="detail-stat">
                <span class="detail-stat-label">Fluffiness</span>
                <div class="detail-stat-bar">
                    <div class="detail-stat-fill" style="width: ${rabbit.stats.fluffiness}%"></div>
                </div>
            </div>
            <div class="detail-stat">
                <span class="detail-stat-label">Biteyness</span>
                <div class="detail-stat-bar">
                    <div class="detail-stat-fill" style="width: ${rabbit.stats.biteyness}%"></div>
                </div>
            </div>
            <div class="detail-stat">
                <span class="detail-stat-label">Friendliness</span>
                <div class="detail-stat-bar">
                    <div class="detail-stat-fill" style="width: ${rabbit.stats.friendliness}%"></div>
                </div>
            </div>
            <div class="detail-stat">
                <span class="detail-stat-label">Chaos</span>
                <div class="detail-stat-bar">
                    <div class="detail-stat-fill" style="width: ${rabbit.stats.chaos}%"></div>
                </div>
            </div>
        </div>
        <div style="margin-bottom: var(--space-lg)">
            <h4 style="color: var(--accent-purple); margin-bottom: var(--space-sm);">Likes</h4>
            <p style="color: var(--text-medium); font-size: 0.9rem;">${rabbit.likes.join(' • ')}</p>
        </div>
        <div style="margin-bottom: var(--space-lg)">
            <h4 style="color: var(--accent-pink); margin-bottom: var(--space-sm);">Dislikes</h4>
            <p style="color: var(--text-medium); font-size: 0.9rem;">${rabbit.dislikes.join(' • ')}</p>
        </div>
        <button class="btn btn-primary btn-full" onclick="openScheduleModal('${rabbit.id}')">
            Schedule a Visit
        </button>
    `;

    modal.classList.add('open');
    lockScroll();
}

// ============================================
// SCHEDULING
// ============================================
function initScheduling() {
    const scheduleModal = document.getElementById('scheduleModal');
    const scheduleModalClose = document.getElementById('scheduleModalClose');
    const confirmSchedule = document.getElementById('confirmSchedule');

    scheduleModalClose.addEventListener('click', () => {
        scheduleModal.classList.remove('open');
        unlockScroll();
    });

    scheduleModal.addEventListener('click', (e) => {
        if (e.target === scheduleModal) {
            scheduleModal.classList.remove('open');
            unlockScroll();
        }
    });

    confirmSchedule.addEventListener('click', handleScheduleVisit);

    // Set minimum datetime to now
    const scheduleTime = document.getElementById('scheduleTime');
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    scheduleTime.min = now.toISOString().slice(0, 16);
}

function openScheduleModal(rabbitId = null) {
    const scheduleModal = document.getElementById('scheduleModal');
    const rabbitModal = document.getElementById('rabbitModal');

    if (rabbitId) {
        document.getElementById('scheduleRabbit').value = rabbitId;
    }

    rabbitModal.classList.remove('open');
    scheduleModal.classList.add('open');
    // Keep scroll locked since we're just switching modals
}

function handleScheduleVisit() {
    const rabbitId = document.getElementById('scheduleRabbit').value;
    const visitTime = document.getElementById('scheduleTime').value;
    const duration = document.getElementById('scheduleDuration').value;

    if (!visitTime) {
        showToast('Please select a date and time!', '📅');
        return;
    }

    const rabbit = RABBITS.find(r => r.id === rabbitId);

    // Add stamps for booking
    state.stamps += 2;
    state.rabbitVisits++;

    checkRewardUnlocks();
    saveState();
    updateStats();
    renderPassport();

    document.getElementById('scheduleModal').classList.remove('open');
    unlockScroll();

    showToast(`Visit with ${rabbit.name} booked! +2 stamps!`, rabbit.emoji);
}

// ============================================
// PASSPORT / STAMPS
// ============================================
function initPassport() {
    renderPassport();
}

function renderPassport() {
    const stampGrid = document.getElementById('stampGrid');
    const rewardsList = document.getElementById('rewardsList');

    // Render stamps (show 20 slots)
    const totalSlots = 20;
    let stampsHtml = '';

    for (let i = 0; i < totalSlots; i++) {
        if (i < state.stamps) {
            const iconIndex = i % STAMP_ICONS.length;
            stampsHtml += `<div class="stamp-slot filled">${STAMP_ICONS[iconIndex]}</div>`;
        } else {
            stampsHtml += `<div class="stamp-slot empty"></div>`;
        }
    }

    if (state.stamps > totalSlots) {
        stampsHtml += `<div class="stamp-slot filled" style="grid-column: span 2; font-size: 1rem;">+${state.stamps - totalSlots} more</div>`;
    }

    stampGrid.innerHTML = stampsHtml;

    // Render rewards
    rewardsList.innerHTML = REWARDS.map(reward => {
        const unlocked = state.stamps >= reward.stampsRequired;
        return `
            <div class="reward-item ${unlocked ? 'unlocked' : 'locked'}">
                <span class="reward-icon">${reward.icon}</span>
                <div class="reward-info">
                    <div class="reward-name">${reward.name}</div>
                    <div class="reward-req">${reward.stampsRequired} stamps needed</div>
                </div>
                <span class="reward-status">${unlocked ? '✓' : '🔒'}</span>
            </div>
        `;
    }).join('');
}

function checkRewardUnlocks() {
    REWARDS.forEach(reward => {
        if (state.stamps >= reward.stampsRequired && !state.unlockedRewards.includes(reward.id)) {
            state.unlockedRewards.push(reward.id);
            showToast(`Reward unlocked: ${reward.name}!`, reward.icon);
        }
    });
}

// ============================================
// SHOP
// ============================================
function initShop() {
    const shopGrid = document.getElementById('shopGrid');

    shopGrid.innerHTML = SHOP_ITEMS.map(item => {
        const unlocked = state.stamps >= item.stampsRequired;
        return `
            <div class="shop-item ${unlocked ? '' : 'locked'}">
                <div class="shop-item-image">${item.icon}</div>
                <div class="shop-item-info">
                    <h3 class="shop-item-name">${item.name}</h3>
                    <p class="shop-item-req">${unlocked ? '✓ Unlocked' : `🔒 ${item.stampsRequired} stamps to unlock`}</p>
                    <p class="shop-item-price">$${item.price.toFixed(2)}</p>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// DAILY CHECK-IN
// ============================================
function initDailyCheckin() {
    const checkinBtn = document.getElementById('checkinBtn');

    renderCheckin();

    checkinBtn.addEventListener('click', handleCheckin);
}

function renderCheckin() {
    const checkinRabbit = document.getElementById('checkinRabbit');
    const checkinMessage = document.getElementById('checkinMessage');
    const checkinBtn = document.getElementById('checkinBtn');

    // Get random daily message
    const dailyMessage = DAILY_MESSAGES[Math.floor(Math.random() * DAILY_MESSAGES.length)];

    checkinRabbit.textContent = dailyMessage.emoji;
    checkinMessage.textContent = `${dailyMessage.rabbit.charAt(0).toUpperCase() + dailyMessage.rabbit.slice(1)} says: "${dailyMessage.message}"`;

    if (state.checkedInToday) {
        checkinBtn.textContent = 'See you tomorrow!';
        checkinBtn.disabled = true;
        checkinBtn.style.opacity = '0.5';
    } else {
        checkinBtn.textContent = 'Say Hi! (+1 stamp)';
        checkinBtn.disabled = false;
        checkinBtn.style.opacity = '1';
    }
}

function handleCheckin() {
    if (state.checkedInToday) return;

    state.stamps++;
    state.checkedInToday = true;
    state.lastCheckin = new Date().toISOString();

    checkRewardUnlocks();
    saveState();
    updateStats();
    renderPassport();
    renderCheckin();

    showToast('Daily check-in complete! +1 stamp!', '🐰');
}

// ============================================
// STATS
// ============================================
function updateStats() {
    document.getElementById('statDrinks').textContent = state.drinksOrdered;
    document.getElementById('statVisits').textContent = state.rabbitVisits;
    document.getElementById('statStamps').textContent = state.stamps;
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, icon = '🐰') {
    const container = document.getElementById('toastContainer');

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// INITIALIZE APP
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initBobaParticles();
    initNavigation();
    initMenu();
    initCart();
    initRabbits();
    initScheduling();
    initPassport();
    initShop();
    initDailyCheckin();
    updateStats();

    // Add cart bounce animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes cartBounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2) rotate(-10deg); }
        }
    `;
    document.head.appendChild(style);
});

// Make functions available globally for onclick handlers
window.updateCartQuantity = updateCartQuantity;
window.openScheduleModal = openScheduleModal;
window.addToCartAndClose = addToCartAndClose;
