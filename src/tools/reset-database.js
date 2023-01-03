/* istanbul ignore file */
import seed from '../../scripts/seedDb';
import { sequelize } from '../model';

const resetDatabase = async () => {
    try {
        await sequelize.drop({ force: true });
        await seed();
    } catch (err) {
        console.error(err);
    }
};

export default resetDatabase;
