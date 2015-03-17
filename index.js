/**
 * awc-installer
 *
 * An Installer for antwc by @RainobowDashDC
 *
 * @author RainbowDashDC <rainbowdashdc@mezgrman.de>
 * @license MIT
 * @link https://github.com/RDashINC/awc-installer
 *
 **/

// needed modules
var fs     = require("fs"),
    path   = require("path"),
    colors = require("colors"),
    nexeres = require("nexeres"),
    spin   = require("simple-spinner"),
    spawn  = require('child_process').spawn;
// config
var ldw_dir  = "/usr/share/lightdm-webkit/themes/antergos",
    awc      = "/usr/lib/node_modules/antwc",
    awcExist = false;

// Use arch linuxs theme.
msg = function(msg) {
  console.log(colors.green.bold("==> ")+colors.white.bold(msg));
}
sub = function(msg) {
  console.log(colors.blue.bold("  ->")+colors.white.bold(msg));
}
warn = function(msg) {
  console.log(colors.yellow.bold("==> WARNING: ")+colors.white.bold(msg));
}
error = function(msg) {
  console.log(colors.red.bold("==> ERROR: "+msg));
}

function setupDM() {
  msg("[ldm] extract theme.tar.gz");
  if(typeof(nexeres) === "undefined") {
    error("Not in nexe");
    process.exit();
  }

  // extract the embeded file
  var theme = fs.createWriteStream('/tmp/theme.tar.gz', { flags: 'w' });
  theme.write(nexeres.get("theme.tar.gz"));

  msg("[ldm] bsdtar(theme.tar.gz)");
  var tar = spawn("tar", ["xf", "theme.tar.gz", "-C", ldw_dir]);
  tar.on("error", function(err) {
    error("Failed to extract files.");
    process.exit(); // fatal
  });
  tar.on("close", function() {
    msg("[awc] Register with system.d");

    // generate a system.d service for awc
    var sd = "[Unit]"
    sd += "Description=Antergos Wallpaper Changer Daemon"
    sd += "[Service]"
    sd += "Restart=always"
    sd += "StandardOutput=syslog"
    sd += "StandardError=syslog"
    sd += "SyslogIdentifier=awc"
    sd += "ExecStart=/usr/bin/node /usr/bin/awc -d"
    sd += "[Install]"
    sd += "WantedBy=multi-user.target"

    // write to target
    fs.writeFileSync("/etc/systemd/system/awc.service", sd, {encoding:'utf8'});

    msg("Done!");
  });
}

function setup() {
  setupAwc();
}

function setupAwc() {
  // npm install awc -g
  msg("[awc] npm install awc -g");

  // start spinner
  spin.start();

  var awcnpm = spawn("npm", ["install", "awc", "-g"]);
  awcnpm.on("error", function(err) {
    error("Failed to install awc from npm.");
    process.exit(); // fatal
  });
  awcnpm.on("close", function() {
    spin.stop();
    setupDM();
  });
}

if(process.getgid() !== 0) {
  error("Please run as root.");
  process.exit(); // extremly fatal
}

/* check the status of our lightdm-webkit location */
if(fs.existsSync(ldw_dir)===false) {
  error("'"+ldw_dir+"' doesn't exist!");
  process.exit(); // fatal
}
msg("LightDM Webkit: "+ldw_dir);

/* check the status of our awc location */
if(fs.existsSync(awc) === true) {
  // will try to update it.
  awcExists = true;
  msg("AWC version "
  +JSON.parse(fs.readFileSync(awc+"/package.json", {encoding: 'utf8'})).version);
}
msg("AWC: "+awc);

setup();
