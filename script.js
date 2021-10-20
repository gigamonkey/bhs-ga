var ga = new Worker('ga.js');
ga.onmessage = (e) => logSummary(e.data);
ga.postMessage([2000, 200]);

function logSummary(s) {
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
  log(s.best);
}
