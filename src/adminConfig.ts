// Add your admin UIDs from Firebase console
export const adminUids = [
    "zhmIGdsr5nU5czTyskXSUD4O1Sl1",
    "bGd7uyqqoXenTkK0Ab4jZuDwiIh1"
];

export const isAdmin = (uid: string) => adminUids.includes(uid);