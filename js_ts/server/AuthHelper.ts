import { User } from '@blobs/blobs';
import AppDataSource from '../../lib/AppDataSource.js';

// returns the session user data, if load=true, it will load the full User object
export const loadUser = async (req) => {
    if (req.user instanceof User) {
        console.log(`User is already loaded.`, req.user);
    } else {
        if (!req.user) return null;
        const userRepository = AppDataSource.getRepository(User);
        let user;
        if (req.user.id) user = await userRepository.findOneBy({ id: req.user.id });
        if (!user && req.user.email) user = await userRepository.findOneBy({ email: req.user.email });
        if (!user) return null;
        req.user = user;
    }
    return req.user;
};

// returns the session user data, if load=true, it will load the full User object
export const getCurrentUser = async (req, load = false) => {
    // if user object is already loaded
    if (load) return await loadUser(req);
    return req.user;
};