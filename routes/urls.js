import express from 'express';
import { nanoid } from 'nanoid';
import Url from '../models/Url.js';
import {validateUrl} from "../utils/utils.js";
import dotenv from 'dotenv';
dotenv.config({ path: '../config/.env' });

const router = express.Router();

// Short URL Generator
router.post('/short', async (req, res) => {
    const { origUrl } = req.body;
    const base = process.env.BASE;

    const urlId = nanoid();
    if (validateUrl(origUrl)) {
        try {
            let url = await Url.findOne({ origUrl });
            if (url) {
                res.json(url);
            } else {
                const shortUrl = `${base}/${urlId}`;

                url = new Url({
                    origUrl,
                    shortUrl,
                    urlId,
                    date: new Date(),
                });

                await url.save();
                res.json(url);
            }
        } catch (err) {
            console.log(err);
            res.status(500).json('Server Error');
        }
    } else {
        res.status(400).json('Invalid Original Url');
    }
});

router.get('/clicks/:urlId', async (req, res) => {
    console.log("Received urlId: ", req.params.urlId);  // Debugging line
    try {
        const url = await Url.findOne({ urlId: req.params.urlId });
        console.log("Database response: ", url);  // Debugging line
        if (url) {
            res.json({ clicks: url.clicks });
        } else {
            res.status(404).json('URL not found');
        }
    } catch (err) {
        console.log(err);
        res.status(500).json('Server Error');
    }
});



export default router;
