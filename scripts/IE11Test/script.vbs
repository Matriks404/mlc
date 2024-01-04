If WScript.Arguments.Count > 0 Then
	isLocal = WScript.Arguments.Item(0)

	If isLocal = 1 Then
		Set shell = CreateObject("WScript.Shell")
		shell.Run "..\Build.Windows.bat"
		shell.Run "..\Run.Windows.bat"

		WScript.Sleep(1000)

		Url = "http://localhost:8888"
	Else
		Url = "http://matriks404.github.io/mlc/"
	End If

	Set IE = CreateObject("InternetExplorer.Application")
	IE.Visible = true

	IE.Navigate(Url)
Else
	message = MsgBox("This script cannot be opened directly. Please run appropriate batch script instead.", 16, "Error")
End If

