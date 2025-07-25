const express = require('express');
const app = express();
const port = 80;

// IPv6マッピングされたIPv4アドレスをIPv4に変換する関数
function normalizeIPv4(ip) {
    if (ip && ip.startsWith('::ffff:')) {
        return ip.substring(7);
    }
    return ip;
}

app.get('/', (req, res) => {
    let ipAddress;
    let proxyHistory = [];
    
    // X-Forwarded-Forヘッダーをチェック
    if (req.headers['x-forwarded-for']) {
        // プロキシ履歴を取得
        proxyHistory = req.headers['x-forwarded-for'].split(',').map(ip => normalizeIPv4(ip.trim()));
        // 最初のIPアドレスが元のクライアントのIPアドレス
        ipAddress = proxyHistory[0];
    } else {
        // 直接のリモートアドレス
        ipAddress = normalizeIPv4(req.socket.remoteAddress);
    }
    
    // サーバーログにIPアドレスとプロキシ履歴を表示
    console.log(`[${new Date().toISOString()}] クライアントIP: ${ipAddress}`);
    if (proxyHistory.length > 1) {
        console.log(`[${new Date().toISOString()}] プロキシ履歴: ${proxyHistory.join(' -> ')}`);
    }
    
    // Web表示用のレスポンス
    let responseText = `あなたのグローバルIPアドレスは: ${ipAddress}`;
    if (proxyHistory.length > 1) {
        responseText += `\n\nプロキシ履歴: ${proxyHistory.join(' -> ')}`;
    }
    
    res.send(responseText);
});

app.listen(port, () => {
    console.log(`Server listening at http://0.0.0.0:${port}`);
});
