const os = require('os');
const { spawn } = require('child_process');

const isPrivateIPv4 = (ip) => {
  if (!ip || typeof ip !== 'string') return false;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  // 172.16.0.0 – 172.31.255.255
  const m = ip.match(/^172\.(\d{1,3})\./);
  if (m) {
    const second = Number(m[1]);
    return second >= 16 && second <= 31;
  }
  return false;
};

const getLanIPv4 = () => {
  const nets = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family !== 'IPv4') continue;
      if (net.internal) continue;
      if (!isPrivateIPv4(net.address)) continue;
      candidates.push({ name, address: net.address });
    }
  }

  // Prefer Wi-Fi adapters when present (Windows often names them like this)
  const preferred = candidates.find((c) => /wi-?fi|wlan/i.test(c.name));
  return (preferred || candidates[0] || null)?.address || null;
};

const main = () => {
  const ip = getLanIPv4();

  const env = { ...process.env };
  // Only set if not already set by the user
  if (!env.REACT_NATIVE_PACKAGER_HOSTNAME && ip) {
    env.REACT_NATIVE_PACKAGER_HOSTNAME = ip;
  }

  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const args = ['expo', 'start', '--host', 'lan', ...process.argv.slice(2)];

  // eslint-disable-next-line no-console
  console.log('[Evoria] Detected LAN IP:', ip || '(none)');
  // eslint-disable-next-line no-console
  console.log('[Evoria] REACT_NATIVE_PACKAGER_HOSTNAME:', env.REACT_NATIVE_PACKAGER_HOSTNAME || '(not set)');

  const child = spawn(npxCmd, args, {
    stdio: 'inherit',
    env,
    // On Windows, npx.cmd is a shim and must be spawned via a shell.
    shell: process.platform === 'win32',
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
};

main();
