import { SwaggerOptions } from "swagger-jsdoc";

const swaggerOptions: SwaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sportify API",
      version: "1.0.0",
      description: "API documentation for Sportify application",
    },
    servers: [
      {
        url: "http://localhost:3000", // Update with your server URL
      },
    ],
  },
  apis: ["./src/routes/**/*.ts"], // This is more flexible
};

export default swaggerOptions;
