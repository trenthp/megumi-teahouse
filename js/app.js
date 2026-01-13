/* ============================================
   MEGUMI'S USAGI CAFE - MAIN APP
   兎茶店 - Application Logic
   ============================================ */

// ============================================
// STATE MANAGEMENT
// ============================================

// State version for migrations
const STATE_VERSION = 2;

const state = {
    version: STATE_VERSION,
    cart: [],  // Unified cart: drinks, snacks, AND visits
    stamps: 0,
    drinksOrdered: 0,
    snacksOrdered: 0,
    rabbitVisits: 0,
    lastCheckin: null,
    lastCheckinDate: null, // ISO date string for reliable comparison
    checkedInToday: false,
    currentStreak: 0,
    longestStreak: 0,
    unlockedRewards: [],
    currentPage: 'home',
    // Megumi Credits system
    megumiCredits: {
        available: 5,           // Current available credits
        lastRefreshDate: null,  // Date string of last refresh
        bonusCredits: 0         // Friendship bonus credits
    },
    // UI state (persisted tab selections)
    uiState: {
        leaderboardPeriod: 'all',
        historyTab: 'orders',
        achievementCategory: 'all'
    },
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
    // Order history (drinks/snacks only)
    orderHistory: [],
    visitHistory: [],
    // Shop purchases (separate from order history)
    shopRedemptions: [],
    purchasedItems: []
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

// ============================================
// MEGUMI CREDITS SYSTEM
// ============================================

// Calculate bonus credits from friendship levels
function calculateFriendshipBonusCredits() {
    let bonus = 0;
    const bonuses = MEGUMI_CREDITS.friendshipBonuses;

    // Check each rabbit's friendship level
    RABBITS.forEach(rabbit => {
        const level = getFriendshipLevelForRabbit(rabbit.id);
        if (bonuses[level.name]) {
            bonus += bonuses[level.name];
        }
    });

    return Math.min(bonus, MEGUMI_CREDITS.maxCredits - MEGUMI_CREDITS.baseCredits);
}

// Refresh credits at midnight (call on load and periodically)
function refreshMegumiCredits() {
    const today = new Date().toISOString().split('T')[0];

    // Check if we need to refresh (new day)
    if (state.megumiCredits.lastRefreshDate !== today) {
        const bonusCredits = calculateFriendshipBonusCredits();
        const totalCredits = MEGUMI_CREDITS.baseCredits + bonusCredits;

        state.megumiCredits = {
            available: totalCredits,
            lastRefreshDate: today,
            bonusCredits: bonusCredits
        };

        saveState();

        // Notify user if they're returning
        if (state.megumiCredits.lastRefreshDate !== null) {
            showToast(`Daily credits refreshed! ${totalCredits} Megumi Credits available.`, '✨');
        }
    }

    // Always update the display
    updateCreditsDisplay();
}

// Get total credits available today
function getTotalCreditsToday() {
    return MEGUMI_CREDITS.baseCredits + state.megumiCredits.bonusCredits;
}

// Get credits remaining
function getCreditsRemaining() {
    return state.megumiCredits.available;
}

// Calculate credit cost for current cart
function calculateCartCreditCost() {
    let cost = 0;
    state.cart.forEach(item => {
        if (item.type === 'visit') {
            const visitOption = getVisitOption(item.duration);
            cost += visitOption.credits;
        } else if (item.type === 'drink' || !item.type) {
            cost += MEGUMI_CREDITS.costs.drink * (item.quantity || 1);
        } else if (item.type === 'snack') {
            cost += MEGUMI_CREDITS.costs.snack * (item.quantity || 1);
        }
    });
    return cost;
}

// Check if user has enough credits for cart
function hasEnoughCredits() {
    return getCreditsRemaining() >= calculateCartCreditCost();
}

// Spend credits (call after successful checkout)
function spendCredits(amount) {
    state.megumiCredits.available = Math.max(0, state.megumiCredits.available - amount);
    saveState();
    updateCreditsDisplay();
}

// Update the credits display in the header
function updateCreditsDisplay() {
    const creditsCount = document.getElementById('creditsCount');
    const creditsIndicator = document.getElementById('creditsIndicator');

    if (creditsCount && creditsIndicator) {
        const available = getCreditsRemaining();
        creditsCount.textContent = available;

        // Add low-credits class when 2 or fewer credits remaining
        if (available <= 2) {
            creditsIndicator.classList.add('low-credits');
        } else {
            creditsIndicator.classList.remove('low-credits');
        }
    }
}

// Get credit cost for a single item
function getItemCreditCost(item) {
    if (item.type === 'visit') {
        const visitOption = getVisitOption(item.duration);
        return visitOption.credits;
    } else if (item.type === 'snack' || item.isSnack) {
        return MEGUMI_CREDITS.costs.snack;
    }
    return MEGUMI_CREDITS.costs.drink;
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
    try {
        const saved = localStorage.getItem('megumi-usagi-state');
        if (saved) {
            const parsed = JSON.parse(saved);

            // Validate basic structure
            if (!validateStateStructure(parsed)) {
                console.warn('Invalid state structure detected, using defaults');
                return;
            }

            // Migrate old state versions if needed
            const migrated = migrateState(parsed);

            // Merge with current state (preserves new properties)
            Object.assign(state, migrated);

            // Ensure uiState exists (for old saves)
            if (!state.uiState) {
                state.uiState = {
                    leaderboardPeriod: 'all',
                    historyTab: 'orders',
                    achievementCategory: 'all'
                };
            }

            // Check if last checkin was today (use date string for reliability)
            if (state.lastCheckinDate) {
                const today = new Date().toISOString().split('T')[0];
                state.checkedInToday = state.lastCheckinDate === today;
            } else if (state.lastCheckin) {
                // Fallback for old format
                const lastDate = new Date(state.lastCheckin).toDateString();
                const today = new Date().toDateString();
                state.checkedInToday = lastDate === today;
            }

            // Clean up orphaned data
            cleanupOrphanedData();

            // Refresh Megumi Credits (handles midnight reset)
            refreshMegumiCredits();
        }
    } catch (error) {
        console.error('Failed to load state from localStorage:', error);
        // State remains at defaults
    }
}

// Validate that saved state has expected structure
function validateStateStructure(parsed) {
    if (typeof parsed !== 'object' || parsed === null) return false;

    // Check essential properties exist and have correct types
    const checks = [
        typeof parsed.stamps === 'undefined' || typeof parsed.stamps === 'number',
        typeof parsed.cart === 'undefined' || Array.isArray(parsed.cart),
        typeof parsed.friendships === 'undefined' || typeof parsed.friendships === 'object',
        typeof parsed.orderHistory === 'undefined' || Array.isArray(parsed.orderHistory)
    ];

    return checks.every(check => check);
}

// Migrate old state versions to current format
function migrateState(parsed) {
    const version = parsed.version || 0;

    // Version 0 -> 1: Add uiState, streaks, shopRedemptions, separate shop orders
    if (version < 1) {
        parsed.version = 1;
        parsed.uiState = parsed.uiState || {
            leaderboardPeriod: 'all',
            historyTab: 'orders',
            achievementCategory: 'all'
        };
        parsed.currentStreak = parsed.currentStreak || 0;
        parsed.longestStreak = parsed.longestStreak || 0;
        parsed.lastCheckinDate = parsed.lastCheckinDate || null;

        // Migrate shop orders from orderHistory to shopRedemptions
        parsed.shopRedemptions = parsed.shopRedemptions || [];
        if (Array.isArray(parsed.orderHistory)) {
            const shopOrders = parsed.orderHistory.filter(order => order.type === 'shop');
            const drinkOrders = parsed.orderHistory.filter(order => order.type !== 'shop');

            // Move shop orders to shopRedemptions
            shopOrders.forEach(order => {
                parsed.shopRedemptions.push({
                    id: order.id,
                    date: order.date,
                    itemId: order.itemId,
                    itemName: order.itemName,
                    itemIcon: order.itemIcon,
                    stampsCost: order.stampsCost
                });
            });

            // Keep only drink orders in orderHistory
            parsed.orderHistory = drinkOrders;
        }
    }

    // Version 1 -> 2: Add Megumi Credits system
    if (version < 2) {
        parsed.version = 2;
        parsed.megumiCredits = parsed.megumiCredits || {
            available: MEGUMI_CREDITS.baseCredits,
            lastRefreshDate: null,
            bonusCredits: 0
        };

        // Add type to existing cart items (drinks)
        if (Array.isArray(parsed.cart)) {
            parsed.cart = parsed.cart.map(item => ({
                ...item,
                type: item.type || (item.isSnack ? 'snack' : 'drink')
            }));
        }
    }

    // Future migrations go here
    // if (version < 3) { ... }

    return parsed;
}

// Remove data for rabbits that no longer exist
function cleanupOrphanedData() {
    const validRabbitIds = new Set(RABBITS.map(r => r.id));

    // Clean friendships
    Object.keys(state.friendships).forEach(id => {
        if (!validRabbitIds.has(id)) {
            delete state.friendships[id];
        }
    });

    // Clean rabbitSpending
    Object.keys(state.rabbitSpending).forEach(id => {
        if (!validRabbitIds.has(id)) {
            delete state.rabbitSpending[id];
        }
    });

    // Clean uniqueBunsVisited
    state.uniqueBunsVisited = state.uniqueBunsVisited.filter(id => validRabbitIds.has(id));
}

// Save state to localStorage
function saveState() {
    try {
        state.version = STATE_VERSION;
        localStorage.setItem('megumi-usagi-state', JSON.stringify(state));
    } catch (error) {
        console.error('Failed to save state to localStorage:', error);
        // Could be quota exceeded - notify user
        if (error.name === 'QuotaExceededError') {
            showToast('Storage full! Some data may not be saved.', '⚠️');
        }
    }
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
// FOCUS TRAP (Accessibility)
// ============================================
let focusTrapElement = null;
let previouslyFocusedElement = null;

function trapFocus(element) {
    previouslyFocusedElement = document.activeElement;
    focusTrapElement = element;

    const focusableElements = element.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement.focus();

    // Handle tab key
    element.addEventListener('keydown', handleFocusTrap);

    function handleFocusTrap(e) {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    // Store handler for removal
    element._focusTrapHandler = handleFocusTrap;
}

function releaseFocus() {
    if (focusTrapElement && focusTrapElement._focusTrapHandler) {
        focusTrapElement.removeEventListener('keydown', focusTrapElement._focusTrapHandler);
        delete focusTrapElement._focusTrapHandler;
    }

    if (previouslyFocusedElement && previouslyFocusedElement.focus) {
        previouslyFocusedElement.focus();
    }

    focusTrapElement = null;
    previouslyFocusedElement = null;
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
                            <span class="drink-credits">${MEGUMI_CREDITS.costs.drink}✨</span>
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
                            <span class="snack-credits">${MEGUMI_CREDITS.costs.snack}✨</span>
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
            // Show bun time cross-sell for non-signature items
            setTimeout(showBunTimeCrossSell, 1500);
        }
    } else {
        showToast(`Added ${snack.name} to cart!`, snack.icon);
        // Show bun time cross-sell for non-signature items
        if (!suppressUpsell) {
            setTimeout(showBunTimeCrossSell, 1500);
        }
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
                <div class="bun-match-hint">
                    <span>🐰</span>
                    <span>Visit ${matchingRabbit.name} from the Buns page!</span>
                </div>
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
    // Suppress upsell since drink modal already shows bun cross-sell
    addToCart(drinkId, true);
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

    // Initialize inline bun booking widget
    initInlineBunBooking();

    renderCart();
}

// ============================================
// INLINE BUN BOOKING (in cart)
// ============================================
function initInlineBunBooking() {
    const bunBookingWidget = document.getElementById('cartBunBooking');
    const bunBookingToggle = document.getElementById('bunBookingToggle');
    const bunSelect = document.getElementById('cartBunSelect');
    const durationPills = document.querySelectorAll('.duration-pill');
    const addBunBtn = document.getElementById('addBunToCartBtn');
    const openFullScheduleLink = document.getElementById('openFullScheduleLink');

    if (!bunBookingWidget || !bunSelect) return;

    // Populate the bun select dropdown
    populateCartBunSelect();

    // Toggle expand/collapse
    bunBookingToggle.addEventListener('click', () => {
        bunBookingWidget.classList.toggle('expanded');
    });

    // Duration pill selection
    durationPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            e.preventDefault();
            durationPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            updateBunBookingButton();
        });
    });

    // Add bun to cart button
    addBunBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addBunFromInlineWidget();
    });

    // Link to open full schedule modal (for treats & toys)
    openFullScheduleLink.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedRabbitId = bunSelect.value;
        // Close cart sidebar
        document.getElementById('cartSidebar').classList.remove('open');
        // Open full schedule modal with selected rabbit
        openScheduleModal(selectedRabbitId);
        // Collapse the inline widget
        bunBookingWidget.classList.remove('expanded');
    });

    // Update button when rabbit selection changes
    bunSelect.addEventListener('change', updateBunBookingButton);

    // Initial button update
    updateBunBookingButton();
}

