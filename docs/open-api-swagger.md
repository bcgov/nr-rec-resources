# **OpenAPI/Swagger Documentation**

The backend uses NestJS's built-in Swagger module (@nestjs/swagger) to
automatically generate OpenAPI documentation from TypeScript decorators.

## **Swagger Decorators**

Decorators are used throughout the codebase to provide metadata for API
documentation:

- @ApiTags() - Groups related endpoints together
- @ApiOperation() - Describes what an endpoint does
- @ApiResponse() - Documents possible response types
- @ApiProperty() - Documents DTO properties and their types

Example usage in a controller:

```tsx
@ApiTags("parks")
@Controller("parks")
export class ParksController {
  @Get()
  @ApiOperation({ summary: "Get all parks" })
  @ApiResponse({
    status: 200,
    description: "List of parks returned",
    type: [ParkDto],
  })
  findAll(): Promise<ParkDto[]> {
    return this.parksService.findAll();
  }
}
```

### **Accessing Generated Documentation**

When running the backend server, Swagger UI is available at:

`http://localhost:3000/api/docs`

The raw OpenAPI specification can be accessed at:

`http://localhost:3000/api/docs-json`

This documentation is automatically generated from the TypeScript code and is
used to:

- Provide interactive API documentation through Swagger UI
- Generate TypeScript client types using openapi-generator
- Ensure API consistency and type safety across the frontend and backend
