param(
    [Parameter(Mandatory = $true)]
    [string]$XmlPath
)

$ErrorActionPreference = "Stop"

[xml]$xml = Get-Content -Raw $XmlPath
$nodes = $xml.SelectNodes("//node")
$count = 0

foreach ($n in $nodes) {
    $txt = [string]$n.GetAttribute("text")
    $desc = [string]$n.GetAttribute("content-desc")
    if ([string]::IsNullOrWhiteSpace($txt) -and [string]::IsNullOrWhiteSpace($desc)) {
        continue
    }

    $rid = [string]$n.GetAttribute("resource-id")
    $bounds = [string]$n.GetAttribute("bounds")
    $class = [string]$n.GetAttribute("class")
    Write-Output ("TXT=[{0}] DESC=[{1}] RID=[{2}] BOUNDS=[{3}] CLASS=[{4}]" -f $txt, $desc, $rid, $bounds, $class)
    $count += 1
}

Write-Output ("TOTAL={0}" -f $count)