function populateCartBunSelect() {
    const bunSelect = document.getElementById('cartBunSelect');
    if (!bunSelect) return;

    bunSelect.innerHTML = RABBITS.map(rabbit => {
        const friendshipLevel = getFriendshipLevelForRabbit(rabbit.id);
        return `<option value="${rabbit.id}">${rabbit.name} ${friendshipLevel.icon}</option>`;
    }).join('');
}

function updateBunBookingButton() {
    const bunSelect = document.getElementById('cartBunSelect');
    const activePill = document.querySelector('.duration-pill.active');
    const creditsDisplay = document.querySelector('.bun-add-credits');

    if (!bunSelect || !activePill || !creditsDisplay) return;

    const credits = activePill.dataset.credits;
    creditsDisplay.textContent = `${credits}✨`;
}

function addBunFromInlineWidget() {
    const bunSelect = document.getElementById('cartBunSelect');
    const activePill = document.querySelector('.duration-pill.active');
    const bunBookingWidget = document.getElementById('cartBunBooking');

    if (!bunSelect || !activePill) return;

    const rabbitId = bunSelect.value;
    const duration = parseInt(activePill.dataset.duration, 10);

    // Check credit availability
    const visitOption = getVisitOption(duration);
    const creditCost = visitOption.credits;
    const currentCartCredits = calculateCartCreditCost();
    const availableCredits = getCreditsRemaining();

    if (currentCartCredits + creditCost > availableCredits) {
        showToast(`Not enough credits! Need ${creditCost} more.`, '⏰');
        return;
    }

    // Add visit to cart (without treats/toys - quick add)
    addVisitToCart(rabbitId, duration, [], []);

    // Collapse the widget and hide it (since visit is now in cart)
    bunBookingWidget.classList.remove('expanded');
    updateBunBookingVisibility();

    // Reset to default duration
    document.querySelectorAll('.duration-pill').forEach(p => p.classList.remove('active'));
    document.querySelector('.duration-pill[data-duration="30"]').classList.add('active');
    updateBunBookingButton();
}

