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
    currentPage: 'home',
    // Friendship tracking per rabbit
    friendships: {},
    // Total spent on each rabbit (for leaderboard)
    rabbitSpending: {}
};

// Initialize friendships for all rabbits
function initFriendships() {
    RABBITS.forEach(rabbit => {
        if (!state.friendships[rabbit.id]) {
            state.friendships[rabbit.id] = {
                points: 0,
                visits: 0,
                treatsGiven: 0,
                toysGiven: 0
            };
        }
        if (!state.rabbitSpending[rabbit.id]) {
            state.rabbitSpending[rabbit.id] = 0;
        }
    });
}

// Get friendship level for a rabbit (uses helper from data.js if available)
function getFriendshipLevelForRabbit(rabbitId) {
    const points = state.friendships[rabbitId]?.points || 0;
    // Use the helper function from data.js
    if (typeof getFriendshipLevel === 'function') {
        return getFriendshipLevel(points);
    }
    // Fallback
    let currentLevel = FRIENDSHIP_LEVELS[0];
    for (const level of FRIENDSHIP_LEVELS) {
        if (points >= level.minPoints) {
            currentLevel = level;
        }
    }
    return currentLevel;
}

// Add friendship points for a rabbit
function addFriendshipPoints(rabbitId, points, type = 'general') {
    if (!state.friendships[rabbitId]) {
        state.friendships[rabbitId] = { points: 0, visits: 0, treatsGiven: 0, toysGiven: 0 };
    }

    const oldLevel = getFriendshipLevelForRabbit(rabbitId);
    state.friendships[rabbitId].points += points;

    if (type === 'visit') state.friendships[rabbitId].visits++;
    if (type === 'treat') state.friendships[rabbitId].treatsGiven++;
    if (type === 'toy') state.friendships[rabbitId].toysGiven++;

    const newLevel = getFriendshipLevelForRabbit(rabbitId);
    const rabbit = RABBITS.find(r => r.id === rabbitId);

    // Check for level up
    if (newLevel.level > oldLevel.level && rabbit) {
        showToast(`${rabbit.name} friendship leveled up to ${newLevel.name}!`, newLevel.icon);
    }

    saveState();
}

// Add spending for leaderboard
function addRabbitSpending(rabbitId, amount) {
    if (!state.rabbitSpending[rabbitId]) {
        state.rabbitSpending[rabbitId] = 0;
    }
    state.rabbitSpending[rabbitId] += amount;
    saveState();
}

// Get leaderboard rankings
function getLeaderboard() {
    return RABBITS.map(rabbit => ({
        ...rabbit,
        totalSpending: state.rabbitSpending[rabbit.id] || 0,
        friendship: state.friendships[rabbit.id] || { points: 0, visits: 0 },
        friendshipLevel: getFriendshipLevelForRabbit(rabbit.id)
    })).sort((a, b) => b.totalSpending - a.totalSpending);
}

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
        // Close any open modals first
        closeAllModals();

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

    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
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
    // Only unlock if no modals or sidebars are open
    const anyModalOpen = document.querySelector('.modal.open');
    const cartOpen = document.getElementById('cartSidebar')?.classList.contains('open');

    if (!anyModalOpen && !cartOpen) {
        document.body.classList.remove('no-scroll');
    }
}

// Force unlock scroll (use when you're sure nothing should be open)
function forceUnlockScroll() {
    document.body.classList.remove('no-scroll');
}

