#!/bin/bash

mkdir /sys/fs/cgroup/{cpu,memory,pids}/NSJAIL
nsjail -Ml --user 99999 --group 99999 --disable_proc --chroot / --cwd /app --time_limit 300 --port 31337 --cgroup_cpu_ms_per_sec 100 --cgroup_pids_max 64 --cgroup_mem_max 67108864 -- /bin/sh -i


