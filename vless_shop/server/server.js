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



// server-cloudflare-ssl.js
import express from 'express';
import https from 'https';
import http from 'http';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ====================
// CLOUDFLARE SSL НАСТРОЙКИ
// ====================

// Вариант A: Cloudflare Origin Certificate (рекомендуется)
// 1. В панели Cloudflare: SSL/TLS → Origin Server → Create Certificate
// 2. Выберите RSA (2048) или ECC
// 3. Сохраните ключ и сертификат в файлы

const sslOptions = {
    // Cloudflare Origin Certificate
    key: fs.readFileSync(path.join(__dirname, '/root/cert/prosubaru.life/fullchain.pem')),
    cert: fs.readFileSync(path.join(__dirname, '/root/cert/prosubaru.life/privkey.pem')),
    
    // ИЛИ Let's Encrypt (если хотите прямой доступ)
    // key: fs.readFileSync('/etc/letsencrypt/live/ваш-домен.com/privkey.pem'),
    // cert: fs.readFileSync('/etc/letsencrypt/live/ваш-домен.com/fullchain.pem'),
    
    // Дополнительные настройки
    minVersion: 'TLSv1.2',
    ciphers: [
        'ECDHE-ECDSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-ECDSA-CHACHA20-POLY1305',
        'ECDHE-RSA-CHACHA20-POLY1305'
    ].join(':'),
    honorCipherOrder: true
};

// ====================
// MIDDLEWARE ДЛЯ CLOUDFLARE
// ====================

// Защита headers с помощью helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https://api.ваш-домен.com"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // лимит запросов с одного IP
    message: 'Слишком много запросов с вашего IP',
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

// Trust Cloudflare proxy (важно!)
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal', '172.64.0.0/13', '173.245.48.0/20']);

