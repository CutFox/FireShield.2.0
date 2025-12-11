// import express from 'express';

// const app = express();

// app.get("/", async (req, res) => {
//   res.send("add");
// });

// app.post("/post", async (req, res) => {
//   res.send("add post endpoint");
// });

// app.get('/redirect_app', async (req, res) => {
//     try {
//         const { target } = req.query;
//         if (!target) {
//             return res.status(404);
//         }
//         let targetUrl;
//         try {
            
//             if (target.startsWith('happ')) {
//               targetUrl = new URL(target);  
//             }

//         } catch {
//             console.log('Invalid URL format');
//         }
//         res.redirect(target);
//     } catch (error) {
//         console.error('Redirect error:', error);
//         res.status(500).json({
//             error: 'Internal server error',
//             message: error.message
//         });
//     }
// });

// app.get('/redirect', (req, res) => {
//     res.redirect(`happ://crypt4/wHjraNeLxL5pabHzutJK7WQfuTL8DJtbRqwLk0eN9k/ZsGc4rEYadbx9bHy0pfL7rqHMKYhd0ixPj+hjUHjcu7V1uLXSkVhM1KHWTkUcCs6qcLF6HFvSE7o2qqE+edQ/3V9oyryLKQTJIF38k3cBfioMuGpV2lZb0MUa4OWmllmbSZlq558CnzcBA9tFHBW4SkslOdD3iqNE1n5stutAr9HRvKrr7oIE69CoVjlZHQUKeP9KY9vIQOEmZv1QSypBj+ihIva7gJ7I0AavKzlU+iT7HDXknmkQat/bpIgJLAoVTnrnoOrMK2CCH11h7zeFQW08XRndiOj1qi6lF5wcQuaUYL/seTH0N5VTJHvRQzAKYWgEhcK+P/JhgOgJDXN6W5n2U7IJ9PdzQ7B4Su78M44hTWBvNHJI3782oQvmeSW/G2Ol/UiGRbfjuRVr0vn/w7dYVLbo3iSGuKyEXN4eaGJS44jo90zkqc7Lh174RwBCNPJjt+ml/ijWl/bV2XlsBBWv5pFPRf3NAtGDPtRi3Q1aB26xlQC9tRRA/5MXPTJTPvevUx6rXPGtvNFaxKrA2vilr4I7z3ZjYTXFUXJut9IFRoaY3BnX54KHcG6lRdXCSA+6Pxqus6G1TyP9oUdNjr/KhfG+XX605sXS6dGf0bf4Z/Ct7vtmPYL8Ps2vxBo=`);
// });

// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });



// server-ssl-prosubaru.js
import express from 'express';
import https from 'https';
import http from 'http';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 8080;

// ====================
// ПРАВИЛЬНАЯ SSL КОНФИГУРАЦИЯ
// ====================

const sslOptions = {
    // ПРИВАТНЫЙ КЛЮЧ - это отдельный файл!
    key: fs.readFileSync('/root/cert/prosubaru.life/privkey.pem'),
    
    // СЕРТИФИКАТ - цепочка сертификатов
    cert: fs.readFileSync('/root/cert/prosubaru.life/fullchain.pem'),
    
    // Дополнительно: промежуточные сертификаты (обычно уже в fullchain.pem)
    // ca: fs.readFileSync('/root/cert/prosubaru.life/chain.pem')
};

// ====================
// ПРОВЕРКА ФАЙЛОВ
// ====================

console.log('🔍 Проверка SSL файлов...');

try {
    // Проверяем приватный ключ
    const keyPath = '/root/cert/prosubaru.life/privkey.pem';
    if (!fs.existsSync(keyPath)) {
        throw new Error(`❌ Не найден приватный ключ: ${keyPath}`);
    }
    
    const keyContent = fs.readFileSync(keyPath, 'utf8');
    if (!keyContent.includes('BEGIN PRIVATE KEY') && 
        !keyContent.includes('BEGIN RSA PRIVATE KEY') && 
        !keyContent.includes('BEGIN EC PRIVATE KEY')) {
        throw new Error(`❌ Файл ${keyPath} не является приватным ключом`);
    }
    console.log(`✅ Приватный ключ: ${keyPath} (${fs.statSync(keyPath).size} байт)`);
    
    // Проверяем сертификат
    const certPath = '/root/cert/prosubaru.life/fullchain.pem';
    if (!fs.existsSync(certPath)) {
        throw new Error(`❌ Не найден сертификат: ${certPath}`);
    }
    
    const certContent = fs.readFileSync(certPath, 'utf8');
    if (!certContent.includes('BEGIN CERTIFICATE')) {
        throw new Error(`❌ Файл ${certPath} не является сертификатом`);
    }
    console.log(`✅ Сертификат: ${certPath} (${fs.statSync(certPath).size} байт)`);
    
    // Проверяем цепочку сертификатов
    const certCount = (certContent.match(/BEGIN CERTIFICATE/g) || []).length;
    console.log(`📊 Цепочка содержит ${certCount} сертификат(ов)`);
    
} catch (error) {
    console.error('❌ Ошибка загрузки SSL файлов:', error.message);
    console.log('\n📁 Содержимое папки /root/cert/prosubaru.life/:');
    
    try {
        const files = fs.readdirSync('/root/cert/prosubaru.life/');
        files.forEach(file => {
            const filePath = `/root/cert/prosubaru.life/${file}`;
            const stats = fs.statSync(filePath);
            console.log(`  ${file} - ${stats.size} байт`);
        });
    } catch (e) {
        console.log('  Не удалось прочитать директорию');
    }
    
    process.exit(1);
}

