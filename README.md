# WEBPACK-STATS-COMPARE



A tool to compare two webpack stats files to get a list of the files which are
moved into and out of each named chunk.

How to use:

`webpack-stats-compare ./path1/stats-old.json ./path2/stats-new.json`


The first argument will be the original stats file and the second
argument is the updated stats file. The order is important as it will give you opposite results.

Note: This will only compare named chunks as the index numbers are not reliable from build to build.

Output:

Modals in this case is a named chunk which had one new module moved out.
```
modals:
  Number of modules moved into chunk: 0
  Number of modules moved out chunk: 1
  Modules moved out of chunk:
    /src/NewModal/Modal.jsx
```

Please submit issues or feature requests to Github.

LICENSE: MIT