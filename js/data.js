/* ============================================
   MEGUMI'S USAGI CAFE - DATA
   ============================================ */

const DRINKS = [
    {
        id: 'taro-dream',
        name: 'Taro Dream',
        description: 'Creamy taro with a hint of vanilla, topped with boba pearls',
        price: 6.50,
        category: 'signature',
        gradient: 'var(--drink-taro)',
        color: '#E8B8FF',
        rabbitId: 'taro'
    },
    {
        id: 'strawberry-bun',
        name: 'Strawberry Bun',
        description: 'Fresh strawberry milk tea with strawberry popping boba',
        price: 6.00,
        category: 'signature',
        gradient: 'var(--drink-strawberry)',
        color: '#FFB8E8',
        rabbitId: 'megumi'
    },
    {
        id: 'matcha-meadow',
        name: 'Matcha Meadow',
        description: 'Premium ceremonial matcha with oat milk and grass jelly',
        price: 7.00,
        category: 'signature',
        gradient: 'var(--drink-matcha)',
        color: '#B8FFD4',
        rabbitId: 'matcha'
    },
    {
        id: 'mango-sunset',
        name: 'Mango Sunset',
        description: 'Tropical mango smoothie with coconut jelly',
        price: 6.50,
        category: 'signature',
        gradient: 'var(--drink-mango)',
        color: '#FFD4B8',
        rabbitId: 'peach'
    },
    {
        id: 'lavender-haze',
        name: 'Lavender Haze',
        description: 'Calming lavender tea latte with honey boba',
        price: 6.50,
        category: 'signature',
        gradient: 'var(--drink-lavender)',
        color: '#C9A0DC',
        rabbitId: 'sesame'
    },
    {
        id: 'blueberry-cloud',
        name: 'Blueberry Cloud',
        description: 'Butterfly pea flower tea with blueberry and cheese foam',
        price: 7.00,
        category: 'signature',
        gradient: 'var(--drink-blueberry)',
        color: '#B8E0FF',
        rabbitId: 'boba'
    },
    {
        id: 'honey-butter',
        name: 'Honey Butter Boba',
        description: 'Sweet honey butter milk tea with brown sugar pearls',
        price: 6.50,
        category: 'signature',
        gradient: 'linear-gradient(180deg, #FFD700 0%, #FFF4B8 50%, #FFFEF0 100%)',
        color: '#FFD700',
        rabbitId: 'honey'
    },
    {
        id: 'mochi-milk',
        name: 'Mochi Milk Tea',
        description: 'Silky smooth milk tea with chewy mochi bits and cream',
        price: 6.50,
        category: 'signature',
        gradient: 'linear-gradient(180deg, #FFF0F5 0%, #FFE4EC 50%, #FFFFFF 100%)',
        color: '#FFE4EC',
        rabbitId: 'mochi'
    },
    {
        id: 'classic-milk-tea',
        name: 'Classic Milk Tea',
        description: 'Traditional black milk tea with tapioca pearls',
        price: 5.00,
        category: 'classic',
        gradient: 'linear-gradient(180deg, #D4C4B0 0%, #E8DDD0 50%, #FFF9F5 100%)',
        color: '#D4C4B0'
    },
    {
        id: 'brown-sugar-boba',
        name: 'Brown Sugar Boba',
        description: 'Tiger stripe brown sugar milk with fresh boba',
        price: 5.50,
        category: 'classic',
        gradient: 'linear-gradient(180deg, #8B7355 0%, #C4A882 50%, #FFF9F5 100%)',
        color: '#8B7355'
    },
    {
        id: 'jasmine-green',
        name: 'Jasmine Green Tea',
        description: 'Fragrant jasmine green tea with aloe vera',
        price: 4.50,
        category: 'classic',
        gradient: 'linear-gradient(180deg, #C8E6C9 0%, #E8F5E9 50%, #FFFFFF 100%)',
        color: '#C8E6C9'
    },
    {
        id: 'oolong-milk',
        name: 'Oolong Milk Tea',
        description: 'Roasted oolong with creamy milk and pudding',
        price: 5.50,
        category: 'classic',
        gradient: 'linear-gradient(180deg, #BCAAA4 0%, #D7CCC8 50%, #FFF9F5 100%)',
        color: '#BCAAA4'
    },
    {
        id: 'taro-bubble',
        name: 'Taro Bubble Tea',
        description: 'Classic taro milk tea with chewy tapioca',
        price: 5.50,
        category: 'classic',
        gradient: 'linear-gradient(180deg, #D4B8E8 0%, #E8D4F0 50%, #FFF9F5 100%)',
        color: '#D4B8E8'
    },
    {
        id: 'thai-milk',
        name: 'Thai Milk Tea',
        description: 'Rich and creamy Thai tea with condensed milk',
        price: 5.50,
        category: 'classic',
        gradient: 'linear-gradient(180deg, #E8A060 0%, #F0C890 50%, #FFF9F5 100%)',
        color: '#E8A060'
    },
    {
        id: 'rice-yogurt-original',
        name: 'Rice Yogurt Original',
        description: 'Creamy rice yogurt with a hint of sweetness',
        price: 5.00,
        category: 'yogurt',
        gradient: 'linear-gradient(180deg, #FFFEF5 0%, #FFF9E8 50%, #FFFFFF 100%)',
        color: '#FFF9E8'
    },
    {
        id: 'rice-yogurt-mango',
        name: 'Mango Rice Yogurt',
        description: 'Rice yogurt blended with fresh mango and tapioca',
        price: 6.00,
        category: 'yogurt',
        gradient: 'linear-gradient(180deg, #FFE4B5 0%, #FFF0D4 50%, #FFFFFF 100%)',
        color: '#FFE4B5'
    },
    {
        id: 'rice-yogurt-berry',
        name: 'Berry Rice Yogurt',
        description: 'Mixed berry rice yogurt with popping boba',
        price: 6.00,
        category: 'yogurt',
        gradient: 'linear-gradient(180deg, #E8B8D4 0%, #F5D4E8 50%, #FFFFFF 100%)',
        color: '#E8B8D4'
    },
    {
        id: 'rice-yogurt-matcha',
        name: 'Matcha Rice Yogurt',
        description: 'Earthy matcha swirled with creamy rice yogurt',
        price: 6.00,
        category: 'yogurt',
        gradient: 'linear-gradient(180deg, #C8E8C0 0%, #E4F4E0 50%, #FFFFFF 100%)',
        color: '#C8E8C0'
    },
    {
        id: 'sakura-bloom',
        name: 'Sakura Bloom',
        description: 'Limited cherry blossom tea with sakura jelly',
        price: 7.50,
        category: 'seasonal',
        gradient: 'linear-gradient(180deg, #FFB7C5 0%, #FFD9E8 50%, #FFF0F5 100%)',
        color: '#FFB7C5'
    },
    {
        id: 'winter-berry',
        name: 'Winter Berry',
        description: 'Mixed berry tea with cranberry popping boba',
        price: 7.00,
        category: 'seasonal',
        gradient: 'linear-gradient(180deg, #C5CAE9 0%, #E8EAF6 50%, #FFF0F5 100%)',
        color: '#C5CAE9'
    }
];

