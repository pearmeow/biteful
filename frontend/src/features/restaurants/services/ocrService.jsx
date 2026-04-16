export const ocrService = {
    getAll: async () => {
        // submits a picture to the backend
        return await fetch("http://localhost:5555/ocr/", {});
    },
};
