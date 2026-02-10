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
    affirmationText: "I am, I exist, I belong.",
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
        modalTitle: "Root Chakra • 396 Hz",
        modalContent:
          "The Anchor of Safety\n\nThis frequency vibrates at the level of the skeletal system, spine, and adrenal glands. It is the sonic antidote to fear and guilt. By soothing the \"fight or flight\" response, it physically grounds your nervous system, turning panic into presence and survival anxiety into stability.\n\nRegulates: Adrenals, lower back, legs, immune system.\n\nHeals: Fear, guilt, lack of focus, feeling \"unsafe.\"",
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
      durationMs: 1800000, // 30:00 - Actual embodiment meditation duration
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
      essence: "I belong on this Earth.",
      body: "This is the perfect starting place. Tadasana is not just standing; it is an active exchange with gravity. By rooting your feet down, you signal safety to your nervous system.",
      somaticCue:
        "Press your feet gently into the floor. Don't just hold yourself up; feel the earth holding you.",
    },
    soundBath: {
      title: "Root Chakra - 396 Hz",
      subtitle: "muladhara",
      helpsWith: "Grounding, safety, reducing fear, calming survival anxiety",
      realWorldEffect:
        "People feel more present in their body, less panicky, more stable and anchored.",
      body: "Listen to this frequency when you need to release fear and guilt, and any shadows related to your survival of needing more. The 396 Hz frequency, known as the “Liberation Frequency,” can help you find your way back to a place of safety and stability within, allowing you to feel grounded and supported as you navigate life's challenges.",
      tuningForkAudio: require("@/assets/audio/day1tuningfork.mp3"),
      crystalBowlAudio: require("@/assets/audio/day1singingbowl.mp3"),
    },
    headtoheart: {
      title: "THE SEVENTH LAW",
      subtitle: '"GENERATION"',
      description: [
        {
          text: "For true awareness of self, we remember the ancestral knowledge: The Root is the Divine Law of Generation. At the base of your spine is the cauldron of fire, your power plant of energy. To generate is not to gain; it is to create something new. Creation requires union—the meeting of seed and soil, impulse and allowing. When we honor this law, life unfolds organically. This is the power to birth reality on Earth.",
        },
      ],
      masterKey: {
        text: "You are not a victim of your circumstances; you are the origin point of your life force. Realizing this turns you from a survivor into a creator.",
      },
      dailyActivityTitle: "The Earth Cord",
      dailyActivitySubline:
        "Planting your feet on the ground to reconnect with the battery of the Earth.",
      audio: {
        title: "THE POWER OF CREATION",
        author: "ERIN",
        duration: 0,
        source: 0,
        authorColor: "#FFDEBA",
      },
      dailyActivity: [
        {
          text: "LAW: GENERATION  •  Activity: Walking Meditation (The Earth Cord)",
          className: "font-instrument-medium text-white/95 mb-2",
        },
        {
          title: "Why: ",
          text: 'The Root Chakra governs the Law of Generation—the power to birth reality. But we cannot create if we are not here. This practice moves you out of the "floating head" and plants your feet firmly on the ground, reconnecting your biological generator to the battery of the Earth.',
        },
        {
          title: "The Practice: ",
          text: 'Go outside (or walk slowly in your home). This is not walking to get somewhere; it is walking to be somewhere.\n\nStep slowly and mindfully. As your left foot touches the ground, silently say "I am." As your right foot touches the ground, silently say "Earth." Left: "I am." Right: "Earth."\n\nRepeat this mantra until there are no other thoughts, just the rhythm of your feet kissing the ground. Feel the gravity pulling you down, holding you safe. You are not separate from the planet; you are an extension of it.',
        },
        {
          title: "INTEGRATION (The Spirit in Reality):",
          text: "",
          className: "mt-2",
        },
        {
          title: "The Intention: ",
          text: '"I am grounded, safe, and ready to create."',
        },
        {
          title: "The Action: ",
          text: "Today, I will physically touch the earth (or a tree) to discharge excess mental energy.",
        },
        {
          title: "The Reality Check: ",
          text: "I do not need to escape my body to find spirit; I find spirit in my body.",
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
    affirmationText: "I feel, I flow, I create.",
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
        modalTitle: "Sacral Chakra • 417 Hz",
        modalContent:
          "The Frequency of Change\n\nThis tone targets the reproductive organs, bladder, and hips—the body's emotional storage center. It facilitates change by clearing traumatic energy stuck in the cellular memory. It liquefies rigid emotional patterns, allowing creativity and pleasure to flow again.\n\nRegulates: Hips, reproductive system, kidneys, lymphatic flow.\n\nHeals: Emotional numbness, past trauma, creative blocks, resistance to change.",
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
      pose: "Sufi Grind (Seated Pelvic Circles)",
      essence: "I allow movement.",
      body: "The Sacral chakra is water, not stone. Rigid hips trap emotions; movement frees them. This gentle, circular motion lubricates the spine and reminds the body that flow is safe.",
      somaticCue:
        "Close your eyes and rotate your hips in slow circles. Move like water—continuous, soft, with no sharp edges.",
    },
    soundBath: {
      title: "Sacral Chakra - 417 Hz",
      subtitle: "svadhisthana",
      helpsWith:
        "Emotional flow, releasing stuck patterns, creativity, intimacy",
      realWorldEffect:
        "Emotions move instead of looping; creativity returns; tension in hips/lower belly softens.",
      body: "Listen to this frequency when you need to release fear and guilt, and any shadows related to your survival of needing more. The 396 Hz frequency, known as the “Liberation Frequency,” can help you find your way back to a place of safety and stability within, allowing you to feel grounded and supported as you navigate life's challenges.",
      tuningForkAudio: require("@/assets/audio/day1tuningfork.mp3"),
      crystalBowlAudio: require("@/assets/audio/day1singingbowl.mp3"),
    },
    headtoheart: {
      title: "THE SIXTH LAW",
      subtitle: '"POLARITY"',
      description: [
        {
          text: 'Moving into the waters of feeling, we meet the Divine Law of Polarity. "Everything contains its opposite." Light and dark, expansion and contraction—these are not enemies, but expressions of the same truth at different degrees. This law teaches us discernment without division. When we stop resisting the spectrum of our emotions, conflict softens, and the world stops fracturing into "us vs. them." Here, choice is born.',
        },
      ],
      masterKey: {
        text: 'Awakening happens when you stop fighting your shadow and start integrating it. Wholeness is not being "good"—it is being everything.',
      },
      dailyActivityTitle: "The Love Anchor",
      dailyActivitySubline:
        "Holding two opposing truths at once to return to the unity of the heart.",
      audio: {
        title: "THE POWER OF CREATION",
        author: "ERIN",
        duration: 0,
        source: 0,
        authorColor: "#FFDEBA",
      },
      dailyActivity: [
        {
          text: 'LAW: POLARITY  •  Activity: The "I Love You" Crystal',
          className: "font-instrument-medium text-white/95 mb-2",
        },
        {
          title: "Why: ",
          text: 'To master Polarity, we must learn to hold two opposing truths at once. The mind judges "bad" things as separate from us, but the heart knows that everything is part of the One. This practice uses a physical anchor to bridge that gap, training you to offer love exactly where your ego wants to offer judgment.',
        },
        {
          title: "The Practice: ",
          text: 'Find a small Amethyst crystal (or any stone that calls to you) and keep it in your pocket all day. This is your "Love Anchor."\n\nWhenever you feel resistance—someone cuts you off in traffic, a rude comment, or a wave of anxiety—physically touch the stone. In that moment of trigger, feel the cold, hard reality of the stone and silently say to the person or situation: "I love you."\n\nYou don\'t have to like the behavior. You are simply acknowledging the soul beneath the shadow. By saying "I love you" to what challenges you, you collapse the duality of "good vs. bad" and return to the unity of the heart.',
        },
        {
          title: "INTEGRATION (The Spirit in Reality):",
          text: "",
          className: "mt-2",
        },
        {
          title: "The Intention: ",
          text: '"I am the space where opposites meet."',
        },
        {
          title: "The Action: ",
          text: "Today, I will look for one thing I usually judge as 'ugly' or 'wrong' and find the divinity hidden within it.",
        },
        {
          title: "The Reality Check: ",
          text: "When I judge, I separate. When I love, I integrate.",
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
    affirmationText: "Through my truth, I find my soul fire.",
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
        modalTitle: "Solar Plexus • 528 Hz",
        modalContent:
          "The Miracle Tone\n\nKnown as the frequency of transformation, 528 Hz resonates with the digestive system, pancreas, and liver. It brings coherence to your \"gut instinct,\" repairing willpower and self-worth. It turns the energy of stress into the fuel of confidence.\n\nRegulates: Stomach, digestion, metabolism, liver.\n\nHeals: Low self-esteem, digestive issues, lack of purpose, victim mentality.",
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
      pose: "Seated Spinal Twist",
      essence: "I can act. I can choose.",
      body: 'Twisting physically "wrings out" the stagnation in the gut, where we store stress. It restores mobility to the core, igniting your internal fire without aggression.',
      somaticCue:
        "Initiate the twist from your belly button, not your shoulders. Feel the strength of your own center rotating you.",
    },
    soundBath: {
      title: "Solar Plexus - 528 Hz",
      subtitle: "manipura",
      helpsWith: "Confidence, digestion of stress, personal power, coherence",
      realWorldEffect:
        "Stronger sense of self, less self-doubt, clearer decision-making, reduced gut tension.",
      body: "Listen to this frequency when you need to release fear and guilt, and any shadows related to your survival of needing more. The 396 Hz frequency, known as the “Liberation Frequency,” can help you find your way back to a place of safety and stability within, allowing you to feel grounded and supported as you navigate life's challenges.",
      tuningForkAudio: require("@/assets/audio/day1tuningfork.mp3"),
      crystalBowlAudio: require("@/assets/audio/day1singingbowl.mp3"),
    },
    headtoheart: {
      title: "THE FIFTH LAW",
      subtitle: '"CAUSE & EFFECT"',
      description: [
        {
          text: 'In the fire of the will, we encounter the Divine Law of Cause and Effect. "Nothing happens by chance." Every thought and intention sets energy in motion. This law restores your sovereignty: You are not being punished or rewarded; you are participating. When we wake up to this truth, we stop asking, "Why is this happening to me?" and begin asking, "What am I creating?"',
        },
      ],
      masterKey: {
        text: "This is the shift from fate to authorship. You realize the universe is not happening to you, it is responding to you.",
      },
      dailyActivityTitle: "The Sacred Action",
      dailyActivitySubline:
        'Transforming the "constant doer" into the conscious creator.',
      audio: {
        title: "THE POWER OF CREATION",
        author: "ERIN",
        duration: 0,
        source: 0,
        authorColor: "#FFDEBA",
      },
      dailyActivity: [
        {
          text: "LAW: CAUSE & EFFECT  •  Activity: Conscious Repair (Karma Yoga)",
          className: "font-instrument-medium text-white/95 mb-2",
        },
        {
          title: "Why: ",
          text: 'The ego is a "constant doer," rushing through tasks to get somewhere else. The Heart Mind knows that every action is a seed. This practice uses the law of Cause and Effect to turn a mundane chore into a ritual of sovereignty.',
        },
        {
          title: "The Practice: ",
          text: 'Walk around your home and find one small thing that has been broken, loose, or neglected—a squeaky hinge, a torn hem, a cluttered drawer. Do not rush to finish it. Sit with it.\n\nFix this object with total presence. Feel the tool in your hand; watch the "effect" of your care restoring the object. You are not just fixing a thing; you are restoring order to your external world, which signals to your internal world that you are capable and caring.',
        },
        {
          title: "INTEGRATION (The Spirit in Reality):",
          text: "",
          className: "mt-2",
        },
        {
          title: "The Intention: ",
          text: '"My attention is the cause; my reality is the effect."',
        },
        {
          title: "The Action: ",
          text: "Today, I will do one small task with the reverence of a temple keeper.",
        },
        {
          title: "The Reality Check: ",
          text: "I do not rush to the end; I honor the power of the process.",
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
    affirmationText: "My heart is open; my love is unconditional.",
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
        modalTitle: "Heart Chakra • 639 Hz",
        modalContent:
          "The Bridge of Connection\n\nThis frequency harmonizes the heart, lungs, and circulatory system. It is the sound of relationship and repair. It re-calibrates your capacity for empathy and understanding, dissolving the walls of judgment to restore harmony with others and yourself.\n\nRegulates: Heart, lungs, blood pressure, immune response.\n\nHeals: Grief, loneliness, resentment, relationship conflict.",
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
      pose: "Supported Fish (Matsyasana)",
      essence: "I open without fear.",
      body: "The heart opens best when it feels safe, not forced. Using a pillow or block allows you to surrender completely to gravity, physically exposing the chest while fully supported.",
      somaticCue:
        'Lie back and do nothing. Let your chest lift passively. You are not "trying" to open; you are allowing it to happen.',
    },
    soundBath: {
      title: "Heart Chakra - 639 Hz",
      subtitle: "anahata",
      helpsWith:
        "Connection, compassion, emotional regulation, relational healing",
      realWorldEffect:
        "Chest softens, breathing deepens, empathy increases without overwhelm.",
      body: "Listen to this frequency when you need to release fear and guilt, and any shadows related to your survival of needing more. The 396 Hz frequency, known as the “Liberation Frequency,” can help you find your way back to a place of safety and stability within, allowing you to feel grounded and supported as you navigate life's challenges.",
      tuningForkAudio: require("@/assets/audio/day1tuningfork.mp3"),
      crystalBowlAudio: require("@/assets/audio/day1singingbowl.mp3"),
    },
    headtoheart: {
      title: "THE FOURTH LAW",
      subtitle: '"RHYTHM"',
      description: [
        {
          text: 'At the center of the chest, we find the Divine Law of Rhythm. "Life breathes." There are seasons of expansion and rest, clarity and confusion. Nothing is fixed; nothing is permanent. This law teaches us grace through timing. When we resist the rhythm, we suffer. But when we learn to ride the cycles of the heart, life becomes musical. We trust the exhale as much as the inhale.',
        },
      ],
      masterKey: {
        text: "Suffering comes from holding on; freedom comes from flowing. This law teaches you to trust the timing of your life.",
      },
      dailyActivityTitle: "The Rhythm of Peace",
      dailyActivitySubline:
        "Moving from the chaotic noise of the head to the steady beat of the heart.",
      audio: {
        title: "THE POWER OF CREATION",
        author: "ERIN",
        duration: 0,
        source: 0,
        authorColor: "#FFDEBA",
      },
      dailyActivity: [
        {
          text: "LAW: RHYTHM  •  Activity: Coherent Breathing (Sama Vritti)",
          className: "font-instrument-medium text-white/95 mb-2",
        },
        {
          title: "Why: ",
          text: "The mind races, but the heart has a rhythm. To align with the law of Rhythm, we must manually synchronize our biology. This ancient breathwork practice, known in yoga as Sama Vritti (Equal Fluctuations), physically forces your heart rate variability into a state of coherence (peace).",
        },
        {
          title: "The Practice: ",
          text: "Place one hand on your heart and one on your belly. Inhale slowly through the nose for a count of 4. Pause for a beat. Exhale slowly through the nose for a count of 4.\n\nFeel your heartbeat slowing down to match the cadence of your breath. You are not thinking about peace; you are physically creating it. Like the tide coming in and out, trust that the breath will always return.",
        },
        {
          title: "INTEGRATION (The Spirit in Reality):",
          text: "",
          className: "mt-2",
        },
        { title: "The Intention: ", text: '"I trust the timing of my life."' },
        {
          title: "The Action: ",
          text: "Today, whenever I feel rushed, I will stop and take three coherent breaths to reset my internal clock.",
        },
        {
          title: "The Reality Check: ",
          text: "I cannot force the tide; I can only learn to swim with it.",
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
    affirmationText: "I speak with purity, compassion, and truth.",
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
        modalTitle: "Throat Chakra • 741 Hz",
        modalContent:
          "The Detoxifier\n\nResonating with the thyroid, neck, and jaw, this frequency is about purity and truth. It acts as a solvent, \"cleaning\" the cells of toxins—both physical pollutants and unspoken lies. It clears the channel so your inner voice matches your outer reality.\n\nRegulates: Thyroid, throat, neck, mouth, ears.\n\nHeals: Inability to speak up, thyroid issues, toxicity, mental fog.",
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
      pose: "Seated Neck Release",
      essence: "I speak through softness.",
      body: "Tension in the neck strangles our truth. We clear the throat channel not by pushing, but by softening the muscles that guard our voice.",
      somaticCue:
        'Drop your ear to your shoulder and move slowly. Breathe into the side of your neck until you feel the "no" dissolve into a "yes."',
    },
    soundBath: {
      title: "Throat Chakra - 741 Hz",
      subtitle: "vishuddha",
      helpsWith: "Expression, honesty, clearing mental fog, boundary setting",
      realWorldEffect:
        "Easier speaking, clearer thoughts, less throat/neck tightness, stronger voice presence.",
      body: "Listen to this frequency when you need to release fear and guilt, and any shadows related to your survival of needing more. The 396 Hz frequency, known as the “Liberation Frequency,” can help you find your way back to a place of safety and stability within, allowing you to feel grounded and supported as you navigate life's challenges.",
      tuningForkAudio: require("@/assets/audio/day1tuningfork.mp3"),
      crystalBowlAudio: require("@/assets/audio/day1singingbowl.mp3"),
    },
    headtoheart: {
      title: "THE THIRD LAW",
      subtitle: '"VIBRATION"',
      description: [
        {
          text: 'As we rise to speak, we engage the Divine Law of Vibration. "Nothing rests; everything moves." You do not attract what you want; you resonate with what you are. Your voice is a frequency that shapes your experience. This law invites self-attunement, not control. When you align your internal frequency with your truth, the external field responds.',
        },
      ],
      masterKey: {
        text: "You are a tuning fork for your reality. To change your world, you do not shout louder; you simply change your signal.",
      },
      dailyActivityTitle: "The Vibration of Truth",
      dailyActivitySubline:
        "Tuning your instrument so your internal voice matches your external reality.",
      audio: {
        title: "THE POWER OF CREATION",
        author: "ERIN",
        duration: 0,
        source: 0,
        authorColor: "#FFDEBA",
      },
      dailyActivity: [
        {
          text: "LAW: VIBRATION  •  Activity: Humming Bee Breath (Bhramari)",
          className: "font-instrument-medium text-white/95 mb-2",
        },
        {
          title: "Why: ",
          text: "The head is full of silent noise (thoughts). To drop into the body, we use the law of Vibration to literally shake the tension loose. This practice stimulates the Vagus Nerve, instantly telling your nervous system it is safe to relax.",
        },
        {
          title: "The Practice: ",
          text: "Sit comfortably and close your eyes. Take a deep inhale. On the exhale, keep your mouth closed and make a low, humming sound like a bee (Mmmmm). Let the vibration resonate in your throat, your chest, and your skull.\n\nFocus entirely on the physical sensation of the buzz. Let the sound drown out the chatter of the mind. You are tuning your instrument. Repeat this for 1–2 minutes until you feel a buzzing stillness in your silence.",
        },
        {
          title: "INTEGRATION (The Spirit in Reality):",
          text: "",
          className: "mt-2",
        },
        {
          title: "The Intention: ",
          text: '"My presence is a frequency of truth."',
        },
        {
          title: "The Action: ",
          text: "Today, I will speak only what is true, kind, and necessary.",
        },
        {
          title: "The Reality Check: ",
          text: "Before I speak, I ask: Does this add harmony to the vibration of the room?",
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
    affirmationText:
      "I release the mind of self, and open my eyes to the Universe.",
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
        modalTitle: "Third Eye • 852 Hz",
        modalContent:
          "The Awakening of Intuition\n\nThis pitch stimulates the pineal gland and the optical center of the brain. It cuts through the noise of over-thinking to reveal the \"hidden order\" of things. It shifts you from intellectual processing to intuitive knowing, wiping the mental lens clean.\n\nRegulates: Brain, eyes, pineal gland, neurological balance.\n\nHeals: Mental exhaustion, confusion, headaches, lack of vision.",
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
      chakraDay: "Third Eye Day",
      pose: "Child's Pose (Balasana)",
      essence: "I see by listening.",
      body: "The Third Eye awakens through darkness and pressure. Resting your forehead on the earth triggers a reflex that instantly quiets the brain, turning your gaze inward.",
      somaticCue:
        "Let your forehead become heavy on the mat. Soften your eyes behind your closed lids and watch the space between your brows.",
    },
    soundBath: {
      title: "Third Eye (Ajna) - 852 Hz",
      subtitle: "ajna",
      helpsWith: "Perception, intuition, pattern recognition, mental clarity",
      realWorldEffect:
        "Reduced mental noise, clearer insight, easier focus without strain.",
      body: "Listen to this frequency when you need to release fear and guilt, and any shadows related to your survival of needing more. The 396 Hz frequency, known as the “Liberation Frequency,” can help you find your way back to a place of safety and stability within, allowing you to feel grounded and supported as you navigate life's challenges.",
      tuningForkAudio: require("@/assets/audio/day1tuningfork.mp3"),
      crystalBowlAudio: require("@/assets/audio/day1singingbowl.mp3"),
    },
    headtoheart: {
      title: "THE SECOND LAW",
      subtitle: '"CORRESPONDENCE"',
      description: [
        {
          text: 'In the seat of vision, we awaken to the Divine Law of Correspondence. "As within, so without." The world you see is a mirror of the world you hold inside—not as a judgment, but as feedback. This law reveals that the universe is an intimate partner in your awakening. When we master this, blame dissolves, curiosity replaces fear, and we see what is ready to be healed.',
        },
      ],
      masterKey: {
        text: "You stop trying to fix the mirror and start healing the source. The moment you clear your inner vision, the outer world rearranges itself.",
      },
      dailyActivityTitle: "The Inner Mirror",
      dailyActivitySubline:
        "Realizing that the clarity you create outside reflects the clarity you feel inside.",
      audio: {
        title: "THE POWER OF CREATION",
        author: "ERIN",
        duration: 0,
        source: 0,
        authorColor: "#FFDEBA",
      },
      dailyActivity: [
        {
          text: "LAW: CORRESPONDENCE  •  Activity: The Mirror of Nature (Saucha)",
          className: "font-instrument-medium text-white/95 mb-2",
        },
        {
          title: "Why: ",
          text: '"As within, so without." The mind thinks it is separate from the world, but the Third Eye sees the connection. We practice Saucha (cleanliness/purity) not to tidy up, but to honor the energetic correspondence between living things.',
        },
        {
          title: "The Practice: ",
          text: 'Find a plant in your home or garden. Notice if its leaves are dusty or dry. Gently take a damp cloth and wipe each leaf, supporting it with your hand.\n\nAs you clean the plant, imagine you are wiping the dust from your own clear seeing. Treat the plant as an extension of your own energy body. By tending to the life "out there," you clarify the life "in here." Watch how the plant looks brighter, and feel how your mind feels clearer.',
        },
        {
          title: "INTEGRATION (The Spirit in Reality):",
          text: "",
          className: "mt-2",
        },
        {
          title: "The Intention: ",
          text: '"The world is a mirror of my mind."',
        },
        {
          title: "The Action: ",
          text: "Today, if I see chaos outside, I will pause and create calm inside.",
        },
        {
          title: "The Reality Check: ",
          text: "I do not blame the reflection; I heal the source.",
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
      "I awaken my inner child - and surround myself with light.",
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
        modalTitle: "Crown Chakra • 963 Hz",
        modalContent:
          "The Frequency of Oneness\n\nThis is the sound of the Universe itself. It interacts with the entire central nervous system and the pituitary gland. It dissolves the illusion of separation, resetting the body to its original, perfect state of being. It is the \"return to Spirit.\"\n\nRegulates: Central nervous system, pituitary gland, cerebral cortex.\n\nHeals: Disconnection, spiritual depression, rigid identity, isolation.",
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
      title: "The Meadow of The Soul",
      author: "Mother JJ",
      durationMs: 2684000, // 44:44 - Day 7 Crown Master Embodiment
      source: require("@/assets/audio/root-erin-1.mp3"), // Placeholder - actual audio from Firebase
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
      chakraDay: "Crown Day",
      pose: "Corpse Pose (Savasana)",
      essence: "I rest in being.",
      body: 'The Crown cannot be "done"; it can only be received. This is the practice of stopping. When the body becomes still, the boundaries of the self dissolve into the whole.',
      somaticCue:
        "Let your body lie heavy, but keep your awareness light. There is nothing left to do. You are simply here.",
    },
    soundBath: {
      title: "Crown Chakra - 963 Hz",
      subtitle: "sahasrara",
      helpsWith: "Unity awareness, peace, nervous-system coherence, surrender",
      realWorldEffect:
        "Deep calm, spacious awareness, reduced identity fixation, sense of wholeness.",
      body: "Listen to this frequency when you need to release fear and guilt, and any shadows related to your survival of needing more. The 396 Hz frequency, known as the “Liberation Frequency,” can help you find your way back to a place of safety and stability within, allowing you to feel grounded and supported as you navigate life's challenges.",
      tuningForkAudio: require("@/assets/audio/day1tuningfork.mp3"),
      crystalBowlAudio: require("@/assets/audio/day1singingbowl.mp3"),
    },
    headtoheart: {
      title: "THE FIRST LAW",
      subtitle: '"MENTALISM"',
      description: [
        {
          text: 'At the threshold of the infinite, we remember the Source Law: Mentalism. "All is Mind." Before form, before energy, there is consciousness itself. The universe is not mechanical; it is aware. This does not mean the ego controls reality; it means you are a localized expression of a Universal Intelligence. When this law is realized, separation ends. The seeker becomes the field.',
        },
      ],
      masterKey: {
        text: "You remember that you are not the character in the story, but the consciousness dreaming the dream. This is the ultimate reunion with the One.",
      },
      dailyActivityTitle: "The Boundless Sky",
      dailyActivitySubline:
        "Dissolving the ceiling of the ego to remember the vastness of the Soul.",
      audio: {
        title: "THE POWER OF CREATION",
        author: "ERIN",
        duration: 0,
        source: 0,
        authorColor: "#FFDEBA",
      },
      dailyActivity: [
        {
          text: "LAW: MENTALISM  •  Activity: Sky Gazing (The Picnic of Presence)",
          className: "font-instrument-medium text-white/95 mb-2",
        },
        {
          title: "Why: ",
          text: 'The law of Mentalism teaches that "All is Mind"—that we are held within a greater intelligence. To feel this, we must dissolve the ceiling we put over our heads. This is about expanding your awareness into the infinite container of the sky.',
        },
        {
          title: "The Practice: ",
          text: "Go outside and lay a blanket on the grass, ideally in the sun. Lie down on your back and look up at the vast, open sky. Do not look at the clouds; look through them into the blue expanse.\n\nSoften your gaze until the edges of your vision blur. Feel the warmth of the sun (the source) on your skin. Realize there is no barrier between the top of your head and the edge of the universe. You are not looking at the sky; you are sitting inside of it.",
        },
        {
          title: "INTEGRATION (The Spirit in Reality):",
          text: "",
          className: "mt-2",
        },
        { title: "The Intention: ", text: '"I am the dreamer and the dream."' },
        {
          title: "The Action: ",
          text: "Today, I will remember that I am a localized expression of the Universe experiencing itself.",
        },
        {
          title: "The Reality Check: ",
          text: "I am not small; I am infinite awareness in a human form.",
        },
      ],
    },
  },
}
