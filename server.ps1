$port = 5500
$root = "d:\Interactive website"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")

try {
    $listener.Start()
    Write-Output "VALORANT Web Server started at http://localhost:$port/"
} catch {
    Write-Output "Port $port in use, attempting 5501..."
    $port = 5501
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Prefixes.Add("http://127.0.0.1:$port/")
    $listener.Start()
    Write-Output "VALORANT Web Server started at http://localhost:$port/"
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".mp4"  = "video/mp4"
    ".mp3"  = "audio/mpeg"
    ".webm" = "video/webm"
    ".ogg"  = "audio/ogg"
    ".m4a"  = "audio/mp4"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ($path -eq "/" -or [string]::IsNullOrWhiteSpace($path)) {
            $path = "/index.html"
        }

        $localPath = [System.IO.Path]::Combine($root, $path.TrimStart('/').Replace('/', '\'))

        if ([System.IO.File]::Exists($localPath)) {
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $response.ContentType = $mime
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Accept-Ranges", "bytes")

            $fileInfo = New-Object System.IO.FileInfo($localPath)
            $totalLength = $fileInfo.Length

            $rangeHeader = $request.Headers["Range"]
            if ($null -ne $rangeHeader -and $rangeHeader.StartsWith("bytes=")) {
                $range = $rangeHeader.Substring(6).Split("-")
                $start = [long]::Parse($range[0])
                $end = if (![string]::IsNullOrWhiteSpace($range[1])) { [long]::Parse($range[1]) } else { $totalLength - 1 }
                if ($end -ge $totalLength) { $end = $totalLength - 1 }
                $length = $end - $start + 1

                $response.StatusCode = 206
                $response.Headers.Add("Content-Range", "bytes $start-$end/$totalLength")
                $response.ContentLength64 = $length

                if ($request.HttpMethod -ne "HEAD") {
                    $fs = [System.IO.File]::OpenRead($localPath)
                    $fs.Seek($start, [System.IO.SeekOrigin]::Begin) | Out-Null
                    $buffer = New-Object byte[] 65536
                    $remaining = $length
                    while ($remaining -gt 0) {
                        $toRead = [Math]::Min($buffer.Length, $remaining)
                        $read = $fs.Read($buffer, 0, $toRead)
                        if ($read -le 0) { break }
                        $response.OutputStream.Write($buffer, 0, $read)
                        $remaining -= $read
                    }
                    $fs.Close()
                }
            } else {
                $response.StatusCode = 200
                $response.ContentLength64 = $totalLength
                if ($request.HttpMethod -ne "HEAD") {
                    $fs = [System.IO.File]::OpenRead($localPath)
                    $fs.CopyTo($response.OutputStream)
                    $fs.Close()
                }
            }
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    } catch {
        # Ignore client aborts
    }
}
