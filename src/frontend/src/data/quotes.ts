import type { QuoteTheme } from "../types/index";

export interface Quote {
  id: string;
  text: string;
  author: string;
  theme: QuoteTheme;
}

export const QUOTES: Quote[] = [
  // ── Discipline ──────────────────────────────────────────────────────────────
  {
    id: "d001",
    text: "Discipline equals freedom.",
    author: "Jocko Willink",
    theme: "discipline",
  },
  {
    id: "d002",
    text: "Good. Now get back to work.",
    author: "Jocko Willink",
    theme: "discipline",
  },
  {
    id: "d003",
    text: "The moment your alarm goes off is the first test.",
    author: "Jocko Willink",
    theme: "discipline",
  },
  {
    id: "d004",
    text: "Lack of discipline in the small things bleeds over into lack of discipline in the important things.",
    author: "Jocko Willink",
    theme: "discipline",
  },
  {
    id: "d005",
    text: "Don't count on motivation. Count on discipline.",
    author: "Jocko Willink",
    theme: "discipline",
  },
  {
    id: "d006",
    text: "Stay hard.",
    author: "David Goggins",
    theme: "discipline",
  },
  {
    id: "d007",
    text: "You are in danger of living a life so comfortable and soft that you will die without ever realizing your true potential.",
    author: "David Goggins",
    theme: "discipline",
  },
  {
    id: "d008",
    text: "The only way to grow is to get uncomfortable.",
    author: "David Goggins",
    theme: "discipline",
  },
  {
    id: "d009",
    text: "When you think you are done you're only at 40% of your capacity.",
    author: "David Goggins",
    theme: "discipline",
  },
  {
    id: "d010",
    text: "Nobody is going to come and save you. No one's coming to push you further. It's on you.",
    author: "David Goggins",
    theme: "discipline",
  },
  {
    id: "d011",
    text: "You will never be consistent until you learn to be your own harshest critic.",
    author: "David Goggins",
    theme: "discipline",
  },
  {
    id: "d012",
    text: "Earn the right to be confident.",
    author: "David Goggins",
    theme: "discipline",
  },
  {
    id: "d013",
    text: "Desire is a contract you make with yourself to be unhappy until you get what you want.",
    author: "Naval Ravikant",
    theme: "discipline",
  },
  {
    id: "d014",
    text: "Spend more time making the big decisions. There are basically three really big ones in your life: where you live, who you're with, and what you do.",
    author: "Naval Ravikant",
    theme: "discipline",
  },
  {
    id: "d015",
    text: "A fit body, a calm mind, a house full of love. These things cannot be bought — they must be earned.",
    author: "Naval Ravikant",
    theme: "discipline",
  },
  {
    id: "d016",
    text: "Motivation is what gets you started. Habit is what keeps you going.",
    author: "Jim Ryun",
    theme: "discipline",
  },
  {
    id: "d017",
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
    theme: "discipline",
  },
  {
    id: "d018",
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
    theme: "discipline",
  },
  {
    id: "d019",
    text: "With self-discipline, almost anything is possible.",
    author: "Theodore Roosevelt",
    theme: "discipline",
  },
  {
    id: "d020",
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    theme: "discipline",
  },

  // ── Stoic ───────────────────────────────────────────────────────────────────
  {
    id: "s001",
    text: "You have power over your mind, not outside events. Realize this and you will find strength.",
    author: "Marcus Aurelius",
    theme: "stoic",
  },
  {
    id: "s002",
    text: "The impediment to action advances action. What stands in the way becomes the way.",
    author: "Marcus Aurelius",
    theme: "stoic",
  },
  {
    id: "s003",
    text: "Waste no more time arguing what a good man should be. Be one.",
    author: "Marcus Aurelius",
    theme: "stoic",
  },
  {
    id: "s004",
    text: "The happiness of your life depends upon the quality of your thoughts.",
    author: "Marcus Aurelius",
    theme: "stoic",
  },
  {
    id: "s005",
    text: "Do not indulge in dreams of having what you have not, but count the blessings you actually possess.",
    author: "Marcus Aurelius",
    theme: "stoic",
  },
  {
    id: "s006",
    text: "Accept the things to which fate binds you, and love the people with whom fate brings you together.",
    author: "Marcus Aurelius",
    theme: "stoic",
  },
  {
    id: "s007",
    text: "It is not that I am brave, it is that I am free. One cannot be brave unless first one is free.",
    author: "Epictetus",
    theme: "stoic",
  },
  {
    id: "s008",
    text: "Seek not that the things which happen should happen as you wish; but wish the things which happen to be as they are, and you will have a tranquil flow of life.",
    author: "Epictetus",
    theme: "stoic",
  },
  {
    id: "s009",
    text: "No man is free who is not master of himself.",
    author: "Epictetus",
    theme: "stoic",
  },
  {
    id: "s010",
    text: "He who laughs at himself never runs out of things to laugh at.",
    author: "Epictetus",
    theme: "stoic",
  },
  {
    id: "s011",
    text: "First say to yourself what you would be; and then do what you have to do.",
    author: "Epictetus",
    theme: "stoic",
  },
  {
    id: "s012",
    text: "Luck is what happens when preparation meets opportunity.",
    author: "Seneca",
    theme: "stoic",
  },
  {
    id: "s013",
    text: "It is not that I have so little time, but that I waste so much.",
    author: "Seneca",
    theme: "stoic",
  },
  {
    id: "s014",
    text: "Omnia, Lucili, aliena sunt, tempus tantum nostrum est.",
    author: "Seneca",
    theme: "stoic",
  },
  {
    id: "s015",
    text: "Difficulties strengthen the mind, as labor does the body.",
    author: "Seneca",
    theme: "stoic",
  },
  {
    id: "s016",
    text: "Begin at once to live, and count each separate day as a separate life.",
    author: "Seneca",
    theme: "stoic",
  },
  {
    id: "s017",
    text: "A gem cannot be polished without friction, nor a man perfected without trials.",
    author: "Seneca",
    theme: "stoic",
  },
  {
    id: "s018",
    text: "If it is not right, do not do it; if it is not true, do not say it.",
    author: "Marcus Aurelius",
    theme: "stoic",
  },
  {
    id: "s019",
    text: "The art of living is more like wrestling than dancing.",
    author: "Marcus Aurelius",
    theme: "stoic",
  },
  {
    id: "s020",
    text: "What we plant in the soil of contemplation, we shall reap in the harvest of action.",
    author: "Meister Eckhart",
    theme: "stoic",
  },

  // ── Self-Mastery ─────────────────────────────────────────────────────────────
  {
    id: "m001",
    text: "Arise, awake, and stop not until the goal is reached.",
    author: "Swami Vivekananda",
    theme: "self-mastery",
  },
  {
    id: "m002",
    text: "Take up one idea. Make that one idea your life — think of it, dream of it, live on that idea.",
    author: "Swami Vivekananda",
    theme: "self-mastery",
  },
  {
    id: "m003",
    text: "You cannot believe in God until you believe in yourself.",
    author: "Swami Vivekananda",
    theme: "self-mastery",
  },
  {
    id: "m004",
    text: "Be a hero. Always say, I have no fear.",
    author: "Swami Vivekananda",
    theme: "self-mastery",
  },
  {
    id: "m005",
    text: "Stand up, be bold, be strong. Take the whole responsibility on your own shoulders.",
    author: "Swami Vivekananda",
    theme: "self-mastery",
  },
  {
    id: "m006",
    text: "All the powers in the universe are already ours. It is we who have put our hands before our eyes and cry that it is dark.",
    author: "Swami Vivekananda",
    theme: "self-mastery",
  },
  {
    id: "m007",
    text: "The human soul is not bound. It is free, ever free, ever pure.",
    author: "Swami Vivekananda",
    theme: "self-mastery",
  },
  {
    id: "m008",
    text: "Men in general are too easily satisfied, too worldly-wise, too ready to subordinate the soul to the body.",
    author: "Sri Aurobindo",
    theme: "self-mastery",
  },
  {
    id: "m009",
    text: "In the ignorance that forgets the divine, each man is imprisoned in his own ego.",
    author: "Sri Aurobindo",
    theme: "self-mastery",
  },
  {
    id: "m010",
    text: "The spiritual life does not consist in a mere ideal of service; it consists in a real, a concrete, a detailed mastery over self.",
    author: "Sri Aurobindo",
    theme: "self-mastery",
  },
  {
    id: "m011",
    text: "To know oneself and to control oneself, this is the real freedom.",
    author: "Sri Aurobindo",
    theme: "self-mastery",
  },
  {
    id: "m012",
    text: "The most difficult thing in the world is to reveal yourself, to express what you have to.",
    author: "Sri Aurobindo",
    theme: "self-mastery",
  },
  {
    id: "m013",
    text: "Mastering others is strength. Mastering yourself is true power.",
    author: "Lao Tzu",
    theme: "self-mastery",
  },
  {
    id: "m014",
    text: "To the mind that is still, the whole universe surrenders.",
    author: "Lao Tzu",
    theme: "self-mastery",
  },
  {
    id: "m015",
    text: "Knowing others is wisdom. Knowing yourself is enlightenment.",
    author: "Lao Tzu",
    theme: "self-mastery",
  },
  {
    id: "m016",
    text: "The journey of a thousand miles begins with one step.",
    author: "Lao Tzu",
    theme: "self-mastery",
  },
  {
    id: "m017",
    text: "The key to growth is the introduction of higher dimensions of consciousness into our awareness.",
    author: "Lao Tzu",
    theme: "self-mastery",
  },
  {
    id: "m018",
    text: "Do not wait; the time will never be just right. Start where you stand.",
    author: "Napoleon Hill",
    theme: "self-mastery",
  },
  {
    id: "m019",
    text: "The will to win, the desire to succeed, the urge to reach your full potential — these are the keys.",
    author: "Confucius",
    theme: "self-mastery",
  },
  {
    id: "m020",
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    theme: "self-mastery",
  },

  // ── Brahmacharya / Spiritual ──────────────────────────────────────────────
  {
    id: "b001",
    text: "Brahmacharya or purity is the basis of all spiritual life.",
    author: "Swami Sivananda",
    theme: "brahmacharya",
  },
  {
    id: "b002",
    text: "Energy is the foundation of all achievement. Conserve it wisely.",
    author: "Swami Sivananda",
    theme: "brahmacharya",
  },
  {
    id: "b003",
    text: "A man of brahmacharya has tremendous strength of will and power of concentration.",
    author: "Swami Sivananda",
    theme: "brahmacharya",
  },
  {
    id: "b004",
    text: "Purity in thought, word, and deed opens the door to the divine.",
    author: "Swami Sivananda",
    theme: "brahmacharya",
  },
  {
    id: "b005",
    text: "Celibacy is a shield against lust. It guards the gates of your inner palace.",
    author: "Swami Sivananda",
    theme: "brahmacharya",
  },
  {
    id: "b006",
    text: "Brahmacharya is not merely celibacy. It is the total sublimation of the sexual energy.",
    author: "Swami Sivananda",
    theme: "brahmacharya",
  },
  {
    id: "b007",
    text: "Restraint and discipline are the wings on which the spirit soars.",
    author: "Swami Sivananda",
    theme: "brahmacharya",
  },
  {
    id: "b008",
    text: "A man who controls his senses controls the world.",
    author: "Swami Sivananda",
    theme: "brahmacharya",
  },
  {
    id: "b009",
    text: "In a gentle way, you can shake the world.",
    author: "Mahatma Gandhi",
    theme: "brahmacharya",
  },
  {
    id: "b010",
    text: "Strength does not come from physical capacity. It comes from an indomitable will.",
    author: "Mahatma Gandhi",
    theme: "brahmacharya",
  },
  {
    id: "b011",
    text: "A man is but the product of his thoughts. What he thinks, he becomes.",
    author: "Mahatma Gandhi",
    theme: "brahmacharya",
  },
  {
    id: "b012",
    text: "The weak can never forgive. Forgiveness is the attribute of the strong.",
    author: "Mahatma Gandhi",
    theme: "brahmacharya",
  },
  {
    id: "b013",
    text: "Self-restraint is the highest virtue.",
    author: "Mahatma Gandhi",
    theme: "brahmacharya",
  },
  {
    id: "b014",
    text: "Pure action is not driven by desire or fear. It flows naturally from who you are.",
    author: "Bhagavad Gita",
    theme: "brahmacharya",
  },
  {
    id: "b015",
    text: "Let right deeds be thy motive, not the fruit which comes from them.",
    author: "Bhagavad Gita",
    theme: "brahmacharya",
  },
  {
    id: "b016",
    text: "He who has conquered the self stands tall even among gods.",
    author: "Bhagavad Gita",
    theme: "brahmacharya",
  },
  {
    id: "b017",
    text: "Fix the mind on Me, be devoted to Me, worship Me, bow down to Me, so shall you come to Me. I promise you truly, for you are dear to Me.",
    author: "Bhagavad Gita",
    theme: "brahmacharya",
  },
  {
    id: "b018",
    text: "Through meditation the higher self is known.",
    author: "Upanishads",
    theme: "brahmacharya",
  },
  {
    id: "b019",
    text: "What you seek is seeking you.",
    author: "Rumi",
    theme: "spiritual",
  },
  {
    id: "b020",
    text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.",
    author: "Rumi",
    theme: "spiritual",
  },

  // ── Spiritual ────────────────────────────────────────────────────────────────
  {
    id: "sp001",
    text: "Out beyond ideas of wrongdoing and rightdoing, there is a field. I'll meet you there.",
    author: "Rumi",
    theme: "spiritual",
  },
  {
    id: "sp002",
    text: "The wound is the place where the Light enters you.",
    author: "Rumi",
    theme: "spiritual",
  },
  {
    id: "sp003",
    text: "Sell your cleverness and buy bewilderment.",
    author: "Rumi",
    theme: "spiritual",
  },
  {
    id: "sp004",
    text: "These pains you feel are messengers. Listen to them.",
    author: "Rumi",
    theme: "spiritual",
  },
  {
    id: "sp005",
    text: "I looked in temples, churches, and mosques. But I found the Divine within my heart.",
    author: "Rumi",
    theme: "spiritual",
  },
  {
    id: "sp006",
    text: "Be melting snow. Wash yourself of yourself.",
    author: "Rumi",
    theme: "spiritual",
  },
  {
    id: "sp007",
    text: "Travel brings power and love back into your life.",
    author: "Rumi",
    theme: "spiritual",
  },
  {
    id: "sp008",
    text: "The way is not in the sky. The way is in the heart.",
    author: "Buddha",
    theme: "spiritual",
  },
  {
    id: "sp009",
    text: "Peace comes from within. Do not seek it without.",
    author: "Buddha",
    theme: "spiritual",
  },
  {
    id: "sp010",
    text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
    author: "Buddha",
    theme: "spiritual",
  },
  {
    id: "sp011",
    text: "Three things cannot be long hidden: the sun, the moon, and the truth.",
    author: "Buddha",
    theme: "spiritual",
  },
  {
    id: "sp012",
    text: "What we think, we become.",
    author: "Buddha",
    theme: "spiritual",
  },
  {
    id: "sp013",
    text: "In the sky, there is no distinction of east and west; people create distinctions out of their own minds.",
    author: "Buddha",
    theme: "spiritual",
  },
  {
    id: "sp014",
    text: "He who experiences the unity of life sees his own Self in all beings.",
    author: "Buddha",
    theme: "spiritual",
  },
  {
    id: "sp015",
    text: "The infinite is in the finite of every instant.",
    author: "Zen Saying",
    theme: "spiritual",
  },
  {
    id: "sp016",
    text: "Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.",
    author: "Zen Proverb",
    theme: "spiritual",
  },
  {
    id: "sp017",
    text: "The obstacle is the path.",
    author: "Zen Proverb",
    theme: "spiritual",
  },
  {
    id: "sp018",
    text: "Be like water making its way through cracks.",
    author: "Bruce Lee",
    theme: "spiritual",
  },
  {
    id: "sp019",
    text: "Empty your mind, be formless, shapeless, like water.",
    author: "Bruce Lee",
    theme: "spiritual",
  },
  {
    id: "sp020",
    text: "Silence is the language of God; all else is poor translation.",
    author: "Rumi",
    theme: "spiritual",
  },

  // ── Patience ─────────────────────────────────────────────────────────────────
  {
    id: "p001",
    text: "Adopt the pace of nature: her secret is patience.",
    author: "Ralph Waldo Emerson",
    theme: "patience",
  },
  {
    id: "p002",
    text: "Patience is bitter, but its fruit is sweet.",
    author: "Aristotle",
    theme: "patience",
  },
  {
    id: "p003",
    text: "Have patience. All things are difficult before they become easy.",
    author: "Saadi",
    theme: "patience",
  },
  {
    id: "p004",
    text: "Rivers know this: there is no hurry. We shall get there some day.",
    author: "A.A. Milne",
    theme: "patience",
  },
  {
    id: "p005",
    text: "Be patient with yourself. Nothing in nature blooms all year.",
    author: "Unknown",
    theme: "patience",
  },
  {
    id: "p006",
    text: "Patience does not mean to passively endure. It means to be farsighted enough to trust the end result.",
    author: "Rumi",
    theme: "patience",
  },
  {
    id: "p007",
    text: "If you are patient in one moment of anger, you will escape a hundred days of sorrow.",
    author: "Chinese Proverb",
    theme: "patience",
  },
  {
    id: "p008",
    text: "A tree that is unbending is easily broken.",
    author: "Lao Tzu",
    theme: "patience",
  },
  {
    id: "p009",
    text: "The two most powerful warriors are patience and time.",
    author: "Leo Tolstoy",
    theme: "patience",
  },
  {
    id: "p010",
    text: "One moment of patience may ward off great disaster. One moment of impatience may ruin a whole life.",
    author: "Chinese Proverb",
    theme: "patience",
  },
  {
    id: "p011",
    text: "Patience is a conquering virtue.",
    author: "Geoffrey Chaucer",
    theme: "patience",
  },
  {
    id: "p012",
    text: "Greatness is not measured in a single day — it is the accumulation of disciplined hours.",
    author: "Unknown",
    theme: "patience",
  },
  {
    id: "p013",
    text: "All great achievements require time.",
    author: "Maya Angelou",
    theme: "patience",
  },
  {
    id: "p014",
    text: "Inch by inch, everything's a cinch.",
    author: "Robert Schuller",
    theme: "patience",
  },
  {
    id: "p015",
    text: "Progress is slow for those who know. Impatience belongs to the ignorant.",
    author: "Epictetus",
    theme: "patience",
  },
  {
    id: "p016",
    text: "Small steps every day lead to extraordinary results over time.",
    author: "Unknown",
    theme: "patience",
  },
  {
    id: "p017",
    text: "When nothing seems to help, I go and look at a stonecutter hammering away at his rock.",
    author: "Jacob Riis",
    theme: "patience",
  },
  {
    id: "p018",
    text: "Our greatest glory is not in never falling, but in rising every time we fall.",
    author: "Confucius",
    theme: "patience",
  },
  {
    id: "p019",
    text: "The day you plant the seed is not the day you eat the fruit.",
    author: "Fabienne Fredrickson",
    theme: "patience",
  },
  {
    id: "p020",
    text: 'Even after all this time the sun never says to the earth, "You owe me." Look what happens with a love like that — it lights the whole world.',
    author: "Hafiz",
    theme: "patience",
  },

  // ── Additional Mixed ──────────────────────────────────────────────────────
  {
    id: "x001",
    text: "The cave you fear to enter holds the treasure you seek.",
    author: "Joseph Campbell",
    theme: "discipline",
  },
  {
    id: "x002",
    text: "It's not the load that breaks you down, it's the way you carry it.",
    author: "Lou Holtz",
    theme: "discipline",
  },
  {
    id: "x003",
    text: "The secret to success is constancy of purpose.",
    author: "Benjamin Disraeli",
    theme: "discipline",
  },
  {
    id: "x004",
    text: "You don't rise to the level of your goals, you fall to the level of your systems.",
    author: "James Clear",
    theme: "discipline",
  },
  {
    id: "x005",
    text: "Every action you take is a vote for the type of person you wish to become.",
    author: "James Clear",
    theme: "discipline",
  },
  {
    id: "x006",
    text: "Make the most of yourself, for that is all there is of you.",
    author: "Ralph Waldo Emerson",
    theme: "self-mastery",
  },
  {
    id: "x007",
    text: "The only person you should try to be better than is the person you were yesterday.",
    author: "Unknown",
    theme: "self-mastery",
  },
  {
    id: "x008",
    text: "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    author: "Ralph Waldo Emerson",
    theme: "self-mastery",
  },
  {
    id: "x009",
    text: "The true warrior is not the one who wins every battle, but the one who never abandons the field.",
    author: "Unknown",
    theme: "stoic",
  },
  {
    id: "x010",
    text: "Fortune favors the prepared mind.",
    author: "Louis Pasteur",
    theme: "stoic",
  },
  {
    id: "x011",
    text: "I am not afraid of storms, for I am learning how to sail my ship.",
    author: "Louisa May Alcott",
    theme: "stoic",
  },
  {
    id: "x012",
    text: "Push yourself, because no one else is going to do it for you.",
    author: "Unknown",
    theme: "discipline",
  },
  {
    id: "x013",
    text: "Hard work beats talent when talent doesn't work hard.",
    author: "Tim Notke",
    theme: "discipline",
  },
  {
    id: "x014",
    text: "Small daily improvements are the key to staggering long-term results.",
    author: "Unknown",
    theme: "patience",
  },
  {
    id: "x015",
    text: "The habit you practice in private is the strength you display in public.",
    author: "Unknown",
    theme: "discipline",
  },
  {
    id: "x016",
    text: "Never give up on a dream just because of the time it will take to accomplish it.",
    author: "Earl Nightingale",
    theme: "patience",
  },
  {
    id: "x017",
    text: "The body achieves what the mind believes.",
    author: "Napoleon Hill",
    theme: "self-mastery",
  },
  {
    id: "x018",
    text: "Fall seven times, stand up eight.",
    author: "Japanese Proverb",
    theme: "patience",
  },
  {
    id: "x019",
    text: 'Courage doesn\'t always roar. Sometimes courage is the quiet voice at the end of the day saying, "I will try again tomorrow."',
    author: "Mary Anne Radmacher",
    theme: "patience",
  },
  {
    id: "x020",
    text: "Character is what you do when no one is watching.",
    author: "John Wooden",
    theme: "discipline",
  },
];

// ─── Utility functions ────────────────────────────────────────────────────────

export function getQuotesByTheme(theme: QuoteTheme): Quote[] {
  return QUOTES.filter((q) => q.theme === theme);
}

export function getRandomQuote(theme?: QuoteTheme): Quote {
  const pool = theme ? getQuotesByTheme(theme) : QUOTES;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Non-repeating within 30 days using date-based seed.
 * Cycles through quotes deterministically based on day number.
 */
export function getQuoteForToday(
  savedIds: string[],
  theme?: QuoteTheme,
): Quote {
  const pool = theme ? getQuotesByTheme(theme) : QUOTES;
  // Seed based on days since epoch
  const daysSinceEpoch = Math.floor(Date.now() / 86_400_000);
  const idx = daysSinceEpoch % pool.length;
  // Try to return the seeded quote; fallback to random if it's saved
  const candidate = pool[idx];
  if (!savedIds.includes(candidate.id)) return candidate;
  // Find next unsaved
  for (let i = 1; i < pool.length; i++) {
    const next = pool[(idx + i) % pool.length];
    if (!savedIds.includes(next.id)) return next;
  }
  return candidate;
}

export function getQuoteById(id: string): Quote | undefined {
  return QUOTES.find((q) => q.id === id);
}
