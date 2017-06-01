"use strict";
exports.__esModule = true;
var serialport = require("serialport");
var repl = require("repl");
var serialOptions = {
    baudRate: 115200,
    rtscts: true,
    parity: 'none',
    stopBits: 1,
    dataBits: 8,
    parser: serialport.parsers.byteLength(8) //.readline('\n', 'ascii')
};
var port = new serialport('COM7', serialOptions);
port.on('open', function () {
    console.log('serial ready');
});
// open errors will be emitted as an error event
port.on('error', function (err) {
    console.log('Error: ', err.message);
});
port.on('data', function (data) {
    console.log(data.toString('hex'));
});
var WiFire = (function () {
    function WiFire() {
    }
    WiFire.prototype.on = function (addr) {
        var hexAddr = parseInt(addr);
        if (hexAddr < 0 || hexAddr > 15) {
            console.log("Cannot evaluate " + addr + "  Please send between 0x00 and 0xff");
        }
        var buffer = new Buffer(3);
        buffer[0] = 0xff;
        buffer[1] = hexAddr;
        buffer[2] = 0x01;
        console.log("sending " + buffer.toString('hex') + " to serial");
        port.write(buffer, function (err) {
            if (err) {
                return console.log('Error on write: ', err.message);
            }
            console.log('message written');
        });
    };
    WiFire.prototype.off = function (addr) {
        var hexAddr = parseInt(addr);
        if (hexAddr < 0 || hexAddr > 15) {
            console.log("Cannot evaluate " + addr + "  Please send between 0x00 and 0xff");
        }
        var buffer = new Buffer(3);
        buffer[0] = 0xff;
        buffer[1] = hexAddr;
        buffer[2] = 0x00;
        console.log("sending " + buffer.toString('hex') + " to serial");
        port.write(buffer, function (err) {
            if (err) {
                return console.log('Error on write: ', err.message);
            }
            console.log('message written');
        });
    };
    return WiFire;
}());
var XBEE = (function () {
    function XBEE() {
    }
    XBEE.prototype.send = function (cmd) {
        port.write(cmd + '\r', function (err) {
            if (err)
                console.log("Error on write: " + err);
        });
        console.log("command sent: " + cmd);
    };
    XBEE.prototype.init = function () {
        port.write('$$$', function (err) {
            if (err)
                console.log("Error on write: " + err);
        });
        console.log('init sent');
    };
    XBEE.prototype.scan = function () {
        this.send('scan');
    };
    XBEE.prototype.wlan = function () {
        this.send('');
    };
    return XBEE;
}());
var wifire = new WiFire();
var xbee = new XBEE();
var r = repl.start({
    prompt: '$ ',
    eval: function (cmd, context, filename, callback) {
        var fn = cmd.slice(0, -1);
        typeof wifire[fn] === 'function' ? wifire[fn]() : xbee.send(fn);
        callback(null);
    }
});
r.on('exit', function () { return port.close(); });
// r.context.on = wifire.on;
// r.context.off = wifire.off;
// r.context.send = xbee.send;
// r.context.init = xbee.init;
// r.context.scan = xbee.scan;
// r.context.wifire = wifire;
// r.context.xbee = xbee; 
//# sourceMappingURL=serialcom.js.map