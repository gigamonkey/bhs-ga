/*
 * Ad hoc tests for the voss-alias code.
 */

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

