"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = require("./modules/net/net");
const clientManager_1 = require("./modules/common/clientManager");
clientManager_1.default.Instance;
net_1.default.Instance.startServer();
