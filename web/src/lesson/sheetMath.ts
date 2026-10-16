export function mod(index: number, count: number): number {
  return ((index % count) + count) % count;
}

export interface Problem {
  prompt: string;
  answer: string;
  dots?: number;
  rows?: number;
  cols?: number;
}

function pair(slot: number, span: number, min = 0): number {
  return min + mod(slot, span);
}

export function kinderNumber(slot: number): Problem {
  const value = pair(slot, 21);
  return { prompt: `Write the number ${value}.`, answer: String(value) };
}

export function kinderCount(slot: number): Problem {
  const value = 1 + mod(slot, 10);
  return { prompt: "How many dots?", answer: String(value), dots: value };
}

export function kinderFact(slot: number): Problem {
  const adding = mod(slot, 2) === 0;
  const left = mod(slot, 6);
  const right = mod(Math.floor(slot / 6), 6 - left);
  if (adding) return { prompt: `${left} + ${right}`, answer: String(left + right) };
  const total = left;
  const take = mod(Math.floor(slot / 6), total + 1);
  return { prompt: `${total} − ${take}`, answer: String(total - take) };
}

export function kinderRotate(slot: number): Problem {
  const kind = mod(slot, 6);
  if (kind === 0) {
    const left = pair(slot, 21);
    const right = pair(slot + 7, 21);
    let low = Math.min(left, right);
    let high = Math.max(left, right);
    if (low === high) {
      if (high === 20) low = 19;
      else high = low + 1;
    }
    return { prompt: `Which is more, ${low} or ${high}?`, answer: String(high) };
  }
  if (kind === 1) {
    const part = mod(slot, 11);
    return { prompt: `${part} and ___ make 10.`, answer: String(10 - part) };
  }
  if (kind === 2) {
    const items = 2 + 2 * mod(slot, 5);
    return { prompt: `Share ${items} apples fairly between 2 children. How many does each child get?`, answer: String(items / 2) };
  }
  if (kind === 3) {
    const cores = ["circle, square", "red, blue", "clap, tap"];
    const core = cores[mod(slot, cores.length)];
    return { prompt: `The pattern is ${core}, ${core}. What comes next?`, answer: core.split(", ")[0] };
  }
  if (kind === 4) {
    return { prompt: "A pencil is drawn longer than a crayon. Which is longer?", answer: "the pencil" };
  }
  const coins = [
    ["penny", "1¢"],
    ["nickel", "5¢"],
    ["dime", "10¢"],
    ["quarter", "25¢"],
  ];
  const [name, value] = coins[mod(slot, coins.length)];
  return { prompt: `What is a ${name} worth?`, answer: value };
}

export function grade2Fact(slot: number): Problem {
  const adding = mod(slot, 2) === 0;
  const left = mod(slot, 31);
  const right = mod(slot + 9, 51 - left);
  if (adding) return { prompt: `${left} + ${right}`, answer: String(left + right) };
  const total = 10 + mod(slot, 41);
  const take = mod(slot + 3, total + 1);
  return { prompt: `${total} − ${take}`, answer: String(total - take) };
}

export function grade2Place(slot: number): Problem {
  const value = pair(slot, 201);
  const hundreds = Math.floor(value / 100);
  const tens = Math.floor((value % 100) / 10);
  const ones = value % 10;
  return { prompt: `Show ${value} as hundreds, tens, and ones.`, answer: `${hundreds} hundreds, ${tens} tens, ${ones} ones` };
}

