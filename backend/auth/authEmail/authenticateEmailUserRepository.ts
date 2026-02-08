// Login Check
export const checkEmailVerified = async (email: string): Promise<boolean> => {
    try {
        // --- Abfrage DB ----
        console.log("Success: Checking Verified-Status");
        return true;
    } catch (error) {
        console.error("Error: Verified-Status:", error);
        return false;
    }
}

export const markEmailAsVerified = async (email: string): Promise<boolean> => {
    try {
        // -- Abfrage DB --
        console.log("Success: Email is saved as verified");
        return true;
    } catch (error) {
        console.error("Error: Error while saving:", error);
        return false;
    }
};