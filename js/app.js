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
    snacksOrdered: 0,
    rabbitVisits: 0,
    lastCheckin: null,
    checkedInToday: false,
    unlockedRewards: [],
    currentPage: 'home',
    // Location-based navigation
    currentLocation: 'outside',
    currentBooklet: null,
    // Friendship tracking per rabbit
    friendships: {},
    // Total spent on each rabbit (for leaderboard)
    rabbitSpending: {},
    // Achievement tracking
    unlockedAchievements: [],
    totalStampsEarned: 0,
    totalSpent: 0,
    signatureDrinksTried: [],
    uniqueBunsVisited: [],
    treatsGivenTotal: 0,
    toysPlayedTotal: 0,
    hasVisited: false,
    // User profile
    userName: '',
    userAvatar: '🐰',
    memberSince: null,
    // Order history
    orderHistory: [],
    visitHistory: [],
    // Shop purchases
    purchasedItems: [],
    // Canvas positions for collectibles
    canvasPositions: {}
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

// ============================================
// ACHIEVEMENT SYSTEM
// ============================================

// Check if an achievement condition is met
function checkAchievementCondition(achievement) {
    const cond = achievement.condition;

    switch (cond.type) {
        case 'first_visit':
            return state.hasVisited;

        case 'drinks_ordered':
            return state.drinksOrdered >= cond.count;

        case 'snacks_ordered':
            return state.snacksOrdered >= cond.count;

        case 'sessions_booked':
            return state.rabbitVisits >= cond.count;

        case 'friendship_level':
            // Check if any rabbit has reached this level
            return Object.keys(state.friendships).some(rabbitId => {
                const level = getFriendshipLevelForRabbit(rabbitId);
                return level.name === cond.level;
            });

        case 'friends_count':
            // Count how many rabbits have reached the specified level
            const friendsAtLevel = Object.keys(state.friendships).filter(rabbitId => {
                const level = getFriendshipLevelForRabbit(rabbitId);
                const levelIndex = FRIENDSHIP_LEVELS.findIndex(l => l.name === level.name);
                const requiredIndex = FRIENDSHIP_LEVELS.findIndex(l => l.name === cond.level);
                return levelIndex >= requiredIndex;
            }).length;
            return friendsAtLevel >= cond.count;

        case 'signature_drinks_tried':
            return state.signatureDrinksTried.length >= cond.count;

        case 'unique_buns_visited':
            return state.uniqueBunsVisited.length >= cond.count;

        case 'stamps_earned':
            return state.totalStampsEarned >= cond.count;

        case 'total_spent':
            return state.totalSpent >= cond.amount;

        case 'rarity_visited':
            // Check if user has visited a bun of this rarity
            return state.uniqueBunsVisited.some(rabbitId => {
                const rabbit = getRabbitById(rabbitId);
                return rabbit && rabbit.rarity === cond.rarity;
            });

        case 'all_rarity_visited':
            // Check if user has visited ALL buns of this rarity
            const bunsOfRarity = RABBITS.filter(r => r.rarity === cond.rarity);
            return bunsOfRarity.every(r => state.uniqueBunsVisited.includes(r.id));

        case 'achievements_unlocked':
            return state.unlockedAchievements.length >= cond.count;

        case 'treats_given':
            return state.treatsGivenTotal >= cond.count;

        case 'toys_played':
            return state.toysPlayedTotal >= cond.count;

        default:
            return false;
    }
}

// Check all achievements and unlock any newly earned ones
function checkAchievements() {
    const newlyUnlocked = [];

    ACHIEVEMENTS.forEach(achievement => {
        // Skip if already unlocked
        if (state.unlockedAchievements.includes(achievement.id)) {
            return;
        }

        // Check if condition is met
        if (checkAchievementCondition(achievement)) {
            state.unlockedAchievements.push(achievement.id);
            newlyUnlocked.push(achievement);

            // Award stamps reward
            if (achievement.reward && achievement.reward.stamps) {
                state.stamps += achievement.reward.stamps;
                state.totalStampsEarned += achievement.reward.stamps;
            }
        }
    });

    // Show notifications for newly unlocked achievements
    newlyUnlocked.forEach((achievement, index) => {
        setTimeout(() => {
            showAchievementUnlock(achievement);
        }, index * 1500); // Stagger notifications
    });

    if (newlyUnlocked.length > 0) {
        saveState();
        // Re-check for meta achievements (like "unlock 20 achievements")
        setTimeout(() => checkAchievements(), 2000);
    }

    return newlyUnlocked;
}

// Show achievement unlock notification
function showAchievementUnlock(achievement) {
    const category = ACHIEVEMENT_CATEGORIES[achievement.category];

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-notification-content">
            <div class="achievement-notification-sticker">${achievement.sticker}</div>
            <div class="achievement-notification-info">
                <div class="achievement-notification-header">
                    <span class="achievement-notification-label">Achievement Unlocked!</span>
                </div>
                <div class="achievement-notification-name">${achievement.name}</div>
                <div class="achievement-notification-reward">+${achievement.reward.stamps} stamps</div>
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// Get achievement progress for display
function getAchievementProgress(achievement) {
    const cond = achievement.condition;
    let current = 0;
    let total = cond.count || cond.amount || 1;

    switch (cond.type) {
        case 'first_visit':
            current = state.hasVisited ? 1 : 0;
            total = 1;
            break;
        case 'drinks_ordered':
            current = state.drinksOrdered;
            break;
        case 'snacks_ordered':
            current = state.snacksOrdered;
            break;
        case 'sessions_booked':
            current = state.rabbitVisits;
            break;
        case 'signature_drinks_tried':
            current = state.signatureDrinksTried.length;
            break;
        case 'unique_buns_visited':
            current = state.uniqueBunsVisited.length;
            break;
        case 'stamps_earned':
            current = state.totalStampsEarned;
            break;
        case 'total_spent':
            current = state.totalSpent;
            break;
        case 'achievements_unlocked':
            current = state.unlockedAchievements.length;
            break;
        case 'treats_given':
            current = state.treatsGivenTotal;
            break;
        case 'toys_played':
            current = state.toysPlayedTotal;
            break;
        case 'friendship_level':
        case 'friends_count':
        case 'rarity_visited':
        case 'all_rarity_visited':
            // These are boolean/complex, show as 0/1 or current count
            current = checkAchievementCondition(achievement) ? total : 0;
            break;
    }

    return { current: Math.min(current, total), total };
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
    const cafeViewport = document.getElementById('cafeViewport');
    const phone = document.getElementById('phone');
    const phoneBackdrop = document.getElementById('phoneBackdrop');
    const phoneToggle = document.getElementById('phoneToggle');
    const phoneTabs = document.querySelectorAll('.phone-tab');
    const phoneApps = document.querySelectorAll('.phone-app');
    const locationBtns = document.querySelectorAll('.location-btn');

    // Current UI state
    state.currentApp = 'menu';
    state.phoneOpen = false;

    // ========== LOCATION NAVIGATION ==========
    function navigateToLocation(locationId) {
        closeAllModals();

        // Update location buttons
        locationBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.location === locationId);
        });

        // Slide cafe viewport
        if (cafeViewport) {
            cafeViewport.classList.remove('show-inside');
            if (locationId === 'inside') {
                cafeViewport.classList.add('show-inside');
            }
        }

        state.currentLocation = locationId;

        // Render play area buns when entering inside
        if (locationId === 'inside') {
            renderPlayAreaBuns();
        }
    }

    // ========== PHONE UI ==========
    function openPhone(appId = null, section = null) {
        if (appId) {
            switchApp(appId, section);
        }

        phone.classList.add('open');
        phoneBackdrop.classList.add('visible');
        phoneToggle.classList.add('active');
        state.phoneOpen = true;
        lockScroll();
    }

    function closePhone() {
        phone.classList.remove('open');
        phoneBackdrop.classList.remove('visible');
        phoneToggle.classList.remove('active');
        state.phoneOpen = false;
        unlockScroll();
    }

    function togglePhone() {
        if (state.phoneOpen) {
            closePhone();
        } else {
            openPhone();
        }
    }

    function switchApp(appId, section = null) {
        // Update tabs
        phoneTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.app === appId);
        });

        // Update apps
        phoneApps.forEach(app => {
            app.classList.toggle('active', app.dataset.app === appId);
        });

        state.currentApp = appId;

        // Handle passport onboarding
        if (appId === 'passport') {
            const onboarding = document.getElementById('passportOnboarding');
            const main = document.getElementById('passportMain');
            if (!state.userName) {
                onboarding?.classList.add('active');
                main?.classList.remove('active');
            } else {
                onboarding?.classList.remove('active');
                main?.classList.add('active');
                renderPassportCanvas();
                updateCollectionStats();
            }
        }

        // Handle menu section switching
        if (appId === 'menu' && section) {
            setTimeout(() => {
                const tab = document.querySelector(`[data-cafe-section="${section}"]`);
                tab?.click();
            }, 100);
        }

        // Update cart when switching to cart app
        if (appId === 'cart') {
            renderCart();
        }
    }

    // ========== EVENT LISTENERS ==========

    // Phone toggle button
    phoneToggle?.addEventListener('click', togglePhone);

    // Phone backdrop click to close
    phoneBackdrop?.addEventListener('click', closePhone);

    // Phone tab navigation
    phoneTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchApp(tab.dataset.app);
        });
    });

    // Location buttons (bottom bar and inline)
    document.querySelectorAll('[data-location]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToLocation(btn.dataset.location);
        });
    });

    // Action buttons (open phone, schedule, etc.)
    document.querySelectorAll('[data-action]').forEach(elem => {
        elem.addEventListener('click', (e) => {
            e.preventDefault();
            const action = elem.dataset.action;

            if (action === 'open-phone') {
                const appId = elem.dataset.app || 'menu';
                const section = elem.dataset.section || null;
                openPhone(appId, section);
            } else if (action === 'switch-app') {
                const appId = elem.dataset.app || 'menu';
                const section = elem.dataset.section || null;
                switchApp(appId, section);
            } else if (action === 'schedule') {
                openScheduleModal();
            }
        });
    });

    // Scene action buttons (open home modals)
    document.querySelectorAll('[data-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = btn.dataset.modal;
            const modal = document.getElementById(modalId);
            if (modal) {
                populateHomeModal(modalId);
                openModal(modal);
            }
        });
    });

    // Escape key closes phone and modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (state.phoneOpen) {
                closePhone();
            }
            closeAllModals();
        }
    });

    // Legacy support - map old booklet functions to phone
    function openBooklet(bookletId, section = null) {
        const appMap = { 'menu': 'menu', 'passport': 'passport' };
        const appId = appMap[bookletId] || 'menu';
        openPhone(appId, section);
    }

    function closeBooklet() {
        closePhone();
    }

    // Make functions globally available
    window.navigateToLocation = navigateToLocation;
    window.openPhone = openPhone;
    window.closePhone = closePhone;
    window.togglePhone = togglePhone;
    window.switchApp = switchApp;
    window.openBooklet = openBooklet; // Legacy support
    window.closeBooklet = closeBooklet; // Legacy support
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
    // Only unlock if no modals or phone are open
    const anyModalOpen = document.querySelector('.modal.open');
    const phoneOpen = document.getElementById('phone')?.classList.contains('open');

    if (!anyModalOpen && !phoneOpen) {
        document.body.classList.remove('no-scroll');
    }
}

