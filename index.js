const alphabet = "abcdefghijklmnopqrstuvwxyz ";
const mutationRate = 0.1;
const phrase = "to be or not to be that is the question";

function go(popSize, iters) {
  run(phrase, popSize, iters);
}

function run(targetPhrase, populationSize, maxGenerations) {
  let population = randomPopulation(populationSize, targetPhrase.length);
  for (let i = 0; i < maxGenerations; i++) {
    let scores = allScores(targetPhrase, population);
    let parents = selectParents(population, scores);
    logCurrentState(i, scores, population, parents[0]);
    if (parents[0] == targetPhrase) {
      break;
    }
    population = makeBabies(parents);
  }   
}

function randomPopulation(popSize, stringLength) {
  let pop = [];
  for (let i = 0; i < popSize; i++) {
    pop.push(randomString(stringLength));
  }
  return pop;
}

function randomString(n) {
  let r = "";
  for (let i = 0; i < n; i++) {
    r += randomCharacter();
  }
  return r;
}

function randomCharacter() {
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

function logCurrentState(i, scores, population, mostFit) {
  let num = 0;
  let best = -1/0;
  let worst = 1/0;
  for (let critter in scores) {
    num++;
    best = Math.max(best, scores[critter]);
    worst = Math.min(worst, scores[critter]);
  }
  console.log("Generation " + i + ": " + num + " unique critters out of " + population.length);
  console.log("Most fit: " + best + ". Least fit: " + worst);
  console.log("Current best: " + mostFit + "\n");
}

function selectParents(population, scores) {
  let parents = Array.from(population).sort((a, b) => scores[b] - scores[a]);
  return parents.slice(0, Math.floor(population.length/2));
}


function makeBabies(parents) {
  let matches = shuffleArray(Array.from(parents));
  let babies = [];
  for (let i = 0; i < matches.length; i += 2) {
    for (let j = 0; j < 2; j++) {
      for (let b of cross(matches[i], matches[i + 1])) {
        babies.push(mutate(b));
      }
    }
  }
  return babies;
}

function cross(p1, p2) {
  let crossPoint = Math.floor(Math.random() * p1.length);
  let p1Front = p1.slice(0, crossPoint);
  let p1Back = p1.slice(crossPoint);
  let p2Front = p1.slice(0, crossPoint);
  let p2Back = p2.slice(crossPoint);
  return [p1Front.concat(p2Back), p2Front.concat(p1Back)];
}

function mutate(critter, mutationRate) {
  let r = "";
  for (let i = 0; i < critter.length; i++) {
    if (Math.random() > mutationRate) {
      r += randomCharecter();
    } else {
      r += critter[i];
    }
  }
  return r;
}

function allScores(targetPhrase, population) {
  let scores = {};
  for (let critter of population) {
    scores[critter] = scoreCritter(targetPhrase, critter);
  }
  return scores;
}


function scoreCritter(targetPhrase, critter) {
  let score = 0;
  for (let i = 0; i < targetPhrase.length; i++) {
    if (targetPhrase[i] === critter[i]) {
      score++;
    }
  }
  return score;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}