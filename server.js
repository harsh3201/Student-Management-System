require('dotenv').config();
const http = require('http');
const { URL } = require('url');

const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const classRoutes = require('./routes/classRoutes');

const PORT = process.env.PORT || 5000;

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let raw = '';
        req.on('data', chunk => { raw += chunk; });
        req.on('end', () => {
            if (!raw) return resolve({});
            try { resolve(JSON.parse(raw)); }
            catch { resolve({}); }
        });
        req.on('error', reject);
    });
}

function send(res, status, data) {
    const body = JSON.stringify(data);
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
    });
    res.end(body);
}

const allRoutes = [
    ...studentRoutes.map(r => ({ ...r, prefix: '/api/admin/students' })),
    ...teacherRoutes.map(r => ({ ...r, prefix: '/api/admin/teachers' })),
    ...subjectRoutes.map(r => ({ ...r, prefix: '/api/admin/subjects' })),
    ...classRoutes.map(r => ({ ...r, prefix: '/api/admin/classes' })),
];

function compileRoute(prefix, path) {
    const full = prefix + (path === '/' ? '' : path);
    const keys = [];
    const pattern = full.replace(/:([^/]+)/g, (_, key) => {
        keys.push(key);
        return '([^/]+)';
    });
    return { regex: new RegExp(`^${pattern}$`), keys };
}

const compiled = allRoutes.map(r => ({
    ...r,
    ...compileRoute(r.prefix, r.path),
}));

const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    console.log(`[${new Date().toISOString()}]  ${method}  ${pathname}`);

    if (method === 'GET' && pathname === '/') {
        return send(res, 200, {
            success: true,
            message: '🏫  School Management System API is running',
            version: '1.0.0',
            endpoints: {
                students: '/api/admin/students',
                teachers: '/api/admin/teachers',
                subjects: '/api/admin/subjects',
                classes: '/api/admin/classes',
            },
        });
    }

    for (const route of compiled) {
        if (route.method !== method) continue;
        const match = pathname.match(route.regex);
        if (!match) continue;

        const params = {};
        route.keys.forEach((key, i) => { params[key] = match[i + 1]; });

        const query = {};
        parsedUrl.searchParams.forEach((v, k) => { query[k] = v; });

        const body = ['POST', 'PUT', 'PATCH'].includes(method)
            ? await parseBody(req)
            : {};

        req.params = params;
        req.query = query;
        req.body = body;

        res.status = (code) => { res._statusCode = code; return res; };
        res.json = (data) => send(res, res._statusCode || 200, data);
        res._statusCode = 200;

        try {
            await route.handler(req, res);
        } catch (err) {
            console.error('Unhandled error:', err);
            send(res, 500, { success: false, message: 'Internal server error' });
        }
        return;
    }

    send(res, 404, { success: false, message: 'Route not found' });
});

require('./config/db');

server.listen(PORT, () => {
    console.log(`\n🚀  Server running on http://localhost:${PORT}`);
    console.log(`📚  School Management System Backend`);
    console.log(`\n   Routes:`);
    console.log(`   GET  /                               → Health check`);
    console.log(`   *    /api/admin/students             → Student management`);
    console.log(`   *    /api/admin/teachers             → Teacher management`);
    console.log(`   *    /api/admin/subjects             → Subject management`);
    console.log(`   *    /api/admin/classes              → Class & section info\n`);
});
