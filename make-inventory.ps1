param(
    [string]$RootPath = (Get-Location),
    [string]$OutputPath = "project-inventory.csv",
    [string]$SummaryOutputPath = "project-inventory-by-extension.csv",
    [int]$MaxPreviewChars = 200
)

# مجلدات هنستبعدها من الفحص عشان ما يطوّلش قوي
$excludedDirectories = @(
    "node_modules",
    ".git",
    ".turbo",
    ".next",
    "dist",
    "build",
    ".vercel",
    ".idea",
    ".vscode",
    "coverage",
    "logs"
)

Write-Host "Scanning root path: $RootPath" -ForegroundColor Cyan

# نحصل على كل الملفات مع استبعاد مجلدات معينة
$allFiles = Get-ChildItem -Path $RootPath -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $fullPath = $_.FullName
    $include = $true

    foreach ($dir in $excludedDirectories) {
        if ($fullPath -like "*\$dir\*") {
            $include = $false
            break
        }
    }

    $include
}

Write-Host "Total files found (after exclusions): $($allFiles.Count)" -ForegroundColor Yellow

$rows = @()

foreach ($file in $allFiles) {
    try {
        # Path نسبي من RootPath
        $relativePath = $file.FullName.Substring($RootPath.TrimEnd('\','/').Length).TrimStart('\','/')

        $extension = $file.Extension
        $sizeKB = [math]::Round($file.Length / 1KB, 2)
        $lastWrite = $file.LastWriteTime
        $created = $file.CreationTime

        $contentPreview = ""

        # نحاول نقرأ محتوى بسيط لو الملف مش كبير جدا
        if ($file.Length -lt 5MB) {
            try {
                $text = Get-Content -LiteralPath $file.FullName -Raw -ErrorAction Stop

                if ($text.Length -gt $MaxPreviewChars) {
                    $contentPreview = $text.Substring(0, $MaxPreviewChars)
                }
                else {
                    $contentPreview = $text
                }

                # نشيل الـ newlines عشان CSV
                $contentPreview = $contentPreview -replace "`r", " " -replace "`n", " "
            }
            catch {
                $contentPreview = ""
            }
        }

        $rows += [PSCustomObject]@{
            RelativePath   = $relativePath
            Name           = $file.Name
            Extension      = $extension
            SizeKB         = $sizeKB
            LastWriteTime  = $lastWrite
            CreationTime   = $created
            ContentPreview = $contentPreview
        }
    }
    catch {
        Write-Warning "Failed to process file: $($file.FullName). Error: $($_.Exception.Message)"
    }
}

# نكتب الملف التفصيلي
$rows | Export-Csv -Path $OutputPath -NoTypeInformation -Encoding UTF8
Write-Host "Detailed inventory written to: $OutputPath" -ForegroundColor Green

# نعمل Summary بحسب الامتداد
$summaryRows = @()

$grouped = $rows | Group-Object Extension | Sort-Object Count -Descending

foreach ($group in $grouped) {
    $extName = if ([string]::IsNullOrWhiteSpace($group.Name)) { "<no extension>" } else { $group.Name }

    $totalSize = ($group.Group | Measure-Object -Property SizeKB -Sum).Sum

    $summaryRows += [PSCustomObject]@{
        Extension    = $extName
        FileCount    = $group.Count
        TotalSizeKB  = [math]::Round($totalSize, 2)
    }
}

$summaryRows | Export-Csv -Path $SummaryOutputPath -NoTypeInformation -Encoding UTF8
Write-Host "Summary inventory written to: $SummaryOutputPath" -ForegroundColor Green

Write-Host "Done. Files scanned: $($rows.Count)" -ForegroundColor Cyan
