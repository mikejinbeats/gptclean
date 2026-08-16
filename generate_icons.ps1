Add-Type -AssemblyName System.Drawing

$outputDir = "c:\Users\Nigglet\Desktop\ANTI-CHATGPT ADS\icons"
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

$sizes = @(16, 48, 128, 512)

foreach ($size in $sizes) {
    $bmp = [System.Drawing.Bitmap]::new($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Fundo Slate Dark
    $bgBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
    $g.FillRectangle($bgBrush, 0, 0, $size, $size)
    $bgBrush.Dispose()

    # Círculo com gradiente Indigo
    $margin = [int]($size * 0.08)
    $innerSize = $size - ($margin * 2)
    $circleBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 99, 102, 241))
    $g.FillEllipse($circleBrush, $margin, $margin, $innerSize, $innerSize)
    $circleBrush.Dispose()

    # Borda Verde Esmeralda (Proteção)
    $penWidth = [single][Math]::Max(1.0, ($size * 0.06))
    $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 16, 185, 129), $penWidth)
    $g.DrawEllipse($pen, $margin, $margin, $innerSize, $innerSize)
    $pen.Dispose()

    # Desenho do Escudo / Raio em Polígono
    $boltBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    
    # Coordenadas relativas do Raio
    $scale = $size / 100.0
    $points = @(
        [System.Drawing.PointF]::new(52 * $scale, 20 * $scale),
        [System.Drawing.PointF]::new(35 * $scale, 52 * $scale),
        [System.Drawing.PointF]::new(48 * $scale, 52 * $scale),
        [System.Drawing.PointF]::new(44 * $scale, 80 * $scale),
        [System.Drawing.PointF]::new(65 * $scale, 44 * $scale),
        [System.Drawing.PointF]::new(52 * $scale, 44 * $scale)
    )
    $g.FillPolygon($boltBrush, $points)
    $boltBrush.Dispose()

    $filename = if ($size -eq 512) { "logo.png" } else { "icon$size.png" }
    $dest = Join-Path $outputDir $filename
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated $filename successfully ($size x $size)"
}