// Force unlock scroll (use when you're sure nothing should be open)
function forceUnlockScroll() {
    document.body.classList.remove('no-scroll');
}

// ============================================
// INSIDE CAFE - PLAY AREA BUNS
// ============================================
function renderPlayAreaBuns() {
    const container = document.getElementById('playAreaBuns');
    if (!container) return;

    // Pick 4 random buns to display
    const shuffled = [...RABBITS].sort(() => Math.random() - 0.5);
    const displayBuns = shuffled.slice(0, 4);

    container.innerHTML = displayBuns.map(rabbit => `
        <img src="${rabbit.image}" alt="${rabbit.name}" class="play-bun-img"
             onclick="openBooklet('menu', 'buns'); setTimeout(() => openRabbitModal('${rabbit.id}'), 300);"
             title="Click to meet ${rabbit.name}">
    `).join('');
}

// ============================================
// PASSPORT ONBOARDING
// ============================================
function initPassportOnboarding() {
    const completeBtn = document.getElementById('onboardingComplete');
    const nameInput = document.getElementById('onboardingName');
    const avatarPicker = document.getElementById('onboardingAvatarPicker');

    if (!completeBtn || !avatarPicker) return;

    let selectedAvatar = '🐰';

    // Avatar selection
    avatarPicker.querySelectorAll('.avatar-option').forEach(opt => {
        opt.addEventListener('click', () => {
            avatarPicker.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            selectedAvatar = opt.dataset.avatar;
        });
    });

    completeBtn.addEventListener('click', () => {
        const name = nameInput?.value.trim();
        if (name) {
            state.userName = name;
            state.userAvatar = selectedAvatar;
            state.memberSince = new Date().toISOString();
            saveState();

            // Switch to main passport view
            document.getElementById('passportOnboarding')?.classList.remove('active');
            document.getElementById('passportMain')?.classList.add('active');

            renderPassportCanvas();
            updateCollectionStats();
            updateProfileDisplay();

            showToast(`Welcome, ${name}! Your passport is ready.`, '📔');
        } else {
            showToast('Please enter your name!', '❌');
        }
    });
}

// ============================================
// CAFE PAGE (Menu & Buns)
// ============================================
let currentCafeSection = 'buns';

function initCafe() {
    const cafeTabs = document.querySelectorAll('.cafe-tab');
    const cafeSections = document.querySelectorAll('.cafe-section');

    cafeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const section = tab.dataset.cafeSection;
            currentCafeSection = section;

            // Update active tab
            cafeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active section
            cafeSections.forEach(s => s.classList.remove('active'));
            const targetSection = document.getElementById(`cafe${section.charAt(0).toUpperCase() + section.slice(1)}`);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Render rewards when that tab is selected
            if (section === 'rewards') {
                renderRewardsSection();
            }
        });
    });

    // Initial render of rewards section
    renderRewardsSection();
}

function renderRewardsSection() {
    const rewardsGrid = document.getElementById('rewardsGrid');
    const balanceEl = document.getElementById('rewardsBalance');

    if (balanceEl) {
        balanceEl.textContent = state.stamps;
    }

    if (!rewardsGrid) return;

    rewardsGrid.innerHTML = SHOP_ITEMS.map(item => {
        const owned = state.purchasedItems.includes(item.id);
        const canAfford = state.stamps >= item.stampsRequired;
        const inCart = state.cart.some(c => c.id === item.id && c.type === 'reward');

        let cardClass = owned ? 'owned' : (inCart ? 'in-cart' : '');
        let buttonClass = owned ? 'owned-btn' : (inCart ? 'in-cart-btn' : 'add-btn');
        let buttonText = owned ? '✓ Owned' : (inCart ? '✓ In Cart' : 'Add to Cart');
        let buttonDisabled = owned || inCart || !canAfford;

        return `
            <div class="reward-card ${cardClass}">
                <div class="reward-card-icon">${item.icon}</div>
                <h3 class="reward-card-name">${item.name}</h3>
                <p class="reward-card-desc">${item.description}</p>
                <div class="reward-card-cost">
                    <span class="stamp-icon">⭐</span>
                    <span>${item.stampsRequired} stamps</span>
                </div>
                <button class="reward-card-btn ${buttonClass}"
                        ${buttonDisabled ? 'disabled' : ''}
                        onclick="addRewardToCart('${item.id}')">
                    ${buttonText}
                </button>
            </div>
        `;
    }).join('');
}