// Snacks available at the cafe
const SNACKS = [
    {
        id: 'mochi-trio',
        name: 'Mochi Trio',
        description: 'Three handmade mochi: strawberry, matcha, and taro',
        price: 5.50,
        category: 'sweets',
        icon: '🍡',
        rabbitId: 'mochi'
    },
    {
        id: 'taiyaki',
        name: 'Taiyaki',
        description: 'Fish-shaped cake filled with red bean or custard',
        price: 4.50,
        category: 'sweets',
        icon: '🐟',
        rabbitId: 'megumi'
    },
    {
        id: 'dorayaki',
        name: 'Dorayaki',
        description: 'Fluffy pancakes sandwiched with sweet red bean',
        price: 4.00,
        category: 'sweets',
        icon: '🥞',
        rabbitId: 'honey'
    },
    {
        id: 'dango',
        name: 'Dango Skewer',
        description: 'Chewy rice dumplings with sweet soy glaze',
        price: 3.50,
        category: 'sweets',
        icon: '🍡',
        rabbitId: 'taro'
    },
    {
        id: 'onigiri',
        name: 'Onigiri Set',
        description: 'Two rice balls with salmon and umeboshi filling',
        price: 5.00,
        category: 'savory',
        icon: '🍙',
        rabbitId: 'sesame'
    },
    {
        id: 'takoyaki',
        name: 'Takoyaki',
        description: 'Six crispy octopus balls with sauce and bonito',
        price: 6.50,
        category: 'savory',
        icon: '🐙',
        rabbitId: 'boba'
    },
    {
        id: 'edamame',
        name: 'Edamame',
        description: 'Salted steamed soybeans, a healthy snack',
        price: 3.00,
        category: 'savory',
        icon: '🫛',
        rabbitId: 'matcha'
    },
    {
        id: 'karaage',
        name: 'Karaage Bites',
        description: 'Crispy Japanese fried chicken with spicy mayo',
        price: 7.00,
        category: 'savory',
        icon: '🍗',
        rabbitId: 'peach'
    }
];