export function grade2Rotate(slot: number): Problem {
  const kind = mod(slot, 6);
  if (kind === 0) {
    const steps = [20, 25, 50];
    const step = steps[mod(slot, steps.length)];
    const start = step * (1 + mod(slot, 3));
    return { prompt: `Count by ${step}s: ${start}, ${start + step}, ___.`, answer: String(start + step * 2) };
  }
  if (kind === 1) {
    const value = pair(slot, 201);
    return { prompt: `Is ${value} even or odd?`, answer: value % 2 === 0 ? "even" : "odd" };
  }
  if (kind === 2) {
    const sharers = [2, 3, 4, 6][mod(slot, 4)];
    const each = 1 + mod(Math.floor(slot / 4), Math.floor(10 / sharers));
    const items = sharers * each;
    return { prompt: `Share ${items} counters among ${sharers} children. How many does each child get?`, answer: String(each) };
  }
  if (kind === 3) {
    const quarters = mod(slot, 5);
    const dimes = mod(slot + 1, 4);
    const nickels = mod(slot + 2, 3);
    const cents = quarters * 25 + dimes * 10 + nickels * 5;
    const bounded = cents <= 100 ? cents : 100;
    let q = Math.min(quarters, Math.floor(bounded / 25));
    const rest = bounded - q * 25;
    let d = Math.min(dimes, Math.floor(rest / 10));
    let n = Math.floor((rest - d * 10) / 5);
    if (q + d + n === 0) n = 1;
    return { prompt: `How many cents are ${q} quarters, ${d} dimes, and ${n} nickels?`, answer: `${q * 25 + d * 10 + n * 5}¢` };
  }
  if (kind === 4) {
    const step = [2, 5, 10][mod(slot, 3)];
    const start = step * (1 + mod(slot, 4));
    return { prompt: `${start}, ${start + step}, ___, ${start + step * 3}. What is missing?`, answer: String(start + step * 2) };
  }
  const left = 5 + mod(slot, 20);
  const right = 5 + mod(slot + 4, 20);
  const add = Math.max(left, right) - Math.min(left, right);
  const [small, big] = left <= right ? [left, right] : [right, left];
  return { prompt: `${small} + ___ = ${big}. What do you add?`, answer: String(add) };
}

export function grade3Place(slot: number): Problem {
  const value = pair(slot, 1001);
  const hundreds = Math.floor(value / 100);
  const tens = Math.floor((value % 100) / 10);
  const ones = value % 10;
  return { prompt: `Show ${value} as hundreds, tens, and ones.`, answer: `${hundreds} hundreds, ${tens} tens, ${ones} ones` };
}

export function grade3Fact(slot: number): Problem {
  const factor = [2, 5, 10][mod(slot, 3)];
  const other = 1 + mod(Math.floor(slot / 3), 10);
  return {
    prompt: `Draw ${factor} rows of ${other}. Then write ${factor} × ${other} and ${factor * other} ÷ ${factor}.`,
    answer: `${factor * other}, and ${other}`,
    rows: factor,
    cols: other,
  };
}

export function grade3Operation(slot: number): Problem {
  const adding = mod(slot, 2) === 0;
  if (adding) {
    const left = 100 + mod(slot, 400);
    const right = 100 + mod(slot + 17, 500);
    const safeLeft = left + right > 999 ? 999 - right : left;
    return { prompt: `${safeLeft} + ${right}`, answer: String(safeLeft + right) };
  }
  const total = 200 + mod(slot, 800);
  const take = mod(slot + 5, total);
  return { prompt: `${total} − ${take}`, answer: String(total - take) };
}

export function grade4Place(slot: number): Problem {
  const value = pair(slot, 10001);
  const thousands = Math.floor(value / 1000);
  const rest = value % 1000;
  return { prompt: `Write ${value} in expanded form.`, answer: `${thousands * 1000} + ${Math.floor(rest / 100) * 100} + ${Math.floor((rest % 100) / 10) * 10} + ${rest % 10}` };
}

export function grade4Fact(slot: number): Problem {
  const left = 1 + mod(slot, 10);
  const right = 1 + mod(Math.floor(slot / 10), 10);
  return { prompt: `${left} × ${right}, and ${left * right} ÷ ${left}`, answer: `${left * right}, and ${right}` };
}

export function grade4Operation(slot: number): Problem {
  const mode = mod(slot, 4);
  if (mode === 0 || mode === 2) {
    const divisor = 2 + mod(slot, 8);
    const quotient = 12 + mod(slot + 3, 80);
    const remainder = mode === 2 ? 1 + mod(slot, divisor - 1) : 0;
    const dividend = divisor * quotient + remainder;
    return {
      prompt: `${dividend} ÷ ${divisor}`,
      answer: remainder ? `${quotient} remainder ${remainder}` : String(quotient),
    };
  }
  const factor = 2 + mod(slot, 9);
  const other = 20 + mod(slot + 1, 80);
  return { prompt: `${other} × ${factor}`, answer: String(other * factor) };
}

export function grade4Decimal(slot: number): Problem {
  const left = mod(slot, 20) / 10;
  const right = mod(slot + 3, 20) / 10;
  const kind = mod(slot, 3);
  if (kind === 0) {
    const shownLeft = left.toFixed(1);
    const shownRight = right.toFixed(1);
    if (shownLeft === shownRight) return { prompt: `Which is greater, ${shownLeft} or ${shownRight}?`, answer: "they are equal" };
    return { prompt: `Which is greater, ${shownLeft} or ${shownRight}?`, answer: left > right ? shownLeft : shownRight };
  }
  if (kind === 1) return { prompt: `${left.toFixed(1)} + ${right.toFixed(1)}`, answer: (left + right).toFixed(1) };
  return { prompt: `In ${left.toFixed(1)}, which digit is in the tenths place?`, answer: left.toFixed(1).slice(-1) };
}

