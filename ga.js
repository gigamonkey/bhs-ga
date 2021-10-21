const letters = "abcdefghijklmnopqrstuvwxyz";
const digits = "0123456789";
const alphabet = letters + letters.toUpperCase() + digits + " .,;:!?";
const phrase = "To be, or not to be, that is the question.";

// Specific to a given problem:
//
//   - Genetic encoding of solutions.
//   - How to generate a random gene sequence.
//   - The fitness function.
//   - Crossing strategy.
//   - Mutation strategy.
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

  fitness(dna) {
    let matches = Array.from(dna).map((c, i) => c == this.target[i] ? 1 : 0).reduce((a, b) => a + b);
    return matches / dna.length;
  }

  cross(p1, p2) {
    let crossover = Math.floor(Math.random() * p1.length);
    return p1.substring(0, crossover) + p2.substring(crossover);
  }

  mutate(critter, rate) {
    return Array.from(critter).map(c => Math.random() < rate ? this.randomGene() : c).join("");
  }
}

class TravelingSalesman {
  constructor(cities) {
    this.names = cities.map(c => c.name);
    this.distances = computeDistances(cities);
  }

  randomDNA() {
    // Since we compute the distance in a loop, might as well always
    // start with the same city. This is equivalent to making a random
    // permutation of all the elements and then cycling it around until 
    // at starts with names[0].
    return [this.names[0]].concat(shuffled(this.names.slice(1)))
  }

  fitness(dna) {
    // Distance traveled in a complete loop of the cities.
    let d = 0;
    let prev = dna[0];
    for (let i = 1; i < dna.length; i++) {
      d += this.distances[prev][dna[i]];
      prev = dna[i];
    }
    // Close the loop
    return -1 * (d + this.distances[prev][dna[0]]);
  }

  cross(p1, p2) {
    // Need to preserve invariant that DNA contains all cities.
    // In general want to preserve some amount of ordering from
    // the parents otherwise we've just destroyed them.

    let child = Array(p1.length).fill(null);

    let start = randomInt(1, p1.length);
    let end = randomInt(start + 1, p1.length + 1);
    let seen = {};

    for (let i = start; i < end; i++) {
      child[i] = p1[i];
      seen[p1[i]] = true;
    }

    let leftOver = p2.filter((c) => !(c in seen));

    for (let i = 0; i < child.length; i++) {
      if (child[i] == null) {
        child[i] = leftOver.shift();
      }
    }
    return child;
  }

  mutate(dna, rate) {
    if (Math.random() < rate) {
      this.mutateSmallSwap(dna);
    }
    return dna;
  }

  mutateSmallSwap(dna) {
    let i = randomInt(1, dna.length - 1);
    [dna[i], dna[i + 1]] = [dna[i + 1], dna[i]];
  }

  mutateBigSwap(dna) {
    // mutate by swapping two cities other than the zeroth.
    let i = randomInt(1, dna.length);
    let j = randomInt(i + 1, dna.length);
    [dna[i], dna[j]] = [dna[j], dna[i]]
  }

}

function computeDistances(cities) {
  let distances = {};
  for (let city of cities) {
    distances[city.name] = distancesFrom(city, cities, distances);
  }
  return distances;
}

function distancesFrom(c1, cities, distances) {
  let to = {};
  for (let c2 of cities) {
    if (c2.name in distances) {
      to[c2.name] = distances[c2.name][c1.name];
    } else {
      let dx = Math.abs(c1.x - c2.x);
      let dy = Math.abs(c1.y - c2.y);
      let d = Math.sqrt(dx * dx + dy * dy);
      to[c2.name] = d;
    }
  }
  return to;
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
    let matches = shuffled(parents);
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

  run(populationSize, maxGenerations, mutationRate = 0.01) {
    let population = this.withFitness(this.randomPopulation(populationSize));

    for (let i = 0; i < maxGenerations; i++) {
      let best = population.reduce((a, b) => a.fitness > b.fitness ? a : b);
      this.logger(i, population);
      if (this.isDone(best)) {
        break;
      }
      let parents = this.parentSelector(population, population.length * this.chanceToBeParent);
      let children = this.nextGeneration(parents, populationSize, mutationRate);
      population = this.withFitness(children);
    }
  }

  step(scored, mutationRate = 0.05) {
    let parents = this.parentSelector(scored, scored.length * this.chanceToBeParent);
    population = this.nextGeneration(parents, populationSize, mutationRate);
  }
}

