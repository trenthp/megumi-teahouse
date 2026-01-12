/* ============================================
   MEGUMI'S USAGI CAFE - DATA
   ============================================ */

// ============================================
// RABBITS (BUNS)
// ============================================

const RABBITS = [
    {
        id: 'taro',
        name: 'Taro',
        breed: 'Lilac',
        rarity: 'very-rare',
        fluff: 5,
        spice: 4,
        image: 'images/buns/taro.png',
        description: 'Dreamy, soft appearance with a poetic, quietly bold personality; lilac hues add gentle mystery.',
        personality: 'The Poet',
        title: 'Dreamer in Residence',
        bio: 'Taro moves through the cafe like a soft-focus daydream. They\'ll stare at you with knowing eyes that suggest they understand the universe better than you do. Approach slowly, speak in whispers, and maybe they\'ll share their secrets.',
        likes: ['Quiet corners', 'Philosophical conversations', 'Twilight hours'],
        dislikes: ['Loud noises', 'Rushed energy', 'Being photographed without consent'],
        signatureDrink: 'lilac-yuzu-sparkler',
        signatureSnack: 'lilac-taro-mousse-tart'
    },
    {
        id: 'panko',
        name: 'Panko',
        breed: 'English Angora',
        rarity: 'very-rare',
        fluff: 4,
        spice: 3,
        image: 'images/buns/panko.png',
        description: 'Cloud-like fluffiness with a calm, observant nature; understated charm.',
        personality: 'The Cloud',
        title: 'Fluff Ambassador',
        bio: 'Panko is essentially a sentient cloud who occasionally deigns to hop. Their fur requires daily maintenance, which they endure with the patience of a saint. They watch everything, judge silently, and somehow always look immaculate.',
        likes: ['Grooming sessions', 'Being admired from afar', 'Soft music'],
        dislikes: ['Humidity', 'Sticky fingers', 'Being touched without warning'],
        signatureDrink: 'silken-matcha-golden-foam',
        signatureSnack: 'crispy-tofu-seaweed-mochi'
    },
    {
        id: 'taiyaki',
        name: 'Taiyaki',
        breed: 'French Angora',
        rarity: 'very-rare',
        fluff: 4,
        spice: 4,
        image: 'images/buns/taiyaki.png',
        description: 'Elegant and soft with luxurious fur; carries a refined, slightly mischievous flair.',
        personality: 'The Aristocrat',
        title: 'Chief of Refined Mischief',
        bio: 'Taiyaki has the air of old money and the soul of a troublemaker. They\'ll accept your tribute of treats with regal grace, then knock your drink off the table just to watch you scramble. Sophisticated chaos.',
        likes: ['Fine treats', 'Causing elegant problems', 'Being the center of attention'],
        dislikes: ['Cheap hay', 'Being ignored', 'Commoners (just kidding... mostly)'],
        signatureDrink: 'adzuki-rose-milk-tea',
        signatureSnack: 'golden-custard-taiyaki'
    },
    {
        id: 'sesami',
        name: 'Sesami',
        breed: 'Palomino',
        rarity: 'common',
        fluff: 4,
        spice: 5,
        image: 'images/buns/sesame.png',
        description: 'Sleek, shiny coat and nutty sophistication; bold flavor profile and confident presence.',
        personality: 'The Bold One',
        title: 'Head of Confidence',
        bio: 'Sesami knows exactly how good they look and isn\'t shy about it. Their sleek coat catches the light just so, and they\'ll pose unprompted. High spice energy means they\'ll challenge you to a staring contest. You\'ll lose.',
        likes: ['Sunbathing', 'Being photographed', 'Asserting dominance'],
        dislikes: ['Being outshined', 'Bland food', 'Hesitation'],
        signatureDrink: 'golden-sesame-oolong',
        signatureSnack: 'black-sesame-daifuku'
    },
    {
        id: 'matcha',
        name: 'Matcha',
        breed: 'Czech Frosty',
        rarity: 'common',
        fluff: 5,
        spice: 3,
        image: 'images/buns/matcha.png',
        description: 'Frosty fur and tranquil aura bring serene fluff; earthy, grounded energy.',
        personality: 'The Zen Master',
        title: 'Director of Tranquility',
        bio: 'Matcha radiates the calm energy of a meditation retreat. Their frosty coat and serene demeanor make them the perfect companion for quiet reflection. They move slowly, breathe deeply, and have never experienced stress.',
        likes: ['Peaceful mornings', 'Gentle pets', 'Herbal treats'],
        dislikes: ['Chaos', 'Sudden movements', 'Excessive noise'],
        signatureDrink: 'frosted-chai-matcha',
        signatureSnack: 'frost-dusted-green-tea-mochi'
    },
    {
        id: 'adzuki',
        name: 'Adzuki',
        breed: 'Polish',
        rarity: 'rare',
        fluff: 3,
        spice: 4,
        image: 'images/buns/adzuki.png',
        description: 'Compact and regal; less fluff due to size, but high spice with bold, spirited charm.',
        personality: 'The Little Royal',
        title: 'Tiny but Mighty Monarch',
        bio: 'Don\'t let Adzuki\'s small size fool you—they rule this cafe with an iron paw. Compact, commanding, and absolutely convinced of their own importance. They expect royal treatment and will thump disapprovingly if standards slip.',
        likes: ['Being treated like royalty', 'Small thrones', 'Sweet treats'],
        dislikes: ['Being called small', 'Disrespect', 'Sharing'],
        signatureDrink: 'red-bean-velvet-latte',
        signatureSnack: 'mini-adzuki-mochi-bites'
    },
    {
        id: 'momo',
        name: 'Momo',
        breed: 'Argente Brun',
        rarity: 'rare',
        fluff: 4,
        spice: 4,
        image: 'images/buns/momo.png',
        description: 'Elegant dual-toned fur and peach-inspired sweetness; balanced warmth and flair.',
        personality: 'The Balanced Beauty',
        title: 'Harmony Coordinator',
        bio: 'Named after the beloved peach, Momo embodies perfect balance—sweet but not cloying, elegant but approachable. Their dual-toned fur shifts in the light like a sunset. They bring peace wherever they hop.',
        likes: ['Balanced flavors', 'Gentle attention', 'Aesthetic arrangements'],
        dislikes: ['Extremes', 'Chaos', 'Messy spaces'],
        signatureDrink: 'peach-blossom-frost-latte',
        signatureSnack: 'peach-matcha-mochi-parfait'
    },
    {
        id: 'mochi',
        name: 'Mochi',
        breed: 'Britannia Petite',
        rarity: 'rare',
        fluff: 5,
        spice: 5,
        image: 'images/buns/mochi.png',
        description: 'Tiny and irresistibly soft; bursting with playful energy and cleverness in a mini package.',
        personality: 'The Pocket Rocket',
        title: 'Chief Chaos Coordinator',
        bio: 'Mochi packs maximum personality into minimum size. They\'re impossibly soft, devastatingly cute, and absolutely unhinged. Don\'t be fooled by the innocent face—they\'ve figured out how to open three different treat containers.',
        likes: ['Causing chaos', 'Tiny spaces', 'Outsmarting humans'],
        dislikes: ['Being underestimated', 'Closed containers', 'Sitting still'],
        signatureDrink: 'mini-mochi-matcha-sparkler',
        signatureSnack: 'nano-mochi-trio'
    },
    {
        id: 'sakura',
        name: 'Sakura',
        breed: 'Lionhead',
        rarity: 'rare',
        fluff: 5,
        spice: 4,
        image: 'images/buns/sakura.png',
        description: 'Majestic mane and blossom-inspired grace; highly fluffy with a touch of playful drama.',
        personality: 'The Drama Queen',
        title: 'Head of Theatrical Affairs',
        bio: 'Sakura\'s magnificent mane frames their face like cherry blossoms in spring. They know they\'re gorgeous and perform accordingly—every hop is a statement, every pose a masterpiece. Slightly dramatic but undeniably captivating.',
        likes: ['Grand entrances', 'Being admired', 'Dramatic pauses'],
        dislikes: ['Bad lighting', 'Being upstaged', 'Mussed fur'],
        signatureDrink: 'sakura-blossom-fizz',
        signatureSnack: 'sakura-matcha-lion-puffs'
    },
    {
        id: 'boba',
        name: 'Boba',
        breed: 'Blanc de Hotot',
        rarity: 'common',
        fluff: 4,
        spice: 5,
        image: 'images/buns/boba.png',
        description: 'Striking appearance with bold eye markings; elegant fluff paired with high sass and sparkle.',
        personality: 'The Showstopper',
        title: 'Director of Eye Contact',
        bio: 'Boba\'s signature eye markings make them impossible to ignore—and they know it. Those dark-rimmed eyes will lock onto yours with unsettling intensity. High sass, maximum confidence, and a talent for photobombing.',
        likes: ['Staring contests', 'Being the center of attention', 'Sparkling things'],
        dislikes: ['Being ignored', 'Closed doors', 'Sharing the spotlight'],
        signatureDrink: 'black-eyed-sparkling-tea',
        signatureSnack: 'snowball-puffs'
    },
    {
        id: 'chai',
        name: 'Chai',
        breed: 'Cinnamon',
        rarity: 'common',
        fluff: 5,
        spice: 4,
        image: 'images/buns/chai.png',
        description: 'Warm, cinnamon-colored coat and nurturing vibe; cozy fluff with a hint of spicy warmth.',
        personality: 'The Comfort Bun',
        title: 'Chief Cuddle Officer',
        bio: 'Chai radiates the warmth of a cozy autumn afternoon. Their cinnamon-colored fur begs to be touched, and they\'ll actually let you. The cafe\'s designated therapy bun—one cuddle session and your troubles melt away.',
        likes: ['Warm blankets', 'Gentle cuddles', 'Cozy corners'],
        dislikes: ['Cold drafts', 'Harsh lighting', 'Being rushed'],
        signatureDrink: 'spiced-cinnamon-milk-tea',
        signatureSnack: 'cinnamon-sugar-puff-bites'
    },
    {
        id: 'anpan',
        name: 'Anpan',
        breed: 'Holland Lop',
        rarity: 'common',
        fluff: 5,
        spice: 2,
        image: 'images/buns/anpan.png',
        description: 'Extremely fluffy and sweet-natured, with a cozy, comforting presence. Mild spice from subtle curiosity.',
        personality: 'The Sweetheart',
        title: 'Ambassador of Softness',
        bio: 'Anpan is pure, concentrated sweetness in rabbit form. Those floppy ears and round cheeks have converted even the most hardened non-rabbit-people. Low spice, high fluff, maximum adorability. Will fall asleep in your lap.',
        likes: ['Lap naps', 'Gentle voices', 'Sweet treats'],
        dislikes: ['Loud sounds', 'Being startled', 'Spicy food'],
        signatureDrink: 'carrot-mochi-milk',
        signatureSnack: 'mini-mochi-anpan-bites'
    },
    {
        id: 'ocha',
        name: 'Ocha',
        breed: 'Thrianta',
        rarity: 'common',
        fluff: 5,
        spice: 3,
        image: 'images/buns/ocha.png',
        description: 'Radiant golden fur and serene demeanor make them deeply comforting; gentle warmth with quiet confidence.',
        personality: 'The Golden Hour',
        title: 'Radiance Director',
        bio: 'Ocha glows like honey in sunlight. Their golden fur seems to catch and hold warmth, making them irresistible on cold days. Calm, confident, and emanating the energy of a perfect cup of tea—comforting and grounding.',
        likes: ['Sunbeams', 'Warm laps', 'Being quietly adored'],
        dislikes: ['Cold spots', 'Disrupted routines', 'Artificial lighting'],
        signatureDrink: 'golden-honey-black-tea',
        signatureSnack: 'honey-marigold-shortbread'
    }
];

