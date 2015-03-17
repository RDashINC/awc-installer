var nexe = require("nexe");
var colors = require("colors");
console.log("==> ".bold.green+"Starting build".bold.white)
nexe.compile(
  {
    input: "./index.js",
    output: "./awc-installer",
    nodeVersion: "latest",
    python: "/usr/bin/python2",
    nodeTempDir: "tmp/",
    resourceFiles: ["./theme.tar.gz"]
  },
  function (err) {
    if (err) {
      console.log(colors.bold.red("==> "+err));
    }
  }
);
