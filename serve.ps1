$port = 3000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving Kesariya Farm Ghee Web App on http://localhost:$port/"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $path = $request.Url.LocalPath
    if ($path -eq "/") { $path = "/index.html" }
    
    $localPath = Join-Path "C:\Users\patel\.gemini\antigravity\scratch\kesariya-ghee-app" $path.TrimStart('/')

    if (Test-Path $localPath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($localPath)
        
        if ($localPath.EndsWith(".html")) { $response.ContentType = "text/html; charset=utf-8" }
        elseif ($localPath.EndsWith(".css")) { $response.ContentType = "text/css" }
        elseif ($localPath.EndsWith(".js")) { $response.ContentType = "application/javascript" }
        elseif ($localPath.EndsWith(".png")) { $response.ContentType = "image/png" }
        elseif ($localPath.EndsWith(".jpg")) { $response.ContentType = "image/jpeg" }

        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $response.StatusCode = 404
    }
    $response.Close()
}
