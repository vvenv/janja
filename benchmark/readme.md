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
`template` => **33ms** <br/> 
`pug` => **543ms** <br/> 
`igodust` => **630ms** <br/> 
`eta` => **663ms** <br/> 
`handlebars` => **1306ms** <br/> 
`ejs` => **3976ms** <br/> 
`liquidjs` => **18619ms** <br/> 

### if-expression (runned 5000 times) 
`pug` => **6ms** <br/> 
`igodust` => **8ms** <br/> 
`template` => **23ms** <br/> 
`liquidjs` => **112ms** <br/> 
`eta` => **118ms** <br/> 
`ejs` => **191ms** <br/> 

### projects-escaped (runned 5000 times) 
`template` => **23ms** <br/> 
`handlebars` => **46ms** <br/> 
`igodust` => **50ms** <br/> 
`eta` => **149ms** <br/> 
`liquidjs` => **187ms** <br/> 
`ejs` => **246ms** <br/> 
`pug` => **490ms** <br/> 

### projects-unescaped (runned 5000 times) 
`igodust` => **9ms** <br/> 
`template` => **24ms** <br/> 
`handlebars` => **40ms** <br/> 
`eta` => **148ms** <br/> 
`liquidjs` => **185ms** <br/> 
`ejs` => **259ms** <br/> 
`pug` => **489ms** <br/> 

### search-results (runned 5000 times) 
`igodust` => **17ms** <br/> 
`template` => **25ms** <br/> 
`pug` => **66ms** <br/> 
`handlebars` => **166ms** <br/> 
`eta` => **215ms** <br/> 
`ejs` => **738ms** <br/> 
`liquidjs` => **1718ms** <br/> 

### simple-0 (runned 5000 times) 
`pug` => **2ms** <br/> 
`igodust` => **5ms** <br/> 
`liquidjs` => **21ms** <br/> 
`template` => **23ms** <br/> 
`handlebars` => **34ms** <br/> 
`eta` => **87ms** <br/> 
`ejs` => **88ms** <br/> 

### simple-1 (runned 5000 times) 
`pug` => **8ms** <br/> 
`igodust` => **11ms** <br/> 
`handlebars` => **20ms** <br/> 
`template` => **22ms** <br/> 
`eta` => **121ms** <br/> 
`liquidjs` => **131ms** <br/> 
`ejs` => **239ms** <br/> 

### simple-2 (runned 5000 times) 
`pug` => **6ms** <br/> 
`igodust` => **10ms** <br/> 
`handlebars` => **16ms** <br/> 
`template` => **24ms** <br/> 
`eta` => **119ms** <br/> 
`liquidjs` => **125ms** <br/> 
`ejs` => **208ms** <br/> 

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