// Treats you can buy FOR the buns (increases friendship)
const BUN_TREATS = [
    {
        id: 'premium-hay',
        name: 'Premium Timothy Hay',
        description: 'The finest hay for the finest buns',
        price: 3.00,
        icon: '🌾',
        friendshipPoints: 5
    },
    {
        id: 'banana-chip',
        name: 'Banana Chips',
        description: 'Crispy, sweet, and bun-approved',
        price: 2.50,
        icon: '🍌',
        friendshipPoints: 4
    },
    {
        id: 'apple-slice',
        name: 'Fresh Apple Slices',
        description: 'Juicy apple slices, a bunny favorite',
        price: 2.00,
        icon: '🍎',
        friendshipPoints: 3
    },
    {
        id: 'carrot-sticks',
        name: 'Organic Carrot Sticks',
        description: 'Crunchy carrots from our garden',
        price: 2.00,
        icon: '🥕',
        friendshipPoints: 3
    },
    {
        id: 'herbal-mix',
        name: 'Herbal Treat Mix',
        description: 'Dried herbs and flowers, very fancy',
        price: 4.00,
        icon: '🌿',
        friendshipPoints: 6
    },
    {
        id: 'papaya-treats',
        name: 'Dried Papaya Treats',
        description: 'Tropical sweetness, great for digestion',
        price: 3.50,
        icon: '🧡',
        friendshipPoints: 5
    }
];

// Toys you can buy FOR the buns (increases friendship more)
const BUN_TOYS = [
    {
        id: 'willow-ball',
        name: 'Willow Ball',
        description: 'Natural willow ball for tossing and chewing',
        price: 5.00,
        icon: '⚽',
        friendshipPoints: 8
    },
    {
        id: 'tunnel',
        name: 'Bunny Tunnel',
        description: 'A collapsible tunnel for zoomies',
        price: 12.00,
        icon: '🕳️',
        friendshipPoints: 15
    },
    {
        id: 'stacking-cups',
        name: 'Stacking Cups',
        description: 'Colorful cups to knock over repeatedly',
        price: 8.00,
        icon: '🥤',
        friendshipPoints: 10
    },
    {
        id: 'dig-box',
        name: 'Dig Box Refill',
        description: 'Fresh shredded paper for digging fun',
        price: 6.00,
        icon: '📦',
        friendshipPoints: 8
    },
    {
        id: 'treat-puzzle',
        name: 'Treat Puzzle',
        description: 'Hide treats inside for bunny brain games',
        price: 10.00,
        icon: '🧩',
        friendshipPoints: 12
    },
    {
        id: 'plush-carrot',
        name: 'Plush Carrot Toy',
        description: 'A soft carrot friend to cuddle or destroy',
        price: 7.00,
        icon: '🥕',
        friendshipPoints: 10
    }
];

