
export type User = {
    id: number;
    username: string;
}

let users: User[] = [{id:1, username: 'admin'}, {id:2, username: 'user1'}];

export const getAllUsers = () => [...users];

export const addUser = (user: User) => {
    if (users.findIndex((item) => item.id === user.id) !== -1) {
        return false;
    }
    users.push(user);
    return true;
}

export const getUserById = (id: number) => {
    const index = users.findIndex(item => item.id === id);
    if(index !== -1) {
        return users[index];
    }
}

export const deleteUser = (user: User) => {
    const index = users.findIndex(item => item.id === user.id);
    if(index !== -1) {
        let temp = users[index];
        users.splice(index);
        return temp;
    }
}

export const updateUser = (user: User) => {
    const userUpdated = users.find(item => item.id === user.id);
    if(userUpdated) {
        let temp = {...userUpdated};
        userUpdated.username = user.username;
        return temp;
    }
}