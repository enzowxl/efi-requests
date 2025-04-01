import fastify from "fastify";
import { errorHandler } from "./error-handler";
import { efiService } from "./utils/efi";

export const app = fastify();

app.get("/efi/charge/pix", async (request, reply) => {
  const accessToken = await efiService.getAccessToken();

  if (!accessToken) throw new Error("EFI OAuth not found");

  const charge = await efiService.createPixCharge(accessToken.access_token);

  return reply.status(200).send({
    charge,
  });
});

app.setErrorHandler(errorHandler);
