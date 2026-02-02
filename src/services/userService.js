import fs from 'fs';
import path from 'path';

const USERS_PATH = path.join(process.cwd(), "src", "data", "users.json");

export function getUsers() {
    const raw = fs.readFileSync(USERS_PATH, "utf-8");
    return JSON.parse(raw);
}

export function findUserByNameAndPin(name, pin) {
    const users = getUsers();

    return users.find(
        u => u.name === name && u.pin === pin
    );
}