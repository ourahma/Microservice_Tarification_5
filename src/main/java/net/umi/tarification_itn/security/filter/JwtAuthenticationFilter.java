package net.umi.tarification_itn.security.filter;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.ServletException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.FilterChain;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(jwtSecret.getBytes())
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                String username = extractUsername(claims);
                List<SimpleGrantedAuthority> authorities = extractAuthorities(claims);

                log.info("JWT Authentication: username = {}, authorities = {}",
                        username, authorities);

                if (username != null) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(username, null, authorities);

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }

            } catch (Exception e) {
                log.error("JWT validation error: {}", e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractUsername(Claims claims) {
        if (claims.get("email") != null) {
            return claims.get("email").toString();
        }
        if (claims.get("sub") != null) {
            return claims.get("sub").toString();
        }
        if (claims.get("username") != null) {
            return claims.get("username").toString();
        }
        return null;
    }

    private List<SimpleGrantedAuthority> extractAuthorities(Claims claims) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        // Extraire les rôles de différentes manières
        extractRolesFromClaim(claims, "roles").forEach(role ->
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role)));

        extractRolesFromClaim(claims, "role").forEach(role ->
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role)));

        extractRolesFromClaim(claims, "user_type").forEach(role ->
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role)));

        // Si pas de rôles trouvés, ajouter ROLE_USER par défaut
        if (authorities.isEmpty()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }

        return authorities;
    }

    private List<String> extractRolesFromClaim(Claims claims, String claimName) {
        List<String> roles = new ArrayList<>();

        try {
            Object rolesObj = claims.get(claimName);
            if (rolesObj instanceof List) {
                ((List<?>) rolesObj).forEach(role ->
                        roles.add(role.toString().toUpperCase()));
            } else if (rolesObj != null) {
                roles.add(rolesObj.toString().toUpperCase());
            }
        } catch (Exception e) {
            log.debug("Could not extract roles from claim: {}", claimName);
        }

        return roles;
    }
}
