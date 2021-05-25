#!/usr/bin/python
# -*- coding: utf-8 -*
import os
import sys


def startServer():
    print("-----------start server-----------")
    command1 = "node playerserver/build/server.js"
    command2 = "node gameserver/build/server.js"
    command3 = "node connectorserver/build/server.js"
    os.system(command3)
    os.system(command1)
    os.system(command2)


if __name__ == '__main__':
    startServer()