function addRewardToCart(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    // Check if already owned
    if (state.purchasedItems.includes(itemId)) {
        showToast('You already own this item!', '❌');
        return;
    }

    // Check if already in cart
    if (state.cart.some(c => c.id === itemId && c.type === 'reward')) {
        showToast('Already in your cart!', '🛒');
        return;
    }

    // Add to cart with special type
    state.cart.push({
        id: item.id,
        type: 'reward',
        name: item.name,
        icon: item.icon,
        price: 0, // No dollar cost
        stampsCost: item.stampsRequired,
        quantity: 1
    });

    saveState();
    renderCart();
    renderRewardsSection();
    showToast(`${item.name} added to cart!`, item.icon);
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

    // Modal close on backdrop click
    drinkModal.addEventListener('click', (e) => {
        if (e.target === drinkModal) {
            closeModal(drinkModal);
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
function addSnackToCart(snackId, suppressUpsell = false) {
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
            rabbitId: snack.rabbitId || null,
            quantity: 1
        });
    }

    saveState();
    renderCart();

    // Check if this is a signature snack and show upsell toast
    // (unless suppressed because user is already in a bun context)
    if (!suppressUpsell && snack.rabbitId) {
        const rabbit = getRabbitById(snack.rabbitId);
        if (rabbit) {
            showUpsellToast(snack.name, rabbit, 'snack');
        } else {
            showToast(`Added ${snack.name} to cart!`, snack.icon);
        }
    } else {
        showToast(`Added ${snack.name} to cart!`, snack.icon);
    }

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

    // Pick a random background
    const bgImage = drinkBackgrounds[Math.floor(Math.random() * drinkBackgrounds.length)];

    // Find matching rabbit if this is a signature drink
    const matchingRabbit = drink.rabbitId ? RABBITS.find(r => r.id === drink.rabbitId) : null;
    const friendshipLevel = matchingRabbit ? getFriendshipLevelForRabbit(matchingRabbit.id) : null;

    let rabbitSection = '';
    if (matchingRabbit) {
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

    const fullDesc = drink.fullDescription || drink.description;

    Modal.open({
        type: 'drink',
        variant: 'full-bleed',
        class: 'drink-card-detail',
        content: `
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
        `
    });
}

// Open schedule modal from drink modal (cross-sell)
function openScheduleFromDrink(rabbitId) {
    Modal.close();
    openScheduleModal(rabbitId);
}

function addToCartAndClose(drinkId) {
    // Suppress upsell since drink modal already shows bun cross-sell
    addToCart(drinkId, true);
    Modal.close();
}

// ============================================
// CART
// ============================================
function initCart() {
    const checkoutBtn = document.getElementById('checkoutBtn');

    checkoutBtn?.addEventListener('click', handleCheckout);

    renderCart();
}

function addToCart(drinkId, suppressUpsell = false) {
    const drink = DRINKS.find(d => d.id === drinkId);
    if (!drink) return;

    // Check if this is a signature drink
    const isSignature = SIGNATURE_DRINKS.some(sd => sd.id === drinkId);

    const existingItem = state.cart.find(item => item.id === drinkId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        state.cart.push({ ...drink, quantity: 1, isSignature });
    }

    saveState();
    renderCart();

    // Check if this is a signature drink and show upsell toast
    // (unless suppressed because user is already in a bun context)
    if (!suppressUpsell && drink.rabbitId) {
        const rabbit = getRabbitById(drink.rabbitId);
        if (rabbit) {
            showUpsellToast(drink.name, rabbit, 'drink');
        } else {
            showToast(`Added ${drink.name} to cart!`, '🧋');
        }
    } else {
        showToast(`Added ${drink.name} to cart!`, '🧋');
    }

    // Bounce the phone toggle button
    const phoneToggle = document.getElementById('phoneToggle');
    if (phoneToggle) {
        phoneToggle.classList.add('animate-boing');
        setTimeout(() => phoneToggle.classList.remove('animate-boing'), 500);
    }
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
    const cartSummary = document.getElementById('cartSummary');
    const checkoutTotal = document.getElementById('checkoutTotal');
    const stampsPreview = document.getElementById('stampsPreview');
    const cartBadge = document.getElementById('cartBadge');
    const phoneCartBadge = document.getElementById('phoneCartBadge');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartFooter = document.getElementById('cartFooter');

    // Separate regular items from rewards
    const regularItems = state.cart.filter(item => item.type !== 'reward');
    const rewardItems = state.cart.filter(item => item.type === 'reward');

    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = regularItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalStampsCost = rewardItems.reduce((sum, item) => sum + (item.stampsCost * item.quantity), 0);
    const drinksCount = regularItems.filter(item => !item.isSnack).reduce((sum, item) => sum + item.quantity, 0);
    const snacksCount = regularItems.filter(item => item.isSnack).reduce((sum, item) => sum + item.quantity, 0);

    // Update all cart badges
    if (cartBadge) cartBadge.textContent = totalItems > 0 ? totalItems : '';
    if (phoneCartBadge) phoneCartBadge.textContent = totalItems > 0 ? totalItems : '';

    // Show/hide empty state and footer
    if (cartEmpty) cartEmpty.style.display = totalItems === 0 ? 'flex' : 'none';
    if (cartFooter) cartFooter.style.display = totalItems > 0 ? 'block' : 'none';

    // Show combined total
    if (totalPrice > 0 && totalStampsCost > 0) {
        checkoutTotal.textContent = `$${totalPrice.toFixed(2)} + ⭐${totalStampsCost}`;
    } else if (totalStampsCost > 0) {
        checkoutTotal.textContent = `⭐ ${totalStampsCost} stamps`;
    } else {
        checkoutTotal.textContent = `$${totalPrice.toFixed(2)}`;
    }

    // Update stamps preview
    if (drinksCount > 0) {
        stampsPreview.textContent = `+${drinksCount} stamp${drinksCount !== 1 ? 's' : ''} with this order!`;
    } else if (totalStampsCost > 0) {
        stampsPreview.textContent = `Using ${totalStampsCost} stamps for rewards`;
    } else {
        stampsPreview.textContent = '';
    }

    // Render order summary
    if (totalItems > 0) {
        let summaryHtml = '';

        if (regularItems.length > 0) {
            summaryHtml += `
                <div class="summary-row">
                    <span>Items</span>
                    <span>$${totalPrice.toFixed(2)}</span>
                </div>
            `;
            if (drinksCount > 0) {
                summaryHtml += `
                    <div class="summary-row summary-drinks">
                        <span>🧋 ${drinksCount} drink${drinksCount !== 1 ? 's' : ''}</span>
                        <span class="summary-stamps">+${drinksCount} stamps</span>
                    </div>
                `;
            }
            if (snacksCount > 0) {
                summaryHtml += `
                    <div class="summary-row summary-snacks">
                        <span>🍡 ${snacksCount} snack${snacksCount !== 1 ? 's' : ''}</span>
                    </div>
                `;
            }
        }

        if (rewardItems.length > 0) {
            summaryHtml += `
                <div class="summary-row summary-rewards">
                    <span>⭐ ${rewardItems.length} reward${rewardItems.length !== 1 ? 's' : ''}</span>
                    <span class="summary-stamps-cost">-${totalStampsCost} stamps</span>
                </div>
            `;
            // Check if user has enough stamps
            if (totalStampsCost > state.stamps) {
                summaryHtml += `
                    <div class="summary-row summary-warning">
                        <span>⚠️ Not enough stamps!</span>
                        <span>Need ${totalStampsCost - state.stamps} more</span>
                    </div>
                `;
            }
        }

        summaryHtml += `
            <div class="summary-row summary-total">
                <span>Total</span>
                <span>${totalPrice > 0 ? '$' + totalPrice.toFixed(2) : ''}${totalPrice > 0 && totalStampsCost > 0 ? ' + ' : ''}${totalStampsCost > 0 ? '⭐' + totalStampsCost : ''}</span>
            </div>
        `;

        cartSummary.innerHTML = summaryHtml;
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
        // Handle reward items differently
        if (item.type === 'reward') {
            return `
                <div class="cart-item cart-item-reward" style="animation-delay: ${index * 0.05}s">
                    <div class="cart-item-visual cart-item-reward-icon">${item.icon}</div>
                    <div class="cart-item-info">
                        <div class="cart-item-header">
                            <span class="cart-item-name">${item.name}</span>
                            <span class="cart-item-reward-badge">Reward</span>
                        </div>
                        <div class="cart-item-price cart-item-stamp-cost">⭐ ${item.stampsCost} stamps</div>
                    </div>
                    <div class="cart-item-actions">
                        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Remove">
                            <span>×</span>
                        </button>
                    </div>
                </div>
            `;
        }

        // Regular items (drinks/snacks)
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

// Navigate to menu from empty cart (now switches phone app)
function navigateToMenu() {
    if (typeof switchApp === 'function') {
        switchApp('menu');
    }
}

function handleCheckout() {
    if (state.cart.length === 0) {
        showToast('Your cart is empty!', '😅');
        return;
    }

    // Separate regular items from rewards
    const regularItems = state.cart.filter(item => item.type !== 'reward');
    const rewardItems = state.cart.filter(item => item.type === 'reward');

    const pickupTime = document.getElementById('pickupTime').value;

    // Only require pickup time if there are regular items
    if (regularItems.length > 0 && !pickupTime) {
        showToast('Please select a pickup time!', '⏰');
        return;
    }

    // Calculate stamp costs for rewards
    const totalStampsCost = rewardItems.reduce((sum, item) => sum + (item.stampsCost * item.quantity), 0);

    // Check if user has enough stamps for rewards
    if (totalStampsCost > state.stamps) {
        showToast('Not enough stamps for rewards!', '❌');
        return;
    }

    // Calculate stamps earned (1 per drink, not snacks or rewards)
    const drinksCount = regularItems.filter(item => !item.isSnack).reduce((sum, item) => sum + item.quantity, 0);
    const snacksCount = regularItems.filter(item => item.isSnack).reduce((sum, item) => sum + item.quantity, 0);

    // Calculate total cost for spending tracking (regular items only)
    const cartTotal = regularItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Update stamps (earn from drinks, spend on rewards)
    state.stamps += drinksCount;
    state.stamps -= totalStampsCost;
    state.totalStampsEarned += drinksCount;
    state.drinksOrdered += drinksCount;
    state.snacksOrdered += snacksCount;
    state.totalSpent += cartTotal;

    // Process reward items - add to purchased items
    rewardItems.forEach(item => {
        if (!state.purchasedItems.includes(item.id)) {
            state.purchasedItems.push(item.id);
        }
    });

    // Track signature drinks tried for achievements
    regularItems.forEach(item => {
        if (!item.isSnack && item.isSignature && !state.signatureDrinksTried.includes(item.id)) {
            state.signatureDrinksTried.push(item.id);
        }
    });

    // Save order to history (include both regular and reward items)
    if (regularItems.length > 0) {
        const order = {
            id: Date.now(),
            date: new Date().toISOString(),
            items: regularItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                isSnack: item.isSnack || false,
                isSignature: item.isSignature || false
            })),
            total: cartTotal,
            stampsEarned: drinksCount,
            pickupTime: pickupTime
        };
        state.orderHistory.unshift(order);
    }

    // Save reward redemptions to history
    rewardItems.forEach(item => {
        state.orderHistory.unshift({
            id: Date.now() + Math.random(),
            type: 'shop',
            date: new Date().toISOString(),
            itemId: item.id,
            itemName: item.name,
            itemIcon: item.icon,
            stampsCost: item.stampsCost
        });
    });

    // Keep only last 50 orders
    if (state.orderHistory.length > 50) {
        state.orderHistory = state.orderHistory.slice(0, 50);
    }

    // Show success overlay
    const cartSuccess = document.getElementById('cartSuccess');
    const successStamps = document.getElementById('successStamps');

    let successMessage = '';
    if (drinksCount > 0 && rewardItems.length > 0) {
        successMessage = `+${drinksCount} stamps earned, ${rewardItems.length} reward${rewardItems.length > 1 ? 's' : ''} unlocked!`;
    } else if (drinksCount > 0) {
        successMessage = `+${drinksCount} stamp${drinksCount !== 1 ? 's' : ''} earned!`;
    } else if (rewardItems.length > 0) {
        successMessage = `${rewardItems.length} reward${rewardItems.length > 1 ? 's' : ''} unlocked!`;
    } else {
        successMessage = 'Thanks for your order!';
    }
    successStamps.textContent = successMessage;
    cartSuccess.classList.add('show');

    // Check for newly unlocked rewards
    checkRewardUnlocks();

    // Check for achievements
    checkAchievements();

    // Clear cart after a delay
    setTimeout(() => {
        state.cart = [];
        saveState();
        renderCart();
        updateStats();
        renderPassportCanvas();
        updateCollectionStats();
        renderRewardsSection();

        // Hide success and close phone
        setTimeout(() => {
            cartSuccess.classList.remove('show');
            if (typeof closePhone === 'function') {
                closePhone();
            }
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

    // Modal close on backdrop click
    rabbitModal.addEventListener('click', (e) => {
        if (e.target === rabbitModal) {
            closeModal(rabbitModal);
        }
    });
}

function openRabbitModal(rabbitId) {
    const rabbit = RABBITS.find(r => r.id === rabbitId);
    if (!rabbit) return;

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

    // Get user's support for this bun
    const userSpending = state.rabbitSpending[rabbit.id] || 0;

    Modal.open({
        type: 'rabbit',
        variant: 'full-bleed',
        class: 'rabbit-card-detail',
        content: `
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
                        <div class="signature-item-card" onclick="addSnackToCart('${signatureSnack.id}', true)">
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
        `
    });
}

// Navigate to menu and open drink modal
function navigateAndOpenDrink(drinkId) {
    Modal.close();
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

// ============================================
// UNIFIED MODAL SYSTEM
// Single modal element, dynamic content
// ============================================
const Modal = {
    _modalId: 'appModal',
    _onClose: null,
    _currentType: null,
    _initialized: false,

    // Initialize modal system (call once on DOMContentLoaded)
    init() {
        if (this._initialized) return;
        this._initialized = true;

        const modal = document.getElementById(this._modalId);
        if (!modal) return;

        // Global backdrop click handler
        const backdrop = document.getElementById('modalBackdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.close());
        }

        // Click on modal background (outside content) closes it
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.close();
            }
        });

        // Close button handler (X button)
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Footer close button handler
        const footerCloseBtn = modal.querySelector('.modal-close-btn');
        if (footerCloseBtn) {
            footerCloseBtn.addEventListener('click', () => this.close());
        }

        // Escape key closes modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                this.close();
            }
        });
    },

    // Open modal with content
    // Options: {
    //   content: string (HTML),
    //   variant: 'default' | 'full-bleed',
    //   class: string (additional CSS class for modal-content),
    //   onClose: fn(),
    //   onOpen: fn(modal)
    // }
    open(options = {}) {
        const modal = document.getElementById(this._modalId);
        if (!modal) return;

        const content = modal.querySelector('.modal-content');
        const body = modal.querySelector('.modal-body');

        // Reset classes
        content.className = 'modal-content';
        modal.removeAttribute('data-variant');

        // Apply variant
        if (options.variant === 'full-bleed') {
            modal.setAttribute('data-variant', 'full-bleed');
        }

        // Apply additional class
        if (options.class) {
            content.classList.add(options.class);
        }

        // Set content
        if (options.content) {
            body.innerHTML = options.content;
        }

        // Store callbacks
        this._onClose = options.onClose || null;
        this._currentType = options.type || null;

        // Show backdrop
        const backdrop = document.getElementById('modalBackdrop');
        if (backdrop) backdrop.classList.add('open');

        // Show modal
        modal.classList.add('open');
        document.body.classList.add('no-scroll');

        // Call onOpen callback
        if (options.onOpen) {
            options.onOpen(modal);
        }
    },

    // Close the modal
    close() {
        const modal = document.getElementById(this._modalId);
        if (!modal) return;

        // Call onClose callback
        if (this._onClose) {
            this._onClose();
            this._onClose = null;
        }
        this._currentType = null;

        // Hide modal
        modal.classList.remove('open');

        // Hide backdrop
        const backdrop = document.getElementById('modalBackdrop');
        if (backdrop) backdrop.classList.remove('open');
        unlockScroll();

        // Clear content after animation
        setTimeout(() => {
            const body = modal.querySelector('.modal-body');
            if (body && !modal.classList.contains('open')) {
                body.innerHTML = '';
            }
        }, 300);
    },

    // Check if modal is open
    isOpen() {
        const modal = document.getElementById(this._modalId);
        return modal?.classList.contains('open') || false;
    },

    // Get current modal type
    getType() {
        return this._currentType;
    }
};

// Backward-compatible wrapper functions
function closeAllModals() {
    Modal.close();
}

function openModal(modalElement) {
    // Legacy support - not recommended
    console.warn('openModal() is deprecated. Use Modal.open() instead.');
}

function closeModal(modalElement) {
    Modal.close();
}

// Open home section modals - now uses unified Modal system
function populateHomeModal(modalId) {
    switch (modalId) {
        case 'statsModal':
            populatePassportStats();
            populatePassportProgress();
            break;
        case 'progressModal':
            populatePassportProgress();
            break;
        case 'rankingsModal':
            openRankingsModal();
            break;
        case 'featuredModal':
            openFeaturedModal();
            break;
        case 'trendingModal':
            openTrendingModal();
            break;
    }
}

