import { mod } from "./sheetMath";

export interface WordLine {
  words: string[];
  sentence: string;
}

export interface PhonicsItem {
  word: string;
  note: string;
  irregular: string;
}

export interface MarkedSentence {
  text: string;
  kind: string;
}

export interface Reading {
  text: string;
  question: string;
  answer: string;
}

export interface AffixItem {
  word: string;
  split: string;
  affix: string;
  meaning: string;
}

export interface JoinItem {
  left: string;
  right: string;
  join: boolean;
  answer: string;
}

export interface MeaningItem {
  word: string;
  parts: string;
  meaning: string;
}

export interface GrammarPick {
  sentence: string;
  answer: string;
}

export interface FinishItem {
  word: string;
  meaning: string;
  stem: string;
  ending: string;
}

export interface ShiftItem {
  before: string;
  after: string;
  answer: string;
}

const CVC: Record<string, readonly string[]> = {
  a: ["cat", "map", "hat"],
  b: ["bat", "bed", "bus"],
  c: ["cup", "cap", "cot"],
  d: ["dog", "dig", "dad"],
  e: ["bed", "pen", "red"],
  f: ["fan", "fog", "fin"],
  g: ["gas", "got", "gap"],
  h: ["hat", "hop", "hen"],
  i: ["sit", "pin", "pig"],
  j: ["jam", "jet", "jog"],
  k: ["kit", "kid", "keg"],
  l: ["log", "lip", "lap"],
  m: ["map", "mud", "men"],
  n: ["nap", "net", "nut"],
  o: ["hot", "pot", "top"],
  p: ["pan", "pet", "pop"],
  q: ["quiz"],
  r: ["rat", "red", "run"],
  s: ["sun", "sit", "sad"],
  t: ["top", "ten", "tap"],
  u: ["bus", "cup", "sun"],
  v: ["van", "vet"],
  w: ["wet", "win", "wag"],
  x: ["box", "fox", "six"],
  y: ["yes", "yam", "yak"],
  z: ["zip", "zap"],
};

export function cvcFor(letter: string, slot: number): string {
  const list = CVC[letter] ?? CVC.a;
  return list[mod(slot, list.length)];
}

export function pick<T>(items: readonly T[], slot: number): T {
  return items[mod(slot, items.length)];
}

export const KINDER_LINES: readonly WordLine[] = [
  { words: ["I", "see"], sentence: "I see a cat." },
  { words: ["the", "dog"], sentence: "The dog can run." },
  { words: ["we", "go"], sentence: "We go to school." },
  { words: ["my", "hat"], sentence: "My hat is red." },
  { words: ["look", "at"], sentence: "Look at the bus." },
  { words: ["can", "you"], sentence: "Can you hop?" },
  { words: ["is", "on"], sentence: "The cup is on the mat." },
  { words: ["and", "big"], sentence: "A big dog and a cat." },
];

export const GRADE2_PHONICS: readonly PhonicsItem[] = [
  { word: "stop", note: "stop begins with the blend st", irregular: "said" },
  { word: "ship", note: "ship begins with the digraph sh", irregular: "they" },
  { word: "cake", note: "cake has a silent e, so a says its name", irregular: "were" },
  { word: "basket", note: "basket has two syllables: bas-ket", irregular: "because" },
  { word: "brush", note: "brush begins with the blend br", irregular: "could" },
  { word: "phone", note: "phone begins with the digraph ph", irregular: "would" },
  { word: "stone", note: "stone has a silent e, so o says its name", irregular: "their" },
  { word: "window", note: "window has two syllables: win-dow", irregular: "people" },
];

export const GRADE2_SENTENCES: readonly MarkedSentence[] = [
  { text: "The bus stops here.", kind: "telling" },
  { text: "Where is the market?", kind: "asking" },
  { text: "Line up at the door.", kind: "commanding" },
  { text: "What a cold morning!", kind: "exclaiming" },
  { text: "Leaves cover the path.", kind: "telling" },
  { text: "Can you see the stop?", kind: "asking" },
  { text: "Bring your hat inside.", kind: "commanding" },
  { text: "The yard is so muddy!", kind: "exclaiming" },
];