// ============================================
// MENU / DRINKS & SNACKS
// ============================================
function initMenu() {
    const menuGrid = document.getElementById('menuGrid');
    const snacksGrid = document.getElementById('snacksGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const drinkModal = document.getElementById('drinkModal');
    const drinkModalClose = document.getElementById('drinkModalClose');

    function renderDrinks(filter = 'all') {
        const filteredDrinks = filter === 'all'
            ? DRINKS
            : DRINKS.filter(d => d.category === filter);

        menuGrid.innerHTML = filteredDrinks.map(drink => {
            const matchingRabbit = drink.rabbitId ? RABBITS.find(r => r.id === drink.rabbitId) : null;
            const rabbitBadge = matchingRabbit
                ? `<span class="drink-rabbit-badge" title="${matchingRabbit.name}'s signature">
                    <img src="${matchingRabbit.image}" alt="${matchingRabbit.name}" class="drink-rabbit-img">
                   </span>`
                : '';

            return `
                <div class="drink-card" data-drink-id="${drink.id}">
                    <div class="drink-visual">
                        <div class="drink-cup" style="background: ${drink.gradient}">
                            <div class="drink-straw"></div>
                        </div>
                        ${rabbitBadge}
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
            `;
        }).join('');

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

    function renderSnacks() {
        if (!snacksGrid) return;

        snacksGrid.innerHTML = SNACKS.map(snack => {
            const matchingRabbit = snack.rabbitId ? RABBITS.find(r => r.id === snack.rabbitId) : null;
            const rabbitBadge = matchingRabbit
                ? `<span class="snack-rabbit-badge" title="${matchingRabbit.name}'s signature">
                    <img src="${matchingRabbit.image}" alt="${matchingRabbit.name}" class="snack-rabbit-img">
                   </span>`
                : '';

            return `
                <div class="snack-card">
                    <div class="snack-icon">${snack.icon}</div>
                    ${rabbitBadge}
                    <div class="snack-info">
                        <h3 class="snack-name">${snack.name}</h3>
                        <p class="snack-desc">${snack.description}</p>
                        <div class="snack-footer">
                            <span class="snack-price">$${snack.price.toFixed(2)}</span>
                            <button class="snack-add" onclick="addSnackToCart('${snack.id}')">+</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
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
    renderSnacks();
}

// Add snack to cart
function addSnackToCart(snackId) {
    const snack = SNACKS.find(s => s.id === snackId);
    if (!snack) return;

    const existingItem = state.cart.find(item => item.id === snackId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        state.cart.push({
            id: snack.id,
            name: snack.name,
            price: snack.price,
            gradient: 'linear-gradient(180deg, #FFE8D9 0%, #FFF9F5 100%)',
            icon: snack.icon,
            isSnack: true,
            quantity: 1
        });
    }

    saveState();
    renderCart();
    showToast(`Added ${snack.name} to cart!`, snack.icon);

    // Bounce the cart button
    const cartBtn = document.getElementById('cartBtn');
    cartBtn.style.animation = 'none';
    cartBtn.offsetHeight;
    cartBtn.style.animation = 'cartBounce 0.5s var(--bounce)';
}

// Background images for drink modal
const drinkBackgrounds = [
    'images/reference image 1.png',
    'images/reference image 2.png',
    'images/reference image 3.png'
];

function openDrinkModal(drinkId) {
    const drink = DRINKS.find(d => d.id === drinkId);
    if (!drink) return;

    const modal = document.getElementById('drinkModal');
    const inner = document.getElementById('drinkCardInner');

    // Pick a random background
    const bgImage = drinkBackgrounds[Math.floor(Math.random() * drinkBackgrounds.length)];

    // Find matching rabbit if this is a signature drink
    const matchingRabbit = drink.rabbitId ? RABBITS.find(r => r.id === drink.rabbitId) : null;
    const friendshipLevel = matchingRabbit ? getFriendshipLevelForRabbit(matchingRabbit.id) : null;

    let rabbitSection = '';
    if (matchingRabbit) {
        // Get ranking info
        const leaderboard = getCommunityLeaderboard('all');
        const rankIndex = leaderboard.findIndex(r => r.id === matchingRabbit.id);
        const rank = rankIndex + 1;
        const rarityConfig = getRarityConfig(matchingRabbit.rarity);

        rabbitSection = `
            <div class="drink-bun-match enhanced">
                <div class="bun-match-ribbon">Signature Bun</div>
                <div class="bun-match-content">
                    <div class="bun-match-photo-wrap">
                        <img src="${matchingRabbit.image}" alt="${matchingRabbit.name}" class="bun-match-img">
                        <span class="bun-match-rank">#${rank}</span>
                    </div>
                    <div class="bun-match-details">
                        <span class="bun-match-name">${matchingRabbit.name}</span>
                        <span class="bun-match-breed">${matchingRabbit.breed}</span>
                        <div class="bun-match-badges">
                            <span class="bun-match-friendship">${friendshipLevel.icon} ${friendshipLevel.name}</span>
                            <span class="bun-match-rarity" style="background: ${rarityConfig.bgColor}; color: ${rarityConfig.color}">${rarityConfig.label}</span>
                        </div>
                    </div>
                </div>
                <button class="btn btn-secondary btn-full bun-match-cta" onclick="openScheduleFromDrink('${matchingRabbit.id}')">
                    Book Time with ${matchingRabbit.name}
                </button>
            </div>
        `;
    }

    // Get full description if available
    const fullDesc = drink.fullDescription || drink.description;

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
            <p class="drink-detail-desc">${fullDesc}</p>
            ${rabbitSection}
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

// Open schedule modal from drink modal (cross-sell)
function openScheduleFromDrink(rabbitId) {
    document.getElementById('drinkModal').classList.remove('open');
    openScheduleModal(rabbitId);
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
    const cartSummary = document.getElementById('cartSummary');
    const checkoutTotal = document.getElementById('checkoutTotal');
    const stampsPreview = document.getElementById('stampsPreview');

    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const drinksCount = state.cart.filter(item => !item.isSnack).reduce((sum, item) => sum + item.quantity, 0);
    const snacksCount = state.cart.filter(item => item.isSnack).reduce((sum, item) => sum + item.quantity, 0);

    cartCount.textContent = totalItems;
    checkoutTotal.textContent = `$${totalPrice.toFixed(2)}`;
    stampsPreview.textContent = `+${drinksCount} stamp${drinksCount !== 1 ? 's' : ''} with this order!`;

    // Render order summary
    if (totalItems > 0) {
        cartSummary.innerHTML = `
            <div class="summary-row">
                <span>Subtotal (${totalItems} item${totalItems !== 1 ? 's' : ''})</span>
                <span>$${totalPrice.toFixed(2)}</span>
            </div>
            ${drinksCount > 0 ? `
                <div class="summary-row summary-drinks">
                    <span>🧋 ${drinksCount} drink${drinksCount !== 1 ? 's' : ''}</span>
                    <span class="summary-stamps">+${drinksCount} stamps</span>
                </div>
            ` : ''}
            ${snacksCount > 0 ? `
                <div class="summary-row summary-snacks">
                    <span>🍡 ${snacksCount} snack${snacksCount !== 1 ? 's' : ''}</span>
                </div>
            ` : ''}
            <div class="summary-row summary-total">
                <span>Total</span>
                <span>$${totalPrice.toFixed(2)}</span>
            </div>
        `;
    } else {
        cartSummary.innerHTML = '';
    }

    if (state.cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-visual">
                    <span class="cart-empty-icon">🧋</span>
                    <span class="cart-empty-bunny">🐰</span>
                </div>
                <h4>Your cart is empty</h4>
                <p>Time to treat yourself!</p>
                <button class="btn btn-secondary btn-small" onclick="navigateToMenu()">Browse Menu</button>
            </div>
        `;
        return;
    }

    cartItems.innerHTML = state.cart.map((item, index) => {
        // Check if this is a signature item
        const isSignature = item.rabbitId ? true : false;
        const signatureBadge = isSignature ? `<span class="cart-item-signature">Signature</span>` : '';

        const visual = item.isSnack
            ? `<div class="cart-item-visual cart-item-snack">${item.icon}</div>`
            : `<div class="cart-item-visual" style="background: ${item.gradient}"></div>`;

        return `
            <div class="cart-item" style="animation-delay: ${index * 0.05}s">
                ${visual}
                <div class="cart-item-info">
                    <div class="cart-item-header">
                        <span class="cart-item-name">${item.name}</span>
                        ${signatureBadge}
                    </div>
                    <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)">-</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Remove">
                        <span>×</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Remove item completely from cart
function removeFromCart(itemId) {
    const item = state.cart.find(i => i.id === itemId);
    if (item) {
        state.cart = state.cart.filter(i => i.id !== itemId);
        saveState();
        renderCart();
        showToast(`Removed ${item.name}`, '🗑️');
    }
}

// Navigate to menu from empty cart
function navigateToMenu() {
    document.getElementById('cartSidebar').classList.remove('open');
    unlockScroll();
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    navLinks.forEach(link => link.classList.toggle('active', link.dataset.page === 'menu'));
    pages.forEach(page => page.classList.toggle('active', page.id === 'page-menu'));
    state.currentPage = 'menu';
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // Calculate stamps earned (1 per drink, not snacks)
    const drinksCount = state.cart.filter(item => !item.isSnack).reduce((sum, item) => sum + item.quantity, 0);
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);

    state.stamps += drinksCount;
    state.drinksOrdered += drinksCount;

    // Show success overlay
    const cartSuccess = document.getElementById('cartSuccess');
    const successStamps = document.getElementById('successStamps');
    successStamps.textContent = drinksCount > 0
        ? `+${drinksCount} stamp${drinksCount !== 1 ? 's' : ''} earned!`
        : 'Thanks for your order!';
    cartSuccess.classList.add('show');

    // Check for newly unlocked rewards
    checkRewardUnlocks();

    // Clear cart after a delay
    setTimeout(() => {
        state.cart = [];
        saveState();
        renderCart();
        updateStats();
        renderPassport();

        // Hide success and close cart
        setTimeout(() => {
            cartSuccess.classList.remove('show');
            document.getElementById('cartSidebar').classList.remove('open');
            unlockScroll();
            document.getElementById('pickupTime').value = '';
        }, 500);
    }, 2000);
}

// ============================================
// RABBITS
// ============================================
function initRabbits() {
    const rabbitsGrid = document.getElementById('rabbitsGrid');
    const rabbitModal = document.getElementById('rabbitModal');
    const rabbitModalClose = document.getElementById('rabbitModalClose');
    const scheduleRabbitSelect = document.getElementById('scheduleRabbit');

    // Render rabbit cards with actual images
    rabbitsGrid.innerHTML = RABBITS.map(rabbit => {
        const rarityConfig = getRarityConfig(rabbit.rarity);
        const friendshipLevel = getFriendshipLevelForRabbit(rabbit.id);

        return `
            <div class="rabbit-card" data-rabbit-id="${rabbit.id}">
                <div class="rabbit-card-image">
                    <img src="${rabbit.image}" alt="${rabbit.name}" class="rabbit-photo">
                    <span class="rabbit-rarity" style="background: ${rarityConfig.bgColor}; color: ${rarityConfig.color}">
                        ${rarityConfig.label}
                    </span>
                    <span class="rabbit-friendship-badge">${friendshipLevel.icon}</span>
                </div>
                <div class="rabbit-card-info">
                    <h3 class="rabbit-name">${rabbit.name}</h3>
                    <p class="rabbit-breed">${rabbit.breed}</p>
                    <p class="rabbit-personality">${rabbit.personality}</p>
                    <div class="rabbit-stats">
                        <div class="rabbit-stat">
                            <div class="stat-bar-mini">
                                <div class="stat-fill-mini" style="width: ${rabbit.fluff * 20}%"></div>
                            </div>
                            <span class="rabbit-stat-label">Fluff</span>
                        </div>
                        <div class="rabbit-stat">
                            <div class="stat-bar-mini">
                                <div class="stat-fill-mini spice" style="width: ${rabbit.spice * 20}%"></div>
                            </div>
                            <span class="rabbit-stat-label">Spice</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Populate schedule dropdown
    scheduleRabbitSelect.innerHTML = RABBITS.map(rabbit =>
        `<option value="${rabbit.id}">🐰 ${rabbit.name} (${rabbit.breed})</option>`
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

    // Get friendship info
    const friendshipLevel = getFriendshipLevelForRabbit(rabbit.id);
    const friendshipData = state.friendships[rabbit.id] || { points: 0, visits: 0, treatsGiven: 0, toysGiven: 0 };
    const nextLevel = FRIENDSHIP_LEVELS.find(l => l.minPoints > friendshipData.points);
    const progressToNext = nextLevel
        ? ((friendshipData.points - friendshipLevel.minPoints) / (nextLevel.minPoints - friendshipLevel.minPoints)) * 100
        : 100;
    const pointsToNext = nextLevel ? nextLevel.minPoints - friendshipData.points : 0;

    // Get rarity config
    const rarityConfig = getRarityConfig(rabbit.rarity);

    // Get signature items
    const signatureDrink = getSignatureDrinkForRabbit(rabbit.id);
    const signatureSnack = getSignatureSnackForRabbit(rabbit.id);

    // Get community ranking
    const leaderboard = getCommunityLeaderboard('all');
    const rankIndex = leaderboard.findIndex(r => r.id === rabbit.id);
    const rank = rankIndex + 1;
    const rankSuffix = rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th';

    // Get user's support for this bun
    const userSpending = state.rabbitSpending[rabbit.id] || 0;

    inner.innerHTML = `
        <div class="rabbit-detail-header">
            <img src="${rabbit.image}" alt="${rabbit.name}" class="rabbit-detail-photo">
            <div class="rabbit-detail-titles">
                <div class="rabbit-detail-badges">
                    <span class="rabbit-detail-rarity" style="background: ${rarityConfig.bgColor}; color: ${rarityConfig.color}">
                        ${rarityConfig.label}
                    </span>
                    <span class="rabbit-detail-rank rank-${rank <= 3 ? rank : 'other'}">
                        #${rank}
                    </span>
                </div>
                <h2 class="rabbit-detail-name">${rabbit.name}</h2>
                <p class="rabbit-detail-breed">${rabbit.breed}</p>
                <p class="rabbit-detail-title">${rabbit.title}</p>
            </div>
        </div>

        <div class="rabbit-friendship-display">
            <div class="friendship-header">
                <div class="friendship-badge">
                    <span class="friendship-icon">${friendshipLevel.icon}</span>
                    <span class="friendship-name">${friendshipLevel.name}</span>
                </div>
                ${nextLevel ? `<span class="friendship-next">Next: ${nextLevel.name}</span>` : '<span class="friendship-max">MAX LEVEL!</span>'}
            </div>
            <div class="friendship-progress-bar">
                <div class="friendship-progress-fill" style="width: ${progressToNext}%"></div>
            </div>
            <div class="friendship-stats-row">
                <div class="friendship-stat">
                    <span class="friendship-stat-value">${friendshipData.visits}</span>
                    <span class="friendship-stat-label">Visits</span>
                </div>
                <div class="friendship-stat">
                    <span class="friendship-stat-value">${friendshipData.treatsGiven || 0}</span>
                    <span class="friendship-stat-label">Treats</span>
                </div>
                <div class="friendship-stat">
                    <span class="friendship-stat-value">${friendshipData.toysGiven || 0}</span>
                    <span class="friendship-stat-label">Toys</span>
                </div>
                <div class="friendship-stat">
                    <span class="friendship-stat-value">${friendshipData.points}</span>
                    <span class="friendship-stat-label">Points</span>
                </div>
            </div>
            ${nextLevel ? `<p class="friendship-hint">${pointsToNext} more points to ${nextLevel.name}!</p>` : ''}
            <p class="friendship-perk">${friendshipLevel.perk}</p>
        </div>

        <p class="rabbit-detail-bio">${rabbit.bio}</p>

        <div class="rabbit-detail-stats">
            <div class="detail-stat">
                <span class="detail-stat-label">Fluff Level</span>
                <div class="detail-stat-bar">
                    <div class="detail-stat-fill fluff" style="width: ${rabbit.fluff * 20}%"></div>
                </div>
                <span class="detail-stat-value">${rabbit.fluff}/5</span>
            </div>
            <div class="detail-stat">
                <span class="detail-stat-label">Spice Level</span>
                <div class="detail-stat-bar">
                    <div class="detail-stat-fill spice" style="width: ${rabbit.spice * 20}%"></div>
                </div>
                <span class="detail-stat-value">${rabbit.spice}/5</span>
            </div>
        </div>

        <div class="rabbit-signatures">
            <h4>${rabbit.name}'s Signature Menu</h4>
            <div class="signature-items-enhanced">
                ${signatureDrink ? `
                    <div class="signature-item-card" onclick="navigateAndOpenDrink('${signatureDrink.id}')">
                        <div class="signature-item-visual">
                            <div class="signature-cup-large" style="background: ${signatureDrink.gradient}"></div>
                        </div>
                        <div class="signature-item-info">
                            <span class="signature-item-type">Signature Drink</span>
                            <span class="signature-item-name">${signatureDrink.name}</span>
                            <span class="signature-item-price">$${signatureDrink.price.toFixed(2)}</span>
                        </div>
                    </div>
                ` : ''}
                ${signatureSnack ? `
                    <div class="signature-item-card" onclick="addSnackToCart('${signatureSnack.id}')">
                        <div class="signature-item-visual">
                            <span class="signature-snack-icon">${signatureSnack.icon}</span>
                        </div>
                        <div class="signature-item-info">
                            <span class="signature-item-type">Signature Snack</span>
                            <span class="signature-item-name">${signatureSnack.name}</span>
                            <span class="signature-item-price">$${signatureSnack.price.toFixed(2)}</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>

        <div class="rabbit-preferences">
            <div class="preference-section">
                <h4 class="preference-title likes">Likes</h4>
                <p class="preference-list">${rabbit.likes.join(' • ')}</p>
            </div>
            <div class="preference-section">
                <h4 class="preference-title dislikes">Dislikes</h4>
                <p class="preference-list">${rabbit.dislikes.join(' • ')}</p>
            </div>
        </div>

        <div class="rabbit-support-section">
            <div class="support-header">
                <span class="support-label">Your Support</span>
                <span class="support-value">$${userSpending.toFixed(2)}</span>
            </div>
            <p class="support-hint">Book visits and give treats to boost ${rabbit.name} in the rankings!</p>
        </div>

        <button class="btn btn-primary btn-full" onclick="openScheduleModal('${rabbit.id}')">
            Schedule a Visit with ${rabbit.name}
        </button>
    `;

    modal.classList.add('open');
    lockScroll();
}

// Navigate to menu and open drink modal
function navigateAndOpenDrink(drinkId) {
    document.getElementById('rabbitModal').classList.remove('open');
    unlockScroll();
    // Navigate to menu page
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    navLinks.forEach(link => link.classList.toggle('active', link.dataset.page === 'menu'));
    pages.forEach(page => page.classList.toggle('active', page.id === 'page-menu'));
    state.currentPage = 'menu';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Small delay then open drink modal
    setTimeout(() => openDrinkModal(drinkId), 300);
}

// Close all modals and unlock scroll
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('open'));
    document.getElementById('cartSidebar')?.classList.remove('open');
    forceUnlockScroll();
}

// ============================================
// SCHEDULING
// ============================================
function initScheduling() {
    const scheduleModal = document.getElementById('scheduleModal');
    const scheduleModalClose = document.getElementById('scheduleModalClose');
    const confirmSchedule = document.getElementById('confirmSchedule');
    const scheduleRabbit = document.getElementById('scheduleRabbit');

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

    // Update preview when rabbit selection changes
    scheduleRabbit.addEventListener('change', () => {
        const rabbitId = scheduleRabbit.value;
        updateBunPreview(rabbitId);
        updateSignatureUpsell(rabbitId);
    });

    // Set minimum datetime to now
    const scheduleTime = document.getElementById('scheduleTime');
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    scheduleTime.min = now.toISOString().slice(0, 16);
}

function openScheduleModal(rabbitId = null) {
    const scheduleModal = document.getElementById('scheduleModal');
    const rabbitModal = document.getElementById('rabbitModal');
    const scheduleRabbitSelect = document.getElementById('scheduleRabbit');

    // Set the selected rabbit
    if (rabbitId) {
        scheduleRabbitSelect.value = rabbitId;
    }

    // Get the current selection (either passed in or first in list)
    const selectedRabbitId = rabbitId || scheduleRabbitSelect.value;

    // Update preview and signature upsells
    updateBunPreview(selectedRabbitId);
    updateSignatureUpsell(selectedRabbitId);

    rabbitModal.classList.remove('open');
    scheduleModal.classList.add('open');
    // Keep scroll locked since we're just switching modals
}

// Update the bun preview section in schedule modal
function updateBunPreview(rabbitId) {
    const previewContainer = document.getElementById('bunPreview');
    if (!previewContainer) return;

    const rabbit = RABBITS.find(r => r.id === rabbitId);
    if (!rabbit) {
        previewContainer.innerHTML = '';
        return;
    }

    const friendshipLevel = getFriendshipLevelForRabbit(rabbit.id);
    const rarityConfig = getRarityConfig(rabbit.rarity);

    // Get a random quote from daily messages for this rabbit
    const rabbitMessages = DAILY_MESSAGES.filter(m => m.rabbit === rabbit.id);
    const randomMessage = rabbitMessages.length > 0
        ? rabbitMessages[Math.floor(Math.random() * rabbitMessages.length)].message
        : rabbit.description;

    previewContainer.innerHTML = `
        <div class="bun-preview-card">
            <div class="bun-preview-image">
                <img src="${rabbit.image}" alt="${rabbit.name}" class="bun-preview-photo">
                <span class="bun-preview-rarity" style="background: ${rarityConfig.bgColor}; color: ${rarityConfig.color}">
                    ${rarityConfig.label}
                </span>
            </div>
            <div class="bun-preview-info">
                <div class="bun-preview-header">
                    <h4 class="bun-preview-name">${rabbit.name}</h4>
                    <span class="bun-preview-friendship">${friendshipLevel.icon} ${friendshipLevel.name}</span>
                </div>
                <p class="bun-preview-personality">${rabbit.personality} • ${rabbit.breed}</p>
                <p class="bun-preview-quote">"${randomMessage}"</p>
            </div>
        </div>
    `;
}

// Update signature items upsell in schedule modal
function updateSignatureUpsell(rabbitId) {
    const upsellContainer = document.getElementById('signatureUpsell');
    if (!upsellContainer) return;

    const rabbit = RABBITS.find(r => r.id === rabbitId);
    if (!rabbit) {
        upsellContainer.innerHTML = '';
        return;
    }

    const signatureDrink = getSignatureDrinkForRabbit(rabbit.id);
    const signatureSnack = getSignatureSnackForRabbit(rabbit.id);

    let drinkHtml = '';
    let snackHtml = '';

    if (signatureDrink) {
        drinkHtml = `
            <div class="signature-upsell-item">
                <div class="signature-upsell-visual">
                    <div class="signature-upsell-cup" style="background: ${signatureDrink.gradient}"></div>
                </div>
                <div class="signature-upsell-info">
                    <span class="signature-upsell-label">Pair with ${rabbit.name}'s signature drink?</span>
                    <span class="signature-upsell-name">${signatureDrink.name}</span>
                    <span class="signature-upsell-price">$${signatureDrink.price.toFixed(2)}</span>
                </div>
                <button class="btn btn-small btn-secondary signature-add-btn" onclick="addSignatureDrinkFromSchedule('${signatureDrink.id}')">
                    + Add
                </button>
            </div>
        `;
    }

    if (signatureSnack) {
        snackHtml = `
            <div class="signature-upsell-item">
                <div class="signature-upsell-visual">
                    <span class="signature-upsell-icon">${signatureSnack.icon}</span>
                </div>
                <div class="signature-upsell-info">
                    <span class="signature-upsell-label">Bring a treat for your visit?</span>
                    <span class="signature-upsell-name">${signatureSnack.name}</span>
                    <span class="signature-upsell-price">$${signatureSnack.price.toFixed(2)}</span>
                </div>
                <button class="btn btn-small btn-secondary signature-add-btn" onclick="addSignatureSnackFromSchedule('${signatureSnack.id}')">
                    + Add
                </button>
            </div>
        `;
    }

    upsellContainer.innerHTML = `
        <div class="signature-upsell-header">
            <span class="signature-upsell-title">✨ ${rabbit.name}'s Favorites</span>
        </div>
        <div class="signature-upsell-items">
            ${drinkHtml}
            ${snackHtml}
        </div>
    `;
}

// Add signature drink to cart from schedule modal
function addSignatureDrinkFromSchedule(drinkId) {
    addToCart(drinkId);
    // Mark the button as added
    const btn = event.target;
    btn.textContent = '✓ Added';
    btn.disabled = true;
    btn.classList.add('added');
}

// Add signature snack to cart from schedule modal
function addSignatureSnackFromSchedule(snackId) {
    addSnackToCart(snackId);
    // Mark the button as added
    const btn = event.target;
    btn.textContent = '✓ Added';
    btn.disabled = true;
    btn.classList.add('added');
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

    // Calculate cost based on duration using VISIT_PRICING from data.js
    const visitInfo = VISIT_PRICING[duration] || VISIT_PRICING[30];
    const visitCost = visitInfo.price;
    const baseFriendshipPoints = visitInfo.friendshipPoints;

    // Get selected treats and toys
    const selectedTreats = Array.from(document.querySelectorAll('.treat-checkbox:checked'))
        .map(cb => BUN_TREATS.find(t => t.id === cb.value));
    const selectedToys = Array.from(document.querySelectorAll('.toy-checkbox:checked'))
        .map(cb => BUN_TOYS.find(t => t.id === cb.value));

    // Calculate totals
    const treatsCost = selectedTreats.reduce((sum, t) => sum + (t?.price || 0), 0);
    const toysCost = selectedToys.reduce((sum, t) => sum + (t?.price || 0), 0);
    const totalCost = visitCost + treatsCost + toysCost;

    // Add stamps for booking
    state.stamps += 2;
    state.rabbitVisits++;

    // Add friendship points
    let totalFriendshipPoints = baseFriendshipPoints;

    selectedTreats.forEach(treat => {
        if (treat) {
            totalFriendshipPoints += treat.friendshipPoints;
            addFriendshipPoints(rabbitId, treat.friendshipPoints, 'treat');
        }
    });

    selectedToys.forEach(toy => {
        if (toy) {
            totalFriendshipPoints += toy.friendshipPoints;
            addFriendshipPoints(rabbitId, toy.friendshipPoints, 'toy');
        }
    });

    // Add base visit points
    addFriendshipPoints(rabbitId, baseFriendshipPoints, 'visit');

    // Add spending for leaderboard
    addRabbitSpending(rabbitId, totalCost);

    checkRewardUnlocks();
    saveState();
    updateStats();
    renderPassport();
    renderLeaderboard();

    // Clear checkboxes
    document.querySelectorAll('.treat-checkbox, .toy-checkbox').forEach(cb => cb.checked = false);

    document.getElementById('scheduleModal').classList.remove('open');
    unlockScroll();

    const treatsMsg = selectedTreats.length > 0 ? ` +${selectedTreats.length} treats` : '';
    const toysMsg = selectedToys.length > 0 ? ` +${selectedToys.length} toys` : '';
    showToast(`Visit with ${rabbit.name} booked!${treatsMsg}${toysMsg} +2 stamps!`, '🐰');
}

// ============================================
// PASSPORT / STAMPS
// ============================================
function initPassport() {
    renderPassport();
    renderDashboard();
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

// ============================================
// DASHBOARD / MY BUNS
// ============================================
function renderDashboard() {
    const collectionGrid = document.getElementById('bunCollectionGrid');
    if (!collectionGrid) return;

    // Calculate summary stats
    const totalSpent = Object.values(state.rabbitSpending).reduce((sum, val) => sum + val, 0);
    const totalVisits = Object.values(state.friendships).reduce((sum, f) => sum + (f.visits || 0), 0);

    // Find best friend (highest friendship points)
    let bestFriend = null;
    let bestFriendPoints = 0;
    RABBITS.forEach(rabbit => {
        const points = state.friendships[rabbit.id]?.points || 0;
        if (points > bestFriendPoints) {
            bestFriendPoints = points;
            bestFriend = rabbit;
        }
    });

    // Find most supported (highest spending)
    let topSupported = null;
    let topSpending = 0;
    RABBITS.forEach(rabbit => {
        const spending = state.rabbitSpending[rabbit.id] || 0;
        if (spending > topSpending) {
            topSpending = spending;
            topSupported = rabbit;
        }
    });

    // Count befriended buns (friendship level > 0)
    const befriendedCount = RABBITS.filter(rabbit => {
        const level = getFriendshipLevelForRabbit(rabbit.id);
        return level.level > 0;
    }).length;

    // Update summary stats
    document.getElementById('totalSpent').textContent = `$${totalSpent.toFixed(0)}`;
    document.getElementById('totalBunVisits').textContent = totalVisits;
    document.getElementById('highestFriendship').textContent = bestFriend ? bestFriend.name : '-';
    document.getElementById('topSupported').textContent = topSupported ? topSupported.name : '-';
    document.getElementById('friendshipCount').textContent = `${befriendedCount}/13 befriended`;
    document.getElementById('friendshipProgressFill').style.width = `${(befriendedCount / 13) * 100}%`;

    // Render collection grid
    collectionGrid.innerHTML = RABBITS.map(rabbit => {
        const friendship = state.friendships[rabbit.id] || { points: 0, visits: 0, treatsGiven: 0, toysGiven: 0 };
        const friendshipLevel = getFriendshipLevelForRabbit(rabbit.id);
        const spending = state.rabbitSpending[rabbit.id] || 0;
        const rarityConfig = getRarityConfig(rabbit.rarity);

        // Calculate progress to next level
        const nextLevel = FRIENDSHIP_LEVELS.find(l => l.minPoints > friendship.points);
        const progressToNext = nextLevel
            ? ((friendship.points - friendshipLevel.minPoints) / (nextLevel.minPoints - friendshipLevel.minPoints)) * 100
            : 100;

        // Determine if this bun is "collected" (any interaction)
        const isCollected = friendship.points > 0 || spending > 0;

        return `
            <div class="bun-collection-card ${isCollected ? 'collected' : 'not-collected'}"
                 data-rabbit-id="${rabbit.id}"
                 onclick="openRabbitFromDashboard('${rabbit.id}')">
                <div class="collection-card-image">
                    <img src="${rabbit.image}" alt="${rabbit.name}" class="collection-photo ${isCollected ? '' : 'grayscale'}">
                    <span class="collection-rarity" style="background: ${rarityConfig.bgColor}; color: ${rarityConfig.color}">
                        ${rarityConfig.label}
                    </span>
                    <span class="collection-friendship-icon">${friendshipLevel.icon}</span>
                </div>
                <div class="collection-card-info">
                    <h4 class="collection-name">${rabbit.name}</h4>
                    <p class="collection-level">${friendshipLevel.name}</p>
                    <div class="collection-progress-bar">
                        <div class="collection-progress-fill" style="width: ${progressToNext}%"></div>
                    </div>
                    <div class="collection-stats">
                        <div class="collection-stat">
                            <span class="collection-stat-value">${friendship.visits}</span>
                            <span class="collection-stat-label">visits</span>
                        </div>
                        <div class="collection-stat">
                            <span class="collection-stat-value">$${spending.toFixed(0)}</span>
                            <span class="collection-stat-label">spent</span>
                        </div>
                        <div class="collection-stat">
                            <span class="collection-stat-value">${friendship.treatsGiven + friendship.toysGiven}</span>
                            <span class="collection-stat-label">gifts</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Open rabbit modal from dashboard
function openRabbitFromDashboard(rabbitId) {
    openRabbitModal(rabbitId);
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
// LEADERBOARD (Host Club Style Rankings)
// Community-wide rankings based on total support
// ============================================

// Current filter state
let currentLeaderboardPeriod = 'all';

// Simulated community spending data for all 13 buns (ALL TIME)
const COMMUNITY_BASE_SPENDING = {
    'taro': 3850.00,
    'panko': 4120.50,
    'taiyaki': 4580.75,
    'sesami': 2150.25,
    'matcha': 2890.00,
    'adzuki': 3200.50,
    'momo': 3450.00,
    'mochi': 3780.25,
    'sakura': 3650.75,
    'boba': 2680.00,
    'chai': 2950.50,
    'anpan': 2420.00,
    'ocha': 2180.75
};

// Monthly spending (subset of all-time, with some variation)
const COMMUNITY_MONTHLY_SPENDING = {
    'taro': 420.00,
    'panko': 385.50,
    'taiyaki': 510.75,
    'sesami': 290.25,
    'matcha': 445.00,
    'adzuki': 380.50,
    'momo': 520.00,      // Trending up!
    'mochi': 490.25,
    'sakura': 355.75,
    'boba': 410.00,
    'chai': 475.50,      // Cozy season boost
    'anpan': 320.00,
    'ocha': 395.75
};

// Weekly spending (more volatile, creates movement)
const COMMUNITY_WEEKLY_SPENDING = {
    'taro': 95.00,
    'panko': 78.50,
    'taiyaki': 120.75,   // Big week!
    'sesami': 85.25,
    'matcha': 92.00,
    'adzuki': 110.50,    // Trending!
    'momo': 145.00,      // HOT this week!
    'mochi': 88.25,
    'sakura': 72.75,
    'boba': 135.00,      // Comeback!
    'chai': 105.50,
    'anpan': 68.00,
    'ocha': 82.75
};

const COMMUNITY_BASE_VISITS = {
    'taro': 128,
    'panko': 142,
    'taiyaki': 156,
    'sesami': 76,
    'matcha': 97,
    'adzuki': 108,
    'momo': 115,
    'mochi': 124,
    'sakura': 118,
    'boba': 89,
    'chai': 102,
    'anpan': 82,
    'ocha': 74
};

function initLeaderboard() {
    // Set up filter button listeners
    const filterBtns = document.querySelectorAll('.leaderboard-filter');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLeaderboardPeriod = btn.dataset.period;
            renderLeaderboard();
        });
    });

    renderLeaderboard();
}

// Get spending data based on current period
function getSpendingForPeriod(rabbitId, period) {
    const userSpending = state.rabbitSpending[rabbitId] || 0;

    switch (period) {
        case 'week':
            // User spending counts fully toward weekly
            return (COMMUNITY_WEEKLY_SPENDING[rabbitId] || 0) + userSpending;
        case 'month':
            return (COMMUNITY_MONTHLY_SPENDING[rabbitId] || 0) + userSpending;
        case 'all':
        default:
            return (COMMUNITY_BASE_SPENDING[rabbitId] || 0) + userSpending;
    }
}

// Get community leaderboard for a specific period
function getCommunityLeaderboard(period = 'all') {
    return RABBITS.map(rabbit => {
        const userSpending = state.rabbitSpending[rabbit.id] || 0;
        const userVisits = state.friendships[rabbit.id]?.visits || 0;
        const communitySpending = getSpendingForPeriod(rabbit.id, period);
        const communityVisits = (COMMUNITY_BASE_VISITS[rabbit.id] || 0) + userVisits;

        return {
            ...rabbit,
            communitySpending,
            communityVisits,
            userSpending,
            userVisits,
            userFriendship: state.friendships[rabbit.id] || { points: 0, visits: 0 },
            userFriendshipLevel: getFriendshipLevelForRabbit(rabbit.id)
        };
    }).sort((a, b) => b.communitySpending - a.communitySpending);
}

// Calculate rank movement compared to all-time rankings
function getRankMovement(rabbitId, currentRank, period) {
    if (period === 'all') return { change: 0, isNew: false };

    // Get all-time rankings to compare
    const allTimeRankings = getCommunityLeaderboard('all');
    const allTimeRank = allTimeRankings.findIndex(r => r.id === rabbitId) + 1;

    const change = allTimeRank - currentRank;
    return { change, isNew: false };
}

// Get movement indicator HTML
function getMovementIndicator(change) {
    if (change > 0) {
        return `<span class="rank-movement up">↑${change}</span>`;
    } else if (change < 0) {
        return `<span class="rank-movement down">↓${Math.abs(change)}</span>`;
    }
    return '';
}

// Find user's top supported bun
function getUserTopBun() {
    let topBun = null;
    let topSpending = 0;

    RABBITS.forEach(rabbit => {
        const spending = state.rabbitSpending[rabbit.id] || 0;
        if (spending > topSpending) {
            topSpending = spending;
            topBun = rabbit;
        }
    });

    return topBun ? { rabbit: topBun, spending: topSpending } : null;
}

// Render the "Your #1 Bun" highlight
function renderYourTopBun() {
    const container = document.getElementById('yourTopBun');
    if (!container) return;

    const topBunData = getUserTopBun();

    if (!topBunData || topBunData.spending === 0) {
        container.innerHTML = '';
        return;
    }

    const { rabbit, spending } = topBunData;
    const friendshipLevel = getFriendshipLevelForRabbit(rabbit.id);
    const rankings = getCommunityLeaderboard(currentLeaderboardPeriod);
    const currentRank = rankings.findIndex(r => r.id === rabbit.id) + 1;

    container.innerHTML = `
        <div class="your-top-bun-card">
            <div class="your-top-bun-badge">Your #1</div>
            <img src="${rabbit.image}" alt="${rabbit.name}" class="your-top-bun-img">
            <div class="your-top-bun-info">
                <span class="your-top-bun-name">${rabbit.name}</span>
                <span class="your-top-bun-stats">
                    <span class="your-spending">$${spending.toFixed(0)} contributed</span>
                    <span class="your-rank">Rank #${currentRank}</span>
                    <span class="your-friendship">${friendshipLevel.icon} ${friendshipLevel.name}</span>
                </span>
            </div>
            <button class="btn btn-small btn-primary" onclick="openRabbitFromLeaderboard('${rabbit.id}')">
                Support More
            </button>
        </div>
    `;
}

function renderLeaderboard() {
    const leaderboardGrid = document.getElementById('leaderboardGrid');
    if (!leaderboardGrid) return;

    const rankings = getCommunityLeaderboard(currentLeaderboardPeriod);

    // Render "Your #1" section
    renderYourTopBun();

    // Find user's top bun for highlighting
    const userTopBun = getUserTopBun();
    const userTopBunId = userTopBun?.rabbit?.id;

    leaderboardGrid.innerHTML = rankings.map((rabbit, index) => {
        const rank = index + 1;
        const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';
        const rankIcon = rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
        const yourContribution = rabbit.userSpending > 0 ? `<span class="your-contribution">(You: $${rabbit.userSpending.toFixed(2)})</span>` : '';
        const rarityConfig = getRarityConfig(rabbit.rarity);

        // Get movement indicator
        const movement = getRankMovement(rabbit.id, rank, currentLeaderboardPeriod);
        const movementHtml = getMovementIndicator(movement.change);

        // Check if this is user's top bun
        const isUserTop = rabbit.id === userTopBunId;
        const userTopClass = isUserTop ? 'user-top-bun' : '';
        const userTopBadge = isUserTop ? '<span class="user-top-badge">Your #1</span>' : '';

        // Period label
        const periodLabel = currentLeaderboardPeriod === 'week' ? 'This Week' :
                           currentLeaderboardPeriod === 'month' ? 'This Month' : 'Total';

        return `
            <div class="leaderboard-card ${rankClass} ${userTopClass}" data-rabbit-id="${rabbit.id}">
                <div class="leaderboard-rank-container">
                    <div class="leaderboard-rank">${rankIcon}</div>
                    ${movementHtml}
                </div>
                <div class="leaderboard-rabbit">
                    <img src="${rabbit.image}" alt="${rabbit.name}" class="leaderboard-img">
                    ${userTopBadge}
                    <div class="leaderboard-info">
                        <span class="leaderboard-name">${rabbit.name}</span>
                        <span class="leaderboard-title">${rabbit.personality}</span>
                        <span class="leaderboard-rarity" style="color: ${rarityConfig.color}">${rarityConfig.label}</span>
                    </div>
                </div>
                <div class="leaderboard-stats">
                    <div class="leaderboard-stat">
                        <span class="stat-value">$${rabbit.communitySpending.toFixed(0)}</span>
                        <span class="stat-label">${periodLabel}</span>
                        ${yourContribution}
                    </div>
                    <div class="leaderboard-stat">
                        <span class="stat-value">${rabbit.communityVisits}</span>
                        <span class="stat-label">Visits</span>
                    </div>
                    <div class="leaderboard-stat">
                        <span class="stat-value">${rabbit.userFriendshipLevel.icon}</span>
                        <span class="stat-label">Your Bond</span>
                    </div>
                </div>
                <button class="btn btn-small btn-secondary" onclick="openRabbitFromLeaderboard('${rabbit.id}')">
                    Support ${rabbit.name}
                </button>
            </div>
        `;
    }).join('');

    // Update top 3 podium if it exists
    const podium = document.getElementById('leaderboardPodium');
    if (podium && rankings.length >= 3) {
        const getMovementForPodium = (rabbitId, rank) => {
            const movement = getRankMovement(rabbitId, rank, currentLeaderboardPeriod);
            return getMovementIndicator(movement.change);
        };

        podium.innerHTML = `
            <div class="podium-spot podium-2" onclick="openRabbitFromLeaderboard('${rankings[1].id}')">
                <img src="${rankings[1].image}" alt="${rankings[1].name}" class="podium-img">
                <span class="podium-name">${rankings[1].name}</span>
                ${getMovementForPodium(rankings[1].id, 2)}
                <div class="podium-block">🥈</div>
            </div>
            <div class="podium-spot podium-1" onclick="openRabbitFromLeaderboard('${rankings[0].id}')">
                <img src="${rankings[0].image}" alt="${rankings[0].name}" class="podium-img">
                <span class="podium-name">${rankings[0].name}</span>
                ${getMovementForPodium(rankings[0].id, 1)}
                <div class="podium-block">👑</div>
            </div>
            <div class="podium-spot podium-3" onclick="openRabbitFromLeaderboard('${rankings[2].id}')">
                <img src="${rankings[2].image}" alt="${rankings[2].name}" class="podium-img">
                <span class="podium-name">${rankings[2].name}</span>
                ${getMovementForPodium(rankings[2].id, 3)}
                <div class="podium-block">🥉</div>
            </div>
        `;
    }
}

// Open rabbit modal from leaderboard (ensures scroll is handled properly)
function openRabbitFromLeaderboard(rabbitId) {
    closeAllModals();
    setTimeout(() => {
        openRabbitModal(rabbitId);
    }, 50);
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
    const messageRabbit = RABBITS.find(r => r.id === dailyMessage.rabbit);

    // Display rabbit image or emoji fallback
    if (messageRabbit) {
        checkinRabbit.innerHTML = `<img src="${messageRabbit.image}" alt="${messageRabbit.name}" class="checkin-rabbit-img">`;
    } else {
        checkinRabbit.textContent = dailyMessage.emoji;
    }

    const rabbitName = messageRabbit ? messageRabbit.name : dailyMessage.rabbit.charAt(0).toUpperCase() + dailyMessage.rabbit.slice(1);
    checkinMessage.textContent = `${rabbitName} says: "${dailyMessage.message}"`;

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
    initFriendships();
    initBobaParticles();
    initNavigation();
    initMenu();
    initCart();
    initRabbits();
    initScheduling();
    initPassport();
    initShop();
    initLeaderboard();
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
window.openScheduleFromDrink = openScheduleFromDrink;
window.navigateAndOpenDrink = navigateAndOpenDrink;
window.openRabbitModal = openRabbitModal;
window.openRabbitFromLeaderboard = openRabbitFromLeaderboard;
window.openRabbitFromDashboard = openRabbitFromDashboard;
window.closeAllModals = closeAllModals;
window.addSnackToCart = addSnackToCart;
window.addSignatureDrinkFromSchedule = addSignatureDrinkFromSchedule;
window.addSignatureSnackFromSchedule = addSignatureSnackFromSchedule;