// ============================================
// SIGNATURE DRINKS
// ============================================

const SIGNATURE_DRINKS = [
    {
        id: 'lilac-yuzu-sparkler',
        name: 'Lilac Yuzu Sparkler',
        rabbitId: 'taro',
        price: 8.50,
        color: '#D4A5FF',
        gradient: 'linear-gradient(180deg, #D4A5FF 0%, #FFE5B4 50%, #FFF8E7 100%)',
        shortDescription: 'Butterfly pea flower tea with yuzu and purple sweet potato swirls',
        fullDescription: 'This enchanting drink features a base of chilled yuzu juice and butterfly pea flower tea, giving it a natural gradient from soft lilac to pale gold. A splash of sparkling soda adds a delicate fizz, while a drizzle of purple sweet potato syrup swirls through it like morning mist. Served in a glass rimmed with edible silver sugar and garnished with a candied violet and a thin yuzu wheel, it\'s both refreshing and whimsical.',
        tags: ['sparkling', 'floral', 'refreshing']
    },
    {
        id: 'silken-matcha-golden-foam',
        name: 'Silken Matcha Latte with Golden Foam',
        rabbitId: 'panko',
        price: 8.00,
        color: '#A8D5A2',
        gradient: 'linear-gradient(180deg, #D4AF37 0%, #A8D5A2 50%, #F5F5DC 100%)',
        shortDescription: 'Ceremonial matcha with golden-tinted foam and sakura salt',
        fullDescription: 'A luxurious blend of creamy oat milk, premium ceremonial-grade matcha, and a touch of honey, served warm in a handcrafted ceramic mug. The drink is topped with a velvety layer of golden-tinted milk foam, dusted with edible sakura salt, and garnished with a delicate candied cherry blossom. Served with a side of mini rice crackers shaped like bunnies.',
        tags: ['warm', 'earthy', 'luxurious']
    },
    {
        id: 'adzuki-rose-milk-tea',
        name: 'Adzuki Rose Milk Tea',
        rabbitId: 'taiyaki',
        price: 7.50,
        color: '#FFB6C1',
        gradient: 'linear-gradient(180deg, #FFB6C1 0%, #E8D4D4 50%, #FFF5F5 100%)',
        shortDescription: 'Sweet red bean and rose swirl in warm frothed milk',
        fullDescription: 'This delicate beverage blends warm, frothed milk with a swirl of sweet red azuki bean paste and a hint of rose syrup, creating a soft pink hue that mirrors Taiyaki\'s gentle nature. Served in a porcelain cup shaped like a fish tail, it\'s garnished with a single crystallized rose petal and a mini taiyaki cookie on the saucer.',
        tags: ['warm', 'floral', 'sweet']
    },
    {
        id: 'golden-sesame-oolong',
        name: 'Golden Sesame Oolong Latte',
        rabbitId: 'sesami',
        price: 7.00,
        color: '#C9A227',
        gradient: 'linear-gradient(180deg, #C9A227 0%, #E8D5A3 50%, #FFF9E8 100%)',
        shortDescription: 'Roasted oolong with black sesame paste and honey',
        fullDescription: 'A warm, velvety blend of roasted oolong tea and steamed milk, swirled with house-made black sesame paste and a hint of honey. Served in a golden-rimmed ceramic cup, it\'s topped with a dusting of toasted white sesame and a delicate sesame crisp. The aroma is nutty and soothing, perfect for cozy afternoons.',
        tags: ['warm', 'nutty', 'comforting']
    },
    {
        id: 'frosted-chai-matcha',
        name: 'Frosted Chai Matcha Latte',
        rabbitId: 'matcha',
        price: 7.50,
        color: '#90C9A7',
        gradient: 'linear-gradient(180deg, #E8E8E8 0%, #90C9A7 50%, #F5FFFA 100%)',
        shortDescription: 'Ceremonial matcha meets chai spices with snow-like foam',
        fullDescription: 'A velvety blend of ceremonial matcha, warm chai-spiced milk, and a touch of honey, topped with a snow-like foam dusted in edible silver glitter to reflect the "frosty" in their name. Served in a hand-thrown ceramic mug with a cracked-glaze finish resembling ice crystals, this drink is both cozy and elegant.',
        tags: ['warm', 'spiced', 'earthy']
    },
    {
        id: 'red-bean-velvet-latte',
        name: 'Red Bean Velvet Latte',
        rabbitId: 'adzuki',
        price: 6.50,
        color: '#8B4557',
        gradient: 'linear-gradient(180deg, #8B4557 0%, #D4A5A5 50%, #FFF5F5 100%)',
        shortDescription: 'Sweet adzuki bean paste swirled in warm vanilla milk',
        fullDescription: 'A creamy, dreamy blend of warm milk, sweet adzuki bean paste, and a touch of vanilla, swirled to create a velvety red-and-white pattern reminiscent of a royal robe. Served in a petite porcelain cup with a golden rim, it\'s topped with a dollop of whipped cream and a single candied adzuki bean.',
        tags: ['warm', 'sweet', 'rich']
    },
    {
        id: 'peach-blossom-frost-latte',
        name: 'Peach Blossom Frost Latte',
        rabbitId: 'momo',
        price: 7.50,
        color: '#FFCBA4',
        gradient: 'linear-gradient(180deg, #FFB6C1 0%, #FFCBA4 50%, #FFF5EE 100%)',
        shortDescription: 'White peach and matcha milk with yuzu-scented foam',
        fullDescription: 'A silky blend of white peach puree, matcha-infused milk, and a hint of vanilla, served chilled with a frosted rim dusted in edible pink and silver sugar to mimic her dual-toned fur. Topped with a cloud of yuzu-scented foam and a single crystallized peach blossom.',
        tags: ['chilled', 'fruity', 'floral']
    },
    {
        id: 'mini-mochi-matcha-sparkler',
        name: 'Mini Mochi Matcha Sparkler',
        rabbitId: 'mochi',
        price: 7.00,
        color: '#98D8AA',
        gradient: 'linear-gradient(180deg, #98D8AA 0%, #F0FFF0 50%, #FFFAF0 100%)',
        shortDescription: 'Matcha milk with yuzu fizz and bursting mochi bubbles',
        fullDescription: 'A petite, effervescent drink served in a thimble-sized glass: chilled matcha milk topped with a fizzy yuzu soda swirl and a single mochi bubble made from agar and filled with sweet red bean juice. The bubbles gently pop in the mouth, releasing a burst of flavor. Served with a mini umbrella and a dusting of edible gold.',
        tags: ['chilled', 'sparkling', 'playful']
    },
    {
        id: 'sakura-blossom-fizz',
        name: 'Sakura Blossom Fizz Sparkler',
        rabbitId: 'sakura',
        price: 8.00,
        color: '#FFB7C5',
        gradient: 'linear-gradient(180deg, #FFB7C5 0%, #FFE4EC 50%, #FFF0F5 100%)',
        shortDescription: 'Cherry blossom syrup with green tea and sparkling soda',
        fullDescription: 'A delicate, rose-hued drink made with cherry blossom syrup, chilled green tea, and a splash of sparkling soda. Served in a glass rimmed with edible pink sugar and topped with a floating crystallized sakura petal, it sparkles like morning dew on petals. Light, floral, and perfectly suited to Sakura\'s gentle charm.',
        tags: ['sparkling', 'floral', 'refreshing']
    },
    {
        id: 'black-eyed-sparkling-tea',
        name: 'Black-Eyed Sparkling Tea',
        rabbitId: 'boba',
        price: 7.50,
        color: '#E8E8E8',
        gradient: 'linear-gradient(180deg, #4A4A4A 0%, #E8E8E8 50%, #FFFFFF 100%)',
        shortDescription: 'White grape and lychee tea with blackberry swirl and boba pearls',
        fullDescription: 'A luminous, refreshing drink made from white grape juice, lychee puree, and sparkling green tea, swirled with a blackberry syrup that pools at the bottom like her signature eye rings. Served in a crystal-clear glass with a ring of black sesame seeds around the rim and topped with chewy boba pearls.',
        tags: ['sparkling', 'fruity', 'bold']
    },
    {
        id: 'spiced-cinnamon-milk-tea',
        name: 'Spiced Cinnamon Milk Tea',
        rabbitId: 'chai',
        price: 6.50,
        color: '#D2691E',
        gradient: 'linear-gradient(180deg, #D2691E 0%, #DEB887 50%, #FFF8DC 100%)',
        shortDescription: 'Cinnamon syrup with cardamom, clove, and steamed oat milk',
        fullDescription: 'A velvety warm drink made with steamed oat milk, house-made cinnamon syrup, and a whisper of cardamom and clove, evoking the aroma of chai tea. Served in a hand-glazed brown mug with a cinnamon stick stirrer and a dusting of edible gold powder to mimic the sunlit tips of her fur.',
        tags: ['warm', 'spiced', 'cozy']
    },
    {
        id: 'carrot-mochi-milk',
        name: 'Carrot Mochi Milk',
        rabbitId: 'anpan',
        price: 6.00,
        color: '#FFA07A',
        gradient: 'linear-gradient(180deg, #FFA07A 0%, #FFDAB9 50%, #FFFAF0 100%)',
        shortDescription: 'Fresh carrot juice with sweet rice milk and mochi pearls',
        fullDescription: 'A creamy, pastel-orange blend of fresh carrot juice, sweet rice milk, and tiny chewy mochi pearls, lightly sweetened with honey and dusted with matcha powder on top for a delicate earthy note. Served in a small ceramic cup with a bunny-shaped stirrer.',
        tags: ['chilled', 'sweet', 'wholesome']
    },
    {
        id: 'golden-honey-black-tea',
        name: 'Golden Honey Black Tea Latte',
        rabbitId: 'ocha',
        price: 6.50,
        color: '#DAA520',
        gradient: 'linear-gradient(180deg, #DAA520 0%, #F5DEB3 50%, #FFFEF0 100%)',
        shortDescription: 'Assam black tea with raw honey, oat milk, and gold flakes',
        fullDescription: 'A warm, golden-hued latte made with assam black tea, steamed oat milk, and a drizzle of raw honey, creating a naturally sweet brew. Served in a handcrafted ceramic cup with a honey-dipper stirrer and a dusting of edible gold flakes on top. A single candied marigold petal floats on the surface.',
        tags: ['warm', 'sweet', 'radiant']
    }
];