// Friendship levels and their perks
const FRIENDSHIP_LEVELS = [
    { level: 0, name: 'Stranger', minPoints: 0, icon: '❓', perk: 'The bun eyes you suspiciously' },
    { level: 1, name: 'Acquaintance', minPoints: 10, icon: '👋', perk: 'The bun tolerates your presence' },
    { level: 2, name: 'Friend', minPoints: 30, icon: '🤝', perk: 'The bun approaches you sometimes' },
    { level: 3, name: 'Good Friend', minPoints: 60, icon: '💕', perk: 'The bun seeks you out for pets' },
    { level: 4, name: 'Best Friend', minPoints: 100, icon: '💖', perk: 'The bun binkies when they see you' },
    { level: 5, name: 'Soulmate', minPoints: 150, icon: '👑', perk: 'The bun has claimed you as their human' }
];

const RABBITS = [
    {
        id: 'megumi',
        name: 'Megumi',
        emoji: '🐰',
        personality: 'The Boss',
        title: 'Founder & Head Bun',
        rarity: 'legendary',
        bio: 'Megumi founded this cafe with nothing but a dream and a very sharp knife. She\'s sweet on the outside, spicy on the inside. Will absolutely bite if provoked. Favorite drink: Strawberry Bun (extra spicy).',
        stats: {
            fluffiness: 95,
            biteyness: 100,
            friendliness: 70,
            chaos: 90
        },
        likes: ['Being in charge', 'Spicy snacks', 'Judging customers'],
        dislikes: ['Being told no', 'Loud noises', 'Empty tip jars'],
        signatureDrink: 'strawberry-bun',
        signatureSnack: 'taiyaki'
    },
    {
        id: 'mochi',
        name: 'Mochi',
        emoji: '🐇',
        personality: 'The Sweetheart',
        title: 'Chief Cuddle Officer',
        rarity: 'rare',
        bio: 'Mochi is the softest, roundest bun you\'ll ever meet. She lives for head pats and will fall asleep in your lap if you let her. Sometimes too trusting for her own good.',
        stats: {
            fluffiness: 100,
            biteyness: 10,
            friendliness: 100,
            chaos: 20
        },
        likes: ['Naps', 'Head pats', 'Warm blankets'],
        dislikes: ['Being woken up', 'Cold floors', 'Vegetables'],
        signatureDrink: 'mochi-milk',
        signatureSnack: 'mochi-trio'
    },
    {
        id: 'boba',
        name: 'Boba',
        emoji: '🐰',
        personality: 'The Troublemaker',
        title: 'Professional Chaos Agent',
        rarity: 'uncommon',
        bio: 'Boba has a talent for getting into places he shouldn\'t be. Found him in the boba supply closet once. Then twice. Then we stopped counting. He\'s basically part of the inventory now.',
        stats: {
            fluffiness: 75,
            biteyness: 40,
            friendliness: 80,
            chaos: 100
        },
        likes: ['Escaping', 'Stealing snacks', 'Cardboard boxes'],
        dislikes: ['Closed doors', 'Rules', 'Sitting still'],
        signatureDrink: 'blueberry-cloud',
        signatureSnack: 'takoyaki'
    },
    {
        id: 'taro',
        name: 'Taro',
        emoji: '🐇',
        personality: 'The Philosopher',
        title: 'Senior Contemplation Specialist',
        rarity: 'rare',
        bio: 'Taro spends most of his time staring into the middle distance, pondering the mysteries of the universe. Or just zoning out. Hard to tell, really. Surprisingly wise.',
        stats: {
            fluffiness: 85,
            biteyness: 15,
            friendliness: 65,
            chaos: 30
        },
        likes: ['Quiet corners', 'Philosophical discussions', 'Sunbeams'],
        dislikes: ['Interruptions', 'Loud music', 'Rushed decisions'],
        signatureDrink: 'taro-dream',
        signatureSnack: 'dango'
    },
    {
        id: 'peach',
        name: 'Peach',
        emoji: '🐰',
        personality: 'The Diva',
        title: 'Head of Aesthetic Affairs',
        rarity: 'uncommon',
        bio: 'Peach knows she\'s gorgeous and isn\'t afraid to show it. She\'ll pose for photos but only from her good side (all sides are her good side). Demands premium treats.',
        stats: {
            fluffiness: 90,
            biteyness: 50,
            friendliness: 60,
            chaos: 55
        },
        likes: ['Photoshoots', 'Premium hay', 'Being admired'],
        dislikes: ['Bad lighting', 'Being ignored', 'Generic treats'],
        signatureDrink: 'mango-sunset',
        signatureSnack: 'karaage'
    },
    {
        id: 'sesame',
        name: 'Sesame',
        emoji: '🐇',
        personality: 'The Shy One',
        title: 'Background Bunny',
        rarity: 'common',
        bio: 'Sesame is very shy but incredibly sweet once he warms up to you. He\'ll watch you from behind the plants for a while before approaching. Worth the wait.',
        stats: {
            fluffiness: 80,
            biteyness: 5,
            friendliness: 90,
            chaos: 15
        },
        likes: ['Hiding spots', 'Gentle voices', 'One-on-one attention'],
        dislikes: ['Crowds', 'Sudden movements', 'Being the center of attention'],
        signatureDrink: 'lavender-haze',
        signatureSnack: 'onigiri'
    },
    {
        id: 'matcha',
        name: 'Matcha',
        emoji: '🐰',
        personality: 'The Energizer',
        title: 'Zoomies Director',
        rarity: 'common',
        bio: 'Matcha has one speed: maximum. She binkies around the cafe at random intervals and has knocked over at least 47 drinks. We\'ve stopped counting the casualties.',
        stats: {
            fluffiness: 70,
            biteyness: 35,
            friendliness: 85,
            chaos: 95
        },
        likes: ['Running', 'Jumping', 'More running'],
        dislikes: ['Sitting still', 'Slow days', 'Being contained'],
        signatureDrink: 'matcha-meadow',
        signatureSnack: 'edamame'
    },
    {
        id: 'honey',
        name: 'Honey',
        emoji: '🐇',
        personality: 'The Foodie',
        title: 'Treat Quality Inspector',
        rarity: 'uncommon',
        bio: 'Honey is highly food-motivated and will do anything for a treat. She\'s learned to open the treat cabinet. We\'ve had to install three different locks. She\'s figured out two.',
        stats: {
            fluffiness: 88,
            biteyness: 30,
            friendliness: 95,
            chaos: 60
        },
        likes: ['Treats', 'More treats', 'Did we mention treats?'],
        dislikes: ['Empty food bowls', 'Diets', 'Sharing'],
        signatureDrink: 'honey-butter',
        signatureSnack: 'dorayaki'
    }
];

