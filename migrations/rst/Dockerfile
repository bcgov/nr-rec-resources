FROM flyway/flyway:11-alpine@sha256:e5c941be8cda7f641cdd80f267bc45297fb6d04ea9275f60d408cd4ba4f52354

# Copy migrations
COPY ./sql /flyway/sql

# Copy entrypoint script
COPY entrypoint.sh /flyway/entrypoint.sh
RUN chmod +x /flyway/entrypoint.sh

# Set correct permissions for non-root user
RUN adduser -D app && chown -R app:app /flyway/sql

# Switch to non-root user
USER app

# Health check
HEALTHCHECK CMD flyway info || exit 1

# Set the custom entrypoint
ENTRYPOINT ["/flyway/entrypoint.sh"]

# Default command
CMD ["info", "migrate", "info"]
