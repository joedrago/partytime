var fs = require("fs");
var coffee = require("coffee-script");
coffee.eval(String(fs.readFileSync("./partytime.coffee")));