export const GRADE2_PASSAGES: readonly Reading[] = [
  {
    text: "The market opens early. A baker sets out buns. Children count the buns in twos. The last bun goes to a neighbour.",
    question: "What happens to the last bun?",
    answer: "A neighbour receives it.",
  },
  {
    text: "Rain hits the bus window. Maya wipes a little circle. She sees the school sign. The bus door opens.",
    question: "How can Maya see the school sign?",
    answer: "She clears a spot on the wet glass.",
  },
  {
    text: "Recess starts at the bell. The yard has a puddle by the fence. Two friends walk around it. They still reach the slide first.",
    question: "Why do the friends change their path?",
    answer: "Water is blocking the straight way.",
  },
  {
    text: "Leaves cover the path to the park. Sam rakes a strip. His sister bags what he rakes. They finish before supper.",
    question: "How do the two children clear the path?",
    answer: "One gathers the leaves and the other bags them.",
  },
  {
    text: "The library is quiet after lunch. A boy chooses a book about trucks. He reads the first page twice. Then he takes the book home.",
    question: "Where will he read the book next?",
    answer: "He will continue it at home.",
  },
  {
    text: "Snow falls before school. The sidewalk is white. A neighbour shovels a path. Boots stay dry on the way in.",
    question: "What keeps the boots dry?",
    answer: "Someone cleared a walking strip.",
  },
  {
    text: "The class plants beans in cups. They set the cups in the sun. Green shoots show up on Friday. The class draws those shoots.",
    question: "What do the students record?",
    answer: "They draw the new growth.",
  },
  {
    text: "The corner store has apples in a bin. Priya picks three red ones. She pays with coins. The clerk gives her a bag.",
    question: "How does Priya carry the fruit?",
    answer: "The clerk hands her a bag.",
  },
];

export const GRADE3_AFFIXES: readonly AffixItem[] = [
  { word: "replay", split: "re-play", affix: "re-", meaning: "play again" },
  { word: "unlock", split: "un-lock", affix: "un-", meaning: "the opposite of lock" },
  { word: "painted", split: "paint-ed", affix: "-ed", meaning: "paint in the past" },
  { word: "jumping", split: "jump-ing", affix: "-ing", meaning: "jump happening now" },
  { word: "kittens", split: "kitten-s", affix: "-s", meaning: "more than one kitten" },
  { word: "reread", split: "re-read", affix: "re-", meaning: "read again" },
  { word: "unpack", split: "un-pack", affix: "un-", meaning: "the opposite of pack" },
  { word: "singing", split: "sing-ing", affix: "-ing", meaning: "sing happening now" },
];

export const GRADE3_JOINS: readonly JoinItem[] = [
  { left: "The rain started.", right: "We went inside.", join: true, answer: "The rain started, and we went inside." },
  { left: "The bell rang.", right: "Please line up.", join: false, answer: "The bell rang. Please line up." },
  { left: "The bus was late.", right: "We waited on the bench.", join: true, answer: "The bus was late, and we waited on the bench." },
  { left: "Close the gate.", right: "The wind is strong.", join: false, answer: "Close the gate. The wind is strong." },
  { left: "Sam raked the path.", right: "His sister held the bag.", join: true, answer: "Sam raked the path, and his sister held the bag." },
  { left: "Look at the clock.", right: "It is time for math.", join: false, answer: "Look at the clock. It is time for math." },
  { left: "The market was busy.", right: "The baker sold every bun.", join: true, answer: "The market was busy, and the baker sold every bun." },
  { left: "Bring a pencil.", right: "Do not run.", join: false, answer: "Bring a pencil. Do not run." },
];

