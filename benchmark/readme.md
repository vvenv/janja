# Template Engine Benchmark

This project is a benchmark designed to evaluate the performance of various JavaScript template engines. It allows developers to compare rendering performance of several popular template engines in various scenarios.

## How to use ?

**1. Clone this repo on your machine:**
```bash
git clone https://github.com/itsarnaud/templating-engine-bench.git
```

**2. Install dependencies:**
```bash
npm install
```

**3. Launch the benchmark by executing:**
```bash
node main.js
```

**4. Results:<br/>**
Once the benchmark is completed, the results will be automatically updated in the readme file.

## Current results

The tests were carried out on:
- Node v21.7.2
- MacBook Air M2, 15-inch with 16GB of RAM (2023)

<!-- <render performance> -->
## RENDER 

### friends (runned 5000 times) 
`template` => **44ms** <br/> 
`pug` => **787ms** <br/> 
`igodust` => **816ms** <br/> 
`eta` => **822ms** <br/> 
`handlebars` => **1668ms** <br/> 
`ejs` => **5168ms** <br/> 
`liquidjs` => **23253ms** <br/> 

### if-expression (runned 5000 times) 
`pug` => **8ms** <br/> 
`igodust` => **11ms** <br/> 
`template` => **30ms** <br/> 
`liquidjs` => **137ms** <br/> 
`eta` => **154ms** <br/> 
`ejs` => **242ms** <br/> 

### projects-escaped (runned 5000 times) 
`template` => **28ms** <br/> 
`handlebars` => **55ms** <br/> 
`igodust` => **61ms** <br/> 
`eta` => **193ms** <br/> 
`liquidjs` => **242ms** <br/> 
`ejs` => **312ms** <br/> 
`pug` => **641ms** <br/> 

### projects-unescaped (runned 5000 times) 
`igodust` => **11ms** <br/> 
`template` => **30ms** <br/> 
`handlebars` => **52ms** <br/> 
`eta` => **181ms** <br/> 
`liquidjs` => **241ms** <br/> 
`ejs` => **327ms** <br/> 
`pug` => **640ms** <br/> 

### search-results (runned 5000 times) 
`igodust` => **22ms** <br/> 
`template` => **31ms** <br/> 
`pug` => **81ms** <br/> 
`handlebars` => **205ms** <br/> 
`eta` => **261ms** <br/> 
`ejs` => **1004ms** <br/> 
`liquidjs` => **2175ms** <br/> 

### simple-0 (runned 5000 times) 
`pug` => **3ms** <br/> 
`igodust` => **6ms** <br/> 
`handlebars` => **10ms** <br/> 
`liquidjs` => **20ms** <br/> 
`template` => **29ms** <br/> 
`eta` => **106ms** <br/> 
`ejs` => **126ms** <br/> 

### simple-1 (runned 5000 times) 
`pug` => **11ms** <br/> 
`igodust` => **15ms** <br/> 
`handlebars` => **25ms** <br/> 
`template` => **30ms** <br/> 
`eta` => **156ms** <br/> 
`liquidjs` => **167ms** <br/> 
`ejs` => **289ms** <br/> 

### simple-2 (runned 5000 times) 
`pug` => **9ms** <br/> 
`igodust` => **13ms** <br/> 
`handlebars` => **20ms** <br/> 
`template` => **29ms** <br/> 
`eta` => **157ms** <br/> 
`liquidjs` => **160ms** <br/> 
`ejs` => **267ms** <br/> 

<!-- <end> -->

## Adding a new Template Engine

To add a new template engine to this project, follow these simple steps:

**1. Create a file for the template engine:<br/>**
In the `engines` directory, create a new file named after your template engine, for example `my-engine.js`. Take a look at the files already created for the syntax.

```
engines
 ├── igodust.js
 ├── my-engine.js
 └── ...
```
**⚠️ WARNING: Asynchronous rendering methods, such as those returning Promises, are not supported by the benchmarking tool at the moment. Ensure that your rendering method is synchronous to work with the benchmarking tool effectively. ⚠️**

**2. Add test templates: <br/>**
Place your template files in the templates directory, following the existing structure. Each test group should have a data file (.js or .json) and template files for each template engine you want to include in the benchmark.

```
templates
 ├── group1
 │   ├── data.js (or json)
 │   ├── template.dust
 │   ├── template.my-engine
 │   └── ...
 └── ...
```

 And that's it, all you have to do is launch the benchmark!

 PRs are welcome 😃❤️
