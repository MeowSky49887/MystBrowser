let { spawn } = require('child_process');
let si = require('systeminformation')
let IconExtractor = require("./IconExtractor/lib/icon-extractor");

exports.runExe = async (path, args) => {
    try {
        const child = spawn(path, args, {
            detached: true,
            stdio: 'ignore',
            shell: false
        });

        child.unref();

        return {
            success: true,
            pid: child.pid
        } 

    } catch (err) {
        return {
            success: false,
            error: err.message
        }
    }
}

exports.getFileIcon = async (path) => {
    try {
        const icon = await IconExtractor.extractIcon(path);

        return {
            success: true,
            data: icon
        };
    } catch (err) {
        return {
            success: false,
            data: err
        };
    }
}

exports.getSystem = async () => {
    const [
        cpu,
        cpuTemp,
        cpuLoad,
        mem,
        graphics,
        battery,
        fsSize,
        defaultNetwork,
        networkStats
    ] = await Promise.all([
        si.cpu(),
        si.cpuTemperature(),
        si.currentLoad(),
        si.mem(),
        si.graphics(),
        si.battery(),
        si.fsSize(),
        si.networkInterfaceDefault(),
        si.networkStats()
    ])

    const net =
        networkStats.find(
            n => n.iface === defaultNetwork
        ) || null

    return {
        cpu: {
            manufacturer: cpu.manufacturer,
            brand: cpu.brand,
            cores: cpu.cores,
            processors: cpu.processors,
            speed: cpu.speed,
            load: cpuLoad.currentLoad,
        },

        mem: {
            total: mem.total,
            used: mem.used,
            free: mem.free,
        },

        gpu: graphics.controllers.map(gpu => ({
            vendor: gpu.vendor,
            model: gpu.model,
            vram: gpu.vram,

            memoryTotal: gpu.memoryTotal ?? null,
            memoryUsed: gpu.memoryUsed ?? null,
            memoryFree: gpu.memoryFree ?? null
        })),

        battery: {
            isCharging: battery.isCharging,
            percent: battery.percent
        },

        fs: fsSize.map(fs => ({
            name: fs.fs,
            type: fs.type,
            size: fs.size,
            used: fs.used,
            available: fs.available
        })),

        net: {
            iface: defaultNetwork,

            sent: {rate: net?.tx_sec ?? 0},

            received: {rate: net?.rx_sec ?? 0}
        }
    }
}
