var userTagCount = { count: '' };
async function init(UserTagCount, User) {
    try {
        let userTag = await UserTagCount.findOne({ where: { uniqueKey: 'unique' } });
        if (userTag) {
            userTagCount.count = parseInt(userTag.dataValues.count);
            console.log('init userTagCount successfully', userTagCount.count);
        } else {
            console.log('No userTag found with uniqueKey "unique"');
            const lastUser = await User.findOne({
                order: [['createdAt', 'DESC']],
            });
            if (lastUser) {
                userTagCount.count = parseInt(lastUser.dataValues.userTag.replace('#', '')) + 1;
                console.log('init userTagCount successfully', userTagCount.count);
                await UserTagCount.create({ uniqueKey: 'unique', count: numberToUserTagCount(userTagCount.count) });
            } else {
                console.log('No user found to get the last userTag');
                await UserTagCount.create({ uniqueKey: 'unique', count: '000000' });
            }
        }
    } catch (error) {
        console.error('Error fetching the last user:', error);
    }
}
var numberToUserTagCount = (number) => {
    return number.toString().padStart(6, '0');
};
async function increaseUserTagCount(UserTagCount) {
    ++userTagCount.count;
    try {
        // Find the row
        const [updated] = await UserTagCount.update(
            { count: numberToUserTagCount(userTagCount.count) },
            { where: { uniqueKey: 'unique' } },
        );

        if (updated) {
            // Update the count if the row exists

            console.log('Count updated successfully');
        } else {
            // Handle the case where the row does not exist
            console.error('No existing row found to update');
        }
    } catch (err) {
        console.error('Error updating count:', err);
    }
}
module.exports = { userTagCount, init, increaseUserTagCount, numberToUserTagCount };
