import * as serialport from 'serialport';
import * as repl from 'repl';


let serialOptions: serialport.options = {
  baudRate: 115200,
  rtscts: true,
  parity: 'none',
  stopBits: 1,
  dataBits: 8,
  parser: serialport.parsers.byteLength(8) //.readline('\n', 'ascii')
}

let port = new serialport('COM7', serialOptions);

port.on('open', function() {
  console.log('serial ready');
});

// open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message);
});

port.on('data', (data: Buffer) => {
    console.log(data.toString('hex'));
});

class WiFire
{
    public on(addr: string)
    {
        let hexAddr = parseInt(addr);
        if(hexAddr < 0 || hexAddr > 15)
        {
        console.log(`Cannot evaluate ${addr}  Please send between 0x00 and 0xff`)
        }
        let buffer = new Buffer(3);
        buffer[0] = 0xff;
        buffer[1] = hexAddr;
        buffer[2] = 0x01;

        console.log(`sending ${buffer.toString('hex')} to serial`);

        port.write(buffer, function(err) {
            if (err) {
            return console.log('Error on write: ', err.message);
            }
            console.log('message written');
        });
    }

    public off(addr: string)
    {
        let hexAddr = parseInt(addr);
        if(hexAddr < 0 || hexAddr > 15)
        {
        console.log(`Cannot evaluate ${addr}  Please send between 0x00 and 0xff`)
        }
        let buffer = new Buffer(3);
        buffer[0] = 0xff;
        buffer[1] = hexAddr;
        buffer[2] = 0x00;

        console.log(`sending ${buffer.toString('hex')} to serial`);

        port.write(buffer, function(err) {
            if (err) {
            return console.log('Error on write: ', err.message);
            }
            console.log('message written');
        });
    }
}

class XBEE{
    public send(cmd: string)
    {
        port.write(cmd + '\r', (err) => {
            if(err)
            console.log(`Error on write: ${err}`);
        });
        console.log(`command sent: ${cmd}`);
    }

    public init()
    {
        port.write('$$$', (err) => {
            if(err)
            console.log(`Error on write: ${err}`);
        });
        console.log('init sent');
    }

    public scan()
    {
        this.send('scan');
    }

    public wlan()
    {
        this.send('')
    }
}

let wifire = new WiFire();
let xbee = new XBEE();

let r: repl.REPLServer = repl.start(
    {
        prompt: '$ ',
        eval: (cmd: string, context: any, filename: string, callback: (err: string, result?: boolean) => any)  => {
            let fn = cmd.slice(0, -1);
            typeof wifire[fn] === 'function' ? wifire[fn]() : xbee.send(fn);
            callback(null);
        }
    });

r.on('exit', () => port.close());

// r.context.on = wifire.on;
// r.context.off = wifire.off;
// r.context.send = xbee.send;
// r.context.init = xbee.init;
// r.context.scan = xbee.scan;
// r.context.wifire = wifire;
// r.context.xbee = xbee;