const letters = "abcdefghijklmnopqrstuvwxyz";
const digits = "0123456789";
const alphabet = letters + letters.toUpperCase() + digits + " .,;:!?";
const phrase = "To be, or not to be, that is the question.";

// Specific to a given problem:
//
//   - Genetic encoding of solutions.
//   - How to generate a random gene sequence
//   - The fitness function.
//   - Crossing strategy.
//   - Mutation strategy
//
// Some parts of the crossing and mutation strategies may be
// general (e.g. cross by split at a random point and swap the
// two parts or mutate by changing one gene to a random element
// of the genetic alphabet) but which ones should be used is
// still dependent on the particular genetic encoding.

// General to all genetic algorithms: The basic structure 
//
//   - Create initial population
//   - Loop scoring fitness, choosing parents, making new population.
//   - Deciding how to stop: max number of generations or fitness threshold.
//
// Choosing the parents we'll consider part of the genetic algorithm,
// not the problem though in theory one could use knowledge of the
// problem to choose pairings other than random matching.

/*
 * Solve the "find a known phrase" problem.
 */
class PhraseGeneration {
  constructor(target, alphabet) {
    this.target = target;
    this.alphabet = alphabet;
  }

  randomGene() {
    return choose(this.alphabet);
  }

  randomDNA() {
    return Array(this.target.length).fill().map(() => this.randomGene()).join("");
  }

  fitness(critter) {
    return Array.from(critter).map((c, i) => this.target[i] == critter[i] ? 1 : 0).reduce((a, b) => a + b) / this.target.length;
  }

  cross(p1, p2) {
    let cross = Math.floor(Math.random() * p1.length);
    return p1.substring(0, cross) + p2.substring(cross);
  }

  mutate(critter, rate) {
    return Array.from(critter).map(c => Math.random() < rate ? this.randomGene() : c).join("");
  }

}

class GA {

  constructor(problem, logger, isDone = (c) => c.fitness == 1.0, parentSelector = topN) {
    this.problem = problem;
    this.logger = logger;
    this.isDone = isDone;
    this.parentSelector = parentSelector;
    this.chanceToBeParent = 0.5; // hardwire for now
  }

  randomPopulation(size) {
    return Array(size).fill().map(() => this.problem.randomDNA());
  }

  withFitness(population) {
    return population.map((c) => ({ dna: c, fitness: this.problem.fitness(c) }));
  }

  nextGeneration(parents, size, mutationRate) {
    let matches = shuffle(Array.from(parents));
    let perPair = Math.floor(size / (matches.length / 2));
    let next = [];
    for (let i = 0; i < matches.length - 1; i += 2) {
      for (let j = 0; j < perPair; j++) {
        let crossed = this.problem.cross(matches[i].dna, matches[i + 1].dna, mutationRate);
        next.push(this.problem.mutate(crossed));
      }
    }
    return next;
  }

  run(populationSize, maxGenerations, mutationRate = 0.05) {
    let population = this.randomPopulation(populationSize);

    for (let i = 0; i < maxGenerations; i++) {
      let scored = this.withFitness(population);
      let best = scored.reduce((a, b) => a.fitness > b.fitness ? a : b);
      //console.log(scored);
      this.logger(i, scored, best);
      if (this.isDone(best)) {
        break;
      }
      let parents = this.parentSelector(scored, scored.length * this.chanceToBeParent);
      population = this.nextGeneration(parents, populationSize, mutationRate);
    }
  }
}

function choose(elements) {
  return elements[Math.floor(Math.random() * elements.length)];
}


// Possible parent selection algorithms.

function topN(scored, size) {
  return Array.from(scored).sort((a, b) => b.fitness - a.fitness).slice(0, size);
}

function fitnessWeighted(scored, size) {
  return Array(size).fill().map(randomizer(scored));
}

function logCurrentState(i, scored, best) {
  let num = Object.keys(scored).length;
  let unique = countUnique(scored.map(x => x.dna));
  let max = scored.reduce((acc, b) => Math.max(acc, b.fitness), -Infinity);
  let min = scored.reduce((acc, b) => Math.min(acc, b.fitness), Infinity);
  let avg = scored.reduce((acc, b) => acc + b.fitness, 0) / scored.length;

  let div = document.createElement("div");

  function log(x) {
    let e = document.createElement("p");
    e.innerHTML = x;
    div.append(e);
  }

  log(`Generation ${i}: ${unique} unique critters out of ${num}`);
  log(`Most fit: ${max.toFixed(2)}. Average: ${avg.toFixed(2)}. Least fit: ${min.toFixed(2)}`);
  log(`Current best: ${best.dna}\n`);

  document.getElementById("results").append(div);

}

function countUnique(xs) {
  let d = {};
  xs.forEach((x) => d[x] = true);
  //console.log(d);
  return Object.keys(d).length;
}


function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function randomizer(scored) {
  let n = scored.length;
  let total = scored.reduce((acc, b) => acc + b.fitness, 0);
  let probabilities = scored.map(c => n * c.fitness / total);
  let draw_random_index = voss_alias_table(probabilities);
  return () => scored[draw_random_index()];
}

function voss_alias_table(p) {
  // Given an array of probabilities returns a function that
  // returns a random index into the array weighted by the
  // probabilities in the array.
  //
  // See https://www.keithschwarz.com/darts-dice-coins/
  let n = p.length;
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
    return Math.random() < prob[i] ? i : alias[i];
  };
}

function check_draw(scores, iters) {
  let tot = Object.values(scores).reduce((a, b) => a + b);

  let draw = randomizer(Object.keys(scores), scores);
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
  return check_draw({ a: 4, b: 3, c: 2, d: 0 }, iters);
}


let problem = new PhraseGeneration(phrase, alphabet);

let ga = new GA(problem, logCurrentState);
//ga.parentSelector = fitnessWeighted;

ga.run(2000, 200);
