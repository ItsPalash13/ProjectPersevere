import { Request, Response, NextFunction } from 'express';
import { getAuthInstance } from '../config/auth';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const auth = getAuthInstance();
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    (req as any).user = session.user;
    return next();
};

export default authMiddleware;


