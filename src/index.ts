interface Env {
    ASSETS: {
        fetch: (request: Request) => Promise<Response>;
    };
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        // Asset fetching
        return env.ASSETS.fetch(request);
    },
};
