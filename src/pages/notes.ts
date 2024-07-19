// import type { APIRoute } from "astro";

// export const GET: APIRoute = ({ redirect }) => {
// 	return redirect("https://khosla.risk-regulus.ts.net", 301);
// }

import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
    return {
        status: 301,
        headers: {
            Location: "https://khosla.risk-regulus.ts.net",
        },
        body: null
    };
};