export const GRADE3_PASSAGES: readonly Reading[] = [
  {
    text: "Before the shops opened, a baker counted trays of buns. She wrote the number on a card so the clerk would know what was ready. By the time the door opened, the card said the trays were full.",
    question: "Why did the baker write on the card?",
    answer: "So the clerk would know the trays were ready.",
  },
  {
    text: "The class watched a puddle in the school yard. On Monday it reached the bench. By Wednesday the sun had shrunk it to a dark patch. On Friday the patch was gone.",
    question: "What happened to the puddle during the week?",
    answer: "It dried up by the last school day.",
  },
  {
    text: "Jonah missed the first bus because his boot was untied. He sat on the bench and tied it before the next bus came. He still reached school before the bell.",
    question: "What did Jonah do while he waited?",
    answer: "He fastened the loose boot.",
  },
  {
    text: "A robin built a nest in the garden bush. Students used the path around the bush instead of the shortcut. From that path they could see the nest and leave it alone.",
    question: "How did the students leave the nest alone?",
    answer: "They stayed on the long way around the bush.",
  },
  {
    text: "The library window faced the storm. Readers moved their books away from the glass. When the rain stopped, the books were still dry.",
    question: "Why were the books dry after the storm?",
    answer: "Readers had moved them back from the wet glass.",
  },
  {
    text: "Priya's plant leaned toward the window. She turned the pot each morning. After a week the stem stood up straight.",
    question: "What changed after Priya turned the pot?",
    answer: "The stem grew upright.",
  },
  {
    text: "The rink opened at four. Skaters who arrived early helped shovel a thin line of snow off the ice. Practice started on clear ice.",
    question: "What did the early skaters do?",
    answer: "They cleared snow so practice could start.",
  },
  {
    text: "The market seller stacked apples in rows of five. A child counted four full rows and then two more apples. The seller nodded and put them in a bag.",
    question: "How were the apples grouped before the last two?",
    answer: "They sat in rows of five.",
  },
];

export const GRADE4_MEANINGS: readonly MeaningItem[] = [
  { word: "unhappy", parts: "un- + happy", meaning: "not happy" },
  { word: "replay", parts: "re- + play", meaning: "play again" },
  { word: "careful", parts: "care + -ful", meaning: "full of care" },
  { word: "preview", parts: "pre- + view", meaning: "a look before" },
  { word: "teacher", parts: "teach + -er", meaning: "a person who teaches" },
  { word: "kindness", parts: "kind + -ness", meaning: "being kind" },
  { word: "disagree", parts: "dis- + agree", meaning: "not agree" },
  { word: "hopeful", parts: "hope + -ful", meaning: "full of hope" },
];

export const GRADE4_GRAMMAR: readonly GrammarPick[] = [
  { sentence: "The red bus waits.", answer: "Noun: bus. Verb: waits. Adjective: red." },
  { sentence: "Cold wind shakes the tent.", answer: "Noun: wind. Verb: shakes. Adjective: cold." },
  { sentence: "A small dog sleeps.", answer: "Noun: dog. Verb: sleeps. Adjective: small." },
  { sentence: "The busy market closes.", answer: "Noun: market. Verb: closes. Adjective: busy." },
  { sentence: "Wet leaves cover the path.", answer: "Noun: leaves. Verb: cover. Adjective: wet." },
  { sentence: "The late bus arrives.", answer: "Noun: bus. Verb: arrives. Adjective: late." },
  { sentence: "Bright sun warms the yard.", answer: "Noun: sun. Verb: warms. Adjective: bright." },
  { sentence: "A quiet class reads.", answer: "Noun: class. Verb: reads. Adjective: quiet." },
];

