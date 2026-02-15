/*
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 *
 * The Apereo Foundation licenses this file to you under the Educational
 * Community License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License
 * at:
 *
 *   http://opensource.org/licenses/ecl2.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 */

package org.opencastproject.quiz.plugin.rest;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsResource;

import java.io.InputStream;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

/**
 * REST endpoint to serve the Quiz Plugin frontend module.
 *
 * This allows the frontend plugin to be bundled with the backend JAR
 * and served from the same deployment.
 */
@Path("/static/plugins/quiz")
@Component(
    immediate = true,
    service = QuizPluginResource.class,
    property = {
        "service.description=Quiz Plugin Frontend Resource",
        "opencast.service.type=org.opencastproject.quiz.plugin.rest.QuizPluginResource",
        "opencast.service.path=/static/plugins/quiz"
    }
)
@JaxrsResource
public class QuizPluginResource {

  @GET
  @Path("quiz.mjs")
  @Produces("application/javascript")
  public Response getPluginModule() {
    try {
      InputStream is = getClass().getClassLoader()
          .getResourceAsStream("static/plugins/quiz/quiz.mjs");

      if (is == null) {
        return Response.status(Response.Status.NOT_FOUND)
            .entity("Quiz plugin frontend module not found in JAR")
            .build();
      }

      // Read the entire file
      byte[] bytes = is.readAllBytes();
      is.close();

      return Response.ok(bytes)
          .type("application/javascript")
          .header("Content-Disposition", "inline; filename=\"quiz.mjs\"")
          .header("Cache-Control", "public, max-age=3600")
          .build();

    } catch (Exception e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity("Error serving plugin module: " + e.getMessage())
          .build();
    }
  }

}
