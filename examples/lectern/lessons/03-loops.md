# Loops: do it again

A `for` loop runs its body once for each item of a sequence. The function
`range(n)` gives the numbers from `0` to `n - 1`, and `enumerate(items)` gives
each item together with its index.

A `while` loop runs as long as its condition is true. Use it when you do not
know in advance how many times the body must run. Make sure that the body
changes the condition, or the loop does not stop.

## Your task

Complete the function `collatz_steps(n)`. While `n` is not `1`: if `n` is even,
divide it by two; else replace it with `3 * n + 1`. Return the number of steps
that it takes to reach `1`.
