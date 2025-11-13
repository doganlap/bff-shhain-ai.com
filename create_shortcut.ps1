$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$([Environment]::GetFolderPath('Desktop'))\Start GRC Local.lnk")
$Shortcut.TargetPath = "d:\Projects\GRC-Master\Assessmant-GRC\start-secure-grc.bat"
$Shortcut.IconLocation = "d:\Projects\GRC-Master\Assessmant-GRC\docs\features\icon.ico"
$Shortcut.Save()
