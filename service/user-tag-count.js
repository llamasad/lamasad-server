import prisma from '../lib/prisma.js';
const userTagCount2 = prisma.userTagCount;
var userTagCount = { count: 0 };

async function init() {
    try {
        let userTag = await userTagCount2.findUnique({ where: { uniqueKey: 'unique' } });
        if (userTag) {
            userTagCount.count = parseInt(userTag.count);
        } else {
            const lastUser = await prisma.user.findFirst({
                orderBy: { createdAt: 'desc' },
            });
            if (lastUser) {
                userTagCount.count = parseInt(lastUser.userTag.replace('#', '')) + 1;
                await userTagCount2.create({
                    data: { uniqueKey: 'unique', count: numberToUserTagCount(userTagCount.count) },
                });
            } else {
                await userTagCount2.create({ data: { uniqueKey: 'unique', count: '000000' } });
            }
        }
    } catch (error) {
        console.error('Error fetching the last user:', error);
    }
}

var numberToUserTagCount = (number) => {
    return number.toString().padStart(6, '0');
};

async function increaseUserTagCount() {
    try {
        const updated = await userTagCount2.updateMany({
            where: { uniqueKey: 'unique' },
            data: { count: numberToUserTagCount(userTagCount.count) },
        });
        if (updated.count) {
        } else {
            console.error('No existing row found to update');
        }
    } catch (err) {
        console.error('Error updating count:', err);
    }
}

export { userTagCount, init, increaseUserTagCount, numberToUserTagCount };
