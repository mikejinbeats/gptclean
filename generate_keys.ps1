# ==============================================================================
# ChatGPT Clean & Power - Gerador de Chaves de Licença PRO
# Gera chaves no formato PRO-XXXX-YYYY 100% válidas no algoritmo da extensão.
# ==============================================================================

param (
    [int]$Quantidade = 20
)

$chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" # Sem caracteres confusos (0, O, 1, I)
$validKeys = @()

function Test-KeyChecksum($part1, $part2) {
    $sum1 = 0
    for ($i = 0; $i -lt $part1.Length; $i++) { $sum1 += [int][char]$part1[$i] }
    $sum2 = 0
    for ($i = 0; $i -lt $part2.Length; $i++) { $sum2 += [int][char]$part2[$i] }

    return (($sum1 + $sum2) % 7 -eq 0 -or $sum1 % 3 -eq 0)
}

function Generate-RandomPart() {
    $res = ""
    for ($i = 0; $i -lt 4; $i++) {
        $idx = Get-Random -Minimum 0 -Maximum $chars.Length
        $res += $chars[$idx]
    }
    return $res
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  A gerar $Quantidade Chaves de Licenca PRO..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

while ($validKeys.Count -lt $Quantidade) {
    $p1 = Generate-RandomPart
    $p2 = Generate-RandomPart

    if (Test-KeyChecksum $p1 $p2) {
        $fullKey = "PRO-$p1-$p2"
        if (-not ($validKeys -contains $fullKey)) {
            $validKeys += $fullKey
        }
    }
}

# Guardar num ficheiro de texto
$outputFile = "chaves_licenca_geradas.txt"
$validKeys | Out-File -FilePath $outputFile -Encoding utf8

Write-Host "Sucesso! $Quantidade chaves geradas em: $outputFile" -ForegroundColor Green
Write-Host ""
Write-Host "Exemplo das chaves geradas:" -ForegroundColor White
$validKeys | Select-Object -First 5 | ForEach-Object { Write-Host "  🔑 $_" -ForegroundColor Yellow }
Write-Host "==========================================" -ForegroundColor Cyan
