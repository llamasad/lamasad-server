import express from 'express';
import { Router } from 'express';
import { ProjectUser, Project } from '../../models/index.js';

const router = Router();

router.get('/project', async function (req, res) {
    try {
        const projectUsers = await ProjectUser.findAll({ where: { user_id: req.query.user_id } });
        const projectIds = projectUsers.map((pu) => pu.project_id);
        if (projectIds.length) {
            const projects = await Project.findAll({ where: { id: projectIds } });
            res.json({ data: projects });
        } else {
            res.json({ data: [] });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Function to decode JWT token (You need to implement this function)

export default router;