function populatePassportStats() {
    const totalDrinks = state.orders?.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0) || 0;
    const totalVisits = state.visits?.length || 0;
    const totalStamps = state.stamps || 0;
    const totalAchievements = state.achievements?.length || 0;

    // Update passport stats bar
    const passportDrinks = document.getElementById('passportDrinks');
    const passportVisits = document.getElementById('passportVisits');
    const passportStamps = document.getElementById('passportStamps');
    const passportAchievements = document.getElementById('passportAchievements');

    if (passportDrinks) passportDrinks.textContent = totalDrinks;
    if (passportVisits) passportVisits.textContent = totalVisits;
    if (passportStamps) passportStamps.textContent = totalStamps;
    if (passportAchievements) passportAchievements.textContent = totalAchievements;
}

function populatePassportProgress() {
    // Next Reward
    const stamps = state.stamps || 0;
    const rewardThresholds = [5, 10, 15, 25, 50];
    const rewardNames = ['Free Topping', 'Size Upgrade', 'Free Drink', 'Mystery Box', 'VIP Status'];
    let nextRewardIdx = rewardThresholds.findIndex(t => stamps < t);
    if (nextRewardIdx === -1) nextRewardIdx = rewardThresholds.length - 1;
    const nextThreshold = rewardThresholds[nextRewardIdx];
    const prevThreshold = nextRewardIdx > 0 ? rewardThresholds[nextRewardIdx - 1] : 0;
    const progress = ((stamps - prevThreshold) / (nextThreshold - prevThreshold)) * 100;

    const passportNextReward = document.getElementById('passportNextReward');
    const passportRewardProgress = document.getElementById('passportRewardProgress');
    const passportRewardText = document.getElementById('passportRewardText');

    if (passportNextReward) passportNextReward.textContent = rewardNames[nextRewardIdx];
    if (passportRewardProgress) passportRewardProgress.style.width = `${Math.min(progress, 100)}%`;
    if (passportRewardText) passportRewardText.textContent = `${stamps}/${nextThreshold}`;

    // Best Friend
    const friendships = state.friendships || {};
    const bestFriend = Object.entries(friendships).sort((a, b) => b[1] - a[1])[0];
    const passportBestBun = document.getElementById('passportBestBun');

    if (bestFriend && passportBestBun) {
        const rabbit = RABBITS.find(r => r.id === bestFriend[0]);
        if (rabbit) {
            passportBestBun.textContent = `${rabbit.emoji} ${rabbit.name}`;
        }
    } else if (passportBestBun) {
        passportBestBun.textContent = 'Visit buns!';
    }
}

function openRankingsModal() {
    // Calculate popularity based on visits and friendships
    const rankings = RABBITS.map(rabbit => {
        const visits = state.visits?.filter(v => v.rabbitId === rabbit.id).length || 0;
        const friendship = state.friendships?.[rabbit.id] || 0;
        const score = visits * 10 + friendship;
        return { ...rabbit, score, visits, friendship };
    }).sort((a, b) => b.score - a.score);

    const rankingsHtml = rankings.slice(0, 10).map((rabbit, index) => `
        <div class="ranking-item" onclick="Modal.close(); openRabbitModal('${rabbit.id}')">
            <span class="ranking-position">${index + 1}</span>
            <span class="ranking-emoji">${rabbit.emoji}</span>
            <span class="ranking-name">${rabbit.name}</span>
            <span class="ranking-score">${rabbit.score} pts</span>
        </div>
    `).join('');

    Modal.open({
        type: 'rankings',
        class: 'home-modal-content',
        content: `
            <h3 class="modal-title">Bun Popularity Rankings</h3>
            <p class="modal-subtitle">Based on visits and friendships across the cafe</p>
            <div class="rankings-list-modal">${rankingsHtml}</div>
        `
    });
}

function openFeaturedModal() {
    // Pick a random featured bun
    const featured = RABBITS[Math.floor(Math.random() * RABBITS.length)];
    const friendship = state.friendships?.[featured.id] || 0;

    Modal.open({
        type: 'featured',
        class: 'home-modal-content',
        content: `
            <h3 class="modal-title">Today's Star Bun</h3>
            <div class="featured-bun-modal">
                <div class="featured-bun-image">${featured.emoji}</div>
                <h4 class="featured-bun-name">${featured.name}</h4>
                <p class="featured-bun-personality">${featured.personality}</p>
                <div class="featured-bun-stats">
                    <span>Your friendship: ${friendship} pts</span>
                </div>
                <button class="btn btn-primary" onclick="Modal.close(); openRabbitModal('${featured.id}')">
                    Meet ${featured.name}
                </button>
            </div>
        `
    });
}

function openTrendingModal() {
    // Get popular drinks and rabbits
    const popularDrinks = DRINKS.slice(0, 3);
    const popularRabbits = RABBITS.slice(0, 3);

    Modal.open({
        type: 'trending',
        class: 'home-modal-content',
        content: `
            <h3 class="modal-title">Trending Now</h3>
            <div class="trending-grid-modal">
                <div class="trending-section">
                    <h4>Popular Drinks</h4>
                    ${popularDrinks.map(drink => `
                        <div class="trending-item" onclick="Modal.close(); openDrinkModal('${drink.id}')">
                            <span class="trending-emoji">${drink.emoji}</span>
                            <span class="trending-name">${drink.name}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="trending-section">
                    <h4>Popular Buns</h4>
                    ${popularRabbits.map(rabbit => `
                        <div class="trending-item" onclick="Modal.close(); openRabbitModal('${rabbit.id}')">
                            <span class="trending-emoji">${rabbit.emoji}</span>
                            <span class="trending-name">${rabbit.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `
    });
}

// Legacy function for backwards compatibility
function populateRankingsModal() { openRankingsModal(); }
function populateFeaturedModal() { openFeaturedModal(); }
function populateTrendingModal() { openTrendingModal(); }

// ============================================
// SCHEDULING
// ============================================
function initScheduling() {
    // Scheduling is now handled by openScheduleModal() which creates the form dynamically
    // No static initialization needed
}

function openScheduleModal(rabbitId = null) {
    // Close any current modal first
    Modal.close();

    // Build rabbit options
    const rabbitOptions = RABBITS.map(r =>
        `<option value="${r.id}" ${r.id === rabbitId ? 'selected' : ''}>${r.name}</option>`
    ).join('');

    const selectedRabbitId = rabbitId || RABBITS[0]?.id;

    Modal.open({
        type: 'schedule',
        class: 'schedule-modal-content',
        content: `
            <h3 class="modal-title">Schedule a Visit</h3>
            <div class="schedule-form" id="scheduleForm">
                <div class="form-group">
                    <label>Choose a Rabbit</label>
                    <select id="scheduleRabbit" class="form-select">
                        ${rabbitOptions}
                    </select>
                </div>

                <div class="bun-preview" id="bunPreview"></div>
                <div class="signature-upsell" id="signatureUpsell"></div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Select Date & Time</label>
                        <input type="datetime-local" id="scheduleTime" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Duration</label>
                        <select id="scheduleDuration" class="form-select">
                            <option value="15">15 min - $10</option>
                            <option value="30" selected>30 min - $18</option>
                            <option value="60">1 hour - $30</option>
                        </select>
                    </div>
                </div>

                <div class="schedule-addons">
                    <h4>Add Treats for Your Bun</h4>
                    <p class="addon-hint">Treats increase friendship!</p>
                    <div class="addon-grid treats-grid">
                        <label class="addon-item"><input type="checkbox" class="treat-checkbox" value="premium-hay"><span class="addon-icon">🌾</span><span class="addon-name">Premium Hay</span><span class="addon-price">$3.00</span></label>
                        <label class="addon-item"><input type="checkbox" class="treat-checkbox" value="banana-chip"><span class="addon-icon">🍌</span><span class="addon-name">Banana Chips</span><span class="addon-price">$2.50</span></label>
                        <label class="addon-item"><input type="checkbox" class="treat-checkbox" value="apple-slice"><span class="addon-icon">🍎</span><span class="addon-name">Apple Slices</span><span class="addon-price">$2.00</span></label>
                        <label class="addon-item"><input type="checkbox" class="treat-checkbox" value="carrot-sticks"><span class="addon-icon">🥕</span><span class="addon-name">Carrot Sticks</span><span class="addon-price">$2.00</span></label>
                        <label class="addon-item"><input type="checkbox" class="treat-checkbox" value="herbal-mix"><span class="addon-icon">🌿</span><span class="addon-name">Herbal Mix</span><span class="addon-price">$4.00</span></label>
                        <label class="addon-item"><input type="checkbox" class="treat-checkbox" value="papaya-treats"><span class="addon-icon">🧡</span><span class="addon-name">Papaya Treats</span><span class="addon-price">$3.50</span></label>
                    </div>

                    <h4>Add Toys for Your Bun</h4>
                    <p class="addon-hint">Toys give bonus friendship points!</p>
                    <div class="addon-grid toys-grid">
                        <label class="addon-item"><input type="checkbox" class="toy-checkbox" value="willow-ball"><span class="addon-icon">⚽</span><span class="addon-name">Willow Ball</span><span class="addon-price">$5.00</span></label>
                        <label class="addon-item"><input type="checkbox" class="toy-checkbox" value="tunnel"><span class="addon-icon">🕳️</span><span class="addon-name">Bunny Tunnel</span><span class="addon-price">$12.00</span></label>
                        <label class="addon-item"><input type="checkbox" class="toy-checkbox" value="stacking-cups"><span class="addon-icon">🥤</span><span class="addon-name">Stacking Cups</span><span class="addon-price">$8.00</span></label>
                        <label class="addon-item"><input type="checkbox" class="toy-checkbox" value="dig-box"><span class="addon-icon">📦</span><span class="addon-name">Dig Box</span><span class="addon-price">$6.00</span></label>
                        <label class="addon-item"><input type="checkbox" class="toy-checkbox" value="treat-puzzle"><span class="addon-icon">🧩</span><span class="addon-name">Treat Puzzle</span><span class="addon-price">$10.00</span></label>
                        <label class="addon-item"><input type="checkbox" class="toy-checkbox" value="plush-carrot"><span class="addon-icon">🥕</span><span class="addon-name">Plush Carrot</span><span class="addon-price">$7.00</span></label>
                    </div>
                </div>

                <button class="btn btn-primary btn-full" id="confirmSchedule">Book Visit (+2 stamps)</button>
            </div>
        `,
        onOpen: () => {
            // Setup event listeners after modal opens
            const selectEl = document.getElementById('scheduleRabbit');
            if (selectEl) {
                selectEl.addEventListener('change', (e) => {
                    updateBunPreview(e.target.value);
                    updateSignatureUpsell(e.target.value);
                });
            }
            const confirmBtn = document.getElementById('confirmSchedule');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', handleScheduleVisit);
            }
            // Populate initial preview
            updateBunPreview(selectedRabbitId);
            updateSignatureUpsell(selectedRabbitId);
        }
    });
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
    // Suppress upsell since user is already booking with this bun
    addToCart(drinkId, true);
    // Mark the button as added
    const btn = event.target;
    btn.textContent = '✓ Added';
    btn.disabled = true;
    btn.classList.add('added');
}

// Add signature snack to cart from schedule modal
function addSignatureSnackFromSchedule(snackId) {
    // Suppress upsell since user is already booking with this bun
    addSnackToCart(snackId, true);
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
    state.totalStampsEarned += 2;
    state.rabbitVisits++;

    // Track unique buns visited for achievements
    if (!state.uniqueBunsVisited.includes(rabbitId)) {
        state.uniqueBunsVisited.push(rabbitId);
    }

    // Track total spent for achievements
    state.totalSpent += totalCost;

    // Add friendship points
    let totalFriendshipPoints = baseFriendshipPoints;

    selectedTreats.forEach(treat => {
        if (treat) {
            totalFriendshipPoints += treat.friendshipPoints;
            addFriendshipPoints(rabbitId, treat.friendshipPoints, 'treat');
            state.treatsGivenTotal++;
        }
    });

    selectedToys.forEach(toy => {
        if (toy) {
            totalFriendshipPoints += toy.friendshipPoints;
            addFriendshipPoints(rabbitId, toy.friendshipPoints, 'toy');
            state.toysPlayedTotal++;
        }
    });

    // Add base visit points
    addFriendshipPoints(rabbitId, baseFriendshipPoints, 'visit');

    // Add spending for leaderboard
    addRabbitSpending(rabbitId, totalCost);

    // Save visit to history
    const visit = {
        id: Date.now(),
        date: new Date().toISOString(),
        rabbitId: rabbitId,
        rabbitName: rabbit.name,
        duration: duration,
        treats: selectedTreats.map(t => t?.name).filter(Boolean),
        toys: selectedToys.map(t => t?.name).filter(Boolean),
        cost: totalCost,
        friendshipPointsEarned: totalFriendshipPoints
    };
    state.visitHistory.unshift(visit);

    // Keep only last 50 visits
    if (state.visitHistory.length > 50) {
        state.visitHistory = state.visitHistory.slice(0, 50);
    }

    checkRewardUnlocks();

    // Check for achievements
    checkAchievements();
    saveState();
    updateStats();
    renderPassportCanvas();
    updateCollectionStats();
    renderRewardsSection();

    // Clear checkboxes
    document.querySelectorAll('.treat-checkbox, .toy-checkbox').forEach(cb => cb.checked = false);

    closeModal(document.getElementById('scheduleModal'));

    const treatsMsg = selectedTreats.length > 0 ? ` +${selectedTreats.length} treats` : '';
    const toysMsg = selectedToys.length > 0 ? ` +${selectedToys.length} toys` : '';
    showToast(`Visit with ${rabbit.name} booked!${treatsMsg}${toysMsg} +2 stamps!`, '🐰');
}

// ============================================
// PASSPORT / STAMPS
// ============================================
// ============================================
// PASSPORT CANVAS
// ============================================
let currentCanvasView = 'all';
let isDragging = false;
let dragItem = null;
let dragOffset = { x: 0, y: 0 };

function initPassport() {
    initCanvasTabs();
    initCanvasDrag();
    initProfile();
    initShopSidebar();
    renderPassportCanvas();
    updateCollectionStats();
}

function initCanvasTabs() {
    const tabs = document.querySelectorAll('.canvas-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCanvasView = tab.dataset.canvasView;
            renderPassportCanvas();
        });
    });
}

