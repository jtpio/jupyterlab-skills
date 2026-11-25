# Lists: ordered collections

A **list** holds values in a fixed order. You write it with square brackets and
commas: `[3, 1, 2]`. A list can hold values of any type, and it can change after
you create it: you can append, insert and remove items.

Each item has an **index**. The first item has the index `0`, the last item has
the index `len(items) - 1`. A negative index counts from the end, so `items[-1]`
is the last item. A **slice** such as `items[1:3]` gives a new list with the
items from index 1 up to, but not including, index 3.

## Your task

In the notebook, complete the function `middle(items)`. It must return the
list without its first and its last item. Use a slice, not a loop. Then run the
cell with the checks: each line must start with `ok`.
