import express from 'express';
import { MacroTaskUser, MicroTaskUser, MicroTask, MacroTask } from '../../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

router.get('/tasks', async function (req, res) {
    try {
        const { filter, status, sort, page = 1, search } = req.query;
        const userId = req.user._id;

        // Fetch MacroTasks and MicroTasks for the given user_id
        const userMacroTasks = await MacroTaskUser.findAll({ where: { user_id: userId } });
        const userMicroTasks = await MicroTaskUser.findAll({ where: { user_id: userId } });
        if (!userMacroTasks.length && !userMicroTasks.length) {
            return res.json({ data: [], status: { macro: {}, micro: {} } });
        }
        const macroTaskIds = userMacroTasks.map((task) => task.macroTask_id);
        const microTaskIds = userMicroTasks.map((task) => task.microTask_id);

        // Build the base query filters
        const macroTaskFilters = { _id: { [Op.in]: macroTaskIds } };
        const microTaskFilters = { _id: { [Op.in]: microTaskIds } };

        // Add search filter if provided
        if (search) {
            macroTaskFilters.title = { [Op.like]: `%${search}%` };
            microTaskFilters.title = { [Op.like]: `%${search}%` };
        }

        // Add status filter if provided
        if (status && status !== 'all') {
            macroTaskFilters.status = status;
            microTaskFilters.status = status;
        }

        // Fetch tasks based on filters
        const macroTasksPromise =
            (filter && filter.includes('macro')) || !filter
                ? MacroTask.findAll({ where: macroTaskFilters })
                : Promise.resolve([]);
        const microTasksPromise =
            (filter && filter.includes('micro')) || !filter
                ? MicroTask.findAll({ where: microTaskFilters })
                : Promise.resolve([]);

        const [macroTasks, microTasks] = await Promise.all([macroTasksPromise, microTasksPromise]);

        // Combine MacroTasks and MicroTasks into a single array
        let tasks = [
            ...macroTasks.map((task) => ({ ...task.toJSON(), type: 'macro' })),
            ...microTasks.map((task) => ({ ...task.toJSON(), type: 'micro' })),
        ];

        // Count the status for macro and micro tasks
        const statusCount = {};
        [...macroTasks, ...microTasks].forEach((task) => {
            statusCount[task.status] = (statusCount[task.status] || 0) + 1;
        });

        // Sort the tasks array based on the 'sort' parameter
        if (sort === 'a-z') {
            tasks.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sort === 'z-a') {
            tasks.sort((a, b) => b.title.localeCompare(a.title));
        } else if (sort === 'latest') {
            tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sort === 'oldest') {
            tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }

        // Implement pagination
        pageCount = Math.ceil((tasks.length + 1) / 20);

        const pageSize = 20; // Number of tasks per page
        const startIndex = (page - 1) * (pageSize - 1);
        const endIndex = startIndex + pageSize - 1;
        const paginatedTasks = tasks.slice(startIndex, endIndex);

        // Send the paginated and sorted tasks in the response
        res.json({ data: paginatedTasks, pageCount, status: statusCount });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
