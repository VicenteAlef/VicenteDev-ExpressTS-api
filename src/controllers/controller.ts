import type { Request, Response } from "express";

const Controller = {
    hello: async (req: Request, res: Response) => {
		res.status(200).json({
			status: "200 - OK",
			message: "Server running successfully!"
		})
	}
}

export { Controller };