function updateBunBookingVisibility() {
    const bunBookingWidget = document.getElementById('cartBunBooking');
    if (!bunBookingWidget) return;

    // Hide if there's already a visit in cart
    const hasVisit = state.cart.some(item => item.type === 'visit');
    bunBookingWidget.classList.toggle('has-visit', hasVisit);
}

function updateTimeLabel(hasVisit, hasFood) {
    const pickupLabel = document.getElementById('pickupLabel');
    if (!pickupLabel) return;

    // Determine appropriate label based on cart contents
    if (hasVisit && hasFood) {
        pickupLabel.textContent = 'Visit Time';
    } else if (hasVisit) {
        pickupLabel.textContent = 'Visit Time';
    } else if (hasFood) {
        pickupLabel.textContent = 'Pickup Time';
    } else {
        pickupLabel.textContent = 'Visit Time';
    }
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
            // Show bun time cross-sell for non-signature items
            setTimeout(showBunTimeCrossSell, 1500);
        }
    } else {
        showToast(`Added ${drink.name} to cart!`, '🧋');
        // Show bun time cross-sell for non-signature items
        if (!suppressUpsell) {
            setTimeout(showBunTimeCrossSell, 1500);
        }
    }

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

    // Separate items by type
    const drinks = state.cart.filter(item => item.type === 'drink' || (!item.type && !item.isSnack));
    const snacks = state.cart.filter(item => item.type === 'snack' || item.isSnack);
    const visits = state.cart.filter(item => item.type === 'visit');

    // Calculate totals
    const totalItems = drinks.reduce((sum, item) => sum + (item.quantity || 1), 0)
        + snacks.reduce((sum, item) => sum + (item.quantity || 1), 0)
        + visits.length;

    const totalPrice = state.cart.reduce((sum, item) => {
        if (item.type === 'visit') return sum + item.price;
        return sum + (item.price * (item.quantity || 1));
    }, 0);

    const drinksCount = drinks.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const snacksCount = snacks.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const visitsCount = visits.length;

    // Calculate credit costs
    const creditCost = calculateCartCreditCost();
    const creditsAvailable = getCreditsRemaining();
    const hasCredits = creditsAvailable >= creditCost;

    cartCount.textContent = totalItems;
    checkoutTotal.textContent = `$${totalPrice.toFixed(2)}`;

    // Update stamps preview with credit info
    const stampsEarned = drinksCount + (visitsCount * 2);
    stampsPreview.innerHTML = `
        <div class="stamps-row">+${stampsEarned} stamp${stampsEarned !== 1 ? 's' : ''}</div>
        <div class="credits-row ${hasCredits ? '' : 'insufficient'}">
            <span class="credits-icon">✨</span>
            <span>${creditCost}/${creditsAvailable} credits</span>
        </div>
    `;

    // Render order summary with credits
    if (totalItems > 0) {
        cartSummary.innerHTML = `
            <div class="cart-credits-banner ${hasCredits ? 'has-credits' : 'no-credits'}">
                <div class="credits-display">
                    <span class="credits-label">Megumi Credits</span>
                    <span class="credits-value">${creditsAvailable} available</span>
                </div>
                <div class="credits-cost">
                    <span>This order:</span>
                    <span class="credits-amount ${hasCredits ? '' : 'over-budget'}">${creditCost} credits</span>
                </div>
                ${!hasCredits ? `
                    <div class="credits-warning">
                        <span>⏰</span>
                        <span>Not enough credits! Remove items or come back tomorrow.</span>
                    </div>
                ` : ''}
            </div>
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
            ${visitsCount > 0 ? `
                <div class="summary-row summary-visits">
                    <span>🐰 ${visitsCount} bun visit${visitsCount !== 1 ? 's' : ''}</span>
                    <span class="summary-stamps">+${visitsCount * 2} stamps</span>
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
                <div class="cart-empty-actions">
                    <button class="btn btn-secondary btn-small" onclick="navigateToMenu()">Browse Menu</button>
                    <button class="btn btn-secondary btn-small" onclick="navigateToRabbits()">Meet Buns</button>
                </div>
                <div class="cart-credits-info">
                    <span class="credits-icon">✨</span>
                    <span>${creditsAvailable} Megumi Credits available today</span>
                </div>
            </div>
        `;
        return;
    }

    // Render cart items grouped by type
    let itemsHtml = '';

    // Drinks section
    if (drinks.length > 0) {
        itemsHtml += `<div class="cart-section-label">Drinks</div>`;
        itemsHtml += drinks.map((item, index) => renderDrinkCartItem(item, index)).join('');
    }

    // Snacks section
    if (snacks.length > 0) {
        itemsHtml += `<div class="cart-section-label">Snacks</div>`;
        itemsHtml += snacks.map((item, index) => renderSnackCartItem(item, index + drinks.length)).join('');
    }

    // Visits section
    if (visits.length > 0) {
        itemsHtml += `<div class="cart-section-label">Bun Visits</div>`;
        itemsHtml += visits.map((item, index) => renderVisitCartItem(item, index + drinks.length + snacks.length)).join('');
    }

    cartItems.innerHTML = itemsHtml;

    // Update bun booking widget visibility
    updateBunBookingVisibility();

    // Update pickup/visit time label based on cart contents
    updateTimeLabel(visits.length > 0, drinks.length > 0 || snacks.length > 0);
}

// Render a drink item in the cart
function renderDrinkCartItem(item, index) {
    const isSignature = item.rabbitId ? true : false;
    const signatureBadge = isSignature ? `<span class="cart-item-badge signature">Signature</span>` : '';
    const creditCost = MEGUMI_CREDITS.costs.drink * (item.quantity || 1);

    return `
        <div class="cart-item" style="animation-delay: ${index * 0.05}s">
            <div class="cart-item-visual" style="background: ${item.gradient || 'var(--gradient-sakura)'}"></div>
            <div class="cart-item-info">
                <div class="cart-item-header">
                    <span class="cart-item-name">${item.name}</span>
                    ${signatureBadge}
                </div>
                <div class="cart-item-meta">
                    <span class="cart-item-price">$${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                    <span class="cart-item-credits">${creditCost}✨</span>
                </div>
            </div>
            <div class="cart-item-actions">
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)">-</button>
                    <span class="qty-value">${item.quantity || 1}</span>
                    <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Remove ${item.name}">×</button>
            </div>
        </div>
    `;
}

// Render a snack item in the cart
function renderSnackCartItem(item, index) {
    const creditCost = MEGUMI_CREDITS.costs.snack * (item.quantity || 1);

    return `
        <div class="cart-item" style="animation-delay: ${index * 0.05}s">
            <div class="cart-item-visual cart-item-snack">${item.icon || '🍡'}</div>
            <div class="cart-item-info">
                <div class="cart-item-header">
                    <span class="cart-item-name">${item.name}</span>
                </div>
                <div class="cart-item-meta">
                    <span class="cart-item-price">$${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                    <span class="cart-item-credits">${creditCost}✨</span>
                </div>
            </div>
            <div class="cart-item-actions">
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)">-</button>
                    <span class="qty-value">${item.quantity || 1}</span>
                    <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Remove ${item.name}">×</button>
            </div>
        </div>
    `;
}

// Render a visit item in the cart
function renderVisitCartItem(item, index) {
    const rabbit = RABBITS.find(r => r.id === item.rabbitId);
    const visitOption = getVisitOption(item.duration);

    return `
        <div class="cart-item cart-item-visit" style="animation-delay: ${index * 0.05}s">
            <div class="cart-item-visual cart-item-bun">
                ${rabbit?.image ? `<img src="${rabbit.image}" alt="${rabbit?.name || 'Bun'}">` : '🐰'}
            </div>
            <div class="cart-item-info">
                <div class="cart-item-header">
                    <span class="cart-item-name">Visit with ${rabbit?.name || 'Bun'}</span>
                    <span class="cart-item-badge visit">${visitOption.label}</span>
                </div>
                <div class="cart-item-meta">
                    <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                    <span class="cart-item-credits">${visitOption.credits}✨</span>
                </div>
                ${item.treats?.length > 0 || item.toys?.length > 0 ? `
                    <div class="cart-item-extras">
                        ${item.treats?.map(t => `<span class="extra-tag treat">${t.icon || '🥕'}</span>`).join('') || ''}
                        ${item.toys?.map(t => `<span class="extra-tag toy">${t.icon || '🎾'}</span>`).join('') || ''}
                    </div>
                ` : ''}
            </div>
            <div class="cart-item-actions">
                <button class="cart-item-remove" onclick="removeVisitFromCart('${item.id}')" aria-label="Remove visit">×</button>
            </div>
        </div>
    `;
}

// Remove a visit from cart
function removeVisitFromCart(visitId) {
    const visit = state.cart.find(i => i.id === visitId && i.type === 'visit');
    if (visit) {
        const rabbit = RABBITS.find(r => r.id === visit.rabbitId);
        state.cart = state.cart.filter(i => i.id !== visitId);
        saveState();
        renderCart();
        showToast(`Removed visit with ${rabbit?.name || 'Bun'}`, '🗑️');
    }
}

// Add a visit to cart
function addVisitToCart(rabbitId, duration, treats = [], toys = []) {
    const rabbit = RABBITS.find(r => r.id === rabbitId);
    const visitOption = getVisitOption(duration);

    if (!rabbit || !visitOption) return;

    // Calculate total price including treats and toys
    const treatsTotal = treats.reduce((sum, t) => sum + (t.price || 0), 0);
    const toysTotal = toys.reduce((sum, t) => sum + (t.price || 0), 0);
    const totalPrice = visitOption.price + treatsTotal + toysTotal;

    const visitItem = {
        id: `visit-${Date.now()}`,
        type: 'visit',
        rabbitId: rabbitId,
        duration: duration,
        price: totalPrice,
        treats: treats,
        toys: toys,
        friendshipPoints: visitOption.friendshipPoints
    };

    state.cart.push(visitItem);
    saveState();
    renderCart();
    showToast(`Added visit with ${rabbit.name} to cart!`, '🐰');
}

// Remove item completely from cart
function removeFromCart(itemId) {
    const item = state.cart.find(i => i.id === itemId);
    if (item) {
        state.cart = state.cart.filter(i => i.id !== itemId);
        saveState();
        renderCart();
        const itemName = item.name || (item.type === 'visit' ? `visit with ${RABBITS.find(r => r.id === item.rabbitId)?.name || 'Bun'}` : 'item');
        showToast(`Removed ${itemName}`, '🗑️');
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

// Navigate to rabbits page from empty cart
function navigateToRabbits() {
    document.getElementById('cartSidebar').classList.remove('open');
    unlockScroll();
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    navLinks.forEach(link => link.classList.toggle('active', link.dataset.page === 'rabbits'));
    pages.forEach(page => page.classList.toggle('active', page.id === 'page-rabbits'));
    state.currentPage = 'rabbits';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleCheckout() {
    if (state.cart.length === 0) {
        showToast('Your cart is empty!', '😅');
        return;
    }

    // Check for sufficient credits
    if (!hasEnoughCredits()) {
        const needed = calculateCartCreditCost();
        const available = getCreditsRemaining();
        showToast(`Not enough credits! Need ${needed}, have ${available}. Remove items or come back tomorrow.`, '⏰');
        return;
    }

    const pickupTime = document.getElementById('pickupTime').value;
    if (!pickupTime) {
        showToast('Please select a visit time!', '📅');
        return;
    }

    // Separate items by type
    const drinks = state.cart.filter(item => item.type === 'drink' || (!item.type && !item.isSnack));
    const snacks = state.cart.filter(item => item.type === 'snack' || item.isSnack);
    const visits = state.cart.filter(item => item.type === 'visit');

    // Calculate counts
    const drinksCount = drinks.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const snacksCount = snacks.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const visitsCount = visits.length;

    // Calculate total cost for spending tracking
    const cartTotal = state.cart.reduce((sum, item) => {
        if (item.type === 'visit') return sum + item.price;
        return sum + (item.price * (item.quantity || 1));
    }, 0);

    // Calculate stamps (1 per drink, 2 per visit)
    const stampsEarned = drinksCount + (visitsCount * 2);

    // Spend credits
    const creditCost = calculateCartCreditCost();
    spendCredits(creditCost);

    // Update state
    state.stamps += stampsEarned;
    state.totalStampsEarned += stampsEarned;
    state.drinksOrdered += drinksCount;
    state.snacksOrdered += snacksCount;
    state.rabbitVisits += visitsCount;
    state.totalSpent += cartTotal;

    // Track signature drinks tried for achievements
    drinks.forEach(item => {
        if (item.isSignature && !state.signatureDrinksTried.includes(item.id)) {
            state.signatureDrinksTried.push(item.id);
        }
    });

    // Process visits - add friendship points and track unique buns
    visits.forEach(visit => {
        const rabbitId = visit.rabbitId;
        addFriendshipPoints(rabbitId, visit.friendshipPoints || 10, 'visit');

        // Track unique buns visited
        if (!state.uniqueBunsVisited.includes(rabbitId)) {
            state.uniqueBunsVisited.push(rabbitId);
        }

        // Track spending for leaderboard
        addRabbitSpending(rabbitId, visit.price);

        // Track treats and toys given (add friendship points from treats/toys too)
        if (visit.treats?.length > 0) {
            state.treatsGivenTotal += visit.treats.length;
            visit.treats.forEach(treat => {
                if (state.friendships[rabbitId]) {
                    state.friendships[rabbitId].treatsGiven++;
                }
                // Add treat friendship points
                if (treat.friendshipPoints) {
                    addFriendshipPoints(rabbitId, treat.friendshipPoints, 'treat');
                }
            });
        }
        if (visit.toys?.length > 0) {
            state.toysPlayedTotal += visit.toys.length;
            visit.toys.forEach(toy => {
                if (state.friendships[rabbitId]) {
                    state.friendships[rabbitId].toysGiven++;
                }
                // Add toy friendship points
                if (toy.friendshipPoints) {
                    addFriendshipPoints(rabbitId, toy.friendshipPoints, 'toy');
                }
            });
        }

        // Add to visit history
        const rabbit = RABBITS.find(r => r.id === rabbitId);
        const visitRecord = {
            id: visit.id,
            date: new Date().toISOString(),
            rabbitId: rabbitId,
            rabbitName: rabbit?.name || 'Bun',
            duration: visit.duration,
            price: visit.price,
            treats: visit.treats || [],
            toys: visit.toys || [],
            friendshipPointsEarned: visit.friendshipPoints || 10
        };
        state.visitHistory.unshift(visitRecord);
    });

    // Keep only last 50 visits
    if (state.visitHistory.length > 50) {
        state.visitHistory = state.visitHistory.slice(0, 50);
    }

    // Save drink/snack order to order history (separate from visits)
    if (drinks.length > 0 || snacks.length > 0) {
        const order = {
            id: Date.now(),
            date: new Date().toISOString(),
            items: [...drinks, ...snacks].map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1,
                isSnack: item.isSnack || item.type === 'snack',
                isSignature: item.isSignature || false
            })),
            total: [...drinks, ...snacks].reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
            stampsEarned: drinksCount,
            pickupTime: pickupTime
        };
        state.orderHistory.unshift(order);

        // Keep only last 50 orders
        if (state.orderHistory.length > 50) {
            state.orderHistory = state.orderHistory.slice(0, 50);
        }
    }

    // Show success overlay with unified summary
    const cartSuccess = document.getElementById('cartSuccess');
    const successTitle = document.getElementById('successTitle');
    const successSummary = document.getElementById('successSummary');
    const successStamps = document.getElementById('successStamps');

    // Set appropriate title based on order contents
    if (visitsCount > 0 && (drinksCount > 0 || snacksCount > 0)) {
        successTitle.textContent = 'Cafe Visit Booked!';
    } else if (visitsCount > 0) {
        successTitle.textContent = 'Bun Time Booked!';
    } else {
        successTitle.textContent = 'Order Confirmed!';
    }

    // Build summary items
    let summaryHtml = '';
    if (drinksCount > 0) {
        summaryHtml += `<div class="success-item"><span class="success-item-icon">🧋</span><span>${drinksCount} drink${drinksCount !== 1 ? 's' : ''}</span></div>`;
    }
    if (snacksCount > 0) {
        summaryHtml += `<div class="success-item"><span class="success-item-icon">🍡</span><span>${snacksCount} snack${snacksCount !== 1 ? 's' : ''}</span></div>`;
    }
    if (visitsCount > 0) {
        const bunNames = visits.map(v => RABBITS.find(r => r.id === v.rabbitId)?.name || 'Bun');
        bunNames.forEach(name => {
            summaryHtml += `<div class="success-item success-item-bun"><span class="success-item-icon">🐰</span><span>Time with ${name}</span></div>`;
        });
    }
    successSummary.innerHTML = summaryHtml;

    // Show stamps earned
    if (stampsEarned > 0) {
        successStamps.innerHTML = `<span class="stamp-earned">+${stampsEarned}</span> stamp${stampsEarned !== 1 ? 's' : ''} earned!`;
    } else {
        successStamps.textContent = 'Thanks for your order!';
    }

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
        renderPassport();
        renderLeaderboard();

        // Refresh credits display
        refreshMegumiCredits();

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
    releaseFocus();
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
    const duration = parseInt(document.getElementById('scheduleDuration').value, 10);

    if (!visitTime) {
        showToast('Please select a date and time!', '📅');
        return;
    }

    const rabbit = RABBITS.find(r => r.id === rabbitId);
    const visitOption = getVisitOption(duration);

    // Check credit availability
    const creditCost = visitOption.credits;
    const currentCartCredits = calculateCartCreditCost();
    const availableCredits = getCreditsRemaining();

    if (currentCartCredits + creditCost > availableCredits) {
        showToast(`Not enough credits for this visit! Need ${creditCost} more.`, '⏰');
        return;
    }

    // Get selected treats and toys
    const selectedTreats = Array.from(document.querySelectorAll('.treat-checkbox:checked'))
        .map(cb => BUN_TREATS.find(t => t.id === cb.value))
        .filter(Boolean);
    const selectedToys = Array.from(document.querySelectorAll('.toy-checkbox:checked'))
        .map(cb => BUN_TOYS.find(t => t.id === cb.value))
        .filter(Boolean);

    // Add visit to cart (checkout handles all tracking)
    addVisitToCart(rabbitId, duration, selectedTreats, selectedToys);

    // Sync the visit time to the cart's unified time field
    const cartPickupTime = document.getElementById('pickupTime');
    if (cartPickupTime && visitTime) {
        cartPickupTime.value = visitTime;
    }

    // Clear checkboxes
    document.querySelectorAll('.treat-checkbox, .toy-checkbox').forEach(cb => cb.checked = false);

    // Close modal
    document.getElementById('scheduleModal').classList.remove('open');
    unlockScroll();

    // Open cart to show the added visit
    document.getElementById('cartSidebar').classList.add('open');
    lockScroll();
}

// ============================================
// PASSPORT / STAMPS
// ============================================
function initPassport() {
    renderPassport();
    renderDashboard();
    initProfile();
    initHistory();
}

// ============================================
// USER PROFILE
// ============================================
function initProfile() {
    const editBtn = document.getElementById('profileEditBtn');
    const modal = document.getElementById('profileModal');
    const closeBtn = document.getElementById('profileModalClose');
    const saveBtn = document.getElementById('profileSaveBtn');
    const nameInput = document.getElementById('profileNameInput');
    const avatarPicker = document.getElementById('avatarPicker');

    if (!editBtn || !modal) return;

    // Open profile modal
    editBtn.addEventListener('click', () => {
        nameInput.value = state.userName || '';
        updateAvatarSelection(state.userAvatar || '🐰');
        modal.classList.add('open');
        lockScroll();
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('open');
        unlockScroll();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('open');
            unlockScroll();
        }
    });

    // Avatar selection
    avatarPicker.addEventListener('click', (e) => {
        const option = e.target.closest('.avatar-option');
        if (option) {
            updateAvatarSelection(option.dataset.avatar);
        }
    });

    // Save profile
    saveBtn.addEventListener('click', () => {
        const selectedAvatar = avatarPicker.querySelector('.avatar-option.selected');
        state.userName = nameInput.value.trim() || '';
        state.userAvatar = selectedAvatar ? selectedAvatar.dataset.avatar : '🐰';

        // Set member since date if first time setting name
        if (state.userName && !state.memberSince) {
            state.memberSince = new Date().toISOString();
        }

        saveState();
        renderProfile();
        modal.classList.remove('open');
        unlockScroll();
        showToast('Profile updated!', state.userAvatar);
    });

    renderProfile();
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

function initHistory() {
    const tabs = document.querySelectorAll('.history-tab');

    // Set initial active tab from state
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.history === state.uiState.historyTab);
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.uiState.historyTab = tab.dataset.history;
            saveState();
            renderHistory();
        });
    });

    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('historyContent');
    if (!container) return;

    if (state.uiState.historyTab === 'orders') {
        renderOrderHistory(container);
    } else {
        renderVisitHistory(container);
    }
}

function renderOrderHistory(container) {
    // Combine orders and shop redemptions for display, sorted by date
    const allActivity = [
        ...state.orderHistory.map(o => ({ ...o, activityType: 'order' })),
        ...state.shopRedemptions.map(r => ({ ...r, activityType: 'shop' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (allActivity.length === 0) {
        container.innerHTML = `
            <div class="history-empty">
                <span class="history-empty-icon">🧋</span>
                <p>No orders yet!</p>
                <button class="btn btn-small btn-primary" data-navigate="menu">Order Your First Drink</button>
            </div>
        `;
        attachNavigationHandler(container);
        return;
    }

    container.innerHTML = allActivity.slice(0, 10).map(activity => {
        const date = new Date(activity.date);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        // Handle shop redemptions
        if (activity.activityType === 'shop') {
            return `
                <div class="history-item history-shop">
                    <div class="history-icon">${activity.itemIcon}</div>
                    <div class="history-info">
                        <div class="history-title">Shop Redemption</div>
                        <div class="history-details">${activity.itemName}</div>
                        <div class="history-meta">
                            <span class="history-date">${dateStr} at ${timeStr}</span>
                            <span class="history-stamps spent">-${activity.stampsCost} stamps</span>
                        </div>
                    </div>
                    <div class="history-price redeemed">🎁</div>
                </div>
            `;
        }

        // Regular drink/snack order
        const itemCount = activity.items.reduce((sum, item) => sum + item.quantity, 0);
        const itemNames = activity.items.map(i => i.quantity > 1 ? `${i.name} x${i.quantity}` : i.name).join(', ');

        return `
            <div class="history-item">
                <div class="history-icon">🧋</div>
                <div class="history-info">
                    <div class="history-title">${itemCount} item${itemCount !== 1 ? 's' : ''}</div>
                    <div class="history-details">${itemNames}</div>
                    <div class="history-meta">
                        <span class="history-date">${dateStr} at ${timeStr}</span>
                        ${activity.stampsEarned > 0 ? `<span class="history-stamps">+${activity.stampsEarned} stamps</span>` : ''}
                    </div>
                </div>
                <div class="history-price">$${activity.total.toFixed(2)}</div>
            </div>
        `;
    }).join('');

    if (allActivity.length > 10) {
        container.innerHTML += `<p class="history-more">Showing last 10 of ${allActivity.length} activities</p>`;
    }
}

function renderVisitHistory(container) {
    if (state.visitHistory.length === 0) {
        container.innerHTML = `
            <div class="history-empty">
                <span class="history-empty-icon">🐰</span>
                <p>No visits yet!</p>
                <button class="btn btn-small btn-primary" data-navigate="rabbits">Meet the Buns</button>
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

function initAchievements() {
    const tabButtons = document.querySelectorAll('.achievement-tab');

    // Set initial active tab from state
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === state.uiState.achievementCategory);
    });

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.uiState.achievementCategory = btn.dataset.category;
            saveState();
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
    if (state.uiState.achievementCategory !== 'all') {
        filteredAchievements = ACHIEVEMENTS.filter(a => a.category === state.uiState.achievementCategory);
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

    shopModalClose.addEventListener('click', closeShopModal);
    shopCancelBtn.addEventListener('click', closeShopModal);
    shopConfirmBtn.addEventListener('click', confirmShopPurchase);

    // Close on overlay click
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

    // Update modal content
    document.getElementById('shopModalIcon').textContent = item.icon;
    document.getElementById('shopModalName').textContent = item.name;
    document.getElementById('shopModalDesc').textContent = item.description;
    document.getElementById('shopModalStamps').textContent = item.stampsRequired;
    document.getElementById('shopModalBalance').textContent = state.stamps;

    const confirmBtn = document.getElementById('shopConfirmBtn');
    const noteEl = document.getElementById('shopModalNote');

    if (owned) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Already Owned';
        noteEl.textContent = 'You already have this item in your collection!';
        noteEl.className = 'shop-modal-note owned';
    } else if (canAfford) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Redeem';
        noteEl.textContent = 'This will deduct stamps from your balance.';
        noteEl.className = 'shop-modal-note';
    } else {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Not Enough Stamps';
        const needed = item.stampsRequired - state.stamps;
        noteEl.textContent = `You need ${needed} more stamp${needed > 1 ? 's' : ''} to redeem this item.`;
        noteEl.className = 'shop-modal-note locked';
    }

    document.getElementById('shopModal').classList.add('active');
}