// ============================================
// SIGNATURE SNACKS
// ============================================

const SIGNATURE_SNACKS = [
    {
        id: 'lilac-taro-mousse-tart',
        name: 'Lilac Taro Blossom Mousse Tart',
        rabbitId: 'taro',
        price: 7.50,
        icon: '🌸',
        shortDescription: 'Purple taro mousse with yuzu and vanilla in almond shortbread',
        fullDescription: 'A delicate, bite-sized dessert featuring a soft purple taro mousse infused with a hint of yuzu and vanilla, set in a buttery almond shortbread crust. The top is swirled like a blooming flower and glazed with edible lilac-hued jelly made from butterfly pea flower and agar. Each tart is finished with a single crystallized lilac petal and a dusting of edible gold. Served on a pastel-themed plate shaped like rabbit ears.'
    },
    {
        id: 'crispy-tofu-seaweed-mochi',
        name: 'Crispy Tofu & Seaweed Mochi Bites',
        rabbitId: 'panko',
        price: 6.50,
        icon: '🍙',
        shortDescription: 'Pan-fried mochi with silken tofu, wakame, and ginger',
        fullDescription: 'Delicate, golden-brown mochi dumplings lightly pan-fried with panko breadcrumbs for a satisfying crunch. Inside each bite is a savory filling of silken tofu, finely chopped wakame, and a hint of ginger, creating a soft, umami-rich center. Served on a bamboo plate with a side of sweet miso dip and a tiny pickled radish garnish. Packaged in a miniature takeout box with a bunny logo.'
    },
    {
        id: 'golden-custard-taiyaki',
        name: 'Golden Custard Taiyaki',
        rabbitId: 'taiyaki',
        price: 6.00,
        icon: '🐟',
        shortDescription: 'Fish-shaped pastry with golden vanilla custard and honey glaze',
        fullDescription: 'A warm, freshly baked fish-shaped pastry with a crisp outer shell and tender, slightly chewy interior, filled with a rich, golden vanilla custard that oozes gently when bitten. Lightly glazed with honey and dusted with edible gold flakes, with delicate cocoa drizzle to resemble gentle whiskers on the fish\'s face. Served on a ceramic fish-shaped plate with a side of matcha-dusted sugar for dipping.'
    },
    {
        id: 'black-sesame-daifuku',
        name: 'Black Sesame Daifuku',
        rabbitId: 'sesami',
        price: 5.50,
        icon: '⚫',
        shortDescription: 'Chewy mochi pillows with luxurious black sesame paste',
        fullDescription: 'Soft, chewy mochi pillows filled with a luxurious black sesame paste center, lightly sweetened and rolled in toasted soybean flour (kinako). Each daifuku is stamped with a tiny rabbit footprint in edible gold. The contrast of earthy sesame and sweet mochi makes this treat both traditional and whimsical.'
    },
    {
        id: 'frost-dusted-green-tea-mochi',
        name: 'Frost-Dusted Green Tea Mochi',
        rabbitId: 'matcha',
        price: 6.00,
        icon: '🍡',
        shortDescription: 'Translucent mochi with matcha-white chocolate ganache',
        fullDescription: 'Soft, translucent mochi filled with a smooth matcha-white chocolate ganache, rolled in finely crushed freeze-dried coconut and matcha powder to mimic a frosted appearance. Each piece is shaped like a tiny snowball or rabbit paw and served on a bed of crushed ice for visual charm. Earthy, subtly sweet, and refreshingly light.'
    },
    {
        id: 'mini-adzuki-mochi-bites',
        name: 'Mini Adzuki Mochi Bites',
        rabbitId: 'adzuki',
        price: 5.00,
        icon: '💎',
        shortDescription: 'Jewel-like mochi spheres with smooth adzuki filling',
        fullDescription: 'Tiny, jewel-like mochi spheres filled with smooth adzuki paste, dusted in powdered sugar, and each stamped with a tiny rabbit insignia in edible red. Served in a lacquered box with a cherry blossom accent. These bite-sized treats match Adzuki\'s petite stature and vibrant personality—sweet, elegant, and utterly irresistible.'
    },
    {
        id: 'peach-matcha-mochi-parfait',
        name: 'Peach-Matcha Mochi Parfait',
        rabbitId: 'momo',
        price: 8.00,
        icon: '🍑',
        shortDescription: 'Layered parfait with peach mochi, matcha cream, and fresh peach',
        fullDescription: 'Layered in a delicate glass cup: soft peach-flavored mochi cubes, matcha whipped cream, crumbled chocolate-nut crumble (echoing her brown coat), and fresh peach slices. Finished with a gold leaf sprinkle and a tiny rabbit-shaped peach candy on top. Inspired by Momotaro, the Peach Boy, this parfait is sweet, balanced, and celebratory.'
    },
    {
        id: 'nano-mochi-trio',
        name: 'Nano Mochi Trio',
        rabbitId: 'mochi',
        price: 6.50,
        icon: '🔮',
        shortDescription: 'Three impossibly small mochi bites with premium fillings',
        fullDescription: 'Three impossibly small mochi bites—each no bigger than a blueberry—filled with white chocolate-hazelnut, black sesame, and strawberry compote. Dusted with matcha powder and served on a porcelain leaf. Inspired by her name and petite frame, these treats are light, playful, and just right for a curious, intelligent rabbit with big tastes in tiny packages.'
    },
    {
        id: 'sakura-matcha-lion-puffs',
        name: 'Sakura-Matcha Lion Puffs',
        rabbitId: 'sakura',
        price: 7.00,
        icon: '🦁',
        shortDescription: 'Lion-head pastries with sakura-white chocolate ganache',
        fullDescription: 'Mini bunny-sized pastries shaped like lion heads, with fluffy matcha-infused dough and a soft filling of sakura-white chocolate ganache. Dusted with pink and white powdered sugar to mimic falling blossoms, and adorned with a tiny red candy dot for the nose. These adorable, melt-in-your-mouth treats celebrate both her name and her majestic mane.'
    },
    {
        id: 'snowball-puffs',
        name: 'Snowball Puffs',
        rabbitId: 'boba',
        price: 5.50,
        icon: '⚪',
        shortDescription: 'White chocolate-filled pastries with black sesame eyes',
        fullDescription: 'Tiny, pillowy white chocolate-filled pastries dusted in powdered sugar, shaped like Boba\'s face with a single black sesame seed for each eye to mirror her iconic look. Served on a mini mirror tray to reflect their brilliance, these melt-in-your-mouth treats are as delightful to look at as they are to eat.'
    },
    {
        id: 'cinnamon-sugar-puff-bites',
        name: 'Cinnamon-Sugar Puff Bites',
        rabbitId: 'chai',
        price: 5.00,
        icon: '🥐',
        shortDescription: 'Soft baked puffs with cinnamon sugar and vanilla custard',
        fullDescription: 'Tiny, soft baked puffs dusted in cinnamon sugar, with a fluffy interior that melts like her plush coat. Each bite is shaped like a curled paw and filled with a warm vanilla custard that oozes gently when pressed—just like Chai\'s sweet, open-hearted personality. Served warm in a mini wicker basket.'
    },
    {
        id: 'mini-mochi-anpan-bites',
        name: 'Mini Mochi Anpan Bites',
        rabbitId: 'anpan',
        price: 5.50,
        icon: '🐰',
        shortDescription: 'Fluffy steamed buns shaped like bunny heads with red bean filling',
        fullDescription: 'Tiny, fluffy steamed buns shaped like bunny heads, each filled with a soft, sweet red bean (anko) center and topped with a delicate mochi-glaze that gives them a gentle sheen. One bite-sized bun features a chocolate drizzle to resemble Anpan\'s sweet face, while others are dusted with matcha powder or black sesame to mimic rabbit markings. Served in a miniature bamboo steamer with a cherry blossom pick.'
    },
    {
        id: 'honey-marigold-shortbread',
        name: 'Honey Marigold Shortbread',
        rabbitId: 'ocha',
        price: 5.50,
        icon: '🌼',
        shortDescription: 'Golden shortbread cookies with honey glaze and edible marigold',
        fullDescription: 'Buttery golden shortbread cookies infused with raw honey and a touch of earl grey tea, baked until perfectly golden. Each cookie is glazed with a light honey finish and topped with a single edible marigold petal that mirrors Ocha\'s radiant golden fur. Served on a ceramic plate with a small pot of honey for extra drizzling.'
    }
];