function choose(elements) {
  return elements[Math.floor(Math.random() * elements.length)];
}



function randomInt(start, end) {
  // Random int on half-open interval [start, end)
  return start + Math.floor(Math.random() * (end - start));
}

// Possible parent selection algorithms.

/*
 * Just take the top N members of the current generation by fitness.
 */
function topN(scored, size) {
  return Array.from(scored).sort((a, b) => b.fitness - a.fitness).slice(0, size);
}

/*
 * Draw random parents weighted by their fitness.
 */
function fitnessWeighted(scored, size) {
  return Array(size).fill().map(randomizer(scored));
}

function summarize(generation, scored) {
  let min = Infinity;
  let max = -Infinity;
  let total = 0;
  let best = null;

  for (let c of scored) {
    if (c.fitness > max) {
      best = c;
    }
    min = Math.min(min, c.fitness);
    max = Math.max(max, c.fitness);
    total += c.fitness;
  }

  return {
    generation: generation,
    size: scored.length,
    unique: countUnique(scored.map(x => x.dna)),
    min: min,
    max: max,
    avg: total / scored.length,
    best: best,
  }
}

function countUnique(xs) {
  return Object.keys(Object.fromEntries(xs.map(x => [x, true]))).length
}

function shuffled(orig) {
  let array = Array.from(orig);
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

function randomCities(names, width, height) {
  return Array.from(names).map(n => ({
    name: n,
    x: randomInt(0, width),
    y: randomInt(0, height)
  }));
}

function bruteForceTPS(prob) {
  let best = { dna: null, fitness: -Infinity };
  for (let dnaTail of permutations(prob.names.slice(1))) {
    let dna = [prob.names[0], ...dnaTail];
    let f = prob.fitness(dna);
    if (f > best.fitness) {
      best.dna = dna;
      best.fitness = f;
    }
  }
  return best;
}

function* permutations(xs) {
  if (xs.length == 1) {
    yield xs;
  } else {
    let [head, ...tail] = xs
    for (let p of permutations(tail)) {
      for (let i = 0; i < p.length; i++) {
        yield p.slice(0, i).concat([head]).concat(p.slice(i));
      }
      yield p.concat([head]);
    }
  }
}

function testPerms() {
  let v = [];
  for (let p of permutations(Array.from("abcdef"))) {
    v.push(p.slice(0));
  }
  postMessage(v.length);
}

function dispatch(x) {
  if (x.name in self) {
    self[x.name].apply(self, x.args);
  } else {
    throw Error("No such function " + x.name);
  }
}

function check() {
  let cities = randomCities("abcd", 100, 100);
  let prob = new TravelingSalesman(cities);
  bruteForceTPS(prob);
}


function runToBeOrNot(popSize, generations) {
  let problem = new PhraseGeneration(phrase, alphabet);
  let ga = new GA(problem, (g, s) => postMessage(summarize(g, s)));
  ga.parentSelector = fitnessWeighted;
  ga.run(popSize, generations);
}

function runTSP(cities, popSize, generations, knownBest) {
  let problem = new TravelingSalesman(cities);
  if (!knownBest) {
    let answer = bruteForceTPS(problem);
    postMessage({ answer: answer });
  } else {
    postMessage({ answer: knownBest });
  }
  let ga = new GA(problem, (g, s) => postMessage(summarize(g, s)))
  ga.parentSelector = topN;
  ga.run(popSize, generations, 0.2);
}

onmessage = e => dispatch(e.data);