export const GRADE4_PASSAGES: readonly Reading[] = [
  {
    text: "The creek stones Maya usually crossed were under brown water. She walked upstream to the footbridge, even though it made her late. Her boots stayed out of the creek.",
    question: "What conclusion does the text support?",
    answer: "Maya chose the bridge so she would not have to step in the water.",
  },
  {
    text: "The seller priced four apples at $2 and three apples at $1.50. A shopper compared the two signs before choosing. The shopper took the sign with the lower price for one apple.",
    question: "What did the shopper use to decide?",
    answer: "The shopper compared the price of a single apple.",
  },
  {
    text: "Students tallied the ways they came to school. Most marks were in the bus column. Only a few marks were in the car column.",
    question: "What conclusion does the tally support?",
    answer: "More students used the bus than a car.",
  },
  {
    text: "The class measured the garden in metres. The long side was 6 m and the short side was 4 m. They multiplied those lengths to find how much ground the garden covered.",
    question: "How did the class find the ground the garden covered?",
    answer: "They multiplied the two side lengths.",
  },
  {
    text: "A sign said the trail was closed after the storm. Walkers used the road instead. The closed trail stayed empty all morning.",
    question: "What conclusion does the text support about the morning?",
    answer: "Walkers kept off the trail that the sign had closed.",
  },
  {
    text: "The thermometer by the window read 2 degrees higher than the one in the hall. Both were above zero. The window spot was the warmer of the two.",
    question: "Which place was warmer?",
    answer: "The spot beside the window was warmer.",
  },
  {
    text: "Lena's first serve hit the net. She looked at the service line and tried again. The second serve landed inside the box.",
    question: "What changed on the second try?",
    answer: "The ball landed in the service box.",
  },
  {
    text: "The library set a limit of four books for the week. Jonah already had three. He chose one more and stopped.",
    question: "Why did Jonah stop at one more book?",
    answer: "One more book reached the weekly limit.",
  },
];

export const GRADE6_WORDS: readonly FinishItem[] = [
  { word: "habitat", meaning: "the place a living thing uses as its home", stem: "A frog's habitat is", ending: "a wet place, such as a pond" },
  { word: "climate", meaning: "the usual weather of a place over many years", stem: "A snowy climate means", ending: "cold weather is common there year after year" },
  { word: "fraction", meaning: "a number that names part of a whole", stem: "One half is a fraction because", ending: "it names one of two equal parts" },
  { word: "integer", meaning: "a whole number that can be positive, negative, or zero", stem: "A temperature of −3°C is an integer because", ending: "it is a whole number below zero" },
  { word: "percent", meaning: "a part of 100", stem: "Fifty percent of a class means", ending: "50 out of every 100 students" },
  { word: "erosion", meaning: "the wearing away of soil or rock", stem: "Rain can cause erosion when", ending: "it washes soil off a bare slope" },
  { word: "average", meaning: "a typical amount found by levelling a set of numbers", stem: "The average rainfall tells", ending: "about how much rain is usual" },
  { word: "quotient", meaning: "the result of a division", stem: "In 12 ÷ 3 = 4, the quotient is", ending: "4" },
];

export const GRADE6_GRAMMAR: readonly MarkedSentence[] = [
  { text: "Snow fell all morning.", kind: "simple" },
  { text: "The market closed, and the bus left.", kind: "compound" },
  { text: "Students measured the garden.", kind: "simple" },
  { text: "The trail was muddy, so the class used the road.", kind: "compound" },
  { text: "Priya compared the two prices.", kind: "simple" },
  { text: "The sun came out, but the yard stayed wet.", kind: "compound" },
  { text: "A graph can show a change over time.", kind: "simple" },
  { text: "The goal was $40, and she saved $5 a week.", kind: "compound" },
];

