param(
    [string[]]$Exclude = @('node_modules','dist','build','.git','.next','coverage','logs','.cache'),
    [switch]$NoTruncate,
    [switch]$NoHash,
    [switch]$IncludeExcluded
)

$root = (Get-Location).Path
$ts = Get-Date -Format 'yyyyMMdd_HHmm'
$outDir = Join-Path $root ("_inventory_" + $ts)
$contentsDir = Join-Path $outDir 'contents'
New-Item -ItemType Directory -Path $outDir -Force | Out-Null
New-Item -ItemType Directory -Path $contentsDir -Force | Out-Null

$textExt = @('.js','.ts','.tsx','.jsx','.json','.md','.txt','.py','.go','.rs','.java','.cs','.yaml','.yml','.env','.html','.css','.scss','.less','.sql','.sh','.ps1','.psm1','.c','.cpp','.h','.hpp','.rb','.php','.ini','.toml','.cfg')
$maxBytes = if ($NoTruncate) { [int64]::MaxValue } else { 2MB }

$files = Get-ChildItem -Path $root -File -Recurse -Force
if (-not $IncludeExcluded) {
    $files = $files | Where-Object { $p = $_.FullName.ToLower(); -not ($Exclude | ForEach-Object { $p -like (Join-Path $root $_).ToLower() + '*' }) }
}

$rows = @()
$jsonlPath = Join-Path $outDir 'inventory.jsonl'
Remove-Item -Path $jsonlPath -ErrorAction SilentlyContinue

foreach ($f in $files) {
    $rel = $f.FullName.Substring($root.Length).TrimStart('\')
    $ext = ($f.Extension ?? '').ToLower()
    $isText = $textExt -contains $ext
    $hash = $null
    if (-not $NoHash) { try { $hash = (Get-FileHash -Algorithm SHA256 -Path $f.FullName).Hash } catch { $hash = $null } }

    $lineCount = $null
    $wordCount = $null
    $contentOutPath = $null
    if ($isText) {
        try {
            $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
            $useBytes = if ($bytes.Length -gt $maxBytes) { $bytes[0..($maxBytes-1)] } else { $bytes }
            $text = [System.Text.Encoding]::UTF8.GetString($useBytes)
            $lineCount = ($text -split "`r?`n").Length
            $wordCount = (($text -split '\s+') | Where-Object { $_.Length -gt 0 }).Length
            $dest = Join-Path $contentsDir ($rel + '.txt')
            $destDir = Split-Path -Parent $dest
            if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
            [System.IO.File]::WriteAllText($dest, $text)
            $contentOutPath = $dest
        } catch {
            $isText = $false
        }
    }

    $obj = [pscustomobject]@{
        path = $rel
        full_path = $f.FullName
        size = $f.Length
        last_write = $f.LastWriteTimeUtc
        ext = $ext
        sha256 = $hash
        is_text = $isText
        line_count = $lineCount
        word_count = $wordCount
        content_dump = $contentOutPath
    }
    $rows += $obj
    ($obj | ConvertTo-Json -Depth 6) | Add-Content -Path $jsonlPath -Encoding UTF8
}

$csvPath = Join-Path $outDir 'manifest.csv'
$jsonPath = Join-Path $outDir 'manifest.json'
$indexPath = Join-Path $outDir 'index.md'
$rows | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
($rows | ConvertTo-Json -Depth 6) | Set-Content -Path $jsonPath -Encoding UTF8

$total = $rows.Count
$textCount = ($rows | Where-Object { $_.is_text }).Count
$totalBytes = ($rows | Measure-Object -Property size -Sum).Sum
@(
    "Inventory: $ts",
    "Total files: $total",
    "Text files: $textCount",
    "Total size (bytes): $totalBytes",
    "Outputs:",
    "- manifest.csv",
    "- manifest.json",
    "- inventory.jsonl",
    "- contents/",
    "Root: $root"
) | Set-Content -Path $indexPath -Encoding UTF8