function initCanvasDrag() {
    const canvas = document.getElementById('passportCanvas');
    if (!canvas) return;

    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', drag);
    canvas.addEventListener('mouseup', endDrag);
    canvas.addEventListener('mouseleave', endDrag);

    // Touch support
    canvas.addEventListener('touchstart', startDrag, { passive: false });
    canvas.addEventListener('touchmove', drag, { passive: false });
    canvas.addEventListener('touchend', endDrag);
}

function startDrag(e) {
    const target = e.target.closest('.canvas-item');
    if (!target) return;

    e.preventDefault();
    isDragging = true;
    dragItem = target;
    dragItem.classList.add('dragging');

    const canvas = document.getElementById('passportCanvas');
    const canvasRect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Get current position from style (already relative to canvas)
    const currentLeft = parseInt(dragItem.style.left) || 0;
    const currentTop = parseInt(dragItem.style.top) || 0;

    // Calculate where in the canvas the click occurred
    const clickX = clientX - canvasRect.left;
    const clickY = clientY - canvasRect.top;

    // Offset is difference between click position and item position
    dragOffset = {
        x: clickX - currentLeft,
        y: clickY - currentTop
    };
}

function drag(e) {
    if (!isDragging || !dragItem) return;

    e.preventDefault();
    const canvas = document.getElementById('passportCanvas');
    const canvasRect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let x = clientX - canvasRect.left - dragOffset.x;
    let y = clientY - canvasRect.top - dragOffset.y;

    // Keep within bounds
    const itemRect = dragItem.getBoundingClientRect();
    x = Math.max(0, Math.min(x, canvasRect.width - itemRect.width));
    y = Math.max(0, Math.min(y, canvasRect.height - itemRect.height));

    dragItem.style.left = `${x}px`;
    dragItem.style.top = `${y}px`;
}

function endDrag(e) {
    if (!isDragging || !dragItem) return;

    isDragging = false;
    dragItem.classList.remove('dragging');

    // Save position
    const itemId = dragItem.dataset.itemId;
    const x = parseInt(dragItem.style.left) || 0;
    const y = parseInt(dragItem.style.top) || 0;

    state.canvasPositions[itemId] = { x, y };
    saveState();

    dragItem = null;
}

function getUnlockedFriendshipStickers() {
    const stickers = [];
    RABBITS.forEach(rabbit => {
        const friendship = state.friendships[rabbit.id];
        if (!friendship || friendship.points <= 0) return; // Must have actual interaction

        const level = getFriendshipLevelForRabbit(rabbit.id);
        // Only add stickers for levels actually reached (level 1+)
        // Level 0 (Stranger) doesn't count as unlocked
        for (let i = 1; i <= level.level; i++) {
            const levelData = FRIENDSHIP_LEVELS[i];
            stickers.push({
                id: `bun-${rabbit.id}-${i}`,
                type: 'bun',
                rabbitId: rabbit.id,
                rabbitName: rabbit.name,
                rabbitImage: rabbit.image,
                level: i,
                levelName: levelData.name,
                levelIcon: levelData.icon
            });
        }
    });
    return stickers;
}

function renderPassportCanvas() {
    const canvas = document.getElementById('passportCanvas');
    const emptyState = document.getElementById('canvasEmpty');
    if (!canvas) return;

    // Gather all collectibles
    const collectibles = [];

    // Stamps (show individual stamps up to 50, then group)
    const stampCount = Math.min(state.stamps, 50);
    for (let i = 0; i < stampCount; i++) {
        collectibles.push({
            id: `stamp-${i}`,
            type: 'stamp',
            icon: STAMP_ICONS[i % STAMP_ICONS.length]
        });
    }

    // Friendship stickers (buns)
    const bunStickers = getUnlockedFriendshipStickers();
    collectibles.push(...bunStickers);

    // Achievement stickers
    state.unlockedAchievements.forEach(achievementId => {
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (achievement) {
            collectibles.push({
                id: `achievement-${achievement.id}`,
                type: 'achievement',
                name: achievement.name,
                sticker: achievement.sticker
            });
        }
    });

    // Shop items
    state.purchasedItems.forEach(itemId => {
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (item) {
            collectibles.push({
                id: `item-${item.id}`,
                type: 'item',
                name: item.name,
                icon: item.icon
            });
        }
    });

    // Filter by current view
    let filtered = collectibles;
    if (currentCanvasView !== 'all') {
        const typeMap = {
            'stamps': 'stamp',
            'buns': 'bun',
            'achievements': 'achievement',
            'items': 'item'
        };
        filtered = collectibles.filter(c => c.type === typeMap[currentCanvasView]);
    }

    // Show/hide empty state
    if (filtered.length === 0) {
        emptyState.style.display = 'flex';
        canvas.querySelectorAll('.canvas-item').forEach(el => el.remove());
        return;
    }
    emptyState.style.display = 'none';

    // Render items
    const canvasRect = canvas.getBoundingClientRect();
    let html = '';

    filtered.forEach((item, index) => {
        const pos = state.canvasPositions[item.id] || getDefaultPosition(index, canvasRect, filtered.length);
        const content = getItemContent(item);

        html += `
            <div class="canvas-item canvas-${item.type}"
                 data-item-id="${item.id}"
                 style="left: ${pos.x}px; top: ${pos.y}px;"
                 title="${getItemTooltip(item)}">
                ${content}
            </div>
        `;
    });

    // Keep empty state element, add items
    const existingItems = canvas.querySelectorAll('.canvas-item');
    existingItems.forEach(el => el.remove());
    canvas.insertAdjacentHTML('beforeend', html);
}

function getDefaultPosition(index, canvasRect, total) {
    const cols = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / cols);
    const col = index % cols;
    const spacing = 70;
    const padding = 20;

    return {
        x: padding + (col * spacing) + (Math.random() * 10 - 5),
        y: padding + (row * spacing) + (Math.random() * 10 - 5)
    };
}

function getItemContent(item) {
    switch (item.type) {
        case 'stamp':
            return `<span class="canvas-stamp-icon">${item.icon}</span>`;
        case 'bun':
            return `
                <img src="${item.rabbitImage}" alt="${item.rabbitName}" class="canvas-bun-img">
                <span class="canvas-bun-level">${item.levelIcon}</span>
            `;
        case 'achievement':
            return `<span class="canvas-achievement-sticker">${item.sticker}</span>`;
        case 'item':
            return `<span class="canvas-item-icon">${item.icon}</span>`;
        default:
            return '';
    }
}

function getItemTooltip(item) {
    switch (item.type) {
        case 'stamp':
            return 'Drink Stamp';
        case 'bun':
            return `${item.rabbitName} - ${item.levelName}`;
        case 'achievement':
            return item.name;
        case 'item':
            return item.name;
        default:
            return '';
    }
}

function initShopSidebar() {
    renderShopSidebar();
}

function renderShopSidebar() {
    const shopList = document.getElementById('shopItemsList');
    if (!shopList) return;

    shopList.innerHTML = SHOP_ITEMS.map(item => {
        const owned = state.purchasedItems.includes(item.id);
        const canAfford = state.stamps >= item.stampsRequired;

        return `
            <div class="shop-sidebar-item ${owned ? 'owned' : ''} ${!owned && !canAfford ? 'locked' : ''}"
                 onclick="${owned ? '' : `openShopModal('${item.id}')`}">
                <span class="shop-sidebar-icon">${item.icon}</span>
                <div class="shop-sidebar-info">
                    <span class="shop-sidebar-name">${item.name}</span>
                    <span class="shop-sidebar-cost">${owned ? '✓ Owned' : `⭐ ${item.stampsRequired}`}</span>
                </div>
            </div>
        `;
    }).join('');
}

