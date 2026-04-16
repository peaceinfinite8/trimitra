$ErrorActionPreference='Stop'
$root = Get-Location
$extensions = @('.js','.jsx','.ts','.tsx','.css','.json')

function Resolve-ImportTarget([string]$baseFile,[string]$spec) {
  if (-not ($spec.StartsWith('./') -or $spec.StartsWith('../'))) { return $null }
  $baseDir = Split-Path -Parent $baseFile
  $candidate = [System.IO.Path]::GetFullPath((Join-Path $baseDir $spec))
  if (Test-Path $candidate -PathType Leaf) { return $candidate }
  foreach ($ext in $extensions) {
    $f = "$candidate$ext"
    if (Test-Path $f -PathType Leaf) { return $f }
  }
  foreach ($ext in $extensions) {
    $idx = Join-Path $candidate ("index" + $ext)
    if (Test-Path $idx -PathType Leaf) { return $idx }
  }
  return $null
}

function Get-Imports([string]$file) {
  $content = Get-Content -Raw -LiteralPath $file
  $patterns = @(
    "import\s+[^;]*?from\s*['`"]([^'`"]+)['`"]",
    "export\s+[^;]*?from\s*['`"]([^'`"]+)['`"]",
    "import\(\s*['`"]([^'`"]+)['`"]\s*\)"
  )
  $out = @()
  foreach ($p in $patterns) {
    foreach ($m in [regex]::Matches($content,$p,[System.Text.RegularExpressions.RegexOptions]::Singleline)) {
      $out += $m.Groups[1].Value
    }
  }
  return $out
}

$viteFiles = Get-ChildItem -Recurse -File src | Where-Object { $_.Extension -in @('.js','.jsx','.ts','.tsx','.css') } | Select-Object -ExpandProperty FullName
$nextFiles = Get-ChildItem -Recurse -File news-next\app,news-next\components,news-next\lib | Where-Object { $_.Extension -in @('.js','.jsx','.ts','.tsx','.css') } | Select-Object -ExpandProperty FullName
$allFiles = @($viteFiles + $nextFiles)

$edges = @{}
foreach ($f in $allFiles) {
  $targets = @()
  foreach ($spec in (Get-Imports $f)) {
    $resolved = Resolve-ImportTarget $f $spec
    if ($resolved) { $targets += $resolved }
  }
  $edges[$f] = $targets
}

$roots = @()
$roots += [System.IO.Path]::GetFullPath((Join-Path $root 'src/main.jsx'))
$roots += (Get-ChildItem -Recurse -File news-next\app | Where-Object { $_.Extension -in @('.js','.jsx','.ts','.tsx','.css') } | Select-Object -ExpandProperty FullName)

$visited = New-Object 'System.Collections.Generic.HashSet[string]'
$queue = New-Object 'System.Collections.Generic.Queue[string]'
foreach ($r in $roots) { if (Test-Path $r) { [void]$visited.Add($r); $queue.Enqueue($r) } }
while ($queue.Count -gt 0) {
  $cur = $queue.Dequeue()
  if ($edges.ContainsKey($cur)) {
    foreach ($n in $edges[$cur]) {
      if (-not $visited.Contains($n)) { [void]$visited.Add($n); $queue.Enqueue($n) }
    }
  }
}

$unusedCode = $allFiles | Where-Object { -not $visited.Contains($_) } | Sort-Object

$assetFiles = Get-ChildItem -Recurse -File src\assets
$scanTargets = Get-ChildItem -Recurse -File src | Select-Object -ExpandProperty FullName
$unusedAssets = @()
foreach ($af in $assetFiles) {
  $name = $af.Name
  $matches = Select-String -Path $scanTargets -Pattern $name -SimpleMatch
  if (-not $matches) { $unusedAssets += $af.FullName }
}

Write-Output 'UNUSED_CODE_FILES:'
$unusedCode | ForEach-Object { Write-Output $_ }
Write-Output ''
Write-Output 'UNUSED_ASSET_FILES:'
$unusedAssets | ForEach-Object { Write-Output $_ }
