# CLAUDE.md - Megumi's Usagi Cafe

## Project Overview

Megumi's Usagi Cafe (兎茶店) is a bubble tea and bunny-themed single-page web application. Users can browse menus, collect stamps, build friendships with rabbit characters, unlock achievements, and track their order history.

**Tech Stack:** Vanilla JavaScript, HTML5, CSS3 (no frameworks)

## Commands

- `npm start` or `npm run dev` - Start development server on port 3000

## Project Structure

```
megumi-teahouse/
├── index.html          # Single-page app (all page sections)
├── css/styles.css      # Complete design system (6500+ lines)
├── js/
│   ├── app.js          # Main application logic, state management
│   └── data.js         # Game data: rabbits, drinks, achievements, etc.
└── images/             # Assets (buns/, logos, backgrounds)
```

## Architecture

**SPA Pattern:** All pages exist in `index.html` with visibility controlled via `data-page` attributes. Navigation uses `initNavigation()` to toggle active pages.

**State Management:** Centralized `state` object in `app.js` persisted to localStorage via `saveState()`/`loadState()`.

**Key State Properties:**
- `cart`, `stamps`, `friendships`, `unlockedAchievements`
- `orderHistory`, `visitHistory`, `purchasedItems`
- `userName`, `userAvatar`, `memberSince`

## Key Files

**js/data.js** - Contains all game data:
- `RABBITS` (13 characters with personality, rarity, attributes)
- `DRINKS`, `SNACKS`, `BUN_TREATS`, `BUN_TOYS`
- `ACHIEVEMENTS` (30+ with category filtering)
- `FRIENDSHIP_LEVELS` (8 progression tiers)
- `REWARDS`, `SHOP_ITEMS`
- Lookup functions: `getRabbitById()`, `getDrinkById()`, etc.

**js/app.js** - Core application logic:
- State management and persistence
- Feature systems: cart, checkout, friendship, achievements
- UI: modals, toasts, navigation, particle effects
- History tracking, profile management, leaderboards

**css/styles.css** - Design system:
- CSS variables for colors, gradients, animations
- Kawaii aesthetic with pastels and bouncy effects
- Responsive mobile-first design

## Coding Patterns

- Functions prefixed with `init*` run on page load
- `render*` functions update DOM from state
- `handle*` functions process user interactions
- Use `showToast(message, type)` for notifications
- Use `closeAllModals()` before opening new modals
- Check achievements after state changes with `checkAchievements()`

## CSS Conventions

- Colors via CSS variables: `--pink-primary`, `--lavender-primary`, etc.
- Gradients: `--gradient-sakura`, `--gradient-sunset`, etc.
- Animation classes: `.bounce-slow`, `.wiggle`, `.fade-in`
- Rarity colors defined in `RARITY_CONFIG` in data.js
