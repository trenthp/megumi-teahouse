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
        color: '#E8B8FF'
    },
    {
        id: 'strawberry-bun',
        name: 'Strawberry Bun',
        description: 'Fresh strawberry milk tea with strawberry popping boba',
        price: 6.00,
        category: 'signature',
        gradient: 'var(--drink-strawberry)',
        color: '#FFB8E8'
    },
    {
        id: 'matcha-meadow',
        name: 'Matcha Meadow',
        description: 'Premium ceremonial matcha with oat milk and grass jelly',
        price: 7.00,
        category: 'signature',
        gradient: 'var(--drink-matcha)',
        color: '#B8FFD4'
    },
    {
        id: 'mango-sunset',
        name: 'Mango Sunset',
        description: 'Tropical mango smoothie with coconut jelly',
        price: 6.50,
        category: 'signature',
        gradient: 'var(--drink-mango)',
        color: '#FFD4B8'
    },
    {
        id: 'lavender-haze',
        name: 'Lavender Haze',
        description: 'Calming lavender tea latte with honey boba',
        price: 6.50,
        category: 'signature',
        gradient: 'var(--drink-lavender)',
        color: '#C9A0DC'
    },
    {
        id: 'blueberry-cloud',
        name: 'Blueberry Cloud',
        description: 'Butterfly pea flower tea with blueberry and cheese foam',
        price: 7.00,
        category: 'signature',
        gradient: 'var(--drink-blueberry)',
        color: '#B8E0FF'
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
        dislikes: ['Being told no', 'Loud noises', 'Empty tip jars']
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
        dislikes: ['Being woken up', 'Cold floors', 'Vegetables']
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
        dislikes: ['Closed doors', 'Rules', 'Sitting still']
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
        dislikes: ['Interruptions', 'Loud music', 'Rushed decisions']
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
        dislikes: ['Bad lighting', 'Being ignored', 'Generic treats']
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
        dislikes: ['Crowds', 'Sudden movements', 'Being the center of attention']
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
        dislikes: ['Sitting still', 'Slow days', 'Being contained']
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
        dislikes: ['Empty food bowls', 'Diets', 'Sharing']
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
