import express from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initializeDatabase } from './infrastructure/database';
import { apiRouter } from './interfaces/api';
import { errorHandler } from './interfaces/errorHandler';

const app = express();
const port = 3000;

const swaggerDocument = YAML.load(path.join(__dirname, '../../openapi.yaml'));

app.use(helmet());

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
    message: { error: 'Zu viele Anfragen, bitte versuchen Sie es später erneut.' },
});
app.use('/api/', apiLimiter);

app.use(express.json({ limit: '10mb' }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', apiRouter);
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
app.use(errorHandler);

initializeDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Backend-Server läuft auf http://localhost:${port}`);
        console.log(`API-Dokumentation verfügbar unter http://localhost:3000/api-docs`);
    });
}).catch(err => {
    console.error("Server konnte nicht gestartet werden:", err);
    process.exit(1);
});