Set ws = CreateObject("WScript.Shell")
Set proc = CreateObject("Shell.Application")

' Kill any leftover npm dev from previous launch
ws.Run "taskkill /f /im node.exe /t", 0, False

' Start dev server in hidden window (0 = hide)
ws.Run "cmd /c cd /d """ & ws.CurrentDirectory & """ && npm run dev", 0, False

' Wait for server to spin up
WScript.Sleep 4000

' Open browser
ws.Run "http://localhost:5173", 1, False