function closeShopModal() {
    document.getElementById('shopModal').classList.remove('active');
    currentShopItem = null;
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

    // Add to shop redemptions (separate from order history)
    const redemption = {
        id: Date.now(),
        date: new Date().toISOString(),
        itemId: item.id,
        itemName: item.name,
        itemIcon: item.icon,
        stampsCost: item.stampsRequired
    };
    state.shopRedemptions.unshift(redemption);

    // Keep redemptions manageable
    if (state.shopRedemptions.length > 50) {
        state.shopRedemptions = state.shopRedemptions.slice(0, 50);
    }

    saveState();

    // Close modal and show success
    closeShopModal();
    showToast(`${item.name} redeemed!`, item.icon);

    // Check achievements
    checkAchievements();

    // Re-render shop to update owned status
    renderShop();

    // Update stamp display in passport
    renderPassport();
}

// ============================================
// LEADERBOARD (Host Club Style Rankings)
// Community-wide rankings based on total support
// ============================================

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

    // Set initial active button from state
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.period === state.uiState.leaderboardPeriod);
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.uiState.leaderboardPeriod = btn.dataset.period;
            saveState();
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
    const rankings = getCommunityLeaderboard(state.uiState.leaderboardPeriod);
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

    const rankings = getCommunityLeaderboard(state.uiState.leaderboardPeriod);

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
        const movement = getRankMovement(rabbit.id, rank, state.uiState.leaderboardPeriod);
        const movementHtml = getMovementIndicator(movement.change);

        // Check if this is user's top bun
        const isUserTop = rabbit.id === userTopBunId;
        const userTopClass = isUserTop ? 'user-top-bun' : '';
        const userTopBadge = isUserTop ? '<span class="user-top-badge">Your #1</span>' : '';

        // Period label
        const periodLabel = state.uiState.leaderboardPeriod === 'week' ? 'This Week' :
                           state.uiState.leaderboardPeriod === 'month' ? 'This Month' : 'Total';

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
            const movement = getRankMovement(rabbitId, rank, state.uiState.leaderboardPeriod);
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

