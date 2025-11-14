#!/bin/bash
# Quick Production Setup Script

echo "Setting up production environment..."

# Export environment variables
export JWT_SECRET="pMRbdmYvFMaCycg0LGNFzKznWyqogVxBxDVLi5Av+joj2nMxH176ACSbDMeXmpBFBfDHX2f696WwNMyDEDSuHw=="
export DB_PASSWORD="LFHREDv98O3FFpkn6FVNVGu3oXd5USnJ"
export ENCRYPTION_KEY="j8WFhx354FFM7LX/eg2JJGoUsQTMr7oJKvO5PFDVPso="
export SERVICE_TOKEN="dKv+rsIhGWsfxuv4xb3ga2Ex4s7Fhyip"
export REDIS_PASSWORD="38x70mHPN1iymSGEemjy0y5KoprtjFAO"

echo "Production secrets loaded"
echo "Next: docker-compose -f docker-compose.production.yml --env-file .env.production up -d"
