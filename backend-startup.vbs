' Backend auto-start (an): chay file jar.Spring Boot khi Windows dang nhap
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = "F:\Nhom-16-MTK\mini-ecommerce-java"
sh.Run "cmd /c java -jar target\mini-ecommerce-1.0.0.jar", 0, False