// Calculate streak bonus stamps
function getStreakBonus(streak) {
    if (streak >= 30) return 5;
    if (streak >= 14) return 3;
    if (streak >= 7) return 2;
    return 1;
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

    // Calculate potential streak bonus
    const potentialStreak = state.currentStreak + 1;
    const bonus = getStreakBonus(potentialStreak);
    const streakDisplay = state.currentStreak > 0 ? ` 🔥${state.currentStreak}` : '';

    if (state.checkedInToday) {
        checkinBtn.textContent = `See you tomorrow!${streakDisplay}`;
        checkinBtn.disabled = true;
        checkinBtn.style.opacity = '0.5';
    } else {
        const bonusText = bonus > 1 ? `+${bonus} stamps` : '+1 stamp';
        checkinBtn.textContent = `Say Hi! (${bonusText})${streakDisplay}`;
        checkinBtn.disabled = false;
        checkinBtn.style.opacity = '1';
    }
}

function handleCheckin() {
    if (state.checkedInToday) return;

    const today = new Date().toISOString().split('T')[0];

    // Check if this continues a streak (yesterday was last check-in)
    if (state.lastCheckinDate) {
        const lastDate = new Date(state.lastCheckinDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (state.lastCheckinDate === yesterdayStr) {
            // Continue streak
            state.currentStreak++;
        } else {
            // Streak broken, start fresh
            state.currentStreak = 1;
        }
    } else {
        // First check-in ever
        state.currentStreak = 1;
    }

    // Update longest streak
    if (state.currentStreak > state.longestStreak) {
        state.longestStreak = state.currentStreak;
    }

    // Award stamps based on streak
    const bonus = getStreakBonus(state.currentStreak);
    state.stamps += bonus;
    state.checkedInToday = true;
    state.lastCheckin = new Date().toISOString();
    state.lastCheckinDate = today;

    checkRewardUnlocks();
    saveState();
    updateStats();
    renderPassport();
    renderCheckin();

    // Show streak-aware toast
    let toastMessage = `Daily check-in complete! +${bonus} stamp${bonus > 1 ? 's' : ''}!`;
    if (state.currentStreak >= 7) {
        toastMessage += ` 🔥${state.currentStreak} day streak!`;
    }
    showToast(toastMessage, '🐰');
}

// ============================================
// STATS
// ============================================
function updateStats() {
    document.getElementById('statDrinks').textContent = state.drinksOrdered;
    document.getElementById('statVisits').textContent = state.rabbitVisits;
    document.getElementById('statStamps').textContent = state.stamps;

    // Also update home page sections
    renderHomePage();
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
    actionsHtml += `<button class="btn btn-small btn-primary" data-navigate="menu">Order Drinks</button>`;

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

// Show bun time cross-sell for non-signature items when no visit in cart
function showBunTimeCrossSell() {
    // Don't show if already have a visit in cart
    if (state.cart.some(item => item.type === 'visit')) return;

    // Don't show if recently dismissed (use session storage to remember)
    const dismissedUntil = sessionStorage.getItem('bunTimeCrossSellDismissed');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil)) return;

    // Only show after 2+ items in cart
    const itemCount = state.cart.reduce((sum, item) => {
        if (item.type === 'visit') return sum;
        return sum + (item.quantity || 1);
    }, 0);
    if (itemCount < 2) return;

    const container = document.getElementById('toastContainer');

    // Remove any existing cross-sell toasts
    container.querySelectorAll('.toast-crosssell').forEach(t => t.remove());

    // Pick a random rabbit for the suggestion
    const randomRabbit = RABBITS[Math.floor(Math.random() * RABBITS.length)];
    const friendshipLevel = getFriendshipLevelForRabbit(randomRabbit.id);

    const toast = document.createElement('div');
    toast.className = 'toast toast-crosssell';

    toast.innerHTML = `
        <div class="crosssell-content">
            <img src="${randomRabbit.image}" alt="${randomRabbit.name}" class="crosssell-bun-img">
            <div class="crosssell-info">
                <span class="crosssell-label">Complete your visit?</span>
                <span class="crosssell-desc">Spend time with a bun while you enjoy your order!</span>
            </div>
        </div>
        <div class="crosssell-actions">
            <button class="crosssell-btn crosssell-btn-primary" onclick="expandBunBookingFromToast()">
                🐰 Add Bun Time
            </button>
            <button class="crosssell-btn crosssell-btn-dismiss" onclick="dismissCrossSell(this)">
                Not Now
            </button>
        </div>
    `;

    container.appendChild(toast);

    // Auto-dismiss after 6 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 300);
        }
    }, 6000);
}