export const GRADE6_PASSAGES: readonly Reading[] = [
  {
    text: "The town measured rainfall for four weeks. The first two weeks had little rain, and the last week had the most. Gardeners waited until that last week to plant.",
    question: "What does the text support about the planting?",
    answer: "Gardeners planted after the wettest week.",
  },
  {
    text: "A bus pass costs $2 a ride, and a weekly pass costs $8. Sam rides the bus five times a week. He compared the two prices before he bought a pass.",
    question: "What comparison does the text set up?",
    answer: "Five single rides cost more than the weekly pass.",
  },
  {
    text: "The class listed factors of 36 before they shared 36 counters. They found several ways to make equal groups. Every way used a factor of 36.",
    question: "What does the text support about the equal groups?",
    answer: "Each equal group matched a factor of 36.",
  },
  {
    text: "On a January morning the sign read −4°C. By noon it read 1°C. The change moved the temperature from below zero to above zero.",
    question: "What change does the text support?",
    answer: "The morning was below freezing and noon was above it.",
  },
  {
    text: "A chart showed that 1 of 4 equal outcomes was a win. The teacher also wrote 25%. Students used both records for the same chance.",
    question: "What does the text support about the two records?",
    answer: "The fraction and the percent name the same chance.",
  },
  {
    text: "Mina wanted a $30 book. She could save $6 a week and wrote a one-sentence note that interest is pay for using someone else's money. Her plan counted only the money she saved.",
    question: "What does Mina's plan leave out?",
    answer: "Her week count does not include interest.",
  },
  {
    text: "The field was 20 m by 8 m. A second field was a parallelogram with the same base and the same height. The class expected the two areas to match.",
    question: "What conclusion does the text support?",
    answer: "The two fields cover the same area.",
  },
  {
    text: "A report said the river trail lost soil after heavy rain. The writer called that loss erosion. The next sentence said walkers should stay on the gravel.",
    question: "What action does the text support?",
    answer: "Walkers should stay on the gravel to avoid the worn soil.",
  },
];

export const GRADE7_SHIFTS: readonly ShiftItem[] = [
  { before: "The students waited.", after: "The tired students waited.", answer: "Tired is an adjective. It tells what kind of students waited." },
  { before: "The bus left.", after: "The bus left early.", answer: "Early is an adverb. It tells when the bus left." },
  { before: "Priya bought apples.", after: "Priya bought three apples.", answer: "Three is an adjective. It tells how many apples." },
  { before: "The class measured the garden.", after: "The class carefully measured the garden.", answer: "Carefully is an adverb. It tells how the class measured." },
  { before: "Walkers avoided the trail.", after: "Walkers avoided the muddy trail.", answer: "Muddy is an adjective. It tells what kind of trail." },
  { before: "The graph changed.", after: "The graph changed suddenly.", answer: "Suddenly is an adverb. It tells how the graph changed." },
  { before: "Students read the report.", after: "Students read the short report.", answer: "Short is an adjective. It tells what kind of report." },
  { before: "The skaters practised.", after: "The skaters practised outside.", answer: "Outside is an adverb. It tells where they practised." },
];

export const GRADE7_PASSAGES: readonly Reading[] = [
  {
    text: "Mina wrote that the school yard was too loud at lunch. She wanted a quiet bench by the fence. Her note does not say what the other students wanted.",
    question: "Whose view is in this note, and whose view is left out?",
    answer: "Mina's view is here. The other students' views are left out.",
  },
  {
    text: "The bus driver said the late bell was the students' fault. The note lists the stops he made. It does not include the students' reason for being late.",
    question: "Whose view is present, and what is missing?",
    answer: "The driver's view is present. The students' explanation is missing.",
  },
  {
    text: "A shopper wrote that the market prices were fair. She listed only the apples she bought. Sellers and other shoppers are not quoted.",
    question: "Whose perspective does the paragraph give?",
    answer: "It gives one shopper's view and leaves out sellers and other buyers.",
  },
  {
    text: "The coach wrote that practice should start earlier in winter. He described the dark rink. Players' views about the time change are not in the note.",
    question: "What perspective is missing?",
    answer: "The players' views about the earlier time are missing.",
  },
  {
    text: "A neighbour asked the city to clear the sidewalk by 7 a.m. She described her walk to the bus. The letter does not say how the city crew plans its routes.",
    question: "Whose view is on the page, and whose plan is left out?",
    answer: "The neighbour's view is on the page. The city crew's plan is left out.",
  },
  {
    text: "The librarian wrote that four books a week is enough. She explained the shelf space. Students who want a higher limit are not heard in the note.",
    question: "Whose perspective is left out?",
    answer: "Students who want to borrow more are left out.",
  },
  {
    text: "A scientist's caption says the creek rose because of one storm. The caption uses her measurement. It does not include a neighbour who thinks a blocked drain was the cause.",
    question: "Which explanation is present, and which is left out?",
    answer: "The storm explanation is present. The blocked-drain idea is left out.",
  },
  {
    text: "The principal wrote that the quiet bench was a success. She quoted two students who liked it. Students who still found the yard loud are not quoted.",
    question: "Whose voices are missing?",
    answer: "Students who still found the yard loud are missing.",
  },
];

