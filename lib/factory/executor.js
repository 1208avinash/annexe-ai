export default class Executor {

    validateRequest(request) {

        if (!request || typeof request !== "object") {
            throw new Error("Factory request is required.");
        }

        if (!request.project) {
            throw new Error("Project is required.");
        }

    }

    success(data = {}) {

        return {
            success: true,
            status: "completed",
            ...data
        };

    }

    failure(data = {}) {

        return {
            success: false,
            status: "failed",
            ...data,
            error:
                data.error?.message ??
                String(data.error ?? "Factory execution failed")
        };

    }

}
