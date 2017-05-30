import * as serialport from 'serialport';
import * as repl from 'repl';

let serialOptions: serialport.options = {
  baudRate: 9600,
  rtscts: true,
  parity: 'none',
  stopBits: 1,
  dataBits: 8,
  parser: serialport.parsers.readline('\r', 'ascii')
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
    console.log(data.toString('ascii'));
});


function on(addr: string)
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

function off(addr: string)
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

function send(cmd: string)
{
  port.write(cmd + '\r', (err) => {
    if(err)
      console.log(`Error on write: ${err}`);
  });
  console.log('command sent');
}

function init()
{
  port.write('$$$', (err) => {
    if(err)
      console.log(`Error on write: ${err}`);
  });
  console.log('init sent');
}

function scan()
{
  port.write('scan\r', (err) => {
    if(err)
      console.log(`Error on write: ${err}`);
  });
  console.log('scan sent');
}

let r: repl.REPLServer = repl.start('$ ');

r.on('exit', () => port.close());

r.context.on = on;
r.context.off = off;
r.context.send = send;
r.context.init = init;
r.context.scan = scan;