function updateCollectionStats() {
    const bunStickers = getUnlockedFriendshipStickers();

    const stampsEl = document.getElementById('collectionStamps');
    const bunsEl = document.getElementById('collectionBuns');
    const achievementsEl = document.getElementById('collectionAchievements');
    const itemsEl = document.getElementById('collectionItems');

    if (stampsEl) stampsEl.textContent = state.stamps;
    if (bunsEl) bunsEl.textContent = `${bunStickers.length} / 65`;
    if (achievementsEl) achievementsEl.textContent = `${state.unlockedAchievements.length} / ${ACHIEVEMENTS.length}`;
    if (itemsEl) itemsEl.textContent = `${state.purchasedItems.length} / ${SHOP_ITEMS.length}`;

    // Update profile stats
    const profileStamps = document.getElementById('profileStamps');
    const profileVisits = document.getElementById('profileVisits');
    if (profileStamps) profileStamps.textContent = state.stamps;
    if (profileVisits) profileVisits.textContent = state.rabbitVisits;
}

// ============================================
// USER PROFILE
// ============================================
function initProfile() {
    const editBtn = document.getElementById('profileEditBtn');

    if (!editBtn) return;

    // Open profile modal
    editBtn.addEventListener('click', openProfileModal);

    renderProfile();
}

function openProfileModal() {
    const avatars = ['🐰', '🐇', '🧋', '🍵', '⭐', '🌸', '💖', '🎀', '✨', '🌙', '🍡', '🥕'];
    const currentAvatar = state.userAvatar || '🐰';

    const avatarButtons = avatars.map(a =>
        `<button class="avatar-option ${a === currentAvatar ? 'selected' : ''}" data-avatar="${a}">${a}</button>`
    ).join('');

    Modal.open({
        type: 'profile',
        class: 'profile-modal-content',
        content: `
            <h3 class="profile-modal-title">Edit Profile</h3>
            <div class="profile-edit-form">
                <div class="form-group">
                    <label class="form-label">Your Name</label>
                    <input type="text" id="profileNameInput" class="form-input" placeholder="Enter your name" maxlength="20" value="${state.userName || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Choose Your Avatar</label>
                    <div class="avatar-picker" id="avatarPicker">
                        ${avatarButtons}
                    </div>
                </div>
                <button class="btn btn-primary btn-full" id="profileSaveBtn">Save Profile</button>
            </div>
        `,
        onOpen: () => {
            // Avatar selection
            const avatarPicker = document.getElementById('avatarPicker');
            avatarPicker?.addEventListener('click', (e) => {
                const option = e.target.closest('.avatar-option');
                if (option) {
                    avatarPicker.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                }
            });

            // Save profile
            document.getElementById('profileSaveBtn')?.addEventListener('click', () => {
                const nameInput = document.getElementById('profileNameInput');
                const selectedAvatar = avatarPicker?.querySelector('.avatar-option.selected');
                state.userName = nameInput?.value.trim() || '';
                state.userAvatar = selectedAvatar ? selectedAvatar.dataset.avatar : '🐰';

                if (state.userName && !state.memberSince) {
                    state.memberSince = new Date().toISOString();
                }

                saveState();
                renderProfile();
                Modal.close();
                showToast('Profile updated!', state.userAvatar);
            });
        }
    });
}

function updateAvatarSelection(avatar) {
    const avatarPicker = document.getElementById('avatarPicker');
    avatarPicker.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.avatar === avatar);
    });
}

function renderProfile() {
    const profileName = document.getElementById('profileName');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileDrinks = document.getElementById('profileDrinks');
    const profileVisits = document.getElementById('profileVisits');
    const profileStamps = document.getElementById('profileStamps');
    const profileMemberSince = document.getElementById('profileMemberSince');
    const passportOwner = document.getElementById('passportOwner');

    const displayName = state.userName || 'Guest';

    if (profileName) profileName.textContent = displayName;
    if (profileAvatar) profileAvatar.textContent = state.userAvatar || '🐰';
    if (profileDrinks) profileDrinks.textContent = state.drinksOrdered;
    if (profileVisits) profileVisits.textContent = state.rabbitVisits;
    if (profileStamps) profileStamps.textContent = state.stamps;
    if (passportOwner) passportOwner.textContent = displayName;

    if (profileMemberSince) {
        if (state.memberSince) {
            const date = new Date(state.memberSince);
            const options = { month: 'short', year: 'numeric' };
            profileMemberSince.textContent = `Member since ${date.toLocaleDateString('en-US', options)}`;
        } else if (state.hasVisited) {
            profileMemberSince.textContent = 'Regular visitor';
        } else {
            profileMemberSince.textContent = 'New member';
        }
    }
}

// ============================================
// ORDER & VISIT HISTORY
// ============================================
let currentHistoryTab = 'orders';

function initHistory() {
    const tabs = document.querySelectorAll('.history-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentHistoryTab = tab.dataset.history;
            renderHistory();
        });
    });

    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('historyContent');
    if (!container) return;

    if (currentHistoryTab === 'orders') {
        renderOrderHistory(container);
    } else {
        renderVisitHistory(container);
    }
}

function renderOrderHistory(container) {
    if (state.orderHistory.length === 0) {
        container.innerHTML = `
            <div class="history-empty">
                <span class="history-empty-icon">🧋</span>
                <p>No orders yet!</p>
                <button class="btn btn-small btn-primary" data-navigate="cafe">Order Your First Drink</button>
            </div>
        `;
        attachNavigationHandler(container);
        return;
    }

    container.innerHTML = state.orderHistory.slice(0, 10).map(order => {
        const date = new Date(order.date);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        // Handle shop redemptions vs regular orders
        if (order.type === 'shop') {
            return `
                <div class="history-item history-shop">
                    <div class="history-icon">${order.itemIcon}</div>
                    <div class="history-info">
                        <div class="history-title">Shop Redemption</div>
                        <div class="history-details">${order.itemName}</div>
                        <div class="history-meta">
                            <span class="history-date">${dateStr} at ${timeStr}</span>
                            <span class="history-stamps spent">-${order.stampsCost} stamps</span>
                        </div>
                    </div>
                    <div class="history-price redeemed">🎁</div>
                </div>
            `;
        }

        // Regular drink/snack order
        const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const itemNames = order.items.map(i => i.quantity > 1 ? `${i.name} x${i.quantity}` : i.name).join(', ');

        return `
            <div class="history-item">
                <div class="history-icon">🧋</div>
                <div class="history-info">
                    <div class="history-title">${itemCount} item${itemCount !== 1 ? 's' : ''}</div>
                    <div class="history-details">${itemNames}</div>
                    <div class="history-meta">
                        <span class="history-date">${dateStr} at ${timeStr}</span>
                        ${order.stampsEarned > 0 ? `<span class="history-stamps">+${order.stampsEarned} stamps</span>` : ''}
                    </div>
                </div>
                <div class="history-price">$${order.total.toFixed(2)}</div>
            </div>
        `;
    }).join('');

    if (state.orderHistory.length > 10) {
        container.innerHTML += `<p class="history-more">Showing last 10 of ${state.orderHistory.length} orders</p>`;
    }
}

function renderVisitHistory(container) {
    if (state.visitHistory.length === 0) {
        container.innerHTML = `
            <div class="history-empty">
                <span class="history-empty-icon">🐰</span>
                <p>No visits yet!</p>
                <button class="btn btn-small btn-primary" data-navigate="cafe">Meet the Buns</button>
            </div>
        `;
        attachNavigationHandler(container);
        return;
    }

    container.innerHTML = state.visitHistory.slice(0, 10).map(visit => {
        const date = new Date(visit.date);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const extras = [...visit.treats, ...visit.toys];
        const extrasStr = extras.length > 0 ? extras.join(', ') : 'No extras';

        return `
            <div class="history-item" onclick="openRabbitModal('${visit.rabbitId}')" style="cursor: pointer;">
                <div class="history-item-icon">🐰</div>
                <div class="history-item-info">
                    <div class="history-item-title">${visit.rabbitName}</div>
                    <div class="history-item-details">${visit.duration} min • ${extrasStr}</div>
                    <div class="history-item-meta">
                        <span>${dateStr}</span>
                        <span class="history-points">+${visit.friendshipPointsEarned} friendship</span>
                    </div>
                </div>
                <div class="history-item-price">$${visit.cost.toFixed(2)}</div>
            </div>
        `;
    }).join('');

    if (state.visitHistory.length > 10) {
        container.innerHTML += `<p class="history-more">Showing last 10 of ${state.visitHistory.length} visits</p>`;
    }
}

function attachNavigationHandler(container) {
    const navBtn = container.querySelector('[data-navigate]');
    if (navBtn) {
        navBtn.addEventListener('click', () => {
            document.querySelector(`[data-page="${navBtn.dataset.navigate}"]`).click();
        });
    }
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

    // Also update achievements display
    renderAchievements();

    // Also update profile display
    renderProfile();
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
// ACHIEVEMENTS / STICKERS
// ============================================
let currentAchievementCategory = 'all';

function initAchievements() {
    const tabButtons = document.querySelectorAll('.achievement-tab');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentAchievementCategory = btn.dataset.category;
            renderAchievements();
        });
    });

    renderAchievements();
}