export const GRADE8_PASSAGES: readonly Reading[] = [
  {
    text: "Half the class, 0.5, or 50%, chose the bus. The other half walked. The counts were equal.",
    question: "What conclusion about travel does the text support?",
    answer: "Bus riders and walkers were the same number of students.",
  },
  {
    text: "One quarter of the muffins, 0.25, or 25%, were bran. The rest were apple. Apple muffins were the larger share.",
    question: "What conclusion does the text support about the muffins?",
    answer: "Apple muffins outnumbered the bran ones.",
  },
  {
    text: "A survey said 3/4 of the class, 0.75, or 75%, wanted the rink open longer. The remaining quarter did not. The longer hours had clear support.",
    question: "What conclusion does the text support?",
    answer: "Most of the class wanted longer rink hours.",
  },
  {
    text: "The seller marked 1/5 of the apples, 0.2, or 20%, as bruised. The other 80% were sold at the full price. Most of the bin was unbruised.",
    question: "What does the text support about the bin?",
    answer: "Most apples were sold at the full price.",
  },
  {
    text: "Ten percent of the garden, which is 0.1 or 1/10, was left for beans. The rest was already planted in tomatoes. Tomatoes took almost all of the ground.",
    question: "What conclusion does the text support about the garden?",
    answer: "Tomatoes covered much more ground than beans.",
  },
  {
    text: "The coach said 2/5 of the team, 0.4, or 40%, had missed one practice. The other 60% had perfect attendance that week. Attendance was stronger than absence.",
    question: "What conclusion does the text support?",
    answer: "More players attended every practice than missed one.",
  },
  {
    text: "A report said 1/2 of the rainfall, 0.5, or 50%, fell on Thursday. The other days shared the rest. Thursday was the wettest single day in that split.",
    question: "What does the text support about Thursday?",
    answer: "Thursday alone matched all the other days together.",
  },
  {
    text: "The library found that 3/10 of the holds, 0.3, or 30%, were for science books. The other holds were for stories. Stories were the larger set of holds.",
    question: "What conclusion does the text support?",
    answer: "Story holds outnumbered science holds.",
  },
];

export const GRADE8_GRAMMAR: readonly GrammarPick[] = [
  { sentence: "The icy sidewalk slowed the bus.", answer: "Icy is an adjective. It tells what kind of sidewalk slowed the bus." },
  { sentence: "Gardeners patiently waited for the rain.", answer: "Patiently is an adverb. It tells how the gardeners waited." },
  { sentence: "A weekly pass costs less for five rides.", answer: "Weekly is an adjective. It tells what kind of pass." },
  { sentence: "The temperature rose suddenly after noon.", answer: "Suddenly is an adverb. It tells how the temperature rose." },
  { sentence: "Equal groups made the sharing fair.", answer: "Equal is an adjective. It tells what kind of groups." },
  { sentence: "Students carefully compared the two prices.", answer: "Carefully is an adverb. It tells how they compared the prices." },
  { sentence: "The parallel lines made matching angles.", answer: "Parallel is an adjective. It tells what kind of lines." },
  { sentence: "The class quickly finished the tally.", answer: "Quickly is an adverb. It tells how the class finished." },
];

export const PARENT_NOTE =
  "Books by First Nations, Métis, and Inuit writers still belong in home and school reading. This page uses an everyday Ontario passage so the written answer can be checked.";