const REWARDS = [
    {
        id: 'sticker-pack',
        name: 'Bunny Sticker Pack',
        icon: '🎨',
        stampsRequired: 5,
        description: 'A cute set of cafe bunny stickers'
    },
    {
        id: 'free-topping',
        name: 'Free Topping',
        icon: '🧋',
        stampsRequired: 10,
        description: 'Add any topping free on your next drink'
    },
    {
        id: 'rabbit-keychain',
        name: 'Mini Rabbit Keychain',
        icon: '🔑',
        stampsRequired: 15,
        description: 'Adorable rabbit keychain of your choice'
    },
    {
        id: 'free-drink',
        name: 'Free Signature Drink',
        icon: '🎁',
        stampsRequired: 20,
        description: 'Any signature drink on the house'
    },
    {
        id: 'plushie',
        name: 'Cafe Rabbit Plushie',
        icon: '🧸',
        stampsRequired: 30,
        description: 'Soft plushie of your favorite cafe bun'
    },
    {
        id: 'vip-visit',
        name: 'VIP Rabbit Session',
        icon: '👑',
        stampsRequired: 50,
        description: 'Private 1-hour session with all the bunnies'
    }
];

const SHOP_ITEMS = [
    {
        id: 'phone-case',
        name: 'Bunny Phone Case',
        icon: '📱',
        price: 24.99,
        stampsRequired: 5,
        description: 'Cute cafe design phone case'
    },
    {
        id: 'tote-bag',
        name: 'Canvas Tote Bag',
        icon: '👜',
        price: 18.99,
        stampsRequired: 10,
        description: '"I bite" tote bag'
    },
    {
        id: 'enamel-pin',
        name: 'Enamel Pin Set',
        icon: '📍',
        price: 12.99,
        stampsRequired: 5,
        description: 'Set of 3 rabbit pins'
    },
    {
        id: 'notebook',
        name: 'Bunny Notebook',
        icon: '📓',
        price: 14.99,
        stampsRequired: 15,
        description: 'Pastel notebook with rabbit designs'
    },
    {
        id: 'hoodie',
        name: 'Cafe Hoodie',
        icon: '🧥',
        price: 45.99,
        stampsRequired: 20,
        description: 'Cozy hoodie with Megumi on back'
    },
    {
        id: 'tumbler',
        name: 'Reusable Tumbler',
        icon: '🥤',
        price: 28.99,
        stampsRequired: 10,
        description: 'Eco-friendly boba tumbler'
    },
    {
        id: 'plush-megumi',
        name: 'Megumi Plushie',
        icon: '🐰',
        price: 34.99,
        stampsRequired: 30,
        description: 'Limited edition Megumi plush'
    },
    {
        id: 'art-print',
        name: 'Art Print Collection',
        icon: '🖼️',
        price: 22.99,
        stampsRequired: 15,
        description: 'Set of 4 rabbit art prints'
    }
];