function renderAchievements() {
    const achievementGrid = document.getElementById('achievementGrid');
    const achievementCount = document.getElementById('achievementCount');
    const achievementTotal = document.getElementById('achievementTotal');
    const achievementStamps = document.getElementById('achievementStamps');

    if (!achievementGrid) return;

    // Update stats
    const unlockedCount = state.unlockedAchievements.length;
    const totalCount = ACHIEVEMENTS.length;
    const stampsFromAchievements = state.unlockedAchievements.reduce((sum, id) => {
        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        return sum + (achievement?.reward?.stamps || 0);
    }, 0);

    achievementCount.textContent = unlockedCount;
    achievementTotal.textContent = `/ ${totalCount}`;
    achievementStamps.textContent = stampsFromAchievements;

    // Filter achievements by category
    let filteredAchievements = ACHIEVEMENTS;
    if (currentAchievementCategory !== 'all') {
        filteredAchievements = ACHIEVEMENTS.filter(a => a.category === currentAchievementCategory);
    }

    // Render achievement cards
    achievementGrid.innerHTML = filteredAchievements.map(achievement => {
        const isUnlocked = state.unlockedAchievements.includes(achievement.id);
        const category = ACHIEVEMENT_CATEGORIES[achievement.category];
        const progress = getAchievementProgress(achievement);
        const progressPercent = Math.min((progress.current / progress.total) * 100, 100);

        return `
            <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-sticker" style="${isUnlocked ? '' : 'filter: grayscale(100%); opacity: 0.5;'}">
                    ${achievement.sticker}
                </div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                    ${!isUnlocked ? `
                        <div class="achievement-progress">
                            <div class="achievement-progress-bar">
                                <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
                            </div>
                            <span class="achievement-progress-text">${progress.current}/${progress.total}</span>
                        </div>
                    ` : `
                        <div class="achievement-reward">
                            <span class="achievement-reward-icon">⭐</span>
                            <span class="achievement-reward-text">+${achievement.reward.stamps} stamps</span>
                        </div>
                    `}
                </div>
                <div class="achievement-category-badge" style="background: ${category.color}20; color: ${category.color}">
                    ${category.icon}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// SHOP
// ============================================
let currentShopItem = null;

function initShop() {
    renderShop();

    // Set up modal event listeners
    const shopModal = document.getElementById('shopModal');
    const shopModalClose = document.getElementById('shopModalClose');
    const shopCancelBtn = document.getElementById('shopCancelBtn');
    const shopConfirmBtn = document.getElementById('shopConfirmBtn');

    shopCancelBtn.addEventListener('click', closeShopModal);
    shopConfirmBtn.addEventListener('click', confirmShopPurchase);

    // Close on backdrop click
    shopModal.addEventListener('click', (e) => {
        if (e.target === shopModal) {
            closeShopModal();
        }
    });
}

function renderShop() {
    const shopGrid = document.getElementById('shopGrid');
    if (!shopGrid) return;

    shopGrid.innerHTML = SHOP_ITEMS.map(item => {
        const owned = state.purchasedItems.includes(item.id);
        const canAfford = state.stamps >= item.stampsRequired;

        let statusText = '';
        let statusClass = '';

        if (owned) {
            statusText = '✓ Owned';
            statusClass = 'owned';
        } else if (canAfford) {
            statusText = `⭐ ${item.stampsRequired} stamps`;
            statusClass = 'available';
        } else {
            statusText = `🔒 ${item.stampsRequired} stamps`;
            statusClass = 'locked';
        }

        return `
            <div class="shop-item ${statusClass}"
                 onclick="openShopModal('${item.id}')"
                 data-item-id="${item.id}">
                <div class="shop-item-image">${item.icon}</div>
                <div class="shop-item-info">
                    <h3 class="shop-item-name">${item.name}</h3>
                    <p class="shop-item-desc">${item.description}</p>
                    <p class="shop-item-cost ${statusClass}">${statusText}</p>
                </div>
                ${owned ? '<div class="shop-item-owned-badge">Owned</div>' : ''}
            </div>
        `;
    }).join('');
}

function openShopModal(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    currentShopItem = item;
    const owned = state.purchasedItems.includes(item.id);
    const canAfford = state.stamps >= item.stampsRequired;

    let btnText, btnDisabled, noteText, noteClass;
    if (owned) {
        btnText = 'Already Owned';
        btnDisabled = true;
        noteText = 'You already have this item in your collection!';
        noteClass = 'shop-modal-note owned';
    } else if (canAfford) {
        btnText = 'Redeem';
        btnDisabled = false;
        noteText = 'This will deduct stamps from your balance.';
        noteClass = 'shop-modal-note';
    } else {
        btnText = 'Not Enough Stamps';
        btnDisabled = true;
        const needed = item.stampsRequired - state.stamps;
        noteText = `You need ${needed} more stamp${needed > 1 ? 's' : ''} to redeem this item.`;
        noteClass = 'shop-modal-note locked';
    }

    Modal.open({
        type: 'shop',
        class: 'shop-modal-content',
        content: `
            <div class="shop-modal-item">
                <div class="shop-modal-icon">${item.icon}</div>
                <div class="shop-modal-info">
                    <h3 class="shop-modal-name">${item.name}</h3>
                    <p class="shop-modal-desc">${item.description}</p>
                </div>
            </div>
            <div class="shop-modal-cost">
                <div class="shop-modal-stamps">
                    <span class="stamps-icon">⭐</span>
                    <span class="stamps-amount">${item.stampsRequired}</span>
                    <span class="stamps-label">stamps</span>
                </div>
                <div class="shop-modal-balance">
                    You have: <span>${state.stamps}</span> stamps
                </div>
            </div>
            <div class="shop-modal-actions">
                <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
                <button class="btn btn-primary" onclick="confirmShopPurchase()" ${btnDisabled ? 'disabled' : ''}>${btnText}</button>
            </div>
            <p class="${noteClass}">${noteText}</p>
        `,
        onClose: () => {
            currentShopItem = null;
        }
    });
}

function closeShopModal() {
    Modal.close();
}

function confirmShopPurchase() {
    if (!currentShopItem) return;

    const item = currentShopItem;
    const owned = state.purchasedItems.includes(item.id);
    const canAfford = state.stamps >= item.stampsRequired;

    if (owned || !canAfford) return;

    // Deduct stamps and add to purchased items
    state.stamps -= item.stampsRequired;
    state.purchasedItems.push(item.id);

    // Add to order history
    const purchase = {
        id: Date.now(),
        type: 'shop',
        date: new Date().toISOString(),
        itemId: item.id,
        itemName: item.name,
        itemIcon: item.icon,
        stampsCost: item.stampsRequired
    };
    state.orderHistory.unshift(purchase);

    // Keep history manageable
    if (state.orderHistory.length > 50) {
        state.orderHistory = state.orderHistory.slice(0, 50);
    }

    saveState();

    // Close modal and show success
    closeShopModal();
    showToast(`${item.name} redeemed!`, item.icon);

    // Check achievements
    checkAchievements();

    // Re-render rewards and canvas
    renderRewardsSection();
    renderPassportCanvas();
    updateCollectionStats();
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
    renderPassportCanvas();
    updateCollectionStats();
    renderRewardsSection();
    renderCheckin();

    showToast('Daily check-in complete! +1 stamp!', '🐰');
}

// ============================================
// STATS
// ============================================
function updateStats() {
    // Outside stats
    document.getElementById('statDrinks').textContent = state.drinksOrdered;
    document.getElementById('statVisits').textContent = state.rabbitVisits;
    document.getElementById('statStamps').textContent = state.stamps;

    // Inside stats
    const statDrinksInside = document.getElementById('statDrinksInside');
    const statVisitsInside = document.getElementById('statVisitsInside');
    const statStampsInside = document.getElementById('statStampsInside');
    if (statDrinksInside) statDrinksInside.textContent = state.drinksOrdered;
    if (statVisitsInside) statVisitsInside.textContent = state.rabbitVisits;
    if (statStampsInside) statStampsInside.textContent = state.stamps;

    // Update passport stats
    populatePassportStats();
    populatePassportProgress();

    // Also update home page sections
    renderHomePage();

    // Update inside progress
    renderInsideProgress();
}

function renderInsideProgress() {
    // Next reward (inside)
    const nextRewardName = document.getElementById('nextRewardNameInside');
    const nextRewardProgress = document.getElementById('nextRewardProgressInside');
    const nextRewardText = document.getElementById('nextRewardTextInside');

    if (nextRewardName && typeof REWARDS !== 'undefined') {
        const unlockedIds = state.unlockedRewards || [];
        const nextReward = REWARDS.find(r => !unlockedIds.includes(r.id));

        if (nextReward) {
            nextRewardName.textContent = nextReward.name;
            const progress = Math.min((state.stamps / nextReward.stampsRequired) * 100, 100);
            if (nextRewardProgress) nextRewardProgress.style.width = `${progress}%`;
            if (nextRewardText) nextRewardText.textContent = `${state.stamps}/${nextReward.stampsRequired} stamps`;
        } else {
            nextRewardName.textContent = 'All unlocked!';
            if (nextRewardProgress) nextRewardProgress.style.width = '100%';
            if (nextRewardText) nextRewardText.textContent = 'You\'ve collected all rewards!';
        }
    }

    // Top bun friend (inside)
    const topBunFriend = document.getElementById('topBunFriendInside');
    if (topBunFriend) {
        const bestFriend = getBestFriend();
        if (bestFriend) {
            const level = getFriendshipLevelForRabbit(bestFriend.id);
            topBunFriend.innerHTML = `
                <div class="progress-bun-info">
                    <span class="progress-bun-emoji">${level.icon}</span>
                    <span class="progress-bun-name">${bestFriend.name}</span>
                    <span class="progress-bun-level">${level.name}</span>
                </div>
            `;
        }
    }
}

// ============================================
// HOME PAGE
// ============================================
function initHomePage() {
    renderHomePage();

    // Add click handler for best friend card
    const bestFriendCard = document.getElementById('bestFriendCard');
    if (bestFriendCard) {
        bestFriendCard.addEventListener('click', () => {
            const bestFriend = getBestFriend();
            if (bestFriend) {
                openRabbitModal(bestFriend.id);
            }
        });
    }
}

function getBestFriend() {
    let bestFriend = null;
    let bestPoints = 0;
    RABBITS.forEach(rabbit => {
        const points = state.friendships[rabbit.id]?.points || 0;
        if (points > bestPoints) {
            bestPoints = points;
            bestFriend = rabbit;
        }
    });
    return bestFriend;
}

function renderHomePage() {
    const isNewUser = state.drinksOrdered === 0 && state.rabbitVisits === 0;
    const hasActivity = state.drinksOrdered > 0 || state.rabbitVisits > 0 || state.stamps > 0;

    // Show/hide sections based on user state
    const welcomeSection = document.getElementById('homeWelcome');
    const progressSection = document.getElementById('homeProgress');
    const howItWorksSection = document.getElementById('homeHowItWorks');
    const featuredSection = document.getElementById('homeFeatured');
    const trendingSection = document.getElementById('homeTrending');

    if (welcomeSection) {
        welcomeSection.style.display = hasActivity ? 'flex' : 'none';
    }
    if (progressSection) {
        progressSection.style.display = hasActivity ? 'block' : 'none';
    }
    if (howItWorksSection) {
        howItWorksSection.style.display = isNewUser ? 'block' : 'none';
    }

    // Always show featured and trending
    if (featuredSection) {
        renderFeaturedBun();
    }
    if (trendingSection) {
        renderTrending();
    }

    // Render bun rankings
    renderBunRankings();

    // Render personalized sections for returning users
    if (hasActivity) {
        renderWelcome();
        renderProgress();
    }
}

function renderWelcome() {
    const greeting = document.getElementById('welcomeGreeting');
    const message = document.getElementById('welcomeMessage');
    const actions = document.getElementById('welcomeActions');

    if (!greeting || !message || !actions) return;

    // Time-based greeting
    const hour = new Date().getHours();
    let timeGreeting = 'Welcome back';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    // Find best friend for personalization
    const bestFriend = getBestFriend();
    const userName = state.userName || 'friend';

    greeting.textContent = `${timeGreeting}!`;

    // Personalized message based on activity
    const messages = [];
    if (bestFriend && state.friendships[bestFriend.id]?.points >= 50) {
        messages.push(`${bestFriend.name} has been asking about you!`);
    }
    if (state.stamps >= 8 && state.stamps < 10) {
        messages.push(`Just ${10 - state.stamps} more stamps until your next reward!`);
    }
    if (state.rabbitVisits === 0 && state.drinksOrdered > 0) {
        messages.push("You haven't met our buns yet - they're waiting for you!");
    }
    if (!state.checkedInToday) {
        messages.push("Don't forget your daily check-in for a free stamp!");
    }

    message.textContent = messages.length > 0 ? messages[0] : "Ready for another adventure?";

    // Dynamic CTAs
    let actionsHtml = '';
    if (!state.checkedInToday) {
        actionsHtml += `<button class="btn btn-small btn-secondary" onclick="document.getElementById('checkinBtn').click()">Daily Check-in</button>`;
    }
    if (bestFriend) {
        actionsHtml += `<button class="btn btn-small btn-secondary" onclick="openRabbitModal('${bestFriend.id}')">Visit ${bestFriend.name}</button>`;
    }
    actionsHtml += `<button class="btn btn-small btn-primary" data-navigate="cafe">Order Drinks</button>`;

    actions.innerHTML = actionsHtml;

    // Re-attach navigation handlers
    actions.querySelectorAll('[data-navigate]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector(`[data-page="${btn.dataset.navigate}"]`).click();
        });
    });
}

function renderProgress() {
    // Next Reward
    const nextReward = REWARDS.find(r => state.stamps < r.stampsRequired);
    const nextRewardName = document.getElementById('nextRewardName');
    const nextRewardProgress = document.getElementById('nextRewardProgress');
    const nextRewardText = document.getElementById('nextRewardText');

    if (nextRewardName && nextReward) {
        nextRewardName.textContent = nextReward.name;
        const progress = (state.stamps / nextReward.stampsRequired) * 100;
        nextRewardProgress.style.width = `${Math.min(progress, 100)}%`;
        nextRewardText.textContent = `${state.stamps} / ${nextReward.stampsRequired} stamps`;
    } else if (nextRewardName) {
        nextRewardName.textContent = 'All unlocked!';
        nextRewardProgress.style.width = '100%';
        nextRewardText.textContent = 'You have all rewards!';
    }

    // Best Friend Progress
    const bestFriend = getBestFriend();
    const bestFriendInfo = document.getElementById('bestFriendInfo');
    const bestFriendProgress = document.getElementById('bestFriendProgress');
    const bestFriendText = document.getElementById('bestFriendText');

    if (bestFriendInfo && bestFriend) {
        const friendship = state.friendships[bestFriend.id];
        const level = getFriendshipLevelForRabbit(bestFriend.id);
        const nextLevel = FRIENDSHIP_LEVELS.find(l => l.minPoints > friendship.points);

        bestFriendInfo.innerHTML = `
            <span class="progress-bun-emoji">${level.icon}</span>
            <span class="progress-bun-name">${bestFriend.name}</span>
            <span class="progress-bun-level">${level.name}</span>
        `;

        if (nextLevel) {
            const progress = ((friendship.points - level.minPoints) / (nextLevel.minPoints - level.minPoints)) * 100;
            bestFriendProgress.style.width = `${Math.min(progress, 100)}%`;
            bestFriendText.textContent = `${nextLevel.minPoints - friendship.points} pts to ${nextLevel.name}`;
        } else {
            bestFriendProgress.style.width = '100%';
            bestFriendText.textContent = 'Max friendship reached!';
        }
    }

    // Achievements Progress
    const achievementCount = document.getElementById('achievementProgressCount');
    const achievementProgress = document.getElementById('achievementProgress');
    const nextAchievementText = document.getElementById('nextAchievementText');

    if (achievementCount) {
        const unlocked = state.unlockedAchievements.length;
        const total = ACHIEVEMENTS.length;
        achievementCount.textContent = `${unlocked} / ${total}`;
        achievementProgress.style.width = `${(unlocked / total) * 100}%`;

        // Find next closest achievement
        const nextAchievement = ACHIEVEMENTS.find(a =>
            !state.unlockedAchievements.includes(a.id)
        );
        if (nextAchievement) {
            nextAchievementText.textContent = `Next: ${nextAchievement.name}`;
        } else {
            nextAchievementText.textContent = 'All stickers collected!';
        }
    }
}

function renderFeaturedBun() {
    const container = document.getElementById('featuredBunCard');
    if (!container) return;

    // Pick "featured" bun based on day of year for consistency
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const featuredIndex = dayOfYear % RABBITS.length;
    const rabbit = RABBITS[featuredIndex];

    const rarityConfig = getRarityConfig(rabbit.rarity);
    const friendshipLevel = getFriendshipLevelForRabbit(rabbit.id);
    const signatureDrink = getSignatureDrinkForRabbit(rabbit.id);

    container.innerHTML = `
        <div class="featured-bun-inner" onclick="openRabbitModal('${rabbit.id}')">
            <div class="featured-bun-image">
                <img src="${rabbit.image}" alt="${rabbit.name}" class="featured-bun-photo">
                <span class="featured-bun-rarity" style="background: ${rarityConfig.bgColor}; color: ${rarityConfig.color}">
                    ${rarityConfig.label}
                </span>
            </div>
            <div class="featured-bun-info">
                <div class="featured-bun-header">
                    <h4 class="featured-bun-name">${rabbit.name}</h4>
                    <span class="featured-bun-friendship">${friendshipLevel.icon}</span>
                </div>
                <p class="featured-bun-breed">${rabbit.breed}</p>
                <p class="featured-bun-personality">"${rabbit.personality}"</p>
                ${signatureDrink ? `
                    <div class="featured-bun-signature">
                        <span class="signature-label">Signature drink:</span>
                        <span class="signature-name">${signatureDrink.name}</span>
                    </div>
                ` : ''}
                <button class="btn btn-small btn-primary">Book Time with ${rabbit.name}</button>
            </div>
        </div>
    `;
}

function renderTrending() {
    const container = document.getElementById('trendingGrid');
    if (!container) return;

    // Get top 3 from leaderboard
    const rankings = getCommunityLeaderboard('week');
    const topBuns = rankings.slice(0, 3);

    // Get a popular drink (most ordered signature drink)
    const popularDrink = SIGNATURE_DRINKS[Math.floor(Date.now() / 86400000) % SIGNATURE_DRINKS.length];

    container.innerHTML = `
        <div class="trending-item trending-buns">
            <div class="trending-label">Hot Buns This Week</div>
            <div class="trending-buns-list">
                ${topBuns.map((rabbit, index) => `
                    <div class="trending-bun" onclick="openRabbitModal('${rabbit.id}')">
                        <span class="trending-rank">#${index + 1}</span>
                        <img src="${rabbit.image}" alt="${rabbit.name}" class="trending-bun-img">
                        <span class="trending-bun-name">${rabbit.name}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="trending-item trending-drink" onclick="openDrinkModal('${popularDrink.id}')">
            <div class="trending-label">Popular Drink</div>
            <div class="trending-drink-content">
                <div class="trending-drink-cup" style="background: ${popularDrink.gradient}"></div>
                <div class="trending-drink-info">
                    <span class="trending-drink-name">${popularDrink.name}</span>
                    <span class="trending-drink-price">$${popularDrink.price.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;
}

function renderBunRankings() {
    const container = document.getElementById('rankingsList');
    if (!container) return;

    // Get all bun rankings
    const rankings = getCommunityLeaderboard('all');

    container.innerHTML = rankings.map((rabbit, index) => {
        const position = index + 1;
        let positionClass = '';
        if (position === 1) positionClass = 'gold';
        else if (position === 2) positionClass = 'silver';
        else if (position === 3) positionClass = 'bronze';

        const friendship = state.friendships[rabbit.id] || { points: 0 };
        const level = getFriendshipLevelForRabbit(rabbit.id);

        return `
            <div class="ranking-item ${position <= 3 ? 'top-3' : ''}" onclick="navigateTo('cafe'); setTimeout(() => openRabbitModal('${rabbit.id}'), 100);">
                <div class="ranking-position ${positionClass}">#${position}</div>
                <img src="${rabbit.image}" alt="${rabbit.name}" class="ranking-bun-img">
                <div class="ranking-info">
                    <div class="ranking-name">${rabbit.name}</div>
                    <div class="ranking-breed">${rabbit.breed}</div>
                </div>
                <div class="ranking-stats">
                    <div class="ranking-stat">
                        <span class="ranking-stat-icon">💕</span>
                        <span>${level.name}</span>
                    </div>
                    <div class="ranking-stat">
                        <span class="ranking-stat-icon">⭐</span>
                        <span>${rabbit.score || 0} pts</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
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

// Enhanced upsell toast for signature items
function showUpsellToast(itemName, rabbit, type = 'drink') {
    const container = document.getElementById('toastContainer');

    // Remove any existing upsell toasts first
    container.querySelectorAll('.toast-upsell').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'toast toast-upsell';

    const typeIcon = type === 'drink' ? '🧋' : '🍡';
    const friendshipLevel = getFriendshipLevelForRabbit(rabbit.id);

    toast.innerHTML = `
        <div class="upsell-header">
            <span class="toast-icon">${typeIcon}</span>
            <span class="toast-message">Added to cart!</span>
        </div>
        <div class="upsell-content">
            <img src="${rabbit.image}" alt="${rabbit.name}" class="upsell-bun-img">
            <div class="upsell-info">
                <span class="upsell-label">${rabbit.name}'s Signature ${type === 'drink' ? 'Drink' : 'Snack'}!</span>
                <span class="upsell-friendship">${friendshipLevel.icon} ${friendshipLevel.name}</span>
            </div>
        </div>
        <div class="upsell-actions">
            <button class="upsell-btn upsell-btn-primary" onclick="bookFromUpsell('${rabbit.id}')">
                Book Time with ${rabbit.name}
            </button>
            <button class="upsell-btn upsell-btn-dismiss" onclick="dismissUpsell(this)">
                Maybe Later
            </button>
        </div>
    `;

    container.appendChild(toast);

    // Auto-dismiss after 8 seconds if not interacted with
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 300);
        }
    }, 8000);
}

// Book time from upsell toast
function bookFromUpsell(rabbitId) {
    // Remove upsell toast
    document.querySelectorAll('.toast-upsell').forEach(t => {
        t.classList.add('toast-out');
        setTimeout(() => t.remove(), 300);
    });

    // Open schedule modal with this rabbit
    openScheduleModal(rabbitId);
}

// Dismiss upsell toast
function dismissUpsell(btn) {
    const toast = btn.closest('.toast-upsell');
    if (toast) {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }
}

// ============================================
// INITIALIZE APP
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initFriendships();

    // Mark first visit for achievement
    if (!state.hasVisited) {
        state.hasVisited = true;
        saveState();
        // Check for first visit achievement after a brief delay
        setTimeout(() => checkAchievements(), 1000);
    }

    initBobaParticles();
    initNavigation();
    initPassportOnboarding();
    initCafe();
    initMenu();
    initCart();
    initRabbits();
    initScheduling();
    initPassport();
    initShop();
    initDailyCheckin();
    initHomePage();
    updateStats();
    renderPlayAreaBuns();

    // Initialize unified modal system
    Modal.init();

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
window.openDrinkModal = openDrinkModal;
window.openRabbitFromLeaderboard = openRabbitFromLeaderboard;
window.openRabbitFromDashboard = openRabbitFromDashboard;
window.closeAllModals = closeAllModals;
window.openModal = openModal;
window.closeModal = closeModal;
window.Modal = Modal;
window.openProfileModal = openProfileModal;
window.openRankingsModal = openRankingsModal;
window.openFeaturedModal = openFeaturedModal;
window.openTrendingModal = openTrendingModal;
window.openShopModal = openShopModal;
window.confirmShopPurchase = confirmShopPurchase;
window.addSnackToCart = addSnackToCart;
window.addSignatureDrinkFromSchedule = addSignatureDrinkFromSchedule;
window.addSignatureSnackFromSchedule = addSignatureSnackFromSchedule;