// Cloudflare middleware - получение реального IP
app.use((req, res, next) => {
    // Cloudflare передаёт реальный IP в этих заголовках
    const cfConnectingIp = req.headers['cf-connecting-ip'];
    const xForwardedFor = req.headers['x-forwarded-for'];
    
    // Реальный IP пользователя
    req.realIp = cfConnectingIp || 
                 (xForwardedFor ? xForwardedFor.split(',')[0].trim() : null) || 
                 req.ip;
    
    // Флаг что запрос через Cloudflare
    req.fromCloudflare = !!req.headers['cf-ray'];
    
    // Логирование
    if (req.fromCloudflare) {
        console.log({
            timestamp: new Date().toISOString(),
            realIp: req.realIp,
            cfRay: req.headers['cf-ray'],
            country: req.headers['cf-ipcountry'],
            method: req.method,
            path: req.path,
            userAgent: req.headers['user-agent']?.substring(0, 100)
        });
    }
    
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
            <title>Express + Cloudflare SSL</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            <style>
                :root {
                    --cf-orange: #f38020;
                    --cf-yellow: #faae40;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    color: white;
                    min-height: 100vh;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 40px 20px;
                }
                header {
                    text-align: center;
                    margin-bottom: 50px;
                }
                .cf-logo {
                    font-size: 4em;
                    color: var(--cf-orange);
                    margin-bottom: 20px;
                }
                .status-badges {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin: 20px 0;
                    flex-wrap: wrap;
                }
                .badge {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 10px 25px;
                    border-radius: 25px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .badge i {
                    color: var(--cf-yellow);
                }
                .grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 30px;
                    margin: 40px 0;
                }
                .card {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 30px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: transform 0.3s;
                }
                .card:hover {
                    transform: translateY(-5px);
                    background: rgba(255, 255, 255, 0.08);
                }
                .card h3 {
                    color: var(--cf-yellow);
                    margin-top: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .info-line {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .api-links {
                    display: flex;
                    gap: 15px;
                    margin-top: 30px;
                    flex-wrap: wrap;
                }
                .api-link {
                    background: var(--cf-orange);
                    color: white;
                    padding: 12px 25px;
                    border-radius: 8px;
                    text-decoration: none;
                    transition: background 0.3s;
                }
                .api-link:hover {
                    background: var(--cf-yellow);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <div class="cf-logo">
                        <i class="fas fa-cloud"></i>
                    </div>
                    <h1>Express + Cloudflare SSL</h1>
                    <p>Полная интеграция Cloudflare с SSL/TLS шифрованием</p>
                    
                    <div class="status-badges">
                        <div class="badge">
                            <i class="fas fa-shield-alt"></i>
                            SSL: ${req.secure ? 'Активен' : 'Неактивен'}
                        </div>
                        <div class="badge">
                            <i class="fas fa-bolt"></i>
                            Cloudflare: ${req.fromCloudflare ? 'Подключен' : 'Прямое'}
                        </div>
                        <div class="badge">
                            <i class="fas fa-server"></i>
                            Порт: ${PORT}
                        </div>
                        <div class="badge">
                            <i class="fas fa-globe"></i>
                            ${req.headers['cf-ipcountry'] || 'Неизвестно'}
                        </div>
                    </div>
                </header>
                
                <div class="grid">
                    <div class="card">
                        <h3><i class="fas fa-lock"></i> SSL Информация</h3>
                        <div class="info-line">
                            <span>Протокол:</span>
                            <strong>${req.protocol}</strong>
                        </div>
                        <div class="info-line">
                            <span>Cloudflare SSL:</span>
                            <strong>Full (Strict)</strong>
                        </div>
                        <div class="info-line">
                            <span>Origin SSL:</span>
                            <strong>${sslOptions.cert ? 'Установлен' : 'Не установлен'}</strong>
                        </div>
                        <div class="info-line">
                            <span>Шифрование:</span>
                            <strong>TLS 1.2+</strong>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3><i class="fas fa-user"></i> Ваши данные</h3>
                        <div class="info-line">
                            <span>Реальный IP:</span>
                            <code>${req.realIp}</code>
                        </div>
                        <div class="info-line">
                            <span>Страна:</span>
                            <strong>${req.headers['cf-ipcountry'] || 'Неизвестно'}</strong>
                        </div>
                        <div class="info-line">
                            <span>Ray ID:</span>
                            <code>${req.headers['cf-ray'] || 'Неизвестно'}</code>
                        </div>
                        <div class="info-line">
                            <span>User Agent:</span>
                            <small>${req.headers['user-agent']?.substring(0, 50)}...</small>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3><i class="fas fa-cogs"></i> Настройки Cloudflare</h3>
                        <ul>
                            <li>SSL/TLS: Full (Strict)</li>
                            <li>Always Use HTTPS: Включено</li>
                            <li>HTTP/2: Включено</li>
                            <li>HTTP/3: Включено</li>
                            <li>WAF: Активен</li>
                            <li>DDoS защита: Активна</li>
                        </ul>
                    </div>
                </div>
                
                <div class="api-links">
                    <a href="/api/status" class="api-link">
                        <i class="fas fa-heartbeat"></i> Статус API
                    </a>
                    <a href="/api/ssl-info" class="api-link">
                        <i class="fas fa-certificate"></i> SSL Инфо
                    </a>
                    <a href="/api/headers" class="api-link">
                        <i class="fas fa-code"></i> Headers
                    </a>
                    <a href="/health" class="api-link">
                        <i class="fas fa-stethoscope"></i> Health Check
                    </a>
                    <a href="/admin/cf-test" class="api-link">
                        <i class="fas fa-vial"></i> Cloudflare Test
                    </a>
                </div>
            </div>
        </body>
        </html>
    `);
});

// API маршруты
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        server: {
            name: 'Express + Cloudflare',
            port: PORT,
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        },
        cloudflare: {
            enabled: req.fromCloudflare,
            connectingIp: req.headers['cf-connecting-ip'],
            rayId: req.headers['cf-ray'],
            country: req.headers['cf-ipcountry'],
            visitor: req.headers['cf-visitor'],
            cacheStatus: req.headers['cf-cache-status']
        },
        ssl: {
            active: req.secure,
            protocol: req.protocol,
            forwardedProto: req.headers['x-forwarded-proto']
        },
        client: {
            realIp: req.realIp,
            userAgent: req.headers['user-agent']
        }
    });
});

// SSL информация
app.get('/api/ssl-info', (req, res) => {
    if (!req.secure) {
        return res.json({ error: 'Требуется HTTPS соединение' });
    }
    
    const cert = req.socket.getPeerCertificate();
    res.json({
        ssl: {
            active: true,
            protocol: req.socket.getProtocol(),
            cipher: req.socket.getCipher(),
            tlsVersion: req.socket.getTlsVersion(),
            certificate: {
                subject: cert.subject,
                issuer: cert.issuer,
                validFrom: cert.valid_from,
                validTo: cert.valid_to,
                serialNumber: cert.serialNumber
            }
        },
        cloudflare: {
            sslMode: 'Full (Strict)',
            encrypted: true
        }
    });
});

// Все заголовки
app.get('/api/headers', (req, res) => {
    res.json({
        headers: req.headers,
        cloudflare: {
            realIp: req.realIp,
            isFromCloudflare: req.fromCloudflare,
            cfHeaders: {
                connectingIp: req.headers['cf-connecting-ip'],
                rayId: req.headers['cf-ray'],
                country: req.headers['cf-ipcountry'],
                visitor: req.headers['cf-visitor'],
                cacheStatus: req.headers['cf-cache-status']
            }
        }
    });
});

// Health check для Cloudflare
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Тест Cloudflare
app.get('/admin/cf-test', (req, res) => {
    const isCloudflare = req.fromCloudflare;
    
    res.json({
        cloudflareTest: true,
        isThroughCloudflare: isCloudflare,
        yourConfig: {
            ssl: req.secure ? 'active' : 'inactive',
            cfHeadersPresent: {
                'cf-connecting-ip': !!req.headers['cf-connecting-ip'],
                'cf-ray': !!req.headers['cf-ray'],
                'cf-ipcountry': !!req.headers['cf-ipcountry']
            },
            recommendedSettings: {
                sslMode: 'Full (Strict)',
                alwaysUseHTTPS: 'ON',
                http2: 'ON',
                http3: 'ON',
                minTlsVersion: '1.2'
            }
        }
    });
});

// Проверка подлинности Cloudflare (опционально)
const verifyCloudflareIP = (req, res, next) => {
    const cloudflareIPs = [
        '173.245.48.0/20',
        '103.21.244.0/22',
        '103.22.200.0/22',
        '103.31.4.0/22',
        '141.101.64.0/18',
        '108.162.192.0/18',
        '190.93.240.0/20',
        '188.114.96.0/20',
        '197.234.240.0/22',
        '198.41.128.0/17',
        '162.158.0.0/15',
        '104.16.0.0/13',
        '104.24.0.0/14',
        '172.64.0.0/13',
        '131.0.72.0/22'
    ];
    
    const clientIp = req.ip;
    const isFromCloudflareIP = cloudflareIPs.some(range => {
        const [rangeIp, mask] = range.split('/');
        return isIpInRange(clientIp, rangeIp, parseInt(mask));
    });
    
    if (!isFromCloudflareIP && process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Доступ только через Cloudflare' });
    }
    
    next();
};

// ====================
// ЗАПУСК СЕРВЕРА
// ====================

// Запуск HTTPS сервера
https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`
    ===========================================================
    🚀 Express + Cloudflare SSL сервер запущен!
    🔗 Локальный: https://localhost:${PORT}
    🌐 Публичный: https://ваш-домен.com
    
    🔐 SSL НАСТРОЙКИ CLOUDFLARE:
    1. SSL/TLS → Режим шифрования: Full (strict)
    2. SSL/TLS → Edge Certificates → Always Use HTTPS: ON
    3. SSL/TLS → Edge Certificates → Minimum TLS Version: 1.2
    4. SSL/TLS → Origin Server → Create Certificate
    
    📋 ПРОВЕРКА:
    curl -I https://ваш-домен.com
    curl https://ваш-домен.com/api/status
    
    ⚠️  ВАЖНО: 
    - Origin Certificate действителен 15 лет
    - Убедитесь что порт ${PORT} открыт в фаерволе
    ===========================================================
    `);
});

// HTTP сервер для редиректа (опционально)
if (process.env.NODE_ENV === 'production') {
    http.createServer((req, res) => {
        const host = req.headers.host.replace(`:${PORT}`, '');
        res.writeHead(301, {
            'Location': `https://${host}${req.url}`,
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
        });
        res.end();
    }).listen(80, () => {
        console.log('HTTP → HTTPS редирект на порту 80');
    });
}

// Вспомогательные функции
function isIpInRange(ip, rangeIp, mask) {
    const ipToInt = (ip) => ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
    const maskInt = ~((1 << (32 - mask)) - 1) >>> 0;
    return (ipToInt(ip) & maskInt) === (ipToInt(rangeIp) & maskInt);
}