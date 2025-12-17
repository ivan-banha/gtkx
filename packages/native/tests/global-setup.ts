import { cleanupGtk } from "./test-setup.js";

export default async function globalSetup() {
    return async () => {
        cleanupGtk();
    };
}