// ============================================
// CLASSIC DRINKS (Non-signature menu items)
// ============================================

const CLASSIC_DRINKS = [
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
    }
];

const YOGURT_DRINKS = [
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
    }
];

const SEASONAL_DRINKS = [
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

// Combined drinks array for menu display
const DRINKS = [
    ...SIGNATURE_DRINKS.map(d => ({
        ...d,
        category: 'signature',
        description: d.shortDescription
    })),
    ...CLASSIC_DRINKS,
    ...YOGURT_DRINKS,
    ...SEASONAL_DRINKS
];

// ============================================
// REGULAR SNACKS (Non-signature)
// ============================================

const REGULAR_SNACKS = [
    {
        id: 'mochi-trio',
        name: 'Mochi Trio',
        description: 'Three handmade mochi: strawberry, matcha, and taro',
        price: 5.50,
        category: 'sweets',
        icon: '🍡'
    },
    {
        id: 'dorayaki',
        name: 'Dorayaki',
        description: 'Fluffy pancakes sandwiched with sweet red bean',
        price: 4.00,
        category: 'sweets',
        icon: '🥞'
    },
    {
        id: 'dango',
        name: 'Dango Skewer',
        description: 'Chewy rice dumplings with sweet soy glaze',
        price: 3.50,
        category: 'sweets',
        icon: '🍡'
    },
    {
        id: 'onigiri',
        name: 'Onigiri Set',
        description: 'Two rice balls with salmon and umeboshi filling',
        price: 5.00,
        category: 'savory',
        icon: '🍙'
    },
    {
        id: 'takoyaki',
        name: 'Takoyaki',
        description: 'Six crispy octopus balls with sauce and bonito',
        price: 6.50,
        category: 'savory',
        icon: '🐙'
    },
    {
        id: 'edamame',
        name: 'Edamame',
        description: 'Salted steamed soybeans, a healthy snack',
        price: 3.00,
        category: 'savory',
        icon: '🫛'
    },
    {
        id: 'karaage',
        name: 'Karaage Bites',
        description: 'Crispy Japanese fried chicken with spicy mayo',
        price: 7.00,
        category: 'savory',
        icon: '🍗'
    }
];

// Combined snacks array
const SNACKS = [
    ...SIGNATURE_SNACKS.map(s => ({
        ...s,
        category: 'signature',
        description: s.shortDescription
    })),
    ...REGULAR_SNACKS
];

// ============================================
// BUN TREATS & TOYS (Purchasable for buns)
// ============================================

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

// ============================================
// FRIENDSHIP & REWARDS SYSTEM
// ============================================

const FRIENDSHIP_LEVELS = [
    { level: 0, name: 'Stranger', minPoints: 0, icon: '❓', perk: 'The bun eyes you suspiciously' },
    { level: 1, name: 'Acquaintance', minPoints: 10, icon: '👋', perk: 'The bun tolerates your presence' },
    { level: 2, name: 'Friend', minPoints: 25, icon: '🤝', perk: 'The bun approaches you sometimes' },
    { level: 3, name: 'Good Friend', minPoints: 50, icon: '💕', perk: 'The bun seeks you out for pets' },
    { level: 4, name: 'Best Friend', minPoints: 85, icon: '💖', perk: 'The bun binkies when they see you' },
    { level: 5, name: 'Soulmate', minPoints: 130, icon: '💝', perk: 'The bun has claimed you as their human' },
    { level: 6, name: 'True Soulmate', minPoints: 200, icon: '👑', perk: 'An unbreakable bond across lifetimes' }
];

const RARITY_CONFIG = {
    'common': { label: 'Common', color: '#8B9A82', bgColor: '#E8EDE5' },
    'rare': { label: 'Rare', color: '#5B7DB1', bgColor: '#E5EBF4' },
    'very-rare': { label: 'Very Rare', color: '#9B59B6', bgColor: '#F3E5F5' },
    'legendary': { label: 'Legendary', color: '#D4AF37', bgColor: '#FFF8E7' }
};

// ============================================
// MEGUMI CREDITS SYSTEM
// Daily allowance for ordering and visiting
// ============================================

const MEGUMI_CREDITS = {
    // Base daily allowance
    baseCredits: 5,

    // Bonus credits per friendship level reached with ANY bun
    friendshipBonuses: {
        'Acquaintance': 0,  // Level 1
        'Friend': 1,        // Level 2
        'Good Friend': 1,   // Level 3
        'Best Friend': 2,   // Level 4
        'Soulmate': 2,      // Level 5
        'True Soulmate': 3  // Level 6
    },

    // Credit costs
    costs: {
        drink: 1,           // Per drink ordered
        snack: 1,           // Per snack ordered
        visit15: 2,         // 15-minute visit
        visit30: 3,         // 30-minute visit
        visit60: 5          // 60-minute visit
    },

    // Max credits possible (with all friendship bonuses)
    maxCredits: 15
};

// Visit duration options with pricing
const VISIT_OPTIONS = [
    { id: 'visit15', duration: 15, label: '15 minutes', price: 8.00, credits: 2, friendshipPoints: 5 },
    { id: 'visit30', duration: 30, label: '30 minutes', price: 14.00, credits: 3, friendshipPoints: 12 },
    { id: 'visit60', duration: 60, label: '1 hour', price: 24.00, credits: 5, friendshipPoints: 25 }
];

// Helper to get visit option by duration
function getVisitOption(duration) {
    return VISIT_OPTIONS.find(v => v.duration === duration) || VISIT_OPTIONS[0];
}

// ============================================
// REWARDS & SHOP
// ============================================

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
        description: 'Cozy hoodie with bunny design on back'
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
        id: 'plush-bun',
        name: 'Collectible Bun Plushie',
        icon: '🐰',
        price: 34.99,
        stampsRequired: 30,
        description: 'Limited edition bun plush of your choice'
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

// ============================================
// DAILY MESSAGES
// ============================================

const DAILY_MESSAGES = [
    { rabbit: 'taro', message: "Have you ever considered... the meaning of fluff?", emoji: '🐇' },
    { rabbit: 'taro', message: "*stares wistfully at the horizon* Life is but a dream...", emoji: '🐇' },
    { rabbit: 'panko', message: "*adjusts fur* I woke up like this. Flawless.", emoji: '🐇' },
    { rabbit: 'panko', message: "Please admire me from a respectful distance.", emoji: '🐇' },
    { rabbit: 'taiyaki', message: "I expect tribute. Premium hay will suffice.", emoji: '🐰' },
    { rabbit: 'taiyaki', message: "*knocks your drink over elegantly* Oops.", emoji: '🐰' },
    { rabbit: 'sesami', message: "Yes, I AM the main character. And?", emoji: '🐰' },
    { rabbit: 'sesami', message: "*poses aggressively* Get my good side.", emoji: '🐰' },
    { rabbit: 'matcha', message: "*breathes deeply* Inner peace. Namaste.", emoji: '🐇' },
    { rabbit: 'matcha', message: "Let's just... exist together. Quietly.", emoji: '🐇' },
    { rabbit: 'adzuki', message: "I may be small but I WILL be respected.", emoji: '🐰' },
    { rabbit: 'adzuki', message: "*thumps foot imperiously* Bow before me.", emoji: '🐰' },
    { rabbit: 'momo', message: "Balance in all things. Except treats. More treats.", emoji: '🐇' },
    { rabbit: 'momo', message: "*radiates harmonious energy*", emoji: '🐇' },
    { rabbit: 'mochi', message: "I figured out how to open the treat cabinet again.", emoji: '🐰' },
    { rabbit: 'mochi', message: "*vibrates with chaotic energy* CAN'T STOP WON'T STOP", emoji: '🐰' },
    { rabbit: 'sakura', message: "*flips mane dramatically* I'm ready for my closeup.", emoji: '🐇' },
    { rabbit: 'sakura', message: "Every entrance is a grand entrance when you're me.", emoji: '🐇' },
    { rabbit: 'boba', message: "*stares intensely* I see you. I see EVERYTHING.", emoji: '🐰' },
    { rabbit: 'boba', message: "These eyes were made for judging. And judge they shall.", emoji: '🐰' },
    { rabbit: 'chai', message: "Come here. You look like you need a cuddle.", emoji: '🐇' },
    { rabbit: 'chai', message: "*radiates warm, cozy energy* Everything is okay now.", emoji: '🐇' },
    { rabbit: 'anpan', message: "*falls asleep mid-conversation* zzz...", emoji: '🐰' },
    { rabbit: 'anpan', message: "Hi friend... *yawns* ...nap time?", emoji: '🐰' },
    { rabbit: 'ocha', message: "*glows softly in a sunbeam* This is my happy place.", emoji: '🐇' },
    { rabbit: 'ocha', message: "Let me warm your heart like a cup of tea.", emoji: '🐇' }
];

// ============================================
// UTILITY CONSTANTS
// ============================================

const STAMP_ICONS = ['🌸', '🍡', '🧋', '🐰', '⭐', '💮', '🎀', '🌷', '✨', '💫'];

// Visit duration pricing
const VISIT_PRICING = {
    15: { price: 10, label: '15 min', friendshipPoints: 5 },
    30: { price: 18, label: '30 min', friendshipPoints: 12 },
    60: { price: 30, label: '1 hour', friendshipPoints: 25 }
};

// ============================================
// ACHIEVEMENTS / STICKERS
// ============================================

const ACHIEVEMENT_CATEGORIES = {
    welcome: { name: 'Welcome', icon: '🌸', color: '#FFB7C5' },
    friendship: { name: 'Friendship', icon: '💕', color: '#FF69B4' },
    collector: { name: 'Collector', icon: '🧋', color: '#D4A574' },
    explorer: { name: 'Explorer', icon: '🗺️', color: '#87CEEB' },
    loyalty: { name: 'Loyalty', icon: '⭐', color: '#FFD700' },
    special: { name: 'Special', icon: '✨', color: '#E6E6FA' }
};

const ACHIEVEMENTS = [
    // Welcome achievements
    {
        id: 'first_visit',
        name: 'Welcome to the Warren!',
        description: 'Visit the café for the first time',
        sticker: '🏠',
        category: 'welcome',
        condition: { type: 'first_visit' },
        reward: { stamps: 3 }
    },
    {
        id: 'first_drink',
        name: 'First Sip',
        description: 'Order your first drink',
        sticker: '🧋',
        category: 'welcome',
        condition: { type: 'drinks_ordered', count: 1 },
        reward: { stamps: 2 }
    },
    {
        id: 'first_bun_time',
        name: 'Bun Buddy',
        description: 'Book your first session with a bun',
        sticker: '🐰',
        category: 'welcome',
        condition: { type: 'sessions_booked', count: 1 },
        reward: { stamps: 3 }
    },
    {
        id: 'first_snack',
        name: 'Treat Time',
        description: 'Order your first snack',
        sticker: '🍡',
        category: 'welcome',
        condition: { type: 'snacks_ordered', count: 1 },
        reward: { stamps: 2 }
    },

    // Collector achievements - Drinks
    {
        id: 'drink_enthusiast',
        name: 'Drink Enthusiast',
        description: 'Order 5 drinks',
        sticker: '🍵',
        category: 'collector',
        condition: { type: 'drinks_ordered', count: 5 },
        reward: { stamps: 5 }
    },
    {
        id: 'drink_connoisseur',
        name: 'Drink Connoisseur',
        description: 'Order 15 drinks',
        sticker: '☕',
        category: 'collector',
        condition: { type: 'drinks_ordered', count: 15 },
        reward: { stamps: 10 }
    },
    {
        id: 'drink_master',
        name: 'Master of Tea',
        description: 'Order 50 drinks',
        sticker: '🏆',
        category: 'collector',
        condition: { type: 'drinks_ordered', count: 50 },
        reward: { stamps: 25 }
    },

    // Collector achievements - Snacks
    {
        id: 'snack_lover',
        name: 'Snack Lover',
        description: 'Order 5 snacks',
        sticker: '🍪',
        category: 'collector',
        condition: { type: 'snacks_ordered', count: 5 },
        reward: { stamps: 5 }
    },
    {
        id: 'snack_aficionado',
        name: 'Snack Aficionado',
        description: 'Order 15 snacks',
        sticker: '🥮',
        category: 'collector',
        condition: { type: 'snacks_ordered', count: 15 },
        reward: { stamps: 10 }
    },

    // Friendship achievements
    {
        id: 'made_a_friend',
        name: 'Made a Friend',
        description: 'Reach "Friend" status with any bun',
        sticker: '🤝',
        category: 'friendship',
        condition: { type: 'friendship_level', level: 'Friend' },
        reward: { stamps: 5 }
    },
    {
        id: 'best_friends',
        name: 'Best Friends Forever',
        description: 'Reach "Best Friend" status with any bun',
        sticker: '💖',
        category: 'friendship',
        condition: { type: 'friendship_level', level: 'Best Friend' },
        reward: { stamps: 15 }
    },
    {
        id: 'soulmate',
        name: 'Soulmate Bond',
        description: 'Reach "Soulmate" status with any bun',
        sticker: '💫',
        category: 'friendship',
        condition: { type: 'friendship_level', level: 'Soulmate' },
        reward: { stamps: 40 }
    },
    {
        id: 'true_soulmate',
        name: 'True Soulmate',
        description: 'Reach "True Soulmate" status with any bun',
        sticker: '👑',
        category: 'friendship',
        condition: { type: 'friendship_level', level: 'True Soulmate' },
        reward: { stamps: 60 }
    },
    {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Reach "Friend" status with 5 different buns',
        sticker: '🦋',
        category: 'friendship',
        condition: { type: 'friends_count', count: 5, level: 'Friend' },
        reward: { stamps: 15 }
    },
    {
        id: 'everyones_friend',
        name: "Everyone's Friend",
        description: 'Reach "Friend" status with all 13 buns',
        sticker: '🌈',
        category: 'friendship',
        condition: { type: 'friends_count', count: 13, level: 'Friend' },
        reward: { stamps: 30 }
    },
    {
        id: 'best_friend_trio',
        name: 'Inner Circle',
        description: 'Reach "Best Friend" status with 3 different buns',
        sticker: '💕',
        category: 'friendship',
        condition: { type: 'friends_count', count: 3, level: 'Best Friend' },
        reward: { stamps: 25 }
    },
    {
        id: 'soulmate_trio',
        name: 'Soulmate Collection',
        description: 'Reach "Soulmate" status with 3 different buns',
        sticker: '💝',
        category: 'friendship',
        condition: { type: 'friends_count', count: 3, level: 'Soulmate' },
        reward: { stamps: 50 }
    },

    // Explorer achievements
    {
        id: 'signature_seeker',
        name: 'Signature Seeker',
        description: 'Try a signature drink',
        sticker: '🎯',
        category: 'explorer',
        condition: { type: 'signature_drinks_tried', count: 1 },
        reward: { stamps: 3 }
    },
    {
        id: 'signature_collector',
        name: 'Signature Collector',
        description: 'Try 5 different signature drinks',
        sticker: '📚',
        category: 'explorer',
        condition: { type: 'signature_drinks_tried', count: 5 },
        reward: { stamps: 15 }
    },
    {
        id: 'signature_master',
        name: 'Signature Master',
        description: 'Try all 13 signature drinks',
        sticker: '👑',
        category: 'explorer',
        condition: { type: 'signature_drinks_tried', count: 13 },
        reward: { stamps: 40 }
    },
    {
        id: 'meet_the_buns',
        name: 'Meet the Buns',
        description: 'Book sessions with 5 different buns',
        sticker: '🐾',
        category: 'explorer',
        condition: { type: 'unique_buns_visited', count: 5 },
        reward: { stamps: 10 }
    },
    {
        id: 'warren_explorer',
        name: 'Warren Explorer',
        description: 'Book sessions with all 13 buns',
        sticker: '🗺️',
        category: 'explorer',
        condition: { type: 'unique_buns_visited', count: 13 },
        reward: { stamps: 35 }
    },

    // Loyalty achievements
    {
        id: 'regular',
        name: 'Regular',
        description: 'Book 5 sessions',
        sticker: '🎫',
        category: 'loyalty',
        condition: { type: 'sessions_booked', count: 5 },
        reward: { stamps: 8 }
    },
    {
        id: 'devoted_visitor',
        name: 'Devoted Visitor',
        description: 'Book 15 sessions',
        sticker: '🎖️',
        category: 'loyalty',
        condition: { type: 'sessions_booked', count: 15 },
        reward: { stamps: 20 }
    },
    {
        id: 'true_believer',
        name: 'True Believer',
        description: 'Book 50 sessions',
        sticker: '🌟',
        category: 'loyalty',
        condition: { type: 'sessions_booked', count: 50 },
        reward: { stamps: 50 }
    },
    {
        id: 'stamp_collector',
        name: 'Stamp Collector',
        description: 'Earn 50 stamps total',
        sticker: '💮',
        category: 'loyalty',
        condition: { type: 'stamps_earned', count: 50 },
        reward: { stamps: 5 }
    },
    {
        id: 'stamp_hoarder',
        name: 'Stamp Hoarder',
        description: 'Earn 200 stamps total',
        sticker: '🏅',
        category: 'loyalty',
        condition: { type: 'stamps_earned', count: 200 },
        reward: { stamps: 15 }
    },
    {
        id: 'big_spender',
        name: 'Big Spender',
        description: 'Spend $100 total at the café',
        sticker: '💰',
        category: 'loyalty',
        condition: { type: 'total_spent', amount: 100 },
        reward: { stamps: 10 }
    },
    {
        id: 'vip',
        name: 'VIP Status',
        description: 'Spend $500 total at the café',
        sticker: '💎',
        category: 'loyalty',
        condition: { type: 'total_spent', amount: 500 },
        reward: { stamps: 30 }
    },

    // Special achievements
    {
        id: 'legendary_find',
        name: 'Legendary Find',
        description: 'Book a session with a Legendary bun',
        sticker: '⭐',
        category: 'special',
        condition: { type: 'rarity_visited', rarity: 'legendary' },
        reward: { stamps: 10 }
    },
    {
        id: 'rare_encounter',
        name: 'Rare Encounter',
        description: 'Book sessions with all Rare buns',
        sticker: '💜',
        category: 'special',
        condition: { type: 'all_rarity_visited', rarity: 'rare' },
        reward: { stamps: 20 }
    },
    {
        id: 'complete_collection',
        name: 'Complete Collection',
        description: 'Unlock 20 achievements',
        sticker: '🎨',
        category: 'special',
        condition: { type: 'achievements_unlocked', count: 20 },
        reward: { stamps: 25 }
    },
    {
        id: 'treat_giver',
        name: 'Treat Giver',
        description: 'Give 10 treats to buns',
        sticker: '🥕',
        category: 'special',
        condition: { type: 'treats_given', count: 10 },
        reward: { stamps: 8 }
    },
    {
        id: 'toy_master',
        name: 'Toy Master',
        description: 'Play with 10 toys with buns',
        sticker: '🎾',
        category: 'special',
        condition: { type: 'toys_played', count: 10 },
        reward: { stamps: 8 }
    }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getRabbitById(id) {
    return RABBITS.find(r => r.id === id);
}

function getDrinkById(id) {
    return DRINKS.find(d => d.id === id);
}

function getSnackById(id) {
    return SNACKS.find(s => s.id === id);
}

function getSignatureDrinkForRabbit(rabbitId) {
    return SIGNATURE_DRINKS.find(d => d.rabbitId === rabbitId);
}

function getSignatureSnackForRabbit(rabbitId) {
    return SIGNATURE_SNACKS.find(s => s.rabbitId === rabbitId);
}

function getRabbitByDrink(drinkId) {
    const drink = SIGNATURE_DRINKS.find(d => d.id === drinkId);
    return drink ? getRabbitById(drink.rabbitId) : null;
}

function getRabbitBySnack(snackId) {
    const snack = SIGNATURE_SNACKS.find(s => s.id === snackId);
    return snack ? getRabbitById(snack.rabbitId) : null;
}

function getFriendshipLevel(points) {
    for (let i = FRIENDSHIP_LEVELS.length - 1; i >= 0; i--) {
        if (points >= FRIENDSHIP_LEVELS[i].minPoints) {
            return FRIENDSHIP_LEVELS[i];
        }
    }
    return FRIENDSHIP_LEVELS[0];
}

function getRarityConfig(rarity) {
    return RARITY_CONFIG[rarity] || RARITY_CONFIG['common'];
}
