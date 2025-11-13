$migrationFiles = Get-ChildItem -Path ".\database -GRC\migrations\*.sql" | Sort-Object Name
$outputFile = ".\database -GRC\COMPLETE_UNIFIED_MIGRATION_SINGLE_FILE.sql"

# Clear the output file if it exists
if (Test-Path $outputFile) {
    Clear-Content $outputFile
}

# Add a header to the unified script
Add-Content -Path $outputFile -Value "-- ======================================================================"
Add-Content -Path $outputFile -Value "-- UNIFIED GRC DATABASE MIGRATION SCRIPT"
Add-Content -Path $outputFile -Value "-- Merged from all files in the /migrations directory"
Add-Content -Path $outputFile -Value "-- Generated on: $(Get-Date)"
Add-Content -Path $outputFile -Value "-- ======================================================================"

# Loop through each migration file and append its content
foreach ($file in $migrationFiles) {
    Add-Content -Path $outputFile -Value "`n-- ======================================================================"
    Add-Content -Path $outputFile -Value "-- START: $($file.Name)"
    Add-Content -Path $outputFile -Value "-- ======================================================================"
    $content = Get-Content -Path $file.FullName -Raw
    Add-Content -Path $outputFile -Value $content
    Add-Content -Path $outputFile -Value "`n-- END: $($file.Name)"
    Add-Content -Path $outputFile -Value "-- ======================================================================"
}

Write-Host "Successfully merged $($migrationFiles.Count) migration files into $outputFile"
