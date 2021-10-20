const letters = "abcdefghijklmnopqrstuvwxyz";
const digits = "0123456789";
const alphabet = letters + letters.toUpperCase() + digits + " .,;:!?";
const phrase = "To be, or not to be, that is the question.";

function run(target, populationSize, maxGenerations, mutationRate = 0.01) {
  let population = randomPopulation(populationSize, target.length);
  let best = null;
  for (let i = 0; i < maxGenerations && best !== target; i++) {
    let scores = allScores(target, population);
    best = currentBest(population, scores);
    logCurrentState(i, scores, population, best);
    let parents = selectParents(population, scores);
    population = makeBabies(parents, mutationRate);
  }
}

function currentBest(population, scores) {
  return population.reduce((a, b) => scores[b] > scores[a] ? b : a);
}

function randomPopulation(popSize, stringLength) {
  return Array(popSize).fill(stringLength).map(randomString);
}

function randomString(n) {
  return Array(n).fill().map(randomCharacter).join("");
}

function randomCharacter() {
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

function selectParentsTopHalf(population, scores) {
  return Array.from(population)
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, Math.floor(population.length / 2));
}

function selectParentsWeightedRandom(population, scores) {
  let draw = voss_alias_table(population, scores);
  return Array(population.length / 2).fill().map(draw);
}

const selectParents = true ? selectParentsTopHalf : selectParentsWeightedRandom;

function makeBabies(parents, mutationRate) {
  let matches = shuffle(Array.from(parents));
  let babies = [];
  for (let i = 0; i < matches.length - 1; i += 2) {
    for (let j = 0; j < 2; j++) {
      for (let b of cross(matches[i], matches[i + 1])) {
        babies.push(mutate(b, mutationRate));
      }
    }
  }
  return babies;
}

function cross(p1, p2) {
  let cross = Math.floor(Math.random() * p1.length);
  return [
    Array.from(p1).map((c, i) => (i > cross ? p2[i] : c)).join(""),
    Array.from(p2).map((c, i) => (i > cross ? p1[i] : c)).join(""),
  ];
}

function mutate(critter, rate) {
  return Array.from(critter).map(c => Math.random() < rate ? randomCharacter() : c).join("");
}

function allScores(target, population) {
  let scores = {};
  for (let critter of population) {
    if (!(critter in scores)) {
      scores[critter] = fitness(target, critter);
    }
  }
  return scores;
}

function fitness(target, critter) {
  return Array.from(critter).map((c, i) => (target[i] === c)).reduce((a, b) => a + b);
}

function logCurrentState(i, scores, population, mostFit) {
  let num = Object.keys(scores).length;
  let best = Object.values(scores).reduce((a, b) => Math.max(a, b));
  let worst = Object.values(scores).reduce((a, b) => Math.min(a, b));
  let avg = Array.from(population).reduce((acc, c) => acc + scores[c], 0) / population.length;

  console.log(`Generation ${i}: ${num} unique critters out of ${population.length}`);
  console.log(`Average fitness: ${avg}. Most fit: ${best}. Least fit: ${worst}`);
  console.log(`Current best: ${mostFit}\n`);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


function voss_alias_table(population, scores) {
  // See https://www.keithschwarz.com/darts-dice-coins/
  let n = population.length;
  let total = population.reduce((acc, c) => acc + scores[c], 0);
  let p = population.map(c => n * scores[c]/total);
  let prob = Array(n).fill();
  let alias = Array(n).fill();
  let small = [];
  let large = [];
  for (let i = 0; i < n; i++) {
    (p[i] < 1 ? small : large).push(i);
  }
  while (small.length > 0 && large.length > 0) {
    let l = small.pop();
    let g = large.pop();
    prob[l] = p[l];
    alias[l] = g;
    p[g] = (p[g] + p[l]) - 1;
    (p[g] < 1 ? small : large).push(g);
  }
  while (large.length > 0) {
    prob[large.pop()] = 1;
  }
  while (small.length > 0) {
    prob[small.pop()] = 1;
  }
  return () => {
      let i = Math.floor(Math.random() * n);
      return population[Math.random() < prob[i] ? i : alias[i]];
    };
}

function check_draw(scores, iters) {
  let tot = Object.values(scores).reduce((a, b) => a + b);

  let draw = voss_alias_table(Object.keys(scores), scores);
  let r = {};
  for (let i = 0; i < iters; i++) {
    let k = draw();
    if (k in r) { 
      r[k]++; 
    } else {
      r[k] = 1;
    }
  }
  let tot2 = Object.values(r).reduce((a, b) => a + b);

  let input = {};
  let output = {};
  for (let k in scores) {
    input[k] = scores[k] / tot;
    output[k] = r[k] / tot2; 
  }

  return {
    input: input,
    output: output,
  }

}

function check(iters) {
  return check_draw({a: 4, b: 3, c: 2, d: 0}, iters);
}


run(phrase, 2000, 1000);