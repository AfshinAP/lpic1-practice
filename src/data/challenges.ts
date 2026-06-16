import type { Challenge } from './types';

export const challenges: Challenge[] = [
  // ─────────────────────────────────────────────────────────────────
  // Topic 101 — System Architecture  (FULLY AUTHORED)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'challenge-101',
    topicId: '101',
    title: 'Incident: Kernel Module Failure',
    scenario:
      'A junior admin accidentally removed the "ext4" driver and a critical USB storage device is no longer detected. ' +
      'The system is still running but no new USB drives can be used. ' +
      'Walk through the diagnosis and resolution steps to restore functionality.',
    intro: [
      '=== INCIDENT REPORT ===',
      'Host: prod-fileserver-01',
      'Reported: USB storage device not detected after routine maintenance.',
      'Your job: diagnose the hardware, identify the missing module, reload it, and confirm it is running.',
      '======================',
    ],
    steps: [
      {
        id: 'c101-s1',
        title: 'Step 1 — Survey the PCI/USB bus',
        description:
          'Before touching anything, get a snapshot of all PCI devices so you know what hardware the system sees at the bus level.',
        context: [
          '[prod-fileserver-01] Starting diagnosis...',
          'First, verify what PCI hardware is currently visible to the kernel.',
        ],
        acceptedAnswers: ['lspci'],
        hint: 'The command combines "ls" with "pci".',
        successOutput:
          '00:00.0 Host bridge: Intel Corporation 440FX\n' +
          '00:01.0 ISA bridge: Intel Corporation 82371SB PIIX3\n' +
          '00:02.0 VGA compatible controller: Intel Corporation HD Graphics\n' +
          '00:1d.0 USB controller: Intel Corporation Sunrise Point-LP USB 3.0',
      },
      {
        id: 'c101-s2',
        title: 'Step 2 — Check kernel ring buffer for errors',
        description:
          'The kernel logs hardware events to the ring buffer. Check recent messages to see if any module load failures were logged.',
        context: ['Good. USB controller shows up on PCI. Now check recent kernel messages for errors.'],
        acceptedAnswers: ['dmesg', 'dmesg | tail', 'dmesg -T', 'dmesg | grep -i error', 'dmesg | tail -20'],
        hint: 'The command is short for "display message" — it reads the kernel ring buffer.',
        successOutput:
          '[  4.221345] usb 1-1: new high-speed USB device number 2 using xhci_hcd\n' +
          '[  4.223001] xhci_hcd: ERROR — ext4 module not loaded, storage attach failed\n' +
          '[  4.225010] usb 1-1: USB disconnect, device number 2',
      },
      {
        id: 'c101-s3',
        title: 'Step 3 — Verify ext4 is not loaded',
        description:
          'Confirm the ext4 kernel module is indeed absent from the list of currently loaded modules.',
        context: [
          'The ring buffer confirms ext4 is missing.',
          'Verify by listing all currently loaded kernel modules.',
        ],
        acceptedAnswers: ['lsmod', 'cat /proc/modules'],
        hint: 'Think "list modules".',
        hintAfterAttempts: 2,
        successOutput:
          'Module                  Size  Used by\n' +
          'xhci_hcd              204800  0\n' +
          'usbcore               286720  1 xhci_hcd\n' +
          'usbhid                 53248  0\n' +
          '(ext4 is NOT listed — confirmed missing)',
      },
      {
        id: 'c101-s4',
        title: 'Step 4 — Inspect the module metadata',
        description:
          'Before loading the module, inspect its metadata to confirm the correct filename, version, and dependencies.',
        context: ['ext4 is absent. Inspect it before reloading.'],
        acceptedAnswers: ['modinfo ext4'],
        hint: 'The command shows "mod info" for a named module.',
        successOutput:
          'filename:       /lib/modules/6.1.0-30/kernel/fs/ext4/ext4.ko.xz\n' +
          'description:    Fourth Extended Filesystem\n' +
          'license:        GPL\n' +
          'depends:        mbcache,jbd2\n' +
          'retpoline:      Y',
      },
      {
        id: 'c101-s5',
        title: 'Step 5 — Reload the module',
        description:
          'Load the ext4 module back into the kernel, automatically resolving its dependencies (mbcache, jbd2).',
        context: ['Dependencies identified. Load ext4 now.'],
        acceptedAnswers: ['modprobe ext4', 'sudo modprobe ext4'],
        hint: 'Use the smarter loader that handles dependencies automatically (not insmod).',
        successOutput: '(ext4 module loaded successfully — dependencies mbcache and jbd2 also loaded)',
      },
      {
        id: 'c101-s6',
        title: 'Step 6 — Confirm the fix',
        description:
          'Run the module listing command one more time to confirm ext4 now appears in the active module list.',
        context: ['Module reloaded. Confirm it appears in the running kernel now.'],
        acceptedAnswers: ['lsmod', 'lsmod | grep ext4', 'cat /proc/modules'],
        hint: 'Same command you used in step 3.',
        successOutput:
          'Module                  Size  Used by\n' +
          'ext4                  737280  1\n' +
          'jbd2                  131072  1 ext4\n' +
          'mbcache                16384  1 ext4\n' +
          'xhci_hcd              204800  0\n' +
          'usbcore               286720  1 xhci_hcd',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // Topic 102 — Package Management  (FULLY AUTHORED)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'challenge-102',
    topicId: '102',
    title: 'Incident: Broken Package Manager',
    scenario:
      'A power outage interrupted an apt upgrade mid-transaction. The dpkg database is in an inconsistent state, ' +
      'several packages are half-configured, and apt refuses to install anything new. ' +
      'Your task is to diagnose the problem and fully repair the package manager.',
    intro: [
      '=== INCIDENT REPORT ===',
      'Host: prod-webserver-03',
      'Reported: "apt install" fails on every package after power loss during upgrade.',
      'Your job: diagnose, reconfigure half-installed packages, fix broken dependencies, and verify.',
      '======================',
    ],
    steps: [
      {
        id: 'c102-s1',
        title: 'Step 1 — Check what apt says',
        description:
          'Run apt to see the current error state. Use the "update" subcommand to refresh the package lists and read the exact error message.',
        context: [
          '[prod-webserver-03] Starting diagnosis...',
          'Try to refresh package lists to see what the package manager reports.',
        ],
        acceptedAnswers: ['apt update', 'sudo apt update', 'apt-get update', 'sudo apt-get update'],
        hint: 'Use apt with the subcommand that refreshes the package index.',
        successOutput:
          'Reading package lists... Done\n' +
          'E: dpkg was interrupted, you must manually run "dpkg --configure -a" to correct the problem.',
      },
      {
        id: 'c102-s2',
        title: 'Step 2 — Reconfigure interrupted packages',
        description:
          'dpkg left several packages half-configured. Run the dpkg command that finishes configuring all pending packages.',
        context: [
          'apt has told us exactly what to do.',
          'Run the dpkg command to configure all pending packages in one shot.',
        ],
        acceptedAnswers: ['dpkg --configure -a', 'sudo dpkg --configure -a'],
        hint: 'Use dpkg with the --configure flag and the -a option (all).',
        successOutput:
          'Setting up libc6:amd64 (2.36-9) ...\n' +
          'Setting up libssl3:amd64 (3.0.11-1) ...\n' +
          'Setting up openssl (3.0.11-1) ...\n' +
          'Processing triggers for libc-bin (2.36-9) ...',
      },
      {
        id: 'c102-s3',
        title: 'Step 3 — Fix broken dependencies',
        description:
          'Some packages still have unsatisfied dependencies left over from the interrupted upgrade. Use apt to automatically fix all broken installs.',
        context: [
          'Packages reconfigured. But some have broken dependency chains.',
          'Run the apt command that attempts to fix broken installs.',
        ],
        acceptedAnswers: [
          'apt --fix-broken install',
          'sudo apt --fix-broken install',
          'apt-get -f install',
          'sudo apt-get -f install',
        ],
        hint: 'apt has a --fix-broken flag you can pass before the "install" subcommand.',
        successOutput:
          'Reading package lists... Done\n' +
          'Building dependency tree... Done\n' +
          'Correcting dependencies... Done\n' +
          'The following packages will be installed: libpam-runtime\n' +
          '0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.',
      },
      {
        id: 'c102-s4',
        title: 'Step 4 — Verify the package database is clean',
        description:
          'Check the dpkg database for any packages still in a broken or half-installed state using dpkg itself.',
        context: ['Broken deps resolved. Verify no packages are still in a bad state.'],
        acceptedAnswers: [
          'dpkg -l',
          'dpkg --list',
          'dpkg -l | grep -E "^(iF|rc|hF|iU)"',
          'dpkg --audit',
        ],
        hint: 'Use dpkg to list all packages and look for broken state markers, or use the --audit option.',
        successOutput:
          'Desired=Unknown/Install/Remove/Purge/Hold\n' +
          '| Status=Not/Inst/Conf-files/Unpacked/halF-conf/Half-inst/trig-aWait/Trig-pend\n' +
          '|/ Err?=(none)/Reinst-required (Status,Err: uppercase=bad)\n' +
          '||/ Name                    Version         Architecture Description\n' +
          '+++-=======================-===============-============-==================\n' +
          'ii  apt                     2.6.1           amd64        commandline package manager\n' +
          'ii  openssl                 3.0.11-1        amd64        Secure Sockets Layer toolkit\n' +
          '(no broken packages — all entries show "ii")',
      },
      {
        id: 'c102-s5',
        title: 'Step 5 — Confirm apt works again',
        description:
          'Install a small harmless package (e.g. "curl") to prove the package manager is fully functional again.',
        context: ['Database looks clean. Do a real install to confirm everything is working.'],
        acceptedAnswers: ['apt install curl', 'sudo apt install curl', 'apt install -y curl', 'sudo apt install -y curl'],
        hint: 'Use apt install to install a well-known utility like curl.',
        successOutput:
          'Reading package lists... Done\n' +
          'Building dependency tree... Done\n' +
          'The following NEW packages will be installed: curl\n' +
          '0 upgraded, 1 newly installed, 0 to remove.\n' +
          'Fetched 194 kB in 1s (194 kB/s)\n' +
          'Selecting previously unselected package curl.\n' +
          'Setting up curl (7.88.1-10) ...\n' +
          'Package manager is fully operational.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // Topic 103 — GNU and Unix Commands  (STUB)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'challenge-103',
    topicId: '103',
    title: 'Incident: Log File Runaway Process  [TODO: expand]',
    scenario:
      'A runaway script has been writing gigabytes of data to /var/log/app.log. You need to identify the process, ' +
      'inspect the log tail, truncate the file safely without restarting the service, and verify disk usage recovers.',
    intro: [
      '=== INCIDENT REPORT ===',
      'Host: prod-appserver-02',
      'Reported: Disk filling up fast — /var/log/app.log is huge.',
      '[TODO: Add more steps to fully cover topic 103 commands]',
      '======================',
    ],
    steps: [
      {
        id: 'c103-s1',
        title: 'Step 1 — Find the largest log file  [TODO: expand into full scenario]',
        description:
          'Use the du command to list the 10 largest files under /var/log, sorted by size, to identify the runaway log.',
        context: ['[prod-appserver-02] Disk usage is critical. Identify the culprit log file.'],
        acceptedAnswers: ['du -sh /var/log/*', 'du -h /var/log | sort -rh | head', 'du -sh /var/log/* | sort -rh'],
        hint: 'Use du with a human-readable flag on the /var/log directory.',
        successOutput:
          '4.2G    /var/log/app.log\n' +
          '22M     /var/log/syslog\n' +
          '8.1M    /var/log/auth.log\n' +
          '1.2M    /var/log/kern.log',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // Topic 104 — Filesystems / FHS  (FULLY AUTHORED)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'challenge-104',
    topicId: '104',
    title: 'Incident: Full Disk and Broken fstab Mount',
    scenario:
      'Two problems at once: the root filesystem is nearly full and a secondary data disk fails to mount at boot ' +
      'because of a typo in /etc/fstab. Find what is eating disk space, fix the fstab entry, mount everything, ' +
      'and confirm the system is healthy.',
    intro: [
      '=== INCIDENT REPORT ===',
      'Host: prod-dbserver-01',
      'Problem 1: Root filesystem is critically full.',
      'Problem 2: /dev/sdb1 fails to mount at /data — fstab entry is broken.',
      'Your job: investigate disk usage, fix fstab, mount the disk, verify.',
      '======================',
    ],
    steps: [
      {
        id: 'c104-s1',
        title: 'Step 1 — Check filesystem usage',
        description:
          'Get a human-readable overview of all mounted filesystems and their usage to confirm which is full.',
        context: [
          '[prod-dbserver-01] Starting filesystem diagnosis...',
          'Begin by checking current disk usage across all mounted filesystems.',
        ],
        acceptedAnswers: ['df -h', 'df -hT', 'df -h /'],
        hint: 'The disk free command with the human-readable flag.',
        successOutput:
          'Filesystem      Size  Used Avail Use% Mounted on\n' +
          '/dev/sda1        20G   19G  200M  99% /\n' +
          'tmpfs           1.9G     0  1.9G   0% /dev/shm\n' +
          '/dev/sdb1         --   not mounted --',
      },
      {
        id: 'c104-s2',
        title: 'Step 2 — Find what is eating space',
        description:
          'Root is 99% full. Use du to find the top disk consumers under /var, where log and database files tend to accumulate.',
        context: [
          'Root is nearly full. Find the directories consuming the most space under /var.',
        ],
        acceptedAnswers: [
          'du -sh /var/*',
          'du -h /var | sort -rh | head',
          'du -sh /var/* | sort -rh',
          'du -sh /var/* | sort -rh | head',
        ],
        hint: 'Use du with -sh on each subdirectory under /var, then sort by size.',
        successOutput:
          '14G     /var/lib\n' +
          '3.1G    /var/log\n' +
          '512M    /var/cache\n' +
          '44K     /var/spool\n' +
          '(Note: /var/lib/mysql contains old binary logs — can be purged after confirming with DBA)',
      },
      {
        id: 'c104-s3',
        title: 'Step 3 — Inspect the broken fstab entry',
        description:
          'Read /etc/fstab to find the bad entry for /dev/sdb1. The mount point is misspelled — it says "/dat" instead of "/data".',
        context: [
          'Disk usage identified. Now tackle Problem 2.',
          'Inspect /etc/fstab to find the bad entry for /dev/sdb1.',
        ],
        acceptedAnswers: ['cat /etc/fstab', 'less /etc/fstab', 'more /etc/fstab'],
        hint: 'Use cat to display the contents of /etc/fstab.',
        successOutput:
          '# /etc/fstab\n' +
          'UUID=abc123  /        ext4  defaults  0 1\n' +
          'UUID=def456  /dat     ext4  defaults  0 2    <-- TYPO: should be /data\n' +
          'tmpfs        /tmp     tmpfs defaults  0 0',
      },
      {
        id: 'c104-s4',
        title: 'Step 4 — Create the correct mount point',
        description:
          'Before fixing fstab, ensure the target directory /data actually exists. Create it if it does not.',
        context: ['The mount point /data does not exist yet. Create it.'],
        acceptedAnswers: ['mkdir /data', 'mkdir -p /data', 'sudo mkdir /data', 'sudo mkdir -p /data'],
        hint: 'Use mkdir to create the /data directory.',
        successOutput: '(directory /data created successfully)',
      },
      {
        id: 'c104-s5',
        title: 'Step 5 — Mount all fstab entries',
        description:
          'After the fstab file has been corrected (the typo is now fixed in the file), mount all filesystems listed in fstab in one command.',
        context: [
          '(The fstab typo has been corrected: /dat → /data)',
          'Now mount all entries from fstab with a single command.',
        ],
        acceptedAnswers: ['mount -a', 'sudo mount -a'],
        hint: 'mount with the -a flag mounts all filesystems from fstab.',
        successOutput:
          '(mounting /dev/sdb1 on /data...)\n' +
          '(mount successful — /data is now online)',
      },
      {
        id: 'c104-s6',
        title: 'Step 6 — Verify all filesystems are mounted',
        description:
          'Confirm /data is now listed in mounted filesystems with correct size and usage.',
        context: ['Mount completed. Verify /data appears in the mounted filesystem list.'],
        acceptedAnswers: ['df -h', 'df -hT', 'mount | grep data', 'df -h /data'],
        hint: 'Same command as step 1 — check disk free again.',
        successOutput:
          'Filesystem      Size  Used Avail Use% Mounted on\n' +
          '/dev/sda1        20G   19G  200M  99% /\n' +
          '/dev/sdb1       500G   12G  488G   3% /data\n' +
          'tmpfs           1.9G     0  1.9G   0% /dev/shm\n' +
          'All filesystems mounted and healthy.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // Topic 105 — Shells and Shell Scripting  (STUB)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'challenge-105',
    topicId: '105',
    title: 'Incident: Runaway Cron Script  [TODO: expand]',
    scenario:
      'A cron job is spawning duplicate processes every minute because of a missing lock mechanism. ' +
      'You need to identify the duplicates, kill the extras, and add a flock guard to the script.',
    intro: [
      '=== INCIDENT REPORT ===',
      'Host: prod-cron-01',
      'Reported: /usr/local/bin/sync.sh spawning hundreds of zombie processes.',
      '[TODO: Add full multi-step scenario for topic 105]',
      '======================',
    ],
    steps: [
      {
        id: 'c105-s1',
        title: 'Step 1 — List running instances of the script  [TODO: expand]',
        description: 'List all running processes that match the script name to see how many duplicates exist.',
        context: ['[prod-cron-01] Identify duplicate sync.sh processes.'],
        acceptedAnswers: ['ps aux | grep sync.sh', 'pgrep -a sync.sh', 'ps -ef | grep sync.sh'],
        hint: 'Use ps with grep, or pgrep, to filter processes by name.',
        successOutput:
          'root  1234  sync.sh\n' +
          'root  1235  sync.sh\n' +
          'root  1236  sync.sh\n' +
          '(47 instances running — confirmed runaway)',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // Topic 106 — User Interfaces and Desktops  (STUB)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'challenge-106',
    topicId: '106',
    title: "Incident: Display Manager Won't Start  [TODO: expand]",
    scenario:
      'After a graphics driver update the display manager fails to start and the system boots to a black screen. ' +
      'You need to diagnose via logs, switch to a fallback display server, and restore the login screen.',
    intro: [
      '=== INCIDENT REPORT ===',
      'Host: workstation-05',
      'Reported: Black screen after reboot — display manager failed.',
      '[TODO: Add full multi-step scenario for topic 106]',
      '======================',
    ],
    steps: [
      {
        id: 'c106-s1',
        title: 'Step 1 — Check the display manager service status  [TODO: expand]',
        description: 'Use systemctl to check the status of the gdm (GNOME Display Manager) service.',
        context: ['[workstation-05] Display manager is down. Check the service status.'],
        acceptedAnswers: ['systemctl status gdm', 'systemctl status gdm3', 'systemctl status lightdm'],
        hint: 'Use systemctl status followed by the display manager service name.',
        successOutput:
          '● gdm.service - GNOME Display Manager\n' +
          '   Loaded: loaded (/lib/systemd/system/gdm.service)\n' +
          '   Active: failed (Result: exit-code)\n' +
          'Dec 15 09:02:11 gdm[891]: error: nvidia module not found',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // Topic 107 — Administrative Tasks  (STUB)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'challenge-107',
    topicId: '107',
    title: 'Incident: Locked-Out Service Account  [TODO: expand]',
    scenario:
      'A deployment pipeline broke because the "deploy" service account is locked and has an expired password. ' +
      'You need to unlock the account, reset the password expiry, and verify the account is usable again.',
    intro: [
      '=== INCIDENT REPORT ===',
      'Host: prod-deploy-01',
      'Reported: CI/CD pipeline failing — "deploy" user account locked.',
      '[TODO: Add full multi-step scenario for topic 107]',
      '======================',
    ],
    steps: [
      {
        id: 'c107-s1',
        title: 'Step 1 — Check account status  [TODO: expand]',
        description: 'Use chage to display the password aging information for the "deploy" account.',
        context: ['[prod-deploy-01] Check why the deploy account is failing authentication.'],
        acceptedAnswers: ['chage -l deploy', 'sudo chage -l deploy'],
        hint: 'chage with the -l (list) flag shows password aging for a user.',
        successOutput:
          'Last password change                    : Jan 01, 2024\n' +
          'Password expires                        : Mar 31, 2024\n' +
          'Password inactive                       : Apr 07, 2024\n' +
          'Account expires                         : never\n' +
          '(Password expired 75 days ago — account is locked due to inactivity)',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // Topic 108 — Essential System Services  (STUB)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'challenge-108',
    topicId: '108',
    title: 'Incident: NTP Drift and Syslog Gaps  [TODO: expand]',
    scenario:
      'Audit logs have gaps in the timestamps — the system clock drifted over 10 minutes. ' +
      'systemd-timesyncd is configured but not running. Diagnose and fix the time sync service.',
    intro: [
      '=== INCIDENT REPORT ===',
      'Host: prod-audit-01',
      'Reported: Audit log timestamps are inconsistent — clock drifted.',
      '[TODO: Add full multi-step scenario for topic 108]',
      '======================',
    ],
    steps: [
      {
        id: 'c108-s1',
        title: 'Step 1 — Check the time sync service status  [TODO: expand]',
        description: 'Use timedatectl to display the current date, time, and NTP sync status.',
        context: ['[prod-audit-01] Investigate the time sync issue.'],
        acceptedAnswers: ['timedatectl', 'timedatectl status'],
        hint: 'timedatectl shows the system clock status and NTP sync state.',
        successOutput:
          '               Local time: Tue 2024-06-15 14:32:47 UTC\n' +
          '           Universal time: Tue 2024-06-15 14:32:47 UTC\n' +
          '                 RTC time: Tue 2024-06-15 04:18:03\n' +
          '                Time zone: UTC (UTC, +0000)\n' +
          'System clock synchronized: no\n' +
          '              NTP service: inactive',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // Topic 109 — Networking Fundamentals  (STUB)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'challenge-109',
    topicId: '109',
    title: 'Incident: Network Interface Down After Reboot  [TODO: expand]',
    scenario:
      'After a scheduled reboot the primary network interface eth0 came up without an IP address. ' +
      'The static IP configuration was lost. Diagnose the interface state and restore connectivity.',
    intro: [
      '=== INCIDENT REPORT ===',
      'Host: prod-lb-02',
      'Reported: Server unreachable after reboot — eth0 has no IP.',
      '[TODO: Add full multi-step scenario for topic 109]',
      '======================',
    ],
    steps: [
      {
        id: 'c109-s1',
        title: 'Step 1 — Check interface status  [TODO: expand]',
        description: 'Use the ip command to show all network interfaces and their current state.',
        context: ['[prod-lb-02] Network interface is down. Inspect its status.'],
        acceptedAnswers: ['ip a', 'ip addr', 'ip address', 'ip link show'],
        hint: 'Use ip followed by "a" or "addr" to show all interfaces.',
        successOutput:
          '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n' +
          '    inet 127.0.0.1/8 scope host lo\n' +
          '2: eth0: <BROADCAST,MULTICAST> mtu 1500 state DOWN\n' +
          '    (no inet address assigned — interface is DOWN)',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // Topic 110 — Security  (STUB)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'challenge-110',
    topicId: '110',
    title: 'Incident: SSH Brute-Force and Key Lockout  [TODO: expand]',
    scenario:
      'The auth log shows thousands of failed SSH login attempts from a single IP. ' +
      'Additionally, the admin accidentally revoked their own SSH key and is locked out of passwordless login. ' +
      'Block the attacker and restore secure access.',
    intro: [
      '=== INCIDENT REPORT ===',
      'Host: prod-bastion-01',
      'Reported: Brute-force SSH attack detected + admin locked out.',
      '[TODO: Add full multi-step scenario for topic 110]',
      '======================',
    ],
    steps: [
      {
        id: 'c110-s1',
        title: 'Step 1 — Inspect the auth log for attack pattern  [TODO: expand]',
        description:
          'Look at the last 20 lines of /var/log/auth.log to confirm the brute-force pattern and identify the attacking IP.',
        context: ['[prod-bastion-01] Check auth logs for the attack pattern.'],
        acceptedAnswers: [
          'tail -20 /var/log/auth.log',
          'tail /var/log/auth.log',
          'cat /var/log/auth.log | tail -20',
        ],
        hint: 'Use tail to show the last lines of /var/log/auth.log.',
        successOutput:
          'Jun 15 03:44:01 sshd[9812]: Failed password for root from 198.51.100.42 port 58231\n' +
          'Jun 15 03:44:02 sshd[9813]: Failed password for root from 198.51.100.42 port 58232\n' +
          'Jun 15 03:44:03 sshd[9814]: Failed password for root from 198.51.100.42 port 58233\n' +
          '(4,891 failed attempts from 198.51.100.42 in the last hour)',
      },
    ],
  },
];

export function getChallengeByTopic(topicId: string): Challenge | undefined {
  return challenges.find((c) => c.topicId === topicId);
}
