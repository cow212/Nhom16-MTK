@echo off
chcp 65001 >nul
title Backend - Mini Ecommerce

REM Neu da co file jar thi chay truc tiep - nhanh khoang 5 giay
REM Neu khong co jar thi dung Maven de build + run

cd /d "%~dp0mini-ecommerce-java"
if exist target\mini-ecommerce-1.0.0.jar (
    echo Dang chay backend tu file jar - port 8080...
    java -jar target\mini-ecommerce-1.0.0.jar
) else (
    echo Khong thay file jar - dung Maven build + run...
    ..\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
)
