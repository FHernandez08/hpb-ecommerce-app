// validateBody
// sanitize request body/query; rejects unknown fields

import { z, ZodError } from 'zod';

function validateData(schema) {
    return (req, res, next) => {
        try {
            const parsedData = schema.parse(req.body);
            req.body = parsedData;
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ message: 'Invalid Data' });
            }
            else {
                res.status(500).json({ message: 'Internal Server Error!' });
            }
        }
    }
}
