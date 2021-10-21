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

let xcities = randomCities("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 100, 100);
let knownBest = "Unknown"; // {dna: ["F","E","A","C","I","G","J","K","D","H","B"], fitness: -333.8635783212178};

let cities = [{"name":"A","x":28,"y":69},{"name":"B","x":35,"y":94},{"name":"C","x":85,"y":42},{"name":"D","x":3,"y":92},{"name":"E","x":18,"y":87},{"name":"F","x":22,"y":18},{"name":"G","x":80,"y":58},{"name":"H","x":94,"y":86},{"name":"I","x":95,"y":65},{"name":"J","x":58,"y":6},{"name":"K","x":20,"y":8},{"name":"L","x":69,"y":88},{"name":"M","x":95,"y":23},{"name":"N","x":9,"y":78},{"name":"O","x":25,"y":29},{"name":"P","x":94,"y":64},{"name":"Q","x":90,"y":48},{"name":"R","x":84,"y":28},{"name":"S","x":18,"y":37},{"name":"T","x":91,"y":2},{"name":"U","x":90,"y":82},{"name":"V","x":64,"y":74},{"name":"W","x":22,"y":86},{"name":"X","x":15,"y":44},{"name":"Y","x":67,"y":13},{"name":"Z","x":59,"y":99}];

//console.log(JSON.stringify(cities));

call('runTSP', cities, 5000, 200, knownBest);

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