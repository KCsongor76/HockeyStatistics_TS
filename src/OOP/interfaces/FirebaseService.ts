export interface FirebaseService<T> {
    create(item: T): Promise<void>;

    read(id: number): Promise<T | undefined>;

    update(id: number, item: T): Promise<void>;

    delete(id: number): Promise<void>;

    list(): Promise<T[]>;
}