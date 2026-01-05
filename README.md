**簡介**
這是一個用於 BBC micro:bit 的 MakeCode 擴展，可以配合 INA226 電流電壓感測器使用。讓學生能夠測量電壓、電流，並使用歐姆定律計算電阻。

INA226 是一款高精度數位電源監測器，具有 I²C 介面。此擴展讓 micro:bit 的積木編程更容易使用這個感測器。

**功能特點**
-測量匯流排電壓（0-36V）
-測量電流（可配置分流電阻）
-使用歐姆定律計算電阻（R = V/I）
-計算功率消耗
-簡單易用的積木介面
-支援英文和中文積木

**硬體需求**
元件	                  數量	         備註
BBC micro:bit	         1	         V1 或 V2
INA226 模組         	1	         常見的藍色模組
9V 電池	                  1	         配合電池扣
電阻                  	若干	         用於測試（100Ω、220Ω、330Ω 等）
麵包板	                  1	
杜邦線                  	若干	         公對公、公對母



**接線圖**
micro:bit 與 INA226 連接
micro:bit	INA226	         說明
3V	         VCC	         電源正極
GND	         GND	         接地
P19	         SCL	         I²C 時鐘線
P20	         SDA	         I²C 數據線

<img width="338" height="442" alt="image" src="https://github.com/user-attachments/assets/f4dd6a6a-1840-4465-9578-10abee788f75" />


**安裝方法**
在 MakeCode 中添加擴展
打開 MakeCode for micro:bit
建立新專案或打開現有專案
點擊齒輪圖示 ⚙️ 下的 擴展
在搜尋欄中貼上此網址：
https://github.com/lcw-gif/pxt-LSTLKKC
點擊擴展以添加


作者
Lee Chun Wai
