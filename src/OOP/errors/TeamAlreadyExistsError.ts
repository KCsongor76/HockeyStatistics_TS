export class TeamAlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "TeamAlreadyExistsError";
    }
}