const DAILY_MESSAGES = [
    { rabbit: 'megumi', message: "I'm watching you. Order something or leave.", emoji: '🐰' },
    { rabbit: 'megumi', message: "The knife? It's for... aesthetic purposes. Mostly.", emoji: '🐰' },
    { rabbit: 'mochi', message: "*yawns* Oh hi... wanna nap together?", emoji: '🐇' },
    { rabbit: 'mochi', message: "I saved you a warm spot on the cushion!", emoji: '🐇' },
    { rabbit: 'boba', message: "Psst... I found where they hide the good treats.", emoji: '🐰' },
    { rabbit: 'boba', message: "*currently stuck in a cup* This is fine.", emoji: '🐰' },
    { rabbit: 'taro', message: "Have you ever considered... the meaning of boba?", emoji: '🐇' },
    { rabbit: 'taro', message: "*stares philosophically at your drink*", emoji: '🐇' },
    { rabbit: 'peach', message: "Make sure you get my good side in photos!", emoji: '🐰' },
    { rabbit: 'peach', message: "I expect tribute in the form of premium hay.", emoji: '🐰' },
    { rabbit: 'sesame', message: "*peeks out nervously* H-hi there...", emoji: '🐇' },
    { rabbit: 'sesame', message: "I'll come say hi... just give me a minute...", emoji: '🐇' },
    { rabbit: 'matcha', message: "CAN'T TALK ZOOMING BYE", emoji: '🐰' },
    { rabbit: 'matcha', message: "*knocks over a display* SORRY NOT SORRY", emoji: '🐰' },
    { rabbit: 'honey', message: "You have treats, right? RIGHT?", emoji: '🐇' },
    { rabbit: 'honey', message: "I'll be your best friend for a snack...", emoji: '🐇' }
];

const STAMP_ICONS = ['🌸', '🍡', '🧋', '🐰', '⭐', '💮', '🎀', '🌷', '✨', '💫'];
