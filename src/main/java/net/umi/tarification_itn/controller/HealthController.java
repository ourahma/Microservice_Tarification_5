package net.umi.tarification_itn.controller;


import org.springframework.beans.factory.annotation.Value;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import java.io.IOException;



@Controller
public class HealthController {

    @Value("${server.servlet.context-path:/}")
    private String contextPath;

    @GetMapping("/")
    public void redirectToSwagger(HttpServletResponse response) throws IOException {
        response.sendRedirect("/api-docs");
    }

    @GetMapping("/swagger")
    public void redirectToSwaggerAlternative(HttpServletResponse response) throws IOException {
        response.sendRedirect("/swagger-ui/index.html");
    }

    @GetMapping("/docs")
    public void redirectToApiDocs(HttpServletResponse response) throws IOException {
        response.sendRedirect("/api-docs");
    }


}
