process.chdir('/home/drbongob/NodeJS-TestApp');
try { require('dns').setServers(['1.1.1.1','8.8.8.8']); } catch (e) {}
require('.next/standalone/server.js');
