# Generate raster PWA icons directly from the vector master, without extra dependencies.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
[xml]$svg = Get-Content -LiteralPath (Join-Path $root 'public/brand-mark.svg') -Raw
foreach($size in @(64,180,192,512)) {
    $image = [Drawing.Bitmap]::new($size,$size)
    $g = [Drawing.Graphics]::FromImage($image)
    try {
        $g.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $g.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.Clear([Drawing.ColorTranslator]::FromHtml('#234d38'))
        $g.ScaleTransform($size/512.0,$size/512.0)
        foreach($element in $svg.svg.path) {
            $tokens = [regex]::Matches($element.d,'[MLCZ]|-?\d+(?:\.\d+)?')
            $path = [Drawing.Drawing2D.GraphicsPath]::new()
            $brush = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml($element.fill))
            try {
                $i=0; [single]$x=0; [single]$y=0
                while($i -lt $tokens.Count) {
                    switch($tokens[$i++].Value) {
                        'M' {$path.StartFigure();$x=[single]$tokens[$i++].Value;$y=[single]$tokens[$i++].Value}
                        'L' {$nx=[single]$tokens[$i++].Value;$ny=[single]$tokens[$i++].Value;$path.AddLine($x,$y,$nx,$ny);$x=$nx;$y=$ny}
                        'C' {$p=@();for($j=0;$j -lt 6;$j++){$p += [single]$tokens[$i++].Value};$path.AddBezier($x,$y,$p[0],$p[1],$p[2],$p[3],$p[4],$p[5]);$x=$p[4];$y=$p[5]}
                        'Z' {$path.CloseFigure()}
                        default {throw 'Unsupported SVG path command'}
                    }
                }
                $g.FillPath($brush,$path)
            } finally {$brush.Dispose();$path.Dispose()}
        }
        $file=Join-Path $root "public/icons/tryeza-mark-v2-$size.png"
        $image.Save($file,[Drawing.Imaging.ImageFormat]::Png)
        Write-Output "Generated $size x $size icon"
    } finally {$g.Dispose();$image.Dispose()}
}
