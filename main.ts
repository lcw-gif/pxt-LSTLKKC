//% weight=100 color=#00A654 icon="\uf0e7" block="INA226"
//% groups="['設定', '讀取', '工具']"
namespace INA226 {
    const REG_CONFIG = 0x00
    const REG_SHUNT_VOLTAGE = 0x01
    const REG_BUS_VOLTAGE = 0x02
    const REG_POWER = 0x03
    const REG_CURRENT = 0x04
    const REG_CALIBRATION = 0x05

    let i2cAddr = 0x40
    let shuntResistor = 0.1
    let calibrationValue = 0
    let initialized = false
    let sdaPin: DigitalPin = DigitalPin.P20
    let sclPin: DigitalPin = DigitalPin.P19
    let useCustomPins = false

    function i2cDelay(): void {
        control.waitMicros(5)
    }

    function i2cStart(): void {
        pins.digitalWritePin(sdaPin, 1)
        pins.digitalWritePin(sclPin, 1)
        i2cDelay()
        pins.digitalWritePin(sdaPin, 0)
        i2cDelay()
        pins.digitalWritePin(sclPin, 0)
    }

    function i2cStop(): void {
        pins.digitalWritePin(sdaPin, 0)
        pins.digitalWritePin(sclPin, 1)
        i2cDelay()
        pins.digitalWritePin(sdaPin, 1)
    }

    function i2cWriteByte(byte: number): boolean {
        for (let i = 0; i < 8; i++) {
            pins.digitalWritePin(sdaPin, (byte & 0x80) ? 1 : 0)
            byte = byte << 1
            i2cDelay()
            pins.digitalWritePin(sclPin, 1)
            i2cDelay()
            pins.digitalWritePin(sclPin, 0)
        }
        pins.setPull(sdaPin, PinPullMode.PullUp)
        pins.digitalWritePin(sclPin, 1)
        i2cDelay()
        let ack = pins.digitalReadPin(sdaPin)
        pins.digitalWritePin(sclPin, 0)
        pins.setPull(sdaPin, PinPullMode.PullNone)
        return ack == 0
    }

    function i2cReadByte(sendAck: boolean): number {
        let byte = 0
        pins.setPull(sdaPin, PinPullMode.PullUp)
        for (let i = 0; i < 8; i++) {
            byte = byte << 1
            pins.digitalWritePin(sclPin, 1)
            i2cDelay()
            if (pins.digitalReadPin(sdaPin)) byte |= 1
            pins.digitalWritePin(sclPin, 0)
            i2cDelay()
        }
        pins.setPull(sdaPin, PinPullMode.PullNone)
        pins.digitalWritePin(sdaPin, sendAck ? 0 : 1)
        pins.digitalWritePin(sclPin, 1)
        i2cDelay()
        pins.digitalWritePin(sclPin, 0)
        return byte
    }

    function writeReg(reg: number, val: number): void {
        if (useCustomPins) {
            i2cStart()
            i2cWriteByte(i2cAddr << 1)
            i2cWriteByte(reg)
            i2cWriteByte((val >> 8) & 0xFF)
            i2cWriteByte(val & 0xFF)
            i2cStop()
        } else {
            let buf = pins.createBuffer(3)
            buf[0] = reg
            buf[1] = (val >> 8) & 0xFF
            buf[2] = val & 0xFF
            pins.i2cWriteBuffer(i2cAddr, buf)
        }
    }

    function readReg(reg: number): number {
        if (useCustomPins) {
            i2cStart()
            i2cWriteByte(i2cAddr << 1)
            i2cWriteByte(reg)
            i2cStart()
            i2cWriteByte((i2cAddr << 1) | 1)
            let h = i2cReadByte(true)
            let l = i2cReadByte(false)
            i2cStop()
            return (h << 8) | l
        } else {
            let buf = pins.createBuffer(1)
            buf[0] = reg
            pins.i2cWriteBuffer(i2cAddr, buf)
            let r = pins.i2cReadBuffer(i2cAddr, 2)
            return (r[0] << 8) | r[1]
        }
    }

    /**
     * 設定自定義 I2C 腳位
     */
    //% block="設定 I2C 腳位 SDA %sda SCL %scl"
    //% sda.defl=DigitalPin.P1 scl.defl=DigitalPin.P2
    //% sda.fieldEditor="gridpicker" scl.fieldEditor="gridpicker"
    //% weight=100 group="設定"
    export function setPins(sda: DigitalPin, scl: DigitalPin): void {
        sdaPin = sda
        sclPin = scl
        useCustomPins = true
        pins.digitalWritePin(sdaPin, 1)
        pins.digitalWritePin(sclPin, 1)
    }

    /**
     * 使用預設 I2C 腳位
     */
    //% block="使用預設 I2C 腳位"
    //% weight=99 group="設定"
    export function useDefaultI2C(): void {
        useCustomPins = false
    }

    /**
     * 初始化 INA226
     */
    //% block="初始化 INA226 分流電阻 %shunt 歐姆 地址 %addr"
    //% shunt.defl=0.1 addr.defl=0x40
    //% weight=98 group="設定"
    export function init(shunt: number = 0.1, addr: number = 0x40): void {
        shuntResistor = shunt
        i2cAddr = addr
        writeReg(REG_CONFIG, 0x4127)
        calibrationValue = Math.round(0.00512 / (0.0001 * shuntResistor))
        writeReg(REG_CALIBRATION, calibrationValue)
        initialized = true
    }

    /**
     * 讀取電壓
     */
    //% block="電壓 (V)"
    //% weight=90 group="讀取"
    export function voltage(): number {
        if (!initialized) init()
        let raw = readReg(REG_BUS_VOLTAGE)
        return Math.round((raw * 1.25 / 1000) * 100) / 100
    }

    /**
     * 讀取分流電壓
     */
    //% block="分流電壓 (mV)"
    //% weight=85 group="讀取"
    export function shuntVoltage(): number {
        if (!initialized) init()
        let raw = readReg(REG_SHUNT_VOLTAGE)
        if (raw > 32767) raw -= 65536
        return Math.round((raw * 2.5 / 1000) * 100) / 100
    }

    /**
     * 讀取電流
     */
    //% block="電流 (mA)"
    //% weight=80 group="讀取"
    export function current(): number {
        if (!initialized) init()
        let raw = readReg(REG_CURRENT)
        if (raw > 32767) raw -= 65536
        return Math.round((raw * 0.1) * 100) / 100
    }

    /**
     * 讀取功率
     */
    //% block="功率 (mW)"
    //% weight=75 group="讀取"
    export function power(): number {
        if (!initialized) init()
        let raw = readReg(REG_POWER)
        return Math.round((raw * 2.5) * 100) / 100
    }

    /**
     * 計算電阻
     */
    //% block="電阻 (Ω)"
    //% weight=70 group="讀取"
    export function resistance(): number {
        let v = voltage()
        let i = current()
        if (Math.abs(i) < 0.1) return 0
        return Math.round((v / (i / 1000)) * 10) / 10
    }

    /**
     * 檢查連接
     */
    //% block="INA226 已連接"
    //% weight=60 group="工具"
    export function isConnected(): boolean {
        let cfg = readReg(REG_CONFIG)
        return cfg != 0 && cfg != 0xFFFF
    }

    /**
     * 重置感測器
     */
    //% block="重置 INA226"
    //% weight=50 group="工具"
    export function reset(): void {
        writeReg(REG_CONFIG, 0x8000)
        basic.pause(10)
        initialized = false
    }
}
