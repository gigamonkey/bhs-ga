const letters = "abcdefghijklmnopqrstuvwxyz";
const digits = "0123456789";
const alphabet = letters + letters.toUpperCase() + digits + " .,;:!?";

const phrase = "To be, or not to be, that is the question.";

function run(target, populationSize, maxGenerations, mutationRate = 0.01) {
  let population = randomPopulation(populationSize, target.length);
  for (let i = 0; i < maxGenerations; i++) {
    let scores = allScores(target, population);
    let parents = selectParents(population, scores);
    let currentBest = parents[0];
    logCurrentState(i, scores, population, currentBest);
    if (currentBest === target) {
      break;
    }
    population = makeBabies(parents, mutationRate);
  }
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

function selectParents(population, scores) {
  return Array.from(population)
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, Math.floor(population.length / 2));
}

function makeBabies(parents, mutationRate) {
  let matches = shuffleArray(Array.from(parents));
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

function mutate(critter, mutationRate) {
  function maybeRandom(c) {
    return Math.random() < mutationRate ? randomCharacter() : c;
  }
  return Array.from(critter).map(maybeRandom).join("");
}

function allScores(target, population) {
  let scores = {};
  for (let critter of population) {
    if (!(critter in scores)) {
      scores[critter] = scoreCritter(target, critter);
    }
  }
  return scores;
}

function scoreCritter(target, critter) {
  return Array.from(critter)
    .map((c, i) => (target[i] === c ? 1 : 0))
    .reduce((a, b) => a + b);
}

function logCurrentState(i, scores, population, mostFit) {
  let num = Object.keys(scores).length;
  let best = Object.values(scores).reduce((a, b) => Math.max(a, b), -Infinity);
  let worst = Object.values(scores).reduce((a, b) => Math.min(a, b), +Infinity);
  let avg = Array.from(population).reduce((acc, c) => acc + scores[c], 0) / population.length;
  
  console.log(`Generation ${i}: ${num} unique critters out of ${population.length}`);
  console.log(`Average fitness: ${avg}. Most fit: ${best}. Least fit: ${worst}`);
  console.log(`Current best: ${mostFit}\n`);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

run(phrase, 2000, 100);