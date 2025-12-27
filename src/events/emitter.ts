import EventEmitter from "events";
import type {User} from "../model/users.js";

export const emitter = new EventEmitter();

emitter.on("userCreated", () => {
    console.log("User created");
});

emitter.on("userDeleted", (deletedUser: User) => {
    console.log(`User ID ${deletedUser.id} name "${deletedUser.username}" deleted`);
})

emitter.on("userUpdated", () => {
    console.log("User updated");
})

