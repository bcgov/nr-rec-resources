FROM flyway/flyway:11-alpine

# Copy migrations
COPY ./sql /flyway/sql

# Set correct permissions for non-root user
RUN adduser -D app && chown -R app:app /flyway/sql

# Switch to non-root user
USER app

# Health check
HEALTHCHECK CMD flyway info || exit 1

# Adding repair to see if it fixes migration issues.
CMD ["info", "migrate", "repair"]
