az containerapp revision copy ^
  --name "shahin-ai-platform" ^
  --resource-group "rg-grc-assessment-prod" ^
  --revision-suffix "shahin-v1" ^
  --image "mcr.microsoft.com/azuredocs/aci-helloworld:latest" ^
  --cpu 0.5 ^
  --memory 1.0Gi

echo Container App revision updated. Testing deployment...