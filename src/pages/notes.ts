import type { APIRoute } from "astro";

export const GET: APIRoute = ({ redirect }) => {
	return redirect("https://khosla.risk-regulus.ts.net", 307);
}