export function grade6Place(slot: number): Problem {
  if (mod(slot, 2) === 0) {
    const value = pair(slot, 1000001);
    return { prompt: `Write ${grouped(value)} in expanded form.`, answer: expanded(value) };
  }
  const start = mod(slot, 11) - 5;
  const move = mod(slot + 3, 7) - 3;
  if (move === 0) return { prompt: `Start at ${start} on a number line and stay there. Where are you?`, answer: String(start) };
  const direction = move < 0 ? "left" : "right";
  return { prompt: `Start at ${start} on a number line and move ${Math.abs(move)} steps ${direction}. Where do you land?`, answer: String(start + move) };
}

function grouped(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function expanded(value: number): string {
  const places = [1000000, 100000, 10000, 1000, 100, 10, 1];
  const names = ["million", "hundred thousands", "ten thousands", "thousands", "hundreds", "tens", "ones"];
  const parts: string[] = [];
  let rest = value;
  places.forEach((place, index) => {
    const count = Math.floor(rest / place);
    rest -= count * place;
    if (count) parts.push(`${count} ${names[index]}`);
  });
  return parts.length ? parts.join(", ") : "0 ones";
}

export function grade6Divisibility(slot: number): Problem {
  const rules = [2, 3, 4, 5, 6, 8, 9, 10];
  const rule = rules[mod(slot, rules.length)];
  const value = 12 + mod(slot * 3, 400);
  const yes = value % rule === 0;
  return { prompt: `Is ${value} divisible by ${rule}?`, answer: yes ? "yes" : "no" };
}

export function grade6Operation(slot: number): Problem {
  if (mod(slot, 2) === 0) {
    const wholes = 2 + mod(slot, 6);
    const denominator = [2, 3, 4, 5][mod(slot, 4)];
    return { prompt: `How many 1/${denominator}s are in ${wholes}?`, answer: String(wholes * denominator) };
  }
  const start = 3 + mod(slot, 6);
  const tenths = 1 + mod(slot, 9);
  const hundredths = 1 + mod(slot + 1, 9);
  const total = start * 100 + tenths * 10 + hundredths;
  const answer = `${Math.floor(total / 100)}.${String(total % 100).padStart(2, "0")}`;
  return { prompt: `${start} + ${(tenths / 10).toFixed(1)} + ${(hundredths / 100).toFixed(2)}`, answer };
}

export function grade7Factors(slot: number): Problem {
  const value = 12 + mod(slot, 89);
  const pairs: string[] = [];
  for (let factor = 1; factor * factor <= value; factor += 1) {
    if (value % factor === 0) pairs.push(`${factor} and ${value / factor}`);
  }
  return { prompt: `List the factor pairs of ${value}.`, answer: pairs.join(", ") };
}

export function grade7Fraction(slot: number): Problem {
  const pairs = [
    [1, 3, 1, 6, "1/2"],
    [1, 2, 1, 4, "3/4"],
    [1, 5, 2, 10, "2/5"],
    [2, 3, 1, 6, "5/6"],
  ] as const;
  const [a, b, c, d, answer] = pairs[mod(slot, pairs.length)];
  const adding = mod(slot, 2) === 0;
  if (adding) return { prompt: `${a}/${b} + ${c}/${d}`, answer };
  return { prompt: `${a}/${b} − ${c}/${d}`, answer: subtractFraction(a, b, c, d) };
}

function subtractFraction(a: number, b: number, c: number, d: number): string {
  const left = a * d;
  const right = c * b;
  const denom = b * d;
  const num = left - right;
  const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
  if (num === 0) return "0";
  const sign = num < 0 ? "-" : "";
  const div = Math.abs(gcd(num, denom));
  return `${sign}${Math.abs(num) / div}/${denom / div}`;
}

export function grade7Integer(slot: number): Problem {
  const start = mod(slot, 15) - 7;
  const change = mod(slot + 4, 9) - 4;
  return { prompt: `The temperature was ${start}°C and changed by ${change} degrees. What is it now?`, answer: `${start + change}°C` };
}

export function grade8Notation(slot: number): Problem {
  const small = mod(slot, 2) === 1;
  const digits = 1 + mod(slot, 9);
  const exponent = 2 + mod(Math.floor(slot / 2), 5);
  if (small) return { prompt: `Write ${digits} × 10^−${exponent} as a decimal.`, answer: (digits * 10 ** -exponent).toString() };
  return { prompt: `Write ${digits} × 10^${exponent} in standard form.`, answer: String(digits * 10 ** exponent) };
}

export function grade8Square(slot: number): Problem {
  const root = 1 + mod(slot, 12);
  return { prompt: `What is ${root} squared, and what is the square root of ${root * root}?`, answer: `${root * root}, and ${root}` };
}

export function grade8Proportion(slot: number): Problem {
  const start = 20 + 10 * mod(slot, 8);
  const percent = [10, 20, 25, 50][mod(slot, 4)];
  const up = mod(slot, 2) === 0;
  const change = (start * percent) / 100;
  return {
    prompt: `${start} ${up ? "increases" : "decreases"} by ${percent}%. What is the new amount?`,
    answer: String(up ? start + change : start - change),
  };
}

function showAmount(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function grade8Equation(slot: number): Problem {
  const solution = mod(slot, 9) - 3;
  const coefficient = 2 + mod(slot, 4);
  const offset = (mod(slot + 2, 5) - 2) / 2;
  const result = coefficient * solution + offset;
  const left = offset === 0 ? `${coefficient}x` : offset > 0 ? `${coefficient}x + ${showAmount(offset)}` : `${coefficient}x − ${showAmount(Math.abs(offset))}`;
  const right = result < 0 ? `−${showAmount(Math.abs(result))}` : showAmount(result);
  return { prompt: `${left} = ${right}. What is x?`, answer: String(solution) };
}

const TRIPLES: Array<[number, number, number]> = [
  [3, 4, 5],
  [5, 12, 13],
  [6, 8, 10],
  [8, 15, 17],
  [7, 24, 25],
  [9, 12, 15],
  [9, 40, 41],
  [12, 35, 37],
];

export function grade3Rotate(slot: number): Problem {
  const kind = mod(slot, 6);
  if (kind === 0) {
    const pictures = [
      ["1/2", "2/4"],
      ["1/3", "2/6"],
      ["1/4", "2/8"],
    ];
    const [left, right] = pictures[mod(slot, pictures.length)];
    return { prompt: `Are ${left} and ${right} the same amount of the same whole?`, answer: "yes" };
  }
  if (kind === 1) {
    const hour = 1 + mod(slot, 12);
    const minute = [0, 15, 30, 45][mod(slot + 1, 4)];
    const label = minute === 0 ? `${hour}:00` : `${hour}:${String(minute).padStart(2, "0")}`;
    return { prompt: `The hour hand is on ${hour} and the minute hand is on ${minute === 0 ? "12" : minute / 5}. What time is it?`, answer: label };
  }
  if (kind === 2) {
    const cost = 2 + mod(slot, 8);
    const paid = cost + 1 + mod(slot + 2, 10);
    return { prompt: `A book costs $${cost}. You pay $${paid}. How much change do you get?`, answer: `$${paid - cost}` };
  }
  if (kind === 3) {
    const squares = 4 + mod(slot, 17);
    return { prompt: `A shape is covered by ${squares} same-size squares. What is its area?`, answer: `${squares} square units` };
  }
  if (kind === 4) {
    const step = [2, 5, 10][mod(slot, 3)];
    const start = step * mod(slot, 5);
    return { prompt: `${start}, ${start + step}, ${start + step * 2}, ___. What comes next?`, answer: String(start + step * 3) };
  }
  const labels = ["bus", "walk", "car", "bike"];
  const counts = [3, 4, 5, 6];
  counts[mod(slot, 4)] = 9;
  return { prompt: `A picture graph uses one picture for one student. ${labels.map((label, index) => `${label} has ${counts[index]} pictures`).join(". ")}. Which way do the most students travel?`, answer: labels[counts.indexOf(9)] };
}

export function grade4Rotate(slot: number): Problem {
  const kind = mod(slot, 6);
  if (kind === 0) {
    const length = 2 + mod(slot, 12);
    const width = 2 + mod(slot + 3, 9);
    return { prompt: `A rectangle is ${length} cm long and ${width} cm wide. What is its area?`, answer: `${length * width} square cm` };
  }
  if (kind === 1) {
    const add = 1 + mod(slot, 12);
    const total = add + 1 + mod(slot + 2, 15);
    return { prompt: `n + ${add} = ${total}. What is n?`, answer: String(total - add) };
  }
  if (kind === 2) {
    const price = 3 + mod(slot, 8);
    const packs = 2 + mod(slot + 1, 4);
    const extra = 1 + mod(slot + 4, 6);
    return { prompt: `You buy ${packs} notebooks at $${price} each and a pen for $${extra}. How much do you pay?`, answer: `$${packs * price + extra}` };
  }
  if (kind === 3) {
    const metres = 1 + mod(slot, 9);
    return mod(slot, 2) === 0
      ? { prompt: `${metres} m is how many centimetres?`, answer: `${metres * 100} cm` }
      : { prompt: `${metres} kg is how many grams?`, answer: `${metres * 1000} g` };
  }
  if (kind === 4) {
    const firstCount = 2 + mod(slot, 5);
    const firstPrice = 2 + mod(slot + 1, 6);
    const secondCount = firstCount + 1;
    const secondPrice = firstPrice + 1;
    const firstEach = firstPrice / firstCount;
    const secondEach = secondPrice / secondCount;
    const better = firstEach === secondEach ? "they cost the same" : firstEach < secondEach ? `${firstCount} for $${firstPrice}` : `${secondCount} for $${secondPrice}`;
    return { prompt: `Which costs less for one item: ${firstCount} for $${firstPrice}, or ${secondCount} for $${secondPrice}?`, answer: better };
  }
  const apples = 2 + mod(slot, 12);
  const pears = 2 + mod(slot + 5, 12);
  return { prompt: `A tally shows ${apples} apples and ${pears} pears. How many pieces of fruit is that?`, answer: String(apples + pears) };
}

export function grade6Rotate(slot: number): Problem {
  const kind = mod(slot, 6);
  if (kind === 0) {
    const step = 10 * (1 + mod(slot, 5));
    const hours = 2 + mod(slot + 1, 4);
    return { prompt: `A train travels ${step} km each hour. How far does it travel in ${hours} hours?`, answer: `${step * hours} km` };
  }
  if (kind === 1) {
    const value = 3 + mod(slot, 12);
    return { prompt: `2x + 3x = ${5 * value}. What is x?`, answer: String(value) };
  }
  if (kind === 2) {
    if (mod(Math.floor(slot / 6), 2) === 0) {
      const base = 4 + mod(slot, 10);
      const height = 3 + mod(slot + 2, 8);
      const shape = mod(Math.floor(slot / 12), 2) === 0 ? "rectangle" : "parallelogram";
      const size = shape === "rectangle" ? `${base} m by ${height} m` : `a base of ${base} m and a height of ${height} m`;
      return { prompt: `A ${shape} has ${size}. What is its area?`, answer: `${base * height} square m` };
    }
    const metres = 1 + mod(slot, 9);
    return mod(Math.floor(slot / 2), 2) === 0
      ? { prompt: `${metres} m is how many centimetres?`, answer: `${metres * 100} cm` }
      : { prompt: `${metres} kg is how many grams?`, answer: `${metres * 1000} g` };
  }
  if (kind === 3) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday"];
    const amounts = [2, 4, 3, 5];
    amounts[mod(slot, 4)] = 8;
    return { prompt: `Rain in millimetres: ${days.map((day, index) => `${day} ${amounts[index]}`).join(", ")}. Which day had the most rain?`, answer: days[amounts.indexOf(8)] };
  }
  if (kind === 4) {
    const chances = [
      [1, 2, 50],
      [1, 4, 25],
      [1, 5, 20],
      [2, 5, 40],
      [3, 4, 75],
      [3, 5, 60],
      [1, 10, 10],
      [3, 10, 30],
    ] as const;
    const [favourable, total, percent] = chances[mod(slot, chances.length)];
    return { prompt: `${favourable} of ${total} equal outcomes are winning ones. Write the chance as a fraction and as a percent.`, answer: `${favourable}/${total}, or ${percent}%` };
  }
  const save = 5 + mod(slot, 20);
  const goal = save * (2 + mod(slot + 1, 4));
  return { prompt: `You want $${goal} and can save $${save} a week. How many weeks will it take? Interest is money paid for using someone else's money.`, answer: `${goal / save} weeks` };
}

export function grade7Rotate(slot: number): Problem {
  const kind = mod(slot, 5);
  if (kind === 0) {
    const gap = 1 + mod(slot, 8);
    return { prompt: `2x + 5 = 3x − ${gap}. What is x?`, answer: String(5 + gap) };
  }
  if (kind === 1) {
    const radius = 2 + mod(slot, 10);
    const circumference = Math.round(2 * 3.14 * radius * 100) / 100;
    return { prompt: `A circle has radius ${radius} cm. Use 3.14 for π. What is the circumference?`, answer: `${circumference} cm` };
  }
  if (kind === 2) {
    if (mod(slot, 2) === 0) {
      const side = 4 + 2 * mod(slot, 6);
      const doubles = mod(slot, 4) < 2;
      return doubles
        ? { prompt: `A square has sides of ${side} cm. A dilation doubles every side. How long is a new side?`, answer: `${side * 2} cm` }
        : { prompt: `A square has sides of ${side} cm. A dilation halves every side. How long is a new side?`, answer: `${side / 2} cm` };
    }
    const radius = [1, 2, 5, 10][mod(slot, 4)];
    const height = 2 + mod(slot + 1, 5);
    const hundredths = 314 * radius * radius * height;
    const whole = Math.floor(hundredths / 100);
    const frac = hundredths % 100;
    const shown = frac === 0 ? String(whole) : `${whole}.${String(frac).padStart(2, "0")}`;
    return { prompt: `A cylinder has radius ${radius} cm and height ${height} cm. Use 3.14 for π. What is the volume?`, answer: `${shown} cubic cm` };
  }
  if (kind === 3) {
    const names = ["bus", "walk", "car", "bike"];
    const parts = [
      [40, 25, 20, 15],
      [15, 40, 25, 20],
      [20, 15, 40, 25],
      [25, 20, 15, 40],
    ][mod(slot, 4)];
    const top = Math.max(...parts);
    return { prompt: `A circle graph shows travel: ${names.map((name, index) => `${name} ${parts[index]}%`).join(", ")}. Which way is the largest share?`, answer: names[parts.indexOf(top)] };
  }
  const principal = 100 * (1 + mod(slot, 5));
  const low = 2 + mod(slot, 4);
  const high = low + 1 + mod(slot + 1, 3);
  return { prompt: `A loan of $${principal} costs ${low}% interest for one year, or ${high}% interest for one year. How much less is the lower interest?`, answer: `$${(principal * (high - low)) / 100}` };
}

export function grade8Rotate(slot: number): Problem {
  const kind = mod(slot, 5);
  if (kind === 0) return grade8Equation(slot);
  if (kind === 1) {
    const distance = [60, 90, 120, 150][mod(slot, 4)];
    const time = [1, 2, 3][mod(slot + 1, 3)];
    return { prompt: `s = d/t. A trip is ${distance * time} km and takes ${time} hours. What is the speed?`, answer: `${distance} km/h` };
  }
  if (kind === 2) return grade8Pythagoras(slot);
  if (kind === 3) {
    const angle = [35, 40, 55, 70, 110][mod(slot, 5)];
    const fact = mod(Math.floor(slot / 5), 3);
    if (fact === 0) return { prompt: `Two lines cross. One angle is ${angle}°. What is the angle across from it?`, answer: `${angle}°` };
    if (fact === 1) return { prompt: `Two angles form a straight line. One is ${angle}°. What is the other?`, answer: `${180 - angle}°` };
    return { prompt: `Two parallel lines are crossed by a third line. One angle is ${angle}°. What is the matching angle on the other parallel line?`, answer: `${angle}°` };
  }
  const principal = 100 * (1 + mod(slot, 4));
  const simpleTotal = principal + (principal * 20) / 100;
  const compoundTotal = (principal * 121) / 100;
  return { prompt: `$${principal} earns 10% a year. After two years, which is more: simple interest or compound interest, and by how many dollars?`, answer: `compound by $${compoundTotal - simpleTotal}` };
}

export function grade8Pythagoras(slot: number): Problem {
  const [a, b, c] = TRIPLES[mod(slot, TRIPLES.length)];
  const missing = mod(slot, 3);
  if (missing === 0) return { prompt: `A right triangle has legs ${a} and ${b}. How long is the hypotenuse?`, answer: String(c) };
  if (missing === 1) return { prompt: `A right triangle has a leg of ${a} and a hypotenuse of ${c}. How long is the other leg?`, answer: String(b) };
  return { prompt: `A right triangle has a leg of ${b} and a hypotenuse of ${c}. How long is the other leg?`, answer: String(a) };
}