// Open inline bun booking widget from cross-sell toast
function expandBunBookingFromToast() {
    // Dismiss the toast
    document.querySelectorAll('.toast-crosssell').forEach(t => {
        t.classList.add('toast-out');
        setTimeout(() => t.remove(), 300);
    });

    // Open cart if not open
    const cartSidebar = document.getElementById('cartSidebar');
    if (!cartSidebar.classList.contains('open')) {
        cartSidebar.classList.add('open');
        lockScroll();
    }

    // Expand the bun booking widget
    const bunBookingWidget = document.getElementById('cartBunBooking');
    if (bunBookingWidget) {
        bunBookingWidget.classList.add('expanded');
        // Scroll the cart to show the booking widget
        bunBookingWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Dismiss cross-sell toast (remember for session)
function dismissCrossSell(btn) {
    const toast = btn.closest('.toast-crosssell');
    if (toast) {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }
    // Don't show again for 5 minutes
    sessionStorage.setItem('bunTimeCrossSellDismissed', Date.now() + (5 * 60 * 1000));
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
    initMenu();
    initCart();
    initRabbits();
    initScheduling();
    initPassport();
    initAchievements();
    initShop();
    initLeaderboard();
    initDailyCheckin();
    initHomePage();
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
window.removeVisitFromCart = removeVisitFromCart;
window.addVisitToCart = addVisitToCart;
window.navigateToMenu = navigateToMenu;
window.navigateToRabbits = navigateToRabbits;