// ====================
// БАЗОВЫЕ НАСТРОЙКИ
// ====================

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// ====================
// МАРШРУТЫ
// ====================

// Главная страница
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>ProSubaru.Life - SSL Server</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 40px;
                    background: linear-gradient(to right, #0f2027, #203a43, #2c5364);
                    color: white;
                    text-align: center;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 30px;
                    border-radius: 15px;
                    backdrop-filter: blur(10px);
                }
                h1 {
                    color: #4CAF50;
                }
                .status {
                    display: inline-block;
                    background: #4CAF50;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 25px;
                    margin: 20px 0;
                }
                .file-info {
                    background: rgba(0, 0, 0, 0.2);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    text-align: left;
                    font-family: monospace;
                }
                .links a {
                    display: inline-block;
                    margin: 10px;
                    padding: 12px 25px;
                    background: #2196F3;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚗 ProSubaru.Life</h1>
                <div class="status">
                    🔐 SSL: ${req.secure ? 'АКТИВЕН' : 'НЕАКТИВЕН'}
                </div>
                
                <p>Express сервер с SSL шифрованием</p>
                
                <div class="file-info">
                    <strong>SSL файлы:</strong><br>
                    🔑 Ключ: /root/cert/prosubaru.life/privkey.pem<br>
                    📄 Сертификат: /root/cert/prosubaru.life/fullchain.pem<br>
                    🌐 Домен: prosubaru.life<br>
                    📍 Порт: ${PORT}
                </div>
                
                <div class="links">
                    <a href="/api/status">Статус API</a>
                    <a href="/ssl-info">Инфо SSL</a>
                    <a href="/health">Health Check</a>
                    <a href="/cert-check">Проверка сертификата</a>
                </div>
                
                <p style="margin-top: 30px; font-size: 0.9em; color: #aaa;">
                    Сервер запущен: ${new Date().toLocaleString()}
                </p>
            </div>
        </body>
        </html>
    `);
});

// API маршруты
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        server: 'Express SSL',
        domain: 'prosubaru.life',
        ssl: req.secure,
        port: PORT,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('/ssl-info', (req, res) => {
    if (!req.secure) {
        return res.json({ error: 'Не HTTPS соединение' });
    }
    
    const cert = req.socket.getPeerCertificate();
    res.json({
        ssl: {
            active: true,
            protocol: req.socket.getProtocol(),
            cipher: req.socket.getCipher(),
            certificate: {
                subject: cert.subject,
                issuer: cert.issuer,
                validFrom: cert.valid_from,
                validTo: cert.valid_to
            }
        }
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString() 
    });
});

app.get('/cert-check', (req, res) => {
    try {
        const certContent = fs.readFileSync('/root/cert/prosubaru.life/fullchain.pem', 'utf8');
        const certs = certContent.split('-----END CERTIFICATE-----')
            .filter(cert => cert.trim())
            .map(cert => cert + '-----END CERTIFICATE-----');
        
        res.json({
            certificates: certs.length,
            firstCert: certs[0]?.substring(0, 200) + '...',
            fileSize: fs.statSync('/root/cert/prosubaru.life/fullchain.pem').size
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/redirect_app', async (req, res) => {
    try {
        const { target } = req.query;
        if (!target) {
            return res.status(404);
        }
        let targetUrl;
        try {
            
            if (target.startsWith('happ')) {
              targetUrl = new URL(target);  
            }

        } catch {
            console.log('Invalid URL format');
        }
        res.redirect(target);
    } catch (error) {
        console.error('Redirect error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});



// ====================
// ЗАПУСК СЕРВЕРА
// ====================

// HTTPS сервер
const httpsServer = https.createServer(sslOptions, app);

httpsServer.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ====================================================
    🚀 Express SSL сервер запущен!
    🌐 Домен: prosubaru.life
    📍 Порт: ${PORT}
    🔐 SSL: АКТИВЕН
    
    📁 SSL файлы:
    🔑 Приватный ключ: /root/cert/prosubaru.life/privkey.pem
    📄 Сертификат: /root/cert/prosubaru.life/fullchain.pem
    
    🌐 Доступ по адресам:
    • https://prosubaru.life:${PORT}
    • https://localhost:${PORT}
    • https://[ваш-ip]:${PORT}
    
    🔍 Проверка:
    curl -k https://localhost:${PORT}
    openssl s_client -connect localhost:${PORT} -servername prosubaru.life
    ====================================================
    `);
});

// HTTP -> HTTPS редирект (опционально)
http.createServer((req, res) => {
    const host = req.headers.host.split(':')[0];
    res.writeHead(301, { 
        'Location': `https://${host}:${PORT}${req.url}` 
    });
    res.end();
}).listen(80, () => {
    console.log('🔄 HTTP -> HTTPS редирект на порту 80');
});