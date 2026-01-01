import { Chakra } from "@/types/chakras/Chakra"
import { Content } from "@/types/chakras/Content"

export const chakraContent: Record<Chakra, Content> = {
  [Chakra.ROOT]: {
    overview:
      "Located at the base of the spine, the vibrant crimson red Root Chakra is your foundation. It's about survival, security, and primal energy; your connection to the physical world. 'I Am' is the seed of existence. Reconnect to your Earth mother and feel your roots. When your Root Chakra is balanced and energized, you feel secure, stable, and connected to your true essence. You trust in the abundance of the universe and your ability to co-create a life filled with purpose and joy.",
    sanskrit:
      "In ancient vedic teachings, the Muladhara means 'root support'. The symbolism of the 4 petals represent the four directions for grounding, North, South, East, and West, bringing stability and connection to the Earth.",
    soulSchool:
      "For true awareness of self, we remember that the divine concept for the Root Chakra is the Universal Law of Generation. At the base of your spine is a cauldron of fire, your power plant to create the energy that gives you the ability to create. To generate is not to gain; it means to create something. So at the base of your spine, you have an energy center that is pulling in energy from the cosmic planes and using that to create your life here on Earth. To truly activate your inner power plant, you need to ground yourself in nature, to reconnect with the Earth's energy, and to remember that you are a part of this living, breathing planet. Feel your feet on the ground, your body supported by the Earth's embrace. Breathe in the energy of the trees, the mountains, the oceans. As you ground yourself, you tap into the limitless power of creation, the energy that flows through you and empowers you to manifest your desires.",
    dailyActivity:
      'Walking meditation: Step slowly and mindfully in nature, saying "I am" with one foot and "Earth" with the other.',
    wordsOfWisdom:
      '"In the stillness of the Earth, find your grounding, your sanctuary, your belonging. Remember, you are home."',
    affirmationText: '"I am safe. I am secure. I am grounded."',
    elements: {
      background: require("@/assets/images/elementsroot.png"),
      sanskrit: "Muladhara",
      body: "Adrenal glands, base of spine, legs, feet, bones",
      stones: "Red jasper, black tourmaline, hematite, garnet",
      smells: "Cedarwood, patchouli, myrrh",
      colors: "Red, black, brown",
      foods: "Root vegetables, protein-rich foods",
      sacredgeometry:
        "Downward-pointing triangle: Symbolizes the Earth element and connection to the physical world",
      principle: "Stability and Security",
    },
    pills: {
      frequency: {
        pillTitle: "396 Hz",
        hertz: "396 Hz",
        description:
          "The 396 Hz frequency, known as the 'Liberation Frequency,' can help you find your way back to a place of safety and stability within, allowing you to feel grounded and supported as you navigate life's challenges.\n\nListen to this pure tone when you need to release fear and guilt, and any shadows related to your survival.",
      },
      identityStatement: {
        pillTitle: '"I am"',
        title: '"I Am"',
        description:
          'These two simple words, "I Am," hold immense power. They are the seed of your existence, the foundation of your being. In ancient traditions, the phrase "I Am" was considered sacred, a way to connect to the divine presence within. When you say "I Am," you are declaring your right to exist, to take up space, to be fully present in this world. For many of us, feeling grounded and secure can be a challenge. Trauma, anxiety, and disconnection from our bodies can leave us feeling adrift. "I Am" reminds us that we are rooted in the Earth, our home, our source of strength and stability. By grounding our energy, we release fear and reclaim our inherent power.',
      },
      seedMantra: {
        pillTitle: "Lam",
        title: "Lam",
        description:
          'Chant this sound 13 times in a rhythmic loop to activate and balance your Root Chakra. This beautiful sound helps to root your energy deep into the Earth, releasing any stagnant energy that may be blocking you. It\'s like sinking your toes into the soft soil, feeling the strength and stability of our Earth Mother rising up to meet you. If you\'re feeling anxious or insecure, chanting "Lam" can help you reconnect to your foundation and remember the powerful truth of "I Am."',
      },
    },
    chakraHeaderImage: require("@/assets/images/muladhara.png"),
    header: {
      headerBackground: require("@/assets/images/1header.png"),
      chakraImageSizePx: 110,
      textLine1: "Day 1",
      textLine2: "Root Chakra",
      textLine3: 'Muladhara - "I am"',
    },
    audioIntro: {
      title: "Good Morning Root!",
      author: "Mother JJ",
      durationMs: 949000, // 15:49
      source: require("@/assets/audio/root-erin-1.mp3"),
    },
    audioOutro: {
      title: "Connected To The Earth",
      author: "Ethan",
      durationMs: 20400,
      source: require("@/assets/audio/root-ethan-1.mp3"),
    },
    locationImage: require("@/assets/images/rootlocation.png"),
    goodbye: {
      content: "My Root Is Awake",
      chakraImage: require("@/assets/images/root.png"),
    },
    integration: "Today, we bring our authentic self into the outward world",
    yoga: {
      chakraDay: "Root Day",
      pose: "Mountain Pose (Tadasana)",
      poseDescription:
        "This is the perfect starting place for Day 1. This pose helps you find your standing center, it can be done anywhere at any time and it activates your root while seeking total balance in the rest of your body.",
    },
    soundBath: {
      title: "Root Chakra - 396 Hz",
      subtitle: "muladhara",
      body: "Listen to this frequency when you need to release fear and guilt, and any shadows related to your survival of needing more. The 396 Hz frequency, known as the “Liberation Frequency,” can help you find your way back to a place of safety and stability within, allowing you to feel grounded and supported as you navigate life's challenges.",
      soundBowlAudio: require("@/assets/audio/day1singingbowl.mp3"),
      tuningForkAudio: require("@/assets/audio/day1tuningfork.mp3"),
    },
    headtoheart: {
      title: "THE SEVENTH LAW",
      subtitle: '"GENERATION"',
      description: [
        {
          text: "For true awareness of self, we remember the ancestral knowledge for the Root Chakra is ",
        },
        { text: "The Divine Law of Generation", className: "font-bold" },
        {
          text: ". At the base of your spine is a cauldron of fire, your power plant of energy. To generate is not to gain; it means to create something. This chakra gives you the power to create life on Earth.",
        },
      ],
      audio: {
        title: "THE POWER OF CREATION",
        author: "ERIN",
        duration: 0,
        source: 0,
        authorColor: "#FFDEBA",
      },
      dailyActivity: [
        {
          text: "Switching from head to heart is all about detaching from the mind and sending your focus to your sensory body that connects through energy. Start to feel the world around you and how you are connected to it.",
        },
        {
          title: "Walking Meditation:",
          text: "This is a powerful and simple activity you can do almost anywhere. Even a simple walk can transform from a routine to a ritual.",
        },
        {
          text: 'Step slowly and mindfully, saying internally, "I am" as one foot touches the ground, and "Gaia" or "Earth" when the other foot touches the ground. Try to repeat this until there are no other thoughts but simply your awareness of each moment your energy connects to the ground. Feel your way through this. "I am, Earth."',
        },
      ],
    },
  },
  [Chakra.SACRAL]: {
    overview:
      'Located below the navel, the radiant terracotta orange Sacral Chakra governs creativity, passion, pleasure, and healthy boundaries. This is where your inner identity is born from your most passionate self. It houses the creation of our inner self and our sensual expression. "I Feel" is the essence of experiencing life fully. Embrace your emotions, honor your sensuality, and allow your creativity to flow by spending the entire day trying to feel your way through life.',
    sanskrit:
      'Svadhisthana translates to "one\'s own abode" or "sweetness." Its 6 petals symbolize the 5 senses plus the mind, representing the integration of sensory experiences and emotional expression.',
    soulSchool:
      'For true awareness of self, we remember that the divine concept for the Sacral Chakra is the Universal Law of Polarity. This law reminds us that everything in the universe exists in duality, with opposing forces complementing and balancing each other. Your Sacral Chakra is the center of this dance between polarities, where you learn to embrace both the light and shadow aspects of yourself, the masculine and feminine energies within. It\'s about finding harmony and balance in your emotional expression, honoring your sensuality, and allowing your creativity to flow freely. When you surrender to your most passionate self in your Sacral Chakra, you experience a deeper sense of joy, passion, and connection to life and those around you. You were born to feel, and this is where your emotional identity is born. "The wolf that wins is the wolf you feed." Live from the head or live from the heart?',
    dailyActivity:
      "Dance meditation: Put on your favorite music and allow your body to move freely, expressing your emotions and creativity through movement.",
    wordsOfWisdom:
      '"Embrace the dance of life, the ebb and flow of emotions, the light and shadow within. Ride the waves of your life, cultivate your joy, express your passion, and let your creativity burst from within."',
    affirmationText:
      "I embrace my creativity. I honor my emotions. I am joyful.",
    elements: {
      background: require("@/assets/images/elementssacral.png"),
      sanskrit: "Svadhisthana",
      body: "Ovaries/testes, lower abdomen, pelvis, kidneys, bladder",
      stones: "Carnelian, moonstone, orange calcite, sunstone",
      smells: "Ylang-ylang, sandalwood, jasmine",
      colors: "Orange, peach, coral",
      foods: "Fruits (especially oranges), nuts, seeds, chocolate",
      sacredgeometry:
        "Crescent moon: Symbolizes the connection to the lunar energy, emotions, and the subconscious",
      principle: "Creative Reproduction of Being",
    },
    pills: {
      frequency: {
        pillTitle: "417 Hz",
        hertz: "417 Hz",
        description:
          "417 Hz facilitates change and clears out destructive patterns from the past. This frequency supports you in releasing emotional blockages and embracing new possibilities.",
      },
      identityStatement: {
        pillTitle: '"I feel"',
        title: '"I Feel"',
        description:
          'The Sacral Chakra, your center of creativity, emotions, and sensuality, is about experiencing life fully and allowing your creative energy to flow freely. When you affirm "I Feel," you honor your emotional depth and give yourself permission to experience the full spectrum of human emotions. This can be challenging in a world that often tells us to suppress our feelings. By embracing your sensual self, you tap into a powerful source of energy and allow your authentic self to shine.',
      },
      seedMantra: {
        pillTitle: "Vam",
        title: "Vam",
        description:
          'Hum this sound in a quick, steady rhythm 33 times to activate and balance your Sacral Chakra. Chanting "Vam" is believed to enhance creativity, emotional balance, and fluidity.',
      },
    },
    chakraHeaderImage: require("@/assets/images/svadhisthana.png"),
    header: {
      headerBackground: require("@/assets/images/2header.png"),
      chakraImageSizePx: 100,
      textLine1: "Day 2",
      textLine2: "Sacral Chakra",
      textLine3: 'Svadhisthana - "I feel"',
    },
    audioIntro: {
      title: "Hello Sacral!",
      author: "Mother JJ",
      durationMs: 2189000, // 36:29
      source: require("@/assets/audio/root-erin-1.mp3"),
    },
    audioOutro: {
      title: "Connected To The Body",
      author: "Ethan",
      durationMs: 20400,
      source: require("@/assets/audio/root-ethan-1.mp3"),
    },
    locationImage: require("@/assets/images/sacrallocation.png"),
    goodbye: {
      content: "My Sacral Is Awake",
      chakraImage: require("@/assets/images/sacral.png"),
    },
    integration: "Today, we bring our authentic self into the outward world",
    yoga: {
      chakraDay: "Sacral Day",
      pose: "Crescent Moon Pose (Anjaneyasana)",
      poseDescription: "Open your hips and tap into your sensual flow.",
    },
    soundBath: {
      title: "Root Chakra - 396 Hz",
      subtitle: "muladhara",
      body: "Listen to this frequency when you need to release fear and guilt, and any shadows related to your survival of needing more. The 396 Hz frequency, known as the “Liberation Frequency,” can help you find your way back to a place of safety and stability within, allowing you to feel grounded and supported as you navigate life's challenges.",
      soundBowlAudio: require("@/assets/audio/day1singingbowl.mp3"),
      tuningForkAudio: require("@/assets/audio/day1tuningfork.mp3"),
    },
    headtoheart: {
      title: "THE SEVENTH LAW",
      subtitle: '"GENERATION"',
      description: [
        {
          text: "For true awareness of self, we remember the ancestral knowledge for the Root Chakra is ",
        },
        { text: "The Divine Law of Generation", className: "font-bold" },
        {
          text: ". At the base of your spine is a cauldron of fire, your power plant of energy. To generate is not to gain; it means to create something. This chakra gives you the power to create life on Earth.",
        },
      ],
      audio: {
        title: "THE POWER OF CREATION",
        author: "ERIN",
        duration: 0,
        source: 0,
        authorColor: "#FFDEBA",
      },
      dailyActivity: [
        {
          text: "Switching from head to heart is all about detaching from the mind and sending your focus to your sensory body that connects through energy. Start to feel the world around you and how you are connected to it.",
        },
        {
          title: "Walking Meditation:",
          text: "This is a powerful and simple activity you can do almost anywhere. Even a simple walk can transform from a routine to a ritual.",
        },
        {
          text: 'Step slowly and mindfully, saying internally, "I am" as one foot touches the ground, and "Gaia" or "Earth" when the other foot touches the ground. Try to repeat this until there are no other thoughts but simply your awareness of each moment your energy connects to the ground. Feel your way through this. "I am, Earth."',
        },
      ],
    },
  },
  [Chakra.SOLAR_PLEXUS]: {
    overview:
      'Located above the navel, the virbant sun yellow Solar Plexus Chakra is your expression center. Your divine Will. Your Manipura governs self-esteem, willpower, and personal identity. "I Do" is the essence of expressing your divine energy to manifesting your soul desires. Embrace your inner strength, set healthy boundaries, and step into your personal power. When your Solar Plexus is balanced, you feel confident, capable, and in control of your life.',
    sanskrit:
      'Manipura means "city of jewels." Its 10 petals symbolize the 10 vital forces (pranas) that govern various bodily functions and energies.',
    soulSchool:
      "For true awareness of self, we remember that the divine concept for the Solar Plexus Chakra is the Universal Law of Accountability, the Cause and Effect of your existence. Your Solar Plexus Chakra, located in the fiery core of your being, is your expression center. It's where your \"I Do\" energy ignites, fueling your actions and manifesting your desires. This is our divine power of Will. We can do things, but are we prepared to feel the shadows and the light of our choices so we can learn and expand? When we are truly honest with our deepest self, we express from the soul. When we are trapped in the identity in the mind, our authentic expression becomes stifled, replaced by anxiety, self-doubt, and a fear of being truly seen. To activate the power of your Solar Plexus, embrace the Law of Accountability. Take responsibility for your choices, your emotions, and your creations. Be honest with yourself, even when it's uncomfortable. This honesty is the key to unlocking your authentic expression and stepping into your true power. When your Solar Plexus is balanced, you feel confident, capable, and aligned with your purpose. You radiate authenticity and inspire others to do the same.",
    dailyActivity:
      "Power pose meditation: Stand tall with your feet hip-width apart, arms raised overhead, and palms facing forward. Feel the energy surge through your body as you embrace your power. Try to relax and meditate from here in a standing position for ten minutes to release old emotions and old storylines.",
    wordsOfWisdom:
      '"Ignite your inner fire, the spark of willpower that fuels your dreams. Embrace your strength, your courage, your ability to manifest your desires. You are the creator of your reality."',
    affirmationText: "I am strong. I am confident. I am powerful.",
    elements: {
      background: require("@/assets/images/elementssolar.png"),
      sanskrit: "Manipura",
      body: "Pancreas, upper abdomen, stomach, liver, gallbladder",
      stones: "Citrine, tiger's eye, yellow jasper, pyrite",
      smells: "Lemon, rosemary, peppermint",
      colors: "Yellow, gold, orange",
      foods: "Grains, yellow fruits and vegetables, ginger",
      sacredgeometry:
        "Inverted triangle: Symbolizes the ability to harness and direct energy.",
      principle: "Shaping of Being",
    },
    pills: {
      frequency: {
        pillTitle: "528 Hz",
        hertz: "528 Hz",
        description:
          "528 Hz brings transformation and miracles, repairing DNA and promoting healing. This frequency helps to restore balance and harmony within the body and mind. It is often used to clear negative energy and promote feelings of peace and well-being.",
      },
      identityStatement: {
        pillTitle: '"I do"',
        title: "I Do",
        description:
          'The Solar Plexus Chakra is your center of willpower, self-esteem, and personal power. When you affirm "I Do," you ignite your inner fire and claim your ability to create the life you desire. This can be challenging if you\'ve been taught to doubt yourself. By embracing your "I Do" energy, you tap into your inner strength and take charge of your destiny.',
      },
      seedMantra: {
        pillTitle: "Ram",
        title: "Ram",
        description:
          'Hum this sound 13 times in a rhythmic loop to activate and balance your Solar Plexus Chakra. "Ram" is like the sun\'s warm rays, filling you with confidence and willpower. It helps to burn away any self-doubt or insecurities that may be dimming your inner light. As you chant "Ram," feel your power rising, connecting you to the strength and vitality of the Earth.',
      },
    },
    chakraHeaderImage: require("@/assets/images/manipura.png"),
    header: {
      headerBackground: require("@/assets/images/3header.png"),
      chakraImageSizePx: 100,
      textLine1: "Day 3",
      textLine2: "Solar Plexus Chakra",
      textLine3: 'Manipura - "I do"',
    },
    audioIntro: {
      title: "Good Morning Sun!",
      author: "Mother JJ",
      durationMs: 2093000, // 34:53
      source: require("@/assets/audio/root-erin-1.mp3"),
    },
    audioOutro: {
      title: "Connected To The Sun",
      author: "Ethan",
      durationMs: 20400,
      source: require("@/assets/audio/root-ethan-1.mp3"),
    },
    locationImage: require("@/assets/images/solarlocation.png"),
    goodbye: {
      content: "My Solar Plexus Is Awake",
      chakraImage: require("@/assets/images/solar.png"),
    },
    integration: "Today, we bring our authentic self into the outward world",
    yoga: {
      chakraDay: "Solar Plexus Day",
      pose: "Boat Pose (Navasana)",
      poseDescription:
        "Build core strength and radiate your confident sunshine.",
    },
    soundBath: {
      title: "Root Chakra - 396 Hz",
      subtitle: "muladhara",
      body: "Listen to this frequency when you need to release fear and guilt, and any shadows related to your survival of needing more. The 396 Hz frequency, known as the “Liberation Frequency,” can help you find your way back to a place of safety and stability within, allowing you to feel grounded and supported as you navigate life's challenges.",
      soundBowlAudio: require("@/assets/audio/day1singingbowl.mp3"),
      tuningForkAudio: require("@/assets/audio/day1tuningfork.mp3"),
    },
    headtoheart: {
      title: "THE SEVENTH LAW",
      subtitle: '"GENERATION"',
      description: [
        {
          text: "For true awareness of self, we remember the ancestral knowledge for the Root Chakra is ",
        },
        { text: "The Divine Law of Generation", className: "font-bold" },
        {
          text: ". At the base of your spine is a cauldron of fire, your power plant of energy. To generate is not to gain; it means to create something. This chakra gives you the power to create life on Earth.",
        },
      ],
      audio: {
        title: "THE POWER OF CREATION",
        author: "ERIN",
        duration: 0,
        source: 0,
        authorColor: "#FFDEBA",
      },
      dailyActivity: [
        {
          text: "Switching from head to heart is all about detaching from the mind and sending your focus to your sensory body that connects through energy. Start to feel the world around you and how you are connected to it.",
        },
        {
          title: "Walking Meditation:",
          text: "This is a powerful and simple activity you can do almost anywhere. Even a simple walk can transform from a routine to a ritual.",
        },
        {
          text: 'Step slowly and mindfully, saying internally, "I am" as one foot touches the ground, and "Gaia" or "Earth" when the other foot touches the ground. Try to repeat this until there are no other thoughts but simply your awareness of each moment your energy connects to the ground. Feel your way through this. "I am, Earth."',
        },
      ],
    },
  },
  [Chakra.HEART]: {
    overview:
      'Located in the center of the chest, the emerald green Heart Chakra is the bridge between the lower and upper chakras. It governs love, compassion, empathy, and forgiveness. "I Love" is the essence of connecting with your heart and experiencing the world through kindness and understanding. Embrace unconditional love, forgive yourself and others, and cultivate deep connections. When your Heart Chakra is balanced, you radiate love, compassion, and inner peace.',
    sanskrit:
      'Anahata means "unstruck" or "unhurt," symbolizing the eternal and resilient nature of the heart. Its 12 petals represent the 12 divine qualities of the heart, such as love, joy, peace, patience, kindness, and generosity.',
    soulSchool:
      "For true awareness of self, we remember that the divine concept for the Heart Chakra is the Universal Law of Rhythm. This law reminds us that everything in the universe vibrates and moves in cyclical patterns. The Heart Chakra, with its connection to love and compassion, helps us navigate these rhythms with grace and resilience. By embracing the ebb and flow of life, we can find balance amidst the ups and downs, and cultivate a deep sense of inner peace. When our Heart Chakra is open and balanced, we can connect with the rhythm of our own hearts, the rhythm of the Earth, and the rhythm of the cosmos.",
    dailyActivity:
      "Loving-kindness meditation: Sit comfortably and visualize sending love and compassion to yourself, your loved ones, and all beings.",
    wordsOfWisdom:
      '"Open your heart to the boundless love that surrounds you. Embrace compassion, forgiveness, and gratitude. In the stillness of your heart, find your peace, your joy, your connection to all beings."',
    affirmationText: "I am love. I am compassionate. I am forgiving.",
    elements: {
      background: require("@/assets/images/elementsheart.png"),
      sanskrit: "Anahata",
      body: "Thymus gland, heart, lungs, circulatory system, arms, hands",
      stones: "Rose quartz, green aventurine, jade, emerald",
      smells: "Rose, lavender, geranium",
      colors: "Green, pink",
      foods: "Leafy greens, vegetables, green tea",
      sacredgeometry:
        "Circle with two intersecting triangles (Star of David): Represents the union of opposites, balance, and harmony between the physical and spiritual",
      principle: "Devotion, Self-Abandon",
    },
    pills: {
      frequency: {
        pillTitle: "639 Hz",
        hertz: "639 Hz",
        description:
          "639 Hz invites love, connection, and harmonious relationships. This frequency helps to open the heart, heal emotional wounds, and foster compassion.",
      },
      identityStatement: {
        pillTitle: '"I love"',
        title: "I Love",
        description:
          'The Heart Chakra, the center of love, compassion, and connection, is about opening your heart to give and receive love unconditionally. When you affirm "I Love," you express love for others and embrace self-love and acceptance. This can be challenging if you\'ve experienced heartbreak. By opening your heart, you heal old wounds and create space for deeper connection and joy.',
      },
      seedMantra: {
        pillTitle: "Yam",
        title: "Yam",
        description:
          'Hum this sound 13 times in a rhythmic loop to activate and balance your Heart Chakra. "Yam" is like a soft breeze, carrying the energy of love and compassion. It helps to open your heart and release any past hurts or resentments that may be blocking you from experiencing true connection. As you chant "Yam," feel the Earth\'s nurturing energy surrounding you, reminding you of the boundless love that resides within and all around.',
      },
    },
    chakraHeaderImage: require("@/assets/images/anahata.png"),
    header: {
      headerBackground: require("@/assets/images/4header.png"),
      chakraImageSizePx: 90,
      textLine1: "Day 4",
      textLine2: "Heart Chakra",
      textLine3: 'Anahata - "I love"',
    },
    audioIntro: {
      title: "Good Morning Heart!",
      author: "Mother JJ",
      durationMs: 2396000, // 39:56
      source: require("@/assets/audio/root-erin-1.mp3"),
    },
    audioOutro: {
      title: "Connected To The Earth",
      author: "Ethan",
      durationMs: 20400,
      source: require("@/assets/audio/root-ethan-1.mp3"),
    },
    locationImage: require("@/assets/images/heartlocation.png"),
    goodbye: {
      content: "My Heart Is Awake",
      chakraImage: require("@/assets/images/heart.png"),
    },
    integration: "Today, we bring our authentic self into the outward world",
    yoga: {
      chakraDay: "Heart Day",
      pose: "Yoga Nidra",
      poseDescription:
        "‘Yoga Nidra’ guides you through a powerful meditation practice to activate your heart chakra, fostering love, compassion, and inner peace within yourself that begins to radiate outwards. By combining breath work, visualization, and deep relaxation, you'll cultivate a more loving and open presence in your life.",
    },
    soundBath: {
      title: "Root Chakra - 396 Hz",
      subtitle: "muladhara",
      body: "Listen to this frequency when you need to release fear and guilt, and any shadows related to your survival of needing more. The 396 Hz frequency, known as the “Liberation Frequency,” can help you find your way back to a place of safety and stability within, allowing you to feel grounded and supported as you navigate life's challenges.",
      soundBowlAudio: require("@/assets/audio/day1singingbowl.mp3"),
      tuningForkAudio: require("@/assets/audio/day1tuningfork.mp3"),
    },
    headtoheart: {
      title: "THE SEVENTH LAW",
      subtitle: '"GENERATION"',
      description: [
        {
          text: "For true awareness of self, we remember the ancestral knowledge for the Root Chakra is ",
        },
        { text: "The Divine Law of Generation", className: "font-bold" },
        {
          text: ". At the base of your spine is a cauldron of fire, your power plant of energy. To generate is not to gain; it means to create something. This chakra gives you the power to create life on Earth.",
        },
      ],
      audio: {
        title: "THE POWER OF CREATION",
        author: "ERIN",
        duration: 0,
        source: 0,
        authorColor: "#FFDEBA",
      },
      dailyActivity: [
        {
          text: "Switching from head to heart is all about detaching from the mind and sending your focus to your sensory body that connects through energy. Start to feel the world around you and how you are connected to it.",
        },
        {
          title: "Walking Meditation:",
          text: "This is a powerful and simple activity you can do almost anywhere. Even a simple walk can transform from a routine to a ritual.",
        },
        {
          text: 'Step slowly and mindfully, saying internally, "I am" as one foot touches the ground, and "Gaia" or "Earth" when the other foot touches the ground. Try to repeat this until there are no other thoughts but simply your awareness of each moment your energy connects to the ground. Feel your way through this. "I am, Earth."',
        },
      ],
    },
  },
  [Chakra.THROAT]: {
    overview:
      'Located in the throat, the sky blue Throat Chakra is the center of expression and communication. It\'s the bridge between your heart and mind, allowing you to speak your truth with authenticity and clarity. "I Speak" is the essence of expressing your authentic voice, communicating your thoughts and feelings, and co-creating your reality through sound and vibration. Embrace honest communication, express your creativity, and speak from the heart. When your Throat Chakra is balanced, you communicate with clarity, confidence, and integrity.',
    sanskrit:
      'Vishuddha means "especially pure" or "purification," symbolizing the clear and truthful expression that flows through this chakra. Its 16 petals represent the 16 stages of purification necessary for clear and truthful communication.',
    soulSchool:
      "To speak your truth, you need to find it first. This chakra is about purification, eliminating the toxic mind's interference with authentic expression. The Law of Vibration teaches that everything vibrates, including thoughts, emotions, and words. The Throat Chakra allows co-creation of reality through emitted vibrations. Aligning communication with intentions manifests desires and positive change. Authentic expression empowers words, inspiring others and fostering harmony. Learn to speak from the heart and your expression transforms into something so much more.",
    dailyActivity:
      "Find your triangle of truth. Observe if your words match your actions and if your actions match your thinking. If not, you're on the path of discovering your authentic self.",
    wordsOfWisdom:
      '"Your voice matters. Speak your truth with courage, clarity, and compassion. Let your words be a beacon of authenticity, inspiring others to embrace their own unique expression."',
    affirmationText:
      "I speak my truth. I express myself authentically. I communicate with clarity.",
    elements: {
      background: require("@/assets/images/elementsthroat.png"),
      sanskrit: "Vishuddha",
      body: "Thyroid gland, throat, neck, mouth, ears, jaw, shoulders",
      stones: "Turquoise, aquamarine, lapis lazuli, blue lace agate, celestite",
      smells: "Eucalyptus, peppermint, chamomile, tea tree",
      colors: "Blue, turquoise, silver",
      foods: "Liquids, fruits, herbal teas, blueberries",
      sacredgeometry:
        "Downward-pointing triangle within a circle symbolizes purification and the descent of divine energy into the physical world",
      principle: "Resonance of Being",
    },
    pills: {
      frequency: {
        pillTitle: "741 Hz",
        hertz: "741 Hz",
        description:
          "741 Hz promotes expression, clear communication, and intuition. This frequency helps to release blockages, enhance articulation, and inspire creativity.",
      },
      identityStatement: {
        pillTitle: '"I speak"',
        title: "I Speak",
        description:
          'The Throat Chakra is the center of communication and authenticity. When you affirm "I Speak," you claim your right to express yourself freely. This can be challenging if you\'ve been silenced or discouraged from sharing your truth. By embracing your voice, you liberate yourself and inspire others.',
      },
      seedMantra: {
        pillTitle: "Ham",
        title: "Ham",
        description:
          'Chant this sound 13 times in a rhythmic loop to activate and balance your Throat Chakra. "Ham" is like a clear stream, purifying your communication and allowing your truth to flow freely. It helps to wash away any fears or insecurities that may be preventing you from speaking your mind. As you chant "Ham," feel the Earth\'s energy supporting you, giving you the courage to express yourself authentically.',
      },
    },
    chakraHeaderImage: require("@/assets/images/vishuddha.png"),
    header: {
      headerBackground: require("@/assets/images/5header.jpeg"),
      chakraImageSizePx: 70,
      textLine1: "Day 5",
      textLine2: "Throat Chakra",
      textLine3: 'Vishuddha - "I speak"',
    },
    audioIntro: {
      title: "Good Morning Throat!",
      author: "Mother JJ",
      durationMs: 2422000, // 40:22
      source: require("@/assets/audio/root-erin-1.mp3"),
    },
    audioOutro: {
      title: "Connected To The Earth",
      author: "Ethan",
      durationMs: 20400,
      source: require("@/assets/audio/root-ethan-1.mp3"),
    },
    locationImage: require("@/assets/images/throatlocation.png"),
    goodbye: {
      content: "My Throat Is Awake",
      chakraImage: require("@/assets/images/throat.png"),
    },
    integration: "Today, we bring our authentic self into the outward world",
    yoga: {
      chakraDay: "Throat Day",
      pose: "Fish Pose (Matsyasana)",
      poseDescription:
        "Open your throat and release any blockages to self-expression.",
    },
    soundBath: {
      title: "Root Chakra - 396 Hz",
      subtitle: "muladhara",
      body: "Listen to this frequency when you need to release fear and guilt, and any shadows related to your survival of needing more. The 396 Hz frequency, known as the “Liberation Frequency,” can help you find your way back to a place of safety and stability within, allowing you to feel grounded and supported as you navigate life's challenges.",
      soundBowlAudio: require("@/assets/audio/day1singingbowl.mp3"),
      tuningForkAudio: require("@/assets/audio/day1tuningfork.mp3"),
    },
    headtoheart: {
      title: "THE SEVENTH LAW",
      subtitle: '"GENERATION"',
      description: [
        {
          text: "For true awareness of self, we remember the ancestral knowledge for the Root Chakra is ",
        },
        { text: "The Divine Law of Generation", className: "font-bold" },
        {
          text: ". At the base of your spine is a cauldron of fire, your power plant of energy. To generate is not to gain; it means to create something. This chakra gives you the power to create life on Earth.",
        },
      ],
      audio: {
        title: "THE POWER OF CREATION",
        author: "ERIN",
        duration: 0,
        source: 0,
        authorColor: "#FFDEBA",
      },
      dailyActivity: [
        {
          text: "Switching from head to heart is all about detaching from the mind and sending your focus to your sensory body that connects through energy. Start to feel the world around you and how you are connected to it.",
        },
        {
          title: "Walking Meditation:",
          text: "This is a powerful and simple activity you can do almost anywhere. Even a simple walk can transform from a routine to a ritual.",
        },
        {
          text: 'Step slowly and mindfully, saying internally, "I am" as one foot touches the ground, and "Gaia" or "Earth" when the other foot touches the ground. Try to repeat this until there are no other thoughts but simply your awareness of each moment your energy connects to the ground. Feel your way through this. "I am, Earth."',
        },
      ],
    },
  },
  [Chakra.THIRD_EYE]: {
    overview:
      'Located in the center of the forehead, between the eyebrows, the indigo Third Eye Chakra is the center of intuition, wisdom, and spiritual vision. It allows you to see beyond the physical world and connect with your inner guidance. "I See" is the essence of perceiving the interconnectedness of all things, trusting your intuition, and accessing higher states of consciousness. Embrace your inner wisdom, cultivate clear perception, and connect with the divine. When your Third Eye Chakra is balanced, you experience clarity, insight, and spiritual awakening. "I See" is the greatest challenge of all. It is not asking you if you can see yourself, if you can understand the world, or if you are right and aware. "I See" is asking you if you can see beyond The Self.',
    sanskrit:
      'Ajna means "command" or "perceive," symbolizing the power of this chakra to access higher knowledge and direct your life with clarity and purpose. Its two petals represent the union of intuition and intellect, the balance between the physical and spiritual worlds.',
    soulSchool:
      "The Law of Communication states that everything in the universe is interconnected through a constant exchange of information and energy. The Third Eye Chakra, as the center of intuition and perception, allows you to receive guidance and inspiration from the subtle realms. By quieting the mind and opening to the unseen, you can access deeper levels of understanding and connect with your higher self. This connection leads to profound insights and a greater sense of purpose in life.",
    dailyActivity:
      'Practice the "Spirit Mind Awakening Breath" technique to activate the flow of prana, awaken the pineal gland, and cultivate a deeper connection to your intuition and inner vision.',
    wordsOfWisdom:
      '"Trust your intuition. It\'s the whisper of your soul guiding you towards your highest potential. Open your third eye to the unseen realms and discover the wisdom that lies within."',
    affirmationText: "I am intuitive. I am wise. I am connected to the divine.",
    elements: {
      background: require("@/assets/images/elementsthirdeye.png"),
      sanskrit: "Ajna",
      body: "Pituitary gland, pineal gland, eyes, head, brain",
      stones: "Amethyst, lapis lazuli, sodalite, clear quartz, purple fluorite",
      smells: "Lavender, frankincense, sandalwood, myrrh",
      colors: "Indigo, purple, violet, dark blue",
      foods:
        "Dark-colored fruits and vegetables, raw foods, juices, purple grapes",
      sacredgeometry:
        "Two intersecting triangles symbolize the union of intuition and intellect, and the balance between the physical and spiritual worlds",
      principle: "Knowledge of being",
    },
    pills: {
      frequency: {
        pillTitle: "852 Hz",
        hertz: "852 Hz",
        description:
          "852 Hz enhances intuition, wisdom, and spiritual connection. This frequency helps to clear mental fog, awaken the third eye, and connect with your higher self.",
      },
      identityStatement: {
        pillTitle: '"I see"',
        title: "I See",
        description:
          'The Third Eye Chakra is the center of intuition and spiritual vision. When you affirm "I See," you acknowledge the limitations of the ego and open your awareness to a deeper reality. This can be challenging in a world that prioritizes logic over intuition. By trusting your inner vision, you expand your consciousness and access your innate wisdom.',
      },
      seedMantra: {
        pillTitle: "Om",
        title: "Om",
        description:
          'Chant this primordial sound 13 times to activate and balance your Third Eye Chakra. "Om" is like a gentle whisper from the universe, guiding you towards your intuition and inner wisdom. It helps to quiet the mind and open your awareness to the subtle realms. As you chant "Om," feel the Earth\'s energy grounding you, allowing you to connect to your higher self and see beyond the illusions of the physical world.',
      },
    },
    chakraHeaderImage: require("@/assets/images/ajna.png"),
    header: {
      headerBackground: require("@/assets/images/6header.png"),
      chakraImageSizePx: 70,
      textLine1: "Day 6",
      textLine2: "Third Eye Chakra",
      textLine3: 'Ajna - "I see"',
    },
    audioIntro: {
      title: "Ajna Embodiment - Part One",
      author: "Mother JJ",
      durationMs: 1750000, // 29:10 - Part One duration
      source: require("@/assets/audio/root-erin-1.mp3"), // Placeholder - actual audio comes from Firebase
    },
    audioOutro: {
      title: "Connected To The Earth",
      author: "Ethan",
      durationMs: 20400,
      source: require("@/assets/audio/root-ethan-1.mp3"),
    },
    locationImage: require("@/assets/images/thirdeyelocation.png"),
    goodbye: {
      content: "My Third Eye Is Awake",
      chakraImage: require("@/assets/images/thirdeye.png"),
    },
    integration: "Today, we bring our authentic self into the outward world",
    yoga: {
      chakraDay: "Root Day",
      pose: "Mountain Pose (Tadasana)",
      poseDescription:
        "This is the perfect starting place for Day 1. This pose helps you find your standing center, it can be done anywhere at any time and it activates your root while seeking total balance in the rest of your body.",
    },
    soundBath: {
      title: "Root Chakra - 396 Hz",
      subtitle: "muladhara",
      body: "Listen to this frequency when you need to release fear and guilt, and any shadows related to your survival of needing more. The 396 Hz frequency, known as the “Liberation Frequency,” can help you find your way back to a place of safety and stability within, allowing you to feel grounded and supported as you navigate life's challenges.",
      soundBowlAudio: require("@/assets/audio/day1singingbowl.mp3"),
      tuningForkAudio: require("@/assets/audio/day1tuningfork.mp3"),
    },
    headtoheart: {
      title: "THE SEVENTH LAW",
      subtitle: '"GENERATION"',
      description: [
        {
          text: "For true awareness of self, we remember the ancestral knowledge for the Root Chakra is ",
        },
        { text: "The Divine Law of Generation", className: "font-bold" },
        {
          text: ". At the base of your spine is a cauldron of fire, your power plant of energy. To generate is not to gain; it means to create something. This chakra gives you the power to create life on Earth.",
        },
      ],
      audio: {
        title: "THE POWER OF CREATION",
        author: "ERIN",
        duration: 0,
        source: 0,
        authorColor: "#FFDEBA",
      },
      dailyActivity: [
        {
          text: "Switching from head to heart is all about detaching from the mind and sending your focus to your sensory body that connects through energy. Start to feel the world around you and how you are connected to it.",
        },
        {
          title: "Walking Meditation:",
          text: "This is a powerful and simple activity you can do almost anywhere. Even a simple walk can transform from a routine to a ritual.",
        },
        {
          text: 'Step slowly and mindfully, saying internally, "I am" as one foot touches the ground, and "Gaia" or "Earth" when the other foot touches the ground. Try to repeat this until there are no other thoughts but simply your awareness of each moment your energy connects to the ground. Feel your way through this. "I am, Earth."',
        },
      ],
    },
  },
  [Chakra.CROWN]: {
    overview:
      "Located at the crown of the head, the violet Crown Chakra is the center of spiritual connection and enlightenment. It connects you to the divine and allows you to experience the boundless wisdom and unconditional love of the universe. \"I Understand\" is the essence of recognizing your oneness with all creation, surrendering to the divine flow, and accessing your soul's wisdom. Embrace spiritual connection, transcend limitations, and trust in the unfolding of your soul's journey. When your Crown Chakra is balanced, you experience deep peace, purpose, and a profound connection to the divine.",
    sanskrit:
      'Sahasrara means "thousand-petaled," symbolizing the infinite potential and boundless nature of this chakra. Its thousand petals represent the countless pathways to enlightenment and spiritual awakening. We started at the root in pure limitation, ready to awaken and expand. This is where we rise beyond limitation; this is where you find your soul.',
    soulSchool:
      'We often "think" we understand because we have decided we do. This divine challenge asks, "Do you understand, not through knowing, but through listening?" It invites us to open our intuition to the truth of who we are. To understand is to listen to the higher realms of wisdom. The Law of Oneness states that everything in the universe is interconnected and part of a unified whole. The Crown Chakra, as the center of spiritual connection, allows us to experience this oneness directly. Our greatest challenge is to leave the self, the box, and rejoin our celestial family while here on Earth. By transcending the illusion of separation and embracing our connection to all beings, we can awaken to our true nature as a spiritual being. This realization brings a profound sense of peace, purpose, and expanded consciousness.',
    dailyActivity:
      'Practice the "Reiki Golden Ball Meditation" to activate and balance all your chakras, culminating in a profound opening of the crown chakra and a deep connection to the divine.',
    wordsOfWisdom:
      '"Surrender to the divine flow. Trust in the wisdom of the universe. Embrace your connection to all beings. In the stillness of the crown chakra, find your enlightenment, your peace, your oneness with all creation."',
    affirmationText:
      "I am connected. I am enlightened. I am one with the universe.",
    elements: {
      background: require("@/assets/images/elementscrown.png"),
      sanskrit: "Sahasrara",
      body: "Pineal gland, central nervous system, brain, top of the head",
      stones: "Amethyst, clear quartz, selenite, diamond, howlite",
      smells: "Lavender, frankincense, myrrh, cedarwood",
      colors: "Violet, white, gold, silver",
      foods: "Fasting, light and pure foods, spiritual practices, meditation",
      sacredgeometry:
        "The Circle symbolizes unity, wholeness, and connection to the divine.",
      principle: "Connection",
    },
    pills: {
      frequency: {
        pillTitle: "963 Hz",
        hertz: "963 Hz",
        description:
          "963 Hz promotes spiritual connection, enlightenment, and a sense of oneness with the universe. This frequency helps to activate the crown chakra and access higher states of consciousness.",
      },
      identityStatement: {
        pillTitle: '"I understand"',
        title: "I Understand",
        description:
          'The Crown Chakra is the center of spiritual connection and oneness. When you affirm "I Understand," you acknowledge the interconnectedness of all beings and embrace your true nature as a spiritual being. This can be challenging in a world that emphasizes separation. By connecting to your Crown Chakra, you experience a profound sense of peace and unity with all creation.',
      },
      seedMantra: {
        pillTitle: "Aum",
        title: "Aum",
        description:
          'Chant this three-part sound 13 times to activate and balance your Crown Chakra. "Aum" is like a symphony of the cosmos, connecting you to the divine and reminding you of your oneness with all creation. It helps to dissolve the boundaries of separation and open your crown to the infinite possibilities of the universe. As you chant "Aum," feel the Earth\'s energy supporting your spiritual journey, guiding you towards enlightenment and a profound sense of peace.',
      },
    },
    chakraHeaderImage: require("@/assets/images/sahasrara.png"),
    header: {
      headerBackground: require("@/assets/images/7header.png"),
      chakraImageSizePx: 90,
      textLine1: "Day 7",
      textLine2: "Crown Chakra",
      textLine3: 'Sahasrara - "I understand"',
    },
    audioIntro: {
      title: "Good Morning Root!",
      author: "Mother JJ",
      durationMs: 2891000, // 48:11
      source: require("@/assets/audio/root-erin-1.mp3"),
    },
    audioOutro: {
      title: "Connected To The Earth",
      author: "Ethan",
      durationMs: 20400,
      source: require("@/assets/audio/root-ethan-1.mp3"),
    },
    locationImage: require("@/assets/images/crownlocation.png"),
    goodbye: {
      content: "My Crown Is Awake",
      chakraImage: require("@/assets/images/crown.png"),
    },
    integration: "Today, we bring our authentic self into the outward world",
    yoga: {
      chakraDay: "Root Day",
      pose: "Mountain Pose (Tadasana)",
      poseDescription:
        "This is the perfect starting place for Day 1. This pose helps you find your standing center, it can be done anywhere at any time and it activates your root while seeking total balance in the rest of your body.",
    },
    soundBath: {
      title: "Root Chakra - 396 Hz",
      subtitle: "muladhara",
      body: "Listen to this frequency when you need to release fear and guilt, and any shadows related to your survival of needing more. The 396 Hz frequency, known as the “Liberation Frequency,” can help you find your way back to a place of safety and stability within, allowing you to feel grounded and supported as you navigate life's challenges.",
      soundBowlAudio: require("@/assets/audio/day1singingbowl.mp3"),
      tuningForkAudio: require("@/assets/audio/day1tuningfork.mp3"),
    },
    headtoheart: {
      title: "THE SEVENTH LAW",
      subtitle: '"GENERATION"',
      description: [
        {
          text: "For true awareness of self, we remember the ancestral knowledge for the Root Chakra is ",
        },
        { text: "The Divine Law of Generation", className: "font-bold" },
        {
          text: ". At the base of your spine is a cauldron of fire, your power plant of energy. To generate is not to gain; it means to create something. This chakra gives you the power to create life on Earth.",
        },
      ],
      audio: {
        title: "THE POWER OF CREATION",
        author: "ERIN",
        duration: 0,
        source: 0,
        authorColor: "#FFDEBA",
      },
      dailyActivity: [
        {
          text: "Switching from head to heart is all about detaching from the mind and sending your focus to your sensory body that connects through energy. Start to feel the world around you and how you are connected to it.",
        },
        {
          title: "Walking Meditation:",
          text: "This is a powerful and simple activity you can do almost anywhere. Even a simple walk can transform from a routine to a ritual.",
        },
        {
          text: 'Step slowly and mindfully, saying internally, "I am" as one foot touches the ground, and "Gaia" or "Earth" when the other foot touches the ground. Try to repeat this until there are no other thoughts but simply your awareness of each moment your energy connects to the ground. Feel your way through this. "I am, Earth."',
        },
      ],
    },
  },
}
