function randomCities(names, width, height) {
  return Array.from(names).map(n => ({
    name: n,
    x: randomInt(0, width),
    y: randomInt(0, height)
  }));
}

function randomInt(start, end) {
  // Random int on half-open interval [start, end)
  return start + Math.floor(Math.random() * (end - start));
}

function show(e) {
  console.log(JSON.stringify(e.data));
}

var ga = new Worker('ga.js');
ga.onmessage = (e) => logSummary(e.data);
//ga.onmessage = show;


//ga.postMessage({name: 'runToBeOrNot', args: [2000, 200]});

function call(name, ...args) {
  ga.postMessage({ name: name, args: args });
}

let xcities = randomCities("ABCDEFGHIJK", 100, 100);
let knownBest = {
  dna: ["A","E","F","B","H","D","K","J","G","I","C"],
  fitness: -333.8635783212178,
};

let cities = [{"name":"A","x":13,"y":36},{"name":"B","x":47,"y":66},{"name":"C","x":7,"y":2},{"name":"D","x":89,"y":45},{"name":"E","x":19,"y":85},{"name":"F","x":34,"y":68},{"name":"G","x":68,"y":1},{"name":"H","x":81,"y":77},{"name":"I","x":59,"y":24},{"name":"J","x":91,"y":7},{"name":"K","x":96,"y":34}];

call('runTSP', cities, 20000, 200, knownBest);

//call('check');

function logSummary(s) {
  if ('answer' in s) {
    document.getElementById("answer").innerHTML = "DNA: " + s.answer.dna + "; fitness: " + s.answer.fitness;
  } else {
    let tbody = document.getElementById("results");
    let row = tbody.insertRow();

    function log(x) {
      row.insertCell().appendChild(document.createTextNode(x));
    }
    log(s.generation);
    log(s.unique);
    log(s.max.toFixed(2));
    log(s.avg.toFixed(2));
    log(s.min.toFixed(2));
    log(s.best.dna);

    row.scrollIntoView();
  }
}