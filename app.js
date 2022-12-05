const net = require('net');
const { SerialPort } = require("serialport");

let PORT = 3002;
let HOST = '127.0.0.1';

let serialPort = new SerialPort({ 
    path: '/take/your/path', 
    baudRate: 115200
});

serialPort.on('open', () => {
    console.log("-- Connection to serial port opened --");
});

const server = net.createServer((connection) => { 
    if (serialPort.isOpen) {
        console.log('-- Client connected --');
    }
    
    connection.on('end', () => {
        console.log('-- Client disconnected --');
        connection.destroy();
    });

    connection.pipe(connection);

    serialPort.on('data', data => {
        if (!connection.destroyed) {
            console.log(data);
            connection.write(data);
        }
    });
});

server.listen(PORT, HOST, () => { 
    console.log('Server is listening on port ' + PORT);
});

server.on('connection', connection => {
    if (!connection.destroyed) {
        connection.on('data', data => {
            console.log(data);
            serialPort.write(data);
        });
    }

    connection.pipe(connection);
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.log('Address in use, retrying...');
        setTimeout(() => {
            server.close();
            server.listen(PORT, HOST);
        }, 1000);
    }
});
