package ca.bc.gov.nrs.environment;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;

@Path("/")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class Application {

  @ConfigProperty(name = "api.key")
  String apiKey;
  @GET
  @Operation(summary = "Get Geometry Data", description = "Recreation Map Feature Geom")
  @APIResponse(responseCode = "200", description = "List Of Map Features")
  public Response getMapGeom() {
    return Response.ok(apiKey).build();
  }
}
