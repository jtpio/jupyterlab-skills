# Dictionaries: values by name

A **dictionary** maps keys to values. You write it with braces:
`{"apple": 3, "pear": 5}`. You get a value with its key, `stock["apple"]`, and
you add or change a value with an assignment, `stock["plum"] = 7`.

A key must be unique and immutable: strings, numbers and tuples are good keys,
lists are not. Since Python 3.7, a dictionary keeps the order in which you
inserted the keys. The method `get(key, default)` gives a default value when the
key is not there, so you do not need an `if` before each read.

## Your task

Complete the function `count_words(text)`. It must return a dictionary that
maps each word of the text (in lower case) to the number of times the word
occurs. Use `dict.get` to start each count at zero.
